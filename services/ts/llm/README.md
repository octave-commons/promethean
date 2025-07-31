# LLM Service

This service exposes a simple HTTP endpoint that proxies requests to the local LLM via the `ollama` library.

Start the service:
```bash
npm start
```

POST `/generate` with JSON containing `prompt`, `context` and optional `format` to receive the generated reply.

#hashtags: #llm #service #promethean
