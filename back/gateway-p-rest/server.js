import express from "express";
import fetch from "node-fetch";
const app = express();
app.use(express.json());

const QUIZ_BASE_URL = process.env.QUIZ_BASE_URL || "http://rest-quiz-service:8089";
const USER_BASE_URL = process.env.USER_BASE_URL || "http://rest-user-service:8089";

app.get("/healthz", (_,res)=>res.send("ok"));

// Exemplo de rota que orquestra A e B
app.get("/api/quiz/summary", async (_,res)=>{
  try {
    const qs = await fetch(`${QUIZ_BASE_URL}/api/pergunta`).then(r=>r.json());
    const us = await fetch(`${USER_BASE_URL}/api/usuario`).then(r=>r.json());
    res.json({ perguntas: qs.length, usuarios: us.length });
  } catch (e) { res.status(502).json({ error: e.message }); }
});

// Proxies úteis (mantém compatibilidade com teu front)
app.use("/api/usuario", (req,res)=>{
  const url = `${USER_BASE_URL}${req.originalUrl}`;
  const opt = { method:req.method, headers:{ "content-type":"application/json" } };
  if (req.method !== "GET") opt.body = JSON.stringify(req.body);
  fetch(url,opt).then(r=>r.text().then(b=>res.status(r.status).send(b))).catch(err=>res.status(502).send(err.message));
});
app.use("/api/pergunta", (req,res)=>{
  const url = `${QUIZ_BASE_URL}${req.originalUrl}`;
  const opt = { method:req.method, headers:{ "content-type":"application/json" } };
  if (req.method !== "GET") opt.body = JSON.stringify(req.body);
  fetch(url,opt).then(r=>r.text().then(b=>res.status(r.status).send(b))).catch(err=>res.status(502).send(err.message));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, ()=>console.log(`Gateway P (REST) rodando na :${PORT}`));
