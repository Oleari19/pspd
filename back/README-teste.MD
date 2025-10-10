Guia de Execução (Local e Kubernetes)

Este guia cobre duas formas de rodar o backend: Docker Compose (local) e Minikube (Kubernetes). Se você só quer testar rapidamente, use Docker Compose. Para um ambiente mais próximo de produção, use Minikube.


Requisitos
- Docker 24+ e Docker Compose
- Java 17 + Maven (ou `mvnw` do projeto)
- Node.js 18+ (para o gateway)
- Opcional: Minikube + Kubectl (Kubernetes)
- Windows: use Git Bash/WSL para scripts `.sh`


Execução local (Docker Compose)
1) Subir serviços na pasta `back/`:
```
cd back
docker compose up -d --build
```

2) Endpoints e portas expostas:
- Gateway REST: http://localhost:8080 (expõe /api/...)
- API direta (Spring Boot): http://localhost:8089/api
- Adminer (UI do banco): http://localhost:8081
  - Server: db | User: postgres | Pass: postgres | DB: dbspringboot

3) Teste rápido dos endpoints (via gateway):
```
curl http://localhost:8080/healthz
curl http://localhost:8080/api/usuario
curl http://localhost:8080/api/pergunta
```

4) Logs e parada:
```
docker compose logs -f api
docker compose logs -f gateway
docker compose down
```


Execução local (sem Docker)
1) Banco Postgres local (ou usando o `db` do Compose):
- Ajuste as variáveis no `application.properties` via `PG*` ou `DB_*` se necessário.

2) Subir Spring Boot:
```
cd back/springboot/demo
./mvnw spring-boot:run   # Windows: mvnw.cmd spring-boot:run
```
- Porta padrão: 8089

3) Subir o Gateway apontando para a API local:
```
cd back/gateway-p-rest
npm ci
PORT=8080 USER_BASE_URL=http://localhost:8089 QUIZ_BASE_URL=http://localhost:8089 npm start
```
- Acesse: http://localhost:8080


Kubernetes (Minikube)
1) Subir/validar o cluster:
```
minikube start --driver=docker
kubectl get nodes
```

2) Deploy automatizado (recomendado): na raiz do repositório
```
./deploy.sh
```
O script:
- Aponta o Docker para o daemon do Minikube
- Faz build das imagens `rest-quiz:v1`, `rest-user:v1` e `gateway-p-rest:v1`
- Aplica os manifests em `back/k8s-rest/`
- Lista os serviços do cluster

3) Obter URL/porta do gateway:
```
minikube service gateway-p-rest-service --url
kubectl get service
```
Procure o `NodePort` do serviço `gateway-p-rest-service` caso use o IP do Minikube diretamente.

4) Acessar/testar:
```
curl "$(minikube service gateway-p-rest-service --url)"/healthz
curl "$(minikube service gateway-p-rest-service --url)"/api/usuario
```

5) (Opcional) Ingress:
```
minikube addons enable ingress
kubectl apply -f back/k8s-rest/ingress.yaml
# adicione em /etc/hosts:  <minikube_ip> rest.local
# depois acesse: http://rest.local/
```


Frontend e CORS (importante)
- O frontend foi ajustado para usar base relativa ("/api") em desenvolvimento.
- Configure o proxy no CRA para apontar para o gateway no Minikube:
  - `front/package.json` → campo `"proxy": "http://<IP_MINIKUBE>:<NODEPORT>"`
  - Obtenha IP/porta com:
    - `minikube ip`
    - `minikube service gateway-p-rest-service --url` ou `kubectl get service`
- Reinicie o dev server do front após mudar o proxy: `cd front && npm start`
- Em produção (sem dev-server), defina `REACT_APP_API_BASE` no build, ex.:
  - `REACT_APP_API_BASE="http://<IP_MINIKUBE>:<NODEPORT>/api" npm run build`


Comandos úteis
- Subir Compose: `docker compose up -d --build`
- Logs da API: `docker compose logs -f api`
- Gateway local: `npm start` (com `USER_BASE_URL`/`QUIZ_BASE_URL`)
- Build imagens (Minikube): `bash back/scripts/build-images-rest.sh`
- Aplicar K8s: `bash back/scripts/k8s-rest.sh`
- URL do gateway: `minikube service gateway-p-rest-service --url`


Solução de problemas
- Banco não pronto: aguarde o readiness do Postgres (Compose possui healthcheck).
- Probes no K8s: use Actuator (`/actuator/health`) ou ajuste os YAMLs.
- Porta ocupada: mude `PORT` do Spring (8089) ou do Gateway (8080).
- CORS: usando o proxy do CRA, o navegador não aplica CORS; para chamadas diretas, as origens `http://localhost:*`/`127.0.0.1:*` já estão permitidas no backend.

