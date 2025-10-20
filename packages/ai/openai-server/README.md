# @promethean/openai-server

A Fastify-based web server that exposes an OpenAI-compatible chat completions API.
It queues incoming requests, processes them using a configurable handler, and
exposes monitoring endpoints plus generated OpenAPI documentation.

## Features

- **OpenAI-compatible**: Implements `/v1/chat/completions` with request/response
  schemas aligned to the OpenAI HTTP API.
- **Queue-backed**: Uses a functional, immutable task queue with configurable
  concurrency and detailed metrics.
- **Observability**: Provides `/queue/snapshot`, `/health`, and auto-generated
  `/openapi.json` plus Swagger UI at `/docs`.
- **Web UI**: Ships with a Web Component dashboard served via `@fastify/static`.
- **Ollama integration**: Includes a ready-made handler that bridges Ollama's
  `/api/chat` endpoint to OpenAI-compatible responses.

## Scripts

- `pnpm run build` – Type-checks and emits ESM artifacts to `dist/`.
- `pnpm run test` – Builds then executes AVA tests.
- `pnpm run lint` – Runs ESLint on the package.

## Usage

```ts
import {
  createOpenAICompliantServer,
  createOllamaChatCompletionHandler,
} from '@promethean/openai-server';

const handler = createOllamaChatCompletionHandler({
  baseUrl: 'http://127.0.0.1:11434',
});

const { app } = createOpenAICompliantServer({
  concurrency: 2,
  handler,
});

await app.listen({ port: 3000, host: '0.0.0.0' });
```

## License

GPL-3.0-only
