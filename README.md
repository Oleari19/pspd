PSPD – Quiz (Monorepo: Back + Front)

Stack: Spring Boot + PostgreSQL + React, com Docker Compose e manifests para Kubernetes.

Requisitos
- Docker + Docker Compose (recomendado para ambiente local)
- Node.js 18+ (npm)
- Opcional: Java 17 + Maven 3.9+ (se quiser rodar o back sem Docker)

Rodar Rápido (recomendado)

1) Subir Banco + API com Docker Compose

```bash
cd back
docker compose up -d
```

Serviços expostos:
- API: http://localhost:8089
- Adminer (UI do banco): http://localhost:8080
  - servidor: db | usuário: postgres | senha: postgres | database: dbspringboot

2) Rodar o Front (React)

```bash
cd front
npm install
npm start
```

Aplicação Web: http://localhost:3000

Parar os serviços do Docker Compose

```bash
cd back
docker compose down
```

Alternativa: Backend sem Docker (opcional)
- Requer um PostgreSQL local acessível em localhost:5432 com:
  - usuário: postgres | senha: postgres | database: dbspringboot
- O backend já usa essas credenciais por padrão.

```bash
cd back/springboot/demo
mvn spring-boot:run
```

URLs úteis
- API base: http://localhost:8089/api
- Adminer: http://localhost:8080
- Frontend: http://localhost:3000

Estrutura do Repositório
- back/springboot/demo – API Spring Boot
- back/docker-compose.yml – Compose (db, api, adminer)
- back/k8s-rest – Manifests para Kubernetes (opcional)
- front – Aplicação React

Kubernetes (opcional, bem resumido)

```bash
minikube start
cd back
bash scripts/build-images-rest.sh
kubectl apply -f k8s-rest/
minikube service gateway-p-rest-service --url
```

Em seguida, aponte o front para o endpoint retornado (se necessário), ou ajuste o `REST_API_BASE` nos arquivos do `front/src`.

Solução Rápida de Problemas
- API não sobe: aguarde o healthcheck do Postgres (docker compose logs -f db).
- Front não acessa API: confirme que a API está em http://localhost:8089 e que `REST_API_BASE` dos arquivos do front aponta para `http://localhost:8089/api`.
- Build do back falha: confirme Java 17 e Maven 3.9+ (apenas no modo sem Docker).

