#include <iostream>
#include <string>
#include <memory>
#include <string>
#include <grpcpp/grpcpp.h>
#include "user.grpc.pb.h"

using grpc::Channel;
using grpc::ClientContext;
using grpc::Status;
using user::User;
using user::CreateUserRequest;
using user::CreateUserResponse;
using user::Usuario;
using user::ScoreRequest;
using user::ScoreResponse;
using user::LoginRequest;
using user::LoginResponse;

class UserClient {
public:
    // O construtor cria o stub a partir do canal de comunicação.
    UserClient(std::shared_ptr<Channel> channel)
        : stub_(User::NewStub(channel)) {}

    // Monta e envia a requisição RPC.
    std::string CreateUsers() {
        // 1. Prepara a requisição.
        CreateUserRequest request;
        
        // Adiciona o primeiro usuário à lista "repeated".
        Usuario* user = request.mutable_usuario();
        user->set_nome("Alice");
        user->set_login("alice_dev3");
        user->set_senha("senha123");
        user->set_score(100);
        
        // 2. Prepara os objetos de contexto e resposta.
        CreateUserResponse response;
        ClientContext context;

        // 3. Executa a chamada RPC.
        std::cout << "Enviando requisição para criar 2 usuários..." << std::endl;
        Status status = stub_->CreateUsuario(&context, request, &response);

        // 4. Processa o resultado.
        if (status.ok()) {
            std::cout << "RPC bem-sucedido!" << std::endl;
            return response.remembertokenres();
        } else {
            std::cout << "RPC falhou. Código de erro: " << status.error_code()
                      << ", Mensagem: " << status.error_message() << std::endl;
            return "Falha na chamada RPC";
        }
    }

    void UpdateScore(int newScore, std::string remembertoken) {
        ScoreRequest request;
        request.set_scorenew(newScore);
        request.set_remembertok(remembertoken);

        ScoreResponse response;
        ClientContext context;

        Status status = stub_->UpdateScore(&context, request, &response);

        if (status.ok()) {
            std::cout << "Score atualizado com sucesso!" << std::endl;
        } else {
            std::cerr << "Falha ao atualizar score. Código: "
                      << status.error_code()
                      << ", Mensagem: " << status.error_message()
                      << std::endl;
        }
    }

    void Login(std::string user, std::string senha){
        LoginRequest request;

        request.set_loginreq(user);
        request.set_senhareq(senha);
        LoginResponse response;
        ClientContext context;

        Status status = stub_->Login(&context, request, &response);
        
        if (status.ok()) {  
            std::cout << "logado! token = "<< response.tokenrem() << std::endl;
        } else {
            std::cerr << "Falha ao logar"<< std::endl;
        }

    }

private:
    std::unique_ptr<User::Stub> stub_;
};

int main(int argc, char** argv) {
    // Endereço do servidor. Deve ser o mesmo usado no `server.cpp`.
    std::string server_address("localhost:50051");
    
    // Cria um canal de comunicação inseguro (sem SSL/TLS).
    auto channel = grpc::CreateChannel(server_address, grpc::InsecureChannelCredentials());
    
    // Cria o cliente.
    UserClient client(channel);
 /*   
    // Chama o método RPC e obtém a resposta.
    std::string response_token = client.CreateUsers();

    std::cout << "\n--- Resultado ---" << std::endl;
    std::cout << "Token recebido do servidor: " << response_token << std::endl;
    client.UpdateScore(10,response_token);
*/
    client.Login("alice_dev","senha123");
    return 0;
}