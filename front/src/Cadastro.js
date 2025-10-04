import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css"; // reaproveita o mesmo CSS

export default function Cadastro() {
  const [name, setName] = useState("");
  const [emailReg, setEmailReg] = useState("");
  const [passReg, setPassReg] = useState("");
  const [passReg2, setPassReg2] = useState("");
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");

  const navigate = useNavigate();

  async function doRegister(e) {
    e.preventDefault();
    setErr(""); setOk("");

    if (!name || !emailReg || !passReg || !passReg2) {
      setErr("Preencha todos os campos.");
      return;
    }
    if (passReg !== passReg2) {
      setErr("As senhas não coincidem.");
      return;
    }

    // DEMO: cria conta local
    localStorage.setItem("demoUser", JSON.stringify({ name, email: emailReg }));

    setOk("Conta criada com sucesso!");
    // Redireciona para a tela de Login em vez do Quiz
    setTimeout(() => navigate("/login", { replace: true }), 1200);
  }

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={doRegister}>
        <h1 className="login-title">Criar uma conta</h1>
        <p className="texto-inicial">Preencha os dados para começar o Quiz.</p>

        <label className="login-label">Nome</label>
        <input
          className="login-input"
          placeholder="Seu nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label className="login-label">Email</label>
        <input
          className="login-input"
          placeholder="seu@email"
          value={emailReg}
          onChange={(e) => setEmailReg(e.target.value)}
        />

        <label className="login-label">Senha</label>
        <input
          className="login-input"
          type="password"
          placeholder="crie uma senha"
          value={passReg}
          onChange={(e) => setPassReg(e.target.value)}
        />

        <label className="login-label">Confirmar senha</label>
        <input
          className="login-input"
          type="password"
          placeholder="repita a senha"
          value={passReg2}
          onChange={(e) => setPassReg2(e.target.value)}
        />

        <button className="btn primary" type="submit">
          Criar conta
        </button>

        {ok ? <p className="msg ok">{ok}</p> : null}
        {err ? <p className="msg err">{err}</p> : null}

        <div className="login-links">
          Já possui conta? <Link to="/login">Fazer login</Link>
        </div>
      </form>
    </div>
  );
}
