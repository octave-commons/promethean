---
```
uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
```
```
created_at: 2025.08.08.22.08.39.md
```
filename: zero-copy-snapshots-and-workers
```
description: >-
```
  Enables zero-copy data sharing between main thread and workers using
  SharedArrayBuffer or transferable ArrayBuffers for efficient ECS component
  management.
tags:
  - zero-copy
  - sharedarraybuffer
  - workers
  - ecs
  - snapshot
  - columnar
  - typedarrays
```
related_to_title:
```
  - ecs-offload-workers
  - JavaScript
  - Unique Info Dump Index
  - Lisp-Compiler-Integration
  - Promethean-native config design
  - Dynamic Context Model for Web Components
  - Chroma Toolkit Consolidation Plan
  - archetype-ecs
  - api-gateway-versioning
  - 'Agent Tasks: Persistence Migration to DualStore'
  - aionian-circuit-math
  - Diagrams
  - DSL
  - Board Walk – 2025-08-11
  - Cross-Target Macro System in Sibilant
  - ecs-scheduler-and-prefabs
  - compiler-kit-foundations
  - js-to-lisp-reverse-compiler
  - eidolon-field-math-foundations
  - Interop and Source Maps
  - Language-Agnostic Mirror System
  - typed-struct-compiler
  - Lispy Macros with syntax-rules
  - System Scheduler with Resource-Aware DAG
  - State Snapshots API and Transactional Projector
  - Promethean Infrastructure Setup
  - Performance-Optimized-Polyglot-Bridge
  - Local-Only-LLM-Workflow
  - set-assignment-in-lisp-ast
  - sibilant-metacompiler-overview
```
related_to_uuid:
```
  - 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
  - c1618c66-f73a-4e04-9bfa-ef38755f7acc
  - 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
  - cfee6d36-b9f5-4587-885a-cdfddb4f054e
  - ab748541-020e-4a7e-b07d-28173bd5bea2
  - f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
  - 5020e892-8f18-443a-b707-6d0f3efcfe22
  - 8f4c1e86-1236-4936-84ca-6ed7082af6b7
  - 0580dcd3-533d-4834-8a2f-eae3771960a9
  - 93d2ba51-8689-49ee-94e2-296092e48058
  - f2d83a77-7f86-4c56-8538-1350167a0c6c
  - 45cd25b5-ed36-49ab-82c8-10d0903e34db
  - e87bc036-1570-419e-a558-f45b9c0db698
  - 7aa1eb92-7f9a-485b-8218-9b553aa9eefc
  - 5f210ca2-54e9-445b-afe4-fb340d4992c5
  - c62a1815-c43b-4a3b-88e6-d7fa008a155e
  - 01b21543-7e03-4129-8fe4-b6306be69dee
  - 58191024-d04a-4520-8aae-a18be7b94263
  - 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
  - cdfac40c-00e4-458f-96a7-4c37d0278731
  - d2b3628c-6cad-4664-8551-94ef8280851d
  - 78eeedf7-75bc-4692-a5a7-bb6857270621
  - cbfe3513-6a4a-4d2e-915d-ddfab583b2de
  - ba244286-4e84-425b-8bf6-b80c4eb783fc
  - 509e1cd5-367c-4a9d-a61b-cef2e85d42ce
  - 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
  - f5579967-762d-4cfd-851e-4f71b4cb77a1
  - 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
  - c5fba0a0-9196-468d-a0f3-51c99e987263
  - 61d4086b-4adf-4e94-95e4-95a249cd1b53
references:
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 8
    col: 1
    score: 0.87
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 8
    col: 3
    score: 0.87
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 43
    col: 1
    score: 0.87
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 43
    col: 3
    score: 0.87
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 9
    col: 1
    score: 0.91
  - uuid: cfee6d36-b9f5-4587-885a-cdfddb4f054e
    line: 341
    col: 1
    score: 0.85
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 397
    col: 1
    score: 0.89
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
  - uuid: 8f4c1e86-1236-4936-84ca-6ed7082af6b7
    line: 456
    col: 1
    score: 1
  - uuid: 8f4c1e86-1236-4936-84ca-6ed7082af6b7
    line: 456
    col: 3
    score: 1
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 463
    col: 1
    score: 1
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 463
    col: 3
    score: 1
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 395
    col: 1
    score: 1
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 395
    col: 3
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 384
    col: 1
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 384
    col: 3
    score: 1
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 158
    col: 1
    score: 1
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 158
    col: 3
    score: 1
  - uuid: 8f4c1e86-1236-4936-84ca-6ed7082af6b7
    line: 457
    col: 1
    score: 1
  - uuid: 8f4c1e86-1236-4936-84ca-6ed7082af6b7
    line: 457
    col: 3
    score: 1
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 9
    col: 1
    score: 1
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 9
    col: 3
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 10
    col: 1
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 10
    col: 3
    score: 1
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 610
    col: 1
    score: 1
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 610
    col: 3
    score: 1
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 515
    col: 1
    score: 1
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 515
    col: 3
    score: 1
  - uuid: 58191024-d04a-4520-8aae-a18be7b94263
    line: 423
    col: 1
    score: 1
  - uuid: 58191024-d04a-4520-8aae-a18be7b94263
    line: 423
    col: 3
    score: 1
  - uuid: d2b3628c-6cad-4664-8551-94ef8280851d
    line: 532
    col: 1
    score: 1
  - uuid: d2b3628c-6cad-4664-8551-94ef8280851d
    line: 532
    col: 3
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 130
    col: 1
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 130
    col: 3
    score: 1
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 159
    col: 1
    score: 1
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 159
    col: 3
    score: 1
  - uuid: 7aa1eb92-7f9a-485b-8218-9b553aa9eefc
    line: 134
    col: 1
    score: 1
  - uuid: 7aa1eb92-7f9a-485b-8218-9b553aa9eefc
    line: 134
    col: 3
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 168
    col: 1
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 168
    col: 3
    score: 1
  - uuid: 0580dcd3-533d-4834-8a2f-eae3771960a9
    line: 285
    col: 1
    score: 1
  - uuid: 0580dcd3-533d-4834-8a2f-eae3771960a9
    line: 285
    col: 3
    score: 1
  - uuid: 7aa1eb92-7f9a-485b-8218-9b553aa9eefc
    line: 135
    col: 1
    score: 1
  - uuid: 7aa1eb92-7f9a-485b-8218-9b553aa9eefc
    line: 135
    col: 3
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 167
    col: 1
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 167
    col: 3
    score: 1
  - uuid: 5f210ca2-54e9-445b-afe4-fb340d4992c5
    line: 180
    col: 1
    score: 1
  - uuid: 5f210ca2-54e9-445b-afe4-fb340d4992c5
    line: 180
    col: 3
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 134
    col: 1
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 134
    col: 3
    score: 1
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 156
    col: 1
    score: 1
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 156
    col: 3
    score: 1
  - uuid: 7aa1eb92-7f9a-485b-8218-9b553aa9eefc
    line: 136
    col: 1
    score: 1
  - uuid: 7aa1eb92-7f9a-485b-8218-9b553aa9eefc
    line: 136
    col: 3
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 386
    col: 1
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 386
    col: 3
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 166
    col: 1
    score: 0.97
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 166
    col: 3
    score: 0.97
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 167
    col: 1
    score: 0.97
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 167
    col: 3
    score: 0.97
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 401
    col: 1
    score: 0.96
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 401
    col: 3
    score: 0.96
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 402
    col: 1
    score: 0.94
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 402
    col: 3
    score: 0.94
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 403
    col: 1
    score: 0.99
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 403
    col: 3
    score: 0.99
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 31
    col: 1
    score: 0.98
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 31
    col: 3
    score: 0.98
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 404
    col: 1
    score: 0.98
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 404
    col: 3
    score: 0.98
  - uuid: 509e1cd5-367c-4a9d-a61b-cef2e85d42ce
    line: 347
    col: 1
    score: 0.98
  - uuid: 509e1cd5-367c-4a9d-a61b-cef2e85d42ce
    line: 347
    col: 3
    score: 0.98
  - uuid: 509e1cd5-367c-4a9d-a61b-cef2e85d42ce
    line: 348
    col: 1
    score: 0.99
  - uuid: 509e1cd5-367c-4a9d-a61b-cef2e85d42ce
    line: 348
    col: 3
    score: 0.99
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 32
    col: 1
    score: 0.98
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 32
    col: 3
    score: 0.98
  - uuid: 61d4086b-4adf-4e94-95e4-95a249cd1b53
    line: 100
    col: 1
    score: 0.98
  - uuid: 61d4086b-4adf-4e94-95e4-95a249cd1b53
    line: 100
    col: 3
    score: 0.98
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 434
    col: 1
    score: 0.99
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 434
    col: 3
    score: 0.99
  - uuid: ba244286-4e84-425b-8bf6-b80c4eb783fc
    line: 426
    col: 1
    score: 0.99
  - uuid: ba244286-4e84-425b-8bf6-b80c4eb783fc
    line: 426
    col: 3
    score: 0.99
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 435
    col: 1
    score: 0.98
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 435
    col: 3
    score: 0.98
  - uuid: ba244286-4e84-425b-8bf6-b80c4eb783fc
    line: 427
    col: 1
    score: 0.98
  - uuid: ba244286-4e84-425b-8bf6-b80c4eb783fc
    line: 427
    col: 3
    score: 0.98
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 527
    col: 1
    score: 0.99
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 527
    col: 3
    score: 0.99
  - uuid: cbfe3513-6a4a-4d2e-915d-ddfab583b2de
    line: 408
    col: 1
    score: 0.99
  - uuid: cbfe3513-6a4a-4d2e-915d-ddfab583b2de
    line: 408
    col: 3
    score: 0.99
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 534
    col: 1
    score: 0.98
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 534
    col: 3
    score: 0.98
  - uuid: c5fba0a0-9196-468d-a0f3-51c99e987263
    line: 162
    col: 1
    score: 0.98
  - uuid: c5fba0a0-9196-468d-a0f3-51c99e987263
    line: 162
    col: 3
    score: 0.98
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 155
    col: 1
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 155
    col: 3
    score: 0.99
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 610
    col: 1
    score: 0.99
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 610
    col: 3
    score: 0.99
  - uuid: 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
    line: 191
    col: 1
    score: 0.98
  - uuid: 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
    line: 191
    col: 3
    score: 0.98
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 455
    col: 1
    score: 0.98
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 455
    col: 3
    score: 0.98
---
Note: Consolidated here → ../notes/js/zero-copy-snapshots-and-workers.md

Oh you want **actual zero-copy** between main + workers. Let’s do it right:

* Use **SharedArrayBuffer** (SAB) when possible (Node: yes; Browser: only if `crossOriginIsolated`).
* Fallback to **transferable ArrayBuffers** detached in parent, still zero-copy across the postMessage boundary.
* Workers operate on **columnar typed arrays** (SoA), toggle a **changed bitset**, and the main thread commits only changed rows back to your ECS.

Below is a compact, drop-in layer. You don’t have to rewrite your ECS—just define numeric layouts for the components you want to offload.

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
```

---

# 2) Parallel scheduler hook zero-copy mode

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
    if (!sys.offload?.zeroCopy) return super["runSystem"](sys, ctx);

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
}
```

> If SAB is available, there’s **no copy and no detach**. With AB transfer, it’s still zero-copy across the boundary (moved, not cloned).

---

# 3) Worker jobs Node + Browser that mutate in place

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
}
export default handle;
```

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
  }
  (self as any).postMessage(1);
};
```

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
  run() {} // local fallback
});

setInterval(() => sched.runFrame(0.016, Date.now()), 16);
```

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
  run() {}
});

function frame(ts:number){ sched.runFrame(0.016, ts); requestAnimationFrame(frame); }
requestAnimationFrame(frame);
```

---

# 5) Notes / gotchas

* **SAB in browsers** requires COOP/COEP headers ⇒ the app must be **cross-origin isolated**. If you can’t set headers on a static host, you still get **transferables** (ArrayBuffer moves, not clones).
* With SAB, both threads see the same memory. We still **commit** back into the ECS (which uses object components) by visiting only **changed bits**.
* For heavy numeric sims, consider making those components **natively SoA** in the ECS (typed arrays as the storage) and skip commit entirely—workers would be writing the source of truth.

Want me to add a **Shared mailbox** Atomics + sequence numbers so workers can run multiple ticks without round-trips, or a **typed struct compiler** zod → binary layout so you don’t handwrite layouts?
type
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
```
- [docs/unique/ecs-offload-workers|ecs-offload-workers]
- [JavaScript]chunks/javascript.md
- [unique-info-dump-index|Unique Info Dump Index]
- [lisp-compiler-integration]
- [promethean-native-config-design|Promethean-native config design]
- [dynamic-context-model-for-web-components|Dynamic Context Model for Web Components]
- [chroma-toolkit-consolidation-plan|Chroma Toolkit Consolidation Plan]
- [docs/unique/archetype-ecs|archetype-ecs]
- [api-gateway-versioning]
- [docs/unique/agent-tasks-persistence-migration-to-dualstore|Agent Tasks: Persistence Migration to DualStore]
- [docs/unique/aionian-circuit-math|aionian-circuit-math]
- [Diagrams]chunks/diagrams.md
- [DSL]chunks/dsl.md
- [board-walk-2025-08-11|Board Walk – 2025-08-11]
- [cross-target-macro-system-in-sibilant|Cross-Target Macro System in Sibilant]
- [ecs-scheduler-and-prefabs]
- [docs/unique/compiler-kit-foundations|compiler-kit-foundations]
- [js-to-lisp-reverse-compiler]
- [docs/unique/eidolon-field-math-foundations|eidolon-field-math-foundations]
- [docs/unique/interop-and-source-maps|Interop and Source Maps]
- [language-agnostic-mirror-system|Language-Agnostic Mirror System]
- [docs/unique/typed-struct-compiler|typed-struct-compiler]
- [lispy-macros-with-syntax-rules|Lispy Macros with syntax-rules]
- System Scheduler with Resource-Aware DAG$system-scheduler-with-resource-aware-dag.md
- [state-snapshots-api-and-transactional-projector|State Snapshots API and Transactional Projector]
- [promethean-infrastructure-setup|Promethean Infrastructure Setup]
- [performance-optimized-polyglot-bridge]
- [local-only-llm-workflow]
- [set-assignment-in-lisp-ast]
- [sibilant-metacompiler-overview]

## Sources
- [JavaScript — L8]chunks/javascript.md#L8 (line 8, col 1, score 0.87)
- [JavaScript — L8]chunks/javascript.md#L8 (line 8, col 3, score 0.87)
- [unique-info-dump-index#L43|Unique Info Dump Index — L43] (line 43, col 1, score 0.87)
- [unique-info-dump-index#L43|Unique Info Dump Index — L43] (line 43, col 3, score 0.87)
- [docs/unique/ecs-offload-workers#L9|ecs-offload-workers — L9] (line 9, col 1, score 0.91)
- [lisp-compiler-integration#L341|Lisp-Compiler-Integration — L341] (line 341, col 1, score 0.85)
- [docs/unique/ecs-offload-workers#L397|ecs-offload-workers — L397] (line 397, col 1, score 0.89)
- [docs/unique/archetype-ecs#L460|archetype-ecs — L460] (line 460, col 1, score 1)
- [docs/unique/archetype-ecs#L460|archetype-ecs — L460] (line 460, col 3, score 1)
- [JavaScript — L15]chunks/javascript.md#L15 (line 15, col 1, score 1)
- [JavaScript — L15]chunks/javascript.md#L15 (line 15, col 3, score 1)
- [ecs-scheduler-and-prefabs#L388|ecs-scheduler-and-prefabs — L388] (line 388, col 1, score 1)
- [ecs-scheduler-and-prefabs#L388|ecs-scheduler-and-prefabs — L388] (line 388, col 3, score 1)
- [docs/unique/eidolon-field-math-foundations#L129|eidolon-field-math-foundations — L129] (line 129, col 1, score 1)
- [docs/unique/eidolon-field-math-foundations#L129|eidolon-field-math-foundations — L129] (line 129, col 3, score 1)
- [docs/unique/archetype-ecs#L456|archetype-ecs — L456] (line 456, col 1, score 1)
- [docs/unique/archetype-ecs#L456|archetype-ecs — L456] (line 456, col 3, score 1)
- [docs/unique/ecs-offload-workers#L463|ecs-offload-workers — L463] (line 463, col 1, score 1)
- [docs/unique/ecs-offload-workers#L463|ecs-offload-workers — L463] (line 463, col 3, score 1)
- [ecs-scheduler-and-prefabs#L395|ecs-scheduler-and-prefabs — L395] (line 395, col 1, score 1)
- [ecs-scheduler-and-prefabs#L395|ecs-scheduler-and-prefabs — L395] (line 395, col 3, score 1)
- [docs/unique/typed-struct-compiler#L384|typed-struct-compiler — L384] (line 384, col 1, score 1)
- [docs/unique/typed-struct-compiler#L384|typed-struct-compiler — L384] (line 384, col 3, score 1)
- [docs/unique/aionian-circuit-math#L158|aionian-circuit-math — L158] (line 158, col 1, score 1)
- [docs/unique/aionian-circuit-math#L158|aionian-circuit-math — L158] (line 158, col 3, score 1)
- [docs/unique/archetype-ecs#L457|archetype-ecs — L457] (line 457, col 1, score 1)
- [docs/unique/archetype-ecs#L457|archetype-ecs — L457] (line 457, col 3, score 1)
- [Diagrams — L9]chunks/diagrams.md#L9 (line 9, col 1, score 1)
- [Diagrams — L9]chunks/diagrams.md#L9 (line 9, col 3, score 1)
- [DSL — L10]chunks/dsl.md#L10 (line 10, col 1, score 1)
- [DSL — L10]chunks/dsl.md#L10 (line 10, col 3, score 1)
- [docs/unique/compiler-kit-foundations#L610|compiler-kit-foundations — L610] (line 610, col 1, score 1)
- [docs/unique/compiler-kit-foundations#L610|compiler-kit-foundations — L610] (line 610, col 3, score 1)
- [docs/unique/interop-and-source-maps#L515|Interop and Source Maps — L515] (line 515, col 1, score 1)
- [docs/unique/interop-and-source-maps#L515|Interop and Source Maps — L515] (line 515, col 3, score 1)
- [js-to-lisp-reverse-compiler#L423|js-to-lisp-reverse-compiler — L423] (line 423, col 1, score 1)
- [js-to-lisp-reverse-compiler#L423|js-to-lisp-reverse-compiler — L423] (line 423, col 3, score 1)
- [language-agnostic-mirror-system#L532|Language-Agnostic Mirror System — L532] (line 532, col 1, score 1)
- [language-agnostic-mirror-system#L532|Language-Agnostic Mirror System — L532] (line 532, col 3, score 1)
- [docs/unique/agent-tasks-persistence-migration-to-dualstore#L130|Agent Tasks: Persistence Migration to DualStore — L130] (line 130, col 1, score 1)
- [docs/unique/agent-tasks-persistence-migration-to-dualstore#L130|Agent Tasks: Persistence Migration to DualStore — L130] (line 130, col 3, score 1)
- [docs/unique/aionian-circuit-math#L159|aionian-circuit-math — L159] (line 159, col 1, score 1)
- [docs/unique/aionian-circuit-math#L159|aionian-circuit-math — L159] (line 159, col 3, score 1)
- [board-walk-2025-08-11#L134|Board Walk – 2025-08-11 — L134] (line 134, col 1, score 1)
- [board-walk-2025-08-11#L134|Board Walk – 2025-08-11 — L134] (line 134, col 3, score 1)
- [chroma-toolkit-consolidation-plan#L168|Chroma Toolkit Consolidation Plan — L168] (line 168, col 1, score 1)
- [chroma-toolkit-consolidation-plan#L168|Chroma Toolkit Consolidation Plan — L168] (line 168, col 3, score 1)
- [api-gateway-versioning#L285|api-gateway-versioning — L285] (line 285, col 1, score 1)
- [api-gateway-versioning#L285|api-gateway-versioning — L285] (line 285, col 3, score 1)
- [board-walk-2025-08-11#L135|Board Walk – 2025-08-11 — L135] (line 135, col 1, score 1)
- [board-walk-2025-08-11#L135|Board Walk – 2025-08-11 — L135] (line 135, col 3, score 1)
- [chroma-toolkit-consolidation-plan#L167|Chroma Toolkit Consolidation Plan — L167] (line 167, col 1, score 1)
- [chroma-toolkit-consolidation-plan#L167|Chroma Toolkit Consolidation Plan — L167] (line 167, col 3, score 1)
- [cross-target-macro-system-in-sibilant#L180|Cross-Target Macro System in Sibilant — L180] (line 180, col 1, score 1)
- [cross-target-macro-system-in-sibilant#L180|Cross-Target Macro System in Sibilant — L180] (line 180, col 3, score 1)
- [docs/unique/agent-tasks-persistence-migration-to-dualstore#L134|Agent Tasks: Persistence Migration to DualStore — L134] (line 134, col 1, score 1)
- [docs/unique/agent-tasks-persistence-migration-to-dualstore#L134|Agent Tasks: Persistence Migration to DualStore — L134] (line 134, col 3, score 1)
- [docs/unique/aionian-circuit-math#L156|aionian-circuit-math — L156] (line 156, col 1, score 1)
- [docs/unique/aionian-circuit-math#L156|aionian-circuit-math — L156] (line 156, col 3, score 1)
- [board-walk-2025-08-11#L136|Board Walk – 2025-08-11 — L136] (line 136, col 1, score 1)
- [board-walk-2025-08-11#L136|Board Walk – 2025-08-11 — L136] (line 136, col 3, score 1)
- [dynamic-context-model-for-web-components#L386|Dynamic Context Model for Web Components — L386] (line 386, col 1, score 1)
- [dynamic-context-model-for-web-components#L386|Dynamic Context Model for Web Components — L386] (line 386, col 3, score 1)
- [unique-info-dump-index#L166|Unique Info Dump Index — L166] (line 166, col 1, score 0.97)
- [unique-info-dump-index#L166|Unique Info Dump Index — L166] (line 166, col 3, score 0.97)
- [unique-info-dump-index#L167|Unique Info Dump Index — L167] (line 167, col 1, score 0.97)
- [unique-info-dump-index#L167|Unique Info Dump Index — L167] (line 167, col 3, score 0.97)
- [ecs-scheduler-and-prefabs#L401|ecs-scheduler-and-prefabs — L401] (line 401, col 1, score 0.96)
- [ecs-scheduler-and-prefabs#L401|ecs-scheduler-and-prefabs — L401] (line 401, col 3, score 0.96)
- [ecs-scheduler-and-prefabs#L402|ecs-scheduler-and-prefabs — L402] (line 402, col 1, score 0.94)
- [ecs-scheduler-and-prefabs#L402|ecs-scheduler-and-prefabs — L402] (line 402, col 3, score 0.94)
- [ecs-scheduler-and-prefabs#L403|ecs-scheduler-and-prefabs — L403] (line 403, col 1, score 0.99)
- [ecs-scheduler-and-prefabs#L403|ecs-scheduler-and-prefabs — L403] (line 403, col 3, score 0.99)
- [JavaScript — L31]chunks/javascript.md#L31 (line 31, col 1, score 0.98)
- [JavaScript — L31]chunks/javascript.md#L31 (line 31, col 3, score 0.98)
- [ecs-scheduler-and-prefabs#L404|ecs-scheduler-and-prefabs — L404] (line 404, col 1, score 0.98)
- [ecs-scheduler-and-prefabs#L404|ecs-scheduler-and-prefabs — L404] (line 404, col 3, score 0.98)
- [state-snapshots-api-and-transactional-projector#L347|State Snapshots API and Transactional Projector — L347] (line 347, col 1, score 0.98)
- [state-snapshots-api-and-transactional-projector#L347|State Snapshots API and Transactional Projector — L347] (line 347, col 3, score 0.98)
- [state-snapshots-api-and-transactional-projector#L348|State Snapshots API and Transactional Projector — L348] (line 348, col 1, score 0.99)
- [state-snapshots-api-and-transactional-projector#L348|State Snapshots API and Transactional Projector — L348] (line 348, col 3, score 0.99)
- [JavaScript — L32]chunks/javascript.md#L32 (line 32, col 1, score 0.98)
- [JavaScript — L32]chunks/javascript.md#L32 (line 32, col 3, score 0.98)
- [sibilant-metacompiler-overview#L100|sibilant-metacompiler-overview — L100] (line 100, col 1, score 0.98)
- [sibilant-metacompiler-overview#L100|sibilant-metacompiler-overview — L100] (line 100, col 3, score 0.98)
- [ecs-scheduler-and-prefabs#L434|ecs-scheduler-and-prefabs — L434] (line 434, col 1, score 0.99)
- [ecs-scheduler-and-prefabs#L434|ecs-scheduler-and-prefabs — L434] (line 434, col 3, score 0.99)
- System Scheduler with Resource-Aware DAG — L426$system-scheduler-with-resource-aware-dag.md#L426 (line 426, col 1, score 0.99)
- System Scheduler with Resource-Aware DAG — L426$system-scheduler-with-resource-aware-dag.md#L426 (line 426, col 3, score 0.99)
- [ecs-scheduler-and-prefabs#L435|ecs-scheduler-and-prefabs — L435] (line 435, col 1, score 0.98)
- [ecs-scheduler-and-prefabs#L435|ecs-scheduler-and-prefabs — L435] (line 435, col 3, score 0.98)
- System Scheduler with Resource-Aware DAG — L427$system-scheduler-with-resource-aware-dag.md#L427 (line 427, col 1, score 0.98)
- System Scheduler with Resource-Aware DAG — L427$system-scheduler-with-resource-aware-dag.md#L427 (line 427, col 3, score 0.98)
- [docs/unique/interop-and-source-maps#L527|Interop and Source Maps — L527] (line 527, col 1, score 0.99)
- [docs/unique/interop-and-source-maps#L527|Interop and Source Maps — L527] (line 527, col 3, score 0.99)
- [lispy-macros-with-syntax-rules#L408|Lispy Macros with syntax-rules — L408] (line 408, col 1, score 0.99)
- [lispy-macros-with-syntax-rules#L408|Lispy Macros with syntax-rules — L408] (line 408, col 3, score 0.99)
- [docs/unique/interop-and-source-maps#L534|Interop and Source Maps — L534] (line 534, col 1, score 0.98)
- [docs/unique/interop-and-source-maps#L534|Interop and Source Maps — L534] (line 534, col 3, score 0.98)
- [set-assignment-in-lisp-ast#L162|set-assignment-in-lisp-ast — L162] (line 162, col 1, score 0.98)
- [set-assignment-in-lisp-ast#L162|set-assignment-in-lisp-ast — L162] (line 162, col 3, score 0.98)
- [docs/unique/eidolon-field-math-foundations#L155|eidolon-field-math-foundations — L155] (line 155, col 1, score 0.99)
- [docs/unique/eidolon-field-math-foundations#L155|eidolon-field-math-foundations — L155] (line 155, col 3, score 0.99)
- [promethean-infrastructure-setup#L610|Promethean Infrastructure Setup — L610] (line 610, col 1, score 0.99)
- [promethean-infrastructure-setup#L610|Promethean Infrastructure Setup — L610] (line 610, col 3, score 0.99)
- [local-only-llm-workflow#L191|Local-Only-LLM-Workflow — L191] (line 191, col 1, score 0.98)
- [local-only-llm-workflow#L191|Local-Only-LLM-Workflow — L191] (line 191, col 3, score 0.98)
- [performance-optimized-polyglot-bridge#L455|Performance-Optimized-Polyglot-Bridge — L455] (line 455, col 1, score 0.98)
- [performance-optimized-polyglot-bridge#L455|Performance-Optimized-Polyglot-Bridge — L455] (line 455, col 3, score 0.98)
```
```
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
