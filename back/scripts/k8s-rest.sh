#!/usr/bin/env bash
set -e
kubectl apply -f k8s-rest/
kubectl get pods,svc


kubectl get pods -o wide
aparecer todos como running



Perfeito 👌 — esse erro é normal e significa que o Kubernetes não aceita substituir apenas parte da probe (HTTP → TCP) sem remover o tipo anterior.
Vamos corrigir limpando as probes antigas antes de aplicar as novas.

🧹 1️⃣ Remove as probes antigas
kubectl patch deploy rest-quiz-deployment --type='json' -p='[
  {"op":"remove","path":"/spec/template/spec/containers/0/livenessProbe"},
  {"op":"remove","path":"/spec/template/spec/containers/0/readinessProbe"}
]'
kubectl patch deploy rest-user-deployment --type='json' -p='[
  {"op":"remove","path":"/spec/template/spec/containers/0/livenessProbe"},
  {"op":"remove","path":"/spec/template/spec/containers/0/readinessProbe"}
]'

⚙️ 2️⃣ Agora aplica as novas probes TCP
kubectl patch deploy rest-quiz-deployment -p '{
  "spec":{"template":{"spec":{"containers":[{"name":"rest-quiz",
    "readinessProbe":{"tcpSocket":{"port":8089},"initialDelaySeconds":5,"periodSeconds":5},
    "livenessProbe":{"tcpSocket":{"port":8089},"initialDelaySeconds":10,"periodSeconds":10}
  }]}}}}'

kubectl patch deploy rest-user-deployment -p '{
  "spec":{"template":{"spec":{"containers":[{"name":"rest-user",
    "readinessProbe":{"tcpSocket":{"port":8089},"initialDelaySeconds":5,"periodSeconds":5},
    "livenessProbe":{"tcpSocket":{"port":8089},"initialDelaySeconds":10,"periodSeconds":10}
  }]}}}}'

✅ 3️⃣ Verifica status

Aguarde uns segundos e depois rode:

kubectl get pods -o wide


Se tudo estiver certo, você vai ver algo assim:

rest-quiz-deployment-xxxxx    1/1   Running
rest-user-deployment-xxxxx    1/1   Running


Aí sim o cluster inteiro vai estar saudável, e você poderá testar novamente:

curl http://192.168.49.2:31560/api/quiz/summary
curl http://192.168.49.2:31560/api/usuario


Você pode testar as rotas completas pelo gateway:

curl http://192.168.49.2:31560/healthz
curl http://192.168.49.2:31560/api/quiz/summary
curl http://192.168.49.2:31560/api/usuario


Se o gateway estiver roteando corretamente, você deve ver respostas em JSON vindas dos microserviços REST (ou um erro 404/empty se o endpoint ainda não existir).

🧩 Quer confirmar tudo visualmente?

Veja os serviços e IPs internos:

kubectl get svc -o wide


Veja as probes atuais (só pra confirmar que o patch aplicou certo):

kubectl get deploy rest-quiz-deployment -o yaml | grep -A6 probe
kubectl get deploy rest-user-deployment -o yaml | grep -A6 probe
