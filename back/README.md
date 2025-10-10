# Backend (REST) — Guia Completo

Este diretório abriga o backend do projeto, com uma arquitetura simples de microsserviços REST:

- `springboot/demo` — Serviço REST em Spring Boot (JPA + PostgreSQL)
- `gateway-p-rest` — API Gateway em Node.js (Express) que orquestra e faz proxy para os serviços REST
- `k8s-rest/` — Manifests de Kubernetes para executar os serviços (db-quiz, db-user, rest-quiz, rest-user, gateway)
- `scripts/` — Scripts utilitários para build de imagens e apply no Kubernetes
- `tst/` — Ferramentas de teste de desempenho dos endpoints REST


## Requisitos

- Docker 24+ e Docker Compose
- Java 17 + Maven (ou o wrapper `mvnw` do projeto)
- Node.js 18+ (para o gateway)
- Opcional (Kubernetes): Minikube + Kubectl
- Windows: para rodar scripts `.sh`, use WSL ou Git Bash


## Visão Geral da Arquitetura

- Serviços de Negócio (Spring Boot):
  - Expondo rotas REST de `Usuário` (`/api/usuario`) e `Pergunta` (`/api/pergunta`).
  - Banco PostgreSQL via JPA/Hibernate.
  - Variáveis de ambiente mapeadas em `application.properties` (`PORT`, `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`).
- API Gateway (Node.js/Express):
  - Porta `8080` (configurável via `PORT`).
  - Proxies para os serviços Spring: `USER_BASE_URL` e `QUIZ_BASE_URL`.
  - Rota de saúde: `GET /healthz`.
- Execução Local (Compose):
  - Sobe um PostgreSQL, o serviço Spring (como “api”) e o Adminer para inspeção do banco.
- Execução em Kubernetes (Minikube):
  - 2 bancos (quiz e user), 2 instâncias do serviço Spring (rest-quiz e rest-user) e 1 gateway.


## Estrutura de Pastas

- `springboot/demo` — Código Java, `pom.xml`, `Dockerfile`, `schema.sql`/`data.sql`.
- `gateway-p-rest` — `server.js`, `package.json` (scripts de `start`).
- `k8s-rest/` — Manifests YAML (Deployments/Services/Ingress).
- `scripts/` — `build-images-rest.sh`, `k8s-rest.sh`.
- `docker-compose.yml` — Orquestração local (db, api, adminer).


## Como Rodar (Local com Docker Compose)

1) Suba banco, API Spring e Adminer:

```
cd back
docker compose up -d --build
```

- API Spring: `http://localhost:8089`
- Adminer: `http://localhost:8080` (Server: `db`, User: `postgres`, Pass: `postgres`, DB: `dbspringboot`)
- Observação: por padrão o `db` não expõe a porta 5432 para a máquina. Se precisar, edite `docker-compose.yml` e exponha (ex.: `5433:5432`).

2) Testar API (exemplos):

```
curl http://localhost:8089/api/usuario
curl http://localhost:8089/api/pergunta
```

3) (Opcional) Rodar o Gateway local apontando para a API Spring local:

```
cd back/gateway-p-rest
npm ci
set PORT=8080; set USER_BASE_URL=http://localhost:8089; set QUIZ_BASE_URL=http://localhost:8089; npm start
# Linux/macOS: PORT=8080 USER_BASE_URL=http://localhost:8089 QUIZ_BASE_URL=http://localhost:8089 npm start
```

- Gateway: `http://localhost:8080`
- Exemplos:

```
curl http://localhost:8080/healthz
curl http://localhost:8080/api/quiz/summary
curl http://localhost:8080/api/usuario
```


## Como Rodar (Local sem Docker)

1) PostgreSQL local (ou o `db` do Compose rodando):
- Configure as vars do banco (ex.: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS`) se necessário. O `application.properties` resolve por `PG*` ou `DB_*` e cai em defaults.

2) Subir Spring Boot:

```
cd back/springboot/demo
./mvnw spring-boot:run
# Windows: mvnw.cmd spring-boot:run
```

- Por padrão sobe na porta `8089` (ou `PORT` do ambiente).

3) Subir Gateway:

```
cd back/gateway-p-rest
npm ci
PORT=8080 USER_BASE_URL=http://localhost:8089 QUIZ_BASE_URL=http://localhost:8089 npm start
```


## Como Rodar (Kubernetes com Minikube)

Opção Rápida) Fluxo simples com script

### 🧩 Instalar o kubectl
```bash
curl -LO "https://storage.googleapis.com/kubernetes-release/release/$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl
sudo mv kubectl /usr/local/bin/
```

### 📦 Instalar o Minikube
```bash
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube
```

Verifique se ambos estão instalados corretamente:
```bash
minikube version
kubectl version --client
```
🚀 Inicializando o cluster Kubernetes local

```bash
minikube start --driver=docker
kubectl get nodes
```
1) Reinicie o cluster (opcional, zera o estado):

```
minikube delete
```

2) Vá para a pasta `back` e execute o script que constrói as imagens, aplica os manifests e imprime a URL/porta do gateway no final:

```
cd back
bash scripts/run-all-rest.sh
```

- No final, o script mostra o `NodePort` do serviço `gateway-p-rest-service` e monta a URL completa com o IP do Minikube (ex.: `http://<minikube-ip>:<nodePort>`).
- Use essa URL no seu proxy/cliente para acessar o Gateway (ex.: `/healthz`, `/api/quiz/summary`, `/api/usuario`).





4) Testar:

```
curl "$(minikube service gateway-p-rest-service --url)"/healthz
curl "$(minikube service gateway-p-rest-service --url)"/api/quiz/summary
```

Observações:
- As probes dos serviços Spring no YAML usam `/actuator/health`. Se não estiver usando o Actuator, adicione a dependência `spring-boot-starter-actuator` no `pom.xml` ou ajuste as probes para um endpoint existente.
- O `ingress.yaml` expõe o gateway em `rest.local` (configure hosts/local DNS ou use `minikube service`).


## Endpoints Principais (Resumo)

Serviço Spring (porta 8089):
- `GET /api/usuario` — Lista usuários
- `GET /api/usuario/{id}` — Busca usuário por ID
- `GET /api/usuario/ranking` — Ranking por pontuação
- `POST /api/usuario` — Cria usuário
- `PUT /api/usuario/{id}` — Atualiza usuário
- `PATCH /api/usuario/{id}/pontuacao` — Incrementa pontuação (corpo opcional `{ "incremento": 2 }`)
- `DELETE /api/usuario/{id}` — Remove usuário
- `GET /api/pergunta` — Lista perguntas
- `GET /api/pergunta/{id}` — Busca pergunta por ID
- `POST /api/pergunta` — Cria pergunta
- `PUT /api/pergunta/{id}` — Atualiza pergunta
- `DELETE /api/pergunta/{id}` — Remove pergunta

Gateway (porta 8080):
- `GET /healthz` — Saúde do gateway
- `GET /api/quiz/summary` — Agrega contagens de perguntas e usuários
- Proxy transparente para `/api/usuario` e `/api/pergunta` (métodos GET/POST/PUT/PATCH/DELETE)


## Exemplos de Payload

`POST /api/usuario`:

```
{
  "email": "joao@example.com",
  "senha": "123456",
  "pontuacao": 0
}
```

`POST /api/pergunta` (exemplo simples):

```
{
  "codigoPergunta": 0,
  "descricao": "Qual a capital da França?",
  "alternativas": ["Paris", "Lyon", "Marselha", "Nice"],
  "correta": 0
}
```


## Banco de Dados e Inicialização

- `springboot/demo/src/main/resources/schema.sql` e `data.sql` definem a criação e dados iniciais.
- `application.properties` está configurado para sempre rodar scripts SQL na inicialização:
  - `spring.sql.init.mode=always`
  - `spring.jpa.hibernate.ddl-auto=update`


## Variáveis de Ambiente (Resumo)

Spring Boot (`springboot/demo`):
- `PORT` — Porta HTTP (default `8089`)
- `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD` — Conexão PostgreSQL
- Alternativas: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS`

Gateway (`gateway-p-rest`):
- `PORT` — Porta HTTP (default `8080`)
- `USER_BASE_URL` — Base para `/api/usuario` (ex.: `http://rest-user-service:8089` no K8s, `http://localhost:8089` local)
- `QUIZ_BASE_URL` — Base para `/api/pergunta`


## Troubleshooting

- Porta ocupada: ajuste `PORT` do Spring (`8089`) ou do Gateway (`8080`).
- Banco não disponível: verifique variáveis `PG*`, logs do container `db` (Compose) ou `postgres-*` (K8s).
- Probes falhando no K8s: adicionar `spring-boot-starter-actuator` no `pom.xml` e expor `/actuator/health`, ou mudar as probes.
- Windows + scripts `.sh`: utilize WSL, Git Bash ou converta comandos para PowerShell equivalentes.


## Testes de Desempenho

Há um guia dedicado em `back/tst/README.md` com um script Python que mede latência (gera `.xlsx` e resumo `.csv`). Exemplo rápido:

```
cd back/tst
python -m venv .venv
source .venv/bin/activate  # Windows (PowerShell): .venv\Scripts\Activate.ps1
pip install requests pandas openpyxl
python perf_bench_rest.py --base http://localhost:8080
```


## Referências Rápidas

- Subir Compose: `docker compose up -d --build`
- Logs API: `docker compose logs -f api`
- Acessar Adminer: `http://localhost:8080`
- Gateway local: `npm start` (com `USER_BASE_URL` e `QUIZ_BASE_URL` configuradas)
- Build imagens (Minikube): `bash scripts/build-images-rest.sh`
- Aplicar K8s: `bash scripts/k8s-rest.sh`

