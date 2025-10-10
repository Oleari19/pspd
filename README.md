Aplicação desenvolvida para a disciplina de Programação para Sistemas Paralelos e Distribuídos, simulando um site de quiz com uma arquitetura baseada em serviços REST.

Esta versão da aplicação utiliza um backend Spring Boot integrado ao PostgreSQL, exposto por um gateway Node.js/Express e entregue em contêineres Docker com suporte a Kubernetes.

Descrição
Este projeto consiste em uma aplicação web de quiz na qual os usuários podem responder perguntas e acompanhar rankings. A arquitetura foi projetada para demonstrar conceitos de sistemas distribuídos, utilizando:

Serviço REST em Spring Boot (Java): responsável pela lógica de negócios, persistência via JPA e integração com PostgreSQL para CRUD de usuários, perguntas e pontuações.

API Gateway em Node.js (Express): atua como camada BFF, agregando e roteando chamadas REST para os serviços Spring Boot e expondo endpoints simplificados para o frontend.

Frontend em React: interface web que consome o gateway para exibir perguntas, enviar respostas e visualizar rankings.

PostgreSQL: banco relacional que armazena usuários, perguntas e pontuações com scripts de inicialização automáticos.

Docker Compose: orquestração local que sobe banco, serviço Spring Boot, Adminer e gateway REST com um único comando.

Kubernetes (Minikube): ambiente de orquestração para provisionar múltiplos serviços Spring Boot, banco de dados e gateway em cluster local.

Tecnologias Utilizadas
Comunicação: REST sobre HTTP

Backend: Spring Boot (Java 17) + PostgreSQL

Gateway/BFF: Node.js 18 (Express)

Frontend: React (Create React App)

Orquestração: Docker Compose e Kubernetes (Minikube)

Contêineres: Docker

Pré-requisitos
Antes de começar, certifique-se de que você tem as seguintes ferramentas instaladas e configuradas em sua máquina:

Git

Docker + Docker Compose

Node.js 18+

Java 17 + Maven 3.9+

Minikube

kubectl

Rodar Rápido (recomendado)

1) Subir Banco + API com Docker Compose

```bash
cd back
docker compose up -d
```

Serviços expostos (Docker Compose):
- Gateway REST (recomendado): http://localhost:8080
- API direta (Spring Boot): http://localhost:8089
- Adminer (UI do banco): http://localhost:8081
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
- Gateway REST: http://localhost:8080 (expõe /api/...)
- API direta: http://localhost:8089/api
- Adminer: http://localhost:8081
- Frontend: http://localhost:3000

Estrutura do Repositório
- back/springboot/demo – API Spring Boot
- back/docker-compose.yml – Compose (db, api, adminer)
- back/k8s-rest – Manifests para Kubernetes (opcional)
- front – Aplicação React

## Kubernetes 

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
