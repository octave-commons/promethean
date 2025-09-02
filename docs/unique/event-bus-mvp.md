---
uuid: 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
created_at: 2025.08.08.15.08.24.md
filename: Event Bus MVP
description: >-
  A minimal TypeScript implementation of an event bus with in-memory storage,
  event handling, and cursor management for real-time systems.
tags:
  - event
  - bus
  - mvp
  - typescript
  - in-memory
  - cursor
  - delivery
  - ack
related_to_title: []
related_to_uuid: []
references: []
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
^ref-534fe91d-7-0

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
 ^ref-534fe91d-284-0
## 4) Mongo adapter skeleton (`mongo.ts`)

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
} as const; ^ref-534fe91d-381-0
```
 ^ref-534fe91d-383-0
## 6) Outbox pattern (service-local durability)
 ^ref-534fe91d-385-0
Pattern for services that must not lose messages:
 ^ref-534fe91d-387-0
1. **Local outbox** table (Mongo or sqlite) with `{ id, topic, payload, status:'pending|sent|error', last_err? }`.
    
2. Business txn writes to its own DB and appends to outbox in the same txn. ^ref-534fe91d-390-0
    
3. A **drainer** publishes pending rows to EventBus; on success marks `sent`. ^ref-534fe91d-392-0
    

Skeleton:

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
});
^ref-534fe91d-509-0
```
^ref-534fe91d-509-0

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
^ref-534fe91d-530-0
^ref-534fe91d-523-0
``` ^ref-534fe91d-536-0 ^ref-534fe91d-543-0 ^ref-534fe91d-552-0
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
Say the word and I’ll shovel Part 2 onto you.<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [Promethean Event Bus MVP v0.1](promethean-event-bus-mvp-v0-1.md)
- [WebSocket Gateway Implementation](websocket-gateway-implementation.md)
- [Mongo Outbox Implementation](mongo-outbox-implementation.md)
- [schema-evolution-workflow](schema-evolution-workflow.md)
- [prom-lib-rate-limiters-and-replay-api](prom-lib-rate-limiters-and-replay-api.md)
- [Voice Access Layer Design](voice-access-layer-design.md)
- [Stateful Partitions and Rebalancing](stateful-partitions-and-rebalancing.md)
- [State Snapshots API and Transactional Projector](state-snapshots-api-and-transactional-projector.md)
- [Migrate to Provider-Tenant Architecture](migrate-to-provider-tenant-architecture.md)
- [Services](chunks/services.md)
- [i3-bluetooth-setup](i3-bluetooth-setup.md)
- [Local-First Intention→Code Loop with Free Models](local-first-intention-code-loop-with-free-models.md)
- [ecs-offload-workers](ecs-offload-workers.md)
- [Event Bus Projections Architecture](event-bus-projections-architecture.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [Agent Tasks: Persistence Migration to DualStore](agent-tasks-persistence-migration-to-dualstore.md)
- [Fnord Tracer Protocol](fnord-tracer-protocol.md)
- [observability-infrastructure-setup](observability-infrastructure-setup.md)
- [Cross-Language Runtime Polymorphism](cross-language-runtime-polymorphism.md)
- [Prompt_Folder_Bootstrap](prompt-folder-bootstrap.md)
- [ecs-scheduler-and-prefabs](ecs-scheduler-and-prefabs.md)
- [Admin Dashboard for User Management](admin-dashboard-for-user-management.md)
- [aionian-circuit-math](aionian-circuit-math.md)
- [api-gateway-versioning](api-gateway-versioning.md)
- [AI-Centric OS with MCP Layer](ai-centric-os-with-mcp-layer.md)
- [heartbeat-fragment-demo](heartbeat-fragment-demo.md)
- [heartbeat-simulation-snippets](heartbeat-simulation-snippets.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [Debugging Broker Connections and Agent Behavior](debugging-broker-connections-and-agent-behavior.md)
- [Diagrams](chunks/diagrams.md)
- [DSL](chunks/dsl.md)
- [JavaScript](chunks/javascript.md)
- [Tooling](chunks/tooling.md)
- [Board Walk – 2025-08-11](board-walk-2025-08-11.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [layer-1-uptime-diagrams](layer-1-uptime-diagrams.md)
- [Local-Offline-Model-Deployment-Strategy](local-offline-model-deployment-strategy.md)
- [Agent Reflections and Prompt Evolution](agent-reflections-and-prompt-evolution.md)
- [Canonical Org-Babel Matplotlib Animation Template](canonical-org-babel-matplotlib-animation-template.md)
- [2d-sandbox-field](2d-sandbox-field.md)
- [Math Fundamentals](chunks/math-fundamentals.md)
- [compiler-kit-foundations](compiler-kit-foundations.md)
- [field-dynamics-math-blocks](field-dynamics-math-blocks.md)
- [Eidolon Field Abstract Model](eidolon-field-abstract-model.md)
- [field-node-diagram-outline](field-node-diagram-outline.md)
- [Duck's Self-Referential Perceptual Loop](ducks-self-referential-perceptual-loop.md)
- [field-interaction-equations](field-interaction-equations.md)
- [eidolon-node-lifecycle](eidolon-node-lifecycle.md)
- [field-node-diagram-set](field-node-diagram-set.md)
- [archetype-ecs](archetype-ecs.md)
- [Cross-Target Macro System in Sibilant](cross-target-macro-system-in-sibilant.md)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler](ollama-llm-provider-for-pseudo-code-transpiler.md)
- [Simulation Demo](chunks/simulation-demo.md)
- [Window Management](chunks/window-management.md)
- [polymorphic-meta-programming-engine](polymorphic-meta-programming-engine.md)
- [Matplotlib Animation with Async Execution](matplotlib-animation-with-async-execution.md)
- [Per-Domain Policy System for JS Crawler](per-domain-policy-system-for-js-crawler.md)
- [markdown-to-org-transpiler](markdown-to-org-transpiler.md)
- [Exception Layer Analysis](exception-layer-analysis.md)
- [obsidian-ignore-node-modules-regex](obsidian-ignore-node-modules-regex.md)
- [Shared](chunks/shared.md)
- [Model Selection for Lightweight Conversational Tasks](model-selection-for-lightweight-conversational-tasks.md)
- [EidolonField](eidolonfield.md)
- [Factorio AI with External Agents](factorio-ai-with-external-agents.md)
- [AI-First-OS-Model-Context-Protocol](ai-first-os-model-context-protocol.md)
- [balanced-bst](balanced-bst.md)
- [Promethean Agent Config DSL](promethean-agent-config-dsl.md)
- [Obsidian Templating Plugins Integration Guide](obsidian-templating-plugins-integration-guide.md)
- [ParticleSimulationWithCanvasAndFFmpeg](particlesimulationwithcanvasandffmpeg.md)
- [Promethean-native config design](promethean-native-config-design.md)
- [Promethean Web UI Setup](promethean-web-ui-setup.md)
- [Promethean Infrastructure Setup](promethean-infrastructure-setup.md)
- [Board Automation Improvements](board-automation-improvements.md)
- [i3-config-validation-methods](i3-config-validation-methods.md)
- [Duck's Attractor States](ducks-attractor-states.md)
- [Promethean_Eidolon_Synchronicity_Model](promethean-eidolon-synchronicity-model.md)
- [promethean-system-diagrams](promethean-system-diagrams.md)
- [prompt-programming-language-lisp](prompt-programming-language-lisp.md)
- [Creative Moments](creative-moments.md)
- [graph-ds](graph-ds.md)
- [Unique Info Dump Index](unique-info-dump-index.md)
- [field-node-diagram-visualizations](field-node-diagram-visualizations.md)
- [Operations](chunks/operations.md)
- [Chroma-Embedding-Refactor](chroma-embedding-refactor.md)
- [homeostasis-decay-formulas](homeostasis-decay-formulas.md)
- [Local-Only-LLM-Workflow](local-only-llm-workflow.md)
- [Lisp-Compiler-Integration](lisp-compiler-integration.md)
- [Language-Agnostic Mirror System](language-agnostic-mirror-system.md)
- [Shared Package Structure](shared-package-structure.md)
- [zero-copy-snapshots-and-workers](zero-copy-snapshots-and-workers.md)
- [Lispy Macros with syntax-rules](lispy-macros-with-syntax-rules.md)
- [ripple-propagation-demo](ripple-propagation-demo.md)
- [lisp-dsl-for-window-management](lisp-dsl-for-window-management.md)
- [Promethean Workflow Optimization](promethean-workflow-optimization.md)
- [Prometheus Observability Stack](prometheus-observability-stack.md)
- [Protocol_0_The_Contradiction_Engine](protocol-0-the-contradiction-engine.md)
- [Provider-Agnostic Chat Panel Implementation](provider-agnostic-chat-panel-implementation.md)
- [Pure-Node Crawl Stack with Playwright and Crawlee](pure-node-crawl-stack-with-playwright-and-crawlee.md)
- [sibilant-macro-targets](sibilant-macro-targets.md)
- [Pure TypeScript Search Microservice](pure-typescript-search-microservice.md)
- [Sibilant Meta-Prompt DSL](sibilant-meta-prompt-dsl.md)
- [Functional Embedding Pipeline Refactor](functional-embedding-pipeline-refactor.md)
- [RAG UI Panel with Qdrant and PostgREST](rag-ui-panel-with-qdrant-and-postgrest.md)
- [Self-Agency in AI Interaction](self-agency-in-ai-interaction.md)
- [set-assignment-in-lisp-ast](set-assignment-in-lisp-ast.md)
- [shared-package-layout-clarification](shared-package-layout-clarification.md)
- [DuckDuckGoSearchPipeline](duckduckgosearchpipeline.md)
- [System Scheduler with Resource-Aware DAG](system-scheduler-with-resource-aware-dag.md)
- [TypeScript Patch for Tool Calling Support](typescript-patch-for-tool-calling-support.md)
- [universal-intention-code-fabric](universal-intention-code-fabric.md)
- [sibilant-metacompiler-overview](sibilant-metacompiler-overview.md)
- [Performance-Optimized-Polyglot-Bridge](performance-optimized-polyglot-bridge.md)
- [plan-update-confirmation](plan-update-confirmation.md)
- [Smoke Resonance Visualizations](smoke-resonance-visualizations.md)
- [Interop and Source Maps](interop-and-source-maps.md)
- [Promethean Agent DSL TS Scaffold](promethean-agent-dsl-ts-scaffold.md)
- [pm2-orchestration-patterns](pm2-orchestration-patterns.md)
- [Functional Refactor of TypeScript Document Processing](functional-refactor-of-typescript-document-processing.md)
- [Refactor 05-footers.ts](refactor-05-footers-ts.md)
- [typed-struct-compiler](typed-struct-compiler.md)
- [template-based-compilation](template-based-compilation.md)
- [js-to-lisp-reverse-compiler](js-to-lisp-reverse-compiler.md)
- [Promethean Documentation Pipeline Overview](promethean-documentation-pipeline-overview.md)
- [MindfulRobotIntegration](mindfulrobotintegration.md)
- [Promethean-Copilot-Intent-Engine](promethean-copilot-intent-engine.md)
- [Promethean State Format](promethean-state-format.md)
- [Reawakening Duck](reawakening-duck.md)
- [Model Upgrade Calm-Down Guide](model-upgrade-calm-down-guide.md)
## Sources
- [Lisp-Compiler-Integration — L1](lisp-compiler-integration.md#^ref-cfee6d36-1-0) (line 1, col 0, score 0.62)
- [Promethean Event Bus MVP v0.1 — L3](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-3-0) (line 3, col 0, score 0.62)
- [MindfulRobotIntegration — L1](mindfulrobotintegration.md#^ref-5f65dfa5-1-0) (line 1, col 0, score 0.62)
- [sibilant-macro-targets — L1](sibilant-macro-targets.md#^ref-c5c9a5c6-1-0) (line 1, col 0, score 0.61)
- [Migrate to Provider-Tenant Architecture — L82](migrate-to-provider-tenant-architecture.md#^ref-54382370-82-0) (line 82, col 0, score 0.61)
- [archetype-ecs — L3](archetype-ecs.md#^ref-8f4c1e86-3-0) (line 3, col 0, score 0.61)
- [Promethean State Format — L78](promethean-state-format.md#^ref-23df6ddb-78-0) (line 78, col 0, score 0.6)
- [sibilant-macro-targets — L21](sibilant-macro-targets.md#^ref-c5c9a5c6-21-0) (line 21, col 0, score 0.6)
- [Reawakening Duck — L103](reawakening-duck.md#^ref-59b5670f-103-0) (line 103, col 0, score 0.59)
- [schema-evolution-workflow — L478](schema-evolution-workflow.md#^ref-d8059b6a-478-0) (line 478, col 0, score 0.59)
- [prom-lib-rate-limiters-and-replay-api — L1](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-1-0) (line 1, col 0, score 0.65)
- [Model Upgrade Calm-Down Guide — L1](model-upgrade-calm-down-guide.md#^ref-db74343f-1-0) (line 1, col 0, score 0.59)
- [Promethean State Format — L1](promethean-state-format.md#^ref-23df6ddb-1-0) (line 1, col 0, score 0.59)
- [Promethean Event Bus MVP v0.1 — L28](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-28-0) (line 28, col 0, score 0.94)
- [schema-evolution-workflow — L146](schema-evolution-workflow.md#^ref-d8059b6a-146-0) (line 146, col 0, score 0.73)
- [Promethean Event Bus MVP v0.1 — L423](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-423-0) (line 423, col 0, score 0.73)
- [Mongo Outbox Implementation — L11](mongo-outbox-implementation.md#^ref-9c1acd1e-11-0) (line 11, col 0, score 0.87)
- [WebSocket Gateway Implementation — L322](websocket-gateway-implementation.md#^ref-e811123d-322-0) (line 322, col 0, score 0.92)
- [WebSocket Gateway Implementation — L447](websocket-gateway-implementation.md#^ref-e811123d-447-0) (line 447, col 0, score 0.75)
- [WebSocket Gateway Implementation — L56](websocket-gateway-implementation.md#^ref-e811123d-56-0) (line 56, col 0, score 0.64)
- [prom-lib-rate-limiters-and-replay-api — L186](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-186-0) (line 186, col 0, score 0.74)
- [schema-evolution-workflow — L161](schema-evolution-workflow.md#^ref-d8059b6a-161-0) (line 161, col 0, score 0.69)
- [Stateful Partitions and Rebalancing — L166](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-166-0) (line 166, col 0, score 0.68)
- [Stateful Partitions and Rebalancing — L351](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-351-0) (line 351, col 0, score 0.65)
- [universal-intention-code-fabric — L68](universal-intention-code-fabric.md#^ref-c14edce7-68-0) (line 68, col 0, score 0.73)
- [schema-evolution-workflow — L201](schema-evolution-workflow.md#^ref-d8059b6a-201-0) (line 201, col 0, score 0.81)
- [State Snapshots API and Transactional Projector — L179](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-179-0) (line 179, col 0, score 0.79)
- [Mongo Outbox Implementation — L381](mongo-outbox-implementation.md#^ref-9c1acd1e-381-0) (line 381, col 0, score 0.71)
- [Pure TypeScript Search Microservice — L155](pure-typescript-search-microservice.md#^ref-d17d3a96-155-0) (line 155, col 0, score 0.72)
- [Promethean Event Bus MVP v0.1 — L155](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-155-0) (line 155, col 0, score 0.73)
- [Promethean Event Bus MVP v0.1 — L149](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-149-0) (line 149, col 0, score 0.73)
- [Promethean Event Bus MVP v0.1 — L168](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-168-0) (line 168, col 0, score 0.73)
- [Promethean Event Bus MVP v0.1 — L733](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-733-0) (line 733, col 0, score 0.7)
- [Promethean Event Bus MVP v0.1 — L497](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-497-0) (line 497, col 0, score 0.7)
- [TypeScript Patch for Tool Calling Support — L9](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-9-0) (line 9, col 0, score 0.7)
- [Event Bus Projections Architecture — L108](event-bus-projections-architecture.md#^ref-cf6b9b17-108-0) (line 108, col 0, score 0.71)
- [Promethean Event Bus MVP v0.1 — L380](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-380-0) (line 380, col 0, score 0.63)
- [Promethean Event Bus MVP v0.1 — L740](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-740-0) (line 740, col 0, score 0.74)
- [WebSocket Gateway Implementation — L333](websocket-gateway-implementation.md#^ref-e811123d-333-0) (line 333, col 0, score 0.68)
- [State Snapshots API and Transactional Projector — L93](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-93-0) (line 93, col 0, score 0.67)
- [prom-lib-rate-limiters-and-replay-api — L226](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-226-0) (line 226, col 0, score 0.64)
- [Promethean Event Bus MVP v0.1 — L572](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-572-0) (line 572, col 0, score 0.71)
- [Promethean Agent DSL TS Scaffold — L723](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-723-0) (line 723, col 0, score 0.67)
- [Promethean-native config design — L32](promethean-native-config-design.md#^ref-ab748541-32-0) (line 32, col 0, score 0.64)
- [Promethean-native config design — L33](promethean-native-config-design.md#^ref-ab748541-33-0) (line 33, col 0, score 0.64)
- [Promethean-native config design — L35](promethean-native-config-design.md#^ref-ab748541-35-0) (line 35, col 0, score 0.64)
- [template-based-compilation — L35](template-based-compilation.md#^ref-f8877e5e-35-0) (line 35, col 0, score 0.64)
- [Cross-Target Macro System in Sibilant — L62](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-62-0) (line 62, col 0, score 0.64)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L7](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-7-0) (line 7, col 0, score 0.66)
- [Chroma-Embedding-Refactor — L64](chroma-embedding-refactor.md#^ref-8b256935-64-0) (line 64, col 0, score 0.72)
- [Chroma-Embedding-Refactor — L109](chroma-embedding-refactor.md#^ref-8b256935-109-0) (line 109, col 0, score 0.72)
- [Chroma-Embedding-Refactor — L258](chroma-embedding-refactor.md#^ref-8b256935-258-0) (line 258, col 0, score 0.72)
- [Chroma Toolkit Consolidation Plan — L72](chroma-toolkit-consolidation-plan.md#^ref-5020e892-72-0) (line 72, col 0, score 0.72)
- [Stateful Partitions and Rebalancing — L101](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-101-0) (line 101, col 0, score 0.69)
- [WebSocket Gateway Implementation — L473](websocket-gateway-implementation.md#^ref-e811123d-473-0) (line 473, col 0, score 0.68)
- [prom-lib-rate-limiters-and-replay-api — L282](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-282-0) (line 282, col 0, score 0.82)
- [prom-lib-rate-limiters-and-replay-api — L260](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-260-0) (line 260, col 0, score 0.81)
- [prom-lib-rate-limiters-and-replay-api — L106](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-106-0) (line 106, col 0, score 0.69)
- [Stateful Partitions and Rebalancing — L448](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-448-0) (line 448, col 0, score 0.7)
- [State Snapshots API and Transactional Projector — L248](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-248-0) (line 248, col 0, score 0.72)
- [Promethean Event Bus MVP v0.1 — L764](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-764-0) (line 764, col 0, score 0.71)
- [ecs-offload-workers — L169](ecs-offload-workers.md#^ref-6498b9d7-169-0) (line 169, col 0, score 0.7)
- [Promethean Event Bus MVP v0.1 — L474](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-474-0) (line 474, col 0, score 0.69)
- [Mongo Outbox Implementation — L323](mongo-outbox-implementation.md#^ref-9c1acd1e-323-0) (line 323, col 0, score 0.67)
- [WebSocket Gateway Implementation — L560](websocket-gateway-implementation.md#^ref-e811123d-560-0) (line 560, col 0, score 0.73)
- [ecs-scheduler-and-prefabs — L7](ecs-scheduler-and-prefabs.md#^ref-c62a1815-7-0) (line 7, col 0, score 0.66)
- [System Scheduler with Resource-Aware DAG — L5](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-5-0) (line 5, col 0, score 0.66)
- [WebSocket Gateway Implementation — L9](websocket-gateway-implementation.md#^ref-e811123d-9-0) (line 9, col 0, score 0.73)
- [WebSocket Gateway Implementation — L219](websocket-gateway-implementation.md#^ref-e811123d-219-0) (line 219, col 0, score 0.68)
- [Promethean Event Bus MVP v0.1 — L510](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-510-0) (line 510, col 0, score 0.69)
- [Stateful Partitions and Rebalancing — L202](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-202-0) (line 202, col 0, score 0.67)
- [schema-evolution-workflow — L243](schema-evolution-workflow.md#^ref-d8059b6a-243-0) (line 243, col 0, score 0.68)
- [Promethean Event Bus MVP v0.1 — L604](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-604-0) (line 604, col 0, score 0.67)
- [State Snapshots API and Transactional Projector — L9](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-9-0) (line 9, col 0, score 0.65)
- [Promethean Agent DSL TS Scaffold — L389](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-389-0) (line 389, col 0, score 0.66)
- [Language-Agnostic Mirror System — L336](language-agnostic-mirror-system.md#^ref-d2b3628c-336-0) (line 336, col 0, score 0.63)
- [Performance-Optimized-Polyglot-Bridge — L10](performance-optimized-polyglot-bridge.md#^ref-f5579967-10-0) (line 10, col 0, score 0.7)
- [Promethean Event Bus MVP v0.1 — L235](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-235-0) (line 235, col 0, score 0.7)
- [Performance-Optimized-Polyglot-Bridge — L170](performance-optimized-polyglot-bridge.md#^ref-f5579967-170-0) (line 170, col 0, score 0.67)
- [Promethean Event Bus MVP v0.1 — L250](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-250-0) (line 250, col 0, score 0.69)
- [Promethean Event Bus MVP v0.1 — L233](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-233-0) (line 233, col 0, score 0.65)
- [Promethean Event Bus MVP v0.1 — L787](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-787-0) (line 787, col 0, score 0.66)
- [Promethean Event Bus MVP v0.1 — L797](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-797-0) (line 797, col 0, score 0.67)
- [Stateful Partitions and Rebalancing — L267](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-267-0) (line 267, col 0, score 0.74)
- [State Snapshots API and Transactional Projector — L280](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-280-0) (line 280, col 0, score 0.7)
- [Mongo Outbox Implementation — L37](mongo-outbox-implementation.md#^ref-9c1acd1e-37-0) (line 37, col 0, score 0.68)
- [Stateful Partitions and Rebalancing — L417](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-417-0) (line 417, col 0, score 0.73)
- [WebSocket Gateway Implementation — L533](websocket-gateway-implementation.md#^ref-e811123d-533-0) (line 533, col 0, score 0.73)
- [schema-evolution-workflow — L71](schema-evolution-workflow.md#^ref-d8059b6a-71-0) (line 71, col 0, score 0.72)
- [Mongo Outbox Implementation — L74](mongo-outbox-implementation.md#^ref-9c1acd1e-74-0) (line 74, col 0, score 0.8)
- [Mongo Outbox Implementation — L451](mongo-outbox-implementation.md#^ref-9c1acd1e-451-0) (line 451, col 0, score 0.8)
- [schema-evolution-workflow — L393](schema-evolution-workflow.md#^ref-d8059b6a-393-0) (line 393, col 0, score 0.8)
- [prom-lib-rate-limiters-and-replay-api — L194](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-194-0) (line 194, col 0, score 0.68)
- [Promethean Event Bus MVP v0.1 — L747](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-747-0) (line 747, col 0, score 0.7)
- [compiler-kit-foundations — L50](compiler-kit-foundations.md#^ref-01b21543-50-0) (line 50, col 0, score 0.64)
- [compiler-kit-foundations — L359](compiler-kit-foundations.md#^ref-01b21543-359-0) (line 359, col 0, score 0.63)
- [Pure TypeScript Search Microservice — L227](pure-typescript-search-microservice.md#^ref-d17d3a96-227-0) (line 227, col 0, score 0.63)
- [Promethean-native config design — L160](promethean-native-config-design.md#^ref-ab748541-160-0) (line 160, col 0, score 0.63)
- [typed-struct-compiler — L16](typed-struct-compiler.md#^ref-78eeedf7-16-0) (line 16, col 0, score 0.68)
- [schema-evolution-workflow — L29](schema-evolution-workflow.md#^ref-d8059b6a-29-0) (line 29, col 0, score 0.68)
- [Chroma-Embedding-Refactor — L66](chroma-embedding-refactor.md#^ref-8b256935-66-0) (line 66, col 0, score 0.71)
- [WebSocket Gateway Implementation — L616](websocket-gateway-implementation.md#^ref-e811123d-616-0) (line 616, col 0, score 0.74)
- [Chroma Toolkit Consolidation Plan — L139](chroma-toolkit-consolidation-plan.md#^ref-5020e892-139-0) (line 139, col 0, score 0.72)
- [State Snapshots API and Transactional Projector — L218](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-218-0) (line 218, col 0, score 0.7)
- [State Snapshots API and Transactional Projector — L162](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-162-0) (line 162, col 0, score 0.76)
- [WebSocket Gateway Implementation — L318](websocket-gateway-implementation.md#^ref-e811123d-318-0) (line 318, col 0, score 0.68)
- [Stateful Partitions and Rebalancing — L342](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-342-0) (line 342, col 0, score 0.79)
- [State Snapshots API and Transactional Projector — L177](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-177-0) (line 177, col 0, score 0.79)
- [Promethean Event Bus MVP v0.1 — L371](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-371-0) (line 371, col 0, score 0.71)
- [Chroma Toolkit Consolidation Plan — L137](chroma-toolkit-consolidation-plan.md#^ref-5020e892-137-0) (line 137, col 0, score 0.7)
- [WebSocket Gateway Implementation — L617](websocket-gateway-implementation.md#^ref-e811123d-617-0) (line 617, col 0, score 0.65)
- [Chroma Toolkit Consolidation Plan — L66](chroma-toolkit-consolidation-plan.md#^ref-5020e892-66-0) (line 66, col 0, score 0.68)
- [Mongo Outbox Implementation — L321](mongo-outbox-implementation.md#^ref-9c1acd1e-321-0) (line 321, col 0, score 0.62)
- [prom-lib-rate-limiters-and-replay-api — L329](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-329-0) (line 329, col 0, score 0.84)
- [Stateful Partitions and Rebalancing — L513](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-513-0) (line 513, col 0, score 0.66)
- [Chroma Toolkit Consolidation Plan — L107](chroma-toolkit-consolidation-plan.md#^ref-5020e892-107-0) (line 107, col 0, score 0.72)
- [Simulation Demo — L32](chunks/simulation-demo.md#^ref-557309a3-32-0) (line 32, col 0, score 1)
- [Tooling — L26](chunks/tooling.md#^ref-6cb4943e-26-0) (line 26, col 0, score 1)
- [Window Management — L36](chunks/window-management.md#^ref-9e8ae388-36-0) (line 36, col 0, score 1)
- [compiler-kit-foundations — L639](compiler-kit-foundations.md#^ref-01b21543-639-0) (line 639, col 0, score 1)
- [Creative Moments — L10](creative-moments.md#^ref-10d98225-10-0) (line 10, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L258](cross-language-runtime-polymorphism.md#^ref-c34c36a6-258-0) (line 258, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L215](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-215-0) (line 215, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L50](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-50-0) (line 50, col 0, score 1)
- [DuckDuckGoSearchPipeline — L16](duckduckgosearchpipeline.md#^ref-e979c50f-16-0) (line 16, col 0, score 1)
- [Sibilant Meta-Prompt DSL — L131](sibilant-meta-prompt-dsl.md#^ref-af5d2824-131-0) (line 131, col 0, score 0.65)
- [Promethean-native config design — L366](promethean-native-config-design.md#^ref-ab748541-366-0) (line 366, col 0, score 0.64)
- [Dynamic Context Model for Web Components — L332](dynamic-context-model-for-web-components.md#^ref-f7702bf8-332-0) (line 332, col 0, score 0.61)
- [Cross-Language Runtime Polymorphism — L157](cross-language-runtime-polymorphism.md#^ref-c34c36a6-157-0) (line 157, col 0, score 0.6)
- [prom-lib-rate-limiters-and-replay-api — L358](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-358-0) (line 358, col 0, score 0.59)
- [polymorphic-meta-programming-engine — L144](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-144-0) (line 144, col 0, score 0.59)
- [Matplotlib Animation with Async Execution — L63](matplotlib-animation-with-async-execution.md#^ref-687439f9-63-0) (line 63, col 0, score 0.57)
- [prom-lib-rate-limiters-and-replay-api — L340](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-340-0) (line 340, col 0, score 0.57)
- [js-to-lisp-reverse-compiler — L370](js-to-lisp-reverse-compiler.md#^ref-58191024-370-0) (line 370, col 0, score 0.57)
- [prom-lib-rate-limiters-and-replay-api — L343](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-343-0) (line 343, col 0, score 0.55)
- [prom-lib-rate-limiters-and-replay-api — L326](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-326-0) (line 326, col 0, score 0.62)
- [prom-lib-rate-limiters-and-replay-api — L335](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-335-0) (line 335, col 0, score 0.69)
- [Promethean Event Bus MVP v0.1 — L119](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-119-0) (line 119, col 0, score 0.68)
- [State Snapshots API and Transactional Projector — L3](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-3-0) (line 3, col 0, score 0.6)
- [prom-lib-rate-limiters-and-replay-api — L337](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-337-0) (line 337, col 0, score 0.65)
- [WebSocket Gateway Implementation — L1](websocket-gateway-implementation.md#^ref-e811123d-1-0) (line 1, col 0, score 0.71)
- [AI-Centric OS with MCP Layer — L23](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-23-0) (line 23, col 0, score 0.64)
- [Migrate to Provider-Tenant Architecture — L59](migrate-to-provider-tenant-architecture.md#^ref-54382370-59-0) (line 59, col 0, score 0.7)
- [Promethean Event Bus MVP v0.1 — L114](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-114-0) (line 114, col 0, score 0.68)
- [Dynamic Context Model for Web Components — L378](dynamic-context-model-for-web-components.md#^ref-f7702bf8-378-0) (line 378, col 0, score 0.64)
- [Agent Tasks: Persistence Migration to DualStore — L128](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-128-0) (line 128, col 0, score 0.62)
- [aionian-circuit-math — L157](aionian-circuit-math.md#^ref-f2d83a77-157-0) (line 157, col 0, score 0.62)
- [api-gateway-versioning — L299](api-gateway-versioning.md#^ref-0580dcd3-299-0) (line 299, col 0, score 0.62)
- [Board Walk – 2025-08-11 — L132](board-walk-2025-08-11.md#^ref-7aa1eb92-132-0) (line 132, col 0, score 0.62)
- [Chroma Toolkit Consolidation Plan — L166](chroma-toolkit-consolidation-plan.md#^ref-5020e892-166-0) (line 166, col 0, score 0.62)
- [Cross-Language Runtime Polymorphism — L207](cross-language-runtime-polymorphism.md#^ref-c34c36a6-207-0) (line 207, col 0, score 0.62)
- [Cross-Target Macro System in Sibilant — L193](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-193-0) (line 193, col 0, score 0.62)
- [Shared Package Structure — L117](shared-package-structure.md#^ref-66a72fc3-117-0) (line 117, col 0, score 0.75)
- [schema-evolution-workflow — L9](schema-evolution-workflow.md#^ref-d8059b6a-9-0) (line 9, col 0, score 0.74)
- [sibilant-metacompiler-overview — L51](sibilant-metacompiler-overview.md#^ref-61d4086b-51-0) (line 51, col 0, score 0.7)
- [Stateful Partitions and Rebalancing — L290](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-290-0) (line 290, col 0, score 0.7)
- [ecs-offload-workers — L15](ecs-offload-workers.md#^ref-6498b9d7-15-0) (line 15, col 0, score 0.7)
- [pm2-orchestration-patterns — L117](pm2-orchestration-patterns.md#^ref-51932e7b-117-0) (line 117, col 0, score 0.69)
- [Promethean Event Bus MVP v0.1 — L182](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-182-0) (line 182, col 0, score 0.67)
- [Agent Tasks: Persistence Migration to DualStore — L95](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-95-0) (line 95, col 0, score 0.65)
- [pm2-orchestration-patterns — L115](pm2-orchestration-patterns.md#^ref-51932e7b-115-0) (line 115, col 0, score 0.63)
- [Sibilant Meta-Prompt DSL — L157](sibilant-meta-prompt-dsl.md#^ref-af5d2824-157-0) (line 157, col 0, score 0.63)
- [Promethean Event Bus MVP v0.1 — L393](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-393-0) (line 393, col 0, score 0.62)
- [Promethean Event Bus MVP v0.1 — L188](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-188-0) (line 188, col 0, score 0.62)
- [Promethean-Copilot-Intent-Engine — L44](promethean-copilot-intent-engine.md#^ref-ae24a280-44-0) (line 44, col 0, score 0.62)
- [Promethean Event Bus MVP v0.1 — L186](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-186-0) (line 186, col 0, score 0.61)
- [Agent Tasks: Persistence Migration to DualStore — L26](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-26-0) (line 26, col 0, score 0.61)
- [prom-lib-rate-limiters-and-replay-api — L88](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-88-0) (line 88, col 0, score 0.61)
- [Agent Tasks: Persistence Migration to DualStore — L152](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-152-0) (line 152, col 0, score 1)
- [api-gateway-versioning — L294](api-gateway-versioning.md#^ref-0580dcd3-294-0) (line 294, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L191](chroma-toolkit-consolidation-plan.md#^ref-5020e892-191-0) (line 191, col 0, score 1)
- [Services — L11](chunks/services.md#^ref-75ea4a6a-11-0) (line 11, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L228](cross-language-runtime-polymorphism.md#^ref-c34c36a6-228-0) (line 228, col 0, score 1)
- [ecs-offload-workers — L465](ecs-offload-workers.md#^ref-6498b9d7-465-0) (line 465, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L312](migrate-to-provider-tenant-architecture.md#^ref-54382370-312-0) (line 312, col 0, score 1)
- [observability-infrastructure-setup — L362](observability-infrastructure-setup.md#^ref-b4e64f8c-362-0) (line 362, col 0, score 1)
- [Mongo Outbox Implementation — L533](mongo-outbox-implementation.md#^ref-9c1acd1e-533-0) (line 533, col 0, score 0.74)
- [Mongo Outbox Implementation — L142](mongo-outbox-implementation.md#^ref-9c1acd1e-142-0) (line 142, col 0, score 0.72)
- [prom-lib-rate-limiters-and-replay-api — L348](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-348-0) (line 348, col 0, score 0.64)
- [Mongo Outbox Implementation — L1](mongo-outbox-implementation.md#^ref-9c1acd1e-1-0) (line 1, col 0, score 0.61)
- [WebSocket Gateway Implementation — L625](websocket-gateway-implementation.md#^ref-e811123d-625-0) (line 625, col 0, score 0.61)
- [Promethean Event Bus MVP v0.1 — L369](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-369-0) (line 369, col 0, score 0.59)
- [Agent Tasks: Persistence Migration to DualStore — L72](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-72-0) (line 72, col 0, score 0.59)
- [universal-intention-code-fabric — L27](universal-intention-code-fabric.md#^ref-c14edce7-27-0) (line 27, col 0, score 0.64)
- [schema-evolution-workflow — L224](schema-evolution-workflow.md#^ref-d8059b6a-224-0) (line 224, col 0, score 0.75)
- [Stateful Partitions and Rebalancing — L328](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-328-0) (line 328, col 0, score 0.78)
- [Promethean Event Bus MVP v0.1 — L141](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-141-0) (line 141, col 0, score 0.62)
- [Promethean Event Bus MVP v0.1 — L197](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-197-0) (line 197, col 0, score 0.77)
- [WebSocket Gateway Implementation — L614](websocket-gateway-implementation.md#^ref-e811123d-614-0) (line 614, col 0, score 0.61)
- [prom-lib-rate-limiters-and-replay-api — L63](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-63-0) (line 63, col 0, score 0.61)
- [Promethean Documentation Pipeline Overview — L148](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-148-0) (line 148, col 0, score 0.61)
- [Voice Access Layer Design — L300](voice-access-layer-design.md#^ref-543ed9b3-300-0) (line 300, col 0, score 0.84)
- [Promethean Event Bus MVP v0.1 — L855](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-855-0) (line 855, col 0, score 0.79)
- [Chroma Toolkit Consolidation Plan — L88](chroma-toolkit-consolidation-plan.md#^ref-5020e892-88-0) (line 88, col 0, score 0.72)
- [Chroma Toolkit Consolidation Plan — L148](chroma-toolkit-consolidation-plan.md#^ref-5020e892-148-0) (line 148, col 0, score 0.72)
- [Dynamic Context Model for Web Components — L331](dynamic-context-model-for-web-components.md#^ref-f7702bf8-331-0) (line 331, col 0, score 0.7)
- [Promethean-native config design — L31](promethean-native-config-design.md#^ref-ab748541-31-0) (line 31, col 0, score 0.7)
- [Chroma Toolkit Consolidation Plan — L162](chroma-toolkit-consolidation-plan.md#^ref-5020e892-162-0) (line 162, col 0, score 0.7)
- [Promethean Web UI Setup — L351](promethean-web-ui-setup.md#^ref-bc5172ca-351-0) (line 351, col 0, score 0.7)
- [Promethean Infrastructure Setup — L415](promethean-infrastructure-setup.md#^ref-6deed6ac-415-0) (line 415, col 0, score 0.7)
- [WebSocket Gateway Implementation — L296](websocket-gateway-implementation.md#^ref-e811123d-296-0) (line 296, col 0, score 0.75)
- [Fnord Tracer Protocol — L214](fnord-tracer-protocol.md#^ref-fc21f824-214-0) (line 214, col 0, score 0.7)
- [layer-1-uptime-diagrams — L122](layer-1-uptime-diagrams.md#^ref-4127189a-122-0) (line 122, col 0, score 0.67)
- [Event Bus Projections Architecture — L5](event-bus-projections-architecture.md#^ref-cf6b9b17-5-0) (line 5, col 0, score 0.67)
- [Promethean Event Bus MVP v0.1 — L832](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-832-0) (line 832, col 0, score 0.65)
- [prom-lib-rate-limiters-and-replay-api — L71](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-71-0) (line 71, col 0, score 0.64)
- [Mongo Outbox Implementation — L148](mongo-outbox-implementation.md#^ref-9c1acd1e-148-0) (line 148, col 0, score 0.63)
- [Promethean Documentation Pipeline Overview — L154](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-154-0) (line 154, col 0, score 0.63)
- [Promethean Web UI Setup — L317](promethean-web-ui-setup.md#^ref-bc5172ca-317-0) (line 317, col 0, score 0.74)
- [Per-Domain Policy System for JS Crawler — L141](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-141-0) (line 141, col 0, score 0.71)
- [Promethean-native config design — L103](promethean-native-config-design.md#^ref-ab748541-103-0) (line 103, col 0, score 0.7)
- [plan-update-confirmation — L650](plan-update-confirmation.md#^ref-b22d79c6-650-0) (line 650, col 0, score 0.7)
- [plan-update-confirmation — L662](plan-update-confirmation.md#^ref-b22d79c6-662-0) (line 662, col 0, score 0.7)
- [plan-update-confirmation — L674](plan-update-confirmation.md#^ref-b22d79c6-674-0) (line 674, col 0, score 0.7)
- [Interop and Source Maps — L85](interop-and-source-maps.md#^ref-cdfac40c-85-0) (line 85, col 0, score 0.69)
- [Promethean Agent DSL TS Scaffold — L97](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-97-0) (line 97, col 0, score 0.69)
- [Chroma-Embedding-Refactor — L111](chroma-embedding-refactor.md#^ref-8b256935-111-0) (line 111, col 0, score 0.69)
- [zero-copy-snapshots-and-workers — L202](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-202-0) (line 202, col 0, score 0.68)
- [Promethean Infrastructure Setup — L439](promethean-infrastructure-setup.md#^ref-6deed6ac-439-0) (line 439, col 0, score 0.68)
- [Lispy Macros with syntax-rules — L301](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-301-0) (line 301, col 0, score 0.68)
- [Functional Refactor of TypeScript Document Processing — L5](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-5-0) (line 5, col 0, score 0.68)
- [Refactor 05-footers.ts — L9](refactor-05-footers-ts.md#^ref-80d4d883-9-0) (line 9, col 0, score 0.68)
- [universal-intention-code-fabric — L277](universal-intention-code-fabric.md#^ref-c14edce7-277-0) (line 277, col 0, score 0.68)
- [compiler-kit-foundations — L31](compiler-kit-foundations.md#^ref-01b21543-31-0) (line 31, col 0, score 0.68)
- [schema-evolution-workflow — L450](schema-evolution-workflow.md#^ref-d8059b6a-450-0) (line 450, col 0, score 0.87)
- [Stateful Partitions and Rebalancing — L499](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-499-0) (line 499, col 0, score 0.8)
- [State Snapshots API and Transactional Projector — L303](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-303-0) (line 303, col 0, score 0.79)
- [Mongo Outbox Implementation — L516](mongo-outbox-implementation.md#^ref-9c1acd1e-516-0) (line 516, col 0, score 0.78)
- [WebSocket Gateway Implementation — L595](websocket-gateway-implementation.md#^ref-e811123d-595-0) (line 595, col 0, score 0.77)
- [Promethean Event Bus MVP v0.1 — L809](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-809-0) (line 809, col 0, score 0.73)
- [ecs-scheduler-and-prefabs — L368](ecs-scheduler-and-prefabs.md#^ref-c62a1815-368-0) (line 368, col 0, score 0.73)
- [System Scheduler with Resource-Aware DAG — L366](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-366-0) (line 366, col 0, score 0.73)
- [archetype-ecs — L441](archetype-ecs.md#^ref-8f4c1e86-441-0) (line 441, col 0, score 0.71)
- [graph-ds — L343](graph-ds.md#^ref-6620e2f2-343-0) (line 343, col 0, score 0.68)
- [Promethean Infrastructure Setup — L558](promethean-infrastructure-setup.md#^ref-6deed6ac-558-0) (line 558, col 0, score 0.74)
- [ecs-offload-workers — L446](ecs-offload-workers.md#^ref-6498b9d7-446-0) (line 446, col 0, score 0.74)
- [ecs-scheduler-and-prefabs — L379](ecs-scheduler-and-prefabs.md#^ref-c62a1815-379-0) (line 379, col 0, score 0.74)
- [markdown-to-org-transpiler — L289](markdown-to-org-transpiler.md#^ref-ab54cdd8-289-0) (line 289, col 0, score 0.74)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L153](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-153-0) (line 153, col 0, score 0.74)
- [System Scheduler with Resource-Aware DAG — L377](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-377-0) (line 377, col 0, score 0.74)
- [Mongo Outbox Implementation — L542](mongo-outbox-implementation.md#^ref-9c1acd1e-542-0) (line 542, col 0, score 0.71)
- [homeostasis-decay-formulas — L134](homeostasis-decay-formulas.md#^ref-37b5d236-134-0) (line 134, col 0, score 0.71)
- [Smoke Resonance Visualizations — L74](smoke-resonance-visualizations.md#^ref-ac9d3ac5-74-0) (line 74, col 0, score 0.63)
- [field-dynamics-math-blocks — L123](field-dynamics-math-blocks.md#^ref-7cfc230d-123-0) (line 123, col 0, score 0.61)
- [2d-sandbox-field — L180](2d-sandbox-field.md#^ref-c710dc93-180-0) (line 180, col 0, score 0.68)
- [Eidolon Field Abstract Model — L176](eidolon-field-abstract-model.md#^ref-5e8b2388-176-0) (line 176, col 0, score 0.68)
- [Exception Layer Analysis — L134](exception-layer-analysis.md#^ref-21d5cc09-134-0) (line 134, col 0, score 0.68)
- [field-dynamics-math-blocks — L117](field-dynamics-math-blocks.md#^ref-7cfc230d-117-0) (line 117, col 0, score 0.67)
- [field-node-diagram-outline — L82](field-node-diagram-outline.md#^ref-1f32c94a-82-0) (line 82, col 0, score 0.67)
- [layer-1-uptime-diagrams — L140](layer-1-uptime-diagrams.md#^ref-4127189a-140-0) (line 140, col 0, score 0.67)
- [Services — L23](chunks/services.md#^ref-75ea4a6a-23-0) (line 23, col 0, score 0.76)
- [ecs-offload-workers — L463](ecs-offload-workers.md#^ref-6498b9d7-463-0) (line 463, col 0, score 0.76)
- [WebSocket Gateway Implementation — L613](websocket-gateway-implementation.md#^ref-e811123d-613-0) (line 613, col 0, score 0.71)
- [Mongo Outbox Implementation — L535](mongo-outbox-implementation.md#^ref-9c1acd1e-535-0) (line 535, col 0, score 0.69)
- [ecs-offload-workers — L434](ecs-offload-workers.md#^ref-6498b9d7-434-0) (line 434, col 0, score 0.68)
- [Voice Access Layer Design — L160](voice-access-layer-design.md#^ref-543ed9b3-160-0) (line 160, col 0, score 0.67)
- [Migrate to Provider-Tenant Architecture — L138](migrate-to-provider-tenant-architecture.md#^ref-54382370-138-0) (line 138, col 0, score 0.66)
- [Mongo Outbox Implementation — L284](mongo-outbox-implementation.md#^ref-9c1acd1e-284-0) (line 284, col 0, score 0.65)
- [prom-lib-rate-limiters-and-replay-api — L364](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-364-0) (line 364, col 0, score 0.65)
- [prom-lib-rate-limiters-and-replay-api — L83](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-83-0) (line 83, col 0, score 0.64)
- [Mongo Outbox Implementation — L544](mongo-outbox-implementation.md#^ref-9c1acd1e-544-0) (line 544, col 0, score 0.63)
- [Promethean Event Bus MVP v0.1 — L15](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-15-0) (line 15, col 0, score 0.63)
- [Promethean Event Bus MVP v0.1 — L350](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-350-0) (line 350, col 0, score 0.63)
- [Promethean Event Bus MVP v0.1 — L333](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-333-0) (line 333, col 0, score 0.62)
- [Voice Access Layer Design — L202](voice-access-layer-design.md#^ref-543ed9b3-202-0) (line 202, col 0, score 0.62)
- [WebSocket Gateway Implementation — L50](websocket-gateway-implementation.md#^ref-e811123d-50-0) (line 50, col 0, score 0.61)
- [Migrate to Provider-Tenant Architecture — L223](migrate-to-provider-tenant-architecture.md#^ref-54382370-223-0) (line 223, col 0, score 0.61)
- [schema-evolution-workflow — L25](schema-evolution-workflow.md#^ref-d8059b6a-25-0) (line 25, col 0, score 0.67)
- [zero-copy-snapshots-and-workers — L1](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-1-0) (line 1, col 0, score 0.62)
- [State Snapshots API and Transactional Projector — L242](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-242-0) (line 242, col 0, score 0.6)
- [AI-Centric OS with MCP Layer — L401](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-401-0) (line 401, col 0, score 0.69)
- [api-gateway-versioning — L296](api-gateway-versioning.md#^ref-0580dcd3-296-0) (line 296, col 0, score 0.69)
- [i3-bluetooth-setup — L110](i3-bluetooth-setup.md#^ref-5e408692-110-0) (line 110, col 0, score 0.69)
- [Local-Offline-Model-Deployment-Strategy — L291](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-291-0) (line 291, col 0, score 0.69)
- [Migrate to Provider-Tenant Architecture — L279](migrate-to-provider-tenant-architecture.md#^ref-54382370-279-0) (line 279, col 0, score 0.69)
- [Mongo Outbox Implementation — L574](mongo-outbox-implementation.md#^ref-9c1acd1e-574-0) (line 574, col 0, score 0.69)
- [observability-infrastructure-setup — L359](observability-infrastructure-setup.md#^ref-b4e64f8c-359-0) (line 359, col 0, score 0.69)
- [Per-Domain Policy System for JS Crawler — L477](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-477-0) (line 477, col 0, score 0.69)
- [Promethean Event Bus MVP v0.1 — L356](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-356-0) (line 356, col 0, score 0.7)
- [Services — L29](chunks/services.md#^ref-75ea4a6a-29-0) (line 29, col 0, score 0.69)
- [Simulation Demo — L8](chunks/simulation-demo.md#^ref-557309a3-8-0) (line 8, col 0, score 0.69)
- [Cross-Language Runtime Polymorphism — L233](cross-language-runtime-polymorphism.md#^ref-c34c36a6-233-0) (line 233, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L57](ducks-self-referential-perceptual-loop.md#^ref-71726f04-57-0) (line 57, col 0, score 1)
- [Dynamic Context Model for Web Components — L430](dynamic-context-model-for-web-components.md#^ref-f7702bf8-430-0) (line 430, col 0, score 1)
- [ecs-scheduler-and-prefabs — L429](ecs-scheduler-and-prefabs.md#^ref-c62a1815-429-0) (line 429, col 0, score 1)
- [Eidolon Field Abstract Model — L198](eidolon-field-abstract-model.md#^ref-5e8b2388-198-0) (line 198, col 0, score 1)
- [field-interaction-equations — L174](field-interaction-equations.md#^ref-b09141b7-174-0) (line 174, col 0, score 1)
- [field-node-diagram-outline — L114](field-node-diagram-outline.md#^ref-1f32c94a-114-0) (line 114, col 0, score 1)
- [WebSocket Gateway Implementation — L623](websocket-gateway-implementation.md#^ref-e811123d-623-0) (line 623, col 0, score 0.72)
- [Interop and Source Maps — L5](interop-and-source-maps.md#^ref-cdfac40c-5-0) (line 5, col 0, score 0.68)
- [layer-1-uptime-diagrams — L146](layer-1-uptime-diagrams.md#^ref-4127189a-146-0) (line 146, col 0, score 0.66)
- [universal-intention-code-fabric — L424](universal-intention-code-fabric.md#^ref-c14edce7-424-0) (line 424, col 0, score 0.66)
- [Lispy Macros with syntax-rules — L395](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-395-0) (line 395, col 0, score 0.64)
- [prom-lib-rate-limiters-and-replay-api — L373](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-373-0) (line 373, col 0, score 0.63)
- [js-to-lisp-reverse-compiler — L386](js-to-lisp-reverse-compiler.md#^ref-58191024-386-0) (line 386, col 0, score 0.63)
- [Prompt_Folder_Bootstrap — L82](prompt-folder-bootstrap.md#^ref-bd4f0976-82-0) (line 82, col 0, score 0.62)
- [State Snapshots API and Transactional Projector — L325](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-325-0) (line 325, col 0, score 0.62)
- [aionian-circuit-math — L141](aionian-circuit-math.md#^ref-f2d83a77-141-0) (line 141, col 0, score 0.62)
- [Local-Only-LLM-Workflow — L163](local-only-llm-workflow.md#^ref-9a8ab57e-163-0) (line 163, col 0, score 0.59)
- [Agent Tasks: Persistence Migration to DualStore — L135](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-135-0) (line 135, col 0, score 1)
- [ecs-offload-workers — L481](ecs-offload-workers.md#^ref-6498b9d7-481-0) (line 481, col 0, score 1)
- [ecs-scheduler-and-prefabs — L418](ecs-scheduler-and-prefabs.md#^ref-c62a1815-418-0) (line 418, col 0, score 1)
- [eidolon-node-lifecycle — L49](eidolon-node-lifecycle.md#^ref-938eca9c-49-0) (line 49, col 0, score 1)
- [Event Bus Projections Architecture — L148](event-bus-projections-architecture.md#^ref-cf6b9b17-148-0) (line 148, col 0, score 1)
- [Fnord Tracer Protocol — L242](fnord-tracer-protocol.md#^ref-fc21f824-242-0) (line 242, col 0, score 1)
- [i3-bluetooth-setup — L104](i3-bluetooth-setup.md#^ref-5e408692-104-0) (line 104, col 0, score 1)
- [layer-1-uptime-diagrams — L173](layer-1-uptime-diagrams.md#^ref-4127189a-173-0) (line 173, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L147](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-147-0) (line 147, col 0, score 1)
- [Matplotlib Animation with Async Execution — L78](matplotlib-animation-with-async-execution.md#^ref-687439f9-78-0) (line 78, col 0, score 1)
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
- [Services — L10](chunks/services.md#^ref-75ea4a6a-10-0) (line 10, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L209](cross-language-runtime-polymorphism.md#^ref-c34c36a6-209-0) (line 209, col 0, score 1)
- [ecs-offload-workers — L486](ecs-offload-workers.md#^ref-6498b9d7-486-0) (line 486, col 0, score 1)
- [Mongo Outbox Implementation — L552](mongo-outbox-implementation.md#^ref-9c1acd1e-552-0) (line 552, col 0, score 1)
- [prom-lib-rate-limiters-and-replay-api — L382](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-382-0) (line 382, col 0, score 1)
- [Promethean Event Bus MVP v0.1 — L913](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-913-0) (line 913, col 0, score 1)
- [State Snapshots API and Transactional Projector — L333](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-333-0) (line 333, col 0, score 1)
- [Stateful Partitions and Rebalancing — L527](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-527-0) (line 527, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L134](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-134-0) (line 134, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L164](chroma-toolkit-consolidation-plan.md#^ref-5020e892-164-0) (line 164, col 0, score 1)
- [Services — L18](chunks/services.md#^ref-75ea4a6a-18-0) (line 18, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L230](cross-language-runtime-polymorphism.md#^ref-c34c36a6-230-0) (line 230, col 0, score 1)
- [ecs-offload-workers — L483](ecs-offload-workers.md#^ref-6498b9d7-483-0) (line 483, col 0, score 1)
- [eidolon-field-math-foundations — L148](eidolon-field-math-foundations.md#^ref-008f2ac0-148-0) (line 148, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L282](migrate-to-provider-tenant-architecture.md#^ref-54382370-282-0) (line 282, col 0, score 1)
- [Mongo Outbox Implementation — L553](mongo-outbox-implementation.md#^ref-9c1acd1e-553-0) (line 553, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L158](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-158-0) (line 158, col 0, score 1)
- [Chroma-Embedding-Refactor — L329](chroma-embedding-refactor.md#^ref-8b256935-329-0) (line 329, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L196](chroma-toolkit-consolidation-plan.md#^ref-5020e892-196-0) (line 196, col 0, score 1)
- [Dynamic Context Model for Web Components — L414](dynamic-context-model-for-web-components.md#^ref-f7702bf8-414-0) (line 414, col 0, score 1)
- [i3-bluetooth-setup — L102](i3-bluetooth-setup.md#^ref-5e408692-102-0) (line 102, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L142](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-142-0) (line 142, col 0, score 1)
- [Local-Only-LLM-Workflow — L195](local-only-llm-workflow.md#^ref-9a8ab57e-195-0) (line 195, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L271](migrate-to-provider-tenant-architecture.md#^ref-54382370-271-0) (line 271, col 0, score 1)
- [Services — L12](chunks/services.md#^ref-75ea4a6a-12-0) (line 12, col 0, score 1)
- [Mongo Outbox Implementation — L557](mongo-outbox-implementation.md#^ref-9c1acd1e-557-0) (line 557, col 0, score 1)
- [prom-lib-rate-limiters-and-replay-api — L386](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-386-0) (line 386, col 0, score 1)
- [Promethean Event Bus MVP v0.1 — L890](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-890-0) (line 890, col 0, score 1)
- [Promethean-native config design — L389](promethean-native-config-design.md#^ref-ab748541-389-0) (line 389, col 0, score 1)
- [schema-evolution-workflow — L482](schema-evolution-workflow.md#^ref-d8059b6a-482-0) (line 482, col 0, score 1)
- [State Snapshots API and Transactional Projector — L338](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-338-0) (line 338, col 0, score 1)
- [Unique Info Dump Index — L92](unique-info-dump-index.md#^ref-30ec3ba6-92-0) (line 92, col 0, score 1)
- [Services — L9](chunks/services.md#^ref-75ea4a6a-9-0) (line 9, col 0, score 1)
- [ecs-scheduler-and-prefabs — L420](ecs-scheduler-and-prefabs.md#^ref-c62a1815-420-0) (line 420, col 0, score 1)
- [heartbeat-fragment-demo — L123](heartbeat-fragment-demo.md#^ref-dd00677a-123-0) (line 123, col 0, score 1)
- [heartbeat-simulation-snippets — L115](heartbeat-simulation-snippets.md#^ref-23e221e9-115-0) (line 115, col 0, score 1)
- [Mongo Outbox Implementation — L551](mongo-outbox-implementation.md#^ref-9c1acd1e-551-0) (line 551, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L60](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-60-0) (line 60, col 0, score 1)
- [prom-lib-rate-limiters-and-replay-api — L380](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-380-0) (line 380, col 0, score 1)
- [Promethean Event Bus MVP v0.1 — L889](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-889-0) (line 889, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L129](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-129-0) (line 129, col 0, score 1)
- [api-gateway-versioning — L315](api-gateway-versioning.md#^ref-0580dcd3-315-0) (line 315, col 0, score 1)
- [Chroma-Embedding-Refactor — L331](chroma-embedding-refactor.md#^ref-8b256935-331-0) (line 331, col 0, score 1)
- [Diagrams — L25](chunks/diagrams.md#^ref-45cd25b5-25-0) (line 25, col 0, score 1)
- [Tooling — L24](chunks/tooling.md#^ref-6cb4943e-24-0) (line 24, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L214](cross-language-runtime-polymorphism.md#^ref-c34c36a6-214-0) (line 214, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L173](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-173-0) (line 173, col 0, score 1)
- [Dynamic Context Model for Web Components — L390](dynamic-context-model-for-web-components.md#^ref-f7702bf8-390-0) (line 390, col 0, score 1)
- [eidolon-field-math-foundations — L147](eidolon-field-math-foundations.md#^ref-008f2ac0-147-0) (line 147, col 0, score 1)
- [field-interaction-equations — L159](field-interaction-equations.md#^ref-b09141b7-159-0) (line 159, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L315](functional-embedding-pipeline-refactor.md#^ref-a4a25141-315-0) (line 315, col 0, score 1)
- [i3-bluetooth-setup — L105](i3-bluetooth-setup.md#^ref-5e408692-105-0) (line 105, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L146](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-146-0) (line 146, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L172](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-172-0) (line 172, col 0, score 1)
- [AI-Centric OS with MCP Layer — L424](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-424-0) (line 424, col 0, score 1)
- [aionian-circuit-math — L183](aionian-circuit-math.md#^ref-f2d83a77-183-0) (line 183, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L211](chroma-toolkit-consolidation-plan.md#^ref-5020e892-211-0) (line 211, col 0, score 1)
- [Diagrams — L23](chunks/diagrams.md#^ref-45cd25b5-23-0) (line 23, col 0, score 1)
- [DSL — L27](chunks/dsl.md#^ref-e87bc036-27-0) (line 27, col 0, score 1)
- [Shared — L28](chunks/shared.md#^ref-623a55f7-28-0) (line 28, col 0, score 1)
- [Tooling — L14](chunks/tooling.md#^ref-6cb4943e-14-0) (line 14, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L231](cross-language-runtime-polymorphism.md#^ref-c34c36a6-231-0) (line 231, col 0, score 1)
- [Dynamic Context Model for Web Components — L420](dynamic-context-model-for-web-components.md#^ref-f7702bf8-420-0) (line 420, col 0, score 1)
- [ecs-offload-workers — L487](ecs-offload-workers.md#^ref-6498b9d7-487-0) (line 487, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L181](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-181-0) (line 181, col 0, score 1)
- [AI-Centric OS with MCP Layer — L429](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-429-0) (line 429, col 0, score 1)
- [api-gateway-versioning — L317](api-gateway-versioning.md#^ref-0580dcd3-317-0) (line 317, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L186](chroma-toolkit-consolidation-plan.md#^ref-5020e892-186-0) (line 186, col 0, score 1)
- [Dynamic Context Model for Web Components — L433](dynamic-context-model-for-web-components.md#^ref-f7702bf8-433-0) (line 433, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L150](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-150-0) (line 150, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L298](migrate-to-provider-tenant-architecture.md#^ref-54382370-298-0) (line 298, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L132](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-132-0) (line 132, col 0, score 1)
- [Mongo Outbox Implementation — L584](mongo-outbox-implementation.md#^ref-9c1acd1e-584-0) (line 584, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L214](chroma-toolkit-consolidation-plan.md#^ref-5020e892-214-0) (line 214, col 0, score 1)
- [Tooling — L18](chunks/tooling.md#^ref-6cb4943e-18-0) (line 18, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L226](cross-language-runtime-polymorphism.md#^ref-c34c36a6-226-0) (line 226, col 0, score 1)
- [ecs-offload-workers — L473](ecs-offload-workers.md#^ref-6498b9d7-473-0) (line 473, col 0, score 1)
- [ecs-scheduler-and-prefabs — L399](ecs-scheduler-and-prefabs.md#^ref-c62a1815-399-0) (line 399, col 0, score 1)
- [eidolon-field-math-foundations — L146](eidolon-field-math-foundations.md#^ref-008f2ac0-146-0) (line 146, col 0, score 1)
- [i3-bluetooth-setup — L106](i3-bluetooth-setup.md#^ref-5e408692-106-0) (line 106, col 0, score 1)
- [i3-config-validation-methods — L62](i3-config-validation-methods.md#^ref-d28090ac-62-0) (line 62, col 0, score 1)
- [Math Fundamentals — L20](chunks/math-fundamentals.md#^ref-c6e87433-20-0) (line 20, col 0, score 1)
- [Services — L20](chunks/services.md#^ref-75ea4a6a-20-0) (line 20, col 0, score 1)
- [compiler-kit-foundations — L620](compiler-kit-foundations.md#^ref-01b21543-620-0) (line 620, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L237](cross-language-runtime-polymorphism.md#^ref-c34c36a6-237-0) (line 237, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L40](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-40-0) (line 40, col 0, score 1)
- [Dynamic Context Model for Web Components — L401](dynamic-context-model-for-web-components.md#^ref-f7702bf8-401-0) (line 401, col 0, score 1)
- [ecs-scheduler-and-prefabs — L386](ecs-scheduler-and-prefabs.md#^ref-c62a1815-386-0) (line 386, col 0, score 1)
- [eidolon-field-math-foundations — L127](eidolon-field-math-foundations.md#^ref-008f2ac0-127-0) (line 127, col 0, score 1)
- [field-dynamics-math-blocks — L152](field-dynamics-math-blocks.md#^ref-7cfc230d-152-0) (line 152, col 0, score 1)
- [EidolonField — L257](eidolonfield.md#^ref-49d1e1e5-257-0) (line 257, col 0, score 1)
- [Factorio AI with External Agents — L147](factorio-ai-with-external-agents.md#^ref-a4d90289-147-0) (line 147, col 0, score 1)
- [field-node-diagram-outline — L116](field-node-diagram-outline.md#^ref-1f32c94a-116-0) (line 116, col 0, score 1)
- [field-node-diagram-set — L147](field-node-diagram-set.md#^ref-22b989d5-147-0) (line 147, col 0, score 1)
- [field-node-diagram-visualizations — L96](field-node-diagram-visualizations.md#^ref-e9b27b06-96-0) (line 96, col 0, score 1)
- [Fnord Tracer Protocol — L249](fnord-tracer-protocol.md#^ref-fc21f824-249-0) (line 249, col 0, score 1)
- [graph-ds — L368](graph-ds.md#^ref-6620e2f2-368-0) (line 368, col 0, score 1)
- [heartbeat-fragment-demo — L115](heartbeat-fragment-demo.md#^ref-dd00677a-115-0) (line 115, col 0, score 1)
- [heartbeat-simulation-snippets — L104](heartbeat-simulation-snippets.md#^ref-23e221e9-104-0) (line 104, col 0, score 1)
- [layer-1-uptime-diagrams — L170](layer-1-uptime-diagrams.md#^ref-4127189a-170-0) (line 170, col 0, score 1)
- [JavaScript — L19](chunks/javascript.md#^ref-c1618c66-19-0) (line 19, col 0, score 1)
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
- [Agent Tasks: Persistence Migration to DualStore — L151](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-151-0) (line 151, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L189](chroma-toolkit-consolidation-plan.md#^ref-5020e892-189-0) (line 189, col 0, score 1)
- [Event Bus Projections Architecture — L159](event-bus-projections-architecture.md#^ref-cf6b9b17-159-0) (line 159, col 0, score 1)
- [layer-1-uptime-diagrams — L171](layer-1-uptime-diagrams.md#^ref-4127189a-171-0) (line 171, col 0, score 1)
- [Promethean Event Bus MVP v0.1 — L886](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-886-0) (line 886, col 0, score 1)
- [Fnord Tracer Protocol — L170](fnord-tracer-protocol.md#^ref-fc21f824-170-0) (line 170, col 0, score 0.72)
- [Fnord Tracer Protocol — L149](fnord-tracer-protocol.md#^ref-fc21f824-149-0) (line 149, col 0, score 0.7)
- [Fnord Tracer Protocol — L168](fnord-tracer-protocol.md#^ref-fc21f824-168-0) (line 168, col 0, score 0.69)
- [Fnord Tracer Protocol — L24](fnord-tracer-protocol.md#^ref-fc21f824-24-0) (line 24, col 0, score 0.63)
- [AI-Centric OS with MCP Layer — L407](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-407-0) (line 407, col 0, score 1)
- [api-gateway-versioning — L284](api-gateway-versioning.md#^ref-0580dcd3-284-0) (line 284, col 0, score 1)
- [Services — L21](chunks/services.md#^ref-75ea4a6a-21-0) (line 21, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L43](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-43-0) (line 43, col 0, score 1)
- [Dynamic Context Model for Web Components — L407](dynamic-context-model-for-web-components.md#^ref-f7702bf8-407-0) (line 407, col 0, score 1)
- [ecs-offload-workers — L478](ecs-offload-workers.md#^ref-6498b9d7-478-0) (line 478, col 0, score 1)
- [eidolon-field-math-foundations — L167](eidolon-field-math-foundations.md#^ref-008f2ac0-167-0) (line 167, col 0, score 1)
- [i3-bluetooth-setup — L123](i3-bluetooth-setup.md#^ref-5e408692-123-0) (line 123, col 0, score 1)
- [i3-config-validation-methods — L78](i3-config-validation-methods.md#^ref-d28090ac-78-0) (line 78, col 0, score 1)
- [Math Fundamentals — L34](chunks/math-fundamentals.md#^ref-c6e87433-34-0) (line 34, col 0, score 1)
- [Services — L22](chunks/services.md#^ref-75ea4a6a-22-0) (line 22, col 0, score 1)
- [Shared — L29](chunks/shared.md#^ref-623a55f7-29-0) (line 29, col 0, score 1)
- [Simulation Demo — L23](chunks/simulation-demo.md#^ref-557309a3-23-0) (line 23, col 0, score 1)
- [Tooling — L16](chunks/tooling.md#^ref-6cb4943e-16-0) (line 16, col 0, score 1)
- [Window Management — L25](chunks/window-management.md#^ref-9e8ae388-25-0) (line 25, col 0, score 1)
- [compiler-kit-foundations — L627](compiler-kit-foundations.md#^ref-01b21543-627-0) (line 627, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L171](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-171-0) (line 171, col 0, score 1)
- [Duck's Attractor States — L81](ducks-attractor-states.md#^ref-13951643-81-0) (line 81, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L136](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-136-0) (line 136, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L108](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-108-0) (line 108, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L168](chroma-toolkit-consolidation-plan.md#^ref-5020e892-168-0) (line 168, col 0, score 1)
- [ecs-scheduler-and-prefabs — L387](ecs-scheduler-and-prefabs.md#^ref-c62a1815-387-0) (line 387, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L316](migrate-to-provider-tenant-architecture.md#^ref-54382370-316-0) (line 316, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L142](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-142-0) (line 142, col 0, score 1)
- [prom-lib-rate-limiters-and-replay-api — L405](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-405-0) (line 405, col 0, score 1)
- [Promethean Event Bus MVP v0.1 — L882](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-882-0) (line 882, col 0, score 1)
- [Exception Layer Analysis — L172](exception-layer-analysis.md#^ref-21d5cc09-172-0) (line 172, col 0, score 0.63)
- [field-dynamics-math-blocks — L154](field-dynamics-math-blocks.md#^ref-7cfc230d-154-0) (line 154, col 0, score 0.63)
- [field-interaction-equations — L164](field-interaction-equations.md#^ref-b09141b7-164-0) (line 164, col 0, score 0.63)
- [field-node-diagram-outline — L120](field-node-diagram-outline.md#^ref-1f32c94a-120-0) (line 120, col 0, score 0.63)
- [field-node-diagram-set — L149](field-node-diagram-set.md#^ref-22b989d5-149-0) (line 149, col 0, score 0.63)
- [field-node-diagram-visualizations — L99](field-node-diagram-visualizations.md#^ref-e9b27b06-99-0) (line 99, col 0, score 0.63)
- [graph-ds — L365](graph-ds.md#^ref-6620e2f2-365-0) (line 365, col 0, score 0.63)
- [heartbeat-fragment-demo — L111](heartbeat-fragment-demo.md#^ref-dd00677a-111-0) (line 111, col 0, score 0.63)
- [heartbeat-simulation-snippets — L101](heartbeat-simulation-snippets.md#^ref-23e221e9-101-0) (line 101, col 0, score 0.63)
- [eidolon-node-lifecycle — L63](eidolon-node-lifecycle.md#^ref-938eca9c-63-0) (line 63, col 0, score 1)
- [EidolonField — L269](eidolonfield.md#^ref-49d1e1e5-269-0) (line 269, col 0, score 1)
- [Event Bus Projections Architecture — L185](event-bus-projections-architecture.md#^ref-cf6b9b17-185-0) (line 185, col 0, score 1)
- [Exception Layer Analysis — L165](exception-layer-analysis.md#^ref-21d5cc09-165-0) (line 165, col 0, score 1)
- [Factorio AI with External Agents — L160](factorio-ai-with-external-agents.md#^ref-a4d90289-160-0) (line 160, col 0, score 1)
- [field-dynamics-math-blocks — L165](field-dynamics-math-blocks.md#^ref-7cfc230d-165-0) (line 165, col 0, score 1)
- [field-interaction-equations — L184](field-interaction-equations.md#^ref-b09141b7-184-0) (line 184, col 0, score 1)
- [field-node-diagram-outline — L132](field-node-diagram-outline.md#^ref-1f32c94a-132-0) (line 132, col 0, score 1)
- [field-node-diagram-set — L166](field-node-diagram-set.md#^ref-22b989d5-166-0) (line 166, col 0, score 1)
- [Diagrams — L13](chunks/diagrams.md#^ref-45cd25b5-13-0) (line 13, col 0, score 1)
- [DSL — L15](chunks/dsl.md#^ref-e87bc036-15-0) (line 15, col 0, score 1)
- [JavaScript — L18](chunks/javascript.md#^ref-c1618c66-18-0) (line 18, col 0, score 1)
- [Math Fundamentals — L14](chunks/math-fundamentals.md#^ref-c6e87433-14-0) (line 14, col 0, score 1)
- [Services — L14](chunks/services.md#^ref-75ea4a6a-14-0) (line 14, col 0, score 1)
- [Shared — L7](chunks/shared.md#^ref-623a55f7-7-0) (line 7, col 0, score 1)
- [Simulation Demo — L10](chunks/simulation-demo.md#^ref-557309a3-10-0) (line 10, col 0, score 1)
- [Tooling — L9](chunks/tooling.md#^ref-6cb4943e-9-0) (line 9, col 0, score 1)
- [Window Management — L15](chunks/window-management.md#^ref-9e8ae388-15-0) (line 15, col 0, score 1)
- [2d-sandbox-field — L225](2d-sandbox-field.md#^ref-c710dc93-225-0) (line 225, col 0, score 1)
- [Admin Dashboard for User Management — L49](admin-dashboard-for-user-management.md#^ref-2901a3e9-49-0) (line 49, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L150](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-150-0) (line 150, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L163](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-163-0) (line 163, col 0, score 1)
- [AI-First-OS-Model-Context-Protocol — L9](ai-first-os-model-context-protocol.md#^ref-618198f4-9-0) (line 9, col 0, score 1)
- [aionian-circuit-math — L179](aionian-circuit-math.md#^ref-f2d83a77-179-0) (line 179, col 0, score 1)
- [api-gateway-versioning — L304](api-gateway-versioning.md#^ref-0580dcd3-304-0) (line 304, col 0, score 1)
- [archetype-ecs — L479](archetype-ecs.md#^ref-8f4c1e86-479-0) (line 479, col 0, score 1)
- [balanced-bst — L295](balanced-bst.md#^ref-d3e7db72-295-0) (line 295, col 0, score 1)
- [Services — L28](chunks/services.md#^ref-75ea4a6a-28-0) (line 28, col 0, score 1)
- [Simulation Demo — L7](chunks/simulation-demo.md#^ref-557309a3-7-0) (line 7, col 0, score 1)
- [ecs-scheduler-and-prefabs — L428](ecs-scheduler-and-prefabs.md#^ref-c62a1815-428-0) (line 428, col 0, score 1)
- [Eidolon Field Abstract Model — L199](eidolon-field-abstract-model.md#^ref-5e8b2388-199-0) (line 199, col 0, score 1)
- [eidolon-node-lifecycle — L35](eidolon-node-lifecycle.md#^ref-938eca9c-35-0) (line 35, col 0, score 1)
- [field-interaction-equations — L173](field-interaction-equations.md#^ref-b09141b7-173-0) (line 173, col 0, score 1)
- [field-node-diagram-outline — L113](field-node-diagram-outline.md#^ref-1f32c94a-113-0) (line 113, col 0, score 1)
- [field-node-diagram-set — L140](field-node-diagram-set.md#^ref-22b989d5-140-0) (line 140, col 0, score 1)
- [AI-Centric OS with MCP Layer — L432](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-432-0) (line 432, col 0, score 1)
- [eidolon-node-lifecycle — L36](eidolon-node-lifecycle.md#^ref-938eca9c-36-0) (line 36, col 0, score 1)
- [field-node-diagram-set — L141](field-node-diagram-set.md#^ref-22b989d5-141-0) (line 141, col 0, score 1)
- [field-node-diagram-outline — L111](field-node-diagram-outline.md#^ref-1f32c94a-111-0) (line 111, col 0, score 1)
- [field-node-diagram-set — L144](field-node-diagram-set.md#^ref-22b989d5-144-0) (line 144, col 0, score 1)
- [field-node-diagram-visualizations — L94](field-node-diagram-visualizations.md#^ref-e9b27b06-94-0) (line 94, col 0, score 1)
- [Fnord Tracer Protocol — L258](fnord-tracer-protocol.md#^ref-fc21f824-258-0) (line 258, col 0, score 1)
- [graph-ds — L398](graph-ds.md#^ref-6620e2f2-398-0) (line 398, col 0, score 1)
- [heartbeat-fragment-demo — L110](heartbeat-fragment-demo.md#^ref-dd00677a-110-0) (line 110, col 0, score 1)
- [heartbeat-simulation-snippets — L99](heartbeat-simulation-snippets.md#^ref-23e221e9-99-0) (line 99, col 0, score 1)
- [homeostasis-decay-formulas — L151](homeostasis-decay-formulas.md#^ref-37b5d236-151-0) (line 151, col 0, score 1)
- [i3-bluetooth-setup — L119](i3-bluetooth-setup.md#^ref-5e408692-119-0) (line 119, col 0, score 1)
- [markdown-to-org-transpiler — L318](markdown-to-org-transpiler.md#^ref-ab54cdd8-318-0) (line 318, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L322](migrate-to-provider-tenant-architecture.md#^ref-54382370-322-0) (line 322, col 0, score 1)
- [Mongo Outbox Implementation — L579](mongo-outbox-implementation.md#^ref-9c1acd1e-579-0) (line 579, col 0, score 1)
- [observability-infrastructure-setup — L369](observability-infrastructure-setup.md#^ref-b4e64f8c-369-0) (line 369, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L183](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-183-0) (line 183, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L483](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-483-0) (line 483, col 0, score 1)
- [polymorphic-meta-programming-engine — L241](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-241-0) (line 241, col 0, score 1)
- [prom-lib-rate-limiters-and-replay-api — L415](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-415-0) (line 415, col 0, score 1)
- [Promethean Agent Config DSL — L352](promethean-agent-config-dsl.md#^ref-2c00ce45-352-0) (line 352, col 0, score 1)
- [2d-sandbox-field — L221](2d-sandbox-field.md#^ref-c710dc93-221-0) (line 221, col 0, score 1)
- [aionian-circuit-math — L165](aionian-circuit-math.md#^ref-f2d83a77-165-0) (line 165, col 0, score 1)
- [api-gateway-versioning — L319](api-gateway-versioning.md#^ref-0580dcd3-319-0) (line 319, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L116](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-116-0) (line 116, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L209](chroma-toolkit-consolidation-plan.md#^ref-5020e892-209-0) (line 209, col 0, score 1)
- [DSL — L13](chunks/dsl.md#^ref-e87bc036-13-0) (line 13, col 0, score 1)
- [Math Fundamentals — L16](chunks/math-fundamentals.md#^ref-c6e87433-16-0) (line 16, col 0, score 1)
- [Services — L16](chunks/services.md#^ref-75ea4a6a-16-0) (line 16, col 0, score 1)
- [Shared — L5](chunks/shared.md#^ref-623a55f7-5-0) (line 5, col 0, score 1)
- [Language-Agnostic Mirror System — L538](language-agnostic-mirror-system.md#^ref-d2b3628c-538-0) (line 538, col 0, score 1)
- [layer-1-uptime-diagrams — L178](layer-1-uptime-diagrams.md#^ref-4127189a-178-0) (line 178, col 0, score 1)
- [Lisp-Compiler-Integration — L550](lisp-compiler-integration.md#^ref-cfee6d36-550-0) (line 550, col 0, score 1)
- [lisp-dsl-for-window-management — L223](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-223-0) (line 223, col 0, score 1)
- [Lispy Macros with syntax-rules — L406](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-406-0) (line 406, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L168](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-168-0) (line 168, col 0, score 1)
- [Local-Only-LLM-Workflow — L201](local-only-llm-workflow.md#^ref-9a8ab57e-201-0) (line 201, col 0, score 1)
- [markdown-to-org-transpiler — L323](markdown-to-org-transpiler.md#^ref-ab54cdd8-323-0) (line 323, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L496](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-496-0) (line 496, col 0, score 1)
- [ripple-propagation-demo — L118](ripple-propagation-demo.md#^ref-8430617b-118-0) (line 118, col 0, score 1)
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
- [Local-First Intention→Code Loop with Free Models — L174](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-174-0) (line 174, col 0, score 1)
- [Local-Only-LLM-Workflow — L211](local-only-llm-workflow.md#^ref-9a8ab57e-211-0) (line 211, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L334](migrate-to-provider-tenant-architecture.md#^ref-54382370-334-0) (line 334, col 0, score 1)
- [Mongo Outbox Implementation — L581](mongo-outbox-implementation.md#^ref-9c1acd1e-581-0) (line 581, col 0, score 1)
- [observability-infrastructure-setup — L397](observability-infrastructure-setup.md#^ref-b4e64f8c-397-0) (line 397, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L48](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-48-0) (line 48, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L202](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-202-0) (line 202, col 0, score 1)
- [AI-First-OS-Model-Context-Protocol — L13](ai-first-os-model-context-protocol.md#^ref-618198f4-13-0) (line 13, col 0, score 1)
- [api-gateway-versioning — L288](api-gateway-versioning.md#^ref-0580dcd3-288-0) (line 288, col 0, score 1)
- [archetype-ecs — L480](archetype-ecs.md#^ref-8f4c1e86-480-0) (line 480, col 0, score 1)
- [balanced-bst — L301](balanced-bst.md#^ref-d3e7db72-301-0) (line 301, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L178](chroma-toolkit-consolidation-plan.md#^ref-5020e892-178-0) (line 178, col 0, score 1)
- [Diagrams — L39](chunks/diagrams.md#^ref-45cd25b5-39-0) (line 39, col 0, score 1)
- [DSL — L41](chunks/dsl.md#^ref-e87bc036-41-0) (line 41, col 0, score 1)
- [JavaScript — L40](chunks/javascript.md#^ref-c1618c66-40-0) (line 40, col 0, score 1)
- [Math Fundamentals — L40](chunks/math-fundamentals.md#^ref-c6e87433-40-0) (line 40, col 0, score 1)
- [zero-copy-snapshots-and-workers — L363](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-363-0) (line 363, col 0, score 1)
- [2d-sandbox-field — L197](2d-sandbox-field.md#^ref-c710dc93-197-0) (line 197, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L178](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-178-0) (line 178, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L216](chroma-toolkit-consolidation-plan.md#^ref-5020e892-216-0) (line 216, col 0, score 1)
- [Diagrams — L17](chunks/diagrams.md#^ref-45cd25b5-17-0) (line 17, col 0, score 1)
- [Eidolon Field Abstract Model — L194](eidolon-field-abstract-model.md#^ref-5e8b2388-194-0) (line 194, col 0, score 1)
- [eidolon-node-lifecycle — L33](eidolon-node-lifecycle.md#^ref-938eca9c-33-0) (line 33, col 0, score 1)
- [EidolonField — L247](eidolonfield.md#^ref-49d1e1e5-247-0) (line 247, col 0, score 1)
- [Event Bus Projections Architecture — L149](event-bus-projections-architecture.md#^ref-cf6b9b17-149-0) (line 149, col 0, score 1)
- [AI-Centric OS with MCP Layer — L408](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-408-0) (line 408, col 0, score 1)
- [api-gateway-versioning — L316](api-gateway-versioning.md#^ref-0580dcd3-316-0) (line 316, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L213](chroma-toolkit-consolidation-plan.md#^ref-5020e892-213-0) (line 213, col 0, score 1)
- [i3-bluetooth-setup — L101](i3-bluetooth-setup.md#^ref-5e408692-101-0) (line 101, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L178](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-178-0) (line 178, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L303](migrate-to-provider-tenant-architecture.md#^ref-54382370-303-0) (line 303, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L140](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-140-0) (line 140, col 0, score 1)
- [Mongo Outbox Implementation — L585](mongo-outbox-implementation.md#^ref-9c1acd1e-585-0) (line 585, col 0, score 1)
- [observability-infrastructure-setup — L363](observability-infrastructure-setup.md#^ref-b4e64f8c-363-0) (line 363, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L138](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-138-0) (line 138, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L193](chroma-toolkit-consolidation-plan.md#^ref-5020e892-193-0) (line 193, col 0, score 1)
- [Diagrams — L43](chunks/diagrams.md#^ref-45cd25b5-43-0) (line 43, col 0, score 1)
- [Services — L41](chunks/services.md#^ref-75ea4a6a-41-0) (line 41, col 0, score 1)
- [ecs-scheduler-and-prefabs — L417](ecs-scheduler-and-prefabs.md#^ref-c62a1815-417-0) (line 417, col 0, score 1)
- [eidolon-node-lifecycle — L62](eidolon-node-lifecycle.md#^ref-938eca9c-62-0) (line 62, col 0, score 1)
- [Event Bus Projections Architecture — L182](event-bus-projections-architecture.md#^ref-cf6b9b17-182-0) (line 182, col 0, score 1)
- [Fnord Tracer Protocol — L266](fnord-tracer-protocol.md#^ref-fc21f824-266-0) (line 266, col 0, score 1)
- [i3-bluetooth-setup — L128](i3-bluetooth-setup.md#^ref-5e408692-128-0) (line 128, col 0, score 1)
- [layer-1-uptime-diagrams — L193](layer-1-uptime-diagrams.md#^ref-4127189a-193-0) (line 193, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L181](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-181-0) (line 181, col 0, score 1)
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
- [markdown-to-org-transpiler — L313](markdown-to-org-transpiler.md#^ref-ab54cdd8-313-0) (line 313, col 0, score 1)
- [Matplotlib Animation with Async Execution — L79](matplotlib-animation-with-async-execution.md#^ref-687439f9-79-0) (line 79, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L299](migrate-to-provider-tenant-architecture.md#^ref-54382370-299-0) (line 299, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L151](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-151-0) (line 151, col 0, score 1)
- [Mongo Outbox Implementation — L587](mongo-outbox-implementation.md#^ref-9c1acd1e-587-0) (line 587, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L77](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-77-0) (line 77, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L120](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-120-0) (line 120, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L179](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-179-0) (line 179, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L282](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-282-0) (line 282, col 0, score 1)
- [Diagrams — L50](chunks/diagrams.md#^ref-45cd25b5-50-0) (line 50, col 0, score 1)
- [DSL — L44](chunks/dsl.md#^ref-e87bc036-44-0) (line 44, col 0, score 1)
- [Math Fundamentals — L43](chunks/math-fundamentals.md#^ref-c6e87433-43-0) (line 43, col 0, score 1)
- [Operations — L15](chunks/operations.md#^ref-f1add613-15-0) (line 15, col 0, score 1)
- [Shared — L31](chunks/shared.md#^ref-623a55f7-31-0) (line 31, col 0, score 1)
- [Simulation Demo — L34](chunks/simulation-demo.md#^ref-557309a3-34-0) (line 34, col 0, score 1)
- [Window Management — L38](chunks/window-management.md#^ref-9e8ae388-38-0) (line 38, col 0, score 1)
- [compiler-kit-foundations — L651](compiler-kit-foundations.md#^ref-01b21543-651-0) (line 651, col 0, score 1)
- [Creative Moments — L15](creative-moments.md#^ref-10d98225-15-0) (line 15, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L263](cross-language-runtime-polymorphism.md#^ref-c34c36a6-263-0) (line 263, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L219](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-219-0) (line 219, col 0, score 1)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
