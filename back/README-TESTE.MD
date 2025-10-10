🧪 Execução local e Kubernetes (guia rápido)

Este guia cobre duas formas de rodar o backend: Docker Compose (local) e Minikube (Kubernetes). Se você só quer testar os endpoints rapidamente, use Docker Compose.

—

🐋 Docker Compose (recomendado para local)

1) Subir serviços na pasta `back/`:
```
docker compose up -d
```

2) Endpoints e portas expostas:
- Gateway REST: http://localhost:8080 (expõe /api/...)
- API direta (Spring Boot): http://localhost:8089/api
- Adminer (UI do banco): http://localhost:8081
  - servidor: db | usuário: postgres | senha: postgres | database: dbspringboot

3) Teste rápido dos endpoints (exemplos):
```
curl http://localhost:8080/healthz
curl http://localhost:8080/api/usuario
curl http://localhost:8080/api/pergunta
```

Obs.: 8080 agora é o gateway; o Adminer foi movido para 8081 para evitar conflito.

—

☸️ Minikube/Kubernetes

Antes de iniciar o cluster, instale o Minikube e o kubectl.

Exemplos (Linux):
```
curl -LO "https://storage.googleapis.com/kubernetes-release/release/$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl && sudo mv kubectl /usr/local/bin/

curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube
```

Verifique:
```
minikube version
kubectl version --client
```

Inicie o cluster e aplique os manifests (na pasta `back/`):
```
minikube start --driver=docker
eval $(minikube docker-env)
chmod +x scripts/*.sh
bash scripts/build-images-rest.sh
kubectl apply -f k8s-rest/
kubectl get pods,svc
```

Acessando o gateway no Minikube:
- Opção 1 (mais simples):
```
minikube service gateway-p-rest-service --url
```
- Opção 2 (Ingress):
```
minikube addons enable ingress
MINIKUBE_IP=$(minikube ip)
echo "$MINIKUBE_IP rest.local" | sudo tee -a /etc/hosts
kubectl apply -f back/k8s-rest/ingress.yaml
# depois acesse: http://rest.local/
```

—

❗ Dicas de solução de problemas
- Se você tentar `http://localhost:8080/api/...` sem o gateway rodando, verá a tela do Adminer (porta 8080) ou erro 404. Com o Compose desta repo, o gateway atende em 8080 e o Adminer foi movido para 8081.
- A API direta continua acessível em `http://localhost:8089/api` (útil para testar sem gateway).
- Aguarde o Postgres ficar saudável antes da API subir (o Compose já tem healthcheck para o banco).
