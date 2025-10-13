// loosen typing to avoid cross-package type coupling
import {
    type Columns,
    type CompLayout,
    type Snap,
    type CompColumns,
    allocColumns,
    canUseSAB,
    isChanged,
} from './layout.js';

type Transferable = ArrayBuffer | SharedArrayBuffer;

export type ComponentData = {
    [field: string]: number;
};

export type ComponentRef<T extends ComponentData = ComponentData> = {
    id: number;
    __type?: T;
};

export type WorldLike<Q = unknown> = {
    iter(query: Q): IterableIterator<[number, ...unknown[]]>;
    get<T extends ComponentData>(eid: number, type: ComponentRef<T>): T | undefined;
    set<T extends ComponentData>(eid: number, type: ComponentRef<T>, value: T): void;
    isAlive(eid: number): boolean;
};

export type BuildSpec = {
    layouts: CompLayout[];
    types: Record<number, ComponentRef>;
};

function countRows<Q>(world: WorldLike<Q>, query: Q): number {
    return [...world.iter(query)].length;
}

function createEidBuffer(rows: number, shared: boolean): Int32Array {
    const buf = shared
        ? new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * rows)
        : new ArrayBuffer(Int32Array.BYTES_PER_ELEMENT * rows);
    return new Int32Array(buf);
}

function initComponents(rows: number, spec: BuildSpec, shared: boolean): Snap['comps'] {
    const comps: Snap['comps'] = {};
    for (const L of spec.layouts) comps[L.cid] = allocColumns(rows, L, shared);
    return comps;
}

function populateSnapshot<Q>(world: WorldLike<Q>, spec: BuildSpec, query: Q, snap: Snap): void {
    [...world.iter(query)].forEach(([e], i) => {
        snap.eids[i] = e;
        for (const L of spec.layouts) {
            const ctype = spec.types[L.cid]!;
            const v = world.get(e, ctype);
            if (v == null) continue;
            for (const field of Object.keys(L.fields)) {
                const arr = snap.comps[L.cid]!.fields[field] as Columns[string];
                arr[i] = v[field] ?? 0;
            }
        }
    });
}

function collectTransferables(spec: BuildSpec, snap: Snap, shared: boolean): Transferable[] {
    const transfer: Transferable[] = [];
    if (!shared) {
        transfer.push(snap.eids.buffer);
        for (const L of spec.layouts) {
            for (const arr of Object.values(snap.comps[L.cid]!.fields)) transfer.push(arr.buffer);
            transfer.push(snap.comps[L.cid]!.changed.buffer);
        }
    }
    return transfer;
}

export function buildSnapshot<Q>(
    world: WorldLike<Q>,
    spec: BuildSpec,
    query: Q,
): { snap: Snap; transfer: Transferable[] } {
    const shared = canUseSAB();
    const rows = countRows(world, query);
    const eids = createEidBuffer(rows, shared);
    const comps = initComponents(rows, spec, shared);
    const snap: Snap = { shared, rows, eids, comps };
    populateSnapshot(world, spec, query, snap);
    const transfer = collectTransferables(spec, snap, shared);
    return { snap, transfer };
}

function hasChanges(changed: Uint8Array): boolean {
    return changed.some((b) => b !== 0);
}

function applyLayout(world: WorldLike, ctype: ComponentRef, cols: CompColumns, snap: Snap): void {
    snap.eids.forEach((eid, i) => {
        if (i >= snap.rows) return;
        if (!isChanged(cols.changed, i)) return;
        if (!world.isAlive(eid)) return;
        const cur = world.get(eid, ctype) ?? {};
        const updated: ComponentData = { ...cur };
        for (const [field, arr] of Object.entries(cols.fields)) {
            if (i < arr.length) {
                const value = arr[i];
                if (value !== undefined) {
                    updated[field] = value;
                }
            }
        }
        world.set(eid, ctype, updated);
    });
}

export function commitSnapshot(world: WorldLike, spec: BuildSpec, snap: Snap): void {
    for (const L of spec.layouts) {
        const ctype = spec.types[L.cid]!;
        const cols = snap.comps[L.cid]!;
        if (!hasChanges(cols.changed)) continue;
        applyLayout(world, ctype, cols, snap);
    }
}
