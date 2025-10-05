const path = require("path");
const express = require("express");
const cors = require("cors");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const app = express();
app.use(cors());
app.use(express.json());


const QUIZ_PROTO_PATH = path.join(__dirname, "..", "serverA", "quiz.proto");
const USER_PROTO_PATH = path.join(__dirname, "..", "serverB", "user.proto");
// servidor C++ está escutando em 0.0.0.0:4242
const GRPC_ADDR = process.env.GRPC_ADDR || "localhost:4242";
const GRPCB_ADDR = "localhost:5050";

const packageDefinitionB = protoLoader.loadSync(USER_PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const userProto = grpc.loadPackageDefinition(packageDefinitionB).user;

const clientB = new userProto.User(GRPCB_ADDR, grpc.credentials.createInsecure());


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

async function createUser(userData) {
  return new Promise((resolve, reject) => {
    // monta a requisição no formato do .proto
    const req = {
      usuario: {
        nome: userData.nome || "",
        login: userData.login || "",
        senha: userData.senha || "",
        score: 0,
        rememberToken: "",
      },
    };

    clientB.CreateUsuario(req, (error, response) => {
      if (error) {
        console.error("Erro gRPC CreateUsuario:", error);
        return reject(error);
      }
      resolve(response);
    });
  });
}

function updateScore(scoreData) {
    return new Promise((resolve, reject) => {
        clientB.UpdateScore(scoreData, (error, response) => {
            if (error) return reject(error);
            resolve(response);
        });
    });
}


app.post("/grpc/user/score", async (req, res) => {
    console.log("👉 Rota /grpc/user/score chamada com corpo:", req.body);
    try {
        const scoreData = req.body;
        const grpcResponse = await updateScore(scoreData);
        console.log("✅ Resposta do gRPC:", grpcResponse);
        return res.json(grpcResponse);
    } catch (err) {
        console.error("❌ Erro ao atualizar score:", err);
        return res.status(502).json({ error: err.details || String(err) });
    }
});

function listUsersByScore() {
    return new Promise((resolve, reject) => {
        // A mensagem ListRequest é vazia, então passamos um objeto vazio {} como parâmetro.
        clientB.ListByScore({}, (error, response) => {
            if (error) return reject(error);
            // A resposta contém um campo 'users' que é um array.
            resolve(response.users);
        });
    });
}

app.get("/grpc/ranking", async (req, res) => {
    console.log("👉 Rota /grpc/ranking chamada");
    try {
        const users = await listUsersByScore();
        console.log("✅ Resposta do gRPC:", users);
        return res.json({ users });
    } catch (err) {
        console.error("❌ Erro ao listar usuários:", err);
        return res.status(502).json({ error: err.details || String(err) });
    }
});


function loginUser(credentials) {
  return new Promise((resolve, reject) => {
    const req = {
      loginreq: credentials.loginreq || "",
      senhareq: credentials.senhareq || "",
    };

    clientB.Login(req, (error, response) => {
      if (error) {
        console.error("Erro gRPC Login:", error);
        return reject(error);
      }
      resolve(response);
    });
  });
}

app.post("/grpc/login", async (req, res) => {
  console.log("👉 Rota /grpc/login chamada com corpo:", req.body);
  try {
    const credentials = req.body;
    const grpcResponse = await loginUser(credentials);
    console.log("✅ Resposta do gRPC:", grpcResponse);
    return res.json(grpcResponse);
  } catch (err) {
    console.error("❌ Erro ao fazer login:", err);
    return res.status(502).json({ error: err.details || String(err)+"oi" });
  }
});

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

app.post("/grpc/user", async (req, res) => {
  console.log("👉 Rota /grpc/user chamada com corpo:", req.body);
  try {
    const userData = req.body;
    const grpcResponse = await createUser(userData);
    console.log("✅ Resposta do gRPC:", grpcResponse);
    return res.json(grpcResponse);
  } catch (err) {
    console.error("❌ Erro ao criar usuário:", err);
    return res.status(502).json({ error: err.details || String(err) });
  }
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
const PORT = process.env.PORT || 6969;
app.listen(PORT, () => {
  console.log(`a porra do servidor esta rodando em http://localhost:${PORT}`);
});
