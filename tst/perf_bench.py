
#!/usr/bin/env python3
"""
Benchmark gRPC Gateway (HTTP) endpoints and export Excel files.

- Makes 10 iterations (plus optional warmup) per endpoint
- Writes one .xlsx per endpoint containing the 10 runs
- Writes a final .xlsx with per-endpoint avg/p95/p99/ok% and a grand mean

Usage (examples):
  python perf_bench.py --base http://192.168.49.2:32755
  python perf_bench.py --base http://localhost:6969 --iters 10 --warmup 2

You can override payloads via env vars or flags if needed.
"""

import argparse
import os
import time
import random
import string
from dataclasses import dataclass 
from typing import Any, Dict, List, Tuple
import requests
import pandas as pd


@dataclass
class Endpoint:
    name: str         # label used for filenames/sheets
    method: str       # GET/POST/DELETE/etc.
    path: str         # e.g. /grpc/quiz
    make_body: Any = None  # callable (i -> dict) or static dict or None
    headers: Dict[str, str] = None

# dataclass import came after usage; fix

from dataclasses import dataclass

def _rand_suffix(n=6) -> str:
    return "".join(random.choices(string.ascii_lowercase + string.digits, k=n))

def default_endpoints(args) -> List["Endpoint"]:
    """
    Define the 5 endpoints requested.
    Adjust payloads as needed for your backend contracts.
    """
    token = os.getenv("AUTH_TOKEN", "").strip()
    default_headers = {"Content-Type": "application/json"}
    if token:
        default_headers["Authorization"] = f"Bearer {token}"

    # POST /grpc/user requires a Usuario
    def make_user_body(i: int) -> Dict[str, Any]:
        # login unique to avoid conflicts
        login = os.getenv("BENCH_LOGIN", "bench") + "_" + _rand_suffix()
        senha = os.getenv("BENCH_SENHA", "123456")
        nome  = os.getenv("BENCH_NOME", "bench")
        return {"nome": nome, "login": login, "senha": senha, "score": 0}

    # POST /grpc/login needs valid credentials in your DB. Set via env if needed.
    def make_login_body(i: int) -> Dict[str, Any]:
        loginreq = os.getenv("LOGIN_LOGINREQ", "benchuser")
        senhareq = os.getenv("LOGIN_SENHAREQ", "123456")
        return {"loginreq": loginreq, "senhareq": senhareq}

    # POST /grpc/quiz expects a Pergunta.
    def make_quiz_body(i: int) -> Dict[str, Any]:
        alternativas = ["A opção", "B opção", "C opção", "D opção"]
        return {
            "id": 0,
            "texto": f"Pergunta benchmark {_rand_suffix()}",
            "alternativas": alternativas,
            "indice_resposta": 1,
            "explicacao": "Pergunta criada pelo benchmark."
        }

    eps = [
        Endpoint(name="GET_grpc_quiz",   method="GET",  path="/grpc/quiz"),
        Endpoint(name="POST_grpc_user",  method="POST", path="/grpc/user",  make_body=make_user_body),
        Endpoint(name="POST_grpc_login", method="POST", path="/grpc/login", make_body=make_login_body),
        Endpoint(name="GET_grpc_ranking",method="GET",  path="/grpc/ranking"),
        Endpoint(name="POST_grpc_quiz",  method="POST", path="/grpc/quiz",  make_body=make_quiz_body),
    ]

    # apply default headers
    for ep in eps:
        ep.headers = dict(default_headers)
    return eps

def call_endpoint(base: str, ep: "Endpoint", timeout: float) -> Tuple[float, int, bool, str]:
    """
    Returns: (elapsed_ms, status_code, ok, error_str_if_any)
    """
    url = base.rstrip("/") + ep.path
    data = None
    if callable(ep.make_body):
        data = ep.make_body(0)
    elif isinstance(ep.make_body, dict):
        data = ep.make_body

    t0 = time.perf_counter()
    try:
        resp = requests.request(
            ep.method,
            url,
            headers=ep.headers or {},
            json=data if data is not None else None,
            timeout=timeout,
        )
        elapsed_ms = (time.perf_counter() - t0) * 1000.0
        ok = 200 <= resp.status_code < 300
        return elapsed_ms, resp.status_code, ok, "" if ok else (resp.text or "")[:500]
    except Exception as e:
        elapsed_ms = (time.perf_counter() - t0) * 1000.0
        return elapsed_ms, 0, False, str(e)

def run_benchmark(base: str, endpoints: List["Endpoint"], iters: int, warmup: int, timeout: float, outdir: str) -> pd.DataFrame:
    os.makedirs(outdir, exist_ok=True)

    summary_rows = []
    for ep in endpoints:
        rows = []
        # Warmup (not recorded)
        for _ in range(max(0, warmup)):
            _ = call_endpoint(base, ep, timeout)

        # Measured iterations
        for i in range(iters):
            elapsed_ms, status, ok, err = call_endpoint(base, ep, timeout)
            rows.append({
                "iter": i + 1,
                "method": ep.method,
                "url": ep.path,
                "status": status,
                "ok": ok,
                "elapsed_ms": round(elapsed_ms, 3),
                "error": err,
            })

        df = pd.DataFrame(rows)
        # Save per-endpoint Excel
        ep_filename = f"{ep.name}_runs.xlsx"
        ep_path = os.path.join(outdir, ep_filename)
        with pd.ExcelWriter(ep_path, engine="openpyxl") as writer:
            df.to_excel(writer, index=False, sheet_name="runs")

        # Compute summary stats
        ok_df = df[df["ok"]]
        avg = df["elapsed_ms"].mean() if not df.empty else float("nan")
        p95 = ok_df["elapsed_ms"].quantile(0.95) if not ok_df.empty else float("nan")
        p99 = ok_df["elapsed_ms"].quantile(0.99) if not ok_df.empty else float("nan")
        ok_percent = 100.0 * (ok_df.shape[0] / df.shape[0]) if df.shape[0] else 0.0

        summary_rows.append({
            "endpoint": f"{ep.method} {ep.path}",
            "avg_ms": round(float(avg), 3) if pd.notna(avg) else None,
            "p95_ms": round(float(p95), 3) if pd.notna(p95) else None,
            "p99_ms": round(float(p99), 3) if pd.notna(p99) else None,
            "ok_percent": round(ok_percent, 1),
            "iters": df.shape[0],
            "warmup": warmup,
            "base": base,
            "file": ep_filename,
        })

    summary = pd.DataFrame(summary_rows)

    # overall mean of avg_ms across endpoints
    overall = None
    if not summary.empty and summary["avg_ms"].notna().any():
        overall = float(summary["avg_ms"].dropna().mean())

    # write final summary workbook
    final_path = os.path.join(outdir, "perf_summary.xlsx")
    with pd.ExcelWriter(final_path, engine="openpyxl") as writer:
        summary.to_excel(writer, index=False, sheet_name="summary")
        pd.DataFrame({
            "overall_avg_ms": [round(overall, 3) if overall is not None else None],
            "endpoints_count": [summary.shape[0]]
        }).to_excel(writer, index=False, sheet_name="overall")

    print(f"✔ Per-endpoint Excel files and summary saved to: {outdir}")
    return summary

def main():
    parser = argparse.ArgumentParser(description="HTTP micro-benchmark to Excel")
    parser.add_argument("--base", default=os.getenv("BASE_URL", "http://192.168.49.2:32755"),
                        help="Base URL (default from BASE_URL env or http://192.168.49.2:32755)")
    parser.add_argument("--iters", type=int, default=10, help="Measured iterations per endpoint (default 10)")
    parser.add_argument("--warmup", type=int, default=2, help="Warmup requests per endpoint (not recorded)")
    parser.add_argument("--timeout", type=float, default=5.0, help="Request timeout in seconds (default 5)")
    parser.add_argument("--outdir", default="perf_out", help="Output directory (default perf_out)")
    args = parser.parse_args()

    eps = default_endpoints(args)
    run_benchmark(args.base, eps, args.iters, args.warmup, args.timeout, args.outdir)

if __name__ == "__main__":
    main()
