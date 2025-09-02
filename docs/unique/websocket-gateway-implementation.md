---
uuid: e811123d-5841-4e52-bf8c-978f26db4230
created_at: 2025.08.08.15.08.47.md
filename: WebSocket Gateway Implementation
description: >-
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
related_to_title: []
related_to_uuid: []
references: []
---
lol ok, shovel mode engaged. Here’s **Part 2**: WS gateway, manual ACK/leases, compactor + snapshots, Prom metrics, and a concrete projector that turns heartbeats into a keyed `process.state` stream. All TS, drop-in under `shared/js/prom-lib/`. ^ref-e811123d-1-0

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
^ref-e811123d-9-0

---

# 1) WebSocket Gateway (server + client)

## 1a) Protocol (frames)
 ^ref-e811123d-43-0
* `AUTH` *(client → server)* `{ op: "AUTH", token: string }`
* `OK` / `ERR` *(server → client)* `{ op: "OK", corr?: string }` or `{ op: "ERR", code, msg, corr? }` ^ref-e811123d-45-0
* `SUBSCRIBE` *(client → server)* `{ op: "SUBSCRIBE", topic, group, opts? }` ^ref-e811123d-46-0
* `UNSUBSCRIBE` *(client → server)* `{ op: "UNSUBSCRIBE", topic, group }` ^ref-e811123d-47-0
* `PUBLISH` *(client → server)* `{ op: "PUBLISH", topic, payload, opts? }` ^ref-e811123d-48-0
* `EVENT` *(server → client)* `{ op: "EVENT", topic, group, event, ctx: { attempt, ack_deadline_ms } }` ^ref-e811123d-49-0
* `ACK` / `NACK` *(client → server)* `{ op: "ACK"| "NACK", topic, group, id, reason? }` ^ref-e811123d-50-0
* `MODACK` *(client → server)* `{ op: "MODACK", topic, group, id, extend_ms }` (extend lease)
 ^ref-e811123d-52-0
Auth is pluggable (static token or JWT verify hook).

## 1b) WS Server
 ^ref-e811123d-56-0
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
^ref-e811123d-56-0
```

## 1c) Tiny WS client ^ref-e811123d-219-0

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
^ref-e811123d-219-0
}
```
 ^ref-e811123d-296-0
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
^ref-e811123d-296-0
  B-->>G: OK
  G-->>C: OK
```

--- ^ref-e811123d-318-0

# 2) Compaction + Snapshots

Use compaction for “latest by key” state streams, plus periodic snapshots. ^ref-e811123d-322-0

## 2a) Config

```ts
// shared/js/prom-lib/event/topics.ts
export const Topics = {
  HeartbeatReceived: "heartbeat.received",
^ref-e811123d-322-0
  ProcessState: "process.state",                 // compaction (key = processId)
  ProcessStateSnapshot: "process.state.snapshot" // snapshots
} as const;
```
^ref-e811123d-333-0

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

^ref-e811123d-333-0
  return () => { stopped = true; }; ^ref-e811123d-376-0
}
 ^ref-e811123d-378-0
function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); } ^ref-e811123d-379-0
^ref-e811123d-379-0
^ref-e811123d-376-0
```
^ref-e811123d-376-0
^ref-e811123d-379-0 ^ref-e811123d-385-0
^ref-e811123d-376-0 ^ref-e811123d-385-0
 ^ref-e811123d-387-0
*Mongo index hints:* ^ref-e811123d-385-0 ^ref-e811123d-387-0

* `events(topic, key, ts)` compound index (we already included) ^ref-e811123d-387-0
* TTL on raw event topics if you want to shed history (e.g., `expireAfterSeconds`). ^ref-e811123d-385-0

---

# 3) Prometheus metrics helper

Lightweight wrapper around `prom-client` (or a no-op if not installed).

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
^ref-e811123d-387-0
      res.set("Content-Type", reg.contentType);
      res.end(await reg.metrics());
    });
  }
}; ^ref-e811123d-437-0
^ref-e811123d-437-0
```
 ^ref-e811123d-443-0
**Hook points** you likely want (sprinkle in the bus and ws gateway): ^ref-e811123d-437-0
 ^ref-e811123d-443-0
* `events_published_total{topic}`
* `events_delivered_total{topic,group}` ^ref-e811123d-443-0 ^ref-e811123d-447-0
* `events_acked_total{topic,group}`
* `events_nacked_total{topic,group}` ^ref-e811123d-447-0
* `ws_inflight{topic,group}` ^ref-e811123d-443-0
* `delivery_latency_ms_bucket{topic,group}` (measure publish→ack if you carry a `t0` header) ^ref-e811123d-447-0

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
^ref-e811123d-447-0
  sid?: string;
  cpu_pct: number;
  mem_mb: number;
  last_seen_ts: number;
^ref-e811123d-473-0
  status: "alive" | "stale";
^ref-e811123d-473-0
^ref-e811123d-473-0
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
^ref-e811123d-473-0
        await publishState(ps);
      }
    }
  }, 5_000);
^ref-e811123d-533-0
 ^ref-e811123d-531-0
^ref-e811123d-533-0
^ref-e811123d-531-0
^ref-e811123d-533-0
^ref-e811123d-531-0
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
^ref-e811123d-533-0
      res.json({ id: rec.id });
    } catch (e: any) {
      res.status(500).json({ error: e.message ?? String(e) });
    }
^ref-e811123d-560-0
^ref-e811123d-560-0
^ref-e811123d-560-0
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

^ref-e811123d-560-0
  // sample heartbeat tick
  setInterval(() => {
    bus.publish(Topics.HeartbeatReceived, {
      pid: 1234, name: "stt", host: "local", cpu_pct: Math.random()*50, mem_mb: 200+Math.random()*50
^ref-e811123d-595-0
^ref-e811123d-595-0
^ref-e811123d-614-0 ^ref-e811123d-615-0
^ref-e811123d-613-0 ^ref-e811123d-616-0
^ref-e811123d-612-0 ^ref-e811123d-617-0
^ref-e811123d-595-0 ^ref-e811123d-618-0
    }); ^ref-e811123d-619-0
  }, 1000);
}
 ^ref-e811123d-612-0
main().catch((e) => { console.error(e); process.exit(1); });
```

---

# 7) Sibilant sugar (pseudocode)

```lisp
^ref-e811123d-595-0
; shared/sibilant/prom/ws.sib (pseudo)
(defn ws-auth [token] (if (= token (env "WS_TOKEN")) {:ok true} {:ok false :code "bad_token" :msg "no"}))

(defmacro with-ws-bus [bus port & body]
^ref-e811123d-618-0 ^ref-e811123d-619-0
^ref-e811123d-617-0
^ref-e811123d-616-0
^ref-e811123d-615-0
^ref-e811123d-614-0 ^ref-e811123d-623-0
^ref-e811123d-613-0
^ref-e811123d-628-0
^ref-e811123d-626-0
^ref-e811123d-625-0
^ref-e811123d-623-0
^ref-e811123d-619-0
^ref-e811123d-618-0
^ref-e811123d-617-0
^ref-e811123d-616-0
^ref-e811123d-640-0
^ref-e811123d-628-0
^ref-e811123d-626-0
^ref-e811123d-625-0
^ref-e811123d-623-0
^ref-e811123d-620-0
^ref-e811123d-615-0 ^ref-e811123d-640-0
^ref-e811123d-614-0
^ref-e811123d-613-0
  `((startWSGateway ~bus ~port {:auth ws-auth}) ^ref-e811123d-612-0 ^ref-e811123d-625-0
    ~@body)) ^ref-e811123d-613-0 ^ref-e811123d-626-0
 ^ref-e811123d-614-0
; usage: ^ref-e811123d-615-0 ^ref-e811123d-628-0
; (with-ws-bus bus 8090 ^ref-e811123d-616-0
;   (subscribe! bus "heartbeat.received" "ops" on-heartbeat :from "earliest")) ^ref-e811123d-617-0
``` ^ref-e811123d-618-0
 ^ref-e811123d-619-0
---

# 8) Quick Kanban checklist (dump to board)
 ^ref-e811123d-623-0
* [ ] Add `manualAck` to event bus and re-run tests
* [ ] Spin up WS gateway (`WS_PORT=8090 WS_TOKEN=devtoken node index.js`) ^ref-e811123d-625-0
* [ ] Write a smoke test: client subscribes, publish 10 msgs, assert all ACKed ^ref-e811123d-626-0
* [ ] Add Prometheus `events_*` counters in WS server hook points ^ref-e811123d-640-0
* [ ] Wire MongoEventStore + MongoCursorStore in place of InMemory ^ref-e811123d-628-0
* [ ] Enable compactor for `process.state` → `process.state.snapshot`
* [ ] Add snapshot consumer to warm cache on boot
* [ ] Expose `/metrics` on an express app and scrape with Prom

---

If you want **Part 3**, I’ll drop:

* a **Mongo-backed outbox** (transactional),
* **JWT auth** with scope-based ACLs (`topic:read`, `topic:write`),
* an **Ops dashboard** stub (HTTP) that shows cursors, inflight, and latest snapshots,
* and a **typed client SDK** for Node + browser.<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [Event Bus MVP](event-bus-mvp.md)
- [Mongo Outbox Implementation](mongo-outbox-implementation.md)
- [Promethean Event Bus MVP v0.1](promethean-event-bus-mvp-v0-1.md)
- [State Snapshots API and Transactional Projector](state-snapshots-api-and-transactional-projector.md)
- [Stateful Partitions and Rebalancing](stateful-partitions-and-rebalancing.md)
- [ecs-offload-workers](ecs-offload-workers.md)
- [Shared Package Structure](shared-package-structure.md)
- [schema-evolution-workflow](schema-evolution-workflow.md)
- [prom-lib-rate-limiters-and-replay-api](prom-lib-rate-limiters-and-replay-api.md)
- [Migrate to Provider-Tenant Architecture](migrate-to-provider-tenant-architecture.md)
- [Promethean Agent DSL TS Scaffold](promethean-agent-dsl-ts-scaffold.md)
- [Promethean Infrastructure Setup](promethean-infrastructure-setup.md)
- [shared-package-layout-clarification](shared-package-layout-clarification.md)
- [Services](chunks/services.md)
- [observability-infrastructure-setup](observability-infrastructure-setup.md)
- [Agent Tasks: Persistence Migration to DualStore](agent-tasks-persistence-migration-to-dualstore.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [archetype-ecs](archetype-ecs.md)
- [ecs-scheduler-and-prefabs](ecs-scheduler-and-prefabs.md)
- [Event Bus Projections Architecture](event-bus-projections-architecture.md)
- [JavaScript](chunks/javascript.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [Cross-Language Runtime Polymorphism](cross-language-runtime-polymorphism.md)
- [Unique Info Dump Index](unique-info-dump-index.md)
- [Prompt_Folder_Bootstrap](prompt-folder-bootstrap.md)
- [api-gateway-versioning](api-gateway-versioning.md)
- [aionian-circuit-math](aionian-circuit-math.md)
- [AI-Centric OS with MCP Layer](ai-centric-os-with-mcp-layer.md)
- [Diagrams](chunks/diagrams.md)
- [Agent Reflections and Prompt Evolution](agent-reflections-and-prompt-evolution.md)
- [heartbeat-fragment-demo](heartbeat-fragment-demo.md)
- [Admin Dashboard for User Management](admin-dashboard-for-user-management.md)
- [DSL](chunks/dsl.md)
- [Debugging Broker Connections and Agent Behavior](debugging-broker-connections-and-agent-behavior.md)
- [2d-sandbox-field](2d-sandbox-field.md)
- [Board Walk – 2025-08-11](board-walk-2025-08-11.md)
- [i3-config-validation-methods](i3-config-validation-methods.md)
- [Local-Only-LLM-Workflow](local-only-llm-workflow.md)
- [Tooling](chunks/tooling.md)
- [Per-Domain Policy System for JS Crawler](per-domain-policy-system-for-js-crawler.md)
- [Canonical Org-Babel Matplotlib Animation Template](canonical-org-babel-matplotlib-animation-template.md)
- [Promethean Agent Config DSL](promethean-agent-config-dsl.md)
- [Math Fundamentals](chunks/math-fundamentals.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [compiler-kit-foundations](compiler-kit-foundations.md)
- [field-interaction-equations](field-interaction-equations.md)
- [AI-First-OS-Model-Context-Protocol](ai-first-os-model-context-protocol.md)
- [balanced-bst](balanced-bst.md)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler](ollama-llm-provider-for-pseudo-code-transpiler.md)
- [Simulation Demo](chunks/simulation-demo.md)
- [Window Management](chunks/window-management.md)
- [Cross-Target Macro System in Sibilant](cross-target-macro-system-in-sibilant.md)
- [Lisp-Compiler-Integration](lisp-compiler-integration.md)
- [js-to-lisp-reverse-compiler](js-to-lisp-reverse-compiler.md)
- [Exception Layer Analysis](exception-layer-analysis.md)
- [Model Selection for Lightweight Conversational Tasks](model-selection-for-lightweight-conversational-tasks.md)
- [obsidian-ignore-node-modules-regex](obsidian-ignore-node-modules-regex.md)
- [polymorphic-meta-programming-engine](polymorphic-meta-programming-engine.md)
- [Shared](chunks/shared.md)
- [Matplotlib Animation with Async Execution](matplotlib-animation-with-async-execution.md)
- [markdown-to-org-transpiler](markdown-to-org-transpiler.md)
- [eidolon-node-lifecycle](eidolon-node-lifecycle.md)
- [EidolonField](eidolonfield.md)
- [Factorio AI with External Agents](factorio-ai-with-external-agents.md)
- [field-dynamics-math-blocks](field-dynamics-math-blocks.md)
- [field-node-diagram-outline](field-node-diagram-outline.md)
- [ParticleSimulationWithCanvasAndFFmpeg](particlesimulationwithcanvasandffmpeg.md)
- [Duck's Self-Referential Perceptual Loop](ducks-self-referential-perceptual-loop.md)
- [Eidolon Field Abstract Model](eidolon-field-abstract-model.md)
- [lisp-dsl-for-window-management](lisp-dsl-for-window-management.md)
- [Obsidian Templating Plugins Integration Guide](obsidian-templating-plugins-integration-guide.md)
- [Chroma-Embedding-Refactor](chroma-embedding-refactor.md)
- [Promethean-native config design](promethean-native-config-design.md)
- [Promethean Web UI Setup](promethean-web-ui-setup.md)
- [graph-ds](graph-ds.md)
- [promethean-system-diagrams](promethean-system-diagrams.md)
- [heartbeat-simulation-snippets](heartbeat-simulation-snippets.md)
- [field-node-diagram-set](field-node-diagram-set.md)
- [field-node-diagram-visualizations](field-node-diagram-visualizations.md)
- [Promethean_Eidolon_Synchronicity_Model](promethean-eidolon-synchronicity-model.md)
- [prompt-programming-language-lisp](prompt-programming-language-lisp.md)
- [Duck's Attractor States](ducks-attractor-states.md)
- [Board Automation Improvements](board-automation-improvements.md)
- [Operations](chunks/operations.md)
- [Creative Moments](creative-moments.md)
- [Fnord Tracer Protocol](fnord-tracer-protocol.md)
- [Post-Linguistic Transhuman Design Frameworks](post-linguistic-transhuman-design-frameworks.md)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop](polyglot-s-expr-bridge-python-js-lisp-interop.md)
- [Local-First Intention→Code Loop with Free Models](local-first-intention-code-loop-with-free-models.md)
- [Performance-Optimized-Polyglot-Bridge](performance-optimized-polyglot-bridge.md)
- [homeostasis-decay-formulas](homeostasis-decay-formulas.md)
- [i3-bluetooth-setup](i3-bluetooth-setup.md)
- [Voice Access Layer Design](voice-access-layer-design.md)
- [Language-Agnostic Mirror System](language-agnostic-mirror-system.md)
- [Provider-Agnostic Chat Panel Implementation](provider-agnostic-chat-panel-implementation.md)
- [layer-1-uptime-diagrams](layer-1-uptime-diagrams.md)
- [Pure-Node Crawl Stack with Playwright and Crawlee](pure-node-crawl-stack-with-playwright-and-crawlee.md)
- [Prometheus Observability Stack](prometheus-observability-stack.md)
- [Local-Offline-Model-Deployment-Strategy](local-offline-model-deployment-strategy.md)
- [ripple-propagation-demo](ripple-propagation-demo.md)
- [Lispy Macros with syntax-rules](lispy-macros-with-syntax-rules.md)
- [Promethean Workflow Optimization](promethean-workflow-optimization.md)
- [Protocol_0_The_Contradiction_Engine](protocol-0-the-contradiction-engine.md)
- [RAG UI Panel with Qdrant and PostgREST](rag-ui-panel-with-qdrant-and-postgrest.md)
- [Functional Embedding Pipeline Refactor](functional-embedding-pipeline-refactor.md)
- [Interop and Source Maps](interop-and-source-maps.md)
- [Pure TypeScript Search Microservice](pure-typescript-search-microservice.md)
- [Self-Agency in AI Interaction](self-agency-in-ai-interaction.md)
- [set-assignment-in-lisp-ast](set-assignment-in-lisp-ast.md)
- [sibilant-macro-targets](sibilant-macro-targets.md)
- [Sibilant Meta-Prompt DSL](sibilant-meta-prompt-dsl.md)
- [komorebi-group-window-hack](komorebi-group-window-hack.md)
- [DuckDuckGoSearchPipeline](duckduckgosearchpipeline.md)
- [Model Upgrade Calm-Down Guide](model-upgrade-calm-down-guide.md)
- [sibilant-metacompiler-overview](sibilant-metacompiler-overview.md)
- [universal-intention-code-fabric](universal-intention-code-fabric.md)
- [System Scheduler with Resource-Aware DAG](system-scheduler-with-resource-aware-dag.md)
- [TypeScript Patch for Tool Calling Support](typescript-patch-for-tool-calling-support.md)
- [plan-update-confirmation](plan-update-confirmation.md)
- [Universal Lisp Interface](universal-lisp-interface.md)
- [Layer1SurvivabilityEnvelope](layer1survivabilityenvelope.md)
- [typed-struct-compiler](typed-struct-compiler.md)
- [Promethean Pipelines: Local TypeScript-First Workflow](promethean-pipelines-local-typescript-first-workflow.md)
- [Vectorial Exception Descent](vectorial-exception-descent.md)
- [polyglot-repl-interface-layer](polyglot-repl-interface-layer.md)
- [pm2-orchestration-patterns](pm2-orchestration-patterns.md)
- [template-based-compilation](template-based-compilation.md)
- [Promethean Pipelines](promethean-pipelines.md)
- [Promethean State Format](promethean-state-format.md)
- [Refactor 05-footers.ts](refactor-05-footers-ts.md)
- [zero-copy-snapshots-and-workers](zero-copy-snapshots-and-workers.md)
## Sources
- [State Snapshots API and Transactional Projector — L177](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-177-0) (line 177, col 0, score 0.86)
- [State Snapshots API and Transactional Projector — L3](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-3-0) (line 3, col 0, score 0.66)
- [Stateful Partitions and Rebalancing — L3](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-3-0) (line 3, col 0, score 0.67)
- [prom-lib-rate-limiters-and-replay-api — L1](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-1-0) (line 1, col 0, score 0.67)
- [Mongo Outbox Implementation — L3](mongo-outbox-implementation.md#^ref-9c1acd1e-3-0) (line 3, col 0, score 0.65)
- [field-interaction-equations — L3](field-interaction-equations.md#^ref-b09141b7-3-0) (line 3, col 0, score 0.64)
- [observability-infrastructure-setup — L1](observability-infrastructure-setup.md#^ref-b4e64f8c-1-0) (line 1, col 0, score 0.64)
- [prom-lib-rate-limiters-and-replay-api — L329](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-329-0) (line 329, col 0, score 0.68)
- [schema-evolution-workflow — L3](schema-evolution-workflow.md#^ref-d8059b6a-3-0) (line 3, col 0, score 0.64)
- [Stateful Partitions and Rebalancing — L513](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-513-0) (line 513, col 0, score 0.69)
- [Event Bus MVP — L365](event-bus-mvp.md#^ref-534fe91d-365-0) (line 365, col 0, score 0.62)
- [Promethean Pipelines — L87](promethean-pipelines.md#^ref-8b8e6103-87-0) (line 87, col 0, score 0.63)
- [TypeScript Patch for Tool Calling Support — L181](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-181-0) (line 181, col 0, score 0.63)
- [Admin Dashboard for User Management — L45](admin-dashboard-for-user-management.md#^ref-2901a3e9-45-0) (line 45, col 0, score 0.56)
- [Agent Tasks: Persistence Migration to DualStore — L170](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-170-0) (line 170, col 0, score 0.56)
- [AI-Centric OS with MCP Layer — L416](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-416-0) (line 416, col 0, score 0.56)
- [AI-First-OS-Model-Context-Protocol — L11](ai-first-os-model-context-protocol.md#^ref-618198f4-11-0) (line 11, col 0, score 0.56)
- [aionian-circuit-math — L178](aionian-circuit-math.md#^ref-f2d83a77-178-0) (line 178, col 0, score 0.56)
- [api-gateway-versioning — L312](api-gateway-versioning.md#^ref-0580dcd3-312-0) (line 312, col 0, score 0.56)
- [balanced-bst — L297](balanced-bst.md#^ref-d3e7db72-297-0) (line 297, col 0, score 0.56)
- [Board Walk – 2025-08-11 — L131](board-walk-2025-08-11.md#^ref-7aa1eb92-131-0) (line 131, col 0, score 0.56)
- [Operations — L8](chunks/operations.md#^ref-f1add613-8-0) (line 8, col 0, score 0.56)
- [Event Bus MVP — L99](event-bus-mvp.md#^ref-534fe91d-99-0) (line 99, col 0, score 0.75)
- [Event Bus MVP — L471](event-bus-mvp.md#^ref-534fe91d-471-0) (line 471, col 0, score 0.73)
- [prom-lib-rate-limiters-and-replay-api — L282](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-282-0) (line 282, col 0, score 0.77)
- [Event Bus MVP — L258](event-bus-mvp.md#^ref-534fe91d-258-0) (line 258, col 0, score 0.8)
- [Stateful Partitions and Rebalancing — L101](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-101-0) (line 101, col 0, score 0.71)
- [Stateful Partitions and Rebalancing — L351](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-351-0) (line 351, col 0, score 0.63)
- [prom-lib-rate-limiters-and-replay-api — L260](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-260-0) (line 260, col 0, score 0.78)
- [Promethean Event Bus MVP v0.1 — L250](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-250-0) (line 250, col 0, score 0.64)
- [Promethean Event Bus MVP v0.1 — L604](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-604-0) (line 604, col 0, score 0.66)
- [prom-lib-rate-limiters-and-replay-api — L73](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-73-0) (line 73, col 0, score 0.65)
- [Promethean Event Bus MVP v0.1 — L149](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-149-0) (line 149, col 0, score 0.59)
- [Promethean Event Bus MVP v0.1 — L764](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-764-0) (line 764, col 0, score 0.71)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L7](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-7-0) (line 7, col 0, score 0.72)
- [Vectorial Exception Descent — L92](vectorial-exception-descent.md#^ref-d771154e-92-0) (line 92, col 0, score 0.64)
- [Promethean Event Bus MVP v0.1 — L825](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-825-0) (line 825, col 0, score 0.69)
- [Promethean Event Bus MVP v0.1 — L153](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-153-0) (line 153, col 0, score 0.67)
- [Agent Tasks: Persistence Migration to DualStore — L72](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-72-0) (line 72, col 0, score 0.63)
- [ecs-offload-workers — L435](ecs-offload-workers.md#^ref-6498b9d7-435-0) (line 435, col 0, score 0.72)
- [Vectorial Exception Descent — L60](vectorial-exception-descent.md#^ref-d771154e-60-0) (line 60, col 0, score 0.63)
- [Dynamic Context Model for Web Components — L187](dynamic-context-model-for-web-components.md#^ref-f7702bf8-187-0) (line 187, col 0, score 0.68)
- [Chroma-Embedding-Refactor — L64](chroma-embedding-refactor.md#^ref-8b256935-64-0) (line 64, col 0, score 0.65)
- [Chroma-Embedding-Refactor — L109](chroma-embedding-refactor.md#^ref-8b256935-109-0) (line 109, col 0, score 0.65)
- [Chroma-Embedding-Refactor — L258](chroma-embedding-refactor.md#^ref-8b256935-258-0) (line 258, col 0, score 0.65)
- [Chroma Toolkit Consolidation Plan — L72](chroma-toolkit-consolidation-plan.md#^ref-5020e892-72-0) (line 72, col 0, score 0.65)
- [Chroma Toolkit Consolidation Plan — L88](chroma-toolkit-consolidation-plan.md#^ref-5020e892-88-0) (line 88, col 0, score 0.65)
- [Chroma Toolkit Consolidation Plan — L107](chroma-toolkit-consolidation-plan.md#^ref-5020e892-107-0) (line 107, col 0, score 0.68)
- [Chroma Toolkit Consolidation Plan — L148](chroma-toolkit-consolidation-plan.md#^ref-5020e892-148-0) (line 148, col 0, score 0.65)
- [zero-copy-snapshots-and-workers — L363](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-363-0) (line 363, col 0, score 0.55)
- [Simulation Demo — L32](chunks/simulation-demo.md#^ref-557309a3-32-0) (line 32, col 0, score 1)
- [Tooling — L26](chunks/tooling.md#^ref-6cb4943e-26-0) (line 26, col 0, score 1)
- [Window Management — L36](chunks/window-management.md#^ref-9e8ae388-36-0) (line 36, col 0, score 1)
- [compiler-kit-foundations — L639](compiler-kit-foundations.md#^ref-01b21543-639-0) (line 639, col 0, score 1)
- [Creative Moments — L10](creative-moments.md#^ref-10d98225-10-0) (line 10, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L258](cross-language-runtime-polymorphism.md#^ref-c34c36a6-258-0) (line 258, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L215](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-215-0) (line 215, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L50](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-50-0) (line 50, col 0, score 1)
- [prom-lib-rate-limiters-and-replay-api — L88](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-88-0) (line 88, col 0, score 0.65)
- [Chroma Toolkit Consolidation Plan — L58](chroma-toolkit-consolidation-plan.md#^ref-5020e892-58-0) (line 58, col 0, score 0.64)
- [Voice Access Layer Design — L115](voice-access-layer-design.md#^ref-543ed9b3-115-0) (line 115, col 0, score 0.66)
- [Promethean-native config design — L32](promethean-native-config-design.md#^ref-ab748541-32-0) (line 32, col 0, score 0.64)
- [Promethean-native config design — L33](promethean-native-config-design.md#^ref-ab748541-33-0) (line 33, col 0, score 0.64)
- [Promethean-native config design — L35](promethean-native-config-design.md#^ref-ab748541-35-0) (line 35, col 0, score 0.64)
- [Chroma Toolkit Consolidation Plan — L162](chroma-toolkit-consolidation-plan.md#^ref-5020e892-162-0) (line 162, col 0, score 0.64)
- [template-based-compilation — L21](template-based-compilation.md#^ref-f8877e5e-21-0) (line 21, col 0, score 0.63)
- [Promethean Event Bus MVP v0.1 — L259](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-259-0) (line 259, col 0, score 0.62)
- [Migrate to Provider-Tenant Architecture — L44](migrate-to-provider-tenant-architecture.md#^ref-54382370-44-0) (line 44, col 0, score 0.58)
- [Migrate to Provider-Tenant Architecture — L87](migrate-to-provider-tenant-architecture.md#^ref-54382370-87-0) (line 87, col 0, score 0.65)
- [Migrate to Provider-Tenant Architecture — L254](migrate-to-provider-tenant-architecture.md#^ref-54382370-254-0) (line 254, col 0, score 0.65)
- [Migrate to Provider-Tenant Architecture — L61](migrate-to-provider-tenant-architecture.md#^ref-54382370-61-0) (line 61, col 0, score 0.64)
- [Chroma-Embedding-Refactor — L331](chroma-embedding-refactor.md#^ref-8b256935-331-0) (line 331, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L167](chroma-toolkit-consolidation-plan.md#^ref-5020e892-167-0) (line 167, col 0, score 0.64)
- [Cross-Language Runtime Polymorphism — L214](cross-language-runtime-polymorphism.md#^ref-c34c36a6-214-0) (line 214, col 0, score 1)
- [Mongo Outbox Implementation — L535](mongo-outbox-implementation.md#^ref-9c1acd1e-535-0) (line 535, col 0, score 0.65)
- [Mongo Outbox Implementation — L222](mongo-outbox-implementation.md#^ref-9c1acd1e-222-0) (line 222, col 0, score 0.63)
- [Chroma Toolkit Consolidation Plan — L146](chroma-toolkit-consolidation-plan.md#^ref-5020e892-146-0) (line 146, col 0, score 0.6)
- [Mongo Outbox Implementation — L307](mongo-outbox-implementation.md#^ref-9c1acd1e-307-0) (line 307, col 0, score 0.58)
- [Promethean Web UI Setup — L44](promethean-web-ui-setup.md#^ref-bc5172ca-44-0) (line 44, col 0, score 0.69)
- [Mongo Outbox Implementation — L303](mongo-outbox-implementation.md#^ref-9c1acd1e-303-0) (line 303, col 0, score 0.69)
- [Promethean Web UI Setup — L40](promethean-web-ui-setup.md#^ref-bc5172ca-40-0) (line 40, col 0, score 0.67)
- [Mongo Outbox Implementation — L451](mongo-outbox-implementation.md#^ref-9c1acd1e-451-0) (line 451, col 0, score 0.65)
- [plan-update-confirmation — L640](plan-update-confirmation.md#^ref-b22d79c6-640-0) (line 640, col 0, score 0.65)
- [RAG UI Panel with Qdrant and PostgREST — L356](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-356-0) (line 356, col 0, score 0.65)
- [plan-update-confirmation — L986](plan-update-confirmation.md#^ref-b22d79c6-986-0) (line 986, col 0, score 0.58)
- [Chroma Toolkit Consolidation Plan — L137](chroma-toolkit-consolidation-plan.md#^ref-5020e892-137-0) (line 137, col 0, score 0.69)
- [Promethean Event Bus MVP v0.1 — L697](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-697-0) (line 697, col 0, score 0.7)
- [Mongo Outbox Implementation — L381](mongo-outbox-implementation.md#^ref-9c1acd1e-381-0) (line 381, col 0, score 0.75)
- [Event Bus MVP — L7](event-bus-mvp.md#^ref-534fe91d-7-0) (line 7, col 0, score 0.76)
- [Promethean Event Bus MVP v0.1 — L294](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-294-0) (line 294, col 0, score 0.75)
- [State Snapshots API and Transactional Projector — L93](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-93-0) (line 93, col 0, score 0.73)
- [State Snapshots API and Transactional Projector — L248](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-248-0) (line 248, col 0, score 0.84)
- [Stateful Partitions and Rebalancing — L267](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-267-0) (line 267, col 0, score 0.74)
- [schema-evolution-workflow — L161](schema-evolution-workflow.md#^ref-d8059b6a-161-0) (line 161, col 0, score 0.73)
- [Stateful Partitions and Rebalancing — L166](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-166-0) (line 166, col 0, score 0.7)
- [schema-evolution-workflow — L71](schema-evolution-workflow.md#^ref-d8059b6a-71-0) (line 71, col 0, score 0.75)
- [schema-evolution-workflow — L146](schema-evolution-workflow.md#^ref-d8059b6a-146-0) (line 146, col 0, score 0.7)
- [schema-evolution-workflow — L243](schema-evolution-workflow.md#^ref-d8059b6a-243-0) (line 243, col 0, score 0.77)
- [Mongo Outbox Implementation — L11](mongo-outbox-implementation.md#^ref-9c1acd1e-11-0) (line 11, col 0, score 0.71)
- [Stateful Partitions and Rebalancing — L202](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-202-0) (line 202, col 0, score 0.67)
- [Mongo Outbox Implementation — L323](mongo-outbox-implementation.md#^ref-9c1acd1e-323-0) (line 323, col 0, score 0.74)
- [Event Bus MVP — L284](event-bus-mvp.md#^ref-534fe91d-284-0) (line 284, col 0, score 0.74)
- [Promethean Event Bus MVP v0.1 — L222](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-222-0) (line 222, col 0, score 0.67)
- [Stateful Partitions and Rebalancing — L511](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-511-0) (line 511, col 0, score 0.64)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L132](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-132-0) (line 132, col 0, score 0.72)
- [Local-First Intention→Code Loop with Free Models — L47](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-47-0) (line 47, col 0, score 0.65)
- [Mongo Outbox Implementation — L286](mongo-outbox-implementation.md#^ref-9c1acd1e-286-0) (line 286, col 0, score 0.6)
- [Functional Embedding Pipeline Refactor — L31](functional-embedding-pipeline-refactor.md#^ref-a4a25141-31-0) (line 31, col 0, score 0.67)
- [Performance-Optimized-Polyglot-Bridge — L170](performance-optimized-polyglot-bridge.md#^ref-f5579967-170-0) (line 170, col 0, score 0.71)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L194](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-194-0) (line 194, col 0, score 0.64)
- [prom-lib-rate-limiters-and-replay-api — L63](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-63-0) (line 63, col 0, score 0.67)
- [State Snapshots API and Transactional Projector — L179](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-179-0) (line 179, col 0, score 0.63)
- [prom-lib-rate-limiters-and-replay-api — L106](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-106-0) (line 106, col 0, score 0.75)
- [compiler-kit-foundations — L359](compiler-kit-foundations.md#^ref-01b21543-359-0) (line 359, col 0, score 0.64)
- [prom-lib-rate-limiters-and-replay-api — L226](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-226-0) (line 226, col 0, score 0.72)
- [ecs-scheduler-and-prefabs — L7](ecs-scheduler-and-prefabs.md#^ref-c62a1815-7-0) (line 7, col 0, score 0.61)
- [System Scheduler with Resource-Aware DAG — L5](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-5-0) (line 5, col 0, score 0.61)
- [Promethean Event Bus MVP v0.1 — L197](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-197-0) (line 197, col 0, score 0.66)
- [Promethean Event Bus MVP v0.1 — L186](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-186-0) (line 186, col 0, score 0.65)
- [Promethean Event Bus MVP v0.1 — L333](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-333-0) (line 333, col 0, score 0.63)
- [Promethean Event Bus MVP v0.1 — L166](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-166-0) (line 166, col 0, score 0.62)
- [Promethean Event Bus MVP v0.1 — L248](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-248-0) (line 248, col 0, score 0.62)
- [Promethean Event Bus MVP v0.1 — L168](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-168-0) (line 168, col 0, score 0.62)
- [prom-lib-rate-limiters-and-replay-api — L354](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-354-0) (line 354, col 0, score 0.62)
- [Promethean Event Bus MVP v0.1 — L423](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-423-0) (line 423, col 0, score 0.71)
- [Lisp-Compiler-Integration — L291](lisp-compiler-integration.md#^ref-cfee6d36-291-0) (line 291, col 0, score 0.67)
- [Interop and Source Maps — L319](interop-and-source-maps.md#^ref-cdfac40c-319-0) (line 319, col 0, score 0.65)
- [js-to-lisp-reverse-compiler — L13](js-to-lisp-reverse-compiler.md#^ref-58191024-13-0) (line 13, col 0, score 0.65)
- [Lisp-Compiler-Integration — L27](lisp-compiler-integration.md#^ref-cfee6d36-27-0) (line 27, col 0, score 0.65)
- [Per-Domain Policy System for JS Crawler — L141](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-141-0) (line 141, col 0, score 0.65)
- [compiler-kit-foundations — L50](compiler-kit-foundations.md#^ref-01b21543-50-0) (line 50, col 0, score 0.65)
- [Cross-Target Macro System in Sibilant — L21](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-21-0) (line 21, col 0, score 0.64)
- [Language-Agnostic Mirror System — L151](language-agnostic-mirror-system.md#^ref-d2b3628c-151-0) (line 151, col 0, score 0.64)
- [ecs-offload-workers — L169](ecs-offload-workers.md#^ref-6498b9d7-169-0) (line 169, col 0, score 0.68)
- [Provider-Agnostic Chat Panel Implementation — L183](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-183-0) (line 183, col 0, score 0.76)
- [ecs-offload-workers — L39](ecs-offload-workers.md#^ref-6498b9d7-39-0) (line 39, col 0, score 0.73)
- [ecs-offload-workers — L397](ecs-offload-workers.md#^ref-6498b9d7-397-0) (line 397, col 0, score 0.71)
- [Promethean Web UI Setup — L351](promethean-web-ui-setup.md#^ref-bc5172ca-351-0) (line 351, col 0, score 0.67)
- [Promethean Event Bus MVP v0.1 — L235](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-235-0) (line 235, col 0, score 0.73)
- [Cross-Language Runtime Polymorphism — L38](cross-language-runtime-polymorphism.md#^ref-c34c36a6-38-0) (line 38, col 0, score 0.71)
- [ecs-offload-workers — L75](ecs-offload-workers.md#^ref-6498b9d7-75-0) (line 75, col 0, score 0.71)
- [TypeScript Patch for Tool Calling Support — L67](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-67-0) (line 67, col 0, score 0.7)
- [Provider-Agnostic Chat Panel Implementation — L84](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-84-0) (line 84, col 0, score 0.7)
- [Promethean Event Bus MVP v0.1 — L28](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-28-0) (line 28, col 0, score 0.71)
- [Promethean Event Bus MVP v0.1 — L740](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-740-0) (line 740, col 0, score 0.68)
- [State Snapshots API and Transactional Projector — L162](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-162-0) (line 162, col 0, score 0.78)
- [Event Bus MVP — L434](event-bus-mvp.md#^ref-534fe91d-434-0) (line 434, col 0, score 0.75)
- [schema-evolution-workflow — L224](schema-evolution-workflow.md#^ref-d8059b6a-224-0) (line 224, col 0, score 0.62)
- [Stateful Partitions and Rebalancing — L328](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-328-0) (line 328, col 0, score 0.66)
- [layer-1-uptime-diagrams — L122](layer-1-uptime-diagrams.md#^ref-4127189a-122-0) (line 122, col 0, score 0.71)
- [Fnord Tracer Protocol — L214](fnord-tracer-protocol.md#^ref-fc21f824-214-0) (line 214, col 0, score 0.7)
- [Exception Layer Analysis — L34](exception-layer-analysis.md#^ref-21d5cc09-34-0) (line 34, col 0, score 0.65)
- [Promethean Event Bus MVP v0.1 — L832](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-832-0) (line 832, col 0, score 0.65)
- [Event Bus Projections Architecture — L108](event-bus-projections-architecture.md#^ref-cf6b9b17-108-0) (line 108, col 0, score 0.65)
- [Board Walk – 2025-08-11 — L90](board-walk-2025-08-11.md#^ref-7aa1eb92-90-0) (line 90, col 0, score 0.63)
- [Migrate to Provider-Tenant Architecture — L138](migrate-to-provider-tenant-architecture.md#^ref-54382370-138-0) (line 138, col 0, score 0.68)
- [Event Bus MVP — L532](event-bus-mvp.md#^ref-534fe91d-532-0) (line 532, col 0, score 0.71)
- [Event Bus MVP — L359](event-bus-mvp.md#^ref-534fe91d-359-0) (line 359, col 0, score 0.69)
- [Promethean Event Bus MVP v0.1 — L371](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-371-0) (line 371, col 0, score 0.71)
- [prom-lib-rate-limiters-and-replay-api — L326](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-326-0) (line 326, col 0, score 0.71)
- [Event Bus MVP — L536](event-bus-mvp.md#^ref-534fe91d-536-0) (line 536, col 0, score 0.68)
- [Mongo Outbox Implementation — L321](mongo-outbox-implementation.md#^ref-9c1acd1e-321-0) (line 321, col 0, score 0.66)
- [Stateful Partitions and Rebalancing — L342](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-342-0) (line 342, col 0, score 0.68)
- [Event Bus MVP — L370](event-bus-mvp.md#^ref-534fe91d-370-0) (line 370, col 0, score 0.92)
- [Shared Package Structure — L117](shared-package-structure.md#^ref-66a72fc3-117-0) (line 117, col 0, score 0.79)
- [schema-evolution-workflow — L9](schema-evolution-workflow.md#^ref-d8059b6a-9-0) (line 9, col 0, score 0.78)
- [Stateful Partitions and Rebalancing — L290](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-290-0) (line 290, col 0, score 0.71)
- [State Snapshots API and Transactional Projector — L218](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-218-0) (line 218, col 0, score 0.77)
- [sibilant-metacompiler-overview — L51](sibilant-metacompiler-overview.md#^ref-61d4086b-51-0) (line 51, col 0, score 0.72)
- [Promethean Event Bus MVP v0.1 — L510](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-510-0) (line 510, col 0, score 0.66)
- [schema-evolution-workflow — L201](schema-evolution-workflow.md#^ref-d8059b6a-201-0) (line 201, col 0, score 0.75)
- [State Snapshots API and Transactional Projector — L9](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-9-0) (line 9, col 0, score 0.62)
- [Promethean Event Bus MVP v0.1 — L747](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-747-0) (line 747, col 0, score 0.73)
- [Mongo Outbox Implementation — L74](mongo-outbox-implementation.md#^ref-9c1acd1e-74-0) (line 74, col 0, score 0.73)
- [schema-evolution-workflow — L393](schema-evolution-workflow.md#^ref-d8059b6a-393-0) (line 393, col 0, score 0.7)
- [Per-Domain Policy System for JS Crawler — L184](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-184-0) (line 184, col 0, score 0.65)
- [ecs-offload-workers — L359](ecs-offload-workers.md#^ref-6498b9d7-359-0) (line 359, col 0, score 0.64)
- [plan-update-confirmation — L623](plan-update-confirmation.md#^ref-b22d79c6-623-0) (line 623, col 0, score 0.63)
- [plan-update-confirmation — L556](plan-update-confirmation.md#^ref-b22d79c6-556-0) (line 556, col 0, score 0.63)
- [Language-Agnostic Mirror System — L237](language-agnostic-mirror-system.md#^ref-d2b3628c-237-0) (line 237, col 0, score 0.62)
- [ecs-scheduler-and-prefabs — L246](ecs-scheduler-and-prefabs.md#^ref-c62a1815-246-0) (line 246, col 0, score 0.62)
- [System Scheduler with Resource-Aware DAG — L244](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-244-0) (line 244, col 0, score 0.62)
- [plan-update-confirmation — L474](plan-update-confirmation.md#^ref-b22d79c6-474-0) (line 474, col 0, score 0.62)
- [plan-update-confirmation — L540](plan-update-confirmation.md#^ref-b22d79c6-540-0) (line 540, col 0, score 0.62)
- [Refactor 05-footers.ts — L8](refactor-05-footers-ts.md#^ref-80d4d883-8-0) (line 8, col 0, score 0.62)
- [Stateful Partitions and Rebalancing — L514](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-514-0) (line 514, col 0, score 0.67)
- [Promethean Event Bus MVP v0.1 — L340](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-340-0) (line 340, col 0, score 0.71)
- [Promethean Event Bus MVP v0.1 — L102](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-102-0) (line 102, col 0, score 0.76)
- [Chroma Toolkit Consolidation Plan — L122](chroma-toolkit-consolidation-plan.md#^ref-5020e892-122-0) (line 122, col 0, score 0.68)
- [Chroma Toolkit Consolidation Plan — L159](chroma-toolkit-consolidation-plan.md#^ref-5020e892-159-0) (line 159, col 0, score 0.68)
- [Chroma Toolkit Consolidation Plan — L66](chroma-toolkit-consolidation-plan.md#^ref-5020e892-66-0) (line 66, col 0, score 0.67)
- [Chroma Toolkit Consolidation Plan — L130](chroma-toolkit-consolidation-plan.md#^ref-5020e892-130-0) (line 130, col 0, score 0.66)
- [Stateful Partitions and Rebalancing — L164](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-164-0) (line 164, col 0, score 0.66)
- [Migrate to Provider-Tenant Architecture — L162](migrate-to-provider-tenant-architecture.md#^ref-54382370-162-0) (line 162, col 0, score 0.74)
- [prom-lib-rate-limiters-and-replay-api — L178](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-178-0) (line 178, col 0, score 0.7)
- [State Snapshots API and Transactional Projector — L83](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-83-0) (line 83, col 0, score 0.67)
- [Migrate to Provider-Tenant Architecture — L160](migrate-to-provider-tenant-architecture.md#^ref-54382370-160-0) (line 160, col 0, score 0.64)
- [Migrate to Provider-Tenant Architecture — L66](migrate-to-provider-tenant-architecture.md#^ref-54382370-66-0) (line 66, col 0, score 0.62)
- [Voice Access Layer Design — L103](voice-access-layer-design.md#^ref-543ed9b3-103-0) (line 103, col 0, score 0.62)
- [Chroma-Embedding-Refactor — L26](chroma-embedding-refactor.md#^ref-8b256935-26-0) (line 26, col 0, score 0.67)
- [Agent Reflections and Prompt Evolution — L101](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-101-0) (line 101, col 0, score 0.62)
- [Migrate to Provider-Tenant Architecture — L141](migrate-to-provider-tenant-architecture.md#^ref-54382370-141-0) (line 141, col 0, score 0.72)
- [Promethean Event Bus MVP v0.1 — L119](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-119-0) (line 119, col 0, score 0.72)
- [prom-lib-rate-limiters-and-replay-api — L335](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-335-0) (line 335, col 0, score 0.69)
- [prom-lib-rate-limiters-and-replay-api — L337](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-337-0) (line 337, col 0, score 0.69)
- [Voice Access Layer Design — L214](voice-access-layer-design.md#^ref-543ed9b3-214-0) (line 214, col 0, score 0.67)
- [prom-lib-rate-limiters-and-replay-api — L332](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-332-0) (line 332, col 0, score 0.65)
- [prom-lib-rate-limiters-and-replay-api — L369](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-369-0) (line 369, col 0, score 0.63)
- [prom-lib-rate-limiters-and-replay-api — L342](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-342-0) (line 342, col 0, score 0.61)
- [Universal Lisp Interface — L175](universal-lisp-interface.md#^ref-b01856b4-175-0) (line 175, col 0, score 0.7)
- [pm2-orchestration-patterns — L79](pm2-orchestration-patterns.md#^ref-51932e7b-79-0) (line 79, col 0, score 0.63)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L332](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-332-0) (line 332, col 0, score 0.62)
- [Model Selection for Lightweight Conversational Tasks — L103](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-103-0) (line 103, col 0, score 0.62)
- [Cross-Language Runtime Polymorphism — L76](cross-language-runtime-polymorphism.md#^ref-c34c36a6-76-0) (line 76, col 0, score 0.6)
- [Migrate to Provider-Tenant Architecture — L105](migrate-to-provider-tenant-architecture.md#^ref-54382370-105-0) (line 105, col 0, score 0.59)
- [universal-intention-code-fabric — L406](universal-intention-code-fabric.md#^ref-c14edce7-406-0) (line 406, col 0, score 0.6)
- [Mongo Outbox Implementation — L379](mongo-outbox-implementation.md#^ref-9c1acd1e-379-0) (line 379, col 0, score 0.73)
- [Cross-Language Runtime Polymorphism — L183](cross-language-runtime-polymorphism.md#^ref-c34c36a6-183-0) (line 183, col 0, score 0.6)
- [Promethean Event Bus MVP v0.1 — L733](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-733-0) (line 733, col 0, score 0.66)
- [universal-intention-code-fabric — L252](universal-intention-code-fabric.md#^ref-c14edce7-252-0) (line 252, col 0, score 0.71)
- [ecs-offload-workers — L187](ecs-offload-workers.md#^ref-6498b9d7-187-0) (line 187, col 0, score 0.71)
- [Promethean Agent DSL TS Scaffold — L488](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-488-0) (line 488, col 0, score 0.68)
- [compiler-kit-foundations — L166](compiler-kit-foundations.md#^ref-01b21543-166-0) (line 166, col 0, score 0.7)
- [universal-intention-code-fabric — L68](universal-intention-code-fabric.md#^ref-c14edce7-68-0) (line 68, col 0, score 0.7)
- [Promethean Agent DSL TS Scaffold — L223](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-223-0) (line 223, col 0, score 0.66)
- [compiler-kit-foundations — L31](compiler-kit-foundations.md#^ref-01b21543-31-0) (line 31, col 0, score 0.68)
- [ecs-offload-workers — L306](ecs-offload-workers.md#^ref-6498b9d7-306-0) (line 306, col 0, score 0.68)
- [prom-lib-rate-limiters-and-replay-api — L45](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-45-0) (line 45, col 0, score 0.68)
- [universal-intention-code-fabric — L127](universal-intention-code-fabric.md#^ref-c14edce7-127-0) (line 127, col 0, score 0.68)
- [Layer1SurvivabilityEnvelope — L148](layer1survivabilityenvelope.md#^ref-64a9f9f9-148-0) (line 148, col 0, score 0.67)
- [Promethean Infrastructure Setup — L224](promethean-infrastructure-setup.md#^ref-6deed6ac-224-0) (line 224, col 0, score 0.67)
- [Pure TypeScript Search Microservice — L378](pure-typescript-search-microservice.md#^ref-d17d3a96-378-0) (line 378, col 0, score 0.65)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L130](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-130-0) (line 130, col 0, score 0.64)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L223](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-223-0) (line 223, col 0, score 0.64)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L178](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-178-0) (line 178, col 0, score 0.64)
- [ecs-offload-workers — L434](ecs-offload-workers.md#^ref-6498b9d7-434-0) (line 434, col 0, score 0.7)
- [Mongo Outbox Implementation — L449](mongo-outbox-implementation.md#^ref-9c1acd1e-449-0) (line 449, col 0, score 0.59)
- [Promethean Event Bus MVP v0.1 — L3](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-3-0) (line 3, col 0, score 0.64)
- [prom-lib-rate-limiters-and-replay-api — L364](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-364-0) (line 364, col 0, score 0.72)
- [Lisp-Compiler-Integration — L521](lisp-compiler-integration.md#^ref-cfee6d36-521-0) (line 521, col 0, score 0.58)
- [Model Selection for Lightweight Conversational Tasks — L88](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-88-0) (line 88, col 0, score 0.58)
- [prom-lib-rate-limiters-and-replay-api — L43](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-43-0) (line 43, col 0, score 0.73)
- [obsidian-ignore-node-modules-regex — L12](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-12-0) (line 12, col 0, score 0.58)
- [Promethean Event Bus MVP v0.1 — L287](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-287-0) (line 287, col 0, score 0.69)
- [Promethean Event Bus MVP v0.1 — L143](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-143-0) (line 143, col 0, score 0.78)
- [Promethean Event Bus MVP v0.1 — L141](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-141-0) (line 141, col 0, score 0.72)
- [Promethean Event Bus MVP v0.1 — L809](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-809-0) (line 809, col 0, score 0.69)
- [Migrate to Provider-Tenant Architecture — L179](migrate-to-provider-tenant-architecture.md#^ref-54382370-179-0) (line 179, col 0, score 0.66)
- [universal-intention-code-fabric — L27](universal-intention-code-fabric.md#^ref-c14edce7-27-0) (line 27, col 0, score 0.65)
- [api-gateway-versioning — L278](api-gateway-versioning.md#^ref-0580dcd3-278-0) (line 278, col 0, score 0.73)
- [Stateful Partitions and Rebalancing — L344](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-344-0) (line 344, col 0, score 0.69)
- [Promethean Event Bus MVP v0.1 — L350](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-350-0) (line 350, col 0, score 0.68)
- [schema-evolution-workflow — L469](schema-evolution-workflow.md#^ref-d8059b6a-469-0) (line 469, col 0, score 0.66)
- [Promethean Agent Config DSL — L143](promethean-agent-config-dsl.md#^ref-2c00ce45-143-0) (line 143, col 0, score 0.66)
- [Dynamic Context Model for Web Components — L149](dynamic-context-model-for-web-components.md#^ref-f7702bf8-149-0) (line 149, col 0, score 0.66)
- [State Snapshots API and Transactional Projector — L216](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-216-0) (line 216, col 0, score 0.64)
- [js-to-lisp-reverse-compiler — L384](js-to-lisp-reverse-compiler.md#^ref-58191024-384-0) (line 384, col 0, score 0.64)
- [Voice Access Layer Design — L204](voice-access-layer-design.md#^ref-543ed9b3-204-0) (line 204, col 0, score 0.64)
- [Stateful Partitions and Rebalancing — L417](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-417-0) (line 417, col 0, score 0.78)
- [prom-lib-rate-limiters-and-replay-api — L186](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-186-0) (line 186, col 0, score 0.72)
- [Promethean Agent DSL TS Scaffold — L215](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-215-0) (line 215, col 0, score 0.72)
- [plan-update-confirmation — L650](plan-update-confirmation.md#^ref-b22d79c6-650-0) (line 650, col 0, score 0.7)
- [plan-update-confirmation — L662](plan-update-confirmation.md#^ref-b22d79c6-662-0) (line 662, col 0, score 0.7)
- [plan-update-confirmation — L674](plan-update-confirmation.md#^ref-b22d79c6-674-0) (line 674, col 0, score 0.7)
- [State Snapshots API and Transactional Projector — L132](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-132-0) (line 132, col 0, score 0.76)
- [Mongo Outbox Implementation — L37](mongo-outbox-implementation.md#^ref-9c1acd1e-37-0) (line 37, col 0, score 0.75)
- [State Snapshots API and Transactional Projector — L280](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-280-0) (line 280, col 0, score 0.75)
- [Functional Embedding Pipeline Refactor — L24](functional-embedding-pipeline-refactor.md#^ref-a4a25141-24-0) (line 24, col 0, score 0.67)
- [Functional Embedding Pipeline Refactor — L302](functional-embedding-pipeline-refactor.md#^ref-a4a25141-302-0) (line 302, col 0, score 0.67)
- [schema-evolution-workflow — L29](schema-evolution-workflow.md#^ref-d8059b6a-29-0) (line 29, col 0, score 0.63)
- [balanced-bst — L3](balanced-bst.md#^ref-d3e7db72-3-0) (line 3, col 0, score 0.63)
- [Local-First Intention→Code Loop with Free Models — L121](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-121-0) (line 121, col 0, score 0.62)
- [polymorphic-meta-programming-engine — L50](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-50-0) (line 50, col 0, score 0.62)
- [Performance-Optimized-Polyglot-Bridge — L14](performance-optimized-polyglot-bridge.md#^ref-f5579967-14-0) (line 14, col 0, score 0.61)
- [Agent Tasks: Persistence Migration to DualStore — L84](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-84-0) (line 84, col 0, score 0.66)
- [Agent Tasks: Persistence Migration to DualStore — L26](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-26-0) (line 26, col 0, score 0.64)
- [plan-update-confirmation — L447](plan-update-confirmation.md#^ref-b22d79c6-447-0) (line 447, col 0, score 0.63)
- [aionian-circuit-math — L57](aionian-circuit-math.md#^ref-f2d83a77-57-0) (line 57, col 0, score 0.63)
- [Board Walk – 2025-08-11 — L93](board-walk-2025-08-11.md#^ref-7aa1eb92-93-0) (line 93, col 0, score 0.62)
- [Promethean State Format — L26](promethean-state-format.md#^ref-23df6ddb-26-0) (line 26, col 0, score 0.62)
- [plan-update-confirmation — L406](plan-update-confirmation.md#^ref-b22d79c6-406-0) (line 406, col 0, score 0.62)
- [Local-First Intention→Code Loop with Free Models — L120](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-120-0) (line 120, col 0, score 0.62)
- [AI-Centric OS with MCP Layer — L277](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-277-0) (line 277, col 0, score 0.62)
- [Language-Agnostic Mirror System — L526](language-agnostic-mirror-system.md#^ref-d2b3628c-526-0) (line 526, col 0, score 0.59)
- [universal-intention-code-fabric — L26](universal-intention-code-fabric.md#^ref-c14edce7-26-0) (line 26, col 0, score 0.56)
- [Migrate to Provider-Tenant Architecture — L69](migrate-to-provider-tenant-architecture.md#^ref-54382370-69-0) (line 69, col 0, score 0.56)
- [js-to-lisp-reverse-compiler — L406](js-to-lisp-reverse-compiler.md#^ref-58191024-406-0) (line 406, col 0, score 0.55)
- [Local-Only-LLM-Workflow — L165](local-only-llm-workflow.md#^ref-9a8ab57e-165-0) (line 165, col 0, score 0.54)
- [Interop and Source Maps — L503](interop-and-source-maps.md#^ref-cdfac40c-503-0) (line 503, col 0, score 0.54)
- [i3-config-validation-methods — L34](i3-config-validation-methods.md#^ref-d28090ac-34-0) (line 34, col 0, score 0.54)
- [Promethean Infrastructure Setup — L456](promethean-infrastructure-setup.md#^ref-6deed6ac-456-0) (line 456, col 0, score 0.7)
- [Stateful Partitions and Rebalancing — L448](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-448-0) (line 448, col 0, score 0.71)
- [Promethean Event Bus MVP v0.1 — L787](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-787-0) (line 787, col 0, score 0.7)
- [Event Bus MVP — L509](event-bus-mvp.md#^ref-534fe91d-509-0) (line 509, col 0, score 0.77)
- [schema-evolution-workflow — L450](schema-evolution-workflow.md#^ref-d8059b6a-450-0) (line 450, col 0, score 0.75)
- [Stateful Partitions and Rebalancing — L499](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-499-0) (line 499, col 0, score 0.75)
- [archetype-ecs — L441](archetype-ecs.md#^ref-8f4c1e86-441-0) (line 441, col 0, score 0.71)
- [State Snapshots API and Transactional Projector — L303](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-303-0) (line 303, col 0, score 0.7)
- [ecs-scheduler-and-prefabs — L368](ecs-scheduler-and-prefabs.md#^ref-c62a1815-368-0) (line 368, col 0, score 0.7)
- [System Scheduler with Resource-Aware DAG — L366](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-366-0) (line 366, col 0, score 0.7)
- [graph-ds — L343](graph-ds.md#^ref-6620e2f2-343-0) (line 343, col 0, score 0.69)
- [Mongo Outbox Implementation — L516](mongo-outbox-implementation.md#^ref-9c1acd1e-516-0) (line 516, col 0, score 0.69)
- [Model Selection for Lightweight Conversational Tasks — L77](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-77-0) (line 77, col 0, score 0.67)
- [polyglot-repl-interface-layer — L146](polyglot-repl-interface-layer.md#^ref-9c79206d-146-0) (line 146, col 0, score 0.65)
- [2d-sandbox-field — L182](2d-sandbox-field.md#^ref-c710dc93-182-0) (line 182, col 0, score 0.65)
- [Agent Tasks: Persistence Migration to DualStore — L8](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-8-0) (line 8, col 0, score 0.66)
- [Shared — L3](chunks/shared.md#^ref-623a55f7-3-0) (line 3, col 0, score 0.68)
- [Diagrams — L3](chunks/diagrams.md#^ref-45cd25b5-3-0) (line 3, col 0, score 0.66)
- [Unique Info Dump Index — L32](unique-info-dump-index.md#^ref-30ec3ba6-32-0) (line 32, col 0, score 0.66)
- [Per-Domain Policy System for JS Crawler — L115](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-115-0) (line 115, col 0, score 0.65)
- [Migrate to Provider-Tenant Architecture — L156](migrate-to-provider-tenant-architecture.md#^ref-54382370-156-0) (line 156, col 0, score 0.65)
- [Migrate to Provider-Tenant Architecture — L38](migrate-to-provider-tenant-architecture.md#^ref-54382370-38-0) (line 38, col 0, score 0.64)
- [Mongo Outbox Implementation — L534](mongo-outbox-implementation.md#^ref-9c1acd1e-534-0) (line 534, col 0, score 0.64)
- [api-gateway-versioning — L1](api-gateway-versioning.md#^ref-0580dcd3-1-0) (line 1, col 0, score 0.62)
- [Services — L23](chunks/services.md#^ref-75ea4a6a-23-0) (line 23, col 0, score 0.62)
- [ecs-offload-workers — L463](ecs-offload-workers.md#^ref-6498b9d7-463-0) (line 463, col 0, score 0.62)
- [Mongo Outbox Implementation — L537](mongo-outbox-implementation.md#^ref-9c1acd1e-537-0) (line 537, col 0, score 0.75)
- [Agent Tasks: Persistence Migration to DualStore — L81](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-81-0) (line 81, col 0, score 0.68)
- [Matplotlib Animation with Async Execution — L65](matplotlib-animation-with-async-execution.md#^ref-687439f9-65-0) (line 65, col 0, score 0.67)
- [Mongo Outbox Implementation — L142](mongo-outbox-implementation.md#^ref-9c1acd1e-142-0) (line 142, col 0, score 0.66)
- [universal-intention-code-fabric — L393](universal-intention-code-fabric.md#^ref-c14edce7-393-0) (line 393, col 0, score 0.66)
- [Agent Tasks: Persistence Migration to DualStore — L78](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-78-0) (line 78, col 0, score 0.66)
- [Model Upgrade Calm-Down Guide — L29](model-upgrade-calm-down-guide.md#^ref-db74343f-29-0) (line 29, col 0, score 0.72)
- [observability-infrastructure-setup — L348](observability-infrastructure-setup.md#^ref-b4e64f8c-348-0) (line 348, col 0, score 0.72)
- [observability-infrastructure-setup — L31](observability-infrastructure-setup.md#^ref-b4e64f8c-31-0) (line 31, col 0, score 0.72)
- [Mongo Outbox Implementation — L373](mongo-outbox-implementation.md#^ref-9c1acd1e-373-0) (line 373, col 0, score 0.71)
- [Migrate to Provider-Tenant Architecture — L261](migrate-to-provider-tenant-architecture.md#^ref-54382370-261-0) (line 261, col 0, score 0.7)
- [Voice Access Layer Design — L302](voice-access-layer-design.md#^ref-543ed9b3-302-0) (line 302, col 0, score 0.63)
- [Event Bus MVP — L538](event-bus-mvp.md#^ref-534fe91d-538-0) (line 538, col 0, score 0.68)
- [Prometheus Observability Stack — L493](prometheus-observability-stack.md#^ref-e90b5a16-493-0) (line 493, col 0, score 0.68)
- [promethean-system-diagrams — L9](promethean-system-diagrams.md#^ref-b51e19b4-9-0) (line 9, col 0, score 0.68)
- [Stateful Partitions and Rebalancing — L524](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-524-0) (line 524, col 0, score 0.69)
- [Chroma Toolkit Consolidation Plan — L139](chroma-toolkit-consolidation-plan.md#^ref-5020e892-139-0) (line 139, col 0, score 0.68)
- [prom-lib-rate-limiters-and-replay-api — L378](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-378-0) (line 378, col 0, score 0.68)
- [Chroma Toolkit Consolidation Plan — L81](chroma-toolkit-consolidation-plan.md#^ref-5020e892-81-0) (line 81, col 0, score 0.67)
- [schema-evolution-workflow — L476](schema-evolution-workflow.md#^ref-d8059b6a-476-0) (line 476, col 0, score 0.67)
- [Agent Tasks: Persistence Migration to DualStore — L47](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-47-0) (line 47, col 0, score 0.72)
- [Agent Tasks: Persistence Migration to DualStore — L48](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-48-0) (line 48, col 0, score 0.72)
- [Agent Tasks: Persistence Migration to DualStore — L49](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-49-0) (line 49, col 0, score 0.72)
- [Promethean-native config design — L39](promethean-native-config-design.md#^ref-ab748541-39-0) (line 39, col 0, score 0.72)
- [Migrate to Provider-Tenant Architecture — L39](migrate-to-provider-tenant-architecture.md#^ref-54382370-39-0) (line 39, col 0, score 0.69)
- [Promethean-native config design — L37](promethean-native-config-design.md#^ref-ab748541-37-0) (line 37, col 0, score 0.68)
- [Model Upgrade Calm-Down Guide — L30](model-upgrade-calm-down-guide.md#^ref-db74343f-30-0) (line 30, col 0, score 0.7)
- [prom-lib-rate-limiters-and-replay-api — L338](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-338-0) (line 338, col 0, score 0.67)
- [State Snapshots API and Transactional Projector — L317](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-317-0) (line 317, col 0, score 0.68)
- [ecs-offload-workers — L448](ecs-offload-workers.md#^ref-6498b9d7-448-0) (line 448, col 0, score 0.66)
- [typed-struct-compiler — L355](typed-struct-compiler.md#^ref-78eeedf7-355-0) (line 355, col 0, score 0.66)
- [Exception Layer Analysis — L110](exception-layer-analysis.md#^ref-21d5cc09-110-0) (line 110, col 0, score 0.72)
- [Prometheus Observability Stack — L483](prometheus-observability-stack.md#^ref-e90b5a16-483-0) (line 483, col 0, score 0.67)
- [shared-package-layout-clarification — L161](shared-package-layout-clarification.md#^ref-36c8882a-161-0) (line 161, col 0, score 0.67)
- [Chroma-Embedding-Refactor — L311](chroma-embedding-refactor.md#^ref-8b256935-311-0) (line 311, col 0, score 0.66)
- [Language-Agnostic Mirror System — L37](language-agnostic-mirror-system.md#^ref-d2b3628c-37-0) (line 37, col 0, score 0.66)
- [Promethean Web UI Setup — L574](promethean-web-ui-setup.md#^ref-bc5172ca-574-0) (line 574, col 0, score 0.64)
- [Promethean Web UI Setup — L262](promethean-web-ui-setup.md#^ref-bc5172ca-262-0) (line 262, col 0, score 0.64)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L345](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-345-0) (line 345, col 0, score 0.63)
- [Mongo Outbox Implementation — L542](mongo-outbox-implementation.md#^ref-9c1acd1e-542-0) (line 542, col 0, score 0.86)
- [Event Bus MVP — L543](event-bus-mvp.md#^ref-534fe91d-543-0) (line 543, col 0, score 0.72)
- [State Snapshots API and Transactional Projector — L325](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-325-0) (line 325, col 0, score 0.72)
- [schema-evolution-workflow — L473](schema-evolution-workflow.md#^ref-d8059b6a-473-0) (line 473, col 0, score 0.72)
- [Stateful Partitions and Rebalancing — L520](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-520-0) (line 520, col 0, score 0.7)
- [homeostasis-decay-formulas — L134](homeostasis-decay-formulas.md#^ref-37b5d236-134-0) (line 134, col 0, score 0.7)
- [prom-lib-rate-limiters-and-replay-api — L373](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-373-0) (line 373, col 0, score 0.7)
- [universal-intention-code-fabric — L424](universal-intention-code-fabric.md#^ref-c14edce7-424-0) (line 424, col 0, score 0.68)
- [Event Bus MVP — L530](event-bus-mvp.md#^ref-534fe91d-530-0) (line 530, col 0, score 0.66)
- [Interop and Source Maps — L5](interop-and-source-maps.md#^ref-cdfac40c-5-0) (line 5, col 0, score 0.65)
- [markdown-to-org-transpiler — L3](markdown-to-org-transpiler.md#^ref-ab54cdd8-3-0) (line 3, col 0, score 0.63)
- [ecs-offload-workers — L446](ecs-offload-workers.md#^ref-6498b9d7-446-0) (line 446, col 0, score 0.62)
- [ecs-scheduler-and-prefabs — L379](ecs-scheduler-and-prefabs.md#^ref-c62a1815-379-0) (line 379, col 0, score 0.62)
- [markdown-to-org-transpiler — L289](markdown-to-org-transpiler.md#^ref-ab54cdd8-289-0) (line 289, col 0, score 0.62)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L153](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-153-0) (line 153, col 0, score 0.62)
- [System Scheduler with Resource-Aware DAG — L377](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-377-0) (line 377, col 0, score 0.62)
- [Agent Tasks: Persistence Migration to DualStore — L152](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-152-0) (line 152, col 0, score 1)
- [api-gateway-versioning — L294](api-gateway-versioning.md#^ref-0580dcd3-294-0) (line 294, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L191](chroma-toolkit-consolidation-plan.md#^ref-5020e892-191-0) (line 191, col 0, score 1)
- [Services — L11](chunks/services.md#^ref-75ea4a6a-11-0) (line 11, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L228](cross-language-runtime-polymorphism.md#^ref-c34c36a6-228-0) (line 228, col 0, score 1)
- [ecs-offload-workers — L465](ecs-offload-workers.md#^ref-6498b9d7-465-0) (line 465, col 0, score 1)
- [Event Bus MVP — L547](event-bus-mvp.md#^ref-534fe91d-547-0) (line 547, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L312](migrate-to-provider-tenant-architecture.md#^ref-54382370-312-0) (line 312, col 0, score 1)
- [plan-update-confirmation — L760](plan-update-confirmation.md#^ref-b22d79c6-760-0) (line 760, col 0, score 0.6)
- [Mongo Outbox Implementation — L536](mongo-outbox-implementation.md#^ref-9c1acd1e-536-0) (line 536, col 0, score 0.59)
- [plan-update-confirmation — L832](plan-update-confirmation.md#^ref-b22d79c6-832-0) (line 832, col 0, score 0.59)
- [plan-update-confirmation — L812](plan-update-confirmation.md#^ref-b22d79c6-812-0) (line 812, col 0, score 0.58)
- [eidolon-node-lifecycle — L63](eidolon-node-lifecycle.md#^ref-938eca9c-63-0) (line 63, col 0, score 1)
- [EidolonField — L269](eidolonfield.md#^ref-49d1e1e5-269-0) (line 269, col 0, score 1)
- [Event Bus MVP — L566](event-bus-mvp.md#^ref-534fe91d-566-0) (line 566, col 0, score 1)
- [Event Bus Projections Architecture — L185](event-bus-projections-architecture.md#^ref-cf6b9b17-185-0) (line 185, col 0, score 1)
- [Exception Layer Analysis — L165](exception-layer-analysis.md#^ref-21d5cc09-165-0) (line 165, col 0, score 1)
- [Factorio AI with External Agents — L160](factorio-ai-with-external-agents.md#^ref-a4d90289-160-0) (line 160, col 0, score 1)
- [field-dynamics-math-blocks — L165](field-dynamics-math-blocks.md#^ref-7cfc230d-165-0) (line 165, col 0, score 1)
- [field-interaction-equations — L184](field-interaction-equations.md#^ref-b09141b7-184-0) (line 184, col 0, score 1)
- [field-node-diagram-outline — L132](field-node-diagram-outline.md#^ref-1f32c94a-132-0) (line 132, col 0, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L8](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-8-0) (line 8, col 0, score 0.7)
- [ecs-offload-workers — L209](ecs-offload-workers.md#^ref-6498b9d7-209-0) (line 209, col 0, score 0.67)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L499](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-499-0) (line 499, col 0, score 0.66)
- [Promethean Pipelines: Local TypeScript-First Workflow — L1](promethean-pipelines-local-typescript-first-workflow.md#^ref-6b63edca-1-0) (line 1, col 0, score 0.66)
- [ParticleSimulationWithCanvasAndFFmpeg — L1](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-1-0) (line 1, col 0, score 0.66)
- [Migrate to Provider-Tenant Architecture — L82](migrate-to-provider-tenant-architecture.md#^ref-54382370-82-0) (line 82, col 0, score 0.65)
- [ecs-offload-workers — L5](ecs-offload-workers.md#^ref-6498b9d7-5-0) (line 5, col 0, score 0.65)
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
- [Promethean Event Bus MVP v0.1 — L890](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-890-0) (line 890, col 0, score 1)
- [Promethean-native config design — L389](promethean-native-config-design.md#^ref-ab748541-389-0) (line 389, col 0, score 1)
- [schema-evolution-workflow — L482](schema-evolution-workflow.md#^ref-d8059b6a-482-0) (line 482, col 0, score 1)
- [State Snapshots API and Transactional Projector — L338](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-338-0) (line 338, col 0, score 1)
- [Math Fundamentals — L20](chunks/math-fundamentals.md#^ref-c6e87433-20-0) (line 20, col 0, score 1)
- [Services — L20](chunks/services.md#^ref-75ea4a6a-20-0) (line 20, col 0, score 1)
- [compiler-kit-foundations — L620](compiler-kit-foundations.md#^ref-01b21543-620-0) (line 620, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L237](cross-language-runtime-polymorphism.md#^ref-c34c36a6-237-0) (line 237, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L40](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-40-0) (line 40, col 0, score 1)
- [Dynamic Context Model for Web Components — L401](dynamic-context-model-for-web-components.md#^ref-f7702bf8-401-0) (line 401, col 0, score 1)
- [ecs-scheduler-and-prefabs — L386](ecs-scheduler-and-prefabs.md#^ref-c62a1815-386-0) (line 386, col 0, score 1)
- [eidolon-field-math-foundations — L127](eidolon-field-math-foundations.md#^ref-008f2ac0-127-0) (line 127, col 0, score 1)
- [Event Bus MVP — L557](event-bus-mvp.md#^ref-534fe91d-557-0) (line 557, col 0, score 1)
- [Chroma-Embedding-Refactor — L326](chroma-embedding-refactor.md#^ref-8b256935-326-0) (line 326, col 0, score 1)
- [i3-config-validation-methods — L67](i3-config-validation-methods.md#^ref-d28090ac-67-0) (line 67, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L274](migrate-to-provider-tenant-architecture.md#^ref-54382370-274-0) (line 274, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L489](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-489-0) (line 489, col 0, score 1)
- [Promethean Agent Config DSL — L326](promethean-agent-config-dsl.md#^ref-2c00ce45-326-0) (line 326, col 0, score 1)
- [Promethean Infrastructure Setup — L579](promethean-infrastructure-setup.md#^ref-6deed6ac-579-0) (line 579, col 0, score 1)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L441](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-441-0) (line 441, col 0, score 1)
- [shared-package-layout-clarification — L164](shared-package-layout-clarification.md#^ref-36c8882a-164-0) (line 164, col 0, score 1)
- [Services — L10](chunks/services.md#^ref-75ea4a6a-10-0) (line 10, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L209](cross-language-runtime-polymorphism.md#^ref-c34c36a6-209-0) (line 209, col 0, score 1)
- [ecs-offload-workers — L486](ecs-offload-workers.md#^ref-6498b9d7-486-0) (line 486, col 0, score 1)
- [Event Bus MVP — L548](event-bus-mvp.md#^ref-534fe91d-548-0) (line 548, col 0, score 1)
- [Mongo Outbox Implementation — L552](mongo-outbox-implementation.md#^ref-9c1acd1e-552-0) (line 552, col 0, score 1)
- [prom-lib-rate-limiters-and-replay-api — L382](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-382-0) (line 382, col 0, score 1)
- [Promethean Event Bus MVP v0.1 — L913](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-913-0) (line 913, col 0, score 1)
- [State Snapshots API and Transactional Projector — L333](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-333-0) (line 333, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L134](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-134-0) (line 134, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L164](chroma-toolkit-consolidation-plan.md#^ref-5020e892-164-0) (line 164, col 0, score 1)
- [Services — L18](chunks/services.md#^ref-75ea4a6a-18-0) (line 18, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L230](cross-language-runtime-polymorphism.md#^ref-c34c36a6-230-0) (line 230, col 0, score 1)
- [ecs-offload-workers — L483](ecs-offload-workers.md#^ref-6498b9d7-483-0) (line 483, col 0, score 1)
- [eidolon-field-math-foundations — L148](eidolon-field-math-foundations.md#^ref-008f2ac0-148-0) (line 148, col 0, score 1)
- [Event Bus MVP — L549](event-bus-mvp.md#^ref-534fe91d-549-0) (line 549, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L282](migrate-to-provider-tenant-architecture.md#^ref-54382370-282-0) (line 282, col 0, score 1)
- [api-gateway-versioning — L315](api-gateway-versioning.md#^ref-0580dcd3-315-0) (line 315, col 0, score 1)
- [Diagrams — L25](chunks/diagrams.md#^ref-45cd25b5-25-0) (line 25, col 0, score 1)
- [Tooling — L24](chunks/tooling.md#^ref-6cb4943e-24-0) (line 24, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L173](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-173-0) (line 173, col 0, score 1)
- [Dynamic Context Model for Web Components — L390](dynamic-context-model-for-web-components.md#^ref-f7702bf8-390-0) (line 390, col 0, score 1)
- [eidolon-field-math-foundations — L147](eidolon-field-math-foundations.md#^ref-008f2ac0-147-0) (line 147, col 0, score 1)
- [Event Bus MVP — L553](event-bus-mvp.md#^ref-534fe91d-553-0) (line 553, col 0, score 1)
- [field-interaction-equations — L159](field-interaction-equations.md#^ref-b09141b7-159-0) (line 159, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L315](functional-embedding-pipeline-refactor.md#^ref-a4a25141-315-0) (line 315, col 0, score 1)
- [i3-bluetooth-setup — L105](i3-bluetooth-setup.md#^ref-5e408692-105-0) (line 105, col 0, score 1)
- [Diagrams — L26](chunks/diagrams.md#^ref-45cd25b5-26-0) (line 26, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L295](migrate-to-provider-tenant-architecture.md#^ref-54382370-295-0) (line 295, col 0, score 1)
- [Promethean Agent Config DSL — L316](promethean-agent-config-dsl.md#^ref-2c00ce45-316-0) (line 316, col 0, score 1)
- [Promethean Infrastructure Setup — L589](promethean-infrastructure-setup.md#^ref-6deed6ac-589-0) (line 589, col 0, score 1)
- [shared-package-layout-clarification — L173](shared-package-layout-clarification.md#^ref-36c8882a-173-0) (line 173, col 0, score 1)
- [Shared Package Structure — L165](shared-package-structure.md#^ref-66a72fc3-165-0) (line 165, col 0, score 1)
- [Unique Info Dump Index — L140](unique-info-dump-index.md#^ref-30ec3ba6-140-0) (line 140, col 0, score 1)
- [Voice Access Layer Design — L323](voice-access-layer-design.md#^ref-543ed9b3-323-0) (line 323, col 0, score 1)
- [api-gateway-versioning — L282](api-gateway-versioning.md#^ref-0580dcd3-282-0) (line 282, col 0, score 1)
- [archetype-ecs — L470](archetype-ecs.md#^ref-8f4c1e86-470-0) (line 470, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L201](chroma-toolkit-consolidation-plan.md#^ref-5020e892-201-0) (line 201, col 0, score 1)
- [Dynamic Context Model for Web Components — L382](dynamic-context-model-for-web-components.md#^ref-f7702bf8-382-0) (line 382, col 0, score 1)
- [ecs-offload-workers — L456](ecs-offload-workers.md#^ref-6498b9d7-456-0) (line 456, col 0, score 1)
- [ecs-scheduler-and-prefabs — L390](ecs-scheduler-and-prefabs.md#^ref-c62a1815-390-0) (line 390, col 0, score 1)
- [eidolon-field-math-foundations — L125](eidolon-field-math-foundations.md#^ref-008f2ac0-125-0) (line 125, col 0, score 1)
- [i3-config-validation-methods — L61](i3-config-validation-methods.md#^ref-d28090ac-61-0) (line 61, col 0, score 1)
- [Mongo Outbox Implementation — L572](mongo-outbox-implementation.md#^ref-9c1acd1e-572-0) (line 572, col 0, score 1)
- [observability-infrastructure-setup — L360](observability-infrastructure-setup.md#^ref-b4e64f8c-360-0) (line 360, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L163](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-163-0) (line 163, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L472](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-472-0) (line 472, col 0, score 1)
- [Chroma-Embedding-Refactor — L328](chroma-embedding-refactor.md#^ref-8b256935-328-0) (line 328, col 0, score 1)
- [Diagrams — L46](chunks/diagrams.md#^ref-45cd25b5-46-0) (line 46, col 0, score 1)
- [i3-config-validation-methods — L53](i3-config-validation-methods.md#^ref-d28090ac-53-0) (line 53, col 0, score 1)
- [Local-Only-LLM-Workflow — L180](local-only-llm-workflow.md#^ref-9a8ab57e-180-0) (line 180, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L276](migrate-to-provider-tenant-architecture.md#^ref-54382370-276-0) (line 276, col 0, score 1)
- [observability-infrastructure-setup — L376](observability-infrastructure-setup.md#^ref-b4e64f8c-376-0) (line 376, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L89](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-89-0) (line 89, col 0, score 1)
- [Promethean Agent Config DSL — L358](promethean-agent-config-dsl.md#^ref-2c00ce45-358-0) (line 358, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L172](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-172-0) (line 172, col 0, score 1)
- [AI-Centric OS with MCP Layer — L424](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-424-0) (line 424, col 0, score 1)
- [aionian-circuit-math — L183](aionian-circuit-math.md#^ref-f2d83a77-183-0) (line 183, col 0, score 1)
- [api-gateway-versioning — L310](api-gateway-versioning.md#^ref-0580dcd3-310-0) (line 310, col 0, score 1)
- [Board Walk – 2025-08-11 — L149](board-walk-2025-08-11.md#^ref-7aa1eb92-149-0) (line 149, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L211](chroma-toolkit-consolidation-plan.md#^ref-5020e892-211-0) (line 211, col 0, score 1)
- [Diagrams — L23](chunks/diagrams.md#^ref-45cd25b5-23-0) (line 23, col 0, score 1)
- [DSL — L27](chunks/dsl.md#^ref-e87bc036-27-0) (line 27, col 0, score 1)
- [Shared — L28](chunks/shared.md#^ref-623a55f7-28-0) (line 28, col 0, score 1)
- [Simulation Demo — L29](chunks/simulation-demo.md#^ref-557309a3-29-0) (line 29, col 0, score 1)
- [Tooling — L14](chunks/tooling.md#^ref-6cb4943e-14-0) (line 14, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L231](cross-language-runtime-polymorphism.md#^ref-c34c36a6-231-0) (line 231, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L53](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-53-0) (line 53, col 0, score 1)
- [AI-Centric OS with MCP Layer — L407](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-407-0) (line 407, col 0, score 1)
- [api-gateway-versioning — L284](api-gateway-versioning.md#^ref-0580dcd3-284-0) (line 284, col 0, score 1)
- [Services — L21](chunks/services.md#^ref-75ea4a6a-21-0) (line 21, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L43](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-43-0) (line 43, col 0, score 1)
- [Dynamic Context Model for Web Components — L407](dynamic-context-model-for-web-components.md#^ref-f7702bf8-407-0) (line 407, col 0, score 1)
- [ecs-offload-workers — L478](ecs-offload-workers.md#^ref-6498b9d7-478-0) (line 478, col 0, score 1)
- [eidolon-field-math-foundations — L167](eidolon-field-math-foundations.md#^ref-008f2ac0-167-0) (line 167, col 0, score 1)
- [i3-bluetooth-setup — L123](i3-bluetooth-setup.md#^ref-5e408692-123-0) (line 123, col 0, score 1)
- [i3-config-validation-methods — L78](i3-config-validation-methods.md#^ref-d28090ac-78-0) (line 78, col 0, score 1)
- [Local-Offline-Model-Deployment-Strategy — L295](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-295-0) (line 295, col 0, score 1)
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
- [Exception Layer Analysis — L172](exception-layer-analysis.md#^ref-21d5cc09-172-0) (line 172, col 0, score 1)
- [field-dynamics-math-blocks — L154](field-dynamics-math-blocks.md#^ref-7cfc230d-154-0) (line 154, col 0, score 1)
- [field-interaction-equations — L164](field-interaction-equations.md#^ref-b09141b7-164-0) (line 164, col 0, score 1)
- [field-node-diagram-outline — L120](field-node-diagram-outline.md#^ref-1f32c94a-120-0) (line 120, col 0, score 1)
- [field-node-diagram-set — L149](field-node-diagram-set.md#^ref-22b989d5-149-0) (line 149, col 0, score 1)
- [field-node-diagram-visualizations — L99](field-node-diagram-visualizations.md#^ref-e9b27b06-99-0) (line 99, col 0, score 1)
- [graph-ds — L365](graph-ds.md#^ref-6620e2f2-365-0) (line 365, col 0, score 1)
- [heartbeat-fragment-demo — L111](heartbeat-fragment-demo.md#^ref-dd00677a-111-0) (line 111, col 0, score 1)
- [heartbeat-simulation-snippets — L101](heartbeat-simulation-snippets.md#^ref-23e221e9-101-0) (line 101, col 0, score 1)
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
- [Promethean_Eidolon_Synchronicity_Model — L74](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-74-0) (line 74, col 0, score 1)
- [Promethean Event Bus MVP v0.1 — L929](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-929-0) (line 929, col 0, score 1)
- [Promethean Infrastructure Setup — L597](promethean-infrastructure-setup.md#^ref-6deed6ac-597-0) (line 597, col 0, score 1)
- [Promethean-native config design — L421](promethean-native-config-design.md#^ref-ab748541-421-0) (line 421, col 0, score 1)
- [promethean-system-diagrams — L217](promethean-system-diagrams.md#^ref-b51e19b4-217-0) (line 217, col 0, score 1)
- [Promethean Web UI Setup — L629](promethean-web-ui-setup.md#^ref-bc5172ca-629-0) (line 629, col 0, score 1)
- [Prompt_Folder_Bootstrap — L193](prompt-folder-bootstrap.md#^ref-bd4f0976-193-0) (line 193, col 0, score 1)
- [prompt-programming-language-lisp — L107](prompt-programming-language-lisp.md#^ref-d41a06d1-107-0) (line 107, col 0, score 1)
- [field-node-diagram-outline — L111](field-node-diagram-outline.md#^ref-1f32c94a-111-0) (line 111, col 0, score 1)
- [field-node-diagram-set — L144](field-node-diagram-set.md#^ref-22b989d5-144-0) (line 144, col 0, score 1)
- [field-node-diagram-visualizations — L94](field-node-diagram-visualizations.md#^ref-e9b27b06-94-0) (line 94, col 0, score 1)
- [Fnord Tracer Protocol — L258](fnord-tracer-protocol.md#^ref-fc21f824-258-0) (line 258, col 0, score 1)
- [graph-ds — L398](graph-ds.md#^ref-6620e2f2-398-0) (line 398, col 0, score 1)
- [heartbeat-fragment-demo — L110](heartbeat-fragment-demo.md#^ref-dd00677a-110-0) (line 110, col 0, score 1)
- [heartbeat-simulation-snippets — L99](heartbeat-simulation-snippets.md#^ref-23e221e9-99-0) (line 99, col 0, score 1)
- [homeostasis-decay-formulas — L151](homeostasis-decay-formulas.md#^ref-37b5d236-151-0) (line 151, col 0, score 1)
- [i3-bluetooth-setup — L119](i3-bluetooth-setup.md#^ref-5e408692-119-0) (line 119, col 0, score 1)
- [Math Fundamentals — L34](chunks/math-fundamentals.md#^ref-c6e87433-34-0) (line 34, col 0, score 1)
- [Services — L22](chunks/services.md#^ref-75ea4a6a-22-0) (line 22, col 0, score 1)
- [Shared — L29](chunks/shared.md#^ref-623a55f7-29-0) (line 29, col 0, score 1)
- [Simulation Demo — L23](chunks/simulation-demo.md#^ref-557309a3-23-0) (line 23, col 0, score 1)
- [Tooling — L16](chunks/tooling.md#^ref-6cb4943e-16-0) (line 16, col 0, score 1)
- [Window Management — L25](chunks/window-management.md#^ref-9e8ae388-25-0) (line 25, col 0, score 1)
- [compiler-kit-foundations — L627](compiler-kit-foundations.md#^ref-01b21543-627-0) (line 627, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L171](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-171-0) (line 171, col 0, score 1)
- [Duck's Attractor States — L81](ducks-attractor-states.md#^ref-13951643-81-0) (line 81, col 0, score 1)
- [field-node-diagram-visualizations — L89](field-node-diagram-visualizations.md#^ref-e9b27b06-89-0) (line 89, col 0, score 1)
- [graph-ds — L373](graph-ds.md#^ref-6620e2f2-373-0) (line 373, col 0, score 1)
- [heartbeat-fragment-demo — L99](heartbeat-fragment-demo.md#^ref-dd00677a-99-0) (line 99, col 0, score 1)
- [heartbeat-simulation-snippets — L86](heartbeat-simulation-snippets.md#^ref-23e221e9-86-0) (line 86, col 0, score 1)
- [homeostasis-decay-formulas — L154](homeostasis-decay-formulas.md#^ref-37b5d236-154-0) (line 154, col 0, score 1)
- [Interop and Source Maps — L518](interop-and-source-maps.md#^ref-cdfac40c-518-0) (line 518, col 0, score 1)
- [komorebi-group-window-hack — L205](komorebi-group-window-hack.md#^ref-dd89372d-205-0) (line 205, col 0, score 1)
- [layer-1-uptime-diagrams — L166](layer-1-uptime-diagrams.md#^ref-4127189a-166-0) (line 166, col 0, score 1)
- [Lisp-Compiler-Integration — L558](lisp-compiler-integration.md#^ref-cfee6d36-558-0) (line 558, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L136](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-136-0) (line 136, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L108](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-108-0) (line 108, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L168](chroma-toolkit-consolidation-plan.md#^ref-5020e892-168-0) (line 168, col 0, score 1)
- [ecs-scheduler-and-prefabs — L387](ecs-scheduler-and-prefabs.md#^ref-c62a1815-387-0) (line 387, col 0, score 1)
- [Event Bus MVP — L564](event-bus-mvp.md#^ref-534fe91d-564-0) (line 564, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L316](migrate-to-provider-tenant-architecture.md#^ref-54382370-316-0) (line 316, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L142](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-142-0) (line 142, col 0, score 1)
- [prom-lib-rate-limiters-and-replay-api — L405](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-405-0) (line 405, col 0, score 1)
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
- [aionian-circuit-math — L165](aionian-circuit-math.md#^ref-f2d83a77-165-0) (line 165, col 0, score 1)
- [api-gateway-versioning — L319](api-gateway-versioning.md#^ref-0580dcd3-319-0) (line 319, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L116](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-116-0) (line 116, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L209](chroma-toolkit-consolidation-plan.md#^ref-5020e892-209-0) (line 209, col 0, score 1)
- [DSL — L13](chunks/dsl.md#^ref-e87bc036-13-0) (line 13, col 0, score 1)
- [Math Fundamentals — L16](chunks/math-fundamentals.md#^ref-c6e87433-16-0) (line 16, col 0, score 1)
- [Services — L16](chunks/services.md#^ref-75ea4a6a-16-0) (line 16, col 0, score 1)
- [Shared — L5](chunks/shared.md#^ref-623a55f7-5-0) (line 5, col 0, score 1)
- [Simulation Demo — L12](chunks/simulation-demo.md#^ref-557309a3-12-0) (line 12, col 0, score 1)
- [DuckDuckGoSearchPipeline — L16](duckduckgosearchpipeline.md#^ref-e979c50f-16-0) (line 16, col 0, score 1)
- [Services — L28](chunks/services.md#^ref-75ea4a6a-28-0) (line 28, col 0, score 1)
- [Simulation Demo — L7](chunks/simulation-demo.md#^ref-557309a3-7-0) (line 7, col 0, score 1)
- [ecs-scheduler-and-prefabs — L428](ecs-scheduler-and-prefabs.md#^ref-c62a1815-428-0) (line 428, col 0, score 1)
- [Eidolon Field Abstract Model — L199](eidolon-field-abstract-model.md#^ref-5e8b2388-199-0) (line 199, col 0, score 1)
- [eidolon-node-lifecycle — L35](eidolon-node-lifecycle.md#^ref-938eca9c-35-0) (line 35, col 0, score 1)
- [Event Bus MVP — L570](event-bus-mvp.md#^ref-534fe91d-570-0) (line 570, col 0, score 1)
- [field-interaction-equations — L173](field-interaction-equations.md#^ref-b09141b7-173-0) (line 173, col 0, score 1)
- [field-node-diagram-outline — L113](field-node-diagram-outline.md#^ref-1f32c94a-113-0) (line 113, col 0, score 1)
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
- [markdown-to-org-transpiler — L318](markdown-to-org-transpiler.md#^ref-ab54cdd8-318-0) (line 318, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L322](migrate-to-provider-tenant-architecture.md#^ref-54382370-322-0) (line 322, col 0, score 1)
- [Mongo Outbox Implementation — L579](mongo-outbox-implementation.md#^ref-9c1acd1e-579-0) (line 579, col 0, score 1)
- [observability-infrastructure-setup — L369](observability-infrastructure-setup.md#^ref-b4e64f8c-369-0) (line 369, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L183](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-183-0) (line 183, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L483](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-483-0) (line 483, col 0, score 1)
- [polymorphic-meta-programming-engine — L241](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-241-0) (line 241, col 0, score 1)
- [prom-lib-rate-limiters-and-replay-api — L415](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-415-0) (line 415, col 0, score 1)
- [Promethean Agent Config DSL — L352](promethean-agent-config-dsl.md#^ref-2c00ce45-352-0) (line 352, col 0, score 1)
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
- [Local-First Intention→Code Loop with Free Models — L154](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-154-0) (line 154, col 0, score 1)
- [Local-Only-LLM-Workflow — L179](local-only-llm-workflow.md#^ref-9a8ab57e-179-0) (line 179, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L304](migrate-to-provider-tenant-architecture.md#^ref-54382370-304-0) (line 304, col 0, score 1)
- [observability-infrastructure-setup — L398](observability-infrastructure-setup.md#^ref-b4e64f8c-398-0) (line 398, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L184](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-184-0) (line 184, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L506](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-506-0) (line 506, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L452](performance-optimized-polyglot-bridge.md#^ref-f5579967-452-0) (line 452, col 0, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L527](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-527-0) (line 527, col 0, score 1)
- [Admin Dashboard for User Management — L43](admin-dashboard-for-user-management.md#^ref-2901a3e9-43-0) (line 43, col 0, score 1)
- [api-gateway-versioning — L300](api-gateway-versioning.md#^ref-0580dcd3-300-0) (line 300, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L305](migrate-to-provider-tenant-architecture.md#^ref-54382370-305-0) (line 305, col 0, score 1)
- [observability-infrastructure-setup — L399](observability-infrastructure-setup.md#^ref-b4e64f8c-399-0) (line 399, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L79](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-79-0) (line 79, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L165](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-165-0) (line 165, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L266](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-266-0) (line 266, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L488](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-488-0) (line 488, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L436](performance-optimized-polyglot-bridge.md#^ref-f5579967-436-0) (line 436, col 0, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L504](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-504-0) (line 504, col 0, score 1)
- [polymorphic-meta-programming-engine — L244](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-244-0) (line 244, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L91](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-91-0) (line 91, col 0, score 1)
- [DSL — L26](chunks/dsl.md#^ref-e87bc036-26-0) (line 26, col 0, score 1)
- [ecs-offload-workers — L500](ecs-offload-workers.md#^ref-6498b9d7-500-0) (line 500, col 0, score 1)
- [ecs-scheduler-and-prefabs — L433](ecs-scheduler-and-prefabs.md#^ref-c62a1815-433-0) (line 433, col 0, score 1)
- [Event Bus MVP — L577](event-bus-mvp.md#^ref-534fe91d-577-0) (line 577, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L174](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-174-0) (line 174, col 0, score 1)
- [Local-Only-LLM-Workflow — L211](local-only-llm-workflow.md#^ref-9a8ab57e-211-0) (line 211, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L334](migrate-to-provider-tenant-architecture.md#^ref-54382370-334-0) (line 334, col 0, score 1)
- [Mongo Outbox Implementation — L581](mongo-outbox-implementation.md#^ref-9c1acd1e-581-0) (line 581, col 0, score 1)
- [observability-infrastructure-setup — L397](observability-infrastructure-setup.md#^ref-b4e64f8c-397-0) (line 397, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L48](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-48-0) (line 48, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L202](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-202-0) (line 202, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L130](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-130-0) (line 130, col 0, score 1)
- [api-gateway-versioning — L303](api-gateway-versioning.md#^ref-0580dcd3-303-0) (line 303, col 0, score 1)
- [Chroma-Embedding-Refactor — L327](chroma-embedding-refactor.md#^ref-8b256935-327-0) (line 327, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L174](chroma-toolkit-consolidation-plan.md#^ref-5020e892-174-0) (line 174, col 0, score 1)
- [eidolon-field-math-foundations — L134](eidolon-field-math-foundations.md#^ref-008f2ac0-134-0) (line 134, col 0, score 1)
- [i3-config-validation-methods — L82](i3-config-validation-methods.md#^ref-d28090ac-82-0) (line 82, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L267](migrate-to-provider-tenant-architecture.md#^ref-54382370-267-0) (line 267, col 0, score 1)
- [prom-lib-rate-limiters-and-replay-api — L391](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-391-0) (line 391, col 0, score 1)
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
