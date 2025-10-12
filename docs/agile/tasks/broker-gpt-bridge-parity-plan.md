---
uuid: "63fd4d57-aa99-4b77-9de6-fa7acf6e6d83"
title: "Broker ↔ GPT Bridge Parity Test Plan"
slug: "broker-gpt-bridge-parity-plan"
status: "done"
priority: "P3"
labels: ["bridge", "broker", "gpt", "parity"]
created_at: "2025-10-12T22:46:41.458Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---




























































































































































































































































































































































































# Broker ↔ GPT Bridge Parity Test Plan
```
**Owner:** Codex / Agent
```
```
**Status:** needs review
```
**Labels:** #broker #gptbridge #testing #parity #ws #http #ci #observability #promethean

---

## 🎯 Scope

Compare, for the same inputs, that **outputs, streaming behavior, errors, timings, and metadata** are equivalent between:

* **Broker (WS)** canonical actions/events, and
* **GPT Bridge HTTP/WS** wrapper that proxies + sheds load.

We normalize outputs so harmless differences (timestamps, ids) don’t fail the suite.

---

## 🔑 Preconditions

* Deterministic models & prompts: **temperature=0**, pinned models (#versioning).
* Fixed chunking rules for streaming (server sends stable deltas).
* Same tool/plugin catalog visible to both sides.
* Same env, routing, and auth claims.
* Dual sinks off for tests unless specifically under “overload/backpressure”.

---

## 🧪 Test Matrix

| Area          | Case                                    | What we assert                                                                    |
```
| ------------- | --------------------------------------- | --------------------------------------------------------------------------------- |
```
| Chat (sync)   | small, medium, long prompts             | identical `text`, `usage`, `finish_reason`                                        |
| Chat (stream) | delta chunking                          | same **chunk boundaries**, bytes, order, terminal `complete`                      |
| Embeddings    | single/batch inputs                     | vector length, numeric closeness ULP / 1e-6, same metadata                      |
| Tools         | 1-tool, multi-tool, parallel tool calls | same tool selection, JSON args, tool result merge                                 |
| Errors        | invalid schema, bad model, 401/403, 5xx | same error class/code/message class                                               |
| Timeouts      | model, tool, end-to-end                 | fail shape + elapsed within tolerance                                             |
| Rate limits   | per-user & global                       | bridge sheds, broker returns backpressure; identical HTTP status & WS close codes |
| Backpressure  | queue caps reached                      | same `overloaded` semantics and retry-after hints                                 |
| Cancellation  | client abort mid-stream                 | both stop within Δ≤200ms; consistent terminal event                               |
| Metadata      | request\_id, model, usage               | identical after normalization                                                     |
| Multi-tenant  | org/user scopes                         | identical policy enforcement & audit trail                                        |
| Ordering      | concurrent requests                     | per-request ordering preserved                                                    |
| Large I/O     | 1–2MB input (allowed)                   | no truncation; same tokenization & usage                                          |
| Binary edge   | non-text MIME guarded                   | both reject with same code                                                        |
| Health        | health/metrics parity                   | counters increase consistently after a run                                        |

---

## 🧱 Normalization Rules

Before diffing:

* Strip or canonicalize: `request_id`, timestamps, `queue_position`, transient URLs, floating latency fields (we check them separately with tolerances).
* Round floats in embeddings to **6 decimals** and compare with **absolute tolerance 1e-6**.
* Normalize whitespace in text: collapse multiple spaces, unify `\r\n` → `\n`.

---

## 📦 Fixtures

* `tests/parity/fixtures/`:

  * `chat/*.json` (prompts, system msgs)
  * `tools/catalog.json` stable tool set + deterministic mock backends
  * `embeddings/texts.jsonl` 50 cases, multilingual + emojis
  * `errors/*.json` (invalid payloads)
  * `overload/profile.json` (synthetic load profile)
* Test doubles for tools: deterministic side-effects, seeded RNG, or pure functions.

---

## 🧰 Harness & Helpers TypeScript / Vitest
```
**Paths**
```
* `shared/ts/src/parity/normalizers.ts` — text/usage/embedding normalizers
* `shared/ts/src/parity/runner.ts` — runs both paths and returns comparable outputs
* `tests/parity/*.spec.ts` — suites
* `tests/parity/utils/matchers.ts` — custom expect matchers embeddings≈, streamEqual
```
**Runner sketch**
```
```ts
// shared/ts/src/parity/runner.ts
import { brokerClient } from "@shared/ts/dist/broker/client";
import { bridgeClient } from "@shared/ts/dist/bridge/client";
import { normalizeChat, normalizeEmbed, normalizeError, normalizeStream } from "./normalizers";

export async function runChatBoth(payload) {
  const [b, h] = await Promise.all([
    brokerClient.chat(payload),
    bridgeClient.chat(payload),
  ]);
  return { broker: normalizeChat(b), http: normalizeChat(h) };
}

export async function runChatStreamBoth(payload, onChunk?) {
  const acc = { broker: [], http: [] };
  await Promise.all([
    brokerClient.chatStream(payload, (c)=> { acc.broker.push(c); onChunk?.("broker", c); }),
    bridgeClient.chatStream(payload, (c)=> { acc.http.push(c);   onChunk?.("http", c); }),
  ]);
  return normalizeStream(acc);
}

export async function runEmbBoth(inputs) {
  const [b, h] = await Promise.all([
    brokerClient.embed(inputs),
    bridgeClient.embed(inputs),
  ]);
  return { broker: normalizeEmbed(b), http: normalizeEmbed(h) };
}

export async function runToolBoth(payload) {
  const [b, h] = await Promise.all([
    brokerClient.toolCall(payload),
    bridgeClient.toolCall(payload),
  ]);
  return { broker: b, http: h }; // tool result is deterministic, normalize later
}
```
```
**Custom matchers**
```
```ts
// tests/parity/utils/matchers.ts
export function expectVectorsClose(a: number[], b: number[], tol=1e-6) {
  expect(a.length).toBe(b.length);
  for (let i = 0; i < a.length; i++) {
    expect(Math.abs(a[i]-b[i])).toBeLessThanOrEqual(tol);
  }
}
```

---

## 🧪 Representative Test Cases

### 1) Chat — Sync

```ts
import { runChatBoth } from "@shared/ts/dist/parity/runner";

it("chat sync: medium prompt parity", async () => {
  const payload = { model: "qwen3:14b-instruct", messages: [...], temperature: 0 };
  const { broker, http } = await runChatBoth(payload);
  expect(broker.text).toEqual(http.text);
  expect(broker.finish_reason).toEqual(http.finish_reason);
  expect(broker.usage).toEqual(http.usage);
});
```

### 2) Chat — Streaming

```ts
import { runChatStreamBoth } from "@shared/ts/dist/parity/runner";
import { expectStreamEqual } from "./utils/stream";

it("chat stream: chunk-by-chunk parity", async () => {
  const payload = { model: "qwen3:14b-instruct", stream: true, messages: [...], temperature: 0 };
  const acc = await runChatStreamBoth(payload);
  expectStreamEqual(acc.broker, acc.http); // same chunk boundaries & content
});
```

### 3) Embeddings

```ts
import { runEmbBoth } from "@shared/ts/dist/parity/runner";
import { expectVectorsClose } from "./utils/matchers";

it("embeddings: batch parity", async () => {
  const inputs = ["a", "b", "c"];
  const { broker, http } = await runEmbBoth(inputs);
  expect(broker.vectors.length).toBe(http.vectors.length);
  broker.vectors.forEach((v,i)=> expectVectorsClose(v, http.vectors[i]));
  expect(broker.dim).toBe(http.dim);
});
```

### 4) Tool Calls

```ts
import { runToolBoth } from "@shared/ts/dist/parity/runner";
import { normalizeToolResult } from "@shared/ts/dist/parity/normalizers";

it("tools: multi-tool selection parity", async () => {
  const payload = { tools: [...], messages: [...], tool_choice: "auto", temperature: 0 };
  const { broker, http } = await runToolBoth(payload);
  expect(normalizeToolResult(broker)).toEqual(normalizeToolResult(http));
});
```

### 5) Error Equivalence

```ts
import { brokerClient, bridgeClient } from "@shared/ts/dist/...";

it("errors: invalid schema yields same code", async () => {
  const bad = { action: "chat.completion", payload: { model: "", messages: [] } };
  const b = await brokerClient.request(bad).catch(e=>e);
  const h = await bridgeClient.request(bad).catch(e=>e);
  expect(normalizeError(b)).toEqual(normalizeError(h));
});
```

### 6) Overload / Rate Limit

* Drive synthetic load from `tests/parity/overload.spec.ts` using worker threads.
* Expect **bridge** to shed `429`, `retry_after_ms` while **broker** signals backpressure `overloaded`, server close code `1013` or app-level event.
* Verify documented mapping parity wrapper must translate broker overload → HTTP 429 consistently.

---

## ⏱️ Timing Tolerances

* Stream cancellation delta ≤ **200ms**.
* Timeout parity within **±10%** of configured timeout or **±250ms** (whichever larger).
* Queueing delay parity within **±1s** under load (bridge may add shaping).

---

## 📊 Metrics & Artifacts

After each parity run, capture:

* **Parity score**: passed / total, broken down by feature.
* **Drift report**: first mismatch diff (redacted), histograms for chunk counts, embedding drift stats.
* **Performance**: latency distributions p50/p95 for both paths.
  Artifacts under: `docs/data/reports/parity/<run-id>/*`.

---

## 🧯 CI Wiring
```
**Workflow steps**
```
1. Spin local broker & bridge (compose or PM2).
2. Seed tool registry (deterministic mocks).
3. Run parity suites with `NODE_ENV=test PARITY=1`.
```
4. Upload artifacts (reports + logs).
```
5. Gate: **block merge** if any parity test fails.
```
**Minimal job**
```
```yaml
- name: Start stack
  run: docker compose -f docker-compose.test.yml up -d broker bridge tools

- name: Parity tests
  run: |
    pnpm i --frozen-lockfile
    pnpm test --filter parity

- name: Upload parity artifacts
  uses: actions/upload-artifact@v4
  with:
    name: parity-reports
    path: docs/data/reports/parity/**
```

---

## ⚠️ Known Edge Cases & Guards

* **Chunk boundaries**: ensure both sides use the same tokenizer/chunker. If not feasible, assert **content equality** with flexible chunk counts but require terminal framing parity.
* **Usage accounting**: minor differences from transport wrappers → normalize by rounding & asserting within ±1–2 tokens if exact matching is impossible. Prefer exact.
* **Request IDs**: compare after stripping UUIDs.
* **Clock**: use a **fake clock** for timeout tests to avoid flake.

---

## ✅ Acceptance Criteria (for this plan)

* [ ] Suites exist for **chat sync/stream**, **embeddings**, **tools**, **errors**, **timeouts**, **overload**, **cancellation**, **metadata**.
* [ ] Normalizers & helpers implemented and reused by all cases.
* [ ] CI enforces parity gate on every PR.
* [ ] Reports are generated and stored per run with pass/fail summary.
* [ ] Documented **allowed deltas** timing/rounding are the only tolerated differences.

---

## 📂 Proposed Files/Paths

* `shared/ts/src/parity/normalizers.ts`
* `shared/ts/src/parity/runner.ts`
* `tests/parity/chat.sync.spec.ts`
* `tests/parity/chat.stream.spec.ts`
* `tests/parity/embeddings.spec.ts`
* `tests/parity/tools.spec.ts`
* `tests/parity/errors.spec.ts`
* `tests/parity/overload.spec.ts`
* `tests/parity/cancellation.spec.ts`
* `tests/parity/metadata.spec.ts`
* `docs/data/reports/parity/*`
* `.github/workflows/parity.yml` (or folded into existing)

---

## Commit Template

```
test(parity): add broker↔bridge parity suites + normalizers + CI gate

- Chat (sync/stream), embeddings, tools, errors, timeouts, overload, cancellation
- Shared parity runner & normalizers
- CI workflow and artifact reports
```

\#tags #broker #gptbridge #parity #ws #http #testing #ci #observability #promethean
```
#in-review
```



























































































































































































































































































































































































