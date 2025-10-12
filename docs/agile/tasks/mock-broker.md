---
uuid: "35baa5c2-8daa-4162-97ad-19f55b9c2b51"
title: "Mock the Broker for Tests"
slug: "mock-broker"
status: "incoming"
priority: "P3"
labels: ["broker", "mock", "tests", "you"]
created_at: "2025-10-12T21:40:23.578Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---









































































































































































































































































Here’s a no-nonsense expansion that you can drop into your board. I’ve treated this like a mini-spec + work plan so Codex (or you) can just execute.

# Mock the Broker for Tests
```
**Owner:** Codex / Agent
```
```
**Status:** needs review
```
**Labels:** #framework-core #testing #infra #typescript #fastify #websockets #mongodb #chroma #promethean

---

## 🛠️ Description

Create a fully in-memory **Broker Mock** that mirrors the public contract of the real broker publish / subscribe / unsubscribe now; queue semantics later, so any module that currently depends on the broker can be tested without network access. Provide deterministic hooks time, ordering, error/latency injection, and a simple adapter so services can swap “real vs mock” via DI or env at test boot.

---

## 🎯 Goals

* Run unit + integration tests for broker-dependent modules **without** opening sockets or requiring an external broker process.
* Deterministic tests: control time, event ordering, retries, backpressure, and failure modes.
* Zero network usage. Zero flakiness.
* Minimal friction: drop-in `BrokerClient` replacement with identical surface.

---

## 📦 Requirements

* [ ] **Interface parity:** Expose the same TypeScript interface used by real clients `subscribe`, `unsubscribe`, `publish`, `request/response?` if present, and the current message envelope shape.
* [ ] **In-memory topic bus:** Maintain per-topic subscriber lists; deliver messages synchronously by default; support async delivery when latency is injected.
* [ ] **Deterministic scheduler:** A tiny scheduler to control “ticks” for delivery to avoid race conditions in tests.
* [ ] **Failure/latency injection:** Configurable drop %, fixed/variable latency, forced disconnects, backpressure overflow policy drop/newest/block, and ordered/unordered modes.
* [ ] **Fake time:** Optional fake clock (advance time manually in tests) for retry/timeout logic.
* [ ] **Backpressure simulation:** Bounded per-subscriber queue with metrics; configurable overflow strategy.
* [ ] **Metrics & hooks:** Counters for published / delivered / dropped / retried; test-side hooks to assert what happened.
* [ ] **No global leaks:** Independent instances per test; auto-teardown; no retained static state.
* [ ] **Test utils:** Fixtures, spies, and helpers to assert “message X reached subscriber Y with payload Z in order N”.
* [ ] **Env-switchable:** Respect existing env selection `BROKER_IMPL=mock|real` or DI token to swap at process start.
* [ ] **Docs:** Short README with examples; guidance for common failure scenarios.
* [ ] **CI-safe:** Runs on CI with no network and no ports.
* [ ] **Future-proof for queues:** Stub queue API surface `declare`/no-op with TODOs so it’s easy to wire later, without breaking tests today.
* [ ] **Imports:** Use existing namespace rules e.g., **@shared/ts/dist/**… where applicable. Don’t invent aliases.

---

## 📋 Subtasks

* [ ] **Define the contract**: Extract the minimal `BrokerClient` interface from current code pub/sub/unsub + message envelope, place an interface file in `@shared/ts` and ensure it’s the single source of truth.
* [ ] **Mock implementation**:

  * [ ] Implement `InMemoryBroker` per-instance: topic → subscribers (ordered Set).
  * [ ] Implement `publish(topic, message, opts?)`: immediate or scheduled dispatch.
  * [ ] Implement `subscribe(topic, handler, opts?)`: returns `unsubscribe()` cleanup.
  * [ ] Delivery semantics: default **in-order** per topic; optional “shuffle” to simulate out-of-order.
  * [ ] Backpressure: per-subscriber ring buffer with size limit and policy drop/head, drop/tail, throw, block with promise.
  * [ ] Failure injection:

    * [ ] `latencyMs` fixed or range
    * [ ] `dropRate` (0–1)
    * [ ] `disconnectAfter(N)` / `disconnectNow()`
    * [ ] `fault(topicPattern, predicate)` to selectively fail.
  * [ ] Fake clock (optional): tiny clock you can `advance(ms)` for timeout/retry tests.
  * [ ] Metrics: counters + event log for assertions.
* [ ] **Adapter / DI**:

  * [ ] Add `createBrokerClient()` factory that returns real or mock based on env or an injected token.
  * [ ] Keep API identical so services don’t branch.
* [ ] **Test Utilities** `@shared/ts/dist/test/broker-utils`:

  * [ ] `expectDelivered({topic, times, predicate})`
  * [ ] `awaitNextMessage(topic)` / `drain(topic)`
  * [ ] `recordingSubscriber()` to capture payloads with timestamps/seq ids.
  * [ ] `withMockBroker(config, fn)` fixture wrapper handles setup/teardown.
* [ ] **Refactor touch points**:

  * [ ] Replace direct imports of the real broker with the shared `BrokerClient` interface + factory in services that have tests.
  * [ ] Ensure no module reaches for WebSocket/HTTP transport directly during tests.
* [ ] **Initial conversions** pick high-value services first:

  * [ ] `services/ts/cephalon` contextManager / collectionManager
  * [ ] `services/ts/smartgpt-bridge` router/tools that publish events
  * [ ] `services/ts/heartbeat` (where it emits broker pings)
* [ ] **Add example tests** (vitest):

  * [ ] Happy path pub/sub ordering.
  * [ ] Unsubscribe stops delivery.
  * [ ] Latency/drops/backpressure behavior.
  * [ ] Timeout/retry logic using fake clock.
  * [ ] Fault injection by topic/predicate.
* [ ] **Docs**: `docs/testing/broker-mock.md` showing usage patterns and common pitfalls.
* [ ] **CI**: Ensure test command uses mock by default `BROKER_IMPL=mock`.

---

## 🧩 Design Notes (keep it simple, deterministic)

**Message envelope (mirror what you already use):**

```ts
type BrokerMessage<T = unknown> = {
  id: string;            // uuid
  topic: string;
  ts: number;            // epoch ms (fake clock if enabled)
  payload: T;
  headers?: Record<string, string>;
};
```

**Interface (shared, single source of truth):**

```ts
export interface BrokerClient {
  publish<T>(topic: string, msg: T, opts?: PublishOpts): Promise<void>;
  subscribe<T>(topic: string, handler: (msg: BrokerMessage<T>) => Promise<void> | void, opts?: SubOpts): Unsubscribe;
  unsubscribe(topic: string, handler: Function): void; // convenience
  close(): Promise<void>;
}
```
```
**Mock config (for tests):**
```
```ts
export type MockBrokerConfig = {
  latencyMs?: number | { min: number; max: number };
  dropRate?: number; // 0..1
  ordering?: 'in-order' | 'shuffle';
  bufferSize?: number; // per-subscriber
  overflow?: 'drop-oldest' | 'drop-newest' | 'throw' | 'block';
  useFakeClock?: boolean;
  faults?: Array<{ match: RegExp; when?: (m: BrokerMessage) => boolean; action: 'drop' | 'error' | 'delay' }>;
};
```
```
**Deterministic scheduler:**
```
* Default: synchronous inline delivery (fast unit tests).
* When latency or async mode is on, enqueue to a per-topic microtask queue controlled by the fake clock or a test-owned tick: `await broker.tick()` or `clock.advance(10)`.
```
**Backpressure:**
```
* Per handler, a ring buffer (size N). When full, follow `overflow` policy. Expose counters so tests can assert dropped vs delivered.
```
**Failure injection patterns:**
```
* Global `dropRate`.
* Topic-pattern faults: `faults: { match: /^voice\./, action: 'drop' }`.
* `disconnectNow()` to simulate transport death; further publish/subscribe throws.

---

## ✅ Acceptance Criteria

* [ ] Tests can run with **no network** and **no external broker**.
* [ ] The mock implements the same **public interface** as the real broker client; swapping impl requires **no test code changes** beyond factory usage.
* [ ] Deterministic ordering by default; controllable non-determinism (shuffle) when requested.
* [ ] Configurable latency, drops, disconnects, and backpressure; each is **assertable via metrics**.
* [ ] No global state leaks across tests; parallel test runs are isolated.
* [ ] Minimal docs + examples committed and referenced from `README` or `docs/testing/broker-mock.md`.
* [ ] CI uses the mock by default and passes on a clean tree.

---

## 🔗 Related Epics

* \#framework-core

---

## ⛓️ Blocked By

* Nothing

## ⛓️ Blocks

* Enables reliable tests for services coupled to broker messages cephalon, heartbeat, smartgpt-bridge, etc..

---

## 🔍 Relevant Links

* \\[kanban.md]
* \#incoming

---

## 🧪 Example Test Sketches vitest-style

```ts
it('delivers messages in order by default', async () => {
  const broker = createMockBroker({ ordering: 'in-order' });
  const seen: number[] = [];
  const unsub = broker.subscribe<number>('ctx.update', m => { seen.push(m.payload); });
  await broker.publish('ctx.update', 1);
  await broker.publish('ctx.update', 2);
  expect(seen).toEqual([1, 2]);
  unsub();
});

it('can inject latency and drop messages', async () => {
  const broker = createMockBroker({ latencyMs: 10, dropRate: 0.5 });
  const rec = recordingSubscriber<number>();
  broker.subscribe('voice.frame', rec.handler);
  for (let i = 0; i < 10; i++) await broker.publish('voice.frame', i);
  await broker.tickAll(); // drain scheduler
  expect(rec.count()).toBeLessThan(10);
  expect(broker.metrics().published).toBe(10);
  expect(broker.metrics().delivered + broker.metrics().dropped).toBe(10);
});
```

---

## ⚠️ Pitfalls & Guardrails

* Don’t let tests **implicitly depend on real time**; use the fake clock or explicit ticks.
* Keep the mock **simple**: avoid re-implementing transport layers. We only mimic **observable behavior**, not internal sockets.
* Mirror the **envelope shape** exactly to prevent brittle adapter code.
* No new TS path aliases. Use existing **@shared/ts/dist/** import patterns if/when this lands in shared.
* Resist feature creep: queue semantics can be stubbed behind an interface but implemented later.

---

## 🗂️ Proposed File Layout (suggest—adapt to your structure)

* `shared/ts/src/broker/types.ts` — `BrokerClient`, envelopes, opts
* `shared/ts/src/broker/mock.ts` — `InMemoryBroker`, scheduler, metrics
* `shared/ts/src/broker/fakeClock.ts` — tiny controllable clock
* `shared/ts/src/test/broker-utils.ts` — fixtures & assertions
* `services/ts/*/test/*.spec.ts` — conversions to use factory
* `docs/testing/broker-mock.md` — usage + patterns

---

## 📣 Definition of Done

* Mock broker shipped in shared code, exported through **@shared/ts/dist**.
* At least **two** broker-dependent services converted to use the factory in tests, with flaky tests removed.
* CI green with network disabled for those suites.
* Docs + examples merged.

#promethean #broker #mock #testing #vitest #typescript #di #inmemory #deterministic
```
#in-review
```








































































































































































































































































