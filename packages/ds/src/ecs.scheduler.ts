// shared/ts/prom-lib/ds/ecs.scheduler.ts
// MIT. Zero deps (uses World from ecs.ts and Graph from graph.ts)

import { World, CommandBuffer, ComponentType, Query } from './ecs.js';
import { Graph } from './graph.js';

export type Stage = 'startup' | 'update' | 'late' | 'render' | 'cleanup';
export const DEFAULT_STAGE_ORDER: Stage[] = ['startup', 'update', 'late', 'render', 'cleanup'];

export type ResourceName = string;

export interface SystemContext {
    world: World;
    dt: number;
    time: number;
    resources: ResourceBag;
    cmd: CommandBuffer;
    stage: Stage;
}

export interface QuerySpec {
    all?: ComponentType<any>[];
    any?: ComponentType<any>[];
    none?: ComponentType<any>[];
    changed?: ComponentType<any>[];
}

export interface SystemSpec {
    name: string;
    stage?: Stage;
    before?: string[]; // run before these
    after?: string[]; // run after these
    reads?: ResourceName[]; // read-only resources
    writes?: ResourceName[]; // write resources (conflicts block parallelism)
    readsComponents?: ComponentType<any>[]; // optional: component reads (for conflict hints)
    writesComponents?: ComponentType<any>[]; // optional: component writes
    query?: (w: World) => QuerySpec; // build once at compile-time
    run(ctx: SystemContext): void | Promise<void>;
    // Optional: skip this system if its query has no matching entities this frame
    skipIfEmpty?: boolean;
}

export type CompiledSystem = SystemSpec & {
    id: string;
    stage: Stage;
    queryMask?: Query; // compiled bitmasks
};

export type Batch = { stage: Stage; systems: CompiledSystem[] };

export interface SchedulePlan {
    stages: Stage[];
    batchesByStage: Map<Stage, Batch[]>; // each batch can run in parallel (conflict-free)
    topoOrder: string[]; // flattened order (for debugging)
}

export class ResourceBag {
    private map = new Map<ResourceName, any>();
    define<T>(name: ResourceName, initial: T): this {
        if (this.map.has(name)) throw new Error(`resource exists: ${name}`);
        this.map.set(name, initial);
        return this;
    }
    get<T>(name: ResourceName): T {
        if (!this.map.has(name)) throw new Error(`missing resource: ${name}`);
        return this.map.get(name);
    }
    set<T>(name: ResourceName, value: T): void {
        if (!this.map.has(name)) throw new Error(`missing resource: ${name}`);
        this.map.set(name, value);
    }
    has(name: ResourceName) {
        return this.map.has(name);
    }
}

export class Scheduler {
    private world: World;
    private systems: SystemSpec[] = [];
    private resources = new ResourceBag();
    private plan?: SchedulePlan;
    private stageOrder: Stage[];

    constructor(world: World, stageOrder: Stage[] = DEFAULT_STAGE_ORDER) {
        this.world = world;
        this.stageOrder = stageOrder.slice();
    }

    resourcesBag() {
        return this.resources;
    }

    register(sys: SystemSpec): this {
        if (!sys.name) throw new Error('system must have a name');
        this.systems.push(sys);
        return this;
    }

    compile(): SchedulePlan {
        // expand & compile queries
        const compiled: CompiledSystem[] = this.systems.map((s) => {
            const stage = s.stage ?? 'update';
            let queryMask: Query | undefined;
            if (s.query) {
                const q = s.query(this.world);
                queryMask = this.world.makeQuery({
                    all: q.all,
                    any: q.any,
                    none: q.none,
                    changed: q.changed,
                });
            }
            return { ...s, id: s.name, stage, queryMask };
        });

        // dependency graph
        const g = new Graph<{ sys: CompiledSystem }, { reason: string }>({
            directed: true,
        });
        const sysMap = new Map<string, CompiledSystem>();
        for (const s of compiled) {
            g.addNode(s.id, { sys: s });
            sysMap.set(s.id, s);
        }

        const stageRank = new Map<Stage, number>(this.stageOrder.map((s, i) => [s, i]));

        // explicit before/after
        for (const s of compiled) {
            for (const a of s.after ?? [])
                if (a !== s.name) g.addEdge(a, s.name, { weight: 1, data: { reason: 'after' } });
            for (const b of s.before ?? [])
                if (b !== s.name) g.addEdge(s.name, b, { weight: 1, data: { reason: 'before' } });
        }

        // stage barriers (later stage depends on earlier stage)
        for (const a of compiled) {
            for (const b of compiled) {
                if (a.id === b.id) continue;
                const ra = stageRank.get(a.stage)!;
                const rb = stageRank.get(b.stage)!;
                if (ra < rb)
                    g.addEdge(a.id, b.id, {
                        weight: 1,
                        data: { reason: `stage:${a.stage}->${b.stage}` },
                    });
            }
        }

        // conflict edges (resources + component write hazards)
        const reads = (s: CompiledSystem) =>
            new Set([...(s.reads ?? []), ...(s.readsComponents ?? []).map((c) => `cmp:${c.id}`)]);
        const writes = (s: CompiledSystem) =>
            new Set([...(s.writes ?? []), ...(s.writesComponents ?? []).map((c) => `cmp:${c.id}`)]);

        for (let i = 0; i < compiled.length; i++) {
            for (let j = i + 1; j < compiled.length; j++) {
                const A = compiled[i],
                    B = compiled[j];
                // same stage only — different stages already ordered
                if (A.stage !== B.stage) continue;

                const rA = reads(A),
                    wA = writes(A);
                const rB = reads(B),
                    wB = writes(B);

                const writeRead = intersects(wA, union(rB, wB)) || intersects(wB, union(rA, wA));
                if (writeRead) {
                    // order: writers before readers; if both write same, tie-break by name
                    const conflictOn =
                        [...intersection(union(wA, wB), union(union(rA, rB), union(wA, wB)))][0] ?? 'unknown';
                    if (intersects(wA, union(rB, wB)) && !intersects(wB, union(rA, wA))) {
                        g.addEdge(A.id, B.id, {
                            weight: 1,
                            data: { reason: `conflict:${conflictOn}` },
                        });
                    } else if (intersects(wB, union(rA, wA)) && !intersects(wA, union(rB, wB))) {
                        g.addEdge(B.id, A.id, {
                            weight: 1,
                            data: { reason: `conflict:${conflictOn}` },
                        });
                    } else {
                        // both write same thing; deterministic order by name
                        const [first, second] = A.id < B.id ? [A, B] : [B, A];
                        g.addEdge(first.id, second.id, {
                            weight: 1,
                            data: { reason: `conflict:${conflictOn}:tie` },
                        });
                    }
                }
            }
        }

        // topo sort
        const order = topoSortGraph(g); // throws if cycle
        // layer into batches by removing edges level-by-level within each stage
        const batchesByStage = new Map<Stage, Batch[]>();
        for (const stage of this.stageOrder) {
            const nodes = order.map((id: string) => sysMap.get(id)!).filter((s) => s.stage === stage);
            // Greedy batching: place systems into earliest batch where no conflicts with batch members
            const batches: Batch[] = [];
            for (const s of nodes) {
                let placed = false;
                for (const b of batches) {
                    if (!conflictsInBatch(b.systems, s)) {
                        b.systems.push(s);
                        placed = true;
                        break;
                    }
                }
                if (!placed) batches.push({ stage, systems: [s] });
            }
            batchesByStage.set(stage, batches);
        }

        this.plan = { stages: this.stageOrder, batchesByStage, topoOrder: order };
        return this.plan;
    }

    async runFrame(dt: number, time: number, { parallel = true } = {}) {
        if (!this.plan) this.compile();
        const cmd = this.world.beginTick();

        try {
            for (const stage of this.plan!.stages) {
                const batches = this.plan!.batchesByStage.get(stage)!;
                for (const batch of batches) {
                    const runOne = async (s: CompiledSystem) => {
                        if (s.skipIfEmpty && s.queryMask) {
                            let any = false;
                            for (const _ of this.world.iter(s.queryMask)) {
                                any = true;
                                break;
                            }
                            if (!any) return;
                        }
                        const ctx: SystemContext = {
                            world: this.world,
                            dt,
                            time,
                            resources: this.resources,
                            cmd,
                            stage,
                        };
                        return s.run(ctx);
                    };
                    if (parallel) {
                        await Promise.all(batch.systems.map(runOne));
                    } else {
                        for (const s of batch.systems) await runOne(s);
                    }
                }
            }
        } finally {
            cmd.flush();
            this.world.endTick();
        }
    }
}

// --- helpers ---
function intersects<T>(a: Set<T>, b: Set<T>): boolean {
    for (const x of a) if (b.has(x)) return true;
    return false;
}
function union<T>(a: Set<T>, b: Set<T>): Set<T> {
    const s = new Set<T>(a);
    for (const x of b) s.add(x);
    return s;
}
function intersection<T>(a: Set<T>, b: Set<T>): Set<T> {
    const s = new Set<T>();
    for (const x of a) if (b.has(x)) s.add(x);
    return s;
}

function topoSortGraph<ND, ED>(g: Graph<ND, ED>): string[] {
    const inDeg = new Map<string | number, number>();
    for (const { id } of g.nodes()) inDeg.set(id, 0);
    for (const { u, v } of g.edges()) inDeg.set(v, (inDeg.get(v) ?? 0) + 1);
    const q: (string | number)[] = [];
    for (const [id, deg] of inDeg) if (deg === 0) q.push(id);
    const order: (string | number)[] = [];
    while (q.length) {
        const u = q.shift()!;
        order.push(u);
        for (const [v] of g.neighbors(u)) {
            inDeg.set(v, inDeg.get(v)! - 1);
            if (inDeg.get(v) === 0) q.push(v);
        }
    }
    if (order.length !== inDeg.size) throw new Error('cycle detected');
    return order.map((x) => String(x));
}
function conflictsInBatch(existing: CompiledSystem[], candidate: CompiledSystem): boolean {
    const rC = new Set([...(candidate.reads ?? []), ...(candidate.readsComponents ?? []).map((c) => `cmp:${c.id}`)]);
    const wC = new Set([...(candidate.writes ?? []), ...(candidate.writesComponents ?? []).map((c) => `cmp:${c.id}`)]);
    for (const e of existing) {
        const rE = new Set([...(e.reads ?? []), ...(e.readsComponents ?? []).map((c) => `cmp:${c.id}`)]);
        const wE = new Set([...(e.writes ?? []), ...(e.writesComponents ?? []).map((c) => `cmp:${c.id}`)]);
        const conflict = intersects(wC, union(rE, wE)) || intersects(wE, union(rC, wC));
        if (conflict) return true;
    }
    return false;
}
