import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPass] = useState("");
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const next = location.state?.from?.pathname || "/quiz";

  async function doLogin(e) {
    e.preventDefault();
    setErr(""); setOk("");

    if (!email || !password) {
      setErr("Digite email e senha (qualquer valor).");
      return;
    }

    // DEMO: aceita qualquer credencial
    localStorage.setItem("token", "demo-token");
    // opcional: derive um "nome" a partir do email
    const guessedName = email.split("@")[0] || "Aluno(a)";
    localStorage.setItem("userName", guessedName);

    setOk("Login realizado!");
    setTimeout(() => navigate(next, { replace: true }), 600);
  }

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={doLogin}>
        <h1 className="login-title">Login</h1>
        <p className="texto-inicial">
          Digite qualquer email e senha para acessar o Quiz.
        </p>

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

        {/* chamada para cadastro */}
        <div className="login-links" style={{ marginTop: 6 }}>
          Não possui uma conta?{" "}
          <Link to="/cadastro" style={{ textDecoration: "underline", color: "#fff" }}>
            Criar uma
          </Link>
        </div>

        <button className="btn primary" type="submit">
          Entrar
        </button>

        {ok ? <p className="msg ok">{ok}</p> : null}
        {err ? <p className="msg err">{err}</p> : null}

        <div className="login-links">
          <Link to="/">Voltar</Link>
        </div>
      </form>
    </div>
  );
}
