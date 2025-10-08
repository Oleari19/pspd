INSERT INTO TB_USUARIO (EMAIL, SENHA, PONTUACAO)
SELECT 'demo@pspd.local', '123456', 0
WHERE NOT EXISTS (
    SELECT 1 FROM TB_USUARIO WHERE EMAIL = 'demo@pspd.local'
);

-- Visão Geral de Clusters
INSERT INTO TB_PERGUNTA (PERGUNTA, Q1, Q2, Q3, Q4, EXPLICACAO, INDICE_RESPOSTA)
SELECT 'Qual é o principal objetivo de se utilizar um cluster de computadores?',
       'Reduzir o consumo de energia elétrica', 
       'Aumentar a disponibilidade e o desempenho por meio de múltiplas máquinas', 
       'Simplificar a manutenção física dos servidores', 
       'Substituir o balanceamento de carga',
       'Clusters aumentam o desempenho e a disponibilidade ao distribuir tarefas entre várias máquinas interconectadas.',
       2
WHERE NOT EXISTS (
    SELECT 1 FROM TB_PERGUNTA WHERE PERGUNTA = 'Qual é o principal objetivo de se utilizar um cluster de computadores?'
);

-- Message Brokers (RabbitMQ)
INSERT INTO TB_PERGUNTA (PERGUNTA, Q1, Q2, Q3, Q4, EXPLICACAO, INDICE_RESPOSTA)
SELECT 'Qual é a função principal de um Message Broker como o RabbitMQ?',
       'Gerar logs de aplicações em tempo real', 
       'Transmitir mensagens diretamente entre dois clientes via sockets', 
       'Intermediar a comunicação assíncrona entre produtores e consumidores', 
       'Armazenar dados em um banco relacional',
       'O RabbitMQ atua como intermediário de mensagens, desacoplando produtores e consumidores de forma assíncrona.',
       3
WHERE NOT EXISTS (
    SELECT 1 FROM TB_PERGUNTA WHERE PERGUNTA = 'Qual é a função principal de um Message Broker como o RabbitMQ?'
);

-- Apache Kafka
INSERT INTO TB_PERGUNTA (PERGUNTA, Q1, Q2, Q3, Q4, EXPLICACAO, INDICE_RESPOSTA)
SELECT 'O que melhor descreve o Apache Kafka?',
       'Um banco de dados relacional voltado a consultas OLAP', 
       'Um sistema de mensageria leve para pequenos volumes de dados', 
       'Uma plataforma distribuída de streaming de eventos com alto throughput', 
       'Um servidor de aplicações Java para microserviços',
       'O Kafka é uma plataforma distribuída para streaming de eventos em larga escala, com alta performance e tolerância a falhas.',
       3
WHERE NOT EXISTS (
    SELECT 1 FROM TB_PERGUNTA WHERE PERGUNTA = 'O que melhor descreve o Apache Kafka?'
);

-- gRPC
INSERT INTO TB_PERGUNTA (PERGUNTA, Q1, Q2, Q3, Q4, EXPLICACAO, INDICE_RESPOSTA)
SELECT 'Qual característica diferencia o gRPC de outras formas de comunicação entre serviços?',
       'Usa JSON como formato padrão de mensagem', 
       'Usa HTTP/2 e Protocol Buffers para comunicação binária eficiente', 
       'Depende exclusivamente de chamadas RESTful com GET e POST', 
       'Não suporta streaming de dados',
       'O gRPC usa HTTP/2 e Protocol Buffers (Protobuf) para comunicação binária de alta performance e suporta streaming bidirecional.',
       2
WHERE NOT EXISTS (
    SELECT 1 FROM TB_PERGUNTA WHERE PERGUNTA = 'Qual característica diferencia o gRPC de outras formas de comunicação entre serviços?'
);

-- Paralelismo e Distribuição
INSERT INTO TB_PERGUNTA (PERGUNTA, Q1, Q2, Q3, Q4, EXPLICACAO, INDICE_RESPOSTA)
SELECT 'Qual é a principal diferença entre paralelismo e distribuição?',
       'No paralelismo há apenas um processador', 
       'Paralelismo ocorre em uma máquina; distribuição em várias máquinas conectadas', 
       'São sinônimos', 
       'Distribuição é sempre mais rápida que paralelismo',
       'Paralelismo ocorre dentro de uma máquina multiprocessada, enquanto distribuição envolve múltiplos computadores conectados.',
       2
WHERE NOT EXISTS (
    SELECT 1 FROM TB_PERGUNTA WHERE PERGUNTA = 'Qual é a principal diferença entre paralelismo e distribuição?'
);

