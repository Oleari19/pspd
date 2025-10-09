#!/usr/bin/env bash
set -euo pipefail

echo "==> [docker] usando daemon do minikube"
eval "$(minikube docker-env)"

echo "==> [build] rest-quiz (Spring) em springboot/demo"
docker build -t rest-quiz:v1 springboot/demo

echo "==> [tag] rest-user (mesma imagem do quiz)"
docker tag rest-quiz:v1 rest-user:v1

echo "==> [build] gateway-p-rest (Node) em gateway-p-rest"
docker build -t gateway-p-rest:v1 gateway-p-rest

echo "OK: rest-quiz:v1, rest-user:v1, gateway-p-rest:v1"
