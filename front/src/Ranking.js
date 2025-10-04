import { useMemo } from "react";
import "./Ranking.css";

/** DEMO: dados fictícios do TOP 10 */
const DEMO_ROWS = [
  { user: "Maria", score: 980 },
  { user: "Gabriel", score: 960 },
  { user: "Ana", score: 930 },
  { user: "João", score: 890 },
  { user: "Carla", score: 870 },
  { user: "Rafa", score: 850 },
  { user: "Luiza", score: 830 },
  { user: "Pedro", score: 820 },
  { user: "Felipe", score: 810 },
  { user: "Bianca", score: 800 },
];

/** Ícones/estilo por posição */
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

export default function Ranking() {
  const rows = useMemo(() => {
    return [...DEMO_ROWS]
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      .map((r, i) => ({ ...r, pos: i + 1 }));
  }, []);

  return (
    <div className="rk-wrap">
      <section className="rk-card">
        <header className="rk-head">
          <h2 className="rk-title">Ranking • Top 10</h2>
        </header>

        <div className="rk-table-wrap scrollable">
          <table className="rk-table compact">
            <thead>
              <tr>
                <th style={{ width: 90 }}>Posição</th>
                <th>Usuário</th>
                <th style={{ width: 120, textAlign: "right" }}>Pontuação</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.user}>
                  <td>
                    <PositionBadge pos={r.pos} />
                  </td>
                  <td className="rk-user">
                    <span className="rk-name">{r.user}</span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <span className="rk-score">{r.score}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
