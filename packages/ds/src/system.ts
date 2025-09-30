// ecs/strict-system.ts
import type { World, Entity, ComponentType, Query } from './ecs.js';

export type SystemSpec = {
    name: string;
    reads?: ComponentType<any>[];
    owns?: ComponentType<any>[]; // only these can be written by this system
    query: (w: World) => Query; // the selection this system iterates
    prepare?: (dt: number) => void | Promise<void>;
    cleanup?: () => void | Promise<void>;
    run: (ctx: SystemCtx, dt: number) => void | Promise<void>;
};

export type SystemCtx = {
    world: World;
    get: <T>(e: Entity, c: ComponentType<T>) => T | undefined;
    set: <T>(e: Entity, c: ComponentType<T>, v: T) => void;
    setIfChanged: <T>(e: Entity, c: ComponentType<T>, v: T) => void;
    carry: <T>(e: Entity, c: ComponentType<T>) => void;
    iter: World['iter']; // base iterator (for custom modes)
    iterAll: <T extends any[]>(...cs: { [K in keyof T]: ComponentType<T[K]> }) => IterableIterator<[Entity, ...T]>;
    iterPacked: <T extends any[]>(opts: {
        comps: { [K in keyof T]: ComponentType<T[K]> };
        block?: number;
    }) => IterableIterator<{ rows: number[]; cols: any[][] }>;
    entityIter: <T extends Record<string, ComponentType<any>>>(map: T) => IterableIterator<[Entity, ViewsOf<T>]>;
};

type ViewsOf<T extends Record<string, ComponentType<any>>> = {
    [K in keyof T]: { read(): any; write(v: any): void; carry(): void };
};
// ecs/iters.ts

export function* iterAll<T extends any[]>(
    w: World,
    q: Query,
    comps: { [K in keyof T]: ComponentType<T[K]> },
): IterableIterator<[Entity, ...T]> {
    // single pass: pull each comp once per row
    for (const [e, get] of w.iter(q)) {
        const tuple = comps.map((c: ComponentType<T[number]>) => get(c)) as T;
        yield [e, ...tuple];
    }
}
export function* entityIter<T extends Record<string, ComponentType<any>>>(
    w: World,
    q: Query,
    compMap: T,
): IterableIterator<[Entity, ViewsOf<T>]> {
    const keys = Object.keys(compMap) as (keyof T)[];
    for (const [e, get] of w.iter(q)) {
        const views = {} as ViewsOf<T>;
        for (const k of keys) {
            const c = compMap[k];
            views[k] = {
                read: () => get(c),
                write: (v: any) => w.set(e, c, v),
                carry: () => w.carry(e, c),
            };
        }
        yield [e, views];
    }
}
export function* iterPacked(
    w: World,
    q: Query,
    comps: ComponentType<any>[],
    block = 256,
): IterableIterator<{ rows: number[]; cols: any[][]; ents: number[] }> {
    // Collect per-archetype, then yield in chunks
    for (const arch of (w as any).archetypes.values()) {
        const mask = arch.mask as bigint;
        if (q.all && (mask & q.all) !== q.all) continue;
        if (q.any && q.any !== 0n && (mask & q.any) === 0n) continue;
        if (q.none && (mask & q.none) !== 0n) continue;

        const ents = arch.entities as number[];
        const rows = ents.map((_, i) => i);
        const cols = comps.map((c) => {
            const [prev, next] = arch.columns.get(c.id)!; // double buffer
            return [prev, next];
        });

        for (let i = 0; i < rows.length; i += block) {
            const slice = rows.slice(i, i + block);
            yield { rows: slice, cols, ents };
        }
    }
}

export function makeStrictSystem(w: World, spec: SystemSpec) {
    const ownIds = new Set((spec.owns ?? []).map((c) => c.id));

    // safety wrapper
    const ctx: SystemCtx = {
        world: w,
        get: w.get.bind(w),
        carry: (e: Entity, c: ComponentType<any>) => {
            assertOwn(c, 'carry');
            w.carry(e, c);
        },
        set: (e: Entity, c: ComponentType<any>, v: any) => {
            assertOwn(c, 'set');
            w.set(e, c, v);
        },
        setIfChanged: (e: Entity, c: ComponentType<any>, v: any) => {
            assertOwn(c, 'setIfChanged');
            w.setIfChanged(e, c, v);
        },
        iter: w.iter.bind(w),
        iterAll: ((...cs: any[]) => iterAll(w, spec.query(w), cs as any)) as unknown as SystemCtx['iterAll'],
        iterPacked: ({ comps, block = 256 }: any) => iterPacked(w, spec.query(w), comps, block),
        entityIter: (compMap: any) => entityIter(w, spec.query(w), compMap),
    };

    function assertOwn(c: ComponentType<any>, op: string) {
        if (!ownIds.has(c.id)) {
            throw new Error(`[${spec.name}] ${op} on non-owned component '${c.name}'`);
        }
    }

    return async (dt: number) => {
        if (spec.prepare) await spec.prepare(dt);
        await spec.run(ctx, dt); // your one pass lives here
        if (spec.cleanup) await spec.cleanup();
    };
}

export function assertDisjointOwnership(systems: ReturnType<typeof makeStrictSystem>[], specs: SystemSpec[]) {
    void systems;
    const owners = new Map<number, string>();
    for (const s of specs)
        for (const c of s.owns ?? []) {
            const seen = owners.get(c.id);
            if (seen)
                throw new Error(
                    `Ownership conflict: '${seen}' and '${specs.find((x) => x.owns?.some((o) => o.id === c.id))
                        ?.name}' both own '${c.name}'`,
                );
            owners.set(c.id, specs.find((x) => x.owns?.some((o) => o.id === c.id))!.name);
        }
}
// ecs/typed.ts
export type BufferCtor<T extends ArrayBufferView> = {
    new (buf: ArrayBufferLike): T;
    BYTES_PER_ELEMENT: number;
};

export type NumericComponentSpec<T extends ArrayBufferView> = {
    name: string;
    buffer: BufferCtor<T>; // e.g., Float32Array
    arity: number; // scalars=1, vec2=2, vec3=3, etc.
    defaults?: () => number[]; // per element defaults
};

export function defineNumericComponent<T extends ArrayBufferView>(w: World, spec: NumericComponentSpec<T>) {
    void w;
    void spec;
    // Under the hood we still store arrays of values,
    // but for speed you can allocate backing SABs and slice them per row.
    // If you want full raw typed arrays per component, you can replace the column store
    // with (prev: T, next: T) that you index by stride.
}
// ecs/pool.ts
export class Pool<T extends { clear(): void }> {
    private free: T[] = [];
    constructor(private create: () => T) {}
    spawn(): T {
        return this.free.pop() ?? this.create();
    }
    despawn(obj: T) {
        obj.clear();
        this.free.push(obj);
    }
}
// ecs/entity-ref.ts
export class EntityRef {
    world!: World;
    e!: Entity;
    comps!: Record<string, ComponentType<any>>;
    init(world: World, e: Entity, comps: Record<string, ComponentType<any>>) {
        this.world = world;
        this.e = e;
        this.comps = comps;
        return this;
    }
    get<K extends string>(k: K) {
        return this.world.get(this.e, this.comps[k]);
    }
    set<K extends string>(k: K, v: any) {
        this.world.set(this.e, this.comps[k], v);
    }
    carry<K extends string>(k: K) {
        this.world.carry(this.e, this.comps[k]);
    }
    clear() {
        this.world = null as any;
        this.e = 0 as any;
        this.comps = {} as any;
    }
}

// ecs/scheduler.ts
export function makeScheduler(w: World, systems: ReturnType<typeof makeStrictSystem>[]) {
    return async function tick(dt = 16) {
        w.beginTick();
        await Promise.all(systems.map((s) => s(dt))); // parallel
        w.endTick();
    };
}
// ecs/facade.ts
export const Spawnable = Pool; // semantic alias

export function Component(spec: any) {
    return (w: World) => w.defineComponent(spec);
}

export function System(specIn: SystemSpec) {
    return (w: World) => makeStrictSystem(w, specIn);
}

export function EntityGroup(name: string, comps: ComponentType<any>[], w: World) {
    void name;
    const q = w.makeQuery({ all: comps });
    return {
        spawn: () => {
            /* create + add all comps */
        },
        each: (fn: (e: Entity) => void) => {
            for (const [e] of w.iter(q)) fn(e);
        },
    };
}
