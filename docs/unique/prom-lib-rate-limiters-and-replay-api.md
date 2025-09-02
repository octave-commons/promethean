---
uuid: aee4718b-9f8b-4635-a0c1-ef61c9bea8f1
created_at: 2025.08.08.19.08.25.md
filename: prom-lib-rate-limiters-and-replay-api
description: >-
  Implements token bucket rate limiting for WebSocket connections and topics,
  with backpressure handling, pause/resume controls, and a replay/export API for
  event data retrieval via HTTP NDJSON.
tags:
  - rate-limiting
  - backpressure
  - token-bucket
  - replay-api
  - event-store
  - ws-gateway
  - exactly-once
  - bench-harness
related_to_title: []
related_to_uuid: []
references: []
---
Alright, Part 4: **backpressure + rate limits, replay/export API, exactly-once-ish consumer, and a tiny bench harness**. Paste into `shared/js/prom-lib/` (and a `bench/` folder). Minimal but real. ^ref-aee4718b-1-0

---

# 1) Backpressure + Rate Limits

## 1a) Token bucket

```ts
// shared/js/prom-lib/rate/limiter.ts
export class TokenBucket {
  private capacity: number;
  private tokens: number;
  private refillPerSec: number;
  private last: number;

  constructor({ capacity, refillPerSec }: { capacity: number; refillPerSec: number }) {
    this.capacity = capacity;
    this.tokens = capacity;
    this.refillPerSec = refillPerSec;
    this.last = Date.now();
  }
  private refill() {
    const now = Date.now();
    const delta = (now - this.last) / 1000;
    this.tokens = Math.min(this.capacity, this.tokens + delta * this.refillPerSec);
    this.last = now;
  }
  tryConsume(n = 1): boolean {
    this.refill();
    if (this.tokens >= n) { this.tokens -= n; return true; }
    return false;
  }
  deficit(n = 1): number {
    this.refill();
    return Math.max(0, n - this.tokens);
  }
}
```
^ref-aee4718b-9-0

## 1b) Wire into WS Gateway (publish + per-sub delivery)
 ^ref-aee4718b-43-0
Add to your WS server:
 ^ref-aee4718b-45-0
```ts
// shared/js/prom-lib/ws/server.rate.ts
import { TokenBucket } from "../rate/limiter";

export function makeConnLimiter() {
  return new TokenBucket({ capacity: 200, refillPerSec: 200 }); // 200 msgs/sec burst
}
export function makeTopicLimiter(topic: string) {
  // customize per-topic if needed
  return new TokenBucket({ capacity: 1000, refillPerSec: 1000 });
}
^ref-aee4718b-45-0
``` ^ref-aee4718b-58-0

Patch `startWSGateway`: ^ref-aee4718b-60-0
 ^ref-aee4718b-61-0
* On connection: `const connLimiter = makeConnLimiter();`
* Maintain a `Map<string, TokenBucket>` for `topicLimiter`. ^ref-aee4718b-63-0

On **PUBLISH**: ^ref-aee4718b-65-0

```ts
if (!connLimiter.tryConsume(1)) return err("rate_limited", "conn publish rate exceeded");
const tl = topicLimiters.get(msg.topic) ?? (topicLimiters.set(msg.topic, makeTopicLimiter(msg.topic)), topicLimiters.get(msg.topic)!);
^ref-aee4718b-65-0
if (!tl.tryConsume(1)) return err("rate_limited", "topic publish rate exceeded"); ^ref-aee4718b-71-0
```
 ^ref-aee4718b-73-0
On **EVENT delivery** (inside subscribe handler), apply per-sub watermarks:

```ts
const deliver = () => {
  if (state.inflight.size >= maxInflight) return; // existing backpressure
  if (!connLimiter.tryConsume(1)) return;         // slow push if client is hot
^ref-aee4718b-73-0
  // (send EVENT ...)
};
``` ^ref-aee4718b-83-0

## 1c) Pause/Resume (optional ops)

Support client-controlled backpressure:
 ^ref-aee4718b-88-0
* `PAUSE { op:"PAUSE", topic, group }`
* `RESUME { op:"RESUME", topic, group }` ^ref-aee4718b-90-0

Track `state.paused` and skip sending when paused. Client resumes when ready. ^ref-aee4718b-92-0

Mermaid:

```mermaid
flowchart LR
  Pub[Client PUBLISH] --> |conn limiter| OKPub{OK?}
  OKPub -- no --> RL[rate_limited]
  OKPub -- yes --> Store[(EventStore)]
^ref-aee4718b-92-0
  push[Server push EVENT] --> |conn limiter + inflight<MAX| Client
  Client -- PAUSE --> Server
  Client -- RESUME --> Server
```
 ^ref-aee4718b-106-0
---

# 2) Replay / Export API (HTTP + NDJSON)

```ts
// shared/js/prom-lib/http/replay.ts
import express from "express";
import { MongoEventStore } from "../event/mongo";
import { UUID } from "../event/types";

export function startReplayAPI(store: MongoEventStore, { port = 8083 } = {}) {
  const app = express();

  // GET /replay?topic=t&from=earliest|ts|afterId&ts=...&afterId=...&limit=1000
  app.get("/replay", async (req, res) => {
    try {
      const topic = String(req.query.topic || "");
      if (!topic) return res.status(400).json({ error: "topic required" });

      const from = String(req.query.from || "earliest");
      const ts = req.query.ts ? Number(req.query.ts) : undefined;
      const afterId = req.query.afterId ? String(req.query.afterId) as UUID : undefined;
      const limit = req.query.limit ? Number(req.query.limit) : 1000;

      const events = await store.scan(topic, {
        ts: from === "ts" ? ts : from === "earliest" ? 0 : undefined,
        afterId: from === "afterId" ? afterId : undefined,
        limit
      });
      res.json({ topic, count: events.length, events });
    } catch (e: any) {
      res.status(500).json({ error: e.message ?? String(e) });
    }
  });

  // GET /export?topic=t&fromTs=...&toTs=...&ndjson=1
  app.get("/export", async (req, res) => {
    try {
      const topic = String(req.query.topic || "");
      const fromTs = Number(req.query.fromTs || 0);
      const toTs = Number(req.query.toTs || Date.now());
      const ndjson = String(req.query.ndjson || "1") === "1";

      res.setHeader("Content-Type", ndjson ? "application/x-ndjson" : "application/json");
      if (!ndjson) res.write("[");
      let first = true;
      const batchSize = 5000;
      let cursorTs = fromTs;
      while (true) {
        const batch = await store.scan(topic, { ts: cursorTs, limit: batchSize });
        const filtered = batch.filter(e => e.ts <= toTs);
        if (filtered.length === 0) break;
        for (const e of filtered) {
          if (ndjson) {
            res.write(JSON.stringify(e) + "\n");
          } else {
            if (!first) res.write(",");
            res.write(JSON.stringify(e));
            first = false;
          }
        }
        const last = filtered.at(-1)!;
        cursorTs = last.ts + 1;
        if (filtered.length < batchSize || cursorTs > toTs) break;
      }
      if (!ndjson) res.write("]");
      res.end();
    } catch (e: any) {
      res.status(500).json({ error: e.message ?? String(e) });
    }
^ref-aee4718b-106-0
  }); ^ref-aee4718b-178-0

  return app.listen(port, () => console.log(`[replay] on :${port}`));
}
```

**Indexes:** already covered: `{ topic:1, ts:1, id:1 }`.

--- ^ref-aee4718b-186-0

# 3) Exactly-once-ish Consumer Helper (idempotency)

## 3a) Dedupe store

```ts
^ref-aee4718b-186-0
// shared/js/prom-lib/dedupe/types.ts
export interface DedupeStore {
  seen(topic: string, group: string, id: string): Promise<boolean>;
  mark(topic: string, group: string, id: string, ttlMs?: number): Promise<void>;
}
```
^ref-aee4718b-194-0

```ts
// shared/js/prom-lib/dedupe/mongo.ts
import { Collection, Db } from "mongodb";
import { DedupeStore } from "./types";

type Row = { _id: string; expireAt?: Date };

export class MongoDedupe implements DedupeStore {
  private coll: Collection<Row>;
  constructor(db: Db, name = "dedupe") {
    this.coll = db.collection(name);
    // TTL index (optional)
    this.coll.createIndex({ expireAt: 1 }, { expireAfterSeconds: 0 }).catch(() => {});
  }
  key(t: string, g: string, id: string) { return `${t}::${g}::${id}`; }
  async seen(topic: string, group: string, id: string) {
    const doc = await this.coll.findOne({ _id: this.key(topic, group, id) }, { projection: { _id: 1 } });
    return !!doc;
  }
  async mark(topic: string, group: string, id: string, ttlMs = 7 * 24 * 3600 * 1000) {
    const expireAt = new Date(Date.now() + ttlMs);
    await this.coll.updateOne(
^ref-aee4718b-194-0
      { _id: this.key(topic, group, id) },
      { $setOnInsert: { expireAt } },
      { upsert: true }
    );
  }
}
^ref-aee4718b-226-0
```
^ref-aee4718b-226-0

## 3b) Wrapper

```ts
// shared/js/prom-lib/consumers/exactlyOnce.ts
import { EventBus, EventRecord } from "../event/types";
import { DedupeStore } from "../dedupe/types";

export async function subscribeExactlyOnce(
  bus: EventBus,
  topic: string,
  group: string,
  store: DedupeStore,
  handler: (e: EventRecord) => Promise<void>,
  opts: any = {}
) {
  return bus.subscribe(topic, group, async (e) => {
    if (await store.seen(topic, group, e.id)) {
^ref-aee4718b-226-0
      // already done; advance cursor ^ref-aee4718b-250-0
      return;
    }
    await handler(e);
    await store.mark(topic, group, e.id, opts.ttlMs);
  }, { ...opts, manualAck: false }); // we allow auto-ack since we mark-before-return
^ref-aee4718b-256-0
^ref-aee4718b-250-0
} ^ref-aee4718b-256-0 ^ref-aee4718b-260-0
^ref-aee4718b-260-0
^ref-aee4718b-256-0
^ref-aee4718b-250-0
```
^ref-aee4718b-260-0
^ref-aee4718b-256-0
^ref-aee4718b-250-0

> Semantics: if handler throws, it won’t mark; event is retried. If handler is non-transactional, you still have “at-least-once with dedupe”.

---

# 4) Bench Harness (throughput/latency)

Directory: `bench/`.

## 4a) Publisher

```ts
// bench/publish.ts
import { InMemoryEventBus } from "../shared/js/prom-lib/event/memory";

async function run() {
  const n = Number(process.env.N ?? 100_000);
  const topic = process.env.TOPIC ?? "bench.topic";
  const bus = new InMemoryEventBus();

  const t0 = Date.now();
^ref-aee4718b-260-0
  for (let i=0; i<n; i++) {
    // embed publish timestamp for latency
    await bus.publish(topic, { i, t0: Date.now() });
  }
  const dt = Date.now() - t0;
^ref-aee4718b-282-0
^ref-aee4718b-282-0
  console.log(JSON.stringify({ published: n, ms: dt, mps: (n/(dt/1000)).toFixed(1) }));
^ref-aee4718b-282-0
}
run();
```

## 4b) Subscriber (latency stats)

```ts
// bench/subscribe.ts
import { InMemoryEventBus } from "../shared/js/prom-lib/event/memory";

function pct(arr: number[], p: number) {
  const i = Math.max(0, Math.min(arr.length-1, Math.floor((p/100)*arr.length)));
  return arr[i] ?? 0;
}

async function run() {
  const n = Number(process.env.N ?? 100_000);
  const topic = process.env.TOPIC ?? "bench.topic";
  const bus = new InMemoryEventBus();
  const lats: number[] = [];
  let seen = 0;

  await bus.subscribe(topic, "bench", async (e) => {
    seen++;
    const t0 = (e.payload as any).t0 ?? e.ts;
    lats.push(Date.now() - t0);
  }, { from: "earliest", batchSize: 1000 });

  // generate and consume in same process for demo
  for (let i=0; i<n; i++) await bus.publish(topic, { i, t0: Date.now() });

  const wait = () => new Promise(r => setTimeout(r, 50));
  while (seen < n) await wait();
^ref-aee4718b-282-0

  lats.sort((a,b)=>a-b);
  const report = {
    n, p50: pct(lats,50), p90: pct(lats,90), p99: pct(lats,99),
    max: lats.at(-1) ?? 0, avg: Math.round(lats.reduce((a,b)=>a+b,0)/lats.length)
^ref-aee4718b-329-0
^ref-aee4718b-328-0
^ref-aee4718b-326-0 ^ref-aee4718b-332-0
^ref-aee4718b-337-0 ^ref-aee4718b-338-0
^ref-aee4718b-335-0
^ref-aee4718b-333-0 ^ref-aee4718b-340-0
^ref-aee4718b-332-0
^ref-aee4718b-329-0 ^ref-aee4718b-342-0
^ref-aee4718b-328-0 ^ref-aee4718b-343-0
^ref-aee4718b-326-0
  }; ^ref-aee4718b-333-0 ^ref-aee4718b-345-0
^ref-aee4718b-349-0
^ref-aee4718b-348-0 ^ref-aee4718b-351-0
^ref-aee4718b-347-0
^ref-aee4718b-345-0 ^ref-aee4718b-353-0
^ref-aee4718b-343-0 ^ref-aee4718b-354-0
^ref-aee4718b-342-0
^ref-aee4718b-340-0 ^ref-aee4718b-356-0
^ref-aee4718b-338-0
^ref-aee4718b-337-0 ^ref-aee4718b-358-0
^ref-aee4718b-335-0
^ref-aee4718b-333-0
^ref-aee4718b-332-0
^ref-aee4718b-329-0
^ref-aee4718b-328-0
^ref-aee4718b-326-0 ^ref-aee4718b-364-0
^ref-aee4718b-302-0
  console.log(JSON.stringify(report)); ^ref-aee4718b-326-0 ^ref-aee4718b-366-0
} ^ref-aee4718b-335-0 ^ref-aee4718b-347-0 ^ref-aee4718b-367-0
run(); ^ref-aee4718b-328-0 ^ref-aee4718b-348-0 ^ref-aee4718b-368-0
``` ^ref-aee4718b-329-0 ^ref-aee4718b-337-0 ^ref-aee4718b-349-0 ^ref-aee4718b-369-0
 ^ref-aee4718b-338-0
> Swap `InMemoryEventBus` for `MongoEventBus` to test I/O costs. ^ref-aee4718b-351-0
 ^ref-aee4718b-332-0 ^ref-aee4718b-340-0
--- ^ref-aee4718b-333-0 ^ref-aee4718b-353-0 ^ref-aee4718b-373-0
 ^ref-aee4718b-342-0 ^ref-aee4718b-354-0
# 5) Sizing & Ops Notes (Mongo) ^ref-aee4718b-335-0 ^ref-aee4718b-343-0 ^ref-aee4718b-375-0
 ^ref-aee4718b-356-0 ^ref-aee4718b-376-0
* **Indexes** ^ref-aee4718b-337-0 ^ref-aee4718b-345-0 ^ref-aee4718b-377-0
 ^ref-aee4718b-338-0 ^ref-aee4718b-358-0 ^ref-aee4718b-378-0
  * `events(topic, ts, id)` for scans and replay ^ref-aee4718b-347-0
  * `events(topic, key, ts)` for compaction/snapshots ^ref-aee4718b-340-0 ^ref-aee4718b-348-0 ^ref-aee4718b-380-0
  * `events(id)` unique ^ref-aee4718b-349-0
  * `cursors(_id)` unique ^ref-aee4718b-342-0 ^ref-aee4718b-382-0
  * `dedupe(expireAt)` TTL ^ref-aee4718b-343-0 ^ref-aee4718b-351-0
  * `outbox(status, lease_until)` + `outbox(ts)` ^ref-aee4718b-364-0 ^ref-aee4718b-384-0
 ^ref-aee4718b-345-0 ^ref-aee4718b-353-0
* **Retention** ^ref-aee4718b-354-0 ^ref-aee4718b-366-0 ^ref-aee4718b-386-0
 ^ref-aee4718b-347-0 ^ref-aee4718b-367-0
  * Use **TTL** or manual prune per topic. Keep raw `heartbeat.received` short (hours–days). ^ref-aee4718b-348-0 ^ref-aee4718b-356-0 ^ref-aee4718b-368-0
  * Store **snapshots** (`process.state.snapshot`) long-lived. ^ref-aee4718b-349-0 ^ref-aee4718b-369-0
 ^ref-aee4718b-358-0 ^ref-aee4718b-390-0
* **Write concern** ^ref-aee4718b-351-0 ^ref-aee4718b-391-0
 ^ref-aee4718b-392-0
  * `w:1` is fine for high-rate telemetry; bump to `w:majority` for business events. ^ref-aee4718b-353-0 ^ref-aee4718b-373-0
  * Consider **capped collections** only for ephemeral telemetry (but they don’t play great with arbitrary queries). ^ref-aee4718b-354-0 ^ref-aee4718b-394-0
 ^ref-aee4718b-375-0
* **Throughput** ^ref-aee4718b-356-0 ^ref-aee4718b-364-0 ^ref-aee4718b-376-0
 ^ref-aee4718b-377-0
  * Keep payloads small; push blobs to object storage and attach refs. ^ref-aee4718b-358-0 ^ref-aee4718b-366-0 ^ref-aee4718b-378-0
  * Batch publishers where possible (outbox drainer does). ^ref-aee4718b-367-0
  * Avoid massive fan-out groups; prefer projectors + snapshots. ^ref-aee4718b-368-0 ^ref-aee4718b-380-0
 ^ref-aee4718b-369-0
* **Hot topics** ^ref-aee4718b-382-0
 ^ref-aee4718b-403-0
  * Add per-topic token buckets. ^ref-aee4718b-364-0 ^ref-aee4718b-384-0
  * Use **PAUSE/RESUME** and **max inflight** to protect clients. ^ref-aee4718b-373-0 ^ref-aee4718b-405-0
 ^ref-aee4718b-366-0 ^ref-aee4718b-386-0
* **Cold start** ^ref-aee4718b-367-0 ^ref-aee4718b-375-0
 ^ref-aee4718b-368-0 ^ref-aee4718b-376-0
  * Consumers first load `*.snapshot`, then subscribe to the live topic from `latest`. ^ref-aee4718b-369-0 ^ref-aee4718b-377-0
 ^ref-aee4718b-378-0 ^ref-aee4718b-390-0
--- ^ref-aee4718b-391-0 ^ref-aee4718b-411-0
 ^ref-aee4718b-380-0 ^ref-aee4718b-392-0
# 6) Tiny Kanban Additions ^ref-aee4718b-373-0
 ^ref-aee4718b-382-0 ^ref-aee4718b-394-0
* [ ] Add `TokenBucket` to WS server (conn + per-topic) ^ref-aee4718b-375-0 ^ref-aee4718b-415-0
* [ ] Implement `PAUSE/RESUME` ops on gateway ^ref-aee4718b-376-0 ^ref-aee4718b-384-0
* [ ] Launch `ReplayAPI` on `:8083`; test `/replay` and `/export?ndjson=1` ^ref-aee4718b-377-0
* [ ] Add `MongoDedupe` and replace critical consumers with `subscribeExactlyOnce` ^ref-aee4718b-378-0 ^ref-aee4718b-386-0
* [ ] Run `bench/subscribe.ts` with Mongo bus and record p50/p99
* [ ] Add TTLs per topic via migration script ^ref-aee4718b-380-0

--- ^ref-aee4718b-382-0 ^ref-aee4718b-390-0
 ^ref-aee4718b-391-0 ^ref-aee4718b-403-0
Want **Part 5**? I can push: ^ref-aee4718b-384-0 ^ref-aee4718b-392-0
 ^ref-aee4718b-405-0
* **Stateful partitions** (hash by key for parallel consumers), ^ref-aee4718b-386-0 ^ref-aee4718b-394-0
* **Rebalance hooks** for consumer groups,
* **Schema registry lite** (zod validators per topic + evolution),
* and a **Changelog projector** (topic → materialized Mongo collection with upsert/unique constraints).<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [State Snapshots API and Transactional Projector](state-snapshots-api-and-transactional-projector.md)
- [Promethean Event Bus MVP v0.1](promethean-event-bus-mvp-v0-1.md)
- [schema-evolution-workflow](schema-evolution-workflow.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [Event Bus MVP](event-bus-mvp.md)
- [Mongo Outbox Implementation](mongo-outbox-implementation.md)
- [Stateful Partitions and Rebalancing](stateful-partitions-and-rebalancing.md)
- [Migrate to Provider-Tenant Architecture](migrate-to-provider-tenant-architecture.md)
- [Agent Tasks: Persistence Migration to DualStore](agent-tasks-persistence-migration-to-dualstore.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [Services](chunks/services.md)
- [Per-Domain Policy System for JS Crawler](per-domain-policy-system-for-js-crawler.md)
- [ecs-offload-workers](ecs-offload-workers.md)
- [Board Walk – 2025-08-11](board-walk-2025-08-11.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [Event Bus Projections Architecture](event-bus-projections-architecture.md)
- [aionian-circuit-math](aionian-circuit-math.md)
- [observability-infrastructure-setup](observability-infrastructure-setup.md)
- [Cross-Language Runtime Polymorphism](cross-language-runtime-polymorphism.md)
- [Cross-Target Macro System in Sibilant](cross-target-macro-system-in-sibilant.md)
- [Promethean-native config design](promethean-native-config-design.md)
- [Sibilant Meta-Prompt DSL](sibilant-meta-prompt-dsl.md)
- [template-based-compilation](template-based-compilation.md)
- [Unique Info Dump Index](unique-info-dump-index.md)
- [WebSocket Gateway Implementation](websocket-gateway-implementation.md)
- [Prompt_Folder_Bootstrap](prompt-folder-bootstrap.md)
- [AI-Centric OS with MCP Layer](ai-centric-os-with-mcp-layer.md)
- [ecs-scheduler-and-prefabs](ecs-scheduler-and-prefabs.md)
- [2d-sandbox-field](2d-sandbox-field.md)
- [heartbeat-fragment-demo](heartbeat-fragment-demo.md)
- [api-gateway-versioning](api-gateway-versioning.md)
- [Diagrams](chunks/diagrams.md)
- [DSL](chunks/dsl.md)
- [Admin Dashboard for User Management](admin-dashboard-for-user-management.md)
- [archetype-ecs](archetype-ecs.md)
- [Debugging Broker Connections and Agent Behavior](debugging-broker-connections-and-agent-behavior.md)
- [compiler-kit-foundations](compiler-kit-foundations.md)
- [Math Fundamentals](chunks/math-fundamentals.md)
- [JavaScript](chunks/javascript.md)
- [Tooling](chunks/tooling.md)
- [Agent Reflections and Prompt Evolution](agent-reflections-and-prompt-evolution.md)
- [Canonical Org-Babel Matplotlib Animation Template](canonical-org-babel-matplotlib-animation-template.md)
- [System Scheduler with Resource-Aware DAG](system-scheduler-with-resource-aware-dag.md)
- [sibilant-metacompiler-overview](sibilant-metacompiler-overview.md)
- [typed-struct-compiler](typed-struct-compiler.md)
- [ts-to-lisp-transpiler](ts-to-lisp-transpiler.md)
- [sibilant-macro-targets](sibilant-macro-targets.md)
- [sibilant-meta-string-templating-runtime](sibilant-meta-string-templating-runtime.md)
- [Exception Layer Analysis](exception-layer-analysis.md)
- [Model Selection for Lightweight Conversational Tasks](model-selection-for-lightweight-conversational-tasks.md)
- [Obsidian ChatGPT Plugin Integration](obsidian-chatgpt-plugin-integration.md)
- [Obsidian ChatGPT Plugin Integration Guide](obsidian-chatgpt-plugin-integration-guide.md)
- [balanced-bst](balanced-bst.md)
- [polymorphic-meta-programming-engine](polymorphic-meta-programming-engine.md)
- [field-interaction-equations](field-interaction-equations.md)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler](ollama-llm-provider-for-pseudo-code-transpiler.md)
- [obsidian-ignore-node-modules-regex](obsidian-ignore-node-modules-regex.md)
- [Simulation Demo](chunks/simulation-demo.md)
- [Window Management](chunks/window-management.md)
- [markdown-to-org-transpiler](markdown-to-org-transpiler.md)
- [ParticleSimulationWithCanvasAndFFmpeg](particlesimulationwithcanvasandffmpeg.md)
- [Factorio AI with External Agents](factorio-ai-with-external-agents.md)
- [Matplotlib Animation with Async Execution](matplotlib-animation-with-async-execution.md)
- [Eidolon Field Abstract Model](eidolon-field-abstract-model.md)
- [Promethean Agent Config DSL](promethean-agent-config-dsl.md)
- [field-dynamics-math-blocks](field-dynamics-math-blocks.md)
- [eidolon-node-lifecycle](eidolon-node-lifecycle.md)
- [Duck's Self-Referential Perceptual Loop](ducks-self-referential-perceptual-loop.md)
- [field-node-diagram-outline](field-node-diagram-outline.md)
- [Shared](chunks/shared.md)
- [AI-First-OS-Model-Context-Protocol](ai-first-os-model-context-protocol.md)
- [EidolonField](eidolonfield.md)
- [Promethean-Copilot-Intent-Engine](promethean-copilot-intent-engine.md)
- [Chroma-Embedding-Refactor](chroma-embedding-refactor.md)
- [Promethean Infrastructure Setup](promethean-infrastructure-setup.md)
- [Promethean Web UI Setup](promethean-web-ui-setup.md)
- [i3-config-validation-methods](i3-config-validation-methods.md)
- [graph-ds](graph-ds.md)
- [Board Automation Improvements](board-automation-improvements.md)
- [heartbeat-simulation-snippets](heartbeat-simulation-snippets.md)
- [field-node-diagram-set](field-node-diagram-set.md)
- [field-node-diagram-visualizations](field-node-diagram-visualizations.md)
- [Duck's Attractor States](ducks-attractor-states.md)
- [promethean-system-diagrams](promethean-system-diagrams.md)
- [prompt-programming-language-lisp](prompt-programming-language-lisp.md)
- [Promethean_Eidolon_Synchronicity_Model](promethean-eidolon-synchronicity-model.md)
- [Lispy Macros with syntax-rules](lispy-macros-with-syntax-rules.md)
- [Local-Offline-Model-Deployment-Strategy](local-offline-model-deployment-strategy.md)
- [Protocol_0_The_Contradiction_Engine](protocol-0-the-contradiction-engine.md)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop](polyglot-s-expr-bridge-python-js-lisp-interop.md)
- [Local-Only-LLM-Workflow](local-only-llm-workflow.md)
- [Obsidian Templating Plugins Integration Guide](obsidian-templating-plugins-integration-guide.md)
- [Fnord Tracer Protocol](fnord-tracer-protocol.md)
- [Local-First Intention→Code Loop with Free Models](local-first-intention-code-loop-with-free-models.md)
- [Operations](chunks/operations.md)
- [i3-bluetooth-setup](i3-bluetooth-setup.md)
- [homeostasis-decay-formulas](homeostasis-decay-formulas.md)
- [Provider-Agnostic Chat Panel Implementation](provider-agnostic-chat-panel-implementation.md)
- [Shared Package Structure](shared-package-structure.md)
- [Language-Agnostic Mirror System](language-agnostic-mirror-system.md)
- [layer-1-uptime-diagrams](layer-1-uptime-diagrams.md)
- [Lisp-Compiler-Integration](lisp-compiler-integration.md)
- [lisp-dsl-for-window-management](lisp-dsl-for-window-management.md)
- [zero-copy-snapshots-and-workers](zero-copy-snapshots-and-workers.md)
- [ripple-propagation-demo](ripple-propagation-demo.md)
- [Promethean Workflow Optimization](promethean-workflow-optimization.md)
- [Prometheus Observability Stack](prometheus-observability-stack.md)
- [Pure-Node Crawl Stack with Playwright and Crawlee](pure-node-crawl-stack-with-playwright-and-crawlee.md)
- [Functional Embedding Pipeline Refactor](functional-embedding-pipeline-refactor.md)
- [Pure TypeScript Search Microservice](pure-typescript-search-microservice.md)
- [komorebi-group-window-hack](komorebi-group-window-hack.md)
- [RAG UI Panel with Qdrant and PostgREST](rag-ui-panel-with-qdrant-and-postgrest.md)
- [Self-Agency in AI Interaction](self-agency-in-ai-interaction.md)
- [shared-package-layout-clarification](shared-package-layout-clarification.md)
- [set-assignment-in-lisp-ast](set-assignment-in-lisp-ast.md)
- [Interop and Source Maps](interop-and-source-maps.md)
- [Creative Moments](creative-moments.md)
- [DuckDuckGoSearchPipeline](duckduckgosearchpipeline.md)
- [Voice Access Layer Design](voice-access-layer-design.md)
- [universal-intention-code-fabric](universal-intention-code-fabric.md)
- [Promethean State Format](promethean-state-format.md)
- [Promethean Agent DSL TS Scaffold](promethean-agent-dsl-ts-scaffold.md)
- [TypeScript Patch for Tool Calling Support](typescript-patch-for-tool-calling-support.md)
- [js-to-lisp-reverse-compiler](js-to-lisp-reverse-compiler.md)
- [Performance-Optimized-Polyglot-Bridge](performance-optimized-polyglot-bridge.md)
- [Recursive Prompt Construction Engine](recursive-prompt-construction-engine.md)
- [Refactor Frontmatter Processing](refactor-frontmatter-processing.md)
- [Tracing the Signal](tracing-the-signal.md)
- [Promethean Pipelines](promethean-pipelines.md)
- [plan-update-confirmation](plan-update-confirmation.md)
- [Promethean Documentation Pipeline Overview](promethean-documentation-pipeline-overview.md)
- [Layer1SurvivabilityEnvelope](layer1survivabilityenvelope.md)
- [Ice Box Reorganization](ice-box-reorganization.md)
- [pm2-orchestration-patterns](pm2-orchestration-patterns.md)
- [Optimizing Command Limitations in System Design](optimizing-command-limitations-in-system-design.md)
- [polyglot-repl-interface-layer](polyglot-repl-interface-layer.md)
- [Vectorial Exception Descent](vectorial-exception-descent.md)
- [Model Upgrade Calm-Down Guide](model-upgrade-calm-down-guide.md)
- [windows-tiling-with-autohotkey](windows-tiling-with-autohotkey.md)
- [Promethean Dev Workflow Update](promethean-dev-workflow-update.md)
- [Smoke Resonance Visualizations](smoke-resonance-visualizations.md)
- [Functional Refactor of TypeScript Document Processing](functional-refactor-of-typescript-document-processing.md)
## Sources
- [State Snapshots API and Transactional Projector — L3](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-3-0) (line 3, col 0, score 0.62)
- [Mongo Outbox Implementation — L544](mongo-outbox-implementation.md#^ref-9c1acd1e-544-0) (line 544, col 0, score 0.7)
- [Promethean Event Bus MVP v0.1 — L15](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-15-0) (line 15, col 0, score 0.59)
- [schema-evolution-workflow — L3](schema-evolution-workflow.md#^ref-d8059b6a-3-0) (line 3, col 0, score 0.7)
- [Stateful Partitions and Rebalancing — L3](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-3-0) (line 3, col 0, score 0.72)
- [Mongo Outbox Implementation — L3](mongo-outbox-implementation.md#^ref-9c1acd1e-3-0) (line 3, col 0, score 0.68)
- [Migrate to Provider-Tenant Architecture — L144](migrate-to-provider-tenant-architecture.md#^ref-54382370-144-0) (line 144, col 0, score 0.58)
- [Voice Access Layer Design — L202](voice-access-layer-design.md#^ref-543ed9b3-202-0) (line 202, col 0, score 0.73)
- [WebSocket Gateway Implementation — L1](websocket-gateway-implementation.md#^ref-e811123d-1-0) (line 1, col 0, score 0.57)
- [Lispy Macros with syntax-rules — L1](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-1-0) (line 1, col 0, score 0.65)
- [Per-Domain Policy System for JS Crawler — L458](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-458-0) (line 458, col 0, score 0.65)
- [Event Bus MVP — L534](event-bus-mvp.md#^ref-534fe91d-534-0) (line 534, col 0, score 0.64)
- [compiler-kit-foundations — L31](compiler-kit-foundations.md#^ref-01b21543-31-0) (line 31, col 0, score 0.71)
- [Promethean Event Bus MVP v0.1 — L497](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-497-0) (line 497, col 0, score 0.69)
- [Event Bus MVP — L99](event-bus-mvp.md#^ref-534fe91d-99-0) (line 99, col 0, score 0.74)
- [ecs-offload-workers — L169](ecs-offload-workers.md#^ref-6498b9d7-169-0) (line 169, col 0, score 0.68)
- [schema-evolution-workflow — L9](schema-evolution-workflow.md#^ref-d8059b6a-9-0) (line 9, col 0, score 0.75)
- [Promethean Event Bus MVP v0.1 — L733](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-733-0) (line 733, col 0, score 0.69)
- [schema-evolution-workflow — L289](schema-evolution-workflow.md#^ref-d8059b6a-289-0) (line 289, col 0, score 0.7)
- [Mongo Outbox Implementation — L381](mongo-outbox-implementation.md#^ref-9c1acd1e-381-0) (line 381, col 0, score 0.72)
- [balanced-bst — L3](balanced-bst.md#^ref-d3e7db72-3-0) (line 3, col 0, score 0.66)
- [State Snapshots API and Transactional Projector — L93](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-93-0) (line 93, col 0, score 0.75)
- [archetype-ecs — L7](archetype-ecs.md#^ref-8f4c1e86-7-0) (line 7, col 0, score 0.66)
- [Stateful Partitions and Rebalancing — L351](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-351-0) (line 351, col 0, score 0.69)
- [universal-intention-code-fabric — L252](universal-intention-code-fabric.md#^ref-c14edce7-252-0) (line 252, col 0, score 0.66)
- [ecs-offload-workers — L187](ecs-offload-workers.md#^ref-6498b9d7-187-0) (line 187, col 0, score 0.69)
- [Mongo Outbox Implementation — L74](mongo-outbox-implementation.md#^ref-9c1acd1e-74-0) (line 74, col 0, score 0.79)
- [WebSocket Gateway Implementation — L333](websocket-gateway-implementation.md#^ref-e811123d-333-0) (line 333, col 0, score 0.7)
- [WebSocket Gateway Implementation — L615](websocket-gateway-implementation.md#^ref-e811123d-615-0) (line 615, col 0, score 0.72)
- [Mongo Outbox Implementation — L284](mongo-outbox-implementation.md#^ref-9c1acd1e-284-0) (line 284, col 0, score 0.68)
- [ecs-offload-workers — L434](ecs-offload-workers.md#^ref-6498b9d7-434-0) (line 434, col 0, score 0.71)
- [Agent Tasks: Persistence Migration to DualStore — L8](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-8-0) (line 8, col 0, score 0.68)
- [Chroma-Embedding-Refactor — L26](chroma-embedding-refactor.md#^ref-8b256935-26-0) (line 26, col 0, score 0.69)
- [Board Walk – 2025-08-11 — L90](board-walk-2025-08-11.md#^ref-7aa1eb92-90-0) (line 90, col 0, score 0.68)
- [eidolon-field-math-foundations — L105](eidolon-field-math-foundations.md#^ref-008f2ac0-105-0) (line 105, col 0, score 0.67)
- [Per-Domain Policy System for JS Crawler — L115](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-115-0) (line 115, col 0, score 0.67)
- [WebSocket Gateway Implementation — L613](websocket-gateway-implementation.md#^ref-e811123d-613-0) (line 613, col 0, score 0.65)
- [Event Bus MVP — L532](event-bus-mvp.md#^ref-534fe91d-532-0) (line 532, col 0, score 0.64)
- [Migrate to Provider-Tenant Architecture — L38](migrate-to-provider-tenant-architecture.md#^ref-54382370-38-0) (line 38, col 0, score 0.64)
- [schema-evolution-workflow — L98](schema-evolution-workflow.md#^ref-d8059b6a-98-0) (line 98, col 0, score 0.7)
- [WebSocket Gateway Implementation — L322](websocket-gateway-implementation.md#^ref-e811123d-322-0) (line 322, col 0, score 0.71)
- [schema-evolution-workflow — L146](schema-evolution-workflow.md#^ref-d8059b6a-146-0) (line 146, col 0, score 0.77)
- [WebSocket Gateway Implementation — L56](websocket-gateway-implementation.md#^ref-e811123d-56-0) (line 56, col 0, score 0.62)
- [WebSocket Gateway Implementation — L533](websocket-gateway-implementation.md#^ref-e811123d-533-0) (line 533, col 0, score 0.72)
- [schema-evolution-workflow — L243](schema-evolution-workflow.md#^ref-d8059b6a-243-0) (line 243, col 0, score 0.71)
- [universal-intention-code-fabric — L127](universal-intention-code-fabric.md#^ref-c14edce7-127-0) (line 127, col 0, score 0.69)
- [Stateful Partitions and Rebalancing — L166](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-166-0) (line 166, col 0, score 0.75)
- [schema-evolution-workflow — L201](schema-evolution-workflow.md#^ref-d8059b6a-201-0) (line 201, col 0, score 0.72)
- [AI-Centric OS with MCP Layer — L11](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-11-0) (line 11, col 0, score 0.74)
- [Chroma-Embedding-Refactor — L64](chroma-embedding-refactor.md#^ref-8b256935-64-0) (line 64, col 0, score 0.64)
- [Chroma-Embedding-Refactor — L109](chroma-embedding-refactor.md#^ref-8b256935-109-0) (line 109, col 0, score 0.64)
- [Chroma-Embedding-Refactor — L258](chroma-embedding-refactor.md#^ref-8b256935-258-0) (line 258, col 0, score 0.64)
- [Chroma Toolkit Consolidation Plan — L72](chroma-toolkit-consolidation-plan.md#^ref-5020e892-72-0) (line 72, col 0, score 0.64)
- [Chroma Toolkit Consolidation Plan — L88](chroma-toolkit-consolidation-plan.md#^ref-5020e892-88-0) (line 88, col 0, score 0.64)
- [Chroma Toolkit Consolidation Plan — L107](chroma-toolkit-consolidation-plan.md#^ref-5020e892-107-0) (line 107, col 0, score 0.69)
- [Chroma Toolkit Consolidation Plan — L148](chroma-toolkit-consolidation-plan.md#^ref-5020e892-148-0) (line 148, col 0, score 0.64)
- [Chroma-Embedding-Refactor — L9](chroma-embedding-refactor.md#^ref-8b256935-9-0) (line 9, col 0, score 0.72)
- [Chroma Toolkit Consolidation Plan — L162](chroma-toolkit-consolidation-plan.md#^ref-5020e892-162-0) (line 162, col 0, score 0.74)
- [Dynamic Context Model for Web Components — L331](dynamic-context-model-for-web-components.md#^ref-f7702bf8-331-0) (line 331, col 0, score 0.73)
- [Promethean-native config design — L31](promethean-native-config-design.md#^ref-ab748541-31-0) (line 31, col 0, score 0.73)
- [Chroma Toolkit Consolidation Plan — L137](chroma-toolkit-consolidation-plan.md#^ref-5020e892-137-0) (line 137, col 0, score 0.77)
- [Promethean-native config design — L32](promethean-native-config-design.md#^ref-ab748541-32-0) (line 32, col 0, score 0.65)
- [Promethean-native config design — L33](promethean-native-config-design.md#^ref-ab748541-33-0) (line 33, col 0, score 0.65)
- [Local-Offline-Model-Deployment-Strategy — L234](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-234-0) (line 234, col 0, score 0.64)
- [Chroma-Embedding-Refactor — L107](chroma-embedding-refactor.md#^ref-8b256935-107-0) (line 107, col 0, score 0.63)
- [Dynamic Context Model for Web Components — L31](dynamic-context-model-for-web-components.md#^ref-f7702bf8-31-0) (line 31, col 0, score 0.66)
- [Protocol_0_The_Contradiction_Engine — L50](protocol-0-the-contradiction-engine.md#^ref-9a93a756-50-0) (line 50, col 0, score 0.63)
- [polymorphic-meta-programming-engine — L142](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-142-0) (line 142, col 0, score 0.69)
- [Chroma-Embedding-Refactor — L104](chroma-embedding-refactor.md#^ref-8b256935-104-0) (line 104, col 0, score 0.61)
- [Promethean Event Bus MVP v0.1 — L117](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-117-0) (line 117, col 0, score 1)
- [Promethean Event Bus MVP v0.1 — L141](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-141-0) (line 141, col 0, score 0.93)
- [Promethean Event Bus MVP v0.1 — L348](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-348-0) (line 348, col 0, score 0.8)
- [Promethean Event Bus MVP v0.1 — L220](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-220-0) (line 220, col 0, score 0.68)
- [WebSocket Gateway Implementation — L437](websocket-gateway-implementation.md#^ref-e811123d-437-0) (line 437, col 0, score 0.75)
- [universal-intention-code-fabric — L27](universal-intention-code-fabric.md#^ref-c14edce7-27-0) (line 27, col 0, score 0.74)
- [Migrate to Provider-Tenant Architecture — L179](migrate-to-provider-tenant-architecture.md#^ref-54382370-179-0) (line 179, col 0, score 0.74)
- [Stateful Partitions and Rebalancing — L326](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-326-0) (line 326, col 0, score 0.77)
- [Promethean Event Bus MVP v0.1 — L222](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-222-0) (line 222, col 0, score 0.71)
- [Stateful Partitions and Rebalancing — L202](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-202-0) (line 202, col 0, score 0.66)
- [ecs-scheduler-and-prefabs — L7](ecs-scheduler-and-prefabs.md#^ref-c62a1815-7-0) (line 7, col 0, score 0.65)
- [System Scheduler with Resource-Aware DAG — L5](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-5-0) (line 5, col 0, score 0.65)
- [js-to-lisp-reverse-compiler — L13](js-to-lisp-reverse-compiler.md#^ref-58191024-13-0) (line 13, col 0, score 0.68)
- [compiler-kit-foundations — L359](compiler-kit-foundations.md#^ref-01b21543-359-0) (line 359, col 0, score 0.67)
- [State Snapshots API and Transactional Projector — L179](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-179-0) (line 179, col 0, score 0.72)
- [Promethean Agent DSL TS Scaffold — L389](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-389-0) (line 389, col 0, score 0.66)
- [Lispy Macros with syntax-rules — L9](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-9-0) (line 9, col 0, score 0.65)
- [Promethean Event Bus MVP v0.1 — L604](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-604-0) (line 604, col 0, score 0.7)
- [Promethean Event Bus MVP v0.1 — L510](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-510-0) (line 510, col 0, score 0.77)
- [Mongo Outbox Implementation — L148](mongo-outbox-implementation.md#^ref-9c1acd1e-148-0) (line 148, col 0, score 0.64)
- [WebSocket Gateway Implementation — L614](websocket-gateway-implementation.md#^ref-e811123d-614-0) (line 614, col 0, score 0.65)
- [Stateful Partitions and Rebalancing — L347](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-347-0) (line 347, col 0, score 0.64)
- [Stateful Partitions and Rebalancing — L101](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-101-0) (line 101, col 0, score 0.76)
- [Stateful Partitions and Rebalancing — L512](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-512-0) (line 512, col 0, score 0.59)
- [Event Bus MVP — L434](event-bus-mvp.md#^ref-534fe91d-434-0) (line 434, col 0, score 0.64)
- [Migrate to Provider-Tenant Architecture — L156](migrate-to-provider-tenant-architecture.md#^ref-54382370-156-0) (line 156, col 0, score 0.6)
- [WebSocket Gateway Implementation — L9](websocket-gateway-implementation.md#^ref-e811123d-9-0) (line 9, col 0, score 0.72)
- [Promethean Event Bus MVP v0.1 — L96](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-96-0) (line 96, col 0, score 0.64)
- [Event Bus Projections Architecture — L108](event-bus-projections-architecture.md#^ref-cf6b9b17-108-0) (line 108, col 0, score 0.64)
- [TypeScript Patch for Tool Calling Support — L67](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-67-0) (line 67, col 0, score 0.7)
- [Promethean Event Bus MVP v0.1 — L235](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-235-0) (line 235, col 0, score 0.68)
- [Performance-Optimized-Polyglot-Bridge — L170](performance-optimized-polyglot-bridge.md#^ref-f5579967-170-0) (line 170, col 0, score 0.62)
- [WebSocket Gateway Implementation — L219](websocket-gateway-implementation.md#^ref-e811123d-219-0) (line 219, col 0, score 0.72)
- [Cross-Language Runtime Polymorphism — L38](cross-language-runtime-polymorphism.md#^ref-c34c36a6-38-0) (line 38, col 0, score 0.63)
- [Promethean Event Bus MVP v0.1 — L764](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-764-0) (line 764, col 0, score 0.66)
- [Promethean Event Bus MVP v0.1 — L28](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-28-0) (line 28, col 0, score 0.7)
- [Provider-Agnostic Chat Panel Implementation — L183](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-183-0) (line 183, col 0, score 0.65)
- [Performance-Optimized-Polyglot-Bridge — L13](performance-optimized-polyglot-bridge.md#^ref-f5579967-13-0) (line 13, col 0, score 0.61)
- [Functional Embedding Pipeline Refactor — L304](functional-embedding-pipeline-refactor.md#^ref-a4a25141-304-0) (line 304, col 0, score 0.64)
- [Migrate to Provider-Tenant Architecture — L214](migrate-to-provider-tenant-architecture.md#^ref-54382370-214-0) (line 214, col 0, score 0.62)
- [field-interaction-equations — L126](field-interaction-equations.md#^ref-b09141b7-126-0) (line 126, col 0, score 0.6)
- [TypeScript Patch for Tool Calling Support — L263](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-263-0) (line 263, col 0, score 0.6)
- [Promethean Event Bus MVP v0.1 — L182](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-182-0) (line 182, col 0, score 0.6)
- [Promethean Event Bus MVP v0.1 — L331](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-331-0) (line 331, col 0, score 0.59)
- [Promethean Event Bus MVP v0.1 — L153](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-153-0) (line 153, col 0, score 0.65)
- [plan-update-confirmation — L474](plan-update-confirmation.md#^ref-b22d79c6-474-0) (line 474, col 0, score 0.65)
- [WebSocket Gateway Implementation — L48](websocket-gateway-implementation.md#^ref-e811123d-48-0) (line 48, col 0, score 0.65)
- [AI-Centric OS with MCP Layer — L384](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-384-0) (line 384, col 0, score 0.6)
- [plan-update-confirmation — L540](plan-update-confirmation.md#^ref-b22d79c6-540-0) (line 540, col 0, score 0.62)
- [plan-update-confirmation — L429](plan-update-confirmation.md#^ref-b22d79c6-429-0) (line 429, col 0, score 0.64)
- [Dynamic Context Model for Web Components — L187](dynamic-context-model-for-web-components.md#^ref-f7702bf8-187-0) (line 187, col 0, score 0.64)
- [Promethean Event Bus MVP v0.1 — L825](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-825-0) (line 825, col 0, score 0.64)
- [schema-evolution-workflow — L130](schema-evolution-workflow.md#^ref-d8059b6a-130-0) (line 130, col 0, score 1)
- [schema-evolution-workflow — L222](schema-evolution-workflow.md#^ref-d8059b6a-222-0) (line 222, col 0, score 1)
- [State Snapshots API and Transactional Projector — L233](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-233-0) (line 233, col 0, score 1)
- [Mongo Outbox Implementation — L305](mongo-outbox-implementation.md#^ref-9c1acd1e-305-0) (line 305, col 0, score 0.84)
- [Stateful Partitions and Rebalancing — L185](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-185-0) (line 185, col 0, score 0.58)
- [Dynamic Context Model for Web Components — L376](dynamic-context-model-for-web-components.md#^ref-f7702bf8-376-0) (line 376, col 0, score 0.77)
- [Event Bus Projections Architecture — L3](event-bus-projections-architecture.md#^ref-cf6b9b17-3-0) (line 3, col 0, score 0.71)
- [schema-evolution-workflow — L132](schema-evolution-workflow.md#^ref-d8059b6a-132-0) (line 132, col 0, score 0.71)
- [Promethean Event Bus MVP v0.1 — L832](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-832-0) (line 832, col 0, score 0.7)
- [Promethean Infrastructure Setup — L501](promethean-infrastructure-setup.md#^ref-6deed6ac-501-0) (line 501, col 0, score 0.68)
- [Event Bus Projections Architecture — L54](event-bus-projections-architecture.md#^ref-cf6b9b17-54-0) (line 54, col 0, score 0.68)
- [Event Bus Projections Architecture — L5](event-bus-projections-architecture.md#^ref-cf6b9b17-5-0) (line 5, col 0, score 0.67)
- [Agent Tasks: Persistence Migration to DualStore — L134](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-134-0) (line 134, col 0, score 0.67)
- [Chroma Toolkit Consolidation Plan — L164](chroma-toolkit-consolidation-plan.md#^ref-5020e892-164-0) (line 164, col 0, score 0.67)
- [Services — L18](chunks/services.md#^ref-75ea4a6a-18-0) (line 18, col 0, score 0.67)
- [Cross-Language Runtime Polymorphism — L230](cross-language-runtime-polymorphism.md#^ref-c34c36a6-230-0) (line 230, col 0, score 0.67)
- [ecs-offload-workers — L483](ecs-offload-workers.md#^ref-6498b9d7-483-0) (line 483, col 0, score 0.67)
- [eidolon-field-math-foundations — L148](eidolon-field-math-foundations.md#^ref-008f2ac0-148-0) (line 148, col 0, score 0.67)
- [Mongo Outbox Implementation — L323](mongo-outbox-implementation.md#^ref-9c1acd1e-323-0) (line 323, col 0, score 0.72)
- [Event Bus MVP — L284](event-bus-mvp.md#^ref-534fe91d-284-0) (line 284, col 0, score 0.72)
- [State Snapshots API and Transactional Projector — L9](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-9-0) (line 9, col 0, score 0.7)
- [State Snapshots API and Transactional Projector — L218](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-218-0) (line 218, col 0, score 0.69)
- [Event Bus MVP — L7](event-bus-mvp.md#^ref-534fe91d-7-0) (line 7, col 0, score 0.72)
- [schema-evolution-workflow — L393](schema-evolution-workflow.md#^ref-d8059b6a-393-0) (line 393, col 0, score 0.61)
- [Stateful Partitions and Rebalancing — L448](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-448-0) (line 448, col 0, score 0.7)
- [Mongo Outbox Implementation — L451](mongo-outbox-implementation.md#^ref-9c1acd1e-451-0) (line 451, col 0, score 0.69)
- [Shared Package Structure — L117](shared-package-structure.md#^ref-66a72fc3-117-0) (line 117, col 0, score 0.67)
- [Promethean Web UI Setup — L351](promethean-web-ui-setup.md#^ref-bc5172ca-351-0) (line 351, col 0, score 0.67)
- [Promethean Infrastructure Setup — L439](promethean-infrastructure-setup.md#^ref-6deed6ac-439-0) (line 439, col 0, score 0.73)
- [sibilant-metacompiler-overview — L51](sibilant-metacompiler-overview.md#^ref-61d4086b-51-0) (line 51, col 0, score 0.72)
- [Promethean Infrastructure Setup — L415](promethean-infrastructure-setup.md#^ref-6deed6ac-415-0) (line 415, col 0, score 0.71)
- [Promethean Event Bus MVP v0.1 — L380](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-380-0) (line 380, col 0, score 0.71)
- [Promethean Infrastructure Setup — L485](promethean-infrastructure-setup.md#^ref-6deed6ac-485-0) (line 485, col 0, score 0.7)
- [universal-intention-code-fabric — L68](universal-intention-code-fabric.md#^ref-c14edce7-68-0) (line 68, col 0, score 0.75)
- [Promethean Agent DSL TS Scaffold — L160](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-160-0) (line 160, col 0, score 0.7)
- [Pure TypeScript Search Microservice — L378](pure-typescript-search-microservice.md#^ref-d17d3a96-378-0) (line 378, col 0, score 0.69)
- [Provider-Agnostic Chat Panel Implementation — L84](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-84-0) (line 84, col 0, score 0.7)
- [Promethean Infrastructure Setup — L224](promethean-infrastructure-setup.md#^ref-6deed6ac-224-0) (line 224, col 0, score 0.68)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L7](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-7-0) (line 7, col 0, score 0.68)
- [Refactor Frontmatter Processing — L11](refactor-frontmatter-processing.md#^ref-cfbdca2f-11-0) (line 11, col 0, score 0.67)
- [universal-intention-code-fabric — L277](universal-intention-code-fabric.md#^ref-c14edce7-277-0) (line 277, col 0, score 0.67)
- [Pure TypeScript Search Microservice — L306](pure-typescript-search-microservice.md#^ref-d17d3a96-306-0) (line 306, col 0, score 0.66)
- [api-gateway-versioning — L79](api-gateway-versioning.md#^ref-0580dcd3-79-0) (line 79, col 0, score 0.66)
- [Functional Embedding Pipeline Refactor — L31](functional-embedding-pipeline-refactor.md#^ref-a4a25141-31-0) (line 31, col 0, score 0.66)
- [Mongo Outbox Implementation — L545](mongo-outbox-implementation.md#^ref-9c1acd1e-545-0) (line 545, col 0, score 0.64)
- [Promethean Event Bus MVP v0.1 — L102](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-102-0) (line 102, col 0, score 0.89)
- [WebSocket Gateway Implementation — L378](websocket-gateway-implementation.md#^ref-e811123d-378-0) (line 378, col 0, score 0.71)
- [State Snapshots API and Transactional Projector — L83](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-83-0) (line 83, col 0, score 0.6)
- [Migrate to Provider-Tenant Architecture — L66](migrate-to-provider-tenant-architecture.md#^ref-54382370-66-0) (line 66, col 0, score 0.8)
- [Stateful Partitions and Rebalancing — L514](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-514-0) (line 514, col 0, score 0.65)
- [Promethean Event Bus MVP v0.1 — L423](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-423-0) (line 423, col 0, score 0.73)
- [Mongo Outbox Implementation — L11](mongo-outbox-implementation.md#^ref-9c1acd1e-11-0) (line 11, col 0, score 0.74)
- [Promethean Event Bus MVP v0.1 — L740](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-740-0) (line 740, col 0, score 0.72)
- [WebSocket Gateway Implementation — L447](websocket-gateway-implementation.md#^ref-e811123d-447-0) (line 447, col 0, score 0.72)
- [schema-evolution-workflow — L161](schema-evolution-workflow.md#^ref-d8059b6a-161-0) (line 161, col 0, score 0.72)
- [Language-Agnostic Mirror System — L52](language-agnostic-mirror-system.md#^ref-d2b3628c-52-0) (line 52, col 0, score 0.7)
- [Promethean Event Bus MVP v0.1 — L747](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-747-0) (line 747, col 0, score 0.65)
- [Chroma Toolkit Consolidation Plan — L90](chroma-toolkit-consolidation-plan.md#^ref-5020e892-90-0) (line 90, col 0, score 0.68)
- [Stateful Partitions and Rebalancing — L267](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-267-0) (line 267, col 0, score 0.72)
- [schema-evolution-workflow — L71](schema-evolution-workflow.md#^ref-d8059b6a-71-0) (line 71, col 0, score 0.71)
- [Mongo Outbox Implementation — L37](mongo-outbox-implementation.md#^ref-9c1acd1e-37-0) (line 37, col 0, score 0.68)
- [Mongo Outbox Implementation — L187](mongo-outbox-implementation.md#^ref-9c1acd1e-187-0) (line 187, col 0, score 0.71)
- [Event Bus MVP — L258](event-bus-mvp.md#^ref-534fe91d-258-0) (line 258, col 0, score 0.86)
- [Event Bus MVP — L392](event-bus-mvp.md#^ref-534fe91d-392-0) (line 392, col 0, score 0.67)
- [Mongo Outbox Implementation — L546](mongo-outbox-implementation.md#^ref-9c1acd1e-546-0) (line 546, col 0, score 0.58)
- [Mongo Outbox Implementation — L443](mongo-outbox-implementation.md#^ref-9c1acd1e-443-0) (line 443, col 0, score 0.64)
- [Performance-Optimized-Polyglot-Bridge — L10](performance-optimized-polyglot-bridge.md#^ref-f5579967-10-0) (line 10, col 0, score 0.64)
- [Exception Layer Analysis — L34](exception-layer-analysis.md#^ref-21d5cc09-34-0) (line 34, col 0, score 0.64)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L194](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-194-0) (line 194, col 0, score 0.63)
- [Promethean Event Bus MVP v0.1 — L190](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-190-0) (line 190, col 0, score 0.62)
- [Agent Tasks: Persistence Migration to DualStore — L25](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-25-0) (line 25, col 0, score 0.62)
- [Vectorial Exception Descent — L14](vectorial-exception-descent.md#^ref-d771154e-14-0) (line 14, col 0, score 0.62)
- [Agent Tasks: Persistence Migration to DualStore — L7](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-7-0) (line 7, col 0, score 0.8)
- [Chroma Toolkit Consolidation Plan — L157](chroma-toolkit-consolidation-plan.md#^ref-5020e892-157-0) (line 157, col 0, score 0.77)
- [Event Bus MVP — L471](event-bus-mvp.md#^ref-534fe91d-471-0) (line 471, col 0, score 0.82)
- [WebSocket Gateway Implementation — L560](websocket-gateway-implementation.md#^ref-e811123d-560-0) (line 560, col 0, score 0.77)
- [WebSocket Gateway Implementation — L473](websocket-gateway-implementation.md#^ref-e811123d-473-0) (line 473, col 0, score 0.76)
- [State Snapshots API and Transactional Projector — L248](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-248-0) (line 248, col 0, score 0.73)
- [Promethean Event Bus MVP v0.1 — L787](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-787-0) (line 787, col 0, score 0.71)
- [State Snapshots API and Transactional Projector — L280](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-280-0) (line 280, col 0, score 0.71)
- [Promethean Event Bus MVP v0.1 — L797](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-797-0) (line 797, col 0, score 0.71)
- [Migrate to Provider-Tenant Architecture — L69](migrate-to-provider-tenant-architecture.md#^ref-54382370-69-0) (line 69, col 0, score 0.64)
- [Promethean State Format — L72](promethean-state-format.md#^ref-23df6ddb-72-0) (line 72, col 0, score 0.55)
- [schema-evolution-workflow — L478](schema-evolution-workflow.md#^ref-d8059b6a-478-0) (line 478, col 0, score 0.54)
- [universal-intention-code-fabric — L384](universal-intention-code-fabric.md#^ref-c14edce7-384-0) (line 384, col 0, score 0.54)
- [State Snapshots API and Transactional Projector — L278](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-278-0) (line 278, col 0, score 0.54)
- [js-to-lisp-reverse-compiler — L406](js-to-lisp-reverse-compiler.md#^ref-58191024-406-0) (line 406, col 0, score 0.54)
- [i3-config-validation-methods — L34](i3-config-validation-methods.md#^ref-d28090ac-34-0) (line 34, col 0, score 0.53)
- [aionian-circuit-math — L42](aionian-circuit-math.md#^ref-f2d83a77-42-0) (line 42, col 0, score 0.53)
- [universal-intention-code-fabric — L407](universal-intention-code-fabric.md#^ref-c14edce7-407-0) (line 407, col 0, score 0.53)
- [Unique Info Dump Index — L18](unique-info-dump-index.md#^ref-30ec3ba6-18-0) (line 18, col 0, score 0.67)
- [graph-ds — L373](graph-ds.md#^ref-6620e2f2-373-0) (line 373, col 0, score 1)
- [komorebi-group-window-hack — L205](komorebi-group-window-hack.md#^ref-dd89372d-205-0) (line 205, col 0, score 1)
- [layer-1-uptime-diagrams — L166](layer-1-uptime-diagrams.md#^ref-4127189a-166-0) (line 166, col 0, score 1)
- [Lisp-Compiler-Integration — L558](lisp-compiler-integration.md#^ref-cfee6d36-558-0) (line 558, col 0, score 1)
- [lisp-dsl-for-window-management — L219](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-219-0) (line 219, col 0, score 0.58)
- [Migrate to Provider-Tenant Architecture — L277](migrate-to-provider-tenant-architecture.md#^ref-54382370-277-0) (line 277, col 0, score 0.58)
- [Mongo Outbox Implementation — L556](mongo-outbox-implementation.md#^ref-9c1acd1e-556-0) (line 556, col 0, score 0.58)
- [obsidian-ignore-node-modules-regex — L49](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-49-0) (line 49, col 0, score 0.58)
- [pm2-orchestration-patterns — L245](pm2-orchestration-patterns.md#^ref-51932e7b-245-0) (line 245, col 0, score 0.58)
- [Migrate to Provider-Tenant Architecture — L152](migrate-to-provider-tenant-architecture.md#^ref-54382370-152-0) (line 152, col 0, score 0.77)
- [Migrate to Provider-Tenant Architecture — L162](migrate-to-provider-tenant-architecture.md#^ref-54382370-162-0) (line 162, col 0, score 0.72)
- [Agent Reflections and Prompt Evolution — L101](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-101-0) (line 101, col 0, score 0.7)
- [WebSocket Gateway Implementation — L376](websocket-gateway-implementation.md#^ref-e811123d-376-0) (line 376, col 0, score 0.69)
- [State Snapshots API and Transactional Projector — L242](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-242-0) (line 242, col 0, score 0.6)
- [Stateful Partitions and Rebalancing — L516](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-516-0) (line 516, col 0, score 0.68)
- [State Snapshots API and Transactional Projector — L329](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-329-0) (line 329, col 0, score 0.66)
- [aionian-circuit-math — L110](aionian-circuit-math.md#^ref-f2d83a77-110-0) (line 110, col 0, score 0.6)
- [Promethean Event Bus MVP v0.1 — L119](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-119-0) (line 119, col 0, score 0.7)
- [schema-evolution-workflow — L469](schema-evolution-workflow.md#^ref-d8059b6a-469-0) (line 469, col 0, score 0.63)
- [RAG UI Panel with Qdrant and PostgREST — L327](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-327-0) (line 327, col 0, score 0.62)
- [Promethean Pipelines — L84](promethean-pipelines.md#^ref-8b8e6103-84-0) (line 84, col 0, score 0.62)
- [Dynamic Context Model for Web Components — L80](dynamic-context-model-for-web-components.md#^ref-f7702bf8-80-0) (line 80, col 0, score 0.59)
- [Event Bus MVP — L536](event-bus-mvp.md#^ref-534fe91d-536-0) (line 536, col 0, score 0.59)
- [State Snapshots API and Transactional Projector — L177](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-177-0) (line 177, col 0, score 0.64)
- [WebSocket Gateway Implementation — L318](websocket-gateway-implementation.md#^ref-e811123d-318-0) (line 318, col 0, score 0.78)
- [Event Bus MVP — L365](event-bus-mvp.md#^ref-534fe91d-365-0) (line 365, col 0, score 0.65)
- [Mongo Outbox Implementation — L321](mongo-outbox-implementation.md#^ref-9c1acd1e-321-0) (line 321, col 0, score 0.69)
- [WebSocket Gateway Implementation — L617](websocket-gateway-implementation.md#^ref-e811123d-617-0) (line 617, col 0, score 0.68)
- [Event Bus MVP — L359](event-bus-mvp.md#^ref-534fe91d-359-0) (line 359, col 0, score 0.67)
- [Stateful Partitions and Rebalancing — L513](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-513-0) (line 513, col 0, score 0.72)
- [Promethean Event Bus MVP v0.1 — L371](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-371-0) (line 371, col 0, score 0.64)
- [Simulation Demo — L32](chunks/simulation-demo.md#^ref-557309a3-32-0) (line 32, col 0, score 1)
- [Tooling — L26](chunks/tooling.md#^ref-6cb4943e-26-0) (line 26, col 0, score 1)
- [Window Management — L36](chunks/window-management.md#^ref-9e8ae388-36-0) (line 36, col 0, score 1)
- [compiler-kit-foundations — L639](compiler-kit-foundations.md#^ref-01b21543-639-0) (line 639, col 0, score 1)
- [Creative Moments — L10](creative-moments.md#^ref-10d98225-10-0) (line 10, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L258](cross-language-runtime-polymorphism.md#^ref-c34c36a6-258-0) (line 258, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L215](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-215-0) (line 215, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L50](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-50-0) (line 50, col 0, score 1)
- [DuckDuckGoSearchPipeline — L16](duckduckgosearchpipeline.md#^ref-e979c50f-16-0) (line 16, col 0, score 1)
- [Local-Only-LLM-Workflow — L201](local-only-llm-workflow.md#^ref-9a8ab57e-201-0) (line 201, col 0, score 1)
- [markdown-to-org-transpiler — L323](markdown-to-org-transpiler.md#^ref-ab54cdd8-323-0) (line 323, col 0, score 1)
- [observability-infrastructure-setup — L395](observability-infrastructure-setup.md#^ref-b4e64f8c-395-0) (line 395, col 0, score 0.62)
- [Obsidian Templating Plugins Integration Guide — L115](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-115-0) (line 115, col 0, score 0.62)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L192](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-192-0) (line 192, col 0, score 0.62)
- [Optimizing Command Limitations in System Design — L45](optimizing-command-limitations-in-system-design.md#^ref-98c8ff62-45-0) (line 45, col 0, score 0.62)
- [ParticleSimulationWithCanvasAndFFmpeg — L277](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-277-0) (line 277, col 0, score 0.62)
- [Per-Domain Policy System for JS Crawler — L496](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-496-0) (line 496, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L461](performance-optimized-polyglot-bridge.md#^ref-f5579967-461-0) (line 461, col 0, score 0.62)
- [pm2-orchestration-patterns — L249](pm2-orchestration-patterns.md#^ref-51932e7b-249-0) (line 249, col 0, score 0.62)
- [polyglot-repl-interface-layer — L178](polyglot-repl-interface-layer.md#^ref-9c79206d-178-0) (line 178, col 0, score 0.62)
- [Chroma Toolkit Consolidation Plan — L122](chroma-toolkit-consolidation-plan.md#^ref-5020e892-122-0) (line 122, col 0, score 0.95)
- [Agent Tasks: Persistence Migration to DualStore — L16](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-16-0) (line 16, col 0, score 0.8)
- [Factorio AI with External Agents — L34](factorio-ai-with-external-agents.md#^ref-a4d90289-34-0) (line 34, col 0, score 0.75)
- [Promethean-native config design — L73](promethean-native-config-design.md#^ref-ab748541-73-0) (line 73, col 0, score 0.71)
- [Model Selection for Lightweight Conversational Tasks — L53](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-53-0) (line 53, col 0, score 0.7)
- [graph-ds — L355](graph-ds.md#^ref-6620e2f2-355-0) (line 355, col 0, score 0.69)
- [Promethean State Format — L26](promethean-state-format.md#^ref-23df6ddb-26-0) (line 26, col 0, score 0.72)
- [WebSocket Gateway Implementation — L379](websocket-gateway-implementation.md#^ref-e811123d-379-0) (line 379, col 0, score 0.57)
- [TypeScript Patch for Tool Calling Support — L175](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-175-0) (line 175, col 0, score 0.61)
- [Chroma Toolkit Consolidation Plan — L60](chroma-toolkit-consolidation-plan.md#^ref-5020e892-60-0) (line 60, col 0, score 0.68)
- [Recursive Prompt Construction Engine — L64](recursive-prompt-construction-engine.md#^ref-babdb9eb-64-0) (line 64, col 0, score 0.67)
- [Protocol_0_The_Contradiction_Engine — L35](protocol-0-the-contradiction-engine.md#^ref-9a93a756-35-0) (line 35, col 0, score 0.63)
- [Matplotlib Animation with Async Execution — L38](matplotlib-animation-with-async-execution.md#^ref-687439f9-38-0) (line 38, col 0, score 0.62)
- [AI-Centric OS with MCP Layer — L23](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-23-0) (line 23, col 0, score 0.59)
- [Promethean Dev Workflow Update — L39](promethean-dev-workflow-update.md#^ref-03a5578f-39-0) (line 39, col 0, score 0.58)
- [archetype-ecs — L418](archetype-ecs.md#^ref-8f4c1e86-418-0) (line 418, col 0, score 0.58)
- [Board Walk – 2025-08-11 — L93](board-walk-2025-08-11.md#^ref-7aa1eb92-93-0) (line 93, col 0, score 0.57)
- [Promethean Documentation Pipeline Overview — L74](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-74-0) (line 74, col 0, score 0.57)
- [Agent Tasks: Persistence Migration to DualStore — L64](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-64-0) (line 64, col 0, score 0.57)
- [Promethean Event Bus MVP v0.1 — L9](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-9-0) (line 9, col 0, score 0.68)
- [WebSocket Gateway Implementation — L618](websocket-gateway-implementation.md#^ref-e811123d-618-0) (line 618, col 0, score 0.67)
- [JavaScript — L8](chunks/javascript.md#^ref-c1618c66-8-0) (line 8, col 0, score 0.66)
- [Unique Info Dump Index — L43](unique-info-dump-index.md#^ref-30ec3ba6-43-0) (line 43, col 0, score 0.66)
- [JavaScript — L11](chunks/javascript.md#^ref-c1618c66-11-0) (line 11, col 0, score 0.66)
- [ecs-offload-workers — L457](ecs-offload-workers.md#^ref-6498b9d7-457-0) (line 457, col 0, score 0.66)
- [Exception Layer Analysis — L130](exception-layer-analysis.md#^ref-21d5cc09-130-0) (line 130, col 0, score 0.61)
- [Exception Layer Analysis — L128](exception-layer-analysis.md#^ref-21d5cc09-128-0) (line 128, col 0, score 0.66)
- [schema-evolution-workflow — L311](schema-evolution-workflow.md#^ref-d8059b6a-311-0) (line 311, col 0, score 0.69)
- [Eidolon Field Abstract Model — L161](eidolon-field-abstract-model.md#^ref-5e8b2388-161-0) (line 161, col 0, score 0.62)
- [Layer1SurvivabilityEnvelope — L137](layer1survivabilityenvelope.md#^ref-64a9f9f9-137-0) (line 137, col 0, score 0.61)
- [Vectorial Exception Descent — L136](vectorial-exception-descent.md#^ref-d771154e-136-0) (line 136, col 0, score 0.58)
- [Mongo Outbox Implementation — L537](mongo-outbox-implementation.md#^ref-9c1acd1e-537-0) (line 537, col 0, score 0.61)
- [Model Upgrade Calm-Down Guide — L14](model-upgrade-calm-down-guide.md#^ref-db74343f-14-0) (line 14, col 0, score 0.61)
- [Tracing the Signal — L66](tracing-the-signal.md#^ref-c3cd4f65-66-0) (line 66, col 0, score 0.67)
- [Model Upgrade Calm-Down Guide — L13](model-upgrade-calm-down-guide.md#^ref-db74343f-13-0) (line 13, col 0, score 0.61)
- [Self-Agency in AI Interaction — L9](self-agency-in-ai-interaction.md#^ref-49a9a860-9-0) (line 9, col 0, score 0.6)
- [Model Upgrade Calm-Down Guide — L22](model-upgrade-calm-down-guide.md#^ref-db74343f-22-0) (line 22, col 0, score 0.58)
- [Functional Refactor of TypeScript Document Processing — L116](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-116-0) (line 116, col 0, score 0.57)
- [Promethean-native config design — L59](promethean-native-config-design.md#^ref-ab748541-59-0) (line 59, col 0, score 0.57)
- [Tracing the Signal — L72](tracing-the-signal.md#^ref-c3cd4f65-72-0) (line 72, col 0, score 0.57)
- [Protocol_0_The_Contradiction_Engine — L48](protocol-0-the-contradiction-engine.md#^ref-9a93a756-48-0) (line 48, col 0, score 0.57)
- [Prompt_Folder_Bootstrap — L86](prompt-folder-bootstrap.md#^ref-bd4f0976-86-0) (line 86, col 0, score 0.56)
- [Self-Agency in AI Interaction — L16](self-agency-in-ai-interaction.md#^ref-49a9a860-16-0) (line 16, col 0, score 0.56)
- [Mongo Outbox Implementation — L142](mongo-outbox-implementation.md#^ref-9c1acd1e-142-0) (line 142, col 0, score 0.56)
- [Voice Access Layer Design — L13](voice-access-layer-design.md#^ref-543ed9b3-13-0) (line 13, col 0, score 0.62)
- [Voice Access Layer Design — L201](voice-access-layer-design.md#^ref-543ed9b3-201-0) (line 201, col 0, score 0.61)
- [Migrate to Provider-Tenant Architecture — L141](migrate-to-provider-tenant-architecture.md#^ref-54382370-141-0) (line 141, col 0, score 0.6)
- [Protocol_0_The_Contradiction_Engine — L73](protocol-0-the-contradiction-engine.md#^ref-9a93a756-73-0) (line 73, col 0, score 0.6)
- [Vectorial Exception Descent — L49](vectorial-exception-descent.md#^ref-d771154e-49-0) (line 49, col 0, score 0.6)
- [Migrate to Provider-Tenant Architecture — L71](migrate-to-provider-tenant-architecture.md#^ref-54382370-71-0) (line 71, col 0, score 0.6)
- [Dynamic Context Model for Web Components — L45](dynamic-context-model-for-web-components.md#^ref-f7702bf8-45-0) (line 45, col 0, score 0.62)
- [State Snapshots API and Transactional Projector — L317](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-317-0) (line 317, col 0, score 0.61)
- [RAG UI Panel with Qdrant and PostgREST — L329](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-329-0) (line 329, col 0, score 0.61)
- [Promethean Event Bus MVP v0.1 — L94](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-94-0) (line 94, col 0, score 0.6)
- [Dynamic Context Model for Web Components — L41](dynamic-context-model-for-web-components.md#^ref-f7702bf8-41-0) (line 41, col 0, score 0.6)
- [TypeScript Patch for Tool Calling Support — L443](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-443-0) (line 443, col 0, score 0.59)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L490](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-490-0) (line 490, col 0, score 0.59)
- [Promethean-native config design — L355](promethean-native-config-design.md#^ref-ab748541-355-0) (line 355, col 0, score 0.59)
- [ecs-offload-workers — L435](ecs-offload-workers.md#^ref-6498b9d7-435-0) (line 435, col 0, score 0.58)
- [AI-Centric OS with MCP Layer — L383](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-383-0) (line 383, col 0, score 0.65)
- [Promethean Documentation Pipeline Overview — L114](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-114-0) (line 114, col 0, score 0.64)
- [State Snapshots API and Transactional Projector — L318](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-318-0) (line 318, col 0, score 0.69)
- [State Snapshots API and Transactional Projector — L303](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-303-0) (line 303, col 0, score 0.57)
- [ecs-offload-workers — L207](ecs-offload-workers.md#^ref-6498b9d7-207-0) (line 207, col 0, score 0.63)
- [Layer1SurvivabilityEnvelope — L63](layer1survivabilityenvelope.md#^ref-64a9f9f9-63-0) (line 63, col 0, score 0.63)
- [Performance-Optimized-Polyglot-Bridge — L425](performance-optimized-polyglot-bridge.md#^ref-f5579967-425-0) (line 425, col 0, score 0.62)
- [Promethean Event Bus MVP v0.1 — L358](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-358-0) (line 358, col 0, score 0.59)
- [observability-infrastructure-setup — L44](observability-infrastructure-setup.md#^ref-b4e64f8c-44-0) (line 44, col 0, score 0.59)
- [Factorio AI with External Agents — L135](factorio-ai-with-external-agents.md#^ref-a4d90289-135-0) (line 135, col 0, score 0.57)
- [AI-Centric OS with MCP Layer — L176](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-176-0) (line 176, col 0, score 0.56)
- [Layer1SurvivabilityEnvelope — L38](layer1survivabilityenvelope.md#^ref-64a9f9f9-38-0) (line 38, col 0, score 0.56)
- [Functional Embedding Pipeline Refactor — L25](functional-embedding-pipeline-refactor.md#^ref-a4a25141-25-0) (line 25, col 0, score 0.55)
- [Cross-Target Macro System in Sibilant — L139](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-139-0) (line 139, col 0, score 0.55)
- [ecs-offload-workers — L442](ecs-offload-workers.md#^ref-6498b9d7-442-0) (line 442, col 0, score 0.65)
- [Chroma-Embedding-Refactor — L1](chroma-embedding-refactor.md#^ref-8b256935-1-0) (line 1, col 0, score 0.63)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L491](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-491-0) (line 491, col 0, score 0.62)
- [Voice Access Layer Design — L91](voice-access-layer-design.md#^ref-543ed9b3-91-0) (line 91, col 0, score 0.61)
- [Language-Agnostic Mirror System — L507](language-agnostic-mirror-system.md#^ref-d2b3628c-507-0) (line 507, col 0, score 0.65)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L5](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-5-0) (line 5, col 0, score 0.61)
- [Promethean Event Bus MVP v0.1 — L369](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-369-0) (line 369, col 0, score 0.66)
- [Mongo Outbox Implementation — L533](mongo-outbox-implementation.md#^ref-9c1acd1e-533-0) (line 533, col 0, score 0.64)
- [Event Bus MVP — L387](event-bus-mvp.md#^ref-534fe91d-387-0) (line 387, col 0, score 0.64)
- [Event Bus MVP — L385](event-bus-mvp.md#^ref-534fe91d-385-0) (line 385, col 0, score 0.63)
- [Agent Tasks: Persistence Migration to DualStore — L152](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-152-0) (line 152, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L191](chroma-toolkit-consolidation-plan.md#^ref-5020e892-191-0) (line 191, col 0, score 1)
- [Services — L11](chunks/services.md#^ref-75ea4a6a-11-0) (line 11, col 0, score 1)
- [Event Bus MVP — L540](event-bus-mvp.md#^ref-534fe91d-540-0) (line 540, col 0, score 0.59)
- [komorebi-group-window-hack — L23](komorebi-group-window-hack.md#^ref-dd89372d-23-0) (line 23, col 0, score 0.58)
- [Fnord Tracer Protocol — L125](fnord-tracer-protocol.md#^ref-fc21f824-125-0) (line 125, col 0, score 0.58)
- [Smoke Resonance Visualizations — L1](smoke-resonance-visualizations.md#^ref-ac9d3ac5-1-0) (line 1, col 0, score 0.58)
- [Promethean Event Bus MVP v0.1 — L149](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-149-0) (line 149, col 0, score 0.61)
- [schema-evolution-workflow — L467](schema-evolution-workflow.md#^ref-d8059b6a-467-0) (line 467, col 0, score 0.69)
- [Promethean Event Bus MVP v0.1 — L809](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-809-0) (line 809, col 0, score 0.61)
- [Promethean Event Bus MVP v0.1 — L250](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-250-0) (line 250, col 0, score 0.64)
- [Promethean Event Bus MVP v0.1 — L186](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-186-0) (line 186, col 0, score 0.65)
- [Promethean Web UI Setup — L574](promethean-web-ui-setup.md#^ref-bc5172ca-574-0) (line 574, col 0, score 0.61)
- [Promethean Event Bus MVP v0.1 — L197](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-197-0) (line 197, col 0, score 0.63)
- [Migrate to Provider-Tenant Architecture — L80](migrate-to-provider-tenant-architecture.md#^ref-54382370-80-0) (line 80, col 0, score 0.6)
- [Fnord Tracer Protocol — L205](fnord-tracer-protocol.md#^ref-fc21f824-205-0) (line 205, col 0, score 0.68)
- [Fnord Tracer Protocol — L203](fnord-tracer-protocol.md#^ref-fc21f824-203-0) (line 203, col 0, score 0.63)
- [Voice Access Layer Design — L299](voice-access-layer-design.md#^ref-543ed9b3-299-0) (line 299, col 0, score 0.66)
- [Admin Dashboard for User Management — L33](admin-dashboard-for-user-management.md#^ref-2901a3e9-33-0) (line 33, col 0, score 0.59)
- [AI-Centric OS with MCP Layer — L17](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-17-0) (line 17, col 0, score 0.59)
- [Ice Box Reorganization — L1](ice-box-reorganization.md#^ref-291c7d91-1-0) (line 1, col 0, score 0.62)
- [Promethean Event Bus MVP v0.1 — L285](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-285-0) (line 285, col 0, score 0.67)
- [typed-struct-compiler — L376](typed-struct-compiler.md#^ref-78eeedf7-376-0) (line 376, col 0, score 0.61)
- [Performance-Optimized-Polyglot-Bridge — L417](performance-optimized-polyglot-bridge.md#^ref-f5579967-417-0) (line 417, col 0, score 0.64)
- [Promethean Agent Config DSL — L172](promethean-agent-config-dsl.md#^ref-2c00ce45-172-0) (line 172, col 0, score 0.6)
- [Promethean Event Bus MVP v0.1 — L147](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-147-0) (line 147, col 0, score 0.63)
- [Promethean Event Bus MVP v0.1 — L17](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-17-0) (line 17, col 0, score 0.61)
- [Promethean Infrastructure Setup — L540](promethean-infrastructure-setup.md#^ref-6deed6ac-540-0) (line 540, col 0, score 0.59)
- [2d-sandbox-field — L217](2d-sandbox-field.md#^ref-c710dc93-217-0) (line 217, col 0, score 0.43)
- [Agent Tasks: Persistence Migration to DualStore — L173](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-173-0) (line 173, col 0, score 0.43)
- [Diagrams — L33](chunks/diagrams.md#^ref-45cd25b5-33-0) (line 33, col 0, score 0.43)
- [DSL — L40](chunks/dsl.md#^ref-e87bc036-40-0) (line 40, col 0, score 0.43)
- [JavaScript — L30](chunks/javascript.md#^ref-c1618c66-30-0) (line 30, col 0, score 0.43)
- [Services — L39](chunks/services.md#^ref-75ea4a6a-39-0) (line 39, col 0, score 0.43)
- [Cross-Language Runtime Polymorphism — L248](cross-language-runtime-polymorphism.md#^ref-c34c36a6-248-0) (line 248, col 0, score 0.43)
- [Eidolon Field Abstract Model — L205](eidolon-field-abstract-model.md#^ref-5e8b2388-205-0) (line 205, col 0, score 0.43)
- [eidolon-field-math-foundations — L172](eidolon-field-math-foundations.md#^ref-008f2ac0-172-0) (line 172, col 0, score 0.43)
- [zero-copy-snapshots-and-workers — L363](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-363-0) (line 363, col 0, score 0.47)
- [Migrate to Provider-Tenant Architecture — L138](migrate-to-provider-tenant-architecture.md#^ref-54382370-138-0) (line 138, col 0, score 0.69)
- [AI-Centric OS with MCP Layer — L420](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-420-0) (line 420, col 0, score 1)
- [aionian-circuit-math — L177](aionian-circuit-math.md#^ref-f2d83a77-177-0) (line 177, col 0, score 1)
- [Board Automation Improvements — L18](board-automation-improvements.md#^ref-ac60a1d6-18-0) (line 18, col 0, score 1)
- [Board Walk – 2025-08-11 — L140](board-walk-2025-08-11.md#^ref-7aa1eb92-140-0) (line 140, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L118](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-118-0) (line 118, col 0, score 1)
- [Diagrams — L47](chunks/diagrams.md#^ref-45cd25b5-47-0) (line 47, col 0, score 1)
- [JavaScript — L35](chunks/javascript.md#^ref-c1618c66-35-0) (line 35, col 0, score 1)
- [Math Fundamentals — L33](chunks/math-fundamentals.md#^ref-c6e87433-33-0) (line 33, col 0, score 1)
- [Services — L31](chunks/services.md#^ref-75ea4a6a-31-0) (line 31, col 0, score 1)
- [compiler-kit-foundations — L640](compiler-kit-foundations.md#^ref-01b21543-640-0) (line 640, col 0, score 1)
- [Promethean-native config design — L35](promethean-native-config-design.md#^ref-ab748541-35-0) (line 35, col 0, score 0.65)
- [i3-bluetooth-setup — L57](i3-bluetooth-setup.md#^ref-5e408692-57-0) (line 57, col 0, score 0.63)
- [WebSocket Gateway Implementation — L612](websocket-gateway-implementation.md#^ref-e811123d-612-0) (line 612, col 0, score 0.63)
- [Chroma Toolkit Consolidation Plan — L146](chroma-toolkit-consolidation-plan.md#^ref-5020e892-146-0) (line 146, col 0, score 0.71)
- [State Snapshots API and Transactional Projector — L162](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-162-0) (line 162, col 0, score 0.67)
- [Chroma Toolkit Consolidation Plan — L115](chroma-toolkit-consolidation-plan.md#^ref-5020e892-115-0) (line 115, col 0, score 0.67)
- [Mongo Outbox Implementation — L449](mongo-outbox-implementation.md#^ref-9c1acd1e-449-0) (line 449, col 0, score 0.67)
- [WebSocket Gateway Implementation — L616](websocket-gateway-implementation.md#^ref-e811123d-616-0) (line 616, col 0, score 0.66)
- [Chroma Toolkit Consolidation Plan — L66](chroma-toolkit-consolidation-plan.md#^ref-5020e892-66-0) (line 66, col 0, score 0.66)
- [Stateful Partitions and Rebalancing — L164](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-164-0) (line 164, col 0, score 0.74)
- [Migrate to Provider-Tenant Architecture — L105](migrate-to-provider-tenant-architecture.md#^ref-54382370-105-0) (line 105, col 0, score 0.65)
- [Promethean-native config design — L375](promethean-native-config-design.md#^ref-ab748541-375-0) (line 375, col 0, score 0.75)
- [Migrate to Provider-Tenant Architecture — L160](migrate-to-provider-tenant-architecture.md#^ref-54382370-160-0) (line 160, col 0, score 0.7)
- [Migrate to Provider-Tenant Architecture — L201](migrate-to-provider-tenant-architecture.md#^ref-54382370-201-0) (line 201, col 0, score 0.69)
- [schema-evolution-workflow — L468](schema-evolution-workflow.md#^ref-d8059b6a-468-0) (line 468, col 0, score 0.69)
- [ts-to-lisp-transpiler — L5](ts-to-lisp-transpiler.md#^ref-ba11486b-5-0) (line 5, col 0, score 0.68)
- [Migrate to Provider-Tenant Architecture — L261](migrate-to-provider-tenant-architecture.md#^ref-54382370-261-0) (line 261, col 0, score 0.66)
- [Language-Agnostic Mirror System — L6](language-agnostic-mirror-system.md#^ref-d2b3628c-6-0) (line 6, col 0, score 0.65)
- [Promethean State Format — L27](promethean-state-format.md#^ref-23df6ddb-27-0) (line 27, col 0, score 0.65)
- [Stateful Partitions and Rebalancing — L520](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-520-0) (line 520, col 0, score 0.74)
- [State Snapshots API and Transactional Projector — L325](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-325-0) (line 325, col 0, score 0.73)
- [Mongo Outbox Implementation — L542](mongo-outbox-implementation.md#^ref-9c1acd1e-542-0) (line 542, col 0, score 0.72)
- [schema-evolution-workflow — L473](schema-evolution-workflow.md#^ref-d8059b6a-473-0) (line 473, col 0, score 0.72)
- [WebSocket Gateway Implementation — L623](websocket-gateway-implementation.md#^ref-e811123d-623-0) (line 623, col 0, score 0.7)
- [field-dynamics-math-blocks — L123](field-dynamics-math-blocks.md#^ref-7cfc230d-123-0) (line 123, col 0, score 0.64)
- [Event Bus MVP — L543](event-bus-mvp.md#^ref-534fe91d-543-0) (line 543, col 0, score 0.63)
- [Performance-Optimized-Polyglot-Bridge — L429](performance-optimized-polyglot-bridge.md#^ref-f5579967-429-0) (line 429, col 0, score 0.62)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L497](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-497-0) (line 497, col 0, score 0.62)
- [sibilant-macro-targets — L133](sibilant-macro-targets.md#^ref-c5c9a5c6-133-0) (line 133, col 0, score 0.61)
- [polymorphic-meta-programming-engine — L131](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-131-0) (line 131, col 0, score 0.61)
- [Local-Only-LLM-Workflow — L163](local-only-llm-workflow.md#^ref-9a8ab57e-163-0) (line 163, col 0, score 0.61)
- [heartbeat-simulation-snippets — L65](heartbeat-simulation-snippets.md#^ref-23e221e9-65-0) (line 65, col 0, score 0.6)
- [windows-tiling-with-autohotkey — L104](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-104-0) (line 104, col 0, score 0.6)
- [Promethean Event Bus MVP v0.1 — L13](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-13-0) (line 13, col 0, score 0.79)
- [Services — L12](chunks/services.md#^ref-75ea4a6a-12-0) (line 12, col 0, score 1)
- [Event Bus MVP — L551](event-bus-mvp.md#^ref-534fe91d-551-0) (line 551, col 0, score 1)
- [Mongo Outbox Implementation — L557](mongo-outbox-implementation.md#^ref-9c1acd1e-557-0) (line 557, col 0, score 1)
- [Promethean Event Bus MVP v0.1 — L890](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-890-0) (line 890, col 0, score 1)
- [Promethean-native config design — L389](promethean-native-config-design.md#^ref-ab748541-389-0) (line 389, col 0, score 1)
- [schema-evolution-workflow — L482](schema-evolution-workflow.md#^ref-d8059b6a-482-0) (line 482, col 0, score 1)
- [State Snapshots API and Transactional Projector — L338](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-338-0) (line 338, col 0, score 1)
- [Stateful Partitions and Rebalancing — L99](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-99-0) (line 99, col 0, score 0.64)
- [Promethean Event Bus MVP v0.1 — L184](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-184-0) (line 184, col 0, score 0.63)
- [Promethean Event Bus MVP v0.1 — L108](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-108-0) (line 108, col 0, score 0.61)
- [Promethean Event Bus MVP v0.1 — L11](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-11-0) (line 11, col 0, score 0.59)
- [shared-package-layout-clarification — L31](shared-package-layout-clarification.md#^ref-36c8882a-31-0) (line 31, col 0, score 0.58)
- [schema-evolution-workflow — L466](schema-evolution-workflow.md#^ref-d8059b6a-466-0) (line 466, col 0, score 0.58)
- [Agent Tasks: Persistence Migration to DualStore — L45](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-45-0) (line 45, col 0, score 0.58)
- [Promethean Event Bus MVP v0.1 — L373](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-373-0) (line 373, col 0, score 0.84)
- [Migrate to Provider-Tenant Architecture — L128](migrate-to-provider-tenant-architecture.md#^ref-54382370-128-0) (line 128, col 0, score 0.76)
- [schema-evolution-workflow — L463](schema-evolution-workflow.md#^ref-d8059b6a-463-0) (line 463, col 0, score 0.72)
- [typed-struct-compiler — L380](typed-struct-compiler.md#^ref-78eeedf7-380-0) (line 380, col 0, score 0.71)
- [Stateful Partitions and Rebalancing — L290](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-290-0) (line 290, col 0, score 0.7)
- [Promethean-native config design — L27](promethean-native-config-design.md#^ref-ab748541-27-0) (line 27, col 0, score 0.68)
- [State Snapshots API and Transactional Projector — L330](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-330-0) (line 330, col 0, score 0.68)
- [Promethean Pipelines — L76](promethean-pipelines.md#^ref-8b8e6103-76-0) (line 76, col 0, score 0.66)
- [schema-evolution-workflow — L239](schema-evolution-workflow.md#^ref-d8059b6a-239-0) (line 239, col 0, score 0.79)
- [schema-evolution-workflow — L476](schema-evolution-workflow.md#^ref-d8059b6a-476-0) (line 476, col 0, score 0.79)
- [Stateful Partitions and Rebalancing — L524](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-524-0) (line 524, col 0, score 0.75)
- [Stateful Partitions and Rebalancing — L342](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-342-0) (line 342, col 0, score 0.73)
- [Services — L9](chunks/services.md#^ref-75ea4a6a-9-0) (line 9, col 0, score 1)
- [ecs-scheduler-and-prefabs — L420](ecs-scheduler-and-prefabs.md#^ref-c62a1815-420-0) (line 420, col 0, score 1)
- [Event Bus MVP — L552](event-bus-mvp.md#^ref-534fe91d-552-0) (line 552, col 0, score 1)
- [heartbeat-fragment-demo — L123](heartbeat-fragment-demo.md#^ref-dd00677a-123-0) (line 123, col 0, score 1)
- [heartbeat-simulation-snippets — L115](heartbeat-simulation-snippets.md#^ref-23e221e9-115-0) (line 115, col 0, score 1)
- [Mongo Outbox Implementation — L551](mongo-outbox-implementation.md#^ref-9c1acd1e-551-0) (line 551, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L60](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-60-0) (line 60, col 0, score 1)
- [Promethean Event Bus MVP v0.1 — L889](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-889-0) (line 889, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L135](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-135-0) (line 135, col 0, score 1)
- [ecs-offload-workers — L481](ecs-offload-workers.md#^ref-6498b9d7-481-0) (line 481, col 0, score 1)
- [ecs-scheduler-and-prefabs — L418](ecs-scheduler-and-prefabs.md#^ref-c62a1815-418-0) (line 418, col 0, score 1)
- [eidolon-node-lifecycle — L49](eidolon-node-lifecycle.md#^ref-938eca9c-49-0) (line 49, col 0, score 1)
- [Event Bus MVP — L545](event-bus-mvp.md#^ref-534fe91d-545-0) (line 545, col 0, score 1)
- [Event Bus Projections Architecture — L148](event-bus-projections-architecture.md#^ref-cf6b9b17-148-0) (line 148, col 0, score 1)
- [Fnord Tracer Protocol — L242](fnord-tracer-protocol.md#^ref-fc21f824-242-0) (line 242, col 0, score 1)
- [i3-bluetooth-setup — L104](i3-bluetooth-setup.md#^ref-5e408692-104-0) (line 104, col 0, score 1)
- [layer-1-uptime-diagrams — L173](layer-1-uptime-diagrams.md#^ref-4127189a-173-0) (line 173, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L147](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-147-0) (line 147, col 0, score 1)
- [Services — L10](chunks/services.md#^ref-75ea4a6a-10-0) (line 10, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L209](cross-language-runtime-polymorphism.md#^ref-c34c36a6-209-0) (line 209, col 0, score 1)
- [ecs-offload-workers — L486](ecs-offload-workers.md#^ref-6498b9d7-486-0) (line 486, col 0, score 1)
- [Event Bus MVP — L548](event-bus-mvp.md#^ref-534fe91d-548-0) (line 548, col 0, score 1)
- [Mongo Outbox Implementation — L552](mongo-outbox-implementation.md#^ref-9c1acd1e-552-0) (line 552, col 0, score 1)
- [Promethean Event Bus MVP v0.1 — L913](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-913-0) (line 913, col 0, score 1)
- [State Snapshots API and Transactional Projector — L333](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-333-0) (line 333, col 0, score 1)
- [Stateful Partitions and Rebalancing — L527](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-527-0) (line 527, col 0, score 1)
- [Math Fundamentals — L31](chunks/math-fundamentals.md#^ref-c6e87433-31-0) (line 31, col 0, score 1)
- [Tooling — L19](chunks/tooling.md#^ref-6cb4943e-19-0) (line 19, col 0, score 1)
- [compiler-kit-foundations — L634](compiler-kit-foundations.md#^ref-01b21543-634-0) (line 634, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L212](cross-language-runtime-polymorphism.md#^ref-c34c36a6-212-0) (line 212, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L180](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-180-0) (line 180, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L56](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-56-0) (line 56, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L45](ducks-self-referential-perceptual-loop.md#^ref-71726f04-45-0) (line 45, col 0, score 1)
- [Dynamic Context Model for Web Components — L384](dynamic-context-model-for-web-components.md#^ref-f7702bf8-384-0) (line 384, col 0, score 1)
- [ecs-offload-workers — L468](ecs-offload-workers.md#^ref-6498b9d7-468-0) (line 468, col 0, score 1)
- [ecs-scheduler-and-prefabs — L413](ecs-scheduler-and-prefabs.md#^ref-c62a1815-413-0) (line 413, col 0, score 1)
- [Eidolon Field Abstract Model — L214](eidolon-field-abstract-model.md#^ref-5e8b2388-214-0) (line 214, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L145](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-145-0) (line 145, col 0, score 1)
- [Local-Only-LLM-Workflow — L212](local-only-llm-workflow.md#^ref-9a8ab57e-212-0) (line 212, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L291](migrate-to-provider-tenant-architecture.md#^ref-54382370-291-0) (line 291, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L155](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-155-0) (line 155, col 0, score 1)
- [Mongo Outbox Implementation — L550](mongo-outbox-implementation.md#^ref-9c1acd1e-550-0) (line 550, col 0, score 1)
- [observability-infrastructure-setup — L368](observability-infrastructure-setup.md#^ref-b4e64f8c-368-0) (line 368, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L72](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-72-0) (line 72, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L201](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-201-0) (line 201, col 0, score 1)
- [Promethean Agent Config DSL — L329](promethean-agent-config-dsl.md#^ref-2c00ce45-329-0) (line 329, col 0, score 1)
- [Promethean Event Bus MVP v0.1 — L879](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-879-0) (line 879, col 0, score 1)
- [api-gateway-versioning — L294](api-gateway-versioning.md#^ref-0580dcd3-294-0) (line 294, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L228](cross-language-runtime-polymorphism.md#^ref-c34c36a6-228-0) (line 228, col 0, score 1)
- [ecs-offload-workers — L465](ecs-offload-workers.md#^ref-6498b9d7-465-0) (line 465, col 0, score 1)
- [Event Bus MVP — L547](event-bus-mvp.md#^ref-534fe91d-547-0) (line 547, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L312](migrate-to-provider-tenant-architecture.md#^ref-54382370-312-0) (line 312, col 0, score 1)
- [Unique Info Dump Index — L92](unique-info-dump-index.md#^ref-30ec3ba6-92-0) (line 92, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L129](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-129-0) (line 129, col 0, score 1)
- [AI-Centric OS with MCP Layer — L406](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-406-0) (line 406, col 0, score 1)
- [Chroma-Embedding-Refactor — L331](chroma-embedding-refactor.md#^ref-8b256935-331-0) (line 331, col 0, score 1)
- [Diagrams — L25](chunks/diagrams.md#^ref-45cd25b5-25-0) (line 25, col 0, score 1)
- [Tooling — L24](chunks/tooling.md#^ref-6cb4943e-24-0) (line 24, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L173](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-173-0) (line 173, col 0, score 1)
- [Dynamic Context Model for Web Components — L390](dynamic-context-model-for-web-components.md#^ref-f7702bf8-390-0) (line 390, col 0, score 1)
- [eidolon-field-math-foundations — L147](eidolon-field-math-foundations.md#^ref-008f2ac0-147-0) (line 147, col 0, score 1)
- [Event Bus MVP — L553](event-bus-mvp.md#^ref-534fe91d-553-0) (line 553, col 0, score 1)
- [field-interaction-equations — L159](field-interaction-equations.md#^ref-b09141b7-159-0) (line 159, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L315](functional-embedding-pipeline-refactor.md#^ref-a4a25141-315-0) (line 315, col 0, score 1)
- [i3-bluetooth-setup — L105](i3-bluetooth-setup.md#^ref-5e408692-105-0) (line 105, col 0, score 1)
- [Pure TypeScript Search Microservice — L538](pure-typescript-search-microservice.md#^ref-d17d3a96-538-0) (line 538, col 0, score 1)
- [RAG UI Panel with Qdrant and PostgREST — L374](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-374-0) (line 374, col 0, score 1)
- [ripple-propagation-demo — L120](ripple-propagation-demo.md#^ref-8430617b-120-0) (line 120, col 0, score 1)
- [schema-evolution-workflow — L502](schema-evolution-workflow.md#^ref-d8059b6a-502-0) (line 502, col 0, score 1)
- [Self-Agency in AI Interaction — L53](self-agency-in-ai-interaction.md#^ref-49a9a860-53-0) (line 53, col 0, score 1)
- [set-assignment-in-lisp-ast — L161](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-161-0) (line 161, col 0, score 1)
- [shared-package-layout-clarification — L185](shared-package-layout-clarification.md#^ref-36c8882a-185-0) (line 185, col 0, score 1)
- [Shared Package Structure — L181](shared-package-structure.md#^ref-66a72fc3-181-0) (line 181, col 0, score 1)
- [sibilant-macro-targets — L173](sibilant-macro-targets.md#^ref-c5c9a5c6-173-0) (line 173, col 0, score 1)
- [Sibilant Meta-Prompt DSL — L194](sibilant-meta-prompt-dsl.md#^ref-af5d2824-194-0) (line 194, col 0, score 1)
- [field-node-diagram-outline — L111](field-node-diagram-outline.md#^ref-1f32c94a-111-0) (line 111, col 0, score 1)
- [field-node-diagram-set — L144](field-node-diagram-set.md#^ref-22b989d5-144-0) (line 144, col 0, score 1)
- [field-node-diagram-visualizations — L94](field-node-diagram-visualizations.md#^ref-e9b27b06-94-0) (line 94, col 0, score 1)
- [Fnord Tracer Protocol — L258](fnord-tracer-protocol.md#^ref-fc21f824-258-0) (line 258, col 0, score 1)
- [graph-ds — L398](graph-ds.md#^ref-6620e2f2-398-0) (line 398, col 0, score 1)
- [heartbeat-fragment-demo — L110](heartbeat-fragment-demo.md#^ref-dd00677a-110-0) (line 110, col 0, score 1)
- [heartbeat-simulation-snippets — L99](heartbeat-simulation-snippets.md#^ref-23e221e9-99-0) (line 99, col 0, score 1)
- [homeostasis-decay-formulas — L151](homeostasis-decay-formulas.md#^ref-37b5d236-151-0) (line 151, col 0, score 1)
- [i3-bluetooth-setup — L119](i3-bluetooth-setup.md#^ref-5e408692-119-0) (line 119, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L172](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-172-0) (line 172, col 0, score 1)
- [AI-Centric OS with MCP Layer — L424](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-424-0) (line 424, col 0, score 1)
- [aionian-circuit-math — L183](aionian-circuit-math.md#^ref-f2d83a77-183-0) (line 183, col 0, score 1)
- [api-gateway-versioning — L310](api-gateway-versioning.md#^ref-0580dcd3-310-0) (line 310, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L211](chroma-toolkit-consolidation-plan.md#^ref-5020e892-211-0) (line 211, col 0, score 1)
- [Diagrams — L23](chunks/diagrams.md#^ref-45cd25b5-23-0) (line 23, col 0, score 1)
- [DSL — L27](chunks/dsl.md#^ref-e87bc036-27-0) (line 27, col 0, score 1)
- [JavaScript — L29](chunks/javascript.md#^ref-c1618c66-29-0) (line 29, col 0, score 1)
- [Math Fundamentals — L39](chunks/math-fundamentals.md#^ref-c6e87433-39-0) (line 39, col 0, score 1)
- [Shared — L28](chunks/shared.md#^ref-623a55f7-28-0) (line 28, col 0, score 1)
- [Simulation Demo — L29](chunks/simulation-demo.md#^ref-557309a3-29-0) (line 29, col 0, score 1)
- [Tooling — L14](chunks/tooling.md#^ref-6cb4943e-14-0) (line 14, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L130](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-130-0) (line 130, col 0, score 1)
- [api-gateway-versioning — L303](api-gateway-versioning.md#^ref-0580dcd3-303-0) (line 303, col 0, score 1)
- [Chroma-Embedding-Refactor — L327](chroma-embedding-refactor.md#^ref-8b256935-327-0) (line 327, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L174](chroma-toolkit-consolidation-plan.md#^ref-5020e892-174-0) (line 174, col 0, score 1)
- [eidolon-field-math-foundations — L134](eidolon-field-math-foundations.md#^ref-008f2ac0-134-0) (line 134, col 0, score 1)
- [i3-config-validation-methods — L82](i3-config-validation-methods.md#^ref-d28090ac-82-0) (line 82, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L267](migrate-to-provider-tenant-architecture.md#^ref-54382370-267-0) (line 267, col 0, score 1)
- [Promethean Agent Config DSL — L333](promethean-agent-config-dsl.md#^ref-2c00ce45-333-0) (line 333, col 0, score 1)
- [Promethean Event Bus MVP v0.1 — L906](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-906-0) (line 906, col 0, score 1)
- [Math Fundamentals — L20](chunks/math-fundamentals.md#^ref-c6e87433-20-0) (line 20, col 0, score 1)
- [Services — L20](chunks/services.md#^ref-75ea4a6a-20-0) (line 20, col 0, score 1)
- [compiler-kit-foundations — L620](compiler-kit-foundations.md#^ref-01b21543-620-0) (line 620, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L237](cross-language-runtime-polymorphism.md#^ref-c34c36a6-237-0) (line 237, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L40](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-40-0) (line 40, col 0, score 1)
- [Dynamic Context Model for Web Components — L401](dynamic-context-model-for-web-components.md#^ref-f7702bf8-401-0) (line 401, col 0, score 1)
- [ecs-scheduler-and-prefabs — L386](ecs-scheduler-and-prefabs.md#^ref-c62a1815-386-0) (line 386, col 0, score 1)
- [eidolon-field-math-foundations — L127](eidolon-field-math-foundations.md#^ref-008f2ac0-127-0) (line 127, col 0, score 1)
- [Event Bus MVP — L557](event-bus-mvp.md#^ref-534fe91d-557-0) (line 557, col 0, score 1)
- [AI-Centric OS with MCP Layer — L427](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-427-0) (line 427, col 0, score 1)
- [AI-First-OS-Model-Context-Protocol — L13](ai-first-os-model-context-protocol.md#^ref-618198f4-13-0) (line 13, col 0, score 1)
- [api-gateway-versioning — L288](api-gateway-versioning.md#^ref-0580dcd3-288-0) (line 288, col 0, score 1)
- [archetype-ecs — L480](archetype-ecs.md#^ref-8f4c1e86-480-0) (line 480, col 0, score 1)
- [balanced-bst — L301](balanced-bst.md#^ref-d3e7db72-301-0) (line 301, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L178](chroma-toolkit-consolidation-plan.md#^ref-5020e892-178-0) (line 178, col 0, score 1)
- [Diagrams — L39](chunks/diagrams.md#^ref-45cd25b5-39-0) (line 39, col 0, score 1)
- [DSL — L41](chunks/dsl.md#^ref-e87bc036-41-0) (line 41, col 0, score 1)
- [JavaScript — L40](chunks/javascript.md#^ref-c1618c66-40-0) (line 40, col 0, score 1)
- [Math Fundamentals — L40](chunks/math-fundamentals.md#^ref-c6e87433-40-0) (line 40, col 0, score 1)
- [Services — L38](chunks/services.md#^ref-75ea4a6a-38-0) (line 38, col 0, score 1)
- [EidolonField — L257](eidolonfield.md#^ref-49d1e1e5-257-0) (line 257, col 0, score 1)
- [Event Bus MVP — L558](event-bus-mvp.md#^ref-534fe91d-558-0) (line 558, col 0, score 1)
- [Factorio AI with External Agents — L147](factorio-ai-with-external-agents.md#^ref-a4d90289-147-0) (line 147, col 0, score 1)
- [field-node-diagram-outline — L116](field-node-diagram-outline.md#^ref-1f32c94a-116-0) (line 116, col 0, score 1)
- [field-node-diagram-set — L147](field-node-diagram-set.md#^ref-22b989d5-147-0) (line 147, col 0, score 1)
- [field-node-diagram-visualizations — L96](field-node-diagram-visualizations.md#^ref-e9b27b06-96-0) (line 96, col 0, score 1)
- [Fnord Tracer Protocol — L249](fnord-tracer-protocol.md#^ref-fc21f824-249-0) (line 249, col 0, score 1)
- [graph-ds — L368](graph-ds.md#^ref-6620e2f2-368-0) (line 368, col 0, score 1)
- [heartbeat-fragment-demo — L115](heartbeat-fragment-demo.md#^ref-dd00677a-115-0) (line 115, col 0, score 1)
- [heartbeat-simulation-snippets — L104](heartbeat-simulation-snippets.md#^ref-23e221e9-104-0) (line 104, col 0, score 1)
- [Diagrams — L13](chunks/diagrams.md#^ref-45cd25b5-13-0) (line 13, col 0, score 1)
- [DSL — L15](chunks/dsl.md#^ref-e87bc036-15-0) (line 15, col 0, score 1)
- [JavaScript — L18](chunks/javascript.md#^ref-c1618c66-18-0) (line 18, col 0, score 1)
- [Math Fundamentals — L14](chunks/math-fundamentals.md#^ref-c6e87433-14-0) (line 14, col 0, score 1)
- [Services — L14](chunks/services.md#^ref-75ea4a6a-14-0) (line 14, col 0, score 1)
- [Shared — L7](chunks/shared.md#^ref-623a55f7-7-0) (line 7, col 0, score 1)
- [Simulation Demo — L10](chunks/simulation-demo.md#^ref-557309a3-10-0) (line 10, col 0, score 1)
- [Tooling — L9](chunks/tooling.md#^ref-6cb4943e-9-0) (line 9, col 0, score 1)
- [Window Management — L15](chunks/window-management.md#^ref-9e8ae388-15-0) (line 15, col 0, score 1)
- [AI-Centric OS with MCP Layer — L407](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-407-0) (line 407, col 0, score 1)
- [api-gateway-versioning — L284](api-gateway-versioning.md#^ref-0580dcd3-284-0) (line 284, col 0, score 1)
- [Services — L21](chunks/services.md#^ref-75ea4a6a-21-0) (line 21, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L43](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-43-0) (line 43, col 0, score 1)
- [Dynamic Context Model for Web Components — L407](dynamic-context-model-for-web-components.md#^ref-f7702bf8-407-0) (line 407, col 0, score 1)
- [eidolon-field-math-foundations — L167](eidolon-field-math-foundations.md#^ref-008f2ac0-167-0) (line 167, col 0, score 1)
- [i3-bluetooth-setup — L123](i3-bluetooth-setup.md#^ref-5e408692-123-0) (line 123, col 0, score 1)
- [i3-config-validation-methods — L78](i3-config-validation-methods.md#^ref-d28090ac-78-0) (line 78, col 0, score 1)
- [Local-Offline-Model-Deployment-Strategy — L295](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-295-0) (line 295, col 0, score 1)
- [Math Fundamentals — L34](chunks/math-fundamentals.md#^ref-c6e87433-34-0) (line 34, col 0, score 1)
- [Services — L22](chunks/services.md#^ref-75ea4a6a-22-0) (line 22, col 0, score 1)
- [Shared — L29](chunks/shared.md#^ref-623a55f7-29-0) (line 29, col 0, score 1)
- [Simulation Demo — L23](chunks/simulation-demo.md#^ref-557309a3-23-0) (line 23, col 0, score 1)
- [Tooling — L16](chunks/tooling.md#^ref-6cb4943e-16-0) (line 16, col 0, score 1)
- [Window Management — L25](chunks/window-management.md#^ref-9e8ae388-25-0) (line 25, col 0, score 1)
- [compiler-kit-foundations — L627](compiler-kit-foundations.md#^ref-01b21543-627-0) (line 627, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L171](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-171-0) (line 171, col 0, score 1)
- [Duck's Attractor States — L81](ducks-attractor-states.md#^ref-13951643-81-0) (line 81, col 0, score 1)
- [Lispy Macros with syntax-rules — L408](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-408-0) (line 408, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L182](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-182-0) (line 182, col 0, score 1)
- [Local-Offline-Model-Deployment-Strategy — L307](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-307-0) (line 307, col 0, score 1)
- [Local-Only-LLM-Workflow — L210](local-only-llm-workflow.md#^ref-9a8ab57e-210-0) (line 210, col 0, score 1)
- [markdown-to-org-transpiler — L320](markdown-to-org-transpiler.md#^ref-ab54cdd8-320-0) (line 320, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L272](migrate-to-provider-tenant-architecture.md#^ref-54382370-272-0) (line 272, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L136](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-136-0) (line 136, col 0, score 1)
- [Mongo Outbox Implementation — L583](mongo-outbox-implementation.md#^ref-9c1acd1e-583-0) (line 583, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L48](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-48-0) (line 48, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L109](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-109-0) (line 109, col 0, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L529](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-529-0) (line 529, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L138](protocol-0-the-contradiction-engine.md#^ref-9a93a756-138-0) (line 138, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L166](chroma-toolkit-consolidation-plan.md#^ref-5020e892-166-0) (line 166, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L207](cross-language-runtime-polymorphism.md#^ref-c34c36a6-207-0) (line 207, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L193](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-193-0) (line 193, col 0, score 1)
- [Dynamic Context Model for Web Components — L381](dynamic-context-model-for-web-components.md#^ref-f7702bf8-381-0) (line 381, col 0, score 1)
- [Exception Layer Analysis — L154](exception-layer-analysis.md#^ref-21d5cc09-154-0) (line 154, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L265](migrate-to-provider-tenant-architecture.md#^ref-54382370-265-0) (line 265, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L130](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-130-0) (line 130, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L39](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-39-0) (line 39, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L38](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-38-0) (line 38, col 0, score 1)
- [aionian-circuit-math — L153](aionian-circuit-math.md#^ref-f2d83a77-153-0) (line 153, col 0, score 1)
- [JavaScript — L24](chunks/javascript.md#^ref-c1618c66-24-0) (line 24, col 0, score 1)
- [Math Fundamentals — L26](chunks/math-fundamentals.md#^ref-c6e87433-26-0) (line 26, col 0, score 1)
- [compiler-kit-foundations — L607](compiler-kit-foundations.md#^ref-01b21543-607-0) (line 607, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L201](cross-language-runtime-polymorphism.md#^ref-c34c36a6-201-0) (line 201, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L166](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-166-0) (line 166, col 0, score 1)
- [Dynamic Context Model for Web Components — L416](dynamic-context-model-for-web-components.md#^ref-f7702bf8-416-0) (line 416, col 0, score 1)
- [field-interaction-equations — L153](field-interaction-equations.md#^ref-b09141b7-153-0) (line 153, col 0, score 1)
- [graph-ds — L371](graph-ds.md#^ref-6620e2f2-371-0) (line 371, col 0, score 1)
- [field-node-diagram-visualizations — L89](field-node-diagram-visualizations.md#^ref-e9b27b06-89-0) (line 89, col 0, score 1)
- [heartbeat-fragment-demo — L99](heartbeat-fragment-demo.md#^ref-dd00677a-99-0) (line 99, col 0, score 1)
- [heartbeat-simulation-snippets — L86](heartbeat-simulation-snippets.md#^ref-23e221e9-86-0) (line 86, col 0, score 1)
- [homeostasis-decay-formulas — L154](homeostasis-decay-formulas.md#^ref-37b5d236-154-0) (line 154, col 0, score 1)
- [Interop and Source Maps — L518](interop-and-source-maps.md#^ref-cdfac40c-518-0) (line 518, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L136](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-136-0) (line 136, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L108](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-108-0) (line 108, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L168](chroma-toolkit-consolidation-plan.md#^ref-5020e892-168-0) (line 168, col 0, score 1)
- [ecs-scheduler-and-prefabs — L387](ecs-scheduler-and-prefabs.md#^ref-c62a1815-387-0) (line 387, col 0, score 1)
- [Event Bus MVP — L564](event-bus-mvp.md#^ref-534fe91d-564-0) (line 564, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L316](migrate-to-provider-tenant-architecture.md#^ref-54382370-316-0) (line 316, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L142](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-142-0) (line 142, col 0, score 1)
- [Promethean Event Bus MVP v0.1 — L882](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-882-0) (line 882, col 0, score 1)
- [2d-sandbox-field — L225](2d-sandbox-field.md#^ref-c710dc93-225-0) (line 225, col 0, score 1)
- [Admin Dashboard for User Management — L49](admin-dashboard-for-user-management.md#^ref-2901a3e9-49-0) (line 49, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L150](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-150-0) (line 150, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L163](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-163-0) (line 163, col 0, score 1)
- [AI-First-OS-Model-Context-Protocol — L9](ai-first-os-model-context-protocol.md#^ref-618198f4-9-0) (line 9, col 0, score 1)
- [aionian-circuit-math — L179](aionian-circuit-math.md#^ref-f2d83a77-179-0) (line 179, col 0, score 1)
- [api-gateway-versioning — L304](api-gateway-versioning.md#^ref-0580dcd3-304-0) (line 304, col 0, score 1)
- [archetype-ecs — L479](archetype-ecs.md#^ref-8f4c1e86-479-0) (line 479, col 0, score 1)
- [balanced-bst — L295](balanced-bst.md#^ref-d3e7db72-295-0) (line 295, col 0, score 1)
- [Exception Layer Analysis — L172](exception-layer-analysis.md#^ref-21d5cc09-172-0) (line 172, col 0, score 1)
- [field-dynamics-math-blocks — L154](field-dynamics-math-blocks.md#^ref-7cfc230d-154-0) (line 154, col 0, score 1)
- [field-interaction-equations — L164](field-interaction-equations.md#^ref-b09141b7-164-0) (line 164, col 0, score 1)
- [field-node-diagram-outline — L120](field-node-diagram-outline.md#^ref-1f32c94a-120-0) (line 120, col 0, score 1)
- [field-node-diagram-set — L149](field-node-diagram-set.md#^ref-22b989d5-149-0) (line 149, col 0, score 1)
- [field-node-diagram-visualizations — L99](field-node-diagram-visualizations.md#^ref-e9b27b06-99-0) (line 99, col 0, score 1)
- [graph-ds — L365](graph-ds.md#^ref-6620e2f2-365-0) (line 365, col 0, score 1)
- [heartbeat-fragment-demo — L111](heartbeat-fragment-demo.md#^ref-dd00677a-111-0) (line 111, col 0, score 1)
- [heartbeat-simulation-snippets — L101](heartbeat-simulation-snippets.md#^ref-23e221e9-101-0) (line 101, col 0, score 1)
- [promethean-system-diagrams — L207](promethean-system-diagrams.md#^ref-b51e19b4-207-0) (line 207, col 0, score 1)
- [Promethean Web UI Setup — L633](promethean-web-ui-setup.md#^ref-bc5172ca-633-0) (line 633, col 0, score 1)
- [Promethean Workflow Optimization — L20](promethean-workflow-optimization.md#^ref-d614d983-20-0) (line 20, col 0, score 1)
- [Prometheus Observability Stack — L543](prometheus-observability-stack.md#^ref-e90b5a16-543-0) (line 543, col 0, score 1)
- [Prompt_Folder_Bootstrap — L216](prompt-folder-bootstrap.md#^ref-bd4f0976-216-0) (line 216, col 0, score 1)
- [prompt-programming-language-lisp — L116](prompt-programming-language-lisp.md#^ref-d41a06d1-116-0) (line 116, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L156](protocol-0-the-contradiction-engine.md#^ref-9a93a756-156-0) (line 156, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L238](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-238-0) (line 238, col 0, score 1)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L445](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-445-0) (line 445, col 0, score 1)
- [Shared Package Structure — L195](shared-package-structure.md#^ref-66a72fc3-195-0) (line 195, col 0, score 1)
- [Services — L28](chunks/services.md#^ref-75ea4a6a-28-0) (line 28, col 0, score 1)
- [Simulation Demo — L7](chunks/simulation-demo.md#^ref-557309a3-7-0) (line 7, col 0, score 1)
- [ecs-scheduler-and-prefabs — L428](ecs-scheduler-and-prefabs.md#^ref-c62a1815-428-0) (line 428, col 0, score 1)
- [Eidolon Field Abstract Model — L199](eidolon-field-abstract-model.md#^ref-5e8b2388-199-0) (line 199, col 0, score 1)
- [eidolon-node-lifecycle — L35](eidolon-node-lifecycle.md#^ref-938eca9c-35-0) (line 35, col 0, score 1)
- [Event Bus MVP — L570](event-bus-mvp.md#^ref-534fe91d-570-0) (line 570, col 0, score 1)
- [field-interaction-equations — L173](field-interaction-equations.md#^ref-b09141b7-173-0) (line 173, col 0, score 1)
- [field-node-diagram-outline — L113](field-node-diagram-outline.md#^ref-1f32c94a-113-0) (line 113, col 0, score 1)
- [aionian-circuit-math — L165](aionian-circuit-math.md#^ref-f2d83a77-165-0) (line 165, col 0, score 1)
- [api-gateway-versioning — L319](api-gateway-versioning.md#^ref-0580dcd3-319-0) (line 319, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L116](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-116-0) (line 116, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L209](chroma-toolkit-consolidation-plan.md#^ref-5020e892-209-0) (line 209, col 0, score 1)
- [DSL — L13](chunks/dsl.md#^ref-e87bc036-13-0) (line 13, col 0, score 1)
- [Math Fundamentals — L16](chunks/math-fundamentals.md#^ref-c6e87433-16-0) (line 16, col 0, score 1)
- [Services — L16](chunks/services.md#^ref-75ea4a6a-16-0) (line 16, col 0, score 1)
- [Shared — L5](chunks/shared.md#^ref-623a55f7-5-0) (line 5, col 0, score 1)
- [Simulation Demo — L12](chunks/simulation-demo.md#^ref-557309a3-12-0) (line 12, col 0, score 1)
- [Language-Agnostic Mirror System — L538](language-agnostic-mirror-system.md#^ref-d2b3628c-538-0) (line 538, col 0, score 1)
- [layer-1-uptime-diagrams — L178](layer-1-uptime-diagrams.md#^ref-4127189a-178-0) (line 178, col 0, score 1)
- [Lisp-Compiler-Integration — L550](lisp-compiler-integration.md#^ref-cfee6d36-550-0) (line 550, col 0, score 1)
- [lisp-dsl-for-window-management — L223](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-223-0) (line 223, col 0, score 1)
- [Lispy Macros with syntax-rules — L406](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-406-0) (line 406, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L168](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-168-0) (line 168, col 0, score 1)
- [ripple-propagation-demo — L118](ripple-propagation-demo.md#^ref-8430617b-118-0) (line 118, col 0, score 1)
- [eidolon-node-lifecycle — L63](eidolon-node-lifecycle.md#^ref-938eca9c-63-0) (line 63, col 0, score 1)
- [EidolonField — L269](eidolonfield.md#^ref-49d1e1e5-269-0) (line 269, col 0, score 1)
- [Event Bus MVP — L566](event-bus-mvp.md#^ref-534fe91d-566-0) (line 566, col 0, score 1)
- [Event Bus Projections Architecture — L185](event-bus-projections-architecture.md#^ref-cf6b9b17-185-0) (line 185, col 0, score 1)
- [Exception Layer Analysis — L165](exception-layer-analysis.md#^ref-21d5cc09-165-0) (line 165, col 0, score 1)
- [Factorio AI with External Agents — L160](factorio-ai-with-external-agents.md#^ref-a4d90289-160-0) (line 160, col 0, score 1)
- [field-dynamics-math-blocks — L165](field-dynamics-math-blocks.md#^ref-7cfc230d-165-0) (line 165, col 0, score 1)
- [field-interaction-equations — L184](field-interaction-equations.md#^ref-b09141b7-184-0) (line 184, col 0, score 1)
- [field-node-diagram-outline — L132](field-node-diagram-outline.md#^ref-1f32c94a-132-0) (line 132, col 0, score 1)
- [markdown-to-org-transpiler — L318](markdown-to-org-transpiler.md#^ref-ab54cdd8-318-0) (line 318, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L322](migrate-to-provider-tenant-architecture.md#^ref-54382370-322-0) (line 322, col 0, score 1)
- [Mongo Outbox Implementation — L579](mongo-outbox-implementation.md#^ref-9c1acd1e-579-0) (line 579, col 0, score 1)
- [observability-infrastructure-setup — L369](observability-infrastructure-setup.md#^ref-b4e64f8c-369-0) (line 369, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L183](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-183-0) (line 183, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L483](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-483-0) (line 483, col 0, score 1)
- [polymorphic-meta-programming-engine — L241](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-241-0) (line 241, col 0, score 1)
- [Promethean Agent Config DSL — L352](promethean-agent-config-dsl.md#^ref-2c00ce45-352-0) (line 352, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L66](promethean-copilot-intent-engine.md#^ref-ae24a280-66-0) (line 66, col 0, score 1)
- [sibilant-macro-targets — L172](sibilant-macro-targets.md#^ref-c5c9a5c6-172-0) (line 172, col 0, score 1)
- [Sibilant Meta-Prompt DSL — L205](sibilant-meta-prompt-dsl.md#^ref-af5d2824-205-0) (line 205, col 0, score 1)
- [sibilant-meta-string-templating-runtime — L137](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-137-0) (line 137, col 0, score 1)
- [sibilant-metacompiler-overview — L90](sibilant-metacompiler-overview.md#^ref-61d4086b-90-0) (line 90, col 0, score 1)
- [State Snapshots API and Transactional Projector — L366](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-366-0) (line 366, col 0, score 1)
- [System Scheduler with Resource-Aware DAG — L394](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-394-0) (line 394, col 0, score 1)
- [template-based-compilation — L104](template-based-compilation.md#^ref-f8877e5e-104-0) (line 104, col 0, score 1)
- [ts-to-lisp-transpiler — L8](ts-to-lisp-transpiler.md#^ref-ba11486b-8-0) (line 8, col 0, score 1)
- [typed-struct-compiler — L384](typed-struct-compiler.md#^ref-78eeedf7-384-0) (line 384, col 0, score 1)
- [markdown-to-org-transpiler — L313](markdown-to-org-transpiler.md#^ref-ab54cdd8-313-0) (line 313, col 0, score 1)
- [Matplotlib Animation with Async Execution — L79](matplotlib-animation-with-async-execution.md#^ref-687439f9-79-0) (line 79, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L299](migrate-to-provider-tenant-architecture.md#^ref-54382370-299-0) (line 299, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L151](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-151-0) (line 151, col 0, score 1)
- [Mongo Outbox Implementation — L587](mongo-outbox-implementation.md#^ref-9c1acd1e-587-0) (line 587, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L77](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-77-0) (line 77, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L179](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-179-0) (line 179, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L282](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-282-0) (line 282, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L480](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-480-0) (line 480, col 0, score 1)
- [Promethean_Eidolon_Synchronicity_Model — L74](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-74-0) (line 74, col 0, score 1)
- [Promethean Event Bus MVP v0.1 — L929](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-929-0) (line 929, col 0, score 1)
- [Promethean Infrastructure Setup — L597](promethean-infrastructure-setup.md#^ref-6deed6ac-597-0) (line 597, col 0, score 1)
- [Promethean-native config design — L421](promethean-native-config-design.md#^ref-ab748541-421-0) (line 421, col 0, score 1)
- [promethean-system-diagrams — L217](promethean-system-diagrams.md#^ref-b51e19b4-217-0) (line 217, col 0, score 1)
- [Promethean Web UI Setup — L629](promethean-web-ui-setup.md#^ref-bc5172ca-629-0) (line 629, col 0, score 1)
- [Prompt_Folder_Bootstrap — L193](prompt-folder-bootstrap.md#^ref-bd4f0976-193-0) (line 193, col 0, score 1)
- [prompt-programming-language-lisp — L107](prompt-programming-language-lisp.md#^ref-d41a06d1-107-0) (line 107, col 0, score 1)
- [DSL — L26](chunks/dsl.md#^ref-e87bc036-26-0) (line 26, col 0, score 1)
- [ecs-scheduler-and-prefabs — L433](ecs-scheduler-and-prefabs.md#^ref-c62a1815-433-0) (line 433, col 0, score 1)
- [Event Bus MVP — L577](event-bus-mvp.md#^ref-534fe91d-577-0) (line 577, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L174](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-174-0) (line 174, col 0, score 1)
- [Local-Only-LLM-Workflow — L211](local-only-llm-workflow.md#^ref-9a8ab57e-211-0) (line 211, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L334](migrate-to-provider-tenant-architecture.md#^ref-54382370-334-0) (line 334, col 0, score 1)
- [Mongo Outbox Implementation — L581](mongo-outbox-implementation.md#^ref-9c1acd1e-581-0) (line 581, col 0, score 1)
- [observability-infrastructure-setup — L397](observability-infrastructure-setup.md#^ref-b4e64f8c-397-0) (line 397, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L48](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-48-0) (line 48, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L138](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-138-0) (line 138, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L193](chroma-toolkit-consolidation-plan.md#^ref-5020e892-193-0) (line 193, col 0, score 1)
- [Diagrams — L43](chunks/diagrams.md#^ref-45cd25b5-43-0) (line 43, col 0, score 1)
- [Services — L41](chunks/services.md#^ref-75ea4a6a-41-0) (line 41, col 0, score 1)
- [ecs-scheduler-and-prefabs — L417](ecs-scheduler-and-prefabs.md#^ref-c62a1815-417-0) (line 417, col 0, score 1)
- [eidolon-node-lifecycle — L62](eidolon-node-lifecycle.md#^ref-938eca9c-62-0) (line 62, col 0, score 1)
- [Event Bus MVP — L583](event-bus-mvp.md#^ref-534fe91d-583-0) (line 583, col 0, score 1)
- [Event Bus Projections Architecture — L182](event-bus-projections-architecture.md#^ref-cf6b9b17-182-0) (line 182, col 0, score 1)
- [Fnord Tracer Protocol — L266](fnord-tracer-protocol.md#^ref-fc21f824-266-0) (line 266, col 0, score 1)
- [i3-bluetooth-setup — L128](i3-bluetooth-setup.md#^ref-5e408692-128-0) (line 128, col 0, score 1)
- [layer-1-uptime-diagrams — L193](layer-1-uptime-diagrams.md#^ref-4127189a-193-0) (line 193, col 0, score 1)
- [Diagrams — L50](chunks/diagrams.md#^ref-45cd25b5-50-0) (line 50, col 0, score 1)
- [DSL — L44](chunks/dsl.md#^ref-e87bc036-44-0) (line 44, col 0, score 1)
- [JavaScript — L48](chunks/javascript.md#^ref-c1618c66-48-0) (line 48, col 0, score 1)
- [Math Fundamentals — L43](chunks/math-fundamentals.md#^ref-c6e87433-43-0) (line 43, col 0, score 1)
- [Operations — L15](chunks/operations.md#^ref-f1add613-15-0) (line 15, col 0, score 1)
- [Shared — L31](chunks/shared.md#^ref-623a55f7-31-0) (line 31, col 0, score 1)
- [Simulation Demo — L34](chunks/simulation-demo.md#^ref-557309a3-34-0) (line 34, col 0, score 1)
- [Tooling — L28](chunks/tooling.md#^ref-6cb4943e-28-0) (line 28, col 0, score 1)
- [Window Management — L38](chunks/window-management.md#^ref-9e8ae388-38-0) (line 38, col 0, score 1)
- [compiler-kit-foundations — L651](compiler-kit-foundations.md#^ref-01b21543-651-0) (line 651, col 0, score 1)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
