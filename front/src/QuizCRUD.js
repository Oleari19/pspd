import { useEffect, useMemo, useState } from "react";
import "./QuizCRUD.css";

const REST_PREFIX = "/rest";
const GRPC_PREFIX = "/grpc";

/** ------- Helpers ------- */
function prefixFor(mode) {
  return mode === "rest" ? REST_PREFIX : GRPC_PREFIX;
}
async function jsonFetch(url, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${text}`);
  return data;
}

/** ------- Modo DEMO (fallback local) ------- */
const DEMO_DATA = [
  {
    id: 1,
    text: "O que é gRPC?",
    options: ["Protocolo de roteamento", "Framework RPC", "Banco de dados", "Balanceador"],
    correctIndex: 1,
    explanation: "gRPC é um framework RPC de alto desempenho baseado em HTTP/2 e Protobuf.",
  },
  {
    id: 2,
    text: "Qual protocolo de transporte o gRPC usa por padrão?",
    options: ["HTTP/1.1", "WebSocket", "HTTP/2", "FTP"],
    correctIndex: 2,
    explanation: "gRPC usa HTTP/2 por padrão.",
  },
];

function ModeToggle({ mode, setMode }) {
  return (
    <div className="crud-toggle">
      <button
        type="button"
        className={mode === "rest" ? "crud-btn active" : "crud-btn"}
        onClick={() => setMode("rest")}
      >
        REST
      </button>
      <button
        type="button"
        className={mode === "grpc" ? "crud-btn active" : "crud-btn"}
        onClick={() => setMode("grpc")}
      >
        gRPC
      </button>
    </div>
  );
}

/** ------- Formulário de Questão ------- */
function QuestionForm({ value, onChange, onSubmit, onCancel, submitting }) {
  const v = value;
  function set(field, val) {
    onChange({ ...v, [field]: val });
  }
  function setOption(idx, val) {
    const opts = [...v.options];
    opts[idx] = val;
    onChange({ ...v, options: opts });
  }
  return (
    <form className="crud-form" onSubmit={onSubmit}>
      <label className="crud-label">Texto da questão</label>
      <textarea
        className="crud-input"
        rows={3}
        value={v.text}
        onChange={(e) => set("text", e.target.value)}
        placeholder="Digite o enunciado da questão"
        required
      />

      <div className="grid-2">
        <div>
          <label className="crud-label">Alternativa A (índice 0)</label>
          <input
            className="crud-input"
            value={v.options[0]}
            onChange={(e) => setOption(0, e.target.value)}
            required
          />
        </div>
        <div>
          <label className="crud-label">Alternativa B (índice 1)</label>
          <input
            className="crud-input"
            value={v.options[1]}
            onChange={(e) => setOption(1, e.target.value)}
            required
          />
        </div>
        <div>
          <label className="crud-label">Alternativa C (índice 2)</label>
          <input
            className="crud-input"
            value={v.options[2]}
            onChange={(e) => setOption(2, e.target.value)}
            required
          />
        </div>
        <div>
          <label className="crud-label">Alternativa D (índice 3)</label>
          <input
            className="crud-input"
            value={v.options[3]}
            onChange={(e) => setOption(3, e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid-2">
        <div>
          <label className="crud-label">Índice da correta (0-3)</label>
          <input
            className="crud-input"
            type="number"
            min={0}
            max={3}
            value={v.correctIndex}
            onChange={(e) => set("correctIndex", Math.max(0, Math.min(3, Number(e.target.value))))}
            required
          />
        </div>
        <div>
          <label className="crud-label">Explicação</label>
          <input
            className="crud-input"
            value={v.explanation}
            onChange={(e) => set("explanation", e.target.value)}
            placeholder="Por que essa alternativa está correta?"
          />
        </div>
      </div>

      <div className="crud-actions">
        <button className="crud-btn primary" disabled={submitting} type="submit">
          {submitting ? "Salvando..." : "Salvar"}
        </button>
        <button className="crud-btn outline" type="button" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

/** ------- Componente Principal ------- */
export default function QuizCRUD() {
  const [mode, setMode] = useState("grpc"); // "rest" | "grpc"
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");           // busca
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [editing, setEditing] = useState(null); // objeto em edição
  const [submitting, setSubmitting] = useState(false);
  const token = typeof localStorage !== "undefined" ? localStorage.getItem("token") || "" : "";

  // carrega lista
  async function load() {
    setErr(""); setLoading(true);
    try {
      const data = await jsonFetch(`${prefixFor(mode)}/quiz`, { token });
      const arr = Array.isArray(data) ? data : (data?.items || []);
      setItems(arr);
    } catch (e) {
      // fallback demo
      setItems(DEMO_DATA);
      setErr("(demo) usando dados locais, não consegui buscar no backend.");
    } finally {
      setLoading(false);
    }
  }

  // criar
  async function createItem(payload) {
    try {
      const created = await jsonFetch(`${prefixFor(mode)}/quiz`, { method: "POST", body: payload, token });
      return created?.id ? created : { ...payload, id: Math.max(0, ...items.map(i => i.id||0)) + 1 }; // fallback
    } catch {
      // demo: cria localmente
      return { ...payload, id: Math.max(0, ...items.map(i => i.id||0)) + 1 };
    }
  }

  // atualizar
  async function updateItem(id, payload) {
    try {
      await jsonFetch(`${prefixFor(mode)}/quiz/${id}`, { method: "PUT", body: payload, token });
      return true;
    } catch {
      return true; // demo: considera ok
    }
  }

  // excluir
  async function removeItem(id) {
    try {
      await jsonFetch(`${prefixFor(mode)}/quiz/${id}`, { method: "DELETE", token });
    } catch {
      /* demo: segue */
    } finally {
      setItems((prev) => prev.filter((i) => i.id !== id));
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [mode]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return items;
    return items.filter((it) => {
      const inText = it.text?.toLowerCase().includes(query);
      const inExpl = it.explanation?.toLowerCase().includes(query);
      const inOpts = (it.options || []).some((o) => (o || "").toLowerCase().includes(query));
      return inText || inExpl || inOpts;
    });
  }, [items, q]);

  function newEmpty() {
    setEditing({
      id: null,
      text: "",
      options: ["", "", "", ""],
      correctIndex: 0,
      explanation: "",
    });
  }

  function editItem(it) {
    setEditing({ ...it });
  }

  async function submitForm(e) {
    e.preventDefault();
    if (!editing) return;
    setSubmitting(true);
    const payload = {
      text: editing.text,
      options: editing.options,
      correctIndex: editing.correctIndex,
      explanation: editing.explanation,
    };
    try {
      if (editing.id == null) {
        const created = await createItem(payload);
        setItems((prev) => [created, ...prev]);
      } else {
        const ok = await updateItem(editing.id, payload);
        if (ok) {
          setItems((prev) => prev.map((i) => (i.id === editing.id ? { ...i, ...payload } : i)));
        }
      }
      setEditing(null);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="crud-wrap">
      <section className="crud-card">
        <header className="crud-head">
          <div>
            <h2 className="crud-title">CRUD de Quiz</h2>
            <p className="crud-subtle">Gerencie questões: criar, editar e excluir</p>
          </div>
          <ModeToggle mode={mode} setMode={setMode} />
        </header>

        {err && <div className="crud-msg err">{err}</div>}

        {/* barra de ações */}
        {!editing ? (
          <div className="crud-toolbar">
            <div className="crud-search">
              <input
                className="crud-input"
                placeholder="Buscar por texto, opção ou explicação..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <button className="crud-btn primary" onClick={newEmpty}>
              + Nova questão
            </button>
            <button className="crud-btn" onClick={load} disabled={loading}>
              {loading ? "Atualizando..." : "Atualizar"}
            </button>
          </div>
        ) : null}

        {/* formulário */}
        {editing ? (
          <QuestionForm
            value={editing}
            onChange={setEditing}
            onSubmit={submitForm}
            onCancel={() => setEditing(null)}
            submitting={submitting}
          />
        ) : (
          <div className="crud-table-wrap">
            <table className="crud-table">
              <thead>
                <tr>
                  <th style={{ width: 64 }}>ID</th>
                  <th>Questão</th>
                  <th style={{ width: 180 }}>Correta</th>
                  <th style={{ width: 220 }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="empty">Sem resultados.</td>
                  </tr>
                ) : (
                  filtered.map((it) => (
                    <tr key={it.id}>
                      <td>{it.id}</td>
                      <td>
                        <div className="q-text">{it.text}</div>
                        <div className="q-options">
                          {it.options?.map((op, idx) => (
                            <span
                              key={idx}
                              className={`q-badge ${idx === it.correctIndex ? "ok" : ""}`}
                            >
                              {String.fromCharCode(65 + idx)}. {op}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        {typeof it.correctIndex === "number"
                          ? `Índice ${it.correctIndex} (${String.fromCharCode(65 + it.correctIndex)})`
                          : "-"}
                      </td>
                      <td>
                        <div className="row-actions">
                          <button className="crud-btn" onClick={() => editItem(it)}>Editar</button>
                          <button className="crud-btn danger" onClick={() => removeItem(it.id)}>Excluir</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        <p className="crud-foot">
          * Caso o backend não responda, o CRUD funciona em <b>modo demo</b> com dados locais.
        </p>
      </section>
    </div>
  );
}
