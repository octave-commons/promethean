---
uuid: "b2d63853-2a8e-4e5c-a196-3fc69299d876"
title: "WebSocket Broker API Parity with GPT Bridge"
slug: "create-broker-services-that-can-handle-all-the-same-tasks-as-the-gpt-bridge"
status: "done"
priority: "P3"
labels: ["api", "broker", "gpt", "parity"]
created_at: "2025-10-11T03:39:14.375Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---

# WebSocket Broker API Parity with GPT Bridge
```
**Owner:** Codex / Agent
```
```
**Status:** continue coding
```
**Labels:** #broker #ws #api #gptbridge #parity #promethean #ops

---

## 🛠️ Description

Bring the **WebSocket broker API** up to full parity with the existing **GPT Bridge HTTP interface**. Once parity is achieved, the GPT Bridge becomes a **thin wrapper** that proxies requests into the broker (adding load control, queueing, and overload protection). This ensures that the broker, which already manages system health and backpressure, becomes the **source of truth** for all messaging and tool calls.

---

## 🎯 Goals

* Match **all GPT Bridge features** in the WebSocket broker (chat, tool calls, streaming, metadata, etc.).
* Expose a **stable, documented schema** for broker events and actions.
* Ensure GPT Bridge wrappers proxy to broker seamlessly, adding only:

  * **Rate limiting**
  * **Load shedding**
  * **Request shaping** (timeouts, retries, queue management)
* Make **broker → service → client** the canonical path for all communication.
* Guarantee CI verifies feature parity between broker and GPT Bridge.

---

## 📦 Requirements / Definition of Done

* [ ] Broker supports **all GPT Bridge endpoints** as WebSocket actions/events.
* [ ] JSON schema defined for broker requests/responses (validated at runtime).
* [ ] GPT Bridge code reduced to a wrapper around broker client.
* [ ] Load shedding (queue caps, timeouts, backpressure) **only** happens in GPT Bridge.
* [ ] Broker metrics exported (active connections, queue depth, dropped, latency).
* [ ] CI runs **side-by-side tests** ensuring parity between GPT Bridge and broker responses.
* [ ] Documentation updated: GPT Bridge labeled **deprecated entrypoint** in future, with WS broker as canonical API.

---

## 📋 Tasks

### Step 1 — Inventory & Schema

* [ ] List **all GPT Bridge APIs** currently in use:

  * Chat completions sync/stream
  * Embedding calls
  * Tool calling / structured outputs
  * File queries (if any)
  * Health/metrics endpoints
* [ ] Define **WebSocket equivalents** for each:

  * `action: "chat.completion"`
  * `action: "embedding.query"`
  * `action: "tool.invoke"`
  * `action: "system.health"`
* [ ] Create JSON schema contracts `shared/ts/src/broker/schemas/*.json`.
* [ ] Add runtime validation (Ajv or zod).

### Step 2 — Broker Implementation

* [ ] Implement **WebSocket handlers** for each GPT Bridge feature.
* [ ] Add **request IDs** + correlation so responses can be tracked.
* [ ] Support **streaming events** (`delta` chunks for chat).
* [ ] Integrate with existing broker publish/subscribe system (reuse topics).
* [ ] Add **backpressure** handling in broker pause/resume signals, per-connection limits.
* [ ] Export broker metrics:

  * Connected clients
  * Requests/sec
  * Queue depth
  * Dropped / errored

### Step 3 — GPT Bridge Wrapper

* [ ] Replace GPT Bridge implementations with a **broker client**.
* [ ] Add **overload protection**:

  * Connection pooling
  * Per-user rate limits
  * Queue caps with fail-fast
* [ ] Keep identical API surface (so clients don’t break).
* [ ] Mark GPT Bridge code paths as **deprecated** in docs, but keep for now.

### Step 4 — Testing, CI, and Docs

* [ ] Write **side-by-side parity tests**:

  * Given same input → broker vs GPT Bridge → outputs match.
  * Streaming responses chunk identically.
* [ ] CI runs parity suite on every PR.
* [ ] Add **integration tests** with actual services (chat, embeddings, tool calls).
* [ ] Document:

  * Broker API schemas (with examples).
  * Migration path: “new clients should connect directly to broker.”
  * GPT Bridge purpose: “thin wrapper for load shedding only.”

---

## 🔧 Example Broker Messages
```
**Request:**
```
```json
{
  "id": "req-123",
  "action": "chat.completion",
  "payload": {
    "model": "qwen3:14b-instruct",
    "messages": [
      { "role": "system", "content": "You are a helpful assistant." },
      { "role": "user", "content": "Explain Promethean." }
    ],
    "stream": true
  }
}
```
```
**Response (streaming chunks):**
```
```json
{
  "id": "req-123",
  "event": "chat.delta",
  "delta": "Promethean is a modular, multi-agent system..."
}
```
```
**Final Response:**
```
```json
{
  "id": "req-123",
  "event": "chat.complete",
  "output": {
    "text": "Promethean is a modular..."
  },
  "usage": { "prompt_tokens": 42, "completion_tokens": 133, "total_tokens": 175 }
}
```

---

## ✅ Acceptance Criteria

* [ ] Every GPT Bridge endpoint has a **1:1 broker action**.
* [ ] GPT Bridge wrapper proxies requests to broker only, adding load shedding.
* [ ] Parity suite passes in CI (outputs identical across both paths).
* [ ] Docs state broker is **canonical API**.
* [ ] Metrics visible for broker connections and GPT Bridge load shedding.

---

## 📂 Proposed Files/Paths

* `shared/ts/src/broker/schemas/*.json` — JSON schemas
* `shared/ts/src/broker/client.ts` — WS client wrapper
* `services/ts/broker/handlers/*.ts` — action handlers
* `services/ts/gptbridge/main.ts` — reduced wrapper
* `tests/parity/broker-vs-bridge.spec.ts` — parity suite
* `docs/api/broker.md` — schema + examples
* `docs/migration/broker-vs-bridge.md` — migration notes

---

## 🧱 Step 1–4 Milestones

* [ ] **Step 1 — Inventory & Schema**: List GPT Bridge APIs, define broker equivalents, write schemas.
* [ ] **Step 2 — Broker Implementation**: Implement handlers, events, metrics.
* [ ] **Step 3 — GPT Bridge Wrapper**: Proxy to broker client, add load shedding, keep surface.
* [ ] **Step 4 — Testing & Docs**: Parity suite, CI, documentation, migration path.

---

## 🔍 Relevant Resources

* You might find \[this] useful while working on this task
  *link internal GPT Bridge API reference + broker design docs*

---

## Comments

Append-only thread for agents to log discovered gaps, schema changes, or overload handling notes.

#ready
