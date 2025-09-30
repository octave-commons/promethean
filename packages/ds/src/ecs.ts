// GPL3. Zero deps. Archetype ECS with 64-bit signature mask.
// NOTE: 64 components max (extend to 128+ via two bigints if needed).

export type Entity = number; // 32-bit index, versioned via generations[]
export type ComponentId = number;

const MAX_COMPONENTS = 1024 * 8;

export type ComponentSpec<T> = {
    name: string;
    defaults?: () => T;
    onAdd?: (w: World, e: Entity, v: T) => void;
    onRemove?: (w: World, e: Entity, v: T) => void;
    equals?: (a: T, b: T) => boolean; // <-- for setIfChanged()
};

export type ComponentType<T> = {
    id: ComponentId; // 0..63
    mask: bigint; // 1n << id
} & ComponentSpec<T>;

export type Query = {
    all?: bigint; // must have all bits
    any?: bigint; // must have at least one
    none?: bigint; // must have none
    changed?: bigint; // at least one changed since last tick
};

type Edge = Map<ComponentId, Archetype>; // add/remove graph edges for fast moves

type ColumnBuffers = {
    prev: unknown[];
    next: unknown[];
};

class Archetype {
    mask: bigint;
    entities: Entity[] = [];
    // per comp: { prev, next }
    columns: Map<ComponentId, ColumnBuffers> = new Map();

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

    ensureColumn(cid: ComponentId): void {
        if (!this.columns.has(cid)) this.columns.set(cid, { prev: [], next: [] });
        if (!this.changedPrev.has(cid)) this.changedPrev.set(cid, new Set());
        if (!this.changedNext.has(cid)) this.changedNext.set(cid, new Set());
        if (!this.writtenNext.has(cid)) this.writtenNext.set(cid, new Set());
    }

    swapBuffers(): void {
        for (const [cid, { prev, next }] of this.columns) {
            this.columns.set(cid, { prev: next, next: prev }); // swap references
            // promote “this frame changed” → “prev changed”
            const nextChanged = this.changedNext.get(cid)!;
            this.changedPrev.set(cid, nextChanged);
            this.changedNext.set(cid, new Set());
            // reset coverage bookkeeping
            this.writtenNext.set(cid, new Set());
        }
    }

    getBuffers(cid: ComponentId): ColumnBuffers {
        const buffers = this.columns.get(cid);
        if (!buffers) throw new Error(`Missing column buffers for component ${cid}`);
        return buffers;
    }
}

function hasAll(mask: bigint, all: bigint): boolean {
    return (mask & all) === all;
}
function hasAny(mask: bigint, any: bigint): boolean {
    return any === 0n ? true : (mask & any) !== 0n;
}
function hasNone(mask: bigint, none: bigint): boolean {
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
        if (this.nextCompId >= MAX_COMPONENTS) throw new Error(`Max ${MAX_COMPONENTS} components reached`);
        const id = this.nextCompId++;
        const type: ComponentType<T> = { ...spec, id, mask: 1n << BigInt(id) };
        this.comps[id] = type;
        // ensure add/remove edges exist for empty archetype lazily
        return type;
    }

    // === Entities ===
    createEntity(init?: Record<ComponentId, unknown> | bigint): Entity {
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
        const loc = this.loc[e & 0xffff];
        const { arch, row } = loc;
        // call onRemove hooks for all comps present
        for (let cid = 0; cid < this.nextCompId; cid++) {
            const bit = 1n << BigInt(cid);
            if ((arch.mask & bit) !== 0n) {
                const v = arch.getBuffers(cid).prev[row];
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
        const loc = this.loc[idx];
        const from = loc.arch;
        if ((from.mask & ct.mask) !== 0n) {
            // already has: set value + mark changed
            const row = loc.row;
            from.ensureColumn(ct.id);
            const { prev, next } = from.getBuffers(ct.id);
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
        const payloads: Record<number, unknown> = {};
        // carry over existing columns
        for (const [cid, { prev }] of from.columns) payloads[cid] = prev[oldRow];
        // new comp value (or default)
        const newValue = value ?? ct.defaults?.();
        payloads[ct.id] = newValue;
        this.move(e, from, oldRow, to, payloads);
        ct.onAdd?.(this, e, newValue as T);
    }

    removeComponent<T>(e: Entity, ct: ComponentType<T>): void {
        this.requireAlive(e);
        const idx = e & 0xffff;
        const loc = this.loc[idx];
        const from = loc.arch;
        if ((from.mask & ct.mask) === 0n) return; // nothing to do
        const to = this.nextArchetype(from, ct.id, false);
        const oldRow = loc.row;
        const payloads: Record<number, unknown> = {};
        // carry over existing columns except the removed one
        for (const [cid, { prev }] of from.columns) if (cid !== ct.id) payloads[cid] = prev[oldRow];
        const oldVal = from.getBuffers(ct.id).prev[oldRow];
        this.move(e, from, oldRow, to, payloads);
        ct.onRemove?.(this, e, oldVal as T);
    }

    get<T>(e: Entity, ct: ComponentType<T>): T | undefined {
        this.requireAlive(e);
        const loc = this.loc[e & 0xffff];
        const { arch, row } = loc;
        if ((arch.mask & ct.mask) === 0n) return undefined;
        arch.ensureColumn(ct.id);
        return arch.getBuffers(ct.id).prev[row] as T;
    }

    carry<T>(e: Entity, ct: ComponentType<T>): void {
        // copy prev → next for this (entity,comp) WITHOUT marking changed
        this.requireAlive(e);
        const loc = this.loc[e & 0xffff];
        const { arch, row } = loc;
        if ((arch.mask & ct.mask) === 0n) throw new Error(`entity lacks ${ct.name}`);
        arch.ensureColumn(ct.id);
        const { prev, next } = arch.getBuffers(ct.id);
        // conflict detection: if another system already wrote this row, warn
        const written = arch.writtenNext.get(ct.id)!;
        if (written.has(row)) console.warn(`[ECS] double write (carry) on ${ct.name} row ${row}`);
        next[row] = prev[row];
        written.add(row); // mark covered, but NOT changed
    }

    set<T>(e: Entity, ct: ComponentType<T>, value: T): void {
        this.requireAlive(e);
        const loc = this.loc[e & 0xffff];
        const { arch, row } = loc;
        if ((arch.mask & ct.mask) === 0n) throw new Error(`entity lacks ${ct.name}`);
        arch.ensureColumn(ct.id);
        const { prev, next } = arch.getBuffers(ct.id);
        const written = arch.writtenNext.get(ct.id)!;
        if (written.has(row)) console.warn(`[ECS] double write (set) on ${ct.name} row ${row}`);
        next[row] = value;
        // If we're outside a tick, mirror into prev so immediate readers (this frame)
        // observe the update. This is safe because there's no concurrent writer.
        if (!this._inTick) prev[row] = value;
        written.add(row);
        arch.changedNext.get(ct.id)!.add(row); // mark CHANGED
    }

    // convenience: only flag changed if different (uses equals | Object.is)
    setIfChanged<T>(e: Entity, ct: ComponentType<T>, value: T) {
        const prev = this.get(e, ct);
        if (prev === undefined) {
            this.set(e, ct, value);
            return;
        }
        const spec = this.comps[ct.id] as ComponentType<T> | null;
        const equals: (a: T, b: T) => boolean = spec?.equals ?? ((a: T, b: T) => Object.is(a, b));
        if (!equals(prev, value)) this.set(e, ct, value);
        else this.carry(e, ct);
    }

    has(e: Entity, ct: ComponentType<any>): boolean {
        if (!this.isAlive(e)) return false;
        const { arch } = this.loc[e & 0xffff];
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
                const e = arch.entities[row];
                const get = (ct: ComponentType<any>) => {
                    arch.ensureColumn(ct.id);
                    return arch.getBuffers(ct.id).prev[row];
                };
                const v1 = c1 ? (arch.getBuffers(c1.id).prev[row] as T1) : undefined;
                const v2 = c2 ? (arch.getBuffers(c2.id).prev[row] as T2) : undefined;
                const v3 = c3 ? (arch.getBuffers(c3.id).prev[row] as T3) : undefined;
                yield [e, get, v1, v2, v3];
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
            for (const [cid, { prev, next }] of a.columns) {
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
        for (const [cid, { prev, next }] of arch.columns) {
            if (prev.length < arch.entities.length) prev.push(undefined as unknown);
            if (next.length < arch.entities.length) next.push(undefined as unknown);
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
        const eLast = arch.entities[last];
        // swap-remove entity row
        arch.entities[row] = eLast;
        arch.entities.pop();
        for (const [cid, { prev, next }] of arch.columns) {
            prev[row] = prev[last];
            next[row] = next[last];
            prev.pop();
            next.pop();
            // mark changed for touched rows
            arch.changedNext.get(cid)!.add(row);
            arch.writtenNext.get(cid)!.add(row);
        }
        // update moved entity loc if we swapped different entity
        if (row !== last && eLast !== undefined) {
            const idxLast = eLast & 0xffff;
            this.loc[idxLast] = { arch, row };
        }
    }

    private move(e: Entity, from: Archetype, oldRow: number, to: Archetype, payloads: Record<number, unknown>): void {
        // add to 'to'
        const loc = this.addRow(to, e);
        // seed columns from payloads

        for (const [cid, val] of Object.entries(payloads)) {
            const n = Number(cid);
            to.ensureColumn(n);
            const { prev, next } = to.getBuffers(n);
            next[loc.row] = val;
            // For brand-new placement this frame, mirror into prev so reads during
            // this tick see a coherent value. This preserves double-buffer semantics
            // because there is no prior value to conflict with.
            prev[loc.row] = val;
            to.changedNext.get(n)!.add(loc.row);
            to.writtenNext.get(n)!.add(loc.row);
        }
        // remove old row (will swap another entity down)
        this.removeRow(from, oldRow);
    }

    private requireAlive(e: Entity): void {
        if (!this.isAlive(e)) throw new Error(`entity ${e} is not alive or stale handle`);
    }
}

export class CommandBuffer {
    private readonly world: World;
    private readonly ops: Array<() => void> = [];
    constructor(w: World) {
        this.world = w;
    }

    createEntity(init?: Record<ComponentId, unknown> | bigint): Entity {
        let temp: Entity = -1;
        this.ops.push(() => {
            temp = this.world.createEntity(init);
        });
        this.flush();
        return temp;
    }
    destroyEntity(e: Entity): void {
        this.ops.push(() => this.world.destroyEntity(e));
    }
    add<T>(e: Entity, ct: ComponentType<T>, v?: T): void {
        this.ops.push(() => this.world.addComponent(e, ct, v));
    }
    remove<T>(e: Entity, ct: ComponentType<T>): void {
        this.ops.push(() => this.world.removeComponent(e, ct));
    }
    set<T>(e: Entity, ct: ComponentType<T>, v: T): void {
        this.ops.push(() => this.world.set(e, ct, v));
    }

    flush(): void {
        for (const op of this.ops) op();
        this.ops.length = 0;
    }
}
