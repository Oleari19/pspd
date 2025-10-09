Aplicação desenvolvida para a disciplina de Programação de Sistemas Paralelos e Distribuídos, simulando um site de quiz com uma arquitetura de microserviços.

## Descrição

Este projeto consiste em uma aplicação web de quiz onde os usuários podem responder a perguntas. A arquitetura foi projetada para demonstrar conceitos de sistemas distribuídos, utilizando:

Dois servidores em C++: Um microserviço robusto e de alta performance responsável por toda a lógica de negócios e manipulação de dados (Criar, Ler, Atualizar, Deletar perguntas, usuários, pontuações, etc.).

Servidor Web em Node.js: Atua como um backend-for-frontend (BFF), servindo a interface do usuário e se comunicando com o servidor C++ via gRPC.

gRPC: Protocolo de comunicação RPC (Remote Procedure Call) de alta performance utilizado para a comunicação eficiente entre o servidor Node.js e o servidor C++.

Kubernetes (Minikube): Plataforma de orquestração de contêineres utilizada para implantar, gerenciar e escalar os microserviços em um ambiente local que simula uma nuvem.

## Tecnologias Utilizadas

Comunicação: gRPC

Backend: C++

Frontend/BFF: Node.js

Orquestração: Kubernetes (Minikube)

Contêineres: Docker

## Pré-requisitos

Antes de começar, certifique-se de que você tem as seguintes ferramentas instaladas e configuradas em sua máquina:

Git

Docker

Minikube

kubectl

## Rodar

1. Clonar o Repositório

Primeiro, clone este repositório para a sua máquina local.
Bash

    git clone <urlDoProjeto>
    cd pspd-extraclasse1

2. Executar o Script de Deploy

O script deploy.sh automatiza todo o processo de build das imagens Docker e de deploy dos recursos (Deployments, Services) no cluster Minikube.
Bash

```
./deploy.sh
```

3. Obter a Porta de Acesso ao Web Server

Uma vez que os serviços estejam rodando no Kubernetes, precisamos expor o web-server para que possamos acessá-lo pelo frontEnd. O script de deploy criou um serviço do tipo NodePort.

Execute o comando abaixo para listar os serviços e encontrar a porta externa:
Bash
```
kubectl get service
```
Você verá uma saída parecida com esta:


NAME          TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)        AGE
crud-server   ClusterIP   10.108.81.187   <none>        50051/TCP      5m
kubernetes    ClusterIP   10.96.0.1       <none>        443/TCP        10m
web-server    NodePort    10.103.17.6     <none>        3000:31567/TCP   5m


Procure pelo serviço web-server e anote a porta que aparece após os dois pontos (neste exemplo, 31567).

4. Configurar o Proxy do Frontend

Para que a aplicação frontend possa fazer chamadas para o backend, precisamos configurar o proxy.

a. Obtenha o IP do seu Minikube:
```Bash
minikube ip
```

Anote o endereço de IP retornado.

b. Edite o arquivo package.json:
Abra o arquivo package.json (que deve estar na pasta do cliente Node.js, ex: /web-client/package.json). Encontre o campo "proxy" e atualize-o com o IP do Minikube e a porta externa que você obteve no passo anterior.

Exemplo:

Se o seu IP do Minikube for 192.168.49.2 e a porta for 31567, o campo deverá ficar assim:
JSON

  "proxy": "http://192.168.49.2:31567"

5. Acesse a Aplicação

Agora, você precisa instalar as dependências do Node.js e iniciar o servidor de desenvolvimento.
```Bash
npm install
npm start
```
Abra seu navegador e acesse http://localhost:3000  para ver a aplicação funcionando!
