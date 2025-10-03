# @promethean/mcp-ollama

A native ESM helper for executing Ollama tasks from Model Context Protocol providers. It validates task payloads, streams Ollama responses with abort support, and returns structured results that are easy to forward to MCP clients.

## Usage

```ts
import { parseTask, isRight } from "@promethean/mcp-ollama";
import { runTask } from "@promethean/mcp-ollama";

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

const result = await runTask(parsed.value, {
  baseUrl: "http://localhost:11434",
  fetch,
});

console.log(result.status); // "succeeded"
console.log(result.output.data); // Parsed Ollama response JSON
console.log(result.output.logs); // Raw streamed chunks for auditing
```

## Security

This package only performs HTTP requests against the configured Ollama endpoint. Never execute shell commands or spawn processes based on task input; keep adapters pure and forward-only so MCP runtimes remain sandbox friendly.
