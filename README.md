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

## Equipe

Os nomes dos integrantes da equipe podem ser encontrados na tabela 1.

<div align="center">
<font size="3"><p style="text-align: center"><b>Tabela 1:</b> Integrantes da equipe</p></font>

<table>
  <tr>
    <td align="center"><a href="http://github.com/julia-fortunato"><img style="border-radius: 50%;" src="http://github.com/julia-fortunato.png" width="100px;" alt=""/><br /><sub><b>Júlia Fortunato</b></sub></a><br/><a href="Link git" title="Rocketseat"></a></td>
    <td align="center"><a href="http://github.com/Oleari19"><img style="border-radius: 50%;" src="http://github.com/Oleari19.png" width="100px;" alt=""/><br><sub><b>Maria Clara Oleari</b></sub></a><br/>
    <td align="center"><a href="https://github.com/MarcoTulioSoares"><img style="border-radius: 50%;" src="http://github.com/MarcoTulioSoares.png" width="100px;" alt=""/><br /><sub><b>Marco Tulio Soares</b></sub></a><br/><a href="Link git" title="Rocketseat"></a></td>
    <td align="center"><a href="https://github.com/mauricio-araujoo"><img style="border-radius: 50%;" src="https://github.com/mauricio-araujoo.png" width="100px;" alt=""/><br/><sub><b>Maurício Ferreira</b></sub></a><br/>

  </tr>
</table>

<font size="3"><p style="text-align: center"><b>Autor:</b> <a href="https://github.com/julia-fortunato">Júlia Fortunato</a>, 2025</p></font>

</div>