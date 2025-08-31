import type { ComponentType } from '@promethean/ds/ecs.js';
import { CompLayout, Snap, allocColumns, canUseSAB, isChanged } from './layout';
type Transferable = ArrayBuffer | SharedArrayBuffer;

export type ComponentRef = Pick<ComponentType<any>, 'id'>;

export interface WorldLike {
    iter(query: any): IterableIterator<[number, ...any[]]>;
    get(eid: number, type: ComponentRef): any;
    set(eid: number, type: ComponentRef, value: any): void;
    isAlive(eid: number): boolean;
}

export type BuildSpec = {
    layouts: CompLayout[];
    types: Record<number, ComponentRef>;
};

export function buildSnapshot(world: WorldLike, spec: BuildSpec, query: any): { snap: Snap; transfer: Transferable[] } {
    const shared = canUseSAB();
    let rows = 0;
    for (const _ of world.iter(query)) rows++;

    const eids = (() => {
        const buf = shared
            ? new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * rows)
            : new ArrayBuffer(Int32Array.BYTES_PER_ELEMENT * rows);
        return new Int32Array(buf);
    })();

    const comps: Snap['comps'] = {};
    for (const L of spec.layouts) comps[L.cid] = allocColumns(rows, L, shared);

    let i = 0;
    for (const [e] of world.iter(query)) {
        eids[i] = e as number;
        for (const L of spec.layouts) {
            const ctype = spec.types[L.cid];
            const v = world.get(e as number, ctype);
            if (v == null) continue;
            for (const field of Object.keys(L.fields)) {
                (comps[L.cid].fields[field] as any)[i] = (v as any)[field] ?? 0;
            }
        }
        i++;
    }

    const snap: Snap = { shared, rows, eids, comps };
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

export function commitSnapshot(world: WorldLike, spec: BuildSpec, snap: Snap) {
    const rows = snap.rows;
    for (const L of spec.layouts) {
        const ctype = spec.types[L.cid];
        const cols = snap.comps[L.cid];
        const changed = cols.changed;
        let any = false;
        for (let b = 0; b < changed.length; b++)
            if (changed[b]) {
                any = true;
                break;
            }
        if (!any) continue;

        for (let i = 0; i < rows; i++) {
            if (!isChanged(changed, i)) continue;
            const eid = snap.eids[i];
            if (!world.isAlive(eid)) continue;
            const cur = world.get(eid, ctype) ?? {};
            for (const [field, arr] of Object.entries(cols.fields)) {
                (cur as any)[field] = (arr as any)[i];
            }
            world.set(eid, ctype, cur);
        }
    }
}
