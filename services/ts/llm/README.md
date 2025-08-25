# LLM Service

This service exposes a simple HTTP endpoint that proxies requests to the local LLM via the `ollama` library.

Start the service (pnpm required):

```bash
pnpm start
```

POST `/generate` with JSON containing `prompt`, `context` and optional `format` to receive the generated reply.

Serve the chat interface via `pnpm serve:sites` and open `http://localhost:4500/llm-chat/` to try it in your browser.

Set the `LLM_MODEL` environment variable to choose which model Ollama uses. If
not provided, it defaults to `gemma3`.

#hashtags: #llm #service #promethean
