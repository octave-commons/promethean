---
uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
created_at: 2025.08.08.20.08.56.md
filename: Stateful Partitions and Rebalancing
description: >-
  Implements stateful partitions with jump consistent hash for deterministic
  partitioning, in-memory coordinator for rebalancing, and partition-aware
  subscribe wrappers. Includes a tiny schema-registry (Zod) with compatibility
  rules and a changelog projector for materializing topics into MongoDB with
  upserts and tombstones.
tags:
  - stateful
  - rebalancing
  - partitioning
  - schema-registry
  - zod
  - changelog
  - projector
  - mongodb
  - upsert
  - tombstone
related_to_title: []
related_to_uuid: []
references: []
---
Note: Consolidated here → ../notes/services/partitions-schema-registry-projector.md

Alright, **Part 5**: stateful partitions + rebalancing, a tiny schema-registry (Zod) with compat rules, and a **Changelog Projector** that materializes a topic into a Mongo collection with upserts & tombstones. All drop-in. ⚙️ ^ref-4330e8f0-3-0

---

# 1) Stateful partitions + rebalance

## 1a) Jump consistent hash (deterministic partition id)

```ts
// shared/js/prom-lib/partition/jump.ts
// Jump Consistent Hash (Lamping & Veach) — stable mapping key -> [0..buckets-1]
export function jumpHash(key: string, buckets: number): number {
  // convert to 64-bit int hash (xorshift-ish)
  let h1 = 0xdeadbeef ^ key.length, h2 = 0x41c6ce57 ^ key.length;
  for (let i=0;i<key.length;i++) {
    const ch = key.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  let x = (h1 ^ (h2<<1)) >>> 0;
  let b = -1, j = 0;
  while (j < buckets) {
    b = j;
    x = (x * 2862933555777941757n + 1n) & 0xffffffffffffffffn as any;
    const inv = Number((x >> 33n) + 1n) / 2**31;
    j = Math.floor((b + 1) / inv);
  }
  return b;
}
```
^ref-4330e8f0-11-0

## 1b) Coordinator (in-memory) with rebalance hooks
 ^ref-4330e8f0-36-0
```ts
// shared/js/prom-lib/partition/coordinator.ts
type Member = { id: string; group: string; lastSeen: number; meta?: Record<string, any> };

export type Assignment = { group: string; partitions: number; owners: Record<number, string> }; // partitionId -> memberId

export class PartitionCoordinator {
  private ttlMs: number;
  private byGroup = new Map<string, Map<string, Member>>();

  constructor({ ttlMs = 15_000 } = {}) { this.ttlMs = ttlMs; }

  join(group: string, id: string, meta?: Record<string, any>) {
    const g = this.byGroup.get(group) ?? new Map();
    g.set(id, { id, group, lastSeen: Date.now(), meta });
    this.byGroup.set(group, g);
  }
  heartbeat(group: string, id: string) {
    const g = this.byGroup.get(group); if (!g) return;
    const m = g.get(id); if (m) m.lastSeen = Date.now();
  }
  leave(group: string, id: string) {
    const g = this.byGroup.get(group); if (!g) return;
    g.delete(id);
  }
  sweep() {
    const now = Date.now();
    for (const [group, g] of this.byGroup) {
      for (const [id, m] of g) if (now - m.lastSeen > this.ttlMs) g.delete(id);
    }
  }

  // Rendezvous-style assignment: for each partition choose the highest-scoring member.
  // Score = hash(`${partitionId}:${memberId}`)
  assign(group: string, partitions: number): Assignment {
    const g = this.byGroup.get(group) ?? new Map();
    const owners: Record<number,string> = {};
    const ids = [...g.keys()];
    if (ids.length === 0) return { group, partitions, owners: {} };
    for (let p=0; p<partitions; p++) {
      let bestId = ids[0], best = -Infinity;
      for (const id of ids) {
        const s = score(`${p}:${id}`);
        if (s > best) { best = s; bestId = id; }
      }
      owners[p] = bestId;
    }
    return { group, partitions, owners };
  }
}

function score(s: string): number {
  // 32-bit FNV-1a normalized to [0,1)
  let h = 2166136261 >>> 0;
  for (let i=0;i<s.length;i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0) / 2**32;
}
^ref-4330e8f0-36-0
```

## 1c) Partition-aware subscribe wrapper
 ^ref-4330e8f0-98-0
* Computes `partition = jumpHash(key || id, partitions)` ^ref-4330e8f0-99-0
* Filters deliveries to only the partitions assigned to this member
* Reacts to rebalances ^ref-4330e8f0-101-0

```ts
// shared/js/prom-lib/partition/subscribe.ts
import { EventBus, EventRecord, PublishOptions } from "../event/types";
import { PartitionCoordinator } from "./coordinator";
import { jumpHash } from "./jump";

export type PartitionOpts = {
  group: string;
  memberId: string;
  partitions: number;
  keyOf?: (e: EventRecord) => string | undefined; // default: e.key || e.id
  rebalanceEveryMs?: number; // how often to recompute assignment
};

export async function subscribePartitioned(
  bus: EventBus,
  topic: string,
  handler: (e: EventRecord) => Promise<void>,
  coord: PartitionCoordinator,
  opts: PartitionOpts
) {
  const keyOf = opts.keyOf ?? ((e: EventRecord) => e.key ?? e.id);
  let myParts = new Set<number>();

  function refreshAssignment() {
    coord.sweep();
    coord.heartbeat(opts.group, opts.memberId);
    const a = coord.assign(opts.group, opts.partitions);
    myParts = new Set<number>(Object.entries(a.owners)
      .filter(([pid, owner]) => owner === opts.memberId)
      .map(([pid]) => Number(pid)));
  }

  coord.join(opts.group, opts.memberId, {});
  refreshAssignment();
  const t = setInterval(refreshAssignment, opts.rebalanceEveryMs ?? 3000);

  // filter: deliver only my partitions
  const unsubscribe = await bus.subscribe(
    topic,
    opts.group,
    handler,
    {
      from: "latest",
      manualAck: false,
      filter: (e: EventRecord) => {
        const key = keyOf(e) ?? e.id;
        const pid = jumpHash(String(key), opts.partitions);
        return myParts.has(pid);
      }
    }
  );

  return async () => {
    clearInterval(t);
    await unsubscribe();
    coord.leave(opts.group, opts.memberId);
  };
^ref-4330e8f0-101-0
}
```
 ^ref-4330e8f0-164-0
## 1d) Partition on publish (optional, stores `partition`)
 ^ref-4330e8f0-166-0
If you want `partition` persisted (nice for Mongo scans), wrap `publish`:

```ts
// shared/js/prom-lib/partition/publish.ts
import { EventBus, PublishOptions } from "../event/types";
import { jumpHash } from "./jump";

export function withPartitioning(bus: EventBus, partitions: number, keyOf?: (payload: any, opts?: PublishOptions) => string | undefined): EventBus {
  return {
    ...bus,
    async publish(topic, payload, opts = {}) {
      if (opts.partition == null) {
        const key = keyOf?.(payload, opts) ?? opts.key ?? JSON.stringify(payload).slice(0,64);
        opts.partition = jumpHash(String(key ?? ""), partitions);
      }
      return bus.publish(topic, payload, opts);
    }
^ref-4330e8f0-166-0
  }; ^ref-4330e8f0-185-0
}
```
^ref-4330e8f0-187-0

**Mermaid (rebalance loop):**

```mermaid
flowchart LR
  Sub[Subscriber] -->|join/heartbeat| Coord
  Coord -->|assign| Sub
^ref-4330e8f0-187-0
  Sub -->|filter by myPartitions| Bus
  Bus --> Sub
  Timer[[interval]] -->|rebalance| Coord
```

--- ^ref-4330e8f0-202-0

# 2) Schema Registry (Zod, lite compat)

## 2a) Registry

```ts
// shared/js/prom-lib/schema/registry.ts
import { z, ZodTypeAny } from "zod";

export type Compat = "none" | "backward" | "forward";
export type TopicId = string;

export interface TopicSchema {
  topic: TopicId;
  version: number;
  schema: ZodTypeAny;
  compat: Compat; // evolution rule vs previous version(s)
}

export class SchemaRegistry {
  private versions = new Map<TopicId, TopicSchema[]>(); // ascending by version

  register(def: TopicSchema) {
    const list = this.versions.get(def.topic) ?? [];
    // ensure monotonic
    if (list.length && def.version <= list[list.length-1].version) {
      throw new Error(`version must increase for ${def.topic}`);
    }
    // validate compatibility (very light check via zod "shape" introspection best-effort)
    if (list.length && def.compat !== "none") {
      const prev = list[list.length-1];
      checkCompat(prev.schema, def.schema, def.compat);
    }
    list.push(def);
    this.versions.set(def.topic, list);
  }

  latest(topic: TopicId): TopicSchema | undefined {
    const list = this.versions.get(topic); if (!list || !list.length) return;
    return list[list.length-1];
  }

  validate(topic: TopicId, payload: unknown, version?: number) {
    const list = this.versions.get(topic);
    if (!list || !list.length) return; // no schema → allow
    const schema = version
      ? (list.find(s => s.version === version)?.schema)
      : list[list.length-1].schema;
    schema?.parse(payload);
  }
}

function checkCompat(prev: ZodTypeAny, next: ZodTypeAny, compat: Compat) {
  // Minimal heuristic:
  // - backward: next must accept all fields prev accepted (no required field added)
  // - forward: prev must accept all fields next accepted (no required field removed)
  // We approximate using `.partial()` and safeParse roundtrips.
  if (compat === "backward") {
    const res = next.safeParse((prev as any).parse({} as any));
    if (!res.success) throw new Error("backward compatibility check failed");
  }
  if (compat === "forward") {
^ref-4330e8f0-202-0
    const res = prev.safeParse((next as any).parse({} as any));
    if (!res.success) throw new Error("forward compatibility check failed");
  }
}
^ref-4330e8f0-267-0
```
^ref-4330e8f0-267-0

## 2b) Publish validator middleware

```ts
// shared/js/prom-lib/schema/enforce.ts
import { EventBus, PublishOptions, EventRecord } from "../event/types";
import { SchemaRegistry } from "./registry";

export function withSchemaValidation(bus: EventBus, reg: SchemaRegistry): EventBus {
  return {
    ...bus,
    async publish<T>(topic: string, payload: T, opts: PublishOptions = {}): Promise<EventRecord<T>> {
      // optional: stash schema version in headers
      const latest = reg.latest(topic);
      if (latest) {
        reg.validate(topic, payload, latest.version);
        opts.headers = { ...(opts.headers || {}), "x-schema-version": String(latest.version) };
^ref-4330e8f0-267-0
      }
      return bus.publish(topic, payload, opts);
    }
  };
^ref-4330e8f0-290-0
}
^ref-4330e8f0-290-0
```
^ref-4330e8f0-290-0

## 2c) Example schema defs

```ts
// shared/js/prom-lib/schema/topics.ts
import { z } from "zod";
import { SchemaRegistry } from "./registry";

export const reg = new SchemaRegistry();

reg.register({
  topic: "heartbeat.received",
  version: 1,
  compat: "backward",
  schema: z.object({
    pid: z.number(), name: z.string(), host: z.string(),
    cpu_pct: z.number(), mem_mb: z.number(),
    sid: z.string().optional()
  })
});

reg.register({
  topic: "process.state",
  version: 1,
  compat: "backward",
  schema: z.object({
    processId: z.string(),
    name: z.string(),
    host: z.string(),
    pid: z.number(),
    sid: z.string().optional(),
^ref-4330e8f0-290-0
    cpu_pct: z.number(), ^ref-4330e8f0-326-0
    mem_mb: z.number(),
    last_seen_ts: z.number(),
    status: z.enum(["alive","stale"])
^ref-4330e8f0-328-0
^ref-4330e8f0-326-0
  })
^ref-4330e8f0-328-0
^ref-4330e8f0-326-0
});
^ref-4330e8f0-328-0 ^ref-4330e8f0-342-0
^ref-4330e8f0-326-0
``` ^ref-4330e8f0-344-0

**Mermaid (publish path):**

```mermaid
^ref-4330e8f0-328-0
sequenceDiagram
  participant Pub as Publisher
  participant SV as SchemaValidation
^ref-4330e8f0-345-0
^ref-4330e8f0-344-0 ^ref-4330e8f0-347-0
^ref-4330e8f0-342-0
  participant EB as EventBus
^ref-4330e8f0-351-0
^ref-4330e8f0-347-0
^ref-4330e8f0-345-0
^ref-4330e8f0-344-0
  Pub->>SV: publish(topic, payload) ^ref-4330e8f0-342-0
^ref-4330e8f0-351-0
^ref-4330e8f0-347-0
^ref-4330e8f0-345-0
  SV->>SV: reg.validate(topic,payload) ^ref-4330e8f0-351-0
  SV->>EB: publish with header x-schema-version ^ref-4330e8f0-344-0
``` ^ref-4330e8f0-345-0

--- ^ref-4330e8f0-347-0

# 3) Changelog Projector (topic → Mongo collection)

Materializes a compaction-like stream into a Mongo **collection**:

* **Upsert** by key
* **Tombstone** deletes (payload `null` or `{ _deleted: true }`)
* Optional **version** field & optimistic concurrency
* Works standalone or with **subscribeExactlyOnce**

## 3a) Projector

```ts
// shared/js/prom-lib/projectors/changelog.ts
import type { Db, Collection } from "mongodb";
import type { EventBus, EventRecord } from "../event/types";

export interface ChangelogOpts<T = any> {
  topic: string;
  collection: string;
  keyOf: (event: EventRecord<T>) => string;                // derive key
  map: (event: EventRecord<T>) => Record<string, any>;     // event -> doc (without _id)
  tombstone?: (event: EventRecord<T>) => boolean;          // default: payload === null || payload._deleted === true
  indexes?: { keys: Record<string, 1|-1>, unique?: boolean }[];
  versionOf?: (event: EventRecord<T>) => number | undefined; // optional version
}

export async function startChangelogProjector<T>(db: Db, bus: EventBus, opts: ChangelogOpts<T>) {
  const coll: Collection = db.collection(opts.collection);
  // ensure key uniqueness
  await coll.createIndex({ _key: 1 }, { unique: true });
  for (const idx of (opts.indexes ?? [])) await coll.createIndex(idx.keys as any, { unique: !!idx.unique });

  const isTomb = (e: EventRecord<any>) => {
    const p = e.payload as any;
    return p == null || p?._deleted === true || opts.tombstone?.(e) === true;
  };

  async function handle(e: EventRecord<T>) {
    const _key = opts.keyOf(e);
    if (!_key) return;

    if (isTomb(e)) {
      await coll.deleteOne({ _key });
      return;
    }

    const base = opts.map(e);
    const version = opts.versionOf?.(e);
    if (version != null) {
      // optimistic: only upsert if newer (assumes monotonic version)
      await coll.updateOne(
        { _key, $or: [ { _v: { $lt: version } }, { _v: { $exists: false } } ] },
        { $set: { ...base, _key, _v: version, _ts: e.ts } },
        { upsert: true }
      );
    } else {
      await coll.updateOne(
        { _key },
        { $set: { ...base, _key, _ts: e.ts } },
        { upsert: true }
      );
    }
  }

  const stop = await bus.subscribe(
^ref-4330e8f0-351-0
    opts.topic,
^ref-4330e8f0-417-0
^ref-4330e8f0-417-0
    `changelog:${opts.collection}`,
    async (e) => { await handle(e); },
^ref-4330e8f0-417-0
    { from: "earliest", batchSize: 500, manualAck: false }
  );

  return stop;
}
```

## 3b) Example: materialize `process.state` → `processes` collection

```ts
// shared/js/prom-lib/examples/process/changelog.ts
import type { Db } from "mongodb";
import { EventBus } from "../../event/types";
import { startChangelogProjector } from "../../projectors/changelog";

export async function startProcessChangelog(db: Db, bus: EventBus) {
  return startChangelogProjector(db, bus, {
    topic: "process.state",
    collection: "processes",
    keyOf: (e) => (e.payload as any)?.processId,
    map: (e) => {
      const p = e.payload as any;
      return {
        processId: p.processId, name: p.name, host: p.host, pid: p.pid,
        sid: p.sid, cpu_pct: p.cpu_pct, mem_mb: p.mem_mb, status: p.status,
^ref-4330e8f0-417-0
        last_seen_ts: p.last_seen_ts
^ref-4330e8f0-448-0
^ref-4330e8f0-448-0
      };
    },
^ref-4330e8f0-448-0
    indexes: [
      { keys: { host: 1, name: 1 } },
      { keys: { status: 1 } }
    ]
  });
}
```

---

# 4) Glue example (partitioned consumer + schema + changelog)

```ts
// services/js/event-hub/partitioned.ts
import { MongoClient } from "mongodb";
import { MongoEventBus, MongoEventStore, MongoCursorStore } from "../../shared/js/prom-lib/event/mongo";
import { SchemaRegistry } from "../../shared/js/prom-lib/schema/registry";
import { withSchemaValidation } from "../../shared/js/prom-lib/schema/enforce";
import { subscribePartitioned } from "../../shared/js/prom-lib/partition/subscribe";
import { PartitionCoordinator } from "../../shared/js/prom-lib/partition/coordinator";
import { startProcessChangelog } from "../../shared/js/prom-lib/examples/process/changelog";
import { startProcessProjector } from "../../shared/js/prom-lib/examples/process/projector";
import { reg as topicSchemas } from "../../shared/js/prom-lib/schema/topics";

async function main() {
  const client = await MongoClient.connect(process.env.MONGO_URL || "mongodb://127.0.0.1:27017/prom");
  const db = client.db();

  const rawBus = new MongoEventBus(new MongoEventStore(db), new MongoCursorStore(db));
  const reg = topicSchemas instanceof SchemaRegistry ? topicSchemas : new SchemaRegistry();
  const bus = withSchemaValidation(rawBus, reg);

  // Heartbeat -> ProcessState projector (as before)
  await startProcessProjector(bus);

  // Materialize ProcessState into Mongo collection
  await startProcessChangelog(db, bus);

  // Partitioned consumer (e.g., heavy analyzer) with 8 partitions
  const coord = new PartitionCoordinator({ ttlMs: 10_000 });
  const memberId = `worker-${Math.random().toString(16).slice(2)}`;

  await subscribePartitioned(
    bus,
    "process.state",
    async (e) => {
      // do expensive work only for assigned partitions
^ref-4330e8f0-448-0
      void e; // placeholder
^ref-4330e8f0-499-0
^ref-4330e8f0-516-0
^ref-4330e8f0-515-0
^ref-4330e8f0-514-0
^ref-4330e8f0-513-0 ^ref-4330e8f0-520-0
^ref-4330e8f0-512-0
^ref-4330e8f0-511-0 ^ref-4330e8f0-522-0
^ref-4330e8f0-499-0 ^ref-4330e8f0-523-0
    }, ^ref-4330e8f0-524-0
    coord, ^ref-4330e8f0-525-0
^ref-4330e8f0-527-0
^ref-4330e8f0-525-0
^ref-4330e8f0-524-0
^ref-4330e8f0-523-0
^ref-4330e8f0-522-0
^ref-4330e8f0-520-0
^ref-4330e8f0-516-0
^ref-4330e8f0-515-0
^ref-4330e8f0-514-0
^ref-4330e8f0-513-0
^ref-4330e8f0-512-0
^ref-4330e8f0-511-0
^ref-4330e8f0-499-0
    { group: "analyzers", memberId, partitions: 8, rebalanceEveryMs: 2500 }
  ); ^ref-4330e8f0-527-0
 ^ref-4330e8f0-511-0
  console.log("[partitioned] up");
}

main().catch((e)=>{ console.error(e); process.exit(1); });
```
^ref-4330e8f0-499-0

^ref-4330e8f0-516-0
^ref-4330e8f0-515-0 ^ref-4330e8f0-520-0
^ref-4330e8f0-514-0
^ref-4330e8f0-513-0 ^ref-4330e8f0-522-0
^ref-4330e8f0-512-0 ^ref-4330e8f0-523-0
--- ^ref-4330e8f0-524-0
 ^ref-4330e8f0-525-0
# 5) Sibilant sugar (pseudo)
 ^ref-4330e8f0-511-0 ^ref-4330e8f0-527-0
```lisp ^ref-4330e8f0-512-0
; shared/sibilant/prom/partition.sib (pseudo) ^ref-4330e8f0-513-0
(defn partition-of [key partitions] (jumpHash (str key) partitions)) ^ref-4330e8f0-514-0
 ^ref-4330e8f0-515-0
(defn start-partitioned [bus topic group member-id partitions handler] ^ref-4330e8f0-516-0
  (subscribePartitioned bus topic handler (new PartitionCoordinator {}) {:group group :memberId member-id :partitions partitions}))
```

--- ^ref-4330e8f0-520-0

# 6) Kanban adds ^ref-4330e8f0-522-0
 ^ref-4330e8f0-523-0
* [ ] Wrap `event-hub` publish path with **withSchemaValidation**; fail fast on bad payloads ^ref-4330e8f0-524-0 ^ref-4330e8f0-578-0
* [ ] Use **subscribePartitioned** for CPU-heavy consumers; tune `partitions` (power of 2 is fine) ^ref-4330e8f0-525-0 ^ref-4330e8f0-579-0
* [ ] Add **startChangelogProjector** for any compaction-like topic you want live-queryable
* [ ] Ensure Mongo indexes: `{ _key: 1 } unique` + common query fields ^ref-4330e8f0-527-0
* [ ] Add `/ops` endpoint to list **partition assignments** (optional: dump coordinator state)
* [ ] Write a replay job that replays `process.state.snapshot` to warm the `processes` collection
 ^ref-4330e8f0-584-0
---

Want **Part 6** next? I can ship:

* **Schema evolution workflow** (migrations + dual-write + cutover),
* **Dead letter queue** with replay,
* **Changefeeds** (watch Mongo changelog and republish),
* and a **linter** that checks topic names, headers, and schema coverage in CI.<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [schema-evolution-workflow](schema-evolution-workflow.md)
- [WebSocket Gateway Implementation](websocket-gateway-implementation.md)
- [Event Bus MVP](event-bus-mvp.md)
- [State Snapshots API and Transactional Projector](state-snapshots-api-and-transactional-projector.md)
- [Services](chunks/services.md)
- [Unique Info Dump Index](unique-info-dump-index.md)
- [prom-lib-rate-limiters-and-replay-api](prom-lib-rate-limiters-and-replay-api.md)
- [Mongo Outbox Implementation](mongo-outbox-implementation.md)
- [Promethean Event Bus MVP v0.1](promethean-event-bus-mvp-v0-1.md)
- [Promethean-native config design](promethean-native-config-design.md)
- [Agent Tasks: Persistence Migration to DualStore](agent-tasks-persistence-migration-to-dualstore.md)
- [archetype-ecs](archetype-ecs.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [aionian-circuit-math](aionian-circuit-math.md)
- [Diagrams](chunks/diagrams.md)
- [DSL](chunks/dsl.md)
- [Board Walk – 2025-08-11](board-walk-2025-08-11.md)
- [Event Bus Projections Architecture](event-bus-projections-architecture.md)
- [ecs-offload-workers](ecs-offload-workers.md)
- [observability-infrastructure-setup](observability-infrastructure-setup.md)
- [Migrate to Provider-Tenant Architecture](migrate-to-provider-tenant-architecture.md)
- [Cross-Language Runtime Polymorphism](cross-language-runtime-polymorphism.md)
- [ecs-scheduler-and-prefabs](ecs-scheduler-and-prefabs.md)
- [api-gateway-versioning](api-gateway-versioning.md)
- [heartbeat-fragment-demo](heartbeat-fragment-demo.md)
- [JavaScript](chunks/javascript.md)
- [Admin Dashboard for User Management](admin-dashboard-for-user-management.md)
- [AI-Centric OS with MCP Layer](ai-centric-os-with-mcp-layer.md)
- [Debugging Broker Connections and Agent Behavior](debugging-broker-connections-and-agent-behavior.md)
- [Tooling](chunks/tooling.md)
- [2d-sandbox-field](2d-sandbox-field.md)
- [Agent Reflections and Prompt Evolution](agent-reflections-and-prompt-evolution.md)
- [Canonical Org-Babel Matplotlib Animation Template](canonical-org-babel-matplotlib-animation-template.md)
- [Math Fundamentals](chunks/math-fundamentals.md)
- [compiler-kit-foundations](compiler-kit-foundations.md)
- [Cross-Target Macro System in Sibilant](cross-target-macro-system-in-sibilant.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [Model Selection for Lightweight Conversational Tasks](model-selection-for-lightweight-conversational-tasks.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [Exception Layer Analysis](exception-layer-analysis.md)
- [Obsidian ChatGPT Plugin Integration Guide](obsidian-chatgpt-plugin-integration-guide.md)
- [Duck's Self-Referential Perceptual Loop](ducks-self-referential-perceptual-loop.md)
- [Eidolon Field Abstract Model](eidolon-field-abstract-model.md)
- [balanced-bst](balanced-bst.md)
- [Shared](chunks/shared.md)
- [Simulation Demo](chunks/simulation-demo.md)
- [Window Management](chunks/window-management.md)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler](ollama-llm-provider-for-pseudo-code-transpiler.md)
- [Promethean Agent Config DSL](promethean-agent-config-dsl.md)
- [Matplotlib Animation with Async Execution](matplotlib-animation-with-async-execution.md)
- [Factorio AI with External Agents](factorio-ai-with-external-agents.md)
- [field-dynamics-math-blocks](field-dynamics-math-blocks.md)
- [AI-First-OS-Model-Context-Protocol](ai-first-os-model-context-protocol.md)
- [obsidian-ignore-node-modules-regex](obsidian-ignore-node-modules-regex.md)
- [polymorphic-meta-programming-engine](polymorphic-meta-programming-engine.md)
- [eidolon-node-lifecycle](eidolon-node-lifecycle.md)
- [field-interaction-equations](field-interaction-equations.md)
- [field-node-diagram-outline](field-node-diagram-outline.md)
- [markdown-to-org-transpiler](markdown-to-org-transpiler.md)
- [Per-Domain Policy System for JS Crawler](per-domain-policy-system-for-js-crawler.md)
- [EidolonField](eidolonfield.md)
- [Obsidian Templating Plugins Integration Guide](obsidian-templating-plugins-integration-guide.md)
- [ParticleSimulationWithCanvasAndFFmpeg](particlesimulationwithcanvasandffmpeg.md)
- [graph-ds](graph-ds.md)
- [promethean-system-diagrams](promethean-system-diagrams.md)
- [Duck's Attractor States](ducks-attractor-states.md)
- [Promethean Infrastructure Setup](promethean-infrastructure-setup.md)
- [Prompt_Folder_Bootstrap](prompt-folder-bootstrap.md)
- [Board Automation Improvements](board-automation-improvements.md)
- [heartbeat-simulation-snippets](heartbeat-simulation-snippets.md)
- [field-node-diagram-visualizations](field-node-diagram-visualizations.md)
- [field-node-diagram-set](field-node-diagram-set.md)
- [Promethean_Eidolon_Synchronicity_Model](promethean-eidolon-synchronicity-model.md)
- [Promethean Web UI Setup](promethean-web-ui-setup.md)
- [prompt-programming-language-lisp](prompt-programming-language-lisp.md)
- [Fnord Tracer Protocol](fnord-tracer-protocol.md)
- [Creative Moments](creative-moments.md)
- [Operations](chunks/operations.md)
- [Language-Agnostic Mirror System](language-agnostic-mirror-system.md)
- [Local-First Intention→Code Loop with Free Models](local-first-intention-code-loop-with-free-models.md)
- [Lisp-Compiler-Integration](lisp-compiler-integration.md)
- [Lispy Macros with syntax-rules](lispy-macros-with-syntax-rules.md)
- [layer-1-uptime-diagrams](layer-1-uptime-diagrams.md)
- [lisp-dsl-for-window-management](lisp-dsl-for-window-management.md)
- [i3-config-validation-methods](i3-config-validation-methods.md)
- [Local-Only-LLM-Workflow](local-only-llm-workflow.md)
- [i3-bluetooth-setup](i3-bluetooth-setup.md)
- [ripple-propagation-demo](ripple-propagation-demo.md)
- [Shared Package Structure](shared-package-structure.md)
- [Local-Offline-Model-Deployment-Strategy](local-offline-model-deployment-strategy.md)
- [Promethean Workflow Optimization](promethean-workflow-optimization.md)
- [Prometheus Observability Stack](prometheus-observability-stack.md)
- [Protocol_0_The_Contradiction_Engine](protocol-0-the-contradiction-engine.md)
- [Provider-Agnostic Chat Panel Implementation](provider-agnostic-chat-panel-implementation.md)
- [Pure-Node Crawl Stack with Playwright and Crawlee](pure-node-crawl-stack-with-playwright-and-crawlee.md)
- [Pure TypeScript Search Microservice](pure-typescript-search-microservice.md)
- [Functional Embedding Pipeline Refactor](functional-embedding-pipeline-refactor.md)
- [set-assignment-in-lisp-ast](set-assignment-in-lisp-ast.md)
- [RAG UI Panel with Qdrant and PostgREST](rag-ui-panel-with-qdrant-and-postgrest.md)
- [Redirecting Standard Error](redirecting-standard-error.md)
- [Chroma-Embedding-Refactor](chroma-embedding-refactor.md)
- [Interop and Source Maps](interop-and-source-maps.md)
- [homeostasis-decay-formulas](homeostasis-decay-formulas.md)
- [komorebi-group-window-hack](komorebi-group-window-hack.md)
- [Recursive Prompt Construction Engine](recursive-prompt-construction-engine.md)
- [Self-Agency in AI Interaction](self-agency-in-ai-interaction.md)
- [shared-package-layout-clarification](shared-package-layout-clarification.md)
- [sibilant-macro-targets](sibilant-macro-targets.md)
- [DuckDuckGoSearchPipeline](duckduckgosearchpipeline.md)
- [universal-intention-code-fabric](universal-intention-code-fabric.md)
- [System Scheduler with Resource-Aware DAG](system-scheduler-with-resource-aware-dag.md)
- [refactor-relations](refactor-relations.md)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop](polyglot-s-expr-bridge-python-js-lisp-interop.md)
- [Promethean Agent DSL TS Scaffold](promethean-agent-dsl-ts-scaffold.md)
- [plan-update-confirmation](plan-update-confirmation.md)
- [Synchronicity Waves and Web](synchronicity-waves-and-web.md)
- [zero-copy-snapshots-and-workers](zero-copy-snapshots-and-workers.md)
- [Performance-Optimized-Polyglot-Bridge](performance-optimized-polyglot-bridge.md)
- [Promethean State Format](promethean-state-format.md)
- [Voice Access Layer Design](voice-access-layer-design.md)
- [Model Upgrade Calm-Down Guide](model-upgrade-calm-down-guide.md)
- [TypeScript Patch for Tool Calling Support](typescript-patch-for-tool-calling-support.md)
- [Universal Lisp Interface](universal-lisp-interface.md)
- [Promethean-Copilot-Intent-Engine](promethean-copilot-intent-engine.md)
- [Promethean Pipelines](promethean-pipelines.md)
- [windows-tiling-with-autohotkey](windows-tiling-with-autohotkey.md)
- [Ice Box Reorganization](ice-box-reorganization.md)
- [Smoke Resonance Visualizations](smoke-resonance-visualizations.md)
## Sources
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
- [schema-evolution-workflow — L3](schema-evolution-workflow.md#^ref-d8059b6a-3-0) (line 3, col 0, score 0.67)
- [Mongo Outbox Implementation — L3](mongo-outbox-implementation.md#^ref-9c1acd1e-3-0) (line 3, col 0, score 0.68)
- [State Snapshots API and Transactional Projector — L3](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-3-0) (line 3, col 0, score 0.62)
- [prom-lib-rate-limiters-and-replay-api — L378](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-378-0) (line 378, col 0, score 0.75)
- [prom-lib-rate-limiters-and-replay-api — L1](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-1-0) (line 1, col 0, score 0.69)
- [schema-evolution-workflow — L239](schema-evolution-workflow.md#^ref-d8059b6a-239-0) (line 239, col 0, score 0.85)
- [Migrate to Provider-Tenant Architecture — L105](migrate-to-provider-tenant-architecture.md#^ref-54382370-105-0) (line 105, col 0, score 0.72)
- [WebSocket Gateway Implementation — L1](websocket-gateway-implementation.md#^ref-e811123d-1-0) (line 1, col 0, score 0.67)
- [Services — L5](chunks/services.md#^ref-75ea4a6a-5-0) (line 5, col 0, score 0.66)
- [Unique Info Dump Index — L39](unique-info-dump-index.md#^ref-30ec3ba6-39-0) (line 39, col 0, score 0.66)
- [Services — L12](chunks/services.md#^ref-75ea4a6a-12-0) (line 12, col 0, score 0.65)
- [Promethean Event Bus MVP v0.1 — L497](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-497-0) (line 497, col 0, score 0.71)
- [Promethean Event Bus MVP v0.1 — L126](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-126-0) (line 126, col 0, score 0.79)
- [Language-Agnostic Mirror System — L52](language-agnostic-mirror-system.md#^ref-d2b3628c-52-0) (line 52, col 0, score 0.65)
- [Language-Agnostic Mirror System — L109](language-agnostic-mirror-system.md#^ref-d2b3628c-109-0) (line 109, col 0, score 0.65)
- [Language-Agnostic Mirror System — L151](language-agnostic-mirror-system.md#^ref-d2b3628c-151-0) (line 151, col 0, score 0.64)
- [Local-First Intention→Code Loop with Free Models — L23](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-23-0) (line 23, col 0, score 0.64)
- [Pure TypeScript Search Microservice — L306](pure-typescript-search-microservice.md#^ref-d17d3a96-306-0) (line 306, col 0, score 0.63)
- [ecs-offload-workers — L306](ecs-offload-workers.md#^ref-6498b9d7-306-0) (line 306, col 0, score 0.63)
- [Functional Embedding Pipeline Refactor — L31](functional-embedding-pipeline-refactor.md#^ref-a4a25141-31-0) (line 31, col 0, score 0.63)
- [Promethean Event Bus MVP v0.1 — L13](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-13-0) (line 13, col 0, score 0.66)
- [balanced-bst — L3](balanced-bst.md#^ref-d3e7db72-3-0) (line 3, col 0, score 0.61)
- [Performance-Optimized-Polyglot-Bridge — L170](performance-optimized-polyglot-bridge.md#^ref-f5579967-170-0) (line 170, col 0, score 0.69)
- [compiler-kit-foundations — L574](compiler-kit-foundations.md#^ref-01b21543-574-0) (line 574, col 0, score 0.62)
- [schema-evolution-workflow — L9](schema-evolution-workflow.md#^ref-d8059b6a-9-0) (line 9, col 0, score 0.72)
- [Event Bus MVP — L99](event-bus-mvp.md#^ref-534fe91d-99-0) (line 99, col 0, score 0.76)
- [Promethean Event Bus MVP v0.1 — L510](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-510-0) (line 510, col 0, score 0.68)
- [schema-evolution-workflow — L161](schema-evolution-workflow.md#^ref-d8059b6a-161-0) (line 161, col 0, score 0.76)
- [Mongo Outbox Implementation — L381](mongo-outbox-implementation.md#^ref-9c1acd1e-381-0) (line 381, col 0, score 0.72)
- [graph-ds — L5](graph-ds.md#^ref-6620e2f2-5-0) (line 5, col 0, score 0.63)
- [set-assignment-in-lisp-ast — L114](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-114-0) (line 114, col 0, score 0.66)
- [Promethean Event Bus MVP v0.1 — L423](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-423-0) (line 423, col 0, score 0.65)
- [WebSocket Gateway Implementation — L473](websocket-gateway-implementation.md#^ref-e811123d-473-0) (line 473, col 0, score 0.71)
- [Promethean Event Bus MVP v0.1 — L108](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-108-0) (line 108, col 0, score 0.65)
- [ecs-offload-workers — L169](ecs-offload-workers.md#^ref-6498b9d7-169-0) (line 169, col 0, score 0.65)
- [Event Bus MVP — L7](event-bus-mvp.md#^ref-534fe91d-7-0) (line 7, col 0, score 0.69)
- [WebSocket Gateway Implementation — L322](websocket-gateway-implementation.md#^ref-e811123d-322-0) (line 322, col 0, score 0.66)
- [compiler-kit-foundations — L166](compiler-kit-foundations.md#^ref-01b21543-166-0) (line 166, col 0, score 0.65)
- [Language-Agnostic Mirror System — L336](language-agnostic-mirror-system.md#^ref-d2b3628c-336-0) (line 336, col 0, score 0.65)
- [ecs-scheduler-and-prefabs — L7](ecs-scheduler-and-prefabs.md#^ref-c62a1815-7-0) (line 7, col 0, score 0.71)
- [System Scheduler with Resource-Aware DAG — L5](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-5-0) (line 5, col 0, score 0.71)
- [refactor-relations — L10](refactor-relations.md#^ref-41ce0216-10-0) (line 10, col 0, score 0.72)
- [Lisp-Compiler-Integration — L188](lisp-compiler-integration.md#^ref-cfee6d36-188-0) (line 188, col 0, score 0.66)
- [compiler-kit-foundations — L50](compiler-kit-foundations.md#^ref-01b21543-50-0) (line 50, col 0, score 0.63)
- [Diagrams — L13](chunks/diagrams.md#^ref-45cd25b5-13-0) (line 13, col 0, score 1)
- [DSL — L15](chunks/dsl.md#^ref-e87bc036-15-0) (line 15, col 0, score 1)
- [JavaScript — L18](chunks/javascript.md#^ref-c1618c66-18-0) (line 18, col 0, score 1)
- [Math Fundamentals — L14](chunks/math-fundamentals.md#^ref-c6e87433-14-0) (line 14, col 0, score 1)
- [Services — L14](chunks/services.md#^ref-75ea4a6a-14-0) (line 14, col 0, score 1)
- [Shared — L7](chunks/shared.md#^ref-623a55f7-7-0) (line 7, col 0, score 1)
- [Simulation Demo — L10](chunks/simulation-demo.md#^ref-557309a3-10-0) (line 10, col 0, score 1)
- [Tooling — L9](chunks/tooling.md#^ref-6cb4943e-9-0) (line 9, col 0, score 1)
- [Window Management — L15](chunks/window-management.md#^ref-9e8ae388-15-0) (line 15, col 0, score 1)
- [Promethean Event Bus MVP v0.1 — L233](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-233-0) (line 233, col 0, score 0.66)
- [Migrate to Provider-Tenant Architecture — L85](migrate-to-provider-tenant-architecture.md#^ref-54382370-85-0) (line 85, col 0, score 0.65)
- [Migrate to Provider-Tenant Architecture — L22](migrate-to-provider-tenant-architecture.md#^ref-54382370-22-0) (line 22, col 0, score 0.59)
- [ecs-offload-workers — L207](ecs-offload-workers.md#^ref-6498b9d7-207-0) (line 207, col 0, score 0.58)
- [prom-lib-rate-limiters-and-replay-api — L375](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-375-0) (line 375, col 0, score 0.69)
- [Promethean Event Bus MVP v0.1 — L365](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-365-0) (line 365, col 0, score 0.57)
- [Event Bus MVP — L551](event-bus-mvp.md#^ref-534fe91d-551-0) (line 551, col 0, score 0.65)
- [Mongo Outbox Implementation — L557](mongo-outbox-implementation.md#^ref-9c1acd1e-557-0) (line 557, col 0, score 0.65)
- [prom-lib-rate-limiters-and-replay-api — L386](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-386-0) (line 386, col 0, score 0.65)
- [Promethean Event Bus MVP v0.1 — L890](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-890-0) (line 890, col 0, score 0.65)
- [Promethean-native config design — L389](promethean-native-config-design.md#^ref-ab748541-389-0) (line 389, col 0, score 0.65)
- [schema-evolution-workflow — L482](schema-evolution-workflow.md#^ref-d8059b6a-482-0) (line 482, col 0, score 0.65)
- [State Snapshots API and Transactional Projector — L338](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-338-0) (line 338, col 0, score 0.65)
- [prom-lib-rate-limiters-and-replay-api — L226](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-226-0) (line 226, col 0, score 0.64)
- [schema-evolution-workflow — L98](schema-evolution-workflow.md#^ref-d8059b6a-98-0) (line 98, col 0, score 0.68)
- [prom-lib-rate-limiters-and-replay-api — L282](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-282-0) (line 282, col 0, score 0.75)
- [Event Bus MVP — L258](event-bus-mvp.md#^ref-534fe91d-258-0) (line 258, col 0, score 0.71)
- [Event Bus MVP — L284](event-bus-mvp.md#^ref-534fe91d-284-0) (line 284, col 0, score 0.81)
- [Promethean Event Bus MVP v0.1 — L604](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-604-0) (line 604, col 0, score 0.66)
- [WebSocket Gateway Implementation — L56](websocket-gateway-implementation.md#^ref-e811123d-56-0) (line 56, col 0, score 0.7)
- [Mongo Outbox Implementation — L37](mongo-outbox-implementation.md#^ref-9c1acd1e-37-0) (line 37, col 0, score 0.75)
- [State Snapshots API and Transactional Projector — L93](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-93-0) (line 93, col 0, score 0.67)
- [WebSocket Gateway Implementation — L533](websocket-gateway-implementation.md#^ref-e811123d-533-0) (line 533, col 0, score 0.74)
- [Promethean Event Bus MVP v0.1 — L572](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-572-0) (line 572, col 0, score 0.75)
- [WebSocket Gateway Implementation — L9](websocket-gateway-implementation.md#^ref-e811123d-9-0) (line 9, col 0, score 0.69)
- [Promethean Event Bus MVP v0.1 — L28](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-28-0) (line 28, col 0, score 0.69)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L7](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-7-0) (line 7, col 0, score 0.73)
- [State Snapshots API and Transactional Projector — L9](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-9-0) (line 9, col 0, score 0.74)
- [Promethean Event Bus MVP v0.1 — L235](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-235-0) (line 235, col 0, score 0.67)
- [Promethean Event Bus MVP v0.1 — L9](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-9-0) (line 9, col 0, score 0.67)
- [Agent Tasks: Persistence Migration to DualStore — L84](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-84-0) (line 84, col 0, score 0.64)
- [Chroma Toolkit Consolidation Plan — L122](chroma-toolkit-consolidation-plan.md#^ref-5020e892-122-0) (line 122, col 0, score 0.67)
- [Agent Tasks: Persistence Migration to DualStore — L26](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-26-0) (line 26, col 0, score 0.58)
- [Promethean State Format — L26](promethean-state-format.md#^ref-23df6ddb-26-0) (line 26, col 0, score 0.67)
- [promethean-system-diagrams — L179](promethean-system-diagrams.md#^ref-b51e19b4-179-0) (line 179, col 0, score 0.67)
- [schema-evolution-workflow — L71](schema-evolution-workflow.md#^ref-d8059b6a-71-0) (line 71, col 0, score 0.92)
- [prom-lib-rate-limiters-and-replay-api — L260](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-260-0) (line 260, col 0, score 0.72)
- [schema-evolution-workflow — L201](schema-evolution-workflow.md#^ref-d8059b6a-201-0) (line 201, col 0, score 0.73)
- [WebSocket Gateway Implementation — L333](websocket-gateway-implementation.md#^ref-e811123d-333-0) (line 333, col 0, score 0.77)
- [prom-lib-rate-limiters-and-replay-api — L90](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-90-0) (line 90, col 0, score 0.77)
- [schema-evolution-workflow — L130](schema-evolution-workflow.md#^ref-d8059b6a-130-0) (line 130, col 0, score 0.77)
- [schema-evolution-workflow — L222](schema-evolution-workflow.md#^ref-d8059b6a-222-0) (line 222, col 0, score 0.77)
- [State Snapshots API and Transactional Projector — L233](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-233-0) (line 233, col 0, score 0.77)
- [Mongo Outbox Implementation — L305](mongo-outbox-implementation.md#^ref-9c1acd1e-305-0) (line 305, col 0, score 0.7)
- [Dynamic Context Model for Web Components — L376](dynamic-context-model-for-web-components.md#^ref-f7702bf8-376-0) (line 376, col 0, score 0.7)
- [Synchronicity Waves and Web — L11](synchronicity-waves-and-web.md#^ref-91295f3a-11-0) (line 11, col 0, score 0.69)
- [Event Bus Projections Architecture — L3](event-bus-projections-architecture.md#^ref-cf6b9b17-3-0) (line 3, col 0, score 0.71)
- [windows-tiling-with-autohotkey — L78](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-78-0) (line 78, col 0, score 0.63)
- [2d-sandbox-field — L212](2d-sandbox-field.md#^ref-c710dc93-212-0) (line 212, col 0, score 0.61)
- [AI-Centric OS with MCP Layer — L434](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-434-0) (line 434, col 0, score 0.61)
- [Chroma Toolkit Consolidation Plan — L207](chroma-toolkit-consolidation-plan.md#^ref-5020e892-207-0) (line 207, col 0, score 0.61)
- [Promethean Event Bus MVP v0.1 — L832](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-832-0) (line 832, col 0, score 0.71)
- [archetype-ecs — L423](archetype-ecs.md#^ref-8f4c1e86-423-0) (line 423, col 0, score 0.71)
- [Language-Agnostic Mirror System — L11](language-agnostic-mirror-system.md#^ref-d2b3628c-11-0) (line 11, col 0, score 0.7)
- [Event Bus Projections Architecture — L54](event-bus-projections-architecture.md#^ref-cf6b9b17-54-0) (line 54, col 0, score 0.69)
- [Duck's Attractor States — L5](ducks-attractor-states.md#^ref-13951643-5-0) (line 5, col 0, score 0.69)
- [State Snapshots API and Transactional Projector — L235](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-235-0) (line 235, col 0, score 0.68)
- [schema-evolution-workflow — L132](schema-evolution-workflow.md#^ref-d8059b6a-132-0) (line 132, col 0, score 0.68)
- [RAG UI Panel with Qdrant and PostgREST — L336](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-336-0) (line 336, col 0, score 0.66)
- [ecs-scheduler-and-prefabs — L352](ecs-scheduler-and-prefabs.md#^ref-c62a1815-352-0) (line 352, col 0, score 0.66)
- [System Scheduler with Resource-Aware DAG — L350](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-350-0) (line 350, col 0, score 0.66)
- [prom-lib-rate-limiters-and-replay-api — L92](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-92-0) (line 92, col 0, score 0.66)
- [Promethean Infrastructure Setup — L501](promethean-infrastructure-setup.md#^ref-6deed6ac-501-0) (line 501, col 0, score 0.66)
- [Redirecting Standard Error — L7](redirecting-standard-error.md#^ref-b3555ede-7-0) (line 7, col 0, score 0.65)
- [Mongo Outbox Implementation — L307](mongo-outbox-implementation.md#^ref-9c1acd1e-307-0) (line 307, col 0, score 0.65)
- [compiler-kit-foundations — L15](compiler-kit-foundations.md#^ref-01b21543-15-0) (line 15, col 0, score 0.65)
- [Promethean Pipelines — L58](promethean-pipelines.md#^ref-8b8e6103-58-0) (line 58, col 0, score 0.65)
- [schema-evolution-workflow — L29](schema-evolution-workflow.md#^ref-d8059b6a-29-0) (line 29, col 0, score 0.67)
- [Promethean Event Bus MVP v0.1 — L373](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-373-0) (line 373, col 0, score 0.71)
- [prom-lib-rate-limiters-and-replay-api — L377](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-377-0) (line 377, col 0, score 0.64)
- [schema-evolution-workflow — L313](schema-evolution-workflow.md#^ref-d8059b6a-313-0) (line 313, col 0, score 0.64)
- [Promethean-native config design — L103](promethean-native-config-design.md#^ref-ab748541-103-0) (line 103, col 0, score 0.78)
- [Promethean Agent DSL TS Scaffold — L684](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-684-0) (line 684, col 0, score 0.71)
- [Promethean Event Bus MVP v0.1 — L380](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-380-0) (line 380, col 0, score 0.73)
- [Promethean Event Bus MVP v0.1 — L474](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-474-0) (line 474, col 0, score 0.74)
- [schema-evolution-workflow — L146](schema-evolution-workflow.md#^ref-d8059b6a-146-0) (line 146, col 0, score 0.69)
- [zero-copy-snapshots-and-workers — L70](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-70-0) (line 70, col 0, score 0.69)
- [prom-lib-rate-limiters-and-replay-api — L65](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-65-0) (line 65, col 0, score 0.71)
- [Promethean Agent Config DSL — L11](promethean-agent-config-dsl.md#^ref-2c00ce45-11-0) (line 11, col 0, score 0.7)
- [Lispy Macros with syntax-rules — L9](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-9-0) (line 9, col 0, score 0.64)
- [schema-evolution-workflow — L463](schema-evolution-workflow.md#^ref-d8059b6a-463-0) (line 463, col 0, score 0.7)
- [schema-evolution-workflow — L311](schema-evolution-workflow.md#^ref-d8059b6a-311-0) (line 311, col 0, score 0.72)
- [Promethean Agent DSL TS Scaffold — L575](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-575-0) (line 575, col 0, score 0.69)
- [universal-intention-code-fabric — L26](universal-intention-code-fabric.md#^ref-c14edce7-26-0) (line 26, col 0, score 0.65)
- [compiler-kit-foundations — L359](compiler-kit-foundations.md#^ref-01b21543-359-0) (line 359, col 0, score 0.63)
- [Performance-Optimized-Polyglot-Bridge — L22](performance-optimized-polyglot-bridge.md#^ref-f5579967-22-0) (line 22, col 0, score 0.63)
- [universal-intention-code-fabric — L68](universal-intention-code-fabric.md#^ref-c14edce7-68-0) (line 68, col 0, score 0.74)
- [Mongo Outbox Implementation — L187](mongo-outbox-implementation.md#^ref-9c1acd1e-187-0) (line 187, col 0, score 0.72)
- [WebSocket Gateway Implementation — L447](websocket-gateway-implementation.md#^ref-e811123d-447-0) (line 447, col 0, score 0.73)
- [Event Bus MVP — L370](event-bus-mvp.md#^ref-534fe91d-370-0) (line 370, col 0, score 0.7)
- [prom-lib-rate-limiters-and-replay-api — L63](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-63-0) (line 63, col 0, score 0.7)
- [Promethean Event Bus MVP v0.1 — L141](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-141-0) (line 141, col 0, score 0.69)
- [Promethean Event Bus MVP v0.1 — L861](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-861-0) (line 861, col 0, score 0.63)
- [Promethean Event Bus MVP v0.1 — L220](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-220-0) (line 220, col 0, score 0.63)
- [Promethean Pipelines — L16](promethean-pipelines.md#^ref-8b8e6103-16-0) (line 16, col 0, score 0.62)
- [Promethean Event Bus MVP v0.1 — L348](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-348-0) (line 348, col 0, score 0.62)
- [Event Bus MVP — L434](event-bus-mvp.md#^ref-534fe91d-434-0) (line 434, col 0, score 0.78)
- [schema-evolution-workflow — L224](schema-evolution-workflow.md#^ref-d8059b6a-224-0) (line 224, col 0, score 0.78)
- [Promethean Event Bus MVP v0.1 — L197](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-197-0) (line 197, col 0, score 0.77)
- [State Snapshots API and Transactional Projector — L162](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-162-0) (line 162, col 0, score 0.73)
- [WebSocket Gateway Implementation — L296](websocket-gateway-implementation.md#^ref-e811123d-296-0) (line 296, col 0, score 0.72)
- [Event Bus Projections Architecture — L108](event-bus-projections-architecture.md#^ref-cf6b9b17-108-0) (line 108, col 0, score 0.71)
- [schema-evolution-workflow — L450](schema-evolution-workflow.md#^ref-d8059b6a-450-0) (line 450, col 0, score 0.78)
- [Mongo Outbox Implementation — L148](mongo-outbox-implementation.md#^ref-9c1acd1e-148-0) (line 148, col 0, score 0.63)
- [layer-1-uptime-diagrams — L122](layer-1-uptime-diagrams.md#^ref-4127189a-122-0) (line 122, col 0, score 0.69)
- [Fnord Tracer Protocol — L214](fnord-tracer-protocol.md#^ref-fc21f824-214-0) (line 214, col 0, score 0.68)
- [Event Bus MVP — L359](event-bus-mvp.md#^ref-534fe91d-359-0) (line 359, col 0, score 0.67)
- [Chroma Toolkit Consolidation Plan — L66](chroma-toolkit-consolidation-plan.md#^ref-5020e892-66-0) (line 66, col 0, score 0.69)
- [Chroma Toolkit Consolidation Plan — L107](chroma-toolkit-consolidation-plan.md#^ref-5020e892-107-0) (line 107, col 0, score 0.7)
- [WebSocket Gateway Implementation — L625](websocket-gateway-implementation.md#^ref-e811123d-625-0) (line 625, col 0, score 0.7)
- [schema-evolution-workflow — L476](schema-evolution-workflow.md#^ref-d8059b6a-476-0) (line 476, col 0, score 0.68)
- [Chroma Toolkit Consolidation Plan — L148](chroma-toolkit-consolidation-plan.md#^ref-5020e892-148-0) (line 148, col 0, score 0.73)
- [WebSocket Gateway Implementation — L616](websocket-gateway-implementation.md#^ref-e811123d-616-0) (line 616, col 0, score 0.69)
- [Chroma Toolkit Consolidation Plan — L159](chroma-toolkit-consolidation-plan.md#^ref-5020e892-159-0) (line 159, col 0, score 0.77)
- [Chroma Toolkit Consolidation Plan — L137](chroma-toolkit-consolidation-plan.md#^ref-5020e892-137-0) (line 137, col 0, score 0.72)
- [api-gateway-versioning — L278](api-gateway-versioning.md#^ref-0580dcd3-278-0) (line 278, col 0, score 0.76)
- [plan-update-confirmation — L890](plan-update-confirmation.md#^ref-b22d79c6-890-0) (line 890, col 0, score 0.7)
- [WebSocket Gateway Implementation — L443](websocket-gateway-implementation.md#^ref-e811123d-443-0) (line 443, col 0, score 0.69)
- [plan-update-confirmation — L982](plan-update-confirmation.md#^ref-b22d79c6-982-0) (line 982, col 0, score 0.65)
- [plan-update-confirmation — L874](plan-update-confirmation.md#^ref-b22d79c6-874-0) (line 874, col 0, score 0.64)
- [balanced-bst — L290](balanced-bst.md#^ref-d3e7db72-290-0) (line 290, col 0, score 0.62)
- [lisp-dsl-for-window-management — L6](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-6-0) (line 6, col 0, score 0.62)
- [plan-update-confirmation — L978](plan-update-confirmation.md#^ref-b22d79c6-978-0) (line 978, col 0, score 0.62)
- [lisp-dsl-for-window-management — L87](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-87-0) (line 87, col 0, score 0.62)
- [windows-tiling-with-autohotkey — L19](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-19-0) (line 19, col 0, score 0.61)
- [Voice Access Layer Design — L91](voice-access-layer-design.md#^ref-543ed9b3-91-0) (line 91, col 0, score 0.67)
- [Agent Tasks: Persistence Migration to DualStore — L103](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-103-0) (line 103, col 0, score 0.63)
- [Dynamic Context Model for Web Components — L272](dynamic-context-model-for-web-components.md#^ref-f7702bf8-272-0) (line 272, col 0, score 0.62)
- [Mongo Outbox Implementation — L379](mongo-outbox-implementation.md#^ref-9c1acd1e-379-0) (line 379, col 0, score 0.66)
- [TypeScript Patch for Tool Calling Support — L67](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-67-0) (line 67, col 0, score 0.66)
- [Matplotlib Animation with Async Execution — L13](matplotlib-animation-with-async-execution.md#^ref-687439f9-13-0) (line 13, col 0, score 0.61)
- [WebSocket Gateway Implementation — L219](websocket-gateway-implementation.md#^ref-e811123d-219-0) (line 219, col 0, score 0.61)
- [Chroma Toolkit Consolidation Plan — L162](chroma-toolkit-consolidation-plan.md#^ref-5020e892-162-0) (line 162, col 0, score 0.6)
- [Factorio AI with External Agents — L24](factorio-ai-with-external-agents.md#^ref-a4d90289-24-0) (line 24, col 0, score 0.6)
- [Chroma-Embedding-Refactor — L64](chroma-embedding-refactor.md#^ref-8b256935-64-0) (line 64, col 0, score 0.68)
- [Agent Tasks: Persistence Migration to DualStore — L92](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-92-0) (line 92, col 0, score 0.63)
- [Model Upgrade Calm-Down Guide — L48](model-upgrade-calm-down-guide.md#^ref-db74343f-48-0) (line 48, col 0, score 0.67)
- [Ice Box Reorganization — L33](ice-box-reorganization.md#^ref-291c7d91-33-0) (line 33, col 0, score 0.6)
- [Chroma Toolkit Consolidation Plan — L88](chroma-toolkit-consolidation-plan.md#^ref-5020e892-88-0) (line 88, col 0, score 0.59)
- [Chroma Toolkit Consolidation Plan — L96](chroma-toolkit-consolidation-plan.md#^ref-5020e892-96-0) (line 96, col 0, score 0.59)
- [api-gateway-versioning — L280](api-gateway-versioning.md#^ref-0580dcd3-280-0) (line 280, col 0, score 0.58)
- [graph-ds — L361](graph-ds.md#^ref-6620e2f2-361-0) (line 361, col 0, score 0.58)
- [Agent Tasks: Persistence Migration to DualStore — L18](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-18-0) (line 18, col 0, score 0.58)
- [AI-Centric OS with MCP Layer — L420](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-420-0) (line 420, col 0, score 1)
- [Promethean Event Bus MVP v0.1 — L147](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-147-0) (line 147, col 0, score 0.69)
- [Promethean Event Bus MVP v0.1 — L17](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-17-0) (line 17, col 0, score 0.66)
- [archetype-ecs — L417](archetype-ecs.md#^ref-8f4c1e86-417-0) (line 417, col 0, score 0.65)
- [prom-lib-rate-limiters-and-replay-api — L71](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-71-0) (line 71, col 0, score 0.64)
- [ecs-offload-workers — L435](ecs-offload-workers.md#^ref-6498b9d7-435-0) (line 435, col 0, score 0.64)
- [Mongo Outbox Implementation — L284](mongo-outbox-implementation.md#^ref-9c1acd1e-284-0) (line 284, col 0, score 0.63)
- [WebSocket Gateway Implementation — L614](websocket-gateway-implementation.md#^ref-e811123d-614-0) (line 614, col 0, score 0.63)
- [schema-evolution-workflow — L243](schema-evolution-workflow.md#^ref-d8059b6a-243-0) (line 243, col 0, score 0.73)
- [State Snapshots API and Transactional Projector — L179](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-179-0) (line 179, col 0, score 0.73)
- [Mongo Outbox Implementation — L323](mongo-outbox-implementation.md#^ref-9c1acd1e-323-0) (line 323, col 0, score 0.74)
- [schema-evolution-workflow — L289](schema-evolution-workflow.md#^ref-d8059b6a-289-0) (line 289, col 0, score 0.67)
- [schema-evolution-workflow — L393](schema-evolution-workflow.md#^ref-d8059b6a-393-0) (line 393, col 0, score 0.67)
- [Mongo Outbox Implementation — L74](mongo-outbox-implementation.md#^ref-9c1acd1e-74-0) (line 74, col 0, score 0.77)
- [Promethean Event Bus MVP v0.1 — L747](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-747-0) (line 747, col 0, score 0.75)
- [prom-lib-rate-limiters-and-replay-api — L194](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-194-0) (line 194, col 0, score 0.74)
- [Mongo Outbox Implementation — L451](mongo-outbox-implementation.md#^ref-9c1acd1e-451-0) (line 451, col 0, score 0.8)
- [State Snapshots API and Transactional Projector — L132](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-132-0) (line 132, col 0, score 0.67)
- [RAG UI Panel with Qdrant and PostgREST — L172](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-172-0) (line 172, col 0, score 0.72)
- [Pure TypeScript Search Microservice — L378](pure-typescript-search-microservice.md#^ref-d17d3a96-378-0) (line 378, col 0, score 0.72)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L194](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-194-0) (line 194, col 0, score 0.66)
- [State Snapshots API and Transactional Projector — L218](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-218-0) (line 218, col 0, score 0.73)
- [WebSocket Gateway Implementation — L560](websocket-gateway-implementation.md#^ref-e811123d-560-0) (line 560, col 0, score 0.78)
- [State Snapshots API and Transactional Projector — L248](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-248-0) (line 248, col 0, score 0.74)
- [Promethean Event Bus MVP v0.1 — L395](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-395-0) (line 395, col 0, score 0.66)
- [Event Bus Projections Architecture — L5](event-bus-projections-architecture.md#^ref-cf6b9b17-5-0) (line 5, col 0, score 0.66)
- [schema-evolution-workflow — L123](schema-evolution-workflow.md#^ref-d8059b6a-123-0) (line 123, col 0, score 0.66)
- [Event Bus MVP — L509](event-bus-mvp.md#^ref-534fe91d-509-0) (line 509, col 0, score 0.8)
- [State Snapshots API and Transactional Projector — L303](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-303-0) (line 303, col 0, score 0.77)
- [graph-ds — L343](graph-ds.md#^ref-6620e2f2-343-0) (line 343, col 0, score 0.75)
- [WebSocket Gateway Implementation — L595](websocket-gateway-implementation.md#^ref-e811123d-595-0) (line 595, col 0, score 0.75)
- [archetype-ecs — L441](archetype-ecs.md#^ref-8f4c1e86-441-0) (line 441, col 0, score 0.74)
- [ecs-scheduler-and-prefabs — L368](ecs-scheduler-and-prefabs.md#^ref-c62a1815-368-0) (line 368, col 0, score 0.72)
- [System Scheduler with Resource-Aware DAG — L366](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-366-0) (line 366, col 0, score 0.72)
- [Mongo Outbox Implementation — L516](mongo-outbox-implementation.md#^ref-9c1acd1e-516-0) (line 516, col 0, score 0.69)
- [Cross-Language Runtime Polymorphism — L121](cross-language-runtime-polymorphism.md#^ref-c34c36a6-121-0) (line 121, col 0, score 0.67)
- [schema-evolution-workflow — L464](schema-evolution-workflow.md#^ref-d8059b6a-464-0) (line 464, col 0, score 0.71)
- [Promethean Event Bus MVP v0.1 — L222](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-222-0) (line 222, col 0, score 0.68)
- [WebSocket Gateway Implementation — L437](websocket-gateway-implementation.md#^ref-e811123d-437-0) (line 437, col 0, score 0.68)
- [universal-intention-code-fabric — L406](universal-intention-code-fabric.md#^ref-c14edce7-406-0) (line 406, col 0, score 0.68)
- [universal-intention-code-fabric — L27](universal-intention-code-fabric.md#^ref-c14edce7-27-0) (line 27, col 0, score 0.66)
- [schema-evolution-workflow — L465](schema-evolution-workflow.md#^ref-d8059b6a-465-0) (line 465, col 0, score 0.69)
- [Promethean Event Bus MVP v0.1 — L149](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-149-0) (line 149, col 0, score 0.64)
- [ecs-scheduler-and-prefabs — L338](ecs-scheduler-and-prefabs.md#^ref-c62a1815-338-0) (line 338, col 0, score 0.62)
- [Prompt_Folder_Bootstrap — L24](prompt-folder-bootstrap.md#^ref-bd4f0976-24-0) (line 24, col 0, score 0.62)
- [Prompt_Folder_Bootstrap — L42](prompt-folder-bootstrap.md#^ref-bd4f0976-42-0) (line 42, col 0, score 0.62)
- [Prompt_Folder_Bootstrap — L66](prompt-folder-bootstrap.md#^ref-bd4f0976-66-0) (line 66, col 0, score 0.62)
- [State Snapshots API and Transactional Projector — L177](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-177-0) (line 177, col 0, score 0.73)
- [WebSocket Gateway Implementation — L617](websocket-gateway-implementation.md#^ref-e811123d-617-0) (line 617, col 0, score 0.69)
- [Event Bus MVP — L365](event-bus-mvp.md#^ref-534fe91d-365-0) (line 365, col 0, score 0.69)
- [schema-evolution-workflow — L467](schema-evolution-workflow.md#^ref-d8059b6a-467-0) (line 467, col 0, score 0.73)
- [WebSocket Gateway Implementation — L318](websocket-gateway-implementation.md#^ref-e811123d-318-0) (line 318, col 0, score 0.67)
- [Agent Tasks: Persistence Migration to DualStore — L70](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-70-0) (line 70, col 0, score 0.67)
- [RAG UI Panel with Qdrant and PostgREST — L358](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-358-0) (line 358, col 0, score 0.67)
- [Mongo Outbox Implementation — L538](mongo-outbox-implementation.md#^ref-9c1acd1e-538-0) (line 538, col 0, score 0.66)
- [WebSocket Gateway Implementation — L376](websocket-gateway-implementation.md#^ref-e811123d-376-0) (line 376, col 0, score 0.78)
- [Chroma Toolkit Consolidation Plan — L146](chroma-toolkit-consolidation-plan.md#^ref-5020e892-146-0) (line 146, col 0, score 0.71)
- [prom-lib-rate-limiters-and-replay-api — L326](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-326-0) (line 326, col 0, score 0.71)
- [Promethean Event Bus MVP v0.1 — L102](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-102-0) (line 102, col 0, score 0.7)
- [Event Bus MVP — L383](event-bus-mvp.md#^ref-534fe91d-383-0) (line 383, col 0, score 0.68)
- [Promethean Event Bus MVP v0.1 — L340](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-340-0) (line 340, col 0, score 0.67)
- [api-gateway-versioning — L272](api-gateway-versioning.md#^ref-0580dcd3-272-0) (line 272, col 0, score 0.7)
- [Agent Tasks: Persistence Migration to DualStore — L55](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-55-0) (line 55, col 0, score 0.67)
- [Language-Agnostic Mirror System — L507](language-agnostic-mirror-system.md#^ref-d2b3628c-507-0) (line 507, col 0, score 0.66)
- [Universal Lisp Interface — L26](universal-lisp-interface.md#^ref-b01856b4-26-0) (line 26, col 0, score 0.65)
- [Promethean-Copilot-Intent-Engine — L18](promethean-copilot-intent-engine.md#^ref-ae24a280-18-0) (line 18, col 0, score 0.65)
- [Interop and Source Maps — L506](interop-and-source-maps.md#^ref-cdfac40c-506-0) (line 506, col 0, score 0.65)
- [Migrate to Provider-Tenant Architecture — L36](migrate-to-provider-tenant-architecture.md#^ref-54382370-36-0) (line 36, col 0, score 0.65)
- [schema-evolution-workflow — L469](schema-evolution-workflow.md#^ref-d8059b6a-469-0) (line 469, col 0, score 0.6)
- [RAG UI Panel with Qdrant and PostgREST — L329](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-329-0) (line 329, col 0, score 0.7)
- [Promethean Event Bus MVP v0.1 — L119](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-119-0) (line 119, col 0, score 0.62)
- [Promethean-native config design — L32](promethean-native-config-design.md#^ref-ab748541-32-0) (line 32, col 0, score 0.68)
- [Promethean-native config design — L33](promethean-native-config-design.md#^ref-ab748541-33-0) (line 33, col 0, score 0.68)
- [Promethean-native config design — L35](promethean-native-config-design.md#^ref-ab748541-35-0) (line 35, col 0, score 0.68)
- [prom-lib-rate-limiters-and-replay-api — L328](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-328-0) (line 328, col 0, score 0.61)
- [Chroma-Embedding-Refactor — L109](chroma-embedding-refactor.md#^ref-8b256935-109-0) (line 109, col 0, score 0.68)
- [schema-evolution-workflow — L473](schema-evolution-workflow.md#^ref-d8059b6a-473-0) (line 473, col 0, score 0.91)
- [State Snapshots API and Transactional Projector — L325](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-325-0) (line 325, col 0, score 0.81)
- [prom-lib-rate-limiters-and-replay-api — L373](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-373-0) (line 373, col 0, score 0.74)
- [Mongo Outbox Implementation — L542](mongo-outbox-implementation.md#^ref-9c1acd1e-542-0) (line 542, col 0, score 0.71)
- [WebSocket Gateway Implementation — L623](websocket-gateway-implementation.md#^ref-e811123d-623-0) (line 623, col 0, score 0.7)
- [aionian-circuit-math — L135](aionian-circuit-math.md#^ref-f2d83a77-135-0) (line 135, col 0, score 0.61)
- [field-dynamics-math-blocks — L123](field-dynamics-math-blocks.md#^ref-7cfc230d-123-0) (line 123, col 0, score 0.61)
- [Universal Lisp Interface — L19](universal-lisp-interface.md#^ref-b01856b4-19-0) (line 19, col 0, score 0.61)
- [Event Bus MVP — L530](event-bus-mvp.md#^ref-534fe91d-530-0) (line 530, col 0, score 0.6)
- [Model Upgrade Calm-Down Guide — L33](model-upgrade-calm-down-guide.md#^ref-db74343f-33-0) (line 33, col 0, score 0.59)
- [Smoke Resonance Visualizations — L74](smoke-resonance-visualizations.md#^ref-ac9d3ac5-74-0) (line 74, col 0, score 0.59)
- [AI-First-OS-Model-Context-Protocol — L1](ai-first-os-model-context-protocol.md#^ref-618198f4-1-0) (line 1, col 0, score 0.59)
- [windows-tiling-with-autohotkey — L104](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-104-0) (line 104, col 0, score 0.59)
- [Event Bus MVP — L543](event-bus-mvp.md#^ref-534fe91d-543-0) (line 543, col 0, score 0.59)
- [Services — L10](chunks/services.md#^ref-75ea4a6a-10-0) (line 10, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L209](cross-language-runtime-polymorphism.md#^ref-c34c36a6-209-0) (line 209, col 0, score 1)
- [ecs-offload-workers — L486](ecs-offload-workers.md#^ref-6498b9d7-486-0) (line 486, col 0, score 1)
- [Event Bus MVP — L548](event-bus-mvp.md#^ref-534fe91d-548-0) (line 548, col 0, score 1)
- [Mongo Outbox Implementation — L552](mongo-outbox-implementation.md#^ref-9c1acd1e-552-0) (line 552, col 0, score 1)
- [prom-lib-rate-limiters-and-replay-api — L382](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-382-0) (line 382, col 0, score 1)
- [Promethean Event Bus MVP v0.1 — L913](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-913-0) (line 913, col 0, score 1)
- [State Snapshots API and Transactional Projector — L333](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-333-0) (line 333, col 0, score 1)
- [Mongo Outbox Implementation — L545](mongo-outbox-implementation.md#^ref-9c1acd1e-545-0) (line 545, col 0, score 0.63)
- [Promethean Event Bus MVP v0.1 — L182](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-182-0) (line 182, col 0, score 0.62)
- [schema-evolution-workflow — L128](schema-evolution-workflow.md#^ref-d8059b6a-128-0) (line 128, col 0, score 0.6)
- [Promethean Event Bus MVP v0.1 — L188](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-188-0) (line 188, col 0, score 0.6)
- [State Snapshots API and Transactional Projector — L329](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-329-0) (line 329, col 0, score 0.6)
- [schema-evolution-workflow — L468](schema-evolution-workflow.md#^ref-d8059b6a-468-0) (line 468, col 0, score 0.74)
- [Promethean State Format — L28](promethean-state-format.md#^ref-23df6ddb-28-0) (line 28, col 0, score 0.68)
- [schema-evolution-workflow — L383](schema-evolution-workflow.md#^ref-d8059b6a-383-0) (line 383, col 0, score 0.68)
- [Mongo Outbox Implementation — L537](mongo-outbox-implementation.md#^ref-9c1acd1e-537-0) (line 537, col 0, score 0.68)
- [i3-config-validation-methods — L46](i3-config-validation-methods.md#^ref-d28090ac-46-0) (line 46, col 0, score 0.66)
- [schema-evolution-workflow — L381](schema-evolution-workflow.md#^ref-d8059b6a-381-0) (line 381, col 0, score 0.65)
- [Migrate to Provider-Tenant Architecture — L88](migrate-to-provider-tenant-architecture.md#^ref-54382370-88-0) (line 88, col 0, score 0.64)
- [aionian-circuit-math — L177](aionian-circuit-math.md#^ref-f2d83a77-177-0) (line 177, col 0, score 1)
- [Board Automation Improvements — L18](board-automation-improvements.md#^ref-ac60a1d6-18-0) (line 18, col 0, score 1)
- [Board Walk – 2025-08-11 — L140](board-walk-2025-08-11.md#^ref-7aa1eb92-140-0) (line 140, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L118](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-118-0) (line 118, col 0, score 1)
- [Diagrams — L47](chunks/diagrams.md#^ref-45cd25b5-47-0) (line 47, col 0, score 1)
- [JavaScript — L35](chunks/javascript.md#^ref-c1618c66-35-0) (line 35, col 0, score 1)
- [Math Fundamentals — L33](chunks/math-fundamentals.md#^ref-c6e87433-33-0) (line 33, col 0, score 1)
- [Services — L31](chunks/services.md#^ref-75ea4a6a-31-0) (line 31, col 0, score 1)
- [compiler-kit-foundations — L640](compiler-kit-foundations.md#^ref-01b21543-640-0) (line 640, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L145](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-145-0) (line 145, col 0, score 1)
- [Local-Only-LLM-Workflow — L212](local-only-llm-workflow.md#^ref-9a8ab57e-212-0) (line 212, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L291](migrate-to-provider-tenant-architecture.md#^ref-54382370-291-0) (line 291, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L155](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-155-0) (line 155, col 0, score 1)
- [Mongo Outbox Implementation — L550](mongo-outbox-implementation.md#^ref-9c1acd1e-550-0) (line 550, col 0, score 1)
- [observability-infrastructure-setup — L368](observability-infrastructure-setup.md#^ref-b4e64f8c-368-0) (line 368, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L72](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-72-0) (line 72, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L201](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-201-0) (line 201, col 0, score 1)
- [polymorphic-meta-programming-engine — L246](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-246-0) (line 246, col 0, score 1)
- [prom-lib-rate-limiters-and-replay-api — L384](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-384-0) (line 384, col 0, score 1)
- [Promethean Agent Config DSL — L329](promethean-agent-config-dsl.md#^ref-2c00ce45-329-0) (line 329, col 0, score 1)
- [Services — L9](chunks/services.md#^ref-75ea4a6a-9-0) (line 9, col 0, score 1)
- [ecs-scheduler-and-prefabs — L420](ecs-scheduler-and-prefabs.md#^ref-c62a1815-420-0) (line 420, col 0, score 1)
- [Event Bus MVP — L552](event-bus-mvp.md#^ref-534fe91d-552-0) (line 552, col 0, score 1)
- [heartbeat-fragment-demo — L123](heartbeat-fragment-demo.md#^ref-dd00677a-123-0) (line 123, col 0, score 1)
- [heartbeat-simulation-snippets — L115](heartbeat-simulation-snippets.md#^ref-23e221e9-115-0) (line 115, col 0, score 1)
- [Mongo Outbox Implementation — L551](mongo-outbox-implementation.md#^ref-9c1acd1e-551-0) (line 551, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L60](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-60-0) (line 60, col 0, score 1)
- [prom-lib-rate-limiters-and-replay-api — L380](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-380-0) (line 380, col 0, score 1)
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
- [field-node-diagram-visualizations — L89](field-node-diagram-visualizations.md#^ref-e9b27b06-89-0) (line 89, col 0, score 1)
- [graph-ds — L373](graph-ds.md#^ref-6620e2f2-373-0) (line 373, col 0, score 1)
- [heartbeat-fragment-demo — L99](heartbeat-fragment-demo.md#^ref-dd00677a-99-0) (line 99, col 0, score 1)
- [heartbeat-simulation-snippets — L86](heartbeat-simulation-snippets.md#^ref-23e221e9-86-0) (line 86, col 0, score 1)
- [homeostasis-decay-formulas — L154](homeostasis-decay-formulas.md#^ref-37b5d236-154-0) (line 154, col 0, score 1)
- [Interop and Source Maps — L518](interop-and-source-maps.md#^ref-cdfac40c-518-0) (line 518, col 0, score 1)
- [komorebi-group-window-hack — L205](komorebi-group-window-hack.md#^ref-dd89372d-205-0) (line 205, col 0, score 1)
- [layer-1-uptime-diagrams — L166](layer-1-uptime-diagrams.md#^ref-4127189a-166-0) (line 166, col 0, score 1)
- [Lisp-Compiler-Integration — L558](lisp-compiler-integration.md#^ref-cfee6d36-558-0) (line 558, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L134](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-134-0) (line 134, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L164](chroma-toolkit-consolidation-plan.md#^ref-5020e892-164-0) (line 164, col 0, score 1)
- [Services — L18](chunks/services.md#^ref-75ea4a6a-18-0) (line 18, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L230](cross-language-runtime-polymorphism.md#^ref-c34c36a6-230-0) (line 230, col 0, score 1)
- [ecs-offload-workers — L483](ecs-offload-workers.md#^ref-6498b9d7-483-0) (line 483, col 0, score 1)
- [eidolon-field-math-foundations — L148](eidolon-field-math-foundations.md#^ref-008f2ac0-148-0) (line 148, col 0, score 1)
- [Event Bus MVP — L549](event-bus-mvp.md#^ref-534fe91d-549-0) (line 549, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L282](migrate-to-provider-tenant-architecture.md#^ref-54382370-282-0) (line 282, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L152](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-152-0) (line 152, col 0, score 1)
- [api-gateway-versioning — L294](api-gateway-versioning.md#^ref-0580dcd3-294-0) (line 294, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L191](chroma-toolkit-consolidation-plan.md#^ref-5020e892-191-0) (line 191, col 0, score 1)
- [Services — L11](chunks/services.md#^ref-75ea4a6a-11-0) (line 11, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L228](cross-language-runtime-polymorphism.md#^ref-c34c36a6-228-0) (line 228, col 0, score 1)
- [ecs-offload-workers — L465](ecs-offload-workers.md#^ref-6498b9d7-465-0) (line 465, col 0, score 1)
- [Event Bus MVP — L547](event-bus-mvp.md#^ref-534fe91d-547-0) (line 547, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L312](migrate-to-provider-tenant-architecture.md#^ref-54382370-312-0) (line 312, col 0, score 1)
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
- [api-gateway-versioning — L299](api-gateway-versioning.md#^ref-0580dcd3-299-0) (line 299, col 0, score 1)
- [Board Walk – 2025-08-11 — L132](board-walk-2025-08-11.md#^ref-7aa1eb92-132-0) (line 132, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L166](chroma-toolkit-consolidation-plan.md#^ref-5020e892-166-0) (line 166, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L207](cross-language-runtime-polymorphism.md#^ref-c34c36a6-207-0) (line 207, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L193](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-193-0) (line 193, col 0, score 1)
- [Dynamic Context Model for Web Components — L381](dynamic-context-model-for-web-components.md#^ref-f7702bf8-381-0) (line 381, col 0, score 1)
- [Exception Layer Analysis — L154](exception-layer-analysis.md#^ref-21d5cc09-154-0) (line 154, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L265](migrate-to-provider-tenant-architecture.md#^ref-54382370-265-0) (line 265, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L130](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-130-0) (line 130, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L39](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-39-0) (line 39, col 0, score 1)
- [Pure TypeScript Search Microservice — L538](pure-typescript-search-microservice.md#^ref-d17d3a96-538-0) (line 538, col 0, score 1)
- [RAG UI Panel with Qdrant and PostgREST — L374](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-374-0) (line 374, col 0, score 1)
- [Recursive Prompt Construction Engine — L200](recursive-prompt-construction-engine.md#^ref-babdb9eb-200-0) (line 200, col 0, score 1)
- [Redirecting Standard Error — L31](redirecting-standard-error.md#^ref-b3555ede-31-0) (line 31, col 0, score 1)
- [ripple-propagation-demo — L120](ripple-propagation-demo.md#^ref-8430617b-120-0) (line 120, col 0, score 1)
- [schema-evolution-workflow — L502](schema-evolution-workflow.md#^ref-d8059b6a-502-0) (line 502, col 0, score 1)
- [Self-Agency in AI Interaction — L53](self-agency-in-ai-interaction.md#^ref-49a9a860-53-0) (line 53, col 0, score 1)
- [set-assignment-in-lisp-ast — L161](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-161-0) (line 161, col 0, score 1)
- [shared-package-layout-clarification — L185](shared-package-layout-clarification.md#^ref-36c8882a-185-0) (line 185, col 0, score 1)
- [Shared Package Structure — L181](shared-package-structure.md#^ref-66a72fc3-181-0) (line 181, col 0, score 1)
- [sibilant-macro-targets — L173](sibilant-macro-targets.md#^ref-c5c9a5c6-173-0) (line 173, col 0, score 1)
- [Exception Layer Analysis — L172](exception-layer-analysis.md#^ref-21d5cc09-172-0) (line 172, col 0, score 1)
- [field-dynamics-math-blocks — L154](field-dynamics-math-blocks.md#^ref-7cfc230d-154-0) (line 154, col 0, score 1)
- [field-interaction-equations — L164](field-interaction-equations.md#^ref-b09141b7-164-0) (line 164, col 0, score 1)
- [field-node-diagram-outline — L120](field-node-diagram-outline.md#^ref-1f32c94a-120-0) (line 120, col 0, score 1)
- [field-node-diagram-set — L149](field-node-diagram-set.md#^ref-22b989d5-149-0) (line 149, col 0, score 1)
- [field-node-diagram-visualizations — L99](field-node-diagram-visualizations.md#^ref-e9b27b06-99-0) (line 99, col 0, score 1)
- [graph-ds — L365](graph-ds.md#^ref-6620e2f2-365-0) (line 365, col 0, score 1)
- [heartbeat-fragment-demo — L111](heartbeat-fragment-demo.md#^ref-dd00677a-111-0) (line 111, col 0, score 1)
- [heartbeat-simulation-snippets — L101](heartbeat-simulation-snippets.md#^ref-23e221e9-101-0) (line 101, col 0, score 1)
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
- [Local-Only-LLM-Workflow — L201](local-only-llm-workflow.md#^ref-9a8ab57e-201-0) (line 201, col 0, score 1)
- [markdown-to-org-transpiler — L323](markdown-to-org-transpiler.md#^ref-ab54cdd8-323-0) (line 323, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L496](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-496-0) (line 496, col 0, score 1)
- [ripple-propagation-demo — L118](ripple-propagation-demo.md#^ref-8430617b-118-0) (line 118, col 0, score 1)
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
- [Math Fundamentals — L20](chunks/math-fundamentals.md#^ref-c6e87433-20-0) (line 20, col 0, score 1)
- [Services — L20](chunks/services.md#^ref-75ea4a6a-20-0) (line 20, col 0, score 1)
- [compiler-kit-foundations — L620](compiler-kit-foundations.md#^ref-01b21543-620-0) (line 620, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L237](cross-language-runtime-polymorphism.md#^ref-c34c36a6-237-0) (line 237, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L40](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-40-0) (line 40, col 0, score 1)
- [Dynamic Context Model for Web Components — L401](dynamic-context-model-for-web-components.md#^ref-f7702bf8-401-0) (line 401, col 0, score 1)
- [ecs-scheduler-and-prefabs — L386](ecs-scheduler-and-prefabs.md#^ref-c62a1815-386-0) (line 386, col 0, score 1)
- [eidolon-field-math-foundations — L127](eidolon-field-math-foundations.md#^ref-008f2ac0-127-0) (line 127, col 0, score 1)
- [Event Bus MVP — L557](event-bus-mvp.md#^ref-534fe91d-557-0) (line 557, col 0, score 1)
- [AI-Centric OS with MCP Layer — L407](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-407-0) (line 407, col 0, score 1)
- [api-gateway-versioning — L284](api-gateway-versioning.md#^ref-0580dcd3-284-0) (line 284, col 0, score 1)
- [Services — L21](chunks/services.md#^ref-75ea4a6a-21-0) (line 21, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L43](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-43-0) (line 43, col 0, score 1)
- [Dynamic Context Model for Web Components — L407](dynamic-context-model-for-web-components.md#^ref-f7702bf8-407-0) (line 407, col 0, score 1)
- [eidolon-field-math-foundations — L167](eidolon-field-math-foundations.md#^ref-008f2ac0-167-0) (line 167, col 0, score 1)
- [i3-bluetooth-setup — L123](i3-bluetooth-setup.md#^ref-5e408692-123-0) (line 123, col 0, score 1)
- [i3-config-validation-methods — L78](i3-config-validation-methods.md#^ref-d28090ac-78-0) (line 78, col 0, score 1)
- [Local-Offline-Model-Deployment-Strategy — L295](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-295-0) (line 295, col 0, score 1)
- [api-gateway-versioning — L315](api-gateway-versioning.md#^ref-0580dcd3-315-0) (line 315, col 0, score 1)
- [Chroma-Embedding-Refactor — L331](chroma-embedding-refactor.md#^ref-8b256935-331-0) (line 331, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L167](chroma-toolkit-consolidation-plan.md#^ref-5020e892-167-0) (line 167, col 0, score 1)
- [Diagrams — L25](chunks/diagrams.md#^ref-45cd25b5-25-0) (line 25, col 0, score 1)
- [Tooling — L24](chunks/tooling.md#^ref-6cb4943e-24-0) (line 24, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L173](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-173-0) (line 173, col 0, score 1)
- [Dynamic Context Model for Web Components — L390](dynamic-context-model-for-web-components.md#^ref-f7702bf8-390-0) (line 390, col 0, score 1)
- [eidolon-field-math-foundations — L147](eidolon-field-math-foundations.md#^ref-008f2ac0-147-0) (line 147, col 0, score 1)
- [Event Bus MVP — L553](event-bus-mvp.md#^ref-534fe91d-553-0) (line 553, col 0, score 1)
- [field-interaction-equations — L159](field-interaction-equations.md#^ref-b09141b7-159-0) (line 159, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L315](functional-embedding-pipeline-refactor.md#^ref-a4a25141-315-0) (line 315, col 0, score 1)
- [Math Fundamentals — L34](chunks/math-fundamentals.md#^ref-c6e87433-34-0) (line 34, col 0, score 1)
- [Services — L22](chunks/services.md#^ref-75ea4a6a-22-0) (line 22, col 0, score 1)
- [Shared — L29](chunks/shared.md#^ref-623a55f7-29-0) (line 29, col 0, score 1)
- [Simulation Demo — L23](chunks/simulation-demo.md#^ref-557309a3-23-0) (line 23, col 0, score 1)
- [Tooling — L16](chunks/tooling.md#^ref-6cb4943e-16-0) (line 16, col 0, score 1)
- [Window Management — L25](chunks/window-management.md#^ref-9e8ae388-25-0) (line 25, col 0, score 1)
- [compiler-kit-foundations — L627](compiler-kit-foundations.md#^ref-01b21543-627-0) (line 627, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L171](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-171-0) (line 171, col 0, score 1)
- [Duck's Attractor States — L81](ducks-attractor-states.md#^ref-13951643-81-0) (line 81, col 0, score 1)
- [Services — L28](chunks/services.md#^ref-75ea4a6a-28-0) (line 28, col 0, score 1)
- [Simulation Demo — L7](chunks/simulation-demo.md#^ref-557309a3-7-0) (line 7, col 0, score 1)
- [ecs-scheduler-and-prefabs — L428](ecs-scheduler-and-prefabs.md#^ref-c62a1815-428-0) (line 428, col 0, score 1)
- [Eidolon Field Abstract Model — L199](eidolon-field-abstract-model.md#^ref-5e8b2388-199-0) (line 199, col 0, score 1)
- [eidolon-node-lifecycle — L35](eidolon-node-lifecycle.md#^ref-938eca9c-35-0) (line 35, col 0, score 1)
- [Event Bus MVP — L570](event-bus-mvp.md#^ref-534fe91d-570-0) (line 570, col 0, score 1)
- [field-interaction-equations — L173](field-interaction-equations.md#^ref-b09141b7-173-0) (line 173, col 0, score 1)
- [field-node-diagram-outline — L113](field-node-diagram-outline.md#^ref-1f32c94a-113-0) (line 113, col 0, score 1)
- [Promethean_Eidolon_Synchronicity_Model — L74](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-74-0) (line 74, col 0, score 1)
- [Promethean Event Bus MVP v0.1 — L929](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-929-0) (line 929, col 0, score 1)
- [Promethean Infrastructure Setup — L597](promethean-infrastructure-setup.md#^ref-6deed6ac-597-0) (line 597, col 0, score 1)
- [Promethean-native config design — L421](promethean-native-config-design.md#^ref-ab748541-421-0) (line 421, col 0, score 1)
- [promethean-system-diagrams — L217](promethean-system-diagrams.md#^ref-b51e19b4-217-0) (line 217, col 0, score 1)
- [Promethean Web UI Setup — L629](promethean-web-ui-setup.md#^ref-bc5172ca-629-0) (line 629, col 0, score 1)
- [Prompt_Folder_Bootstrap — L193](prompt-folder-bootstrap.md#^ref-bd4f0976-193-0) (line 193, col 0, score 1)
- [prompt-programming-language-lisp — L107](prompt-programming-language-lisp.md#^ref-d41a06d1-107-0) (line 107, col 0, score 1)
- [eidolon-node-lifecycle — L63](eidolon-node-lifecycle.md#^ref-938eca9c-63-0) (line 63, col 0, score 1)
- [EidolonField — L269](eidolonfield.md#^ref-49d1e1e5-269-0) (line 269, col 0, score 1)
- [Event Bus MVP — L566](event-bus-mvp.md#^ref-534fe91d-566-0) (line 566, col 0, score 1)
- [Event Bus Projections Architecture — L185](event-bus-projections-architecture.md#^ref-cf6b9b17-185-0) (line 185, col 0, score 1)
- [Exception Layer Analysis — L165](exception-layer-analysis.md#^ref-21d5cc09-165-0) (line 165, col 0, score 1)
- [Factorio AI with External Agents — L160](factorio-ai-with-external-agents.md#^ref-a4d90289-160-0) (line 160, col 0, score 1)
- [field-dynamics-math-blocks — L165](field-dynamics-math-blocks.md#^ref-7cfc230d-165-0) (line 165, col 0, score 1)
- [field-interaction-equations — L184](field-interaction-equations.md#^ref-b09141b7-184-0) (line 184, col 0, score 1)
- [field-node-diagram-outline — L132](field-node-diagram-outline.md#^ref-1f32c94a-132-0) (line 132, col 0, score 1)
- [2d-sandbox-field — L225](2d-sandbox-field.md#^ref-c710dc93-225-0) (line 225, col 0, score 1)
- [Admin Dashboard for User Management — L49](admin-dashboard-for-user-management.md#^ref-2901a3e9-49-0) (line 49, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L150](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-150-0) (line 150, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L163](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-163-0) (line 163, col 0, score 1)
- [AI-First-OS-Model-Context-Protocol — L9](ai-first-os-model-context-protocol.md#^ref-618198f4-9-0) (line 9, col 0, score 1)
- [aionian-circuit-math — L179](aionian-circuit-math.md#^ref-f2d83a77-179-0) (line 179, col 0, score 1)
- [api-gateway-versioning — L304](api-gateway-versioning.md#^ref-0580dcd3-304-0) (line 304, col 0, score 1)
- [archetype-ecs — L479](archetype-ecs.md#^ref-8f4c1e86-479-0) (line 479, col 0, score 1)
- [balanced-bst — L295](balanced-bst.md#^ref-d3e7db72-295-0) (line 295, col 0, score 1)
- [markdown-to-org-transpiler — L318](markdown-to-org-transpiler.md#^ref-ab54cdd8-318-0) (line 318, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L322](migrate-to-provider-tenant-architecture.md#^ref-54382370-322-0) (line 322, col 0, score 1)
- [Mongo Outbox Implementation — L579](mongo-outbox-implementation.md#^ref-9c1acd1e-579-0) (line 579, col 0, score 1)
- [observability-infrastructure-setup — L369](observability-infrastructure-setup.md#^ref-b4e64f8c-369-0) (line 369, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L183](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-183-0) (line 183, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L483](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-483-0) (line 483, col 0, score 1)
- [polymorphic-meta-programming-engine — L241](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-241-0) (line 241, col 0, score 1)
- [prom-lib-rate-limiters-and-replay-api — L415](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-415-0) (line 415, col 0, score 1)
- [Promethean Agent Config DSL — L352](promethean-agent-config-dsl.md#^ref-2c00ce45-352-0) (line 352, col 0, score 1)
- [DSL — L26](chunks/dsl.md#^ref-e87bc036-26-0) (line 26, col 0, score 1)
- [ecs-scheduler-and-prefabs — L433](ecs-scheduler-and-prefabs.md#^ref-c62a1815-433-0) (line 433, col 0, score 1)
- [Event Bus MVP — L577](event-bus-mvp.md#^ref-534fe91d-577-0) (line 577, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L174](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-174-0) (line 174, col 0, score 1)
- [Local-Only-LLM-Workflow — L211](local-only-llm-workflow.md#^ref-9a8ab57e-211-0) (line 211, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L334](migrate-to-provider-tenant-architecture.md#^ref-54382370-334-0) (line 334, col 0, score 1)
- [Mongo Outbox Implementation — L581](mongo-outbox-implementation.md#^ref-9c1acd1e-581-0) (line 581, col 0, score 1)
- [observability-infrastructure-setup — L397](observability-infrastructure-setup.md#^ref-b4e64f8c-397-0) (line 397, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L48](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-48-0) (line 48, col 0, score 1)
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
- [Simulation Demo — L32](chunks/simulation-demo.md#^ref-557309a3-32-0) (line 32, col 0, score 1)
- [Tooling — L26](chunks/tooling.md#^ref-6cb4943e-26-0) (line 26, col 0, score 1)
- [Window Management — L36](chunks/window-management.md#^ref-9e8ae388-36-0) (line 36, col 0, score 1)
- [compiler-kit-foundations — L639](compiler-kit-foundations.md#^ref-01b21543-639-0) (line 639, col 0, score 1)
- [Creative Moments — L10](creative-moments.md#^ref-10d98225-10-0) (line 10, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L258](cross-language-runtime-polymorphism.md#^ref-c34c36a6-258-0) (line 258, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L215](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-215-0) (line 215, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L50](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-50-0) (line 50, col 0, score 1)
- [DuckDuckGoSearchPipeline — L16](duckduckgosearchpipeline.md#^ref-e979c50f-16-0) (line 16, col 0, score 1)
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
