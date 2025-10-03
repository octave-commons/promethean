# @promethean/mcp-ollama

A native ESM helper for executing Ollama tasks from Model Context Protocol providers. It validates task payloads, streams Ollama responses with abort support, and returns structured results that are easy to forward to MCP clients.

## Usage

```ts
import {
  parseTask,
  isRight,
  runTask,
} from "@promethean/mcp-ollama";

const raw = {
  id: "b8ad4424-3a2c-4b9e-8400-4fc0eeb5e1f1",
  kind: "generate",
  model: "llama3",
  prompt: "Write a haiku about Promethean",
};

const parsed = parseTask(raw);
if (!isRight(parsed)) {
  throw parsed.value; // ZodError describing what went wrong
}

const run = await runTask(
  parsed.value,
  {
    baseUrl: "http://localhost:11434",
    fetch,
  },
  { timeoutMs: 30_000 },
);

for await (const chunk of run.stream) {
  if (chunk.textDelta) {
    process.stdout.write(chunk.textDelta);
  }
}

const outcome = await run.result;
if (outcome.kind === "Success") {
  console.log(outcome.result.status); // "succeeded"
  console.log(outcome.result.output.data); // Parsed response JSON or text
  console.log(outcome.result.output.logs); // Raw streamed chunks
} else if (outcome.kind === "RateLimited") {
  console.warn(`Retry after ${outcome.retryAfterMs ?? 0}ms`);
} else if (outcome.kind === "Timeout") {
  console.error("Timed out talking to Ollama");
} else {
  console.error(outcome.error);
}
```

## Security

This package only performs HTTP requests against the configured Ollama endpoint. Never execute shell commands or spawn processes based on task input; keep adapters pure and forward-only so MCP runtimes remain sandbox friendly.
