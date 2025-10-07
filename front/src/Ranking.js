// Ranking.js (REST-only)
import { useEffect, useMemo, useState } from "react";
import "./Ranking.css";

const REST_API_BASE = "http://localhost:8089/api";
const REST_RANKING_ENDPOINT = `${REST_API_BASE}/usuario/ranking`; // ajuste se o seu backend expõe outro caminho

async function jsonFetch(url, { token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(url, { headers });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${text}`);
  return data;
}

function positionDecor(pos) {
  if (pos === 1) return { icon: "🏆", cls: "gold" };
  if (pos === 2) return { icon: "🥈", cls: "silver" };
  if (pos === 3) return { icon: "🥉", cls: "bronze" };
  return { icon: `#${pos}`, cls: "normal" };
}

function PositionBadge({ pos }) {
  const { icon, cls } = positionDecor(pos);
  return <span className={`pos-badge ${cls}`}>{icon}</span>;
}

function normalizeRow(r) {
  // tenta vários formatos comuns: {nome, score}, {name, pontuacao}, {login, pontos}, etc.
  const user =
    r?.nome ??
    r?.name ??
    r?.usuario ??
    r?.user ??
    r?.login ??
    r?.email ??
    "Usuário";
  const score =
    r?.score ??
    r?.pontuacao ??
    r?.pontos ??
    r?.total ??
    0;
  return { user: String(user), score: Number(score) || 0 };
}

export default function Ranking() {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const token =
    typeof localStorage !== "undefined" ? localStorage.getItem("token") || "" : "";

  useEffect(() => {
    (async () => {
      setErr("");
      setLoading(true);
      try {
        const data = await jsonFetch(REST_RANKING_ENDPOINT, { token });
        const arr = Array.isArray(data) ? data : data?.items || [];
        const norm = arr.map(normalizeRow);
        setRows(norm);
      } catch (e) {
        console.warn("Falha ao buscar ranking no backend.", e);
        setErr("Nao foi possivel carregar o ranking.");
        setRows([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const sorted = useMemo(
    () =>
      [...rows]
        .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
        .map((r, i) => ({ ...r, pos: i + 1 })),
    [rows]
  );

  if (loading) {
    return (
      <div className="rk-wrap">
        <section className="rk-card">
          <header className="rk-head">
            <h2 className="rk-title">Ranking - Geral</h2>
            <span className="rk-msg">Carregando ranking...</span>
          </header>
        </section>
      </div>
    );
  }

  return (
    <div className="rk-wrap">
      <section className="rk-card">
        <header className="rk-head">
          <h2 className="rk-title">Ranking - Geral</h2>
          {err ? <span className="rk-msg err">{err}</span> : null}
        </header>

        <div className="rk-table-wrap scrollable">
          <table className="rk-table compact">
            <colgroup>
              <col className="col-pos" />
              <col className="col-user" />
              <col className="col-score" />
            </colgroup>

            <thead>
              <tr>
                <th>Posição</th>
                <th>Usuário</th>
                <th>Pontuação</th>
              </tr>
            </thead>

            <tbody>
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: "center", opacity: 0.8 }}>
                    Sem dados de ranking.
                  </td>
                </tr>
              ) : (
                sorted.map((r) => (
                  <tr key={`${r.user}-${r.pos}`}>
                    <td className="cell-pos">
                      <PositionBadge pos={r.pos} />
                    </td>
                    <td className="cell-user">
                      <span className="rk-name">{r.user}</span>
                    </td>
                    <td className="cell-score">
                      <span className="rk-score">{r.score}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
