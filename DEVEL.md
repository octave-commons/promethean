# Open Hax OpenAI Proxy

OpenAI-compatible proxy server with provider-scoped account rotation.

## Features

- `POST /v1/chat/completions` compatibility endpoint.
- Multi-provider routing through one OpenAI-compatible endpoint.
- Model-aware upstream routing for Claude models: `claude-*` can be sent to upstream `POST /v1/messages` and converted back into chat-completions format.
- Model-aware upstream routing: `gpt-*` models are sent to upstream `POST /v1/responses` and converted back into chat-completions format.
- Preserves reasoning traces when translating Responses/Messages payloads by mapping them to OpenAI-compatible `reasoning_content` in non-stream and synthetic stream responses.
- Maps OpenAI-style reasoning controls (`reasoning_effort` / `reasoning.effort`) into Claude `thinking` payloads and adds the interleaved-thinking beta header when enabled.
- Model-aware routing to OpenAI provider: models prefixed with `openai/` or `openai:` route to configured OpenAI endpoints.
- Model-aware routing to Ollama base API: models prefixed with `ollama/` or `ollama:` are sent to Ollama `POST /api/chat`.
- Built-in React/Vite console with a usage dashboard plus Chat, Credentials, and Tools/MCP pages.
- OpenAI OAuth browser + device flows based on OpenCode Codex plugin behavior (PKCE, state, callback exchange, account extraction).
- Chroma-backed semantic history search with lexical fallback for chat session recall.
- `GET /v1/models` and `GET /v1/models/:id` model listing.
- `GET /v1/models` merges static models with live Ollama/Ollama Cloud catalogs when configured.
- Auto-aliases tagged Ollama families to the largest variant (for example `qwen3.5` -> `qwen3.5:397b`).
- Provider-scoped account rotation when upstream returns rate limits (`429`, plus `403/503` with `retry-after`).
- Cross-provider fallback for shared models (for example `vivgrid` <-> `ollama-cloud`) when one provider's keys or upstream path fails.
- Flexible `keys.json` supports both API-key and OAuth bearer accounts, with multiple accounts per provider.

## Setup

1. Provide credentials through `keys.json`, `PROXY_KEYS_JSON` / `UPSTREAM_KEYS_JSON`, or SQL via `DATABASE_URL`.
2. Optionally create `models.json` from `models.example.json` (preferences only; discovery is canonical).
3. Set `PROXY_AUTH_TOKEN` (required by default).
4. Start the server.

```bash
pnpm --filter @workspace/open-hax-openai-proxy dev
```

Build and run production mode:

```bash
pnpm --filter @workspace/open-hax-openai-proxy build
pnpm --filter @workspace/open-hax-openai-proxy start
```

Run the web console in dev mode:

```bash
pnpm --filter @workspace/open-hax-openai-proxy web:dev
```

Build the web console:

```bash
pnpm --filter @workspace/open-hax-openai-proxy web:build
```

## Docker Compose

The container stack now mirrors the host-side shared-context pattern: one container, `pm2-runtime` as PID 1, and two managed processes inside it:

- `open-hax-openai-proxy` for the API on `8789`
- `open-hax-openai-proxy-web` for the bundled web companion on `5174`

From the workspace root, manage the proxy through the root stack registry:

```bash
pnpm docker:stack status open-hax-openai-proxy
pnpm docker:stack use-container open-hax-openai-proxy -- --build
pnpm docker:stack use-host open-hax-openai-proxy
pnpm docker:stack ps open-hax-openai-proxy
pnpm docker:stack logs open-hax-openai-proxy -- -f
```

From `services/proxx`, the local compose workflow is now:

```bash
cd /home/err/devel/services/proxx
docker compose -f docker-compose.yml -f docker-compose.factory-auth.override.yml up --build -d
docker compose ps
docker compose logs -f
```

Notes:

- upstream credentials are still required for proxying, but they can come from SQL, inline JSON env, or `keys.json`.
- `data/` under `services/proxx` stays bind-mounted for request logs and session history.
- The compose stack now defaults `OLLAMA_BASE_URL` to `http://ollama:11434` when attached to the shared `ai-infra` network; `CHROMA_URL` still defaults to `host.docker.internal` unless you also containerize Chroma on a shared network.
- The web companion is exposed on `${PROXY_WEB_PORT:-5174}`.
- The checked-in host PM2 source now includes both the API and web companion in `ecosystems/services_open_hax_proxy.cljs`.
- The root stack registry now knows the related host PM2 apps, so plain container `up` is blocked while the host PM2 side is online.
- Use `use-container` and `use-host` to switch ownership cleanly between the host PM2 pair and the containerized pair.
- Omit `docker-compose.factory-auth.override.yml` when you do not need the Factory auth file mounts.

## Environment Variables

- `PROXY_HOST` (default: `127.0.0.1`)
- `PROXY_PORT` (default: `8789`; falls back to `PORT` for Render-style runtimes)
- `UPSTREAM_PROVIDER_ID` (default: `vivgrid`; provider key in `keys.json`)
- `UPSTREAM_FALLBACK_PROVIDER_IDS` (default: auto `ollama-cloud` when primary is `vivgrid`, or `vivgrid` when primary is `ollama-cloud`; comma-separated)
- `UPSTREAM_BASE_URL` (optional override; when unset or blank, the proxy derives it from `UPSTREAM_PROVIDER_ID` / `UPSTREAM_PROVIDER_BASE_URLS`)
- `UPSTREAM_PROVIDER_BASE_URLS` (optional mapping: `provider=url,provider=url`; defaults include `vivgrid=https://api.vivgrid.com`, `ollama-cloud=https://ollama.com`, `ob1=https://dashboard.openblocklabs.com/api`, `openrouter=https://openrouter.ai/api/v1`, and `requesty=https://router.requesty.ai/v1`)
- `OPENAI_PROVIDER_ID` (default: `openai`; provider key in `keys.json`)
- `OPENAI_BASE_URL` (default: `https://chatgpt.com/backend-api`)
- `OLLAMA_BASE_URL` (default: `http://127.0.0.1:11434`)
- `UPSTREAM_CHAT_COMPLETIONS_PATH` (default: `/v1/chat/completions`)
- `OPENAI_CHAT_COMPLETIONS_PATH` (default: `/v1/chat/completions`)
- `UPSTREAM_MESSAGES_PATH` (default: `/v1/messages`)
- `UPSTREAM_MESSAGES_MODEL_PREFIXES` (default: `claude-`; comma-separated prefixes)
- `UPSTREAM_MESSAGES_INTERLEAVED_THINKING_BETA` (default: `interleaved-thinking-2025-05-14`; set empty to disable auto `anthropic-beta` injection when thinking is enabled)
- `UPSTREAM_RESPONSES_PATH` (default: `/v1/responses`)
- `OPENAI_RESPONSES_PATH` (default: `/v1/responses`)
- `UPSTREAM_RESPONSES_MODEL_PREFIXES` (default: `gpt-`; comma-separated prefixes)
- `OPENAI_MODEL_PREFIXES` (default: `openai/,openai:`; comma-separated prefixes)
- `OLLAMA_CHAT_PATH` (default: `/api/chat`)
- `OLLAMA_MODEL_PREFIXES` (default: `ollama/,ollama:`; comma-separated prefixes)
- `PROXY_KEYS_FILE` (default: `./keys.json`, fallback: `VIVGRID_KEYS_FILE`)
- `PROXY_MODELS_FILE` (default: `./models.json`, fallback: `VIVGRID_MODELS_FILE`)
- `PROXY_REQUEST_LOGS_FILE` (default: `./data/request-logs.jsonl`)
- `PROXY_KEY_RELOAD_MS` (default: `5000`, fallback: `VIVGRID_KEY_RELOAD_MS`)
- `PROXY_KEY_COOLDOWN_MS` (default: `30000`, fallback: `VIVGRID_KEY_COOLDOWN_MS`)
- `UPSTREAM_REQUEST_TIMEOUT_MS` (default: `180000`)
- `PROXY_AUTH_TOKEN` (required unless `PROXY_ALLOW_UNAUTHENTICATED=true`)
- `PROXY_ALLOW_UNAUTHENTICATED` (default: `false`; use `true` only for local debugging)
- `PROXY_KEYS_JSON` / `UPSTREAM_KEYS_JSON` (optional inline JSON credential payload; useful on Render when not mounting `keys.json`)
- `DISABLED_PROVIDER_IDS` (optional comma-separated provider ids to remove from routing without deleting stored credentials)
- `CHROMA_URL` (optional; default: `http://127.0.0.1:8000`)
- `CHROMA_COLLECTION` (optional; default: `open_hax_proxy_sessions`)
- `CHROMA_EMBED_MODEL` (optional; default: `nomic-embed-text:latest`; served from Ollama)

## Chroma + Ollama

Semantic session search now registers an Ollama embedding function with the Chroma JS client instead of relying on Chroma's default embedder.

- Start Chroma separately at `CHROMA_URL`.
- Ensure Ollama is running at `OLLAMA_BASE_URL`.
- Pull an embedding model such as `nomic-embed-text:latest`.

```bash
ollama pull nomic-embed-text:latest
```

The proxy will use Ollama's `/api/embed` endpoint when available, and fall back to `/api/embeddings` for older Ollama builds.

## `keys.json` Format

```json
{
  "providers": {
    "vivgrid": [
      "vivgrid-key-1",
      "vivgrid-key-2"
    ],
    "ollama-cloud": [
      "ollama-key-1",
      "ollama-key-2"
    ],
    "openai": {
      "auth": "oauth_bearer",
      "accounts": [
        "oauth-access-token-1",
        "oauth-access-token-2"
      ]
    }
  }
}
```

`id` fields are optional. When omitted, the proxy auto-generates stable internal UUID account IDs per token.

Backward compatibility is preserved for legacy single-provider formats:

- `{"keys": ["legacy-key-1", "legacy-key-2"]}`
- `["legacy-key-1", "legacy-key-2"]`

Those legacy formats map to `UPSTREAM_PROVIDER_ID`.

## OpenAI OAuth Routing Through Chat-Completions

Route requests to OpenAI by prefixing model names:

- `"model": "openai/gpt-5"`
- `"model": "openai:gpt-5"`

The prefix is stripped before upstream dispatch, and accounts are selected from `keys.json.providers[OPENAI_PROVIDER_ID]`.

For migrated legacy OAuth accounts, the `openai` provider is treated as a ChatGPT Codex upstream, not the OpenAI Platform API. Those accounts require `chatgpt_account_id` metadata and are sent to `/codex/responses` by default.

## Ollama `num_ctx` Control Through OpenAI API

When you send requests through `POST /v1/chat/completions`, route to Ollama by prefixing the model:

- `"model": "ollama/llama3.2"`
- `"model": "ollama:llama3.2"`

Then set `num_ctx` through your OpenAI-style payload using either of these fields:

- `open_hax.ollama.num_ctx` (recommended)
- `num_ctx` (top-level alias)

Example:

```json
{
  "model": "ollama/llama3.2",
  "messages": [
    {
      "role": "user",
      "content": "Summarize this repository."
    }
  ],
  "open_hax": {
    "ollama": {
      "num_ctx": 32768
    }
  }
}
```

## Side-by-Side Rollout

- Keep VivGrid proxy on `8787` and run this proxy on `8789` for parallel validation.
- Reuse the same keys/models files initially, then split once traffic migrates.
- Compare status codes, SSE behavior, and tool-call payloads before cutover.

## Example Request

```bash
curl --request POST \
  --url http://127.0.0.1:8789/v1/chat/completions \
  --header 'Content-Type: application/json' \
  --data '{
    "model": "gemini-3.1-pro-preview",
    "messages": [
      {
        "role": "user",
        "content": "Say hello in English, Chinese and Japanese."
      }
    ],
    "stream": true
  }'
```
