---
uuid: 9c1acd1e-c6a4-4a49-a66f-6da8b1bc9333
created_at: 2025.08.08.19.08.49.md
filename: Mongo Outbox Implementation
description: >-
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
related_to_title: []
related_to_uuid: []
references: []
---
Note: Consolidated here → ../notes/services/broker-outbox-acl-ops.md ^ref-9c1acd1e-1-0

Alright, Part 3 coming in hot: **Mongo outbox (transactional), JWT auth + ACL, Ops dashboard, and a typed client SDK**. Everything drops under `shared/js/prom-lib/` (plus one tiny service bootstrap). You can paste-as-you-go. ^ref-9c1acd1e-3-0

---

# 1) Mongo Outbox (transaction-safe)

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
^ref-9c1acd1e-11-0
 ^ref-9c1acd1e-37-0
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
^ref-9c1acd1e-37-0
```

### 1b) Mongo implementation ^ref-9c1acd1e-74-0

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
^ref-9c1acd1e-74-0
} ^ref-9c1acd1e-142-0
```

> **Usage:** write to your DB + `MongoOutbox.add(...)` in the same transaction. The drainer publishes and marks sent.

---
 ^ref-9c1acd1e-148-0
# 2) JWT Auth + Scope-based ACL

Supports **publish/subscribe** actions with **topic patterns** (wildcards `*` one segment, `**` multi). You can keep policies as simple JSON.
 ^ref-9c1acd1e-152-0
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
^ref-9c1acd1e-152-0
  return false;
}
```
^ref-9c1acd1e-187-0

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
^ref-9c1acd1e-187-0
}

import { matchTopic } from "./match";
^ref-9c1acd1e-222-0
```
^ref-9c1acd1e-222-0

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
^ref-9c1acd1e-222-0
  } else {
    throw new Error("No JWT verifier configured");
  }
^ref-9c1acd1e-263-0
}
^ref-9c1acd1e-263-0
```
^ref-9c1acd1e-263-0

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
^ref-9c1acd1e-263-0
    };
  });
  // Default deny if nothing matches; explicit deny could be added later ^ref-9c1acd1e-284-0
^ref-9c1acd1e-286-0
^ref-9c1acd1e-284-0
  return { rules };
^ref-9c1acd1e-286-0
^ref-9c1acd1e-284-0
}
^ref-9c1acd1e-286-0
^ref-9c1acd1e-284-0
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
^ref-9c1acd1e-286-0
if (!policy || !isAllowed(policy, "publish", msg.topic)) ^ref-9c1acd1e-303-0
  return err("forbidden", "no publish permission");
^ref-9c1acd1e-307-0
^ref-9c1acd1e-303-0
 ^ref-9c1acd1e-305-0
^ref-9c1acd1e-307-0
^ref-9c1acd1e-305-0
^ref-9c1acd1e-303-0
// on SUBSCRIBE:
^ref-9c1acd1e-323-0
^ref-9c1acd1e-321-0
^ref-9c1acd1e-307-0
^ref-9c1acd1e-305-0
^ref-9c1acd1e-303-0
if (!policy || !isAllowed(policy, "subscribe", msg.topic, msg.group)) ^ref-9c1acd1e-321-0
  return err("forbidden", "no subscribe permission");
```

> If you don’t want JWT yet, you can keep the old static token path and synthesize a wide-open policy for that token.

**Mermaid (decision):**

```mermaid
^ref-9c1acd1e-307-0
flowchart LR
^ref-9c1acd1e-323-0
^ref-9c1acd1e-321-0
^ref-9c1acd1e-323-0
  AUTH[AUTH token] --> VERIFY{verifyJWT?}
  VERIFY -- ok --> CLAIMS[claims.scopes/policy]
  CLAIMS --> POLICY[build Policy]
  SUB[PUBLISH/SUBSCRIBE] --> CHECK{isAllowed?} ^ref-9c1acd1e-321-0
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
^ref-9c1acd1e-323-0
^ref-9c1acd1e-381-0
^ref-9c1acd1e-379-0
    res.json(recs[key] ?? null); ^ref-9c1acd1e-373-0
^ref-9c1acd1e-381-0
^ref-9c1acd1e-379-0
^ref-9c1acd1e-373-0
^ref-9c1acd1e-381-0
^ref-9c1acd1e-379-0
^ref-9c1acd1e-373-0
  });

  return app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`[ops] dashboard on :${port}`);
  }); ^ref-9c1acd1e-379-0
}
```

> Optional: add `/metrics` by calling your `metrics.expose(app)` helper if you wired Prometheus.

---

# 4) Typed Client SDK (Node + Browser)

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
^ref-9c1acd1e-451-0
^ref-9c1acd1e-449-0
^ref-9c1acd1e-451-0
^ref-9c1acd1e-449-0
^ref-9c1acd1e-451-0
^ref-9c1acd1e-449-0
^ref-9c1acd1e-381-0
 ^ref-9c1acd1e-443-0
  async unsubscribe(topic: string, group: string) {
    await this.connect();
    this.handlers.delete(`${topic}::${group}`);
    this.ws!.send(JSON.stringify({ op: "UNSUBSCRIBE", topic, group }));
  }
 ^ref-9c1acd1e-449-0
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
^ref-9c1acd1e-516-0
^ref-9c1acd1e-536-0 ^ref-9c1acd1e-537-0
^ref-9c1acd1e-535-0 ^ref-9c1acd1e-538-0
^ref-9c1acd1e-534-0
^ref-9c1acd1e-533-0
^ref-9c1acd1e-516-0
^ref-9c1acd1e-553-0
^ref-9c1acd1e-552-0 ^ref-9c1acd1e-556-0
^ref-9c1acd1e-551-0 ^ref-9c1acd1e-557-0
^ref-9c1acd1e-550-0
^ref-9c1acd1e-547-0
^ref-9c1acd1e-546-0
^ref-9c1acd1e-545-0
^ref-9c1acd1e-544-0 ^ref-9c1acd1e-562-0
^ref-9c1acd1e-542-0 ^ref-9c1acd1e-563-0
^ref-9c1acd1e-538-0
^ref-9c1acd1e-537-0
^ref-9c1acd1e-536-0
^ref-9c1acd1e-535-0
^ref-9c1acd1e-534-0
^ref-9c1acd1e-533-0
^ref-9c1acd1e-516-0 ^ref-9c1acd1e-570-0
 ^ref-9c1acd1e-542-0
^ref-9c1acd1e-451-0 ^ref-9c1acd1e-572-0
  // Outbox drainer ^ref-9c1acd1e-544-0
  const outbox = new MongoOutbox(db); ^ref-9c1acd1e-545-0
  runOutboxDrainer(outbox, bus); ^ref-9c1acd1e-546-0
 ^ref-9c1acd1e-547-0
  // Done.
  // eslint-disable-next-line no-console
  console.log("[event-hub] up");
}

main().catch((e) => { console.error(e); process.exit(1); });
```

^ref-9c1acd1e-584-0 ^ref-9c1acd1e-585-0
^ref-9c1acd1e-583-0
^ref-9c1acd1e-581-0 ^ref-9c1acd1e-587-0
^ref-9c1acd1e-580-0
^ref-9c1acd1e-579-0
^ref-9c1acd1e-574-0
^ref-9c1acd1e-573-0
---

# 6) Sibilant sugar for ACLs (pseudo)
^ref-9c1acd1e-538-0
^ref-9c1acd1e-537-0 ^ref-9c1acd1e-542-0
^ref-9c1acd1e-557-0
^ref-9c1acd1e-556-0 ^ref-9c1acd1e-562-0
^ref-9c1acd1e-553-0 ^ref-9c1acd1e-563-0
^ref-9c1acd1e-552-0
^ref-9c1acd1e-551-0
^ref-9c1acd1e-550-0
^ref-9c1acd1e-536-0
^ref-9c1acd1e-535-0 ^ref-9c1acd1e-544-0
^ref-9c1acd1e-534-0 ^ref-9c1acd1e-545-0
^ref-9c1acd1e-533-0 ^ref-9c1acd1e-546-0 ^ref-9c1acd1e-570-0
 ^ref-9c1acd1e-547-0
^ref-9c1acd1e-516-0 ^ref-9c1acd1e-572-0
```lisp
; shared/sibilant/prom/acl.sib (pseudo) ^ref-9c1acd1e-550-0 ^ref-9c1acd1e-574-0
(defmacro allow [action & patterns] ^ref-9c1acd1e-551-0
  `{:effect "allow" :action ~action :topics [~@patterns]}) ^ref-9c1acd1e-552-0
 ^ref-9c1acd1e-533-0 ^ref-9c1acd1e-553-0
(defn scopes->policy [scopes] ^ref-9c1acd1e-534-0
  {:rules (map (fn [s] (let [[action pattern] (.split s ":")] ^ref-9c1acd1e-535-0 ^ref-9c1acd1e-579-0
                          {:effect "allow" :action action :topics [pattern]})) ^ref-9c1acd1e-536-0 ^ref-9c1acd1e-556-0 ^ref-9c1acd1e-580-0
               scopes)}) ^ref-9c1acd1e-537-0 ^ref-9c1acd1e-557-0 ^ref-9c1acd1e-581-0
 ^ref-9c1acd1e-538-0
; (def POLICY (scopes->policy ["publish:heartbeat.*" "subscribe:process.**"])) ^ref-9c1acd1e-583-0
``` ^ref-9c1acd1e-584-0
 ^ref-9c1acd1e-585-0
--- ^ref-9c1acd1e-542-0 ^ref-9c1acd1e-562-0
 ^ref-9c1acd1e-563-0 ^ref-9c1acd1e-587-0
# 7) Quick Kanban additions ^ref-9c1acd1e-544-0
 ^ref-9c1acd1e-545-0
* [ ] Add `MongoOutbox` to any service that writes DB changes; swap local app emits → outbox writes ^ref-9c1acd1e-546-0
* [ ] Wire `runOutboxDrainer` in event-hub ^ref-9c1acd1e-547-0
* [ ] Switch gateway auth to JWT; generate temp HS256 token for dev
* [ ] Define default scopes: `publish:heartbeat.received`, `subscribe:process.state`
* [ ] Add `/lag` checks to CI smoke (ensure small lag after publishing bursts) ^ref-9c1acd1e-550-0 ^ref-9c1acd1e-570-0
* [ ] Build tiny web page that uses `PromClient` in the browser to show live `process.state` (optional) ^ref-9c1acd1e-551-0
 ^ref-9c1acd1e-552-0 ^ref-9c1acd1e-572-0
--- ^ref-9c1acd1e-553-0
 ^ref-9c1acd1e-574-0
If you want **Part 4**, I’ll dump:
 ^ref-9c1acd1e-556-0
* **Backpressure & rate limits** (per-topic quotas, token-bucket), ^ref-9c1acd1e-557-0
* **Replay API** (HTTP range queries + export to NDJSON),
* **Exactly-once-ish** consumer helper (idempotent handler wrapper w/ dedupe store), ^ref-9c1acd1e-579-0
* **Bench harness** (pub/sub throughput tester) and sizing notes.<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [WebSocket Gateway Implementation](websocket-gateway-implementation.md)
- [Event Bus MVP](event-bus-mvp.md)
- [State Snapshots API and Transactional Projector](state-snapshots-api-and-transactional-projector.md)
- [schema-evolution-workflow](schema-evolution-workflow.md)
- [prom-lib-rate-limiters-and-replay-api](prom-lib-rate-limiters-and-replay-api.md)
- [Promethean Event Bus MVP v0.1](promethean-event-bus-mvp-v0-1.md)
- [Services](chunks/services.md)
- [Unique Info Dump Index](unique-info-dump-index.md)
- [Stateful Partitions and Rebalancing](stateful-partitions-and-rebalancing.md)
- [observability-infrastructure-setup](observability-infrastructure-setup.md)
- [ecs-offload-workers](ecs-offload-workers.md)
- [archetype-ecs](archetype-ecs.md)
- [aionian-circuit-math](aionian-circuit-math.md)
- [Diagrams](chunks/diagrams.md)
- [DSL](chunks/dsl.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [Event Bus Projections Architecture](event-bus-projections-architecture.md)
- [ecs-scheduler-and-prefabs](ecs-scheduler-and-prefabs.md)
- [Agent Tasks: Persistence Migration to DualStore](agent-tasks-persistence-migration-to-dualstore.md)
- [JavaScript](chunks/javascript.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [Migrate to Provider-Tenant Architecture](migrate-to-provider-tenant-architecture.md)
- [Cross-Language Runtime Polymorphism](cross-language-runtime-polymorphism.md)
- [Promethean Infrastructure Setup](promethean-infrastructure-setup.md)
- [api-gateway-versioning](api-gateway-versioning.md)
- [Prometheus Observability Stack](prometheus-observability-stack.md)
- [AI-Centric OS with MCP Layer](ai-centric-os-with-mcp-layer.md)
- [2d-sandbox-field](2d-sandbox-field.md)
- [heartbeat-fragment-demo](heartbeat-fragment-demo.md)
- [Agent Reflections and Prompt Evolution](agent-reflections-and-prompt-evolution.md)
- [Debugging Broker Connections and Agent Behavior](debugging-broker-connections-and-agent-behavior.md)
- [Admin Dashboard for User Management](admin-dashboard-for-user-management.md)
- [Tooling](chunks/tooling.md)
- [Board Walk – 2025-08-11](board-walk-2025-08-11.md)
- [Cross-Target Macro System in Sibilant](cross-target-macro-system-in-sibilant.md)
- [i3-bluetooth-setup](i3-bluetooth-setup.md)
- [Local-Offline-Model-Deployment-Strategy](local-offline-model-deployment-strategy.md)
- [Canonical Org-Babel Matplotlib Animation Template](canonical-org-babel-matplotlib-animation-template.md)
- [Math Fundamentals](chunks/math-fundamentals.md)
- [compiler-kit-foundations](compiler-kit-foundations.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [Per-Domain Policy System for JS Crawler](per-domain-policy-system-for-js-crawler.md)
- [plan-update-confirmation](plan-update-confirmation.md)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler](ollama-llm-provider-for-pseudo-code-transpiler.md)
- [Factorio AI with External Agents](factorio-ai-with-external-agents.md)
- [Promethean Agent Config DSL](promethean-agent-config-dsl.md)
- [Exception Layer Analysis](exception-layer-analysis.md)
- [Promethean-Copilot-Intent-Engine](promethean-copilot-intent-engine.md)
- [ParticleSimulationWithCanvasAndFFmpeg](particlesimulationwithcanvasandffmpeg.md)
- [polymorphic-meta-programming-engine](polymorphic-meta-programming-engine.md)
- [Local-First Intention→Code Loop with Free Models](local-first-intention-code-loop-with-free-models.md)
- [Performance-Optimized-Polyglot-Bridge](performance-optimized-polyglot-bridge.md)
- [Shared](chunks/shared.md)
- [i3-config-validation-methods](i3-config-validation-methods.md)
- [EidolonField](eidolonfield.md)
- [balanced-bst](balanced-bst.md)
- [Model Selection for Lightweight Conversational Tasks](model-selection-for-lightweight-conversational-tasks.md)
- [obsidian-ignore-node-modules-regex](obsidian-ignore-node-modules-regex.md)
- [eidolon-node-lifecycle](eidolon-node-lifecycle.md)
- [Simulation Demo](chunks/simulation-demo.md)
- [field-dynamics-math-blocks](field-dynamics-math-blocks.md)
- [field-interaction-equations](field-interaction-equations.md)
- [field-node-diagram-outline](field-node-diagram-outline.md)
- [Window Management](chunks/window-management.md)
- [markdown-to-org-transpiler](markdown-to-org-transpiler.md)
- [Duck's Self-Referential Perceptual Loop](ducks-self-referential-perceptual-loop.md)
- [Eidolon Field Abstract Model](eidolon-field-abstract-model.md)
- [AI-First-OS-Model-Context-Protocol](ai-first-os-model-context-protocol.md)
- [Obsidian Templating Plugins Integration Guide](obsidian-templating-plugins-integration-guide.md)
- [Matplotlib Animation with Async Execution](matplotlib-animation-with-async-execution.md)
- [promethean-system-diagrams](promethean-system-diagrams.md)
- [graph-ds](graph-ds.md)
- [Promethean-native config design](promethean-native-config-design.md)
- [Promethean Web UI Setup](promethean-web-ui-setup.md)
- [Prompt_Folder_Bootstrap](prompt-folder-bootstrap.md)
- [Board Automation Improvements](board-automation-improvements.md)
- [heartbeat-simulation-snippets](heartbeat-simulation-snippets.md)
- [field-node-diagram-visualizations](field-node-diagram-visualizations.md)
- [field-node-diagram-set](field-node-diagram-set.md)
- [Promethean_Eidolon_Synchronicity_Model](promethean-eidolon-synchronicity-model.md)
- [prompt-programming-language-lisp](prompt-programming-language-lisp.md)
- [Duck's Attractor States](ducks-attractor-states.md)
- [Lispy Macros with syntax-rules](lispy-macros-with-syntax-rules.md)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop](polyglot-s-expr-bridge-python-js-lisp-interop.md)
- [Local-Only-LLM-Workflow](local-only-llm-workflow.md)
- [Lisp-Compiler-Integration](lisp-compiler-integration.md)
- [Fnord Tracer Protocol](fnord-tracer-protocol.md)
- [Protocol_0_The_Contradiction_Engine](protocol-0-the-contradiction-engine.md)
- [Creative Moments](creative-moments.md)
- [Obsidian ChatGPT Plugin Integration](obsidian-chatgpt-plugin-integration.md)
- [homeostasis-decay-formulas](homeostasis-decay-formulas.md)
- [layer-1-uptime-diagrams](layer-1-uptime-diagrams.md)
- [Shared Package Structure](shared-package-structure.md)
- [Provider-Agnostic Chat Panel Implementation](provider-agnostic-chat-panel-implementation.md)
- [Language-Agnostic Mirror System](language-agnostic-mirror-system.md)
- [lisp-dsl-for-window-management](lisp-dsl-for-window-management.md)
- [ripple-propagation-demo](ripple-propagation-demo.md)
- [Promethean Workflow Optimization](promethean-workflow-optimization.md)
- [Pure-Node Crawl Stack with Playwright and Crawlee](pure-node-crawl-stack-with-playwright-and-crawlee.md)
- [Interop and Source Maps](interop-and-source-maps.md)
- [RAG UI Panel with Qdrant and PostgREST](rag-ui-panel-with-qdrant-and-postgrest.md)
- [Functional Embedding Pipeline Refactor](functional-embedding-pipeline-refactor.md)
- [Chroma-Embedding-Refactor](chroma-embedding-refactor.md)
- [sibilant-macro-targets](sibilant-macro-targets.md)
- [komorebi-group-window-hack](komorebi-group-window-hack.md)
- [Pure TypeScript Search Microservice](pure-typescript-search-microservice.md)
- [Self-Agency in AI Interaction](self-agency-in-ai-interaction.md)
- [set-assignment-in-lisp-ast](set-assignment-in-lisp-ast.md)
- [shared-package-layout-clarification](shared-package-layout-clarification.md)
- [Sibilant Meta-Prompt DSL](sibilant-meta-prompt-dsl.md)
- [DuckDuckGoSearchPipeline](duckduckgosearchpipeline.md)
- [universal-intention-code-fabric](universal-intention-code-fabric.md)
- [template-based-compilation](template-based-compilation.md)
- [ts-to-lisp-transpiler](ts-to-lisp-transpiler.md)
- [Refactor Frontmatter Processing](refactor-frontmatter-processing.md)
- [Model Upgrade Calm-Down Guide](model-upgrade-calm-down-guide.md)
- [typed-struct-compiler](typed-struct-compiler.md)
- [Promethean Dev Workflow Update](promethean-dev-workflow-update.md)
- [pm2-orchestration-patterns](pm2-orchestration-patterns.md)
- [TypeScript Patch for Tool Calling Support](typescript-patch-for-tool-calling-support.md)
- [Layer1SurvivabilityEnvelope](layer1survivabilityenvelope.md)
- [Voice Access Layer Design](voice-access-layer-design.md)
- [Ghostly Smoke Interference](ghostly-smoke-interference.md)
- [Universal Lisp Interface](universal-lisp-interface.md)
- [Promethean Pipelines](promethean-pipelines.md)
- [System Scheduler with Resource-Aware DAG](system-scheduler-with-resource-aware-dag.md)
- [Redirecting Standard Error](redirecting-standard-error.md)
- [refactor-relations](refactor-relations.md)
- [Promethean Documentation Pipeline Overview](promethean-documentation-pipeline-overview.md)
- [zero-copy-snapshots-and-workers](zero-copy-snapshots-and-workers.md)
- [Ice Box Reorganization](ice-box-reorganization.md)
- [Recursive Prompt Construction Engine](recursive-prompt-construction-engine.md)
- [windows-tiling-with-autohotkey](windows-tiling-with-autohotkey.md)
- [sibilant-metacompiler-overview](sibilant-metacompiler-overview.md)
- [Vectorial Exception Descent](vectorial-exception-descent.md)
- [polyglot-repl-interface-layer](polyglot-repl-interface-layer.md)
## Sources
- [Services — L3](chunks/services.md#^ref-75ea4a6a-3-0) (line 3, col 0, score 0.84)
- [Unique Info Dump Index — L37](unique-info-dump-index.md#^ref-30ec3ba6-37-0) (line 37, col 0, score 0.84)
- [compiler-kit-foundations — L1](compiler-kit-foundations.md#^ref-01b21543-1-0) (line 1, col 0, score 0.73)
- [ecs-offload-workers — L1](ecs-offload-workers.md#^ref-6498b9d7-1-0) (line 1, col 0, score 0.73)
- [template-based-compilation — L1](template-based-compilation.md#^ref-f8877e5e-1-0) (line 1, col 0, score 0.73)
- [promethean-system-diagrams — L1](promethean-system-diagrams.md#^ref-b51e19b4-1-0) (line 1, col 0, score 0.72)
- [aionian-circuit-math — L1](aionian-circuit-math.md#^ref-f2d83a77-1-0) (line 1, col 0, score 0.72)
- [ts-to-lisp-transpiler — L1](ts-to-lisp-transpiler.md#^ref-ba11486b-1-0) (line 1, col 0, score 0.72)
- [Event Bus Projections Architecture — L1](event-bus-projections-architecture.md#^ref-cf6b9b17-1-0) (line 1, col 0, score 0.72)
- [archetype-ecs — L1](archetype-ecs.md#^ref-8f4c1e86-1-0) (line 1, col 0, score 0.71)
- [schema-evolution-workflow — L1](schema-evolution-workflow.md#^ref-d8059b6a-1-0) (line 1, col 0, score 0.71)
- [layer-1-uptime-diagrams — L1](layer-1-uptime-diagrams.md#^ref-4127189a-1-0) (line 1, col 0, score 0.71)
- [Interop and Source Maps — L1](interop-and-source-maps.md#^ref-cdfac40c-1-0) (line 1, col 0, score 0.7)
- [graph-ds — L1](graph-ds.md#^ref-6620e2f2-1-0) (line 1, col 0, score 0.7)
- [Stateful Partitions and Rebalancing — L3](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-3-0) (line 3, col 0, score 0.61)
- [WebSocket Gateway Implementation — L625](websocket-gateway-implementation.md#^ref-e811123d-625-0) (line 625, col 0, score 0.68)
- [State Snapshots API and Transactional Projector — L3](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-3-0) (line 3, col 0, score 0.62)
- [schema-evolution-workflow — L3](schema-evolution-workflow.md#^ref-d8059b6a-3-0) (line 3, col 0, score 0.71)
- [Agent Tasks: Persistence Migration to DualStore — L152](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-152-0) (line 152, col 0, score 0.66)
- [api-gateway-versioning — L294](api-gateway-versioning.md#^ref-0580dcd3-294-0) (line 294, col 0, score 0.66)
- [Chroma Toolkit Consolidation Plan — L191](chroma-toolkit-consolidation-plan.md#^ref-5020e892-191-0) (line 191, col 0, score 0.66)
- [Services — L11](chunks/services.md#^ref-75ea4a6a-11-0) (line 11, col 0, score 0.66)
- [Cross-Language Runtime Polymorphism — L228](cross-language-runtime-polymorphism.md#^ref-c34c36a6-228-0) (line 228, col 0, score 0.66)
- [ecs-offload-workers — L465](ecs-offload-workers.md#^ref-6498b9d7-465-0) (line 465, col 0, score 0.7)
- [Event Bus MVP — L392](event-bus-mvp.md#^ref-534fe91d-392-0) (line 392, col 0, score 0.67)
- [Event Bus MVP — L7](event-bus-mvp.md#^ref-534fe91d-7-0) (line 7, col 0, score 0.69)
- [Promethean Event Bus MVP v0.1 — L747](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-747-0) (line 747, col 0, score 0.67)
- [Promethean Event Bus MVP v0.1 — L423](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-423-0) (line 423, col 0, score 0.73)
- [prom-lib-rate-limiters-and-replay-api — L186](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-186-0) (line 186, col 0, score 0.69)
- [schema-evolution-workflow — L146](schema-evolution-workflow.md#^ref-d8059b6a-146-0) (line 146, col 0, score 0.73)
- [State Snapshots API and Transactional Projector — L93](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-93-0) (line 93, col 0, score 0.66)
- [Stateful Partitions and Rebalancing — L351](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-351-0) (line 351, col 0, score 0.64)
- [Event Bus MVP — L284](event-bus-mvp.md#^ref-534fe91d-284-0) (line 284, col 0, score 0.8)
- [schema-evolution-workflow — L161](schema-evolution-workflow.md#^ref-d8059b6a-161-0) (line 161, col 0, score 0.7)
- [Promethean Event Bus MVP v0.1 — L28](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-28-0) (line 28, col 0, score 0.71)
- [Promethean Event Bus MVP v0.1 — L510](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-510-0) (line 510, col 0, score 0.61)
- [Promethean Event Bus MVP v0.1 — L572](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-572-0) (line 572, col 0, score 0.72)
- [Stateful Partitions and Rebalancing — L166](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-166-0) (line 166, col 0, score 0.78)
- [WebSocket Gateway Implementation — L473](websocket-gateway-implementation.md#^ref-e811123d-473-0) (line 473, col 0, score 0.7)
- [Event Bus MVP — L258](event-bus-mvp.md#^ref-534fe91d-258-0) (line 258, col 0, score 0.74)
- [Stateful Partitions and Rebalancing — L101](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-101-0) (line 101, col 0, score 0.6)
- [prom-lib-rate-limiters-and-replay-api — L282](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-282-0) (line 282, col 0, score 0.71)
- [prom-lib-rate-limiters-and-replay-api — L226](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-226-0) (line 226, col 0, score 0.59)
- [prom-lib-rate-limiters-and-replay-api — L260](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-260-0) (line 260, col 0, score 0.71)
- [schema-evolution-workflow — L201](schema-evolution-workflow.md#^ref-d8059b6a-201-0) (line 201, col 0, score 0.73)
- [State Snapshots API and Transactional Projector — L248](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-248-0) (line 248, col 0, score 0.7)
- [Stateful Partitions and Rebalancing — L267](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-267-0) (line 267, col 0, score 0.73)
- [prom-lib-rate-limiters-and-replay-api — L194](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-194-0) (line 194, col 0, score 0.72)
- [schema-evolution-workflow — L243](schema-evolution-workflow.md#^ref-d8059b6a-243-0) (line 243, col 0, score 0.72)
- [WebSocket Gateway Implementation — L333](websocket-gateway-implementation.md#^ref-e811123d-333-0) (line 333, col 0, score 0.73)
- [schema-evolution-workflow — L289](schema-evolution-workflow.md#^ref-d8059b6a-289-0) (line 289, col 0, score 0.71)
- [State Snapshots API and Transactional Projector — L132](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-132-0) (line 132, col 0, score 0.76)
- [Promethean Event Bus MVP v0.1 — L604](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-604-0) (line 604, col 0, score 0.66)
- [Promethean Event Bus MVP v0.1 — L259](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-259-0) (line 259, col 0, score 0.63)
- [RAG UI Panel with Qdrant and PostgREST — L172](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-172-0) (line 172, col 0, score 0.63)
- [refactor-relations — L10](refactor-relations.md#^ref-41ce0216-10-0) (line 10, col 0, score 0.63)
- [Functional Embedding Pipeline Refactor — L31](functional-embedding-pipeline-refactor.md#^ref-a4a25141-31-0) (line 31, col 0, score 0.63)
- [Event Bus Projections Architecture — L108](event-bus-projections-architecture.md#^ref-cf6b9b17-108-0) (line 108, col 0, score 0.61)
- [ecs-scheduler-and-prefabs — L7](ecs-scheduler-and-prefabs.md#^ref-c62a1815-7-0) (line 7, col 0, score 0.62)
- [System Scheduler with Resource-Aware DAG — L5](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-5-0) (line 5, col 0, score 0.62)
- [zero-copy-snapshots-and-workers — L238](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-238-0) (line 238, col 0, score 0.62)
- [Chroma-Embedding-Refactor — L111](chroma-embedding-refactor.md#^ref-8b256935-111-0) (line 111, col 0, score 0.62)
- [Promethean Event Bus MVP v0.1 — L222](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-222-0) (line 222, col 0, score 0.7)
- [State Snapshots API and Transactional Projector — L9](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-9-0) (line 9, col 0, score 0.67)
- [zero-copy-snapshots-and-workers — L202](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-202-0) (line 202, col 0, score 0.62)
- [Chroma Toolkit Consolidation Plan — L162](chroma-toolkit-consolidation-plan.md#^ref-5020e892-162-0) (line 162, col 0, score 0.78)
- [Promethean-native config design — L32](promethean-native-config-design.md#^ref-ab748541-32-0) (line 32, col 0, score 0.61)
- [Promethean-native config design — L33](promethean-native-config-design.md#^ref-ab748541-33-0) (line 33, col 0, score 0.61)
- [Promethean-native config design — L35](promethean-native-config-design.md#^ref-ab748541-35-0) (line 35, col 0, score 0.61)
- [Chroma-Embedding-Refactor — L64](chroma-embedding-refactor.md#^ref-8b256935-64-0) (line 64, col 0, score 0.66)
- [Chroma-Embedding-Refactor — L109](chroma-embedding-refactor.md#^ref-8b256935-109-0) (line 109, col 0, score 0.66)
- [Chroma-Embedding-Refactor — L258](chroma-embedding-refactor.md#^ref-8b256935-258-0) (line 258, col 0, score 0.66)
- [Chroma Toolkit Consolidation Plan — L72](chroma-toolkit-consolidation-plan.md#^ref-5020e892-72-0) (line 72, col 0, score 0.66)
- [Chroma Toolkit Consolidation Plan — L88](chroma-toolkit-consolidation-plan.md#^ref-5020e892-88-0) (line 88, col 0, score 0.66)
- [Chroma Toolkit Consolidation Plan — L107](chroma-toolkit-consolidation-plan.md#^ref-5020e892-107-0) (line 107, col 0, score 0.66)
- [Chroma Toolkit Consolidation Plan — L148](chroma-toolkit-consolidation-plan.md#^ref-5020e892-148-0) (line 148, col 0, score 0.66)
- [Event Bus MVP — L387](event-bus-mvp.md#^ref-534fe91d-387-0) (line 387, col 0, score 0.72)
- [universal-intention-code-fabric — L27](universal-intention-code-fabric.md#^ref-c14edce7-27-0) (line 27, col 0, score 0.68)
- [WebSocket Gateway Implementation — L614](websocket-gateway-implementation.md#^ref-e811123d-614-0) (line 614, col 0, score 0.75)
- [Event Bus MVP — L385](event-bus-mvp.md#^ref-534fe91d-385-0) (line 385, col 0, score 0.74)
- [Layer1SurvivabilityEnvelope — L129](layer1survivabilityenvelope.md#^ref-64a9f9f9-129-0) (line 129, col 0, score 0.65)
- [Promethean-native config design — L354](promethean-native-config-design.md#^ref-ab748541-354-0) (line 354, col 0, score 0.64)
- [Promethean Pipelines — L77](promethean-pipelines.md#^ref-8b8e6103-77-0) (line 77, col 0, score 0.64)
- [Agent Tasks: Persistence Migration to DualStore — L81](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-81-0) (line 81, col 0, score 0.63)
- [Migrate to Provider-Tenant Architecture — L156](migrate-to-provider-tenant-architecture.md#^ref-54382370-156-0) (line 156, col 0, score 0.63)
- [Promethean Documentation Pipeline Overview — L148](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-148-0) (line 148, col 0, score 0.62)
- [Stateful Partitions and Rebalancing — L328](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-328-0) (line 328, col 0, score 0.69)
- [prom-lib-rate-limiters-and-replay-api — L71](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-71-0) (line 71, col 0, score 0.65)
- [prom-lib-rate-limiters-and-replay-api — L351](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-351-0) (line 351, col 0, score 0.7)
- [WebSocket Gateway Implementation — L219](websocket-gateway-implementation.md#^ref-e811123d-219-0) (line 219, col 0, score 0.59)
- [Promethean Event Bus MVP v0.1 — L197](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-197-0) (line 197, col 0, score 0.67)
- [Promethean Event Bus MVP v0.1 — L143](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-143-0) (line 143, col 0, score 0.66)
- [schema-evolution-workflow — L467](schema-evolution-workflow.md#^ref-d8059b6a-467-0) (line 467, col 0, score 0.66)
- [AI-Centric OS with MCP Layer — L78](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-78-0) (line 78, col 0, score 0.63)
- [Promethean Event Bus MVP v0.1 — L285](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-285-0) (line 285, col 0, score 0.66)
- [prom-lib-rate-limiters-and-replay-api — L364](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-364-0) (line 364, col 0, score 0.68)
- [WebSocket Gateway Implementation — L56](websocket-gateway-implementation.md#^ref-e811123d-56-0) (line 56, col 0, score 0.59)
- [schema-evolution-workflow — L9](schema-evolution-workflow.md#^ref-d8059b6a-9-0) (line 9, col 0, score 0.69)
- [Lispy Macros with syntax-rules — L9](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-9-0) (line 9, col 0, score 0.67)
- [universal-intention-code-fabric — L252](universal-intention-code-fabric.md#^ref-c14edce7-252-0) (line 252, col 0, score 0.66)
- [compiler-kit-foundations — L31](compiler-kit-foundations.md#^ref-01b21543-31-0) (line 31, col 0, score 0.74)
- [universal-intention-code-fabric — L68](universal-intention-code-fabric.md#^ref-c14edce7-68-0) (line 68, col 0, score 0.73)
- [WebSocket Gateway Implementation — L322](websocket-gateway-implementation.md#^ref-e811123d-322-0) (line 322, col 0, score 0.74)
- [Shared Package Structure — L117](shared-package-structure.md#^ref-66a72fc3-117-0) (line 117, col 0, score 0.68)
- [compiler-kit-foundations — L166](compiler-kit-foundations.md#^ref-01b21543-166-0) (line 166, col 0, score 0.68)
- [Promethean Event Bus MVP v0.1 — L733](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-733-0) (line 733, col 0, score 0.71)
- [Per-Domain Policy System for JS Crawler — L141](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-141-0) (line 141, col 0, score 0.71)
- [Stateful Partitions and Rebalancing — L202](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-202-0) (line 202, col 0, score 0.65)
- [universal-intention-code-fabric — L92](universal-intention-code-fabric.md#^ref-c14edce7-92-0) (line 92, col 0, score 0.67)
- [prom-lib-rate-limiters-and-replay-api — L106](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-106-0) (line 106, col 0, score 0.65)
- [Promethean Event Bus MVP v0.1 — L740](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-740-0) (line 740, col 0, score 0.64)
- [schema-evolution-workflow — L98](schema-evolution-workflow.md#^ref-d8059b6a-98-0) (line 98, col 0, score 0.67)
- [WebSocket Gateway Implementation — L52](websocket-gateway-implementation.md#^ref-e811123d-52-0) (line 52, col 0, score 0.75)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L345](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-345-0) (line 345, col 0, score 0.67)
- [plan-update-confirmation — L760](plan-update-confirmation.md#^ref-b22d79c6-760-0) (line 760, col 0, score 0.67)
- [Promethean Web UI Setup — L351](promethean-web-ui-setup.md#^ref-bc5172ca-351-0) (line 351, col 0, score 0.73)
- [Event Bus MVP — L370](event-bus-mvp.md#^ref-534fe91d-370-0) (line 370, col 0, score 0.66)
- [plan-update-confirmation — L721](plan-update-confirmation.md#^ref-b22d79c6-721-0) (line 721, col 0, score 0.65)
- [prom-lib-rate-limiters-and-replay-api — L45](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-45-0) (line 45, col 0, score 0.68)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L7](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-7-0) (line 7, col 0, score 0.59)
- [Lispy Macros with syntax-rules — L217](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-217-0) (line 217, col 0, score 0.66)
- [Per-Domain Policy System for JS Crawler — L439](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-439-0) (line 439, col 0, score 0.64)
- [schema-evolution-workflow — L71](schema-evolution-workflow.md#^ref-d8059b6a-71-0) (line 71, col 0, score 0.65)
- [Per-Domain Policy System for JS Crawler — L184](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-184-0) (line 184, col 0, score 0.62)
- [universal-intention-code-fabric — L149](universal-intention-code-fabric.md#^ref-c14edce7-149-0) (line 149, col 0, score 0.65)
- [prom-lib-rate-limiters-and-replay-api — L63](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-63-0) (line 63, col 0, score 0.7)
- [prom-lib-rate-limiters-and-replay-api — L43](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-43-0) (line 43, col 0, score 0.7)
- [Promethean Event Bus MVP v0.1 — L141](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-141-0) (line 141, col 0, score 0.67)
- [Promethean Event Bus MVP v0.1 — L147](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-147-0) (line 147, col 0, score 0.66)
- [ecs-offload-workers — L434](ecs-offload-workers.md#^ref-6498b9d7-434-0) (line 434, col 0, score 0.67)
- [Event Bus MVP — L532](event-bus-mvp.md#^ref-534fe91d-532-0) (line 532, col 0, score 0.69)
- [schema-evolution-workflow — L465](schema-evolution-workflow.md#^ref-d8059b6a-465-0) (line 465, col 0, score 0.65)
- [AI-Centric OS with MCP Layer — L11](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-11-0) (line 11, col 0, score 0.65)
- [AI-Centric OS with MCP Layer — L18](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-18-0) (line 18, col 0, score 0.65)
- [Migrate to Provider-Tenant Architecture — L86](migrate-to-provider-tenant-architecture.md#^ref-54382370-86-0) (line 86, col 0, score 0.63)
- [Promethean Event Bus MVP v0.1 — L294](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-294-0) (line 294, col 0, score 0.68)
- [Promethean-native config design — L297](promethean-native-config-design.md#^ref-ab748541-297-0) (line 297, col 0, score 0.63)
- [Promethean Web UI Setup — L44](promethean-web-ui-setup.md#^ref-bc5172ca-44-0) (line 44, col 0, score 0.69)
- [Migrate to Provider-Tenant Architecture — L24](migrate-to-provider-tenant-architecture.md#^ref-54382370-24-0) (line 24, col 0, score 0.61)
- [ecs-offload-workers — L435](ecs-offload-workers.md#^ref-6498b9d7-435-0) (line 435, col 0, score 0.61)
- [plan-update-confirmation — L771](plan-update-confirmation.md#^ref-b22d79c6-771-0) (line 771, col 0, score 0.61)
- [Local-Only-LLM-Workflow — L161](local-only-llm-workflow.md#^ref-9a8ab57e-161-0) (line 161, col 0, score 0.61)
- [plan-update-confirmation — L880](plan-update-confirmation.md#^ref-b22d79c6-880-0) (line 880, col 0, score 0.61)
- [plan-update-confirmation — L730](plan-update-confirmation.md#^ref-b22d79c6-730-0) (line 730, col 0, score 0.6)
- [plan-update-confirmation — L945](plan-update-confirmation.md#^ref-b22d79c6-945-0) (line 945, col 0, score 0.6)
- [plan-update-confirmation — L823](plan-update-confirmation.md#^ref-b22d79c6-823-0) (line 823, col 0, score 0.6)
- [plan-update-confirmation — L832](plan-update-confirmation.md#^ref-b22d79c6-832-0) (line 832, col 0, score 0.6)
- [plan-update-confirmation — L776](plan-update-confirmation.md#^ref-b22d79c6-776-0) (line 776, col 0, score 0.6)
- [plan-update-confirmation — L738](plan-update-confirmation.md#^ref-b22d79c6-738-0) (line 738, col 0, score 0.6)
- [prom-lib-rate-limiters-and-replay-api — L90](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-90-0) (line 90, col 0, score 0.84)
- [schema-evolution-workflow — L130](schema-evolution-workflow.md#^ref-d8059b6a-130-0) (line 130, col 0, score 0.84)
- [schema-evolution-workflow — L222](schema-evolution-workflow.md#^ref-d8059b6a-222-0) (line 222, col 0, score 0.84)
- [State Snapshots API and Transactional Projector — L233](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-233-0) (line 233, col 0, score 0.84)
- [Stateful Partitions and Rebalancing — L185](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-185-0) (line 185, col 0, score 0.74)
- [Dynamic Context Model for Web Components — L376](dynamic-context-model-for-web-components.md#^ref-f7702bf8-376-0) (line 376, col 0, score 0.72)
- [Stateful Partitions and Rebalancing — L326](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-326-0) (line 326, col 0, score 0.7)
- [i3-bluetooth-setup — L37](i3-bluetooth-setup.md#^ref-5e408692-37-0) (line 37, col 0, score 0.68)
- [Factorio AI with External Agents — L29](factorio-ai-with-external-agents.md#^ref-a4d90289-29-0) (line 29, col 0, score 0.65)
- [Event Bus Projections Architecture — L3](event-bus-projections-architecture.md#^ref-cf6b9b17-3-0) (line 3, col 0, score 0.65)
- [Local-Offline-Model-Deployment-Strategy — L246](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-246-0) (line 246, col 0, score 0.61)
- [Voice Access Layer Design — L102](voice-access-layer-design.md#^ref-543ed9b3-102-0) (line 102, col 0, score 0.6)
- [universal-intention-code-fabric — L9](universal-intention-code-fabric.md#^ref-c14edce7-9-0) (line 9, col 0, score 0.69)
- [Promethean Web UI Setup — L581](promethean-web-ui-setup.md#^ref-bc5172ca-581-0) (line 581, col 0, score 0.68)
- [schema-evolution-workflow — L132](schema-evolution-workflow.md#^ref-d8059b6a-132-0) (line 132, col 0, score 0.68)
- [RAG UI Panel with Qdrant and PostgREST — L336](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-336-0) (line 336, col 0, score 0.66)
- [prom-lib-rate-limiters-and-replay-api — L92](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-92-0) (line 92, col 0, score 0.65)
- [Stateful Partitions and Rebalancing — L187](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-187-0) (line 187, col 0, score 0.65)
- [Promethean Event Bus MVP v0.1 — L832](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-832-0) (line 832, col 0, score 0.64)
- [Promethean Agent Config DSL — L239](promethean-agent-config-dsl.md#^ref-2c00ce45-239-0) (line 239, col 0, score 0.64)
- [compiler-kit-foundations — L15](compiler-kit-foundations.md#^ref-01b21543-15-0) (line 15, col 0, score 0.64)
- [Redirecting Standard Error — L7](redirecting-standard-error.md#^ref-b3555ede-7-0) (line 7, col 0, score 0.63)
- [Event Bus Projections Architecture — L54](event-bus-projections-architecture.md#^ref-cf6b9b17-54-0) (line 54, col 0, score 0.63)
- [Promethean Infrastructure Setup — L501](promethean-infrastructure-setup.md#^ref-6deed6ac-501-0) (line 501, col 0, score 0.63)
- [Promethean Pipelines — L58](promethean-pipelines.md#^ref-8b8e6103-58-0) (line 58, col 0, score 0.63)
- [prom-lib-rate-limiters-and-replay-api — L368](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-368-0) (line 368, col 0, score 0.67)
- [prom-lib-rate-limiters-and-replay-api — L329](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-329-0) (line 329, col 0, score 0.68)
- [Event Bus MVP — L359](event-bus-mvp.md#^ref-534fe91d-359-0) (line 359, col 0, score 0.68)
- [State Snapshots API and Transactional Projector — L177](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-177-0) (line 177, col 0, score 0.67)
- [Migrate to Provider-Tenant Architecture — L105](migrate-to-provider-tenant-architecture.md#^ref-54382370-105-0) (line 105, col 0, score 0.66)
- [WebSocket Gateway Implementation — L318](websocket-gateway-implementation.md#^ref-e811123d-318-0) (line 318, col 0, score 0.66)
- [Chroma Toolkit Consolidation Plan — L66](chroma-toolkit-consolidation-plan.md#^ref-5020e892-66-0) (line 66, col 0, score 0.63)
- [Stateful Partitions and Rebalancing — L342](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-342-0) (line 342, col 0, score 0.62)
- [Event Bus MVP — L536](event-bus-mvp.md#^ref-534fe91d-536-0) (line 536, col 0, score 0.62)
- [Stateful Partitions and Rebalancing — L164](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-164-0) (line 164, col 0, score 0.62)
- [State Snapshots API and Transactional Projector — L179](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-179-0) (line 179, col 0, score 0.74)
- [Stateful Partitions and Rebalancing — L448](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-448-0) (line 448, col 0, score 0.8)
- [WebSocket Gateway Implementation — L533](websocket-gateway-implementation.md#^ref-e811123d-533-0) (line 533, col 0, score 0.75)
- [Stateful Partitions and Rebalancing — L417](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-417-0) (line 417, col 0, score 0.74)
- [schema-evolution-workflow — L393](schema-evolution-workflow.md#^ref-d8059b6a-393-0) (line 393, col 0, score 0.59)
- [Event Bus MVP — L99](event-bus-mvp.md#^ref-534fe91d-99-0) (line 99, col 0, score 0.7)
- [typed-struct-compiler — L16](typed-struct-compiler.md#^ref-78eeedf7-16-0) (line 16, col 0, score 0.63)
- [schema-evolution-workflow — L29](schema-evolution-workflow.md#^ref-d8059b6a-29-0) (line 29, col 0, score 0.63)
- [Exception Layer Analysis — L34](exception-layer-analysis.md#^ref-21d5cc09-34-0) (line 34, col 0, score 0.62)
- [Promethean Agent Config DSL — L19](promethean-agent-config-dsl.md#^ref-2c00ce45-19-0) (line 19, col 0, score 0.61)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L359](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-359-0) (line 359, col 0, score 0.66)
- [Stateful Partitions and Rebalancing — L290](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-290-0) (line 290, col 0, score 0.68)
- [observability-infrastructure-setup — L31](observability-infrastructure-setup.md#^ref-b4e64f8c-31-0) (line 31, col 0, score 0.79)
- [observability-infrastructure-setup — L348](observability-infrastructure-setup.md#^ref-b4e64f8c-348-0) (line 348, col 0, score 0.74)
- [WebSocket Gateway Implementation — L615](websocket-gateway-implementation.md#^ref-e811123d-615-0) (line 615, col 0, score 0.71)
- [Model Upgrade Calm-Down Guide — L29](model-upgrade-calm-down-guide.md#^ref-db74343f-29-0) (line 29, col 0, score 0.67)
- [Promethean-Copilot-Intent-Engine — L4](promethean-copilot-intent-engine.md#^ref-ae24a280-4-0) (line 4, col 0, score 0.67)
- [Event Bus MVP — L538](event-bus-mvp.md#^ref-534fe91d-538-0) (line 538, col 0, score 0.67)
- [Model Upgrade Calm-Down Guide — L56](model-upgrade-calm-down-guide.md#^ref-db74343f-56-0) (line 56, col 0, score 0.66)
- [Promethean Dev Workflow Update — L25](promethean-dev-workflow-update.md#^ref-03a5578f-25-0) (line 25, col 0, score 0.66)
- [Promethean-native config design — L1](promethean-native-config-design.md#^ref-ab748541-1-0) (line 1, col 0, score 0.66)
- [Prometheus Observability Stack — L488](prometheus-observability-stack.md#^ref-e90b5a16-488-0) (line 488, col 0, score 0.66)
- [WebSocket Gateway Implementation — L628](websocket-gateway-implementation.md#^ref-e811123d-628-0) (line 628, col 0, score 0.73)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L8](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-8-0) (line 8, col 0, score 0.7)
- [ecs-offload-workers — L209](ecs-offload-workers.md#^ref-6498b9d7-209-0) (line 209, col 0, score 0.69)
- [ParticleSimulationWithCanvasAndFFmpeg — L1](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-1-0) (line 1, col 0, score 0.68)
- [universal-intention-code-fabric — L406](universal-intention-code-fabric.md#^ref-c14edce7-406-0) (line 406, col 0, score 0.68)
- [Provider-Agnostic Chat Panel Implementation — L13](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-13-0) (line 13, col 0, score 0.66)
- [Stateful Partitions and Rebalancing — L511](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-511-0) (line 511, col 0, score 0.66)
- [pm2-orchestration-patterns — L129](pm2-orchestration-patterns.md#^ref-51932e7b-129-0) (line 129, col 0, score 0.66)
- [TypeScript Patch for Tool Calling Support — L67](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-67-0) (line 67, col 0, score 0.66)
- [typed-struct-compiler — L10](typed-struct-compiler.md#^ref-78eeedf7-10-0) (line 10, col 0, score 0.66)
- [Language-Agnostic Mirror System — L507](language-agnostic-mirror-system.md#^ref-d2b3628c-507-0) (line 507, col 0, score 0.66)
- [ecs-offload-workers — L169](ecs-offload-workers.md#^ref-6498b9d7-169-0) (line 169, col 0, score 0.72)
- [Promethean Event Bus MVP v0.1 — L697](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-697-0) (line 697, col 0, score 0.72)
- [WebSocket Gateway Implementation — L387](websocket-gateway-implementation.md#^ref-e811123d-387-0) (line 387, col 0, score 0.73)
- [Cross-Language Runtime Polymorphism — L56](cross-language-runtime-polymorphism.md#^ref-c34c36a6-56-0) (line 56, col 0, score 0.71)
- [Cross-Language Runtime Polymorphism — L38](cross-language-runtime-polymorphism.md#^ref-c34c36a6-38-0) (line 38, col 0, score 0.69)
- [Refactor Frontmatter Processing — L11](refactor-frontmatter-processing.md#^ref-cfbdca2f-11-0) (line 11, col 0, score 0.69)
- [ecs-offload-workers — L75](ecs-offload-workers.md#^ref-6498b9d7-75-0) (line 75, col 0, score 0.67)
- [compiler-kit-foundations — L359](compiler-kit-foundations.md#^ref-01b21543-359-0) (line 359, col 0, score 0.67)
- [Promethean Event Bus MVP v0.1 — L235](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-235-0) (line 235, col 0, score 0.71)
- [typed-struct-compiler — L8](typed-struct-compiler.md#^ref-78eeedf7-8-0) (line 8, col 0, score 0.67)
- [prom-lib-rate-limiters-and-replay-api — L250](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-250-0) (line 250, col 0, score 0.65)
- [Promethean Infrastructure Setup — L392](promethean-infrastructure-setup.md#^ref-6deed6ac-392-0) (line 392, col 0, score 0.64)
- [ecs-scheduler-and-prefabs — L338](ecs-scheduler-and-prefabs.md#^ref-c62a1815-338-0) (line 338, col 0, score 0.65)
- [Prompt_Folder_Bootstrap — L24](prompt-folder-bootstrap.md#^ref-bd4f0976-24-0) (line 24, col 0, score 0.65)
- [Prompt_Folder_Bootstrap — L42](prompt-folder-bootstrap.md#^ref-bd4f0976-42-0) (line 42, col 0, score 0.63)
- [Prompt_Folder_Bootstrap — L66](prompt-folder-bootstrap.md#^ref-bd4f0976-66-0) (line 66, col 0, score 0.63)
- [Prompt_Folder_Bootstrap — L84](prompt-folder-bootstrap.md#^ref-bd4f0976-84-0) (line 84, col 0, score 0.63)
- [Prompt_Folder_Bootstrap — L103](prompt-folder-bootstrap.md#^ref-bd4f0976-103-0) (line 103, col 0, score 0.63)
- [Prompt_Folder_Bootstrap — L130](prompt-folder-bootstrap.md#^ref-bd4f0976-130-0) (line 130, col 0, score 0.63)
- [Prompt_Folder_Bootstrap — L152](prompt-folder-bootstrap.md#^ref-bd4f0976-152-0) (line 152, col 0, score 0.63)
- [System Scheduler with Resource-Aware DAG — L336](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-336-0) (line 336, col 0, score 0.63)
- [Language-Agnostic Mirror System — L235](language-agnostic-mirror-system.md#^ref-d2b3628c-235-0) (line 235, col 0, score 0.63)
- [Promethean Event Bus MVP v0.1 — L3](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-3-0) (line 3, col 0, score 0.67)
- [Promethean Event Bus MVP v0.1 — L340](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-340-0) (line 340, col 0, score 0.67)
- [WebSocket Gateway Implementation — L560](websocket-gateway-implementation.md#^ref-e811123d-560-0) (line 560, col 0, score 0.81)
- [State Snapshots API and Transactional Projector — L218](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-218-0) (line 218, col 0, score 0.71)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L194](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-194-0) (line 194, col 0, score 0.66)
- [Provider-Agnostic Chat Panel Implementation — L183](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-183-0) (line 183, col 0, score 0.68)
- [polymorphic-meta-programming-engine — L111](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-111-0) (line 111, col 0, score 0.61)
- [Dynamic Context Model for Web Components — L293](dynamic-context-model-for-web-components.md#^ref-f7702bf8-293-0) (line 293, col 0, score 0.6)
- [Local-First Intention→Code Loop with Free Models — L47](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-47-0) (line 47, col 0, score 0.6)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L132](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-132-0) (line 132, col 0, score 0.6)
- [plan-update-confirmation — L623](plan-update-confirmation.md#^ref-b22d79c6-623-0) (line 623, col 0, score 0.6)
- [i3-bluetooth-setup — L57](i3-bluetooth-setup.md#^ref-5e408692-57-0) (line 57, col 0, score 0.6)
- [plan-update-confirmation — L496](plan-update-confirmation.md#^ref-b22d79c6-496-0) (line 496, col 0, score 0.6)
- [plan-update-confirmation — L554](plan-update-confirmation.md#^ref-b22d79c6-554-0) (line 554, col 0, score 0.59)
- [Event Bus MVP — L509](event-bus-mvp.md#^ref-534fe91d-509-0) (line 509, col 0, score 0.78)
- [schema-evolution-workflow — L450](schema-evolution-workflow.md#^ref-d8059b6a-450-0) (line 450, col 0, score 0.74)
- [State Snapshots API and Transactional Projector — L303](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-303-0) (line 303, col 0, score 0.7)
- [Stateful Partitions and Rebalancing — L499](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-499-0) (line 499, col 0, score 0.69)
- [WebSocket Gateway Implementation — L595](websocket-gateway-implementation.md#^ref-e811123d-595-0) (line 595, col 0, score 0.69)
- [archetype-ecs — L441](archetype-ecs.md#^ref-8f4c1e86-441-0) (line 441, col 0, score 0.68)
- [graph-ds — L343](graph-ds.md#^ref-6620e2f2-343-0) (line 343, col 0, score 0.67)
- [ecs-scheduler-and-prefabs — L368](ecs-scheduler-and-prefabs.md#^ref-c62a1815-368-0) (line 368, col 0, score 0.63)
- [System Scheduler with Resource-Aware DAG — L366](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-366-0) (line 366, col 0, score 0.63)
- [template-based-compilation — L90](template-based-compilation.md#^ref-f8877e5e-90-0) (line 90, col 0, score 0.63)
- [Voice Access Layer Design — L106](voice-access-layer-design.md#^ref-543ed9b3-106-0) (line 106, col 0, score 0.63)
- [AI-Centric OS with MCP Layer — L30](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-30-0) (line 30, col 0, score 0.62)
- [sibilant-macro-targets — L46](sibilant-macro-targets.md#^ref-c5c9a5c6-46-0) (line 46, col 0, score 0.62)
- [Event Bus MVP — L383](event-bus-mvp.md#^ref-534fe91d-383-0) (line 383, col 0, score 0.69)
- [Agent Tasks: Persistence Migration to DualStore — L72](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-72-0) (line 72, col 0, score 0.69)
- [Agent Tasks: Persistence Migration to DualStore — L26](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-26-0) (line 26, col 0, score 0.69)
- [Migrate to Provider-Tenant Architecture — L231](migrate-to-provider-tenant-architecture.md#^ref-54382370-231-0) (line 231, col 0, score 0.68)
- [Performance-Optimized-Polyglot-Bridge — L10](performance-optimized-polyglot-bridge.md#^ref-f5579967-10-0) (line 10, col 0, score 0.67)
- [Migrate to Provider-Tenant Architecture — L201](migrate-to-provider-tenant-architecture.md#^ref-54382370-201-0) (line 201, col 0, score 0.67)
- [Shared Package Structure — L147](shared-package-structure.md#^ref-66a72fc3-147-0) (line 147, col 0, score 0.67)
- [Migrate to Provider-Tenant Architecture — L160](migrate-to-provider-tenant-architecture.md#^ref-54382370-160-0) (line 160, col 0, score 0.66)
- [Dynamic Context Model for Web Components — L325](dynamic-context-model-for-web-components.md#^ref-f7702bf8-325-0) (line 325, col 0, score 0.66)
- [WebSocket Gateway Implementation — L612](websocket-gateway-implementation.md#^ref-e811123d-612-0) (line 612, col 0, score 0.64)
- [Dynamic Context Model for Web Components — L154](dynamic-context-model-for-web-components.md#^ref-f7702bf8-154-0) (line 154, col 0, score 0.63)
- [observability-infrastructure-setup — L44](observability-infrastructure-setup.md#^ref-b4e64f8c-44-0) (line 44, col 0, score 0.62)
- [Shared — L3](chunks/shared.md#^ref-623a55f7-3-0) (line 3, col 0, score 0.62)
- [Migrate to Provider-Tenant Architecture — L261](migrate-to-provider-tenant-architecture.md#^ref-54382370-261-0) (line 261, col 0, score 0.61)
- [Dynamic Context Model for Web Components — L116](dynamic-context-model-for-web-components.md#^ref-f7702bf8-116-0) (line 116, col 0, score 0.61)
- [Chroma Toolkit Consolidation Plan — L146](chroma-toolkit-consolidation-plan.md#^ref-5020e892-146-0) (line 146, col 0, score 0.67)
- [Local-Only-LLM-Workflow — L160](local-only-llm-workflow.md#^ref-9a8ab57e-160-0) (line 160, col 0, score 0.67)
- [Promethean Web UI Setup — L40](promethean-web-ui-setup.md#^ref-bc5172ca-40-0) (line 40, col 0, score 0.67)
- [WebSocket Gateway Implementation — L613](websocket-gateway-implementation.md#^ref-e811123d-613-0) (line 613, col 0, score 0.66)
- [plan-update-confirmation — L640](plan-update-confirmation.md#^ref-b22d79c6-640-0) (line 640, col 0, score 0.66)
- [plan-update-confirmation — L647](plan-update-confirmation.md#^ref-b22d79c6-647-0) (line 647, col 0, score 0.65)
- [WebSocket Gateway Implementation — L626](websocket-gateway-implementation.md#^ref-e811123d-626-0) (line 626, col 0, score 0.65)
- [Promethean-native config design — L29](promethean-native-config-design.md#^ref-ab748541-29-0) (line 29, col 0, score 0.73)
- [Migrate to Provider-Tenant Architecture — L44](migrate-to-provider-tenant-architecture.md#^ref-54382370-44-0) (line 44, col 0, score 0.69)
- [Lispy Macros with syntax-rules — L388](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-388-0) (line 388, col 0, score 0.68)
- [Lisp-Compiler-Integration — L518](lisp-compiler-integration.md#^ref-cfee6d36-518-0) (line 518, col 0, score 0.65)
- [Stateful Partitions and Rebalancing — L525](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-525-0) (line 525, col 0, score 0.68)
- [schema-evolution-workflow — L381](schema-evolution-workflow.md#^ref-d8059b6a-381-0) (line 381, col 0, score 0.67)
- [Language-Agnostic Mirror System — L513](language-agnostic-mirror-system.md#^ref-d2b3628c-513-0) (line 513, col 0, score 0.67)
- [i3-config-validation-methods — L46](i3-config-validation-methods.md#^ref-d28090ac-46-0) (line 46, col 0, score 0.66)
- [State Snapshots API and Transactional Projector — L320](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-320-0) (line 320, col 0, score 0.66)
- [Migrate to Provider-Tenant Architecture — L88](migrate-to-provider-tenant-architecture.md#^ref-54382370-88-0) (line 88, col 0, score 0.65)
- [TypeScript Patch for Tool Calling Support — L434](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-434-0) (line 434, col 0, score 0.65)
- [Ghostly Smoke Interference — L7](ghostly-smoke-interference.md#^ref-b6ae7dfa-7-0) (line 7, col 0, score 0.65)
- [template-based-compilation — L56](template-based-compilation.md#^ref-f8877e5e-56-0) (line 56, col 0, score 0.64)
- [Recursive Prompt Construction Engine — L154](recursive-prompt-construction-engine.md#^ref-babdb9eb-154-0) (line 154, col 0, score 0.6)
- [windows-tiling-with-autohotkey — L107](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-107-0) (line 107, col 0, score 0.59)
- [windows-tiling-with-autohotkey — L13](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-13-0) (line 13, col 0, score 0.59)
- [sibilant-metacompiler-overview — L42](sibilant-metacompiler-overview.md#^ref-61d4086b-42-0) (line 42, col 0, score 0.57)
- [Vectorial Exception Descent — L142](vectorial-exception-descent.md#^ref-d771154e-142-0) (line 142, col 0, score 0.56)
- [Provider-Agnostic Chat Panel Implementation — L24](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-24-0) (line 24, col 0, score 0.56)
- [ParticleSimulationWithCanvasAndFFmpeg — L280](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-280-0) (line 280, col 0, score 0.56)
- [Performance-Optimized-Polyglot-Bridge — L464](performance-optimized-polyglot-bridge.md#^ref-f5579967-464-0) (line 464, col 0, score 0.56)
- [polyglot-repl-interface-layer — L160](polyglot-repl-interface-layer.md#^ref-9c79206d-160-0) (line 160, col 0, score 0.56)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L545](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-545-0) (line 545, col 0, score 0.56)
- [polymorphic-meta-programming-engine — L201](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-201-0) (line 201, col 0, score 0.56)
- [WebSocket Gateway Implementation — L623](websocket-gateway-implementation.md#^ref-e811123d-623-0) (line 623, col 0, score 0.86)
- [Event Bus MVP — L530](event-bus-mvp.md#^ref-534fe91d-530-0) (line 530, col 0, score 0.73)
- [prom-lib-rate-limiters-and-replay-api — L373](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-373-0) (line 373, col 0, score 0.72)
- [Event Bus MVP — L543](event-bus-mvp.md#^ref-534fe91d-543-0) (line 543, col 0, score 0.71)
- [Stateful Partitions and Rebalancing — L520](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-520-0) (line 520, col 0, score 0.71)
- [schema-evolution-workflow — L473](schema-evolution-workflow.md#^ref-d8059b6a-473-0) (line 473, col 0, score 0.71)
- [State Snapshots API and Transactional Projector — L325](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-325-0) (line 325, col 0, score 0.7)
- [Interop and Source Maps — L5](interop-and-source-maps.md#^ref-cdfac40c-5-0) (line 5, col 0, score 0.67)
- [universal-intention-code-fabric — L424](universal-intention-code-fabric.md#^ref-c14edce7-424-0) (line 424, col 0, score 0.66)
- [prom-lib-rate-limiters-and-replay-api — L1](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-1-0) (line 1, col 0, score 0.59)
- [Exception Layer Analysis — L5](exception-layer-analysis.md#^ref-21d5cc09-5-0) (line 5, col 0, score 0.62)
- [homeostasis-decay-formulas — L134](homeostasis-decay-formulas.md#^ref-37b5d236-134-0) (line 134, col 0, score 0.62)
- [EidolonField — L228](eidolonfield.md#^ref-49d1e1e5-228-0) (line 228, col 0, score 0.6)
- [Ice Box Reorganization — L55](ice-box-reorganization.md#^ref-291c7d91-55-0) (line 55, col 0, score 0.6)
- [Promethean Event Bus MVP v0.1 — L15](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-15-0) (line 15, col 0, score 0.71)
- [prom-lib-rate-limiters-and-replay-api — L353](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-353-0) (line 353, col 0, score 0.7)
- [Migrate to Provider-Tenant Architecture — L221](migrate-to-provider-tenant-architecture.md#^ref-54382370-221-0) (line 221, col 0, score 0.68)
- [prom-lib-rate-limiters-and-replay-api — L83](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-83-0) (line 83, col 0, score 0.67)
- [Dynamic Context Model for Web Components — L41](dynamic-context-model-for-web-components.md#^ref-f7702bf8-41-0) (line 41, col 0, score 0.66)
- [Voice Access Layer Design — L202](voice-access-layer-design.md#^ref-543ed9b3-202-0) (line 202, col 0, score 0.65)
- [Dynamic Context Model for Web Components — L45](dynamic-context-model-for-web-components.md#^ref-f7702bf8-45-0) (line 45, col 0, score 0.65)
- [Migrate to Provider-Tenant Architecture — L144](migrate-to-provider-tenant-architecture.md#^ref-54382370-144-0) (line 144, col 0, score 0.64)
- [Promethean Infrastructure Setup — L456](promethean-infrastructure-setup.md#^ref-6deed6ac-456-0) (line 456, col 0, score 0.68)
- [Promethean Infrastructure Setup — L439](promethean-infrastructure-setup.md#^ref-6deed6ac-439-0) (line 439, col 0, score 0.67)
- [Stateful Partitions and Rebalancing — L516](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-516-0) (line 516, col 0, score 0.65)
- [Agent Tasks: Persistence Migration to DualStore — L134](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-134-0) (line 134, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L164](chroma-toolkit-consolidation-plan.md#^ref-5020e892-164-0) (line 164, col 0, score 1)
- [Services — L18](chunks/services.md#^ref-75ea4a6a-18-0) (line 18, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L230](cross-language-runtime-polymorphism.md#^ref-c34c36a6-230-0) (line 230, col 0, score 1)
- [ecs-offload-workers — L483](ecs-offload-workers.md#^ref-6498b9d7-483-0) (line 483, col 0, score 1)
- [Universal Lisp Interface — L26](universal-lisp-interface.md#^ref-b01856b4-26-0) (line 26, col 0, score 0.64)
- [AI-Centric OS with MCP Layer — L23](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-23-0) (line 23, col 0, score 0.63)
- [Chroma Toolkit Consolidation Plan — L12](chroma-toolkit-consolidation-plan.md#^ref-5020e892-12-0) (line 12, col 0, score 0.63)
- [Migrate to Provider-Tenant Architecture — L40](migrate-to-provider-tenant-architecture.md#^ref-54382370-40-0) (line 40, col 0, score 0.61)
- [Shared Package Structure — L56](shared-package-structure.md#^ref-66a72fc3-56-0) (line 56, col 0, score 0.61)
- [Promethean Event Bus MVP v0.1 — L867](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-867-0) (line 867, col 0, score 0.6)
- [pm2-orchestration-patterns — L22](pm2-orchestration-patterns.md#^ref-51932e7b-22-0) (line 22, col 0, score 0.59)
- [Functional Embedding Pipeline Refactor — L23](functional-embedding-pipeline-refactor.md#^ref-a4a25141-23-0) (line 23, col 0, score 0.59)
- [Performance-Optimized-Polyglot-Bridge — L433](performance-optimized-polyglot-bridge.md#^ref-f5579967-433-0) (line 433, col 0, score 0.72)
- [Language-Agnostic Mirror System — L526](language-agnostic-mirror-system.md#^ref-d2b3628c-526-0) (line 526, col 0, score 0.63)
- [balanced-bst — L289](balanced-bst.md#^ref-d3e7db72-289-0) (line 289, col 0, score 0.61)
- [Promethean Pipelines — L38](promethean-pipelines.md#^ref-8b8e6103-38-0) (line 38, col 0, score 0.59)
- [Migrate to Provider-Tenant Architecture — L107](migrate-to-provider-tenant-architecture.md#^ref-54382370-107-0) (line 107, col 0, score 0.61)
- [Prompt_Folder_Bootstrap — L122](prompt-folder-bootstrap.md#^ref-bd4f0976-122-0) (line 122, col 0, score 0.6)
- [Promethean Event Bus MVP v0.1 — L358](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-358-0) (line 358, col 0, score 0.6)
- [universal-intention-code-fabric — L26](universal-intention-code-fabric.md#^ref-c14edce7-26-0) (line 26, col 0, score 0.58)
- [Migrate to Provider-Tenant Architecture — L69](migrate-to-provider-tenant-architecture.md#^ref-54382370-69-0) (line 69, col 0, score 0.58)
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
- [Agent Reflections and Prompt Evolution — L145](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-145-0) (line 145, col 0, score 1)
- [Local-Only-LLM-Workflow — L212](local-only-llm-workflow.md#^ref-9a8ab57e-212-0) (line 212, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L291](migrate-to-provider-tenant-architecture.md#^ref-54382370-291-0) (line 291, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L155](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-155-0) (line 155, col 0, score 1)
- [observability-infrastructure-setup — L368](observability-infrastructure-setup.md#^ref-b4e64f8c-368-0) (line 368, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L72](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-72-0) (line 72, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L201](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-201-0) (line 201, col 0, score 1)
- [polymorphic-meta-programming-engine — L246](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-246-0) (line 246, col 0, score 1)
- [prom-lib-rate-limiters-and-replay-api — L384](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-384-0) (line 384, col 0, score 1)
- [Promethean Agent Config DSL — L329](promethean-agent-config-dsl.md#^ref-2c00ce45-329-0) (line 329, col 0, score 1)
- [Promethean Event Bus MVP v0.1 — L879](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-879-0) (line 879, col 0, score 1)
- [Services — L9](chunks/services.md#^ref-75ea4a6a-9-0) (line 9, col 0, score 1)
- [ecs-scheduler-and-prefabs — L420](ecs-scheduler-and-prefabs.md#^ref-c62a1815-420-0) (line 420, col 0, score 1)
- [Event Bus MVP — L552](event-bus-mvp.md#^ref-534fe91d-552-0) (line 552, col 0, score 1)
- [heartbeat-fragment-demo — L123](heartbeat-fragment-demo.md#^ref-dd00677a-123-0) (line 123, col 0, score 1)
- [heartbeat-simulation-snippets — L115](heartbeat-simulation-snippets.md#^ref-23e221e9-115-0) (line 115, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L60](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-60-0) (line 60, col 0, score 1)
- [prom-lib-rate-limiters-and-replay-api — L380](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-380-0) (line 380, col 0, score 1)
- [Promethean Event Bus MVP v0.1 — L889](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-889-0) (line 889, col 0, score 1)
- [Services — L10](chunks/services.md#^ref-75ea4a6a-10-0) (line 10, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L209](cross-language-runtime-polymorphism.md#^ref-c34c36a6-209-0) (line 209, col 0, score 1)
- [ecs-offload-workers — L486](ecs-offload-workers.md#^ref-6498b9d7-486-0) (line 486, col 0, score 1)
- [Event Bus MVP — L548](event-bus-mvp.md#^ref-534fe91d-548-0) (line 548, col 0, score 1)
- [prom-lib-rate-limiters-and-replay-api — L382](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-382-0) (line 382, col 0, score 1)
- [Promethean Event Bus MVP v0.1 — L913](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-913-0) (line 913, col 0, score 1)
- [State Snapshots API and Transactional Projector — L333](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-333-0) (line 333, col 0, score 1)
- [Stateful Partitions and Rebalancing — L527](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-527-0) (line 527, col 0, score 1)
- [eidolon-field-math-foundations — L148](eidolon-field-math-foundations.md#^ref-008f2ac0-148-0) (line 148, col 0, score 1)
- [Event Bus MVP — L549](event-bus-mvp.md#^ref-534fe91d-549-0) (line 549, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L282](migrate-to-provider-tenant-architecture.md#^ref-54382370-282-0) (line 282, col 0, score 1)
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
- [Agent Tasks: Persistence Migration to DualStore — L172](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-172-0) (line 172, col 0, score 1)
- [AI-Centric OS with MCP Layer — L424](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-424-0) (line 424, col 0, score 1)
- [aionian-circuit-math — L183](aionian-circuit-math.md#^ref-f2d83a77-183-0) (line 183, col 0, score 1)
- [api-gateway-versioning — L310](api-gateway-versioning.md#^ref-0580dcd3-310-0) (line 310, col 0, score 1)
- [Board Walk – 2025-08-11 — L149](board-walk-2025-08-11.md#^ref-7aa1eb92-149-0) (line 149, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L211](chroma-toolkit-consolidation-plan.md#^ref-5020e892-211-0) (line 211, col 0, score 1)
- [Diagrams — L23](chunks/diagrams.md#^ref-45cd25b5-23-0) (line 23, col 0, score 1)
- [DSL — L27](chunks/dsl.md#^ref-e87bc036-27-0) (line 27, col 0, score 1)
- [JavaScript — L29](chunks/javascript.md#^ref-c1618c66-29-0) (line 29, col 0, score 1)
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
- [Services — L12](chunks/services.md#^ref-75ea4a6a-12-0) (line 12, col 0, score 1)
- [Event Bus MVP — L551](event-bus-mvp.md#^ref-534fe91d-551-0) (line 551, col 0, score 1)
- [prom-lib-rate-limiters-and-replay-api — L386](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-386-0) (line 386, col 0, score 1)
- [Promethean Event Bus MVP v0.1 — L890](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-890-0) (line 890, col 0, score 1)
- [Promethean-native config design — L389](promethean-native-config-design.md#^ref-ab748541-389-0) (line 389, col 0, score 1)
- [schema-evolution-workflow — L482](schema-evolution-workflow.md#^ref-d8059b6a-482-0) (line 482, col 0, score 1)
- [State Snapshots API and Transactional Projector — L338](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-338-0) (line 338, col 0, score 1)
- [Unique Info Dump Index — L92](unique-info-dump-index.md#^ref-30ec3ba6-92-0) (line 92, col 0, score 1)
- [AI-Centric OS with MCP Layer — L407](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-407-0) (line 407, col 0, score 1)
- [api-gateway-versioning — L284](api-gateway-versioning.md#^ref-0580dcd3-284-0) (line 284, col 0, score 1)
- [Services — L21](chunks/services.md#^ref-75ea4a6a-21-0) (line 21, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L43](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-43-0) (line 43, col 0, score 1)
- [Dynamic Context Model for Web Components — L407](dynamic-context-model-for-web-components.md#^ref-f7702bf8-407-0) (line 407, col 0, score 1)
- [ecs-offload-workers — L478](ecs-offload-workers.md#^ref-6498b9d7-478-0) (line 478, col 0, score 1)
- [eidolon-field-math-foundations — L167](eidolon-field-math-foundations.md#^ref-008f2ac0-167-0) (line 167, col 0, score 1)
- [Event Bus MVP — L562](event-bus-mvp.md#^ref-534fe91d-562-0) (line 562, col 0, score 1)
- [Local-Offline-Model-Deployment-Strategy — L295](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-295-0) (line 295, col 0, score 1)
- [Math Fundamentals — L20](chunks/math-fundamentals.md#^ref-c6e87433-20-0) (line 20, col 0, score 1)
- [Services — L20](chunks/services.md#^ref-75ea4a6a-20-0) (line 20, col 0, score 1)
- [compiler-kit-foundations — L620](compiler-kit-foundations.md#^ref-01b21543-620-0) (line 620, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L237](cross-language-runtime-polymorphism.md#^ref-c34c36a6-237-0) (line 237, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L40](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-40-0) (line 40, col 0, score 1)
- [Dynamic Context Model for Web Components — L401](dynamic-context-model-for-web-components.md#^ref-f7702bf8-401-0) (line 401, col 0, score 1)
- [ecs-scheduler-and-prefabs — L386](ecs-scheduler-and-prefabs.md#^ref-c62a1815-386-0) (line 386, col 0, score 1)
- [eidolon-field-math-foundations — L127](eidolon-field-math-foundations.md#^ref-008f2ac0-127-0) (line 127, col 0, score 1)
- [Event Bus MVP — L557](event-bus-mvp.md#^ref-534fe91d-557-0) (line 557, col 0, score 1)
- [Exception Layer Analysis — L172](exception-layer-analysis.md#^ref-21d5cc09-172-0) (line 172, col 0, score 1)
- [field-dynamics-math-blocks — L154](field-dynamics-math-blocks.md#^ref-7cfc230d-154-0) (line 154, col 0, score 1)
- [field-interaction-equations — L164](field-interaction-equations.md#^ref-b09141b7-164-0) (line 164, col 0, score 1)
- [field-node-diagram-outline — L120](field-node-diagram-outline.md#^ref-1f32c94a-120-0) (line 120, col 0, score 1)
- [field-node-diagram-set — L149](field-node-diagram-set.md#^ref-22b989d5-149-0) (line 149, col 0, score 1)
- [field-node-diagram-visualizations — L99](field-node-diagram-visualizations.md#^ref-e9b27b06-99-0) (line 99, col 0, score 1)
- [graph-ds — L365](graph-ds.md#^ref-6620e2f2-365-0) (line 365, col 0, score 1)
- [heartbeat-fragment-demo — L111](heartbeat-fragment-demo.md#^ref-dd00677a-111-0) (line 111, col 0, score 1)
- [heartbeat-simulation-snippets — L101](heartbeat-simulation-snippets.md#^ref-23e221e9-101-0) (line 101, col 0, score 1)
- [Diagrams — L13](chunks/diagrams.md#^ref-45cd25b5-13-0) (line 13, col 0, score 1)
- [DSL — L15](chunks/dsl.md#^ref-e87bc036-15-0) (line 15, col 0, score 1)
- [JavaScript — L18](chunks/javascript.md#^ref-c1618c66-18-0) (line 18, col 0, score 1)
- [Math Fundamentals — L14](chunks/math-fundamentals.md#^ref-c6e87433-14-0) (line 14, col 0, score 1)
- [Services — L14](chunks/services.md#^ref-75ea4a6a-14-0) (line 14, col 0, score 1)
- [Shared — L7](chunks/shared.md#^ref-623a55f7-7-0) (line 7, col 0, score 1)
- [Simulation Demo — L10](chunks/simulation-demo.md#^ref-557309a3-10-0) (line 10, col 0, score 1)
- [Tooling — L9](chunks/tooling.md#^ref-6cb4943e-9-0) (line 9, col 0, score 1)
- [Window Management — L15](chunks/window-management.md#^ref-9e8ae388-15-0) (line 15, col 0, score 1)
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
- [Agent Tasks: Persistence Migration to DualStore — L129](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-129-0) (line 129, col 0, score 1)
- [api-gateway-versioning — L315](api-gateway-versioning.md#^ref-0580dcd3-315-0) (line 315, col 0, score 1)
- [Chroma-Embedding-Refactor — L331](chroma-embedding-refactor.md#^ref-8b256935-331-0) (line 331, col 0, score 1)
- [Diagrams — L25](chunks/diagrams.md#^ref-45cd25b5-25-0) (line 25, col 0, score 1)
- [Tooling — L24](chunks/tooling.md#^ref-6cb4943e-24-0) (line 24, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L214](cross-language-runtime-polymorphism.md#^ref-c34c36a6-214-0) (line 214, col 0, score 1)
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
- [api-gateway-versioning — L282](api-gateway-versioning.md#^ref-0580dcd3-282-0) (line 282, col 0, score 1)
- [archetype-ecs — L470](archetype-ecs.md#^ref-8f4c1e86-470-0) (line 470, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L201](chroma-toolkit-consolidation-plan.md#^ref-5020e892-201-0) (line 201, col 0, score 1)
- [Dynamic Context Model for Web Components — L382](dynamic-context-model-for-web-components.md#^ref-f7702bf8-382-0) (line 382, col 0, score 1)
- [ecs-offload-workers — L456](ecs-offload-workers.md#^ref-6498b9d7-456-0) (line 456, col 0, score 1)
- [ecs-scheduler-and-prefabs — L390](ecs-scheduler-and-prefabs.md#^ref-c62a1815-390-0) (line 390, col 0, score 1)
- [eidolon-field-math-foundations — L125](eidolon-field-math-foundations.md#^ref-008f2ac0-125-0) (line 125, col 0, score 1)
- [i3-config-validation-methods — L61](i3-config-validation-methods.md#^ref-d28090ac-61-0) (line 61, col 0, score 1)
- [observability-infrastructure-setup — L360](observability-infrastructure-setup.md#^ref-b4e64f8c-360-0) (line 360, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L163](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-163-0) (line 163, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L472](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-472-0) (line 472, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L455](performance-optimized-polyglot-bridge.md#^ref-f5579967-455-0) (line 455, col 0, score 1)
- [AI-Centric OS with MCP Layer — L401](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-401-0) (line 401, col 0, score 1)
- [api-gateway-versioning — L296](api-gateway-versioning.md#^ref-0580dcd3-296-0) (line 296, col 0, score 1)
- [i3-bluetooth-setup — L110](i3-bluetooth-setup.md#^ref-5e408692-110-0) (line 110, col 0, score 1)
- [Local-Offline-Model-Deployment-Strategy — L291](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-291-0) (line 291, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L279](migrate-to-provider-tenant-architecture.md#^ref-54382370-279-0) (line 279, col 0, score 1)
- [observability-infrastructure-setup — L359](observability-infrastructure-setup.md#^ref-b4e64f8c-359-0) (line 359, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L477](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-477-0) (line 477, col 0, score 1)
- [plan-update-confirmation — L996](plan-update-confirmation.md#^ref-b22d79c6-996-0) (line 996, col 0, score 1)
- [2d-sandbox-field — L225](2d-sandbox-field.md#^ref-c710dc93-225-0) (line 225, col 0, score 1)
- [Admin Dashboard for User Management — L49](admin-dashboard-for-user-management.md#^ref-2901a3e9-49-0) (line 49, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L150](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-150-0) (line 150, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L163](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-163-0) (line 163, col 0, score 1)
- [AI-First-OS-Model-Context-Protocol — L9](ai-first-os-model-context-protocol.md#^ref-618198f4-9-0) (line 9, col 0, score 1)
- [aionian-circuit-math — L179](aionian-circuit-math.md#^ref-f2d83a77-179-0) (line 179, col 0, score 1)
- [api-gateway-versioning — L304](api-gateway-versioning.md#^ref-0580dcd3-304-0) (line 304, col 0, score 1)
- [archetype-ecs — L479](archetype-ecs.md#^ref-8f4c1e86-479-0) (line 479, col 0, score 1)
- [balanced-bst — L295](balanced-bst.md#^ref-d3e7db72-295-0) (line 295, col 0, score 1)
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
- [Services — L28](chunks/services.md#^ref-75ea4a6a-28-0) (line 28, col 0, score 1)
- [Simulation Demo — L7](chunks/simulation-demo.md#^ref-557309a3-7-0) (line 7, col 0, score 1)
- [ecs-scheduler-and-prefabs — L428](ecs-scheduler-and-prefabs.md#^ref-c62a1815-428-0) (line 428, col 0, score 1)
- [Eidolon Field Abstract Model — L199](eidolon-field-abstract-model.md#^ref-5e8b2388-199-0) (line 199, col 0, score 1)
- [eidolon-node-lifecycle — L35](eidolon-node-lifecycle.md#^ref-938eca9c-35-0) (line 35, col 0, score 1)
- [Event Bus MVP — L570](event-bus-mvp.md#^ref-534fe91d-570-0) (line 570, col 0, score 1)
- [field-interaction-equations — L173](field-interaction-equations.md#^ref-b09141b7-173-0) (line 173, col 0, score 1)
- [field-node-diagram-outline — L113](field-node-diagram-outline.md#^ref-1f32c94a-113-0) (line 113, col 0, score 1)
- [Simulation Demo — L32](chunks/simulation-demo.md#^ref-557309a3-32-0) (line 32, col 0, score 1)
- [Tooling — L26](chunks/tooling.md#^ref-6cb4943e-26-0) (line 26, col 0, score 1)
- [Window Management — L36](chunks/window-management.md#^ref-9e8ae388-36-0) (line 36, col 0, score 1)
- [compiler-kit-foundations — L639](compiler-kit-foundations.md#^ref-01b21543-639-0) (line 639, col 0, score 1)
- [Creative Moments — L10](creative-moments.md#^ref-10d98225-10-0) (line 10, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L258](cross-language-runtime-polymorphism.md#^ref-c34c36a6-258-0) (line 258, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L215](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-215-0) (line 215, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L50](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-50-0) (line 50, col 0, score 1)
- [DuckDuckGoSearchPipeline — L16](duckduckgosearchpipeline.md#^ref-e979c50f-16-0) (line 16, col 0, score 1)
- [markdown-to-org-transpiler — L318](markdown-to-org-transpiler.md#^ref-ab54cdd8-318-0) (line 318, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L322](migrate-to-provider-tenant-architecture.md#^ref-54382370-322-0) (line 322, col 0, score 1)
- [observability-infrastructure-setup — L369](observability-infrastructure-setup.md#^ref-b4e64f8c-369-0) (line 369, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L183](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-183-0) (line 183, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L483](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-483-0) (line 483, col 0, score 1)
- [polymorphic-meta-programming-engine — L241](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-241-0) (line 241, col 0, score 1)
- [prom-lib-rate-limiters-and-replay-api — L415](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-415-0) (line 415, col 0, score 1)
- [Promethean Agent Config DSL — L352](promethean-agent-config-dsl.md#^ref-2c00ce45-352-0) (line 352, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L66](promethean-copilot-intent-engine.md#^ref-ae24a280-66-0) (line 66, col 0, score 1)
- [eidolon-node-lifecycle — L63](eidolon-node-lifecycle.md#^ref-938eca9c-63-0) (line 63, col 0, score 1)
- [EidolonField — L269](eidolonfield.md#^ref-49d1e1e5-269-0) (line 269, col 0, score 1)
- [Event Bus MVP — L566](event-bus-mvp.md#^ref-534fe91d-566-0) (line 566, col 0, score 1)
- [Event Bus Projections Architecture — L185](event-bus-projections-architecture.md#^ref-cf6b9b17-185-0) (line 185, col 0, score 1)
- [Exception Layer Analysis — L165](exception-layer-analysis.md#^ref-21d5cc09-165-0) (line 165, col 0, score 1)
- [Factorio AI with External Agents — L160](factorio-ai-with-external-agents.md#^ref-a4d90289-160-0) (line 160, col 0, score 1)
- [field-dynamics-math-blocks — L165](field-dynamics-math-blocks.md#^ref-7cfc230d-165-0) (line 165, col 0, score 1)
- [field-interaction-equations — L184](field-interaction-equations.md#^ref-b09141b7-184-0) (line 184, col 0, score 1)
- [field-node-diagram-outline — L132](field-node-diagram-outline.md#^ref-1f32c94a-132-0) (line 132, col 0, score 1)
- [DSL — L26](chunks/dsl.md#^ref-e87bc036-26-0) (line 26, col 0, score 1)
- [ecs-scheduler-and-prefabs — L433](ecs-scheduler-and-prefabs.md#^ref-c62a1815-433-0) (line 433, col 0, score 1)
- [Event Bus MVP — L577](event-bus-mvp.md#^ref-534fe91d-577-0) (line 577, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L174](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-174-0) (line 174, col 0, score 1)
- [Local-Only-LLM-Workflow — L211](local-only-llm-workflow.md#^ref-9a8ab57e-211-0) (line 211, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L334](migrate-to-provider-tenant-architecture.md#^ref-54382370-334-0) (line 334, col 0, score 1)
- [observability-infrastructure-setup — L397](observability-infrastructure-setup.md#^ref-b4e64f8c-397-0) (line 397, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L48](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-48-0) (line 48, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L202](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-202-0) (line 202, col 0, score 1)
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
- [Lisp-Compiler-Integration — L547](lisp-compiler-integration.md#^ref-cfee6d36-547-0) (line 547, col 0, score 1)
- [Lispy Macros with syntax-rules — L408](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-408-0) (line 408, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L182](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-182-0) (line 182, col 0, score 1)
- [Local-Offline-Model-Deployment-Strategy — L307](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-307-0) (line 307, col 0, score 1)
- [Local-Only-LLM-Workflow — L210](local-only-llm-workflow.md#^ref-9a8ab57e-210-0) (line 210, col 0, score 1)
- [markdown-to-org-transpiler — L320](markdown-to-org-transpiler.md#^ref-ab54cdd8-320-0) (line 320, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L272](migrate-to-provider-tenant-architecture.md#^ref-54382370-272-0) (line 272, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L136](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-136-0) (line 136, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L48](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-48-0) (line 48, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L109](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-109-0) (line 109, col 0, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L529](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-529-0) (line 529, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L138](protocol-0-the-contradiction-engine.md#^ref-9a93a756-138-0) (line 138, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L181](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-181-0) (line 181, col 0, score 1)
- [AI-Centric OS with MCP Layer — L429](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-429-0) (line 429, col 0, score 1)
- [api-gateway-versioning — L317](api-gateway-versioning.md#^ref-0580dcd3-317-0) (line 317, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L186](chroma-toolkit-consolidation-plan.md#^ref-5020e892-186-0) (line 186, col 0, score 1)
- [Dynamic Context Model for Web Components — L433](dynamic-context-model-for-web-components.md#^ref-f7702bf8-433-0) (line 433, col 0, score 1)
- [Event Bus MVP — L555](event-bus-mvp.md#^ref-534fe91d-555-0) (line 555, col 0, score 1)
- [Local-Offline-Model-Deployment-Strategy — L290](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-290-0) (line 290, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L298](migrate-to-provider-tenant-architecture.md#^ref-54382370-298-0) (line 298, col 0, score 1)
- [AI-Centric OS with MCP Layer — L408](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-408-0) (line 408, col 0, score 1)
- [api-gateway-versioning — L316](api-gateway-versioning.md#^ref-0580dcd3-316-0) (line 316, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L213](chroma-toolkit-consolidation-plan.md#^ref-5020e892-213-0) (line 213, col 0, score 1)
- [Event Bus MVP — L581](event-bus-mvp.md#^ref-534fe91d-581-0) (line 581, col 0, score 1)
- [i3-bluetooth-setup — L101](i3-bluetooth-setup.md#^ref-5e408692-101-0) (line 101, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L178](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-178-0) (line 178, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L303](migrate-to-provider-tenant-architecture.md#^ref-54382370-303-0) (line 303, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L140](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-140-0) (line 140, col 0, score 1)
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
- [obsidian-ignore-node-modules-regex — L77](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-77-0) (line 77, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L120](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-120-0) (line 120, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L179](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-179-0) (line 179, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L282](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-282-0) (line 282, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L480](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-480-0) (line 480, col 0, score 1)
- [Diagrams — L50](chunks/diagrams.md#^ref-45cd25b5-50-0) (line 50, col 0, score 1)
- [DSL — L44](chunks/dsl.md#^ref-e87bc036-44-0) (line 44, col 0, score 1)
- [JavaScript — L48](chunks/javascript.md#^ref-c1618c66-48-0) (line 48, col 0, score 1)
- [Services — L43](chunks/services.md#^ref-75ea4a6a-43-0) (line 43, col 0, score 1)
- [Shared — L31](chunks/shared.md#^ref-623a55f7-31-0) (line 31, col 0, score 1)
- [Simulation Demo — L34](chunks/simulation-demo.md#^ref-557309a3-34-0) (line 34, col 0, score 1)
- [Tooling — L28](chunks/tooling.md#^ref-6cb4943e-28-0) (line 28, col 0, score 1)
- [Window Management — L38](chunks/window-management.md#^ref-9e8ae388-38-0) (line 38, col 0, score 1)
- [compiler-kit-foundations — L651](compiler-kit-foundations.md#^ref-01b21543-651-0) (line 651, col 0, score 1)
- [Creative Moments — L15](creative-moments.md#^ref-10d98225-15-0) (line 15, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L263](cross-language-runtime-polymorphism.md#^ref-c34c36a6-263-0) (line 263, col 0, score 1)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
