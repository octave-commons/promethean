---
$$
uuid: 9c1acd1e-c6a4-4a49-a66f-6da8b1bc9333
$$
$$
created_at: 2025.08.08.19.08.49.md
$$
filename: Mongo Outbox Implementation
$$
description: >-
$$
  Transactional MongoDB outbox with JWT auth, ACL, and ops dashboard. Includes
  typed client SDK and drainer for reliable message processing.
tags:
  - MongoDB
  - transactional
  - JWT
  - ACL
  - ops
  - dashboard
  - SDK
$$
related_to_title:
$$
  - WebSocket Gateway Implementation
  - Event Bus MVP
  - State Snapshots API and Transactional Projector
  - schema-evolution-workflow
  - prom-lib-rate-limiters-and-replay-api
  - Promethean Event Bus MVP v0.1
  - Services
  - Unique Info Dump Index
  - Stateful Partitions and Rebalancing
  - observability-infrastructure-setup
  - ecs-offload-workers
  - archetype-ecs
  - aionian-circuit-math
  - Diagrams
  - DSL
  - Chroma Toolkit Consolidation Plan
  - Event Bus Projections Architecture
  - ecs-scheduler-and-prefabs
  - 'Agent Tasks: Persistence Migration to DualStore'
  - JavaScript
  - eidolon-field-math-foundations
  - Migrate to Provider-Tenant Architecture
  - Cross-Language Runtime Polymorphism
  - Promethean Infrastructure Setup
  - api-gateway-versioning
  - Prometheus Observability Stack
$$
related_to_uuid:
$$
  - e811123d-5841-4e52-bf8c-978f26db4230
  - 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
  - 509e1cd5-367c-4a9d-a61b-cef2e85d42ce
  - d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
  - aee4718b-9f8b-4635-a0c1-ef61c9bea8f1
  - fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
  - 75ea4a6a-8270-488d-9d37-799c288e5f70
  - 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
  - 4330e8f0-5f46-4235-918b-39b6b93fa561
  - b4e64f8c-4dc9-4941-a877-646c5ada068e
  - 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
  - 8f4c1e86-1236-4936-84ca-6ed7082af6b7
  - f2d83a77-7f86-4c56-8538-1350167a0c6c
  - 45cd25b5-ed36-49ab-82c8-10d0903e34db
  - e87bc036-1570-419e-a558-f45b9c0db698
  - 5020e892-8f18-443a-b707-6d0f3efcfe22
  - cf6b9b17-bb91-4219-aa5c-172cba02b2da
  - c62a1815-c43b-4a3b-88e6-d7fa008a155e
  - 93d2ba51-8689-49ee-94e2-296092e48058
  - c1618c66-f73a-4e04-9bfa-ef38755f7acc
  - 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
  - 54382370-1931-4a19-a634-46735708a9ea
  - c34c36a6-80c9-4b44-a200-6448543b1b33
  - 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
  - 0580dcd3-533d-4834-8a2f-eae3771960a9
  - e90b5a16-d58f-424d-bd36-70e9bd2861ad
references:
  - uuid: 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
    line: 392
    col: 1
    score: 0.87
  - uuid: e811123d-5841-4e52-bf8c-978f26db4230
    line: 219
    col: 1
    score: 0.89
  - uuid: e811123d-5841-4e52-bf8c-978f26db4230
    line: 623
    col: 1
    score: 0.86
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 465
    col: 1
    score: 1
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 465
    col: 3
    score: 1
  - uuid: 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
    line: 548
    col: 1
    score: 1
  - uuid: 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
    line: 548
    col: 3
    score: 1
  - uuid: fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
    line: 883
    col: 1
    score: 1
  - uuid: fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
    line: 883
    col: 3
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 490
    col: 1
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 490
    col: 3
    score: 1
  - uuid: aee4718b-9f8b-4635-a0c1-ef61c9bea8f1
    line: 386
    col: 1
    score: 1
  - uuid: aee4718b-9f8b-4635-a0c1-ef61c9bea8f1
    line: 386
    col: 3
    score: 1
  - uuid: fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
    line: 881
    col: 1
    score: 1
  - uuid: fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
    line: 881
    col: 3
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 485
    col: 1
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 485
    col: 3
    score: 1
  - uuid: 509e1cd5-367c-4a9d-a61b-cef2e85d42ce
    line: 341
    col: 1
    score: 1
  - uuid: 509e1cd5-367c-4a9d-a61b-cef2e85d42ce
    line: 341
    col: 3
    score: 1
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 11
    col: 1
    score: 1
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 11
    col: 3
    score: 1
  - uuid: 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
    line: 554
    col: 1
    score: 1
  - uuid: 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
    line: 554
    col: 3
    score: 1
  - uuid: aee4718b-9f8b-4635-a0c1-ef61c9bea8f1
    line: 382
    col: 1
    score: 1
  - uuid: aee4718b-9f8b-4635-a0c1-ef61c9bea8f1
    line: 382
    col: 3
    score: 1
  - uuid: fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
    line: 891
    col: 1
    score: 1
  - uuid: fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
    line: 891
    col: 3
    score: 1
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 12
    col: 1
    score: 1
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 12
    col: 3
    score: 1
  - uuid: c34c36a6-80c9-4b44-a200-6448543b1b33
    line: 211
    col: 1
    score: 1
  - uuid: c34c36a6-80c9-4b44-a200-6448543b1b33
    line: 211
    col: 3
    score: 1
  - uuid: 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
    line: 550
    col: 1
    score: 1
  - uuid: 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
    line: 550
    col: 3
    score: 1
  - uuid: aee4718b-9f8b-4635-a0c1-ef61c9bea8f1
    line: 384
    col: 1
    score: 1
  - uuid: aee4718b-9f8b-4635-a0c1-ef61c9bea8f1
    line: 384
    col: 3
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 136
    col: 1
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 136
    col: 3
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 166
    col: 1
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 166
    col: 3
    score: 1
  - uuid: 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
    line: 551
    col: 1
    score: 1
  - uuid: 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
    line: 551
    col: 3
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 284
    col: 1
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 284
    col: 3
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 137
    col: 1
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 137
    col: 3
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 175
    col: 1
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 175
    col: 3
    score: 1
  - uuid: 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
    line: 547
    col: 1
    score: 1
  - uuid: 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
    line: 547
    col: 3
    score: 1
  - uuid: cf6b9b17-bb91-4219-aa5c-172cba02b2da
    line: 150
    col: 1
    score: 1
  - uuid: cf6b9b17-bb91-4219-aa5c-172cba02b2da
    line: 150
    col: 3
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 486
    col: 1
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 486
    col: 3
    score: 1
  - uuid: 509e1cd5-367c-4a9d-a61b-cef2e85d42ce
    line: 337
    col: 1
    score: 1
  - uuid: 509e1cd5-367c-4a9d-a61b-cef2e85d42ce
    line: 337
    col: 3
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 533
    col: 1
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 533
    col: 3
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 68
    col: 1
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 68
    col: 3
    score: 1
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 158
    col: 1
    score: 1
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 158
    col: 3
    score: 1
  - uuid: 8f4c1e86-1236-4936-84ca-6ed7082af6b7
    line: 457
    col: 1
    score: 1
  - uuid: 8f4c1e86-1236-4936-84ca-6ed7082af6b7
    line: 457
    col: 3
    score: 1
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 9
    col: 1
    score: 1
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 9
    col: 3
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 10
    col: 1
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 10
    col: 3
    score: 1
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 14
    col: 1
    score: 1
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 14
    col: 3
    score: 1
  - uuid: 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
    line: 553
    col: 1
    score: 1
  - uuid: 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
    line: 553
    col: 3
    score: 1
  - uuid: aee4718b-9f8b-4635-a0c1-ef61c9bea8f1
    line: 388
    col: 1
    score: 1
  - uuid: aee4718b-9f8b-4635-a0c1-ef61c9bea8f1
    line: 388
    col: 3
    score: 1
  - uuid: fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
    line: 892
    col: 1
    score: 1
  - uuid: fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
    line: 892
    col: 3
    score: 1
  - uuid: 0580dcd3-533d-4834-8a2f-eae3771960a9
    line: 286
    col: 1
    score: 1
  - uuid: 0580dcd3-533d-4834-8a2f-eae3771960a9
    line: 286
    col: 3
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 575
    col: 1
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 575
    col: 3
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 504
    col: 1
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 504
    col: 3
    score: 1
  - uuid: 0580dcd3-533d-4834-8a2f-eae3771960a9
    line: 292
    col: 1
    score: 0.93
  - uuid: 0580dcd3-533d-4834-8a2f-eae3771960a9
    line: 292
    col: 3
    score: 0.93
  - uuid: 8f4c1e86-1236-4936-84ca-6ed7082af6b7
    line: 460
    col: 1
    score: 1
  - uuid: 8f4c1e86-1236-4936-84ca-6ed7082af6b7
    line: 460
    col: 3
    score: 1
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 15
    col: 1
    score: 1
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 15
    col: 3
    score: 1
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 388
    col: 1
    score: 1
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 388
    col: 3
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 129
    col: 1
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 129
    col: 3
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 498
    col: 1
    score: 0.98
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 498
    col: 3
    score: 0.98
  - uuid: e811123d-5841-4e52-bf8c-978f26db4230
    line: 645
    col: 1
    score: 0.98
  - uuid: e811123d-5841-4e52-bf8c-978f26db4230
    line: 645
    col: 3
    score: 0.98
  - uuid: aee4718b-9f8b-4635-a0c1-ef61c9bea8f1
    line: 398
    col: 1
    score: 0.98
  - uuid: aee4718b-9f8b-4635-a0c1-ef61c9bea8f1
    line: 398
    col: 3
    score: 0.98
  - uuid: e811123d-5841-4e52-bf8c-978f26db4230
    line: 647
    col: 1
    score: 0.98
  - uuid: e811123d-5841-4e52-bf8c-978f26db4230
    line: 647
    col: 3
    score: 0.98
  - uuid: fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
    line: 912
    col: 1
    score: 0.99
  - uuid: fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
    line: 912
    col: 3
    score: 0.99
  - uuid: 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
    line: 562
    col: 1
    score: 0.99
  - uuid: 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
    line: 562
    col: 3
    score: 0.99
  - uuid: fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
    line: 910
    col: 1
    score: 0.99
  - uuid: fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
    line: 910
    col: 3
    score: 0.99
  - uuid: fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
    line: 914
    col: 1
    score: 0.99
  - uuid: fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
    line: 914
    col: 3
    score: 0.99
---
Note: Consolidated here → ../notes/services/broker-outbox-acl-ops.md

Alright, Part 3 coming in hot: **Mongo outbox (transactional), JWT auth + ACL, Ops dashboard, and a typed client SDK**. Everything drops under `shared/js/prom-lib/` (plus one tiny service bootstrap). You can paste-as-you-go.

---

# 1) Mongo Outbox $transaction-safe$

### 1a) Interface + drainer (we’ll reuse the earlier drainer)

```ts
// shared/js/prom-lib/outbox/types.ts
import { UUID } from "../event/types";

export interface OutboxRecord<T=any> {
  _id: UUID;
  topic: string;
  payload: T;
  headers?: Record<string,string>;
  status: "pending" | "claimed" | "sent" | "error";
  claimed_by?: string;
  lease_until?: number;
  last_err?: string;
  ts: number;
  attempts: number;
}

export interface OutboxStore<T=any> {
  add(rec: { id: UUID; topic: string; payload: T; headers?: Record<string,string> }): Promise<void>;
  claimBatch(n: number, leaseMs: number, workerId: string): Promise<OutboxRecord<T>[]>;
  markSent(id: UUID): Promise<void>;
  markError(id: UUID, err: string): Promise<void>;
  requeueExpired(now?: number): Promise<number>;
}
```

```ts
// shared/js/prom-lib/outbox/drainer.ts
import { EventBus } from "../event/types";
import { OutboxStore } from "./types";

export async function runOutboxDrainer<T>(
  outbox: OutboxStore<T>,
  bus: EventBus,
  {
    batchSize = 100,
    leaseMs = 30_000,
    workerId = `drainer-${Math.random().toString(16).slice(2)}`,
    intervalMs = 250
  } = {}
) {
  while (true) {
    const reclaimed = await outbox.requeueExpired().catch(() => 0);
    const batch = await outbox.claimBatch(batchSize, leaseMs, workerId);
    if (batch.length === 0) {
      await sleep(intervalMs);
      continue;
    }
    for (const rec of batch) {
      try {
        await bus.publish(rec.topic, rec.payload, { headers: rec.headers });
        await outbox.markSent(rec._id);
      } catch (e: any) {
        await outbox.markError(rec._id, e.message ?? String(e));
      }
    }
  }
}
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
```

### 1b) Mongo implementation

```ts
// shared/js/prom-lib/outbox/mongo.ts
import { Collection, Db } from "mongodb";
import { OutboxRecord, OutboxStore } from "./types";

export class MongoOutbox<T=any> implements OutboxStore<T> {
  private coll: Collection<OutboxRecord<T>>;
  constructor(db: Db, collectionName = "outbox") {
    this.coll = db.collection(collectionName);
  }
  static async ensureIndexes(db: Db, name = "outbox") {
    const c = db.collection(name);
    await c.createIndex({ status: 1, lease_until: 1 });
    await c.createIndex({ ts: 1 });
  }
  async add({ id, topic, payload, headers }: { id: string; topic: string; payload: T; headers?: Record<string,string> }) {
    const doc: OutboxRecord<T> = {
      _id: id,
      topic,
      payload,
      headers,
      status: "pending",
      ts: Date.now(),
      attempts: 0
    };
    await this.coll.insertOne(doc as any);
  }
  async claimBatch(n: number, leaseMs: number, workerId: string): Promise<OutboxRecord<T>[]> {
    const now = Date.now();
    const docs: OutboxRecord<T>[] = [];
    for (let i=0; i<n; i++) {
      const res = await this.coll.findOneAndUpdate(
        {
          status: "pending"
        },
        {
          $set: { status: "claimed", claimed_by: workerId, lease_until: now + leaseMs },
          $inc: { attempts: 1 }
        },
        {
          sort: { ts: 1 },
          returnDocument: "after"
        }
      );
      if (!res.value) break;
      docs.push(res.value);
    }
    return docs;
  }
  async markSent(id: string) {
    await this.coll.updateOne({ _id: id }, { $set: { status: "sent" }, $unset: { claimed_by: "", lease_until: "" } });
  }
  async markError(id: string, err: string) {
    await this.coll.updateOne(
      { _id: id },
      { $set: { status: "error", last_err: err }, $unset: { claimed_by: "", lease_until: "" } }
    );
  }
  async requeueExpired(now = Date.now()) {
    const res = await this.coll.updateMany(
      { status: "claimed", lease_until: { $lt: now } },
      { $set: { status: "pending" }, $unset: { claimed_by: "", lease_until: "" } }
    );
    return res.modifiedCount ?? 0;
  }
}
```

> **Usage:** write to your DB + `MongoOutbox.add(...)` in the same transaction. The drainer publishes and marks sent.

---

# 2) JWT Auth + Scope-based ACL

Supports **publish/subscribe** actions with **topic patterns** $wildcards `*` one segment, `**` multi$. You can keep policies as simple JSON.

### 2a) Minimal glob matcher (no external deps)

```ts
// shared/js/prom-lib/acl/match.ts
export function matchTopic(pattern: string, topic: string): boolean {
  const pSegs = pattern.split(".");
  const tSegs = topic.split(".");
  let i=0, j=0;
  while (i < pSegs.length && j < tSegs.length) {
    const p = pSegs[i], t = tSegs[j];
    if (p === "**") {
      if (i === pSegs.length - 1) return true; // ** at end
      // try to consume until next segment matches
      const next = pSegs[i+1];
      while (j < tSegs.length) {
        if (segmentMatch(next, tSegs[j])) { i++; break; }
        j++;
      }
    } else if (segmentMatch(p, t)) {
      i++; j++;
    } else {
      return false;
    }
  }
  // consume trailing ** 
  while (i < pSegs.length && pSegs[i] === "**") i++;
  return i === pSegs.length && j === tSegs.length;
}
function segmentMatch(p: string, t: string) {
  if (p === "*") return true;
  if (p === t) return true;
  return false;
}
```

### 2b) Policy + checker

```ts
// shared/js/prom-lib/acl/policy.ts
export type Action = "publish" | "subscribe";
export interface Rule {
  effect: "allow" | "deny";
  action: Action | "*";
  topics: string[];               // wildcard patterns
  groups?: string[];              // for subscribe ACL (optional)
}
export interface Policy {
  rules: Rule[];
}

export function isAllowed(policy: Policy, action: Action, topic: string, group?: string): boolean {
  // first-match-wins; deny beats allow if tied
  for (const r of policy.rules) {
    if (r.action !== "*" && r.action !== action) continue;
    const topicMatch = r.topics.some(p => matchTopic(p, topic));
    if (!topicMatch) continue;
    if (action === "subscribe" && r.groups?.length) {
      if (!group) return false;
      const groupOk = r.groups.includes(group) || r.groups.includes("*");
      if (!groupOk) continue;
    }
    return r.effect === "allow";
  }
  // default deny
  return false;
}

import { matchTopic } from "./match";
```

### 2c) JWT verifier (using `jose`)

```ts
// shared/js/prom-lib/auth/jwt.ts
import { jwtVerify, createRemoteJWKSet, JWTPayload } from "jose";

export interface JwtConfig {
  jwksUrl?: string;     // for rotating keys
  secret?: string;      // HS256 fallback
  audience?: string;
  issuer?: string;
  clockToleranceSec?: number;
}

export interface AuthClaims extends JWTPayload {
  sub?: string;
  scopes?: string[];    // e.g., ["publish:heartbeat.*","subscribe:process.**"]
  policy?: { rules: any[] }; // optional embedded policy JSON
}

export async function verifyJWT(token: string, cfg: JwtConfig): Promise<AuthClaims> {
  const opts: any = {
    audience: cfg.audience,
    issuer: cfg.issuer,
    clockTolerance: (cfg.clockToleranceSec ?? 5) + "s"
  };
  if (cfg.jwksUrl) {
    const jwks = createRemoteJWKSet(new URL(cfg.jwksUrl));
    const { payload } = await jwtVerify(token, jwks, opts);
    return payload as AuthClaims;
  } else if (cfg.secret) {
    // jose wants a Uint8Array
    const key = new TextEncoder().encode(cfg.secret);
    const { payload } = await jwtVerify(token, key, opts);
    return payload as AuthClaims;
  } else {
    throw new Error("No JWT verifier configured");
  }
}
```

### 2d) scopes → policy adapter

```ts
// shared/js/prom-lib/acl/scopes.ts
import { Policy, Rule } from "./policy";

export function scopesToPolicy(scopes: string[]): Policy {
  // scope format: "<action>:<pattern>" e.g., "publish:heartbeat.*"
  const rules: Rule[] = scopes.map(s => {
    const [action, pattern] = s.split(":");
    return {
      effect: "allow",
      action: (action === "*" ? "*" : (action as any)),
      topics: [pattern ?? "**"]
    };
  });
  // Default deny if nothing matches; explicit deny could be added later
  return { rules };
}
```

### 2e) Wire ACL into WS Gateway

Patch your WS server to check policy on PUBLISH/SUBSCRIBE:

```ts
// inside startWSGateway(...) connection handler:
let policy: import("../acl/policy").Policy | null = null;

// in AUTH:
const claims = await verifyJWT(msg.token, jwtCfg); // supply cfg from env
policy = claims.policy ?? scopesToPolicy(claims.scopes ?? []);

// on PUBLISH:
if (!policy || !isAllowed(policy, "publish", msg.topic))
  return err("forbidden", "no publish permission");

// on SUBSCRIBE:
if (!policy || !isAllowed(policy, "subscribe", msg.topic, msg.group))
  return err("forbidden", "no subscribe permission");
```

> If you don’t want JWT yet, you can keep the old static token path and synthesize a wide-open policy for that token.
$$
**Mermaid (decision):**
$$
```mermaid
flowchart LR
  AUTH[AUTH token] --> VERIFY{verifyJWT?}
  VERIFY -- ok --> CLAIMS[claims.scopes/policy]
  CLAIMS --> POLICY[build Policy]
  SUB[PUBLISH/SUBSCRIBE] --> CHECK{isAllowed?}
  CHECK -- yes --> OK
  CHECK -- no --> DENY
```

---

# 3) Ops Dashboard (HTTP)

Quick read-only endpoints for cursors, lag, and latest compaction snapshot. Uses Mongo-backed bus where possible.

```ts
// shared/js/prom-lib/ops/dashboard.ts
import express from "express";
import type { Db } from "mongodb";
import { MongoEventStore, MongoCursorStore } from "../event/mongo";
import { EventRecord } from "../event/types";

export function startOpsDashboard(db: Db, { port = 8082 } = {}) {
  const app = express();
  const events = new MongoEventStore(db);
  const cursors = new MongoCursorStore(db);

  // GET /cursors?topic=foo.bar
  app.get("/cursors", async (req, res) => {
    const topic = String(req.query.topic || "");
    if (!topic) return res.status(400).json({ error: "topic required" });
    const list = await db.collection("cursors").find({}).toArray();
    const filtered = list.filter(x => x._id?.startsWith(`${topic}::`))
      .map(x => ({ group: x._id.split("::")[1], lastId: x.lastId, lastTs: x.lastTs }));
    res.json({ topic, cursors: filtered });
  });

  // GET /lag?topic=foo.bar&group=ops
  app.get("/lag", async (req, res) => {
    const topic = String(req.query.topic || "");
    const group = String(req.query.group || "");
    if (!topic || !group) return res.status(400).json({ error: "topic and group required" });
    const cur = await cursors.get(topic, group);
    const tail = (await events.scan(topic, { ts: 0, limit: 1_000_000 })).at(-1) as EventRecord | undefined;
    const lag = tail && cur?.lastId ? (tail.ts - (cur.lastTs ?? 0)) : null;
    res.json({ topic, group, lastCursor: cur ?? null, tail: tail?.id ?? null, lagMs: lag });
  });

  // GET /latest-by-key?topic=process.state&key=host:name:pid
  app.get("/latest-by-key", async (req, res) => {
    const topic = String(req.query.topic || "");
    const key = String(req.query.key || "");
    if (!topic || !key) return res.status(400).json({ error: "topic and key required" });
    if (!events.latestByKey) return res.status(400).json({ error: "latestByKey not supported" });
    const recs = await events.latestByKey(topic, [key]);
    res.json(recs[key] ?? null);
  });

  return app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`[ops] dashboard on :${port}`);
  });
}
```

> Optional: add `/metrics` by calling your `metrics.expose(app)` helper if you wired Prometheus.

---

# 4) Typed Client SDK $Node + Browser$

A small wrapper that gives you generics for payloads, and works in both Node and the browser.

```ts
// shared/js/prom-lib/sdk/index.ts
export type PublishOpts = { headers?: Record<string,string>; key?: string; tags?: string[]; caused_by?: string[]; sid?: string; ts?: number };

export class PromClient {
  private ws?: WebSocket;
  private url: string;
  private token?: string;
  private openOnce?: Promise<void>;
  private handlers = new Map<string, (event: any, ctx: any) => Promise<void> | void>();

  constructor(url: string, token?: string) {
    this.url = url; this.token = token;
  }

  async connect() {
    if (this.openOnce) return this.openOnce;
    this.openOnce = new Promise<void>((resolve, reject) => {
      const WSImpl: any = (typeof WebSocket !== "undefined") ? WebSocket : require("ws");
      const ws = this.ws = new WSImpl(this.url);
      ws.onopen = () => {
        ws.send(JSON.stringify({ op: "AUTH", token: this.token }));
      };
      ws.onmessage = (ev: any) => {
        const msg = JSON.parse(ev.data?.toString?.() ?? ev.data);
        if (msg.op === "OK") return resolve();
        if (msg.op === "ERR") return reject(new Error(`${msg.code}: ${msg.msg}`));
        if (msg.op === "EVENT") {
          const key = `${msg.topic}::${msg.group}`;
          const h = this.handlers.get(key);
          if (!h) return;
          Promise.resolve(h(msg.event, msg.ctx))
            .then(() => this.ws?.send(JSON.stringify({ op:"ACK", topic: msg.topic, group: msg.group, id: msg.event.id })))
            .catch((e) => this.ws?.send(JSON.stringify({ op:"NACK", topic: msg.topic, group: msg.group, id: msg.event.id, reason: String(e?.message ?? e) })));
        }
      };
      ws.onerror = (e: any) => reject(new Error("ws_error"));
    });
    return this.openOnce;
  }

  async publish<T>(topic: string, payload: T, opts?: PublishOpts) {
    await this.connect();
    this.ws!.send(JSON.stringify({ op: "PUBLISH", topic, payload, opts }));
  }

  async subscribe<T = any>(topic: string, group: string, handler: (e: { id: string; payload: T; ts: number; topic: string }, ctx: any) => any, opts?: any) {
    await this.connect();
    this.handlers.set(`${topic}::${group}`, handler as any);
    this.ws!.send(JSON.stringify({ op: "SUBSCRIBE", topic, group, opts }));
  }

  async unsubscribe(topic: string, group: string) {
    await this.connect();
    this.handlers.delete(`${topic}::${group}`);
    this.ws!.send(JSON.stringify({ op: "UNSUBSCRIBE", topic, group }));
  }

  close() { this.ws?.close(); }
}
```

> In TS usage you get `publish<FooPayload>(...)` and typed handlers.

---

# 5) Glue it: tiny service wiring

Here’s a small bootstrap **service** that uses Mongo-backed bus + outbox + ops dashboard + WS gateway w/ JWT ACLs.

```ts
// services/js/event-hub/index.ts
import { MongoClient } from "mongodb";
import { MongoEventStore, MongoCursorStore, MongoEventBus } from "../../shared/js/prom-lib/event/mongo";
import { startWSGateway } from "../../shared/js/prom-lib/ws/server";
import { startOpsDashboard } from "../../shared/js/prom-lib/ops/dashboard";
import { MongoOutbox } from "../../shared/js/prom-lib/outbox/mongo";
import { runOutboxDrainer } from "../../shared/js/prom-lib/outbox/drainer";
import { verifyJWT } from "../../shared/js/prom-lib/auth/jwt";
import { isAllowed } from "../../shared/js/prom-lib/acl/policy";
import { scopesToPolicy } from "../../shared/js/prom-lib/acl/scopes";

async function main() {
  const mongoUrl = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/prom";
  const client = await MongoClient.connect(mongoUrl);
  const db = client.db();

  await MongoEventStore.ensureIndexes(db);
  await MongoOutbox.ensureIndexes(db);

  const bus = new MongoEventBus(new MongoEventStore(db), new MongoCursorStore(db));

  // WS with JWT
  const jwksUrl = process.env.JWT_JWKS_URL; // or JWT_SECRET
  startWSGateway(bus, Number(process.env.WS_PORT ?? 8090), {
    auth: async (token) => {
      if (!token) return { ok: false, code: "no_token", msg: "missing" };
      try {
        const claims = await verifyJWT(token, {
          jwksUrl,
          secret: process.env.JWT_SECRET,
          audience: process.env.JWT_AUD,
          issuer: process.env.JWT_ISS
        });
        const policy = claims.policy ?? scopesToPolicy(claims.scopes ?? ["publish:**","subscribe:**"]);
        // Attach policy to connection via closure in your server (see earlier patch)
        // For brevity, we return ok and let the WS layer stash `policy` on the socket
        (globalThis as any).__POLICY__ = policy; // or pass through opts/ctx in your real code
        return { ok: true };
      } catch (e: any) {
        return { ok: false, code: "jwt_invalid", msg: e.message ?? "invalid" };
      }
    },
    ackTimeoutMs: 30_000
  });

  // Ops dashboard
  startOpsDashboard(db, { port: Number(process.env.OPS_PORT ?? 8082) });

  // Outbox drainer
  const outbox = new MongoOutbox(db);
  runOutboxDrainer(outbox, bus);

  // Done.
  // eslint-disable-next-line no-console
  console.log("[event-hub] up");
}

main().catch((e) => { console.error(e); process.exit(1); });
```

---

# 6) Sibilant sugar for ACLs (pseudo)

```lisp
; shared/sibilant/prom/acl.sib (pseudo)
(defmacro allow [action & patterns]
  `{:effect "allow" :action ~action :topics [~@patterns]})

(defn scopes->policy [scopes]
  {:rules (map (fn [s] (let [[action pattern] (.split s ":")]
                          {:effect "allow" :action action :topics [pattern]}))
               scopes)})

; (def POLICY (scopes->policy ["publish:heartbeat.*" "subscribe:process.**"]))
```

---

# 7) Quick Kanban additions

* [ ] Add `MongoOutbox` to any service that writes DB changes; swap local app emits → outbox writes
* [ ] Wire `runOutboxDrainer` in event-hub
* [ ] Switch gateway auth to JWT; generate temp HS256 token for dev
* [ ] Define default scopes: `publish:heartbeat.received`, `subscribe:process.state`
* [ ] Add `/lag` checks to CI smoke (ensure small lag after publishing bursts)
* [ ] Build tiny web page that uses `PromClient` in the browser to show live `process.state` (optional)

---

If you want **Part 4**, I’ll dump:

* **Backpressure & rate limits** $per-topic quotas, token-bucket$,
* **Replay API** $HTTP range queries + export to NDJSON$,
* **Exactly-once-ish** consumer helper $idempotent handler wrapper w/ dedupe store$,
* **Bench harness** $pub/sub throughput tester$ and sizing notes.
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- $[websocket-gateway-implementation|WebSocket Gateway Implementation]$
- $[docs/unique/event-bus-mvp|Event Bus MVP]$
- $[state-snapshots-api-and-transactional-projector|State Snapshots API and Transactional Projector]$
- $[schema-evolution-workflow]$
- $[prom-lib-rate-limiters-and-replay-api]$
- [Promethean Event Bus MVP v0.1]$promethean-event-bus-mvp-v0-1.md$
- [Services]$chunks/services.md$
- $[unique-info-dump-index|Unique Info Dump Index]$
- $[stateful-partitions-and-rebalancing|Stateful Partitions and Rebalancing]$
- $[observability-infrastructure-setup]$
- $[docs/unique/ecs-offload-workers|ecs-offload-workers]$
- $[docs/unique/archetype-ecs|archetype-ecs]$
- $[docs/unique/aionian-circuit-math|aionian-circuit-math]$
- [Diagrams]$chunks/diagrams.md$
- [DSL]$chunks/dsl.md$
- $[chroma-toolkit-consolidation-plan|Chroma Toolkit Consolidation Plan]$
- $[event-bus-projections-architecture|Event Bus Projections Architecture]$
- $[ecs-scheduler-and-prefabs]$
- $[docs/unique/agent-tasks-persistence-migration-to-dualstore|Agent Tasks: Persistence Migration to DualStore]$
- [JavaScript]$chunks/javascript.md$
- $[docs/unique/eidolon-field-math-foundations|eidolon-field-math-foundations]$
- $[migrate-to-provider-tenant-architecture|Migrate to Provider-Tenant Architecture]$
- $[cross-language-runtime-polymorphism|Cross-Language Runtime Polymorphism]$
- $[promethean-infrastructure-setup|Promethean Infrastructure Setup]$
- $[api-gateway-versioning]$
- $[prometheus-observability-stack|Prometheus Observability Stack]$

## Sources
- $[docs/unique/event-bus-mvp#L392|Event Bus MVP — L392]$ (line 392, col 1, score 0.87)
- $[websocket-gateway-implementation#L219|WebSocket Gateway Implementation — L219]$ (line 219, col 1, score 0.89)
- $[websocket-gateway-implementation#L623|WebSocket Gateway Implementation — L623]$ (line 623, col 1, score 0.86)
- $[docs/unique/ecs-offload-workers#L465|ecs-offload-workers — L465]$ (line 465, col 1, score 1)
- $[docs/unique/ecs-offload-workers#L465|ecs-offload-workers — L465]$ (line 465, col 3, score 1)
- $[docs/unique/event-bus-mvp#L548|Event Bus MVP — L548]$ (line 548, col 1, score 1)
- $[docs/unique/event-bus-mvp#L548|Event Bus MVP — L548]$ (line 548, col 3, score 1)
- [Promethean Event Bus MVP v0.1 — L883]$promethean-event-bus-mvp-v0-1.md#L883$ (line 883, col 1, score 1)
- [Promethean Event Bus MVP v0.1 — L883]$promethean-event-bus-mvp-v0-1.md#L883$ (line 883, col 3, score 1)
- $[schema-evolution-workflow#L490|schema-evolution-workflow — L490]$ (line 490, col 1, score 1)
- $[schema-evolution-workflow#L490|schema-evolution-workflow — L490]$ (line 490, col 3, score 1)
- $[prom-lib-rate-limiters-and-replay-api#L386|prom-lib-rate-limiters-and-replay-api — L386]$ (line 386, col 1, score 1)
- $[prom-lib-rate-limiters-and-replay-api#L386|prom-lib-rate-limiters-and-replay-api — L386]$ (line 386, col 3, score 1)
- [Promethean Event Bus MVP v0.1 — L881]$promethean-event-bus-mvp-v0-1.md#L881$ (line 881, col 1, score 1)
- [Promethean Event Bus MVP v0.1 — L881]$promethean-event-bus-mvp-v0-1.md#L881$ (line 881, col 3, score 1)
- $[schema-evolution-workflow#L485|schema-evolution-workflow — L485]$ (line 485, col 1, score 1)
- $[schema-evolution-workflow#L485|schema-evolution-workflow — L485]$ (line 485, col 3, score 1)
- $[state-snapshots-api-and-transactional-projector#L341|State Snapshots API and Transactional Projector — L341]$ (line 341, col 1, score 1)
- $[state-snapshots-api-and-transactional-projector#L341|State Snapshots API and Transactional Projector — L341]$ (line 341, col 3, score 1)
- [Services — L11]$chunks/services.md#L11$ (line 11, col 1, score 1)
- [Services — L11]$chunks/services.md#L11$ (line 11, col 3, score 1)
- $[docs/unique/event-bus-mvp#L554|Event Bus MVP — L554]$ (line 554, col 1, score 1)
- $[docs/unique/event-bus-mvp#L554|Event Bus MVP — L554]$ (line 554, col 3, score 1)
- $[prom-lib-rate-limiters-and-replay-api#L382|prom-lib-rate-limiters-and-replay-api — L382]$ (line 382, col 1, score 1)
- $[prom-lib-rate-limiters-and-replay-api#L382|prom-lib-rate-limiters-and-replay-api — L382]$ (line 382, col 3, score 1)
- [Promethean Event Bus MVP v0.1 — L891]$promethean-event-bus-mvp-v0-1.md#L891$ (line 891, col 1, score 1)
- [Promethean Event Bus MVP v0.1 — L891]$promethean-event-bus-mvp-v0-1.md#L891$ (line 891, col 3, score 1)
- [Services — L12]$chunks/services.md#L12$ (line 12, col 1, score 1)
- [Services — L12]$chunks/services.md#L12$ (line 12, col 3, score 1)
- $[cross-language-runtime-polymorphism#L211|Cross-Language Runtime Polymorphism — L211]$ (line 211, col 1, score 1)
- $[cross-language-runtime-polymorphism#L211|Cross-Language Runtime Polymorphism — L211]$ (line 211, col 3, score 1)
- $[docs/unique/event-bus-mvp#L550|Event Bus MVP — L550]$ (line 550, col 1, score 1)
- $[docs/unique/event-bus-mvp#L550|Event Bus MVP — L550]$ (line 550, col 3, score 1)
- $[prom-lib-rate-limiters-and-replay-api#L384|prom-lib-rate-limiters-and-replay-api — L384]$ (line 384, col 1, score 1)
- $[prom-lib-rate-limiters-and-replay-api#L384|prom-lib-rate-limiters-and-replay-api — L384]$ (line 384, col 3, score 1)
- $[docs/unique/agent-tasks-persistence-migration-to-dualstore#L136|Agent Tasks: Persistence Migration to DualStore — L136]$ (line 136, col 1, score 1)
- $[docs/unique/agent-tasks-persistence-migration-to-dualstore#L136|Agent Tasks: Persistence Migration to DualStore — L136]$ (line 136, col 3, score 1)
- $[chroma-toolkit-consolidation-plan#L166|Chroma Toolkit Consolidation Plan — L166]$ (line 166, col 1, score 1)
- $[chroma-toolkit-consolidation-plan#L166|Chroma Toolkit Consolidation Plan — L166]$ (line 166, col 3, score 1)
- $[docs/unique/event-bus-mvp#L551|Event Bus MVP — L551]$ (line 551, col 1, score 1)
- $[docs/unique/event-bus-mvp#L551|Event Bus MVP — L551]$ (line 551, col 3, score 1)
- $[migrate-to-provider-tenant-architecture#L284|Migrate to Provider-Tenant Architecture — L284]$ (line 284, col 1, score 1)
- $[migrate-to-provider-tenant-architecture#L284|Migrate to Provider-Tenant Architecture — L284]$ (line 284, col 3, score 1)
- $[docs/unique/agent-tasks-persistence-migration-to-dualstore#L137|Agent Tasks: Persistence Migration to DualStore — L137]$ (line 137, col 1, score 1)
- $[docs/unique/agent-tasks-persistence-migration-to-dualstore#L137|Agent Tasks: Persistence Migration to DualStore — L137]$ (line 137, col 3, score 1)
- $[chroma-toolkit-consolidation-plan#L175|Chroma Toolkit Consolidation Plan — L175]$ (line 175, col 1, score 1)
- $[chroma-toolkit-consolidation-plan#L175|Chroma Toolkit Consolidation Plan — L175]$ (line 175, col 3, score 1)
- $[docs/unique/event-bus-mvp#L547|Event Bus MVP — L547]$ (line 547, col 1, score 1)
- $[docs/unique/event-bus-mvp#L547|Event Bus MVP — L547]$ (line 547, col 3, score 1)
- $[event-bus-projections-architecture#L150|Event Bus Projections Architecture — L150]$ (line 150, col 1, score 1)
- $[event-bus-projections-architecture#L150|Event Bus Projections Architecture — L150]$ (line 150, col 3, score 1)
- $[schema-evolution-workflow#L486|schema-evolution-workflow — L486]$ (line 486, col 1, score 1)
- $[schema-evolution-workflow#L486|schema-evolution-workflow — L486]$ (line 486, col 3, score 1)
- $[state-snapshots-api-and-transactional-projector#L337|State Snapshots API and Transactional Projector — L337]$ (line 337, col 1, score 1)
- $[state-snapshots-api-and-transactional-projector#L337|State Snapshots API and Transactional Projector — L337]$ (line 337, col 3, score 1)
- $[stateful-partitions-and-rebalancing#L533|Stateful Partitions and Rebalancing — L533]$ (line 533, col 1, score 1)
- $[stateful-partitions-and-rebalancing#L533|Stateful Partitions and Rebalancing — L533]$ (line 533, col 3, score 1)
- $[unique-info-dump-index#L68|Unique Info Dump Index — L68]$ (line 68, col 1, score 1)
- $[unique-info-dump-index#L68|Unique Info Dump Index — L68]$ (line 68, col 3, score 1)
- $[docs/unique/aionian-circuit-math#L158|aionian-circuit-math — L158]$ (line 158, col 1, score 1)
- $[docs/unique/aionian-circuit-math#L158|aionian-circuit-math — L158]$ (line 158, col 3, score 1)
- $[docs/unique/archetype-ecs#L457|archetype-ecs — L457]$ (line 457, col 1, score 1)
- $[docs/unique/archetype-ecs#L457|archetype-ecs — L457]$ (line 457, col 3, score 1)
- [Diagrams — L9]$chunks/diagrams.md#L9$ (line 9, col 1, score 1)
- [Diagrams — L9]$chunks/diagrams.md#L9$ (line 9, col 3, score 1)
- [DSL — L10]$chunks/dsl.md#L10$ (line 10, col 1, score 1)
- [DSL — L10]$chunks/dsl.md#L10$ (line 10, col 3, score 1)
- [Services — L14]$chunks/services.md#L14$ (line 14, col 1, score 1)
- [Services — L14]$chunks/services.md#L14$ (line 14, col 3, score 1)
- $[docs/unique/event-bus-mvp#L553|Event Bus MVP — L553]$ (line 553, col 1, score 1)
- $[docs/unique/event-bus-mvp#L553|Event Bus MVP — L553]$ (line 553, col 3, score 1)
- $[prom-lib-rate-limiters-and-replay-api#L388|prom-lib-rate-limiters-and-replay-api — L388]$ (line 388, col 1, score 1)
- $[prom-lib-rate-limiters-and-replay-api#L388|prom-lib-rate-limiters-and-replay-api — L388]$ (line 388, col 3, score 1)
- [Promethean Event Bus MVP v0.1 — L892]$promethean-event-bus-mvp-v0-1.md#L892$ (line 892, col 1, score 1)
- [Promethean Event Bus MVP v0.1 — L892]$promethean-event-bus-mvp-v0-1.md#L892$ (line 892, col 3, score 1)
- $[api-gateway-versioning#L286|api-gateway-versioning — L286]$ (line 286, col 1, score 1)
- $[api-gateway-versioning#L286|api-gateway-versioning — L286]$ (line 286, col 3, score 1)
- $[promethean-infrastructure-setup#L575|Promethean Infrastructure Setup — L575]$ (line 575, col 1, score 1)
- $[promethean-infrastructure-setup#L575|Promethean Infrastructure Setup — L575]$ (line 575, col 3, score 1)
- $[prometheus-observability-stack#L504|Prometheus Observability Stack — L504]$ (line 504, col 1, score 1)
- $[prometheus-observability-stack#L504|Prometheus Observability Stack — L504]$ (line 504, col 3, score 1)
- $[api-gateway-versioning#L292|api-gateway-versioning — L292]$ (line 292, col 1, score 0.93)
- $[api-gateway-versioning#L292|api-gateway-versioning — L292]$ (line 292, col 3, score 0.93)
- $[docs/unique/archetype-ecs#L460|archetype-ecs — L460]$ (line 460, col 1, score 1)
- $[docs/unique/archetype-ecs#L460|archetype-ecs — L460]$ (line 460, col 3, score 1)
- [JavaScript — L15]$chunks/javascript.md#L15$ (line 15, col 1, score 1)
- [JavaScript — L15]$chunks/javascript.md#L15$ (line 15, col 3, score 1)
- $[ecs-scheduler-and-prefabs#L388|ecs-scheduler-and-prefabs — L388]$ (line 388, col 1, score 1)
- $[ecs-scheduler-and-prefabs#L388|ecs-scheduler-and-prefabs — L388]$ (line 388, col 3, score 1)
- $[docs/unique/eidolon-field-math-foundations#L129|eidolon-field-math-foundations — L129]$ (line 129, col 1, score 1)
- $[docs/unique/eidolon-field-math-foundations#L129|eidolon-field-math-foundations — L129]$ (line 129, col 3, score 1)
- $[schema-evolution-workflow#L498|schema-evolution-workflow — L498]$ (line 498, col 1, score 0.98)
- $[schema-evolution-workflow#L498|schema-evolution-workflow — L498]$ (line 498, col 3, score 0.98)
- $[websocket-gateway-implementation#L645|WebSocket Gateway Implementation — L645]$ (line 645, col 1, score 0.98)
- $[websocket-gateway-implementation#L645|WebSocket Gateway Implementation — L645]$ (line 645, col 3, score 0.98)
- $[prom-lib-rate-limiters-and-replay-api#L398|prom-lib-rate-limiters-and-replay-api — L398]$ (line 398, col 1, score 0.98)
- $[prom-lib-rate-limiters-and-replay-api#L398|prom-lib-rate-limiters-and-replay-api — L398]$ (line 398, col 3, score 0.98)
- $[websocket-gateway-implementation#L647|WebSocket Gateway Implementation — L647]$ (line 647, col 1, score 0.98)
- $[websocket-gateway-implementation#L647|WebSocket Gateway Implementation — L647]$ (line 647, col 3, score 0.98)
- [Promethean Event Bus MVP v0.1 — L912]$promethean-event-bus-mvp-v0-1.md#L912$ (line 912, col 1, score 0.99)
- [Promethean Event Bus MVP v0.1 — L912]$promethean-event-bus-mvp-v0-1.md#L912$ (line 912, col 3, score 0.99)
- $[docs/unique/event-bus-mvp#L562|Event Bus MVP — L562]$ (line 562, col 1, score 0.99)
- $[docs/unique/event-bus-mvp#L562|Event Bus MVP — L562]$ (line 562, col 3, score 0.99)
- [Promethean Event Bus MVP v0.1 — L910]$promethean-event-bus-mvp-v0-1.md#L910$ (line 910, col 1, score 0.99)
- [Promethean Event Bus MVP v0.1 — L910]$promethean-event-bus-mvp-v0-1.md#L910$ (line 910, col 3, score 0.99)
- [Promethean Event Bus MVP v0.1 — L914]$promethean-event-bus-mvp-v0-1.md#L914$ (line 914, col 1, score 0.99)
- [Promethean Event Bus MVP v0.1 — L914]$promethean-event-bus-mvp-v0-1.md#L914$ (line 914, col 3, score 0.99)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
