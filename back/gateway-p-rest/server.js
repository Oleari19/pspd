import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const QUIZ_BASE_URL = process.env.QUIZ_BASE_URL || "http://rest-quiz-service:8089";
const USER_BASE_URL = process.env.USER_BASE_URL || "http://rest-user-service:8089";

app.get("/healthz", (_, res) => res.send("ok"));

function pickBase(urlPath) {
  return urlPath.startsWith("/api/usuario") ? USER_BASE_URL : QUIZ_BASE_URL;
}

// Proxy genérico para /api/*
app.use("/api", async (req, res) => {
  try {
    const base = pickBase(req.originalUrl);
    const url = `${base}${req.originalUrl}`;

    // Monta requisição para o serviço alvo
    const init = {
      method: req.method,
      headers: { "content-type": "application/json" },
    };
    if (req.method !== "GET" && req.method !== "HEAD") {
      init.body = JSON.stringify(req.body ?? {});
    }

    const r = await fetch(url, init);

    // Copia cabeçalhos com segurança (sem hop-by-hop)
    r.headers.forEach((value, key) => {
      const k = key.toLowerCase();
      if (["connection", "keep-alive", "proxy-authenticate", "proxy-authorization", "te", "trailer", "upgrade"].includes(k)) return;
      // Evita conflito content-length x transfer-encoding
      if (k === "content-length" && r.headers.has("transfer-encoding")) return;
      res.setHeader(key, value);
    });

    res.status(r.status);
    // Encaminha o stream (sem .send() que pode reescrever cabeçalho)
    if (r.body) {
      r.body.pipe(res);
      r.body.on("error", (e) => res.end());
    } else {
      res.end();
    }
  } catch (e) {
    res.status(502).json({ error: String(e.message || e) });
  }
});

// Rota orquestrada (mantém)
app.get("/api/quiz/summary", async (_, res) => {
  try {
    const qs = await fetch(`${QUIZ_BASE_URL}/api/pergunta`).then((r) => r.json());
    const us = await fetch(`${USER_BASE_URL}/api/usuario`).then((r) => r.json());
    res.json({ perguntas: qs.length, usuarios: us.length });
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Gateway P (REST) rodando na :${PORT}`));
