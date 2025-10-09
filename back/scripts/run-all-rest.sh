#!/usr/bin/env bash
set -euo pipefail

echo "==> [minikube] start (se necessário)"
if ! minikube status >/dev/null 2>&1; then
  minikube start --kubernetes-version=v1.34.0
fi

echo "==> [docker] usando daemon do minikube"
eval "$(minikube docker-env)"

echo "==> [build] rest-quiz (Spring) em springboot/demo"
docker build -t rest-quiz:v1 springboot/demo

echo "==> [tag] rest-user (mesma imagem do quiz)"
docker tag rest-quiz:v1 rest-user:v1

echo "==> [build] gateway-p-rest (Node) em gateway-p-rest"
docker build -t gateway-p-rest:v1 gateway-p-rest

echo "==> [k8s] apply k8s-rest/"
kubectl apply -f k8s-rest/

echo "==> [k8s] aguardando rollouts (até 3min)"
for d in gateway-p-rest-deployment rest-quiz-deployment rest-user-deployment postgres-quiz-deployment postgres-user-deployment; do
  if kubectl get deploy "$d" >/dev/null 2>&1; then
    kubectl rollout status deploy/"$d" --timeout=180s
  fi
done

echo "==> [k8s] pods e serviços"
kubectl get pods,svc

echo "==> [info] URLs úteis"
NODEPORT="$(kubectl get svc gateway-p-rest-service -o jsonpath='{.spec.ports[0].nodePort}')"
IP="$(minikube ip)"
cat <<EOF

----------------------------------------
Gateway (NodePort):
  http://$IP:$NODEPORT/healthz
  http://$IP:$NODEPORT/api/usuario/actuator/health
  http://$IP:$NODEPORT/api/quiz/actuator/health
  http://$IP:$NODEPORT/api/quiz/summary

Exemplos:
  curl -i http://$IP:$NODEPORT/api/usuario
  curl -i http://$IP:$NODEPORT/api/pergunta
  curl -i -X POST http://$IP:$NODEPORT/api/usuario/login \
       -H 'Content-Type: application/json' \
       -d '{"email":"demo@pspd.local","senha":"123456"}'
----------------------------------------
EOF
