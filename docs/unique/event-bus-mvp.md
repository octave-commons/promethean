---
uuid: 65c145c7-fe3e-4989-9aae-5db39fa0effc
created_at: event-bus-mvp.md
filename: event-bus-mvp
title: event-bus-mvp
description: >-
  A minimal TypeScript Event Bus implementation with in-memory storage for
  real-time event processing and message delivery. Includes core interfaces for
  publishing, subscribing, acknowledging messages, and cursor management for
  state tracking.
tags:
  - typescript
  - event-bus
  - mvp
  - in-memory
  - message-queue
  - real-time
  - event-driven
  - cursor-management
  - ack-nack
  - publish-subscribe
---
lol I’m not “insane,” I’m just well-fed and caffeinated. You’re absolutely a programmer; I’m just your obnoxiously fast coworker. Alright—more dump, less talk. Here’s a compact but _useful_ **Event Bus MVP** you can paste into `shared/js/prom-lib/event/` and wire up today. ^ref-534fe91d-1-0

# prom-lib/event — MVP (TypeScript)

## 1) Types + Validators (`types.ts`)

```ts
// shared/js/prom-lib/event/types.ts
export type UUID = string;
export type Millis = number;
export type Vec8 = [number,number,number,number,number,number,number,number];

export interface EventRecord<T = unknown> {
  id: UUID;           // uuidv7
  sid?: UUID;         // boot/session id
  ts: Millis;         // epoch ms
  topic: string;      // e.g. "heartbeat.received"
  key?: string;       // for compaction/partitioning
  partition?: number; // adapter-defined
  headers?: Record<string, string>;
  payload: T;         // JSON-safe
  caused_by?: UUID[];
  tags?: string[];
}

export interface DeliveryContext {
  attempt: number;
  maxAttempts: number;
  // last known offset for this subscription/group in this topic
  cursor?: CursorPosition;
}

export interface CursorPosition {
  topic: string;
  lastId?: UUID;   // last delivered acked id
  lastTs?: Millis; // optional for time-based catchup
}

export interface SubscribeOptions {
  group: string;           // durable consumer group name
  from?: "latest"|"earliest"|"ts"|"afterId";
  ts?: Millis;
  afterId?: UUID;
  batchSize?: number;      // default 100
  maxInFlight?: number;    // default 1000
  ackTimeoutMs?: number;   // default 30_000
  maxAttempts?: number;    // default 5
  filter?(e: EventRecord): boolean;
  topics?: string[];       // if adapter supports multi-topic fan-in
}

export interface PublishOptions {
  id?: UUID;
  ts?: Millis;
  key?: string;
  headers?: Record<string, string>;
  tags?: string[];
  caused_by?: UUID[];
  sid?: UUID;
}

export interface Ack {
  id: UUID;
  ok: boolean;
  err?: string;
}

export interface EventBus {
  publish<T>(topic: string, payload: T, opts?: PublishOptions): Promise<EventRecord<T>>;
  subscribe(
    topic: string,
    group: string,
    handler: (e: EventRecord, ctx: DeliveryContext) => Promise<void>,
    opts?: Omit<SubscribeOptions, "group">
  ): Promise<() => Promise<void>>; // unsubscribe
  ack(topic: string, group: string, id: UUID): Promise<Ack>;
  nack(topic: string, group: string, id: UUID, reason?: string): Promise<Ack>;
  // cursor utilities
  getCursor(topic: string, group: string): Promise<CursorPosition | null>;
  setCursor(topic: string, group: string, cursor: CursorPosition): Promise<void>;
}

export interface CursorStore {
  get(topic: string, group: string): Promise<CursorPosition | null>;
  set(topic: string, group: string, cursor: CursorPosition): Promise<void>;
}

export interface EventStore {
  insert<T>(e: EventRecord<T>): Promise<void>;
  // range scan from afterId OR from ts; returns ascending by ts (then id)
  scan(topic: string, params: { afterId?: UUID; ts?: Millis; limit?: number }): Promise<EventRecord[]>;
  // optional compaction helpers
  latestByKey?(topic: string, keys: string[]): Promise<Record<string, EventRecord | undefined>>;
}
```
^ref-534fe91d-7-0 ^ref-534fe91d-96-0

## 2) In-memory adapter (`memory.ts`)
 ^ref-534fe91d-99-0
```ts
// shared/js/prom-lib/event/memory.ts
import { EventBus, EventRecord, EventStore, CursorStore, PublishOptions, CursorPosition, Ack, Millis, UUID } from "./types";

const now = () => Date.now();
// NOTE: use a proper uuidv7 lib in prod. Placeholder monotonic-ish ULID-like id:
let _ctr = 0;
const uuidv7 = (): UUID => `${Date.now().toString(16)}-${(_ctr++).toString(16).padStart(6,"0")}-${Math.random().toString(16).slice(2,10)}`;

export class InMemoryEventStore implements EventStore {
  private byTopic = new Map<string, EventRecord[]>();
  async insert<T>(e: EventRecord<T>): Promise<void> {
    const arr = this.byTopic.get(e.topic) ?? [];
    arr.push(e);
    this.byTopic.set(e.topic, arr);
  }
  async scan(topic: string, params: { afterId?: UUID; ts?: Millis; limit?: number }): Promise<EventRecord[]> {
    const arr = this.byTopic.get(topic) ?? [];
    let startIdx = 0;
    if (params.afterId) {
      const i = arr.findIndex(x => x.id === params.afterId);
      startIdx = i >= 0 ? i + 1 : 0;
    } else if (params.ts) {
      startIdx = arr.findIndex(x => x.ts >= params.ts!);
      if (startIdx < 0) startIdx = arr.length;
    }
    const slice = arr.slice(startIdx, params.limit ? startIdx + params.limit : undefined);
    return slice;
  }
}

export class InMemoryCursorStore implements CursorStore {
  private map = new Map<string, CursorPosition>();
  key(t: string, g: string) { return `${t}::${g}`; }
  async get(topic: string, group: string) { return this.map.get(this.key(topic, group)) ?? null; }
  async set(topic: string, group: string, cursor: CursorPosition) { this.map.set(this.key(topic, group), cursor); }
}

type Sub = {
  topic: string; group: string;
  handler: (e: EventRecord, ctx: any) => Promise<void>;
  opts: any; stopped: boolean; inflight: number; timer?: any;
};

export class InMemoryEventBus implements EventBus {
  private store: EventStore;
  private cursors: CursorStore;
  private subs: Set<Sub> = new Set();

  constructor(store = new InMemoryEventStore(), cursors = new InMemoryCursorStore()) {
    this.store = store; this.cursors = cursors;
  }

  async publish<T>(topic: string, payload: T, opts: PublishOptions = {}): Promise<EventRecord<T>> {
    const rec: EventRecord<T> = {
      id: opts.id ?? uuidv7(),
      sid: opts.sid,
      ts: opts.ts ?? now(),
      topic,
      key: opts.key, headers: opts.headers,
      payload, caused_by: opts.caused_by, tags: opts.tags,
    };
    await this.store.insert(rec);
    // kick all subs on this topic
    for (const sub of this.subs) if (sub.topic === topic) this.kick(sub);
    return rec;
  }

  async subscribe(topic: string, group: string, handler: Sub["handler"], opts: any = {}): Promise<() => Promise<void>> {
    const sub: Sub = { topic, group, handler, opts, stopped: false, inflight: 0 };
    this.subs.add(sub);
    this.kick(sub);
    return async () => { sub.stopped = true; this.subs.delete(sub); if (sub.timer) clearTimeout(sub.timer); };
  }

  private async kick(sub: Sub) {
    if (sub.stopped) return;
    const {
      batchSize = 100,
      maxInFlight = 1000,
      maxAttempts = 5,
      from = "latest",
      ts,
      afterId,
      filter
    } = sub.opts;

    if (sub.inflight >= maxInFlight) return;

    let cursor = await this.cursors.get(sub.topic, sub.group);
    // initialize cursor
    if (!cursor) {
      if (from === "latest") {
        // scan last one to set baseline; no delivery
        const last = (await this.store.scan(sub.topic, { ts: 0 })).at(-1);
        cursor = { topic: sub.topic, lastId: last?.id, lastTs: last?.ts };
      } else if (from === "earliest") {
        cursor = { topic: sub.topic };
      } else if (from === "ts") {
        cursor = { topic: sub.topic, lastTs: ts };
      } else if (from === "afterId") {
        cursor = { topic: sub.topic, lastId: afterId };
      } else {
        cursor = { topic: sub.topic };
      }
      await this.cursors.set(sub.topic, sub.group, cursor);
    }

    const batch = await this.store.scan(sub.topic, { afterId: cursor.lastId, ts: cursor.lastTs, limit: batchSize });
    const deliver = filter ? batch.filter(filter) : batch;

    if (deliver.length === 0) {
      // poll again soon
      sub.timer = setTimeout(() => this.kick(sub), 50);
      return;
    }

    for (const e of deliver) {
      if (sub.stopped) break;
      if (sub.inflight >= maxInFlight) break;

      sub.inflight++;
      const ctx = { attempt: 1, maxAttempts: maxAttempts, cursor };
      // fire-and-forget; ack immediately on success
      (async () => {
        try {
          await sub.handler(e, ctx);
          await this.ack(e.topic, sub.group, e.id);
        } catch (err) {
          // basic NACK: do nothing (consumer can reprocess on next kick)
          await this.nack(e.topic, sub.group, e.id, (err as Error)?.message);
        } finally {
          sub.inflight--;
          this.kick(sub);
        }
      })();
    }
  }

  async ack(topic: string, group: string, id: UUID): Promise<Ack> {
    const cursor = await this.cursors.get(topic, group) ?? { topic };
    // NOTE: we assume ascending (ts,id) order; real store should verify monotonicity
    cursor.lastId = id;
    await this.cursors.set(topic, group, cursor);
    return { id, ok: true };
  }

  async nack(topic: string, group: string, id: UUID, reason?: string): Promise<Ack> {
    // In-memory bus just leaves cursor unchanged; event will be re-delivered on next kick
    return { id, ok: true, err: reason };
  }

  getCursor(topic: string, group: string) { return this.cursors.get(topic, group); }
  setCursor(topic: string, group: string, cursor: CursorPosition) { return this.cursors.set(topic, group, cursor); }
}
^ref-534fe91d-99-0
```

## 3) Example usage (`example.ts`) ^ref-534fe91d-258-0

```ts
// shared/js/prom-lib/event/example.ts
import { InMemoryEventBus } from "./memory";

(async () => {
  const bus = new InMemoryEventBus();

  // SUBSCRIBE (durable)
  await bus.subscribe("heartbeat.received", "ops", async (e) => {
    // do stuff (update process table, emit metrics, etc.)
    // console.log("HB:", e.payload);
  }, { from: "earliest", batchSize: 100 });

  // PUBLISH
  await bus.publish("heartbeat.received", {
    pid: 12345, name: "stt", host: "dev", cpu_pct: 12.3, mem_mb: 256,
  }, { tags: ["#duck","#stt"] });

  // Optional: read the cursor
  const cur = await bus.getCursor("heartbeat.received", "ops");
  // console.log("cursor:", cur);
^ref-534fe91d-258-0
})();
```
^ref-534fe91d-260-0
 ^ref-534fe91d-284-0
## 4) Mongo adapter skeleton (`mongo.ts`)
 ^ref-534fe91d-287-0
```ts
// shared/js/prom-lib/event/mongo.ts
import { Collection, Db, IndexSpecification } from "mongodb";
import { EventBus, EventRecord, EventStore, CursorStore, PublishOptions, CursorPosition, Ack, UUID } from "./types";
import { InMemoryEventBus } from "./memory";

export class MongoEventStore implements EventStore {
  private coll: Collection<EventRecord>;
  constructor(db: Db, collectionName = "events") {
    this.coll = db.collection<EventRecord>(collectionName);
  }
  static async ensureIndexes(db: Db, name = "events") {
    const coll = db.collection(name);
    const idx: IndexSpecification[] = [
      { key: { topic: 1, ts: 1, id: 1 } },
      { key: { topic: 1, key: 1, ts: -1 } }, // supports compaction queries
      { key: { id: 1 }, unique: true },
      { key: { "headers.correlationId": 1 } },
    ];
    for (const i of idx) await coll.createIndex(i.key as any, { unique: (i as any).unique });
  }
  async insert<T>(e: EventRecord<T>): Promise<void> {
    await this.coll.insertOne(e as any);
  }
  async scan(topic: string, params: { afterId?: UUID; ts?: number; limit?: number }): Promise<EventRecord[]> {
    const q: any = { topic };
    if (params.afterId) q.id = { $gt: params.afterId };
    if (params.ts) q.ts = { $gte: params.ts };
    const cur = this.coll.find(q).sort({ ts: 1, id: 1 }).limit(params.limit ?? 1000);
    return cur.toArray();
  }
  async latestByKey(topic: string, keys: string[]) {
    const out: Record<string, EventRecord | undefined> = {};
    const cur = this.coll.aggregate([
      { $match: { topic, key: { $in: keys } } },
      { $sort: { key: 1, ts: -1, id: -1 } },
      { $group: { _id: "$key", doc: { $first: "$$ROOT" } } },
    ]);
    for await (const { _id, doc } of cur) out[_id] = doc;
    return out;
  }
}

export class MongoCursorStore implements CursorStore {
  private coll: Collection<CursorPosition & { _id: string }>;
  constructor(db: Db, collectionName = "cursors") {
    this.coll = db.collection(collectionName);
    this.coll.createIndex({ _id: 1 }, { unique: true }).catch(() => {});
  }
  key(t: string, g: string) { return `${t}::${g}`; }
  async get(topic: string, group: string) {
    const doc = await this.coll.findOne({ _id: this.key(topic, group) });
    if (!doc) return null;
    const { _id, ...rest } = doc;
    return rest as CursorPosition;
  }
  async set(topic: string, group: string, cursor: CursorPosition) {
    await this.coll.updateOne(
      { _id: this.key(topic, group) },
      { $set: cursor },
      { upsert: true }
    );
  }
}

// Quick composition (drop-in replacement for InMemoryEventBus)
export class MongoEventBus extends InMemoryEventBus {
  constructor(store: MongoEventStore, cursors: MongoCursorStore) {
    super(store, cursors);
^ref-534fe91d-284-0
  }
}
^ref-534fe91d-287-0
``` ^ref-534fe91d-359-0

## 5) Compaction topics (design) ^ref-534fe91d-361-0

Use **compaction** for streams that represent latest state by key (e.g., `process.state`, `agent.permission`, `kv.set`). In Mongo: ^ref-534fe91d-363-0

- Write every change as event with `{ topic, key, payload }`. ^ref-534fe91d-365-0
    
- Consumers that want _current_ state call `latestByKey(topic, keys[])`.
 ^ref-534fe91d-368-0
- Periodic compactor (or TTL) rewrites a **snapshot** topic, e.g. `process.state.snapshot`, containing `{ key, payload, ts }` for faster cold-start.
 ^ref-534fe91d-370-0

Minimal config sketch:

```ts
// shared/js/prom-lib/event/config.ts
export const Topics = {
  HeartbeatReceived: { name: "heartbeat.received", retentionDays: 3 },
^ref-534fe91d-370-0
  ProcessState:      { name: "process.state", compaction: true }, // keyed by process-id
  KvSet:             { name: "kv.set", compaction: true },        // keyed by path
} as const; ^ref-534fe91d-381-0 ^ref-534fe91d-383-0
```
 ^ref-534fe91d-383-0
## 6) Outbox pattern (service-local durability)
 ^ref-534fe91d-385-0
Pattern for services that must not lose messages:
 ^ref-534fe91d-387-0
1. **Local outbox** table (Mongo or sqlite) with `{ id, topic, payload, status:'pending|sent|error', last_err? }`.
    
2. Business txn writes to its own DB and appends to outbox in the same txn. ^ref-534fe91d-390-0
    
3. A **drainer** publishes pending rows to EventBus; on success marks `sent`. ^ref-534fe91d-392-0
    

Skeleton: ^ref-534fe91d-397-0

```ts
export interface OutboxStore<T=any> {
  add(rec: { id: UUID; topic: string; payload: T; headers?: Record<string,string> }): Promise<void>;
  claimBatch(n: number): Promise<{ id: UUID; topic: string; payload: T; headers?: Record<string,string> }[]>;
  markSent(id: UUID): Promise<void>;
  markError(id: UUID, err: string): Promise<void>;
}
export async function runOutboxDrainer(outbox: OutboxStore, bus: EventBus, intervalMs = 250) {
  while (true) {
    const batch = await outbox.claimBatch(100);
    if (batch.length === 0) { await new Promise(r => setTimeout(r, intervalMs)); continue; }
    for (const rec of batch) {
      try {
        await bus.publish(rec.topic, rec.payload, { headers: rec.headers });
        await outbox.markSent(rec.id);
      } catch (e) {
        await outbox.markError(rec.id, (e as Error).message);
^ref-534fe91d-392-0
      }
    }
  }
^ref-534fe91d-397-0
}
```

## 7) Metrics you probably want (names)

- `events_published_total{topic}`
    
- `events_delivered_total{topic,group}`
    
- `events_inflight{topic,group}`
    
- `events_acked_total{topic,group}`
    
- `events_nacked_total{topic,group}`
    
- `subscribe_poll_duration_ms_bucket{topic,group}`
 ^ref-534fe91d-434-0
- `delivery_handler_duration_ms_bucket{topic,group}`
    

## 8) Mermaid — sequence

```mermaid
sequenceDiagram
  autonumber
  participant Svc as Service A
  participant EB as EventBus
  participant ES as EventStore
  participant CS as CursorStore
  participant Sub as Consumer (group=ops)

  Svc->>EB: publish(topic,payload)
  EB->>ES: insert(EventRecord)
  EB-->>Sub: kick(group=ops)
^ref-534fe91d-434-0
  Sub->>ES: scan(afterId=cursor.lastId)
  ES-->>Sub: [EventRecord...]
  Sub->>Sub: handler(e)
  Sub->>EB: ack(topic,group,id)
  EB->>CS: setCursor(topic,group,lastId=id)
```
^ref-534fe91d-457-0

## 9) Jest harness (tests you can run today)

`shared/js/prom-lib/jest.config.ts`

```ts
import type { Config } from "jest";
const config: Config = {
  testEnvironment: "node",
^ref-534fe91d-457-0
  transform: { "^.+\\.tsx?$": ["ts-jest", { tsconfig: true }] },
  testMatch: ["**/?(*.)+(spec|test).ts"],
  moduleFileExtensions: ["ts","js","json"],
  verbose: true
};
export default config;
^ref-534fe91d-471-0
```
^ref-534fe91d-471-0

`shared/js/prom-lib/event/event.bus.test.ts`

```ts
import { InMemoryEventBus } from "./memory";

test("publish -> subscribe (earliest) delivers and advances cursor", async () => {
  const bus = new InMemoryEventBus();
  const seen: string[] = [];

  await bus.subscribe("t.a", "g1", async (e) => {
    seen.push(e.payload as string);
  }, { from: "earliest" });

  await bus.publish("t.a", "one");
  await bus.publish("t.a", "two");

  await new Promise(r => setTimeout(r, 50));
  expect(seen).toEqual(["one","two"]);

  const cur = await bus.getCursor("t.a", "g1");
  expect(cur?.lastId).toBeTruthy();
});

test("nack leaves cursor; event is retried", async () => {
  const bus = new InMemoryEventBus();
  let attempts = 0;

  await bus.subscribe("t.b", "g1", async (e) => {
    attempts++;
^ref-534fe91d-471-0
    if (attempts === 1) throw new Error("boom");
  }, { from: "earliest" });

  await bus.publish("t.b", "x");
  await new Promise(r => setTimeout(r, 80));
  expect(attempts).toBeGreaterThanOrEqual(2);
^ref-534fe91d-509-0
}); ^ref-534fe91d-520-0
^ref-534fe91d-509-0
```
^ref-534fe91d-509-0
 ^ref-534fe91d-524-0
## 10) Sibilant-flavored DSL sugar (pseudocode)

```lisp
; shared/sibilant/prom/event.sib (pseudo)
(defmacro define-topic (name opts)
  `{:name ~name :opts ~opts})

(defn publish! [bus topic payload & opts]
  (.publish bus topic payload (or opts {})))

(defn subscribe! [bus topic group handler & {:from "earliest" :batchSize 100}]
^ref-534fe91d-509-0
  (.subscribe bus topic group handler {:from from :batchSize batchSize}))

; usage ^ref-534fe91d-530-0
(def TOPIC-HEARTBEAT (define-topic "heartbeat.received" {:retentionDays 3}))
(defn on-heartbeat [e ctx] (do-something e.payload)) ^ref-534fe91d-532-0

^ref-534fe91d-536-0
^ref-534fe91d-534-0 ^ref-534fe91d-538-0
^ref-534fe91d-532-0
^ref-534fe91d-530-0 ^ref-534fe91d-540-0
; (subscribe! bus TOPIC-HEARTBEAT.name "ops" on-heartbeat :from "earliest") ^ref-534fe91d-534-0
^ref-534fe91d-543-0
^ref-534fe91d-540-0 ^ref-534fe91d-545-0
^ref-534fe91d-538-0 ^ref-534fe91d-546-0
^ref-534fe91d-536-0 ^ref-534fe91d-547-0
^ref-534fe91d-534-0 ^ref-534fe91d-548-0
^ref-534fe91d-532-0 ^ref-534fe91d-549-0
^ref-534fe91d-530-0 ^ref-534fe91d-550-0
; (publish!  bus TOPIC-HEARTBEAT.name {:pid 42 :name "stt"}) ^ref-534fe91d-551-0
^ref-534fe91d-552-0 ^ref-534fe91d-553-0
^ref-534fe91d-551-0 ^ref-534fe91d-554-0
^ref-534fe91d-550-0 ^ref-534fe91d-555-0
^ref-534fe91d-549-0 ^ref-534fe91d-556-0
^ref-534fe91d-548-0 ^ref-534fe91d-557-0
^ref-534fe91d-547-0 ^ref-534fe91d-558-0
^ref-534fe91d-546-0
^ref-534fe91d-545-0
^ref-534fe91d-543-0 ^ref-534fe91d-561-0
^ref-534fe91d-540-0 ^ref-534fe91d-562-0
^ref-534fe91d-538-0
^ref-534fe91d-536-0 ^ref-534fe91d-564-0
^ref-534fe91d-534-0 ^ref-534fe91d-565-0
^ref-534fe91d-532-0 ^ref-534fe91d-566-0
^ref-534fe91d-524-0
^ref-534fe91d-530-0
^ref-534fe91d-523-0
``` ^ref-534fe91d-536-0 ^ref-534fe91d-543-0 ^ref-534fe91d-552-0
^ref-534fe91d-527-0
 ^ref-534fe91d-553-0 ^ref-534fe91d-570-0
--- ^ref-534fe91d-538-0 ^ref-534fe91d-545-0 ^ref-534fe91d-554-0 ^ref-534fe91d-571-0
 ^ref-534fe91d-546-0 ^ref-534fe91d-555-0
If you want, next dump I can add: ^ref-534fe91d-540-0 ^ref-534fe91d-547-0 ^ref-534fe91d-556-0 ^ref-534fe91d-573-0
 ^ref-534fe91d-548-0 ^ref-534fe91d-557-0 ^ref-534fe91d-574-0
- **WS gateway** (pub/sub over WebSocket with auth), ^ref-534fe91d-549-0 ^ref-534fe91d-558-0 ^ref-534fe91d-575-0
 ^ref-534fe91d-543-0 ^ref-534fe91d-550-0 ^ref-534fe91d-576-0
- **Backpressure & leases** (ack deadline + redelivery), ^ref-534fe91d-551-0 ^ref-534fe91d-577-0
 ^ref-534fe91d-545-0 ^ref-534fe91d-552-0 ^ref-534fe91d-561-0
- **Compactor** job + snapshot topic, ^ref-534fe91d-546-0 ^ref-534fe91d-553-0 ^ref-534fe91d-562-0
 ^ref-534fe91d-547-0 ^ref-534fe91d-554-0 ^ref-534fe91d-580-0
- **Prometheus metrics** helper, ^ref-534fe91d-548-0 ^ref-534fe91d-555-0 ^ref-534fe91d-564-0 ^ref-534fe91d-581-0
 ^ref-534fe91d-549-0 ^ref-534fe91d-556-0 ^ref-534fe91d-565-0
- **Examples**: `process.state` projector + heartbeat integration. ^ref-534fe91d-550-0 ^ref-534fe91d-557-0 ^ref-534fe91d-566-0 ^ref-534fe91d-583-0
 ^ref-534fe91d-551-0 ^ref-534fe91d-558-0 ^ref-534fe91d-584-0
 ^ref-534fe91d-552-0
Say the word and I’ll shovel Part 2 onto you.
