---
uuid: 572b571b-b337-4004-97b8-386f930b5497
created_at: state-snapshots-api-and-transactional-projector.md
filename: State Snapshots API and Transactional Projector
title: State Snapshots API and Transactional Projector
description: >-
  Implements a State Snapshots API for HTTP requests with ETags and a
  Transactional Projector for atomic multi-collection updates. Includes
  time-travel queries and a Dev Harness for end-to-end testing.
tags:
  - state-snapshots
  - transactional-projector
  - time-travel
  - dev-harness
  - mongodb
  - etags
  - api
  - event-bus
related_to_uuid:
  - 5020e892-8f18-443a-b707-6d0f3efcfe22
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
  - 50ac7389-a75e-476a-ab34-bb24776d4f38
  - 78eeedf7-75bc-4692-a5a7-bb6857270621
  - ed6f3fc9-5eb1-482c-8b3c-f0abc5aff2a2
  - 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
  - 62bec6f0-4e13-4f38-aca4-72c84ba02367
  - 1b1338fc-bb4d-41df-828f-e219cc9442eb
  - 10d98225-12e0-4212-8e15-88b57cf7bee5
  - 13951643-1741-46bb-89dc-1beebb122633
  - 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
  - e811123d-5841-4e52-bf8c-978f26db4230
  - 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
  - cbfe3513-6a4a-4d2e-915d-ddfab583b2de
related_to_title:
  - Chroma Toolkit Consolidation Plan
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
  - promethean-full-stack-docker-setup
  - typed-struct-compiler
  - Unique Concepts
  - Unique Info Dump Index
  - zero-copy-snapshots-and-workers
  - Canonical Org-Babel Matplotlib Animation Template
  - Creative Moments
  - Duck's Attractor States
  - eidolon-field-math-foundations
  - WebSocket Gateway Implementation
  - Voice Access Layer Design
  - Lispy Macros with syntax-rules
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
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 1002
    col: 0
    score: 1
  - uuid: e811123d-5841-4e52-bf8c-978f26db4230
    line: 631
    col: 0
    score: 1
  - uuid: 50ac7389-a75e-476a-ab34-bb24776d4f38
    line: 3
    col: 0
    score: 1
  - uuid: 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
    line: 280
    col: 0
    score: 1
  - uuid: cbfe3513-6a4a-4d2e-915d-ddfab583b2de
    line: 376
    col: 0
    score: 0.91
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 109
    col: 0
    score: 0.89
  - uuid: af5d2824-faad-476c-a389-e912d9bc672c
    line: 120
    col: 0
    score: 0.89
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 17576
    col: 0
    score: 0.89
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 19014
    col: 0
    score: 0.89
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 1781
    col: 0
    score: 0.89
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 1850
    col: 0
    score: 0.89
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 4095
    col: 0
    score: 0.89
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 3493
    col: 0
    score: 0.89
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 1327
    col: 0
    score: 0.89
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 137
    col: 0
    score: 0.88
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 89
    col: 0
    score: 0.88
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 122
    col: 0
    score: 0.88
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 72
    col: 0
    score: 0.88
  - uuid: bc5172ca-7a09-42ad-b418-8e42bb14d089
    line: 440
    col: 0
    score: 0.88
  - uuid: 61d4086b-4adf-4e94-95e4-95a249cd1b53
    line: 52
    col: 0
    score: 0.88
  - uuid: 31f0166e-4631-45fa-aecd-b44e9a13f497
    line: 79
    col: 0
    score: 0.88
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 124
    col: 0
    score: 0.87
  - uuid: 49d1e1e5-5d13-4955-8f6f-7676434ec462
    line: 184
    col: 0
    score: 0.87
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 376
    col: 0
    score: 0.87
  - uuid: d527c05d-22e8-4493-8f29-ae3cb67f035b
    line: 401
    col: 0
    score: 0.87
  - uuid: d771154e-a7ef-44ca-b69c-a1626cf94fbf
    line: 95
    col: 0
    score: 0.87
  - uuid: 2c2b48ca-1476-47fb-8ad4-69d2588a6c84
    line: 416
    col: 0
    score: 0.86
  - uuid: 21d5cc09-b005-4ede-8f69-00b4b0794540
    line: 63
    col: 0
    score: 0.86
  - uuid: d527c05d-22e8-4493-8f29-ae3cb67f035b
    line: 400
    col: 0
    score: 0.86
  - uuid: ba244286-4e84-425b-8bf6-b80c4eb783fc
    line: 374
    col: 0
    score: 0.86
  - uuid: d41a06d1-613e-4440-80b7-4553fc694285
    line: 56
    col: 0
    score: 0.86
  - uuid: c34c36a6-80c9-4b44-a200-6448543b1b33
    line: 211
    col: 0
    score: 0.86
  - uuid: cf6b9b17-bb91-4219-aa5c-172cba02b2da
    line: 111
    col: 0
    score: 0.86
  - uuid: b362e12e-2802-4e41-9a21-6e0c7ad419a2
    line: 151
    col: 0
    score: 0.86
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 498
    col: 0
    score: 0.86
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 2754
    col: 0
    score: 0.86
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 3130
    col: 0
    score: 0.86
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 1785
    col: 0
    score: 0.86
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 2782
    col: 0
    score: 0.86
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 2459
    col: 0
    score: 0.86
  - uuid: c3cd4f65-2bb3-4fca-a32e-2ac667e03f40
    line: 2299
    col: 0
    score: 0.86
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 2568
    col: 0
    score: 0.86
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 3321
    col: 0
    score: 0.86
  - uuid: 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
    line: 520
    col: 0
    score: 0.85
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 88
    col: 0
    score: 0.85
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 165
    col: 0
    score: 0.85
  - uuid: e811123d-5841-4e52-bf8c-978f26db4230
    line: 630
    col: 0
    score: 0.85
  - uuid: e1056831-ae0c-460b-95fa-4cf09b3398c6
    line: 349
    col: 0
    score: 0.85
  - uuid: b4e64f8c-4dc9-4941-a877-646c5ada068e
    line: 348
    col: 0
    score: 0.85
  - uuid: 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
    line: 147
    col: 0
    score: 0.85
  - uuid: 513dc4c7-e045-4123-ba2e-cf5ef0b7b4a3
    line: 106
    col: 0
    score: 0.85
  - uuid: 4127189a-e0ab-436f-8571-cc852b8e9add
    line: 129
    col: 0
    score: 0.85
  - uuid: 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
    line: 491
    col: 0
    score: 0.85
  - uuid: f8877e5e-1e4f-4478-93cd-a0bf86d26a41
    line: 44
    col: 0
    score: 0.85
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 427
    col: 0
    score: 0.85
---
Note: Consolidated here → ../notes/services/state-snapshots-transactional-projector-timetravel-devharness.md

Alright, **Part 7**: **State Snapshots API**, **Transactional Projector**, **Time-Travel queries**, and a tiny **Dev Harness** for end-to-end tests. Paste ’em under `shared/js/prom-lib/` (plus one `tests/` file). ^ref-509e1cd5-3-0

---

# State Snapshots API (HTTP with ETags)

```ts
// shared/js/prom-lib/snapshots/api.ts
import express from "express";
import type { Db } from "mongodb";
import crypto from "crypto";

export interface SnapshotApiOptions {
  collection: string;              // e.g., "processes.snapshot"
  keyField?: string;               // default "_key"
  bodyLimit?: string;              // default "200kb"
  maxAgeSeconds?: number;          // default 5 (client cache)
}

function etagOf(doc: any) {
  const s = JSON.stringify(doc);
  return '"' + crypto.createHash("sha1").update(s).digest("hex") + '"';
}

export function startSnapshotApi(db: Db, port = 8091, opts: SnapshotApiOptions) {
  const app = express();
  app.set("etag", false);
  app.use(express.json({ limit: opts.bodyLimit ?? "200kb" }));

  const coll = db.collection(opts.collection);
  const keyField = opts.keyField ?? "_key";
  const cacheCtl = `public, max-age=${opts.maxAgeSeconds ?? 5}`;

  // GET /snap/:key
  app.get("/snap/:key", async (req, res) => {
    const key = req.params.key;
    const doc = await coll.findOne({ [keyField]: key });
    if (!doc) return res.status(404).json({ error: "not_found" });

    const etag = etagOf({ ...doc, _id: undefined });
    if (req.headers["if-none-match"] === etag) {
      return res.status(304).end();
    }
    res.setHeader("ETag", etag);
    res.setHeader("Cache-Control", cacheCtl);
    res.json(doc);
  });

  // GET /list?offset=0&limit=100&status=alive
  app.get("/list", async (req, res) => {
    const limit = Math.min(Number(req.query.limit ?? 100), 1000);
    const offset = Number(req.query.offset ?? 0);
    const q: any = {};
    // simple filters
    for (const k of Object.keys(req.query)) {
      if (["limit","offset"].includes(k)) continue;
      q[k] = req.query[k];
    }
    const cursor = coll.find(q).sort({ _ts: -1 }).skip(offset).limit(limit);
    const items = await cursor.toArray();
    res.setHeader("Cache-Control", "no-store");
    res.json({ offset, limit, count: items.length, items });
  });

  // HEAD /snap/:key (for cheap freshness checks)
  app.head("/snap/:key", async (req, res) => {
    const key = req.params.key;
    const doc = await coll.findOne({ [keyField]: key }, { projection: { _id: 0, _ts: 1 } });
    if (!doc) return res.status(404).end();
    const etag = etagOf(doc);
    if (req.headers["if-none-match"] === etag) return res.status(304).end();
    res.setHeader("ETag", etag);
    res.setHeader("Cache-Control", cacheCtl);
    res.status(200).end();
  });

  return app.listen(port, () => console.log(`[snapshot-api] on :${port} (${opts.collection})`));
}
```
^ref-509e1cd5-9-0
 ^ref-509e1cd5-83-0
**Indexes you want on the snapshot collection:**

* `{ _key: 1 } unique` ^ref-509e1cd5-86-0
* Optional filter fields (e.g., `{ status: 1 }`)
* `{ _ts: -1 }`

---

# Transactional Projector (multi-collection, atomic)
 ^ref-509e1cd5-93-0
```ts
// shared/js/prom-lib/projectors/transactional.ts
import type { Db, ClientSession } from "mongodb";
import type { EventBus, EventRecord } from "../event/types";

export interface TxnProjectorOpts<E=any> {
  topic: string;
  group: string;
  handler: (e: EventRecord<E>, db: Db, s: ClientSession) => Promise<void>;
  from?: "earliest" | "latest";
  retries?: number;
}

export async function startTransactionalProjector<E=any>(bus: EventBus, db: Db, opts: TxnProjectorOpts<E>) {
  const from = opts.from ?? "earliest";
  const retries = opts.retries ?? 3;

  return bus.subscribe(opts.topic, opts.group, async (e) => {
    for (let i=0; i<=retries; i++) {
      const s = db.client.startSession();
      try {
        await s.withTransaction(async () => {
          await opts.handler(e, db, s);
        }, { writeConcern: { w: "majority" } });
        // success → exit retry loop
        return;
      } catch (err) {
        if (i === retries) throw err;
        await new Promise(r => setTimeout(r, 100 * (i+1)));
      } finally {
        await s.endSession();
      }
    }
  }, { from, manualAck: false, batchSize: 200 });
}
^ref-509e1cd5-93-0
``` ^ref-509e1cd5-130-0

**Usage example (process state → processes + stats):** ^ref-509e1cd5-132-0

```ts
// services/js/projectors/process.txn.ts
import { startTransactionalProjector } from "../../shared/js/prom-lib/projectors/transactional";
import { MongoEventBus } from "../../shared/js/prom-lib/event/mongo";

export async function startProcessTxnProjector(bus: MongoEventBus, db: any) {
  await startTransactionalProjector(bus, db, {
    topic: "process.state",
    group: "processes.txn",
    async handler(e, db, s) {
      const p = e.payload as any;
      // Collection A: upsert processes
      await db.collection("processes").updateOne(
        { _key: p.processId },
        { $set: { ...p, _key: p.processId, _ts: e.ts } },
        { upsert: true, session: s }
      );
      // Collection B: aggregate a simple host counter (idempotent upsert)
      await db.collection("host_stats").updateOne(
        { _key: p.host },
        { $setOnInsert: { _key: p.host }, $inc: { seen: 1 }, $set: { last_ts: e.ts } },
        { upsert: true, session: s }
      );
    },
  });
^ref-509e1cd5-132-0
}
```
 ^ref-509e1cd5-162-0
**Mermaid (ack-after-commit):**

```mermaid
sequenceDiagram
  participant Bus as EventBus
  participant Proj as Txn Projector
  participant DB as Mongo
  Bus-->>Proj: EVENT
  Proj->>DB: startSession + withTransaction
^ref-509e1cd5-162-0
  DB-->>Proj: commit
  Proj-->>Bus: (auto-ack from subscribe)
```

--- ^ref-509e1cd5-177-0

# Time-Travel Query Helper (reconstruct state at T) ^ref-509e1cd5-179-0

Works with compaction topics (latest-by-key) + periodic snapshots.

```ts
// shared/js/prom-lib/timetravel/reconstruct.ts
import type { MongoEventStore } from "../event/mongo";
import type { EventRecord } from "../event/types";

export interface ReconstructOpts<T=any> {
  topic: string;                // e.g., "process.state"
  snapshotTopic?: string;       // e.g., "process.state.snapshot" (optional)
  key: string;                  // entity key
  atTs: number;                 // target timestamp (epoch ms)
  apply: (prev: T | null, e: EventRecord<T>) => T | null; // reducer: apply event->state
  // fetchSnapshot: override to load nearest <= atTs (if not using events-only)
  fetchSnapshot?: (key: string, upTo: number) => Promise<{ state: T | null, ts: number } | null>;
}

export async function reconstructAt<T=any>(store: MongoEventStore, opts: ReconstructOpts<T>) {
  let baseState: T | null = null;
  let baseTs = 0;

  // optional snapshot as baseline
  if (opts.fetchSnapshot) {
    const snap = await opts.fetchSnapshot(opts.key, opts.atTs);
    if (snap) { baseState = snap.state; baseTs = snap.ts; }
  }

  // scan events after baseline up to atTs
  const events = await store.scan(opts.topic, { ts: baseTs, limit: 1_000_000 });
  for (const e of events) {
    if (e.ts > opts.atTs) break;
    if (e.key !== opts.key) continue;
    baseState = opts.apply(baseState, e as EventRecord<T>);
    baseTs = e.ts;
^ref-509e1cd5-179-0
  } ^ref-509e1cd5-216-0
  return { state: baseState, ts: baseTs };
}
```
^ref-509e1cd5-218-0 ^ref-509e1cd5-220-0

**Example reducer (process.state is full upsert):**

```ts
// shared/js/prom-lib/timetravel/examples.ts
import { reconstructAt } from "./reconstruct";
import { MongoEventStore } from "../event/mongo";

export async function processAt(store: MongoEventStore, processId: string, atTs: number) {
  return reconstructAt(store, {
    topic: "process.state",
    key: processId,
^ref-509e1cd5-218-0
    atTs, ^ref-509e1cd5-233-0
    apply: (_prev, e) => e.payload as any
  });
}
^ref-509e1cd5-235-0
^ref-509e1cd5-233-0
```
^ref-509e1cd5-233-0
^ref-509e1cd5-235-0 ^ref-509e1cd5-242-0
^ref-509e1cd5-233-0 ^ref-509e1cd5-242-0

**Mermaid:**

^ref-509e1cd5-235-0 ^ref-509e1cd5-247-0
```mermaid ^ref-509e1cd5-242-0
flowchart LR
  Snap[Snapshot <= T] --> Base
^ref-509e1cd5-242-0 ^ref-509e1cd5-248-0
  Base -->|scan events (Base.ts..T)| Reduce
^ref-509e1cd5-248-0
  Reduce --> State[State@T]
^ref-509e1cd5-248-0
```

> If you don’t have snapshots, set `fetchSnapshot` to `null` and it’ll reconstruct purely from events (longer scans).

---

# Dev Harness (spin in-memory bus + fake services)

```ts
// shared/js/prom-lib/dev/harness.ts
import { InMemoryEventBus } from "../event/memory";
import { startWSGateway } from "../ws/server";
import { startHttpPublisher } from "../http/publish";
import { startProcessProjector } from "../examples/process/projector";

export interface Harness {
  bus: InMemoryEventBus;
  stop(): Promise<void>;
}

export async function startHarness({ wsPort = 9090, httpPort = 9091 } = {}): Promise<Harness> {
  const bus = new InMemoryEventBus();

  const wss = startWSGateway(bus, wsPort, { auth: async () => ({ ok: true }) });
  const http = startHttpPublisher(bus, httpPort);
  const stopProj = await startProcessProjector(bus);

  return {
    bus,
    async stop() {
^ref-509e1cd5-248-0
      await new Promise(r => (http as any).close(r)); ^ref-509e1cd5-278-0
      wss.close();
      stopProj();
^ref-509e1cd5-280-0
^ref-509e1cd5-278-0
    }
^ref-509e1cd5-280-0
^ref-509e1cd5-278-0
  };
^ref-509e1cd5-280-0
^ref-509e1cd5-278-0
}
```

**Integration test (Jest)**

```ts
// tests/dev.harness.int.test.ts
import { startHarness } from "../shared/js/prom-lib/dev/harness";

test("harness end-to-end", async () => {
  const h = await startHarness({ wsPort: 9190, httpPort: 9191 });

  // publish a heartbeat and wait a tick
  await h.bus.publish("heartbeat.received", { pid: 1, name: "stt", host: "local", cpu_pct: 1, mem_mb: 2 });
  await new Promise(r => setTimeout(r, 50));
^ref-509e1cd5-280-0

  // ensure projector emitted process.state
^ref-509e1cd5-303-0
  const cur = await h.bus.getCursor("process.state", "process-projector"); // from projector group
^ref-509e1cd5-303-0
  expect(cur).toBeTruthy();
^ref-509e1cd5-319-0 ^ref-509e1cd5-320-0
^ref-509e1cd5-318-0 ^ref-509e1cd5-321-0
^ref-509e1cd5-317-0
^ref-509e1cd5-303-0
^ref-509e1cd5-299-0
 ^ref-509e1cd5-325-0
  await h.stop(); ^ref-509e1cd5-317-0
}, 10_000); ^ref-509e1cd5-318-0
``` ^ref-509e1cd5-319-0
^ref-509e1cd5-303-0

---

# Sibilant sprinkles (pseudo)

^ref-509e1cd5-303-0
```lisp
; shared/sibilant/prom/snapshots.sib (pseudo)
^ref-509e1cd5-321-0
^ref-509e1cd5-320-0
^ref-509e1cd5-319-0
^ref-509e1cd5-318-0 ^ref-509e1cd5-325-0
^ref-509e1cd5-317-0
(defn start-snapshot-api [db port coll] ^ref-509e1cd5-327-0
^ref-509e1cd5-333-0
^ref-509e1cd5-330-0
^ref-509e1cd5-329-0
^ref-509e1cd5-328-0
^ref-509e1cd5-327-0 ^ref-509e1cd5-338-0
^ref-509e1cd5-338-0
^ref-509e1cd5-333-0
^ref-509e1cd5-330-0
^ref-509e1cd5-329-0
^ref-509e1cd5-328-0
^ref-509e1cd5-327-0 ^ref-509e1cd5-353-0
^ref-509e1cd5-325-0
^ref-509e1cd5-321-0
^ref-509e1cd5-320-0
  (startSnapshotApi db port {:collection coll})) ^ref-509e1cd5-328-0
 ^ref-509e1cd5-317-0 ^ref-509e1cd5-329-0
; transactional projector macro-ish feel ^ref-509e1cd5-318-0 ^ref-509e1cd5-330-0
(defmacro def-txn-projector [topic group & body] ^ref-509e1cd5-319-0
  `(startTransactionalProjector bus db {:topic ~topic :group ~group :handler (fn [e db s] ~@body)})) ^ref-509e1cd5-320-0
``` ^ref-509e1cd5-321-0 ^ref-509e1cd5-333-0

---

# Kanban adds ^ref-509e1cd5-325-0 ^ref-509e1cd5-366-0
 ^ref-509e1cd5-338-0
* [ ] Expose **Snapshot API** for `processes` (collection `processes`) ^ref-509e1cd5-327-0 ^ref-509e1cd5-353-0
* [ ] Add `process.txn` projector to upsert `processes` + `host_stats` atomically ^ref-509e1cd5-328-0
* [ ] Implement `timetravel.processAt(processId, T)` in a small CLI for debugging ^ref-509e1cd5-329-0
* [ ] Add `dev.harness.int.test.ts` to CI integration stage ^ref-509e1cd5-330-0
* [ ] Document ETag semantics and cache headers for `/snap/:key`

--- ^ref-509e1cd5-333-0

Want **Part 8** next? I can deliver:

* **Multi-tenant topics** (namespace + policy isolation),
* **SLO monitor** (lag, ack time, error rate with alarms), ^ref-509e1cd5-338-0
* **Bulk replayer** (topic→topic with filter/map),
* and **JS/Hy generators** to autowire schemas/topics → typed clients + validators.
{ upsert: true, session: s }
      );
      // Collection B: aggregate a simple host counter (idempotent upsert)
      await db.collection("host_stats").updateOne(
        { _key: p.host },
        { $setOnInsert: { _key: p.host }, $inc: { seen: 1 }, $set: { last_ts: e.ts } },
        { upsert: true, session: s }
      );
    },
  });
^ref-509e1cd5-132-0
}
```
 ^ref-509e1cd5-162-0
**Mermaid (ack-after-commit):**

```mermaid
sequenceDiagram
  participant Bus as EventBus
  participant Proj as Txn Projector
  participant DB as Mongo
  Bus-->>Proj: EVENT
  Proj->>DB: startSession + withTransaction
^ref-509e1cd5-162-0
  DB-->>Proj: commit
  Proj-->>Bus: (auto-ack from subscribe)
```

--- ^ref-509e1cd5-177-0

# Time-Travel Query Helper (reconstruct state at T) ^ref-509e1cd5-179-0

Works with compaction topics (latest-by-key) + periodic snapshots.

```ts
// shared/js/prom-lib/timetravel/reconstruct.ts
import type { MongoEventStore } from "../event/mongo";
import type { EventRecord } from "../event/types";

export interface ReconstructOpts<T=any> {
  topic: string;                // e.g., "process.state"
  snapshotTopic?: string;       // e.g., "process.state.snapshot" (optional)
  key: string;                  // entity key
  atTs: number;                 // target timestamp (epoch ms)
  apply: (prev: T | null, e: EventRecord<T>) => T | null; // reducer: apply event->state
  // fetchSnapshot: override to load nearest <= atTs (if not using events-only)
  fetchSnapshot?: (key: string, upTo: number) => Promise<{ state: T | null, ts: number } | null>;
}

export async function reconstructAt<T=any>(store: MongoEventStore, opts: ReconstructOpts<T>) {
  let baseState: T | null = null;
  let baseTs = 0;

  // optional snapshot as baseline
  if (opts.fetchSnapshot) {
    const snap = await opts.fetchSnapshot(opts.key, opts.atTs);
    if (snap) { baseState = snap.state; baseTs = snap.ts; }
  }

  // scan events after baseline up to atTs
  const events = await store.scan(opts.topic, { ts: baseTs, limit: 1_000_000 });
  for (const e of events) {
    if (e.ts > opts.atTs) break;
    if (e.key !== opts.key) continue;
    baseState = opts.apply(baseState, e as EventRecord<T>);
    baseTs = e.ts;
^ref-509e1cd5-179-0
  } ^ref-509e1cd5-216-0
  return { state: baseState, ts: baseTs };
}
```
^ref-509e1cd5-218-0 ^ref-509e1cd5-220-0

**Example reducer (process.state is full upsert):**

```ts
// shared/js/prom-lib/timetravel/examples.ts
import { reconstructAt } from "./reconstruct";
import { MongoEventStore } from "../event/mongo";

export async function processAt(store: MongoEventStore, processId: string, atTs: number) {
  return reconstructAt(store, {
    topic: "process.state",
    key: processId,
^ref-509e1cd5-218-0
    atTs, ^ref-509e1cd5-233-0
    apply: (_prev, e) => e.payload as any
  });
}
^ref-509e1cd5-235-0
^ref-509e1cd5-233-0
```
^ref-509e1cd5-233-0
^ref-509e1cd5-235-0 ^ref-509e1cd5-242-0
^ref-509e1cd5-233-0 ^ref-509e1cd5-242-0

**Mermaid:**

^ref-509e1cd5-235-0 ^ref-509e1cd5-247-0
```mermaid ^ref-509e1cd5-242-0
flowchart LR
  Snap[Snapshot <= T] --> Base
^ref-509e1cd5-242-0 ^ref-509e1cd5-248-0
  Base -->|scan events (Base.ts..T)| Reduce
^ref-509e1cd5-248-0
  Reduce --> State[State@T]
^ref-509e1cd5-248-0
```

> If you don’t have snapshots, set `fetchSnapshot` to `null` and it’ll reconstruct purely from events (longer scans).

---

# Dev Harness (spin in-memory bus + fake services)

```ts
// shared/js/prom-lib/dev/harness.ts
import { InMemoryEventBus } from "../event/memory";
import { startWSGateway } from "../ws/server";
import { startHttpPublisher } from "../http/publish";
import { startProcessProjector } from "../examples/process/projector";

export interface Harness {
  bus: InMemoryEventBus;
  stop(): Promise<void>;
}

export async function startHarness({ wsPort = 9090, httpPort = 9091 } = {}): Promise<Harness> {
  const bus = new InMemoryEventBus();

  const wss = startWSGateway(bus, wsPort, { auth: async () => ({ ok: true }) });
  const http = startHttpPublisher(bus, httpPort);
  const stopProj = await startProcessProjector(bus);

  return {
    bus,
    async stop() {
^ref-509e1cd5-248-0
      await new Promise(r => (http as any).close(r)); ^ref-509e1cd5-278-0
      wss.close();
      stopProj();
^ref-509e1cd5-280-0
^ref-509e1cd5-278-0
    }
^ref-509e1cd5-280-0
^ref-509e1cd5-278-0
  };
^ref-509e1cd5-280-0
^ref-509e1cd5-278-0
}
```

**Integration test (Jest)**

```ts
// tests/dev.harness.int.test.ts
import { startHarness } from "../shared/js/prom-lib/dev/harness";

test("harness end-to-end", async () => {
  const h = await startHarness({ wsPort: 9190, httpPort: 9191 });

  // publish a heartbeat and wait a tick
  await h.bus.publish("heartbeat.received", { pid: 1, name: "stt", host: "local", cpu_pct: 1, mem_mb: 2 });
  await new Promise(r => setTimeout(r, 50));
^ref-509e1cd5-280-0

  // ensure projector emitted process.state
^ref-509e1cd5-303-0
  const cur = await h.bus.getCursor("process.state", "process-projector"); // from projector group
^ref-509e1cd5-303-0
  expect(cur).toBeTruthy();
^ref-509e1cd5-319-0 ^ref-509e1cd5-320-0
^ref-509e1cd5-318-0 ^ref-509e1cd5-321-0
^ref-509e1cd5-317-0
^ref-509e1cd5-303-0
^ref-509e1cd5-299-0
 ^ref-509e1cd5-325-0
  await h.stop(); ^ref-509e1cd5-317-0
}, 10_000); ^ref-509e1cd5-318-0
``` ^ref-509e1cd5-319-0
^ref-509e1cd5-303-0

---

# Sibilant sprinkles (pseudo)

^ref-509e1cd5-303-0
```lisp
; shared/sibilant/prom/snapshots.sib (pseudo)
^ref-509e1cd5-321-0
^ref-509e1cd5-320-0
^ref-509e1cd5-319-0
^ref-509e1cd5-318-0 ^ref-509e1cd5-325-0
^ref-509e1cd5-317-0
(defn start-snapshot-api [db port coll] ^ref-509e1cd5-327-0
^ref-509e1cd5-333-0
^ref-509e1cd5-330-0
^ref-509e1cd5-329-0
^ref-509e1cd5-328-0
^ref-509e1cd5-327-0 ^ref-509e1cd5-338-0
^ref-509e1cd5-338-0
^ref-509e1cd5-333-0
^ref-509e1cd5-330-0
^ref-509e1cd5-329-0
^ref-509e1cd5-328-0
^ref-509e1cd5-327-0 ^ref-509e1cd5-353-0
^ref-509e1cd5-325-0
^ref-509e1cd5-321-0
^ref-509e1cd5-320-0
  (startSnapshotApi db port {:collection coll})) ^ref-509e1cd5-328-0
 ^ref-509e1cd5-317-0 ^ref-509e1cd5-329-0
; transactional projector macro-ish feel ^ref-509e1cd5-318-0 ^ref-509e1cd5-330-0
(defmacro def-txn-projector [topic group & body] ^ref-509e1cd5-319-0
  `(startTransactionalProjector bus db {:topic ~topic :group ~group :handler (fn [e db s] ~@body)})) ^ref-509e1cd5-320-0
``` ^ref-509e1cd5-321-0 ^ref-509e1cd5-333-0

---

# Kanban adds ^ref-509e1cd5-325-0 ^ref-509e1cd5-366-0
 ^ref-509e1cd5-338-0
* [ ] Expose **Snapshot API** for `processes` (collection `processes`) ^ref-509e1cd5-327-0 ^ref-509e1cd5-353-0
* [ ] Add `process.txn` projector to upsert `processes` + `host_stats` atomically ^ref-509e1cd5-328-0
* [ ] Implement `timetravel.processAt(processId, T)` in a small CLI for debugging ^ref-509e1cd5-329-0
* [ ] Add `dev.harness.int.test.ts` to CI integration stage ^ref-509e1cd5-330-0
* [ ] Document ETag semantics and cache headers for `/snap/:key`

--- ^ref-509e1cd5-333-0

Want **Part 8** next? I can deliver:

* **Multi-tenant topics** (namespace + policy isolation),
* **SLO monitor** (lag, ack time, error rate with alarms), ^ref-509e1cd5-338-0
* **Bulk replayer** (topic→topic with filter/map),
* and **JS/Hy generators** to autowire schemas/topics → typed clients + validators.
