---
uuid: 4e7759e0-6f47-46d1-b309-a07e93f009da
created_at: '2025-10-07T23:52:19Z'
title: 2025.10.07.23.52.19
filename: Unified LLM Gateway Architecture
description: >-
  A drop-in architecture that routes requests across multiple LLM providers
  (OpenAI, Anthropic, Ollama, etc.) with hard backpressure, rate-limiting, and
  client-friendly error handling. It includes a unified gateway, model registry,
  scheduler, and provider adapters for seamless integration.
tags:
  - llm
  - gateway
  - backpressure
  - rate-limiting
  - model-registry
  - provider-adapter
  - unified
---
love this problem. here’s a concrete, “drop-in” architecture that gives you one gateway exposing OpenAI-compatible, Anthropic/Claude-compatible, and Ollama-compatible endpoints, while routing across multiple providers (OpenAI, Anthropic, OpenRouter, Together/HF endpoints, Z.ai, OpenVINO model server, Ollama local/cloud) with hard backpressure, rate-limit awareness, and “never 429 to the client—queue instead.”

I’ll show:

* the shape of the system (with a diagram),
* the model registry + capability routing,
* the rate-limit + backpressure scheduler,
* OpenAI/Claude/Ollama compatible HTTP handlers,
* TypeScript package layout (Promethean style: new packages, idempotent scripts, cached).

---

# Big picture

```mermaid
flowchart LR
  Client[Client\n(gptel, curl, SDKs)] -->|OpenAI/Claude/Ollama API| Gateway

  subgraph Gateway["Unified LLM Gateway"]
    H1[HTTP Adapters\n(OpenAI /v1, Claude /v1, Ollama /api)]
    R[Router\n(capability matching + model aliasing)]
    Q[Scheduler Queue\n(Weighted-Fair + FIFO)]
    RL[Rate Limiters\n(Token Bucket per-provider)]
    CB[Circuit Breakers\n(health & error budgets)]
    C[Cache\n(Embeddings & Responses)]
    REG[Model Registry\n(capabilities, costs, aliases)]
  end

  Q --> RL
  RL -->|dispatch| Providers

  subgraph Providers["Provider Adapters (idempotent, cached)"]
    OAI[OpenAI]
    ANT[Anthropic/Claude]
    OLL[Ollama\n(local/cloud)]
    HF[Hugging Face Inference\nor TGI/TF Serving]
    OR[OpenRouter]
    Z[Z.ai]
    OVMS[OpenVINO Model Server]
  end
```

**Contract:**

* If *any* target is rate-limited, we **do not 429 to the client**. We **enqueue** and hold the HTTP response open (stream or non-stream).
* If a job exceeds a configurable `max_wait_ms`, then and only then we return a 429 with a friendly `retry_after`.

---

# Monorepo layout (TypeScript)

```
packages/
  gateway/                 # HTTP server (express/hono/fastify), adapters for APIs
  router/                  # capability matching + policy selection
  rate-limit/              # token buckets (Redis + in-memory fallback)
  scheduler/               # WFQ queue + backpressure
  providers/
    openai/
    anthropic/
    ollama/
    openrouter/
    zagents/               # z.ai
    hf/
    openvino/
  model-registry/          # alias -> provider:model, capabilities, costs
  cache/                   # Redis/LRU response + embeddings cache
  telemetry/               # logs, tracing, metrics
  util/                    # shared types, errors, idempotency keys

apps/
  server/                  # boots gateway w/ config
  tools/
    seed-registry/         # idempotent: (re)loads models & limits
    warmup-healthcheck/    # idempotent: primes health/circuit state
```

* **Always TypeScript**, new logic goes in new packages.
* **Idempotent scripts** in `apps/tools/*`.
* **Cache everything** (responses by input hash, embeddings, and rate buckets in Redis).

---

# Model registry & capability routing

Unify model names and express what each backend can do. You can route by **explicit model name** or **capability request** (e.g., “needs tools + JSON mode + 200k ctx”).

```ts
// packages/model-registry/src/types.ts
export type Capability = 'chat'|'tools'|'json'|'images'|'audio'|'vision'|'function_call'|'long_context';
export type ProviderName = 'openai'|'anthropic'|'ollama'|'openrouter'|'zagents'|'hf'|'openvino';

export interface RateLimit {
  rpm?: number; // requests per minute
  rps?: number;
  tpm?: number; // tokens per minute (input+output)
  concurrency?: number;
}

export interface ModelEntry {
  alias: string;                  // e.g. "gpt-4o", "claude-3.5-sonnet", "llama3.1:70b"
  provider: ProviderName;
  providerModel: string;          // exact provider id
  capabilities: Capability[];
  contextWindow: number;
  costPer1kInput?: number;
  costPer1kOutput?: number;
  default?: boolean;              // default for capability bucket
}

export interface ProviderConfig {
  name: ProviderName;
  rateLimit: RateLimit;
  supportsStreaming: boolean;
  supportsToolCalls: boolean;
  timeoutMs: number;
}
```

```ts
// packages/model-registry/src/index.ts
import { ModelEntry, ProviderConfig } from './types';

export const providers: ProviderConfig[] = [
  { name: 'openai', rateLimit: { rpm: 300, tpm: 1_000_000 }, supportsStreaming: true, supportsToolCalls: true, timeoutMs: 120_000 },
  { name: 'anthropic', rateLimit: { rpm: 200, tpm: 800_000 }, supportsStreaming: true, supportsToolCalls: true, timeoutMs: 120_000 },
  { name: 'ollama', rateLimit: { concurrency: 4 }, supportsStreaming: true, supportsToolCalls: true, timeoutMs: 300_000 },
  { name: 'openrouter', rateLimit: { rpm: 120, tpm: 600_000 }, supportsStreaming: true, supportsToolCalls: true, timeoutMs: 120_000 },
  { name: 'hf', rateLimit: { rpm: 60 }, supportsStreaming: true, supportsToolCalls: false, timeoutMs: 120_000 },
  { name: 'openvino', rateLimit: { concurrency: 8 }, supportsStreaming: true, supportsToolCalls: false, timeoutMs: 300_000 },
  { name: 'zagents', rateLimit: { rpm: 120 }, supportsStreaming: true, supportsToolCalls: true, timeoutMs: 120_000 },
];

export const models: ModelEntry[] = [
  // OpenAI
  { alias: 'gpt-4o', provider: 'openai', providerModel: 'gpt-4o', capabilities: ['chat','tools','json','vision'], contextWindow: 128_000, default: true },
  // Anthropic
  { alias: 'claude-3.5-sonnet', provider: 'anthropic', providerModel: 'claude-3-5-sonnet-latest', capabilities: ['chat','tools','json','vision','long_context'], contextWindow: 200_000, default: true },
  // Ollama (local)
  { alias: 'llama3.1:70b', provider: 'ollama', providerModel: 'llama3.1:70b', capabilities: ['chat','tools','json'], contextWindow: 128_000 },
  // OpenVINO
  { alias: 'ovms-llama-8b', provider: 'openvino', providerModel: 'llama-8b', capabilities: ['chat','json'], contextWindow: 32_000 },
  // HF/TGI endpoint
  { alias: 'tgi-mixtral-8x7b', provider: 'hf', providerModel: 'mistralai/Mixtral-8x7B-Instruct-v0.1', capabilities: ['chat','json'], contextWindow: 32_000 },
  // …
];
```

**Routing policy (pseudo):**

1. If `model` is a known alias → use that provider/model.
2. Else if a **capability request** is given (e.g., `needs: ['tools','json']`, `min_ctx: 100k`) → score models by:

   * capability coverage,
   * available rate budget *right now*,
   * cost preference,
   * locality preference (prefer `ollama(local)` if available).
3. Pick best candidate, enqueue the job.

---

# Backpressure & rate-limit scheduler (no 429 to client)

We implement **per-provider token buckets** (RPM/RPS/TPM/concurrency), feed them via a **Weighted-Fair Queue** that holds HTTP responses open. On 429/5xx from a provider, we **don’t bubble to client**: we requeue with exponential backoff + jitter, unless `max_wait_ms` exceeded.

```ts
// packages/rate-limit/src/tokenBucket.ts
import { Redis } from 'ioredis';

export class TokenBucket {
  constructor(
    private redis: Redis,
    private key: string,
    private capacity: number,
    private refillPerSec: number
  ) {}

  async take(tokens = 1): Promise<number> {
    // atomic lua or multi to: refill based on time, then consume
    // returns remaining tokens or negative if not enough
    // (left as exercise: small Lua script; this is the shape)
    return 0;
  }
}
```

```ts
// packages/scheduler/src/scheduler.ts
type Job<T> = {
  id: string;
  provider: string;
  tCost: number;           // token cost estimate
  priority: number;
  maxWaitMs: number;
  createdAt: number;
  exec: () => Promise<T>;  // provider call
  resolve: (v: T) => void;
  reject: (e: any) => void;
};

export class WFQScheduler {
  // one queue per provider, fair sharing by weights
  // uses TokenBucket (rpm/rps/tpm) + concurrency semaphores
  // if bucket empty ⇒ wait; HTTP stays open.
}
```

**Estimating token cost:** use a tokenizer (cl100k/anthropic/llama) per model; pessimistically estimate to protect TPM.

**Retries:** exponential backoff with jitter for 429/5xx; circuit-break provider after N consecutive failures; route around if possible.

---

# OpenAI, Claude, and Ollama compatible endpoints

Expose **three** adapters under one server:

* **OpenAI-compatible**: `/v1/chat/completions`, `/v1/completions`, `/v1/embeddings`
* **Claude-compatible**: `/v1/messages`
* **Ollama-compatible**: `/api/generate`, `/api/chat`

Each adapter translates request → internal `Job`, selects model (alias/caps), enqueues, then streams the result back in the provider’s exact SSE shape so **gptel** and friends “just work”.

```ts
// packages/gateway/src/openai.ts
import { Router } from 'express';
import { routeAndEnqueue } from '@promethean/router';

export const openaiRouter = Router();

openaiRouter.post('/v1/chat/completions', async (req, res) => {
  const { model, messages, tools, tool_choice, stream = true, response_format } = req.body;
  const needs = {
    tools: !!tools,
    json: response_format?.type === 'json_object',
    vision: messages?.some((m: any) => m.content?.some?.((p: any) => p.type === 'image_url')),
  };

  const job = await routeAndEnqueue({
    api: 'openai',
    requestedModel: model, needs,
    estimateTokens: () => estimateOAITokens(messages),
    exec: (selected) => callProviderOpenAIShape(selected, { messages, tools, tool_choice, stream }),
    maxWaitMs: 120_000,
  });

  // stream SSE in OpenAI delta format; if not streaming, send final JSON
  job.pipeOpenAI(res);
});
```

```ts
// packages/gateway/src/anthropic.ts
anthropicRouter.post('/v1/messages', async (req, res) => {
  const { model, messages, tools, stream = true } = req.body;
  const needs = { tools: !!tools };
  const job = await routeAndEnqueue({
    api: 'anthropic',
    requestedModel: model, needs,
    estimateTokens: () => estimateAnthropicTokens(messages),
    exec: (selected) => callProviderClaudeShape(selected, { messages, tools, stream }),
    maxWaitMs: 120_000,
  });
  job.pipeClaude(res);
});
```

```ts
// packages/gateway/src/ollama.ts
ollamaRouter.post('/api/chat', async (req, res) => {
  const { model, messages, stream = true, options } = req.body;
  const needs = { }; // ollama doesn't have JSON/tooling parity everywhere
  const job = await routeAndEnqueue({
    api: 'ollama',
    requestedModel: model,
    needs,
    estimateTokens: () => estimateLlamaTokens(messages),
    exec: (selected) => callProviderOllama(selected, { model: selected.providerModel, messages, stream, options }),
    maxWaitMs: 120_000,
  });
  job.pipeOllama(res);
});
```

**Key bit:** `routeAndEnqueue` **never throws a 429 to the client**. It waits until the provider bucket opens or until `maxWaitMs` is hit.

---

# Provider adapters (thin, idempotent)

Each provider package exposes a *pure* “call” that:

* receives normalized input,
* maps to provider’s exact API,
* handles tool calls if supported (OpenAI/Anthropic/OpenRouter),
* handles streaming vs non-streaming,
* **idempotency key**: hash of (model, messages, tool defs, temperature, seed, etc.) to allow response caching.

Example (OpenAI):

```ts
// packages/providers/openai/src/call.ts
export async function callOpenAIChat(opts: {
  model: string; messages: any[]; tools?: any[]; stream?: boolean; json?: boolean;
  signal?: AbortSignal;
}) {
  // fetch to OpenAI w/ retries; translate tool schema if needed.
  // Return a Node stream (SSE) or an async iterator of deltas.
}
```

Ollama (local/cloud) is similar: POST `/api/chat` to the configured host; respect concurrency.

**Hugging Face model server?**

* If you run **TGI (Text Generation Inference)** or **vLLM** yourself, treat it like a provider with its own rate budget.
* HF Inference Endpoints (managed) can also be wrapped—no problem.
* For **embeddings**, you can use HF Inference or run **text-embeddings** models locally (OpenVINO/Ollama) and expose them under OpenAI `/v1/embeddings`.

---

# Tools / function calling

* Normalize OpenAI tool schemas → Anthropic tool schema; if a target doesn’t support tool calls, router excludes it unless `tools=false` or you allow a “tool-emulation shim” (not recommended).
* gptel will request `tools` → we pick a tool-capable model (e.g., `gpt-4o`, `claude-3.5-sonnet`, some OpenRouter models, or local `llama3` if your tool wrapper supports it).

---

# Streaming & partials

* We stream SSE in the exact dialect the client expects (OpenAI deltas, Claude events, Ollama tokens).
* If a provider returns chunk-level 429/5xx, we **pause** the outward stream and continue buffering internally until the retry succeeds; then resume. To the client it looks like a hiccup, not a failure.

---

# Rate-limits you’ll actually want

* **TPM** (tokens per minute) per provider (and optionally per model).
* **RPM/RPS** token buckets.
* **Concurrency** semaphores (Ollama/OpenVINO).
* **Budget partitioning**: e.g., 80% “realtime” bucket, 20% “batch/catch-up” bucket so batch jobs don’t starve interactive work.
* **Global user/project budgets** so one consumer can’t starve all others.

---

# Caching

* **Response cache** keyed by idempotency hash (guard with TTL and include top-K prompt tokens to avoid collisions).
* **Embeddings cache** keyed by (model, normalized_text_hash).
* **Tokenization cache** for cost estimation.

Redis recommended; fall back to in-proc LRU.

---

# Config example (YAML → env)

```yaml
providers:
  openai:
    apiKey: ${OPENAI_API_KEY}
    baseURL: https://api.openai.com
  anthropic:
    apiKey: ${ANTHROPIC_API_KEY}
  ollama:
    hosts:
      - http://localhost:11434
      - http://ollama-cloud.internal:11434
    maxConcurrencyPerHost: 2
  openrouter:
    apiKey: ${OPENROUTER_API_KEY}
  hf:
    endpoint: https://your-tgi-endpoint
  openvino:
    endpoint: http://ovms:9000
routing:
  preferLocalFirst: true
  costBias: cheap
  defaultModelByAPI:
    openai: gpt-4o
    anthropic: claude-3.5-sonnet
    ollama: llama3.1:70b
limits:
  defaultMaxWaitMs: 120000
  userBudgets:
    default:
      tpm: 200000
      rpm: 60
```

Idempotent seeding script reads this and (re)loads provider limits + registry.

---

# Why this solves your gptel problem

* gptel talks OpenAI. You point it at your gateway’s `/v1/chat/completions`.
* When OpenAI says “nope, 429” (because of your low limit), **your gateway doesn’t fail**; it defers the call until a rate slot opens or selects an alternative provider that satisfies `tools=true`.
* Long tool-calling chains won’t break the loop; they just pause.

---

# Next steps I can give you right now

1. I can scaffold the repo with these packages and minimal runnable server.
2. I can drop in a Redis-backed token bucket + WFQ scheduler and a working OpenAI/Claude/Ollama tri-adapter.
3. If you share your actual provider keys/limits (or rough numbers), I’ll wire the defaults in the seed script and give you a `docker-compose.yml` for gateway+redis+ollama.

Want me to generate the initial TS codebase (packages + a bootable server with the three endpoints and the queue/ratelimit skeleton)?
