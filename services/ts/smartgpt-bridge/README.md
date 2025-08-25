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
# Dashboard now served via `pnpm serve:sites`:
#   http://localhost:4500/smartgpt-dashboard/
```

## API Versions

- `/v0/*`: legacy endpoints (migrated from root). Backwards-compatible behavior but now under a `v0` prefix.
- `/v1/*`: consolidated endpoints with enriched contracts and RBAC preHandlers.

Both versions now support a single-token flow: you can pass your API key as a bearer token and it will authorize + satisfy RBAC.

## Auth (single-token)

- Disabled by default. Enable protection with env vars. One token is enough:
    - Use `Authorization: Bearer <user.apiKey>` for simplest flow, or
    - Use a JWT via the settings below.

Quick start (static bearer token):

```bash
export AUTH_ENABLED=true
export AUTH_MODE=static
export AUTH_TOKENS=supersecret1,supersecret2   # comma-separated
```

Then call APIs with `Authorization: Bearer supersecret1` or set a cookie `smartgpt_auth=supersecret1`.
You can also use `Authorization: Bearer <user.apiKey>` to authenticate with your stored user.

JWT (HS256/JWKS) verification:

```bash
export AUTH_ENABLED=true
export AUTH_MODE=jwt
export AUTH_JWT_SECRET=replace-with-hs256-secret
# Optional claims to enforce
export AUTH_JWT_ISSUER=https://issuer.example
export AUTH_JWT_AUDIENCE=promethean-smartgpt-bridge
```

Notes:

- `/openapi.json` is always accessible. `/auth/me` requires a valid token when auth is enabled.
- For full OIDC with JWKS, terminate at your identity proxy (e.g., oauth2-proxy) and forward an ID/JWT token; the bridge will validate it as a bearer.
- RBAC on `/v1/*` uses user roles. When using JWTs, include a `roles` array in the payload if you want RBAC to succeed without an API key.
- The authorization layer reads the active OpenAPI `securitySchemes` to discover header names (e.g., `apiKey` in header). If the spec defines an apiKey in header, that header is accepted as the credential source in addition to `Authorization: Bearer ...` and cookies.

## Key endpoints (v0)

- `POST /v0/reindex` — full Chroma index
- `POST /v0/files/reindex` — subset index by glob(s)
- `GET  /v0/indexer/status` — queue mode, progress, bootstrap cursor
- `POST /v0/indexer/reset` — reset saved state and restart bootstrap (when idle)
- `POST /v0/search` — semantic search
- `POST /v0/grep` — regex search
- `GET  /v0/files/view?path=<rel-or-fuzzy>&line=123&context=25`
- `POST /v0/stacktrace/locate` — parse stack trace → snippets
- `POST /v0/symbols/index` — build TS/JS symbol index
- `POST /v0/symbols/find` — symbol lookup
- `POST /v0/agent/start` — start codex with super-prompt
- `GET  /v0/agent/stream?id=…` — live SSE logs
- `GET  /v0/agent/status?id=…`, `GET /v0/agent/logs?id=…&since=0`
- `POST /v0/agent/send`, `/v0/agent/interrupt`, `/v0/agent/kill`, `/v0/agent/resume`

### Agent API (for AI)

Use these endpoints to launch and supervise Codex CLI tasks. Prefer sandboxing when running with approvals bypass.

- `POST /v0/agent/start`
    - Purpose: Start a new Codex process under the PTY-based AgentSupervisor.
    - Request fields:
        - `prompt` string: The Codex command/prompt to execute.
        - `bypassApprovals` boolean (default false): Run with `--dangerously-bypass-approvals`.
        - `sandbox` enum [false, "nsjail"] (default false): Kernel-level isolation using `sandbox.cfg` when set to `"nsjail"`.
        - `tty` boolean (default true): Run under a pseudo-terminal (PTY).
        - `env` object: Extra environment variables.
    - Examples:

        ```bash
        # Simple run
        curl -sX POST localhost:3210/v0/agent/start \
          -H 'content-type: application/json' \
          -H 'authorization: Bearer <user.apiKey>' \
          -d '{
            "prompt": "ls -la"
          }'

        # Codex bypass mode, sandboxed in nsjail
        curl -sX POST localhost:3210/v0/agent/start \
          -H 'content-type: application/json' \
          -H 'authorization: Bearer <user.apiKey>' \
          -d '{
            "prompt": "npm run build",
            "bypassApprovals": true,
            "sandbox": "nsjail"
          }'
        ```

    - Response (success):
        ```json
        {
            "ok": true,
            "id": "agent_nX9z...",
            "prompt": "npm run build",
            "startedAt": 1724201823456,
            "sandbox": "nsjail",
            "bypassApprovals": true,
            "logfile": ".logs/agent_nX9z.log"
        }
        ```

- `GET /v0/agent/status?id=…` or `/v0/agent/status/{id}`
    - Purpose: Inspect agent metadata.
    - Returns: prompt, startedAt, exited flag, sandbox mode, bypass flag, logfile.
    - Example:
        ```bash
        curl -s -H 'authorization: Bearer <user.apiKey>' localhost:3210/v0/agent/status/agent_nX9z...
        ```

- `GET /v0/agent/stream?id=…`
    - Purpose: Live log stream via Server-Sent Events (SSE).
    - Emits an initial `replay` event with recent buffer, then `data` events as the process writes output.
    - Example:
        ```bash
        curl -N -H 'authorization: Bearer <user.apiKey>' 'localhost:3210/v0/agent/stream?id=agent_nX9z...'
        ```

- `GET /v0/agent/logs?id=…&bytes=8192` and `GET /v0/agent/tail?id=…&bytes=8192`
    - Purpose: Fetch last N bytes of the log buffer.

- `POST /v0/agent/send`
    - Purpose: Write a line to the PTY (appends newline).
    - Example:
        ```bash
        curl -sX POST localhost:3210/v0/agent/send \
          -H 'content-type: application/json' \
          -H 'authorization: Bearer <user.apiKey>' \
          -d '{"id":"agent_nX9z...","input":"y"}'
        ```

- `POST /v0/agent/interrupt`
    - Purpose: Emulate Ctrl-C (sends `\u0003` to PTY).

- `POST /v0/agent/kill`
    - Purpose: Terminate the agent process.

Security notes for AI

- Only set `bypassApprovals: true` when `sandbox: "nsjail"` is available.
- The jail runs under `/sandbox` with resource limits (see `sandbox.cfg`).
- If `nsjail` is not present, run with sandbox=false and approvals enabled (default).

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

## Logging

Configure structured logging via environment variables:

- `LOG_LEVEL`: one of `error`, `warn`, `info` (default), `debug`, `trace`.
- `LOG_JSON`: set to `true` to emit JSON lines.
- `LOG_FILE`: path to append logs (optional). When set, logs are written to both file and console.

Security auditing

- All unauthorized attempts are always logged at an audit level, regardless of `LOG_LEVEL`.
- Entries include timestamp, method, path, IP (`req.ip` and `x-forwarded-for`), user-agent, mode, and the exact rejection reason when available.
- RBAC rejections (403) are also audited with user/roles, action, and resource.

Examples

```bash
export LOG_LEVEL=debug
export LOG_JSON=true
export LOG_FILE=./logs/bridge.log
```

## Dashboard

Use the dashboard at `http://localhost:4500/smartgpt-dashboard/` to:

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
