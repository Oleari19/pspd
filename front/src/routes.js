import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
  useLocation,
} from "react-router-dom";
import Quiz from "./Quiz";
import Login from "./Login";
import Ranking from "./Ranking";
import Home from "./Home"; 
import Cadastro from "./Cadastro";
import QuizCRUD from "./QuizCRUD";


/** Guarda simples de autenticação via localStorage */
function useToken() {
  const token =
    typeof localStorage !== "undefined" ? localStorage.getItem("token") : "";
  return token;
}

function Protected({ children }) {
  const token = useToken();
  const location = useLocation();
  if (!token) {
    // envia para /login guardando de onde veio
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}

/** Navbar básica (opcional) */
function Navbar() {
  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 18px",
        background: "#111218",
        borderBottom: "1px solid #1f2430",
      }}
    >
      <h1 style={{ color: "#79c0ff", fontSize: 20, margin: 0 }}>PSPD • Quiz</h1>
      <nav style={{ display: "flex", gap: 14 }}>
        <Link style={{ color: "#d1d5db", textDecoration: "none" }} to="/">
          Início
        </Link>
        <Link
          style={{ color: "#d1d5db", textDecoration: "none" }}
          to="/ranking"
        >
          Ranking
        </Link>
        <Link style={{ color: "#d1d5db", textDecoration: "none" }} to="/login">
          Login
        </Link>
        
      </nav>
    </header>
  );
}

/** Componente que você importa no index.js */
export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Navbar />
      <div style={{ padding: 16 }}>
        <Routes>
          {/* Rota inicial: Boas-vindas */}
          <Route path="/" element={<Home />} />

          {/* Quiz protegido por login */}
          <Route
            path="/quiz"
            element={
              <Protected>
                <Quiz />
              </Protected>
            }
          />

          {/* Ranking (público; se quiser proteger, envolva com <Protected> também) */}
          <Route path="/ranking" element={<Ranking />} />

          {/* Login público */}
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/quizcrud" element={<QuizCRUD />} />


          {/* Rota coringa → volta para a home */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </div>
    </BrowserRouter>
  );
}
