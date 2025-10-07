---
$$
uuid: e811123d-5841-4e52-bf8c-978f26db4230
$$
$$
created_at: 2025.08.08.15.08.47.md
$$
filename: WebSocket Gateway Implementation
$$
description: >-
$$
  Implements a WebSocket gateway with manual ACK support, lease management, and
  event streaming for real-time applications. Includes protocol definitions and
  server-side code for secure authentication and event handling.
tags:
  - WebSocket
  - EventBus
  - ACK
  - Lease
  - Protocol
  - Auth
  - Stream
  - Metrics
$$
related_to_title:
$$
  - Event Bus MVP
  - Mongo Outbox Implementation
  - Promethean Event Bus MVP v0.1
  - State Snapshots API and Transactional Projector
  - Stateful Partitions and Rebalancing
  - ecs-offload-workers
  - Shared Package Structure
  - schema-evolution-workflow
  - prom-lib-rate-limiters-and-replay-api
  - Migrate to Provider-Tenant Architecture
  - Promethean Agent DSL TS Scaffold
  - Promethean Infrastructure Setup
  - shared-package-layout-clarification
  - Services
  - observability-infrastructure-setup
  - 'Agent Tasks: Persistence Migration to DualStore'
  - Chroma Toolkit Consolidation Plan
  - archetype-ecs
  - ecs-scheduler-and-prefabs
  - Event Bus Projections Architecture
  - JavaScript
  - eidolon-field-math-foundations
  - Cross-Language Runtime Polymorphism
  - Unique Info Dump Index
  - Prompt_Folder_Bootstrap
$$
related_to_uuid:
$$
  - 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
  - 9c1acd1e-c6a4-4a49-a66f-6da8b1bc9333
  - fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
  - 509e1cd5-367c-4a9d-a61b-cef2e85d42ce
  - 4330e8f0-5f46-4235-918b-39b6b93fa561
  - 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
  - 66a72fc3-4153-41fc-84bd-d6164967a6ff
  - d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
  - aee4718b-9f8b-4635-a0c1-ef61c9bea8f1
  - 54382370-1931-4a19-a634-46735708a9ea
  - 5158f742-4a3b-466e-bfc3-d83517b64200
  - 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
  - 36c8882a-badc-4e18-838d-2c54d7038141
  - 75ea4a6a-8270-488d-9d37-799c288e5f70
  - b4e64f8c-4dc9-4941-a877-646c5ada068e
  - 93d2ba51-8689-49ee-94e2-296092e48058
  - 5020e892-8f18-443a-b707-6d0f3efcfe22
  - 8f4c1e86-1236-4936-84ca-6ed7082af6b7
  - c62a1815-c43b-4a3b-88e6-d7fa008a155e
  - cf6b9b17-bb91-4219-aa5c-172cba02b2da
  - c1618c66-f73a-4e04-9bfa-ef38755f7acc
  - 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
  - c34c36a6-80c9-4b44-a200-6448543b1b33
  - 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
  - bd4f0976-0d5b-47f6-a20a-0601d1842dc1
references:
  - uuid: fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
    line: 825
    col: 1
    score: 0.86
  - uuid: fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
    line: 825
    col: 3
    score: 0.86
  - uuid: 9c1acd1e-c6a4-4a49-a66f-6da8b1bc9333
    line: 381
    col: 1
    score: 0.89
  - uuid: 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
    line: 359
    col: 1
    score: 0.86
  - uuid: 509e1cd5-367c-4a9d-a61b-cef2e85d42ce
    line: 177
    col: 1
    score: 0.86
  - uuid: 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
    line: 370
    col: 1
    score: 0.92
  - uuid: 9c1acd1e-c6a4-4a49-a66f-6da8b1bc9333
    line: 542
    col: 1
    score: 0.86
  - uuid: 9c1acd1e-c6a4-4a49-a66f-6da8b1bc9333
    line: 552
    col: 1
    score: 1
  - uuid: 9c1acd1e-c6a4-4a49-a66f-6da8b1bc9333
    line: 552
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
  - uuid: 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
    line: 549
    col: 1
    score: 1
  - uuid: 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
    line: 549
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
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 276
    col: 1
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 276
    col: 3
    score: 1
  - uuid: 5158f742-4a3b-466e-bfc3-d83517b64200
    line: 832
    col: 1
    score: 1
  - uuid: 5158f742-4a3b-466e-bfc3-d83517b64200
    line: 832
    col: 3
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 581
    col: 1
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 581
    col: 3
    score: 1
  - uuid: 36c8882a-badc-4e18-838d-2c54d7038141
    line: 166
    col: 1
    score: 1
  - uuid: 36c8882a-badc-4e18-838d-2c54d7038141
    line: 166
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
  - uuid: 9c1acd1e-c6a4-4a49-a66f-6da8b1bc9333
    line: 554
    col: 1
    score: 1
  - uuid: 9c1acd1e-c6a4-4a49-a66f-6da8b1bc9333
    line: 554
    col: 3
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 197
    col: 1
    score: 0.99
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 197
    col: 3
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 301
    col: 1
    score: 0.99
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 301
    col: 3
    score: 0.99
  - uuid: 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
    line: 560
    col: 1
    score: 0.99
  - uuid: 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
    line: 560
    col: 3
    score: 0.99
  - uuid: aee4718b-9f8b-4635-a0c1-ef61c9bea8f1
    line: 399
    col: 1
    score: 0.99
  - uuid: aee4718b-9f8b-4635-a0c1-ef61c9bea8f1
    line: 399
    col: 3
    score: 0.99
  - uuid: 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
    line: 563
    col: 1
    score: 0.98
  - uuid: 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
    line: 563
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
  - uuid: 9c1acd1e-c6a4-4a49-a66f-6da8b1bc9333
    line: 564
    col: 1
    score: 0.98
  - uuid: 9c1acd1e-c6a4-4a49-a66f-6da8b1bc9333
    line: 564
    col: 3
    score: 0.98
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 498
    col: 1
    score: 0.98
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 498
    col: 3
    score: 0.98
  - uuid: fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
    line: 907
    col: 1
    score: 0.98
  - uuid: fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
    line: 907
    col: 3
    score: 0.98
  - uuid: aee4718b-9f8b-4635-a0c1-ef61c9bea8f1
    line: 397
    col: 1
    score: 0.99
  - uuid: aee4718b-9f8b-4635-a0c1-ef61c9bea8f1
    line: 397
    col: 3
    score: 0.99
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 496
    col: 1
    score: 0.99
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 496
    col: 3
    score: 0.99
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 25
    col: 1
    score: 0.99
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 25
    col: 3
    score: 0.99
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 160
    col: 1
    score: 0.99
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 160
    col: 3
    score: 0.99
---
lol ok, shovel mode engaged. Here’s **Part 2**: WS gateway, manual ACK/leases, compactor + snapshots, Prom metrics, and a concrete projector that turns heartbeats into a keyed `process.state` stream. All TS, drop-in under `shared/js/prom-lib/`.

---

# 0) Small but important tweak: manual ACK

Add a `manualAck?: boolean` option to `subscribe`. If `true`, the bus won’t auto-ack—**you** must call `bus.ack` (perfect for WS). Patch to `InMemoryEventBus`:

```ts
// ... inside InMemoryEventBus.kick(sub)
const {
  batchSize = 100,
  maxInFlight = 1000,
  maxAttempts = 5,
  from = "latest",
  ts,
  afterId,
  filter,
  manualAck = false, // <--
} = sub.opts;
// ...
(async () => {
  try {
    await sub.handler(e, ctx);
    if (!manualAck) {
      await this.ack(e.topic, sub.group, e.id);
    }
  } catch (err) {
    await this.nack(e.topic, sub.group, e.id, (err as Error)?.message);
  } finally {
    sub.inflight--;
    this.kick(sub);
  }
})();
```

---

# 1) WebSocket Gateway $server + client$

## 1a) Protocol (frames)

* `AUTH` *$client → server$* `{ op: "AUTH", token: string }`
* `OK` / `ERR` *$server → client$* `{ op: "OK", corr?: string }` or `{ op: "ERR", code, msg, corr? }`
* `SUBSCRIBE` *$client → server$* `{ op: "SUBSCRIBE", topic, group, opts? }`
* `UNSUBSCRIBE` *$client → server$* `{ op: "UNSUBSCRIBE", topic, group }`
* `PUBLISH` *$client → server$* `{ op: "PUBLISH", topic, payload, opts? }`
* `EVENT` *$server → client$* `{ op: "EVENT", topic, group, event, ctx: { attempt, ack_deadline_ms } }`
* `ACK` / `NACK` *$client → server$* `{ op: "ACK"| "NACK", topic, group, id, reason? }`
* `MODACK` *$client → server$* `{ op: "MODACK", topic, group, id, extend_ms }` (extend lease)

Auth is pluggable (static token or JWT verify hook).

## 1b) WS Server

```ts
// shared/js/prom-lib/ws/server.ts
import { WebSocketServer, WebSocket } from "ws";
import { EventBus, EventRecord } from "../event/types";

export type AuthResult = { ok: true; subScopes?: string[] } | { ok: false; code: string; msg: string };
export type AuthFn = (token: string | undefined) => Promise<AuthResult>;

type Inflight = { event: EventRecord; deadline: number; attempt: number };

export interface WSGatewayOptions {
  auth?: AuthFn;
  ackTimeoutMs?: number;       // default 30s
  maxInflightPerSub?: number;  // default 100
  log?: (...args: any[]) => void;
}

export function startWSGateway(bus: EventBus, port: number, opts: WSGatewayOptions = {}) {
  const wss = new WebSocketServer({ port });
  const log = opts.log ?? (() => {});
  const ackTimeout = opts.ackTimeoutMs ?? 30_000;
  const maxInflight = opts.maxInflightPerSub ?? 100;

  type SubKey = string; // `${topic}::${group}`
  type SubState = {
    stop?: () => Promise<void>;
    inflight: Map<string, Inflight>;
    manualAck: boolean;
  };

  wss.on("connection", (ws: WebSocket) => {
    let authed = false;
    const subs = new Map<SubKey, SubState>();

    const safeSend = (obj: any) => { if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(obj)); };

    // Lease sweeper
    const sweep = setInterval(() => {
      for (const [_k, s] of subs) {
        for (const [id, infl] of s.inflight) {
          if (Date.now() > infl.deadline) {
            // lease expired: drop from inflight; the bus cursor hasn’t advanced so it will redeliver soon
            s.inflight.delete(id);
          }
        }
      }
    }, Math.min(ackTimeout, 5_000));

    ws.on("message", async (raw) => {
      let msg: any;
      try { msg = JSON.parse(raw.toString()); } catch { return safeSend({ op: "ERR", code: "bad_json", msg: "Invalid JSON" }); }

      const corr = msg.corr;
      const err = (code: string, m: string) => safeSend({ op: "ERR", code, msg: m, corr });

      // AUTH
      if (msg.op === "AUTH") {
        const a = await (opts.auth?.(msg.token) ?? Promise.resolve({ ok: true } as AuthResult));
        if (!a.ok) return err(a.code, a.msg);
        authed = true;
        return safeSend({ op: "OK", corr });
      }

      if (!authed) return err("unauthorized", "Call AUTH first.");

      // PUBLISH
      if (msg.op === "PUBLISH") {
        try {
          const rec = await bus.publish(msg.topic, msg.payload, msg.opts);
          return safeSend({ op: "OK", corr, id: rec.id });
        } catch (e: any) {
          return err("publish_failed", e.message ?? String(e));
        }
      }

      // SUBSCRIBE
      if (msg.op === "SUBSCRIBE") {
        const { topic, group, opts: subOpts = {} } = msg;
        const key: SubKey = `${topic}::${group}`;
        // prevent duplicate sub
        if (subs.has(key)) {
          return err("already_subscribed", `${key}`);
        }
        const state: SubState = { inflight: new Map(), manualAck: true };
        subs.set(key, state);

        const stop = await bus.subscribe(
          topic, group,
          async (e, ctx) => {
            // backpressure
            if (state.inflight.size >= maxInflight) return; // drop; will redeliver later
            // dedupe if same id still inflight
            if (state.inflight.has(e.id)) return;

            const deadline = Date.now() + (subOpts.ackTimeoutMs ?? ackTimeout);
            state.inflight.set(e.id, { event: e, deadline, attempt: ctx.attempt ?? 1 });

            safeSend({
              op: "EVENT",
              topic, group,
              event: e,
              ctx: { attempt: ctx.attempt ?? 1, ack_deadline_ms: deadline - Date.now() }
            });
          },
          { ...subOpts, manualAck: true }
        );
        state.stop = stop;
        return safeSend({ op: "OK", corr });
      }

      // UNSUBSCRIBE
      if (msg.op === "UNSUBSCRIBE") {
        const key: SubKey = `${msg.topic}::${msg.group}`;
        const s = subs.get(key);
        if (!s) return err("not_subscribed", key);
        await s.stop?.();
        subs.delete(key);
        return safeSend({ op: "OK", corr });
      }

      // ACK
      if (msg.op === "ACK" || msg.op === "NACK" || msg.op === "MODACK") {
        const key: SubKey = `${msg.topic}::${msg.group}`;
        const s = subs.get(key);
        if (!s) return err("not_subscribed", key);

        const infl = s.inflight.get(msg.id);
        if (!infl) {
          if (msg.op === "MODACK") return err("unknown_id", "no inflight to extend");
          // benign for ACK/NACK of already-cleared IDs
          return safeSend({ op: "OK", corr });
        }

        if (msg.op === "MODACK") {
          infl.deadline = Date.now() + Math.max(1000, Number(msg.extend_ms) || ackTimeout);
          return safeSend({ op: "OK", corr });
        }

        // clear inflight first
        s.inflight.delete(msg.id);
        try {
          if (msg.op === "ACK") await bus.ack(msg.topic, msg.group, msg.id);
          else await bus.nack(msg.topic, msg.group, msg.id, msg.reason);
          safeSend({ op: "OK", corr });
        } catch (e: any) {
          return err("ack_failed", e.message ?? String(e));
        }
      }
    });

    ws.on("close", async () => {
      clearInterval(sweep);
      for (const [_k, s] of subs) await s.stop?.();
      subs.clear();
    });
  });

  return wss;
}
```

## 1c) Tiny WS client

```ts
// shared/js/prom-lib/ws/client.ts
import WebSocket from "ws";

export type Handler = (event: any, ctx: { attempt: number; ack_deadline_ms: number }) => Promise<void> | void;

export class EventClient {
  private ws: WebSocket;
  private pending = new Map<string, (ok: boolean, payload?: any) => void>();
  private handlers = new Map<string, Handler>(); // key = `${topic}::${group}`

  constructor(url: string, token?: string) {
    this.ws = new WebSocket(url);
    this.ws.on("open", () => {
      this.send({ op: "AUTH", token }, true);
    });
    this.ws.on("message", (raw) => this.onMessage(raw.toString()));
  }

  private send(obj: any, wait = false): Promise<any> | void {
    if (!wait) return this.ws.send(JSON.stringify(obj));
    const corr = Math.random().toString(16).slice(2);
    obj.corr = corr;
    this.ws.send(JSON.stringify(obj));
    return new Promise((resolve, reject) => {
      this.pending.set(corr, (ok, payload) => ok ? resolve(payload) : reject(payload));
      setTimeout(() => {
        if (this.pending.delete(corr)) reject(new Error("timeout"));
      }, 15_000);
    });
  }

  private async onMessage(s: string) {
    const msg = JSON.parse(s);
    if (msg.op === "OK" || msg.op === "ERR") {
      const cb = this.pending.get(msg.corr);
      if (cb) {
        this.pending.delete(msg.corr);
        return cb(msg.op === "OK", msg);
      }
    }
    if (msg.op === "EVENT") {
      const key = `${msg.topic}::${msg.group}`;
      const h = this.handlers.get(key);
      if (!h) return;
      try {
        await h(msg.event, msg.ctx);
        // default: immediate ack
        this.send({ op: "ACK", topic: msg.topic, group: msg.group, id: msg.event.id });
      } catch (e: any) {
        this.send({ op: "NACK", topic: msg.topic, group: msg.group, id: msg.event.id, reason: e.message ?? String(e) });
      }
    }
  }

  async publish(topic: string, payload: any, opts?: any) {
    return this.send({ op: "PUBLISH", topic, payload, opts }, true);
  }

  async subscribe(topic: string, group: string, handler: Handler, opts?: any) {
    this.handlers.set(`${topic}::${group}`, handler);
    return this.send({ op: "SUBSCRIBE", topic, group, opts }, true);
  }

  async unsubscribe(topic: string, group: string) {
    this.handlers.delete(`${topic}::${group}`);
    return this.send({ op: "UNSUBSCRIBE", topic, group }, true);
  }

  modAck(topic: string, group: string, id: string, extend_ms: number) {
    this.send({ op: "MODACK", topic, group, id, extend_ms });
  }
}
```

## 1d) Mermaid: leasey flow

```mermaid
sequenceDiagram
  participant C as Client
  participant G as WS Gateway
  participant B as EventBus
  C->>G: AUTH(token)
  G-->>C: OK
  C->>G: SUBSCRIBE(t,g,{ackTimeoutMs})
  G->>B: subscribe(manualAck=true)
  B-->>G: handler(e)
  G-->>C: EVENT(e,{ack_deadline_ms})
  Note right of C: process; MODACK to extend (optional)
  C->>G: ACK(id)
  G->>B: ack(t,g,id)
  B-->>G: OK
  G-->>C: OK
```

---

# 2) Compaction + Snapshots

Use compaction for “latest by key” state streams, plus periodic snapshots.

## 2a) Config

```ts
// shared/js/prom-lib/event/topics.ts
export const Topics = {
  HeartbeatReceived: "heartbeat.received",
  ProcessState: "process.state",                 // compaction (key = processId)
  ProcessStateSnapshot: "process.state.snapshot" // snapshots
} as const;
```

## 2b) Compactor job

```ts
// shared/js/prom-lib/compaction/compactor.ts
import { MongoEventStore } from "../event/mongo";
import { EventBus } from "../event/types";

export interface CompactorOptions {
  topic: string;
  snapshotTopic: string;
  keySource?: (e: any) => string | undefined; // optional, if state events are not keyed
  intervalMs?: number; // how often to snapshot
  batchKeys?: string[]; // optional, restrict to a key set
}

export function startCompactor(store: MongoEventStore, bus: EventBus, opts: CompactorOptions) {
  const every = opts.intervalMs ?? 30_000;

  let stopped = false;
  (async function loop() {
    while (!stopped) {
      try {
        const keys = opts.batchKeys;
        if (!store.latestByKey) throw new Error("latestByKey not supported by store");
        const latest = await store.latestByKey(opts.topic, keys ?? []);
        const entries = Object.entries(latest);
        if (entries.length === 0) { await sleep(every); continue; }

        for (const [key, rec] of entries) {
          await bus.publish(opts.snapshotTopic, { key, payload: rec?.payload, ts: rec?.ts ?? Date.now() }, { key });
        }
      } catch (e) {
        // log and continue
      } finally {
        await sleep(every);
      }
    }
  })();

  return () => { stopped = true; };
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }
```
$$
*Mongo index hints:*
$$
* `events(topic, key, ts)` compound index (we already included)
* TTL on raw event topics if you want to shed history (e.g., `expireAfterSeconds`).

---

# 3) Prometheus metrics helper

Lightweight wrapper around `prom-client` $or a no-op if not installed$.

```ts
// shared/js/prom-lib/metrics/prom.ts
let client: any;
try { client = await import("prom-client"); } catch { client = null; }

type Labels = Record<string, string>;

export const metrics = {
  counters: new Map<string, any>(),
  histos: new Map<string, any>(),
  gauge(name: string, help: string) {
    if (!client) return { set: () => {} };
    const g = new client.Gauge({ name, help });
    return g;
  },
  counter(name: string, help: string) {
    if (!client) return { inc: (_l?: Labels, _v?: number) => {} };
    if (!metrics.counters.has(name)) {
      metrics.counters.set(name, new client.Counter({ name, help, labelNames: ["topic","group"] }));
    }
    return metrics.counters.get(name);
  },
  histo(name: string, help: string, buckets?: number[]) {
    if (!client) return { observe: (_l?: Labels, _v?: number) => {} };
    if (!metrics.histos.has(name)) {
      metrics.histos.set(name, new client.Histogram({
        name, help, labelNames: ["topic","group"],
        buckets: buckets ?? [5, 10, 25, 50, 100, 250, 500, 1000]
      }));
    }
    return metrics.histos.get(name);
  },
  expose(app: any, path = "/metrics") {
    if (!client) return;
    const reg = client.register;
    app.get(path, async (_req: any, res: any) => {
      res.set("Content-Type", reg.contentType);
      res.end(await reg.metrics());
    });
  }
};
```

**Hook points** you likely want (sprinkle in the bus and ws gateway):

* `events_published_total{topic}`
* `events_delivered_total{topic,group}`
* `events_acked_total{topic,group}`
* `events_nacked_total{topic,group}`
* `ws_inflight{topic,group}`
* `delivery_latency_ms_bucket{topic,group}` $measure publish→ack if you carry a `t0` header$

---

# 4) Example projector: Heartbeat → Process State

Takes `heartbeat.received` events and emits/upserts `process.state` keyed by `processId`.

## 4a) Types

```ts
// shared/js/prom-lib/examples/process/types.ts
export interface HeartbeatPayload {
  pid: number;
  name: string;
  host: string;
  cpu_pct: number;
  mem_mb: number;
  sid?: string;
}

export interface ProcessState {
  processId: string; // `${host}:${name}:${pid}`
  name: string;
  host: string;
  pid: number;
  sid?: string;
  cpu_pct: number;
  mem_mb: number;
  last_seen_ts: number;
  status: "alive" | "stale";
}
```

## 4b) Projector

```ts
// shared/js/prom-lib/examples/process/projector.ts
import { EventBus } from "../../event/types";
import { Topics } from "../../event/topics";
import { HeartbeatPayload, ProcessState } from "./types";

const STALE_MS = 15_000;

export async function startProcessProjector(bus: EventBus) {
  const cache = new Map<string, ProcessState>(); // in-memory; replace with Mongo if you want persistence

  function keyOf(h: HeartbeatPayload) {
    return `${h.host}:${h.name}:${h.pid}`;
  }

  async function publishState(ps: ProcessState) {
    await bus.publish(Topics.ProcessState, ps, { key: ps.processId });
  }

  // subscriber
  await bus.subscribe(Topics.HeartbeatReceived, "process-projector", async (e) => {
    const hb = e.payload as HeartbeatPayload;
    const k = keyOf(hb);
    const ps: ProcessState = {
      processId: k,
      name: hb.name,
      host: hb.host,
      pid: hb.pid,
      sid: hb.sid,
      cpu_pct: hb.cpu_pct,
      mem_mb: hb.mem_mb,
      last_seen_ts: e.ts,
      status: "alive",
    };
    cache.set(k, ps);
    await publishState(ps);
  }, { from: "earliest" });

  // staleness scanner
  const t = setInterval(async () => {
    const now = Date.now();
    for (const [k, ps] of cache) {
      const status = (now - ps.last_seen_ts) > STALE_MS ? "stale" : "alive";
      if (status !== ps.status) {
        ps.status = status;
        await publishState(ps);
      }
    }
  }, 5_000);

  return () => clearInterval(t);
}
```

---

# 5) Minimal HTTP publish (optional)

Handy for curl/tests without WS:

```ts
// shared/js/prom-lib/http/publish.ts
import express from "express";
import bodyParser from "body-parser";
import { EventBus } from "../event/types";

export function startHttpPublisher(bus: EventBus, port = 8081) {
  const app = express();
  app.use(bodyParser.json({ limit: "1mb" }));

  app.post("/publish/:topic", async (req, res) => {
    try {
      const rec = await bus.publish(req.params.topic, req.body, { headers: req.headers as any });
      res.json({ id: rec.id });
    } catch (e: any) {
      res.status(500).json({ error: e.message ?? String(e) });
    }
  });

  return app.listen(port);
}
```

---

# 6) Tiny bootstrap (wire it all together)

```ts
// services/js/event-gateway/index.ts
import { InMemoryEventBus } from "../../shared/js/prom-lib/event/memory";
import { startWSGateway } from "../../shared/js/prom-lib/ws/server";
import { startHttpPublisher } from "../../shared/js/prom-lib/http/publish";
import { startProcessProjector } from "../../shared/js/prom-lib/examples/process/projector";
import { Topics } from "../../shared/js/prom-lib/event/topics";

async function main() {
  const bus = new InMemoryEventBus();

  // gateway(s)
  startWSGateway(bus, Number(process.env.WS_PORT ?? 8090), {
    auth: async (token) => token === process.env.WS_TOKEN ? { ok: true } : { ok: false, code: "bad_token", msg: "nope" }
  });
  startHttpPublisher(bus, Number(process.env.HTTP_PORT ?? 8081));

  // projector
  await startProcessProjector(bus);

  // sample heartbeat tick
  setInterval(() => {
    bus.publish(Topics.HeartbeatReceived, {
      pid: 1234, name: "stt", host: "local", cpu_pct: Math.random()*50, mem_mb: 200+Math.random()*50
    });
  }, 1000);
}

main().catch((e) => { console.error(e); process.exit(1); });
```

---

# 7) Sibilant sugar (pseudocode)

```lisp
; shared/sibilant/prom/ws.sib (pseudo)
(defn ws-auth [token] (if (= token (env "WS_TOKEN")) {:ok true} {:ok false :code "bad_token" :msg "no"}))

(defmacro with-ws-bus [bus port & body]
  `((startWSGateway ~bus ~port {:auth ws-auth})
    ~@body))

; usage:
; (with-ws-bus bus 8090
;   (subscribe! bus "heartbeat.received" "ops" on-heartbeat :from "earliest"))
```

---

# 8) Quick Kanban checklist (dump to board)

* [ ] Add `manualAck` to event bus and re-run tests
* [ ] Spin up WS gateway $`WS_PORT=8090 WS_TOKEN=devtoken node index.js`$
* [ ] Write a smoke test: client subscribes, publish 10 msgs, assert all ACKed
* [ ] Add Prometheus `events_*` counters in WS server hook points
* [ ] Wire MongoEventStore + MongoCursorStore in place of InMemory
* [ ] Enable compactor for `process.state` → `process.state.snapshot`
* [ ] Add snapshot consumer to warm cache on boot
* [ ] Expose `/metrics` on an express app and scrape with Prom

---

If you want **Part 3**, I’ll drop:

* a **Mongo-backed outbox** (transactional),
* **JWT auth** with scope-based ACLs (`topic:read`, `topic:write`),
* an **Ops dashboard** stub (HTTP) that shows cursors, inflight, and latest snapshots,
* and a **typed client SDK** for Node + browser.
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- $[docs/unique/event-bus-mvp|Event Bus MVP]$
- $[mongo-outbox-implementation|Mongo Outbox Implementation]$
- [Promethean Event Bus MVP v0.1]$promethean-event-bus-mvp-v0-1.md$
- $[state-snapshots-api-and-transactional-projector|State Snapshots API and Transactional Projector]$
- $[stateful-partitions-and-rebalancing|Stateful Partitions and Rebalancing]$
- $[docs/unique/ecs-offload-workers|ecs-offload-workers]$
- $[shared-package-structure|Shared Package Structure]$
- $[schema-evolution-workflow]$
- $[prom-lib-rate-limiters-and-replay-api]$
- $[migrate-to-provider-tenant-architecture|Migrate to Provider-Tenant Architecture]$
- $[promethean-agent-dsl-ts-scaffold|Promethean Agent DSL TS Scaffold]$
- $[promethean-infrastructure-setup|Promethean Infrastructure Setup]$
- $[shared-package-layout-clarification]$
- [Services]$chunks/services.md$
- $[observability-infrastructure-setup]$
- $[docs/unique/agent-tasks-persistence-migration-to-dualstore|Agent Tasks: Persistence Migration to DualStore]$
- $[chroma-toolkit-consolidation-plan|Chroma Toolkit Consolidation Plan]$
- $[docs/unique/archetype-ecs|archetype-ecs]$
- $[ecs-scheduler-and-prefabs]$
- $[event-bus-projections-architecture|Event Bus Projections Architecture]$
- [JavaScript]$chunks/javascript.md$
- $[docs/unique/eidolon-field-math-foundations|eidolon-field-math-foundations]$
- $[cross-language-runtime-polymorphism|Cross-Language Runtime Polymorphism]$
- $[unique-info-dump-index|Unique Info Dump Index]$
- $[prompt-folder-bootstrap|Prompt_Folder_Bootstrap]$

## Sources
- [Promethean Event Bus MVP v0.1 — L825]$promethean-event-bus-mvp-v0-1.md#L825$ (line 825, col 1, score 0.86)
- [Promethean Event Bus MVP v0.1 — L825]$promethean-event-bus-mvp-v0-1.md#L825$ (line 825, col 3, score 0.86)
- $[mongo-outbox-implementation#L381|Mongo Outbox Implementation — L381]$ (line 381, col 1, score 0.89)
- $[docs/unique/event-bus-mvp#L359|Event Bus MVP — L359]$ (line 359, col 1, score 0.86)
- $[state-snapshots-api-and-transactional-projector#L177|State Snapshots API and Transactional Projector — L177]$ (line 177, col 1, score 0.86)
- $[docs/unique/event-bus-mvp#L370|Event Bus MVP — L370]$ (line 370, col 1, score 0.92)
- $[mongo-outbox-implementation#L542|Mongo Outbox Implementation — L542]$ (line 542, col 1, score 0.86)
- $[mongo-outbox-implementation#L552|Mongo Outbox Implementation — L552]$ (line 552, col 1, score 1)
- $[mongo-outbox-implementation#L552|Mongo Outbox Implementation — L552]$ (line 552, col 3, score 1)
- $[prom-lib-rate-limiters-and-replay-api#L386|prom-lib-rate-limiters-and-replay-api — L386]$ (line 386, col 1, score 1)
- $[prom-lib-rate-limiters-and-replay-api#L386|prom-lib-rate-limiters-and-replay-api — L386]$ (line 386, col 3, score 1)
- [Promethean Event Bus MVP v0.1 — L881]$promethean-event-bus-mvp-v0-1.md#L881$ (line 881, col 1, score 1)
- [Promethean Event Bus MVP v0.1 — L881]$promethean-event-bus-mvp-v0-1.md#L881$ (line 881, col 3, score 1)
- $[schema-evolution-workflow#L485|schema-evolution-workflow — L485]$ (line 485, col 1, score 1)
- $[schema-evolution-workflow#L485|schema-evolution-workflow — L485]$ (line 485, col 3, score 1)
- [Services — L13]$chunks/services.md#L13$ (line 13, col 1, score 1)
- [Services — L13]$chunks/services.md#L13$ (line 13, col 3, score 1)
- $[docs/unique/ecs-offload-workers#L467|ecs-offload-workers — L467]$ (line 467, col 1, score 1)
- $[docs/unique/ecs-offload-workers#L467|ecs-offload-workers — L467]$ (line 467, col 3, score 1)
- $[docs/unique/event-bus-mvp#L549|Event Bus MVP — L549]$ (line 549, col 1, score 1)
- $[docs/unique/event-bus-mvp#L549|Event Bus MVP — L549]$ (line 549, col 3, score 1)
- $[observability-infrastructure-setup#L364|observability-infrastructure-setup — L364]$ (line 364, col 1, score 1)
- $[observability-infrastructure-setup#L364|observability-infrastructure-setup — L364]$ (line 364, col 3, score 1)
- $[docs/unique/agent-tasks-persistence-migration-to-dualstore#L137|Agent Tasks: Persistence Migration to DualStore — L137]$ (line 137, col 1, score 1)
- $[docs/unique/agent-tasks-persistence-migration-to-dualstore#L137|Agent Tasks: Persistence Migration to DualStore — L137]$ (line 137, col 3, score 1)
- $[chroma-toolkit-consolidation-plan#L175|Chroma Toolkit Consolidation Plan — L175]$ (line 175, col 1, score 1)
- $[chroma-toolkit-consolidation-plan#L175|Chroma Toolkit Consolidation Plan — L175]$ (line 175, col 3, score 1)
- $[docs/unique/event-bus-mvp#L547|Event Bus MVP — L547]$ (line 547, col 1, score 1)
- $[docs/unique/event-bus-mvp#L547|Event Bus MVP — L547]$ (line 547, col 3, score 1)
- $[event-bus-projections-architecture#L150|Event Bus Projections Architecture — L150]$ (line 150, col 1, score 1)
- $[event-bus-projections-architecture#L150|Event Bus Projections Architecture — L150]$ (line 150, col 3, score 1)
- [Services — L11]$chunks/services.md#L11$ (line 11, col 1, score 1)
- [Services — L11]$chunks/services.md#L11$ (line 11, col 3, score 1)
- $[docs/unique/event-bus-mvp#L554|Event Bus MVP — L554]$ (line 554, col 1, score 1)
- $[docs/unique/event-bus-mvp#L554|Event Bus MVP — L554]$ (line 554, col 3, score 1)
- $[mongo-outbox-implementation#L553|Mongo Outbox Implementation — L553]$ (line 553, col 1, score 1)
- $[mongo-outbox-implementation#L553|Mongo Outbox Implementation — L553]$ (line 553, col 3, score 1)
- $[prom-lib-rate-limiters-and-replay-api#L382|prom-lib-rate-limiters-and-replay-api — L382]$ (line 382, col 1, score 1)
- $[prom-lib-rate-limiters-and-replay-api#L382|prom-lib-rate-limiters-and-replay-api — L382]$ (line 382, col 3, score 1)
- [Services — L14]$chunks/services.md#L14$ (line 14, col 1, score 1)
- [Services — L14]$chunks/services.md#L14$ (line 14, col 3, score 1)
- $[docs/unique/event-bus-mvp#L553|Event Bus MVP — L553]$ (line 553, col 1, score 1)
- $[docs/unique/event-bus-mvp#L553|Event Bus MVP — L553]$ (line 553, col 3, score 1)
- $[mongo-outbox-implementation#L559|Mongo Outbox Implementation — L559]$ (line 559, col 1, score 1)
- $[mongo-outbox-implementation#L559|Mongo Outbox Implementation — L559]$ (line 559, col 3, score 1)
- $[prom-lib-rate-limiters-and-replay-api#L388|prom-lib-rate-limiters-and-replay-api — L388]$ (line 388, col 1, score 1)
- $[prom-lib-rate-limiters-and-replay-api#L388|prom-lib-rate-limiters-and-replay-api — L388]$ (line 388, col 3, score 1)
- $[docs/unique/archetype-ecs#L460|archetype-ecs — L460]$ (line 460, col 1, score 1)
- $[docs/unique/archetype-ecs#L460|archetype-ecs — L460]$ (line 460, col 3, score 1)
- [JavaScript — L15]$chunks/javascript.md#L15$ (line 15, col 1, score 1)
- [JavaScript — L15]$chunks/javascript.md#L15$ (line 15, col 3, score 1)
- $[ecs-scheduler-and-prefabs#L388|ecs-scheduler-and-prefabs — L388]$ (line 388, col 1, score 1)
- $[ecs-scheduler-and-prefabs#L388|ecs-scheduler-and-prefabs — L388]$ (line 388, col 3, score 1)
- $[docs/unique/eidolon-field-math-foundations#L129|eidolon-field-math-foundations — L129]$ (line 129, col 1, score 1)
- $[docs/unique/eidolon-field-math-foundations#L129|eidolon-field-math-foundations — L129]$ (line 129, col 3, score 1)
- $[migrate-to-provider-tenant-architecture#L276|Migrate to Provider-Tenant Architecture — L276]$ (line 276, col 1, score 1)
- $[migrate-to-provider-tenant-architecture#L276|Migrate to Provider-Tenant Architecture — L276]$ (line 276, col 3, score 1)
- $[promethean-agent-dsl-ts-scaffold#L832|Promethean Agent DSL TS Scaffold — L832]$ (line 832, col 1, score 1)
- $[promethean-agent-dsl-ts-scaffold#L832|Promethean Agent DSL TS Scaffold — L832]$ (line 832, col 3, score 1)
- $[promethean-infrastructure-setup#L581|Promethean Infrastructure Setup — L581]$ (line 581, col 1, score 1)
- $[promethean-infrastructure-setup#L581|Promethean Infrastructure Setup — L581]$ (line 581, col 3, score 1)
- $[shared-package-layout-clarification#L166|shared-package-layout-clarification — L166]$ (line 166, col 1, score 1)
- $[shared-package-layout-clarification#L166|shared-package-layout-clarification — L166]$ (line 166, col 3, score 1)
- [Services — L12]$chunks/services.md#L12$ (line 12, col 1, score 1)
- [Services — L12]$chunks/services.md#L12$ (line 12, col 3, score 1)
- $[cross-language-runtime-polymorphism#L211|Cross-Language Runtime Polymorphism — L211]$ (line 211, col 1, score 1)
- $[cross-language-runtime-polymorphism#L211|Cross-Language Runtime Polymorphism — L211]$ (line 211, col 3, score 1)
- $[docs/unique/event-bus-mvp#L550|Event Bus MVP — L550]$ (line 550, col 1, score 1)
- $[docs/unique/event-bus-mvp#L550|Event Bus MVP — L550]$ (line 550, col 3, score 1)
- $[mongo-outbox-implementation#L554|Mongo Outbox Implementation — L554]$ (line 554, col 1, score 1)
- $[mongo-outbox-implementation#L554|Mongo Outbox Implementation — L554]$ (line 554, col 3, score 1)
- $[prompt-folder-bootstrap#L197|Prompt_Folder_Bootstrap — L197]$ (line 197, col 1, score 0.99)
- $[prompt-folder-bootstrap#L197|Prompt_Folder_Bootstrap — L197]$ (line 197, col 3, score 0.99)
- $[migrate-to-provider-tenant-architecture#L301|Migrate to Provider-Tenant Architecture — L301]$ (line 301, col 1, score 0.99)
- $[migrate-to-provider-tenant-architecture#L301|Migrate to Provider-Tenant Architecture — L301]$ (line 301, col 3, score 0.99)
- $[docs/unique/event-bus-mvp#L560|Event Bus MVP — L560]$ (line 560, col 1, score 0.99)
- $[docs/unique/event-bus-mvp#L560|Event Bus MVP — L560]$ (line 560, col 3, score 0.99)
- $[prom-lib-rate-limiters-and-replay-api#L399|prom-lib-rate-limiters-and-replay-api — L399]$ (line 399, col 1, score 0.99)
- $[prom-lib-rate-limiters-and-replay-api#L399|prom-lib-rate-limiters-and-replay-api — L399]$ (line 399, col 3, score 0.99)
- $[docs/unique/event-bus-mvp#L563|Event Bus MVP — L563]$ (line 563, col 1, score 0.98)
- $[docs/unique/event-bus-mvp#L563|Event Bus MVP — L563]$ (line 563, col 3, score 0.98)
- $[prom-lib-rate-limiters-and-replay-api#L398|prom-lib-rate-limiters-and-replay-api — L398]$ (line 398, col 1, score 0.98)
- $[prom-lib-rate-limiters-and-replay-api#L398|prom-lib-rate-limiters-and-replay-api — L398]$ (line 398, col 3, score 0.98)
- $[mongo-outbox-implementation#L564|Mongo Outbox Implementation — L564]$ (line 564, col 1, score 0.98)
- $[mongo-outbox-implementation#L564|Mongo Outbox Implementation — L564]$ (line 564, col 3, score 0.98)
- $[schema-evolution-workflow#L498|schema-evolution-workflow — L498]$ (line 498, col 1, score 0.98)
- $[schema-evolution-workflow#L498|schema-evolution-workflow — L498]$ (line 498, col 3, score 0.98)
- [Promethean Event Bus MVP v0.1 — L907]$promethean-event-bus-mvp-v0-1.md#L907$ (line 907, col 1, score 0.98)
- [Promethean Event Bus MVP v0.1 — L907]$promethean-event-bus-mvp-v0-1.md#L907$ (line 907, col 3, score 0.98)
- $[prom-lib-rate-limiters-and-replay-api#L397|prom-lib-rate-limiters-and-replay-api — L397]$ (line 397, col 1, score 0.99)
- $[prom-lib-rate-limiters-and-replay-api#L397|prom-lib-rate-limiters-and-replay-api — L397]$ (line 397, col 3, score 0.99)
- $[schema-evolution-workflow#L496|schema-evolution-workflow — L496]$ (line 496, col 1, score 0.99)
- $[schema-evolution-workflow#L496|schema-evolution-workflow — L496]$ (line 496, col 3, score 0.99)
- [Services — L25]$chunks/services.md#L25$ (line 25, col 1, score 0.99)
- [Services — L25]$chunks/services.md#L25$ (line 25, col 3, score 0.99)
- $[unique-info-dump-index#L160|Unique Info Dump Index — L160]$ (line 160, col 1, score 0.99)
- $[unique-info-dump-index#L160|Unique Info Dump Index — L160]$ (line 160, col 3, score 0.99)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
