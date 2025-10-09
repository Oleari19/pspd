#!/usr/bin/env bash
set -euo pipefail

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
