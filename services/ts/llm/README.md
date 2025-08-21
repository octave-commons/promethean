# LLM Service

This service exposes a simple HTTP endpoint that proxies requests to the local LLM via the `ollama` library.

Start the service (pnpm preferred):

```bash
pnpm start
```

POST `/generate` with JSON containing `prompt`, `context` and optional `format` to receive the generated reply.

Set the `LLM_MODEL` environment variable to choose which model Ollama uses. If
not provided, it defaults to `gemma3`.

#hashtags: #llm #service #promethean
