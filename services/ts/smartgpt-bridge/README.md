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
export INDEXER_FILE_DELAY_MS=250                  # delay between file index ops

# Agent supervisor
export CODEX_BIN=codex
export CODEX_ARGS="--auto --json"
export AGENT_MAX_LOG_BYTES=524288
export AGENT_SHELL=false
# Agent persistence
export AGENT_STATE_DIR=./logs/agents           # optional; default under service logs/agents
export AGENT_RESTORE_ON_START=true             # load past agents as historical entries
# export AGENT_AUTORESTART=false               # future: disabled by default
```

## Run
```bash
npm i
npm start
# http://0.0.0.0:3210/openapi.json
# http://0.0.0.0:3210/dashboard    # built-in dashboard
```

## Auth (OAuth/JWT)
- Disabled by default. Enable protection with env vars.

Quick start (static bearer token):
```bash
export AUTH_ENABLED=true
export AUTH_MODE=static
export AUTH_TOKENS=supersecret1,supersecret2   # comma-separated
```
Then call APIs with `Authorization: Bearer supersecret1` or set a cookie `smartgpt_auth=supersecret1`.

JWT (HS256) verification:
```bash
export AUTH_ENABLED=true
export AUTH_MODE=jwt
export AUTH_JWT_SECRET=replace-with-hs256-secret
# Optional claims to enforce
export AUTH_JWT_ISSUER=https://issuer.example
export AUTH_JWT_AUDIENCE=promethean-smartgpt-bridge
```

Notes:
- `/openapi.json` and `/auth/me` are always accessible; all other routes are protected when auth is enabled.
- For full OIDC with JWKS, terminate at your identity proxy (e.g., oauth2-proxy) and forward an ID/JWT token; the bridge will validate it as a bearer.

## Key endpoints
- `POST /reindex` — full Chroma index
- `POST /files/reindex` — subset index by glob(s)
- `GET  /indexer/status` — queue mode, progress, bootstrap cursor
- `POST /indexer/reset` — reset saved state and restart bootstrap (when idle)
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

### PTY Agent (node-pty)
- `POST /pty/start` — start codex in a real PTY (cols/rows optional)
- `GET  /pty/stream?id=…` — live SSE logs
- `GET  /pty/status?id=…`, `GET /pty/logs?id=…&since=0`, `GET /pty/tail?id=…&bytes=8192`
- `POST /pty/send` — write line (appends CR)
- `POST /pty/write` — raw write (no newline)
- `POST /pty/resize` — change PTY size `{ id, cols, rows }`
- `POST /pty/interrupt`, `/pty/kill`, `/pty/resume`

node-pty is lazy‑loaded; install when needed:
```bash
pnpm add node-pty
```

## Dashboard

Visit `/dashboard` for a lightweight UI to:
- Monitor indexer status and trigger re-indexing
- Run semantic search and view snippet context
- Start agents and stream logs (SSE when auth disabled; polling when enabled)

If auth is enabled, paste a bearer token in the token box and Save. The UI stores it in `localStorage` for API calls and also writes a cookie (name from `/auth/me`, default `smartgpt_auth`) so SSE streams authorize without custom headers.

## Persistence

- The bridge persists minimal agent metadata and logs under `AGENT_STATE_DIR` (default: `logs/agents`).
- On startup, it restores past agents as historical entries (marked exited) so lists and logs remain visible across restarts.
- Autorestart is not enabled; processes are not resurrected automatically (by design). We can add it as an opt-in if needed.

### Indexer bootstrap + incremental cursor

- On first launch, the service enters "bootstrap" mode and enumerates files once.
- Progress is saved to `logs/indexer/<ROOT_PATH_SAFE>/bootstrap.json` so restarts resume from the last processed file.
- While bootstrapping, status includes `{ bootstrap: { total, cursor, remaining } }`.
- After finishing, it switches to `indexed` mode and, on subsequent starts, performs an incremental scan to enqueue only new/changed files and purge removed files.
- To force a full rebuild, delete the corresponding `bootstrap.json` and restart.

## Funnel for Custom GPT
```bash
sudo tailscale funnel 3210
# Import: https://<your>.ts.net/openapi.json
```
