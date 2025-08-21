# Codex Context Service

OpenAI-compatible API that enriches prompts with Promethean repo context via SmartGPT Bridge and routes to a local LLM (Ollama first).

## Endpoints

- POST `/v1/chat/completions`
- POST `/v1/completions`
- GET `/health`

## Config

- `PORT` (default `8140`)
- `LLM_MODEL` (default `gemma3:latest`)
- `SMARTGPT_URL` (default `http://127.0.0.1:3210`)
- `SMARTGPT_TOKEN` (bearer token for SmartGPT authentication)
- `DOCS_DIR` (optional, default `docs/codex-context`)

## Dev

- Install: `pnpm -C services/ts/codex-context install`
- Start (dev): `pnpm -C services/ts/codex-context start:dev`
- Test: `pnpm -C services/ts/codex-context test`

## Usage with Codex CLI

Set your OpenAI client base URL to this service:

```
export OPENAI_BASE_URL="http://localhost:8140/v1"
export OPENAI_API_KEY="local-dev" # placeholder
```

Requests will be augmented with repo context and forwarded to your local model.


