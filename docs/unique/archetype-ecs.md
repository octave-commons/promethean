---
uuid: 8f4c1e86-1236-4936-84ca-6ed7082af6b7
created_at: 2025.08.08.21.08.70.md
filename: archetype-ecs
description: >-
  A lightweight TypeScript ECS implementation with 64-component bitmasks, SoA
  storage, and efficient query handling for real-time applications.
tags:
  - ecs
  - typescript
  - archetype
  - soa
  - query
  - component
  - entity
related_to_title:
  - ecs-scheduler-and-prefabs
  - System Scheduler with Resource-Aware DAG
  - JavaScript
  - Unique Info Dump Index
  - Language-Agnostic Mirror System
  - graph-ds
  - ecs-offload-workers
  - typed-struct-compiler
  - Chroma Toolkit Consolidation Plan
  - eidolon-field-math-foundations
  - aionian-circuit-math
  - Diagrams
  - DSL
  - Local-Only-LLM-Workflow
  - Interop and Source Maps
  - Lispy Macros with syntax-rules
  - js-to-lisp-reverse-compiler
  - Lisp-Compiler-Integration
  - Promethean Infrastructure Setup
  - Performance-Optimized-Polyglot-Bridge
related_to_uuid:
  - c62a1815-c43b-4a3b-88e6-d7fa008a155e
  - ba244286-4e84-425b-8bf6-b80c4eb783fc
  - c1618c66-f73a-4e04-9bfa-ef38755f7acc
  - 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
  - d2b3628c-6cad-4664-8551-94ef8280851d
  - 6620e2f2-de6d-45d8-a722-5d26e160b370
  - 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
  - 78eeedf7-75bc-4692-a5a7-bb6857270621
  - 5020e892-8f18-443a-b707-6d0f3efcfe22
  - 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
  - f2d83a77-7f86-4c56-8538-1350167a0c6c
  - 45cd25b5-ed36-49ab-82c8-10d0903e34db
  - e87bc036-1570-419e-a558-f45b9c0db698
  - 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
  - cdfac40c-00e4-458f-96a7-4c37d0278731
  - cbfe3513-6a4a-4d2e-915d-ddfab583b2de
  - 58191024-d04a-4520-8aae-a18be7b94263
  - cfee6d36-b9f5-4587-885a-cdfddb4f054e
  - 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
  - f5579967-762d-4cfd-851e-4f71b4cb77a1
references:
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 246
    col: 1
    score: 0.87
  - uuid: ba244286-4e84-425b-8bf6-b80c4eb783fc
    line: 244
    col: 1
    score: 0.87
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 171
    col: 1
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 171
    col: 3
    score: 1
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 14
    col: 1
    score: 1
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 14
    col: 3
    score: 1
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 454
    col: 1
    score: 1
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 454
    col: 3
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 128
    col: 1
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 128
    col: 3
    score: 1
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 455
    col: 1
    score: 1
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 455
    col: 3
    score: 1
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 387
    col: 1
    score: 1
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 387
    col: 3
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 130
    col: 1
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 130
    col: 3
    score: 1
  - uuid: 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
    line: 179
    col: 1
    score: 1
  - uuid: 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
    line: 179
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
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 63
    col: 1
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 63
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
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 12
    col: 1
    score: 1
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 12
    col: 3
    score: 1
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 521
    col: 1
    score: 1
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 521
    col: 3
    score: 1
  - uuid: 58191024-d04a-4520-8aae-a18be7b94263
    line: 413
    col: 1
    score: 1
  - uuid: 58191024-d04a-4520-8aae-a18be7b94263
    line: 413
    col: 3
    score: 1
  - uuid: cfee6d36-b9f5-4587-885a-cdfddb4f054e
    line: 542
    col: 1
    score: 1
  - uuid: cfee6d36-b9f5-4587-885a-cdfddb4f054e
    line: 542
    col: 3
    score: 1
  - uuid: cbfe3513-6a4a-4d2e-915d-ddfab583b2de
    line: 405
    col: 1
    score: 1
  - uuid: cbfe3513-6a4a-4d2e-915d-ddfab583b2de
    line: 405
    col: 3
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 388
    col: 1
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 388
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
  - uuid: 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
    line: 177
    col: 1
    score: 1
  - uuid: 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
    line: 177
    col: 3
    score: 1
  - uuid: ba244286-4e84-425b-8bf6-b80c4eb783fc
    line: 399
    col: 1
    score: 0.98
  - uuid: ba244286-4e84-425b-8bf6-b80c4eb783fc
    line: 399
    col: 3
    score: 0.98
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 28
    col: 1
    score: 0.98
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 28
    col: 3
    score: 0.98
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 163
    col: 1
    score: 0.98
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 163
    col: 3
    score: 0.98
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 609
    col: 1
    score: 0.98
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 609
    col: 3
    score: 0.98
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 611
    col: 1
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 611
    col: 3
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 156
    col: 1
    score: 0.99
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 156
    col: 3
    score: 0.99
  - uuid: 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
    line: 192
    col: 1
    score: 0.99
  - uuid: 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
    line: 192
    col: 3
    score: 0.99
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 456
    col: 1
    score: 0.99
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 456
    col: 3
    score: 0.99
---
Note: Consolidated here → ../notes/js/archetype-ecs.md

Heck yes—here’s a **small but legit archetype-based ECS** you can drop in as `shared/js/prom-lib/ds/ecs.ts`. It’s fast enough for real work: 64-component bitmasks (bigint), archetype tables with SoA storage, add/remove in O(1), queries with `all/any/none`, a `CommandBuffer` for safe structural changes, “changed since last tick” flags, and a tiny scheduler.

# ECS (TypeScript)

```ts
// shared/js/prom-lib/ds/ecs.ts
// MIT. Zero deps. Archetype ECS with 64-bit signature mask.
// NOTE: 64 components max (extend to 128+ via two bigints if needed).

export type Entity = number;       // 32-bit index, versioned via generations[]
export type ComponentId = number;

const MAX_COMPONENTS = 64;

export interface ComponentSpec<T> {
  name: string;
  defaults?: () => T;            // create default component payload
  onAdd?: (w: World, e: Entity, v: T) => void;
  onRemove?: (w: World, e: Entity, v: T) => void;
}

export interface ComponentType<T> extends ComponentSpec<T> {
  id: ComponentId;               // 0..63
  mask: bigint;                  // 1n << id
}

export type Query = {
  all?: bigint;                  // must have all bits
  any?: bigint;                  // must have at least one
  none?: bigint;                 // must have none
  changed?: bigint;              // at least one changed since last tick
};

type Column = any[];             // SoA column per component id
type Edge = Map<ComponentId, Archetype>; // add/remove graph edges for fast moves

class Archetype {
  mask: bigint;
  entities: Entity[] = [];
  // per component id -> column array
  columns: Map<ComponentId, Column> = new Map();
  addEdges: Edge = new Map();    // if you add comp X, go to archetype Y
  rmEdges: Edge = new Map();     // if you remove comp X, go to archetype Z
  // changed flags per comp id (bitset of rows changed in this tick)
  // For simplicity we track "row touched this tick" as a sparse Set per comp id.
  changed: Map<ComponentId, Set<number>> = new Map();

  constructor(mask: bigint) { this.mask = mask; }

  ensureColumn(cid: ComponentId) {
    if (!this.columns.has(cid)) this.columns.set(cid, []);
    if (!this.changed.has(cid)) this.changed.set(cid, new Set());
  }
}

function hasAll(mask: bigint, all: bigint)   { return (mask & all) === all; }
function hasAny(mask: bigint, any: bigint)   { return any === 0n ? true : (mask & any) !== 0n; }
function hasNone(mask: bigint, none: bigint) { return (mask & none) === 0n; }

export class World {
  // entity bookkeeping
  private generations: number[] = [];      // version per index
  private freeList: number[] = [];         // recycled indices
  private alive = new Set<Entity>();       // quick existence check

  // entity location
  private loc: { arch: Archetype; row: number }[] = []; // by entity index

  // components
  private comps: (ComponentType<any> | null)[] = Array(MAX_COMPONENTS).fill(null);
  private nextCompId = 0;

  // archetypes by mask
  private archetypes = new Map<bigint, Archetype>();
  private emptyArch = this.getOrCreateArchetype(0n);

  // temp: per-tick bookkeeping
  private _inTick = false;

  // === Component registration ===
  defineComponent<T>(spec: ComponentSpec<T>): ComponentType<T> {
    if (this.nextCompId >= MAX_COMPONENTS) throw new Error(`Max ${MAX_COMPONENTS} components reached`);
    const id = this.nextCompId++;
    const type: ComponentType<T> = { ...spec, id, mask: 1n << BigInt(id) };
    this.comps[id] = type;
    // ensure add/remove edges exist for empty archetype lazily
    return type;
  }

  // === Entities ===
  createEntity(init?: Record<ComponentId, any> | bigint): Entity {
    // allocate entity id
    const idx = this.freeList.length ? (this.freeList.pop() as number) : this.generations.length;
    const gen = (this.generations[idx] ?? 0) & 0xffff;
    this.generations[idx] = gen;
    const e = (gen << 16) | idx;
    this.alive.add(e);

    // place in empty archetype first
    this.loc[idx] = this.addRow(this.emptyArch, e);

    // attach initial components
    if (typeof init === "bigint") {
      // mask-only init: fill with defaults
      for (let cid=0; cid<this.nextCompId; cid++) {
        const m = 1n << BigInt(cid);
        if ((init & m) !== 0n) {
          const ct = this.comps[cid]!;
          this.addComponent(e, ct, ct.defaults ? ct.defaults() : undefined);
        }
      }
    } else if (init) {
      for (const k in init) {
        const cid = Number(k);
        const ct = this.comps[cid];
        if (!ct) throw new Error(`Unknown component id ${cid}`);
        this.addComponent(e, ct, init[cid]);
      }
    }
    return e;
  }

  destroyEntity(e: Entity): void {
    this.requireAlive(e);
    const { arch, row } = this.loc[e & 0xffff];
    // call onRemove hooks for all comps present
    for (let cid=0; cid<this.nextCompId; cid++) {
      const bit = 1n << BigInt(cid);
      if ((arch.mask & bit) !== 0n) {
        const v = arch.columns.get(cid)![row];
        this.comps[cid]!.onRemove?.(this, e, v);
      }
    }
    this.removeRow(arch, row);
    // retire entity
    const idx = e & 0xffff;
    const gen = (this.generations[idx] ?? 0) + 1;
    this.generations[idx] = gen;
    this.alive.delete(e);
    this.freeList.push(idx);
  }

  isAlive(e: Entity): boolean {
    const idx = e & 0xffff, gen = e >>> 16;
    return this.generations[idx] === gen && this.alive.has(e);
  }

  // === Components ops ===
  addComponent<T>(e: Entity, ct: ComponentType<T>, value?: T): void {
    this.requireAlive(e);
    const idx = e & 0xffff;
    const from = this.loc[idx].arch;
    if ((from.mask & ct.mask) !== 0n) {
      // already has: set value + mark changed
      const row = this.loc[idx].row;
      from.columns.get(ct.id)![row] = value ?? from.columns.get(ct.id)![row];
      from.changed.get(ct.id)!.add(row);
      return;
    }
    // move to new archetype with component added
    const to = this.nextArchetype(from, ct.id, true);
    const oldRow = this.loc[idx].row;
    const payloads: Record<number, any> = {};
    // carry over existing columns
    for (const [cid, col] of from.columns) payloads[cid] = col[oldRow];
    // new comp value (or default)
    payloads[ct.id] = value ?? ct.defaults?.();
    this.move(e, from, oldRow, to, payloads);
    ct.onAdd?.(this, e, payloads[ct.id]);
  }

  removeComponent<T>(e: Entity, ct: ComponentType<T>): void {
    this.requireAlive(e);
    const idx = e & 0xffff;
    const from = this.loc[idx].arch;
    if ((from.mask & ct.mask) === 0n) return; // nothing to do
    const to = this.nextArchetype(from, ct.id, false);
    const oldRow = this.loc[idx].row;
    const payloads: Record<number, any> = {};
    // carry over existing columns except the removed one
    for (const [cid, col] of from.columns) if (cid !== ct.id) payloads[cid] = col[oldRow];
    const oldVal = from.columns.get(ct.id)![oldRow];
    this.move(e, from, oldRow, to, payloads);
    ct.onRemove?.(this, e, oldVal);
  }

  get<T>(e: Entity, ct: ComponentType<T>): T | undefined {
    if (!this.isAlive(e)) return undefined;
    const { arch, row } = this.loc[e & 0xffff];
    if ((arch.mask & ct.mask) === 0n) return undefined;
    return arch.columns.get(ct.id)![row];
  }

  set<T>(e: Entity, ct: ComponentType<T>, value: T): void {
    this.requireAlive(e);
    const { arch, row } = this.loc[e & 0xffff];
    if ((arch.mask & ct.mask) === 0n) throw new Error(`entity lacks component '${ct.name}'`);
    arch.columns.get(ct.id)![row] = value;
    arch.changed.get(ct.id)!.add(row);
  }

  has(e: Entity, ct: ComponentType<any>): boolean {
    if (!this.isAlive(e)) return false;
    const { arch } = this.loc[e & 0xffff];
    return (arch.mask & ct.mask) !== 0n;
  }

  // === Query + iteration ===
  // Build a query mask set: pass ComponentType(s) for all/any/none/changed
  makeQuery(opts: { all?: ComponentType<any>[]; any?: ComponentType<any>[]; none?: ComponentType<any>[]; changed?: ComponentType<any>[] }): Query {
    const bit = (arr?: ComponentType<any>[]) => (arr && arr.length ? arr.map(c=>c.mask).reduce((a,b)=>a|b, 0n) : 0n);
    return { all: bit(opts.all), any: bit(opts.any), none: bit(opts.none), changed: bit(opts.changed) };
  }

  // Iterate matching entities. Returns generator of (e, getters) tuples to keep it ergonomic.
  *iter<T1=unknown,T2=unknown,T3=unknown>(q: Query, c1?: ComponentType<T1>, c2?: ComponentType<T2>, c3?: ComponentType<T3>):
    IterableIterator<[Entity, (ct: ComponentType<any>) => any, T1?, T2?, T3?]> {
    for (const arch of this.archetypes.values()) {
      const m = arch.mask;
      if (q.all && !hasAll(m, q.all)) continue;
      if (q.any && !hasAny(m, q.any)) continue;
      if (q.none && !hasNone(m, q.none)) continue;
      const rows = arch.entities.length;
      const needChanged = q.changed && q.changed !== 0n;
      for (let row=0; row<rows; row++) {
        if (needChanged) {
          // require at least one of the 'changed' components touched this tick
          let ok = false;
          for (let cid=0; cid<this.nextCompId; cid++) {
            const bit = 1n << BigInt(cid);
            if ((q.changed! & bit) !== 0n) {
              if (arch.changed.get(cid)?.has(row)) { ok = true; break; }
            }
          }
          if (!ok) continue;
        }
        const e = arch.entities[row];
        const get = (ct: ComponentType<any>) => arch.columns.get(ct.id)![row];
        const v1 = c1 ? arch.columns.get(c1.id)![row] : undefined;
        const v2 = c2 ? arch.columns.get(c2.id)![row] : undefined;
        const v3 = c3 ? arch.columns.get(c3.id)![row] : undefined;
        yield [e, get, v1 as any, v2 as any, v3 as any];
      }
    }
  }

  // === Ticking & command buffers ===
  beginTick(): CommandBuffer {
    if (this._inTick) throw new Error("nested tick not allowed");
    this._inTick = true;
    // clear 'changed' flags at start of tick
    for (const a of this.archetypes.values()) for (const s of a.changed.values()) s.clear();
    return new CommandBuffer(this);
  }

  endTick(): void {
    if (!this._inTick) return;
    this._inTick = false;
  }

  // === Internals ===
  private getOrCreateArchetype(mask: bigint): Archetype {
    let a = this.archetypes.get(mask);
    if (!a) {
      a = new Archetype(mask);
      // initialize columns for existing comps present in mask
      for (let cid=0; cid<this.nextCompId; cid++) {
        const bit = 1n << BigInt(cid);
        if ((mask & bit) !== 0n) a.ensureColumn(cid);
      }
      this.archetypes.set(mask, a);
    }
    return a;
  }

  private nextArchetype(from: Archetype, cid: ComponentId, adding: boolean): Archetype {
    const edges = adding ? from.addEdges : from.rmEdges;
    let to = edges.get(cid);
    if (!to) {
      const toMask = adding ? (from.mask | (1n << BigInt(cid))) : (from.mask & ~(1n << BigInt(cid)));
      to = this.getOrCreateArchetype(toMask);
      // ensure necessary columns exist there
      for (let i=0; i<this.nextCompId; i++) {
        const bit = 1n << BigInt(i);
        if ((toMask & bit) !== 0n) to.ensureColumn(i);
      }
      edges.set(cid, to);
    }
    return to;
  }

  private addRow(arch: Archetype, e: Entity): { arch: Archetype; row: number } {
    const row = arch.entities.length;
    arch.entities.push(e);
    // grow columns
    for (const [cid, col] of arch.columns) {
      if (col.length < arch.entities.length) col.push(undefined);
      arch.changed.get(cid)!.add(row); // mark as changed on arrival
    }
    // stash loc
    this.loc[e & 0xffff] = { arch, row };
    return this.loc[e & 0xffff];
  }

  private removeRow(arch: Archetype, row: number): void {
    const last = arch.entities.length - 1;
    const eLast = arch.entities[last];
    // swap-remove entity row
    arch.entities[row] = eLast;
    arch.entities.pop();
    for (const [cid, col] of arch.columns) {
      col[row] = col[last];
      col.pop();
      // mark changed for touched rows
      arch.changed.get(cid)!.add(row);
    }
    // update moved entity loc
    const idxLast = eLast & 0xffff;
    this.loc[idxLast] = { arch, row };
  }

  private move(e: Entity, from: Archetype, oldRow: number, to: Archetype, payloads: Record<number, any>) {
    // add to 'to'
    const loc = this.addRow(to, e);
    // seed columns from payloads
    for (const [cid, val] of Object.entries(payloads)) {
      const n = Number(cid);
      to.columns.get(n)![loc.row] = val;
      to.changed.get(n)!.add(loc.row);
    }
    // remove old row (will swap another entity down)
    this.removeRow(from, oldRow);
  }

  private requireAlive(e: Entity) {
    if (!this.isAlive(e)) throw new Error(`entity ${e} is not alive or stale handle`);
  }
}

export class CommandBuffer {
  private world: World;
  private ops: (() => void)[] = [];
  constructor(w: World) { this.world = w; }

  createEntity(init?: Record<ComponentId, any> | bigint): Entity {
    let temp: Entity = -1;
    this.ops.push(() => { temp = this.world.createEntity(init); });
    return temp;
  }
  destroyEntity(e: Entity) { this.ops.push(() => this.world.destroyEntity(e)); }
  add<T>(e: Entity, ct: ComponentType<T>, v?: T) { this.ops.push(() => this.world.addComponent(e, ct, v)); }
  remove<T>(e: Entity, ct: ComponentType<T>) { this.ops.push(() => this.world.removeComponent(e, ct)); }
  set<T>(e: Entity, ct: ComponentType<T>, v: T) { this.ops.push(() => this.world.set(e, ct, v)); }

  flush() {
    for (const op of this.ops) op();
    this.ops.length = 0;
  }
}
```

# Tiny usage demo

```ts
import { World } from "./ecs";

// 1) Define components
type Position = { x:number; y:number };
type Velocity = { x:number; y:number };
type Lifetime = { t:number };

const world = new World();
const CPos = world.defineComponent<Position>({ name: "Position", defaults: () => ({x:0,y:0}) });
const CVel = world.defineComponent<Velocity>({ name: "Velocity", defaults: () => ({x:0,y:0}) });
const CLife = world.defineComponent<Lifetime>({ name: "Lifetime", defaults: () => ({t:1.0}) });

// 2) Spawn
const e = world.createEntity();
world.addComponent(e, CPos, {x:0,y:0});
world.addComponent(e, CVel, {x:2,y:1});
world.addComponent(e, CLife, {t:3});

// 3) Systems (per tick)
function physics(dt: number) {
  const q = world.makeQuery({ all:[CPos, CVel] });
  for (const [ent, get, pos, vel] of world.iter(q, CPos, CVel)) {
    pos!.x += vel!.x * dt;
    pos!.y += vel!.y * dt;
    world.set(ent, CPos, pos!); // mark changed
  }
}

function decay(dt: number) {
  const q = world.makeQuery({ all:[CLife] });
  for (const [ent, get, life] of world.iter(q, CLife)) {
    life!.t -= dt;
    if (life!.t <= 0) world.destroyEntity(ent);
    else world.set(ent, CLife, life!);
  }
}

// 4) Tick with a command buffer (optional for structural ops)
function tick(dt: number) {
  const cmd = world.beginTick();
  physics(dt);
  decay(dt);
  cmd.flush();
  world.endTick();
}
```

# Extras you can add (optional, easy bolt-ons)

* **System scheduler** with dependencies (use the DAG you already have—toposort the system graph and run).
* **Events**: fire component `onAdd/onRemove` (already supported) + `onChanged` subscription via `changed:` queries.
* **Serialization**: `World → JSON` by dumping archetypes and columns; `JSON → World` by rebuilding rows.
* **More than 64 components**: maintain two (or N) `bigint` masks per archetype and per query.

# Mermaid (shape of the ECS)

```mermaid
flowchart LR
  subgraph World
    A[Archetype 0b0011]:::arch
    B[Archetype 0b0111]:::arch
    C[Archetype 0b0010]:::arch
    A-- add C2 -->B
    B-- remove C1 -->C
    A -- SoA columns --> ColsA[(Pos[], Vel[])]
    B -- SoA columns --> ColsB[(Pos[], Vel[], Life[])]
  end
  Sys1[Physics System] -->|query all:[Pos,Vel]| A & B
  Sys2[Lifetime System] -->|query all:[Life]| B
  classDef arch fill:#eef,stroke:#88f;
```

# Sibilant sprinkles (pseudo)

```lisp
; shared/sibilant/prom/ds/ecs.sib (pseudo)
(defn make-world [] (new World))
(defn defcomp [w name defaults] (.defineComponent w {:name name :defaults defaults}))
(defn query [w & {:all [] :any [] :none [] :changed []}]
  (.makeQuery w {:all all :any any :none none :changed changed}))
(defn iter [w q & comps] (.iter w q ~@comps))
```

Want me to wire a **system scheduler** that uses the Graph you already have (with per-system resources, parallel-safe stages), or add a **prefab/blueprint** loader?
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [ecs-scheduler-and-prefabs](ecs-scheduler-and-prefabs.md)
- [System Scheduler with Resource-Aware DAG](system-scheduler-with-resource-aware-dag.md)
- [JavaScript](chunks/javascript.md)
- [Unique Info Dump Index](unique-info-dump-index.md)
- [Language-Agnostic Mirror System](language-agnostic-mirror-system.md)
- [graph-ds](graph-ds.md)
- [ecs-offload-workers](ecs-offload-workers.md)
- [typed-struct-compiler](typed-struct-compiler.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [aionian-circuit-math](aionian-circuit-math.md)
- [Diagrams](chunks/diagrams.md)
- [DSL](chunks/dsl.md)
- [Local-Only-LLM-Workflow](local-only-llm-workflow.md)
- [Interop and Source Maps](interop-and-source-maps.md)
- [Lispy Macros with syntax-rules](lispy-macros-with-syntax-rules.md)
- [js-to-lisp-reverse-compiler](js-to-lisp-reverse-compiler.md)
- [Lisp-Compiler-Integration](lisp-compiler-integration.md)
- [Promethean Infrastructure Setup](promethean-infrastructure-setup.md)
- [Performance-Optimized-Polyglot-Bridge](performance-optimized-polyglot-bridge.md)

## Sources
- [ecs-scheduler-and-prefabs — L246](ecs-scheduler-and-prefabs.md#L246) (line 246, col 1, score 0.87)
- [System Scheduler with Resource-Aware DAG — L244](system-scheduler-with-resource-aware-dag.md#L244) (line 244, col 1, score 0.87)
- [Chroma Toolkit Consolidation Plan — L171](chroma-toolkit-consolidation-plan.md#L171) (line 171, col 1, score 1)
- [Chroma Toolkit Consolidation Plan — L171](chroma-toolkit-consolidation-plan.md#L171) (line 171, col 3, score 1)
- [JavaScript — L14](chunks/javascript.md#L14) (line 14, col 1, score 1)
- [JavaScript — L14](chunks/javascript.md#L14) (line 14, col 3, score 1)
- [ecs-offload-workers — L454](ecs-offload-workers.md#L454) (line 454, col 1, score 1)
- [ecs-offload-workers — L454](ecs-offload-workers.md#L454) (line 454, col 3, score 1)
- [eidolon-field-math-foundations — L128](eidolon-field-math-foundations.md#L128) (line 128, col 1, score 1)
- [eidolon-field-math-foundations — L128](eidolon-field-math-foundations.md#L128) (line 128, col 3, score 1)
- [ecs-offload-workers — L455](ecs-offload-workers.md#L455) (line 455, col 1, score 1)
- [ecs-offload-workers — L455](ecs-offload-workers.md#L455) (line 455, col 3, score 1)
- [ecs-scheduler-and-prefabs — L387](ecs-scheduler-and-prefabs.md#L387) (line 387, col 1, score 1)
- [ecs-scheduler-and-prefabs — L387](ecs-scheduler-and-prefabs.md#L387) (line 387, col 3, score 1)
- [eidolon-field-math-foundations — L130](eidolon-field-math-foundations.md#L130) (line 130, col 1, score 1)
- [eidolon-field-math-foundations — L130](eidolon-field-math-foundations.md#L130) (line 130, col 3, score 1)
- [Local-Only-LLM-Workflow — L179](local-only-llm-workflow.md#L179) (line 179, col 1, score 1)
- [Local-Only-LLM-Workflow — L179](local-only-llm-workflow.md#L179) (line 179, col 3, score 1)
- [ecs-offload-workers — L463](ecs-offload-workers.md#L463) (line 463, col 1, score 1)
- [ecs-offload-workers — L463](ecs-offload-workers.md#L463) (line 463, col 3, score 1)
- [ecs-scheduler-and-prefabs — L395](ecs-scheduler-and-prefabs.md#L395) (line 395, col 1, score 1)
- [ecs-scheduler-and-prefabs — L395](ecs-scheduler-and-prefabs.md#L395) (line 395, col 3, score 1)
- [typed-struct-compiler — L384](typed-struct-compiler.md#L384) (line 384, col 1, score 1)
- [typed-struct-compiler — L384](typed-struct-compiler.md#L384) (line 384, col 3, score 1)
- [Unique Info Dump Index — L63](unique-info-dump-index.md#L63) (line 63, col 1, score 1)
- [Unique Info Dump Index — L63](unique-info-dump-index.md#L63) (line 63, col 3, score 1)
- [aionian-circuit-math — L158](aionian-circuit-math.md#L158) (line 158, col 1, score 1)
- [aionian-circuit-math — L158](aionian-circuit-math.md#L158) (line 158, col 3, score 1)
- [Diagrams — L9](chunks/diagrams.md#L9) (line 9, col 1, score 1)
- [Diagrams — L9](chunks/diagrams.md#L9) (line 9, col 3, score 1)
- [DSL — L10](chunks/dsl.md#L10) (line 10, col 1, score 1)
- [DSL — L10](chunks/dsl.md#L10) (line 10, col 3, score 1)
- [JavaScript — L12](chunks/javascript.md#L12) (line 12, col 1, score 1)
- [JavaScript — L12](chunks/javascript.md#L12) (line 12, col 3, score 1)
- [Interop and Source Maps — L521](interop-and-source-maps.md#L521) (line 521, col 1, score 1)
- [Interop and Source Maps — L521](interop-and-source-maps.md#L521) (line 521, col 3, score 1)
- [js-to-lisp-reverse-compiler — L413](js-to-lisp-reverse-compiler.md#L413) (line 413, col 1, score 1)
- [js-to-lisp-reverse-compiler — L413](js-to-lisp-reverse-compiler.md#L413) (line 413, col 3, score 1)
- [Lisp-Compiler-Integration — L542](lisp-compiler-integration.md#L542) (line 542, col 1, score 1)
- [Lisp-Compiler-Integration — L542](lisp-compiler-integration.md#L542) (line 542, col 3, score 1)
- [Lispy Macros with syntax-rules — L405](lispy-macros-with-syntax-rules.md#L405) (line 405, col 1, score 1)
- [Lispy Macros with syntax-rules — L405](lispy-macros-with-syntax-rules.md#L405) (line 405, col 3, score 1)
- [typed-struct-compiler — L388](typed-struct-compiler.md#L388) (line 388, col 1, score 1)
- [typed-struct-compiler — L388](typed-struct-compiler.md#L388) (line 388, col 3, score 1)
- [JavaScript — L15](chunks/javascript.md#L15) (line 15, col 1, score 1)
- [JavaScript — L15](chunks/javascript.md#L15) (line 15, col 3, score 1)
- [ecs-scheduler-and-prefabs — L388](ecs-scheduler-and-prefabs.md#L388) (line 388, col 1, score 1)
- [ecs-scheduler-and-prefabs — L388](ecs-scheduler-and-prefabs.md#L388) (line 388, col 3, score 1)
- [eidolon-field-math-foundations — L129](eidolon-field-math-foundations.md#L129) (line 129, col 1, score 1)
- [eidolon-field-math-foundations — L129](eidolon-field-math-foundations.md#L129) (line 129, col 3, score 1)
- [Local-Only-LLM-Workflow — L177](local-only-llm-workflow.md#L177) (line 177, col 1, score 1)
- [Local-Only-LLM-Workflow — L177](local-only-llm-workflow.md#L177) (line 177, col 3, score 1)
- [System Scheduler with Resource-Aware DAG — L399](system-scheduler-with-resource-aware-dag.md#L399) (line 399, col 1, score 0.98)
- [System Scheduler with Resource-Aware DAG — L399](system-scheduler-with-resource-aware-dag.md#L399) (line 399, col 3, score 0.98)
- [JavaScript — L28](chunks/javascript.md#L28) (line 28, col 1, score 0.98)
- [JavaScript — L28](chunks/javascript.md#L28) (line 28, col 3, score 0.98)
- [Unique Info Dump Index — L163](unique-info-dump-index.md#L163) (line 163, col 1, score 0.98)
- [Unique Info Dump Index — L163](unique-info-dump-index.md#L163) (line 163, col 3, score 0.98)
- [Promethean Infrastructure Setup — L609](promethean-infrastructure-setup.md#L609) (line 609, col 1, score 0.98)
- [Promethean Infrastructure Setup — L609](promethean-infrastructure-setup.md#L609) (line 609, col 3, score 0.98)
- [Promethean Infrastructure Setup — L611](promethean-infrastructure-setup.md#L611) (line 611, col 1, score 1)
- [Promethean Infrastructure Setup — L611](promethean-infrastructure-setup.md#L611) (line 611, col 3, score 1)
- [eidolon-field-math-foundations — L156](eidolon-field-math-foundations.md#L156) (line 156, col 1, score 0.99)
- [eidolon-field-math-foundations — L156](eidolon-field-math-foundations.md#L156) (line 156, col 3, score 0.99)
- [Local-Only-LLM-Workflow — L192](local-only-llm-workflow.md#L192) (line 192, col 1, score 0.99)
- [Local-Only-LLM-Workflow — L192](local-only-llm-workflow.md#L192) (line 192, col 3, score 0.99)
- [Performance-Optimized-Polyglot-Bridge — L456](performance-optimized-polyglot-bridge.md#L456) (line 456, col 1, score 0.99)
- [Performance-Optimized-Polyglot-Bridge — L456](performance-optimized-polyglot-bridge.md#L456) (line 456, col 3, score 0.99)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
