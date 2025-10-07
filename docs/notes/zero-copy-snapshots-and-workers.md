---
$$
uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
$$
$$
created_at: 2025.08.08.22.08.39.md
$$
filename: zero-copy-snapshots-and-workers
$$
description: >-
$$
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
$$
related_to_title:
$$
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
$$
related_to_uuid:
$$
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
* Fallback to **transferable ArrayBuffers** $detached in parent, still zero-copy across the postMessage boundary$.
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

# 2) Parallel scheduler hook $zero-copy mode$

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

# 3) Worker jobs $Node + Browser$ that mutate in place

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

Want me to add a **Shared mailbox** $Atomics + sequence numbers$ so workers can run multiple ticks without round-trips, or a **typed struct compiler** $zod → binary layout$ so you don’t handwrite layouts?
type
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
<<<<<<< HEAD
- $[docs/unique/typed-struct-compiler|typed-struct-compiler]$
- $[ducks-attractor-states|Duck's Attractor States]$
- $[docs/unique/eidolon-field-math-foundations|eidolon-field-math-foundations]$
- [Debugging Broker Connections and Agent Behavior]$debugging-broker-connections-and-agent-behavior.md$
- $[dynamic-context-model-for-web-components|Dynamic Context Model for Web Components]$
- $[eidolon-field-abstract-model|Eidolon Field Abstract Model]$
- $[docs/unique/field-dynamics-math-blocks|field-dynamics-math-blocks]$
- $[docs/unique/field-interaction-equations|field-interaction-equations]$
- $[fnord-tracer-protocol|Fnord Tracer Protocol]$
- [Layer1SurvivabilityEnvelope](layer1survivabilityenvelope.md)
- $[ducks-self-referential-perceptual-loop|Duck's Self-Referential Perceptual Loop]$
- $[typescript-patch-for-tool-calling-support|TypeScript Patch for Tool Calling Support]$
- $[prompt-folder-bootstrap|Prompt_Folder_Bootstrap]$
- $[eidolon-node-lifecycle]$
- $plan-update-confirmation$$plan-update-confirmation.md$
- $[docs/unique/obsidian-ignore-node-modules-regex|obsidian-ignore-node-modules-regex]$
- $[windows-tiling-with-autohotkey]$
- $[unique-info-dump-index|Unique Info Dump Index]$
- $[creative-moments|Creative Moments]$
- $[functional-refactor-of-typescript-document-processing|Functional Refactor of TypeScript Document Processing]$
- $[factorio-ai-with-external-agents|Factorio AI with External Agents]$
- $[field-node-diagram-outline]$
- $field-node-diagram-visualizations$$field-node-diagram-visualizations.md$
- $[field-node-diagram-set]$
- $[functional-embedding-pipeline-refactor|Functional Embedding Pipeline Refactor]$
## Sources
- $[docs/unique/typed-struct-compiler#^ref-78eeedf7-1016-0|typed-struct-compiler — L1016]$ (line 1016, col 0, score 1)
- $[unique-concepts#^ref-ed6f3fc9-175-0|Unique Concepts — L175]$ (line 175, col 0, score 1)
- $[unique-info-dump-index#^ref-30ec3ba6-1221-0|Unique Info Dump Index — L1221]$ (line 1221, col 0, score 1)
- $Canonical Org-Babel Matplotlib Animation Template — L515$$canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-515-0$ (line 515, col 0, score 1)
- $[creative-moments#^ref-10d98225-251-0|Creative Moments — L251]$ (line 251, col 0, score 1)
- $[ducks-attractor-states#^ref-13951643-559-0|Duck's Attractor States — L559]$ (line 559, col 0, score 1)
- $[docs/unique/eidolon-field-math-foundations#^ref-008f2ac0-1033-0|eidolon-field-math-foundations — L1033]$ (line 1033, col 0, score 1)
- $[functional-refactor-of-typescript-document-processing#^ref-1cfae310-463-0|Functional Refactor of TypeScript Document Processing — L463]$ (line 463, col 0, score 1)
- $[docops-feature-updates#^ref-2792d448-226-0|Docops Feature Updates — L226]$ (line 226, col 0, score 1)
- $[field-node-diagram-outline#^ref-1f32c94a-705-0|field-node-diagram-outline — L705]$ (line 705, col 0, score 1)
- $[field-node-diagram-set#^ref-22b989d5-719-0|field-node-diagram-set — L719]$ (line 719, col 0, score 1)
- $field-node-diagram-visualizations — L601$$field-node-diagram-visualizations.md#^ref-e9b27b06-601-0$ (line 601, col 0, score 1)
- $[fnord-tracer-protocol#^ref-fc21f824-1060-0|Fnord Tracer Protocol — L1060]$ (line 1060, col 0, score 1)
- $[functional-embedding-pipeline-refactor#^ref-a4a25141-726-0|Functional Embedding Pipeline Refactor — L726]$ (line 726, col 0, score 1)
- $[graph-ds#^ref-6620e2f2-996-0|graph-ds — L996]$ (line 996, col 0, score 1)
- $[heartbeat-fragment-demo#^ref-dd00677a-667-0|heartbeat-fragment-demo — L667]$ (line 667, col 0, score 1)
- $[i3-bluetooth-setup#^ref-5e408692-736-0|i3-bluetooth-setup — L736]$ (line 736, col 0, score 1)
- $[ice-box-reorganization#^ref-291c7d91-645-0|Ice Box Reorganization — L645]$ (line 645, col 0, score 1)
- $komorebi-group-window-hack — L739$$komorebi-group-window-hack.md#^ref-dd89372d-739-0$ (line 739, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L816]$layer1survivabilityenvelope.md#^ref-64a9f9f9-816-0$ (line 816, col 0, score 1)
- $[dynamic-context-model-for-web-components#^ref-f7702bf8-412-0|Dynamic Context Model for Web Components — L412]$ (line 412, col 0, score 1)
- $[eidolon-field-abstract-model#^ref-5e8b2388-261-0|Eidolon Field Abstract Model — L261]$ (line 261, col 0, score 1)
- $[docs/unique/eidolon-field-math-foundations#^ref-008f2ac0-181-0|eidolon-field-math-foundations — L181]$ (line 181, col 0, score 1)
- $[eidolon-node-lifecycle#^ref-938eca9c-90-0|eidolon-node-lifecycle — L90]$ (line 90, col 0, score 1)
- $[factorio-ai-with-external-agents#^ref-a4d90289-157-0|Factorio AI with External Agents — L157]$ (line 157, col 0, score 1)
- $[docs/unique/field-dynamics-math-blocks#^ref-7cfc230d-205-0|field-dynamics-math-blocks — L205]$ (line 205, col 0, score 1)
- $[docs/unique/field-interaction-equations#^ref-b09141b7-149-0|field-interaction-equations — L149]$ (line 149, col 0, score 1)
- $[field-node-diagram-outline#^ref-1f32c94a-110-0|field-node-diagram-outline — L110]$ (line 110, col 0, score 1)
- $[field-node-diagram-set#^ref-22b989d5-203-0|field-node-diagram-set — L203]$ (line 203, col 0, score 1)
- $field-node-diagram-visualizations — L95$$field-node-diagram-visualizations.md#^ref-e9b27b06-95-0$ (line 95, col 0, score 1)
- $[creative-moments#^ref-10d98225-33-0|Creative Moments — L33]$ (line 33, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L99]$debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-99-0$ (line 99, col 0, score 1)
- $[docops-feature-updates#^ref-2792d448-46-0|Docops Feature Updates — L46]$ (line 46, col 0, score 1)
- [DuckDuckGoSearchPipeline — L10]$duckduckgosearchpipeline.md#^ref-e979c50f-10-0$ (line 10, col 0, score 1)
- $[per-domain-policy-system-for-js-crawler#^ref-c03020e1-495-0|Per-Domain Policy System for JS Crawler — L495]$ (line 495, col 0, score 1)
- $[performance-optimized-polyglot-bridge#^ref-f5579967-459-0|Performance-Optimized-Polyglot-Bridge — L459]$ (line 459, col 0, score 1)
- $[pipeline-enhancements#^ref-e2135d9f-27-0|Pipeline Enhancements — L27]$ (line 27, col 0, score 1)
- $plan-update-confirmation — L1002$$plan-update-confirmation.md#^ref-b22d79c6-1002-0$ (line 1002, col 0, score 1)
- $[polyglot-repl-interface-layer#^ref-9c79206d-171-0|polyglot-repl-interface-layer — L171]$ (line 171, col 0, score 1)
- $[post-linguistic-transhuman-design-frameworks#^ref-6bcff92c-112-0|Post-Linguistic Transhuman Design Frameworks — L112]$ (line 112, col 0, score 1)
- $[promethean-chat-activity-report#^ref-18344cf9-24-0|Promethean Chat Activity Report — L24]$ (line 24, col 0, score 1)
- $Protocol_0_The_Contradiction_Engine — L143$$protocol-0-the-contradiction-engine.md#^ref-9a93a756-143-0$ (line 143, col 0, score 1)
- $[provider-agnostic-chat-panel-implementation#^ref-43bfe9dd-241-0|Provider-Agnostic Chat Panel Implementation — L241]$ (line 241, col 0, score 1)
- $[typescript-patch-for-tool-calling-support#^ref-7b7ca860-541-0|TypeScript Patch for Tool Calling Support — L541]$ (line 541, col 0, score 1)
- $[ducks-self-referential-perceptual-loop#^ref-71726f04-78-0|Duck's Self-Referential Perceptual Loop — L78]$ (line 78, col 0, score 1)
- $[factorio-ai-with-external-agents#^ref-a4d90289-176-0|Factorio AI with External Agents — L176]$ (line 176, col 0, score 1)
- $[field-node-diagram-outline#^ref-1f32c94a-154-0|field-node-diagram-outline — L154]$ (line 154, col 0, score 1)
- $[field-node-diagram-set#^ref-22b989d5-175-0|field-node-diagram-set — L175]$ (line 175, col 0, score 1)
- $field-node-diagram-visualizations — L123$$field-node-diagram-visualizations.md#^ref-e9b27b06-123-0$ (line 123, col 0, score 1)
- $[fnord-tracer-protocol#^ref-fc21f824-274-0|Fnord Tracer Protocol — L274]$ (line 274, col 0, score 1)
- $[functional-embedding-pipeline-refactor#^ref-a4a25141-327-0|Functional Embedding Pipeline Refactor — L327]$ (line 327, col 0, score 1)
- $[graph-ds#^ref-6620e2f2-412-0|graph-ds — L412]$ (line 412, col 0, score 1)
- $[heartbeat-fragment-demo#^ref-dd00677a-159-0|heartbeat-fragment-demo — L159]$ (line 159, col 0, score 1)
- $[ice-box-reorganization#^ref-291c7d91-95-0|Ice Box Reorganization — L95]$ (line 95, col 0, score 1)
- $komorebi-group-window-hack — L237$$komorebi-group-window-hack.md#^ref-dd89372d-237-0$ (line 237, col 0, score 1)
- $[creative-moments#^ref-10d98225-8-0|Creative Moments — L8]$ (line 8, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L38]$debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-38-0$ (line 38, col 0, score 1)
- [Docops Feature Updates — L56]$docops-feature-updates-3.md#^ref-cdbd21ee-56-0$ (line 56, col 0, score 1)
- $[docs/unique/eidolon-field-math-foundations#^ref-008f2ac0-148-0|eidolon-field-math-foundations — L148]$ (line 148, col 0, score 1)
- $[eidolon-node-lifecycle#^ref-938eca9c-36-0|eidolon-node-lifecycle — L36]$ (line 36, col 0, score 1)
- $[factorio-ai-with-external-agents#^ref-a4d90289-166-0|Factorio AI with External Agents — L166]$ (line 166, col 0, score 1)
- $[docs/unique/field-dynamics-math-blocks#^ref-7cfc230d-148-0|field-dynamics-math-blocks — L148]$ (line 148, col 0, score 1)
- $[docs/unique/field-interaction-equations#^ref-b09141b7-153-0|field-interaction-equations — L153]$ (line 153, col 0, score 1)
- $[field-node-diagram-outline#^ref-1f32c94a-118-0|field-node-diagram-outline — L118]$ (line 118, col 0, score 1)
- $[field-node-diagram-set#^ref-22b989d5-168-0|field-node-diagram-set — L168]$ (line 168, col 0, score 1)
- $field-node-diagram-visualizations — L103$$field-node-diagram-visualizations.md#^ref-e9b27b06-103-0$ (line 103, col 0, score 1)
- $[functional-embedding-pipeline-refactor#^ref-a4a25141-380-0|Functional Embedding Pipeline Refactor — L380]$ (line 380, col 0, score 1)
- $[functional-refactor-of-typescript-document-processing#^ref-1cfae310-194-0|Functional Refactor of TypeScript Document Processing — L194]$ (line 194, col 0, score 1)
- $[docops-feature-updates#^ref-2792d448-35-0|Docops Feature Updates — L35]$ (line 35, col 0, score 1)
- $[ducks-attractor-states#^ref-13951643-94-0|Duck's Attractor States — L94]$ (line 94, col 0, score 1)
- $[ducks-self-referential-perceptual-loop#^ref-71726f04-53-0|Duck's Self-Referential Perceptual Loop — L53]$ (line 53, col 0, score 1)
- $[dynamic-context-model-for-web-components#^ref-f7702bf8-424-0|Dynamic Context Model for Web Components — L424]$ (line 424, col 0, score 1)
- $[eidolon-field-abstract-model#^ref-5e8b2388-209-0|Eidolon Field Abstract Model — L209]$ (line 209, col 0, score 1)
- $[docs/unique/eidolon-field-math-foundations#^ref-008f2ac0-142-0|eidolon-field-math-foundations — L142]$ (line 142, col 0, score 1)
- $[eidolon-node-lifecycle#^ref-938eca9c-39-0|eidolon-node-lifecycle — L39]$ (line 39, col 0, score 1)
- [Docops Feature Updates — L85]$docops-feature-updates-3.md#^ref-cdbd21ee-85-0$ (line 85, col 0, score 1)
- $[ducks-attractor-states#^ref-13951643-93-0|Duck's Attractor States — L93]$ (line 93, col 0, score 1)
- $[ducks-self-referential-perceptual-loop#^ref-71726f04-64-0|Duck's Self-Referential Perceptual Loop — L64]$ (line 64, col 0, score 1)
- $[factorio-ai-with-external-agents#^ref-a4d90289-153-0|Factorio AI with External Agents — L153]$ (line 153, col 0, score 1)
- $[docs/unique/field-dynamics-math-blocks#^ref-7cfc230d-141-0|field-dynamics-math-blocks — L141]$ (line 141, col 0, score 1)
- $[creative-moments#^ref-10d98225-28-0|Creative Moments — L28]$ (line 28, col 0, score 1)
- [Docops Feature Updates — L65]$docops-feature-updates-3.md#^ref-cdbd21ee-65-0$ (line 65, col 0, score 1)
- $[docops-feature-updates#^ref-2792d448-86-0|Docops Feature Updates — L86]$ (line 86, col 0, score 1)
- $[ducks-attractor-states#^ref-13951643-123-0|Duck's Attractor States — L123]$ (line 123, col 0, score 1)
- $[ducks-self-referential-perceptual-loop#^ref-71726f04-34-0|Duck's Self-Referential Perceptual Loop — L34]$ (line 34, col 0, score 1)
- $[dynamic-context-model-for-web-components#^ref-f7702bf8-442-0|Dynamic Context Model for Web Components — L442]$ (line 442, col 0, score 1)
- $[eidolon-field-abstract-model#^ref-5e8b2388-218-0|Eidolon Field Abstract Model — L218]$ (line 218, col 0, score 1)
- $[docs/unique/eidolon-field-math-foundations#^ref-008f2ac0-176-0|eidolon-field-math-foundations — L176]$ (line 176, col 0, score 1)
- $[eidolon-node-lifecycle#^ref-938eca9c-70-0|eidolon-node-lifecycle — L70]$ (line 70, col 0, score 1)
- $[creative-moments#^ref-10d98225-38-0|Creative Moments — L38]$ (line 38, col 0, score 1)
- [Docops Feature Updates — L51]$docops-feature-updates-3.md#^ref-cdbd21ee-51-0$ (line 51, col 0, score 1)
- $[docops-feature-updates#^ref-2792d448-79-0|Docops Feature Updates — L79]$ (line 79, col 0, score 1)
- [DuckDuckGoSearchPipeline — L77]$duckduckgosearchpipeline.md#^ref-e979c50f-77-0$ (line 77, col 0, score 1)
- $[ducks-attractor-states#^ref-13951643-115-0|Duck's Attractor States — L115]$ (line 115, col 0, score 1)
- $[ducks-self-referential-perceptual-loop#^ref-71726f04-61-0|Duck's Self-Referential Perceptual Loop — L61]$ (line 61, col 0, score 1)
- $[eidolon-field-abstract-model#^ref-5e8b2388-212-0|Eidolon Field Abstract Model — L212]$ (line 212, col 0, score 1)
- $[docs/unique/eidolon-field-math-foundations#^ref-008f2ac0-150-0|eidolon-field-math-foundations — L150]$ (line 150, col 0, score 1)
- $[creative-moments#^ref-10d98225-94-0|Creative Moments — L94]$ (line 94, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L63]$debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-63-0$ (line 63, col 0, score 1)
- [Docops Feature Updates — L66]$docops-feature-updates-3.md#^ref-cdbd21ee-66-0$ (line 66, col 0, score 1)
$$
=======
$$
- $[docs/unique/ecs-offload-workers|ecs-offload-workers]$
- [JavaScript]$chunks/javascript.md$
- $[unique-info-dump-index|Unique Info Dump Index]$
- $[lisp-compiler-integration]$
- $[promethean-native-config-design|Promethean-native config design]$
- $[dynamic-context-model-for-web-components|Dynamic Context Model for Web Components]$
- $[chroma-toolkit-consolidation-plan|Chroma Toolkit Consolidation Plan]$
- $[docs/unique/archetype-ecs|archetype-ecs]$
- $[api-gateway-versioning]$
- $[docs/unique/agent-tasks-persistence-migration-to-dualstore|Agent Tasks: Persistence Migration to DualStore]$
- $[docs/unique/aionian-circuit-math|aionian-circuit-math]$
- [Diagrams]$chunks/diagrams.md$
- [DSL]$chunks/dsl.md$
- $[board-walk-2025-08-11|Board Walk – 2025-08-11]$
- $[cross-target-macro-system-in-sibilant|Cross-Target Macro System in Sibilant]$
- $[ecs-scheduler-and-prefabs]$
- $[docs/unique/compiler-kit-foundations|compiler-kit-foundations]$
- $[js-to-lisp-reverse-compiler]$
- $[docs/unique/eidolon-field-math-foundations|eidolon-field-math-foundations]$
- $[docs/unique/interop-and-source-maps|Interop and Source Maps]$
- $[language-agnostic-mirror-system|Language-Agnostic Mirror System]$
- $[docs/unique/typed-struct-compiler|typed-struct-compiler]$
- $[lispy-macros-with-syntax-rules|Lispy Macros with syntax-rules]$
- $System Scheduler with Resource-Aware DAG$$system-scheduler-with-resource-aware-dag.md$
- $[state-snapshots-api-and-transactional-projector|State Snapshots API and Transactional Projector]$
- $[promethean-infrastructure-setup|Promethean Infrastructure Setup]$
- $[performance-optimized-polyglot-bridge]$
- $[local-only-llm-workflow]$
- $[set-assignment-in-lisp-ast]$
- $[sibilant-metacompiler-overview]$

## Sources
- [JavaScript — L8]$chunks/javascript.md#L8$ (line 8, col 1, score 0.87)
- [JavaScript — L8]$chunks/javascript.md#L8$ (line 8, col 3, score 0.87)
- $[unique-info-dump-index#L43|Unique Info Dump Index — L43]$ (line 43, col 1, score 0.87)
- $[unique-info-dump-index#L43|Unique Info Dump Index — L43]$ (line 43, col 3, score 0.87)
- $[docs/unique/ecs-offload-workers#L9|ecs-offload-workers — L9]$ (line 9, col 1, score 0.91)
- $[lisp-compiler-integration#L341|Lisp-Compiler-Integration — L341]$ (line 341, col 1, score 0.85)
- $[docs/unique/ecs-offload-workers#L397|ecs-offload-workers — L397]$ (line 397, col 1, score 0.89)
- $[docs/unique/archetype-ecs#L460|archetype-ecs — L460]$ (line 460, col 1, score 1)
- $[docs/unique/archetype-ecs#L460|archetype-ecs — L460]$ (line 460, col 3, score 1)
- [JavaScript — L15]$chunks/javascript.md#L15$ (line 15, col 1, score 1)
- [JavaScript — L15]$chunks/javascript.md#L15$ (line 15, col 3, score 1)
- $[ecs-scheduler-and-prefabs#L388|ecs-scheduler-and-prefabs — L388]$ (line 388, col 1, score 1)
- $[ecs-scheduler-and-prefabs#L388|ecs-scheduler-and-prefabs — L388]$ (line 388, col 3, score 1)
- $[docs/unique/eidolon-field-math-foundations#L129|eidolon-field-math-foundations — L129]$ (line 129, col 1, score 1)
- $[docs/unique/eidolon-field-math-foundations#L129|eidolon-field-math-foundations — L129]$ (line 129, col 3, score 1)
- $[docs/unique/archetype-ecs#L456|archetype-ecs — L456]$ (line 456, col 1, score 1)
- $[docs/unique/archetype-ecs#L456|archetype-ecs — L456]$ (line 456, col 3, score 1)
- $[docs/unique/ecs-offload-workers#L463|ecs-offload-workers — L463]$ (line 463, col 1, score 1)
- $[docs/unique/ecs-offload-workers#L463|ecs-offload-workers — L463]$ (line 463, col 3, score 1)
- $[ecs-scheduler-and-prefabs#L395|ecs-scheduler-and-prefabs — L395]$ (line 395, col 1, score 1)
- $[ecs-scheduler-and-prefabs#L395|ecs-scheduler-and-prefabs — L395]$ (line 395, col 3, score 1)
- $[docs/unique/typed-struct-compiler#L384|typed-struct-compiler — L384]$ (line 384, col 1, score 1)
- $[docs/unique/typed-struct-compiler#L384|typed-struct-compiler — L384]$ (line 384, col 3, score 1)
- $[docs/unique/aionian-circuit-math#L158|aionian-circuit-math — L158]$ (line 158, col 1, score 1)
- $[docs/unique/aionian-circuit-math#L158|aionian-circuit-math — L158]$ (line 158, col 3, score 1)
- $[docs/unique/archetype-ecs#L457|archetype-ecs — L457]$ (line 457, col 1, score 1)
- $[docs/unique/archetype-ecs#L457|archetype-ecs — L457]$ (line 457, col 3, score 1)
- [Diagrams — L9]$chunks/diagrams.md#L9$ (line 9, col 1, score 1)
- [Diagrams — L9]$chunks/diagrams.md#L9$ (line 9, col 3, score 1)
- [DSL — L10]$chunks/dsl.md#L10$ (line 10, col 1, score 1)
- [DSL — L10]$chunks/dsl.md#L10$ (line 10, col 3, score 1)
- $[docs/unique/compiler-kit-foundations#L610|compiler-kit-foundations — L610]$ (line 610, col 1, score 1)
- $[docs/unique/compiler-kit-foundations#L610|compiler-kit-foundations — L610]$ (line 610, col 3, score 1)
- $[docs/unique/interop-and-source-maps#L515|Interop and Source Maps — L515]$ (line 515, col 1, score 1)
- $[docs/unique/interop-and-source-maps#L515|Interop and Source Maps — L515]$ (line 515, col 3, score 1)
- $[js-to-lisp-reverse-compiler#L423|js-to-lisp-reverse-compiler — L423]$ (line 423, col 1, score 1)
- $[js-to-lisp-reverse-compiler#L423|js-to-lisp-reverse-compiler — L423]$ (line 423, col 3, score 1)
- $[language-agnostic-mirror-system#L532|Language-Agnostic Mirror System — L532]$ (line 532, col 1, score 1)
- $[language-agnostic-mirror-system#L532|Language-Agnostic Mirror System — L532]$ (line 532, col 3, score 1)
- $[docs/unique/agent-tasks-persistence-migration-to-dualstore#L130|Agent Tasks: Persistence Migration to DualStore — L130]$ (line 130, col 1, score 1)
- $[docs/unique/agent-tasks-persistence-migration-to-dualstore#L130|Agent Tasks: Persistence Migration to DualStore — L130]$ (line 130, col 3, score 1)
- $[docs/unique/aionian-circuit-math#L159|aionian-circuit-math — L159]$ (line 159, col 1, score 1)
- $[docs/unique/aionian-circuit-math#L159|aionian-circuit-math — L159]$ (line 159, col 3, score 1)
- $[board-walk-2025-08-11#L134|Board Walk – 2025-08-11 — L134]$ (line 134, col 1, score 1)
- $[board-walk-2025-08-11#L134|Board Walk – 2025-08-11 — L134]$ (line 134, col 3, score 1)
- $[chroma-toolkit-consolidation-plan#L168|Chroma Toolkit Consolidation Plan — L168]$ (line 168, col 1, score 1)
- $[chroma-toolkit-consolidation-plan#L168|Chroma Toolkit Consolidation Plan — L168]$ (line 168, col 3, score 1)
- $[api-gateway-versioning#L285|api-gateway-versioning — L285]$ (line 285, col 1, score 1)
- $[api-gateway-versioning#L285|api-gateway-versioning — L285]$ (line 285, col 3, score 1)
- $[board-walk-2025-08-11#L135|Board Walk – 2025-08-11 — L135]$ (line 135, col 1, score 1)
- $[board-walk-2025-08-11#L135|Board Walk – 2025-08-11 — L135]$ (line 135, col 3, score 1)
- $[chroma-toolkit-consolidation-plan#L167|Chroma Toolkit Consolidation Plan — L167]$ (line 167, col 1, score 1)
- $[chroma-toolkit-consolidation-plan#L167|Chroma Toolkit Consolidation Plan — L167]$ (line 167, col 3, score 1)
- $[cross-target-macro-system-in-sibilant#L180|Cross-Target Macro System in Sibilant — L180]$ (line 180, col 1, score 1)
- $[cross-target-macro-system-in-sibilant#L180|Cross-Target Macro System in Sibilant — L180]$ (line 180, col 3, score 1)
- $[docs/unique/agent-tasks-persistence-migration-to-dualstore#L134|Agent Tasks: Persistence Migration to DualStore — L134]$ (line 134, col 1, score 1)
- $[docs/unique/agent-tasks-persistence-migration-to-dualstore#L134|Agent Tasks: Persistence Migration to DualStore — L134]$ (line 134, col 3, score 1)
- $[docs/unique/aionian-circuit-math#L156|aionian-circuit-math — L156]$ (line 156, col 1, score 1)
- $[docs/unique/aionian-circuit-math#L156|aionian-circuit-math — L156]$ (line 156, col 3, score 1)
- $[board-walk-2025-08-11#L136|Board Walk – 2025-08-11 — L136]$ (line 136, col 1, score 1)
- $[board-walk-2025-08-11#L136|Board Walk – 2025-08-11 — L136]$ (line 136, col 3, score 1)
- $[dynamic-context-model-for-web-components#L386|Dynamic Context Model for Web Components — L386]$ (line 386, col 1, score 1)
- $[dynamic-context-model-for-web-components#L386|Dynamic Context Model for Web Components — L386]$ (line 386, col 3, score 1)
- $[unique-info-dump-index#L166|Unique Info Dump Index — L166]$ (line 166, col 1, score 0.97)
- $[unique-info-dump-index#L166|Unique Info Dump Index — L166]$ (line 166, col 3, score 0.97)
- $[unique-info-dump-index#L167|Unique Info Dump Index — L167]$ (line 167, col 1, score 0.97)
- $[unique-info-dump-index#L167|Unique Info Dump Index — L167]$ (line 167, col 3, score 0.97)
- $[ecs-scheduler-and-prefabs#L401|ecs-scheduler-and-prefabs — L401]$ (line 401, col 1, score 0.96)
- $[ecs-scheduler-and-prefabs#L401|ecs-scheduler-and-prefabs — L401]$ (line 401, col 3, score 0.96)
- $[ecs-scheduler-and-prefabs#L402|ecs-scheduler-and-prefabs — L402]$ (line 402, col 1, score 0.94)
- $[ecs-scheduler-and-prefabs#L402|ecs-scheduler-and-prefabs — L402]$ (line 402, col 3, score 0.94)
- $[ecs-scheduler-and-prefabs#L403|ecs-scheduler-and-prefabs — L403]$ (line 403, col 1, score 0.99)
- $[ecs-scheduler-and-prefabs#L403|ecs-scheduler-and-prefabs — L403]$ (line 403, col 3, score 0.99)
- [JavaScript — L31]$chunks/javascript.md#L31$ (line 31, col 1, score 0.98)
- [JavaScript — L31]$chunks/javascript.md#L31$ (line 31, col 3, score 0.98)
- $[ecs-scheduler-and-prefabs#L404|ecs-scheduler-and-prefabs — L404]$ (line 404, col 1, score 0.98)
- $[ecs-scheduler-and-prefabs#L404|ecs-scheduler-and-prefabs — L404]$ (line 404, col 3, score 0.98)
- $[state-snapshots-api-and-transactional-projector#L347|State Snapshots API and Transactional Projector — L347]$ (line 347, col 1, score 0.98)
- $[state-snapshots-api-and-transactional-projector#L347|State Snapshots API and Transactional Projector — L347]$ (line 347, col 3, score 0.98)
- $[state-snapshots-api-and-transactional-projector#L348|State Snapshots API and Transactional Projector — L348]$ (line 348, col 1, score 0.99)
- $[state-snapshots-api-and-transactional-projector#L348|State Snapshots API and Transactional Projector — L348]$ (line 348, col 3, score 0.99)
- [JavaScript — L32]$chunks/javascript.md#L32$ (line 32, col 1, score 0.98)
- [JavaScript — L32]$chunks/javascript.md#L32$ (line 32, col 3, score 0.98)
- $[sibilant-metacompiler-overview#L100|sibilant-metacompiler-overview — L100]$ (line 100, col 1, score 0.98)
- $[sibilant-metacompiler-overview#L100|sibilant-metacompiler-overview — L100]$ (line 100, col 3, score 0.98)
- $[ecs-scheduler-and-prefabs#L434|ecs-scheduler-and-prefabs — L434]$ (line 434, col 1, score 0.99)
- $[ecs-scheduler-and-prefabs#L434|ecs-scheduler-and-prefabs — L434]$ (line 434, col 3, score 0.99)
- $System Scheduler with Resource-Aware DAG — L426$$system-scheduler-with-resource-aware-dag.md#L426$ (line 426, col 1, score 0.99)
- $System Scheduler with Resource-Aware DAG — L426$$system-scheduler-with-resource-aware-dag.md#L426$ (line 426, col 3, score 0.99)
- $[ecs-scheduler-and-prefabs#L435|ecs-scheduler-and-prefabs — L435]$ (line 435, col 1, score 0.98)
- $[ecs-scheduler-and-prefabs#L435|ecs-scheduler-and-prefabs — L435]$ (line 435, col 3, score 0.98)
- $System Scheduler with Resource-Aware DAG — L427$$system-scheduler-with-resource-aware-dag.md#L427$ (line 427, col 1, score 0.98)
- $System Scheduler with Resource-Aware DAG — L427$$system-scheduler-with-resource-aware-dag.md#L427$ (line 427, col 3, score 0.98)
- $[docs/unique/interop-and-source-maps#L527|Interop and Source Maps — L527]$ (line 527, col 1, score 0.99)
- $[docs/unique/interop-and-source-maps#L527|Interop and Source Maps — L527]$ (line 527, col 3, score 0.99)
- $[lispy-macros-with-syntax-rules#L408|Lispy Macros with syntax-rules — L408]$ (line 408, col 1, score 0.99)
- $[lispy-macros-with-syntax-rules#L408|Lispy Macros with syntax-rules — L408]$ (line 408, col 3, score 0.99)
- $[docs/unique/interop-and-source-maps#L534|Interop and Source Maps — L534]$ (line 534, col 1, score 0.98)
- $[docs/unique/interop-and-source-maps#L534|Interop and Source Maps — L534]$ (line 534, col 3, score 0.98)
- $[set-assignment-in-lisp-ast#L162|set-assignment-in-lisp-ast — L162]$ (line 162, col 1, score 0.98)
- $[set-assignment-in-lisp-ast#L162|set-assignment-in-lisp-ast — L162]$ (line 162, col 3, score 0.98)
- $[docs/unique/eidolon-field-math-foundations#L155|eidolon-field-math-foundations — L155]$ (line 155, col 1, score 0.99)
- $[docs/unique/eidolon-field-math-foundations#L155|eidolon-field-math-foundations — L155]$ (line 155, col 3, score 0.99)
- $[promethean-infrastructure-setup#L610|Promethean Infrastructure Setup — L610]$ (line 610, col 1, score 0.99)
- $[promethean-infrastructure-setup#L610|Promethean Infrastructure Setup — L610]$ (line 610, col 3, score 0.99)
- $[local-only-llm-workflow#L191|Local-Only-LLM-Workflow — L191]$ (line 191, col 1, score 0.98)
- $[local-only-llm-workflow#L191|Local-Only-LLM-Workflow — L191]$ (line 191, col 3, score 0.98)
- $[performance-optimized-polyglot-bridge#L455|Performance-Optimized-Polyglot-Bridge — L455]$ (line 455, col 1, score 0.98)
- $[performance-optimized-polyglot-bridge#L455|Performance-Optimized-Polyglot-Bridge — L455]$ (line 455, col 3, score 0.98)
$$
>>>>>>> stealth/obsidian
$$
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
