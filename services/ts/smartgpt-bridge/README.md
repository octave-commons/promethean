# Promethean SmartGPT Bridge — Full

One service, one `/openapi.json`, many powers:

- 🔎 Chroma semantic search using your **RemoteEmbeddingFunction** (broker-driven)
- 📄 File view by path+line, stack-trace → file/line resolution
- 🧵 Regex grep across the repo
- 🧠 TypeScript/JS symbol index + search
- 🕹️ Background **codex** agent supervisor (start/stream/status/send/interrupt/kill/resume)
- ✅ Tailscale Funnel friendly

## Env
```bash
export ROOT_PATH=/home/err/devel/promethean           # repo/docs root
export AGENT_NAME=Duck                                 # used for collection family prefix
# Embeddings via Promethean broker
export BROKER_URL=ws://localhost:7000
export EMBEDDING_DRIVER=ollama
export EMBEDDING_FUNCTION=nomic-embed-text
export EMBED_DIMS=768
# Chroma collection scoping
export COLLECTION_FAMILY=repo_files
export EMBED_VERSION=dev
# File scanning
export EXCLUDE_GLOBS="**/node_modules/**,**/.git/**,**/dist/**,**/build/**,**/.obsidian/**,**/.smart_env/**,**/.pnpm/**,**/.cache/**,**/coverage/**"

# Agent supervisor
export CODEX_BIN=codex
export CODEX_ARGS="--auto --json"
export AGENT_MAX_LOG_BYTES=524288
export AGENT_SHELL=false
```

## Run
```bash
npm i
npm start
# http://0.0.0.0:3210/openapi.json
```

## Key endpoints
- `POST /reindex` — full Chroma index
- `POST /files/reindex` — subset index by glob(s)
- `POST /search` — semantic search
- `POST /grep` — regex search
- `GET  /files/view?path=<rel-or-fuzzy>&line=123&context=25`
- `POST /stacktrace/locate` — parse stack trace → snippets
- `POST /symbols/index` — build TS/JS symbol index
- `POST /symbols/find` — symbol lookup
- `POST /agent/start` — start codex with super-prompt
- `GET  /agent/stream?id=…` — live SSE logs
- `GET  /agent/status?id=…`, `GET /agent/logs?id=…&since=0`
- `POST /agent/send`, `/agent/interrupt`, `/agent/kill`, `/agent/resume`

## Funnel for Custom GPT
```bash
sudo tailscale funnel 3210
# Import: https://<your>.ts.net/openapi.json
```

