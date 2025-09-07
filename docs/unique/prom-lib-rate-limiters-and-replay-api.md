---
uuid: 19515f74-9865-4451-b92c-f3ba6fe85871
created_at: prom-lib-rate-limiters-and-replay-api.md
filename: prom-lib-rate-limiters-and-replay-api
title: prom-lib-rate-limiters-and-replay-api
description: >-
  Implements token bucket rate limiting for WebSocket connections and topics,
  with backpressure handling and a replay/export API for event data. Includes
  optional pause/resume controls for client-side backpressure management.
tags:
  - rate-limiting
  - backpressure
  - replay-api
  - token-bucket
  - websocket
  - event-store
  - exactly-once
  - bench
related_to_uuid:
  - 2792d448-c3b5-4050-93dd-93768529d99c
  - 1f32c94a-4da4-4266-8ac0-6c282cfb401f
  - 22b989d5-f4aa-4880-8632-709c21830f83
  - e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
  - fc21f824-4244-4030-a48e-c4170160ea1d
  - a4a25141-6380-40b9-9cd7-b554b246b303
  - 6620e2f2-de6d-45d8-a722-5d26e160b370
  - dd00677a-2280-45a7-91af-0728b21af3ad
  - 5e408692-0e74-400e-a617-84247c7353ad
  - 291c7d91-da8c-486c-9bc0-bd2254536e2d
  - dd89372d-10de-42a9-8c96-6bc13ea36d02
  - 64a9f9f9-58ee-4996-bdaf-9373845c6b29
  - 78eeedf7-75bc-4692-a5a7-bb6857270621
  - ed6f3fc9-5eb1-482c-8b3c-f0abc5aff2a2
  - 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
  - 62bec6f0-4e13-4f38-aca4-72c84ba02367
  - 1b1338fc-bb4d-41df-828f-e219cc9442eb
  - 10d98225-12e0-4212-8e15-88b57cf7bee5
  - 13951643-1741-46bb-89dc-1beebb122633
  - 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
  - d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
  - b4e64f8c-4dc9-4941-a877-646c5ada068e
  - 7bed0b9a-8b22-4b1f-be81-054a179453cb
  - 21d5cc09-b005-4ede-8f69-00b4b0794540
  - 01b21543-7e03-4129-8fe4-b6306be69dee
related_to_title:
  - Docops Feature Updates
  - field-node-diagram-outline
  - field-node-diagram-set
  - field-node-diagram-visualizations
  - Fnord Tracer Protocol
  - Functional Embedding Pipeline Refactor
  - graph-ds
  - heartbeat-fragment-demo
  - i3-bluetooth-setup
  - Ice Box Reorganization
  - komorebi-group-window-hack
  - Layer1SurvivabilityEnvelope
  - typed-struct-compiler
  - Unique Concepts
  - Unique Info Dump Index
  - zero-copy-snapshots-and-workers
  - Canonical Org-Babel Matplotlib Animation Template
  - Creative Moments
  - Duck's Attractor States
  - eidolon-field-math-foundations
  - schema-evolution-workflow
  - observability-infrastructure-setup
  - polymorphic-meta-programming-engine
  - Exception Layer Analysis
  - compiler-kit-foundations
references:
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 1016
    col: 0
    score: 1
  - uuid: ed6f3fc9-5eb1-482c-8b3c-f0abc5aff2a2
    line: 175
    col: 0
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 1221
    col: 0
    score: 1
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 1058
    col: 0
    score: 1
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 515
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 251
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 559
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 1033
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 226
    col: 0
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 705
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 719
    col: 0
    score: 1
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 601
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 1060
    col: 0
    score: 1
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 726
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 996
    col: 0
    score: 1
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 667
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 736
    col: 0
    score: 1
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 645
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 739
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 816
    col: 0
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 217
    col: 0
    score: 0.93
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 710
    col: 0
    score: 0.93
  - uuid: b4e64f8c-4dc9-4941-a877-646c5ada068e
    line: 348
    col: 0
    score: 0.88
  - uuid: 7bed0b9a-8b22-4b1f-be81-054a179453cb
    line: 190
    col: 0
    score: 0.87
  - uuid: c14edce7-0656-45b2-aaf3-51f042451b7d
    line: 388
    col: 0
    score: 0.87
  - uuid: d28090ac-f746-4958-aab5-ed1315382c04
    line: 28
    col: 0
    score: 0.87
  - uuid: 21d5cc09-b005-4ede-8f69-00b4b0794540
    line: 63
    col: 0
    score: 0.87
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 590
    col: 0
    score: 0.87
  - uuid: 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
    line: 129
    col: 0
    score: 0.86
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 174
    col: 0
    score: 0.86
  - uuid: e2135d9f-c69d-47ee-9b17-0b05e98dc748
    line: 170
    col: 0
    score: 0.86
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 264
    col: 0
    score: 0.86
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 223
    col: 0
    score: 0.86
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 239
    col: 0
    score: 0.86
  - uuid: 2d6e5553-8dc4-497f-bf45-96f8ca00a6f6
    line: 212
    col: 0
    score: 0.86
  - uuid: 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
    line: 260
    col: 0
    score: 0.85
  - uuid: e811123d-5841-4e52-bf8c-978f26db4230
    line: 631
    col: 0
    score: 0.85
  - uuid: c5fba0a0-9196-468d-a0f3-51c99e987263
    line: 148
    col: 0
    score: 0.85
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
^ref-aee4718b-194-0 ^ref-aee4718b-200-0

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
^ref-aee4718b-226-0 ^ref-aee4718b-233-0

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
^ref-aee4718b-260-0 ^ref-aee4718b-266-0
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
^ref-aee4718b-280-0

## 4b) Subscriber (latency stats)
 ^ref-aee4718b-306-0
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
^ref-aee4718b-306-0
``` ^ref-aee4718b-329-0 ^ref-aee4718b-337-0 ^ref-aee4718b-349-0 ^ref-aee4718b-369-0
^ref-aee4718b-307-0
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
* and a **Changelog projector** (topic → materialized Mongo collection with upsert/unique constraints).
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [Docops Feature Updates](docops-feature-updates.md)
- [field-node-diagram-outline](field-node-diagram-outline.md)
- [field-node-diagram-set](field-node-diagram-set.md)
- [field-node-diagram-visualizations](field-node-diagram-visualizations.md)
- [Fnord Tracer Protocol](fnord-tracer-protocol.md)
- [Functional Embedding Pipeline Refactor](functional-embedding-pipeline-refactor.md)
- [graph-ds](graph-ds.md)
- [heartbeat-fragment-demo](heartbeat-fragment-demo.md)
- [i3-bluetooth-setup](i3-bluetooth-setup.md)
- [Ice Box Reorganization](ice-box-reorganization.md)
- [komorebi-group-window-hack](komorebi-group-window-hack.md)
- [Layer1SurvivabilityEnvelope](layer1survivabilityenvelope.md)
- [typed-struct-compiler](typed-struct-compiler.md)
- [Unique Concepts](unique-concepts.md)
- [Unique Info Dump Index](unique-info-dump-index.md)
- [zero-copy-snapshots-and-workers](zero-copy-snapshots-and-workers.md)
- [Canonical Org-Babel Matplotlib Animation Template](canonical-org-babel-matplotlib-animation-template.md)
- [Creative Moments](creative-moments.md)
- [Duck's Attractor States](ducks-attractor-states.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [schema-evolution-workflow](schema-evolution-workflow.md)
- [observability-infrastructure-setup](observability-infrastructure-setup.md)
- [polymorphic-meta-programming-engine](polymorphic-meta-programming-engine.md)
- [Exception Layer Analysis](exception-layer-analysis.md)
- [compiler-kit-foundations](compiler-kit-foundations.md)
## Sources
- [typed-struct-compiler — L1016](typed-struct-compiler.md#^ref-78eeedf7-1016-0) (line 1016, col 0, score 1)
- [Unique Concepts — L175](unique-concepts.md#^ref-ed6f3fc9-175-0) (line 175, col 0, score 1)
- [Unique Info Dump Index — L1221](unique-info-dump-index.md#^ref-30ec3ba6-1221-0) (line 1221, col 0, score 1)
- [zero-copy-snapshots-and-workers — L1058](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-1058-0) (line 1058, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L515](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-515-0) (line 515, col 0, score 1)
- [Creative Moments — L251](creative-moments.md#^ref-10d98225-251-0) (line 251, col 0, score 1)
- [Duck's Attractor States — L559](ducks-attractor-states.md#^ref-13951643-559-0) (line 559, col 0, score 1)
- [eidolon-field-math-foundations — L1033](eidolon-field-math-foundations.md#^ref-008f2ac0-1033-0) (line 1033, col 0, score 1)
- [Docops Feature Updates — L226](docops-feature-updates.md#^ref-2792d448-226-0) (line 226, col 0, score 1)
- [field-node-diagram-outline — L705](field-node-diagram-outline.md#^ref-1f32c94a-705-0) (line 705, col 0, score 1)
- [field-node-diagram-set — L719](field-node-diagram-set.md#^ref-22b989d5-719-0) (line 719, col 0, score 1)
- [field-node-diagram-visualizations — L601](field-node-diagram-visualizations.md#^ref-e9b27b06-601-0) (line 601, col 0, score 1)
- [Fnord Tracer Protocol — L1060](fnord-tracer-protocol.md#^ref-fc21f824-1060-0) (line 1060, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L726](functional-embedding-pipeline-refactor.md#^ref-a4a25141-726-0) (line 726, col 0, score 1)
- [graph-ds — L996](graph-ds.md#^ref-6620e2f2-996-0) (line 996, col 0, score 1)
- [heartbeat-fragment-demo — L667](heartbeat-fragment-demo.md#^ref-dd00677a-667-0) (line 667, col 0, score 1)
- [i3-bluetooth-setup — L736](i3-bluetooth-setup.md#^ref-5e408692-736-0) (line 736, col 0, score 1)
- [Ice Box Reorganization — L645](ice-box-reorganization.md#^ref-291c7d91-645-0) (line 645, col 0, score 1)
- [komorebi-group-window-hack — L739](komorebi-group-window-hack.md#^ref-dd89372d-739-0) (line 739, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L816](layer1survivabilityenvelope.md#^ref-64a9f9f9-816-0) (line 816, col 0, score 1)
- [Unique Info Dump Index — L217](unique-info-dump-index.md#^ref-30ec3ba6-217-0) (line 217, col 0, score 0.93)
- [schema-evolution-workflow — L710](schema-evolution-workflow.md#^ref-d8059b6a-710-0) (line 710, col 0, score 0.93)
- [observability-infrastructure-setup — L348](observability-infrastructure-setup.md#^ref-b4e64f8c-348-0) (line 348, col 0, score 0.88)
- [polymorphic-meta-programming-engine — L190](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-190-0) (line 190, col 0, score 0.87)
- [universal-intention-code-fabric — L388](universal-intention-code-fabric.md#^ref-c14edce7-388-0) (line 388, col 0, score 0.87)
- [i3-config-validation-methods — L28](i3-config-validation-methods.md#^ref-d28090ac-28-0) (line 28, col 0, score 0.87)
- [Exception Layer Analysis — L63](exception-layer-analysis.md#^ref-21d5cc09-63-0) (line 63, col 0, score 0.87)
- [compiler-kit-foundations — L590](compiler-kit-foundations.md#^ref-01b21543-590-0) (line 590, col 0, score 0.87)
- [Local-Only-LLM-Workflow — L129](local-only-llm-workflow.md#^ref-9a8ab57e-129-0) (line 129, col 0, score 0.86)
- [Docops Feature Updates — L174](docops-feature-updates-3.md#^ref-cdbd21ee-174-0) (line 174, col 0, score 0.86)
- [Pipeline Enhancements — L170](pipeline-enhancements.md#^ref-e2135d9f-170-0) (line 170, col 0, score 0.86)
- [heartbeat-fragment-demo — L264](heartbeat-fragment-demo.md#^ref-dd00677a-264-0) (line 264, col 0, score 0.86)
- [obsidian-ignore-node-modules-regex — L223](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-223-0) (line 223, col 0, score 0.86)
- [Post-Linguistic Transhuman Design Frameworks — L239](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-239-0) (line 239, col 0, score 0.86)
- [Promethean_Eidolon_Synchronicity_Model — L212](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-212-0) (line 212, col 0, score 0.86)
- [Event Bus MVP — L260](event-bus-mvp.md#^ref-534fe91d-260-0) (line 260, col 0, score 0.85)
- [WebSocket Gateway Implementation — L631](websocket-gateway-implementation.md#^ref-e811123d-631-0) (line 631, col 0, score 0.85)
- [set-assignment-in-lisp-ast — L148](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-148-0) (line 148, col 0, score 0.85)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
