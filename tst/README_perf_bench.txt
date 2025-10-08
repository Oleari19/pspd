# Arquivo perf_bench.py

Objetivo: medir o tempo de resposta dos endpoints gRPC expostos via HTTP (gateway) e gerar
relatórios `.xlsx` com as execuções de cada endpoint e um resumo consolidado com médias, percentis e status.

## Como rodar

Criar ambiente virtual e instalar dependências
```bash
python -m venv .venv
source .venv/bin/activate
pip install requests pandas openpyxl
```

Executar o apontando para o **webserver**.  
```bash
python perf_bench.py --base http://192.168.49.2:32755
```

### Flags úteis
| Flag | Descrição | Exemplo |
|------|------------|---------|
| `--iters` | Número de execuções medidas por endpoint | `--iters 10` |
| `--warmup` | Requisições de aquecimento (não entram no .xlsx) | `--warmup 2` |
| `--timeout` | Tempo limite por request (segundos) | `--timeout 5` |
| `--outdir` | Pasta de saída dos arquivos | `--outdir perf_out` |

### Saídas geradas
Após rodar, será criada a pasta definida em `--outdir` (por padrão `perf_out/`), contendo:

**1 arquivo por endpoint** (com 10 execuções cada):  
```
perf_out/GET_grpc_quiz_runs.xlsx
perf_out/POST_grpc_user_runs.xlsx
perf_out/POST_grpc_login_runs.xlsx
perf_out/GET_grpc_ranking_runs.xlsx
perf_out/POST_grpc_quiz_runs.xlsx
```

**1 arquivo de resumo consolidado**:
```
perf_out/perf_summary.xlsx
```

> Esse arquivo mostra as **médias, p95/p99 e o tempo médio geral** entre todos os endpoints testados.

## Payloads usados

### POST /grpc/user
Cria um usuário com login único (`bench_<sufixo>`).  
Pode customizar via variáveis de ambiente:
```
BENCH_LOGIN=meuuser
BENCH_SENHA=123456
BENCH_NOME=teste
```

### POST /grpc/login
Precisa de credenciais válidas já existentes no sistema.
```
LOGIN_LOGINREQ=benchuser
LOGIN_SENHAREQ=123456
```

### POST /grpc/quiz
Cria uma pergunta simples (id=0, 4 alternativas).

### Autenticação (opcional)
Se seu gateway exigir token Bearer:
```
export AUTH_TOKEN="seu_token_aqui"
```

## Exemplo completo de execução
```bash
export BASE_URL=http://192.168.49.2:32755
export LOGIN_LOGINREQ=benchuser
export LOGIN_SENHAREQ=123456

python perf_bench.py --iters 10 --warmup 2
```

Após a execução:
- Todos os arquivos `.xlsx` estarão dentro de `perf_out/`
- O terminal exibirá o caminho completo de saída (ex.: `✔ Per-endpoint Excel files and summary saved to: perf_out`)


## Entendendo o relatório (`perf_summary.xlsx`)

| Coluna | Significado |
|--------|--------------|
| **endpoint** | Rota testada (ex.: `POST /grpc/user`) |
| **avg_ms** | Média do tempo de resposta (em milissegundos) |
| **p95_ms / p99_ms** | Percentis 95 e 99 — tempos abaixo dos quais 95% e 99% das requisições completaram |
| **ok_percent** | Percentual de requisições bem-sucedidas (`HTTP 2xx`) |
| **last_status** | Último status HTTP observado (geralmente `200`) |
| **iters** | Número de execuções medidas (ex.: 10) |
| **warmup** | Número de requisições descartadas de aquecimento (ex.: 2) |
| **base** | URL base do servidor testado |

> O script também calcula a **média global de tempo (overall_avg_ms)** entre todos os endpoints — disponível na aba `overall` do arquivo `perf_summary.xlsx`.
