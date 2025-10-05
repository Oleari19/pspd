const path = require("path");
const express = require("express");
const cors = require("cors");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const app = express();
app.use(cors());
app.use(express.json());


const QUIZ_PROTO_PATH = path.join(__dirname, "..", "serverA", "quiz.proto");
// servidor C++ está escutando em 0.0.0.0:4242
const GRPC_ADDR = process.env.GRPC_ADDR || "localhost:4242";

const packageDefinition = protoLoader.loadSync(QUIZ_PROTO_PATH, {
  keepCase: true,      // mantém nomes como estão no .proto
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const quizProto = grpc.loadPackageDefinition(packageDefinition).quiz;

const quizClient = new quizProto.Quiz(GRPC_ADDR, grpc.credentials.createInsecure());

// Front (React) -> gRPC (Pergunta)
function toGrpcPergunta(frontItem) {
  return {
    id: Number(frontItem.id || 0),
    texto: frontItem.text || "",
    alternativas: Array.isArray(frontItem.options) ? frontItem.options : [],
    indice_resposta: Number(frontItem.correctIndex ?? 0),
    explicacao: frontItem.explanation || "",
  };
}

// gRPC (Pergunta) -> Front (React)
function toFrontItem(p) {
  return {
    id: Number(p.id),
    text: p.texto,
    options: p.alternativas,
    correctIndex: Number(p.indice_resposta),
    explanation: p.explicacao || "",
  };
}

// GET /grpc/quiz  -> chama GetPerguntas
app.get("/grpc/quiz", (req, res) => {
  quizClient.GetPerguntas({}, (err, reply) => {
    if (err) {
      console.error("GetPerguntas error:", err);
      return res.status(502).json({ error: err.details || String(err) });
    }
    const perguntas = reply?.perguntas || [];
    const items = perguntas.map(toFrontItem);
    return res.json(items);
  });
});

// POST /grpc/quiz -> chama CreatePergunta
app.post("/grpc/quiz", (req, res) => {
  const body = req.body || {};
  const p = toGrpcPergunta(body);

  const createReq = { pergunta_criar: [p] };
  quizClient.CreatePergunta(createReq, (err, reply) => {
    if (err) {
      console.error("CreatePergunta error:", err);
      return res.status(502).json({ error: err.details || String(err) });
    }
    const created = (reply?.pergunta_criada || [])[0];
    if (!created) {
      return res.json({ ...body, id: 0 });
    }
    return res.json(toFrontItem(created));
  });
});

// DELETE /grpc/quiz/:id -> chama DeletePergunta
app.delete("/grpc/quiz/:id", (req, res) => {
  const dbid = Number(req.params.id);
  quizClient.DeletePergunta({ dbid }, (err, reply) => {
    if (err) {
      console.error("DeletePergunta error:", err);
      return res.status(502).json({ error: err.details || String(err) });
    }
    // teu server hoje retorna statusRet=0 sempre; o front ignora resposta de qualquer forma.
    // se ajustar no C++ para 1=sucesso, ótimo. Aqui só repassamos.
    return res.json({ statusRet: reply?.statusRet ?? 0 });
  });
});

// OBS: PUT /grpc/quiz/:id -> ainda não há Update no gRPC C++.

app.put("/grpc/quiz/:id", (req, res) => {
  return res.status(204).end();
});

// OBS ESPAÇO PARA endpoints /rest/*

// Porta do webserver
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Webserver REST<->gRPC rodando em http://localhost:${PORT}`);
  console.log(`Proxy gRPC para ${GRPC_ADDR}`);
});
