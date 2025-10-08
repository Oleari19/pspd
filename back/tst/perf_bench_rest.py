
#!/usr/bin/env python3
"""
perf_bench_rest.py — Benchmark simples para o gateway REST
"""
import argparse
import os
import time
import statistics as stats
from dataclasses import dataclass
from typing import Dict, Any, List, Tuple

import requests
import pandas as pd

@dataclass
class BenchResult:
    endpoint: str
    avg_ms: float
    p95_ms: float
    p99_ms: float
    ok_percent: float
    last_status: int
    iters: int
    warmup: int
    base: str

def time_request(method: str, url: str, *, json_body=None, headers=None, timeout=5) -> Tuple[float, bool, int]:
    t0 = time.perf_counter()
    try:
        r = requests.request(method, url, json=json_body, headers=headers, timeout=timeout)
        ok = 200 <= r.status_code < 300
        status = r.status_code
    except Exception:
        ok = False
        status = 0
    t1 = time.perf_counter()
    elapsed_ms = (t1 - t0) * 1000.0
    return elapsed_ms, ok, status

def pctl(values: List[float], p: float) -> float:
    if not values:
        return 0.0
    values = sorted(values)
    k = (len(values) - 1) * (p / 100.0)
    f = int(k)
    c = min(f + 1, len(values) - 1)
    if f == c:
        return values[int(k)]
    d0 = values[f] * (c - k)
    d1 = values[c] * (k - f)
    return d0 + d1

def bench_endpoint(base: str, method: str, path: str, *, iters=10, warmup=2, timeout=5, headers=None, body_fn=None):
    url = f"{base.rstrip('/')}{path}"
    # warmup
    for _ in range(max(0, warmup)):
        _ = time_request(method, url, json_body=body_fn(0) if body_fn else None, headers=headers, timeout=timeout)

    times = []
    oks = 0
    last_status = 0
    rows = []

    for i in range(iters):
        body = body_fn(i) if body_fn else None
        elapsed_ms, ok, status = time_request(method, url, json_body=body, headers=headers, timeout=timeout)
        last_status = status
        if ok:
            oks += 1
        times.append(elapsed_ms)
        rows.append({"iter": i+1, "ms": round(elapsed_ms,3), "ok": ok, "status": status, "path": path, "method": method})

    return rows, times, oks, last_status

def ensure_outdir(outdir: str):
    os.makedirs(outdir, exist_ok=True)

def save_runs_xlsx(outdir: str, filename: str, rows):
    import pandas as pd
    df = pd.DataFrame(rows)
    df.to_excel(os.path.join(outdir, filename), index=False)

def build_auth_headers() -> Dict[str, str]:
    headers = {"Content-Type": "application/json"}
    token = os.getenv("AUTH_TOKEN", "").strip()
    if token:
        headers["Authorization"] = f"Bearer {token}"
    return headers

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--base", default=os.getenv("BASE_URL", "http://localhost:8080"))
    ap.add_argument("--iters", type=int, default=10)
    ap.add_argument("--warmup", type=int, default=2)
    ap.add_argument("--timeout", type=int, default=5)
    ap.add_argument("--outdir", default="perf_out_rest")
    args = ap.parse_args()

    ensure_outdir(args.outdir)
    headers = build_auth_headers()

    BENCH_LOGIN = os.getenv("BENCH_LOGIN", "bench")
    BENCH_SENHA = os.getenv("BENCH_SENHA", "123456")
    BENCH_NOME  = os.getenv("BENCH_NOME",  "bench user")

    def body_user(i: int):
        return {"email": f"{BENCH_LOGIN}{i}@pspd.local", "senha": BENCH_SENHA}

    def body_pergunta(i: int):
        return {
            "texto": f"pergunta bench {i}",
            "alternativas": ["a","b","c","d"],
            "indice_resposta": 0,
            "explicacao": "bench"
        }

    endpoints = [
        ("GET",  "/api/quiz/summary", None,       "GET_api_quiz_summary_runs.xlsx"),
        ("GET",  "/api/usuario",      None,       "GET_api_usuario_runs.xlsx"),
        ("POST", "/api/usuario",      body_user,  "POST_api_usuario_runs.xlsx"),
        ("GET",  "/api/pergunta",     None,       "GET_api_pergunta_runs.xlsx"),
        ("POST", "/api/pergunta",     body_pergunta, "POST_api_pergunta_runs.xlsx"),
    ]

    summaries = []

    for method, path, body_fn, xlsx_name in endpoints:
        rows, times, oks, last_status = bench_endpoint(
            args.base, method, path, iters=args.iters, warmup=args.warmup,
            timeout=args.timeout, headers=headers, body_fn=body_fn
        )
        save_runs_xlsx(args.outdir, xlsx_name, rows)

        avg_ms = stats.fmean(times) if times else 0.0
        p95 = pctl(times, 95)
        p99 = pctl(times, 99)
        ok_pct = 100.0 * oks / max(1, args.iters)

        summaries.append({
            "endpoint": f"{method} {path}",
            "avg_ms": avg_ms,
            "p95_ms": p95,
            "p99_ms": p99,
            "ok_percent": ok_pct,
            "last_status": last_status,
            "iters": args.iters,
            "warmup": args.warmup,
            "base": args.base
        })

    df_sum = pd.DataFrame(summaries)
    df_sum.loc[len(df_sum)] = {
        "endpoint": "MEDIA_FINAL",
        "avg_ms": df_sum["avg_ms"].mean() if not df_sum.empty else 0.0,
        "p95_ms": df_sum["p95_ms"].mean() if not df_sum.empty else 0.0,
        "p99_ms": df_sum["p99_ms"].mean() if not df_sum.empty else 0.0,
        "ok_percent": df_sum["ok_percent"].mean() if not df_sum.empty else 0.0,
        "last_status": 200,
        "iters": args.iters,
        "warmup": args.warmup,
        "base": args.base
    }
    out_summary = os.path.join(args.outdir, "perf_summary_rest.xlsx")
    df_sum.to_excel(out_summary, index=False)
    df_sum.to_csv(os.path.join(args.outdir, "perf_summary_rest.csv"), index=False)

    print("Arquivos gerados em:", args.outdir)
    for _, _, _, xlsx_name in endpoints:
        print(" -", xlsx_name)
    print(" - perf_summary_rest.xlsx")
    print(" - perf_summary_rest.csv")

if __name__ == "__main__":
    main()
