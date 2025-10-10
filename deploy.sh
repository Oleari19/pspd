#!/usr/bin/env bash
set -euo pipefail

# Deploy helper: builds Docker images inside Minikube and applies K8s manifests.
# Requirements: minikube, kubectl, docker, bash

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR/back"

echo "[1/3] Switching Docker daemon to Minikube..."
eval "$(minikube docker-env)"

echo "[2/3] Building images (Spring + Gateway)..."
bash scripts/build-images-rest.sh

echo "[3/3] Applying Kubernetes manifests..."
bash scripts/k8s-rest.sh

echo
echo "Services available in the cluster:"
kubectl get svc

echo
echo "Tip: Get the Gateway URL directly with:"
echo "  minikube service gateway-p-rest-service --url"
echo
echo "Then set your frontend proxy (front/package.json -> \"proxy\")."

