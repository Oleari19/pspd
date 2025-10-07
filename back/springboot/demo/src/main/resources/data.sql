INSERT INTO TB_USUARIO (EMAIL, SENHA, PONTUACAO)
SELECT 'demo@pspd.local', '123456', 0
WHERE NOT EXISTS (
    SELECT 1 FROM TB_USUARIO WHERE EMAIL = 'demo@pspd.local'
);

INSERT INTO TB_PERGUNTA (PERGUNTA, Q1, Q2, Q3, Q4, EXPLICACAO, INDICE_RESPOSTA)
SELECT 'Qual linguagem e usada para desenvolver este backend?',
       'Java', 'Python', 'Go', 'Ruby',
       'O projeto usa Spring Boot, logo a linguagem e Java.',
       1
WHERE NOT EXISTS (
    SELECT 1 FROM TB_PERGUNTA WHERE PERGUNTA = 'Qual linguagem e usada para desenvolver este backend?'
);

INSERT INTO TB_PERGUNTA (PERGUNTA, Q1, Q2, Q3, Q4, EXPLICACAO, INDICE_RESPOSTA)
SELECT 'Qual banco de dados esta empacotado no docker-compose?',
       'PostgreSQL', 'MySQL', 'MongoDB', 'SQLite',
       'O docker-compose agora utiliza a imagem oficial do PostgreSQL.',
       1
WHERE NOT EXISTS (
    SELECT 1 FROM TB_PERGUNTA WHERE PERGUNTA = 'Qual banco de dados esta empacotado no docker-compose?'
);
