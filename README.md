# Projeto CRUD de Quiz – gRPC + React + Node + PostgreSQL

## Estrutura geral do projeto
```
pspd/
├── serverA/
│   ├── server.cc
│   ├── quiz.proto
│   ├── fisico.sql
│   ├── CMakeLists.txt
│   ├── build/
│   └── docker-compose.yml
├── webserver/
│   ├── server.js
│   └── package.json
└── frontend/
    ├── src/QuizCRUD.jsx
    ├── src/QuizCRUD.css
    └── package.json
```

## 1. Requisitos
- Ubuntu 22.04+ ou 24.04
- Docker + Docker Compose
- CMake ≥ 3.10
- g++ ≥ 13
- Node.js ≥ 18 (com npm)

## 2. Subindo o banco PostgreSQL
```bash
cd serverA
docker compose up -d
docker exec -i postgres_container psql -U meuusuario -d meubanco < fisico.sql
```

## 3. Compilar o servidor gRPC
```bash
cd serverA/build
cmake ..
make -j$(nproc)
./quiz_server
```

## 4. Webserver Node (proxy REST → gRPC)
```bash
cd webserver
npm install
npm start
```

## 5. Frontend React
```bash
cd frontend
npm install
npm start
```

## 6. Fluxo
React → Node (8080) → gRPC C++ (4242) → PostgreSQL (5433)

## 7. Testar CRUD
Acesse http://localhost:3000 e use o modo gRPC.

## 8. Erros comuns
| Erro | Causa | Solução |
|------|--------|----------|
| connection refused | banco parado | docker compose up -d |
| column “indiceResposta” | nome em minúsculo | use indiceresposta |
| Falha ao deletar | statusRet=0 | troque pra 1 |

## 9. Estrutura SQL
```sql
CREATE TABLE quiz (
  id SERIAL PRIMARY KEY,
  texto VARCHAR(255),
  indiceResposta INTEGER,
  explicacao VARCHAR(255)
);
CREATE TABLE alternativas (
  quiz_id INTEGER REFERENCES quiz(id) ON DELETE CASCADE,
  alternativa VARCHAR(255)
);
```

## 10. Passos resumidos
```bash
cd serverA && docker compose up -d
docker exec -i postgres_container psql -U meuusuario -d meubanco < fisico.sql
cd build && cmake .. && make && ./quiz_server
cd ../../webserver && npm install && npm start
cd ../frontend && npm install && npm start
```
