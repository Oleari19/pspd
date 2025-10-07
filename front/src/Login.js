import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "./Login.css";

const REST_API_BASE = "http://localhost:8089/api";
const REST_LOGIN_ENDPOINT = `${REST_API_BASE}/usuario/login`;

async function restLogin(email, password) {
  const res = await fetch(REST_LOGIN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha: password }),
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }
  if (!res.ok) {
    const message = data?.message || data?.raw || text || "Falha no login REST.";
    throw new Error(typeof message === "string" ? message : "Falha no login REST.");
  }
  return data;
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPass] = useState("");
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const next = location.state?.from?.pathname || "/quiz";

  async function doLoginRest() {
    setErr(""); setOk("");

    if (!email || !password) {
      setErr("Digite email e senha.");
      return;
    }

    try {
      const user = await restLogin(email, password);

      const guessedName = (user?.email || email).split("@")[0] || "Aluno(a)";
      const tokenBase = user?.codigoUsuario ?? user?.id ?? email;

      localStorage.setItem("token", `rest-${tokenBase}`);
      localStorage.setItem("apiMode", "rest");
      localStorage.setItem("basePrefix", REST_API_BASE);
      localStorage.setItem("userName", guessedName);
      if (user?.codigoUsuario !== undefined && user?.codigoUsuario !== null) {
        localStorage.setItem("userId", String(user.codigoUsuario));
      } else {
        localStorage.removeItem("userId");
      }

      setOk("Login realizado!");
      setTimeout(() => navigate(next, { replace: true }), 500);
    } catch (e) {
      let message = e instanceof Error ? e.message : "Não foi possível autenticar via REST.";
      // Se o erro for relacionado a usuário/senha incorretos, mostrar mensagem padronizada
      if (
        message?.toLowerCase().includes("usuario") ||
        message?.toLowerCase().includes("senha") ||
        message?.toLowerCase().includes("not found") ||
        message?.toLowerCase().includes("inexistente") ||
        message?.toLowerCase().includes("incorrect")
      ) {
        message = "Usuário e senha incorretos";
      }
      setErr(message || "Não foi possível autenticar via REST.");
    }
  }

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={(e) => e.preventDefault()}>
        <h1 className="login-title">Login</h1>
        <p className="texto-inicial">Digite seu email e senha para acessar o Quiz.</p>

        <label className="login-label">Email</label>
        <input
          className="login-input"
          placeholder="seu@email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label className="login-label">Senha</label>
        <input
          className="login-input"
          type="password"
          placeholder="sua senha"
          value={password}
          onChange={(e) => setPass(e.target.value)}
        />

        <div className="btn-row">
          <button className="btn-login" type="button" onClick={doLoginRest}>
            Entrar (REST)
          </button>
        </div>

        <div className="login-links2" style={{ marginTop: 10 }}>
          Não possui uma conta?{" "}
          <Link to="/cadastro" style={{ textDecoration: "underline", color: "#fff" }}>
            Criar uma
          </Link>
        </div>

        {ok ? <p className="msg ok">{ok}</p> : null}
        {err ? <p className="msg err">{err}</p> : null}

        <div className="login-links">
          <Link to="/">Voltar</Link>
        </div>
      </form>
    </div>
  );
}