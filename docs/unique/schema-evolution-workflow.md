---
uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
created_at: 2025.08.08.20.08.52.md
filename: schema-evolution-workflow
description: >-
  Implements schema evolution with dual-write for writers and upcasters for
  readers, using a registry to manage versioned topics and schema validation.
tags:
  - schema
  - evolution
  - dual-write
  - upcasters
  - registry
  - topics
  - validation
related_to_title: []
related_to_uuid: []
references: []
---
Note: Consolidated here → ../notes/services/schema-evolution-dlq-changefeed.md ^ref-d8059b6a-1-0

Alright, **Part 6**: schema evolution workflow (dual-write + upcasters), a **DLQ** with replay, **Mongo changefeeds** → topics, and a tiny **CI linter** for topic/schema hygiene. Paste under `shared/js/prom-lib/` + a small `scripts/` dir. ^ref-d8059b6a-3-0

---

# 0) Tiny prelude: topic naming rules (used by linter)

```ts
// shared/js/prom-lib/naming/rules.ts
export const TOPIC_RE = /^[a-z0-9]+(\.[a-z0-9]+)*(\.v\d+)?$/; // dot segments, optional .vN suffix
export function isValidTopic(t: string) { return TOPIC_RE.test(t); }
export function headerOk(h: string) { return /^x-[a-z0-9-]+$/.test(h); } // custom headers
```
^ref-d8059b6a-9-0

---

# 1) Schema Evolution Workflow
 ^ref-d8059b6a-20-0
Approach:
 ^ref-d8059b6a-22-0
* **Registry** holds versions. ^ref-d8059b6a-23-0
* Writers **dual-write** for one deploy window (old & new topic OR same topic with `x-schema-version`). ^ref-d8059b6a-24-0
* Readers use **upcasters** to normalize older versions to **latest**. ^ref-d8059b6a-25-0
* Optional **cutover** job to backfill snapshots/materializations.

## 1a) Upcasters (N → N+1 → … → latest)
 ^ref-d8059b6a-29-0
```ts
// shared/js/prom-lib/schema/upcast.ts
import { EventRecord } from "../event/types";
import { SchemaRegistry } from "./registry";

export type Upcaster = (e: EventRecord) => EventRecord;

export class UpcastChain {
  // map: topic -> version -> upcaster to next
  private chains = new Map<string, Map<number, Upcaster>>();

  add(topic: string, fromVersion: number, fn: Upcaster) {
    const m = this.chains.get(topic) ?? new Map<number, Upcaster>();
    m.set(fromVersion, fn);
    this.chains.set(topic, m);
  }

  // walk from e.headers["x-schema-version"] up to latest
  toLatest(topic: string, e: EventRecord, reg: SchemaRegistry): EventRecord {
    const m = this.chains.get(topic);
    const latest = reg.latest(topic)?.version;
    if (!m || latest == null) return e;

    const vRaw = Number(e.headers?.["x-schema-version"]);
    let v = Number.isFinite(vRaw) ? vRaw : latest; // if no version assume latest (legacy)
    let cur = e;

    while (v < latest) {
      const step = m.get(v);
      if (!step) break; // missing hop; best-effort
      cur = step(cur);
      v++;
    }
    // stamp new version so downstream knows it’s normalized
    cur.headers = { ...(cur.headers ?? {}), "x-schema-version": String(latest) };
    return cur;
  }
}
^ref-d8059b6a-29-0
```

## 1b) Dual-write helper (same topic, stamped versions) ^ref-d8059b6a-71-0

```ts
// shared/js/prom-lib/schema/dualwrite.ts
import { EventBus, PublishOptions, EventRecord } from "../event/types";
import { SchemaRegistry } from "./registry";

export function withDualWrite(bus: EventBus, reg: SchemaRegistry): EventBus {
  return {
    ...bus,
    async publish<T>(topic: string, payload: T, opts: PublishOptions = {}): Promise<EventRecord<T>> {
      const latest = reg.latest(topic);
      if (latest) {
        opts.headers = { ...(opts.headers || {}), "x-schema-version": String(latest.version) };
      }
      // optional: also write to versioned topic name e.g., foo.bar.v2
      if (latest && !String(topic).endsWith(`.v${latest.version}`)) {
        const vTopic = `${topic}.v${latest.version}`;
        // fire-and-forget extra write; ignore error to avoid breaking primary path
        bus.publish(vTopic, payload, { ...opts });
      }
      return bus.publish(topic, payload, opts);
    }
  };
^ref-d8059b6a-71-0
}
```
 ^ref-d8059b6a-98-0
## 1c) Subscriber wrapper that **upcasts** then validates

```ts
// shared/js/prom-lib/schema/normalize.ts
import { EventBus, EventRecord } from "../event/types";
import { SchemaRegistry } from "./registry";
import { UpcastChain } from "./upcast";

export async function subscribeNormalized(
  bus: EventBus,
  topic: string,
  group: string,
  reg: SchemaRegistry,
  up: UpcastChain,
  handler: (e: EventRecord) => Promise<void>,
  opts: any = {}
) {
  return bus.subscribe(topic, group, async (e) => {
    const norm = up.toLatest(topic, e, reg);
    reg.validate(topic, norm.payload, Number(norm.headers?.["x-schema-version"]));
    await handler(norm);
^ref-d8059b6a-98-0
  }, opts);
}
``` ^ref-d8059b6a-123-0
 ^ref-d8059b6a-124-0
## 1d) Evolution playbook (dump this as doc)
 ^ref-d8059b6a-126-0
1. **Register** new schema `v+1` (`compat: backward` recommended).
2. **Deploy writers** with `withDualWrite` (stamps `x-schema-version`, dual to `*.vN`). ^ref-d8059b6a-128-0
3. **Deploy readers** with `subscribeNormalized` + upcasters.
4. Let traffic bake; verify dashboards. ^ref-d8059b6a-130-0
5. Switch materializers to read `*.vN` only (optional).
6. Remove dual-write after cutover; keep upcasters for replay. ^ref-d8059b6a-132-0

**Mermaid:**

```mermaid
flowchart LR
  Writer -->|publish vN & stamp| Topic[topic]
^ref-d8059b6a-132-0
  Writer -->|dual| VTopic[topic.vN]
  Sub[Subscriber] -->|fetch| Topic
  Sub -->|upcast->latest| Handler
```

---
 ^ref-d8059b6a-146-0
# 2) Dead Letter Queue (DLQ) + Replay

## 2a) DLQ event shape

```ts
// shared/js/prom-lib/dlq/types.ts
export interface DLQRecord {
  topic: string; group?: string;
  original: any;            // original EventRecord
  err: string;              // error message/stack
  ts: number;
^ref-d8059b6a-146-0
  attempts?: number;
}
export const DLQ_TOPIC_PREFIX = "dlq.";
export const dlqTopic = (t: string) => `${DLQ_TOPIC_PREFIX}${t}`;
```
^ref-d8059b6a-161-0

## 2b) Subscribe wrapper with DLQ

```ts
// shared/js/prom-lib/dlq/subscribe.ts
import { EventBus, EventRecord } from "../event/types";
import { dlqTopic } from "./types";

export function withDLQ(
  bus: EventBus,
  { maxAttempts = 5, group }: { maxAttempts?: number; group: string }
) {
  return async function subscribeWithDLQ(
    topic: string,
    handler: (e: EventRecord) => Promise<void>,
    opts: any = {}
  ) {
    let attempts = new Map<string, number>();

    return bus.subscribe(topic, group, async (e) => {
      const n = (attempts.get(e.id) ?? 0) + 1;
      attempts.set(e.id, n);

      try {
        await handler(e);
        attempts.delete(e.id);
      } catch (err: any) {
        if (n >= maxAttempts) {
          await bus.publish(dlqTopic(topic), {
            topic, group, original: e, err: String(err?.stack ?? err?.message ?? err), ts: Date.now(), attempts: n
          });
          attempts.delete(e.id);
        } else {
          throw err; // cause redelivery
^ref-d8059b6a-161-0
        }
      }
    }, opts);
  };
}
^ref-d8059b6a-201-0
```
^ref-d8059b6a-201-0

## 2c) DLQ replayer

```ts
// shared/js/prom-lib/dlq/replay.ts
import { MongoEventStore } from "../event/mongo";
import { EventBus, EventRecord } from "../event/types";
import { dlqTopic } from "./types";

export async function replayDLQ(
  store: MongoEventStore, bus: EventBus, topic: string,
  { limit = 1000, transform }: { limit?: number; transform?: (e: EventRecord) => EventRecord | void }
) {
  const dlq = dlqTopic(topic);
  const batch = await store.scan(dlq, { ts: 0, limit });
  for (const rec of batch) {
^ref-d8059b6a-201-0
    const orig = (rec.payload as any)?.original as EventRecord; ^ref-d8059b6a-222-0
    if (!orig) continue;
    const tweaked = transform ? (transform(orig) || orig) : orig;
    await bus.publish(tweaked.topic, tweaked.payload, { headers: tweaked.headers, key: tweaked.key, sid: tweaked.sid, caused_by: (tweaked.caused_by || []).concat(rec.id) });
  }
^ref-d8059b6a-224-0
^ref-d8059b6a-222-0
}
^ref-d8059b6a-224-0
^ref-d8059b6a-222-0
```
^ref-d8059b6a-224-0
^ref-d8059b6a-222-0

**Mermaid:**

```mermaid
sequenceDiagram
^ref-d8059b6a-224-0
  participant B as EventBus
  participant C as Consumer
  participant D as DLQ
  B-->>C: EVENT
  C-->>B: NACK (after N tries) ^ref-d8059b6a-239-0 ^ref-d8059b6a-243-0
^ref-d8059b6a-243-0
^ref-d8059b6a-239-0
  C->>B: publish dlq.topic { original, err }
^ref-d8059b6a-243-0
^ref-d8059b6a-239-0
  Note right of D: Later...\nReplay scans dlq.* and republishes
```

---

# 3) Changefeeds (Mongo → Topic)

Watch a Mongo collection (materialized view or business table) and republish changes.

## 3a) Changefeed watcher

```ts
// shared/js/prom-lib/changefeed/mongo.ts
import type { Db, ResumeToken } from "mongodb";
import { EventBus } from "../event/types";

export interface ChangefeedOptions {
  collection: string;
  topic: string;
  fullDocument?: "updateLookup" | "whenAvailable"; // default "updateLookup"
  resumeTokenStore?: {
    load(): Promise<ResumeToken | null>;
    save(tok: ResumeToken): Promise<void>;
  };
  filter?: (doc: any) => boolean; // drop noisy changes if needed
  map?: (doc: any) => any;        // transform doc->payload
}

export async function startMongoChangefeed(db: Db, bus: EventBus, opts: ChangefeedOptions) {
  const coll = db.collection(opts.collection);
  const resume = await opts.resumeTokenStore?.load();

  const cs = coll.watch([], { fullDocument: opts.fullDocument ?? "updateLookup", resumeAfter: resume ?? undefined });

  let stopped = false;
  (async () => {
    for await (const change of cs) {
      if (stopped) break;
      const doc = change.fullDocument ?? change.documentKey;
      if (opts.filter && !opts.filter(doc)) continue;

      const payload = opts.map ? opts.map(doc) : doc;
      await bus.publish(opts.topic, payload, {
        key: String(doc._id),
        headers: { "x-mongo-op": change.operationType, "x-change-clusterTime": String(change.clusterTime) }
^ref-d8059b6a-243-0
      });

      if (opts.resumeTokenStore && change._id) await opts.resumeTokenStore.save(change._id);
    }
  })().catch(() => { /* log, retry/backoff in real code */ });
^ref-d8059b6a-289-0
^ref-d8059b6a-289-0

  return () => { stopped = true; cs.close(); };
}
```

## 3b) Resume token store (Mongo)

```ts
// shared/js/prom-lib/changefeed/resume.mongo.ts
import type { Db, ResumeToken } from "mongodb";

export function tokenStore(db: Db, key = "changefeed:default") {
  const coll = db.collection<{ _id: string; token: any }>("changefeed_tokens");
  return {
^ref-d8059b6a-289-0
    async load(): Promise<ResumeToken | null> {
      const d = await coll.findOne({ _id: key });
      return (d?.token as any) ?? null;
    },
    async save(token: ResumeToken) { ^ref-d8059b6a-311-0
^ref-d8059b6a-313-0
^ref-d8059b6a-311-0
^ref-d8059b6a-313-0
^ref-d8059b6a-311-0
^ref-d8059b6a-313-0
^ref-d8059b6a-311-0
      await coll.updateOne({ _id: key }, { $set: { token } }, { upsert: true });
    }
  };
}
```

---

# 4) CI Linter (topics, headers, schema coverage)

Scans `shared/js/prom-lib/event/topics.ts` and your codebase for `publish("topic", ...)` calls; ensures topics are valid, registered in the schema registry (or explicitly allowed), and custom headers follow `x-` convention.

```ts
// scripts/lint-topics.ts
import fs from "fs";
import path from "path";

import { isValidTopic, headerOk } from "../shared/js/prom-lib/naming/rules";
import { reg as schemaReg } from "../shared/js/prom-lib/schema/topics";

const ROOT = process.env.REPO_ROOT || process.cwd();
const SRC_DIRS = ["services", "shared/js"]; // add more if needed

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith(".")) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (/\.(ts|js|tsx)$/.test(e.name)) out.push(p);
  }
  return out;
}

// very naive grep; good enough for CI guardrails
const PUB_RE = /publish\(\s*["'`]([a-zA-Z0-9\.\-:]+)["'`]/g;
const HDR_RE = /headers\s*:\s*\{([^}]+)\}/g;
const HDR_KEY_RE = /["'`]([a-zA-Z0-9\-\_]+)["'`]\s*:/g;

let errors: string[] = [];

function checkFile(p: string) {
  const s = fs.readFileSync(p, "utf8");
  let m: RegExpExecArray | null;
  while ((m = PUB_RE.exec(s))) {
    const topic = m[1];
    if (!isValidTopic(topic)) errors.push(`${p}: invalid topic '${topic}'`);
    // schema coverage: either versioned or present in registry (ok to skip for internal)
    const versioned = /\.v\d+$/.test(topic);
    const hasSchema = !!schemaReg.latest(topic);
    if (!versioned && !hasSchema) errors.push(`${p}: unregistered topic '${topic}' (no schema)`);
  }

  while ((m = HDR_RE.exec(s))) {
    const obj = m[1];
    let kh: RegExpExecArray | null;
    while ((kh = HDR_KEY_RE.exec(obj))) {
      const k = kh[1];
      if (!/^x-/.test(k) && !/^content-type$/i.test(k)) {
        if (!headerOk(k)) errors.push(`${p}: header key '${k}' should be 'x-...'`);
      }
    }
  }
}

for (const d of SRC_DIRS) {
  const abs = path.join(ROOT, d);
  if (!fs.existsSync(abs)) continue;
^ref-d8059b6a-313-0
  for (const f of walk(abs)) checkFile(f); ^ref-d8059b6a-381-0
}

if (errors.length) {
  console.error("Topic/Schema/Header lints failed:");
^ref-d8059b6a-383-0 ^ref-d8059b6a-393-0
^ref-d8059b6a-381-0
^ref-d8059b6a-393-0
^ref-d8059b6a-383-0
^ref-d8059b6a-381-0
^ref-d8059b6a-393-0
^ref-d8059b6a-383-0
^ref-d8059b6a-381-0
  for (const e of errors) console.error(" -", e);
  process.exit(1);
^ref-d8059b6a-383-0
} else {
  console.log("Topic/Schema/Header lints OK");
}
```

Add to CI:

```yaml
# .github/workflows/lint.yml (snippet)
- name: Topic/Schema lints
  run: node scripts/lint-topics.ts
```

---

# 5) Glue example (evolution + DLQ + changefeed)

```ts
// services/js/event-hub/evolve.ts
import { MongoClient } from "mongodb";
import { MongoEventBus, MongoEventStore, MongoCursorStore } from "../../shared/js/prom-lib/event/mongo";
import { withDualWrite } from "../../shared/js/prom-lib/schema/dualwrite";
import { SchemaRegistry } from "../../shared/js/prom-lib/schema/registry";
import { reg as topicSchemas } from "../../shared/js/prom-lib/schema/topics";
import { UpcastChain } from "../../shared/js/prom-lib/schema/upcast";
import { subscribeNormalized } from "../../shared/js/prom-lib/schema/normalize";
import { withDLQ } from "../../shared/js/prom-lib/dlq/subscribe";
import { startMongoChangefeed } from "../../shared/js/prom-lib/changefeed/mongo";
import { tokenStore } from "../../shared/js/prom-lib/changefeed/resume.mongo";

async function main() {
  const client = await MongoClient.connect(process.env.MONGO_URL || "mongodb://127.0.0.1:27017/prom");
  const db = client.db();

  const store = new MongoEventStore(db);
  const rawBus = new MongoEventBus(store, new MongoCursorStore(db));

  // schema registry + upcasters
  const reg = topicSchemas as SchemaRegistry;
  const up = new UpcastChain();
  // example upcaster: heartbeat v1 -> v2 rename mem_mb->mem_mib
  up.add("heartbeat.received", 1, (e) => {
    const p: any = e.payload;
    return { ...e, payload: { ...p, mem_mib: p.mem_mb, mem_mb: undefined }, headers: { ...(e.headers||{}), "x-upcasted-from": "1" } };
  });

  const bus = withDualWrite(rawBus, reg);

  // consumer with normalize + DLQ
  const subscribeWithDLQ = withDLQ(bus, { group: "hb-consumers", maxAttempts: 3 });
  await subscribeWithDLQ("heartbeat.received", async (e) => {
    const norm = up.toLatest("heartbeat.received", e, reg);
    reg.validate("heartbeat.received", norm.payload);
    // ... handle ...
  }, { from: "earliest" });

^ref-d8059b6a-393-0
  // changefeed: mirror 'processes' collection -> topic 'processes.changed'
  await startMongoChangefeed(db, bus, {
    collection: "processes",
    topic: "processes.changed",
    fullDocument: "updateLookup",
^ref-d8059b6a-469-0
^ref-d8059b6a-468-0
^ref-d8059b6a-467-0
^ref-d8059b6a-466-0 ^ref-d8059b6a-473-0
^ref-d8059b6a-465-0
^ref-d8059b6a-464-0 ^ref-d8059b6a-475-0
^ref-d8059b6a-463-0 ^ref-d8059b6a-476-0
^ref-d8059b6a-482-0
^ref-d8059b6a-478-0
^ref-d8059b6a-477-0
^ref-d8059b6a-476-0
^ref-d8059b6a-475-0 ^ref-d8059b6a-491-0
^ref-d8059b6a-473-0 ^ref-d8059b6a-492-0
^ref-d8059b6a-469-0
^ref-d8059b6a-468-0
^ref-d8059b6a-467-0
^ref-d8059b6a-466-0
^ref-d8059b6a-465-0
^ref-d8059b6a-464-0
^ref-d8059b6a-463-0
^ref-d8059b6a-450-0 ^ref-d8059b6a-477-0
    resumeTokenStore: tokenStore(db, "cf:processes"), ^ref-d8059b6a-478-0
    map: (doc) => ({ id: String(doc._id), ...doc })
  }); ^ref-d8059b6a-463-0
 ^ref-d8059b6a-464-0
  console.log("[evolve] up");
^ref-d8059b6a-502-0
}
main().catch((e)=>{ console.error(e); process.exit(1); });
^ref-d8059b6a-450-0
```

^ref-d8059b6a-482-0
---

^ref-d8059b6a-469-0 ^ref-d8059b6a-473-0 ^ref-d8059b6a-491-0 ^ref-d8059b6a-515-0
^ref-d8059b6a-468-0 ^ref-d8059b6a-492-0
^ref-d8059b6a-467-0 ^ref-d8059b6a-475-0
^ref-d8059b6a-466-0 ^ref-d8059b6a-476-0
^ref-d8059b6a-465-0 ^ref-d8059b6a-477-0
# 6) Sibilant sprinkles (pseudo) ^ref-d8059b6a-463-0 ^ref-d8059b6a-478-0
 ^ref-d8059b6a-464-0
```lisp ^ref-d8059b6a-465-0
; shared/sibilant/prom/evolve.sib (pseudo) ^ref-d8059b6a-466-0
(defn upcast->latest [topic e] ^ref-d8059b6a-467-0 ^ref-d8059b6a-482-0
  (.toLatest up topic e schema-reg)) ^ref-d8059b6a-468-0
 ^ref-d8059b6a-469-0 ^ref-d8059b6a-502-0
(defmacro dual-write! [bus topic payload]
  `(.publish ~bus ~topic ~payload {:headers {"x-source" "sib"}}))
```
 ^ref-d8059b6a-473-0
---
 ^ref-d8059b6a-475-0
# 7) Kanban adds ^ref-d8059b6a-476-0 ^ref-d8059b6a-491-0 ^ref-d8059b6a-533-0
 ^ref-d8059b6a-477-0 ^ref-d8059b6a-492-0
* [ ] Register **v+1** schema for any evolving topic and write minimal **upcaster** ^ref-d8059b6a-478-0
* [ ] Wrap writers with **withDualWrite**
* [ ] Switch critical readers to **subscribeNormalized**
* [ ] Add **withDLQ** around risky consumers; set `maxAttempts` ^ref-d8059b6a-538-0
* [ ] Deploy **changefeed** for collections you want mirrored to topics ^ref-d8059b6a-482-0 ^ref-d8059b6a-515-0
* [ ] Enable **scripts/lint-topics.ts** in CI
* [ ] Write a small **cutover** script to replay historical events through upcasters into snapshots

--- ^ref-d8059b6a-543-0
 ^ref-d8059b6a-502-0
Want **Part 7** next? I can ship:

* **State snapshots API** (read models with ETags + caching), ^ref-d8059b6a-547-0
* **Transactional projector** (Mongo session/txn around multi-collection updates), ^ref-d8059b6a-491-0
* **Time Travel** query helper (reconstruct state at T using snapshots + deltas), ^ref-d8059b6a-492-0
* and a **dev harness** that spins in-memory bus + fake services for integration tests.<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [State Snapshots API and Transactional Projector](state-snapshots-api-and-transactional-projector.md)
- [prom-lib-rate-limiters-and-replay-api](prom-lib-rate-limiters-and-replay-api.md)
- [Stateful Partitions and Rebalancing](stateful-partitions-and-rebalancing.md)
- [Event Bus MVP](event-bus-mvp.md)
- [Services](chunks/services.md)
- [Unique Info Dump Index](unique-info-dump-index.md)
- [Mongo Outbox Implementation](mongo-outbox-implementation.md)
- [Cross-Language Runtime Polymorphism](cross-language-runtime-polymorphism.md)
- [WebSocket Gateway Implementation](websocket-gateway-implementation.md)
- [aionian-circuit-math](aionian-circuit-math.md)
- [archetype-ecs](archetype-ecs.md)
- [Diagrams](chunks/diagrams.md)
- [DSL](chunks/dsl.md)
- [Promethean-native config design](promethean-native-config-design.md)
- [Promethean Event Bus MVP v0.1](promethean-event-bus-mvp-v0-1.md)
- [observability-infrastructure-setup](observability-infrastructure-setup.md)
- [ecs-offload-workers](ecs-offload-workers.md)
- [Cross-Target Macro System in Sibilant](cross-target-macro-system-in-sibilant.md)
- [polyglot-repl-interface-layer](polyglot-repl-interface-layer.md)
- [polymorphic-meta-programming-engine](polymorphic-meta-programming-engine.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [Migrate to Provider-Tenant Architecture](migrate-to-provider-tenant-architecture.md)
- [Agent Tasks: Persistence Migration to DualStore](agent-tasks-persistence-migration-to-dualstore.md)
- [compiler-kit-foundations](compiler-kit-foundations.md)
- [api-gateway-versioning](api-gateway-versioning.md)
- [AI-Centric OS with MCP Layer](ai-centric-os-with-mcp-layer.md)
- [ecs-scheduler-and-prefabs](ecs-scheduler-and-prefabs.md)
- [heartbeat-fragment-demo](heartbeat-fragment-demo.md)
- [JavaScript](chunks/javascript.md)
- [Debugging Broker Connections and Agent Behavior](debugging-broker-connections-and-agent-behavior.md)
- [Admin Dashboard for User Management](admin-dashboard-for-user-management.md)
- [Board Walk – 2025-08-11](board-walk-2025-08-11.md)
- [Tooling](chunks/tooling.md)
- [2d-sandbox-field](2d-sandbox-field.md)
- [Agent Reflections and Prompt Evolution](agent-reflections-and-prompt-evolution.md)
- [Canonical Org-Babel Matplotlib Animation Template](canonical-org-babel-matplotlib-animation-template.md)
- [Math Fundamentals](chunks/math-fundamentals.md)
- [template-based-compilation](template-based-compilation.md)
- [ts-to-lisp-transpiler](ts-to-lisp-transpiler.md)
- [typed-struct-compiler](typed-struct-compiler.md)
- [Sibilant Meta-Prompt DSL](sibilant-meta-prompt-dsl.md)
- [System Scheduler with Resource-Aware DAG](system-scheduler-with-resource-aware-dag.md)
- [sibilant-macro-targets](sibilant-macro-targets.md)
- [sibilant-meta-string-templating-runtime](sibilant-meta-string-templating-runtime.md)
- [sibilant-metacompiler-overview](sibilant-metacompiler-overview.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [Exception Layer Analysis](exception-layer-analysis.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [Model Selection for Lightweight Conversational Tasks](model-selection-for-lightweight-conversational-tasks.md)
- [Obsidian ChatGPT Plugin Integration Guide](obsidian-chatgpt-plugin-integration-guide.md)
- [Obsidian ChatGPT Plugin Integration](obsidian-chatgpt-plugin-integration.md)
- [eidolon-node-lifecycle](eidolon-node-lifecycle.md)
- [field-node-diagram-outline](field-node-diagram-outline.md)
- [AI-First-OS-Model-Context-Protocol](ai-first-os-model-context-protocol.md)
- [Promethean Agent Config DSL](promethean-agent-config-dsl.md)
- [Event Bus Projections Architecture](event-bus-projections-architecture.md)
- [balanced-bst](balanced-bst.md)
- [Per-Domain Policy System for JS Crawler](per-domain-policy-system-for-js-crawler.md)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler](ollama-llm-provider-for-pseudo-code-transpiler.md)
- [obsidian-ignore-node-modules-regex](obsidian-ignore-node-modules-regex.md)
- [Shared](chunks/shared.md)
- [Simulation Demo](chunks/simulation-demo.md)
- [Window Management](chunks/window-management.md)
- [field-dynamics-math-blocks](field-dynamics-math-blocks.md)
- [field-interaction-equations](field-interaction-equations.md)
- [lisp-dsl-for-window-management](lisp-dsl-for-window-management.md)
- [Local-First Intention→Code Loop with Free Models](local-first-intention-code-loop-with-free-models.md)
- [markdown-to-org-transpiler](markdown-to-org-transpiler.md)
- [i3-bluetooth-setup](i3-bluetooth-setup.md)
- [Obsidian Templating Plugins Integration Guide](obsidian-templating-plugins-integration-guide.md)
- [Duck's Self-Referential Perceptual Loop](ducks-self-referential-perceptual-loop.md)
- [EidolonField](eidolonfield.md)
- [Eidolon Field Abstract Model](eidolon-field-abstract-model.md)
- [Factorio AI with External Agents](factorio-ai-with-external-agents.md)
- [Matplotlib Animation with Async Execution](matplotlib-animation-with-async-execution.md)
- [ParticleSimulationWithCanvasAndFFmpeg](particlesimulationwithcanvasandffmpeg.md)
- [graph-ds](graph-ds.md)
- [promethean-system-diagrams](promethean-system-diagrams.md)
- [field-node-diagram-set](field-node-diagram-set.md)
- [Promethean Web UI Setup](promethean-web-ui-setup.md)
- [Board Automation Improvements](board-automation-improvements.md)
- [Promethean_Eidolon_Synchronicity_Model](promethean-eidolon-synchronicity-model.md)
- [Promethean Infrastructure Setup](promethean-infrastructure-setup.md)
- [prompt-programming-language-lisp](prompt-programming-language-lisp.md)
- [Prompt_Folder_Bootstrap](prompt-folder-bootstrap.md)
- [heartbeat-simulation-snippets](heartbeat-simulation-snippets.md)
- [field-node-diagram-visualizations](field-node-diagram-visualizations.md)
- [Duck's Attractor States](ducks-attractor-states.md)
- [Local-Offline-Model-Deployment-Strategy](local-offline-model-deployment-strategy.md)
- [Lisp-Compiler-Integration](lisp-compiler-integration.md)
- [Lispy Macros with syntax-rules](lispy-macros-with-syntax-rules.md)
- [Local-Only-LLM-Workflow](local-only-llm-workflow.md)
- [Creative Moments](creative-moments.md)
- [Operations](chunks/operations.md)
- [layer-1-uptime-diagrams](layer-1-uptime-diagrams.md)
- [Shared Package Structure](shared-package-structure.md)
- [Language-Agnostic Mirror System](language-agnostic-mirror-system.md)
- [Pure-Node Crawl Stack with Playwright and Crawlee](pure-node-crawl-stack-with-playwright-and-crawlee.md)
- [Protocol_0_The_Contradiction_Engine](protocol-0-the-contradiction-engine.md)
- [ripple-propagation-demo](ripple-propagation-demo.md)
- [i3-config-validation-methods](i3-config-validation-methods.md)
- [Promethean Workflow Optimization](promethean-workflow-optimization.md)
- [Prometheus Observability Stack](prometheus-observability-stack.md)
- [Provider-Agnostic Chat Panel Implementation](provider-agnostic-chat-panel-implementation.md)
- [Pure TypeScript Search Microservice](pure-typescript-search-microservice.md)
- [RAG UI Panel with Qdrant and PostgREST](rag-ui-panel-with-qdrant-and-postgrest.md)
- [Redirecting Standard Error](redirecting-standard-error.md)
- [Recursive Prompt Construction Engine](recursive-prompt-construction-engine.md)
- [shared-package-layout-clarification](shared-package-layout-clarification.md)
- [Interop and Source Maps](interop-and-source-maps.md)
- [homeostasis-decay-formulas](homeostasis-decay-formulas.md)
- [komorebi-group-window-hack](komorebi-group-window-hack.md)
- [js-to-lisp-reverse-compiler](js-to-lisp-reverse-compiler.md)
- [Self-Agency in AI Interaction](self-agency-in-ai-interaction.md)
- [set-assignment-in-lisp-ast](set-assignment-in-lisp-ast.md)
- [Fnord Tracer Protocol](fnord-tracer-protocol.md)
- [DuckDuckGoSearchPipeline](duckduckgosearchpipeline.md)
- [Chroma-Embedding-Refactor](chroma-embedding-refactor.md)
- [universal-intention-code-fabric](universal-intention-code-fabric.md)
- [Promethean Agent DSL TS Scaffold](promethean-agent-dsl-ts-scaffold.md)
- [TypeScript Patch for Tool Calling Support](typescript-patch-for-tool-calling-support.md)
- [Promethean Pipelines](promethean-pipelines.md)
- [Promethean Pipelines: Local TypeScript-First Workflow](promethean-pipelines-local-typescript-first-workflow.md)
- [refactor-relations](refactor-relations.md)
- [Universal Lisp Interface](universal-lisp-interface.md)
- [Functional Embedding Pipeline Refactor](functional-embedding-pipeline-refactor.md)
- [Layer1SurvivabilityEnvelope](layer1survivabilityenvelope.md)
- [Voice Access Layer Design](voice-access-layer-design.md)
- [Performance-Optimized-Polyglot-Bridge](performance-optimized-polyglot-bridge.md)
- [zero-copy-snapshots-and-workers](zero-copy-snapshots-and-workers.md)
- [Model Upgrade Calm-Down Guide](model-upgrade-calm-down-guide.md)
- [i3-layout-saver](i3-layout-saver.md)
- [Docops Feature Updates](docops-feature-updates.md)
- [windows-tiling-with-autohotkey](windows-tiling-with-autohotkey.md)
## Sources
- [Services — L4](chunks/services.md#^ref-75ea4a6a-4-0) (line 4, col 0, score 0.66)
- [Unique Info Dump Index — L38](unique-info-dump-index.md#^ref-30ec3ba6-38-0) (line 38, col 0, score 0.85)
- [compiler-kit-foundations — L1](compiler-kit-foundations.md#^ref-01b21543-1-0) (line 1, col 0, score 0.75)
- [template-based-compilation — L1](template-based-compilation.md#^ref-f8877e5e-1-0) (line 1, col 0, score 0.74)
- [graph-ds — L1](graph-ds.md#^ref-6620e2f2-1-0) (line 1, col 0, score 0.74)
- [promethean-system-diagrams — L1](promethean-system-diagrams.md#^ref-b51e19b4-1-0) (line 1, col 0, score 0.73)
- [eidolon-node-lifecycle — L1](eidolon-node-lifecycle.md#^ref-938eca9c-1-0) (line 1, col 0, score 0.72)
- [ts-to-lisp-transpiler — L1](ts-to-lisp-transpiler.md#^ref-ba11486b-1-0) (line 1, col 0, score 0.72)
- [Mongo Outbox Implementation — L1](mongo-outbox-implementation.md#^ref-9c1acd1e-1-0) (line 1, col 0, score 0.71)
- [archetype-ecs — L1](archetype-ecs.md#^ref-8f4c1e86-1-0) (line 1, col 0, score 0.7)
- [typed-struct-compiler — L1](typed-struct-compiler.md#^ref-78eeedf7-1-0) (line 1, col 0, score 0.7)
- [layer-1-uptime-diagrams — L1](layer-1-uptime-diagrams.md#^ref-4127189a-1-0) (line 1, col 0, score 0.7)
- [field-node-diagram-outline — L1](field-node-diagram-outline.md#^ref-1f32c94a-1-0) (line 1, col 0, score 0.7)
- [field-node-diagram-set — L1](field-node-diagram-set.md#^ref-22b989d5-1-0) (line 1, col 0, score 0.7)
- [Stateful Partitions and Rebalancing — L3](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-3-0) (line 3, col 0, score 0.58)
- [State Snapshots API and Transactional Projector — L3](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-3-0) (line 3, col 0, score 0.67)
- [Stateful Partitions and Rebalancing — L522](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-522-0) (line 522, col 0, score 0.67)
- [Mongo Outbox Implementation — L3](mongo-outbox-implementation.md#^ref-9c1acd1e-3-0) (line 3, col 0, score 0.69)
- [prom-lib-rate-limiters-and-replay-api — L378](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-378-0) (line 378, col 0, score 0.79)
- [Services — L10](chunks/services.md#^ref-75ea4a6a-10-0) (line 10, col 0, score 0.7)
- [Cross-Language Runtime Polymorphism — L209](cross-language-runtime-polymorphism.md#^ref-c34c36a6-209-0) (line 209, col 0, score 0.7)
- [ecs-offload-workers — L486](ecs-offload-workers.md#^ref-6498b9d7-486-0) (line 486, col 0, score 0.7)
- [Event Bus MVP — L548](event-bus-mvp.md#^ref-534fe91d-548-0) (line 548, col 0, score 0.7)
- [Mongo Outbox Implementation — L552](mongo-outbox-implementation.md#^ref-9c1acd1e-552-0) (line 552, col 0, score 0.7)
- [WebSocket Gateway Implementation — L322](websocket-gateway-implementation.md#^ref-e811123d-322-0) (line 322, col 0, score 0.79)
- [Shared Package Structure — L117](shared-package-structure.md#^ref-66a72fc3-117-0) (line 117, col 0, score 0.73)
- [compiler-kit-foundations — L31](compiler-kit-foundations.md#^ref-01b21543-31-0) (line 31, col 0, score 0.75)
- [prom-lib-rate-limiters-and-replay-api — L106](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-106-0) (line 106, col 0, score 0.69)
- [Mongo Outbox Implementation — L152](mongo-outbox-implementation.md#^ref-9c1acd1e-152-0) (line 152, col 0, score 0.74)
- [universal-intention-code-fabric — L68](universal-intention-code-fabric.md#^ref-c14edce7-68-0) (line 68, col 0, score 0.72)
- [Event Bus MVP — L370](event-bus-mvp.md#^ref-534fe91d-370-0) (line 370, col 0, score 0.66)
- [prom-lib-rate-limiters-and-replay-api — L45](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-45-0) (line 45, col 0, score 0.71)
- [Promethean Event Bus MVP v0.1 — L380](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-380-0) (line 380, col 0, score 0.73)
- [Stateful Partitions and Rebalancing — L290](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-290-0) (line 290, col 0, score 0.63)
- [Stateful Partitions and Rebalancing — L202](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-202-0) (line 202, col 0, score 0.7)
- [Mongo Outbox Implementation — L187](mongo-outbox-implementation.md#^ref-9c1acd1e-187-0) (line 187, col 0, score 0.72)
- [Promethean Event Bus MVP v0.1 — L474](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-474-0) (line 474, col 0, score 0.72)
- [Promethean Agent DSL TS Scaffold — L142](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-142-0) (line 142, col 0, score 0.71)
- [compiler-kit-foundations — L140](compiler-kit-foundations.md#^ref-01b21543-140-0) (line 140, col 0, score 0.71)
- [Promethean Web UI Setup — L351](promethean-web-ui-setup.md#^ref-bc5172ca-351-0) (line 351, col 0, score 0.71)
- [Chroma-Embedding-Refactor — L64](chroma-embedding-refactor.md#^ref-8b256935-64-0) (line 64, col 0, score 0.64)
- [Chroma-Embedding-Refactor — L109](chroma-embedding-refactor.md#^ref-8b256935-109-0) (line 109, col 0, score 0.64)
- [Chroma-Embedding-Refactor — L258](chroma-embedding-refactor.md#^ref-8b256935-258-0) (line 258, col 0, score 0.64)
- [Chroma Toolkit Consolidation Plan — L72](chroma-toolkit-consolidation-plan.md#^ref-5020e892-72-0) (line 72, col 0, score 0.64)
- [Chroma Toolkit Consolidation Plan — L88](chroma-toolkit-consolidation-plan.md#^ref-5020e892-88-0) (line 88, col 0, score 0.64)
- [Chroma Toolkit Consolidation Plan — L107](chroma-toolkit-consolidation-plan.md#^ref-5020e892-107-0) (line 107, col 0, score 0.64)
- [Chroma Toolkit Consolidation Plan — L148](chroma-toolkit-consolidation-plan.md#^ref-5020e892-148-0) (line 148, col 0, score 0.64)
- [Dynamic Context Model for Web Components — L331](dynamic-context-model-for-web-components.md#^ref-f7702bf8-331-0) (line 331, col 0, score 0.66)
- [Promethean-native config design — L31](promethean-native-config-design.md#^ref-ab748541-31-0) (line 31, col 0, score 0.73)
- [Sibilant Meta-Prompt DSL — L100](sibilant-meta-prompt-dsl.md#^ref-af5d2824-100-0) (line 100, col 0, score 0.58)
- [template-based-compilation — L21](template-based-compilation.md#^ref-f8877e5e-21-0) (line 21, col 0, score 0.71)
- [Promethean-native config design — L32](promethean-native-config-design.md#^ref-ab748541-32-0) (line 32, col 0, score 0.6)
- [Promethean-native config design — L33](promethean-native-config-design.md#^ref-ab748541-33-0) (line 33, col 0, score 0.7)
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
- [Layer1SurvivabilityEnvelope — L137](layer1survivabilityenvelope.md#^ref-64a9f9f9-137-0) (line 137, col 0, score 0.62)
- [Promethean Event Bus MVP v0.1 — L104](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-104-0) (line 104, col 0, score 0.57)
- [prom-lib-rate-limiters-and-replay-api — L351](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-351-0) (line 351, col 0, score 0.61)
- [api-gateway-versioning — L280](api-gateway-versioning.md#^ref-0580dcd3-280-0) (line 280, col 0, score 0.61)
- [Mongo Outbox Implementation — L142](mongo-outbox-implementation.md#^ref-9c1acd1e-142-0) (line 142, col 0, score 0.61)
- [WebSocket Gateway Implementation — L614](websocket-gateway-implementation.md#^ref-e811123d-614-0) (line 614, col 0, score 0.58)
- [Agent Reflections and Prompt Evolution — L143](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-143-0) (line 143, col 0, score 0.6)
- [AI-Centric OS with MCP Layer — L417](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-417-0) (line 417, col 0, score 0.6)
- [AI-First-OS-Model-Context-Protocol — L19](ai-first-os-model-context-protocol.md#^ref-618198f4-19-0) (line 19, col 0, score 0.6)
- [aionian-circuit-math — L159](aionian-circuit-math.md#^ref-f2d83a77-159-0) (line 159, col 0, score 0.6)
- [api-gateway-versioning — L278](api-gateway-versioning.md#^ref-0580dcd3-278-0) (line 278, col 0, score 0.58)
- [Model Upgrade Calm-Down Guide — L42](model-upgrade-calm-down-guide.md#^ref-db74343f-42-0) (line 42, col 0, score 0.62)
- [api-gateway-versioning — L272](api-gateway-versioning.md#^ref-0580dcd3-272-0) (line 272, col 0, score 0.61)
- [Chroma-Embedding-Refactor — L7](chroma-embedding-refactor.md#^ref-8b256935-7-0) (line 7, col 0, score 0.61)
- [Agent Tasks: Persistence Migration to DualStore — L8](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-8-0) (line 8, col 0, score 0.65)
- [Agent Tasks: Persistence Migration to DualStore — L12](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-12-0) (line 12, col 0, score 0.6)
- [Exception Layer Analysis — L128](exception-layer-analysis.md#^ref-21d5cc09-128-0) (line 128, col 0, score 0.55)
- [Local-Offline-Model-Deployment-Strategy — L215](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-215-0) (line 215, col 0, score 0.53)
- [Language-Agnostic Mirror System — L30](language-agnostic-mirror-system.md#^ref-d2b3628c-30-0) (line 30, col 0, score 0.57)
- [Agent Tasks: Persistence Migration to DualStore — L26](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-26-0) (line 26, col 0, score 0.67)
- [Agent Tasks: Persistence Migration to DualStore — L84](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-84-0) (line 84, col 0, score 0.68)
- [Event Bus MVP — L536](event-bus-mvp.md#^ref-534fe91d-536-0) (line 536, col 0, score 0.67)
- [State Snapshots API and Transactional Projector — L242](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-242-0) (line 242, col 0, score 0.66)
- [prom-lib-rate-limiters-and-replay-api — L329](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-329-0) (line 329, col 0, score 0.63)
- [Fnord Tracer Protocol — L125](fnord-tracer-protocol.md#^ref-fc21f824-125-0) (line 125, col 0, score 0.62)
- [zero-copy-snapshots-and-workers — L1](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-1-0) (line 1, col 0, score 0.62)
- [JavaScript — L8](chunks/javascript.md#^ref-c1618c66-8-0) (line 8, col 0, score 0.62)
- [Unique Info Dump Index — L43](unique-info-dump-index.md#^ref-30ec3ba6-43-0) (line 43, col 0, score 0.62)
- [JavaScript — L11](chunks/javascript.md#^ref-c1618c66-11-0) (line 11, col 0, score 0.62)
- [ecs-offload-workers — L457](ecs-offload-workers.md#^ref-6498b9d7-457-0) (line 457, col 0, score 0.62)
- [Stateful Partitions and Rebalancing — L267](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-267-0) (line 267, col 0, score 0.92)
- [Event Bus MVP — L7](event-bus-mvp.md#^ref-534fe91d-7-0) (line 7, col 0, score 0.62)
- [Stateful Partitions and Rebalancing — L448](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-448-0) (line 448, col 0, score 0.69)
- [Event Bus MVP — L99](event-bus-mvp.md#^ref-534fe91d-99-0) (line 99, col 0, score 0.66)
- [Event Bus MVP — L284](event-bus-mvp.md#^ref-534fe91d-284-0) (line 284, col 0, score 0.8)
- [Stateful Partitions and Rebalancing — L351](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-351-0) (line 351, col 0, score 0.67)
- [Stateful Partitions and Rebalancing — L101](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-101-0) (line 101, col 0, score 0.84)
- [Mongo Outbox Implementation — L11](mongo-outbox-implementation.md#^ref-9c1acd1e-11-0) (line 11, col 0, score 0.72)
- [Event Bus MVP — L258](event-bus-mvp.md#^ref-534fe91d-258-0) (line 258, col 0, score 0.66)
- [State Snapshots API and Transactional Projector — L179](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-179-0) (line 179, col 0, score 0.63)
- [AI-Centric OS with MCP Layer — L11](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-11-0) (line 11, col 0, score 0.63)
- [Mongo Outbox Implementation — L323](mongo-outbox-implementation.md#^ref-9c1acd1e-323-0) (line 323, col 0, score 0.72)
- [Promethean Agent Config DSL — L11](promethean-agent-config-dsl.md#^ref-2c00ce45-11-0) (line 11, col 0, score 0.66)
- [Stateful Partitions and Rebalancing — L166](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-166-0) (line 166, col 0, score 0.75)
- [WebSocket Gateway Implementation — L533](websocket-gateway-implementation.md#^ref-e811123d-533-0) (line 533, col 0, score 0.73)
- [WebSocket Gateway Implementation — L56](websocket-gateway-implementation.md#^ref-e811123d-56-0) (line 56, col 0, score 0.65)
- [State Snapshots API and Transactional Projector — L93](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-93-0) (line 93, col 0, score 0.67)
- [WebSocket Gateway Implementation — L473](websocket-gateway-implementation.md#^ref-e811123d-473-0) (line 473, col 0, score 0.7)
- [prom-lib-rate-limiters-and-replay-api — L226](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-226-0) (line 226, col 0, score 0.72)
- [prom-lib-rate-limiters-and-replay-api — L260](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-260-0) (line 260, col 0, score 0.71)
- [Mongo Outbox Implementation — L381](mongo-outbox-implementation.md#^ref-9c1acd1e-381-0) (line 381, col 0, score 0.65)
- [prom-lib-rate-limiters-and-replay-api — L282](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-282-0) (line 282, col 0, score 0.7)
- [Exception Layer Analysis — L136](exception-layer-analysis.md#^ref-21d5cc09-136-0) (line 136, col 0, score 0.66)
- [Promethean Event Bus MVP v0.1 — L373](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-373-0) (line 373, col 0, score 0.66)
- [Migrate to Provider-Tenant Architecture — L64](migrate-to-provider-tenant-architecture.md#^ref-54382370-64-0) (line 64, col 0, score 0.66)
- [prom-lib-rate-limiters-and-replay-api — L377](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-377-0) (line 377, col 0, score 0.72)
- [Migrate to Provider-Tenant Architecture — L128](migrate-to-provider-tenant-architecture.md#^ref-54382370-128-0) (line 128, col 0, score 0.65)
- [Sibilant Meta-Prompt DSL — L133](sibilant-meta-prompt-dsl.md#^ref-af5d2824-133-0) (line 133, col 0, score 0.64)
- [Pure TypeScript Search Microservice — L514](pure-typescript-search-microservice.md#^ref-d17d3a96-514-0) (line 514, col 0, score 0.68)
- [AI-Centric OS with MCP Layer — L40](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-40-0) (line 40, col 0, score 0.68)
- [Migrate to Provider-Tenant Architecture — L243](migrate-to-provider-tenant-architecture.md#^ref-54382370-243-0) (line 243, col 0, score 0.63)
- [universal-intention-code-fabric — L27](universal-intention-code-fabric.md#^ref-c14edce7-27-0) (line 27, col 0, score 0.67)
- [Promethean Pipelines — L77](promethean-pipelines.md#^ref-8b8e6103-77-0) (line 77, col 0, score 0.61)
- [Language-Agnostic Mirror System — L512](language-agnostic-mirror-system.md#^ref-d2b3628c-512-0) (line 512, col 0, score 0.59)
- [Layer1SurvivabilityEnvelope — L129](layer1survivabilityenvelope.md#^ref-64a9f9f9-129-0) (line 129, col 0, score 0.58)
- [Agent Tasks: Persistence Migration to DualStore — L78](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-78-0) (line 78, col 0, score 0.57)
- [Agent Tasks: Persistence Migration to DualStore — L81](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-81-0) (line 81, col 0, score 0.58)
- [AI-Centric OS with MCP Layer — L177](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-177-0) (line 177, col 0, score 0.6)
- [Mongo Outbox Implementation — L533](mongo-outbox-implementation.md#^ref-9c1acd1e-533-0) (line 533, col 0, score 0.66)
- [Promethean-native config design — L342](promethean-native-config-design.md#^ref-ab748541-342-0) (line 342, col 0, score 0.59)
- [State Snapshots API and Transactional Projector — L318](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-318-0) (line 318, col 0, score 0.56)
- [Promethean Event Bus MVP v0.1 — L871](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-871-0) (line 871, col 0, score 0.53)
- [aionian-circuit-math — L141](aionian-circuit-math.md#^ref-f2d83a77-141-0) (line 141, col 0, score 0.52)
- [Chroma Toolkit Consolidation Plan — L122](chroma-toolkit-consolidation-plan.md#^ref-5020e892-122-0) (line 122, col 0, score 0.68)
- [Fnord Tracer Protocol — L183](fnord-tracer-protocol.md#^ref-fc21f824-183-0) (line 183, col 0, score 0.52)
- [WebSocket Gateway Implementation — L437](websocket-gateway-implementation.md#^ref-e811123d-437-0) (line 437, col 0, score 0.52)
- [Board Walk – 2025-08-11 — L71](board-walk-2025-08-11.md#^ref-7aa1eb92-71-0) (line 71, col 0, score 0.59)
- [Mongo Outbox Implementation — L537](mongo-outbox-implementation.md#^ref-9c1acd1e-537-0) (line 537, col 0, score 0.67)
- [observability-infrastructure-setup — L1](observability-infrastructure-setup.md#^ref-b4e64f8c-1-0) (line 1, col 0, score 0.6)
- [Model Upgrade Calm-Down Guide — L31](model-upgrade-calm-down-guide.md#^ref-db74343f-31-0) (line 31, col 0, score 0.6)
- [Admin Dashboard for User Management — L1](admin-dashboard-for-user-management.md#^ref-2901a3e9-1-0) (line 1, col 0, score 0.59)
- [Voice Access Layer Design — L100](voice-access-layer-design.md#^ref-543ed9b3-100-0) (line 100, col 0, score 0.58)
- [Agent Tasks: Persistence Migration to DualStore — L95](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-95-0) (line 95, col 0, score 0.57)
- [Board Walk – 2025-08-11 — L6](board-walk-2025-08-11.md#^ref-7aa1eb92-6-0) (line 6, col 0, score 0.57)
- [Model Upgrade Calm-Down Guide — L58](model-upgrade-calm-down-guide.md#^ref-db74343f-58-0) (line 58, col 0, score 0.57)
- [Promethean Pipelines — L18](promethean-pipelines.md#^ref-8b8e6103-18-0) (line 18, col 0, score 0.57)
- [RAG UI Panel with Qdrant and PostgREST — L357](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-357-0) (line 357, col 0, score 0.66)
- [Migrate to Provider-Tenant Architecture — L20](migrate-to-provider-tenant-architecture.md#^ref-54382370-20-0) (line 20, col 0, score 0.59)
- [Cross-Language Runtime Polymorphism — L31](cross-language-runtime-polymorphism.md#^ref-c34c36a6-31-0) (line 31, col 0, score 0.57)
- [universal-intention-code-fabric — L394](universal-intention-code-fabric.md#^ref-c14edce7-394-0) (line 394, col 0, score 0.56)
- [Dynamic Context Model for Web Components — L171](dynamic-context-model-for-web-components.md#^ref-f7702bf8-171-0) (line 171, col 0, score 0.56)
- [Promethean_Eidolon_Synchronicity_Model — L41](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-41-0) (line 41, col 0, score 0.55)
- [Stateful Partitions and Rebalancing — L516](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-516-0) (line 516, col 0, score 0.75)
- [Stateful Partitions and Rebalancing — L523](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-523-0) (line 523, col 0, score 0.6)
- [Promethean Event Bus MVP v0.1 — L119](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-119-0) (line 119, col 0, score 0.65)
- [Promethean-native config design — L59](promethean-native-config-design.md#^ref-ab748541-59-0) (line 59, col 0, score 0.58)
- [Language-Agnostic Mirror System — L513](language-agnostic-mirror-system.md#^ref-d2b3628c-513-0) (line 513, col 0, score 0.58)
- [Voice Access Layer Design — L216](voice-access-layer-design.md#^ref-543ed9b3-216-0) (line 216, col 0, score 0.57)
- [Promethean Event Bus MVP v0.1 — L331](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-331-0) (line 331, col 0, score 0.57)
- [prom-lib-rate-limiters-and-replay-api — L90](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-90-0) (line 90, col 0, score 1)
- [State Snapshots API and Transactional Projector — L233](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-233-0) (line 233, col 0, score 1)
- [Mongo Outbox Implementation — L305](mongo-outbox-implementation.md#^ref-9c1acd1e-305-0) (line 305, col 0, score 0.84)
- [Stateful Partitions and Rebalancing — L185](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-185-0) (line 185, col 0, score 0.82)
- [Stateful Partitions and Rebalancing — L326](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-326-0) (line 326, col 0, score 0.77)
- [Dynamic Context Model for Web Components — L376](dynamic-context-model-for-web-components.md#^ref-f7702bf8-376-0) (line 376, col 0, score 0.77)
- [Event Bus Projections Architecture — L3](event-bus-projections-architecture.md#^ref-cf6b9b17-3-0) (line 3, col 0, score 0.71)
- [prom-lib-rate-limiters-and-replay-api — L92](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-92-0) (line 92, col 0, score 0.71)
- [Promethean Event Bus MVP v0.1 — L832](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-832-0) (line 832, col 0, score 0.71)
- [Lisp-Compiler-Integration — L13](lisp-compiler-integration.md#^ref-cfee6d36-13-0) (line 13, col 0, score 0.69)
- [Promethean Web UI Setup — L581](promethean-web-ui-setup.md#^ref-bc5172ca-581-0) (line 581, col 0, score 0.68)
- [Stateful Partitions and Rebalancing — L187](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-187-0) (line 187, col 0, score 0.68)
- [compiler-kit-foundations — L15](compiler-kit-foundations.md#^ref-01b21543-15-0) (line 15, col 0, score 0.68)
- [Promethean Pipelines — L58](promethean-pipelines.md#^ref-8b8e6103-58-0) (line 58, col 0, score 0.68)
- [Language-Agnostic Mirror System — L11](language-agnostic-mirror-system.md#^ref-d2b3628c-11-0) (line 11, col 0, score 0.68)
- [Promethean Pipelines: Local TypeScript-First Workflow — L219](promethean-pipelines-local-typescript-first-workflow.md#^ref-6b63edca-219-0) (line 219, col 0, score 0.68)
- [Redirecting Standard Error — L7](redirecting-standard-error.md#^ref-b3555ede-7-0) (line 7, col 0, score 0.68)
- [Mongo Outbox Implementation — L307](mongo-outbox-implementation.md#^ref-9c1acd1e-307-0) (line 307, col 0, score 0.68)
- [archetype-ecs — L423](archetype-ecs.md#^ref-8f4c1e86-423-0) (line 423, col 0, score 0.68)
- [universal-intention-code-fabric — L9](universal-intention-code-fabric.md#^ref-c14edce7-9-0) (line 9, col 0, score 0.68)
- [RAG UI Panel with Qdrant and PostgREST — L336](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-336-0) (line 336, col 0, score 0.67)
- [Promethean Infrastructure Setup — L501](promethean-infrastructure-setup.md#^ref-6deed6ac-501-0) (line 501, col 0, score 0.67)
- [State Snapshots API and Transactional Projector — L235](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-235-0) (line 235, col 0, score 0.65)
- [prom-lib-rate-limiters-and-replay-api — L186](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-186-0) (line 186, col 0, score 0.72)
- [Promethean Event Bus MVP v0.1 — L423](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-423-0) (line 423, col 0, score 0.73)
- [Promethean Event Bus MVP v0.1 — L28](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-28-0) (line 28, col 0, score 0.64)
- [compiler-kit-foundations — L324](compiler-kit-foundations.md#^ref-01b21543-324-0) (line 324, col 0, score 0.72)
- [WebSocket Gateway Implementation — L219](websocket-gateway-implementation.md#^ref-e811123d-219-0) (line 219, col 0, score 0.73)
- [Mongo Outbox Implementation — L37](mongo-outbox-implementation.md#^ref-9c1acd1e-37-0) (line 37, col 0, score 0.72)
- [State Snapshots API and Transactional Projector — L218](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-218-0) (line 218, col 0, score 0.71)
- [WebSocket Gateway Implementation — L333](websocket-gateway-implementation.md#^ref-e811123d-333-0) (line 333, col 0, score 0.72)
- [Promethean Event Bus MVP v0.1 — L510](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-510-0) (line 510, col 0, score 0.72)
- [Stateful Partitions and Rebalancing — L328](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-328-0) (line 328, col 0, score 0.7)
- [Promethean Event Bus MVP v0.1 — L197](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-197-0) (line 197, col 0, score 0.76)
- [Event Bus MVP — L434](event-bus-mvp.md#^ref-534fe91d-434-0) (line 434, col 0, score 0.75)
- [WebSocket Gateway Implementation — L296](websocket-gateway-implementation.md#^ref-e811123d-296-0) (line 296, col 0, score 0.72)
- [Event Bus Projections Architecture — L108](event-bus-projections-architecture.md#^ref-cf6b9b17-108-0) (line 108, col 0, score 0.71)
- [State Snapshots API and Transactional Projector — L162](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-162-0) (line 162, col 0, score 0.7)
- [Promethean Event Bus MVP v0.1 — L274](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-274-0) (line 274, col 0, score 0.7)
- [Promethean Event Bus MVP v0.1 — L190](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-190-0) (line 190, col 0, score 0.65)
- [Fnord Tracer Protocol — L214](fnord-tracer-protocol.md#^ref-fc21f824-214-0) (line 214, col 0, score 0.69)
- [layer-1-uptime-diagrams — L122](layer-1-uptime-diagrams.md#^ref-4127189a-122-0) (line 122, col 0, score 0.68)
- [archetype-ecs — L418](archetype-ecs.md#^ref-8f4c1e86-418-0) (line 418, col 0, score 0.66)
- [Recursive Prompt Construction Engine — L41](recursive-prompt-construction-engine.md#^ref-babdb9eb-41-0) (line 41, col 0, score 0.64)
- [Promethean Event Bus MVP v0.1 — L350](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-350-0) (line 350, col 0, score 0.64)
- [Stateful Partitions and Rebalancing — L524](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-524-0) (line 524, col 0, score 0.73)
- [Stateful Partitions and Rebalancing — L164](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-164-0) (line 164, col 0, score 0.66)
- [Stateful Partitions and Rebalancing — L342](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-342-0) (line 342, col 0, score 0.72)
- [WebSocket Gateway Implementation — L625](websocket-gateway-implementation.md#^ref-e811123d-625-0) (line 625, col 0, score 0.72)
- [Promethean Event Bus MVP v0.1 — L9](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-9-0) (line 9, col 0, score 0.68)
- [Chroma Toolkit Consolidation Plan — L130](chroma-toolkit-consolidation-plan.md#^ref-5020e892-130-0) (line 130, col 0, score 0.68)
- [Chroma Toolkit Consolidation Plan — L66](chroma-toolkit-consolidation-plan.md#^ref-5020e892-66-0) (line 66, col 0, score 0.68)
- [Stateful Partitions and Rebalancing — L417](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-417-0) (line 417, col 0, score 0.77)
- [Promethean Event Bus MVP v0.1 — L747](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-747-0) (line 747, col 0, score 0.75)
- [Mongo Outbox Implementation — L74](mongo-outbox-implementation.md#^ref-9c1acd1e-74-0) (line 74, col 0, score 0.71)
- [State Snapshots API and Transactional Projector — L132](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-132-0) (line 132, col 0, score 0.72)
- [Mongo Outbox Implementation — L451](mongo-outbox-implementation.md#^ref-9c1acd1e-451-0) (line 451, col 0, score 0.78)
- [RAG UI Panel with Qdrant and PostgREST — L172](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-172-0) (line 172, col 0, score 0.67)
- [refactor-relations — L10](refactor-relations.md#^ref-41ce0216-10-0) (line 10, col 0, score 0.67)
- [Pure TypeScript Search Microservice — L378](pure-typescript-search-microservice.md#^ref-d17d3a96-378-0) (line 378, col 0, score 0.66)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L178](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-178-0) (line 178, col 0, score 0.66)
- [TypeScript Patch for Tool Calling Support — L67](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-67-0) (line 67, col 0, score 0.63)
- [Functional Embedding Pipeline Refactor — L31](functional-embedding-pipeline-refactor.md#^ref-a4a25141-31-0) (line 31, col 0, score 0.66)
- [prom-lib-rate-limiters-and-replay-api — L194](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-194-0) (line 194, col 0, score 0.7)
- [Promethean Event Bus MVP v0.1 — L604](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-604-0) (line 604, col 0, score 0.69)
- [Chroma Toolkit Consolidation Plan — L139](chroma-toolkit-consolidation-plan.md#^ref-5020e892-139-0) (line 139, col 0, score 0.69)
- [Stateful Partitions and Rebalancing — L525](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-525-0) (line 525, col 0, score 0.74)
- [State Snapshots API and Transactional Projector — L330](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-330-0) (line 330, col 0, score 0.69)
- [Promethean Event Bus MVP v0.1 — L287](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-287-0) (line 287, col 0, score 0.68)
- [Voice Access Layer Design — L299](voice-access-layer-design.md#^ref-543ed9b3-299-0) (line 299, col 0, score 0.64)
- [Promethean Event Bus MVP v0.1 — L106](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-106-0) (line 106, col 0, score 0.58)
- [Promethean Event Bus MVP v0.1 — L809](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-809-0) (line 809, col 0, score 0.72)
- [balanced-bst — L3](balanced-bst.md#^ref-d3e7db72-3-0) (line 3, col 0, score 0.67)
- [ecs-scheduler-and-prefabs — L7](ecs-scheduler-and-prefabs.md#^ref-c62a1815-7-0) (line 7, col 0, score 0.66)
- [System Scheduler with Resource-Aware DAG — L5](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-5-0) (line 5, col 0, score 0.66)
- [State Snapshots API and Transactional Projector — L320](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-320-0) (line 320, col 0, score 0.65)
- [shared-package-layout-clarification — L157](shared-package-layout-clarification.md#^ref-36c8882a-157-0) (line 157, col 0, score 0.71)
- [TypeScript Patch for Tool Calling Support — L434](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-434-0) (line 434, col 0, score 0.69)
- [Per-Domain Policy System for JS Crawler — L115](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-115-0) (line 115, col 0, score 0.64)
- [Chroma-Embedding-Refactor — L26](chroma-embedding-refactor.md#^ref-8b256935-26-0) (line 26, col 0, score 0.67)
- [Migrate to Provider-Tenant Architecture — L38](migrate-to-provider-tenant-architecture.md#^ref-54382370-38-0) (line 38, col 0, score 0.67)
- [Migrate to Provider-Tenant Architecture — L100](migrate-to-provider-tenant-architecture.md#^ref-54382370-100-0) (line 100, col 0, score 0.67)
- [Migrate to Provider-Tenant Architecture — L98](migrate-to-provider-tenant-architecture.md#^ref-54382370-98-0) (line 98, col 0, score 0.66)
- [prom-lib-rate-limiters-and-replay-api — L369](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-369-0) (line 369, col 0, score 0.69)
- [ecs-offload-workers — L209](ecs-offload-workers.md#^ref-6498b9d7-209-0) (line 209, col 0, score 0.63)
- [Migrate to Provider-Tenant Architecture — L80](migrate-to-provider-tenant-architecture.md#^ref-54382370-80-0) (line 80, col 0, score 0.63)
- [ecs-offload-workers — L434](ecs-offload-workers.md#^ref-6498b9d7-434-0) (line 434, col 0, score 0.62)
- [observability-infrastructure-setup — L138](observability-infrastructure-setup.md#^ref-b4e64f8c-138-0) (line 138, col 0, score 0.62)
- [Promethean Pipelines: Local TypeScript-First Workflow — L3](promethean-pipelines-local-typescript-first-workflow.md#^ref-6b63edca-3-0) (line 3, col 0, score 0.61)
- [Universal Lisp Interface — L178](universal-lisp-interface.md#^ref-b01856b4-178-0) (line 178, col 0, score 0.61)
- [i3-layout-saver — L61](i3-layout-saver.md#^ref-31f0166e-61-0) (line 61, col 0, score 0.61)
- [Migrate to Provider-Tenant Architecture — L261](migrate-to-provider-tenant-architecture.md#^ref-54382370-261-0) (line 261, col 0, score 0.67)
- [Docops Feature Updates — L13](docops-feature-updates.md#^ref-2792d448-13-0) (line 13, col 0, score 0.6)
- [WebSocket Gateway Implementation — L560](websocket-gateway-implementation.md#^ref-e811123d-560-0) (line 560, col 0, score 0.67)
- [Promethean Event Bus MVP v0.1 — L149](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-149-0) (line 149, col 0, score 0.63)
- [compiler-kit-foundations — L471](compiler-kit-foundations.md#^ref-01b21543-471-0) (line 471, col 0, score 0.65)
- [Lispy Macros with syntax-rules — L9](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-9-0) (line 9, col 0, score 0.63)
- [Event Bus MVP — L471](event-bus-mvp.md#^ref-534fe91d-471-0) (line 471, col 0, score 0.63)
- [Event Bus MVP — L509](event-bus-mvp.md#^ref-534fe91d-509-0) (line 509, col 0, score 0.87)
- [Promethean Event Bus MVP v0.1 — L797](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-797-0) (line 797, col 0, score 0.63)
- [Promethean Agent DSL TS Scaffold — L632](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-632-0) (line 632, col 0, score 0.62)
- [WebSocket Gateway Implementation — L9](websocket-gateway-implementation.md#^ref-e811123d-9-0) (line 9, col 0, score 0.62)
- [Stateful Partitions and Rebalancing — L513](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-513-0) (line 513, col 0, score 0.63)
- [Per-Domain Policy System for JS Crawler — L184](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-184-0) (line 184, col 0, score 0.68)
- [Stateful Partitions and Rebalancing — L499](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-499-0) (line 499, col 0, score 0.78)
- [State Snapshots API and Transactional Projector — L303](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-303-0) (line 303, col 0, score 0.78)
- [WebSocket Gateway Implementation — L595](websocket-gateway-implementation.md#^ref-e811123d-595-0) (line 595, col 0, score 0.75)
- [Mongo Outbox Implementation — L516](mongo-outbox-implementation.md#^ref-9c1acd1e-516-0) (line 516, col 0, score 0.74)
- [ecs-scheduler-and-prefabs — L368](ecs-scheduler-and-prefabs.md#^ref-c62a1815-368-0) (line 368, col 0, score 0.72)
- [System Scheduler with Resource-Aware DAG — L366](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-366-0) (line 366, col 0, score 0.72)
- [archetype-ecs — L441](archetype-ecs.md#^ref-8f4c1e86-441-0) (line 441, col 0, score 0.71)
- [graph-ds — L343](graph-ds.md#^ref-6620e2f2-343-0) (line 343, col 0, score 0.7)
- [polyglot-repl-interface-layer — L146](polyglot-repl-interface-layer.md#^ref-9c79206d-146-0) (line 146, col 0, score 0.68)
- [template-based-compilation — L90](template-based-compilation.md#^ref-f8877e5e-90-0) (line 90, col 0, score 0.67)
- [shared-package-layout-clarification — L161](shared-package-layout-clarification.md#^ref-36c8882a-161-0) (line 161, col 0, score 0.67)
- [Cross-Target Macro System in Sibilant — L160](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-160-0) (line 160, col 0, score 0.66)
- [RAG UI Panel with Qdrant and PostgREST — L50](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-50-0) (line 50, col 0, score 0.68)
- [Stateful Partitions and Rebalancing — L511](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-511-0) (line 511, col 0, score 0.71)
- [Promethean-native config design — L328](promethean-native-config-design.md#^ref-ab748541-328-0) (line 328, col 0, score 0.66)
- [Universal Lisp Interface — L175](universal-lisp-interface.md#^ref-b01856b4-175-0) (line 175, col 0, score 0.66)
- [Cross-Language Runtime Polymorphism — L76](cross-language-runtime-polymorphism.md#^ref-c34c36a6-76-0) (line 76, col 0, score 0.62)
- [Cross-Language Runtime Polymorphism — L185](cross-language-runtime-polymorphism.md#^ref-c34c36a6-185-0) (line 185, col 0, score 0.62)
- [Cross-Target Macro System in Sibilant — L153](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-153-0) (line 153, col 0, score 0.61)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L7](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-7-0) (line 7, col 0, score 0.61)
- [Stateful Partitions and Rebalancing — L512](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-512-0) (line 512, col 0, score 0.69)
- [Promethean Event Bus MVP v0.1 — L147](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-147-0) (line 147, col 0, score 0.68)
- [Mongo Outbox Implementation — L284](mongo-outbox-implementation.md#^ref-9c1acd1e-284-0) (line 284, col 0, score 0.65)
- [Promethean Agent Config DSL — L288](promethean-agent-config-dsl.md#^ref-2c00ce45-288-0) (line 288, col 0, score 0.63)
- [Chroma Toolkit Consolidation Plan — L162](chroma-toolkit-consolidation-plan.md#^ref-5020e892-162-0) (line 162, col 0, score 0.63)
- [Protocol_0_The_Contradiction_Engine — L48](protocol-0-the-contradiction-engine.md#^ref-9a93a756-48-0) (line 48, col 0, score 0.67)
- [Interop and Source Maps — L504](interop-and-source-maps.md#^ref-cdfac40c-504-0) (line 504, col 0, score 0.63)
- [WebSocket Gateway Implementation — L618](websocket-gateway-implementation.md#^ref-e811123d-618-0) (line 618, col 0, score 0.63)
- [Migrate to Provider-Tenant Architecture — L160](migrate-to-provider-tenant-architecture.md#^ref-54382370-160-0) (line 160, col 0, score 0.7)
- [Agent Tasks: Persistence Migration to DualStore — L92](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-92-0) (line 92, col 0, score 0.68)
- [State Snapshots API and Transactional Projector — L317](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-317-0) (line 317, col 0, score 0.67)
- [Migrate to Provider-Tenant Architecture — L88](migrate-to-provider-tenant-architecture.md#^ref-54382370-88-0) (line 88, col 0, score 0.66)
- [prom-lib-rate-limiters-and-replay-api — L364](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-364-0) (line 364, col 0, score 0.64)
- [WebSocket Gateway Implementation — L443](websocket-gateway-implementation.md#^ref-e811123d-443-0) (line 443, col 0, score 0.66)
- [Dynamic Context Model for Web Components — L316](dynamic-context-model-for-web-components.md#^ref-f7702bf8-316-0) (line 316, col 0, score 0.65)
- [prompt-programming-language-lisp — L18](prompt-programming-language-lisp.md#^ref-d41a06d1-18-0) (line 18, col 0, score 0.65)
- [Agent Reflections and Prompt Evolution — L25](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-25-0) (line 25, col 0, score 0.65)
- [typed-struct-compiler — L355](typed-struct-compiler.md#^ref-78eeedf7-355-0) (line 355, col 0, score 0.64)
- [universal-intention-code-fabric — L393](universal-intention-code-fabric.md#^ref-c14edce7-393-0) (line 393, col 0, score 0.64)
- [Stateful Partitions and Rebalancing — L520](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-520-0) (line 520, col 0, score 0.91)
- [State Snapshots API and Transactional Projector — L325](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-325-0) (line 325, col 0, score 0.84)
- [WebSocket Gateway Implementation — L623](websocket-gateway-implementation.md#^ref-e811123d-623-0) (line 623, col 0, score 0.72)
- [prom-lib-rate-limiters-and-replay-api — L373](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-373-0) (line 373, col 0, score 0.72)
- [Mongo Outbox Implementation — L542](mongo-outbox-implementation.md#^ref-9c1acd1e-542-0) (line 542, col 0, score 0.71)
- [Universal Lisp Interface — L19](universal-lisp-interface.md#^ref-b01856b4-19-0) (line 19, col 0, score 0.61)
- [aionian-circuit-math — L135](aionian-circuit-math.md#^ref-f2d83a77-135-0) (line 135, col 0, score 0.59)
- [Event Bus MVP — L543](event-bus-mvp.md#^ref-534fe91d-543-0) (line 543, col 0, score 0.59)
- [Model Upgrade Calm-Down Guide — L33](model-upgrade-calm-down-guide.md#^ref-db74343f-33-0) (line 33, col 0, score 0.59)
- [Event Bus MVP — L530](event-bus-mvp.md#^ref-534fe91d-530-0) (line 530, col 0, score 0.58)
- [windows-tiling-with-autohotkey — L104](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-104-0) (line 104, col 0, score 0.58)
- [Prompt_Folder_Bootstrap — L18](prompt-folder-bootstrap.md#^ref-bd4f0976-18-0) (line 18, col 0, score 0.57)
- [Prompt_Folder_Bootstrap — L36](prompt-folder-bootstrap.md#^ref-bd4f0976-36-0) (line 36, col 0, score 0.57)
- [Prompt_Folder_Bootstrap — L55](prompt-folder-bootstrap.md#^ref-bd4f0976-55-0) (line 55, col 0, score 0.57)
- [Services — L9](chunks/services.md#^ref-75ea4a6a-9-0) (line 9, col 0, score 1)
- [ecs-scheduler-and-prefabs — L420](ecs-scheduler-and-prefabs.md#^ref-c62a1815-420-0) (line 420, col 0, score 1)
- [Event Bus MVP — L552](event-bus-mvp.md#^ref-534fe91d-552-0) (line 552, col 0, score 1)
- [heartbeat-fragment-demo — L123](heartbeat-fragment-demo.md#^ref-dd00677a-123-0) (line 123, col 0, score 1)
- [heartbeat-simulation-snippets — L115](heartbeat-simulation-snippets.md#^ref-23e221e9-115-0) (line 115, col 0, score 1)
- [Mongo Outbox Implementation — L551](mongo-outbox-implementation.md#^ref-9c1acd1e-551-0) (line 551, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L60](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-60-0) (line 60, col 0, score 1)
- [prom-lib-rate-limiters-and-replay-api — L380](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-380-0) (line 380, col 0, score 1)
- [Services — L6](chunks/services.md#^ref-75ea4a6a-6-0) (line 6, col 0, score 0.71)
- [Unique Info Dump Index — L40](unique-info-dump-index.md#^ref-30ec3ba6-40-0) (line 40, col 0, score 0.71)
- [State Snapshots API and Transactional Projector — L278](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-278-0) (line 278, col 0, score 0.69)
- [Language-Agnostic Mirror System — L526](language-agnostic-mirror-system.md#^ref-d2b3628c-526-0) (line 526, col 0, score 0.67)
- [TypeScript Patch for Tool Calling Support — L359](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-359-0) (line 359, col 0, score 0.66)
- [Migrate to Provider-Tenant Architecture — L208](migrate-to-provider-tenant-architecture.md#^ref-54382370-208-0) (line 208, col 0, score 0.64)
- [State Snapshots API and Transactional Projector — L280](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-280-0) (line 280, col 0, score 0.63)
- [TypeScript Patch for Tool Calling Support — L269](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-269-0) (line 269, col 0, score 0.63)
- [AI-Centric OS with MCP Layer — L1](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-1-0) (line 1, col 0, score 0.63)
- [Performance-Optimized-Polyglot-Bridge — L433](performance-optimized-polyglot-bridge.md#^ref-f5579967-433-0) (line 433, col 0, score 0.63)
- [State Snapshots API and Transactional Projector — L248](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-248-0) (line 248, col 0, score 0.63)
- [WebSocket Gateway Implementation — L612](websocket-gateway-implementation.md#^ref-e811123d-612-0) (line 612, col 0, score 0.62)
- [TypeScript Patch for Tool Calling Support — L436](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-436-0) (line 436, col 0, score 0.62)
- [Prompt_Folder_Bootstrap — L148](prompt-folder-bootstrap.md#^ref-bd4f0976-148-0) (line 148, col 0, score 0.62)
- [Agent Tasks: Persistence Migration to DualStore — L134](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-134-0) (line 134, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L164](chroma-toolkit-consolidation-plan.md#^ref-5020e892-164-0) (line 164, col 0, score 1)
- [Services — L18](chunks/services.md#^ref-75ea4a6a-18-0) (line 18, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L230](cross-language-runtime-polymorphism.md#^ref-c34c36a6-230-0) (line 230, col 0, score 1)
- [ecs-offload-workers — L483](ecs-offload-workers.md#^ref-6498b9d7-483-0) (line 483, col 0, score 1)
- [eidolon-field-math-foundations — L148](eidolon-field-math-foundations.md#^ref-008f2ac0-148-0) (line 148, col 0, score 1)
- [Event Bus MVP — L549](event-bus-mvp.md#^ref-534fe91d-549-0) (line 549, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L282](migrate-to-provider-tenant-architecture.md#^ref-54382370-282-0) (line 282, col 0, score 1)
- [Services — L12](chunks/services.md#^ref-75ea4a6a-12-0) (line 12, col 0, score 1)
- [Event Bus MVP — L551](event-bus-mvp.md#^ref-534fe91d-551-0) (line 551, col 0, score 1)
- [Mongo Outbox Implementation — L557](mongo-outbox-implementation.md#^ref-9c1acd1e-557-0) (line 557, col 0, score 1)
- [prom-lib-rate-limiters-and-replay-api — L386](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-386-0) (line 386, col 0, score 1)
- [Promethean Event Bus MVP v0.1 — L890](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-890-0) (line 890, col 0, score 1)
- [Promethean-native config design — L389](promethean-native-config-design.md#^ref-ab748541-389-0) (line 389, col 0, score 1)
- [State Snapshots API and Transactional Projector — L338](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-338-0) (line 338, col 0, score 1)
- [Unique Info Dump Index — L92](unique-info-dump-index.md#^ref-30ec3ba6-92-0) (line 92, col 0, score 1)
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
- [Agent Tasks: Persistence Migration to DualStore — L152](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-152-0) (line 152, col 0, score 1)
- [api-gateway-versioning — L294](api-gateway-versioning.md#^ref-0580dcd3-294-0) (line 294, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L191](chroma-toolkit-consolidation-plan.md#^ref-5020e892-191-0) (line 191, col 0, score 1)
- [Services — L11](chunks/services.md#^ref-75ea4a6a-11-0) (line 11, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L228](cross-language-runtime-polymorphism.md#^ref-c34c36a6-228-0) (line 228, col 0, score 1)
- [ecs-offload-workers — L465](ecs-offload-workers.md#^ref-6498b9d7-465-0) (line 465, col 0, score 1)
- [Event Bus MVP — L547](event-bus-mvp.md#^ref-534fe91d-547-0) (line 547, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L312](migrate-to-provider-tenant-architecture.md#^ref-54382370-312-0) (line 312, col 0, score 1)
- [Math Fundamentals — L34](chunks/math-fundamentals.md#^ref-c6e87433-34-0) (line 34, col 0, score 1)
- [Services — L22](chunks/services.md#^ref-75ea4a6a-22-0) (line 22, col 0, score 1)
- [Shared — L29](chunks/shared.md#^ref-623a55f7-29-0) (line 29, col 0, score 1)
- [Simulation Demo — L23](chunks/simulation-demo.md#^ref-557309a3-23-0) (line 23, col 0, score 1)
- [Tooling — L16](chunks/tooling.md#^ref-6cb4943e-16-0) (line 16, col 0, score 1)
- [Window Management — L25](chunks/window-management.md#^ref-9e8ae388-25-0) (line 25, col 0, score 1)
- [compiler-kit-foundations — L627](compiler-kit-foundations.md#^ref-01b21543-627-0) (line 627, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L171](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-171-0) (line 171, col 0, score 1)
- [Duck's Attractor States — L81](ducks-attractor-states.md#^ref-13951643-81-0) (line 81, col 0, score 1)
- [Diagrams — L13](chunks/diagrams.md#^ref-45cd25b5-13-0) (line 13, col 0, score 1)
- [DSL — L15](chunks/dsl.md#^ref-e87bc036-15-0) (line 15, col 0, score 1)
- [JavaScript — L18](chunks/javascript.md#^ref-c1618c66-18-0) (line 18, col 0, score 1)
- [Math Fundamentals — L14](chunks/math-fundamentals.md#^ref-c6e87433-14-0) (line 14, col 0, score 1)
- [Services — L14](chunks/services.md#^ref-75ea4a6a-14-0) (line 14, col 0, score 1)
- [Shared — L7](chunks/shared.md#^ref-623a55f7-7-0) (line 7, col 0, score 1)
- [Simulation Demo — L10](chunks/simulation-demo.md#^ref-557309a3-10-0) (line 10, col 0, score 1)
- [Tooling — L9](chunks/tooling.md#^ref-6cb4943e-9-0) (line 9, col 0, score 1)
- [Window Management — L15](chunks/window-management.md#^ref-9e8ae388-15-0) (line 15, col 0, score 1)
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
- [Board Walk – 2025-08-11 — L132](board-walk-2025-08-11.md#^ref-7aa1eb92-132-0) (line 132, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L166](chroma-toolkit-consolidation-plan.md#^ref-5020e892-166-0) (line 166, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L207](cross-language-runtime-polymorphism.md#^ref-c34c36a6-207-0) (line 207, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L193](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-193-0) (line 193, col 0, score 1)
- [Dynamic Context Model for Web Components — L381](dynamic-context-model-for-web-components.md#^ref-f7702bf8-381-0) (line 381, col 0, score 1)
- [Exception Layer Analysis — L154](exception-layer-analysis.md#^ref-21d5cc09-154-0) (line 154, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L265](migrate-to-provider-tenant-architecture.md#^ref-54382370-265-0) (line 265, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L130](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-130-0) (line 130, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L39](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-39-0) (line 39, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L38](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-38-0) (line 38, col 0, score 1)
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
- [AI-Centric OS with MCP Layer — L407](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-407-0) (line 407, col 0, score 1)
- [api-gateway-versioning — L284](api-gateway-versioning.md#^ref-0580dcd3-284-0) (line 284, col 0, score 1)
- [Services — L21](chunks/services.md#^ref-75ea4a6a-21-0) (line 21, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L43](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-43-0) (line 43, col 0, score 1)
- [Dynamic Context Model for Web Components — L407](dynamic-context-model-for-web-components.md#^ref-f7702bf8-407-0) (line 407, col 0, score 1)
- [eidolon-field-math-foundations — L167](eidolon-field-math-foundations.md#^ref-008f2ac0-167-0) (line 167, col 0, score 1)
- [i3-bluetooth-setup — L123](i3-bluetooth-setup.md#^ref-5e408692-123-0) (line 123, col 0, score 1)
- [i3-config-validation-methods — L78](i3-config-validation-methods.md#^ref-d28090ac-78-0) (line 78, col 0, score 1)
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
- [Lisp-Compiler-Integration — L547](lisp-compiler-integration.md#^ref-cfee6d36-547-0) (line 547, col 0, score 1)
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
- [Chroma Toolkit Consolidation Plan — L198](chroma-toolkit-consolidation-plan.md#^ref-5020e892-198-0) (line 198, col 0, score 1)
- [compiler-kit-foundations — L625](compiler-kit-foundations.md#^ref-01b21543-625-0) (line 625, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L202](cross-language-runtime-polymorphism.md#^ref-c34c36a6-202-0) (line 202, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L172](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-172-0) (line 172, col 0, score 1)
- [Duck's Attractor States — L83](ducks-attractor-states.md#^ref-13951643-83-0) (line 83, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L39](ducks-self-referential-perceptual-loop.md#^ref-71726f04-39-0) (line 39, col 0, score 1)
- [field-interaction-equations — L176](field-interaction-equations.md#^ref-b09141b7-176-0) (line 176, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L317](migrate-to-provider-tenant-architecture.md#^ref-54382370-317-0) (line 317, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L187](chroma-toolkit-consolidation-plan.md#^ref-5020e892-187-0) (line 187, col 0, score 1)
- [compiler-kit-foundations — L628](compiler-kit-foundations.md#^ref-01b21543-628-0) (line 628, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L200](cross-language-runtime-polymorphism.md#^ref-c34c36a6-200-0) (line 200, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L170](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-170-0) (line 170, col 0, score 1)
- [Dynamic Context Model for Web Components — L388](dynamic-context-model-for-web-components.md#^ref-f7702bf8-388-0) (line 388, col 0, score 1)
- [EidolonField — L248](eidolonfield.md#^ref-49d1e1e5-248-0) (line 248, col 0, score 1)
- [i3-bluetooth-setup — L109](i3-bluetooth-setup.md#^ref-5e408692-109-0) (line 109, col 0, score 1)
- [lisp-dsl-for-window-management — L226](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-226-0) (line 226, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L155](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-155-0) (line 155, col 0, score 1)
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
- [Agent Tasks: Persistence Migration to DualStore — L129](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-129-0) (line 129, col 0, score 1)
- [AI-Centric OS with MCP Layer — L406](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-406-0) (line 406, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L167](chroma-toolkit-consolidation-plan.md#^ref-5020e892-167-0) (line 167, col 0, score 1)
- [Diagrams — L25](chunks/diagrams.md#^ref-45cd25b5-25-0) (line 25, col 0, score 1)
- [Tooling — L24](chunks/tooling.md#^ref-6cb4943e-24-0) (line 24, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L214](cross-language-runtime-polymorphism.md#^ref-c34c36a6-214-0) (line 214, col 0, score 1)
- [Dynamic Context Model for Web Components — L390](dynamic-context-model-for-web-components.md#^ref-f7702bf8-390-0) (line 390, col 0, score 1)
- [Event Bus MVP — L553](event-bus-mvp.md#^ref-534fe91d-553-0) (line 553, col 0, score 1)
- [field-interaction-equations — L159](field-interaction-equations.md#^ref-b09141b7-159-0) (line 159, col 0, score 1)
- [i3-bluetooth-setup — L105](i3-bluetooth-setup.md#^ref-5e408692-105-0) (line 105, col 0, score 1)
- [i3-config-validation-methods — L56](i3-config-validation-methods.md#^ref-d28090ac-56-0) (line 56, col 0, score 1)
- [js-to-lisp-reverse-compiler — L412](js-to-lisp-reverse-compiler.md#^ref-58191024-412-0) (line 412, col 0, score 1)
- [Local-Offline-Model-Deployment-Strategy — L292](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-292-0) (line 292, col 0, score 1)
- [Pure TypeScript Search Microservice — L538](pure-typescript-search-microservice.md#^ref-d17d3a96-538-0) (line 538, col 0, score 1)
- [RAG UI Panel with Qdrant and PostgREST — L374](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-374-0) (line 374, col 0, score 1)
- [Recursive Prompt Construction Engine — L200](recursive-prompt-construction-engine.md#^ref-babdb9eb-200-0) (line 200, col 0, score 1)
- [Redirecting Standard Error — L31](redirecting-standard-error.md#^ref-b3555ede-31-0) (line 31, col 0, score 1)
- [ripple-propagation-demo — L120](ripple-propagation-demo.md#^ref-8430617b-120-0) (line 120, col 0, score 1)
- [Self-Agency in AI Interaction — L53](self-agency-in-ai-interaction.md#^ref-49a9a860-53-0) (line 53, col 0, score 1)
- [set-assignment-in-lisp-ast — L161](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-161-0) (line 161, col 0, score 1)
- [shared-package-layout-clarification — L185](shared-package-layout-clarification.md#^ref-36c8882a-185-0) (line 185, col 0, score 1)
- [Shared Package Structure — L181](shared-package-structure.md#^ref-66a72fc3-181-0) (line 181, col 0, score 1)
- [sibilant-macro-targets — L173](sibilant-macro-targets.md#^ref-c5c9a5c6-173-0) (line 173, col 0, score 1)
- [Sibilant Meta-Prompt DSL — L194](sibilant-meta-prompt-dsl.md#^ref-af5d2824-194-0) (line 194, col 0, score 1)
- [sibilant-macro-targets — L172](sibilant-macro-targets.md#^ref-c5c9a5c6-172-0) (line 172, col 0, score 1)
- [Sibilant Meta-Prompt DSL — L205](sibilant-meta-prompt-dsl.md#^ref-af5d2824-205-0) (line 205, col 0, score 1)
- [sibilant-meta-string-templating-runtime — L137](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-137-0) (line 137, col 0, score 1)
- [sibilant-metacompiler-overview — L90](sibilant-metacompiler-overview.md#^ref-61d4086b-90-0) (line 90, col 0, score 1)
- [State Snapshots API and Transactional Projector — L366](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-366-0) (line 366, col 0, score 1)
- [System Scheduler with Resource-Aware DAG — L394](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-394-0) (line 394, col 0, score 1)
- [template-based-compilation — L104](template-based-compilation.md#^ref-f8877e5e-104-0) (line 104, col 0, score 1)
- [ts-to-lisp-transpiler — L8](ts-to-lisp-transpiler.md#^ref-ba11486b-8-0) (line 8, col 0, score 1)
- [typed-struct-compiler — L384](typed-struct-compiler.md#^ref-78eeedf7-384-0) (line 384, col 0, score 1)
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
- [markdown-to-org-transpiler — L318](markdown-to-org-transpiler.md#^ref-ab54cdd8-318-0) (line 318, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L322](migrate-to-provider-tenant-architecture.md#^ref-54382370-322-0) (line 322, col 0, score 1)
- [Mongo Outbox Implementation — L579](mongo-outbox-implementation.md#^ref-9c1acd1e-579-0) (line 579, col 0, score 1)
- [observability-infrastructure-setup — L369](observability-infrastructure-setup.md#^ref-b4e64f8c-369-0) (line 369, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L183](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-183-0) (line 183, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L483](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-483-0) (line 483, col 0, score 1)
- [polymorphic-meta-programming-engine — L241](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-241-0) (line 241, col 0, score 1)
- [prom-lib-rate-limiters-and-replay-api — L415](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-415-0) (line 415, col 0, score 1)
- [Promethean Agent Config DSL — L352](promethean-agent-config-dsl.md#^ref-2c00ce45-352-0) (line 352, col 0, score 1)
- [eidolon-node-lifecycle — L63](eidolon-node-lifecycle.md#^ref-938eca9c-63-0) (line 63, col 0, score 1)
- [EidolonField — L269](eidolonfield.md#^ref-49d1e1e5-269-0) (line 269, col 0, score 1)
- [Event Bus MVP — L566](event-bus-mvp.md#^ref-534fe91d-566-0) (line 566, col 0, score 1)
- [Event Bus Projections Architecture — L185](event-bus-projections-architecture.md#^ref-cf6b9b17-185-0) (line 185, col 0, score 1)
- [Exception Layer Analysis — L165](exception-layer-analysis.md#^ref-21d5cc09-165-0) (line 165, col 0, score 1)
- [Factorio AI with External Agents — L160](factorio-ai-with-external-agents.md#^ref-a4d90289-160-0) (line 160, col 0, score 1)
- [field-dynamics-math-blocks — L165](field-dynamics-math-blocks.md#^ref-7cfc230d-165-0) (line 165, col 0, score 1)
- [field-interaction-equations — L184](field-interaction-equations.md#^ref-b09141b7-184-0) (line 184, col 0, score 1)
- [field-node-diagram-outline — L132](field-node-diagram-outline.md#^ref-1f32c94a-132-0) (line 132, col 0, score 1)
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
- [i3-bluetooth-setup — L128](i3-bluetooth-setup.md#^ref-5e408692-128-0) (line 128, col 0, score 1)
- [layer-1-uptime-diagrams — L193](layer-1-uptime-diagrams.md#^ref-4127189a-193-0) (line 193, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L181](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-181-0) (line 181, col 0, score 1)
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
