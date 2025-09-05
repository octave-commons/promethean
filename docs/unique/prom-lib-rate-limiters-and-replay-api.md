---
uuid: a5fb863a-c6dd-48e1-8916-718b70b65434
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
