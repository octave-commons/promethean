---
uuid: 0f203aa7-c96d-4323-9b9e-bbc438966e8c
created_at: schema-evolution-workflow.md
filename: schema-evolution-workflow
title: schema-evolution-workflow
description: >-
  Describes a schema evolution workflow using dual-write and upcasters for
  handling schema changes in event streams, with DLQ for replay and MongoDB
  changefeeds. Includes a CI linter for topic/schema hygiene.
tags:
  - schema-evolution
  - dual-write
  - upcasters
  - dlq
  - mongodb
  - ci-linter
  - event-streams
related_to_uuid:
  - 9a1076d6-1aac-497e-bac3-66c9ea09da55
  - 740bbd1c-c039-405c-8a32-4baeddfb5637
  - bdca8ded-0e64-417b-a258-4528829c4704
  - 2c9f86e6-9b63-44d7-902d-84b10b0bdbe3
  - 7a66bc1e-9276-41ce-ac22-fc08926acb2d
  - 2611e17e-c7dd-4de6-9c66-d98fcfa9ffb5
  - abe9ec8d-5a0f-42c5-b2ab-a2080c86d70c
  - 6b91d91d-6b5c-4516-a0c8-d66d9b9fcc9b
  - 2d0982f7-7518-432a-80b3-e89834cf9ab3
  - fd753d3a-84cb-4bdd-ae93-8c5b09617e3b
  - 65c145c7-fe3e-4989-9aae-5db39fa0effc
  - aa437a1f-eb7e-4096-a6cc-98d2eeeef8c5
  - b25be760-256e-4a8a-b34d-867281847ccb
  - 4316c3f9-551f-4872-b5c5-98ae73508535
  - ee4b3631-a745-485b-aff1-2da806cfadfb
  - e2955491-020a-4009-b7ed-a5a348c63cfd
  - 86ef1f2b-1b3f-4ca7-a88e-b8b52e70ac10
  - bb4f4ed0-91f3-488a-9d64-3a33bde77e4e
  - aaf779eb-0287-499f-b6d3-6fb4d9e595bd
  - 71a4afd6-e483-4a6e-a284-ff726e733399
  - 260f25bf-c996-4da2-a529-3a292406296f
  - 004a0f06-3808-4421-b9e1-41b5b41ebcb8
  - 40bc2ba7-9c5c-4f72-8f88-17bef3c6163f
  - 672da53b-d8ac-48cd-9cb3-e3fa9915dd6a
  - 3657117f-241d-4ab9-a717-4a3f584071fc
related_to_title:
  - Stateful Partitions and Rebalancing
  - heartbeat-fragment-demo
  - Pure TypeScript Search Microservice
  - Field Node Diagrams
  - pm2-orchestration-patterns
  - Universal Lisp Interface
  - RAG UI Panel with Qdrant and PostgREST
  - AGENTS.md
  - i3 Config Validation Methods
  - polyglot-repl-interface-layer
  - event-bus-mvp
  - Prometheus Observability Stack
  - ripple-propagation-demo
  - WebSocket Gateway Implementation
  - Promethean Documentation Pipeline Overview
  - chroma-toolkit-consolidation-plan
  - promethean-pipelines
  - chroma-embedding-refactor
  - sibilant-meta-string-templating-runtime
  - Monorepo Constitution Guard
  - Polymorphic Meta-Programming Engine
  - ecs-offload-workers
  - Lean AGENT Setup
  - Factorio AI with External Agents
  - language-agnostic-mirror-system
references:
  - uuid: 9a1076d6-1aac-497e-bac3-66c9ea09da55
    line: 276
    col: 0
    score: 0.91
  - uuid: 740bbd1c-c039-405c-8a32-4baeddfb5637
    line: 88
    col: 0
    score: 0.89
  - uuid: 740bbd1c-c039-405c-8a32-4baeddfb5637
    line: 100
    col: 0
    score: 0.88
  - uuid: bdca8ded-0e64-417b-a258-4528829c4704
    line: 95
    col: 0
    score: 0.88
  - uuid: 740bbd1c-c039-405c-8a32-4baeddfb5637
    line: 67
    col: 0
    score: 0.87
  - uuid: 2d0982f7-7518-432a-80b3-e89834cf9ab3
    line: 14
    col: 0
    score: 0.86
  - uuid: fd753d3a-84cb-4bdd-ae93-8c5b09617e3b
    line: 71
    col: 0
    score: 0.86
  - uuid: abe9ec8d-5a0f-42c5-b2ab-a2080c86d70c
    line: 80
    col: 0
    score: 0.86
  - uuid: 740bbd1c-c039-405c-8a32-4baeddfb5637
    line: 63
    col: 0
    score: 0.86
  - uuid: bdca8ded-0e64-417b-a258-4528829c4704
    line: 73
    col: 0
    score: 0.86
  - uuid: 2c9f86e6-9b63-44d7-902d-84b10b0bdbe3
    line: 76
    col: 0
    score: 0.86
  - uuid: 6b91d91d-6b5c-4516-a0c8-d66d9b9fcc9b
    line: 182
    col: 0
    score: 0.86
  - uuid: 2611e17e-c7dd-4de6-9c66-d98fcfa9ffb5
    line: 61
    col: 0
    score: 0.86
  - uuid: 7a66bc1e-9276-41ce-ac22-fc08926acb2d
    line: 74
    col: 0
    score: 0.86
  - uuid: 2611e17e-c7dd-4de6-9c66-d98fcfa9ffb5
    line: 56
    col: 0
    score: 0.86
  - uuid: b25be760-256e-4a8a-b34d-867281847ccb
    line: 16
    col: 0
    score: 0.85
  - uuid: 2c9f86e6-9b63-44d7-902d-84b10b0bdbe3
    line: 27
    col: 0
    score: 0.85
  - uuid: 2611e17e-c7dd-4de6-9c66-d98fcfa9ffb5
    line: 172
    col: 0
    score: 0.85
  - uuid: 6b91d91d-6b5c-4516-a0c8-d66d9b9fcc9b
    line: 205
    col: 0
    score: 0.85
  - uuid: fd753d3a-84cb-4bdd-ae93-8c5b09617e3b
    line: 146
    col: 0
    score: 0.85
  - uuid: 65c145c7-fe3e-4989-9aae-5db39fa0effc
    line: 527
    col: 0
    score: 0.85
  - uuid: 2611e17e-c7dd-4de6-9c66-d98fcfa9ffb5
    line: 175
    col: 0
    score: 0.85
  - uuid: aa437a1f-eb7e-4096-a6cc-98d2eeeef8c5
    line: 492
    col: 0
    score: 0.85
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
^ref-d8059b6a-9-0 ^ref-d8059b6a-15-0

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
^ref-d8059b6a-73-0
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
``` ^ref-d8059b6a-164-0
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
``` ^ref-d8059b6a-207-0
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
``` ^ref-d8059b6a-236-0
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
const PUB_RE = /publish\(\s*"'`["'`]/g;
const HDR_RE = /headers\s*:\s*\{([^}]+)\}/g;
const HDR_KEY_RE = /"'`["'`]\s*:/g;

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
# 6) Sibilant sprinkles (pseudo) ^ref-d8059b6a-463-0 ^ref-d8059b6a-478-0 ^ref-d8059b6a-521-0
 ^ref-d8059b6a-464-0 ^ref-d8059b6a-522-0
```lisp ^ref-d8059b6a-465-0
; shared/sibilant/prom/evolve.sib (pseudo) ^ref-d8059b6a-466-0
(defn upcast->latest [topic e] ^ref-d8059b6a-467-0 ^ref-d8059b6a-482-0
  (.toLatest up topic e schema-reg)) ^ref-d8059b6a-468-0
 ^ref-d8059b6a-469-0 ^ref-d8059b6a-502-0
(defmacro dual-write! [bus topic payload]
  `(.publish ~bus ~topic ~payload {:headers {"x-source" "sib"}}))
^ref-d8059b6a-522-0
```
 ^ref-d8059b6a-473-0 ^ref-d8059b6a-532-0
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
* and a **dev harness** that spins in-memory bus + fake services for integration tests.
