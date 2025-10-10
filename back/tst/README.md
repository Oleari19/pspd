# Arquivo `perf_bench_rest.py`

**Objetivo:** medir o tempo de resposta dos **endpoints REST** expostos pelo gateway e gerar relatórios **.xlsx** (um por endpoint) e um **resumo consolidado** com médias, percentis e status.  

## Como rodar

### 1) Criar ambiente virtual e instalar dependências
```bash
python -m venv .venv
source .venv/bin/activate
pip install requests pandas openpyxl
```

### 2) Executar apontando para o **webserver** (gateway REST)
```bash
python perf_bench_rest.py
```

Sem argumentos o script tenta resolver a URL base nesta ordem:
1. Variavel `BASE_URL`
2. Variavel `MINIKUBE_SERVICE_URL`
3. Saida de `minikube service <service> --url` (servico padrao `gateway-p-rest-service`)
4. Combinacao das variaveis `MINIKUBE_IP` e `MINIKUBE_PORT`
5. Fallback `http://localhost:8080`

> Para forcar outro destino, defina uma das variaveis acima ou passe `--base <url>`.
## Flags úteis

| Flag       | Descrição                                       | Exemplo                 |
|------------|--------------------------------------------------|-------------------------|
| `--iters`  | Número de execuções medidas por endpoint         | `--iters 10`            |
| `--warmup` | Requisições de aquecimento (não entram no .xlsx) | `--warmup 2`            |
| `--timeout`| Tempo limite por request (segundos)              | `--timeout 5`           |
| `--outdir` | Pasta de saída dos arquivos                      | `--outdir perf_out_rest`|


## Saídas geradas

Após rodar, será criada a pasta definida em `--outdir` (por padrão **`perf_out_rest/`**), contendo:

**1 arquivo por endpoint (exemplos):**
```
perf_out_rest/GET_api_quiz_summary_runs.xlsx
perf_out_rest/GET_api_usuario_runs.xlsx
perf_out_rest/POST_api_usuario_runs.xlsx
perf_out_rest/GET_api_pergunta_runs.xlsx
perf_out_rest/POST_api_pergunta_runs.xlsx
```

**1 arquivo de resumo consolidado (e CSV):**
```
perf_out_rest/perf_summary_rest.xlsx
perf_out_rest/perf_summary_rest.csv
```

> O resumo mostra as **médias, p95/p99 e o tempo médio geral** entre todos os endpoints testados.

## Payloads usados

### `POST /api/usuario`
Cria um usuário com login único (ex.: `bench_<sufixo>`). Pode customizar via variáveis de ambiente:
```bash
export BENCH_LOGIN=benchuser
export BENCH_SENHA=123456
export BENCH_NOME="bench user"
```

### `POST /api/login`
Precisa de credenciais válidas já existentes no sistema:
```bash
export LOGIN_LOGINREQ=benchuser
export LOGIN_SENHAREQ=123456
```

### `POST /api/pergunta`
Cria uma pergunta simples alinhada ao `PerguntaDTO` do Spring Boot:

Exemplo de payload enviado pelo bench:
```
{
  "pergunta": "pergunta bench",
  "q1": "a",
  "q2": "b",
  "q3": "c",
  "q4": "d",
  "explicacao": "bench",
  "indiceResposta": 0
}
```

### Autenticação (opcional)
Se o gateway exigir token Bearer:
```bash
export AUTH_TOKEN="seu_token_aqui"
```

## Exemplo completo de execução

```bash
export BASE_URL=http://192.168.49.2:31560
export LOGIN_LOGINREQ=benchuser
export LOGIN_SENHAREQ=123456

python perf_bench_rest.py --base "$BASE_URL" --iters 10 --warmup 2
```

Após a execução:
- Todos os arquivos `.xlsx` (e o `.csv` de resumo) estarão dentro de **`perf_out_rest/`**;
- O terminal exibirá o caminho completo de saída (ex.: `✔ Per-endpoint Excel files and summary saved to: perf_out_rest`).


## Entendendo o relatório (`perf_summary_rest.xlsx`)

| Coluna           | Significado                                                                 |
|------------------|------------------------------------------------------------------------------|
| **endpoint**     | Rota testada (ex.: `POST /api/usuario`)                                      |
| **avg_ms**       | Média do tempo de resposta (em milissegundos)                                |
| **p95_ms/p99_ms**| Percentis 95 e 99 — tempos abaixo dos quais 95% e 99% das reqs completaram   |
| **ok_percent**   | Percentual de requisições bem-sucedidas (HTTP 2xx)                           |
| **last_status**  | Último status HTTP observado (geralmente 200)                                |
| **iters**        | Número de execuções medidas (ex.: 10)                                         |
| **warmup**       | Número de requisições descartadas de aquecimento (ex.: 2)                     |
| **base**         | URL base do servidor testado                                                  |

> O script também calcula a **média global de tempo (`overall_avg_ms`)** entre todos os endpoints — disponível na aba `overall` do arquivo **`perf_summary_rest.xlsx`**.
