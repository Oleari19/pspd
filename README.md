Aplicação desenvolvida para a disciplina de Programação para Sistemas Paralelos e Distribuídos, simulando um site de quiz com uma arquitetura de microserviços.

Esta versão da aplicação utiliza gRPC. 

## Descrição

Este projeto consiste em uma aplicação web de **quiz** no qual os usuários podem responder a perguntas. A arquitetura foi projetada para demonstrar conceitos de sistemas distribuídos, utilizando:

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

```
    git clone <urlDoProjeto>
    cd pspd-extraclasse1
```

2. Executar o Script de Deploy

O script deploy.sh automatiza todo o processo de build das imagens Docker e de deploy dos recursos (Deployments, Services) no cluster Minikube.


```
./deploy.sh
```

3. Obter a Porta de Acesso ao Web Server

Uma vez que os serviços estejam rodando no Kubernetes, precisamos expor o web-server para que possamos acessá-lo pelo front-end. O script de deploy criou um serviço do tipo NodePort.

Execute o comando abaixo para listar os serviços e encontrar a porta externa:

```
kubectl get service
```
Você verá uma saída parecida com esta:


```
NAME          TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)          AGE
crud-server   ClusterIP   10.108.81.187   <none>        50051/TCP        5m
kubernetes    ClusterIP   10.96.0.1       <none>        443/TCP          10m
web-server    NodePort    10.103.17.6     <none>        3000:31567/TCP   5m
```


Procure pelo serviço web-server e anote a porta que aparece após os dois pontos (neste exemplo, 31567).

4. Configurar o Proxy do Frontend

Para que a aplicação frontend possa fazer chamadas para o backend, precisamos configurar o proxy.

a. Obtenha o IP do seu Minikube:
```Bash
minikube ip
```

Anote o endereço de IP retornado.

b. Edite o arquivo package.json:
Abra o arquivo package.json (que deve estar na pasta do cliente Node.js, ex: /front/package.json). Encontre o campo "proxy" e atualize-o com o IP do Minikube e a porta externa que você obteve no passo anterior.

Exemplo:

Se o seu IP do Minikube for 192.168.49.2 e a porta for 31567, o campo deverá ficar assim:
JSON

  "proxy": "http://192.168.49.2:31567"

5. Acesse a Aplicação

Agora, você precisa instalar as dependências do Node.js e iniciar o servidor de desenvolvimento.
```
npm install
npm start
```
Abra seu navegador e acesse http://localhost:3000 para ver a aplicação funcionando!

6. Testes - Benchmarking 

Para execução dos testes feitos para verificação do benchmarking utilizados para a comparação com a versão REST, basta verificar a documentação presente em [Execução - Benchmarking](https://github.com/Oleari19/pspd-extraclasse1/blob/grpc/tst/README_perf_bench.txt).

## Equipe

Os nomes dos integrantes da equipe podem ser encontrados na tabela 1.

<div align="center">
<font size="3"><p style="text-align: center"><b>Tabela 1:</b> Integrantes da equipe</p></font>

<table>
  <tr>
    <td align="center"><a href="http://github.com/julia-fortunato"><img style="border-radius: 50%;" src="http://github.com/julia-fortunato.png" width="100px;" alt=""/><br /><sub><b>Júlia Fortunato</b></sub></a><br/><a href="Link git" title="Rocketseat"></a></td>
    <td align="center"><a href="http://github.com/Oleari19"><img style="border-radius: 50%;" src="http://github.com/Oleari19.png" width="100px;" alt=""/><br><sub><b>Maria Clara Oleari</b></sub></a><br/>
    <td align="center"><a href="https://github.com/MarcoTulioSoares"><img style="border-radius: 50%;" src="http://github.com/MarcoTulioSoares.png" width="100px;" alt=""/><br /><sub><b>Marco Tulio Soares</b></sub></a><br/><a href="Link git" title="Rocketseat"></a></td>
    <td align="center"><a href="https://github.com/mauricio-araujoo"><img style="border-radius: 50%;" src="https://github.com/mauricio-araujoo.png" width="100px;" alt=""/><br/><sub><b>Maurício Ferreira</b></sub></a><br/>

  </tr>
</table>

<font size="3"><p style="text-align: center"><b>Autor:</b> <a href="https://github.com/julia-fortunato">Júlia Fortunato</a>, 2025</p></font>

</div>

