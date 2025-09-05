---
uuid: f1af85cb-be45-42cf-beee-d0795ded07bf
created_at: zero-copy-snapshots-and-workers.md
filename: Zero-Copy Snapshots and Workers
title: Zero-Copy Snapshots and Workers
description: >-
  A method for achieving true zero-copy data sharing between main threads and
  workers using SharedArrayBuffer or transferable ArrayBuffers. This approach
  enables efficient ECS (Entity-Component-System) data processing by allowing
  workers to operate on columnar typed arrays, with only changed rows committed
  back to the main thread.
tags:
  - zero-copy
  - sharedarraybuffer
  - workers
  - ecs
  - columnar
  - snapshot
related_to_uuid:
  - f24dbd59-29e1-4eeb-bb3e-d2c31116b207
  - 004a0f06-3808-4421-b9e1-41b5b41ebcb8
  - 65c145c7-fe3e-4989-9aae-5db39fa0effc
  - 8a9432f5-cb79-40fa-bab1-d3b9e9c0bac8
  - e4317155-7fa6-44e8-8aee-b72384581790
  - 4c63f2be-b5cd-479c-ad0d-ca26424162f7
  - 95410f6e-dabb-4560-80a8-1ed4fd9c3d3b
  - c0e6ea38-a9a0-4379-aa9c-b634a6591a59
  - 0c501d52-ba38-42aa-ad25-2d78425dfaff
  - 21913df0-a1c6-4ba0-a9e9-8ffc35a71d74
  - fd753d3a-84cb-4bdd-ae93-8c5b09617e3b
  - cdf2c6e4-0dbd-4f19-b645-ac619a6f267d
  - 4c87f571-9942-4288-aec4-0bc52e9cdbe7
  - 31a2df46-9dbc-4066-b3e3-d3e860099fd0
  - 260f25bf-c996-4da2-a529-3a292406296f
  - 2611e17e-c7dd-4de6-9c66-d98fcfa9ffb5
  - 740bbd1c-c039-405c-8a32-4baeddfb5637
  - 0f203aa7-c96d-4323-9b9e-bbc438966e8c
  - b25be760-256e-4a8a-b34d-867281847ccb
  - cdb74242-b61d-4b7e-9288-5859e040e512
  - c46718fe-73dd-4236-8f1c-f6565da58cc4
  - a28a39dd-8c17-463c-9050-2ffe9b56e8bc
  - 150f8bb4-4322-4bb9-8a5f-9c2e3b233e05
  - abe9ec8d-5a0f-42c5-b2ab-a2080c86d70c
  - c2ba3d27-5b24-4345-9cf2-5cf296f8b03d
related_to_title:
  - Mongo Outbox Implementation
  - ecs-offload-workers
  - event-bus-mvp
  - Local-Only LLM Workflow
  - TypeScript Patch for Tool Calling Support
  - lisp-compiler-integration
  - model-selection-for-lightweight-conversational-tasks
  - board-walk-2025-08-11
  - dynamic-context-model-for-web-components
  - Graph Data Structure
  - polyglot-repl-interface-layer
  - Unique Info Dump Index
  - set-assignment-in-lisp-ast
  - field-node-diagram-set
  - Polymorphic Meta-Programming Engine
  - Universal Lisp Interface
  - heartbeat-fragment-demo
  - schema-evolution-workflow
  - ripple-propagation-demo
  - Event Bus Projections Architecture
  - shared-package-structure
  - AI-Centric OS with MCP Layer
  - i3-layout-saver
  - RAG UI Panel with Qdrant and PostgREST
  - observability-infrastructure-setup
references:
  - uuid: f24dbd59-29e1-4eeb-bb3e-d2c31116b207
    line: 1
    col: 0
    score: 1
  - uuid: f24dbd59-29e1-4eeb-bb3e-d2c31116b207
    line: 3
    col: 0
    score: 1
  - uuid: f24dbd59-29e1-4eeb-bb3e-d2c31116b207
    line: 11
    col: 0
    score: 1
  - uuid: f24dbd59-29e1-4eeb-bb3e-d2c31116b207
    line: 36
    col: 0
    score: 1
  - uuid: f24dbd59-29e1-4eeb-bb3e-d2c31116b207
    line: 38
    col: 0
    score: 1
  - uuid: f24dbd59-29e1-4eeb-bb3e-d2c31116b207
    line: 76
    col: 0
    score: 1
  - uuid: 004a0f06-3808-4421-b9e1-41b5b41ebcb8
    line: 9
    col: 0
    score: 0.9
  - uuid: f24dbd59-29e1-4eeb-bb3e-d2c31116b207
    line: 188
    col: 0
    score: 0.88
  - uuid: f24dbd59-29e1-4eeb-bb3e-d2c31116b207
    line: 226
    col: 0
    score: 0.88
  - uuid: 65c145c7-fe3e-4989-9aae-5db39fa0effc
    line: 399
    col: 0
    score: 0.86
  - uuid: 8a9432f5-cb79-40fa-bab1-d3b9e9c0bac8
    line: 37
    col: 0
    score: 0.86
  - uuid: 8a9432f5-cb79-40fa-bab1-d3b9e9c0bac8
    line: 19
    col: 0
    score: 0.86
  - uuid: e4317155-7fa6-44e8-8aee-b72384581790
    line: 32
    col: 0
    score: 0.86
  - uuid: 4c63f2be-b5cd-479c-ad0d-ca26424162f7
    line: 356
    col: 0
    score: 0.85
  - uuid: f24dbd59-29e1-4eeb-bb3e-d2c31116b207
    line: 492
    col: 0
    score: 0.85
---
Note: Consolidated here → ../notes/js/zero-copy-snapshots-and-workers.md ^ref-62bec6f0-1-0

Oh you want **actual zero-copy** between main + workers. Let’s do it right: ^ref-62bec6f0-3-0

* Use **SharedArrayBuffer** (SAB) when possible (Node: yes; Browser: only if `crossOriginIsolated`). ^ref-62bec6f0-5-0
* Fallback to **transferable ArrayBuffers** (detached in parent, still zero-copy across the postMessage boundary). ^ref-62bec6f0-6-0
* Workers operate on **columnar typed arrays** (SoA), toggle a **changed bitset**, and the main thread commits only changed rows back to your ECS. ^ref-62bec6f0-7-0

Below is a compact, drop-in layer. You don’t have to rewrite your ECS—just define numeric layouts for the components you want to offload. ^ref-62bec6f0-9-0

---

# 1) Column layouts + snapshot builder

```ts
// shared/js/prom-lib/worker/zero/layout.ts
export type Scalar = "f32" | "f64" | "i32" | "u32" | "i16" | "u16" | "i8" | "u8";
export type FieldSpec = { [fieldName: string]: Scalar };
export type CompLayout = { cid: number; fields: FieldSpec };

const T = {
  f32: Float32Array,
  f64: Float64Array,
  i32: Int32Array,
  u32: Uint32Array,
  i16: Int16Array,
  u16: Uint16Array,
  i8:  Int8Array,
  u8:  Uint8Array,
} as const;

export type Columns = Record<string, Float32Array|Float64Array|Int8Array|Uint8Array|Int16Array|Uint16Array|Int32Array|Uint32Array>;
export type CompColumns = { fields: Columns; changed: Uint8Array };

export type Snap = {
  shared: boolean;
  rows: number;
  eids: Int32Array;                          // row -> entity id
  comps: Record<number, CompColumns>;        // cid -> columns + changed bitset
};

export function canUseSAB(): boolean {
  // Node: yes; Browser: only if crossOriginIsolated and SAB exists
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (typeof process !== "undefined" && process.versions?.node) return typeof SharedArrayBuffer !== "undefined";
  return typeof SharedArrayBuffer !== "undefined" && (globalThis as any).crossOriginIsolated === true;
}

export function allocColumns(rows: number, layout: CompLayout, shared: boolean): CompColumns {
  const fields: Columns = {};
  for (const [k, ty] of Object.entries(layout.fields)) {
    const Ctor = T[ty as Scalar];
    const buf = shared ? new SharedArrayBuffer(Ctor.BYTES_PER_ELEMENT * rows) : new ArrayBuffer(Ctor.BYTES_PER_ELEMENT * rows);
    fields[k] = new Ctor(buf);
  }
  const chBuf = shared ? new SharedArrayBuffer(Math.ceil(rows / 8)) : new ArrayBuffer(Math.ceil(rows / 8));
  const changed = new Uint8Array(chBuf);
  return { fields, changed };
}

export function markChanged(bitset: Uint8Array, i: number) {
  bitset[i >> 3] |= (1 << (i & 7));
}
export function isChanged(bitset: Uint8Array, i: number) {
  return (bitset[i >> 3] & (1 << (i & 7))) !== 0;
}
```
^ref-62bec6f0-15-0
 ^ref-62bec6f0-70-0
```ts
// shared/js/prom-lib/worker/zero/snapshot.ts
import type { World, ComponentType } from "../../ds/ecs";
import { CompLayout, Snap, allocColumns, canUseSAB, markChanged, isChanged } from "./layout";

export type BuildSpec = {
  // components to include; every comp needs a numeric field layout
  layouts: CompLayout[];
  // mapping cid -> ComponentType (to read/write world)
  types: Record<number, ComponentType<any>>;
};

export function buildSnapshot(world: World, spec: BuildSpec, query: ReturnType<World["makeQuery"]>): { snap: Snap; transfer: Transferable[] } {
  const shared = canUseSAB();
  // First pass: count rows
  let rows = 0;
  for (const _ of world.iter(query)) { rows++; }

  const eids = (() => {
    const buf = shared ? new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * rows) : new ArrayBuffer(Int32Array.BYTES_PER_ELEMENT * rows);
    return new Int32Array(buf);
  })();

  const comps: Snap["comps"] = {};
  for (const L of spec.layouts) comps[L.cid] = allocColumns(rows, L, shared);

  // Fill columns
  let i = 0;
  for (const [e] of world.iter(query)) {
    eids[i] = e;
    for (const L of spec.layouts) {
      const ctype = spec.types[L.cid];
      const v = world.get(e, ctype); // user value (object or struct)
      if (v == null) continue;
      for (const [field, _ty] of Object.entries(L.fields)) {
        (comps[L.cid].fields[field] as any)[i] = (v as any)[field] ?? 0;
      }
    }
    i++;
  }

  const snap: Snap = { shared, rows, eids, comps };

  // Transferables (only when not shared; SAB can't be transferred, only referenced)
  const transfer: Transferable[] = [];
  if (!shared) {
    transfer.push(snap.eids.buffer);
    for (const L of spec.layouts) {
      for (const arr of Object.values(snap.comps[L.cid].fields)) transfer.push((arr as any).buffer);
      transfer.push(snap.comps[L.cid].changed.buffer);
    }
  }
  return { snap, transfer };
}

/** Apply worker mutations (bitsets) back into ECS world */
export function commitSnapshot(world: World, spec: BuildSpec, snap: Snap) {
  const rows = snap.rows;
  for (const L of spec.layouts) {
    const ctype = spec.types[L.cid];
    const cols = snap.comps[L.cid];
    const changed = cols.changed;
    // fast path: if nothing changed in this comp, skip
    let any = false;
    for (let b=0; b<changed.length; b++) if (changed[b]) { any = true; break; }
    if (!any) continue;

    // write only changed rows
    for (let i=0;i<rows;i++) {
      if (!isChanged(changed, i)) continue;
      const eid = snap.eids[i];
      if (!world.isAlive(eid)) continue;
      const cur = world.get(eid, ctype) ?? {};
      for (const [field, arr] of Object.entries(cols.fields)) {
        (cur as any)[field] = (arr as any)[i];
      }
      world.set(eid, ctype as any, cur);
    }
  }
}
^ref-62bec6f0-70-0
```

---

# 2) Parallel scheduler hook (zero-copy mode) ^ref-62bec6f0-156-0

```ts
// shared/js/prom-lib/ds/ecs.scheduler.zc.ts
import { ParallelScheduler } from "./ecs.scheduler.parallel";
import type { ComponentType } from "./ecs";
import { buildSnapshot, commitSnapshot, type BuildSpec } from "../worker/zero/snapshot";

export type ZeroCopySpec = {
  // Comp layouts & ComponentType map
  build: (world: any) => BuildSpec;
};

declare module "./ecs.scheduler.parallel" {
  interface OffloadSpec { zeroCopy?: ZeroCopySpec }
}

export class ZCScheduler extends ParallelScheduler {
  protected override async runSystem(sys: any, ctx: any) {
    if (!sys.offload?.zeroCopy) return super"runSystem";

    if (!this["ready"]) await this.initPool();

    const buildSpec = sys.offload.zeroCopy.build(ctx.world);
    const q = sys.query ? ctx.world.makeQuery(sys.query(ctx.world)) : ctx.world.makeQuery({}); // optional
    const { snap, transfer } = buildSnapshot(ctx.world, buildSpec, q);

    const jobId = (typeof window !== "undefined")
      ? (sys.offload.browserJobName ?? sys.name)
      : (sys.offload.nodeModule ?? sys.name);

    // Send snapshot: SAB → no transfer list; AB → transfer buffers
    const out = await this["pool"].run(jobId, { snap, dt: ctx.dt, time: ctx.time, extra: sys.offload.extra?.(ctx) }, );

    // Worker writes in-place; we just commit bits back
    commitSnapshot(ctx.world, buildSpec, snap);
  }
^ref-62bec6f0-156-0
}
```

> If SAB is available, there’s **no copy and no detach**. With AB transfer, it’s still zero-copy across the boundary (moved, not cloned).

---

# 3) Worker jobs (Node + Browser) that mutate in place
 ^ref-62bec6f0-202-0
### 3a) Physics (Node ESM): `services/js/workers/physics.zc.job.ts`

```ts
import type { Snap } from "../../shared/js/prom-lib/worker/zero/layout";
import { markChanged } from "../../shared/js/prom-lib/worker/zero/layout";

type Input = { snap: Snap; dt: number; time: number; extra?: any };

export async function handle({ snap, dt, extra }: Input) {
  const POS = extra.POS as number;
  const VEL = extra.VEL as number;

  const pos = snap.comps[POS].fields;
  const vel = snap.comps[VEL].fields;

  const px = pos["x"] as Float32Array;
  const py = pos["y"] as Float32Array;
  const vx = vel["x"] as Float32Array;
  const vy = vel["y"] as Float32Array;

  const changed = snap.comps[POS].changed;
  const n = snap.rows;
  for (let i=0;i<n;i++) {
    // skip rows missing data (NaN check optional)
    if (vx && vy) {
      px[i] += vx[i] * dt;
      py[i] += vy[i] * dt;
      markChanged(changed, i);
    }
  }
  // no return needed; mutated in-place
  return 1;
^ref-62bec6f0-202-0
}
export default handle;
```
^ref-62bec6f0-238-0

### 3b) Browser worker: `services/web/workers/physics.zc.worker.ts`

```ts
import { markChanged } from "../../shared/js/prom-lib/worker/zero/layout";

self.onmessage = (ev: MessageEvent) => {
  const { snap, dt, extra } = ev.data as any;

  const POS = extra.POS, VEL = extra.VEL;
  const pos = snap.comps[POS].fields;
  const vel = snap.comps[VEL].fields;

  const px = pos["x"] as Float32Array;
  const py = pos["y"] as Float32Array;
  const vx = vel["x"] as Float32Array;
  const vy = vel["y"] as Float32Array;
  const changed = snap.comps[POS].changed;

  for (let i=0;i<snap.rows;i++) {
    px[i] += vx[i]*dt;
    py[i] += vy[i]*dt;
    markChanged(changed, i);
^ref-62bec6f0-238-0
  }
  (self as any).postMessage(1);
};
``` ^ref-62bec6f0-267-0

---

# 4) Wiring example

```ts
// Node backend
import { World } from "../../shared/js/prom-lib/ds/ecs";
import { ZCScheduler } from "../../shared/js/prom-lib/ds/ecs.scheduler.zc";

type Position = {x:number;y:number};
type Velocity = {x:number;y:number};

const world = new World();
const CPos = world.defineComponent<Position>({ name:"Pos", defaults:()=>({x:0,y:0}) });
const CVel = world.defineComponent<Velocity>({ name:"Vel", defaults:()=>({x:0,y:0}) });

const sched = new ZCScheduler(world);
await sched.initPool();

sched.register({
  name: "physics",
  stage: "update",
  query: w => ({ all:[CPos, CVel] }),
  offload: {
    nodeModule: new URL("file://" + require("path").resolve("services/js/workers/physics.zc.job.js")).href,
    reads: [CPos, CVel], writes: [CPos],
    zeroCopy: {
      build: (w) => ({
        types: { [CPos.id]: CPos, [CVel.id]: CVel },
        layouts: [
          { cid: CPos.id, fields: { x: "f32", y: "f32" } },
          { cid: CVel.id, fields: { x: "f32", y: "f32" } },
        ]
      })
    },
    extra: () => ({ POS: CPos.id, VEL: CVel.id })
  },
^ref-62bec6f0-267-0
  run() {} // local fallback
});

setInterval(() => sched.runFrame(0.016, Date.now()), 16);
^ref-62bec6f0-306-0
```
^ref-62bec6f0-306-0

```ts
// Browser / static site
import { World } from "../../shared/js/prom-lib/ds/ecs";
import { ZCScheduler } from "../../shared/js/prom-lib/ds/ecs.scheduler.zc";

const world = new World();
const CPos = world.defineComponent<{x:number;y:number}>({ name:"Pos", defaults:()=>({x:0,y:0}) });
const CVel = world.defineComponent<{x:number;y:number}>({ name:"Vel", defaults:()=>({x:0,y:0}) });

const sched = new ZCScheduler(world);
await sched.initPool({
  browserWorkers: {
    physicsZC: () => new Worker(new URL("../../services/web/workers/physics.zc.worker.ts", import.meta.url), { type: "module" })
  }
});

sched.register({
  name: "physics",
  stage: "update",
  query: w => ({ all:[CPos, CVel] }),
  offload: {
    browserJobName: "physicsZC",
    reads: [CPos, CVel], writes: [CPos],
    zeroCopy: {
      build: () => ({
        types: { [CPos.id]: CPos, [CVel.id]: CVel },
        layouts: [
          { cid: CPos.id, fields: { x: "f32", y: "f32" } },
          { cid: CVel.id, fields: { x: "f32", y: "f32" } },
        ]
      })
    },
    extra: () => ({ POS: CPos.id, VEL: CVel.id })
  },
^ref-62bec6f0-306-0
  run() {}
});

function frame(ts:number){ sched.runFrame(0.016, ts); requestAnimationFrame(frame); }
requestAnimationFrame(frame); ^ref-62bec6f0-351-0
^ref-62bec6f0-351-0 ^ref-62bec6f0-355-0
```
^ref-62bec6f0-351-0
 ^ref-62bec6f0-355-0
---
 ^ref-62bec6f0-355-0
# 5) Notes / gotchas

* **SAB in browsers** requires COOP/COEP headers ⇒ the app must be **cross-origin isolated**. If you can’t set headers on a static host, you still get **transferables** (ArrayBuffer moves, not clones). ^ref-62bec6f0-363-0
* With SAB, both threads see the same memory. We still **commit** back into the ECS (which uses object components) by visiting only **changed bits**. ^ref-62bec6f0-363-0
* For heavy numeric sims, consider making those components **natively SoA** in the ECS (typed arrays as the storage) and skip commit entirely—workers would be writing the source of truth.
 ^ref-62bec6f0-363-0
Want me to add a **Shared mailbox** (Atomics + sequence numbers) so workers can run multiple ticks without round-trips, or a **typed struct compiler** (zod → binary layout) so you don’t handwrite layouts?
type
{
        (cur as any)[field] = (arr as any)[i];
      }
      world.set(eid, ctype as any, cur);
    }
  }
}
^ref-62bec6f0-70-0
```

---

# 2) Parallel scheduler hook (zero-copy mode) ^ref-62bec6f0-156-0

```ts
// shared/js/prom-lib/ds/ecs.scheduler.zc.ts
import { ParallelScheduler } from "./ecs.scheduler.parallel";
import type { ComponentType } from "./ecs";
import { buildSnapshot, commitSnapshot, type BuildSpec } from "../worker/zero/snapshot";

export type ZeroCopySpec = {
  // Comp layouts & ComponentType map
  build: (world: any) => BuildSpec;
};

declare module "./ecs.scheduler.parallel" {
  interface OffloadSpec { zeroCopy?: ZeroCopySpec }
}

export class ZCScheduler extends ParallelScheduler {
  protected override async runSystem(sys: any, ctx: any) {
    if (!sys.offload?.zeroCopy) return super"runSystem";

    if (!this["ready"]) await this.initPool();

    const buildSpec = sys.offload.zeroCopy.build(ctx.world);
    const q = sys.query ? ctx.world.makeQuery(sys.query(ctx.world)) : ctx.world.makeQuery({}); // optional
    const { snap, transfer } = buildSnapshot(ctx.world, buildSpec, q);

    const jobId = (typeof window !== "undefined")
      ? (sys.offload.browserJobName ?? sys.name)
      : (sys.offload.nodeModule ?? sys.name);

    // Send snapshot: SAB → no transfer list; AB → transfer buffers
    const out = await this["pool"].run(jobId, { snap, dt: ctx.dt, time: ctx.time, extra: sys.offload.extra?.(ctx) }, );

    // Worker writes in-place; we just commit bits back
    commitSnapshot(ctx.world, buildSpec, snap);
  }
^ref-62bec6f0-156-0
}
```

> If SAB is available, there’s **no copy and no detach**. With AB transfer, it’s still zero-copy across the boundary (moved, not cloned).

---

# 3) Worker jobs (Node + Browser) that mutate in place
 ^ref-62bec6f0-202-0
### 3a) Physics (Node ESM): `services/js/workers/physics.zc.job.ts`

```ts
import type { Snap } from "../../shared/js/prom-lib/worker/zero/layout";
import { markChanged } from "../../shared/js/prom-lib/worker/zero/layout";

type Input = { snap: Snap; dt: number; time: number; extra?: any };

export async function handle({ snap, dt, extra }: Input) {
  const POS = extra.POS as number;
  const VEL = extra.VEL as number;

  const pos = snap.comps[POS].fields;
  const vel = snap.comps[VEL].fields;

  const px = pos["x"] as Float32Array;
  const py = pos["y"] as Float32Array;
  const vx = vel["x"] as Float32Array;
  const vy = vel["y"] as Float32Array;

  const changed = snap.comps[POS].changed;
  const n = snap.rows;
  for (let i=0;i<n;i++) {
    // skip rows missing data (NaN check optional)
    if (vx && vy) {
      px[i] += vx[i] * dt;
      py[i] += vy[i] * dt;
      markChanged(changed, i);
    }
  }
  // no return needed; mutated in-place
  return 1;
^ref-62bec6f0-202-0
}
export default handle;
```
^ref-62bec6f0-238-0

### 3b) Browser worker: `services/web/workers/physics.zc.worker.ts`

```ts
import { markChanged } from "../../shared/js/prom-lib/worker/zero/layout";

self.onmessage = (ev: MessageEvent) => {
  const { snap, dt, extra } = ev.data as any;

  const POS = extra.POS, VEL = extra.VEL;
  const pos = snap.comps[POS].fields;
  const vel = snap.comps[VEL].fields;

  const px = pos["x"] as Float32Array;
  const py = pos["y"] as Float32Array;
  const vx = vel["x"] as Float32Array;
  const vy = vel["y"] as Float32Array;
  const changed = snap.comps[POS].changed;

  for (let i=0;i<snap.rows;i++) {
    px[i] += vx[i]*dt;
    py[i] += vy[i]*dt;
    markChanged(changed, i);
^ref-62bec6f0-238-0
  }
  (self as any).postMessage(1);
};
``` ^ref-62bec6f0-267-0

---

# 4) Wiring example

```ts
// Node backend
import { World } from "../../shared/js/prom-lib/ds/ecs";
import { ZCScheduler } from "../../shared/js/prom-lib/ds/ecs.scheduler.zc";

type Position = {x:number;y:number};
type Velocity = {x:number;y:number};

const world = new World();
const CPos = world.defineComponent<Position>({ name:"Pos", defaults:()=>({x:0,y:0}) });
const CVel = world.defineComponent<Velocity>({ name:"Vel", defaults:()=>({x:0,y:0}) });

const sched = new ZCScheduler(world);
await sched.initPool();

sched.register({
  name: "physics",
  stage: "update",
  query: w => ({ all:[CPos, CVel] }),
  offload: {
    nodeModule: new URL("file://" + require("path").resolve("services/js/workers/physics.zc.job.js")).href,
    reads: [CPos, CVel], writes: [CPos],
    zeroCopy: {
      build: (w) => ({
        types: { [CPos.id]: CPos, [CVel.id]: CVel },
        layouts: [
          { cid: CPos.id, fields: { x: "f32", y: "f32" } },
          { cid: CVel.id, fields: { x: "f32", y: "f32" } },
        ]
      })
    },
    extra: () => ({ POS: CPos.id, VEL: CVel.id })
  },
^ref-62bec6f0-267-0
  run() {} // local fallback
});

setInterval(() => sched.runFrame(0.016, Date.now()), 16);
^ref-62bec6f0-306-0
```
^ref-62bec6f0-306-0

```ts
// Browser / static site
import { World } from "../../shared/js/prom-lib/ds/ecs";
import { ZCScheduler } from "../../shared/js/prom-lib/ds/ecs.scheduler.zc";

const world = new World();
const CPos = world.defineComponent<{x:number;y:number}>({ name:"Pos", defaults:()=>({x:0,y:0}) });
const CVel = world.defineComponent<{x:number;y:number}>({ name:"Vel", defaults:()=>({x:0,y:0}) });

const sched = new ZCScheduler(world);
await sched.initPool({
  browserWorkers: {
    physicsZC: () => new Worker(new URL("../../services/web/workers/physics.zc.worker.ts", import.meta.url), { type: "module" })
  }
});

sched.register({
  name: "physics",
  stage: "update",
  query: w => ({ all:[CPos, CVel] }),
  offload: {
    browserJobName: "physicsZC",
    reads: [CPos, CVel], writes: [CPos],
    zeroCopy: {
      build: () => ({
        types: { [CPos.id]: CPos, [CVel.id]: CVel },
        layouts: [
          { cid: CPos.id, fields: { x: "f32", y: "f32" } },
          { cid: CVel.id, fields: { x: "f32", y: "f32" } },
        ]
      })
    },
    extra: () => ({ POS: CPos.id, VEL: CVel.id })
  },
^ref-62bec6f0-306-0
  run() {}
});

function frame(ts:number){ sched.runFrame(0.016, ts); requestAnimationFrame(frame); }
requestAnimationFrame(frame); ^ref-62bec6f0-351-0
^ref-62bec6f0-351-0 ^ref-62bec6f0-355-0
```
^ref-62bec6f0-351-0
 ^ref-62bec6f0-355-0
---
 ^ref-62bec6f0-355-0
# 5) Notes / gotchas

* **SAB in browsers** requires COOP/COEP headers ⇒ the app must be **cross-origin isolated**. If you can’t set headers on a static host, you still get **transferables** (ArrayBuffer moves, not clones). ^ref-62bec6f0-363-0
* With SAB, both threads see the same memory. We still **commit** back into the ECS (which uses object components) by visiting only **changed bits**. ^ref-62bec6f0-363-0
* For heavy numeric sims, consider making those components **natively SoA** in the ECS (typed arrays as the storage) and skip commit entirely—workers would be writing the source of truth.
 ^ref-62bec6f0-363-0
Want me to add a **Shared mailbox** (Atomics + sequence numbers) so workers can run multiple ticks without round-trips, or a **typed struct compiler** (zod → binary layout) so you don’t handwrite layouts?
type
