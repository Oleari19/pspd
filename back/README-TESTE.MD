🚀 Instalação do Minikube

Antes de iniciar o cluster, é necessário instalar o **Minikube** e o **kubectl**.

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

---

🚀 Inicializando o cluster Kubernetes local

```bash
minikube start --driver=docker
kubectl get nodes
```

Se aparecer algo como:

```bash
NAME       STATUS   ROLES           AGE   VERSION
minikube   Ready    control-plane   1m    v1.31.0
```

✅ Seu cluster local está ativo e pronto para receber os comandos:

```bash
kubectl apply -f back/k8s-rest/
```

---

⚙️ Configuração e execução (na pasta `back/`)

🐳 Usar o Docker do Minikube
```bash
eval $(minikube docker-env)
```

🔑 Dar permissão de execução (somente uma vez)
```bash
chmod +x scripts/*.sh
```

▶️ Rodar os scripts
```bash
bash scripts/build-images-rest.sh
bash scripts/k8s-rest.sh
```

🔍 Verificar os pods e serviços
```bash
kubectl get pods,svc
```
