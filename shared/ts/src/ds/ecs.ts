// GPL3. Zero deps. Archetype ECS with 64-bit signature mask.
// NOTE: 64 components max (extend to 128+ via two bigints if needed).

export type Entity = number; // 32-bit index, versioned via generations[]
export type ComponentId = number;

const MAX_COMPONENTS = 1024 * 8;

export interface ComponentSpec<T> {
  name: string;
  defaults?: () => T;
  onAdd?: (w: World, e: Entity, v: T) => void;
  onRemove?: (w: World, e: Entity, v: T) => void;
  equals?: (a: T, b: T) => boolean; // <-- for setIfChanged()
}

export interface ComponentType<T> extends ComponentSpec<T> {
  id: ComponentId; // 0..63
  mask: bigint; // 1n << id
}

export type Query = {
  all?: bigint; // must have all bits
  any?: bigint; // must have at least one
  none?: bigint; // must have none
  changed?: bigint; // at least one changed since last tick
};

type Column = any[]; // SoA column per component id
type Edge = Map<ComponentId, Archetype>; // add/remove graph edges for fast moves

class Archetype {
  mask: bigint;
  entities: Entity[] = [];
  // per comp: [prev, next]
  columns: Map<ComponentId, [any[], any[]]> = new Map();

  // cached transition edges
  addEdges: Edge = new Map();
  rmEdges: Edge = new Map();

  // “what changed last frame” (queried this frame)
  changedPrev: Map<ComponentId, Set<number>> = new Map();
  // “what was written this frame”
  changedNext: Map<ComponentId, Set<number>> = new Map();
  // “what was written at all this frame” (carry or set) — to detect missed rows & double writes
  writtenNext: Map<ComponentId, Set<number>> = new Map();

  constructor(mask: bigint) {
    this.mask = mask;
  }

  ensureColumn(cid: ComponentId) {
    if (!this.columns.has(cid)) this.columns.set(cid, [[], []]);
    if (!this.changedPrev.has(cid)) this.changedPrev.set(cid, new Set());
    if (!this.changedNext.has(cid)) this.changedNext.set(cid, new Set());
    if (!this.writtenNext.has(cid)) this.writtenNext.set(cid, new Set());
  }

  swapBuffers() {
    for (const [cid, [prev, next]] of this.columns) {
      this.columns.set(cid, [next, prev]); // swap references
      // promote “this frame changed” → “prev changed”
      const nextChanged = this.changedNext.get(cid)!;
      this.changedPrev.set(cid, nextChanged);
      this.changedNext.set(cid, new Set());
      // reset coverage bookkeeping
      this.writtenNext.set(cid, new Set());
    }
  }
}

function hasAll(mask: bigint, all: bigint) {
  return (mask & all) === all;
}
function hasAny(mask: bigint, any: bigint) {
  return any === 0n ? true : (mask & any) !== 0n;
}
function hasNone(mask: bigint, none: bigint) {
  return (mask & none) === 0n;
}

export class World {
  // entity bookkeeping
  private generations: number[] = []; // version per index
  private freeList: number[] = []; // recycled indices
  private alive = new Set<Entity>(); // quick existence check

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
    if (this.nextCompId >= MAX_COMPONENTS)
      throw new Error(`Max ${MAX_COMPONENTS} components reached`);
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
    if (typeof init === 'bigint') {
      // mask-only init: fill with defaults
      for (let cid = 0; cid < this.nextCompId; cid++) {
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
    const { arch, row } = this.loc[e & 0xffff]!;
    // call onRemove hooks for all comps present
    for (let cid = 0; cid < this.nextCompId; cid++) {
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
    const idx = e & 0xffff,
      gen = e >>> 16;
    return this.generations[idx] === gen && this.alive.has(e);
  }

  // === Components ops ===
  addComponent<T>(e: Entity, ct: ComponentType<T>, value?: T): void {
    this.requireAlive(e);
    const idx = e & 0xffff;
    const loc = this.loc[idx]!;
    const from = loc.arch;
    if ((from.mask & ct.mask) !== 0n) {
      // already has: set value + mark changed
      const row = loc.row;
      from.ensureColumn(ct.id);
      const [prev, next] = from.columns.get(ct.id)!;
      const written = from.writtenNext.get(ct.id)!;
      // write to next buffer; if no explicit value, carry prev
      next[row] = value ?? prev[row];
      written.add(row);
      from.changedNext.get(ct.id)!.add(row);
      return;
    }
    // move to new archetype with component added
    const to = this.nextArchetype(from, ct.id, true);
    const oldRow = loc.row;
    const payloads: Record<number, any> = {};
    // carry over existing columns
    for (const [cid, [prev]] of from.columns) payloads[cid] = prev[oldRow];
    // new comp value (or default)
    payloads[ct.id] = value ?? ct.defaults?.();
    this.move(e, from, oldRow, to, payloads);
    ct.onAdd?.(this, e, payloads[ct.id]);
  }

  removeComponent<T>(e: Entity, ct: ComponentType<T>): void {
    this.requireAlive(e);
    const idx = e & 0xffff;
    const loc = this.loc[idx]!;
    const from = loc.arch;
    if ((from.mask & ct.mask) === 0n) return; // nothing to do
    const to = this.nextArchetype(from, ct.id, false);
    const oldRow = loc.row;
    const payloads: Record<number, any> = {};
    // carry over existing columns except the removed one
    for (const [cid, [prev]] of from.columns) if (cid !== ct.id) payloads[cid] = prev[oldRow];
    const [prev] = from.columns.get(ct.id)!;
    const oldVal = prev[oldRow];
    this.move(e, from, oldRow, to, payloads);
    ct.onRemove?.(this, e, oldVal);
  }

  get<T>(e: Entity, ct: ComponentType<T>): T | undefined {
    this.requireAlive(e);
    const { arch, row } = this.loc[e & 0xffff]!;
    if ((arch.mask & ct.mask) === 0n) return undefined;
    arch.ensureColumn(ct.id);
    const [prev] = arch.columns.get(ct.id)!;
    return prev[row];
  }

  carry<T>(e: Entity, ct: ComponentType<T>): void {
    // copy prev → next for this (entity,comp) WITHOUT marking changed
    this.requireAlive(e);
    const { arch, row } = this.loc[e & 0xffff]!;
    if ((arch.mask & ct.mask) === 0n) throw new Error(`entity lacks ${ct.name}`);
    arch.ensureColumn(ct.id);
    const [prev, next] = arch.columns.get(ct.id)!;
    // conflict detection: if another system already wrote this row, warn
    const written = arch.writtenNext.get(ct.id)!;
    if (written.has(row)) console.warn(`[ECS] double write (carry) on ${ct.name} row ${row}`);
    next[row] = prev[row];
    written.add(row); // mark covered, but NOT changed
  }

  set<T>(e: Entity, ct: ComponentType<T>, value: T): void {
    this.requireAlive(e);
    const { arch, row } = this.loc[e & 0xffff]!;
    if ((arch.mask & ct.mask) === 0n) throw new Error(`entity lacks ${ct.name}`);
    arch.ensureColumn(ct.id);
    const [, next] = arch.columns.get(ct.id)!;
    const written = arch.writtenNext.get(ct.id)!;
    if (written.has(row)) console.warn(`[ECS] double write (set) on ${ct.name} row ${row}`);
    next[row] = value;
    written.add(row);
    arch.changedNext.get(ct.id)!.add(row); // mark CHANGED
  }

  // convenience: only flag changed if different (uses equals | Object.is)
  setIfChanged<T>(e: Entity, ct: ComponentType<T>, value: T) {
    const prev = this.get(e, ct);
    const eq = this.comps[ct.id]!.equals ?? Object.is;
    if (!eq(prev as any, value)) this.set(e, ct, value);
    else this.carry(e, ct);
  }

  has(e: Entity, ct: ComponentType<any>): boolean {
    if (!this.isAlive(e)) return false;
    const { arch } = this.loc[e & 0xffff]!;
    return (arch.mask & ct.mask) !== 0n;
  }

  // === Query + iteration ===
  // Build a query mask set: pass ComponentType(s) for all/any/none/changed
  makeQuery(opts: {
    all?: ComponentType<any>[];
    any?: ComponentType<any>[];
    none?: ComponentType<any>[];
    changed?: ComponentType<any>[];
  }): Query {
    const bit = (arr?: ComponentType<any>[]) =>
      arr && arr.length ? arr.map((c) => c.mask).reduce((a, b) => a | b, 0n) : 0n;
    return {
      all: bit(opts.all),
      any: bit(opts.any),
      none: bit(opts.none),
      changed: bit(opts.changed),
    };
  }

  // Iterate matching entities. Returns generator of (e, getters) tuples to keep it ergonomic.
  *iter<T1 = unknown, T2 = unknown, T3 = unknown>(
    q: Query,
    c1?: ComponentType<T1>,
    c2?: ComponentType<T2>,
    c3?: ComponentType<T3>,
  ): IterableIterator<[Entity, (ct: ComponentType<any>) => any, T1?, T2?, T3?]> {
    for (const arch of this.archetypes.values()) {
      const m = arch.mask;
      if (q.all && !hasAll(m, q.all)) continue;
      if (q.any && !hasAny(m, q.any)) continue;
      if (q.none && !hasNone(m, q.none)) continue;
      const rows = arch.entities.length;
      const needChanged = q.changed && q.changed !== 0n;
      for (let row = 0; row < rows; row++) {
        if (needChanged) {
          // require at least one of the 'changed' components touched this tick
          let ok = false;
          for (let cid = 0; cid < this.nextCompId; cid++) {
            const bit = 1n << BigInt(cid);
            if ((q.changed! & bit) !== 0n) {
              if (arch.changedPrev.get(cid)?.has(row)) {
                ok = true;
                break;
              }
            }
          }
          if (!ok) continue;
        }
        const e = arch.entities[row]!;
        const get = (ct: ComponentType<any>) => {
          arch.ensureColumn(ct.id);
          const [prev] = arch.columns.get(ct.id)!;
          return prev[row];
        };
        const v1 = c1 ? (arch.columns.get(c1.id)![0][row] as any) : undefined;
        const v2 = c2 ? (arch.columns.get(c2.id)![0][row] as any) : undefined;
        const v3 = c3 ? (arch.columns.get(c3.id)![0][row] as any) : undefined;
        yield [e, get, v1 as any, v2 as any, v3 as any];
      }
    }
  }

  // === Ticking & command buffers ===
  beginTick(): CommandBuffer {
    if (this._inTick) throw new Error('nested tick not allowed');
    this._inTick = true;
    return new CommandBuffer(this);
  }

  endTick(): void {
    if (!this._inTick) return;

    // finalize writes: fill gaps with carry and swap buffers
    for (const a of this.archetypes.values()) {
      for (const [cid, [prev, next]] of a.columns) {
        const written = a.writtenNext.get(cid)!;
        const rows = a.entities.length;
        for (let row = 0; row < rows; row++) if (!written.has(row)) next[row] = prev[row];
      }
      a.swapBuffers();
    }
    this._inTick = false;
  }

  // === Internals ===
  private getOrCreateArchetype(mask: bigint): Archetype {
    let a = this.archetypes.get(mask);
    if (!a) {
      a = new Archetype(mask);
      // initialize columns for existing comps present in mask
      for (let cid = 0; cid < this.nextCompId; cid++) {
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
      const toMask = adding ? from.mask | (1n << BigInt(cid)) : from.mask & ~(1n << BigInt(cid));
      to = this.getOrCreateArchetype(toMask);
      // ensure necessary columns exist there
      for (let i = 0; i < this.nextCompId; i++) {
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
    for (const [cid, [prev, next]] of arch.columns) {
      if (prev.length < arch.entities.length) prev.push(undefined as any);
      if (next.length < arch.entities.length) next.push(undefined as any);
      arch.changedNext.get(cid)!.add(row); // mark as changed on arrival
      arch.writtenNext.get(cid)!.add(row); // treat as written for coverage
    }
    // stash loc
    const loc = { arch, row };
    this.loc[e & 0xffff] = loc;
    return loc;
  }

  private removeRow(arch: Archetype, row: number): void {
    const last = arch.entities.length - 1;
    const eLast = arch.entities[last]!;
    // swap-remove entity row
    arch.entities[row] = eLast;
    arch.entities.pop();
    for (const [cid, [prev, next]] of arch.columns) {
      prev[row] = prev[last];
      next[row] = next[last];
      prev.pop();
      next.pop();
      // mark changed for touched rows
      arch.changedNext.get(cid)!.add(row);
      arch.writtenNext.get(cid)!.add(row);
    }
    // update moved entity loc if we swapped different entity
    if (row !== last) {
      const idxLast = eLast & 0xffff;
      this.loc[idxLast] = { arch, row };
    }
  }

  private move(
    e: Entity,
    from: Archetype,
    oldRow: number,
    to: Archetype,
    payloads: Record<number, any>,
  ) {
    // add to 'to'
    const loc = this.addRow(to, e);
    // seed columns from payloads

    for (const [cid, val] of Object.entries(payloads)) {
      const n = Number(cid);
      to.ensureColumn(n);
      const [, next] = to.columns.get(n)!;
      next[loc.row] = val;
      to.changedNext.get(n)!.add(loc.row);
      to.writtenNext.get(n)!.add(loc.row);
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
  constructor(w: World) {
    this.world = w;
  }

  createEntity(init?: Record<ComponentId, any> | bigint): Entity {
    let temp: Entity = -1;
    this.ops.push(() => {
      temp = this.world.createEntity(init);
    });
    this.flush();
    return temp;
  }
  destroyEntity(e: Entity) {
    this.ops.push(() => this.world.destroyEntity(e));
  }
  add<T>(e: Entity, ct: ComponentType<T>, v?: T) {
    this.ops.push(() => this.world.addComponent(e, ct, v));
  }
  remove<T>(e: Entity, ct: ComponentType<T>) {
    this.ops.push(() => this.world.removeComponent(e, ct));
  }
  set<T>(e: Entity, ct: ComponentType<T>, v: T) {
    this.ops.push(() => this.world.set(e, ct, v));
  }

  flush() {
    for (const op of this.ops) op();
    this.ops.length = 0;
  }
}
