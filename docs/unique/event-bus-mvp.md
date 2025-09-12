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
related_to_title:
  - Promethean Event Bus MVP v0.1
  - WebSocket Gateway Implementation
  - Mongo Outbox Implementation
  - schema-evolution-workflow
  - prom-lib-rate-limiters-and-replay-api
  - Voice Access Layer Design
  - Stateful Partitions and Rebalancing
  - State Snapshots API and Transactional Projector
  - Migrate to Provider-Tenant Architecture
  - Services
  - i3-bluetooth-setup
  - Local-First Intention→Code Loop with Free Models
  - ecs-offload-workers
  - Event Bus Projections Architecture
  - Chroma Toolkit Consolidation Plan
  - 'Agent Tasks: Persistence Migration to DualStore'
  - Fnord Tracer Protocol
  - observability-infrastructure-setup
  - Cross-Language Runtime Polymorphism
  - Prompt_Folder_Bootstrap
related_to_uuid:
  - fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
  - e811123d-5841-4e52-bf8c-978f26db4230
  - 9c1acd1e-c6a4-4a49-a66f-6da8b1bc9333
  - d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
  - aee4718b-9f8b-4635-a0c1-ef61c9bea8f1
  - 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
  - 4330e8f0-5f46-4235-918b-39b6b93fa561
  - 509e1cd5-367c-4a9d-a61b-cef2e85d42ce
  - 54382370-1931-4a19-a634-46735708a9ea
  - 75ea4a6a-8270-488d-9d37-799c288e5f70
  - 5e408692-0e74-400e-a617-84247c7353ad
  - 871490c7-a050-429b-88b2-55dfeaa1f8d5
  - 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
  - cf6b9b17-bb91-4219-aa5c-172cba02b2da
  - 5020e892-8f18-443a-b707-6d0f3efcfe22
  - 93d2ba51-8689-49ee-94e2-296092e48058
  - fc21f824-4244-4030-a48e-c4170160ea1d
  - b4e64f8c-4dc9-4941-a877-646c5ada068e
  - c34c36a6-80c9-4b44-a200-6448543b1b33
  - bd4f0976-0d5b-47f6-a20a-0601d1842dc1
references:
  - uuid: fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
    line: 28
    col: 1
    score: 0.93
  - uuid: aee4718b-9f8b-4635-a0c1-ef61c9bea8f1
    line: 282
    col: 1
    score: 0.86
  - uuid: aee4718b-9f8b-4635-a0c1-ef61c9bea8f1
    line: 260
    col: 1
    score: 0.86
  - uuid: fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
    line: 510
    col: 1
    score: 0.85
  - uuid: e811123d-5841-4e52-bf8c-978f26db4230
    line: 318
    col: 1
    score: 0.86
  - uuid: e811123d-5841-4e52-bf8c-978f26db4230
    line: 322
    col: 1
    score: 0.92
  - uuid: 9c1acd1e-c6a4-4a49-a66f-6da8b1bc9333
    line: 11
    col: 1
    score: 0.87
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 450
    col: 1
    score: 0.87
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
  - uuid: cf6b9b17-bb91-4219-aa5c-172cba02b2da
    line: 150
    col: 1
    score: 1
  - uuid: cf6b9b17-bb91-4219-aa5c-172cba02b2da
    line: 150
    col: 3
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 244
    col: 1
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 244
    col: 3
    score: 1
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 465
    col: 1
    score: 1
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 465
    col: 3
    score: 1
  - uuid: 9c1acd1e-c6a4-4a49-a66f-6da8b1bc9333
    line: 551
    col: 1
    score: 1
  - uuid: 9c1acd1e-c6a4-4a49-a66f-6da8b1bc9333
    line: 551
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
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 13
    col: 1
    score: 1
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 13
    col: 3
    score: 1
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 467
    col: 1
    score: 1
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 467
    col: 3
    score: 1
  - uuid: b4e64f8c-4dc9-4941-a877-646c5ada068e
    line: 364
    col: 1
    score: 1
  - uuid: b4e64f8c-4dc9-4941-a877-646c5ada068e
    line: 364
    col: 3
    score: 1
  - uuid: aee4718b-9f8b-4635-a0c1-ef61c9bea8f1
    line: 387
    col: 1
    score: 1
  - uuid: aee4718b-9f8b-4635-a0c1-ef61c9bea8f1
    line: 387
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
  - uuid: 9c1acd1e-c6a4-4a49-a66f-6da8b1bc9333
    line: 554
    col: 1
    score: 1
  - uuid: 9c1acd1e-c6a4-4a49-a66f-6da8b1bc9333
    line: 554
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
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 284
    col: 1
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 284
    col: 3
    score: 1
  - uuid: 9c1acd1e-c6a4-4a49-a66f-6da8b1bc9333
    line: 555
    col: 1
    score: 1
  - uuid: 9c1acd1e-c6a4-4a49-a66f-6da8b1bc9333
    line: 555
    col: 3
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 104
    col: 1
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 104
    col: 3
    score: 1
  - uuid: 871490c7-a050-429b-88b2-55dfeaa1f8d5
    line: 144
    col: 1
    score: 1
  - uuid: 871490c7-a050-429b-88b2-55dfeaa1f8d5
    line: 144
    col: 3
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 273
    col: 1
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 273
    col: 3
    score: 1
  - uuid: fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
    line: 893
    col: 1
    score: 1
  - uuid: fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
    line: 893
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
  - uuid: 9c1acd1e-c6a4-4a49-a66f-6da8b1bc9333
    line: 559
    col: 1
    score: 1
  - uuid: 9c1acd1e-c6a4-4a49-a66f-6da8b1bc9333
    line: 559
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
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 11
    col: 1
    score: 1
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 11
    col: 3
    score: 1
  - uuid: 9c1acd1e-c6a4-4a49-a66f-6da8b1bc9333
    line: 553
    col: 1
    score: 1
  - uuid: 9c1acd1e-c6a4-4a49-a66f-6da8b1bc9333
    line: 553
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
  - uuid: e811123d-5841-4e52-bf8c-978f26db4230
    line: 642
    col: 1
    score: 0.98
  - uuid: e811123d-5841-4e52-bf8c-978f26db4230
    line: 642
    col: 3
    score: 0.98
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 198
    col: 1
    score: 0.98
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 198
    col: 3
    score: 0.98
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 197
    col: 1
    score: 0.98
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 197
    col: 3
    score: 0.98
  - uuid: aee4718b-9f8b-4635-a0c1-ef61c9bea8f1
    line: 393
    col: 1
    score: 0.98
  - uuid: aee4718b-9f8b-4635-a0c1-ef61c9bea8f1
    line: 393
    col: 3
    score: 0.98
  - uuid: fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
    line: 904
    col: 1
    score: 0.99
  - uuid: fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
    line: 904
    col: 3
    score: 0.99
  - uuid: 509e1cd5-367c-4a9d-a61b-cef2e85d42ce
    line: 349
    col: 1
    score: 0.99
  - uuid: 509e1cd5-367c-4a9d-a61b-cef2e85d42ce
    line: 349
    col: 3
    score: 0.99
  - uuid: fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
    line: 906
    col: 1
    score: 0.98
  - uuid: fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
    line: 906
    col: 3
    score: 0.98
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 193
    col: 1
    score: 0.98
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 193
    col: 3
    score: 0.98
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 301
    col: 1
    score: 0.98
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 301
    col: 3
    score: 0.98
  - uuid: e811123d-5841-4e52-bf8c-978f26db4230
    line: 643
    col: 1
    score: 0.98
  - uuid: e811123d-5841-4e52-bf8c-978f26db4230
    line: 643
    col: 3
    score: 0.98
  - uuid: 509e1cd5-367c-4a9d-a61b-cef2e85d42ce
    line: 352
    col: 1
    score: 1
  - uuid: 509e1cd5-367c-4a9d-a61b-cef2e85d42ce
    line: 352
    col: 3
    score: 1
  - uuid: 9c1acd1e-c6a4-4a49-a66f-6da8b1bc9333
    line: 566
    col: 1
    score: 0.99
  - uuid: 9c1acd1e-c6a4-4a49-a66f-6da8b1bc9333
    line: 566
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
  - uuid: fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
    line: 912
    col: 1
    score: 0.99
  - uuid: fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
    line: 912
    col: 3
    score: 0.99
  - uuid: 9c1acd1e-c6a4-4a49-a66f-6da8b1bc9333
    line: 565
    col: 1
    score: 0.99
  - uuid: 9c1acd1e-c6a4-4a49-a66f-6da8b1bc9333
    line: 565
    col: 3
    score: 0.99
  - uuid: e811123d-5841-4e52-bf8c-978f26db4230
    line: 648
    col: 1
    score: 0.99
  - uuid: e811123d-5841-4e52-bf8c-978f26db4230
    line: 648
    col: 3
    score: 0.99
  - uuid: e811123d-5841-4e52-bf8c-978f26db4230
    line: 644
    col: 1
    score: 0.98
  - uuid: e811123d-5841-4e52-bf8c-978f26db4230
    line: 644
    col: 3
    score: 0.98
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 544
    col: 1
    score: 0.99
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 544
    col: 3
    score: 0.99
  - uuid: 509e1cd5-367c-4a9d-a61b-cef2e85d42ce
    line: 351
    col: 1
    score: 0.99
  - uuid: 509e1cd5-367c-4a9d-a61b-cef2e85d42ce
    line: 351
    col: 3
    score: 0.99
  - uuid: 509e1cd5-367c-4a9d-a61b-cef2e85d42ce
    line: 350
    col: 1
    score: 0.99
  - uuid: 509e1cd5-367c-4a9d-a61b-cef2e85d42ce
    line: 350
    col: 3
    score: 0.99
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 543
    col: 1
    score: 0.99
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 543
    col: 3
    score: 0.99
---
lol I’m not “insane,” I’m just well-fed and caffeinated. You’re absolutely a programmer; I’m just your obnoxiously fast coworker. Alright—more dump, less talk. Here’s a compact but _useful_ **Event Bus MVP** you can paste into `shared/js/prom-lib/event/` and wire up today.

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

## 2) In-memory adapter (`memory.ts`)

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
```

## 3) Example usage (`example.ts`)

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
})();
```

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
  }
}
```

## 5) Compaction topics (design)

Use **compaction** for streams that represent latest state by key (e.g., `process.state`, `agent.permission`, `kv.set`). In Mongo:

- Write every change as event with `{ topic, key, payload }`.
    
- Consumers that want _current_ state call `latestByKey(topic, keys[])`.
    
- Periodic compactor (or TTL) rewrites a **snapshot** topic, e.g. `process.state.snapshot`, containing `{ key, payload, ts }` for faster cold-start.
    

Minimal config sketch:

```ts
// shared/js/prom-lib/event/config.ts
export const Topics = {
  HeartbeatReceived: { name: "heartbeat.received", retentionDays: 3 },
  ProcessState:      { name: "process.state", compaction: true }, // keyed by process-id
  KvSet:             { name: "kv.set", compaction: true },        // keyed by path
} as const;
```

## 6) Outbox pattern (service-local durability)

Pattern for services that must not lose messages:

1. **Local outbox** table (Mongo or sqlite) with `{ id, topic, payload, status:'pending|sent|error', last_err? }`.
    
2. Business txn writes to its own DB and appends to outbox in the same txn.
    
3. A **drainer** publishes pending rows to EventBus; on success marks `sent`.
    

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
  Sub->>ES: scan(afterId=cursor.lastId)
  ES-->>Sub: [EventRecord...]
  Sub->>Sub: handler(e)
  Sub->>EB: ack(topic,group,id)
  EB->>CS: setCursor(topic,group,lastId=id)
```

## 9) Jest harness (tests you can run today)

`shared/js/prom-lib/jest.config.ts`

```ts
import type { Config } from "jest";
const config: Config = {
  testEnvironment: "node",
  transform: { "^.+\\.tsx?$": ["ts-jest", { tsconfig: true }] },
  testMatch: ["**/?(*.)+(spec|test).ts"],
  moduleFileExtensions: ["ts","js","json"],
  verbose: true
};
export default config;
```

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
    if (attempts === 1) throw new Error("boom");
  }, { from: "earliest" });

  await bus.publish("t.b", "x");
  await new Promise(r => setTimeout(r, 80));
  expect(attempts).toBeGreaterThanOrEqual(2);
});
```

## 10) Sibilant-flavored DSL sugar (pseudocode)

```lisp
; shared/sibilant/prom/event.sib (pseudo)
(defmacro define-topic (name opts)
  `{:name ~name :opts ~opts})

(defn publish! [bus topic payload & opts]
  (.publish bus topic payload (or opts {})))

(defn subscribe! [bus topic group handler & {:from "earliest" :batchSize 100}]
  (.subscribe bus topic group handler {:from from :batchSize batchSize}))

; usage
(def TOPIC-HEARTBEAT (define-topic "heartbeat.received" {:retentionDays 3}))
(defn on-heartbeat [e ctx] (do-something e.payload))

; (subscribe! bus TOPIC-HEARTBEAT.name "ops" on-heartbeat :from "earliest")
; (publish!  bus TOPIC-HEARTBEAT.name {:pid 42 :name "stt"})
```

---

If you want, next dump I can add:

- **WS gateway** (pub/sub over WebSocket with auth),
    
- **Backpressure & leases** (ack deadline + redelivery),
    
- **Compactor** job + snapshot topic,
    
- **Prometheus metrics** helper,
    
- **Examples**: `process.state` projector + heartbeat integration.
    

Say the word and I’ll shovel Part 2 onto you.
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
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

## Sources
- [Promethean Event Bus MVP v0.1 — L28](promethean-event-bus-mvp-v0-1.md#L28) (line 28, col 1, score 0.93)
- [prom-lib-rate-limiters-and-replay-api — L282](prom-lib-rate-limiters-and-replay-api.md#L282) (line 282, col 1, score 0.86)
- [prom-lib-rate-limiters-and-replay-api — L260](prom-lib-rate-limiters-and-replay-api.md#L260) (line 260, col 1, score 0.86)
- [Promethean Event Bus MVP v0.1 — L510](promethean-event-bus-mvp-v0-1.md#L510) (line 510, col 1, score 0.85)
- [WebSocket Gateway Implementation — L318](websocket-gateway-implementation.md#L318) (line 318, col 1, score 0.86)
- [WebSocket Gateway Implementation — L322](websocket-gateway-implementation.md#L322) (line 322, col 1, score 0.92)
- [Mongo Outbox Implementation — L11](mongo-outbox-implementation.md#L11) (line 11, col 1, score 0.87)
- [schema-evolution-workflow — L450](schema-evolution-workflow.md#L450) (line 450, col 1, score 0.87)
- [Agent Tasks: Persistence Migration to DualStore — L137](agent-tasks-persistence-migration-to-dualstore.md#L137) (line 137, col 1, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L137](agent-tasks-persistence-migration-to-dualstore.md#L137) (line 137, col 3, score 1)
- [Chroma Toolkit Consolidation Plan — L175](chroma-toolkit-consolidation-plan.md#L175) (line 175, col 1, score 1)
- [Chroma Toolkit Consolidation Plan — L175](chroma-toolkit-consolidation-plan.md#L175) (line 175, col 3, score 1)
- [Event Bus Projections Architecture — L150](event-bus-projections-architecture.md#L150) (line 150, col 1, score 1)
- [Event Bus Projections Architecture — L150](event-bus-projections-architecture.md#L150) (line 150, col 3, score 1)
- [Fnord Tracer Protocol — L244](fnord-tracer-protocol.md#L244) (line 244, col 1, score 1)
- [Fnord Tracer Protocol — L244](fnord-tracer-protocol.md#L244) (line 244, col 3, score 1)
- [ecs-offload-workers — L465](ecs-offload-workers.md#L465) (line 465, col 1, score 1)
- [ecs-offload-workers — L465](ecs-offload-workers.md#L465) (line 465, col 3, score 1)
- [Mongo Outbox Implementation — L551](mongo-outbox-implementation.md#L551) (line 551, col 1, score 1)
- [Mongo Outbox Implementation — L551](mongo-outbox-implementation.md#L551) (line 551, col 3, score 1)
- [Promethean Event Bus MVP v0.1 — L883](promethean-event-bus-mvp-v0-1.md#L883) (line 883, col 1, score 1)
- [Promethean Event Bus MVP v0.1 — L883](promethean-event-bus-mvp-v0-1.md#L883) (line 883, col 3, score 1)
- [schema-evolution-workflow — L490](schema-evolution-workflow.md#L490) (line 490, col 1, score 1)
- [schema-evolution-workflow — L490](schema-evolution-workflow.md#L490) (line 490, col 3, score 1)
- [Services — L13](chunks/services.md#L13) (line 13, col 1, score 1)
- [Services — L13](chunks/services.md#L13) (line 13, col 3, score 1)
- [ecs-offload-workers — L467](ecs-offload-workers.md#L467) (line 467, col 1, score 1)
- [ecs-offload-workers — L467](ecs-offload-workers.md#L467) (line 467, col 3, score 1)
- [observability-infrastructure-setup — L364](observability-infrastructure-setup.md#L364) (line 364, col 1, score 1)
- [observability-infrastructure-setup — L364](observability-infrastructure-setup.md#L364) (line 364, col 3, score 1)
- [prom-lib-rate-limiters-and-replay-api — L387](prom-lib-rate-limiters-and-replay-api.md#L387) (line 387, col 1, score 1)
- [prom-lib-rate-limiters-and-replay-api — L387](prom-lib-rate-limiters-and-replay-api.md#L387) (line 387, col 3, score 1)
- [Services — L12](chunks/services.md#L12) (line 12, col 1, score 1)
- [Services — L12](chunks/services.md#L12) (line 12, col 3, score 1)
- [Cross-Language Runtime Polymorphism — L211](cross-language-runtime-polymorphism.md#L211) (line 211, col 1, score 1)
- [Cross-Language Runtime Polymorphism — L211](cross-language-runtime-polymorphism.md#L211) (line 211, col 3, score 1)
- [Mongo Outbox Implementation — L554](mongo-outbox-implementation.md#L554) (line 554, col 1, score 1)
- [Mongo Outbox Implementation — L554](mongo-outbox-implementation.md#L554) (line 554, col 3, score 1)
- [prom-lib-rate-limiters-and-replay-api — L384](prom-lib-rate-limiters-and-replay-api.md#L384) (line 384, col 1, score 1)
- [prom-lib-rate-limiters-and-replay-api — L384](prom-lib-rate-limiters-and-replay-api.md#L384) (line 384, col 3, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L136](agent-tasks-persistence-migration-to-dualstore.md#L136) (line 136, col 1, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L136](agent-tasks-persistence-migration-to-dualstore.md#L136) (line 136, col 3, score 1)
- [Chroma Toolkit Consolidation Plan — L166](chroma-toolkit-consolidation-plan.md#L166) (line 166, col 1, score 1)
- [Chroma Toolkit Consolidation Plan — L166](chroma-toolkit-consolidation-plan.md#L166) (line 166, col 3, score 1)
- [Migrate to Provider-Tenant Architecture — L284](migrate-to-provider-tenant-architecture.md#L284) (line 284, col 1, score 1)
- [Migrate to Provider-Tenant Architecture — L284](migrate-to-provider-tenant-architecture.md#L284) (line 284, col 3, score 1)
- [Mongo Outbox Implementation — L555](mongo-outbox-implementation.md#L555) (line 555, col 1, score 1)
- [Mongo Outbox Implementation — L555](mongo-outbox-implementation.md#L555) (line 555, col 3, score 1)
- [i3-bluetooth-setup — L104](i3-bluetooth-setup.md#L104) (line 104, col 1, score 1)
- [i3-bluetooth-setup — L104](i3-bluetooth-setup.md#L104) (line 104, col 3, score 1)
- [Local-First Intention→Code Loop with Free Models — L144](local-first-intention-code-loop-with-free-models.md#L144) (line 144, col 1, score 1)
- [Local-First Intention→Code Loop with Free Models — L144](local-first-intention-code-loop-with-free-models.md#L144) (line 144, col 3, score 1)
- [Migrate to Provider-Tenant Architecture — L273](migrate-to-provider-tenant-architecture.md#L273) (line 273, col 1, score 1)
- [Migrate to Provider-Tenant Architecture — L273](migrate-to-provider-tenant-architecture.md#L273) (line 273, col 3, score 1)
- [Promethean Event Bus MVP v0.1 — L893](promethean-event-bus-mvp-v0-1.md#L893) (line 893, col 1, score 1)
- [Promethean Event Bus MVP v0.1 — L893](promethean-event-bus-mvp-v0-1.md#L893) (line 893, col 3, score 1)
- [Services — L14](chunks/services.md#L14) (line 14, col 1, score 1)
- [Services — L14](chunks/services.md#L14) (line 14, col 3, score 1)
- [Mongo Outbox Implementation — L559](mongo-outbox-implementation.md#L559) (line 559, col 1, score 1)
- [Mongo Outbox Implementation — L559](mongo-outbox-implementation.md#L559) (line 559, col 3, score 1)
- [prom-lib-rate-limiters-and-replay-api — L388](prom-lib-rate-limiters-and-replay-api.md#L388) (line 388, col 1, score 1)
- [prom-lib-rate-limiters-and-replay-api — L388](prom-lib-rate-limiters-and-replay-api.md#L388) (line 388, col 3, score 1)
- [Promethean Event Bus MVP v0.1 — L892](promethean-event-bus-mvp-v0-1.md#L892) (line 892, col 1, score 1)
- [Promethean Event Bus MVP v0.1 — L892](promethean-event-bus-mvp-v0-1.md#L892) (line 892, col 3, score 1)
- [Services — L11](chunks/services.md#L11) (line 11, col 1, score 1)
- [Services — L11](chunks/services.md#L11) (line 11, col 3, score 1)
- [Mongo Outbox Implementation — L553](mongo-outbox-implementation.md#L553) (line 553, col 1, score 1)
- [Mongo Outbox Implementation — L553](mongo-outbox-implementation.md#L553) (line 553, col 3, score 1)
- [prom-lib-rate-limiters-and-replay-api — L382](prom-lib-rate-limiters-and-replay-api.md#L382) (line 382, col 1, score 1)
- [prom-lib-rate-limiters-and-replay-api — L382](prom-lib-rate-limiters-and-replay-api.md#L382) (line 382, col 3, score 1)
- [Promethean Event Bus MVP v0.1 — L891](promethean-event-bus-mvp-v0-1.md#L891) (line 891, col 1, score 1)
- [Promethean Event Bus MVP v0.1 — L891](promethean-event-bus-mvp-v0-1.md#L891) (line 891, col 3, score 1)
- [WebSocket Gateway Implementation — L642](websocket-gateway-implementation.md#L642) (line 642, col 1, score 0.98)
- [WebSocket Gateway Implementation — L642](websocket-gateway-implementation.md#L642) (line 642, col 3, score 0.98)
- [Prompt_Folder_Bootstrap — L198](prompt-folder-bootstrap.md#L198) (line 198, col 1, score 0.98)
- [Prompt_Folder_Bootstrap — L198](prompt-folder-bootstrap.md#L198) (line 198, col 3, score 0.98)
- [Prompt_Folder_Bootstrap — L197](prompt-folder-bootstrap.md#L197) (line 197, col 1, score 0.98)
- [Prompt_Folder_Bootstrap — L197](prompt-folder-bootstrap.md#L197) (line 197, col 3, score 0.98)
- [prom-lib-rate-limiters-and-replay-api — L393](prom-lib-rate-limiters-and-replay-api.md#L393) (line 393, col 1, score 0.98)
- [prom-lib-rate-limiters-and-replay-api — L393](prom-lib-rate-limiters-and-replay-api.md#L393) (line 393, col 3, score 0.98)
- [Promethean Event Bus MVP v0.1 — L904](promethean-event-bus-mvp-v0-1.md#L904) (line 904, col 1, score 0.99)
- [Promethean Event Bus MVP v0.1 — L904](promethean-event-bus-mvp-v0-1.md#L904) (line 904, col 3, score 0.99)
- [State Snapshots API and Transactional Projector — L349](state-snapshots-api-and-transactional-projector.md#L349) (line 349, col 1, score 0.99)
- [State Snapshots API and Transactional Projector — L349](state-snapshots-api-and-transactional-projector.md#L349) (line 349, col 3, score 0.99)
- [Promethean Event Bus MVP v0.1 — L906](promethean-event-bus-mvp-v0-1.md#L906) (line 906, col 1, score 0.98)
- [Promethean Event Bus MVP v0.1 — L906](promethean-event-bus-mvp-v0-1.md#L906) (line 906, col 3, score 0.98)
- [Chroma Toolkit Consolidation Plan — L193](chroma-toolkit-consolidation-plan.md#L193) (line 193, col 1, score 0.98)
- [Chroma Toolkit Consolidation Plan — L193](chroma-toolkit-consolidation-plan.md#L193) (line 193, col 3, score 0.98)
- [Migrate to Provider-Tenant Architecture — L301](migrate-to-provider-tenant-architecture.md#L301) (line 301, col 1, score 0.98)
- [Migrate to Provider-Tenant Architecture — L301](migrate-to-provider-tenant-architecture.md#L301) (line 301, col 3, score 0.98)
- [WebSocket Gateway Implementation — L643](websocket-gateway-implementation.md#L643) (line 643, col 1, score 0.98)
- [WebSocket Gateway Implementation — L643](websocket-gateway-implementation.md#L643) (line 643, col 3, score 0.98)
- [State Snapshots API and Transactional Projector — L352](state-snapshots-api-and-transactional-projector.md#L352) (line 352, col 1, score 1)
- [State Snapshots API and Transactional Projector — L352](state-snapshots-api-and-transactional-projector.md#L352) (line 352, col 3, score 1)
- [Mongo Outbox Implementation — L566](mongo-outbox-implementation.md#L566) (line 566, col 1, score 0.99)
- [Mongo Outbox Implementation — L566](mongo-outbox-implementation.md#L566) (line 566, col 3, score 0.99)
- [Promethean Event Bus MVP v0.1 — L914](promethean-event-bus-mvp-v0-1.md#L914) (line 914, col 1, score 0.99)
- [Promethean Event Bus MVP v0.1 — L914](promethean-event-bus-mvp-v0-1.md#L914) (line 914, col 3, score 0.99)
- [Promethean Event Bus MVP v0.1 — L912](promethean-event-bus-mvp-v0-1.md#L912) (line 912, col 1, score 0.99)
- [Promethean Event Bus MVP v0.1 — L912](promethean-event-bus-mvp-v0-1.md#L912) (line 912, col 3, score 0.99)
- [Mongo Outbox Implementation — L565](mongo-outbox-implementation.md#L565) (line 565, col 1, score 0.99)
- [Mongo Outbox Implementation — L565](mongo-outbox-implementation.md#L565) (line 565, col 3, score 0.99)
- [WebSocket Gateway Implementation — L648](websocket-gateway-implementation.md#L648) (line 648, col 1, score 0.99)
- [WebSocket Gateway Implementation — L648](websocket-gateway-implementation.md#L648) (line 648, col 3, score 0.99)
- [WebSocket Gateway Implementation — L644](websocket-gateway-implementation.md#L644) (line 644, col 1, score 0.98)
- [WebSocket Gateway Implementation — L644](websocket-gateway-implementation.md#L644) (line 644, col 3, score 0.98)
- [Stateful Partitions and Rebalancing — L544](stateful-partitions-and-rebalancing.md#L544) (line 544, col 1, score 0.99)
- [Stateful Partitions and Rebalancing — L544](stateful-partitions-and-rebalancing.md#L544) (line 544, col 3, score 0.99)
- [State Snapshots API and Transactional Projector — L351](state-snapshots-api-and-transactional-projector.md#L351) (line 351, col 1, score 0.99)
- [State Snapshots API and Transactional Projector — L351](state-snapshots-api-and-transactional-projector.md#L351) (line 351, col 3, score 0.99)
- [State Snapshots API and Transactional Projector — L350](state-snapshots-api-and-transactional-projector.md#L350) (line 350, col 1, score 0.99)
- [State Snapshots API and Transactional Projector — L350](state-snapshots-api-and-transactional-projector.md#L350) (line 350, col 3, score 0.99)
- [Stateful Partitions and Rebalancing — L543](stateful-partitions-and-rebalancing.md#L543) (line 543, col 1, score 0.99)
- [Stateful Partitions and Rebalancing — L543](stateful-partitions-and-rebalancing.md#L543) (line 543, col 3, score 0.99)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
