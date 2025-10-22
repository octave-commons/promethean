/**
 * Functional ECS World Operations
 *
 * This file contains pure functional implementations of ECS World operations.
 * These were previously instance methods on the World class.
 */

import type { Entity, ComponentId, ComponentType, ComponentSpec, Query } from './ecs.js';

// World state interface for functional operations
export interface WorldState {
    // entity bookkeeping
    generations: number[];
    freeList: number[];
    alive: Set<Entity>;

    // entity location
    loc: { arch: any; row: number }[];

    // components
    comps: (ComponentType<any> | null)[];
    nextCompId: number;

    // archetypes by mask
    archetypes: Map<bigint, any>;
    emptyArch: any;

    // temp: per-tick bookkeeping
    inTick: boolean;
}

// Create initial world state
export const createWorldState = (): WorldState => {
    const MAX_COMPONENTS = 1024 * 8;

    return {
        generations: [],
        freeList: [],
        alive: new Set(),
        loc: [],
        comps: Array(MAX_COMPONENTS).fill(null),
        nextCompId: 0,
        archetypes: new Map(),
        emptyArch: { mask: 0n, entities: [], columns: new Map() },
        inTick: false,
    };
};

// Component registration
export const defineComponent = <T>(
    state: WorldState,
    spec: ComponentSpec<T>,
): { componentType: ComponentType<T>; newState: WorldState } => {
    const MAX_COMPONENTS = 1024 * 8;
    if (state.nextCompId >= MAX_COMPONENTS) {
        throw new Error(`Max ${MAX_COMPONENTS} components reached`);
    }

    const id = state.nextCompId++;
    const componentType: ComponentType<T> = {
        ...spec,
        id,
        mask: 1n << BigInt(id),
    };

    const newState = {
        ...state,
        comps: [...state.comps],
        nextCompId: state.nextCompId,
    };
    newState.comps[id] = componentType;

    return { componentType, newState };
};

// Entity creation
export const createEntity = (
    state: WorldState,
    init?: Record<ComponentId, unknown> | bigint,
): { entity: Entity; newState: WorldState } => {
    const idx = state.freeList.length > 0 ? (state.freeList.pop() as number) : state.generations.length;
    const gen = (state.generations[idx] ?? 0) & 0xffff;
    const entity = (gen << 16) | idx;

    const newState = {
        ...state,
        generations: [...state.generations],
        alive: new Set(state.alive).add(entity),
        loc: [...state.loc],
    };
    newState.generations[idx] = gen;

    // Place in empty archetype first
    const emptyArch = state.emptyArch;
    const loc = { arch: emptyArch, row: emptyArch.entities.length };
    newState.loc[idx] = loc;
    emptyArch.entities.push(entity);

    // Attach initial components if provided
    if (typeof init === 'bigint') {
        // Mask-only init: fill with defaults
        for (let cid = 0; cid < state.nextCompId; cid++) {
            const m = 1n << BigInt(cid);
            if ((init & m) !== 0n) {
                const ct = state.comps[cid];
                if (ct) {
                    const result = addComponent(newState, entity, ct, ct.defaults ? ct.defaults() : undefined);
                    newState.loc = result.newState.loc;
                    newState.archetypes = result.newState.archetypes;
                }
            }
        }
    } else if (init) {
        for (const k in init) {
            const cid = Number(k);
            const ct = state.comps[cid];
            if (!ct) throw new Error(`Unknown component id ${cid}`);
            const result = addComponent(newState, entity, ct, init[cid]);
            newState.loc = result.newState.loc;
            newState.archetypes = result.newState.archetypes;
        }
    }

    return { entity, newState };
};

// Entity destruction
export const destroyEntity = (state: WorldState, entity: Entity): { newState: WorldState } => {
    if (!isAlive(state, entity)) {
        throw new Error(`Entity ${entity} is not alive`);
    }

    const idx = entity & 0xffff;
    const loc = state.loc[idx];
    const { arch, row } = loc;

    const newState = {
        ...state,
        generations: [...state.generations],
        alive: new Set(state.alive),
        freeList: [...state.freeList],
        loc: [...state.loc],
        archetypes: new Map(state.archetypes),
    };

    // Call onRemove hooks for all components present
    for (let cid = 0; cid < state.nextCompId; cid++) {
        const bit = 1n << BigInt(cid);
        if ((arch.mask & bit) !== 0n) {
            const v = getComponentValue(arch, cid, row);
            const ct = state.comps[cid];
            ct?.onRemove?.(state, entity, v);
        }
    }

    removeRow(newState, arch, row);

    // Retire entity
    const gen = (state.generations[idx] ?? 0) + 1;
    newState.generations[idx] = gen;
    newState.alive.delete(entity);
    newState.freeList.push(idx);

    return { newState };
};

// Entity lifecycle
export const isAlive = (state: WorldState, entity: Entity): boolean => {
    const idx = entity & 0xffff;
    const gen = entity >>> 16;
    return state.generations[idx] === gen && state.alive.has(entity);
};

// Component operations
export const addComponent = <T>(
    state: WorldState,
    entity: Entity,
    componentType: ComponentType<T>,
    value?: T,
): { newState: WorldState } => {
    if (!isAlive(state, entity)) {
        throw new Error(`Entity ${entity} is not alive`);
    }

    const idx = entity & 0xffff;
    const loc = state.loc[idx];
    const from = loc.arch;

    const newState = {
        ...state,
        loc: [...state.loc],
        archetypes: new Map(state.archetypes),
    };

    if ((from.mask & componentType.mask) !== 0n) {
        // Already has component: set value + mark changed
        const row = loc.row;
        ensureColumn(from, componentType.id);
        const buffers = from.columns.get(componentType.id);
        if (buffers) {
            buffers.next[row] = value ?? buffers.prev[row];
            const written = from.writtenNext.get(componentType.id);
            if (written) written.add(row);
            const changed = from.changedNext.get(componentType.id);
            if (changed) changed.add(row);
        }
        return { newState };
    }

    // Move to new archetype with component added
    const to = getNextArchetype(newState, from, componentType.id, true);
    const oldRow = loc.row;
    const payloads: Record<number, unknown> = {};

    // Carry over existing columns
    for (const [cid, { prev }] of from.columns) {
        payloads[cid] = prev[oldRow];
    }

    // New component value (or default)
    const newValue = value ?? componentType.defaults?.();
    payloads[componentType.id] = newValue;

    moveEntity(newState, entity, from, oldRow, to, payloads);
    componentType.onAdd?.(newState, entity, newValue as T);

    return { newState };
};

export const removeComponent = <T>(
    state: WorldState,
    entity: Entity,
    componentType: ComponentType<T>,
): { newState: WorldState } => {
    if (!isAlive(state, entity)) {
        throw new Error(`Entity ${entity} is not alive`);
    }

    const idx = entity & 0xffff;
    const loc = state.loc[idx];
    const from = loc.arch;

    if ((from.mask & componentType.mask) === 0n) {
        return { state }; // Nothing to do
    }

    const newState = {
        ...state,
        loc: [...state.loc],
        archetypes: new Map(state.archetypes),
    };

    const to = getNextArchetype(newState, from, componentType.id, false);
    const oldRow = loc.row;
    const payloads: Record<number, unknown> = {};

    // Carry over existing columns except removed one
    for (const [cid, { prev }] of from.columns) {
        if (cid !== componentType.id) {
            payloads[cid] = prev[oldRow];
        }
    }

    const oldVal = getComponentValue(from, componentType.id, oldRow);
    moveEntity(newState, entity, from, oldRow, to, payloads);
    componentType.onRemove?.(newState, entity, oldVal as T);

    return { newState };
};

export const getComponent = <T>(state: WorldState, entity: Entity, componentType: ComponentType<T>): T | undefined => {
    if (!isAlive(state, entity)) {
        return undefined;
    }

    const loc = state.loc[entity & 0xffff];
    const { arch, row } = loc;

    if ((arch.mask & componentType.mask) === 0n) {
        return undefined;
    }

    return getComponentValue(arch, componentType.id, row) as T;
};

export const setComponent = <T>(
    state: WorldState,
    entity: Entity,
    componentType: ComponentType<T>,
    value: T,
): { newState: WorldState } => {
    if (!isAlive(state, entity)) {
        throw new Error(`Entity ${entity} is not alive`);
    }

    const idx = entity & 0xffff;
    const loc = state.loc[idx];
    const { arch, row } = loc;

    if ((arch.mask & componentType.mask) === 0n) {
        throw new Error(`Entity lacks ${componentType.name}`);
    }

    const newState = {
        ...state,
        loc: [...state.loc],
        archetypes: new Map(state.archetypes),
    };

    ensureColumn(arch, componentType.id);
    const buffers = arch.columns.get(componentType.id);
    if (buffers) {
        const written = arch.writtenNext.get(componentType.id);
        if (written && written.has(row)) {
            console.warn(`[ECS] double write (set) on ${componentType.name} row ${row}`);
        }
        buffers.next[row] = value;

        // If we're outside a tick, mirror into prev so immediate readers observe update
        if (!state.inTick) {
            buffers.prev[row] = value;
        }

        if (written) written.add(row);
        const changed = arch.changedNext.get(componentType.id);
        if (changed) changed.add(row);
    }

    return { newState };
};

// Query operations
export const makeQuery = (
    state: WorldState,
    opts: {
        all?: ComponentType<any>[];
        any?: ComponentType<any>[];
        none?: ComponentType<any>[];
        changed?: ComponentType<any>[];
    },
): Query => {
    const bit = (arr?: ComponentType<any>[]) =>
        arr && arr.length ? arr.map((c) => c.mask).reduce((a, b) => a | b, 0n) : 0n;

    return {
        all: bit(opts.all),
        any: bit(opts.any),
        none: bit(opts.none),
        changed: bit(opts.changed),
    };
};

export const iterateQuery = function* <T1 = unknown, T2 = unknown, T3 = unknown>(
    state: WorldState,
    query: Query,
    c1?: ComponentType<T1>,
    c2?: ComponentType<T2>,
    c3?: ComponentType<T3>,
): IterableIterator<[Entity, (ct: ComponentType<any>) => any, T1?, T2?, T3?]> {
    for (const arch of state.archetypes.values()) {
        const m = arch.mask;
        if (query.all && !hasAll(m, query.all)) continue;
        if (query.any && !hasAny(m, query.any)) continue;
        if (query.none && !hasNone(m, query.none)) continue;

        const rows = arch.entities.length;
        const needChanged = query.changed && query.changed !== 0n;

        for (let row = 0; row < rows; row++) {
            if (needChanged) {
                // Require at least one of 'changed' components touched this tick
                let ok = false;
                for (let cid = 0; cid < state.nextCompId; cid++) {
                    const bit = 1n << BigInt(cid);
                    if ((query.changed! & bit) !== 0n) {
                        const changed = arch.changedPrev.get(cid);
                        if (changed && changed.has(row)) {
                            ok = true;
                            break;
                        }
                    }
                }
                if (!ok) continue;
            }

            const entity = arch.entities[row];
            const get = (ct: ComponentType<any>) => {
                ensureColumn(arch, ct.id);
                const buffers = arch.columns.get(ct.id);
                return buffers ? buffers.prev[row] : undefined;
            };

            const v1 = c1 ? (getComponentValue(arch, c1.id, row) as T1) : undefined;
            const v2 = c2 ? (getComponentValue(arch, c2.id, row) as T2) : undefined;
            const v3 = c3 ? (getComponentValue(arch, c3.id, row) as T3) : undefined;

            yield [entity, get, v1, v2, v3];
        }
    }
};

// Tick operations
export const beginTick = (state: WorldState): { newState: WorldState; commandBuffer: any } => {
    if (state.inTick) {
        throw new Error('nested tick not allowed');
    }

    const newState = { ...state, inTick: true };
    const commandBuffer = {
        /* CommandBuffer implementation would go here */
    };

    return { newState, commandBuffer };
};

export const endTick = (state: WorldState): { newState: WorldState } => {
    if (!state.inTick) {
        return { state };
    }

    const newState = {
        ...state,
        inTick: false,
        archetypes: new Map(state.archetypes),
    };

    // Finalize writes: fill gaps with carry and swap buffers
    for (const arch of newState.archetypes.values()) {
        for (const [cid, { prev, next }] of arch.columns) {
            const written = arch.writtenNext.get(cid);
            if (written) {
                const rows = arch.entities.length;
                for (let row = 0; row < rows; row++) {
                    if (!written.has(row)) {
                        next[row] = prev[row];
                    }
                }
            }
        }
        swapBuffers(arch);
    }

    return { newState };
};

// Helper functions
const hasAll = (mask: bigint, all: bigint): boolean => (mask & all) === all;
const hasAny = (mask: bigint, any: bigint): boolean => (any === 0n ? true : (mask & any) !== 0n);
const hasNone = (mask: bigint, none: bigint): boolean => (mask & none) === 0n;

const ensureColumn = (arch: any, cid: ComponentId): void => {
    if (!arch.columns.has(cid)) {
        arch.columns.set(cid, { prev: [], next: [] });
    }
    if (!arch.changedPrev.has(cid)) {
        arch.changedPrev.set(cid, new Set());
    }
    if (!arch.changedNext.has(cid)) {
        arch.changedNext.set(cid, new Set());
    }
    if (!arch.writtenNext.has(cid)) {
        arch.writtenNext.set(cid, new Set());
    }
};

const getComponentValue = (arch: any, cid: ComponentId, row: number): unknown => {
    const buffers = arch.columns.get(cid);
    return buffers ? buffers.prev[row] : undefined;
};

const getNextArchetype = (state: WorldState, from: any, cid: ComponentId, adding: boolean): any => {
    const edges = adding ? from.addEdges : from.rmEdges;
    let to = edges.get(cid);

    if (!to) {
        const toMask = adding ? from.mask | (1n << BigInt(cid)) : from.mask & ~(1n << BigInt(cid));
        to = getOrCreateArchetype(state, toMask);

        // Ensure necessary columns exist
        for (let i = 0; i < state.nextCompId; i++) {
            const bit = 1n << BigInt(i);
            if ((toMask & bit) !== 0n) {
                ensureColumn(to, i);
            }
        }

        edges.set(cid, to);
    }

    return to;
};

const getOrCreateArchetype = (state: WorldState, mask: bigint): any => {
    let arch = state.archetypes.get(mask);
    if (!arch) {
        arch = {
            mask,
            entities: [],
            columns: new Map(),
            addEdges: new Map(),
            rmEdges: new Map(),
            changedPrev: new Map(),
            changedNext: new Map(),
            writtenNext: new Map(),
        };
        state.archetypes.set(mask, arch);
    }
    return arch;
};

const moveEntity = (
    state: WorldState,
    entity: Entity,
    from: any,
    oldRow: number,
    to: any,
    payloads: Record<number, unknown>,
): void => {
    // Add to 'to'
    const loc = addRow(to, entity);
    const idx = entity & 0xffff;
    state.loc[idx] = loc;

    // Seed columns from payloads
    for (const [cid, val] of Object.entries(payloads)) {
        const n = Number(cid);
        ensureColumn(to, n);
        const buffers = to.columns.get(n);
        if (buffers) {
            buffers.next[loc.row] = val;
            buffers.prev[loc.row] = val; // For brand-new placement
            const changed = to.changedNext.get(n);
            if (changed) changed.add(loc.row);
            const written = to.writtenNext.get(n);
            if (written) written.add(loc.row);
        }
    }

    // Remove old row
    removeRow(state, from, oldRow);
};

const addRow = (arch: any, entity: Entity): { arch: any; row: number } => {
    const row = arch.entities.length;
    arch.entities.push(entity);

    // Grow columns
    for (const [cid, { prev, next }] of arch.columns) {
        if (prev.length < arch.entities.length) {
            prev.push(undefined as unknown);
        }
        if (next.length < arch.entities.length) {
            next.push(undefined as unknown);
        }

        const changed = arch.changedNext.get(cid);
        if (changed) changed.add(row);

        const written = arch.writtenNext.get(cid);
        if (written) written.add(row);
    }

    return { arch, row };
};

const removeRow = (state: WorldState, arch: any, row: number): void => {
    const last = arch.entities.length - 1;
    const eLast = arch.entities[last];

    // Swap-remove entity row
    arch.entities[row] = eLast;
    arch.entities.pop();

    for (const [cid, { prev, next }] of arch.columns) {
        prev[row] = prev[last];
        next[row] = next[last];
        prev.pop();
        next.pop();

        const changed = arch.changedNext.get(cid);
        if (changed) {
            changed.add(row);
        }

        const written = arch.writtenNext.get(cid);
        if (written) {
            written.add(row);
        }
    }

    // Update moved entity loc if we swapped different entity
    if (row !== last && eLast !== undefined) {
        const idxLast = eLast & 0xffff;
        state.loc[idxLast] = { arch, row };
    }
};

const swapBuffers = (arch: any): void => {
    for (const [cid, { prev, next }] of arch.columns) {
        // Swap references
        arch.columns.set(cid, { prev: next, next: prev });

        // Promote "this frame changed" → "prev changed"
        const nextChanged = arch.changedNext.get(cid);
        if (nextChanged) {
            arch.changedPrev.set(cid, nextChanged);
            arch.changedNext.set(cid, new Set());
        }

        // Reset coverage bookkeeping
        const written = arch.writtenNext.get(cid);
        if (written) {
            written.clear();
        }
    }
};
