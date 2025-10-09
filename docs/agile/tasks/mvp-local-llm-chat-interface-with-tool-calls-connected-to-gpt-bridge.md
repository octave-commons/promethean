---
uuid: "24ba6872-89c0-4f5f-a20e-33058219016b"
title: "Pythagoras GPT Mirror WS chat + OpenAPI-driven tool calls via /v1"
slug: "mvp-local-llm-chat-interface-with-tool-calls-connected-to-gpt-bridge"
status: "done"
priority: "P3"
labels: ["openapi", "tool", "pythagoras", "mirror"]
created_at: "2025-10-07T20:25:05.644Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---

# Pythagoras GPT Mirror WS chat + OpenAPI-driven tool calls via /v1
```
**Owner:** Codex / Agent
```
```
**Status:** Planned
```
**Labels:** #agents #ws #openapi #tools #smartgpt-bridge #prompts #promethean

---

## 🛠️ Description

Create a “Pythagoras-mirror” agent that:

1. runs a **chat client** over the **broker/WebSocket LLM worker**,
2. supports **tool calls** selected by the model,
3. **auto-generates tool specs** from the **/v1/openapi.json** for smartgpt-bridge, and
4. ensures the **OpenAPI op descriptions** are clear and model-usable.

---

## 🎯 Goals

* Model-driven tool selection (no brittle routing).
* No HTTP coupling in the chat client—**WS to LLM worker** only; the worker executes tools by calling **smartgpt-bridge /v1**.
* Tool catalog stays in sync with the OpenAPI spec automatically.

---

## 📦 Requirements / Definition of Done (strict)

* [ ] **Chat client** uses **WS** to talk to the **LLM worker** (broker path).
* [ ] **LLM worker** accepts OpenAI-style tool calls function-calling / tool\_choice=auto.
* [ ] **Tool catalog auto-generated** from **/v1/openapi.json** (names, descriptions, JSON schemas for params).
* [ ] **OpenAPI op descriptions** are present, unambiguous, and concise enough that a model can choose the correct tool.
* [ ] **E2E demo:** user asks a question that requires a tool → model chooses tool → worker calls **smartgpt-bridge** → result streamed back.
* [ ] **Parity tests** for at least 5 representative endpoints.
* [ ] No new TS path aliases. Export via **@shared/ts/dist/**.

---

## Architecture (minimal)

* **services/ts/llm-worker**

  * WS in → tool-aware chat loop → tool exec adapter → calls **smartgpt-bridge /v1** → WS out.
* **services/ts/pythagoras-mirror** (agent wrapper)

  * Prompts + policies specific to “Pythagoras” persona math-first, stepwise.
* **shared/ts/openapi-tools**

  * Fetches/loads **/v1/openapi.json** → generates:

    * **tool specs** (name, description, parameters JSON schema),
    * **client stubs** for executing tools.

---

## Data contracts (concise)

### Tool spec (fed to model)

```ts
type ToolSpec = {
  type: "function";
  function: {
    name: string;                // opId or normalized path+method
    description: string;         // from OpenAPI; trimmed & edited
    parameters: Record<string, any>; // JSON Schema for body/query
  };
};
```

### WS message (worker)

```ts
// request -> worker
{ id, action: "chat.completion", payload: { model, messages, tools: ToolSpec[], tool_choice: "auto", stream: true } }

// worker events
{ id, event: "chat.delta", delta }
{ id, event: "tool.call", name, arguments }         // model-selected
{ id, event: "tool.result", name, content }         // bridge response snippet
{ id, event: "chat.complete", output, usage }
```

---

## 📋 Tasks & Subtasks

### Step 1 — OpenAPI ingestion → tools & client

* [ ] Create **openapi fetch/loader**: `shared/ts/src/openapi-tools/loader.ts`

  * Fetch JSON from `/v1/openapi.json` (configurable URL).
  * Cache & hash (ETag) to avoid churn.
* [ ] Build **spec → tools generator**: `shared/ts/src/openapi-tools/generateTools.ts`

  * Map each **operationId** or path+method to a **ToolSpec**.
  * Merge **parameters** path/query/body into a single JSON Schema object.
  * **Normalize names**: `v1.files.search` → `files_search`.
  * **Descriptions**: prefer `operation.summary || operation.description`; trim, remove HTML, imperative voice.
  * Add **guard rails**: skip ops without descriptions or with ambiguous names; emit report.
* [ ] Build **typed client stubs**: `shared/ts/src/openapi-tools/client.ts`

  * Given `{name, args}`, resolve to `{method, url, body/query}` and call **smartgpt-bridge** (with auth if needed).
  * Return normalized result `{ content, status, headers? }`.
  * Handle streaming endpoints by accumulating chunks or relaying partials as `tool.result` deltas.

### Step 2 — Tool-aware LLM worker over WS

* [ ] Extend **LLM worker** WS handler: `services/ts/llm-worker/handlers/chat.ts`

  * Accept `tools` and `tool_choice`.
  * When model returns a tool call:

    1. emit `tool.call`,
```
2. execute via **openapi client**,
```
    3. stream `tool.result` (if large) or single result,
    4. feed the result back into the model as a `tool` message, continue.
* [ ] Admission control & timeouts for tools (per op SLA, default 10s).
* [ ] Metric hooks: `tool_invocations_total{tool=...}`, `tool_latency_ms_bucket`, `tool_errors_total`.
* [ ] Error policy: deliver short, model-friendly error `tool_name`, `code`, `message`, then allow model to recover or ask clarifying q.

### Step 3 — Pythagoras mirror agent wrapper

* [ ] Agent config `services/ts/pythagoras-mirror/config.ts`:

  * **System prompt** math-first, stepwise reasoning, prefer tools.
  * Tool selection guidance: “Use a tool whenever external data is needed; don’t hallucinate API results.”
  * Default `tool_choice: "auto"`, `temperature=0`.
* [ ] Bootstrap script `services/ts/pythagoras-mirror/start.ts`:

  * Loads **ToolSpec\[]** from generator.
  * Establishes WS to **llm-worker**.
  * Provides a tiny CLI or HTTP shim to post messages and stream replies (dev UX).

### Step 4 — Make OpenAPI descriptions model-ready & test

* [ ] **Lint OpenAPI**: `scripts/ci/check-openapi-descriptions.ts`

  * Assert description/summary exists, ≤ 200 chars, starts with a verb, contains required input hints.
  * Fail CI if any op is missing or ambiguous.
* [ ] **Goldens**: write **5–10 parity tests** that require tool use, e.g.:

  * file search, directory tree, policy check, status/health, small content read.
  * For each, assert: model picks correct tool, args schema validated, result returned, final answer integrates tool data.
* [ ] **Docs**: `docs/agents/pythagoras-mirror.md` explaining configuration, how tool specs are auto-generated, and how to add/rename an op without breaking the model.

---

## 🔧 Config (envs)

```
OPENAPI_URL=https://.../v1/openapi.json
PYTHAGORAS_MODEL=qwen3:instruct
LLM_WORKER_WS=ws://broker/llm
TOOL_TIMEOUT_MS=10000
TOOL_MAX_RESULT_KB=256
```

---

## 🧪 Test plan (essentials)

* **Tool discovery:** generator produces ≥ N tools; none without description.
* **Schema parity:** sampling ops: generated JSON Schema matches OpenAPI for required/optional fields.
* **Round-trip:** prompt → tool call → bridge result → model reply (no hangs).
* **Error cases:** missing arg → schema error; 404/500 from bridge → worker reports succinct error; model recovers.
* **Load:** concurrent tool calls ×10; WS remains stable; timeouts enforced.
* **Docs linter:** CI fails if an op lacks a usable description.

---

## ✅ Acceptance Criteria

* [ ] WS chat client ↔ **llm-worker** end-to-end streaming works.
* [ ] **Tool calls accepted and executed**; arguments validated against generated JSON Schema.
* [ ] Tool catalog **auto-generated** on boot (and cached); human report lists skipped/ambiguous ops.
* [ ] **OpenAPI descriptions** lint-clean; ops are understandable to a model (imperative, concise).
* [ ] Green **golden tests** covering at least 5 representative tools.
* [ ] Docs explain how to add/rename an OpenAPI op and re-generate tools.

---

## 📂 Proposed Files/Paths

* `shared/ts/src/openapi-tools/loader.ts`
* `shared/ts/src/openapi-tools/generateTools.ts`
* `shared/ts/src/openapi-tools/client.ts`
* `services/ts/llm-worker/handlers/chat.ts` tool-aware
* `services/ts/pythagoras-mirror/config.ts`
* `services/ts/pythagoras-mirror/start.ts`
* `tests/e2e/pythagoras/tools.spec.ts`
* `scripts/ci/check-openapi-descriptions.ts`
* `docs/agents/pythagoras-mirror.md`

---

## CLI sketches for humans/dev

```
# 1) Generate tool catalog from OpenAPI
pnpm run generate:tools

# 2) Start worker + agent mirror
pnpm --filter services/ts/llm-worker start
pnpm --filter services/ts/pythagoras-mirror start

# 3) Chat (dev)
curl -N -X POST localhost:3210/pythagoras/chat -d '{"text":"Search files for \"embedding\" and summarize."}'
```

---

## Step 1–4 (your minimal milestone format)

* [ ] **Step 1 — OpenAPI → Tools:** loader, generator, typed client, report on skipped ops.
* [ ] **Step 2 — Worker Tooling:** WS chat handler supports tool calls; execute via bridge; metrics & timeouts.
* [ ] **Step 3 — Agent Mirror:** system prompt, boot logic, dev shim.
* [ ] **Step 4 — Lint & Tests:** description linter, goldens, load test, docs.

---

## Commit template

```
feat(agent): Pythagoras-mirror via WS with OpenAPI-driven tools (/v1 smartgpt-bridge)

- Auto-generate tool specs from /v1/openapi.json
- LLM worker accepts tool calls and executes via smartgpt-bridge
- OpenAPI description linter; goldens for 5 representative ops
- Docs & dev bootstrap
```

\#tags #promethean #pythagoras #ws #llm-worker #smartgpt-bridge #openapi #tool-calling #testing #docs

## Notes
- Tests or documentation are missing; acceptance criteria not fully met.
- Story Points: 8

#ready
