# Open Hax OpenAI Proxy

OpenAI-compatible proxy server with provider-scoped account rotation.

DEVEL instructions live in `DEVEL.md`.

## Features

- `POST /v1/chat/completions` compatibility endpoint.
- Multi-provider routing through one OpenAI-compatible endpoint.
- Model-aware upstream routing for Claude models: `claude-*` can be sent to upstream `POST /v1/messages` and converted back into chat-completions format.
- Model-aware upstream routing: `gpt-*` models are sent to upstream `POST /v1/responses` and converted back into chat-completions format.
- Preserves reasoning traces when translating Responses/Messages payloads by mapping them to OpenAI-compatible `reasoning_content` in non-stream and synthetic stream responses.
- Maps OpenAI-style reasoning controls (`reasoning_effort` / `reasoning.effort`) into Claude `thinking` payloads: `none` disables thinking, `low|medium|high|xhigh` map to safe Claude budgets, and auto-routed plain `claude-*` traffic gets the same protection.
- Model-aware routing to OpenAI provider: models prefixed with `openai/` or `openai:` route to configured OpenAI endpoints.
- Global fast-mode toggle for Responses traffic: the proxy can inject `service_tier: "priority"` for GPT/Responses requests, with per-request overrides still respected.
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

## Standalone Setup

```bash
git clone https://github.com/open-hax/proxx.git
cd proxx
pnpm install
cp .env.example .env
cp keys.example.json keys.json
cp models.example.json models.json # optional preferences; discovery is canonical
```

Required setup:

- Put real provider credentials in one of: `keys.json`, `PROXY_KEYS_JSON` / `UPSTREAM_KEYS_JSON`, or the configured SQL store via `DATABASE_URL`
- Set `PROXY_AUTH_TOKEN` in `.env` unless you are only doing local unauthenticated debugging
- Adjust `UPSTREAM_*`, `OPENAI_*`, `OLLAMA_*`, optional `CHROMA_*`, and optional `OTEL_*` settings in `.env` for your environment
- If you enable OTEL export, set your own collector endpoint and auth headers through environment variables rather than hardcoding them in tracked files

Alternative credential sources:

- `PROXY_KEYS_JSON` / `UPSTREAM_KEYS_JSON` can carry the same JSON payload inline when you cannot rely on a mounted `keys.json` (for example Render)
- When `DATABASE_URL` is configured, SQL-backed credentials are also loaded and become the runtime source of truth for the proxy UI and request routing
- `DISABLED_PROVIDER_IDS` can remove providers such as `vivgrid` from live routing without deleting their stored credentials

## Shared-state federation v1

If you want several `proxx` instances to behave like one mirrored operator surface, point them at the same `DATABASE_URL`.

In this mode the shared SQL database becomes the control plane for:
- GitHub/UI operator login state and tenant membership
- tenant API keys and proxy settings
- provider credentials, including OpenAI OAuth accounts added through the UI
- dashboard / analytics usage data

That means:
- add an OpenAI OAuth account on one instance -> the other instances can pick it up from the same DB-backed credential store
- usage analytics aggregate across the fleet instead of fragmenting per instance

Current boundary:
- shared in v1: operator/admin state, tenant API keys and proxy settings, provider credentials including OAuth accounts, analytics
- still local for now: chat sessions, prompt affinity, and other convenience file state

Env-backed providers:

- `OPENROUTER_API_KEY` automatically exposes an `openrouter` provider route.
- `REQUESTY_API_TOKEN` (or `REQUESTY_API_KEY`) automatically exposes a `requesty` provider route.
- `GEMINI_API_KEY` automatically exposes a `gemini` provider route (native Gemini REST via `generateContent`).
- `ZAI_API_KEY` (or `ZHIPU_API_KEY`) automatically exposes a `zai` provider route (z.ai GLM chat via `https://api.z.ai/api/paas/v4`).
- `openrouter` and `requesty` default to OpenAI-compatible `/v1/chat/completions` routing.
- You can target them by setting `UPSTREAM_PROVIDER_ID=openrouter|requesty|gemini|zai`, or by listing them in `UPSTREAM_FALLBACK_PROVIDER_IDS`.

Additional provider ids:

- `ob1` is available as a standard provider id. Configure it in `keys.json` and target it with `UPSTREAM_PROVIDER_ID=ob1`.
- The default base URL for `ob1` is `https://dashboard.openblocklabs.com/api`.

## Run

Start the API server:

```bash
pnpm dev
```

Build and run production mode:

```bash
pnpm build
pnpm start
```

Run tests:

```bash
pnpm test
```

## Web Console

Run the web UI in dev mode:

```bash
pnpm web:dev
```

Build the web UI:

```bash
pnpm web:build
```

Preview the built UI:

```bash
pnpm web:preview
```

## Host fleet dashboard

The console now includes a **Hosts** page for the ussy fleet.

What it shows:
- per-host container inventory
- routed subdomains parsed from the runtime Caddyfile
- partial/unreachable host cards instead of failing the whole page when one host is broken

How it works:
- the local proxx container can read Docker state through an opt-in mounted Docker socket
- the local proxx container can read runtime files from an opt-in read-only runtime bind mount
- remote hosts are queried over HTTPS through each host's own `/api/ui/hosts/self` endpoint

Minimal env shape:

```bash
HOST_DASHBOARD_SELF_ID=ussy
HOST_DASHBOARD_TARGETS_JSON=[{"id":"ussy","label":"ussy.promethean.rest","baseUrl":"https://ussy.promethean.rest","authTokenEnv":"HOST_DASHBOARD_USSY_TOKEN"},{"id":"ussy3","label":"ussy3.promethean.rest","baseUrl":"https://ussy3.promethean.rest","authTokenEnv":"HOST_DASHBOARD_USSY3_TOKEN"}]
HOST_DASHBOARD_USSY_TOKEN=...
HOST_DASHBOARD_USSY3_TOKEN=...
```

Notes:
- remote targets need an explicit `authToken` or `authTokenEnv`; the dashboard does not forward `PROXY_AUTH_TOKEN` implicitly
- if a remote host is unreachable, misconfigured, or missing auth, it still renders as an error card so you can keep future hosts in the inventory before access is fixed
- local Docker/runtime introspection is opt-in via `docker-compose.host-dashboard.override.yml`

## Docker Compose

Container/runtime workflows now live in the workspace devops home:

```bash
cd /path/to/workspace/services/proxx
docker compose up --build -d
docker compose ps
docker compose logs -f
```

Or from the workspace root:

```bash
pnpm docker:stack status open-hax-openai-proxy
pnpm docker:stack use-container open-hax-openai-proxy -- --build
pnpm docker:stack logs open-hax-openai-proxy -- -f
```

Notes:

- credentials are required for upstream proxying, but they can come from `keys.json`, inline JSON env, provider-specific env vars, or SQL when `DATABASE_URL` is configured
- `data/` still stores local fallback request logs and session history; with `DATABASE_URL` configured, shared fleet analytics are also mirrored into SQL
- The API defaults to `127.0.0.1:8789`
- The web companion is exposed on `${PROXY_WEB_PORT:-5174}`
- The local compose stack now starts Postgres by default and sets `DATABASE_URL` so local runtime behavior matches Render more closely
- `keys.json` is still required for startup.
- `data/` stays bind-mounted for request logs and session history.
- include `docker-compose.host-dashboard.override.yml` only when you want local host-dashboard Docker/runtime introspection
- If you want to mount Factory CLI auth files, include `docker-compose.factory-auth.override.yml` explicitly.
- The compose stack now defaults `OLLAMA_BASE_URL` to `http://ollama:11434` when attached to the shared `ai-infra` network; `CHROMA_URL` still defaults to `host.docker.internal` unless you also containerize Chroma on a shared network.
- The web companion is exposed on `${PROXY_WEB_PORT:-5174}`.
- The checked-in host PM2 source now includes both the API and web companion in `ecosystem.container.config.cjs`.
- Source code remains here in `orgs/open-hax/proxx`; service-local env/config/data now lives under `services/proxx`.
- OTEL export can be enabled with standard `OTEL_EXPORTER_OTLP_*`, `OTEL_SERVICE_NAME`, and `OTEL_RESOURCE_ATTRIBUTES` environment variables.

## Environment Variables

- `PROXY_HOST` (default: `127.0.0.1`)
- `PROXY_PORT` (default: `8789`)
- `OPENAI_OAUTH_CALLBACK_PORT` (default: `1455`; port used when building the browser OAuth redirect URL)
- `STREAM_CHUNK_DELAY_MS` (optional; default: `0`; fixed delay added between synthetic SSE chunks)
- `STREAM_CHUNK_DELAY_MS_MIN` / `STREAM_CHUNK_DELAY_MS_MAX` (optional; default: unset; random delay range between chunks)
- `UPSTREAM_PROVIDER_ID` (default: `vivgrid`; provider key in `keys.json`)
- `UPSTREAM_FALLBACK_PROVIDER_IDS` (default: auto `ollama-cloud` when primary is `vivgrid`, or `vivgrid` when primary is `ollama-cloud`; comma-separated)
- `UPSTREAM_BASE_URL` (optional override; when unset or blank, the proxy derives it from `UPSTREAM_PROVIDER_ID` / `UPSTREAM_PROVIDER_BASE_URLS`)
- `UPSTREAM_PROVIDER_BASE_URLS` (optional mapping: `provider=url,provider=url`; defaults include `vivgrid=https://api.vivgrid.com`, `ollama-cloud=https://ollama.com`, `ob1=https://dashboard.openblocklabs.com/api`, `openrouter=https://openrouter.ai/api/v1`, and `requesty=https://router.requesty.ai/v1`)
- `UPSTREAM_BASE_URL` (default: `https://api.vivgrid.com`)
- `UPSTREAM_PROVIDER_BASE_URLS` (optional mapping: `provider=url,provider=url`; defaults include `vivgrid=https://api.vivgrid.com`, `ollama-cloud=https://ollama.com`, `zai=https://api.z.ai/api/paas/v4`, `openrouter=https://openrouter.ai/api/v1`, `requesty=https://router.requesty.ai/v1`, `gemini=https://generativelanguage.googleapis.com/v1beta`, and `factory=https://api.factory.ai`)
- `OPENAI_PROVIDER_ID` (default: `openai`; provider key in `keys.json`)
- `OPENAI_BASE_URL` (default: `https://chatgpt.com/backend-api`)
- `OLLAMA_BASE_URL` (default: `http://127.0.0.1:11434`)
- `ZAI_BASE_URL` (optional; default: `https://api.z.ai/api/paas/v4`; alias: `ZHIPU_BASE_URL`)
- `ZHIPU_BASE_URL` (optional alias of `ZAI_BASE_URL`)
- `ZAI_PROVIDER_ID` (optional; default: `zai`; alias: `ZHIPU_PROVIDER_ID`)
- `ZHIPU_PROVIDER_ID` (optional alias of `ZAI_PROVIDER_ID`)
- `UPSTREAM_CHAT_COMPLETIONS_PATH` (default: `/v1/chat/completions`)
- `OPENAI_CHAT_COMPLETIONS_PATH` (default: `/v1/chat/completions`)
- `UPSTREAM_MESSAGES_PATH` (default: `/v1/messages`)
- `UPSTREAM_MESSAGES_MODEL_PREFIXES` (default: `claude-`; comma-separated prefixes)
- `UPSTREAM_MESSAGES_INTERLEAVED_THINKING_BETA` (default: `interleaved-thinking-2025-05-14`; set empty to disable auto `anthropic-beta` injection when thinking is enabled)
- `UPSTREAM_RESPONSES_PATH` (default: `/v1/responses`)
- `OPENAI_RESPONSES_PATH` (default: `/v1/responses`)
- `UPSTREAM_IMAGES_GENERATIONS_PATH` (default: `/v1/images/generations`)
- `UPSTREAM_RESPONSES_MODEL_PREFIXES` (default: `gpt-`; comma-separated prefixes)
- `OPENAI_MODEL_PREFIXES` (default: `openai/,openai:`; comma-separated prefixes)
- `OLLAMA_CHAT_PATH` (default: `/api/chat`)
- `OLLAMA_MODEL_PREFIXES` (default: `ollama/,ollama:`; comma-separated prefixes)
- `PROXY_KEYS_FILE` (default: `./keys.json`, fallback: `VIVGRID_KEYS_FILE`)
- `PROXY_MODELS_FILE` (default: `./models.json`, fallback: `VIVGRID_MODELS_FILE`)
- `PROXY_REQUEST_LOGS_FILE` (default: `./data/request-logs.jsonl`)
- `PROXY_REQUEST_LOGS_MAX_ENTRIES` (default: `100000`; retained raw request-log entries used for backfill/debug/recent views)
- `PROXY_SETTINGS_FILE` (default: `./data/proxy-settings.json`)
- `PROXY_KEY_RELOAD_MS` (default: `5000`, fallback: `VIVGRID_KEY_RELOAD_MS`)
- `PROXY_KEY_COOLDOWN_MS` (default: `30000`, fallback: `VIVGRID_KEY_COOLDOWN_MS`)
- `UPSTREAM_REQUEST_TIMEOUT_MS` (default: `180000`)
- `PROXY_AUTH_TOKEN` (required unless `PROXY_ALLOW_UNAUTHENTICATED=true`)
- `PROXY_ALLOW_UNAUTHENTICATED` (default: `false`; use `true` only for local debugging)
- `CHROMA_URL` (optional; default: `http://127.0.0.1:8000`)
- `CHROMA_COLLECTION` (optional; default: `open_hax_proxy_sessions`)
- `CHROMA_EMBED_MODEL` (optional; default: `nomic-embed-text:latest`; served from Ollama)
- `OTEL_EXPORTER_OTLP_ENDPOINT` (optional; OTLP HTTP base URL for telemetry export)
- `OTEL_EXPORTER_OTLP_HEADERS` (optional; comma-separated OTLP headers, for example ingest auth; do not commit real secrets)
- `OTEL_SERVICE_NAME` (optional; default: `proxx`)
- `OTEL_RESOURCE_ATTRIBUTES` (optional; comma-separated OTEL resource attributes)
- `OTEL_SDK_DISABLED` (optional; set `true` to disable telemetry even when endpoint and headers are set)

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

## `models.json` Preferences

`models.json` is now **preference metadata**, not the source of truth. The proxy discovers models dynamically via provider `/v1/models` (and provider-specific catalog endpoints) and uses `models.json` to:

- **prioritize** models in listings and routing
- **disable** models (exclude from listing + routing)
- **alias** model names (rewrite to a discovered model ID)

Example:

```json
{
  "preferred": ["gpt-5.3-codex", "gemini-3.1-pro-preview"],
  "disabled": ["gemini-1.0-pro"],
  "aliases": { "qwen3.5": "qwen3.5:397b" }
}
```

Notes:
- Preferred models only **reorder** discovered models (they do **not** add undiscovered models).
- Disabled models are excluded even if a provider advertises them.
- Aliases only apply when the **target** model exists in the discovered catalog.

## OpenAI OAuth Routing Through Chat-Completions

Route requests to OpenAI by prefixing model names:

- `"model": "openai/gpt-5"`
- `"model": "openai:gpt-5"`

The prefix is stripped before upstream dispatch, and accounts are selected from `keys.json.providers[OPENAI_PROVIDER_ID]`.

For migrated legacy OAuth accounts, the `openai` provider is treated as a ChatGPT Codex upstream, not the OpenAI Platform API. Those accounts require `chatgpt_account_id` metadata and are sent to `/codex/responses` by default.

## Factory.ai Provider

The proxy supports [Factory.ai](https://factory.ai) as a provider, routing requests to `https://api.factory.ai` with automatic credential management.

### Credentials

Factory credentials can be supplied in three ways (all sources merge at runtime):

1. **Environment variable** — set `FACTORY_API_KEY` with your Factory API key.
2. **Local auth files** — the proxy reads `~/.factory/auth.v2.file` and `~/.factory/auth.v2.key` (OAuth tokens written by the Factory CLI). Override paths with `FACTORY_AUTH_V2_FILE` / `FACTORY_AUTH_V2_KEY`.
3. **`keys.json`** — add a `factory` provider entry with `"auth": "api_key"` and an `"accounts"` array containing your key(s). See `keys.example.json` for a complete example including OAuth bearer accounts.

### Model Routing

Prefix a model name with `factory/` or `factory:` to route it through the Factory provider:

- `"model": "factory/claude-opus-4-5"`
- `"model": "factory/gpt-5"`
- `"model": "factory/gemini-3-pro-preview"`

The prefix is stripped before the request is sent upstream. Any model available on Factory.ai can be used.

### OAuth Setup (Web Console)

The web console exposes two OAuth flows for obtaining Factory credentials interactively:

- **Device flow** — `POST /api/ui/credentials/factory/oauth/device/start` initiates a device-code grant; poll with `POST /api/ui/credentials/factory/oauth/device/poll`.
- **Browser flow** — `POST /api/ui/credentials/factory/oauth/browser/start` returns an authorization URL for PKCE-based browser login.

Both flows store the resulting tokens so the proxy can use them for subsequent requests.

### Environment Variables

- `FACTORY_API_KEY` — Factory API key (creates a `factory` provider automatically).
- `FACTORY_BASE_URL` — override the default `https://api.factory.ai` endpoint.
- `FACTORY_MODEL_PREFIXES` — model prefixes that trigger Factory routing (default: `factory/,factory:`).

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
  --header 'Authorization: Bearer change-me-open-hax-proxy-token' \
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
