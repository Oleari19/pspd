#!/usr/bin/env bash
set -e
eval $(minikube docker-env)

# A e B (mesma imagem Spring Boot, caminho relativo a partir de /back)
docker build -t rest-quiz:v1 springboot/demo
docker tag  rest-quiz:v1 rest-user:v1

# P (Gateway em Node) – pasta correta!
docker build -t gateway-p-rest:v1 gateway-p-rest

echo "OK: rest-quiz:v1, rest-user:v1, gateway-p-rest:v1"
