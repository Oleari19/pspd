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




cd back

docker compose down -v         # remove os volumes (cuidado: apaga dados)
docker compose up -d





echo "=== Verificando dependências ==="

# Docker
if ! command -v docker &> /dev/null; then
  echo "[X] Docker não instalado"
  echo "→ Instale com:"
  echo "sudo apt install -y docker-ce docker-ce-cli containerd.io"
else
  echo "[✓] Docker instalado"
  docker --version
fi

# Kubectl
if ! command -v kubectl &> /dev/null; then
  echo "[X] kubectl não instalado"
  echo "→ Instale com:"
  echo "sudo snap install kubectl --classic"
else
  echo "[✓] kubectl instalado"
  kubectl version --client --short
fi

# Minikube
if ! command -v minikube &> /dev/null; then
  echo "[X] minikube não instalado"
  echo "→ Instale com:"
  echo "curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64"
  echo "sudo install minikube-linux-amd64 /usr/local/bin/minikube"
else
  echo "[✓] minikube instalado"
  minikube version
fi

echo "=== Fim da verificação ==="





1. Instalar o kubectl
sudo snap install kubectl --classic


Depois teste:

kubectl version --client 


Se aparecer algo como Client Version: v1.xx.x, está tudo certo.



2 Intalar o minikube

curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube

confirme
minikube version


3. Testar se está tudo integrado

Assim que os dois estiverem instalados, rode:

minikube start --driver=docker
kubectl get nodes


Se aparecer algo como:

NAME       STATUS   ROLES           AGE   VERSION
minikube   Ready    control-plane   1m    v1.31.0

seu cluster local está ativo e pronto pra receber os kubectl apply -f back/k8s-rest/.



na pasta back/

# usar o docker do minikube
eval $(minikube docker-env)

# dar permissão de execução (só uma vez)
chmod +x scripts/*.sh

# agora rodar os scripts
bash scripts/build-images-rest.sh
bash scripts/k8s-rest.sh     
kubectl get pods,svc