---
uuid: 4c83910b-b306-4867-baf2-106528953972
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
  - 54382370-1931-4a19-a634-46735708a9ea
  - bd4f0976-0d5b-47f6-a20a-0601d1842dc1
  - 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
  - 4330e8f0-5f46-4235-918b-39b6b93fa561
  - 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
  - c03020e1-e3e7-48bf-aa7e-aa740c601b63
  - 5020e892-8f18-443a-b707-6d0f3efcfe22
  - a4a25141-6380-40b9-9cd7-b554b246b303
  - f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
  - f5579967-762d-4cfd-851e-4f71b4cb77a1
  - 5e8b2388-022b-46cf-952c-36ae9b8f0037
  - d144aa62-348c-4e5d-ae8f-38084c67ceca
  - 9c79206d-4cb9-4f00-87e0-782dcea37bc7
  - 0f6f8f38-98d0-438f-9601-58f478acc0b7
  - 13951643-1741-46bb-89dc-1beebb122633
  - 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
  - 7b7ca860-780c-44fa-8d3f-be8bd9496fba
  - 78eeedf7-75bc-4692-a5a7-bb6857270621
  - 62bec6f0-4e13-4f38-aca4-72c84ba02367
  - 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
  - b09141b7-544f-4c8e-8f49-bf76cecaacbb
  - 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
  - 71726f04-eb1c-42a5-a5fe-d8209de6e159
  - b22d79c6-825b-4cd3-b0d3-1cef0532bb54
  - 03a5578f-d689-45db-95e9-11300e5eee6f
related_to_title:
  - Migrate to Provider-Tenant Architecture
  - Prompt_Folder_Bootstrap
  - eidolon-field-math-foundations
  - Stateful Partitions and Rebalancing
  - Unique Info Dump Index
  - Per-Domain Policy System for JS Crawler
  - Chroma Toolkit Consolidation Plan
  - Functional Embedding Pipeline Refactor
  - Dynamic Context Model for Web Components
  - Performance-Optimized-Polyglot-Bridge
  - Eidolon Field Abstract Model
  - Model Selection for Lightweight Conversational Tasks
  - polyglot-repl-interface-layer
  - windows-tiling-with-autohotkey
  - Duck's Attractor States
  - Debugging Broker Connections and Agent Behavior
  - TypeScript Patch for Tool Calling Support
  - typed-struct-compiler
  - zero-copy-snapshots-and-workers
  - eidolon-node-lifecycle
  - field-interaction-equations
  - field-dynamics-math-blocks
  - Duck's Self-Referential Perceptual Loop
  - plan-update-confirmation
  - Promethean Dev Workflow Update
references:
  - uuid: d771154e-a7ef-44ca-b69c-a1626cf94fbf
    line: 95
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 28
    col: 0
    score: 1
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 65
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 86
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 123
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 34
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 442
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 218
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 176
    col: 0
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 70
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 75
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 104
    col: 0
    score: 1
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 46
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 64
    col: 0
    score: 1
  - uuid: e979c50f-69bb-48b0-8417-e1ee1b31c0c0
    line: 40
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 137
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 82
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 454
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 8
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 38
    col: 0
    score: 1
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 56
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 38
    col: 0
    score: 1
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 51
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 79
    col: 0
    score: 1
  - uuid: e979c50f-69bb-48b0-8417-e1ee1b31c0c0
    line: 77
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 115
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 61
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 212
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 150
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 35
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 94
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 53
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 424
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 209
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 142
    col: 0
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 39
    col: 0
    score: 1
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 44
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 61
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 99
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 80
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 405
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 216
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 189
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 172
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 412
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 261
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 181
    col: 0
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 90
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 157
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 205
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 203
    col: 0
    score: 1
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 95
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 33
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 99
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 46
    col: 0
    score: 1
  - uuid: e979c50f-69bb-48b0-8417-e1ee1b31c0c0
    line: 10
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 371
    col: 0
    score: 1
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 141
    col: 0
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 222
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 107
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 50
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 89
    col: 0
    score: 1
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 32
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 49
    col: 0
    score: 1
  - uuid: e979c50f-69bb-48b0-8417-e1ee1b31c0c0
    line: 95
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 133
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 59
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 252
    col: 0
    score: 1
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 85
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 93
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 64
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 153
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 141
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 94
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 63
    col: 0
    score: 1
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 66
    col: 0
    score: 1
  - uuid: e979c50f-69bb-48b0-8417-e1ee1b31c0c0
    line: 93
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 73
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 403
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 53
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 148
    col: 0
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 36
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 166
    col: 0
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 148
    col: 0
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 153
    col: 0
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 118
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 168
    col: 0
    score: 1
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 103
    col: 0
    score: 1
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 380
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 194
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 52
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 71
    col: 0
    score: 1
  - uuid: e979c50f-69bb-48b0-8417-e1ee1b31c0c0
    line: 99
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 47
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 105
    col: 0
    score: 1
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 97
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 128
    col: 0
    score: 1
  - uuid: e979c50f-69bb-48b0-8417-e1ee1b31c0c0
    line: 31
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 90
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 33
    col: 0
    score: 1
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
 ^ref-d8059b6a-556-0 ^ref-d8059b6a-566-0 ^ref-d8059b6a-570-0 ^ref-d8059b6a-574-0 ^ref-d8059b6a-578-0 ^ref-d8059b6a-589-0 ^ref-d8059b6a-595-0 ^ref-d8059b6a-603-0 ^ref-d8059b6a-620-0 ^ref-d8059b6a-625-0 ^ref-d8059b6a-631-0 ^ref-d8059b6a-634-0 ^ref-d8059b6a-645-0 ^ref-d8059b6a-650-0 ^ref-d8059b6a-662-0 ^ref-d8059b6a-710-0 ^ref-d8059b6a-741-0 ^ref-d8059b6a-759-0 ^ref-d8059b6a-833-0 ^ref-d8059b6a-1285-0 ^ref-d8059b6a-2565-0
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [Migrate to Provider-Tenant Architecture](migrate-to-provider-tenant-architecture.md)
- [Prompt_Folder_Bootstrap](prompt-folder-bootstrap.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [Stateful Partitions and Rebalancing](stateful-partitions-and-rebalancing.md)
- [Unique Info Dump Index](unique-info-dump-index.md)
- [Per-Domain Policy System for JS Crawler](per-domain-policy-system-for-js-crawler.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [Functional Embedding Pipeline Refactor](functional-embedding-pipeline-refactor.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [Performance-Optimized-Polyglot-Bridge](performance-optimized-polyglot-bridge.md)
- [Eidolon Field Abstract Model](eidolon-field-abstract-model.md)
- [Model Selection for Lightweight Conversational Tasks](model-selection-for-lightweight-conversational-tasks.md)
- [polyglot-repl-interface-layer](polyglot-repl-interface-layer.md)
- [windows-tiling-with-autohotkey](windows-tiling-with-autohotkey.md)
- [Duck's Attractor States](ducks-attractor-states.md)
- [Debugging Broker Connections and Agent Behavior](debugging-broker-connections-and-agent-behavior.md)
- [TypeScript Patch for Tool Calling Support](typescript-patch-for-tool-calling-support.md)
- [typed-struct-compiler](typed-struct-compiler.md)
- [zero-copy-snapshots-and-workers](zero-copy-snapshots-and-workers.md)
- [eidolon-node-lifecycle](eidolon-node-lifecycle.md)
- [field-interaction-equations](field-interaction-equations.md)
- [field-dynamics-math-blocks](field-dynamics-math-blocks.md)
- [Duck's Self-Referential Perceptual Loop](ducks-self-referential-perceptual-loop.md)
- [plan-update-confirmation](plan-update-confirmation.md)
- [Promethean Dev Workflow Update](promethean-dev-workflow-update.md)
## Sources
- [Vectorial Exception Descent — L95](vectorial-exception-descent.md#^ref-d771154e-95-0) (line 95, col 0, score 1)
- [Creative Moments — L28](creative-moments.md#^ref-10d98225-28-0) (line 28, col 0, score 1)
- [Docops Feature Updates — L65](docops-feature-updates-3.md#^ref-cdbd21ee-65-0) (line 65, col 0, score 1)
- [Docops Feature Updates — L86](docops-feature-updates.md#^ref-2792d448-86-0) (line 86, col 0, score 1)
- [Duck's Attractor States — L123](ducks-attractor-states.md#^ref-13951643-123-0) (line 123, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L34](ducks-self-referential-perceptual-loop.md#^ref-71726f04-34-0) (line 34, col 0, score 1)
- [Dynamic Context Model for Web Components — L442](dynamic-context-model-for-web-components.md#^ref-f7702bf8-442-0) (line 442, col 0, score 1)
- [Eidolon Field Abstract Model — L218](eidolon-field-abstract-model.md#^ref-5e8b2388-218-0) (line 218, col 0, score 1)
- [eidolon-field-math-foundations — L176](eidolon-field-math-foundations.md#^ref-008f2ac0-176-0) (line 176, col 0, score 1)
- [eidolon-node-lifecycle — L70](eidolon-node-lifecycle.md#^ref-938eca9c-70-0) (line 70, col 0, score 1)
- [Creative Moments — L75](creative-moments.md#^ref-10d98225-75-0) (line 75, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L104](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-104-0) (line 104, col 0, score 1)
- [Docops Feature Updates — L46](docops-feature-updates-3.md#^ref-cdbd21ee-46-0) (line 46, col 0, score 1)
- [Docops Feature Updates — L64](docops-feature-updates.md#^ref-2792d448-64-0) (line 64, col 0, score 1)
- [DuckDuckGoSearchPipeline — L40](duckduckgosearchpipeline.md#^ref-e979c50f-40-0) (line 40, col 0, score 1)
- [Duck's Attractor States — L137](ducks-attractor-states.md#^ref-13951643-137-0) (line 137, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L82](ducks-self-referential-perceptual-loop.md#^ref-71726f04-82-0) (line 82, col 0, score 1)
- [Dynamic Context Model for Web Components — L454](dynamic-context-model-for-web-components.md#^ref-f7702bf8-454-0) (line 454, col 0, score 1)
- [Creative Moments — L8](creative-moments.md#^ref-10d98225-8-0) (line 8, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L38](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-38-0) (line 38, col 0, score 1)
- [Docops Feature Updates — L56](docops-feature-updates-3.md#^ref-cdbd21ee-56-0) (line 56, col 0, score 1)
- [Creative Moments — L38](creative-moments.md#^ref-10d98225-38-0) (line 38, col 0, score 1)
- [Docops Feature Updates — L51](docops-feature-updates-3.md#^ref-cdbd21ee-51-0) (line 51, col 0, score 1)
- [Docops Feature Updates — L79](docops-feature-updates.md#^ref-2792d448-79-0) (line 79, col 0, score 1)
- [DuckDuckGoSearchPipeline — L77](duckduckgosearchpipeline.md#^ref-e979c50f-77-0) (line 77, col 0, score 1)
- [Duck's Attractor States — L115](ducks-attractor-states.md#^ref-13951643-115-0) (line 115, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L61](ducks-self-referential-perceptual-loop.md#^ref-71726f04-61-0) (line 61, col 0, score 1)
- [Eidolon Field Abstract Model — L212](eidolon-field-abstract-model.md#^ref-5e8b2388-212-0) (line 212, col 0, score 1)
- [eidolon-field-math-foundations — L150](eidolon-field-math-foundations.md#^ref-008f2ac0-150-0) (line 150, col 0, score 1)
- [Docops Feature Updates — L35](docops-feature-updates.md#^ref-2792d448-35-0) (line 35, col 0, score 1)
- [Duck's Attractor States — L94](ducks-attractor-states.md#^ref-13951643-94-0) (line 94, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L53](ducks-self-referential-perceptual-loop.md#^ref-71726f04-53-0) (line 53, col 0, score 1)
- [Dynamic Context Model for Web Components — L424](dynamic-context-model-for-web-components.md#^ref-f7702bf8-424-0) (line 424, col 0, score 1)
- [Eidolon Field Abstract Model — L209](eidolon-field-abstract-model.md#^ref-5e8b2388-209-0) (line 209, col 0, score 1)
- [eidolon-field-math-foundations — L142](eidolon-field-math-foundations.md#^ref-008f2ac0-142-0) (line 142, col 0, score 1)
- [eidolon-node-lifecycle — L39](eidolon-node-lifecycle.md#^ref-938eca9c-39-0) (line 39, col 0, score 1)
- [Docops Feature Updates — L44](docops-feature-updates-3.md#^ref-cdbd21ee-44-0) (line 44, col 0, score 1)
- [Docops Feature Updates — L61](docops-feature-updates.md#^ref-2792d448-61-0) (line 61, col 0, score 1)
- [Duck's Attractor States — L99](ducks-attractor-states.md#^ref-13951643-99-0) (line 99, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L80](ducks-self-referential-perceptual-loop.md#^ref-71726f04-80-0) (line 80, col 0, score 1)
- [Dynamic Context Model for Web Components — L405](dynamic-context-model-for-web-components.md#^ref-f7702bf8-405-0) (line 405, col 0, score 1)
- [Eidolon Field Abstract Model — L216](eidolon-field-abstract-model.md#^ref-5e8b2388-216-0) (line 216, col 0, score 1)
- [Factorio AI with External Agents — L189](factorio-ai-with-external-agents.md#^ref-a4d90289-189-0) (line 189, col 0, score 1)
- [field-interaction-equations — L172](field-interaction-equations.md#^ref-b09141b7-172-0) (line 172, col 0, score 1)
- [Dynamic Context Model for Web Components — L412](dynamic-context-model-for-web-components.md#^ref-f7702bf8-412-0) (line 412, col 0, score 1)
- [Eidolon Field Abstract Model — L261](eidolon-field-abstract-model.md#^ref-5e8b2388-261-0) (line 261, col 0, score 1)
- [eidolon-field-math-foundations — L181](eidolon-field-math-foundations.md#^ref-008f2ac0-181-0) (line 181, col 0, score 1)
- [eidolon-node-lifecycle — L90](eidolon-node-lifecycle.md#^ref-938eca9c-90-0) (line 90, col 0, score 1)
- [Factorio AI with External Agents — L157](factorio-ai-with-external-agents.md#^ref-a4d90289-157-0) (line 157, col 0, score 1)
- [field-dynamics-math-blocks — L205](field-dynamics-math-blocks.md#^ref-7cfc230d-205-0) (line 205, col 0, score 1)
- [field-node-diagram-set — L203](field-node-diagram-set.md#^ref-22b989d5-203-0) (line 203, col 0, score 1)
- [field-node-diagram-visualizations — L95](field-node-diagram-visualizations.md#^ref-e9b27b06-95-0) (line 95, col 0, score 1)
- [Creative Moments — L33](creative-moments.md#^ref-10d98225-33-0) (line 33, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L99](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-99-0) (line 99, col 0, score 1)
- [Docops Feature Updates — L46](docops-feature-updates.md#^ref-2792d448-46-0) (line 46, col 0, score 1)
- [DuckDuckGoSearchPipeline — L10](duckduckgosearchpipeline.md#^ref-e979c50f-10-0) (line 10, col 0, score 1)
- [graph-ds — L371](graph-ds.md#^ref-6620e2f2-371-0) (line 371, col 0, score 1)
- [heartbeat-fragment-demo — L141](heartbeat-fragment-demo.md#^ref-dd00677a-141-0) (line 141, col 0, score 1)
- [homeostasis-decay-formulas — L222](homeostasis-decay-formulas.md#^ref-37b5d236-222-0) (line 222, col 0, score 1)
- [i3-bluetooth-setup — L107](i3-bluetooth-setup.md#^ref-5e408692-107-0) (line 107, col 0, score 1)
- [Creative Moments — L50](creative-moments.md#^ref-10d98225-50-0) (line 50, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L89](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-89-0) (line 89, col 0, score 1)
- [Docops Feature Updates — L32](docops-feature-updates-3.md#^ref-cdbd21ee-32-0) (line 32, col 0, score 1)
- [Docops Feature Updates — L49](docops-feature-updates.md#^ref-2792d448-49-0) (line 49, col 0, score 1)
- [DuckDuckGoSearchPipeline — L95](duckduckgosearchpipeline.md#^ref-e979c50f-95-0) (line 95, col 0, score 1)
- [Duck's Attractor States — L133](ducks-attractor-states.md#^ref-13951643-133-0) (line 133, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L59](ducks-self-referential-perceptual-loop.md#^ref-71726f04-59-0) (line 59, col 0, score 1)
- [Eidolon Field Abstract Model — L252](eidolon-field-abstract-model.md#^ref-5e8b2388-252-0) (line 252, col 0, score 1)
- [Docops Feature Updates — L85](docops-feature-updates-3.md#^ref-cdbd21ee-85-0) (line 85, col 0, score 1)
- [Duck's Attractor States — L93](ducks-attractor-states.md#^ref-13951643-93-0) (line 93, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L64](ducks-self-referential-perceptual-loop.md#^ref-71726f04-64-0) (line 64, col 0, score 1)
- [Factorio AI with External Agents — L153](factorio-ai-with-external-agents.md#^ref-a4d90289-153-0) (line 153, col 0, score 1)
- [field-dynamics-math-blocks — L141](field-dynamics-math-blocks.md#^ref-7cfc230d-141-0) (line 141, col 0, score 1)
- [Creative Moments — L94](creative-moments.md#^ref-10d98225-94-0) (line 94, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L63](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-63-0) (line 63, col 0, score 1)
- [Docops Feature Updates — L66](docops-feature-updates-3.md#^ref-cdbd21ee-66-0) (line 66, col 0, score 1)
- [DuckDuckGoSearchPipeline — L93](duckduckgosearchpipeline.md#^ref-e979c50f-93-0) (line 93, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L73](ducks-self-referential-perceptual-loop.md#^ref-71726f04-73-0) (line 73, col 0, score 1)
- [Dynamic Context Model for Web Components — L403](dynamic-context-model-for-web-components.md#^ref-f7702bf8-403-0) (line 403, col 0, score 1)
- [Creative Moments — L53](creative-moments.md#^ref-10d98225-53-0) (line 53, col 0, score 1)
- [eidolon-field-math-foundations — L148](eidolon-field-math-foundations.md#^ref-008f2ac0-148-0) (line 148, col 0, score 1)
- [eidolon-node-lifecycle — L36](eidolon-node-lifecycle.md#^ref-938eca9c-36-0) (line 36, col 0, score 1)
- [Factorio AI with External Agents — L166](factorio-ai-with-external-agents.md#^ref-a4d90289-166-0) (line 166, col 0, score 1)
- [field-dynamics-math-blocks — L148](field-dynamics-math-blocks.md#^ref-7cfc230d-148-0) (line 148, col 0, score 1)
- [field-interaction-equations — L153](field-interaction-equations.md#^ref-b09141b7-153-0) (line 153, col 0, score 1)
- [field-node-diagram-outline — L118](field-node-diagram-outline.md#^ref-1f32c94a-118-0) (line 118, col 0, score 1)
- [field-node-diagram-set — L168](field-node-diagram-set.md#^ref-22b989d5-168-0) (line 168, col 0, score 1)
- [field-node-diagram-visualizations — L103](field-node-diagram-visualizations.md#^ref-e9b27b06-103-0) (line 103, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L380](functional-embedding-pipeline-refactor.md#^ref-a4a25141-380-0) (line 380, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L194](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-194-0) (line 194, col 0, score 1)
- [Creative Moments — L52](creative-moments.md#^ref-10d98225-52-0) (line 52, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L71](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-71-0) (line 71, col 0, score 1)
- [DuckDuckGoSearchPipeline — L99](duckduckgosearchpipeline.md#^ref-e979c50f-99-0) (line 99, col 0, score 1)
- [Creative Moments — L47](creative-moments.md#^ref-10d98225-47-0) (line 47, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L105](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-105-0) (line 105, col 0, score 1)
- [Docops Feature Updates — L97](docops-feature-updates-3.md#^ref-cdbd21ee-97-0) (line 97, col 0, score 1)
- [Docops Feature Updates — L128](docops-feature-updates.md#^ref-2792d448-128-0) (line 128, col 0, score 1)
- [DuckDuckGoSearchPipeline — L31](duckduckgosearchpipeline.md#^ref-e979c50f-31-0) (line 31, col 0, score 1)
- [Duck's Attractor States — L90](ducks-attractor-states.md#^ref-13951643-90-0) (line 90, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L33](ducks-self-referential-perceptual-loop.md#^ref-71726f04-33-0) (line 33, col 0, score 1)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
