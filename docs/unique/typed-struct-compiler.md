---
uuid: 8fd08696-5338-493b-bed5-507f8a6a6ea9
created_at: typed-struct-compiler.md
filename: typed-struct-compiler
title: typed-struct-compiler
description: >-
  A TypeScript library for compiling typed struct schemas into binary layouts
  with alignment, fast pack/unpack operations, and SoA column support. It
  enables type-safe data serialization and zero-copy processing in both Node.js
  and browsers.
tags:
  - typed-struct
  - binary-layout
  - zero-copy
  - array-buffer
  - soa-columns
  - type-inference
  - data-serialization
related_to_uuid:
  - 792a343e-674c-4bb4-8435-b3f8c163349d
  - e4317155-7fa6-44e8-8aee-b72384581790
  - 972c820f-63a8-49c6-831f-013832195478
  - ee4b3631-a745-485b-aff1-2da806cfadfb
  - a28a39dd-8c17-463c-9050-2ffe9b56e8bc
  - f0528a41-be17-4213-b5bc-7d37fcbef0e0
  - 740bbd1c-c039-405c-8a32-4baeddfb5637
  - bb4f4ed0-91f3-488a-9d64-3a33bde77e4e
  - 7a66bc1e-9276-41ce-ac22-fc08926acb2d
  - 0c501d52-ba38-42aa-ad25-2d78425dfaff
  - 06ef038a-e195-49c1-898f-a50cc117c59a
  - c46718fe-73dd-4236-8f1c-f6565da58cc4
  - c0e6ea38-a9a0-4379-aa9c-b634a6591a59
  - fd753d3a-84cb-4bdd-ae93-8c5b09617e3b
  - 31a2df46-9dbc-4066-b3e3-d3e860099fd0
  - 65c145c7-fe3e-4989-9aae-5db39fa0effc
  - 0f203aa7-c96d-4323-9b9e-bbc438966e8c
  - abe9ec8d-5a0f-42c5-b2ab-a2080c86d70c
  - a23de044-17e0-45f0-bba7-d870803cbfed
  - 86ef1f2b-1b3f-4ca7-a88e-b8b52e70ac10
  - 9a1076d6-1aac-497e-bac3-66c9ea09da55
related_to_title:
  - windows-tiling-with-autohotkey
  - TypeScript Patch for Tool Calling Support
  - archetype-ecs
  - Promethean Documentation Pipeline Overview
  - AI-Centric OS with MCP Layer
  - local-offline-model-deployment-strategy
  - heartbeat-fragment-demo
  - chroma-embedding-refactor
  - pm2-orchestration-patterns
  - dynamic-context-model-for-web-components
  - 2d-sandbox-field
  - shared-package-structure
  - board-walk-2025-08-11
  - polyglot-repl-interface-layer
  - field-node-diagram-set
  - event-bus-mvp
  - schema-evolution-workflow
  - RAG UI Panel with Qdrant and PostgREST
  - Komorebi Group Manager
  - promethean-pipelines
  - Stateful Partitions and Rebalancing
references:
  - uuid: 792a343e-674c-4bb4-8435-b3f8c163349d
    line: 78
    col: 0
    score: 0.9
  - uuid: e4317155-7fa6-44e8-8aee-b72384581790
    line: 417
    col: 0
    score: 0.86
  - uuid: 972c820f-63a8-49c6-831f-013832195478
    line: 363
    col: 0
    score: 0.86
  - uuid: e4317155-7fa6-44e8-8aee-b72384581790
    line: 160
    col: 0
    score: 0.86
  - uuid: ee4b3631-a745-485b-aff1-2da806cfadfb
    line: 111
    col: 0
    score: 0.85
  - uuid: a28a39dd-8c17-463c-9050-2ffe9b56e8bc
    line: 77
    col: 0
    score: 0.85
---
Note: Consolidated here → ../notes/js/typed-struct-compiler.md ^ref-78eeedf7-1-0

Ohhh nice—let’s bolt on a **typed struct compiler** that turns declarative schemas into: ^ref-78eeedf7-3-0

* **Binary layouts** with alignment/size/offsets ^ref-78eeedf7-5-0
* **Fast pack/unpack** to/from `ArrayBuffer`/`DataView`
* **Flattened column specs** you can feed straight into the zero-copy worker layer (SoA columns) ^ref-78eeedf7-7-0
* **Type inference** so your objects are fully typed in TS ^ref-78eeedf7-8-0

Drop this in as `shared/js/prom-lib/worker/zero/struct.ts`. It’s dependency-free, Node + browser safe. ^ref-78eeedf7-10-0

---

# Typed Struct Compiler (fixed-size, aligned; scalars + arrays + nested structs)

```ts
// shared/js/prom-lib/worker/zero/struct.ts
// MIT. No deps. Node + browser safe.
//
// Features:
// - Scalars: f32,f64,i8,u8,i16,u16,i32,u32,bool (bool packs as u8 0/1)
// - Arrays: fixed length arrays of any element type
// - Nested structs
// - Alignment: scalar-aligned per-field + struct alignment = max(field align)
// - Endianness configurable (default little-endian)
// - Pack/Unpack (AoS) + Columns spec for SoA (flattened field paths)
// - TS type inference from schema
//
// If you later want bitfields/strings/varlen, we can extend this.

export type Scalar = "f32"|"f64"|"i8"|"u8"|"i16"|"u16"|"i32"|"u32"|"bool";

export type ScalarInfo = {
  kind: "scalar";
  t: Scalar;
};
export type ArrayInfo = {
  kind: "array";
  elem: TypeInfo;
  len: number; // fixed length
};
export type StructInfo = {
  kind: "struct";
  fields: Record<string, TypeInfo>;
};
export type PadInfo = {
  kind: "pad";
  bytes: number;
};

export type TypeInfo = ScalarInfo | ArrayInfo | StructInfo | PadInfo;

// ---------- Schema DSL ----------
export const S = {
  f32: (): ScalarInfo => ({ kind: "scalar", t: "f32" }),
  f64: (): ScalarInfo => ({ kind: "scalar", t: "f64" }),
  i8:  (): ScalarInfo => ({ kind: "scalar", t: "i8" }),
  u8:  (): ScalarInfo => ({ kind: "scalar", t: "u8" }),
  i16: (): ScalarInfo => ({ kind: "scalar", t: "i16" }),
  u16: (): ScalarInfo => ({ kind: "scalar", t: "u16" }),
  i32: (): ScalarInfo => ({ kind: "scalar", t: "i32" }),
  u32: (): ScalarInfo => ({ kind: "scalar", t: "u32" }),
  bool: (): ScalarInfo => ({ kind: "scalar", t: "bool" }),

  array: (elem: TypeInfo, len: number): ArrayInfo => ({ kind: "array", elem, len }),
  struct: (fields: Record<string, TypeInfo>): StructInfo => ({ kind: "struct", fields }),
  pad: (bytes: number): PadInfo => ({ kind: "pad", bytes }),
};

// ---------- Type inference (TS) ----------
export type Infer<T extends TypeInfo> =
  T extends ScalarInfo ? (
    T["t"] extends "bool" ? boolean :
    T["t"] extends "f32"|"f64" ? number :
    T["t"] extends "i8"|"u8"|"i16"|"u16"|"i32"|"u32" ? number :
    never
  ) :
  T extends ArrayInfo ? Infer<T["elem"]>[] :
  T extends StructInfo ? { [K in keyof T["fields"]]: Infer<T["fields"][K]> } :
  T extends PadInfo ? never :
  never;

// ---------- Size/align ----------
const SCALAR_SIZE: Record<Exclude<Scalar,"bool">, number> = {
  f32: 4, f64: 8, i8: 1, u8: 1, i16: 2, u16: 2, i32: 4, u32: 4
};
function sizeOf(t: TypeInfo): number {
  switch (t.kind) {
    case "scalar": return t.t === "bool" ? 1 : SCALAR_SIZE[t.t as Exclude<Scalar,"bool">];
    case "pad":    return t.bytes;
    case "array":  return t.len * sizeOf(t.elem);
    case "struct": {
      let off = 0, align = 1;
      for (const [_, f] of Object.entries(t.fields)) {
        const a = alignOf(f);
        off = alignUp(off, a);
        off += sizeOf(f);
        align = Math.max(align, a);
      }
      return alignUp(off, align);
    }
  }
}
function alignOf(t: TypeInfo): number {
  switch (t.kind) {
    case "scalar": return t.t === "bool" ? 1 : SCALAR_SIZE[t.t as Exclude<Scalar,"bool">];
    case "pad":    return 1;
    case "array":  return alignOf(t.elem);
    case "struct": {
      let a = 1;
      for (const f of Object.values(t.fields)) a = Math.max(a, alignOf(f));
      return a;
    }
  }
}
function alignUp(x: number, a: number) { return (x + (a-1)) & ~(a-1); }

// ---------- Compiler ----------
export type FieldLayout = {
  path: string;     // flattened path, e.g. "pos.x" or "vel[3].y"
  offset: number;
  size: number;
  align: number;
  info: TypeInfo;
};

export type StructLayout<T> = {
  size: number;
  align: number;
  fields: FieldLayout[];
  // fast pack/unpack
  read(view: DataView, offset?: number, littleEndian?: boolean): T;
  write(view: DataView, value: T, offset?: number, littleEndian?: boolean): void;
  // Helpers
  flattenColumns(prefixToUnderscore?: boolean): Record<string, Scalar>; // scalars only, flattened
};

export function compileStruct<T extends StructInfo>(schema: T): StructLayout<Infer<T>> {
  const fields: FieldLayout[] = [];
  let offset = 0, maxAlign = 1;

  const visit = (info: TypeInfo, base: string) => {
    if (info.kind === "pad") {
      offset += info.bytes; // explicit pad (no alignment)
      return;
    }
    const a = alignOf(info);
    offset = alignUp(offset, a);
    maxAlign = Math.max(maxAlign, a);

    if (info.kind === "scalar") {
      const sz = sizeOf(info);
      fields.push({ path: base, offset, size: sz, align: a, info });
      offset += sz;
      return;
    }
    if (info.kind === "array") {
      const elemSize = sizeOf(info.elem);
      const elemAlign = alignOf(info.elem);
      for (let i=0;i<info.len;i++) {
        offset = alignUp(offset, elemAlign);
        const start = offset;
        visit(info.elem, `${base}[${i}]`);
        // ensure fixed stride
        offset = start + elemSize;
      }
      return;
    }
    if (info.kind === "struct") {
      const start = offset;
      let innerAlign = 1;
      for (const [k, child] of Object.entries(info.fields)) {
        const a2 = alignOf(child);
        offset = alignUp(offset, a2);
        innerAlign = Math.max(innerAlign, a2);
        visit(child, base ? `${base}.${k}` : k);
      }
      // pad struct to its alignment
      offset = alignUp(offset, innerAlign);
      maxAlign = Math.max(maxAlign, innerAlign);
      return;
    }
  };

  // assign offsets in order
  for (const [k, child] of Object.entries(schema.fields)) {
    const a = alignOf(child);
    offset = alignUp(offset, a);
    visit(child, k);
  }
  const total = alignUp(offset, maxAlign);

  // Runtime read/write using DataView
  function read(view: DataView, off = 0, le = true): any {
    const out: any = {};
    // we’ll lazily build nested objects on demand
    const ensurePath = (p: string): { parent: any, key: string } => {
      const parts = p.split("."); // might contain [i] segments—handle later
      let cur = out;
      for (let i=0;i<parts.length;i++) {
        const seg = parts[i];
        // split idx if array notation present
        const m = seg.match(/^([^\[]+)(\[(\d+)\])?$/);
        if (!m) continue;
        const key = m[1];
        const hasIdx = !!m[3];
        if (i === parts.length - 1 && !hasIdx) return { parent: cur, key };
        if (!(key in cur)) cur[key] = hasIdx ? [] : {};
        cur = cur[key];
        if (hasIdx) {
          const idx = Number(m[3]);
          if (!Array.isArray(cur)) cur = cur[key] = [];
          if (!cur[idx]) cur[idx] = {};
          if (i === parts.length - 1) return { parent: cur, key: String(idx) };
          cur = cur[idx];
        }
      }
      // fallback, though we should have returned
      return { parent: out, key: p };
    };

    for (const f of fields) {
      if (f.info.kind !== "scalar") continue; // only scalars produce values
      const addr = off + f.offset;
      const { parent, key } = ensurePath(f.path);
      parent[key] = readScalar(view, addr, f.info.t, le);
    }
    return out;
  }

  function write(view: DataView, value: any, off = 0, le = true) {
    // Walk all scalar leaves and write from 'value' by path
    for (const f of fields) {
      if (f.info.kind !== "scalar") continue;
      const addr = off + f.offset;
      const v = getByPath(value, f.path);
      writeScalar(view, addr, f.info.t, v ?? 0, le);
    }
  }

  function flattenColumns(prefixToUnderscore = true): Record<string, Scalar> {
    const out: Record<string, Scalar> = {};
    for (const f of fields) {
      if (f.info.kind !== "scalar") continue;
      const name = prefixToUnderscore ? f.path.replace(/\./g, "_").replace(/\[/g, "_").replace(/\]/g, "") : f.path;
      out[name] = f.info.t;
    }
    return out;
  }

  return { size: total, align: maxAlign, fields, read, write, flattenColumns };
}

// ---------- Scalar R/W ----------
function readScalar(view: DataView, addr: number, t: Scalar, le: boolean): number|boolean {
  switch (t) {
    case "f32": return view.getFloat32(addr, le);
    case "f64": return view.getFloat64(addr, le);
    case "i8":  return view.getInt8(addr);
    case "u8":  return view.getUint8(addr);
    case "i16": return view.getInt16(addr, le);
    case "u16": return view.getUint16(addr, le);
    case "i32": return view.getInt32(addr, le);
    case "u32": return view.getUint32(addr, le);
    case "bool":return view.getUint8(addr) !== 0;
  }
}
function writeScalar(view: DataView, addr: number, t: Scalar, v: any, le: boolean) {
  switch (t) {
    case "f32": view.setFloat32(addr, +v, le); break;
    case "f64": view.setFloat64(addr, +v, le); break;
    case "i8":  view.setInt8(addr, v|0); break;
    case "u8":  view.setUint8(addr, v>>>0 & 0xff); break;
    case "i16": view.setInt16(addr, v|0, le); break;
    case "u16": view.setUint16(addr, v>>>0 & 0xffff, le); break;
    case "i32": view.setInt32(addr, v|0, le); break;
    case "u32": view.setUint32(addr, v>>>0, le); break;
    case "bool":view.setUint8(addr, v ? 1 : 0); break;
  }
}

// ---------- Utils ----------
function getByPath(obj: any, path: string): any {
  const parts = path.split(".");
  let cur = obj;
  for (const seg of parts) {
    const m = seg.match(/^([^\[]+)(\[(\d+)\])?$/);
    if (!m) return undefined;
    const key = m[1];
    if (cur == null) return undefined;
    cur = cur[key];
    if (m[3]) cur = cur?.[Number(m[3])];
  }
  return cur;
}
```
^ref-78eeedf7-16-0

---

# How you use it

## 1) Define schemas
 ^ref-78eeedf7-304-0
```ts
import { S, compileStruct, type Infer } from "./struct";

// Basic
const Position = S.struct({ x: S.f32(), y: S.f32() });
type Position = Infer<typeof Position>; // { x:number; y:number }

// Nested + arrays
const Transform = S.struct({
  pos: Position,
  rot: S.f32(),
  scale: S.f32(),
});

const Trail = S.struct({
  pts: S.array(Position, 8),   // fixed 8 points
  active: S.bool(),
});
^ref-78eeedf7-304-0
```

## 2) Compile, pack, unpack ^ref-78eeedf7-326-0

```ts
const Pos = compileStruct(Position);
console.log(Pos.size, Pos.align); // 8, 4

const buf = new ArrayBuffer(Pos.size);
const view = new DataView(buf);

Pos.write(view, { x: 1.5, y: -2.25 });
^ref-78eeedf7-326-0
const obj = Pos.read(view); // -> { x:1.5, y:-2.25 }
```
 ^ref-78eeedf7-339-0
## 3) Get flattened SoA columns for zero-copy workers

```ts
// For the physics zero-copy snapshot, flatten nested fields into column names:
const Bullet = S.struct({ pos: Position, vel: Position, life: S.f32() });
const B = compileStruct(Bullet);

// columnsSpec matches the earlier zero-copy "FieldSpec" (field -> scalar type)
const columnsSpec = B.flattenColumns(true); 
// => { pos_x:"f32", pos_y:"f32", vel_x:"f32", vel_y:"f32", life:"f32" }

// Build a CompLayout for cid=YourComponent.id:
import type { CompLayout } from "./layout";
function toCompLayout(cid: number): CompLayout {
^ref-78eeedf7-339-0
  return { cid, fields: columnsSpec }; ^ref-78eeedf7-355-0
}
```
^ref-78eeedf7-357-0 ^ref-78eeedf7-358-0

Then plug that `CompLayout` into the **zero-copy snapshot builder** you already have:

```ts
// offload.zeroCopy.build:
zeroCopy: {
  build: () => ({
    types: { [CPos.id]: CPos, [CVel.id]: CVel, [CBullet.id]: CBullet },
    layouts: [
      { cid: CPos.id, fields: compileStruct(Position).flattenColumns(true) },
      { cid: CVel.id, fields: compileStruct(Position).flattenColumns(true) },
      { cid: CBullet.id, fields: compileStruct(Bullet).flattenColumns(true) },
^ref-78eeedf7-357-0
    ]
  })
}
```
 ^ref-78eeedf7-375-0 ^ref-78eeedf7-376-0
--- ^ref-78eeedf7-376-0 ^ref-78eeedf7-377-0
 ^ref-78eeedf7-377-0 ^ref-78eeedf7-378-0
# Notes / Extension ideas ^ref-78eeedf7-378-0
 ^ref-78eeedf7-380-0
* Current implementation is **fixed-size only** (great for hot loops + SAB). If you need **varlen strings/blobs**, we’ll add a sidecar table (offset/length pairs) and a pool. ^ref-78eeedf7-380-0
* **Bitfields**: easy to add by introducing a `S.bits({field:nBits,...}, base: "u32")`.
* **Codegen**: for *absurd* speed, we can JIT `read/write` into a tiny function via `new Function` (still pure TS now for portability).
* **Endian**: defaults to little-endian; pass `le=false` to `read/write` if you target BE data.
 ^ref-78eeedf7-384-0
If you want, I can add a helper that takes a **Zod schema** and emits this struct schema automatically (mapping `z.number()` → `f32`/`f64`, tuple to fixed array, object to struct), so your schema registry doubles as your binary layout source of truth.
   maxAlign = Math.max(maxAlign, a);

    if (info.kind === "scalar") {
      const sz = sizeOf(info);
      fields.push({ path: base, offset, size: sz, align: a, info });
      offset += sz;
      return;
    }
    if (info.kind === "array") {
      const elemSize = sizeOf(info.elem);
      const elemAlign = alignOf(info.elem);
      for (let i=0;i<info.len;i++) {
        offset = alignUp(offset, elemAlign);
        const start = offset;
        visit(info.elem, `${base}[${i}]`);
        // ensure fixed stride
        offset = start + elemSize;
      }
      return;
    }
    if (info.kind === "struct") {
      const start = offset;
      let innerAlign = 1;
      for (const [k, child] of Object.entries(info.fields)) {
        const a2 = alignOf(child);
        offset = alignUp(offset, a2);
        innerAlign = Math.max(innerAlign, a2);
        visit(child, base ? `${base}.${k}` : k);
      }
      // pad struct to its alignment
      offset = alignUp(offset, innerAlign);
      maxAlign = Math.max(maxAlign, innerAlign);
      return;
    }
  };

  // assign offsets in order
  for (const [k, child] of Object.entries(schema.fields)) {
    const a = alignOf(child);
    offset = alignUp(offset, a);
    visit(child, k);
  }
  const total = alignUp(offset, maxAlign);

  // Runtime read/write using DataView
  function read(view: DataView, off = 0, le = true): any {
    const out: any = {};
    // we’ll lazily build nested objects on demand
    const ensurePath = (p: string): { parent: any, key: string } => {
      const parts = p.split("."); // might contain [i] segments—handle later
      let cur = out;
      for (let i=0;i<parts.length;i++) {
        const seg = parts[i];
        // split idx if array notation present
        const m = seg.match(/^([^\[]+)(\[(\d+)\])?$/);
        if (!m) continue;
        const key = m[1];
        const hasIdx = !!m[3];
        if (i === parts.length - 1 && !hasIdx) return { parent: cur, key };
        if (!(key in cur)) cur[key] = hasIdx ? [] : {};
        cur = cur[key];
        if (hasIdx) {
          const idx = Number(m[3]);
          if (!Array.isArray(cur)) cur = cur[key] = [];
          if (!cur[idx]) cur[idx] = {};
          if (i === parts.length - 1) return { parent: cur, key: String(idx) };
          cur = cur[idx];
        }
      }
      // fallback, though we should have returned
      return { parent: out, key: p };
    };

    for (const f of fields) {
      if (f.info.kind !== "scalar") continue; // only scalars produce values
      const addr = off + f.offset;
      const { parent, key } = ensurePath(f.path);
      parent[key] = readScalar(view, addr, f.info.t, le);
    }
    return out;
  }

  function write(view: DataView, value: any, off = 0, le = true) {
    // Walk all scalar leaves and write from 'value' by path
    for (const f of fields) {
      if (f.info.kind !== "scalar") continue;
      const addr = off + f.offset;
      const v = getByPath(value, f.path);
      writeScalar(view, addr, f.info.t, v ?? 0, le);
    }
  }

  function flattenColumns(prefixToUnderscore = true): Record<string, Scalar> {
    const out: Record<string, Scalar> = {};
    for (const f of fields) {
      if (f.info.kind !== "scalar") continue;
      const name = prefixToUnderscore ? f.path.replace(/\./g, "_").replace(/\[/g, "_").replace(/\]/g, "") : f.path;
      out[name] = f.info.t;
    }
    return out;
  }

  return { size: total, align: maxAlign, fields, read, write, flattenColumns };
}

// ---------- Scalar R/W ----------
function readScalar(view: DataView, addr: number, t: Scalar, le: boolean): number|boolean {
  switch (t) {
    case "f32": return view.getFloat32(addr, le);
    case "f64": return view.getFloat64(addr, le);
    case "i8":  return view.getInt8(addr);
    case "u8":  return view.getUint8(addr);
    case "i16": return view.getInt16(addr, le);
    case "u16": return view.getUint16(addr, le);
    case "i32": return view.getInt32(addr, le);
    case "u32": return view.getUint32(addr, le);
    case "bool":return view.getUint8(addr) !== 0;
  }
}
function writeScalar(view: DataView, addr: number, t: Scalar, v: any, le: boolean) {
  switch (t) {
    case "f32": view.setFloat32(addr, +v, le); break;
    case "f64": view.setFloat64(addr, +v, le); break;
    case "i8":  view.setInt8(addr, v|0); break;
    case "u8":  view.setUint8(addr, v>>>0 & 0xff); break;
    case "i16": view.setInt16(addr, v|0, le); break;
    case "u16": view.setUint16(addr, v>>>0 & 0xffff, le); break;
    case "i32": view.setInt32(addr, v|0, le); break;
    case "u32": view.setUint32(addr, v>>>0, le); break;
    case "bool":view.setUint8(addr, v ? 1 : 0); break;
  }
}

// ---------- Utils ----------
function getByPath(obj: any, path: string): any {
  const parts = path.split(".");
  let cur = obj;
  for (const seg of parts) {
    const m = seg.match(/^([^\[]+)(\[(\d+)\])?$/);
    if (!m) return undefined;
    const key = m[1];
    if (cur == null) return undefined;
    cur = cur[key];
    if (m[3]) cur = cur?.[Number(m[3])];
  }
  return cur;
}
```
^ref-78eeedf7-16-0

---

# How you use it

## 1) Define schemas
 ^ref-78eeedf7-304-0
```ts
import { S, compileStruct, type Infer } from "./struct";

// Basic
const Position = S.struct({ x: S.f32(), y: S.f32() });
type Position = Infer<typeof Position>; // { x:number; y:number }

// Nested + arrays
const Transform = S.struct({
  pos: Position,
  rot: S.f32(),
  scale: S.f32(),
});

const Trail = S.struct({
  pts: S.array(Position, 8),   // fixed 8 points
  active: S.bool(),
});
^ref-78eeedf7-304-0
```

## 2) Compile, pack, unpack ^ref-78eeedf7-326-0

```ts
const Pos = compileStruct(Position);
console.log(Pos.size, Pos.align); // 8, 4

const buf = new ArrayBuffer(Pos.size);
const view = new DataView(buf);

Pos.write(view, { x: 1.5, y: -2.25 });
^ref-78eeedf7-326-0
const obj = Pos.read(view); // -> { x:1.5, y:-2.25 }
```
 ^ref-78eeedf7-339-0
## 3) Get flattened SoA columns for zero-copy workers

```ts
// For the physics zero-copy snapshot, flatten nested fields into column names:
const Bullet = S.struct({ pos: Position, vel: Position, life: S.f32() });
const B = compileStruct(Bullet);

// columnsSpec matches the earlier zero-copy "FieldSpec" (field -> scalar type)
const columnsSpec = B.flattenColumns(true); 
// => { pos_x:"f32", pos_y:"f32", vel_x:"f32", vel_y:"f32", life:"f32" }

// Build a CompLayout for cid=YourComponent.id:
import type { CompLayout } from "./layout";
function toCompLayout(cid: number): CompLayout {
^ref-78eeedf7-339-0
  return { cid, fields: columnsSpec }; ^ref-78eeedf7-355-0
}
```
^ref-78eeedf7-357-0 ^ref-78eeedf7-358-0

Then plug that `CompLayout` into the **zero-copy snapshot builder** you already have:

```ts
// offload.zeroCopy.build:
zeroCopy: {
  build: () => ({
    types: { [CPos.id]: CPos, [CVel.id]: CVel, [CBullet.id]: CBullet },
    layouts: [
      { cid: CPos.id, fields: compileStruct(Position).flattenColumns(true) },
      { cid: CVel.id, fields: compileStruct(Position).flattenColumns(true) },
      { cid: CBullet.id, fields: compileStruct(Bullet).flattenColumns(true) },
^ref-78eeedf7-357-0
    ]
  })
}
```
 ^ref-78eeedf7-375-0 ^ref-78eeedf7-376-0
--- ^ref-78eeedf7-376-0 ^ref-78eeedf7-377-0
 ^ref-78eeedf7-377-0 ^ref-78eeedf7-378-0
# Notes / Extension ideas ^ref-78eeedf7-378-0
 ^ref-78eeedf7-380-0
* Current implementation is **fixed-size only** (great for hot loops + SAB). If you need **varlen strings/blobs**, we’ll add a sidecar table (offset/length pairs) and a pool. ^ref-78eeedf7-380-0
* **Bitfields**: easy to add by introducing a `S.bits({field:nBits,...}, base: "u32")`.
* **Codegen**: for *absurd* speed, we can JIT `read/write` into a tiny function via `new Function` (still pure TS now for portability).
* **Endian**: defaults to little-endian; pass `le=false` to `read/write` if you target BE data.
 ^ref-78eeedf7-384-0
If you want, I can add a helper that takes a **Zod schema** and emits this struct schema automatically (mapping `z.number()` → `f32`/`f64`, tuple to fixed array, object to struct), so your schema registry doubles as your binary layout source of truth.
