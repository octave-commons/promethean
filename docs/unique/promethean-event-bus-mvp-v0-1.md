---
uuid: fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
created_at: 2025.08.08.15.08.23.md
filename: Promethean Event Bus MVP v0.1
description: >-
  A durable, at-least-once event bus for Node.js and WebSocket applications,
  using MongoDB for persistence and replayability. Supports consumer groups,
  offsets, acknowledgments, and backpressure. Integrates with existing WebSocket
  brokers.
tags:
  - event
  - bus
  - mvp
  - durable
  - at-least-once
  - mongodb
  - nodejs
  - websocket
  - replay
  - offsets
  - acks
  - backpressure
related_to_title: []
related_to_uuid: []
references: []
---
# Promethean Event Bus — MVP v0.1

A small, durable, **at-least-once** event bus that fits our stack (Node.js, WebSocket, MongoDB), integrates with the existing WS broker, and is easy to extend toward task queues. ^ref-fe7193a2-3-0

---

## Goals & Constraints

- **Durable**: events persisted in MongoDB, replayable by consumer groups. ^ref-fe7193a2-9-0
    
- **At-least-once** delivery** with **consumer-group offsets** and **acks**. ^ref-fe7193a2-11-0
    
- **Simple partitions**: hash(key) → partition (default `1`). ^ref-fe7193a2-13-0
    
- **Backpressure**: per-connection `max_inflight` (credit-based optional). ^ref-fe7193a2-15-0
    
- **Replay**: subscribe from `latest | offset | timestamp`. ^ref-fe7193a2-17-0
    
- **Observability**: minimal counters + system topics for metrics. ^ref-fe7193a2-19-0
    
- **Fits what we have**: plugs into the current `ws`-based broker and heartbeat.
    

---

## Core Data Structures (TypeScript)

```ts
export type UUID = string;
export type Vec8 = [number,number,number,number,number,number,number,number];

export interface BrokerEnvelope<T = unknown> {
  id: UUID;              // message id (uuidv7)
  ts: number;            // epoch ms
  topic: string;         // e.g. "heartbeat.received"
  key?: string;          // partitioning key
  partition?: number;    // assigned by broker
  headers?: Record<string, string>;
  payload_sha256?: string; // optional integrity
  payload: T;            // the actual message/event body
}

export interface EventRow<T = unknown> extends BrokerEnvelope<T> {
  offset: number;        // monotonically increasing per (topic, partition)
  attempts?: number;     // redelivery attempts (for DLQ policy)
}

export interface TopicConfig {
  topic: string;
  partitions: number;      // default 1
  retentionMs?: number;    // optional retention policy
  maxAttempts?: number;    // before DLQ
}

export interface GroupOffset {
  topic: string;
  partition: number;
  group: string;           // consumer group id
  lastCommitted: number;   // last acked offset
  updatedTs: number;
}

export interface SubscribeRequest {
  type: 'SUBSCRIBE';
  topic: string;
  group: string;                   // consumer group id
  from?: { kind: 'latest'|'offset'|'timestamp'; value?: number };
  max_inflight?: number;           // backpressure window
  filter?: { key?: string; header?: [string,string] };
}

export interface PublishRequest<T = unknown> {
  type: 'PUBLISH';
  topic: string;
  key?: string;
  headers?: Record<string,string>;
  payload: T;
}

export interface Ack {
  type: 'ACK'|'NACK';
  topic: string;
  partition: number;
  group: string;
  offset: number;
  reason?: string;         // for NACK
}
```
^ref-fe7193a2-28-0

---

## MongoDB Schema (collections & indexes)
 ^ref-fe7193a2-94-0
**collections**
 ^ref-fe7193a2-96-0
- `events`: append-only rows per event
 ^ref-fe7193a2-98-0
    - fields: `{ _id, topic, partition, offset, ts, id, key, headers, payload_sha256, payload, attempts }`
 ^ref-fe7193a2-100-0
    - unique index: `{ topic:1, partition:1, offset:1 }` (unique)
 ^ref-fe7193a2-102-0
    - index: `{ topic:1, partition:1, ts:1 }`
 ^ref-fe7193a2-104-0
- `counters`: one doc per `{topic, partition}` to allocate offsets
 ^ref-fe7193a2-106-0
    - fields: `{ _id:` ${topic}:${partition}`, nextOffset: number }`
 ^ref-fe7193a2-108-0
- `group_offsets`: commit state per consumer group
 ^ref-fe7193a2-110-0
    - fields: `{ _id:` ${topic}:${partition}:${group}`, topic, partition, group, lastCommitted, updatedTs }`
 ^ref-fe7193a2-112-0
    - index: `{ topic:1, partition:1, group:1 }` (unique)
 ^ref-fe7193a2-114-0
- `topic_configs`: optional static configs `{ topic, partitions, retentionMs?, maxAttempts? }`
    
 ^ref-fe7193a2-117-0
**retention**
 ^ref-fe7193a2-119-0
- Optional TTL if we don’t need infinite replay: use a job to purge `events` with `ts < now - retentionMs` per topic.
    

---

## Partitioning
 ^ref-fe7193a2-126-0
```ts
function assignPartition(topic: string, key: string|undefined, partitions = 1): number {
  if (!partitions || partitions <= 1) return 0;
  const k = key ?? `${Math.random()}`; // if no key, round-robin could be used instead
  let h = 0; for (let i = 0; i < k.length; i++) h = ((h << 5) - h) + k.charCodeAt(i) | 0;
  return Math.abs(h) % partitions;
}
^ref-fe7193a2-126-0
```

---

## Wire Protocol (WebSocket frames) ^ref-fe7193a2-139-0

Frames are JSON objects with a `type` discriminator. ^ref-fe7193a2-141-0

**Publish** ^ref-fe7193a2-143-0

```json
^ref-fe7193a2-143-0
{ "type":"PUBLISH", "topic":"system.metrics", "key":"duck-1", "headers":{ "ct":"json" }, "payload":{ "cpu":12.3 } } ^ref-fe7193a2-147-0
```
 ^ref-fe7193a2-149-0
**Subscribe**

^ref-fe7193a2-149-0
```json ^ref-fe7193a2-153-0
{ "type":"SUBSCRIBE", "topic":"heartbeat.received", "group":"monitor", "from":{ "kind":"latest" }, "max_inflight":32 }
```
^ref-fe7193a2-155-0

**Server → Client delivery**

```json
{
  "type":"MESSAGE",
  "topic":"heartbeat.received",
  "partition":0,
  "group":"monitor",
^ref-fe7193a2-155-0
  "offset":1042, ^ref-fe7193a2-166-0
  "envelope":{ "id":"01J9...", "ts":1723140000000, "topic":"heartbeat.received", "key":"proc:stt", "partition":0, "payload":{ "pid":1234, "name":"stt" } }
}
^ref-fe7193a2-168-0
^ref-fe7193a2-166-0
``` ^ref-fe7193a2-172-0
^ref-fe7193a2-166-0
^ref-fe7193a2-168-0 ^ref-fe7193a2-174-0
^ref-fe7193a2-166-0 ^ref-fe7193a2-174-0

^ref-fe7193a2-168-0
**Ack/Nack** ^ref-fe7193a2-172-0

^ref-fe7193a2-174-0
```json
{ "type":"ACK", "topic":"heartbeat.received", "partition":0, "group":"monitor", "offset":1042 }
``` ^ref-fe7193a2-182-0
^ref-fe7193a2-174-0
 ^ref-fe7193a2-184-0
**Optional flow control (credits)** ^ref-fe7193a2-186-0
^ref-fe7193a2-182-0 ^ref-fe7193a2-184-0

```json ^ref-fe7193a2-186-0
^ref-fe7193a2-188-0
^ref-fe7193a2-186-0 ^ref-fe7193a2-190-0
{ "type":"FLOW", "credits":50 } ^ref-fe7193a2-182-0
^ref-fe7193a2-190-0
``` ^ref-fe7193a2-188-0
 ^ref-fe7193a2-184-0
--- ^ref-fe7193a2-190-0
 ^ref-fe7193a2-186-0 ^ref-fe7193a2-197-0
## Delivery Semantics
 ^ref-fe7193a2-188-0 ^ref-fe7193a2-197-0
- **At-least-once**: messages may redeliver after timeouts or broker restarts.
 ^ref-fe7193a2-190-0
- **Ack** commits the consumer group’s offset up to `offset` (inclusive).
 ^ref-fe7193a2-197-0
- **In-flight window**: server won’t exceed `max_inflight` unacked messages per connection/group.
    
- **Redelivery**: if `ACK` not received within `ACK_TIMEOUT_MS` (e.g., 30s), the message is eligible for redelivery to any active connection in the same group.
    
- **DLQ**: if attempts > `maxAttempts`, broker moves the event to `${topic}.DLQ` with original metadata.
    

---

## Minimal Broker Flow (high-level)

```mermaid
sequenceDiagram
  participant C as Client
  participant B as Broker
  participant M as MongoDB

  C->>B: SUBSCRIBE(topic, group, from=latest, max_inflight=32)
  B->>M: read group_offsets / tail pointer
  B-->>C: OK

  C->>B: PUBLISH(topic, key, payload)
^ref-fe7193a2-197-0
  B->>M: allocate offset (counters.$inc) & insert events row
  B-->>C: PUBLISHED(offset)
^ref-fe7193a2-222-0
^ref-fe7193a2-220-0

^ref-fe7193a2-222-0
^ref-fe7193a2-220-0
  B->>C: MESSAGE(topic, partition, offset, envelope)
  C->>B: ACK(offset) ^ref-fe7193a2-220-0 ^ref-fe7193a2-233-0
^ref-fe7193a2-235-0
^ref-fe7193a2-233-0
^ref-fe7193a2-222-0
^ref-fe7193a2-220-0
  B->>M: update group_offsets.lastCommitted
``` ^ref-fe7193a2-235-0

---

## Broker Algorithms (pseudo)

**Publisher**

```ts
async function publish(req: PublishRequest) {
^ref-fe7193a2-222-0
  const cfg = await topics.getConfig(req.topic); ^ref-fe7193a2-233-0
^ref-fe7193a2-235-0
^ref-fe7193a2-233-0
  const p = assignPartition(req.topic, req.key, cfg.partitions);
^ref-fe7193a2-248-0 ^ref-fe7193a2-250-0
^ref-fe7193a2-250-0 ^ref-fe7193a2-257-0
^ref-fe7193a2-248-0
  const { value: nextOffset } = await counters.inc(`${req.topic}:${p}`); ^ref-fe7193a2-259-0
  const row: EventRow = { ...req, id: uuidv7(), ts: Date.now(), partition: p, offset: nextOffset, headers: req.headers ?? {} };
  await events.insert(row);
  deliverer.wake(req.topic, p); // nudge delivery loop
}
```

**Delivery loop (per topic/partition/group)**

```ts
async function deliver(topic: string, p: number, group: string, conn: WsConn) {
  const window = conn.window(group); // max_inflight - inflight
^ref-fe7193a2-235-0
  if (window <= 0) return; ^ref-fe7193a2-248-0
^ref-fe7193a2-257-0
^ref-fe7193a2-250-0 ^ref-fe7193a2-259-0
^ref-fe7193a2-248-0
  const from = await offsets.getCommitted(topic, p, group) + 1;
  const rows = await events.find({ topic, partition: p, offset: { $gte: from } }).limit(window).toArray();
^ref-fe7193a2-259-0
^ref-fe7193a2-276-0
^ref-fe7193a2-274-0
^ref-fe7193a2-272-0
^ref-fe7193a2-257-0
  for (const row of rows) { ^ref-fe7193a2-272-0
    conn.send({ type:'MESSAGE', topic, partition:p, group, offset: row.offset, envelope: row });
    tracker.addInflight(conn, group, topic, p, row.offset, Date.now() + ACK_TIMEOUT_MS);
  }
}
^ref-fe7193a2-250-0
``` ^ref-fe7193a2-257-0
^ref-fe7193a2-287-0
^ref-fe7193a2-285-0
^ref-fe7193a2-276-0
^ref-fe7193a2-274-0
 ^ref-fe7193a2-294-0
**Ack**

```ts
async function ack({ topic, partition, group, offset }: Ack) { ^ref-fe7193a2-285-0
  await offsets.commitMax(topic, partition, group, offset);
  tracker.clearInflight(group, topic, partition, offset);
}
```
^ref-fe7193a2-276-0
^ref-fe7193a2-274-0
^ref-fe7193a2-272-0
^ref-fe7193a2-259-0
^ref-fe7193a2-287-0 ^ref-fe7193a2-294-0

**Redelivery sweep**
 ^ref-fe7193a2-285-0
```ts
setInterval(() => { ^ref-fe7193a2-272-0 ^ref-fe7193a2-287-0
  for (const lease of tracker.expiredLeases()) {
    const conn = pickActiveConnection(lease.group, lease.topic, lease.partition); ^ref-fe7193a2-274-0
    if (conn) replay(lease, conn); else /* wait */
  } ^ref-fe7193a2-276-0
}, 1000);
```
 ^ref-fe7193a2-294-0
---

## System Topics (built-ins)

- `system.metrics` — counters, gauges (emitted by broker)
 ^ref-fe7193a2-285-0 ^ref-fe7193a2-325-0
- `system.bus.dlq` — DLQ mirror (or per-topic `${topic}.DLQ`)
 ^ref-fe7193a2-287-0
- `system.bus.audit` — broker decisions (publish, ack, redelivery)
    

--- ^ref-fe7193a2-331-0

## Security / Permissions (hook points)

- **Publish ACL**: per-topic `allow:[agents]`/`deny:[agents]` in `topic_configs`.
    
- **Subscribe ACL**: per-topic/group allowlist.
    
- **Headers**: carry `agent_id`, `sid`, `scopes` (aligns with your Circuit 2 permissions).
    

---

## Minimal Node.js Service Skeleton

```ts
import WebSocket, { WebSocketServer } from 'ws';
import { MongoClient } from 'mongodb';

const wss = new WebSocketServer({ port: process.env.BUS_PORT ? Number(process.env.BUS_PORT) : 7070 });
const mongo = new MongoClient(process.env.MONGO_URL!);

// maps: topic->partition->group->Set<Conn>
const subs = new Map<string, Map<number, Map<string, Set<WebSocket>>>>();

wss.on('connection', (ws) => {
  ws.on('message', async (buf) => {
^ref-fe7193a2-331-0 ^ref-fe7193a2-333-0
^ref-fe7193a2-325-0
    const msg = JSON.parse(buf.toString());
    switch (msg.type) {
^ref-fe7193a2-294-0
^ref-fe7193a2-348-0 ^ref-fe7193a2-350-0
^ref-fe7193a2-346-0
^ref-fe7193a2-342-0 ^ref-fe7193a2-352-0
^ref-fe7193a2-340-0
^ref-fe7193a2-333-0 ^ref-fe7193a2-354-0
^ref-fe7193a2-331-0
^ref-fe7193a2-365-0 ^ref-fe7193a2-369-0
^ref-fe7193a2-358-0
^ref-fe7193a2-356-0 ^ref-fe7193a2-371-0
^ref-fe7193a2-354-0
^ref-fe7193a2-352-0 ^ref-fe7193a2-373-0
^ref-fe7193a2-350-0
^ref-fe7193a2-348-0
^ref-fe7193a2-346-0
^ref-fe7193a2-342-0
^ref-fe7193a2-340-0
^ref-fe7193a2-333-0
^ref-fe7193a2-325-0 ^ref-fe7193a2-356-0 ^ref-fe7193a2-380-0
      case 'SUBSCRIBE': /* register, start delivery loop */ break;
      case 'PUBLISH':   /* append and notify */ break; ^ref-fe7193a2-358-0
      case 'ACK':       /* commit and free inflight */ break; ^ref-fe7193a2-340-0
      case 'NACK':      /* bump attempts, maybe DLQ */ break;
      case 'FLOW':      /* adjust window */ break; ^ref-fe7193a2-325-0 ^ref-fe7193a2-342-0
    }
  });
});
 ^ref-fe7193a2-346-0 ^ref-fe7193a2-365-0
async function main(){ await mongo.connect(); /* create indexes & start sweeps */ }
main().catch(console.error); ^ref-fe7193a2-331-0 ^ref-fe7193a2-348-0
```
 ^ref-fe7193a2-333-0 ^ref-fe7193a2-350-0 ^ref-fe7193a2-369-0 ^ref-fe7193a2-393-0
---
 ^ref-fe7193a2-352-0 ^ref-fe7193a2-371-0 ^ref-fe7193a2-395-0
## Testing Recipe (dev harness)
 ^ref-fe7193a2-354-0 ^ref-fe7193a2-373-0
1. Start MongoDB; run broker.
 ^ref-fe7193a2-356-0
2. `ws-pub` script publishes N events/sec on `test.topic`. ^ref-fe7193a2-340-0
 ^ref-fe7193a2-358-0
3. `ws-sub` script joins group `g1`, `from=offset(0)`, `max_inflight=10`; verify acks advance offsets. ^ref-fe7193a2-342-0
    
4. Kill/restart broker: ensure subscriber resumes from committed offset. ^ref-fe7193a2-380-0
    
5. Disable ACK: observe redeliveries and DLQ after `maxAttempts`. ^ref-fe7193a2-346-0
    
 ^ref-fe7193a2-348-0 ^ref-fe7193a2-365-0
---
 ^ref-fe7193a2-350-0
## Kanban — Event Bus Track (add these)
 ^ref-fe7193a2-352-0 ^ref-fe7193a2-369-0
-  Create Mongo indexes & counters bootstrap script
 ^ref-fe7193a2-354-0 ^ref-fe7193a2-371-0
-  Implement `PUBLISH` → counters `$inc` + insert + notify
 ^ref-fe7193a2-356-0 ^ref-fe7193a2-373-0
-  Implement `SUBSCRIBE` + delivery loop w/ `max_inflight` ^ref-fe7193a2-393-0
 ^ref-fe7193a2-358-0
-  Implement `ACK` commit + redelivery sweep ^ref-fe7193a2-395-0
    
-  Add `${topic}.DLQ` publishing
    
-  Emit `system.bus.audit` events for publish/ack/redelivery ^ref-fe7193a2-380-0 ^ref-fe7193a2-423-0
    
-  Add optional `FLOW` credits (beyond `max_inflight`) ^ref-fe7193a2-365-0
    
-  Add HTTP endpoints: `POST /topics`, `GET /topics/:id/offsets`, `GET /stats`
    
-  Integrate with Heartbeat service (publish heartbeats to `heartbeat.received`) ^ref-fe7193a2-369-0
    
-  Bench: 1k msgs/sec, 10 consumers, latency < 50ms p50 on LAN ^ref-fe7193a2-371-0
    
 ^ref-fe7193a2-373-0
---

## Nice-to-haves (later) ^ref-fe7193a2-393-0

- Consumer **sticky sessions** per partition for locality
    
- **Change Streams** fast-path for new events
    
- **Outbox** pattern helper (service-local table → bus drainer)
    
- **Compaction** mode for key-based state (à la Kafka compacted topics)
^ref-fe7193a2-395-0
    
- **Schema registry** (zod types, versioning) ^ref-fe7193a2-423-0
    
^ref-fe7193a2-380-0

---

## Appendix — zod Types (optional)
 ^ref-fe7193a2-393-0
```ts
import { z } from 'zod';
export const EnvelopeZ = z.object({
  id: z.string(), ts: z.number(), topic: z.string(), key: z.string().optional(), partition: z.number().optional(), headers: z.record(z.string()).optional(), payload_sha256: z.string().optional(), payload: z.unknown(),
});
export const EventRowZ = EnvelopeZ.extend({ offset: z.number(), attempts: z.number().optional() });
export const SubscribeZ = z.object({ type: z.literal('SUBSCRIBE'), topic: z.string(), group: z.string(), from: z.object({ kind: z.enum(['latest','offset','timestamp']), value: z.number().optional() }).optional(), max_inflight: z.number().default(32), filter: z.object({ key: z.string().optional(), header: z.tuple([z.string(), z.string()]).optional() }).optional() });
```

---

# prom-lib (JS/TS SDK)

A general-purpose library to minimize service-specific code. Lives in `shared/js/prom-lib`.

```text
shared/js/prom-lib/
  src/
    bus/
      types.ts ^ref-fe7193a2-474-0
      schema.ts
      util.ts
      acls.ts
^ref-fe7193a2-423-0
      metrics.ts
      client.ts
      server.ts
^ref-fe7193a2-395-0
      storage/
        memory.ts
        mongo.ts
    outbox/
      mongo_outbox.ts
    task/
      types.ts
      queue.ts
    logging/
      logger.ts
  package.json
  tsconfig.json
  README.md
```

## `bus/types.ts`

```ts
export type UUID = string;
export type Millis = number;
export type Partition = number;

export type Vec8 = [number,number,number,number,number,number,number,number];

export interface BrokerEnvelope<T = unknown> {
  id: UUID;
  ts: Millis;
  topic: string;
  key?: string;
  partition?: Partition;
  headers?: Record<string, string>;
  payload_sha256?: string;
  payload: T;
}

export interface EventRow<T = unknown> extends BrokerEnvelope<T> {
  offset: number;
  attempts?: number;
}

export interface TopicConfig {
  topic: string;
  partitions: number;
  retentionMs?: number;
  maxAttempts?: number;
^ref-fe7193a2-510-0
^ref-fe7193a2-497-0
  publishACL?: string[];   // agent ids or roles
  subscribeACL?: string[]; // agent ids or roles
^ref-fe7193a2-474-0
^ref-fe7193a2-497-0
^ref-fe7193a2-474-0
}

export interface GroupOffset { topic: string; partition: number; group: string; lastCommitted: number; updatedTs: number; }
^ref-fe7193a2-423-0

export type FromSpec = { kind: 'latest'|'offset'|'timestamp'; value?: number };

export interface SubscribeRequest {
  type: 'SUBSCRIBE'; topic: string; group: string; from?: FromSpec; max_inflight?: number;
  filter?: { key?: string; header?: [string,string] };
}

export interface PublishRequest<T = unknown> { type: 'PUBLISH'; topic: string; key?: string; headers?: Record<string,string>; payload: T; }
export interface Ack { type: 'ACK'|'NACK'; topic: string; partition: number; group: string; offset: number; reason?: string; }

export interface IMessageFrame<T = unknown> { type: 'MESSAGE'; topic: string; partition: number; group: string; offset: number; envelope: BrokerEnvelope<T> & { offset?: number } }

export interface Flow { type: 'FLOW'; credits: number }
```

## `bus/schema.ts` (zod)

```ts
import { z } from 'zod';
^ref-fe7193a2-510-0
^ref-fe7193a2-510-0
^ref-fe7193a2-497-0

export const EnvelopeZ = z.object({
^ref-fe7193a2-474-0
  id: z.string(), ts: z.number(), topic: z.string(), key: z.string().optional(), partition: z.number().optional(),
  headers: z.record(z.string()).optional(), payload_sha256: z.string().optional(), payload: z.unknown(),
});

export const EventRowZ = EnvelopeZ.extend({ offset: z.number(), attempts: z.number().optional() });

export const SubscribeZ = z.object({
  type: z.literal('SUBSCRIBE'), topic: z.string(), group: z.string(),
  from: z.object({ kind: z.enum(['latest','offset','timestamp']), value: z.number().optional() }).optional(),
  max_inflight: z.number().default(32),
  filter: z.object({ key: z.string().optional(), header: z.tuple([z.string(), z.string()]).optional() }).optional(),
});
^ref-fe7193a2-497-0

export const PublishZ = z.object({ type: z.literal('PUBLISH'), topic: z.string(), key: z.string().optional(), headers: z.record(z.string()).optional(), payload: z.unknown() });
export const AckZ = z.object({ type: z.enum(['ACK','NACK']), topic: z.string(), partition: z.number(), group: z.string(), offset: z.number(), reason: z.string().optional() });
```

## `bus/util.ts`

```ts
export function uuidv7(): string { /* pluggable impl; use @lukeed/uuid or your own */ return crypto.randomUUID(); }
export function now(): number { return Date.now(); }
export function assignPartition(key: string|undefined, partitions = 1): number {
  if (!partitions || partitions <= 1) return 0;
  const k = key ?? `${Math.random()}`;
  let h = 0; for (let i = 0; i < k.length; i++) h = ((h << 5) - h) + k.charCodeAt(i) | 0;
  return Math.abs(h) % partitions;
}
```

## `bus/storage/mongo.ts`

```ts
import { Collection, Db, MongoClient } from 'mongodb';
import { EventRow, GroupOffset, TopicConfig } from '../types';

export class MongoStorage {
  private events!: Collection<EventRow>;
  private counters!: Collection<{ _id: string; nextOffset: number }>; // _id: `${topic}:${partition}`
  private offsets!: Collection<GroupOffset>;
  private topicConfigs!: Collection<TopicConfig>;

  constructor(private db: Db) {}

  static async connect(url: string, dbName: string) {
    const client = new MongoClient(url); await client.connect();
    const db = client.db(dbName); const store = new MongoStorage(db); await store.init(); return store;
  }

  async init() {
    this.events = this.db.collection('events');
    this.counters = this.db.collection('counters');
    this.offsets = this.db.collection('group_offsets');
    this.topicConfigs = this.db.collection('topic_configs');
    await this.events.createIndex({ topic:1, partition:1, offset:1 }, { unique: true });
    await this.events.createIndex({ topic:1, partition:1, ts:1 });
    await this.offsets.createIndex({ topic:1, partition:1, group:1 }, { unique: true });
  }

  async getConfig(topic: string): Promise<TopicConfig> {
    return await this.topicConfigs.findOne({ topic }) || { topic, partitions: 1 };
  }

  async nextOffset(topic: string, partition: number): Promise<number> {
    const id = `${topic}:${partition}`;
    const res = await this.counters.findOneAndUpdate(
      { _id: id }, { $inc: { nextOffset: 1 } }, { upsert: true, returnDocument: 'after' },
    );
    return res.value!.nextOffset;
^ref-fe7193a2-604-0
  }
^ref-fe7193a2-572-0
^ref-fe7193a2-604-0
^ref-fe7193a2-572-0

  async insertEvent(row: EventRow) { await this.events.insertOne(row); }

^ref-fe7193a2-510-0
  async readFrom(topic: string, partition: number, offset: number, limit: number) {
    return await this.events.find({ topic, partition, offset: { $gte: offset } }).sort({ offset: 1 }).limit(limit).toArray();
  }

  async committed(topic: string, partition: number, group: string): Promise<number> {
    const g = await this.offsets.findOne({ topic, partition, group });
    return g?.lastCommitted ?? 0;
  }

  async commit(topic: string, partition: number, group: string, offset: number) {
    await this.offsets.updateOne(
      { topic, partition, group },
      { $max: { lastCommitted: offset }, $set: { updatedTs: Date.now() } },
      { upsert: true },
    );
  }
}
```

## `bus/storage/memory.ts` (for tests)

```ts
import { EventRow } from '../types';

export class MemoryStorage {
  private rows = new Map<string, EventRow[]>();
  private commits = new Map<string, number>();
  private counters = new Map<string, number>();
^ref-fe7193a2-604-0

  key(topic: string, p: number) { return `${topic}:${p}`; }

^ref-fe7193a2-572-0
  async nextOffset(topic: string, p: number) {
    const k = this.key(topic, p);
    const n = (this.counters.get(k) ?? 0) + 1; this.counters.set(k, n); return n;
  }

  async insertEvent(row: EventRow) {
    const k = this.key(row.topic, row.partition!);
    const arr = this.rows.get(k) ?? []; arr.push(row); this.rows.set(k, arr);
  }

  async readFrom(topic: string, p: number, offset: number, limit: number) {
    const arr = this.rows.get(this.key(topic, p)) ?? [];
    return arr.filter(r => r.offset >= offset).slice(0, limit);
  }

  async committed(topic: string, p: number, g: string) { return this.commits.get(`${topic}:${p}:${g}`) ?? 0; }
  async commit(topic: string, p: number, g: string, off: number) { this.commits.set(`${topic}:${p}:${g}`, Math.max(off, await this.committed(topic,p,g))); }
}
```

## `bus/server.ts`

```ts
import WebSocket, { WebSocketServer } from 'ws';
import { MongoStorage } from './storage/mongo';
import { PublishRequest, SubscribeRequest, Ack, EventRow } from './types';
import { assignPartition } from './util';

export class BrokerServer {
  private subs = new Map<string, Map<number, Map<string, Set<WebSocket>>>>();
  private inflight = new Map<string, { deadline: number; ws: WebSocket }>();
  private ACK_TIMEOUT_MS = 30_000;

  constructor(private store: MongoStorage, private wss: WebSocketServer) {
    wss.on('connection', (ws) => this.onConn(ws));
    setInterval(() => this.redeliverySweep(), 1000);
  }

  private subset(topic: string, p: number, group: string) {
    if (!this.subs.has(topic)) this.subs.set(topic, new Map());
    const parts = this.subs.get(topic)!; if (!parts.has(p)) parts.set(p, new Map());
    const groups = parts.get(p)!; if (!groups.has(group)) groups.set(group, new Set());
    return groups.get(group)!;
  }

  private onConn(ws: WebSocket) {
    ws.on('message', (buf) => this.onMessage(ws, buf));
  }

  private async onMessage(ws: WebSocket, buf: WebSocket.RawData) {
    const msg = JSON.parse(buf.toString());
    if (msg.type === 'PUBLISH') return this.handlePublish(ws, msg as PublishRequest);
    if (msg.type === 'SUBSCRIBE') return this.handleSubscribe(ws, msg as SubscribeRequest);
    if (msg.type === 'ACK' || msg.type === 'NACK') return this.handleAck(ws, msg as Ack);
    if (msg.type === 'FLOW') { /* TODO: adjust window */ return; }
  }

  private async handlePublish(ws: WebSocket, req: PublishRequest) {
    const cfg = await this.store.getConfig(req.topic);
    const p = assignPartition(req.key, cfg.partitions);
    const offset = await this.store.nextOffset(req.topic, p);
    const row: EventRow = { id: crypto.randomUUID(), ts: Date.now(), topic: req.topic, key: req.key, partition: p, headers: req.headers, payload: req.payload, offset };
    await this.store.insertEvent(row);
    this.notify(req.topic, p);
    ws.send(JSON.stringify({ type: 'PUBLISHED', topic: req.topic, partition: p, offset }));
  }

  private async handleSubscribe(ws: WebSocket, req: SubscribeRequest) {
    const p = 0; // TODO: multi-partition fan-in per connection
    this.subset(req.topic, p, req.group).add(ws);
    await this.deliver(req.topic, p, req.group, ws, req.max_inflight ?? 32, req.from);
  }

  private inflightKey(topic: string, p: number, g: string, off: number) { return `${topic}:${p}:${g}:${off}`; }

  private async deliver(topic: string, p: number, g: string, ws: WebSocket, window: number, from?: SubscribeRequest['from']) {
    const start = from?.kind === 'offset' ? (from.value ?? 0) : (await this.store.committed(topic, p, g)) + 1;
    const rows = await this.store.readFrom(topic, p, start, window);
    for (const row of rows) {
      const frame = { type:'MESSAGE', topic, partition:p, group:g, offset: row.offset, envelope: row };
      ws.send(JSON.stringify(frame));
      this.inflight.set(this.inflightKey(topic,p,g,row.offset), { deadline: Date.now() + this.ACK_TIMEOUT_MS, ws });
    }
  }

  private async handleAck(_ws: WebSocket, ack: Ack) {
    if (ack.type === 'ACK') await this.store.commit(ack.topic, ack.partition, ack.group, ack.offset);
    this.inflight.delete(this.inflightKey(ack.topic, ack.partition, ack.group, ack.offset));
  }
^ref-fe7193a2-764-0
^ref-fe7193a2-747-0
^ref-fe7193a2-740-0
^ref-fe7193a2-733-0
^ref-fe7193a2-697-0
^ref-fe7193a2-733-0 ^ref-fe7193a2-740-0
^ref-fe7193a2-697-0

  private async redeliverySweep() {
    const now = Date.now();
^ref-fe7193a2-604-0
    for (const [k, lease] of this.inflight) {
      if (lease.deadline <= now) {
        const [topic, pStr, g, offStr] = k.split(':');
        const p = Number(pStr), off = Number(offStr);
        // naive replay to the same socket if open (else drop and rely on next notify)
        try {
          const [row] = await this.store.readFrom(topic, p, off, 1);
          if (row) lease.ws.send(JSON.stringify({ type:'MESSAGE', topic, partition:p, group:g, offset: row.offset, envelope: row }));
          lease.deadline = now + this.ACK_TIMEOUT_MS;
        } catch {}
      }
    }
  }

  private async notify(topic: string, p: number) {
    const groups = this.subs.get(topic)?.get(p); if (!groups) return;
    for (const [g, set] of groups) for (const ws of set) this.deliver(topic, p, g, ws, 32);
  }
}
```

## `bus/client.ts` (WS client with autoretry)

```ts
import WebSocket from 'ws';
import { Ack, IMessageFrame, PublishRequest, SubscribeRequest } from './types';

export class BusClient {
  private ws?: WebSocket; private url: string; private backoff = 500; private max = 10_000; private pending: any[] = [];
  constructor(url = process.env.BUS_URL || 'ws://127.0.0.1:7070') { this.url = url; this.connect(); }

  private connect() {
    this.ws = new WebSocket(this.url);
    this.ws.on('open', () => { this.backoff = 500; for (const m of this.pending.splice(0)) this.ws!.send(JSON.stringify(m)); });
^ref-fe7193a2-809-0
^ref-fe7193a2-797-0
^ref-fe7193a2-787-0
^ref-fe7193a2-747-0
^ref-fe7193a2-740-0
^ref-fe7193a2-764-0
^ref-fe7193a2-747-0
^ref-fe7193a2-733-0
    this.ws.on('message', (buf) => this.onMessage(JSON.parse(buf.toString())));
^ref-fe7193a2-697-0
    this.ws.on('close', () => setTimeout(() => this.connect(), this.backoff = Math.min(this.max, this.backoff * 2)));
    this.ws.on('error', () => {});
^ref-fe7193a2-787-0
  }

  private send(obj: any) { const s = JSON.stringify(obj); if (this.ws?.readyState === this.ws.OPEN) this.ws.send(s); else this.pending.push(obj); }
^ref-fe7193a2-825-0 ^ref-fe7193a2-827-0
 ^ref-fe7193a2-764-0
^ref-fe7193a2-733-0
  publish<T>(topic: string, payload: T, key?: string, headers?: Record<string,string>) {
    const msg: PublishRequest<T> = { type:'PUBLISH', topic, key, headers, payload }; this.send(msg);
  } ^ref-fe7193a2-797-0

  subscribe(req: Omit<SubscribeRequest,'type'>, onMessage: (m: IMessageFrame) => void, onError?: (e: any) => void) {
    this.onMessage = (m) => { if (m.type === 'MESSAGE' && m.topic === req.topic) onMessage(m as IMessageFrame); };
^ref-fe7193a2-740-0
    this.send({ type:'SUBSCRIBE', ...req });
  }

  ack(ack: Ack) { this.send(ack); }

  // overrideable hook
  protected onMessage(_m: any) {}
}
```

## `bus/metrics.ts`

```ts
^ref-fe7193a2-832-0
export interface BrokerMetrics { published: number; delivered: number; acks: number; redeliveries: number; inflight: number; byTopic: Record<string, { pub: number; del: number; }>; }
export class Metrics { s: BrokerMetrics = { published:0, delivered:0, acks:0, redeliveries:0, inflight:0, byTopic:{} }; inc(t: keyof BrokerMetrics, topic?: string) { (this.s as any)[t]++; if (topic) { const bt = this.s.byTopic[topic] ?? (this.s.byTopic[topic] = { pub:0, del:0 }); if (t==='published') bt.pub++; if (t==='delivered') bt.del++; } } snapshot(){ return JSON.parse(JSON.stringify(this.s)); } } ^ref-fe7193a2-787-0
^ref-fe7193a2-809-0
```
^ref-fe7193a2-747-0

## `bus/acls.ts`

```ts
export type ACLCtx = { agent?: string; scopes?: string[] };
export type ACLChecker = (topic: string, action: 'publish'|'subscribe', ctx: ACLCtx) => boolean | Promise<boolean>;
```

## Outbox helper — `outbox/mongo_outbox.ts`

```ts
import { Collection } from 'mongodb';
import { BusClient } from '../bus/client';

export interface OutboxRow { _id: string; topic: string; key?: string; headers?: Record<string,string>; payload: any; createdTs: number; sentTs?: number; attempts?: number; }

export async function drainOutbox(col: Collection<OutboxRow>, bus: BusClient, { batch = 100, maxAttempts = 10 } = {}) {
  const rows = await col.find({ $or: [ { sentTs: { $exists: false } }, { attempts: { $lt: maxAttempts } } ] }).limit(batch).toArray();
  for (const r of rows) {
    try { bus.publish(r.topic, r.payload, r.key, r.headers); await col.updateOne({ _id: r._id }, { $set: { sentTs: Date.now() }, $inc: { attempts: 1 } }); }
    catch { await col.updateOne({ _id: r._id }, { $inc: { attempts: 1 } }); }
  }
^ref-fe7193a2-809-0
^ref-fe7193a2-797-0
^ref-fe7193a2-879-0
^ref-fe7193a2-875-0
^ref-fe7193a2-871-0 ^ref-fe7193a2-882-0
^ref-fe7193a2-869-0
^ref-fe7193a2-867-0
^ref-fe7193a2-865-0
^ref-fe7193a2-861-0
^ref-fe7193a2-859-0
^ref-fe7193a2-857-0
^ref-fe7193a2-855-0
^ref-fe7193a2-832-0
^ref-fe7193a2-827-0
^ref-fe7193a2-825-0
^ref-fe7193a2-764-0
}
```

^ref-fe7193a2-890-0
^ref-fe7193a2-889-0 ^ref-fe7193a2-898-0
^ref-fe7193a2-888-0
^ref-fe7193a2-886-0
^ref-fe7193a2-883-0
## Task Queue on the Bus — `task/queue.ts`

```ts
import { BusClient } from '../bus/client';
import { IMessageFrame } from '../bus/types'; ^ref-fe7193a2-855-0

^ref-fe7193a2-787-0 ^ref-fe7193a2-857-0
export type Task<T = any> = { id: string; topic: string; payload: T; priority?: number }; ^ref-fe7193a2-825-0
^ref-fe7193a2-908-0
^ref-fe7193a2-907-0
^ref-fe7193a2-906-0 ^ref-fe7193a2-912-0
^ref-fe7193a2-901-0

export class TaskQueue {
  constructor(private bus: BusClient, private topic: string, private group = 'workers') {}

  enqueue<T>(payload: T, key?: string) { this.bus.publish(this.topic, { payload }, key); }

  start(handler: (task: Task) => Promise<void>) {
    this.bus.subscribe({ topic: this.topic, group: this.group, from: { kind:'latest' }, max_inflight: 16 }, async (m: IMessageFrame) => {
^ref-fe7193a2-865-0 ^ref-fe7193a2-867-0
^ref-fe7193a2-861-0
^ref-fe7193a2-859-0 ^ref-fe7193a2-869-0
      const task: Task = { id: m.envelope.id, topic: m.topic, payload: (m.envelope as any).payload };
^ref-fe7193a2-832-0
^ref-fe7193a2-827-0
      try { await handler(task); this.bus.ack({ type:'ACK', topic: m.topic, partition: m.partition, group: m.group, offset: m.offset }); }
^ref-fe7193a2-797-0
      catch (e) { this.bus.ack({ type:'NACK', topic: m.topic, partition: m.partition, group: m.group, offset: m.offset, reason: String(e) }); }
    });
  }
}
```

## Example: Heartbeat publisher (service)

```ts
^ref-fe7193a2-929-0
^ref-fe7193a2-920-0 ^ref-fe7193a2-940-0
^ref-fe7193a2-919-0 ^ref-fe7193a2-941-0
^ref-fe7193a2-913-0
import { BusClient } from 'shared/js/prom-lib/src/bus/client';
const bus = new BusClient();
setInterval(() => {
  bus.publish('heartbeat.received', { pid: process.pid, name: process.env.name, ts: Date.now() }, `proc:${process.pid}`);
}, 3000);
^ref-fe7193a2-888-0 ^ref-fe7193a2-889-0
^ref-fe7193a2-886-0 ^ref-fe7193a2-890-0
^ref-fe7193a2-883-0
^ref-fe7193a2-882-0
^ref-fe7193a2-879-0
^ref-fe7193a2-875-0
^ref-fe7193a2-871-0
```
^ref-fe7193a2-809-0
 ^ref-fe7193a2-855-0 ^ref-fe7193a2-898-0
## Example: Monitor (consumer)
 ^ref-fe7193a2-825-0 ^ref-fe7193a2-857-0
```ts
import { BusClient } from 'shared/js/prom-lib/src/bus/client'; ^ref-fe7193a2-827-0 ^ref-fe7193a2-859-0
const bus = new BusClient();
 ^ref-fe7193a2-861-0
bus.subscribe({ topic: 'heartbeat.received', group: 'monitor', from: { kind: 'latest' }, max_inflight: 32 }, (m) => {
  console.log('HB', m.envelope.payload);
  bus.ack({ type:'ACK', topic: m.topic, partition: m.partition, group: m.group, offset: m.offset });
});
```

## Sibilant helpers (DSL sprinkles)

```lisp
(defn mk-env [topic payload &optional key headers]
  {:type "PUBLISH" :topic topic :key key :headers headers :payload payload})

(defmacro deftopic (name &rest kvs)
  `(register-topic ~(str name) ~(apply hash-map kvs)))

^ref-fe7193a2-919-0 ^ref-fe7193a2-920-0
^ref-fe7193a2-913-0
^ref-fe7193a2-912-0
^ref-fe7193a2-908-0
^ref-fe7193a2-907-0
^ref-fe7193a2-906-0
^ref-fe7193a2-901-0
(defmacro defconsumer (topic group &rest body)
  `(bus.subscribe {:topic ~(str topic) :group ~(str group) :from {:kind "latest"} :max_inflight 32}
     (fn [m] ^ref-fe7193a2-929-0
       ~@body
       (bus.ack {:type "ACK" :topic m.topic :partition m.partition :group m.group :offset m.offset}))))
^ref-fe7193a2-879-0 ^ref-fe7193a2-882-0
^ref-fe7193a2-875-0 ^ref-fe7193a2-883-0
^ref-fe7193a2-871-0
^ref-fe7193a2-869-0
^ref-fe7193a2-867-0 ^ref-fe7193a2-886-0
^ref-fe7193a2-865-0
``` ^ref-fe7193a2-888-0
 ^ref-fe7193a2-889-0
^ref-fe7193a2-832-0 ^ref-fe7193a2-890-0 ^ref-fe7193a2-940-0
## ENV & Config ^ref-fe7193a2-941-0

- `BUS_PORT` (server), `BUS_URL` (client), `MONGO_URL`, `MONGO_DB`. ^ref-fe7193a2-855-0
    
- Optional: `BUS_ACK_TIMEOUT_MS`, `BUS_MAX_INFLIGHT`. ^ref-fe7193a2-857-0
    
 ^ref-fe7193a2-859-0
## Architecture overview ^ref-fe7193a2-898-0
 ^ref-fe7193a2-861-0
```mermaid
flowchart LR ^ref-fe7193a2-901-0
  subgraph Producer Services
    A[stt] -->|PUBLISH| B ^ref-fe7193a2-865-0
    C[tts] -->|PUBLISH| B
    D[discord_indexer] -->|PUBLISH| B ^ref-fe7193a2-867-0
  end ^ref-fe7193a2-906-0
 ^ref-fe7193a2-869-0 ^ref-fe7193a2-907-0
  subgraph Event Bus ^ref-fe7193a2-908-0
    B[BrokerServer (WS)] --> E[(Mongo events)] ^ref-fe7193a2-871-0
    B --> F[(Group Offsets)]
  end
 ^ref-fe7193a2-912-0
  subgraph Consumers ^ref-fe7193a2-875-0 ^ref-fe7193a2-913-0
    G[monitor] -->|SUBSCRIBE g=monitor| B
    H[task workers] -->|SUBSCRIBE g=workers| B
  end
 ^ref-fe7193a2-879-0
  B -->|system.metrics| I[observability]
``` ^ref-fe7193a2-919-0
 ^ref-fe7193a2-882-0 ^ref-fe7193a2-920-0
## Extended Kanban (library build-out) ^ref-fe7193a2-883-0

-  Package skeleton in `shared/js/prom-lib`
 ^ref-fe7193a2-886-0
-  Implement `MongoStorage` + indexes + env wiring
 ^ref-fe7193a2-888-0
-  Implement `MemoryStorage` + unit tests ^ref-fe7193a2-889-0
 ^ref-fe7193a2-890-0
-  Implement `BrokerServer` minimal paths (publish/subscribe/ack) ^ref-fe7193a2-929-0
    
-  Add redelivery sweep + DLQ topic emission
    
-  Add `BusClient` with reconnect + backoff
    
-  Add `TaskQueue` helper + sample worker
 ^ref-fe7193a2-898-0
-  Add `Outbox` helper + sample drainer
    
-  Add `Metrics` + `system.metrics` publisher ^ref-fe7193a2-901-0
 ^ref-fe7193a2-940-0
-  Add ACL hook surface + sample checker ^ref-fe7193a2-941-0
    
-  Ship examples + README  
    ``<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [prom-lib-rate-limiters-and-replay-api](prom-lib-rate-limiters-and-replay-api.md)
- [Event Bus MVP](event-bus-mvp.md)
- [Unique Info Dump Index](unique-info-dump-index.md)
- [WebSocket Gateway Implementation](websocket-gateway-implementation.md)
- [Prompt_Folder_Bootstrap](prompt-folder-bootstrap.md)
- [Migrate to Provider-Tenant Architecture](migrate-to-provider-tenant-architecture.md)
- [Mongo Outbox Implementation](mongo-outbox-implementation.md)
- [Event Bus Projections Architecture](event-bus-projections-architecture.md)
- [Fnord Tracer Protocol](fnord-tracer-protocol.md)
- [Promethean Agent Config DSL](promethean-agent-config-dsl.md)
- [Provider-Agnostic Chat Panel Implementation](provider-agnostic-chat-panel-implementation.md)
- [State Snapshots API and Transactional Projector](state-snapshots-api-and-transactional-projector.md)
- [Stateful Partitions and Rebalancing](stateful-partitions-and-rebalancing.md)
- [Voice Access Layer Design](voice-access-layer-design.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [Agent Tasks: Persistence Migration to DualStore](agent-tasks-persistence-migration-to-dualstore.md)
- [promethean-system-diagrams](promethean-system-diagrams.md)
- [AI-Centric OS with MCP Layer](ai-centric-os-with-mcp-layer.md)
- [Local-First Intention→Code Loop with Free Models](local-first-intention-code-loop-with-free-models.md)
- [archetype-ecs](archetype-ecs.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [js-to-lisp-reverse-compiler](js-to-lisp-reverse-compiler.md)
- [Services](chunks/services.md)
- [layer-1-uptime-diagrams](layer-1-uptime-diagrams.md)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler](ollama-llm-provider-for-pseudo-code-transpiler.md)
- [Cross-Target Macro System in Sibilant](cross-target-macro-system-in-sibilant.md)
- [aionian-circuit-math](aionian-circuit-math.md)
- [Per-Domain Policy System for JS Crawler](per-domain-policy-system-for-js-crawler.md)
- [Diagrams](chunks/diagrams.md)
- [DSL](chunks/dsl.md)
- [eidolon-node-lifecycle](eidolon-node-lifecycle.md)
- [i3-bluetooth-setup](i3-bluetooth-setup.md)
- [Board Walk – 2025-08-11](board-walk-2025-08-11.md)
- [ecs-offload-workers](ecs-offload-workers.md)
- [schema-evolution-workflow](schema-evolution-workflow.md)
- [observability-infrastructure-setup](observability-infrastructure-setup.md)
- [Agent Reflections and Prompt Evolution](agent-reflections-and-prompt-evolution.md)
- [Canonical Org-Babel Matplotlib Animation Template](canonical-org-babel-matplotlib-animation-template.md)
- [ecs-scheduler-and-prefabs](ecs-scheduler-and-prefabs.md)
- [Promethean-native config design](promethean-native-config-design.md)
- [infinite_depth_smoke_animation](infinite-depth-smoke-animation.md)
- [obsidian-ignore-node-modules-regex](obsidian-ignore-node-modules-regex.md)
- [field-dynamics-math-blocks](field-dynamics-math-blocks.md)
- [api-gateway-versioning](api-gateway-versioning.md)
- [Debugging Broker Connections and Agent Behavior](debugging-broker-connections-and-agent-behavior.md)
- [heartbeat-fragment-demo](heartbeat-fragment-demo.md)
- [Cross-Language Runtime Polymorphism](cross-language-runtime-polymorphism.md)
- [Duck's Attractor States](ducks-attractor-states.md)
- [2d-sandbox-field](2d-sandbox-field.md)
- [Admin Dashboard for User Management](admin-dashboard-for-user-management.md)
- [JavaScript](chunks/javascript.md)
- [Shared](chunks/shared.md)
- [balanced-bst](balanced-bst.md)
- [Math Fundamentals](chunks/math-fundamentals.md)
- [AI-First-OS-Model-Context-Protocol](ai-first-os-model-context-protocol.md)
- [Board Automation Improvements](board-automation-improvements.md)
- [Operations](chunks/operations.md)
- [Tooling](chunks/tooling.md)
- [Local-Offline-Model-Deployment-Strategy](local-offline-model-deployment-strategy.md)
- [Simulation Demo](chunks/simulation-demo.md)
- [Eidolon Field Abstract Model](eidolon-field-abstract-model.md)
- [Matplotlib Animation with Async Execution](matplotlib-animation-with-async-execution.md)
- [Promethean Pipelines: Local TypeScript-First Workflow](promethean-pipelines-local-typescript-first-workflow.md)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop](polyglot-s-expr-bridge-python-js-lisp-interop.md)
- [pm2-orchestration-patterns](pm2-orchestration-patterns.md)
- [polymorphic-meta-programming-engine](polymorphic-meta-programming-engine.md)
- [prompt-programming-language-lisp](prompt-programming-language-lisp.md)
- [Exception Layer Analysis](exception-layer-analysis.md)
- [compiler-kit-foundations](compiler-kit-foundations.md)
- [Obsidian ChatGPT Plugin Integration Guide](obsidian-chatgpt-plugin-integration-guide.md)
- [Obsidian ChatGPT Plugin Integration](obsidian-chatgpt-plugin-integration.md)
- [Model Selection for Lightweight Conversational Tasks](model-selection-for-lightweight-conversational-tasks.md)
- [Duck's Self-Referential Perceptual Loop](ducks-self-referential-perceptual-loop.md)
- [graph-ds](graph-ds.md)
- [Lisp-Compiler-Integration](lisp-compiler-integration.md)
- [lisp-dsl-for-window-management](lisp-dsl-for-window-management.md)
- [field-node-diagram-outline](field-node-diagram-outline.md)
- [Layer1SurvivabilityEnvelope](layer1survivabilityenvelope.md)
- [ParticleSimulationWithCanvasAndFFmpeg](particlesimulationwithcanvasandffmpeg.md)
- [i3-config-validation-methods](i3-config-validation-methods.md)
- [plan-update-confirmation](plan-update-confirmation.md)
- [Language-Agnostic Mirror System](language-agnostic-mirror-system.md)
- [Window Management](chunks/window-management.md)
- [Interop and Source Maps](interop-and-source-maps.md)
- [Factorio AI with External Agents](factorio-ai-with-external-agents.md)
- [markdown-to-org-transpiler](markdown-to-org-transpiler.md)
- [field-node-diagram-set](field-node-diagram-set.md)
- [Obsidian Templating Plugins Integration Guide](obsidian-templating-plugins-integration-guide.md)
- [field-node-diagram-visualizations](field-node-diagram-visualizations.md)
- [field-interaction-equations](field-interaction-equations.md)
- [EidolonField](eidolonfield.md)
- [Chroma-Embedding-Refactor](chroma-embedding-refactor.md)
- [heartbeat-simulation-snippets](heartbeat-simulation-snippets.md)
- [Promethean Web UI Setup](promethean-web-ui-setup.md)
- [Promethean Documentation Pipeline Overview](promethean-documentation-pipeline-overview.md)
- [Promethean Infrastructure Setup](promethean-infrastructure-setup.md)
- [Creative Moments](creative-moments.md)
- [DuckDuckGoSearchPipeline](duckduckgosearchpipeline.md)
- [System Scheduler with Resource-Aware DAG](system-scheduler-with-resource-aware-dag.md)
- [Promethean_Eidolon_Synchronicity_Model](promethean-eidolon-synchronicity-model.md)
- [Pure-Node Crawl Stack with Playwright and Crawlee](pure-node-crawl-stack-with-playwright-and-crawlee.md)
- [Promethean Data Sync Protocol](promethean-data-sync-protocol.md)
- [Protocol_0_The_Contradiction_Engine](protocol-0-the-contradiction-engine.md)
- [Local-Only-LLM-Workflow](local-only-llm-workflow.md)
- [Model Upgrade Calm-Down Guide](model-upgrade-calm-down-guide.md)
- [Lispy Macros with syntax-rules](lispy-macros-with-syntax-rules.md)
- [NPU Voice Code and Sensory Integration](npu-voice-code-and-sensory-integration.md)
- [OpenAPI Validation Report](openapi-validation-report.md)
- [Optimizing Command Limitations in System Design](optimizing-command-limitations-in-system-design.md)
- [Mindful Prioritization](mindful-prioritization.md)
- [MindfulRobotIntegration](mindfulrobotintegration.md)
- [homeostasis-decay-formulas](homeostasis-decay-formulas.md)
- [Shared Package Structure](shared-package-structure.md)
- [zero-copy-snapshots-and-workers](zero-copy-snapshots-and-workers.md)
- [Prometheus Observability Stack](prometheus-observability-stack.md)
- [ripple-propagation-demo](ripple-propagation-demo.md)
- [Promethean Workflow Optimization](promethean-workflow-optimization.md)
- [Functional Embedding Pipeline Refactor](functional-embedding-pipeline-refactor.md)
- [Sibilant Meta-Prompt DSL](sibilant-meta-prompt-dsl.md)
- [Pure TypeScript Search Microservice](pure-typescript-search-microservice.md)
- [komorebi-group-window-hack](komorebi-group-window-hack.md)
- [RAG UI Panel with Qdrant and PostgREST](rag-ui-panel-with-qdrant-and-postgrest.md)
- [sibilant-macro-targets](sibilant-macro-targets.md)
- [shared-package-layout-clarification](shared-package-layout-clarification.md)
- [Self-Agency in AI Interaction](self-agency-in-ai-interaction.md)
- [set-assignment-in-lisp-ast](set-assignment-in-lisp-ast.md)
- [typed-struct-compiler](typed-struct-compiler.md)
- [Promethean Agent DSL TS Scaffold](promethean-agent-dsl-ts-scaffold.md)
- [universal-intention-code-fabric](universal-intention-code-fabric.md)
- [TypeScript Patch for Tool Calling Support](typescript-patch-for-tool-calling-support.md)
- [Promethean Pipelines](promethean-pipelines.md)
- [Performance-Optimized-Polyglot-Bridge](performance-optimized-polyglot-bridge.md)
- [Promethean State Format](promethean-state-format.md)
- [mystery-lisp-search-session](mystery-lisp-search-session.md)
- [sibilant-metacompiler-overview](sibilant-metacompiler-overview.md)
- [windows-tiling-with-autohotkey](windows-tiling-with-autohotkey.md)
- [Recursive Prompt Construction Engine](recursive-prompt-construction-engine.md)
- [Promethean-Copilot-Intent-Engine](promethean-copilot-intent-engine.md)
- [Reawakening Duck](reawakening-duck.md)
- [file-watcher-auth-fix](file-watcher-auth-fix.md)
- [template-based-compilation](template-based-compilation.md)
- [Universal Lisp Interface](universal-lisp-interface.md)
- [Docops Feature Updates](docops-feature-updates-3.md)
- [Docops Feature Updates](docops-feature-updates.md)
- [Pipeline Enhancements](pipeline-enhancements.md)
- [Ice Box Reorganization](ice-box-reorganization.md)
- [polyglot-repl-interface-layer](polyglot-repl-interface-layer.md)
- [Redirecting Standard Error](redirecting-standard-error.md)
- [The Jar of Echoes](the-jar-of-echoes.md)
## Sources
- [Board Walk – 2025-08-11 — L90](board-walk-2025-08-11.md#^ref-7aa1eb92-90-0) (line 90, col 0, score 0.64)
- [ecs-offload-workers — L434](ecs-offload-workers.md#^ref-6498b9d7-434-0) (line 434, col 0, score 0.61)
- [Mongo Outbox Implementation — L449](mongo-outbox-implementation.md#^ref-9c1acd1e-449-0) (line 449, col 0, score 0.67)
- [WebSocket Gateway Implementation — L56](websocket-gateway-implementation.md#^ref-e811123d-56-0) (line 56, col 0, score 0.69)
- [prom-lib-rate-limiters-and-replay-api — L364](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-364-0) (line 364, col 0, score 0.66)
- [Event Bus MVP — L284](event-bus-mvp.md#^ref-534fe91d-284-0) (line 284, col 0, score 0.75)
- [WebSocket Gateway Implementation — L612](websocket-gateway-implementation.md#^ref-e811123d-612-0) (line 612, col 0, score 0.65)
- [WebSocket Gateway Implementation — L219](websocket-gateway-implementation.md#^ref-e811123d-219-0) (line 219, col 0, score 0.67)
- [archetype-ecs — L3](archetype-ecs.md#^ref-8f4c1e86-3-0) (line 3, col 0, score 0.64)
- [Mongo Outbox Implementation — L451](mongo-outbox-implementation.md#^ref-9c1acd1e-451-0) (line 451, col 0, score 0.77)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L6](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-6-0) (line 6, col 0, score 0.63)
- [Mongo Outbox Implementation — L379](mongo-outbox-implementation.md#^ref-9c1acd1e-379-0) (line 379, col 0, score 0.63)
- [promethean-system-diagrams — L179](promethean-system-diagrams.md#^ref-b51e19b4-179-0) (line 179, col 0, score 0.64)
- [Stateful Partitions and Rebalancing — L164](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-164-0) (line 164, col 0, score 0.71)
- [Promethean State Format — L26](promethean-state-format.md#^ref-23df6ddb-26-0) (line 26, col 0, score 0.62)
- [prom-lib-rate-limiters-and-replay-api — L338](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-338-0) (line 338, col 0, score 0.68)
- [schema-evolution-workflow — L239](schema-evolution-workflow.md#^ref-d8059b6a-239-0) (line 239, col 0, score 0.64)
- [Stateful Partitions and Rebalancing — L524](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-524-0) (line 524, col 0, score 0.67)
- [prom-lib-rate-limiters-and-replay-api — L378](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-378-0) (line 378, col 0, score 0.66)
- [TypeScript Patch for Tool Calling Support — L175](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-175-0) (line 175, col 0, score 0.65)
- [prom-lib-rate-limiters-and-replay-api — L106](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-106-0) (line 106, col 0, score 0.68)
- [prom-lib-rate-limiters-and-replay-api — L376](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-376-0) (line 376, col 0, score 0.63)
- [Event Bus MVP — L99](event-bus-mvp.md#^ref-534fe91d-99-0) (line 99, col 0, score 0.68)
- [Event Bus MVP — L534](event-bus-mvp.md#^ref-534fe91d-534-0) (line 534, col 0, score 0.6)
- [Universal Lisp Interface — L19](universal-lisp-interface.md#^ref-b01856b4-19-0) (line 19, col 0, score 0.58)
- [Provider-Agnostic Chat Panel Implementation — L82](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-82-0) (line 82, col 0, score 0.55)
- [Board Walk – 2025-08-11 — L92](board-walk-2025-08-11.md#^ref-7aa1eb92-92-0) (line 92, col 0, score 0.55)
- [The Jar of Echoes — L28](the-jar-of-echoes.md#^ref-18138627-28-0) (line 28, col 0, score 0.54)
- [ecs-offload-workers — L7](ecs-offload-workers.md#^ref-6498b9d7-7-0) (line 7, col 0, score 0.61)
- [prom-lib-rate-limiters-and-replay-api — L71](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-71-0) (line 71, col 0, score 0.62)
- [State Snapshots API and Transactional Projector — L325](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-325-0) (line 325, col 0, score 0.53)
- [prom-lib-rate-limiters-and-replay-api — L73](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-73-0) (line 73, col 0, score 0.65)
- [prom-lib-rate-limiters-and-replay-api — L375](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-375-0) (line 375, col 0, score 0.63)
- [Stateful Partitions and Rebalancing — L499](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-499-0) (line 499, col 0, score 0.67)
- [Promethean-native config design — L29](promethean-native-config-design.md#^ref-ab748541-29-0) (line 29, col 0, score 0.68)
- [Stateful Partitions and Rebalancing — L515](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-515-0) (line 515, col 0, score 0.59)
- [Migrate to Provider-Tenant Architecture — L85](migrate-to-provider-tenant-architecture.md#^ref-54382370-85-0) (line 85, col 0, score 0.6)
- [Agent Tasks: Persistence Migration to DualStore — L92](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-92-0) (line 92, col 0, score 0.67)
- [Stateful Partitions and Rebalancing — L36](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-36-0) (line 36, col 0, score 0.67)
- [Matplotlib Animation with Async Execution — L7](matplotlib-animation-with-async-execution.md#^ref-687439f9-7-0) (line 7, col 0, score 0.63)
- [Matplotlib Animation with Async Execution — L31](matplotlib-animation-with-async-execution.md#^ref-687439f9-31-0) (line 31, col 0, score 0.63)
- [Stateful Partitions and Rebalancing — L11](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-11-0) (line 11, col 0, score 0.7)
- [prom-lib-rate-limiters-and-replay-api — L83](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-83-0) (line 83, col 0, score 0.76)
- [Voice Access Layer Design — L202](voice-access-layer-design.md#^ref-543ed9b3-202-0) (line 202, col 0, score 0.67)
- [Mongo Outbox Implementation — L544](mongo-outbox-implementation.md#^ref-9c1acd1e-544-0) (line 544, col 0, score 0.71)
- [prom-lib-rate-limiters-and-replay-api — L1](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-1-0) (line 1, col 0, score 0.7)
- [prom-lib-rate-limiters-and-replay-api — L60](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-60-0) (line 60, col 0, score 0.61)
- [Performance-Optimized-Polyglot-Bridge — L13](performance-optimized-polyglot-bridge.md#^ref-f5579967-13-0) (line 13, col 0, score 0.63)
- [Chroma Toolkit Consolidation Plan — L137](chroma-toolkit-consolidation-plan.md#^ref-5020e892-137-0) (line 137, col 0, score 0.66)
- [Migrate to Provider-Tenant Architecture — L223](migrate-to-provider-tenant-architecture.md#^ref-54382370-223-0) (line 223, col 0, score 0.6)
- [Functional Embedding Pipeline Refactor — L304](functional-embedding-pipeline-refactor.md#^ref-a4a25141-304-0) (line 304, col 0, score 0.62)
- [Stateful Partitions and Rebalancing — L347](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-347-0) (line 347, col 0, score 0.63)
- [Chroma-Embedding-Refactor — L64](chroma-embedding-refactor.md#^ref-8b256935-64-0) (line 64, col 0, score 0.6)
- [Chroma-Embedding-Refactor — L109](chroma-embedding-refactor.md#^ref-8b256935-109-0) (line 109, col 0, score 0.6)
- [Chroma-Embedding-Refactor — L258](chroma-embedding-refactor.md#^ref-8b256935-258-0) (line 258, col 0, score 0.6)
- [Chroma Toolkit Consolidation Plan — L72](chroma-toolkit-consolidation-plan.md#^ref-5020e892-72-0) (line 72, col 0, score 0.6)
- [Chroma Toolkit Consolidation Plan — L88](chroma-toolkit-consolidation-plan.md#^ref-5020e892-88-0) (line 88, col 0, score 0.6)
- [Chroma Toolkit Consolidation Plan — L107](chroma-toolkit-consolidation-plan.md#^ref-5020e892-107-0) (line 107, col 0, score 0.6)
- [Chroma Toolkit Consolidation Plan — L148](chroma-toolkit-consolidation-plan.md#^ref-5020e892-148-0) (line 148, col 0, score 0.6)
- [Sibilant Meta-Prompt DSL — L91](sibilant-meta-prompt-dsl.md#^ref-af5d2824-91-0) (line 91, col 0, score 0.68)
- [Dynamic Context Model for Web Components — L331](dynamic-context-model-for-web-components.md#^ref-f7702bf8-331-0) (line 331, col 0, score 0.73)
- [Promethean-native config design — L31](promethean-native-config-design.md#^ref-ab748541-31-0) (line 31, col 0, score 0.73)
- [Sibilant Meta-Prompt DSL — L100](sibilant-meta-prompt-dsl.md#^ref-af5d2824-100-0) (line 100, col 0, score 0.66)
- [Stateful Partitions and Rebalancing — L512](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-512-0) (line 512, col 0, score 0.69)
- [AI-Centric OS with MCP Layer — L407](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-407-0) (line 407, col 0, score 1)
- [api-gateway-versioning — L284](api-gateway-versioning.md#^ref-0580dcd3-284-0) (line 284, col 0, score 1)
- [Services — L21](chunks/services.md#^ref-75ea4a6a-21-0) (line 21, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L43](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-43-0) (line 43, col 0, score 1)
- [Dynamic Context Model for Web Components — L407](dynamic-context-model-for-web-components.md#^ref-f7702bf8-407-0) (line 407, col 0, score 1)
- [ecs-offload-workers — L478](ecs-offload-workers.md#^ref-6498b9d7-478-0) (line 478, col 0, score 1)
- [eidolon-field-math-foundations — L167](eidolon-field-math-foundations.md#^ref-008f2ac0-167-0) (line 167, col 0, score 1)
- [Event Bus MVP — L562](event-bus-mvp.md#^ref-534fe91d-562-0) (line 562, col 0, score 0.71)
- [i3-bluetooth-setup — L123](i3-bluetooth-setup.md#^ref-5e408692-123-0) (line 123, col 0, score 1)
- [heartbeat-fragment-demo — L31](heartbeat-fragment-demo.md#^ref-dd00677a-31-0) (line 31, col 0, score 0.65)
- [heartbeat-fragment-demo — L46](heartbeat-fragment-demo.md#^ref-dd00677a-46-0) (line 46, col 0, score 0.65)
- [heartbeat-fragment-demo — L61](heartbeat-fragment-demo.md#^ref-dd00677a-61-0) (line 61, col 0, score 0.65)
- [heartbeat-simulation-snippets — L25](heartbeat-simulation-snippets.md#^ref-23e221e9-25-0) (line 25, col 0, score 0.65)
- [heartbeat-simulation-snippets — L40](heartbeat-simulation-snippets.md#^ref-23e221e9-40-0) (line 40, col 0, score 0.65)
- [heartbeat-simulation-snippets — L53](heartbeat-simulation-snippets.md#^ref-23e221e9-53-0) (line 53, col 0, score 0.65)
- [heartbeat-simulation-snippets — L3](heartbeat-simulation-snippets.md#^ref-23e221e9-3-0) (line 3, col 0, score 0.64)
- [Debugging Broker Connections and Agent Behavior — L3](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-3-0) (line 3, col 0, score 0.66)
- [Event Bus MVP — L7](event-bus-mvp.md#^ref-534fe91d-7-0) (line 7, col 0, score 0.94)
- [AI-Centric OS with MCP Layer — L432](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-432-0) (line 432, col 0, score 0.68)
- [Services — L29](chunks/services.md#^ref-75ea4a6a-29-0) (line 29, col 0, score 0.62)
- [Simulation Demo — L8](chunks/simulation-demo.md#^ref-557309a3-8-0) (line 8, col 0, score 0.62)
- [Cross-Target Macro System in Sibilant — L214](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-214-0) (line 214, col 0, score 0.68)
- [Duck's Self-Referential Perceptual Loop — L57](ducks-self-referential-perceptual-loop.md#^ref-71726f04-57-0) (line 57, col 0, score 0.68)
- [Pure TypeScript Search Microservice — L155](pure-typescript-search-microservice.md#^ref-d17d3a96-155-0) (line 155, col 0, score 0.7)
- [prom-lib-rate-limiters-and-replay-api — L186](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-186-0) (line 186, col 0, score 0.72)
- [schema-evolution-workflow — L146](schema-evolution-workflow.md#^ref-d8059b6a-146-0) (line 146, col 0, score 0.63)
- [Mongo Outbox Implementation — L11](mongo-outbox-implementation.md#^ref-9c1acd1e-11-0) (line 11, col 0, score 0.76)
- [Shared Package Structure — L103](shared-package-structure.md#^ref-66a72fc3-103-0) (line 103, col 0, score 0.7)
- [WebSocket Gateway Implementation — L447](websocket-gateway-implementation.md#^ref-e811123d-447-0) (line 447, col 0, score 0.68)
- [komorebi-group-window-hack — L32](komorebi-group-window-hack.md#^ref-dd89372d-32-0) (line 32, col 0, score 0.72)
- [Shared Package Structure — L117](shared-package-structure.md#^ref-66a72fc3-117-0) (line 117, col 0, score 0.7)
- [Promethean Agent DSL TS Scaffold — L738](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-738-0) (line 738, col 0, score 0.74)
- [Shared Package Structure — L124](shared-package-structure.md#^ref-66a72fc3-124-0) (line 124, col 0, score 0.74)
- [Promethean Agent DSL TS Scaffold — L215](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-215-0) (line 215, col 0, score 0.68)
- [universal-intention-code-fabric — L68](universal-intention-code-fabric.md#^ref-c14edce7-68-0) (line 68, col 0, score 0.72)
- [WebSocket Gateway Implementation — L322](websocket-gateway-implementation.md#^ref-e811123d-322-0) (line 322, col 0, score 0.67)
- [Event Bus MVP — L370](event-bus-mvp.md#^ref-534fe91d-370-0) (line 370, col 0, score 0.68)
- [Event Bus Projections Architecture — L54](event-bus-projections-architecture.md#^ref-cf6b9b17-54-0) (line 54, col 0, score 0.63)
- [Stateful Partitions and Rebalancing — L166](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-166-0) (line 166, col 0, score 0.68)
- [Stateful Partitions and Rebalancing — L351](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-351-0) (line 351, col 0, score 0.75)
- [Event Bus Projections Architecture — L108](event-bus-projections-architecture.md#^ref-cf6b9b17-108-0) (line 108, col 0, score 0.65)
- [Promethean Web UI Setup — L351](promethean-web-ui-setup.md#^ref-bc5172ca-351-0) (line 351, col 0, score 0.7)
- [Stateful Partitions and Rebalancing — L101](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-101-0) (line 101, col 0, score 0.68)
- [Event Bus MVP — L392](event-bus-mvp.md#^ref-534fe91d-392-0) (line 392, col 0, score 0.68)
- [TypeScript Patch for Tool Calling Support — L9](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-9-0) (line 9, col 0, score 0.69)
- [schema-evolution-workflow — L161](schema-evolution-workflow.md#^ref-d8059b6a-161-0) (line 161, col 0, score 0.62)
- [Mongo Outbox Implementation — L381](mongo-outbox-implementation.md#^ref-9c1acd1e-381-0) (line 381, col 0, score 0.67)
- [Mongo Outbox Implementation — L187](mongo-outbox-implementation.md#^ref-9c1acd1e-187-0) (line 187, col 0, score 0.76)
- [RAG UI Panel with Qdrant and PostgREST — L354](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-354-0) (line 354, col 0, score 0.74)
- [Migrate to Provider-Tenant Architecture — L153](migrate-to-provider-tenant-architecture.md#^ref-54382370-153-0) (line 153, col 0, score 0.71)
- [State Snapshots API and Transactional Projector — L317](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-317-0) (line 317, col 0, score 0.68)
- [State Snapshots API and Transactional Projector — L83](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-83-0) (line 83, col 0, score 0.75)
- [Migrate to Provider-Tenant Architecture — L212](migrate-to-provider-tenant-architecture.md#^ref-54382370-212-0) (line 212, col 0, score 0.63)
- [schema-evolution-workflow — L467](schema-evolution-workflow.md#^ref-d8059b6a-467-0) (line 467, col 0, score 0.61)
- [RAG UI Panel with Qdrant and PostgREST — L329](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-329-0) (line 329, col 0, score 0.58)
- [Chroma-Embedding-Refactor — L66](chroma-embedding-refactor.md#^ref-8b256935-66-0) (line 66, col 0, score 0.76)
- [prom-lib-rate-limiters-and-replay-api — L343](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-343-0) (line 343, col 0, score 0.6)
- [RAG UI Panel with Qdrant and PostgREST — L327](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-327-0) (line 327, col 0, score 0.59)
- [Unique Info Dump Index — L18](unique-info-dump-index.md#^ref-30ec3ba6-18-0) (line 18, col 0, score 0.89)
- [graph-ds — L373](graph-ds.md#^ref-6620e2f2-373-0) (line 373, col 0, score 1)
- [komorebi-group-window-hack — L205](komorebi-group-window-hack.md#^ref-dd89372d-205-0) (line 205, col 0, score 1)
- [layer-1-uptime-diagrams — L166](layer-1-uptime-diagrams.md#^ref-4127189a-166-0) (line 166, col 0, score 1)
- [Lisp-Compiler-Integration — L558](lisp-compiler-integration.md#^ref-cfee6d36-558-0) (line 558, col 0, score 1)
- [lisp-dsl-for-window-management — L219](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-219-0) (line 219, col 0, score 0.71)
- [Migrate to Provider-Tenant Architecture — L277](migrate-to-provider-tenant-architecture.md#^ref-54382370-277-0) (line 277, col 0, score 0.71)
- [Mongo Outbox Implementation — L556](mongo-outbox-implementation.md#^ref-9c1acd1e-556-0) (line 556, col 0, score 0.71)
- [obsidian-ignore-node-modules-regex — L49](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-49-0) (line 49, col 0, score 0.71)
- [pm2-orchestration-patterns — L245](pm2-orchestration-patterns.md#^ref-51932e7b-245-0) (line 245, col 0, score 0.71)
- [archetype-ecs — L417](archetype-ecs.md#^ref-8f4c1e86-417-0) (line 417, col 0, score 0.6)
- [Dynamic Context Model for Web Components — L154](dynamic-context-model-for-web-components.md#^ref-f7702bf8-154-0) (line 154, col 0, score 0.62)
- [Event Bus MVP — L434](event-bus-mvp.md#^ref-534fe91d-434-0) (line 434, col 0, score 0.55)
- [prom-lib-rate-limiters-and-replay-api — L226](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-226-0) (line 226, col 0, score 0.67)
- [Performance-Optimized-Polyglot-Bridge — L10](performance-optimized-polyglot-bridge.md#^ref-f5579967-10-0) (line 10, col 0, score 0.61)
- [State Snapshots API and Transactional Projector — L162](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-162-0) (line 162, col 0, score 0.78)
- [Event Bus MVP — L387](event-bus-mvp.md#^ref-534fe91d-387-0) (line 387, col 0, score 0.61)
- [Prompt_Folder_Bootstrap — L60](prompt-folder-bootstrap.md#^ref-bd4f0976-60-0) (line 60, col 0, score 0.61)
- [Fnord Tracer Protocol — L205](fnord-tracer-protocol.md#^ref-fc21f824-205-0) (line 205, col 0, score 0.72)
- [Sibilant Meta-Prompt DSL — L109](sibilant-meta-prompt-dsl.md#^ref-af5d2824-109-0) (line 109, col 0, score 0.77)
- [eidolon-field-math-foundations — L83](eidolon-field-math-foundations.md#^ref-008f2ac0-83-0) (line 83, col 0, score 0.76)
- [2d-sandbox-field — L13](2d-sandbox-field.md#^ref-c710dc93-13-0) (line 13, col 0, score 0.73)
- [Eidolon Field Abstract Model — L72](eidolon-field-abstract-model.md#^ref-5e8b2388-72-0) (line 72, col 0, score 0.73)
- [field-node-diagram-outline — L9](field-node-diagram-outline.md#^ref-1f32c94a-9-0) (line 9, col 0, score 0.72)
- [Layer1SurvivabilityEnvelope — L61](layer1survivabilityenvelope.md#^ref-64a9f9f9-61-0) (line 61, col 0, score 0.72)
- [eidolon-field-math-foundations — L55](eidolon-field-math-foundations.md#^ref-008f2ac0-55-0) (line 55, col 0, score 0.71)
- [Eidolon Field Abstract Model — L152](eidolon-field-abstract-model.md#^ref-5e8b2388-152-0) (line 152, col 0, score 0.71)
- [ParticleSimulationWithCanvasAndFFmpeg — L237](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-237-0) (line 237, col 0, score 0.7)
- [prom-lib-rate-limiters-and-replay-api — L326](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-326-0) (line 326, col 0, score 0.68)
- [prom-lib-rate-limiters-and-replay-api — L178](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-178-0) (line 178, col 0, score 0.79)
- [Agent Reflections and Prompt Evolution — L101](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-101-0) (line 101, col 0, score 0.77)
- [WebSocket Gateway Implementation — L378](websocket-gateway-implementation.md#^ref-e811123d-378-0) (line 378, col 0, score 0.76)
- [Migrate to Provider-Tenant Architecture — L66](migrate-to-provider-tenant-architecture.md#^ref-54382370-66-0) (line 66, col 0, score 0.74)
- [Voice Access Layer Design — L299](voice-access-layer-design.md#^ref-543ed9b3-299-0) (line 299, col 0, score 0.67)
- [State Snapshots API and Transactional Projector — L177](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-177-0) (line 177, col 0, score 0.7)
- [State Snapshots API and Transactional Projector — L327](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-327-0) (line 327, col 0, score 0.63)
- [Functional Embedding Pipeline Refactor — L31](functional-embedding-pipeline-refactor.md#^ref-a4a25141-31-0) (line 31, col 0, score 0.68)
- [Agent Tasks: Persistence Migration to DualStore — L93](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-93-0) (line 93, col 0, score 0.66)
- [sibilant-macro-targets — L12](sibilant-macro-targets.md#^ref-c5c9a5c6-12-0) (line 12, col 0, score 0.62)
- [RAG UI Panel with Qdrant and PostgREST — L50](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-50-0) (line 50, col 0, score 0.61)
- [Docops Feature Updates — L12](docops-feature-updates-3.md#^ref-cdbd21ee-12-0) (line 12, col 0, score 0.61)
- [Docops Feature Updates — L29](docops-feature-updates.md#^ref-2792d448-29-0) (line 29, col 0, score 0.61)
- [Agent Tasks: Persistence Migration to DualStore — L120](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-120-0) (line 120, col 0, score 0.6)
- [Promethean Documentation Pipeline Overview — L155](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-155-0) (line 155, col 0, score 0.6)
- [Agent Tasks: Persistence Migration to DualStore — L45](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-45-0) (line 45, col 0, score 0.54)
- [Pipeline Enhancements — L3](pipeline-enhancements.md#^ref-e2135d9f-3-0) (line 3, col 0, score 0.6)
- [schema-evolution-workflow — L243](schema-evolution-workflow.md#^ref-d8059b6a-243-0) (line 243, col 0, score 0.75)
- [Migrate to Provider-Tenant Architecture — L80](migrate-to-provider-tenant-architecture.md#^ref-54382370-80-0) (line 80, col 0, score 0.64)
- [komorebi-group-window-hack — L9](komorebi-group-window-hack.md#^ref-dd89372d-9-0) (line 9, col 0, score 0.57)
- [Migrate to Provider-Tenant Architecture — L160](migrate-to-provider-tenant-architecture.md#^ref-54382370-160-0) (line 160, col 0, score 0.64)
- [Dynamic Context Model for Web Components — L145](dynamic-context-model-for-web-components.md#^ref-f7702bf8-145-0) (line 145, col 0, score 0.63)
- [schema-evolution-workflow — L466](schema-evolution-workflow.md#^ref-d8059b6a-466-0) (line 466, col 0, score 0.58)
- [Eidolon Field Abstract Model — L105](eidolon-field-abstract-model.md#^ref-5e8b2388-105-0) (line 105, col 0, score 0.62)
- [Admin Dashboard for User Management — L25](admin-dashboard-for-user-management.md#^ref-2901a3e9-25-0) (line 25, col 0, score 0.62)
- [Agent Tasks: Persistence Migration to DualStore — L81](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-81-0) (line 81, col 0, score 0.73)
- [Promethean-native config design — L72](promethean-native-config-design.md#^ref-ab748541-72-0) (line 72, col 0, score 0.6)
- [Promethean Documentation Pipeline Overview — L154](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-154-0) (line 154, col 0, score 0.59)
- [template-based-compilation — L21](template-based-compilation.md#^ref-f8877e5e-21-0) (line 21, col 0, score 0.61)
- [Migrate to Provider-Tenant Architecture — L59](migrate-to-provider-tenant-architecture.md#^ref-54382370-59-0) (line 59, col 0, score 0.75)
- [Promethean Documentation Pipeline Overview — L115](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-115-0) (line 115, col 0, score 0.69)
- [Event Bus MVP — L368](event-bus-mvp.md#^ref-534fe91d-368-0) (line 368, col 0, score 0.68)
- [Chroma Toolkit Consolidation Plan — L10](chroma-toolkit-consolidation-plan.md#^ref-5020e892-10-0) (line 10, col 0, score 0.69)
- [Promethean Agent Config DSL — L11](promethean-agent-config-dsl.md#^ref-2c00ce45-11-0) (line 11, col 0, score 0.65)
- [i3-config-validation-methods — L16](i3-config-validation-methods.md#^ref-d28090ac-16-0) (line 16, col 0, score 0.64)
- [Agent Tasks: Persistence Migration to DualStore — L128](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-128-0) (line 128, col 0, score 0.63)
- [aionian-circuit-math — L157](aionian-circuit-math.md#^ref-f2d83a77-157-0) (line 157, col 0, score 0.63)
- [api-gateway-versioning — L299](api-gateway-versioning.md#^ref-0580dcd3-299-0) (line 299, col 0, score 0.63)
- [Board Walk – 2025-08-11 — L132](board-walk-2025-08-11.md#^ref-7aa1eb92-132-0) (line 132, col 0, score 1)
- [prom-lib-rate-limiters-and-replay-api — L335](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-335-0) (line 335, col 0, score 1)
- [polymorphic-meta-programming-engine — L142](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-142-0) (line 142, col 0, score 0.69)
- [Chroma Toolkit Consolidation Plan — L60](chroma-toolkit-consolidation-plan.md#^ref-5020e892-60-0) (line 60, col 0, score 0.68)
- [Recursive Prompt Construction Engine — L64](recursive-prompt-construction-engine.md#^ref-babdb9eb-64-0) (line 64, col 0, score 0.67)
- [Dynamic Context Model for Web Components — L31](dynamic-context-model-for-web-components.md#^ref-f7702bf8-31-0) (line 31, col 0, score 0.66)
- [Local-Offline-Model-Deployment-Strategy — L234](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-234-0) (line 234, col 0, score 0.64)
- [Protocol_0_The_Contradiction_Engine — L35](protocol-0-the-contradiction-engine.md#^ref-9a93a756-35-0) (line 35, col 0, score 0.63)
- [Chroma-Embedding-Refactor — L107](chroma-embedding-refactor.md#^ref-8b256935-107-0) (line 107, col 0, score 0.63)
- [Matplotlib Animation with Async Execution — L38](matplotlib-animation-with-async-execution.md#^ref-687439f9-38-0) (line 38, col 0, score 0.62)
- [WebSocket Gateway Implementation — L379](websocket-gateway-implementation.md#^ref-e811123d-379-0) (line 379, col 0, score 0.72)
- [prom-lib-rate-limiters-and-replay-api — L369](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-369-0) (line 369, col 0, score 0.64)
- [Stateful Partitions and Rebalancing — L516](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-516-0) (line 516, col 0, score 0.65)
- [State Snapshots API and Transactional Projector — L329](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-329-0) (line 329, col 0, score 0.68)
- [Event Bus MVP — L365](event-bus-mvp.md#^ref-534fe91d-365-0) (line 365, col 0, score 0.62)
- [prom-lib-rate-limiters-and-replay-api — L337](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-337-0) (line 337, col 0, score 0.67)
- [AI-Centric OS with MCP Layer — L23](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-23-0) (line 23, col 0, score 0.61)
- [Promethean Agent DSL TS Scaffold — L308](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-308-0) (line 308, col 0, score 0.66)
- [balanced-bst — L3](balanced-bst.md#^ref-d3e7db72-3-0) (line 3, col 0, score 0.64)
- [Stateful Partitions and Rebalancing — L202](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-202-0) (line 202, col 0, score 0.66)
- [State Snapshots API and Transactional Projector — L9](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-9-0) (line 9, col 0, score 0.7)
- [Per-Domain Policy System for JS Crawler — L184](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-184-0) (line 184, col 0, score 0.61)
- [Performance-Optimized-Polyglot-Bridge — L163](performance-optimized-polyglot-bridge.md#^ref-f5579967-163-0) (line 163, col 0, score 0.7)
- [Cross-Language Runtime Polymorphism — L20](cross-language-runtime-polymorphism.md#^ref-c34c36a6-20-0) (line 20, col 0, score 0.67)
- [Local-First Intention→Code Loop with Free Models — L125](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-125-0) (line 125, col 0, score 0.67)
- [plan-update-confirmation — L470](plan-update-confirmation.md#^ref-b22d79c6-470-0) (line 470, col 0, score 0.66)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L5](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-5-0) (line 5, col 0, score 0.66)
- [Performance-Optimized-Polyglot-Bridge — L414](performance-optimized-polyglot-bridge.md#^ref-f5579967-414-0) (line 414, col 0, score 0.65)
- [plan-update-confirmation — L585](plan-update-confirmation.md#^ref-b22d79c6-585-0) (line 585, col 0, score 0.64)
- [komorebi-group-window-hack — L22](komorebi-group-window-hack.md#^ref-dd89372d-22-0) (line 22, col 0, score 0.64)
- [Cross-Language Runtime Polymorphism — L119](cross-language-runtime-polymorphism.md#^ref-c34c36a6-119-0) (line 119, col 0, score 0.64)
- [prom-lib-rate-limiters-and-replay-api — L63](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-63-0) (line 63, col 0, score 0.93)
- [universal-intention-code-fabric — L27](universal-intention-code-fabric.md#^ref-c14edce7-27-0) (line 27, col 0, score 0.63)
- [WebSocket Gateway Implementation — L437](websocket-gateway-implementation.md#^ref-e811123d-437-0) (line 437, col 0, score 0.59)
- [Stateful Partitions and Rebalancing — L326](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-326-0) (line 326, col 0, score 0.63)
- [Migrate to Provider-Tenant Architecture — L179](migrate-to-provider-tenant-architecture.md#^ref-54382370-179-0) (line 179, col 0, score 0.65)
- [Migrate to Provider-Tenant Architecture — L150](migrate-to-provider-tenant-architecture.md#^ref-54382370-150-0) (line 150, col 0, score 0.61)
- [Stateful Partitions and Rebalancing — L511](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-511-0) (line 511, col 0, score 0.63)
- [Promethean-native config design — L342](promethean-native-config-design.md#^ref-ab748541-342-0) (line 342, col 0, score 0.65)
- [Stateful Partitions and Rebalancing — L328](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-328-0) (line 328, col 0, score 0.64)
- [Mongo Outbox Implementation — L284](mongo-outbox-implementation.md#^ref-9c1acd1e-284-0) (line 284, col 0, score 0.63)
- [Mongo Outbox Implementation — L148](mongo-outbox-implementation.md#^ref-9c1acd1e-148-0) (line 148, col 0, score 0.64)
- [Cross-Language Runtime Polymorphism — L141](cross-language-runtime-polymorphism.md#^ref-c34c36a6-141-0) (line 141, col 0, score 0.63)
- [observability-infrastructure-setup — L138](observability-infrastructure-setup.md#^ref-b4e64f8c-138-0) (line 138, col 0, score 0.66)
- [schema-evolution-workflow — L450](schema-evolution-workflow.md#^ref-d8059b6a-450-0) (line 450, col 0, score 0.72)
- [Language-Agnostic Mirror System — L507](language-agnostic-mirror-system.md#^ref-d2b3628c-507-0) (line 507, col 0, score 0.65)
- [plan-update-confirmation — L650](plan-update-confirmation.md#^ref-b22d79c6-650-0) (line 650, col 0, score 0.62)
- [plan-update-confirmation — L662](plan-update-confirmation.md#^ref-b22d79c6-662-0) (line 662, col 0, score 0.64)
- [plan-update-confirmation — L674](plan-update-confirmation.md#^ref-b22d79c6-674-0) (line 674, col 0, score 0.64)
- [schema-evolution-workflow — L465](schema-evolution-workflow.md#^ref-d8059b6a-465-0) (line 465, col 0, score 0.62)
- [prom-lib-rate-limiters-and-replay-api — L358](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-358-0) (line 358, col 0, score 0.66)
- [prom-lib-rate-limiters-and-replay-api — L356](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-356-0) (line 356, col 0, score 0.63)
- [Event Bus MVP — L509](event-bus-mvp.md#^ref-534fe91d-509-0) (line 509, col 0, score 0.73)
- [prom-lib-rate-limiters-and-replay-api — L351](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-351-0) (line 351, col 0, score 0.59)
- [schema-evolution-workflow — L393](schema-evolution-workflow.md#^ref-d8059b6a-393-0) (line 393, col 0, score 0.72)
- [WebSocket Gateway Implementation — L9](websocket-gateway-implementation.md#^ref-e811123d-9-0) (line 9, col 0, score 0.66)
- [WebSocket Gateway Implementation — L48](websocket-gateway-implementation.md#^ref-e811123d-48-0) (line 48, col 0, score 0.88)
- [WebSocket Gateway Implementation — L43](websocket-gateway-implementation.md#^ref-e811123d-43-0) (line 43, col 0, score 0.87)
- [WebSocket Gateway Implementation — L45](websocket-gateway-implementation.md#^ref-e811123d-45-0) (line 45, col 0, score 0.87)
- [WebSocket Gateway Implementation — L46](websocket-gateway-implementation.md#^ref-e811123d-46-0) (line 46, col 0, score 0.87)
- [WebSocket Gateway Implementation — L47](websocket-gateway-implementation.md#^ref-e811123d-47-0) (line 47, col 0, score 0.87)
- [WebSocket Gateway Implementation — L49](websocket-gateway-implementation.md#^ref-e811123d-49-0) (line 49, col 0, score 0.84)
- [WebSocket Gateway Implementation — L50](websocket-gateway-implementation.md#^ref-e811123d-50-0) (line 50, col 0, score 0.68)
- [Dynamic Context Model for Web Components — L187](dynamic-context-model-for-web-components.md#^ref-f7702bf8-187-0) (line 187, col 0, score 0.66)
- [Voice Access Layer Design — L222](voice-access-layer-design.md#^ref-543ed9b3-222-0) (line 222, col 0, score 0.63)
- [Promethean Infrastructure Setup — L392](promethean-infrastructure-setup.md#^ref-6deed6ac-392-0) (line 392, col 0, score 0.63)
- [TypeScript Patch for Tool Calling Support — L67](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-67-0) (line 67, col 0, score 0.65)
- [Migrate to Provider-Tenant Architecture — L261](migrate-to-provider-tenant-architecture.md#^ref-54382370-261-0) (line 261, col 0, score 0.63)
- [Chroma Toolkit Consolidation Plan — L162](chroma-toolkit-consolidation-plan.md#^ref-5020e892-162-0) (line 162, col 0, score 0.63)
- [windows-tiling-with-autohotkey — L7](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-7-0) (line 7, col 0, score 0.64)
- [Cross-Language Runtime Polymorphism — L121](cross-language-runtime-polymorphism.md#^ref-c34c36a6-121-0) (line 121, col 0, score 0.63)
- [js-to-lisp-reverse-compiler — L398](js-to-lisp-reverse-compiler.md#^ref-58191024-398-0) (line 398, col 0, score 0.6)
- [Ice Box Reorganization — L26](ice-box-reorganization.md#^ref-291c7d91-26-0) (line 26, col 0, score 0.59)
- [Mongo Outbox Implementation — L537](mongo-outbox-implementation.md#^ref-9c1acd1e-537-0) (line 537, col 0, score 0.61)
- [Universal Lisp Interface — L86](universal-lisp-interface.md#^ref-b01856b4-86-0) (line 86, col 0, score 0.57)
- [heartbeat-simulation-snippets — L13](heartbeat-simulation-snippets.md#^ref-23e221e9-13-0) (line 13, col 0, score 0.66)
- [prom-lib-rate-limiters-and-replay-api — L92](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-92-0) (line 92, col 0, score 0.7)
- [Fnord Tracer Protocol — L54](fnord-tracer-protocol.md#^ref-fc21f824-54-0) (line 54, col 0, score 0.55)
- [Functional Embedding Pipeline Refactor — L1](functional-embedding-pipeline-refactor.md#^ref-a4a25141-1-0) (line 1, col 0, score 0.55)
- [Redirecting Standard Error — L7](redirecting-standard-error.md#^ref-b3555ede-7-0) (line 7, col 0, score 0.55)
- [universal-intention-code-fabric — L393](universal-intention-code-fabric.md#^ref-c14edce7-393-0) (line 393, col 0, score 0.56)
- [Promethean Pipelines — L58](promethean-pipelines.md#^ref-8b8e6103-58-0) (line 58, col 0, score 0.72)
- [Promethean-native config design — L32](promethean-native-config-design.md#^ref-ab748541-32-0) (line 32, col 0, score 0.63)
- [prom-lib-rate-limiters-and-replay-api — L88](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-88-0) (line 88, col 0, score 0.68)
- [AI-Centric OS with MCP Layer — L384](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-384-0) (line 384, col 0, score 0.65)
- [plan-update-confirmation — L520](plan-update-confirmation.md#^ref-b22d79c6-520-0) (line 520, col 0, score 0.62)
- [Event Bus MVP — L381](event-bus-mvp.md#^ref-534fe91d-381-0) (line 381, col 0, score 0.62)
- [plan-update-confirmation — L453](plan-update-confirmation.md#^ref-b22d79c6-453-0) (line 453, col 0, score 0.66)
- [plan-update-confirmation — L575](plan-update-confirmation.md#^ref-b22d79c6-575-0) (line 575, col 0, score 0.66)
- [plan-update-confirmation — L590](plan-update-confirmation.md#^ref-b22d79c6-590-0) (line 590, col 0, score 0.65)
- [prom-lib-rate-limiters-and-replay-api — L250](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-250-0) (line 250, col 0, score 0.65)
- [Duck's Attractor States — L45](ducks-attractor-states.md#^ref-13951643-45-0) (line 45, col 0, score 0.65)
- [universal-intention-code-fabric — L26](universal-intention-code-fabric.md#^ref-c14edce7-26-0) (line 26, col 0, score 0.6)
- [plan-update-confirmation — L474](plan-update-confirmation.md#^ref-b22d79c6-474-0) (line 474, col 0, score 0.64)
- [Exception Layer Analysis — L117](exception-layer-analysis.md#^ref-21d5cc09-117-0) (line 117, col 0, score 0.64)
- [WebSocket Gateway Implementation — L296](websocket-gateway-implementation.md#^ref-e811123d-296-0) (line 296, col 0, score 0.62)
- [Mongo Outbox Implementation — L1](mongo-outbox-implementation.md#^ref-9c1acd1e-1-0) (line 1, col 0, score 0.57)
- [Voice Access Layer Design — L109](voice-access-layer-design.md#^ref-543ed9b3-109-0) (line 109, col 0, score 0.66)
- [sibilant-metacompiler-overview — L49](sibilant-metacompiler-overview.md#^ref-61d4086b-49-0) (line 49, col 0, score 0.56)
- [Services — L3](chunks/services.md#^ref-75ea4a6a-3-0) (line 3, col 0, score 0.57)
- [prom-lib-rate-limiters-and-replay-api — L354](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-354-0) (line 354, col 0, score 0.61)
- [komorebi-group-window-hack — L23](komorebi-group-window-hack.md#^ref-dd89372d-23-0) (line 23, col 0, score 0.65)
- [Performance-Optimized-Polyglot-Bridge — L417](performance-optimized-polyglot-bridge.md#^ref-f5579967-417-0) (line 417, col 0, score 0.6)
- [Voice Access Layer Design — L216](voice-access-layer-design.md#^ref-543ed9b3-216-0) (line 216, col 0, score 0.62)
- [Reawakening Duck — L32](reawakening-duck.md#^ref-59b5670f-32-0) (line 32, col 0, score 0.62)
- [Exception Layer Analysis — L3](exception-layer-analysis.md#^ref-21d5cc09-3-0) (line 3, col 0, score 0.61)
- [heartbeat-simulation-snippets — L67](heartbeat-simulation-snippets.md#^ref-23e221e9-67-0) (line 67, col 0, score 0.68)
- [Language-Agnostic Mirror System — L30](language-agnostic-mirror-system.md#^ref-d2b3628c-30-0) (line 30, col 0, score 0.6)
- [Agent Tasks: Persistence Migration to DualStore — L84](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-84-0) (line 84, col 0, score 0.63)
- [heartbeat-fragment-demo — L77](heartbeat-fragment-demo.md#^ref-dd00677a-77-0) (line 77, col 0, score 0.63)
- [Migrate to Provider-Tenant Architecture — L83](migrate-to-provider-tenant-architecture.md#^ref-54382370-83-0) (line 83, col 0, score 0.63)
- [file-watcher-auth-fix — L19](file-watcher-auth-fix.md#^ref-9044701b-19-0) (line 19, col 0, score 0.62)
- [schema-evolution-workflow — L224](schema-evolution-workflow.md#^ref-d8059b6a-224-0) (line 224, col 0, score 0.65)
- [Services — L4](chunks/services.md#^ref-75ea4a6a-4-0) (line 4, col 0, score 0.61)
- [Unique Info Dump Index — L38](unique-info-dump-index.md#^ref-30ec3ba6-38-0) (line 38, col 0, score 0.61)
- [schema-evolution-workflow — L201](schema-evolution-workflow.md#^ref-d8059b6a-201-0) (line 201, col 0, score 0.59)
- [schema-evolution-workflow — L1](schema-evolution-workflow.md#^ref-d8059b6a-1-0) (line 1, col 0, score 0.62)
- [Debugging Broker Connections and Agent Behavior — L5](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-5-0) (line 5, col 0, score 0.64)
- [Fnord Tracer Protocol — L214](fnord-tracer-protocol.md#^ref-fc21f824-214-0) (line 214, col 0, score 0.72)
- [layer-1-uptime-diagrams — L122](layer-1-uptime-diagrams.md#^ref-4127189a-122-0) (line 122, col 0, score 0.69)
- [Event Bus Projections Architecture — L5](event-bus-projections-architecture.md#^ref-cf6b9b17-5-0) (line 5, col 0, score 0.82)
- [WebSocket Gateway Implementation — L614](websocket-gateway-implementation.md#^ref-e811123d-614-0) (line 614, col 0, score 0.62)
- [Stateful Partitions and Rebalancing — L448](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-448-0) (line 448, col 0, score 0.76)
- [prom-lib-rate-limiters-and-replay-api — L348](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-348-0) (line 348, col 0, score 0.66)
- [Dynamic Context Model for Web Components — L80](dynamic-context-model-for-web-components.md#^ref-f7702bf8-80-0) (line 80, col 0, score 0.6)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L7](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-7-0) (line 7, col 0, score 0.62)
- [prom-lib-rate-limiters-and-replay-api — L260](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-260-0) (line 260, col 0, score 0.69)
- [Stateful Partitions and Rebalancing — L98](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-98-0) (line 98, col 0, score 0.64)
- [sibilant-metacompiler-overview — L51](sibilant-metacompiler-overview.md#^ref-61d4086b-51-0) (line 51, col 0, score 0.68)
- [Provider-Agnostic Chat Panel Implementation — L26](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-26-0) (line 26, col 0, score 0.6)
- [Provider-Agnostic Chat Panel Implementation — L183](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-183-0) (line 183, col 0, score 0.62)
- [plan-update-confirmation — L116](plan-update-confirmation.md#^ref-b22d79c6-116-0) (line 116, col 0, score 0.57)
- [Cross-Target Macro System in Sibilant — L141](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-141-0) (line 141, col 0, score 0.69)
- [sibilant-macro-targets — L64](sibilant-macro-targets.md#^ref-c5c9a5c6-64-0) (line 64, col 0, score 0.66)
- [Cross-Target Macro System in Sibilant — L21](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-21-0) (line 21, col 0, score 0.66)
- [Cross-Target Macro System in Sibilant — L134](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-134-0) (line 134, col 0, score 0.65)
- [aionian-circuit-math — L110](aionian-circuit-math.md#^ref-f2d83a77-110-0) (line 110, col 0, score 0.61)
- [prom-lib-rate-limiters-and-replay-api — L328](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-328-0) (line 328, col 0, score 0.6)
- [Agent Tasks: Persistence Migration to DualStore — L103](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-103-0) (line 103, col 0, score 0.63)
- [Prompt_Folder_Bootstrap — L175](prompt-folder-bootstrap.md#^ref-bd4f0976-175-0) (line 175, col 0, score 0.59)
- [Protocol_0_The_Contradiction_Engine — L129](protocol-0-the-contradiction-engine.md#^ref-9a93a756-129-0) (line 129, col 0, score 0.59)
- [Agent Tasks: Persistence Migration to DualStore — L55](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-55-0) (line 55, col 0, score 0.59)
- [Migrate to Provider-Tenant Architecture — L44](migrate-to-provider-tenant-architecture.md#^ref-54382370-44-0) (line 44, col 0, score 0.66)
- [universal-intention-code-fabric — L382](universal-intention-code-fabric.md#^ref-c14edce7-382-0) (line 382, col 0, score 0.64)
- [Mongo Outbox Implementation — L74](mongo-outbox-implementation.md#^ref-9c1acd1e-74-0) (line 74, col 0, score 0.84)
- [prom-lib-rate-limiters-and-replay-api — L65](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-65-0) (line 65, col 0, score 0.63)
- [AI-Centric OS with MCP Layer — L425](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-425-0) (line 425, col 0, score 0.63)
- [api-gateway-versioning — L285](api-gateway-versioning.md#^ref-0580dcd3-285-0) (line 285, col 0, score 0.63)
- [Board Walk – 2025-08-11 — L150](board-walk-2025-08-11.md#^ref-7aa1eb92-150-0) (line 150, col 0, score 0.63)
- [Chroma Toolkit Consolidation Plan — L212](chroma-toolkit-consolidation-plan.md#^ref-5020e892-212-0) (line 212, col 0, score 0.63)
- [Services — L35](chunks/services.md#^ref-75ea4a6a-35-0) (line 35, col 0, score 0.63)
- [Cross-Target Macro System in Sibilant — L213](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-213-0) (line 213, col 0, score 0.63)
- [Dynamic Context Model for Web Components — L405](dynamic-context-model-for-web-components.md#^ref-f7702bf8-405-0) (line 405, col 0, score 0.63)
- [schema-evolution-workflow — L3](schema-evolution-workflow.md#^ref-d8059b6a-3-0) (line 3, col 0, score 0.61)
- [Simulation Demo — L32](chunks/simulation-demo.md#^ref-557309a3-32-0) (line 32, col 0, score 1)
- [Tooling — L26](chunks/tooling.md#^ref-6cb4943e-26-0) (line 26, col 0, score 1)
- [Window Management — L36](chunks/window-management.md#^ref-9e8ae388-36-0) (line 36, col 0, score 1)
- [compiler-kit-foundations — L639](compiler-kit-foundations.md#^ref-01b21543-639-0) (line 639, col 0, score 1)
- [Creative Moments — L10](creative-moments.md#^ref-10d98225-10-0) (line 10, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L258](cross-language-runtime-polymorphism.md#^ref-c34c36a6-258-0) (line 258, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L215](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-215-0) (line 215, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L50](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-50-0) (line 50, col 0, score 1)
- [DuckDuckGoSearchPipeline — L16](duckduckgosearchpipeline.md#^ref-e979c50f-16-0) (line 16, col 0, score 1)
- [Unique Info Dump Index — L37](unique-info-dump-index.md#^ref-30ec3ba6-37-0) (line 37, col 0, score 0.57)
- [Mongo Outbox Implementation — L516](mongo-outbox-implementation.md#^ref-9c1acd1e-516-0) (line 516, col 0, score 0.66)
- [AI-Centric OS with MCP Layer — L21](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-21-0) (line 21, col 0, score 0.63)
- [Migrate to Provider-Tenant Architecture — L207](migrate-to-provider-tenant-architecture.md#^ref-54382370-207-0) (line 207, col 0, score 0.61)
- [Promethean Agent Config DSL — L13](promethean-agent-config-dsl.md#^ref-2c00ce45-13-0) (line 13, col 0, score 0.7)
- [schema-evolution-workflow — L311](schema-evolution-workflow.md#^ref-d8059b6a-311-0) (line 311, col 0, score 0.67)
- [AI-Centric OS with MCP Layer — L18](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-18-0) (line 18, col 0, score 0.66)
- [universal-intention-code-fabric — L417](universal-intention-code-fabric.md#^ref-c14edce7-417-0) (line 417, col 0, score 0.65)
- [Promethean Agent Config DSL — L291](promethean-agent-config-dsl.md#^ref-2c00ce45-291-0) (line 291, col 0, score 0.64)
- [Chroma Toolkit Consolidation Plan — L74](chroma-toolkit-consolidation-plan.md#^ref-5020e892-74-0) (line 74, col 0, score 0.73)
- [Chroma Toolkit Consolidation Plan — L124](chroma-toolkit-consolidation-plan.md#^ref-5020e892-124-0) (line 124, col 0, score 0.73)
- [Chroma Toolkit Consolidation Plan — L109](chroma-toolkit-consolidation-plan.md#^ref-5020e892-109-0) (line 109, col 0, score 0.75)
- [Chroma Toolkit Consolidation Plan — L90](chroma-toolkit-consolidation-plan.md#^ref-5020e892-90-0) (line 90, col 0, score 0.76)
- [State Snapshots API and Transactional Projector — L93](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-93-0) (line 93, col 0, score 0.68)
- [State Snapshots API and Transactional Projector — L132](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-132-0) (line 132, col 0, score 0.67)
- [Mongo Outbox Implementation — L323](mongo-outbox-implementation.md#^ref-9c1acd1e-323-0) (line 323, col 0, score 0.72)
- [Chroma Toolkit Consolidation Plan — L139](chroma-toolkit-consolidation-plan.md#^ref-5020e892-139-0) (line 139, col 0, score 0.7)
- [Chroma Toolkit Consolidation Plan — L159](chroma-toolkit-consolidation-plan.md#^ref-5020e892-159-0) (line 159, col 0, score 0.63)
- [WebSocket Gateway Implementation — L625](websocket-gateway-implementation.md#^ref-e811123d-625-0) (line 625, col 0, score 0.64)
- [Stateful Partitions and Rebalancing — L514](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-514-0) (line 514, col 0, score 0.67)
- [Chroma Toolkit Consolidation Plan — L146](chroma-toolkit-consolidation-plan.md#^ref-5020e892-146-0) (line 146, col 0, score 0.63)
- [WebSocket Gateway Implementation — L616](websocket-gateway-implementation.md#^ref-e811123d-616-0) (line 616, col 0, score 0.63)
- [Chroma Toolkit Consolidation Plan — L122](chroma-toolkit-consolidation-plan.md#^ref-5020e892-122-0) (line 122, col 0, score 0.66)
- [Voice Access Layer Design — L214](voice-access-layer-design.md#^ref-543ed9b3-214-0) (line 214, col 0, score 0.61)
- [ecs-scheduler-and-prefabs — L368](ecs-scheduler-and-prefabs.md#^ref-c62a1815-368-0) (line 368, col 0, score 0.59)
- [System Scheduler with Resource-Aware DAG — L366](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-366-0) (line 366, col 0, score 0.59)
- [Migrate to Provider-Tenant Architecture — L253](migrate-to-provider-tenant-architecture.md#^ref-54382370-253-0) (line 253, col 0, score 0.59)
- [WebSocket Gateway Implementation — L443](websocket-gateway-implementation.md#^ref-e811123d-443-0) (line 443, col 0, score 0.68)
- [lisp-dsl-for-window-management — L81](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-81-0) (line 81, col 0, score 0.58)
- [lisp-dsl-for-window-management — L101](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-101-0) (line 101, col 0, score 0.58)
- [Promethean Documentation Pipeline Overview — L42](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-42-0) (line 42, col 0, score 0.56)
- [Agent Tasks: Persistence Migration to DualStore — L8](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-8-0) (line 8, col 0, score 0.6)
- [Promethean Agent Config DSL — L290](promethean-agent-config-dsl.md#^ref-2c00ce45-290-0) (line 290, col 0, score 0.61)
- [ecs-offload-workers — L207](ecs-offload-workers.md#^ref-6498b9d7-207-0) (line 207, col 0, score 0.61)
- [Language-Agnostic Mirror System — L513](language-agnostic-mirror-system.md#^ref-d2b3628c-513-0) (line 513, col 0, score 0.63)
- [Local-Only-LLM-Workflow — L159](local-only-llm-workflow.md#^ref-9a8ab57e-159-0) (line 159, col 0, score 0.61)
- [WebSocket Gateway Implementation — L376](websocket-gateway-implementation.md#^ref-e811123d-376-0) (line 376, col 0, score 0.71)
- [Chroma Toolkit Consolidation Plan — L130](chroma-toolkit-consolidation-plan.md#^ref-5020e892-130-0) (line 130, col 0, score 0.65)
- [Agent Tasks: Persistence Migration to DualStore — L152](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-152-0) (line 152, col 0, score 1)
- [api-gateway-versioning — L294](api-gateway-versioning.md#^ref-0580dcd3-294-0) (line 294, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L191](chroma-toolkit-consolidation-plan.md#^ref-5020e892-191-0) (line 191, col 0, score 1)
- [Services — L11](chunks/services.md#^ref-75ea4a6a-11-0) (line 11, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L38](migrate-to-provider-tenant-architecture.md#^ref-54382370-38-0) (line 38, col 0, score 0.64)
- [Interop and Source Maps — L504](interop-and-source-maps.md#^ref-cdfac40c-504-0) (line 504, col 0, score 0.6)
- [Per-Domain Policy System for JS Crawler — L115](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-115-0) (line 115, col 0, score 0.67)
- [plan-update-confirmation — L406](plan-update-confirmation.md#^ref-b22d79c6-406-0) (line 406, col 0, score 0.6)
- [Agent Tasks: Persistence Migration to DualStore — L78](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-78-0) (line 78, col 0, score 0.72)
- [Factorio AI with External Agents — L24](factorio-ai-with-external-agents.md#^ref-a4d90289-24-0) (line 24, col 0, score 0.59)
- [Chroma-Embedding-Refactor — L26](chroma-embedding-refactor.md#^ref-8b256935-26-0) (line 26, col 0, score 0.62)
- [Mongo Outbox Implementation — L533](mongo-outbox-implementation.md#^ref-9c1acd1e-533-0) (line 533, col 0, score 0.66)
- [Model Upgrade Calm-Down Guide — L48](model-upgrade-calm-down-guide.md#^ref-db74343f-48-0) (line 48, col 0, score 0.58)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L469](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-469-0) (line 469, col 0, score 0.59)
- [Local-First Intention→Code Loop with Free Models — L1](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-1-0) (line 1, col 0, score 0.59)
- [sibilant-macro-targets — L105](sibilant-macro-targets.md#^ref-c5c9a5c6-105-0) (line 105, col 0, score 0.58)
- [Chroma Toolkit Consolidation Plan — L214](chroma-toolkit-consolidation-plan.md#^ref-5020e892-214-0) (line 214, col 0, score 1)
- [Tooling — L18](chunks/tooling.md#^ref-6cb4943e-18-0) (line 18, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L226](cross-language-runtime-polymorphism.md#^ref-c34c36a6-226-0) (line 226, col 0, score 1)
- [ecs-offload-workers — L473](ecs-offload-workers.md#^ref-6498b9d7-473-0) (line 473, col 0, score 1)
- [ecs-scheduler-and-prefabs — L399](ecs-scheduler-and-prefabs.md#^ref-c62a1815-399-0) (line 399, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L26](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-26-0) (line 26, col 0, score 0.7)
- [Admin Dashboard for User Management — L27](admin-dashboard-for-user-management.md#^ref-2901a3e9-27-0) (line 27, col 0, score 0.62)
- [Migrate to Provider-Tenant Architecture — L141](migrate-to-provider-tenant-architecture.md#^ref-54382370-141-0) (line 141, col 0, score 0.62)
- [Provider-Agnostic Chat Panel Implementation — L12](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-12-0) (line 12, col 0, score 0.81)
- [Promethean Infrastructure Setup — L558](promethean-infrastructure-setup.md#^ref-6deed6ac-558-0) (line 558, col 0, score 0.61)
- [eidolon-field-math-foundations — L105](eidolon-field-math-foundations.md#^ref-008f2ac0-105-0) (line 105, col 0, score 0.61)
- [Promethean Agent Config DSL — L149](promethean-agent-config-dsl.md#^ref-2c00ce45-149-0) (line 149, col 0, score 0.81)
- [Factorio AI with External Agents — L34](factorio-ai-with-external-agents.md#^ref-a4d90289-34-0) (line 34, col 0, score 0.6)
- [ecs-offload-workers — L446](ecs-offload-workers.md#^ref-6498b9d7-446-0) (line 446, col 0, score 0.6)
- [ecs-scheduler-and-prefabs — L379](ecs-scheduler-and-prefabs.md#^ref-c62a1815-379-0) (line 379, col 0, score 0.6)
- [markdown-to-org-transpiler — L289](markdown-to-org-transpiler.md#^ref-ab54cdd8-289-0) (line 289, col 0, score 0.6)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L153](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-153-0) (line 153, col 0, score 0.6)
- [System Scheduler with Resource-Aware DAG — L377](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-377-0) (line 377, col 0, score 0.6)
- [api-gateway-versioning — L272](api-gateway-versioning.md#^ref-0580dcd3-272-0) (line 272, col 0, score 0.64)
- [Provider-Agnostic Chat Panel Implementation — L7](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-7-0) (line 7, col 0, score 0.71)
- [Provider-Agnostic Chat Panel Implementation — L215](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-215-0) (line 215, col 0, score 0.67)
- [Voice Access Layer Design — L91](voice-access-layer-design.md#^ref-543ed9b3-91-0) (line 91, col 0, score 0.65)
- [Migrate to Provider-Tenant Architecture — L105](migrate-to-provider-tenant-architecture.md#^ref-54382370-105-0) (line 105, col 0, score 0.64)
- [Migrate to Provider-Tenant Architecture — L100](migrate-to-provider-tenant-architecture.md#^ref-54382370-100-0) (line 100, col 0, score 0.62)
- [Dynamic Context Model for Web Components — L430](dynamic-context-model-for-web-components.md#^ref-f7702bf8-430-0) (line 430, col 0, score 0.68)
- [field-node-diagram-set — L141](field-node-diagram-set.md#^ref-22b989d5-141-0) (line 141, col 0, score 0.68)
- [homeostasis-decay-formulas — L158](homeostasis-decay-formulas.md#^ref-37b5d236-158-0) (line 158, col 0, score 0.68)
- [layer-1-uptime-diagrams — L169](layer-1-uptime-diagrams.md#^ref-4127189a-169-0) (line 169, col 0, score 0.68)
- [mystery-lisp-search-session — L136](mystery-lisp-search-session.md#^ref-513dc4c7-136-0) (line 136, col 0, score 0.68)
- [Obsidian ChatGPT Plugin Integration Guide — L43](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-43-0) (line 43, col 0, score 0.68)
- [Obsidian ChatGPT Plugin Integration — L41](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-41-0) (line 41, col 0, score 0.68)
- [Obsidian Templating Plugins Integration Guide — L100](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-100-0) (line 100, col 0, score 0.68)
- [Voice Access Layer Design — L201](voice-access-layer-design.md#^ref-543ed9b3-201-0) (line 201, col 0, score 0.63)
- [Performance-Optimized-Polyglot-Bridge — L425](performance-optimized-polyglot-bridge.md#^ref-f5579967-425-0) (line 425, col 0, score 0.61)
- [observability-infrastructure-setup — L304](observability-infrastructure-setup.md#^ref-b4e64f8c-304-0) (line 304, col 0, score 0.6)
- [prom-lib-rate-limiters-and-replay-api — L368](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-368-0) (line 368, col 0, score 0.6)
- [Mongo Outbox Implementation — L547](mongo-outbox-implementation.md#^ref-9c1acd1e-547-0) (line 547, col 0, score 0.6)
- [Model Selection for Lightweight Conversational Tasks — L24](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-24-0) (line 24, col 0, score 0.6)
- [State Snapshots API and Transactional Projector — L328](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-328-0) (line 328, col 0, score 0.59)
- [Dynamic Context Model for Web Components — L310](dynamic-context-model-for-web-components.md#^ref-f7702bf8-310-0) (line 310, col 0, score 0.61)
- [Migrate to Provider-Tenant Architecture — L132](migrate-to-provider-tenant-architecture.md#^ref-54382370-132-0) (line 132, col 0, score 0.6)
- [Migrate to Provider-Tenant Architecture — L22](migrate-to-provider-tenant-architecture.md#^ref-54382370-22-0) (line 22, col 0, score 0.6)
- [Dynamic Context Model for Web Components — L293](dynamic-context-model-for-web-components.md#^ref-f7702bf8-293-0) (line 293, col 0, score 0.64)
- [Event Bus MVP — L361](event-bus-mvp.md#^ref-534fe91d-361-0) (line 361, col 0, score 0.62)
- [Chroma-Embedding-Refactor — L3](chroma-embedding-refactor.md#^ref-8b256935-3-0) (line 3, col 0, score 0.61)
- [Voice Access Layer Design — L294](voice-access-layer-design.md#^ref-543ed9b3-294-0) (line 294, col 0, score 0.6)
- [Board Walk – 2025-08-11 — L93](board-walk-2025-08-11.md#^ref-7aa1eb92-93-0) (line 93, col 0, score 0.6)
- [Voice Access Layer Design — L215](voice-access-layer-design.md#^ref-543ed9b3-215-0) (line 215, col 0, score 0.6)
- [Admin Dashboard for User Management — L34](admin-dashboard-for-user-management.md#^ref-2901a3e9-34-0) (line 34, col 0, score 0.59)
- [Dynamic Context Model for Web Components — L330](dynamic-context-model-for-web-components.md#^ref-f7702bf8-330-0) (line 330, col 0, score 0.59)
- [Event Bus MVP — L383](event-bus-mvp.md#^ref-534fe91d-383-0) (line 383, col 0, score 0.7)
- [Mongo Outbox Implementation — L37](mongo-outbox-implementation.md#^ref-9c1acd1e-37-0) (line 37, col 0, score 0.79)
- [prom-lib-rate-limiters-and-replay-api — L345](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-345-0) (line 345, col 0, score 0.61)
- [WebSocket Gateway Implementation — L318](websocket-gateway-implementation.md#^ref-e811123d-318-0) (line 318, col 0, score 0.71)
- [Event Bus MVP — L359](event-bus-mvp.md#^ref-534fe91d-359-0) (line 359, col 0, score 0.71)
- [prom-lib-rate-limiters-and-replay-api — L329](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-329-0) (line 329, col 0, score 0.64)
- [lisp-dsl-for-window-management — L87](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-87-0) (line 87, col 0, score 0.64)
- [WebSocket Gateway Implementation — L617](websocket-gateway-implementation.md#^ref-e811123d-617-0) (line 617, col 0, score 0.63)
- [Lispy Macros with syntax-rules — L389](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-389-0) (line 389, col 0, score 0.62)
- [Duck's Attractor States — L47](ducks-attractor-states.md#^ref-13951643-47-0) (line 47, col 0, score 0.61)
- [prom-lib-rate-limiters-and-replay-api — L377](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-377-0) (line 377, col 0, score 0.84)
- [Migrate to Provider-Tenant Architecture — L128](migrate-to-provider-tenant-architecture.md#^ref-54382370-128-0) (line 128, col 0, score 0.77)
- [typed-struct-compiler — L380](typed-struct-compiler.md#^ref-78eeedf7-380-0) (line 380, col 0, score 0.76)
- [Stateful Partitions and Rebalancing — L290](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-290-0) (line 290, col 0, score 0.74)
- [Promethean-native config design — L27](promethean-native-config-design.md#^ref-ab748541-27-0) (line 27, col 0, score 0.71)
- [Services — L5](chunks/services.md#^ref-75ea4a6a-5-0) (line 5, col 0, score 0.68)
- [Unique Info Dump Index — L39](unique-info-dump-index.md#^ref-30ec3ba6-39-0) (line 39, col 0, score 0.68)
- [schema-evolution-workflow — L123](schema-evolution-workflow.md#^ref-d8059b6a-123-0) (line 123, col 0, score 0.68)
- [schema-evolution-workflow — L313](schema-evolution-workflow.md#^ref-d8059b6a-313-0) (line 313, col 0, score 0.66)
- [Promethean-native config design — L103](promethean-native-config-design.md#^ref-ab748541-103-0) (line 103, col 0, score 0.76)
- [schema-evolution-workflow — L9](schema-evolution-workflow.md#^ref-d8059b6a-9-0) (line 9, col 0, score 0.69)
- [Promethean Agent DSL TS Scaffold — L557](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-557-0) (line 557, col 0, score 0.69)
- [Performance-Optimized-Polyglot-Bridge — L170](performance-optimized-polyglot-bridge.md#^ref-f5579967-170-0) (line 170, col 0, score 0.68)
- [markdown-to-org-transpiler — L7](markdown-to-org-transpiler.md#^ref-ab54cdd8-7-0) (line 7, col 0, score 0.69)
- [Local-First Intention→Code Loop with Free Models — L127](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-127-0) (line 127, col 0, score 0.69)
- [komorebi-group-window-hack — L46](komorebi-group-window-hack.md#^ref-dd89372d-46-0) (line 46, col 0, score 0.72)
- [Agent Tasks: Persistence Migration to DualStore — L117](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-117-0) (line 117, col 0, score 0.68)
- [Promethean-Copilot-Intent-Engine — L31](promethean-copilot-intent-engine.md#^ref-ae24a280-31-0) (line 31, col 0, score 0.65)
- [Chroma Toolkit Consolidation Plan — L62](chroma-toolkit-consolidation-plan.md#^ref-5020e892-62-0) (line 62, col 0, score 0.65)
- [Chroma-Embedding-Refactor — L6](chroma-embedding-refactor.md#^ref-8b256935-6-0) (line 6, col 0, score 0.65)
- [Promethean Documentation Pipeline Overview — L114](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-114-0) (line 114, col 0, score 0.64)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L8](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-8-0) (line 8, col 0, score 0.64)
- [Promethean Agent Config DSL — L72](promethean-agent-config-dsl.md#^ref-2c00ce45-72-0) (line 72, col 0, score 0.64)
- [Chroma-Embedding-Refactor — L7](chroma-embedding-refactor.md#^ref-8b256935-7-0) (line 7, col 0, score 0.64)
- [Language-Agnostic Mirror System — L37](language-agnostic-mirror-system.md#^ref-d2b3628c-37-0) (line 37, col 0, score 0.78)
- [Shared Package Structure — L5](shared-package-structure.md#^ref-66a72fc3-5-0) (line 5, col 0, score 0.74)
- [universal-intention-code-fabric — L53](universal-intention-code-fabric.md#^ref-c14edce7-53-0) (line 53, col 0, score 0.74)
- [Promethean Web UI Setup — L262](promethean-web-ui-setup.md#^ref-bc5172ca-262-0) (line 262, col 0, score 0.73)
- [Promethean-native config design — L90](promethean-native-config-design.md#^ref-ab748541-90-0) (line 90, col 0, score 0.71)
- [Stateful Partitions and Rebalancing — L267](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-267-0) (line 267, col 0, score 0.68)
- [shared-package-layout-clarification — L11](shared-package-layout-clarification.md#^ref-36c8882a-11-0) (line 11, col 0, score 0.7)
- [shared-package-layout-clarification — L161](shared-package-layout-clarification.md#^ref-36c8882a-161-0) (line 161, col 0, score 0.68)
- [Event Bus MVP — L258](event-bus-mvp.md#^ref-534fe91d-258-0) (line 258, col 0, score 0.76)
- [Shared Package Structure — L159](shared-package-structure.md#^ref-66a72fc3-159-0) (line 159, col 0, score 0.68)
- [schema-evolution-workflow — L98](schema-evolution-workflow.md#^ref-d8059b6a-98-0) (line 98, col 0, score 0.68)
- [archetype-ecs — L7](archetype-ecs.md#^ref-8f4c1e86-7-0) (line 7, col 0, score 0.75)
- [Voice Access Layer Design — L183](voice-access-layer-design.md#^ref-543ed9b3-183-0) (line 183, col 0, score 0.74)
- [Promethean Agent DSL TS Scaffold — L227](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-227-0) (line 227, col 0, score 0.72)
- [Promethean Agent DSL TS Scaffold — L247](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-247-0) (line 247, col 0, score 0.68)
- [Language-Agnostic Mirror System — L127](language-agnostic-mirror-system.md#^ref-d2b3628c-127-0) (line 127, col 0, score 0.68)
- [prom-lib-rate-limiters-and-replay-api — L45](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-45-0) (line 45, col 0, score 0.69)
- [Language-Agnostic Mirror System — L109](language-agnostic-mirror-system.md#^ref-d2b3628c-109-0) (line 109, col 0, score 0.69)
- [compiler-kit-foundations — L31](compiler-kit-foundations.md#^ref-01b21543-31-0) (line 31, col 0, score 0.69)
- [prom-lib-rate-limiters-and-replay-api — L9](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-9-0) (line 9, col 0, score 0.69)
- [compiler-kit-foundations — L166](compiler-kit-foundations.md#^ref-01b21543-166-0) (line 166, col 0, score 0.69)
- [prom-lib-rate-limiters-and-replay-api — L194](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-194-0) (line 194, col 0, score 0.73)
- [WebSocket Gateway Implementation — L333](websocket-gateway-implementation.md#^ref-e811123d-333-0) (line 333, col 0, score 0.73)
- [ecs-scheduler-and-prefabs — L7](ecs-scheduler-and-prefabs.md#^ref-c62a1815-7-0) (line 7, col 0, score 0.64)
- [System Scheduler with Resource-Aware DAG — L5](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-5-0) (line 5, col 0, score 0.64)
- [Chroma-Embedding-Refactor — L260](chroma-embedding-refactor.md#^ref-8b256935-260-0) (line 260, col 0, score 0.73)
- [zero-copy-snapshots-and-workers — L202](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-202-0) (line 202, col 0, score 0.69)
- [WebSocket Gateway Implementation — L473](websocket-gateway-implementation.md#^ref-e811123d-473-0) (line 473, col 0, score 0.7)
- [Event Bus MVP — L471](event-bus-mvp.md#^ref-534fe91d-471-0) (line 471, col 0, score 0.67)
- [ecs-offload-workers — L169](ecs-offload-workers.md#^ref-6498b9d7-169-0) (line 169, col 0, score 0.69)
- [ecs-offload-workers — L397](ecs-offload-workers.md#^ref-6498b9d7-397-0) (line 397, col 0, score 0.68)
- [ecs-offload-workers — L39](ecs-offload-workers.md#^ref-6498b9d7-39-0) (line 39, col 0, score 0.67)
- [ecs-offload-workers — L209](ecs-offload-workers.md#^ref-6498b9d7-209-0) (line 209, col 0, score 0.67)
- [Promethean Infrastructure Setup — L415](promethean-infrastructure-setup.md#^ref-6deed6ac-415-0) (line 415, col 0, score 0.67)
- [Provider-Agnostic Chat Panel Implementation — L84](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-84-0) (line 84, col 0, score 0.67)
- [Cross-Language Runtime Polymorphism — L38](cross-language-runtime-polymorphism.md#^ref-c34c36a6-38-0) (line 38, col 0, score 0.67)
- [Promethean Infrastructure Setup — L485](promethean-infrastructure-setup.md#^ref-6deed6ac-485-0) (line 485, col 0, score 0.7)
- [zero-copy-snapshots-and-workers — L306](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-306-0) (line 306, col 0, score 0.69)
- [WebSocket Gateway Implementation — L533](websocket-gateway-implementation.md#^ref-e811123d-533-0) (line 533, col 0, score 0.69)
- [State Snapshots API and Transactional Projector — L248](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-248-0) (line 248, col 0, score 0.68)
- [Promethean Infrastructure Setup — L456](promethean-infrastructure-setup.md#^ref-6deed6ac-456-0) (line 456, col 0, score 0.69)
- [Local-First Intention→Code Loop with Free Models — L47](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-47-0) (line 47, col 0, score 0.67)
- [TypeScript Patch for Tool Calling Support — L35](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-35-0) (line 35, col 0, score 0.65)
- [Performance-Optimized-Polyglot-Bridge — L22](performance-optimized-polyglot-bridge.md#^ref-f5579967-22-0) (line 22, col 0, score 0.65)
- [Promethean Agent DSL TS Scaffold — L606](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-606-0) (line 606, col 0, score 0.64)
- [TypeScript Patch for Tool Calling Support — L88](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-88-0) (line 88, col 0, score 0.62)
- [zero-copy-snapshots-and-workers — L70](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-70-0) (line 70, col 0, score 0.62)
- [TypeScript Patch for Tool Calling Support — L113](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-113-0) (line 113, col 0, score 0.61)
- [WebSocket Gateway Implementation — L387](websocket-gateway-implementation.md#^ref-e811123d-387-0) (line 387, col 0, score 0.74)
- [Promethean Agent DSL TS Scaffold — L223](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-223-0) (line 223, col 0, score 0.73)
- [Promethean Agent DSL TS Scaffold — L488](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-488-0) (line 488, col 0, score 0.72)
- [Mongo Outbox Implementation — L263](mongo-outbox-implementation.md#^ref-9c1acd1e-263-0) (line 263, col 0, score 0.7)
- [Promethean Agent DSL TS Scaffold — L186](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-186-0) (line 186, col 0, score 0.69)
- [Promethean Agent DSL TS Scaffold — L774](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-774-0) (line 774, col 0, score 0.69)
- [Promethean Infrastructure Setup — L439](promethean-infrastructure-setup.md#^ref-6deed6ac-439-0) (line 439, col 0, score 0.69)
- [prom-lib-rate-limiters-and-replay-api — L282](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-282-0) (line 282, col 0, score 0.71)
- [WebSocket Gateway Implementation — L560](websocket-gateway-implementation.md#^ref-e811123d-560-0) (line 560, col 0, score 0.7)
- [State Snapshots API and Transactional Projector — L280](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-280-0) (line 280, col 0, score 0.7)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L445](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-445-0) (line 445, col 0, score 0.68)
- [Lispy Macros with syntax-rules — L365](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-365-0) (line 365, col 0, score 0.68)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L431](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-431-0) (line 431, col 0, score 0.67)
- [Lisp-Compiler-Integration — L440](lisp-compiler-integration.md#^ref-cfee6d36-440-0) (line 440, col 0, score 0.67)
- [Shared Package Structure — L58](shared-package-structure.md#^ref-66a72fc3-58-0) (line 58, col 0, score 0.68)
- [Shared Package Structure — L44](shared-package-structure.md#^ref-66a72fc3-44-0) (line 44, col 0, score 0.67)
- [Lispy Macros with syntax-rules — L319](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-319-0) (line 319, col 0, score 0.67)
- [schema-evolution-workflow — L71](schema-evolution-workflow.md#^ref-d8059b6a-71-0) (line 71, col 0, score 0.66)
- [State Snapshots API and Transactional Projector — L303](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-303-0) (line 303, col 0, score 0.66)
- [Migrate to Provider-Tenant Architecture — L101](migrate-to-provider-tenant-architecture.md#^ref-54382370-101-0) (line 101, col 0, score 0.82)
- [Chroma Toolkit Consolidation Plan — L157](chroma-toolkit-consolidation-plan.md#^ref-5020e892-157-0) (line 157, col 0, score 0.78)
- [Voice Access Layer Design — L115](voice-access-layer-design.md#^ref-543ed9b3-115-0) (line 115, col 0, score 0.75)
- [Dynamic Context Model for Web Components — L303](dynamic-context-model-for-web-components.md#^ref-f7702bf8-303-0) (line 303, col 0, score 0.74)
- [Promethean Pipelines: Local TypeScript-First Workflow — L219](promethean-pipelines-local-typescript-first-workflow.md#^ref-6b63edca-219-0) (line 219, col 0, score 0.8)
- [Promethean Infrastructure Setup — L501](promethean-infrastructure-setup.md#^ref-6deed6ac-501-0) (line 501, col 0, score 0.74)
- [archetype-ecs — L423](archetype-ecs.md#^ref-8f4c1e86-423-0) (line 423, col 0, score 0.73)
- [Duck's Attractor States — L5](ducks-attractor-states.md#^ref-13951643-5-0) (line 5, col 0, score 0.73)
- [Promethean Documentation Pipeline Overview — L78](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-78-0) (line 78, col 0, score 0.73)
- [Language-Agnostic Mirror System — L11](language-agnostic-mirror-system.md#^ref-d2b3628c-11-0) (line 11, col 0, score 0.72)
- [Event Bus Projections Architecture — L67](event-bus-projections-architecture.md#^ref-cf6b9b17-67-0) (line 67, col 0, score 0.71)
- [Stateful Partitions and Rebalancing — L187](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-187-0) (line 187, col 0, score 0.71)
- [schema-evolution-workflow — L132](schema-evolution-workflow.md#^ref-d8059b6a-132-0) (line 132, col 0, score 0.71)
- [ecs-scheduler-and-prefabs — L352](ecs-scheduler-and-prefabs.md#^ref-c62a1815-352-0) (line 352, col 0, score 0.71)
- [System Scheduler with Resource-Aware DAG — L350](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-350-0) (line 350, col 0, score 0.71)
- [RAG UI Panel with Qdrant and PostgREST — L336](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-336-0) (line 336, col 0, score 0.7)
- [promethean-system-diagrams — L95](promethean-system-diagrams.md#^ref-b51e19b4-95-0) (line 95, col 0, score 0.7)
- [Event Bus MVP — L390](event-bus-mvp.md#^ref-534fe91d-390-0) (line 390, col 0, score 0.79)
- [Voice Access Layer Design — L300](voice-access-layer-design.md#^ref-543ed9b3-300-0) (line 300, col 0, score 0.72)
- [Chroma-Embedding-Refactor — L326](chroma-embedding-refactor.md#^ref-8b256935-326-0) (line 326, col 0, score 0.58)
- [i3-config-validation-methods — L67](i3-config-validation-methods.md#^ref-d28090ac-67-0) (line 67, col 0, score 0.58)
- [Migrate to Provider-Tenant Architecture — L274](migrate-to-provider-tenant-architecture.md#^ref-54382370-274-0) (line 274, col 0, score 0.58)
- [Per-Domain Policy System for JS Crawler — L489](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-489-0) (line 489, col 0, score 0.58)
- [Promethean Agent Config DSL — L326](promethean-agent-config-dsl.md#^ref-2c00ce45-326-0) (line 326, col 0, score 0.58)
- [Promethean Infrastructure Setup — L579](promethean-infrastructure-setup.md#^ref-6deed6ac-579-0) (line 579, col 0, score 0.58)
- [Per-Domain Policy System for JS Crawler — L7](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-7-0) (line 7, col 0, score 0.67)
- [Promethean Agent Config DSL — L148](promethean-agent-config-dsl.md#^ref-2c00ce45-148-0) (line 148, col 0, score 0.62)
- [Prompt_Folder_Bootstrap — L168](prompt-folder-bootstrap.md#^ref-bd4f0976-168-0) (line 168, col 0, score 0.61)
- [Promethean-native config design — L74](promethean-native-config-design.md#^ref-ab748541-74-0) (line 74, col 0, score 0.61)
- [Promethean Agent Config DSL — L146](promethean-agent-config-dsl.md#^ref-2c00ce45-146-0) (line 146, col 0, score 0.61)
- [Migrate to Provider-Tenant Architecture — L64](migrate-to-provider-tenant-architecture.md#^ref-54382370-64-0) (line 64, col 0, score 0.6)
- [Migrate to Provider-Tenant Architecture — L162](migrate-to-provider-tenant-architecture.md#^ref-54382370-162-0) (line 162, col 0, score 0.6)
- [Promethean Agent DSL TS Scaffold — L723](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-723-0) (line 723, col 0, score 0.6)
- [Migrate to Provider-Tenant Architecture — L107](migrate-to-provider-tenant-architecture.md#^ref-54382370-107-0) (line 107, col 0, score 0.74)
- [Migrate to Provider-Tenant Architecture — L69](migrate-to-provider-tenant-architecture.md#^ref-54382370-69-0) (line 69, col 0, score 0.67)
- [Model Upgrade Calm-Down Guide — L40](model-upgrade-calm-down-guide.md#^ref-db74343f-40-0) (line 40, col 0, score 0.6)
- [Model Upgrade Calm-Down Guide — L38](model-upgrade-calm-down-guide.md#^ref-db74343f-38-0) (line 38, col 0, score 0.6)
- [Migrate to Provider-Tenant Architecture — L241](migrate-to-provider-tenant-architecture.md#^ref-54382370-241-0) (line 241, col 0, score 0.6)
- [Promethean Pipelines — L24](promethean-pipelines.md#^ref-8b8e6103-24-0) (line 24, col 0, score 0.59)
- [Agent Tasks: Persistence Migration to DualStore — L86](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-86-0) (line 86, col 0, score 0.59)
- [Promethean Pipelines — L22](promethean-pipelines.md#^ref-8b8e6103-22-0) (line 22, col 0, score 0.59)
- [Prompt_Folder_Bootstrap — L148](prompt-folder-bootstrap.md#^ref-bd4f0976-148-0) (line 148, col 0, score 0.58)
- [obsidian-ignore-node-modules-regex — L6](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-6-0) (line 6, col 0, score 0.62)
- [ecs-offload-workers — L435](ecs-offload-workers.md#^ref-6498b9d7-435-0) (line 435, col 0, score 0.61)
- [shared-package-layout-clarification — L78](shared-package-layout-clarification.md#^ref-36c8882a-78-0) (line 78, col 0, score 0.61)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L156](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-156-0) (line 156, col 0, score 0.65)
- [Reawakening Duck — L45](reawakening-duck.md#^ref-59b5670f-45-0) (line 45, col 0, score 0.63)
- [Migrate to Provider-Tenant Architecture — L144](migrate-to-provider-tenant-architecture.md#^ref-54382370-144-0) (line 144, col 0, score 0.61)
- [Sibilant Meta-Prompt DSL — L158](sibilant-meta-prompt-dsl.md#^ref-af5d2824-158-0) (line 158, col 0, score 0.68)
- [Chroma Toolkit Consolidation Plan — L12](chroma-toolkit-consolidation-plan.md#^ref-5020e892-12-0) (line 12, col 0, score 0.64)
- [Migrate to Provider-Tenant Architecture — L40](migrate-to-provider-tenant-architecture.md#^ref-54382370-40-0) (line 40, col 0, score 0.66)
- [Performance-Optimized-Polyglot-Bridge — L345](performance-optimized-polyglot-bridge.md#^ref-f5579967-345-0) (line 345, col 0, score 0.62)
- [Functional Embedding Pipeline Refactor — L23](functional-embedding-pipeline-refactor.md#^ref-a4a25141-23-0) (line 23, col 0, score 0.6)
- [Duck's Self-Referential Perceptual Loop — L23](ducks-self-referential-perceptual-loop.md#^ref-71726f04-23-0) (line 23, col 0, score 0.6)
- [Shared Package Structure — L56](shared-package-structure.md#^ref-66a72fc3-56-0) (line 56, col 0, score 0.63)
- [Migrate to Provider-Tenant Architecture — L102](migrate-to-provider-tenant-architecture.md#^ref-54382370-102-0) (line 102, col 0, score 0.6)
- [pm2-orchestration-patterns — L22](pm2-orchestration-patterns.md#^ref-51932e7b-22-0) (line 22, col 0, score 0.63)
- [Fnord Tracer Protocol — L172](fnord-tracer-protocol.md#^ref-fc21f824-172-0) (line 172, col 0, score 0.59)
- [Mongo Outbox Implementation — L142](mongo-outbox-implementation.md#^ref-9c1acd1e-142-0) (line 142, col 0, score 0.58)
- [Mongo Outbox Implementation — L546](mongo-outbox-implementation.md#^ref-9c1acd1e-546-0) (line 546, col 0, score 0.58)
- [Migrate to Provider-Tenant Architecture — L98](migrate-to-provider-tenant-architecture.md#^ref-54382370-98-0) (line 98, col 0, score 0.62)
- [Promethean State Format — L28](promethean-state-format.md#^ref-23df6ddb-28-0) (line 28, col 0, score 0.58)
- [Local-Only-LLM-Workflow — L165](local-only-llm-workflow.md#^ref-9a8ab57e-165-0) (line 165, col 0, score 0.56)
- [Stateful Partitions and Rebalancing — L525](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-525-0) (line 525, col 0, score 0.56)
- [polyglot-repl-interface-layer — L139](polyglot-repl-interface-layer.md#^ref-9c79206d-139-0) (line 139, col 0, score 0.56)
- [WebSocket Gateway Implementation — L626](websocket-gateway-implementation.md#^ref-e811123d-626-0) (line 626, col 0, score 0.55)
- [plan-update-confirmation — L886](plan-update-confirmation.md#^ref-b22d79c6-886-0) (line 886, col 0, score 0.66)
- [Promethean_Eidolon_Synchronicity_Model — L41](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-41-0) (line 41, col 0, score 0.66)
- [plan-update-confirmation — L836](plan-update-confirmation.md#^ref-b22d79c6-836-0) (line 836, col 0, score 0.64)
- [Prometheus Observability Stack — L3](prometheus-observability-stack.md#^ref-e90b5a16-3-0) (line 3, col 0, score 0.6)
- [Cross-Language Runtime Polymorphism — L31](cross-language-runtime-polymorphism.md#^ref-c34c36a6-31-0) (line 31, col 0, score 0.6)
- [prompt-programming-language-lisp — L33](prompt-programming-language-lisp.md#^ref-d41a06d1-33-0) (line 33, col 0, score 0.6)
- [Agent Tasks: Persistence Migration to DualStore — L134](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-134-0) (line 134, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L164](chroma-toolkit-consolidation-plan.md#^ref-5020e892-164-0) (line 164, col 0, score 1)
- [Services — L18](chunks/services.md#^ref-75ea4a6a-18-0) (line 18, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L230](cross-language-runtime-polymorphism.md#^ref-c34c36a6-230-0) (line 230, col 0, score 1)
- [ecs-offload-workers — L483](ecs-offload-workers.md#^ref-6498b9d7-483-0) (line 483, col 0, score 1)
- [eidolon-field-math-foundations — L148](eidolon-field-math-foundations.md#^ref-008f2ac0-148-0) (line 148, col 0, score 1)
- [Event Bus MVP — L549](event-bus-mvp.md#^ref-534fe91d-549-0) (line 549, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L282](migrate-to-provider-tenant-architecture.md#^ref-54382370-282-0) (line 282, col 0, score 1)
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
- [field-node-diagram-visualizations — L89](field-node-diagram-visualizations.md#^ref-e9b27b06-89-0) (line 89, col 0, score 1)
- [heartbeat-fragment-demo — L99](heartbeat-fragment-demo.md#^ref-dd00677a-99-0) (line 99, col 0, score 1)
- [heartbeat-simulation-snippets — L86](heartbeat-simulation-snippets.md#^ref-23e221e9-86-0) (line 86, col 0, score 1)
- [homeostasis-decay-formulas — L154](homeostasis-decay-formulas.md#^ref-37b5d236-154-0) (line 154, col 0, score 1)
- [Interop and Source Maps — L518](interop-and-source-maps.md#^ref-cdfac40c-518-0) (line 518, col 0, score 1)
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
- [Agent Reflections and Prompt Evolution — L136](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-136-0) (line 136, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L108](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-108-0) (line 108, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L168](chroma-toolkit-consolidation-plan.md#^ref-5020e892-168-0) (line 168, col 0, score 1)
- [ecs-scheduler-and-prefabs — L387](ecs-scheduler-and-prefabs.md#^ref-c62a1815-387-0) (line 387, col 0, score 1)
- [Event Bus MVP — L564](event-bus-mvp.md#^ref-534fe91d-564-0) (line 564, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L316](migrate-to-provider-tenant-architecture.md#^ref-54382370-316-0) (line 316, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L142](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-142-0) (line 142, col 0, score 1)
- [prom-lib-rate-limiters-and-replay-api — L405](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-405-0) (line 405, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L129](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-129-0) (line 129, col 0, score 1)
- [AI-Centric OS with MCP Layer — L406](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-406-0) (line 406, col 0, score 1)
- [Chroma-Embedding-Refactor — L331](chroma-embedding-refactor.md#^ref-8b256935-331-0) (line 331, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L167](chroma-toolkit-consolidation-plan.md#^ref-5020e892-167-0) (line 167, col 0, score 1)
- [Diagrams — L25](chunks/diagrams.md#^ref-45cd25b5-25-0) (line 25, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L214](cross-language-runtime-polymorphism.md#^ref-c34c36a6-214-0) (line 214, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L173](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-173-0) (line 173, col 0, score 1)
- [Dynamic Context Model for Web Components — L390](dynamic-context-model-for-web-components.md#^ref-f7702bf8-390-0) (line 390, col 0, score 1)
- [Event Bus MVP — L553](event-bus-mvp.md#^ref-534fe91d-553-0) (line 553, col 0, score 1)
- [field-interaction-equations — L159](field-interaction-equations.md#^ref-b09141b7-159-0) (line 159, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L315](functional-embedding-pipeline-refactor.md#^ref-a4a25141-315-0) (line 315, col 0, score 1)
- [i3-bluetooth-setup — L105](i3-bluetooth-setup.md#^ref-5e408692-105-0) (line 105, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L228](cross-language-runtime-polymorphism.md#^ref-c34c36a6-228-0) (line 228, col 0, score 1)
- [ecs-offload-workers — L465](ecs-offload-workers.md#^ref-6498b9d7-465-0) (line 465, col 0, score 1)
- [Event Bus MVP — L547](event-bus-mvp.md#^ref-534fe91d-547-0) (line 547, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L312](migrate-to-provider-tenant-architecture.md#^ref-54382370-312-0) (line 312, col 0, score 1)
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
- [Agent Tasks: Persistence Migration to DualStore — L151](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-151-0) (line 151, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L189](chroma-toolkit-consolidation-plan.md#^ref-5020e892-189-0) (line 189, col 0, score 1)
- [Event Bus MVP — L561](event-bus-mvp.md#^ref-534fe91d-561-0) (line 561, col 0, score 1)
- [Event Bus Projections Architecture — L159](event-bus-projections-architecture.md#^ref-cf6b9b17-159-0) (line 159, col 0, score 1)
- [layer-1-uptime-diagrams — L171](layer-1-uptime-diagrams.md#^ref-4127189a-171-0) (line 171, col 0, score 1)
- [Fnord Tracer Protocol — L170](fnord-tracer-protocol.md#^ref-fc21f824-170-0) (line 170, col 0, score 0.72)
- [Fnord Tracer Protocol — L149](fnord-tracer-protocol.md#^ref-fc21f824-149-0) (line 149, col 0, score 0.7)
- [Fnord Tracer Protocol — L168](fnord-tracer-protocol.md#^ref-fc21f824-168-0) (line 168, col 0, score 0.69)
- [Fnord Tracer Protocol — L24](fnord-tracer-protocol.md#^ref-fc21f824-24-0) (line 24, col 0, score 0.63)
- [Agent Tasks: Persistence Migration to DualStore — L159](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-159-0) (line 159, col 0, score 1)
- [AI-Centric OS with MCP Layer — L400](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-400-0) (line 400, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L197](chroma-toolkit-consolidation-plan.md#^ref-5020e892-197-0) (line 197, col 0, score 1)
- [Diagrams — L45](chunks/diagrams.md#^ref-45cd25b5-45-0) (line 45, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L222](cross-language-runtime-polymorphism.md#^ref-c34c36a6-222-0) (line 222, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L167](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-167-0) (line 167, col 0, score 1)
- [Dynamic Context Model for Web Components — L385](dynamic-context-model-for-web-components.md#^ref-f7702bf8-385-0) (line 385, col 0, score 1)
- [i3-config-validation-methods — L86](i3-config-validation-methods.md#^ref-d28090ac-86-0) (line 86, col 0, score 1)
- [js-to-lisp-reverse-compiler — L408](js-to-lisp-reverse-compiler.md#^ref-58191024-408-0) (line 408, col 0, score 1)
- [Lisp-Compiler-Integration — L542](lisp-compiler-integration.md#^ref-cfee6d36-542-0) (line 542, col 0, score 1)
- [lisp-dsl-for-window-management — L227](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-227-0) (line 227, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L170](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-170-0) (line 170, col 0, score 1)
- [Voice Access Layer Design — L220](voice-access-layer-design.md#^ref-543ed9b3-220-0) (line 220, col 0, score 0.67)
- [Voice Access Layer Design — L293](voice-access-layer-design.md#^ref-543ed9b3-293-0) (line 293, col 0, score 0.62)
- [Migrate to Provider-Tenant Architecture — L3](migrate-to-provider-tenant-architecture.md#^ref-54382370-3-0) (line 3, col 0, score 0.61)
- [Provider-Agnostic Chat Panel Implementation — L176](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-176-0) (line 176, col 0, score 0.6)
- [JavaScript — L26](chunks/javascript.md#^ref-c1618c66-26-0) (line 26, col 0, score 0.6)
- [ecs-offload-workers — L491](ecs-offload-workers.md#^ref-6498b9d7-491-0) (line 491, col 0, score 0.6)
- [Services — L9](chunks/services.md#^ref-75ea4a6a-9-0) (line 9, col 0, score 1)
- [ecs-scheduler-and-prefabs — L420](ecs-scheduler-and-prefabs.md#^ref-c62a1815-420-0) (line 420, col 0, score 1)
- [Event Bus MVP — L552](event-bus-mvp.md#^ref-534fe91d-552-0) (line 552, col 0, score 1)
- [heartbeat-fragment-demo — L123](heartbeat-fragment-demo.md#^ref-dd00677a-123-0) (line 123, col 0, score 1)
- [heartbeat-simulation-snippets — L115](heartbeat-simulation-snippets.md#^ref-23e221e9-115-0) (line 115, col 0, score 1)
- [Mongo Outbox Implementation — L551](mongo-outbox-implementation.md#^ref-9c1acd1e-551-0) (line 551, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L60](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-60-0) (line 60, col 0, score 1)
- [prom-lib-rate-limiters-and-replay-api — L380](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-380-0) (line 380, col 0, score 1)
- [Services — L12](chunks/services.md#^ref-75ea4a6a-12-0) (line 12, col 0, score 1)
- [Event Bus MVP — L551](event-bus-mvp.md#^ref-534fe91d-551-0) (line 551, col 0, score 1)
- [Mongo Outbox Implementation — L557](mongo-outbox-implementation.md#^ref-9c1acd1e-557-0) (line 557, col 0, score 1)
- [prom-lib-rate-limiters-and-replay-api — L386](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-386-0) (line 386, col 0, score 1)
- [Promethean-native config design — L389](promethean-native-config-design.md#^ref-ab748541-389-0) (line 389, col 0, score 1)
- [schema-evolution-workflow — L482](schema-evolution-workflow.md#^ref-d8059b6a-482-0) (line 482, col 0, score 1)
- [State Snapshots API and Transactional Projector — L338](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-338-0) (line 338, col 0, score 1)
- [Unique Info Dump Index — L92](unique-info-dump-index.md#^ref-30ec3ba6-92-0) (line 92, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L158](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-158-0) (line 158, col 0, score 1)
- [Chroma-Embedding-Refactor — L329](chroma-embedding-refactor.md#^ref-8b256935-329-0) (line 329, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L196](chroma-toolkit-consolidation-plan.md#^ref-5020e892-196-0) (line 196, col 0, score 1)
- [Dynamic Context Model for Web Components — L414](dynamic-context-model-for-web-components.md#^ref-f7702bf8-414-0) (line 414, col 0, score 1)
- [Event Bus MVP — L550](event-bus-mvp.md#^ref-534fe91d-550-0) (line 550, col 0, score 1)
- [i3-bluetooth-setup — L102](i3-bluetooth-setup.md#^ref-5e408692-102-0) (line 102, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L142](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-142-0) (line 142, col 0, score 1)
- [Local-Only-LLM-Workflow — L195](local-only-llm-workflow.md#^ref-9a8ab57e-195-0) (line 195, col 0, score 1)
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
- [Agent Tasks: Persistence Migration to DualStore — L133](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-133-0) (line 133, col 0, score 1)
- [Diagrams — L19](chunks/diagrams.md#^ref-45cd25b5-19-0) (line 19, col 0, score 1)
- [eidolon-node-lifecycle — L32](eidolon-node-lifecycle.md#^ref-938eca9c-32-0) (line 32, col 0, score 1)
- [Event Bus Projections Architecture — L147](event-bus-projections-architecture.md#^ref-cf6b9b17-147-0) (line 147, col 0, score 1)
- [field-node-diagram-outline — L101](field-node-diagram-outline.md#^ref-1f32c94a-101-0) (line 101, col 0, score 1)
- [field-node-diagram-set — L137](field-node-diagram-set.md#^ref-22b989d5-137-0) (line 137, col 0, score 1)
- [field-node-diagram-visualizations — L87](field-node-diagram-visualizations.md#^ref-e9b27b06-87-0) (line 87, col 0, score 1)
- [graph-ds — L363](graph-ds.md#^ref-6620e2f2-363-0) (line 363, col 0, score 1)
- [2d-sandbox-field — L225](2d-sandbox-field.md#^ref-c710dc93-225-0) (line 225, col 0, score 1)
- [Admin Dashboard for User Management — L49](admin-dashboard-for-user-management.md#^ref-2901a3e9-49-0) (line 49, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L150](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-150-0) (line 150, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L163](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-163-0) (line 163, col 0, score 1)
- [AI-First-OS-Model-Context-Protocol — L9](ai-first-os-model-context-protocol.md#^ref-618198f4-9-0) (line 9, col 0, score 1)
- [aionian-circuit-math — L179](aionian-circuit-math.md#^ref-f2d83a77-179-0) (line 179, col 0, score 1)
- [api-gateway-versioning — L304](api-gateway-versioning.md#^ref-0580dcd3-304-0) (line 304, col 0, score 1)
- [archetype-ecs — L479](archetype-ecs.md#^ref-8f4c1e86-479-0) (line 479, col 0, score 1)
- [balanced-bst — L295](balanced-bst.md#^ref-d3e7db72-295-0) (line 295, col 0, score 1)
- [eidolon-field-math-foundations — L146](eidolon-field-math-foundations.md#^ref-008f2ac0-146-0) (line 146, col 0, score 1)
- [Event Bus MVP — L556](event-bus-mvp.md#^ref-534fe91d-556-0) (line 556, col 0, score 1)
- [i3-bluetooth-setup — L106](i3-bluetooth-setup.md#^ref-5e408692-106-0) (line 106, col 0, score 1)
- [Exception Layer Analysis — L172](exception-layer-analysis.md#^ref-21d5cc09-172-0) (line 172, col 0, score 1)
- [field-dynamics-math-blocks — L154](field-dynamics-math-blocks.md#^ref-7cfc230d-154-0) (line 154, col 0, score 1)
- [field-interaction-equations — L164](field-interaction-equations.md#^ref-b09141b7-164-0) (line 164, col 0, score 1)
- [field-node-diagram-outline — L120](field-node-diagram-outline.md#^ref-1f32c94a-120-0) (line 120, col 0, score 1)
- [field-node-diagram-set — L149](field-node-diagram-set.md#^ref-22b989d5-149-0) (line 149, col 0, score 1)
- [field-node-diagram-visualizations — L99](field-node-diagram-visualizations.md#^ref-e9b27b06-99-0) (line 99, col 0, score 1)
- [graph-ds — L365](graph-ds.md#^ref-6620e2f2-365-0) (line 365, col 0, score 1)
- [heartbeat-fragment-demo — L111](heartbeat-fragment-demo.md#^ref-dd00677a-111-0) (line 111, col 0, score 1)
- [heartbeat-simulation-snippets — L101](heartbeat-simulation-snippets.md#^ref-23e221e9-101-0) (line 101, col 0, score 1)
- [zero-copy-snapshots-and-workers — L363](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-363-0) (line 363, col 0, score 1)
- [field-node-diagram-outline — L111](field-node-diagram-outline.md#^ref-1f32c94a-111-0) (line 111, col 0, score 1)
- [field-node-diagram-set — L144](field-node-diagram-set.md#^ref-22b989d5-144-0) (line 144, col 0, score 1)
- [field-node-diagram-visualizations — L94](field-node-diagram-visualizations.md#^ref-e9b27b06-94-0) (line 94, col 0, score 1)
- [Fnord Tracer Protocol — L258](fnord-tracer-protocol.md#^ref-fc21f824-258-0) (line 258, col 0, score 1)
- [graph-ds — L398](graph-ds.md#^ref-6620e2f2-398-0) (line 398, col 0, score 1)
- [heartbeat-fragment-demo — L110](heartbeat-fragment-demo.md#^ref-dd00677a-110-0) (line 110, col 0, score 1)
- [heartbeat-simulation-snippets — L99](heartbeat-simulation-snippets.md#^ref-23e221e9-99-0) (line 99, col 0, score 1)
- [homeostasis-decay-formulas — L151](homeostasis-decay-formulas.md#^ref-37b5d236-151-0) (line 151, col 0, score 1)
- [i3-bluetooth-setup — L119](i3-bluetooth-setup.md#^ref-5e408692-119-0) (line 119, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L153](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-153-0) (line 153, col 0, score 1)
- [archetype-ecs — L468](archetype-ecs.md#^ref-8f4c1e86-468-0) (line 468, col 0, score 1)
- [DSL — L17](chunks/dsl.md#^ref-e87bc036-17-0) (line 17, col 0, score 1)
- [compiler-kit-foundations — L619](compiler-kit-foundations.md#^ref-01b21543-619-0) (line 619, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L217](cross-language-runtime-polymorphism.md#^ref-c34c36a6-217-0) (line 217, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L177](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-177-0) (line 177, col 0, score 1)
- [Dynamic Context Model for Web Components — L387](dynamic-context-model-for-web-components.md#^ref-f7702bf8-387-0) (line 387, col 0, score 1)
- [ecs-offload-workers — L472](ecs-offload-workers.md#^ref-6498b9d7-472-0) (line 472, col 0, score 1)
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
- [2d-sandbox-field — L197](2d-sandbox-field.md#^ref-c710dc93-197-0) (line 197, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L178](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-178-0) (line 178, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L216](chroma-toolkit-consolidation-plan.md#^ref-5020e892-216-0) (line 216, col 0, score 1)
- [Diagrams — L17](chunks/diagrams.md#^ref-45cd25b5-17-0) (line 17, col 0, score 1)
- [Eidolon Field Abstract Model — L194](eidolon-field-abstract-model.md#^ref-5e8b2388-194-0) (line 194, col 0, score 1)
- [eidolon-node-lifecycle — L33](eidolon-node-lifecycle.md#^ref-938eca9c-33-0) (line 33, col 0, score 1)
- [EidolonField — L247](eidolonfield.md#^ref-49d1e1e5-247-0) (line 247, col 0, score 1)
- [Event Bus MVP — L580](event-bus-mvp.md#^ref-534fe91d-580-0) (line 580, col 0, score 1)
- [Event Bus Projections Architecture — L149](event-bus-projections-architecture.md#^ref-cf6b9b17-149-0) (line 149, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L157](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-157-0) (line 157, col 0, score 1)
- [api-gateway-versioning — L298](api-gateway-versioning.md#^ref-0580dcd3-298-0) (line 298, col 0, score 1)
- [ecs-offload-workers — L455](ecs-offload-workers.md#^ref-6498b9d7-455-0) (line 455, col 0, score 1)
- [ecs-scheduler-and-prefabs — L389](ecs-scheduler-and-prefabs.md#^ref-c62a1815-389-0) (line 389, col 0, score 1)
- [eidolon-field-math-foundations — L130](eidolon-field-math-foundations.md#^ref-008f2ac0-130-0) (line 130, col 0, score 1)
- [i3-config-validation-methods — L63](i3-config-validation-methods.md#^ref-d28090ac-63-0) (line 63, col 0, score 1)
- [Interop and Source Maps — L531](interop-and-source-maps.md#^ref-cdfac40c-531-0) (line 531, col 0, score 1)
- [Language-Agnostic Mirror System — L548](language-agnostic-mirror-system.md#^ref-d2b3628c-548-0) (line 548, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L143](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-143-0) (line 143, col 0, score 1)
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
- [Diagrams — L13](chunks/diagrams.md#^ref-45cd25b5-13-0) (line 13, col 0, score 1)
- [DSL — L15](chunks/dsl.md#^ref-e87bc036-15-0) (line 15, col 0, score 1)
- [JavaScript — L18](chunks/javascript.md#^ref-c1618c66-18-0) (line 18, col 0, score 1)
- [Math Fundamentals — L14](chunks/math-fundamentals.md#^ref-c6e87433-14-0) (line 14, col 0, score 1)
- [Services — L14](chunks/services.md#^ref-75ea4a6a-14-0) (line 14, col 0, score 1)
- [Shared — L7](chunks/shared.md#^ref-623a55f7-7-0) (line 7, col 0, score 1)
- [Simulation Demo — L10](chunks/simulation-demo.md#^ref-557309a3-10-0) (line 10, col 0, score 1)
- [Tooling — L9](chunks/tooling.md#^ref-6cb4943e-9-0) (line 9, col 0, score 1)
- [Window Management — L15](chunks/window-management.md#^ref-9e8ae388-15-0) (line 15, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L130](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-130-0) (line 130, col 0, score 1)
- [api-gateway-versioning — L303](api-gateway-versioning.md#^ref-0580dcd3-303-0) (line 303, col 0, score 1)
- [Chroma-Embedding-Refactor — L327](chroma-embedding-refactor.md#^ref-8b256935-327-0) (line 327, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L174](chroma-toolkit-consolidation-plan.md#^ref-5020e892-174-0) (line 174, col 0, score 1)
- [eidolon-field-math-foundations — L134](eidolon-field-math-foundations.md#^ref-008f2ac0-134-0) (line 134, col 0, score 1)
- [i3-config-validation-methods — L82](i3-config-validation-methods.md#^ref-d28090ac-82-0) (line 82, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L267](migrate-to-provider-tenant-architecture.md#^ref-54382370-267-0) (line 267, col 0, score 1)
- [prom-lib-rate-limiters-and-replay-api — L391](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-391-0) (line 391, col 0, score 1)
- [Promethean Agent Config DSL — L333](promethean-agent-config-dsl.md#^ref-2c00ce45-333-0) (line 333, col 0, score 1)
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
- [2d-sandbox-field — L202](2d-sandbox-field.md#^ref-c710dc93-202-0) (line 202, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L144](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-144-0) (line 144, col 0, score 1)
- [aionian-circuit-math — L182](aionian-circuit-math.md#^ref-f2d83a77-182-0) (line 182, col 0, score 1)
- [Chroma-Embedding-Refactor — L333](chroma-embedding-refactor.md#^ref-8b256935-333-0) (line 333, col 0, score 1)
- [Diagrams — L16](chunks/diagrams.md#^ref-45cd25b5-16-0) (line 16, col 0, score 1)
- [JavaScript — L45](chunks/javascript.md#^ref-c1618c66-45-0) (line 45, col 0, score 1)
- [Math Fundamentals — L38](chunks/math-fundamentals.md#^ref-c6e87433-38-0) (line 38, col 0, score 1)
- [Simulation Demo — L15](chunks/simulation-demo.md#^ref-557309a3-15-0) (line 15, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L181](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-181-0) (line 181, col 0, score 1)
- [AI-Centric OS with MCP Layer — L429](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-429-0) (line 429, col 0, score 1)
- [api-gateway-versioning — L317](api-gateway-versioning.md#^ref-0580dcd3-317-0) (line 317, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L186](chroma-toolkit-consolidation-plan.md#^ref-5020e892-186-0) (line 186, col 0, score 1)
- [Dynamic Context Model for Web Components — L433](dynamic-context-model-for-web-components.md#^ref-f7702bf8-433-0) (line 433, col 0, score 1)
- [Event Bus MVP — L555](event-bus-mvp.md#^ref-534fe91d-555-0) (line 555, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L150](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-150-0) (line 150, col 0, score 1)
- [Local-Offline-Model-Deployment-Strategy — L290](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-290-0) (line 290, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L298](migrate-to-provider-tenant-architecture.md#^ref-54382370-298-0) (line 298, col 0, score 1)
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
- [Math Fundamentals — L20](chunks/math-fundamentals.md#^ref-c6e87433-20-0) (line 20, col 0, score 1)
- [Services — L20](chunks/services.md#^ref-75ea4a6a-20-0) (line 20, col 0, score 1)
- [compiler-kit-foundations — L620](compiler-kit-foundations.md#^ref-01b21543-620-0) (line 620, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L237](cross-language-runtime-polymorphism.md#^ref-c34c36a6-237-0) (line 237, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L40](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-40-0) (line 40, col 0, score 1)
- [Dynamic Context Model for Web Components — L401](dynamic-context-model-for-web-components.md#^ref-f7702bf8-401-0) (line 401, col 0, score 1)
- [ecs-scheduler-and-prefabs — L386](ecs-scheduler-and-prefabs.md#^ref-c62a1815-386-0) (line 386, col 0, score 1)
- [eidolon-field-math-foundations — L127](eidolon-field-math-foundations.md#^ref-008f2ac0-127-0) (line 127, col 0, score 1)
- [Event Bus MVP — L557](event-bus-mvp.md#^ref-534fe91d-557-0) (line 557, col 0, score 1)
- [Services — L10](chunks/services.md#^ref-75ea4a6a-10-0) (line 10, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L209](cross-language-runtime-polymorphism.md#^ref-c34c36a6-209-0) (line 209, col 0, score 1)
- [ecs-offload-workers — L486](ecs-offload-workers.md#^ref-6498b9d7-486-0) (line 486, col 0, score 1)
- [Event Bus MVP — L548](event-bus-mvp.md#^ref-534fe91d-548-0) (line 548, col 0, score 1)
- [Mongo Outbox Implementation — L552](mongo-outbox-implementation.md#^ref-9c1acd1e-552-0) (line 552, col 0, score 1)
- [prom-lib-rate-limiters-and-replay-api — L382](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-382-0) (line 382, col 0, score 1)
- [State Snapshots API and Transactional Projector — L333](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-333-0) (line 333, col 0, score 1)
- [Stateful Partitions and Rebalancing — L527](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-527-0) (line 527, col 0, score 1)
- [i3-config-validation-methods — L78](i3-config-validation-methods.md#^ref-d28090ac-78-0) (line 78, col 0, score 1)
- [Local-Offline-Model-Deployment-Strategy — L295](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-295-0) (line 295, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L138](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-138-0) (line 138, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L193](chroma-toolkit-consolidation-plan.md#^ref-5020e892-193-0) (line 193, col 0, score 1)
- [Diagrams — L43](chunks/diagrams.md#^ref-45cd25b5-43-0) (line 43, col 0, score 1)
- [Services — L41](chunks/services.md#^ref-75ea4a6a-41-0) (line 41, col 0, score 1)
- [eidolon-node-lifecycle — L62](eidolon-node-lifecycle.md#^ref-938eca9c-62-0) (line 62, col 0, score 1)
- [Event Bus MVP — L583](event-bus-mvp.md#^ref-534fe91d-583-0) (line 583, col 0, score 1)
- [Event Bus Projections Architecture — L182](event-bus-projections-architecture.md#^ref-cf6b9b17-182-0) (line 182, col 0, score 1)
- [Fnord Tracer Protocol — L266](fnord-tracer-protocol.md#^ref-fc21f824-266-0) (line 266, col 0, score 1)
- [i3-bluetooth-setup — L128](i3-bluetooth-setup.md#^ref-5e408692-128-0) (line 128, col 0, score 1)
- [layer-1-uptime-diagrams — L193](layer-1-uptime-diagrams.md#^ref-4127189a-193-0) (line 193, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L181](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-181-0) (line 181, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L166](chroma-toolkit-consolidation-plan.md#^ref-5020e892-166-0) (line 166, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L207](cross-language-runtime-polymorphism.md#^ref-c34c36a6-207-0) (line 207, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L193](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-193-0) (line 193, col 0, score 1)
- [Dynamic Context Model for Web Components — L381](dynamic-context-model-for-web-components.md#^ref-f7702bf8-381-0) (line 381, col 0, score 1)
- [Exception Layer Analysis — L154](exception-layer-analysis.md#^ref-21d5cc09-154-0) (line 154, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L265](migrate-to-provider-tenant-architecture.md#^ref-54382370-265-0) (line 265, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L130](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-130-0) (line 130, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L39](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-39-0) (line 39, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L38](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-38-0) (line 38, col 0, score 1)
- [Diagrams — L8](chunks/diagrams.md#^ref-45cd25b5-8-0) (line 8, col 0, score 1)
- [Shared — L11](chunks/shared.md#^ref-623a55f7-11-0) (line 11, col 0, score 1)
- [Duck's Attractor States — L65](ducks-attractor-states.md#^ref-13951643-65-0) (line 65, col 0, score 1)
- [eidolon-field-math-foundations — L159](eidolon-field-math-foundations.md#^ref-008f2ac0-159-0) (line 159, col 0, score 1)
- [Event Bus Projections Architecture — L165](event-bus-projections-architecture.md#^ref-cf6b9b17-165-0) (line 165, col 0, score 1)
- [field-dynamics-math-blocks — L159](field-dynamics-math-blocks.md#^ref-7cfc230d-159-0) (line 159, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L62](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-62-0) (line 62, col 0, score 1)
- [Promethean_Eidolon_Synchronicity_Model — L56](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-56-0) (line 56, col 0, score 1)
- [Tooling — L7](chunks/tooling.md#^ref-6cb4943e-7-0) (line 7, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L227](cross-language-runtime-polymorphism.md#^ref-c34c36a6-227-0) (line 227, col 0, score 1)
- [ecs-scheduler-and-prefabs — L421](ecs-scheduler-and-prefabs.md#^ref-c62a1815-421-0) (line 421, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L156](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-156-0) (line 156, col 0, score 1)
- [pm2-orchestration-patterns — L250](pm2-orchestration-patterns.md#^ref-51932e7b-250-0) (line 250, col 0, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L532](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-532-0) (line 532, col 0, score 1)
- [polymorphic-meta-programming-engine — L226](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-226-0) (line 226, col 0, score 1)
- [prompt-programming-language-lisp — L102](prompt-programming-language-lisp.md#^ref-d41a06d1-102-0) (line 102, col 0, score 1)
- [aionian-circuit-math — L152](aionian-circuit-math.md#^ref-f2d83a77-152-0) (line 152, col 0, score 1)
- [Math Fundamentals — L11](chunks/math-fundamentals.md#^ref-c6e87433-11-0) (line 11, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L196](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-196-0) (line 196, col 0, score 1)
- [Eidolon Field Abstract Model — L192](eidolon-field-abstract-model.md#^ref-5e8b2388-192-0) (line 192, col 0, score 1)
- [eidolon-field-math-foundations — L121](eidolon-field-math-foundations.md#^ref-008f2ac0-121-0) (line 121, col 0, score 1)
- [EidolonField — L245](eidolonfield.md#^ref-49d1e1e5-245-0) (line 245, col 0, score 1)
- [Exception Layer Analysis — L149](exception-layer-analysis.md#^ref-21d5cc09-149-0) (line 149, col 0, score 1)
- [field-interaction-equations — L149](field-interaction-equations.md#^ref-b09141b7-149-0) (line 149, col 0, score 1)
- [field-node-diagram-outline — L103](field-node-diagram-outline.md#^ref-1f32c94a-103-0) (line 103, col 0, score 1)
- [markdown-to-org-transpiler — L318](markdown-to-org-transpiler.md#^ref-ab54cdd8-318-0) (line 318, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L322](migrate-to-provider-tenant-architecture.md#^ref-54382370-322-0) (line 322, col 0, score 1)
- [Mongo Outbox Implementation — L579](mongo-outbox-implementation.md#^ref-9c1acd1e-579-0) (line 579, col 0, score 1)
- [observability-infrastructure-setup — L369](observability-infrastructure-setup.md#^ref-b4e64f8c-369-0) (line 369, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L183](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-183-0) (line 183, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L483](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-483-0) (line 483, col 0, score 1)
- [polymorphic-meta-programming-engine — L241](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-241-0) (line 241, col 0, score 1)
- [prom-lib-rate-limiters-and-replay-api — L415](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-415-0) (line 415, col 0, score 1)
- [Promethean Agent Config DSL — L352](promethean-agent-config-dsl.md#^ref-2c00ce45-352-0) (line 352, col 0, score 1)
- [Services — L28](chunks/services.md#^ref-75ea4a6a-28-0) (line 28, col 0, score 1)
- [Simulation Demo — L7](chunks/simulation-demo.md#^ref-557309a3-7-0) (line 7, col 0, score 1)
- [ecs-scheduler-and-prefabs — L428](ecs-scheduler-and-prefabs.md#^ref-c62a1815-428-0) (line 428, col 0, score 1)
- [Eidolon Field Abstract Model — L199](eidolon-field-abstract-model.md#^ref-5e8b2388-199-0) (line 199, col 0, score 1)
- [eidolon-node-lifecycle — L35](eidolon-node-lifecycle.md#^ref-938eca9c-35-0) (line 35, col 0, score 1)
- [Event Bus MVP — L570](event-bus-mvp.md#^ref-534fe91d-570-0) (line 570, col 0, score 1)
- [field-interaction-equations — L173](field-interaction-equations.md#^ref-b09141b7-173-0) (line 173, col 0, score 1)
- [field-node-diagram-outline — L113](field-node-diagram-outline.md#^ref-1f32c94a-113-0) (line 113, col 0, score 1)
- [Math Fundamentals — L34](chunks/math-fundamentals.md#^ref-c6e87433-34-0) (line 34, col 0, score 1)
- [Services — L22](chunks/services.md#^ref-75ea4a6a-22-0) (line 22, col 0, score 1)
- [Shared — L29](chunks/shared.md#^ref-623a55f7-29-0) (line 29, col 0, score 1)
- [Simulation Demo — L23](chunks/simulation-demo.md#^ref-557309a3-23-0) (line 23, col 0, score 1)
- [Tooling — L16](chunks/tooling.md#^ref-6cb4943e-16-0) (line 16, col 0, score 1)
- [Window Management — L25](chunks/window-management.md#^ref-9e8ae388-25-0) (line 25, col 0, score 1)
- [compiler-kit-foundations — L627](compiler-kit-foundations.md#^ref-01b21543-627-0) (line 627, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L171](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-171-0) (line 171, col 0, score 1)
- [Duck's Attractor States — L81](ducks-attractor-states.md#^ref-13951643-81-0) (line 81, col 0, score 1)
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
- [eidolon-node-lifecycle — L63](eidolon-node-lifecycle.md#^ref-938eca9c-63-0) (line 63, col 0, score 1)
- [EidolonField — L269](eidolonfield.md#^ref-49d1e1e5-269-0) (line 269, col 0, score 1)
- [Event Bus MVP — L566](event-bus-mvp.md#^ref-534fe91d-566-0) (line 566, col 0, score 1)
- [Event Bus Projections Architecture — L185](event-bus-projections-architecture.md#^ref-cf6b9b17-185-0) (line 185, col 0, score 1)
- [Exception Layer Analysis — L165](exception-layer-analysis.md#^ref-21d5cc09-165-0) (line 165, col 0, score 1)
- [Factorio AI with External Agents — L160](factorio-ai-with-external-agents.md#^ref-a4d90289-160-0) (line 160, col 0, score 1)
- [field-dynamics-math-blocks — L165](field-dynamics-math-blocks.md#^ref-7cfc230d-165-0) (line 165, col 0, score 1)
- [field-interaction-equations — L184](field-interaction-equations.md#^ref-b09141b7-184-0) (line 184, col 0, score 1)
- [field-node-diagram-outline — L132](field-node-diagram-outline.md#^ref-1f32c94a-132-0) (line 132, col 0, score 1)
- [Promethean_Eidolon_Synchronicity_Model — L74](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-74-0) (line 74, col 0, score 1)
- [Promethean Infrastructure Setup — L597](promethean-infrastructure-setup.md#^ref-6deed6ac-597-0) (line 597, col 0, score 1)
- [Promethean-native config design — L421](promethean-native-config-design.md#^ref-ab748541-421-0) (line 421, col 0, score 1)
- [promethean-system-diagrams — L217](promethean-system-diagrams.md#^ref-b51e19b4-217-0) (line 217, col 0, score 1)
- [Promethean Web UI Setup — L629](promethean-web-ui-setup.md#^ref-bc5172ca-629-0) (line 629, col 0, score 1)
- [Prompt_Folder_Bootstrap — L193](prompt-folder-bootstrap.md#^ref-bd4f0976-193-0) (line 193, col 0, score 1)
- [prompt-programming-language-lisp — L107](prompt-programming-language-lisp.md#^ref-d41a06d1-107-0) (line 107, col 0, score 1)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L457](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-457-0) (line 457, col 0, score 1)
- [2d-sandbox-field — L222](2d-sandbox-field.md#^ref-c710dc93-222-0) (line 222, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L177](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-177-0) (line 177, col 0, score 1)
- [AI-Centric OS with MCP Layer — L426](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-426-0) (line 426, col 0, score 1)
- [AI-First-OS-Model-Context-Protocol — L16](ai-first-os-model-context-protocol.md#^ref-618198f4-16-0) (line 16, col 0, score 1)
- [balanced-bst — L299](balanced-bst.md#^ref-d3e7db72-299-0) (line 299, col 0, score 1)
- [Board Automation Improvements — L20](board-automation-improvements.md#^ref-ac60a1d6-20-0) (line 20, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L215](chroma-toolkit-consolidation-plan.md#^ref-5020e892-215-0) (line 215, col 0, score 1)
- [Diagrams — L11](chunks/diagrams.md#^ref-45cd25b5-11-0) (line 11, col 0, score 1)
- [AI-First-OS-Model-Context-Protocol — L10](ai-first-os-model-context-protocol.md#^ref-618198f4-10-0) (line 10, col 0, score 1)
- [Shared — L15](chunks/shared.md#^ref-623a55f7-15-0) (line 15, col 0, score 1)
- [Creative Moments — L7](creative-moments.md#^ref-10d98225-7-0) (line 7, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L210](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-210-0) (line 210, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L47](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-47-0) (line 47, col 0, score 1)
- [DuckDuckGoSearchPipeline — L11](duckduckgosearchpipeline.md#^ref-e979c50f-11-0) (line 11, col 0, score 1)
- [Duck's Attractor States — L68](ducks-attractor-states.md#^ref-13951643-68-0) (line 68, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L44](ducks-self-referential-perceptual-loop.md#^ref-71726f04-44-0) (line 44, col 0, score 1)
- [Event Bus Projections Architecture — L170](event-bus-projections-architecture.md#^ref-cf6b9b17-170-0) (line 170, col 0, score 1)
- [Promethean Agent Config DSL — L348](promethean-agent-config-dsl.md#^ref-2c00ce45-348-0) (line 348, col 0, score 1)
- [Promethean Data Sync Protocol — L5](promethean-data-sync-protocol.md#^ref-9fab9e76-5-0) (line 5, col 0, score 1)
- [Promethean Documentation Pipeline Overview — L165](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-165-0) (line 165, col 0, score 1)
- [markdown-to-org-transpiler — L313](markdown-to-org-transpiler.md#^ref-ab54cdd8-313-0) (line 313, col 0, score 1)
- [Matplotlib Animation with Async Execution — L79](matplotlib-animation-with-async-execution.md#^ref-687439f9-79-0) (line 79, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L299](migrate-to-provider-tenant-architecture.md#^ref-54382370-299-0) (line 299, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L151](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-151-0) (line 151, col 0, score 1)
- [Mongo Outbox Implementation — L587](mongo-outbox-implementation.md#^ref-9c1acd1e-587-0) (line 587, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L77](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-77-0) (line 77, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L179](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-179-0) (line 179, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L282](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-282-0) (line 282, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L480](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-480-0) (line 480, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L209](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-209-0) (line 209, col 0, score 1)
- [Duck's Attractor States — L67](ducks-attractor-states.md#^ref-13951643-67-0) (line 67, col 0, score 1)
- [Factorio AI with External Agents — L150](factorio-ai-with-external-agents.md#^ref-a4d90289-150-0) (line 150, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L63](model-upgrade-calm-down-guide.md#^ref-db74343f-63-0) (line 63, col 0, score 1)
- [NPU Voice Code and Sensory Integration — L10](npu-voice-code-and-sensory-integration.md#^ref-5a02283e-10-0) (line 10, col 0, score 1)
- [observability-infrastructure-setup — L391](observability-infrastructure-setup.md#^ref-b4e64f8c-391-0) (line 391, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L56](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-56-0) (line 56, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L111](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-111-0) (line 111, col 0, score 1)
- [OpenAPI Validation Report — L29](openapi-validation-report.md#^ref-5c152b08-29-0) (line 29, col 0, score 1)
- [Optimizing Command Limitations in System Design — L36](optimizing-command-limitations-in-system-design.md#^ref-98c8ff62-36-0) (line 36, col 0, score 1)
- [plan-update-confirmation — L1013](plan-update-confirmation.md#^ref-b22d79c6-1013-0) (line 1013, col 0, score 1)
- [Admin Dashboard for User Management — L45](admin-dashboard-for-user-management.md#^ref-2901a3e9-45-0) (line 45, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L170](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-170-0) (line 170, col 0, score 1)
- [AI-Centric OS with MCP Layer — L416](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-416-0) (line 416, col 0, score 1)
- [AI-First-OS-Model-Context-Protocol — L11](ai-first-os-model-context-protocol.md#^ref-618198f4-11-0) (line 11, col 0, score 1)
- [aionian-circuit-math — L178](aionian-circuit-math.md#^ref-f2d83a77-178-0) (line 178, col 0, score 1)
- [api-gateway-versioning — L312](api-gateway-versioning.md#^ref-0580dcd3-312-0) (line 312, col 0, score 1)
- [balanced-bst — L297](balanced-bst.md#^ref-d3e7db72-297-0) (line 297, col 0, score 1)
- [Board Walk – 2025-08-11 — L131](board-walk-2025-08-11.md#^ref-7aa1eb92-131-0) (line 131, col 0, score 1)
- [Operations — L8](chunks/operations.md#^ref-f1add613-8-0) (line 8, col 0, score 1)
- [Local-Offline-Model-Deployment-Strategy — L305](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-305-0) (line 305, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L331](migrate-to-provider-tenant-architecture.md#^ref-54382370-331-0) (line 331, col 0, score 1)
- [Mindful Prioritization — L9](mindful-prioritization.md#^ref-40185d05-9-0) (line 9, col 0, score 1)
- [MindfulRobotIntegration — L7](mindfulrobotintegration.md#^ref-5f65dfa5-7-0) (line 7, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L66](model-upgrade-calm-down-guide.md#^ref-db74343f-66-0) (line 66, col 0, score 1)
- [NPU Voice Code and Sensory Integration — L13](npu-voice-code-and-sensory-integration.md#^ref-5a02283e-13-0) (line 13, col 0, score 1)
- [observability-infrastructure-setup — L393](observability-infrastructure-setup.md#^ref-b4e64f8c-393-0) (line 393, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L59](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-59-0) (line 59, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L56](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-56-0) (line 56, col 0, score 1)
- [DSL — L26](chunks/dsl.md#^ref-e87bc036-26-0) (line 26, col 0, score 1)
- [ecs-scheduler-and-prefabs — L433](ecs-scheduler-and-prefabs.md#^ref-c62a1815-433-0) (line 433, col 0, score 1)
- [Event Bus MVP — L577](event-bus-mvp.md#^ref-534fe91d-577-0) (line 577, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L174](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-174-0) (line 174, col 0, score 1)
- [Local-Only-LLM-Workflow — L211](local-only-llm-workflow.md#^ref-9a8ab57e-211-0) (line 211, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L334](migrate-to-provider-tenant-architecture.md#^ref-54382370-334-0) (line 334, col 0, score 1)
- [Mongo Outbox Implementation — L581](mongo-outbox-implementation.md#^ref-9c1acd1e-581-0) (line 581, col 0, score 1)
- [observability-infrastructure-setup — L397](observability-infrastructure-setup.md#^ref-b4e64f8c-397-0) (line 397, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L48](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-48-0) (line 48, col 0, score 1)
- [AI-Centric OS with MCP Layer — L408](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-408-0) (line 408, col 0, score 1)
- [api-gateway-versioning — L316](api-gateway-versioning.md#^ref-0580dcd3-316-0) (line 316, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L213](chroma-toolkit-consolidation-plan.md#^ref-5020e892-213-0) (line 213, col 0, score 1)
- [Event Bus MVP — L581](event-bus-mvp.md#^ref-534fe91d-581-0) (line 581, col 0, score 1)
- [i3-bluetooth-setup — L101](i3-bluetooth-setup.md#^ref-5e408692-101-0) (line 101, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L178](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-178-0) (line 178, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L303](migrate-to-provider-tenant-architecture.md#^ref-54382370-303-0) (line 303, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L140](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-140-0) (line 140, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L173](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-173-0) (line 173, col 0, score 1)
- [Diagrams — L33](chunks/diagrams.md#^ref-45cd25b5-33-0) (line 33, col 0, score 1)
- [DSL — L40](chunks/dsl.md#^ref-e87bc036-40-0) (line 40, col 0, score 1)
- [JavaScript — L30](chunks/javascript.md#^ref-c1618c66-30-0) (line 30, col 0, score 1)
- [Services — L39](chunks/services.md#^ref-75ea4a6a-39-0) (line 39, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L248](cross-language-runtime-polymorphism.md#^ref-c34c36a6-248-0) (line 248, col 0, score 1)
- [Eidolon Field Abstract Model — L205](eidolon-field-abstract-model.md#^ref-5e8b2388-205-0) (line 205, col 0, score 1)
- [eidolon-field-math-foundations — L172](eidolon-field-math-foundations.md#^ref-008f2ac0-172-0) (line 172, col 0, score 1)
- [eidolon-node-lifecycle — L50](eidolon-node-lifecycle.md#^ref-938eca9c-50-0) (line 50, col 0, score 1)
- [js-to-lisp-reverse-compiler — L418](js-to-lisp-reverse-compiler.md#^ref-58191024-418-0) (line 418, col 0, score 1)
- [layer-1-uptime-diagrams — L161](layer-1-uptime-diagrams.md#^ref-4127189a-161-0) (line 161, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L164](layer1survivabilityenvelope.md#^ref-64a9f9f9-164-0) (line 164, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L289](migrate-to-provider-tenant-architecture.md#^ref-54382370-289-0) (line 289, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L44](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-44-0) (line 44, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L42](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-42-0) (line 42, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L101](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-101-0) (line 101, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L248](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-248-0) (line 248, col 0, score 1)
- [plan-update-confirmation — L1007](plan-update-confirmation.md#^ref-b22d79c6-1007-0) (line 1007, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L147](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-147-0) (line 147, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L107](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-107-0) (line 107, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L217](chroma-toolkit-consolidation-plan.md#^ref-5020e892-217-0) (line 217, col 0, score 1)
- [ecs-scheduler-and-prefabs — L435](ecs-scheduler-and-prefabs.md#^ref-c62a1815-435-0) (line 435, col 0, score 1)
- [prompt-programming-language-lisp — L128](prompt-programming-language-lisp.md#^ref-d41a06d1-128-0) (line 128, col 0, score 1)
- [System Scheduler with Resource-Aware DAG — L421](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-421-0) (line 421, col 0, score 1)
- [Matplotlib Animation with Async Execution — L15](matplotlib-animation-with-async-execution.md#^ref-687439f9-15-0) (line 15, col 0, score 0.75)
- [Agent Tasks: Persistence Migration to DualStore — L176](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-176-0) (line 176, col 0, score 0.75)
- [Promethean Documentation Pipeline Overview — L163](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-163-0) (line 163, col 0, score 1)
- [Promethean Pipelines: Local TypeScript-First Workflow — L1](promethean-pipelines-local-typescript-first-workflow.md#^ref-6b63edca-1-0) (line 1, col 0, score 0.74)
- [Promethean Pipelines: Local TypeScript-First Workflow — L259](promethean-pipelines-local-typescript-first-workflow.md#^ref-6b63edca-259-0) (line 259, col 0, score 0.7)
- [api-gateway-versioning — L320](api-gateway-versioning.md#^ref-0580dcd3-320-0) (line 320, col 0, score 0.69)
- [Optimizing Command Limitations in System Design — L52](optimizing-command-limitations-in-system-design.md#^ref-98c8ff62-52-0) (line 52, col 0, score 0.69)
- [Promethean Infrastructure Setup — L628](promethean-infrastructure-setup.md#^ref-6deed6ac-628-0) (line 628, col 0, score 0.69)
- [Promethean-native config design — L3](promethean-native-config-design.md#^ref-ab748541-3-0) (line 3, col 0, score 0.69)
- [sibilant-metacompiler-overview — L93](sibilant-metacompiler-overview.md#^ref-61d4086b-93-0) (line 93, col 0, score 0.68)
- [Functional Embedding Pipeline Refactor — L309](functional-embedding-pipeline-refactor.md#^ref-a4a25141-309-0) (line 309, col 0, score 0.68)
- [Diagrams — L50](chunks/diagrams.md#^ref-45cd25b5-50-0) (line 50, col 0, score 1)
- [JavaScript — L48](chunks/javascript.md#^ref-c1618c66-48-0) (line 48, col 0, score 1)
- [Math Fundamentals — L43](chunks/math-fundamentals.md#^ref-c6e87433-43-0) (line 43, col 0, score 1)
- [Operations — L15](chunks/operations.md#^ref-f1add613-15-0) (line 15, col 0, score 1)
- [Services — L43](chunks/services.md#^ref-75ea4a6a-43-0) (line 43, col 0, score 1)
- [Simulation Demo — L34](chunks/simulation-demo.md#^ref-557309a3-34-0) (line 34, col 0, score 1)
- [Tooling — L28](chunks/tooling.md#^ref-6cb4943e-28-0) (line 28, col 0, score 1)
- [Window Management — L38](chunks/window-management.md#^ref-9e8ae388-38-0) (line 38, col 0, score 1)
- [compiler-kit-foundations — L651](compiler-kit-foundations.md#^ref-01b21543-651-0) (line 651, col 0, score 1)
- [Creative Moments — L15](creative-moments.md#^ref-10d98225-15-0) (line 15, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L263](cross-language-runtime-polymorphism.md#^ref-c34c36a6-263-0) (line 263, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L219](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-219-0) (line 219, col 0, score 1)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
