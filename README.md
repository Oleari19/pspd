PSPD — Quiz (Spring Boot + React + PostgreSQL)

Este repositório contém:
- Backend REST em Spring Boot (Java 17) com PostgreSQL.
- Frontend em React (Create React App).
- Docker Compose para ambiente local (API + Postgres + Adminer).
- Manifests Kubernetes + um Gateway (Node/Express) para orquestração em cluster.

Use este README como guia para rodar localmente, com Docker Compose ou via Minikube/Kubernetes, além de entender as branches do projeto.

Requisitos
- Java 17 + Maven 3.9+
- Node.js 18+ (npm)
- Docker + Docker Compose (opcional, recomendado para local)
- Kubectl + Minikube (opcional, para rodar em cluster local)

Estrutura
- `back/springboot/demo` — API Spring Boot (porta padrão `8089`)
- `back/docker-compose.yml` — Compose com `db` (Postgres), `api` (Spring) e `adminer`
- `back/gateway-p-rest` — Gateway P (Node/Express) para Kubernetes
- `back/k8s-rest` — Manifests K8s para bancos, serviços e gateway
- `front` — Aplicação React (porta `3000` em dev)

Como Rodar — Backend (Spring Boot)

Opção A: Maven local (com Postgres local ou do Compose)
- Banco local: configure variáveis ou use o serviço `db` do Compose (ver Opção B) e aponte para ele.
- Variáveis suportadas (defaults):
  - `PGHOST`/`DB_HOST`=`localhost`, `PGPORT`/`DB_PORT`=`5432`, `PGDATABASE`/`DB_NAME`=`dbspringboot`, `PGUSER`/`DB_USER`=`postgres`, `PGPASSWORD`/`DB_PASS`=`postgres`
- Executar:
  - `cd back/springboot/demo`
  - `mvn spring-boot:run`
- Porta: `http://localhost:8089`

Opção B: Docker Compose (recomendado)
- `cd back`
- `docker compose up -d`
- Serviços:
  - API: `http://localhost:8089`
  - Adminer (UI para DB): `http://localhost:8080` (servidor: `db`, user: `postgres`, pass: `postgres`, db: `dbspringboot`)
- O Compose injeta `schema.sql` e `data.sql` automaticamente no Postgres.

Como Rodar — Frontend (React)
- `cd front`
- `npm install`
- `npm start`
- Por padrão, o front usa `http://localhost:8089/api` (constantes `REST_API_BASE` nos arquivos do `src`).
- Se for usar Kubernetes/Gateway, ajuste `REST_API_BASE` para o endpoint do gateway (ex.: `http://<minikube-ip>:<nodeport>/api`). Arquivos a ajustar:
  - `front/src/Login.js`
  - `front/src/Cadastro.js`
  - `front/src/Quiz.js`
  - `front/src/Ranking.js`
  - `front/src/QuizCRUD.js`

Rodando no Kubernetes (Minikube)
1) Inicie o cluster
- `minikube start`
- Opcional: `eval $(minikube docker-env)` para construir imagens dentro do daemon do Minikube.

2) Construa as imagens locais (no diretório `back`)
- Linux/macOS (ou Git Bash no Windows):
  - `bash scripts/build-images-rest.sh`
  - Isso cria: `rest-quiz:v1`, `rest-user:v1` (tag da mesma imagem) e `gateway-p-rest:v1`

3) Aplique os manifests
- `kubectl apply -f k8s-rest/`
- Verifique: `kubectl get pods,svc`

4) Descubra a URL do gateway (NodePort)
- `minikube service gateway-p-rest-service --url`
- ou pegue o IP do Minikube (`minikube ip`) e o NodePort do serviço (`kubectl get svc gateway-p-rest-service -o wide`).
- Teste:
  - `curl http://<minikube-ip>:<nodeport>/healthz`
  - `curl http://<minikube-ip>:<nodeport>/api/quiz/summary`

5) Aponte o Front para o Gateway
- Ajuste `REST_API_BASE` no front para `http://<minikube-ip>:<nodeport>/api` e rode `npm start`.

Observações
- As imagens `rest-quiz` e `rest-user` usam a mesma aplicação Spring Boot; os manifests diferenciam bancos/serviços para simular dois domínios (quiz e usuário).
- As probes/saúde já estão definidas nos manifests; se trocar de HTTP para TCP, remova e recrie as probes (veja comentários em `back/scripts/k8s-rest.sh`).

Endpoints REST (principais)
- Usuário (`/api/usuario`)
  - `GET /api/usuario` — lista usuários
  - `GET /api/usuario/ranking` — ranking por pontuação
  - `GET /api/usuario/{id}` — busca por id
  - `POST /api/usuario` — cria usuário
  - `POST /api/usuario/login` — autentica (email/senha)
  - `PUT /api/usuario/{id}` — atualiza
  - `PATCH /api/usuario/{id}/pontuacao` — incrementa pontuação (ex: `{ "incremento": 10 }`)
  - `DELETE /api/usuario/{id}` — remove
- Pergunta (`/api/pergunta`)
  - `GET /api/pergunta` — lista perguntas
  - `GET /api/pergunta/{id}` — busca por id
  - `POST /api/pergunta` — cria
  - `PUT /api/pergunta/{id}` — atualiza
  - `DELETE /api/pergunta/{id}` — remove

Banco de Dados
- Arquivos: `back/springboot/demo/src/main/resources/schema.sql` e `data.sql`.
- Spring configura Postgres via envs (`PG*`/`DB_*`); `ddl-auto=update` e `spring.sql.init.mode=always` garantem criação e carga inicial.
- Pool reduzido (Hikari) para ambientes com pouca RAM.
- Com Docker Compose, o Adminer em `:8080` facilita a inspeção.

Branches — Visão Geral
- `main` (padrão):
  - Implementação atual em REST (Spring Boot) + React, com suporte a Docker Compose e Kubernetes (gateway P em Node para orquestração de rotas `/api/usuario` e `/api/pergunta`).
  - Recomendado para uso e evolução.
- `grpc` (histórico):
  - Versão anterior com servidor gRPC (C++) e um proxy REST em Node. Mantida apenas para referência/estudo.
- `serverA`, `serverB`, `serverBfinalVersion` (históricas):
  - Ramificações de experimentos/protótipos antigos. Podem conter variações de servidor e pipeline. Não são mantidas ativamente.

Como trocar de branch
- `git checkout <nome-da-branch>`
- `git pull` para atualizar a branch selecionada

Quando usar cada branch
- Use `main` para desenvolvimento atual, testes e entrega.
- Use `grpc`/`serverA`/`serverB*` apenas para consulta ou migração de ideias do design antigo.

Dicas e Solução de Problemas
- API fora do ar / `connection refused`:
  - Verifique Postgres (Compose: `docker compose ps`), aguarde o healthcheck.
- Front não acessa a API:
  - Confirme `REST_API_BASE` e a porta (local: `8089`; K8s: Gateway NodePort).
- CORS em desenvolvimento:
  - CORS liberado para `localhost` e `127.0.0.1` no backend.
- Build do backend falha:
  - Confirme Java 17 e Maven 3.9+.
- Windows:
  - Use Git Bash para rodar scripts `.sh` em `back/scripts`. Em PowerShell, traduza os passos manualmente.

---

Se quiser, eu centralizo a URL do backend no front via `.env` (ex.: `REACT_APP_API_BASE`) e removo as constantes espalhadas. Basta pedir que eu aplico.

