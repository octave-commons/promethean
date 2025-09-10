---
uuid: db442917-fcf4-4a7c-88f4-44e75ea3b85a
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
  - 78eeedf7-75bc-4692-a5a7-bb6857270621
  - 13951643-1741-46bb-89dc-1beebb122633
  - 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
  - 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
  - f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
  - 5e8b2388-022b-46cf-952c-36ae9b8f0037
  - 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
  - b09141b7-544f-4c8e-8f49-bf76cecaacbb
  - fc21f824-4244-4030-a48e-c4170160ea1d
  - 64a9f9f9-58ee-4996-bdaf-9373845c6b29
  - 71726f04-eb1c-42a5-a5fe-d8209de6e159
  - 7b7ca860-780c-44fa-8d3f-be8bd9496fba
  - bd4f0976-0d5b-47f6-a20a-0601d1842dc1
  - 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
  - b22d79c6-825b-4cd3-b0d3-1cef0532bb54
  - ffb9b2a9-744d-4a53-9565-130fceae0832
  - 0f6f8f38-98d0-438f-9601-58f478acc0b7
  - 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
  - 10d98225-12e0-4212-8e15-88b57cf7bee5
  - 1cfae310-35dc-49c2-98f1-b186da25d84b
  - a4d90289-798d-44a0-a8e8-a055ae12fb52
  - 1f32c94a-4da4-4266-8ac0-6c282cfb401f
  - e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
  - 22b989d5-f4aa-4880-8632-709c21830f83
  - a4a25141-6380-40b9-9cd7-b554b246b303
related_to_title:
  - typed-struct-compiler
  - Duck's Attractor States
  - eidolon-field-math-foundations
  - Debugging Broker Connections and Agent Behavior
  - Dynamic Context Model for Web Components
  - Eidolon Field Abstract Model
  - field-dynamics-math-blocks
  - field-interaction-equations
  - Fnord Tracer Protocol
  - Layer1SurvivabilityEnvelope
  - Duck's Self-Referential Perceptual Loop
  - TypeScript Patch for Tool Calling Support
  - Prompt_Folder_Bootstrap
  - eidolon-node-lifecycle
  - plan-update-confirmation
  - obsidian-ignore-node-modules-regex
  - windows-tiling-with-autohotkey
  - Unique Info Dump Index
  - Creative Moments
  - Functional Refactor of TypeScript Document Processing
  - Factorio AI with External Agents
  - field-node-diagram-outline
  - field-node-diagram-visualizations
  - field-node-diagram-set
  - Functional Embedding Pipeline Refactor
references:
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 1016
    col: 0
    score: 1
  - uuid: ed6f3fc9-5eb1-482c-8b3c-f0abc5aff2a2
    line: 175
    col: 0
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 1221
    col: 0
    score: 1
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 515
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 251
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 559
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 1033
    col: 0
    score: 1
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 463
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 226
    col: 0
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 705
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 719
    col: 0
    score: 1
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 601
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 1060
    col: 0
    score: 1
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 726
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 996
    col: 0
    score: 1
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 667
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 736
    col: 0
    score: 1
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 645
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 739
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 816
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
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 149
    col: 0
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 110
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
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 495
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 459
    col: 0
    score: 1
  - uuid: e2135d9f-c69d-47ee-9b17-0b05e98dc748
    line: 27
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1002
    col: 0
    score: 1
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 171
    col: 0
    score: 1
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 112
    col: 0
    score: 1
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 24
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 143
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 241
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 541
    col: 0
    score: 1
  - uuid: 71726f04-eb1c-42a5-a5fe-d8209de6e159
    line: 78
    col: 0
    score: 1
  - uuid: a4d90289-798d-44a0-a8e8-a055ae12fb52
    line: 176
    col: 0
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 154
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 175
    col: 0
    score: 1
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 123
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 274
    col: 0
    score: 1
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 327
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 412
    col: 0
    score: 1
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 159
    col: 0
    score: 1
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 95
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 237
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
} ^ref-62bec6f0-375-0
^ref-62bec6f0-70-0
```

---

# 2) Parallel scheduler hook (zero-copy mode) ^ref-62bec6f0-156-0

```ts
// shared/js/prom-lib/ds/ecs.scheduler.zc.ts
import { ParallelScheduler } from "./ecs.scheduler.parallel"; ^ref-62bec6f0-385-0
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

type Input = { snap: Snap; dt: number; time: number; extra?: any }; ^ref-62bec6f0-434-0

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
^ref-62bec6f0-468-0
import { markChanged } from "../../shared/js/prom-lib/worker/zero/layout";

self.onmessage = (ev: MessageEvent) => { ^ref-62bec6f0-472-0
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
^ref-62bec6f0-238-0 ^ref-62bec6f0-489-0
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
 ^ref-62bec6f0-1057-0 ^ref-62bec6f0-1058-0 ^ref-62bec6f0-2155-0 ^ref-62bec6f0-2157-0 ^ref-62bec6f0-2974-0 ^ref-62bec6f0-3164-0 ^ref-62bec6f0-4320-0 ^ref-62bec6f0-4933-0
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [typed-struct-compiler](typed-struct-compiler.md)
- [Duck's Attractor States](ducks-attractor-states.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [Debugging Broker Connections and Agent Behavior](debugging-broker-connections-and-agent-behavior.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [Eidolon Field Abstract Model](eidolon-field-abstract-model.md)
- [field-dynamics-math-blocks](field-dynamics-math-blocks.md)
- [field-interaction-equations](field-interaction-equations.md)
- [Fnord Tracer Protocol](fnord-tracer-protocol.md)
- [Layer1SurvivabilityEnvelope](layer1survivabilityenvelope.md)
- [Duck's Self-Referential Perceptual Loop](ducks-self-referential-perceptual-loop.md)
- [TypeScript Patch for Tool Calling Support](typescript-patch-for-tool-calling-support.md)
- [Prompt_Folder_Bootstrap](prompt-folder-bootstrap.md)
- [eidolon-node-lifecycle](eidolon-node-lifecycle.md)
- [plan-update-confirmation](plan-update-confirmation.md)
- [obsidian-ignore-node-modules-regex](obsidian-ignore-node-modules-regex.md)
- [windows-tiling-with-autohotkey](windows-tiling-with-autohotkey.md)
- [Unique Info Dump Index](unique-info-dump-index.md)
- [Creative Moments](creative-moments.md)
- [Functional Refactor of TypeScript Document Processing](functional-refactor-of-typescript-document-processing.md)
- [Factorio AI with External Agents](factorio-ai-with-external-agents.md)
- [field-node-diagram-outline](field-node-diagram-outline.md)
- [field-node-diagram-visualizations](field-node-diagram-visualizations.md)
- [field-node-diagram-set](field-node-diagram-set.md)
- [Functional Embedding Pipeline Refactor](functional-embedding-pipeline-refactor.md)
## Sources
- [typed-struct-compiler — L1016](typed-struct-compiler.md#^ref-78eeedf7-1016-0) (line 1016, col 0, score 1)
- [Unique Concepts — L175](unique-concepts.md#^ref-ed6f3fc9-175-0) (line 175, col 0, score 1)
- [Unique Info Dump Index — L1221](unique-info-dump-index.md#^ref-30ec3ba6-1221-0) (line 1221, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L515](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-515-0) (line 515, col 0, score 1)
- [Creative Moments — L251](creative-moments.md#^ref-10d98225-251-0) (line 251, col 0, score 1)
- [Duck's Attractor States — L559](ducks-attractor-states.md#^ref-13951643-559-0) (line 559, col 0, score 1)
- [eidolon-field-math-foundations — L1033](eidolon-field-math-foundations.md#^ref-008f2ac0-1033-0) (line 1033, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L463](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-463-0) (line 463, col 0, score 1)
- [Docops Feature Updates — L226](docops-feature-updates.md#^ref-2792d448-226-0) (line 226, col 0, score 1)
- [field-node-diagram-outline — L705](field-node-diagram-outline.md#^ref-1f32c94a-705-0) (line 705, col 0, score 1)
- [field-node-diagram-set — L719](field-node-diagram-set.md#^ref-22b989d5-719-0) (line 719, col 0, score 1)
- [field-node-diagram-visualizations — L601](field-node-diagram-visualizations.md#^ref-e9b27b06-601-0) (line 601, col 0, score 1)
- [Fnord Tracer Protocol — L1060](fnord-tracer-protocol.md#^ref-fc21f824-1060-0) (line 1060, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L726](functional-embedding-pipeline-refactor.md#^ref-a4a25141-726-0) (line 726, col 0, score 1)
- [graph-ds — L996](graph-ds.md#^ref-6620e2f2-996-0) (line 996, col 0, score 1)
- [heartbeat-fragment-demo — L667](heartbeat-fragment-demo.md#^ref-dd00677a-667-0) (line 667, col 0, score 1)
- [i3-bluetooth-setup — L736](i3-bluetooth-setup.md#^ref-5e408692-736-0) (line 736, col 0, score 1)
- [Ice Box Reorganization — L645](ice-box-reorganization.md#^ref-291c7d91-645-0) (line 645, col 0, score 1)
- [komorebi-group-window-hack — L739](komorebi-group-window-hack.md#^ref-dd89372d-739-0) (line 739, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L816](layer1survivabilityenvelope.md#^ref-64a9f9f9-816-0) (line 816, col 0, score 1)
- [Dynamic Context Model for Web Components — L412](dynamic-context-model-for-web-components.md#^ref-f7702bf8-412-0) (line 412, col 0, score 1)
- [Eidolon Field Abstract Model — L261](eidolon-field-abstract-model.md#^ref-5e8b2388-261-0) (line 261, col 0, score 1)
- [eidolon-field-math-foundations — L181](eidolon-field-math-foundations.md#^ref-008f2ac0-181-0) (line 181, col 0, score 1)
- [eidolon-node-lifecycle — L90](eidolon-node-lifecycle.md#^ref-938eca9c-90-0) (line 90, col 0, score 1)
- [Factorio AI with External Agents — L157](factorio-ai-with-external-agents.md#^ref-a4d90289-157-0) (line 157, col 0, score 1)
- [field-dynamics-math-blocks — L205](field-dynamics-math-blocks.md#^ref-7cfc230d-205-0) (line 205, col 0, score 1)
- [field-interaction-equations — L149](field-interaction-equations.md#^ref-b09141b7-149-0) (line 149, col 0, score 1)
- [field-node-diagram-outline — L110](field-node-diagram-outline.md#^ref-1f32c94a-110-0) (line 110, col 0, score 1)
- [field-node-diagram-set — L203](field-node-diagram-set.md#^ref-22b989d5-203-0) (line 203, col 0, score 1)
- [field-node-diagram-visualizations — L95](field-node-diagram-visualizations.md#^ref-e9b27b06-95-0) (line 95, col 0, score 1)
- [Creative Moments — L33](creative-moments.md#^ref-10d98225-33-0) (line 33, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L99](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-99-0) (line 99, col 0, score 1)
- [Docops Feature Updates — L46](docops-feature-updates.md#^ref-2792d448-46-0) (line 46, col 0, score 1)
- [DuckDuckGoSearchPipeline — L10](duckduckgosearchpipeline.md#^ref-e979c50f-10-0) (line 10, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L495](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-495-0) (line 495, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L459](performance-optimized-polyglot-bridge.md#^ref-f5579967-459-0) (line 459, col 0, score 1)
- [Pipeline Enhancements — L27](pipeline-enhancements.md#^ref-e2135d9f-27-0) (line 27, col 0, score 1)
- [plan-update-confirmation — L1002](plan-update-confirmation.md#^ref-b22d79c6-1002-0) (line 1002, col 0, score 1)
- [polyglot-repl-interface-layer — L171](polyglot-repl-interface-layer.md#^ref-9c79206d-171-0) (line 171, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L112](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-112-0) (line 112, col 0, score 1)
- [Promethean Chat Activity Report — L24](promethean-chat-activity-report.md#^ref-18344cf9-24-0) (line 24, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L143](protocol-0-the-contradiction-engine.md#^ref-9a93a756-143-0) (line 143, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L241](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-241-0) (line 241, col 0, score 1)
- [TypeScript Patch for Tool Calling Support — L541](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-541-0) (line 541, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L78](ducks-self-referential-perceptual-loop.md#^ref-71726f04-78-0) (line 78, col 0, score 1)
- [Factorio AI with External Agents — L176](factorio-ai-with-external-agents.md#^ref-a4d90289-176-0) (line 176, col 0, score 1)
- [field-node-diagram-outline — L154](field-node-diagram-outline.md#^ref-1f32c94a-154-0) (line 154, col 0, score 1)
- [field-node-diagram-set — L175](field-node-diagram-set.md#^ref-22b989d5-175-0) (line 175, col 0, score 1)
- [field-node-diagram-visualizations — L123](field-node-diagram-visualizations.md#^ref-e9b27b06-123-0) (line 123, col 0, score 1)
- [Fnord Tracer Protocol — L274](fnord-tracer-protocol.md#^ref-fc21f824-274-0) (line 274, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L327](functional-embedding-pipeline-refactor.md#^ref-a4a25141-327-0) (line 327, col 0, score 1)
- [graph-ds — L412](graph-ds.md#^ref-6620e2f2-412-0) (line 412, col 0, score 1)
- [heartbeat-fragment-demo — L159](heartbeat-fragment-demo.md#^ref-dd00677a-159-0) (line 159, col 0, score 1)
- [Ice Box Reorganization — L95](ice-box-reorganization.md#^ref-291c7d91-95-0) (line 95, col 0, score 1)
- [komorebi-group-window-hack — L237](komorebi-group-window-hack.md#^ref-dd89372d-237-0) (line 237, col 0, score 1)
- [Creative Moments — L8](creative-moments.md#^ref-10d98225-8-0) (line 8, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L38](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-38-0) (line 38, col 0, score 1)
- [Docops Feature Updates — L56](docops-feature-updates-3.md#^ref-cdbd21ee-56-0) (line 56, col 0, score 1)
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
- [Docops Feature Updates — L35](docops-feature-updates.md#^ref-2792d448-35-0) (line 35, col 0, score 1)
- [Duck's Attractor States — L94](ducks-attractor-states.md#^ref-13951643-94-0) (line 94, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L53](ducks-self-referential-perceptual-loop.md#^ref-71726f04-53-0) (line 53, col 0, score 1)
- [Dynamic Context Model for Web Components — L424](dynamic-context-model-for-web-components.md#^ref-f7702bf8-424-0) (line 424, col 0, score 1)
- [Eidolon Field Abstract Model — L209](eidolon-field-abstract-model.md#^ref-5e8b2388-209-0) (line 209, col 0, score 1)
- [eidolon-field-math-foundations — L142](eidolon-field-math-foundations.md#^ref-008f2ac0-142-0) (line 142, col 0, score 1)
- [eidolon-node-lifecycle — L39](eidolon-node-lifecycle.md#^ref-938eca9c-39-0) (line 39, col 0, score 1)
- [Docops Feature Updates — L85](docops-feature-updates-3.md#^ref-cdbd21ee-85-0) (line 85, col 0, score 1)
- [Duck's Attractor States — L93](ducks-attractor-states.md#^ref-13951643-93-0) (line 93, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L64](ducks-self-referential-perceptual-loop.md#^ref-71726f04-64-0) (line 64, col 0, score 1)
- [Factorio AI with External Agents — L153](factorio-ai-with-external-agents.md#^ref-a4d90289-153-0) (line 153, col 0, score 1)
- [field-dynamics-math-blocks — L141](field-dynamics-math-blocks.md#^ref-7cfc230d-141-0) (line 141, col 0, score 1)
- [Creative Moments — L28](creative-moments.md#^ref-10d98225-28-0) (line 28, col 0, score 1)
- [Docops Feature Updates — L65](docops-feature-updates-3.md#^ref-cdbd21ee-65-0) (line 65, col 0, score 1)
- [Docops Feature Updates — L86](docops-feature-updates.md#^ref-2792d448-86-0) (line 86, col 0, score 1)
- [Duck's Attractor States — L123](ducks-attractor-states.md#^ref-13951643-123-0) (line 123, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L34](ducks-self-referential-perceptual-loop.md#^ref-71726f04-34-0) (line 34, col 0, score 1)
- [Dynamic Context Model for Web Components — L442](dynamic-context-model-for-web-components.md#^ref-f7702bf8-442-0) (line 442, col 0, score 1)
- [Eidolon Field Abstract Model — L218](eidolon-field-abstract-model.md#^ref-5e8b2388-218-0) (line 218, col 0, score 1)
- [eidolon-field-math-foundations — L176](eidolon-field-math-foundations.md#^ref-008f2ac0-176-0) (line 176, col 0, score 1)
- [eidolon-node-lifecycle — L70](eidolon-node-lifecycle.md#^ref-938eca9c-70-0) (line 70, col 0, score 1)
- [Creative Moments — L38](creative-moments.md#^ref-10d98225-38-0) (line 38, col 0, score 1)
- [Docops Feature Updates — L51](docops-feature-updates-3.md#^ref-cdbd21ee-51-0) (line 51, col 0, score 1)
- [Docops Feature Updates — L79](docops-feature-updates.md#^ref-2792d448-79-0) (line 79, col 0, score 1)
- [DuckDuckGoSearchPipeline — L77](duckduckgosearchpipeline.md#^ref-e979c50f-77-0) (line 77, col 0, score 1)
- [Duck's Attractor States — L115](ducks-attractor-states.md#^ref-13951643-115-0) (line 115, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L61](ducks-self-referential-perceptual-loop.md#^ref-71726f04-61-0) (line 61, col 0, score 1)
- [Eidolon Field Abstract Model — L212](eidolon-field-abstract-model.md#^ref-5e8b2388-212-0) (line 212, col 0, score 1)
- [eidolon-field-math-foundations — L150](eidolon-field-math-foundations.md#^ref-008f2ac0-150-0) (line 150, col 0, score 1)
- [Creative Moments — L94](creative-moments.md#^ref-10d98225-94-0) (line 94, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L63](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-63-0) (line 63, col 0, score 1)
- [Docops Feature Updates — L66](docops-feature-updates-3.md#^ref-cdbd21ee-66-0) (line 66, col 0, score 1)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
