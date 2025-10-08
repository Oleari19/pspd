#!/usr/bin/env bash
set -e
kubectl apply -f k8s-rest/
kubectl get pods,svc
