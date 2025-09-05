---
uuid: f4767ec9-7363-4ca0-ad88-ccc624247a3b
created_at: ecs-scheduler-and-prefabs.md
filename: ecs-scheduler
title: ecs-scheduler
description: >-
  Implements a resource-aware system scheduler for ECS with dependency
  management and conflict-free batching. Handles stages, resource tracking, and
  system execution order.
tags:
  - ecs
  - scheduler
  - resource
  - dependency
  - batching
  - prefabs
related_to_uuid:
  - 7ab1a3cd-80a7-4d69-ae21-1da07cd0523c
  - c62a1815-c43b-4a3b-88e6-d7fa008a155e
  - 6f13f134-7536-4bc3-b695-5aaa2906bb9d
  - cdf2c6e4-0dbd-4f19-b645-ac619a6f267d
  - cfa2be7b-13fd-404b-aaa4-80abc4fa8cd2
  - 972c820f-63a8-49c6-831f-013832195478
  - 8f4c1e86-1236-4936-84ca-6ed7082af6b7
  - 0c501d52-ba38-42aa-ad25-2d78425dfaff
  - aa88652d-c8e5-4a1b-850e-afdf7fe15dae
  - abe9ec8d-5a0f-42c5-b2ab-a2080c86d70c
  - 21913df0-a1c6-4ba0-a9e9-8ffc35a71d74
  - a69259b4-4260-4877-bd79-22c432e1f85f
  - 4316c3f9-551f-4872-b5c5-98ae73508535
  - 50ac7389-a75e-476a-ab34-bb24776d4f38
  - bb4f4ed0-91f3-488a-9d64-3a33bde77e4e
  - 7842d43c-7d13-46f0-bdf1-561f5e4c6f53
  - c46718fe-73dd-4236-8f1c-f6565da58cc4
  - c0e6ea38-a9a0-4379-aa9c-b634a6591a59
  - 46b3c583-a4e2-4ecc-90de-6fd104da23db
  - 2478e18c-f621-4b0c-a4c5-9637d213cccf
  - c09d7688-71d6-47fc-bf81-86b6193c84bc
  - 004a0f06-3808-4421-b9e1-41b5b41ebcb8
  - 0f203aa7-c96d-4323-9b9e-bbc438966e8c
  - e4317155-7fa6-44e8-8aee-b72384581790
  - d65e5b6c-29ed-458f-bf9b-94bf0d48fa79
related_to_title:
  - system-scheduler
  - ecs-scheduler-and-prefabs
  - shared-package-layout-clarification
  - Unique Info Dump Index
  - prompt-folder-bootstrap
  - archetype-ecs
  - dynamic-context-model-for-web-components
  - Promethean Web UI Setup
  - RAG UI Panel with Qdrant and PostgREST
  - Graph Data Structure
  - polyglot-s-expr-bridge-python-js-lisp-interop
  - WebSocket Gateway Implementation
  - promethean-full-stack-docker-setup
  - chroma-embedding-refactor
  - promethean-infrastructure-setup
  - shared-package-structure
  - board-walk-2025-08-11
  - Promethean Event Bus MVP
  - Cross-Language Runtime Polymorphism
  - Migrate to Provider-Tenant Architecture
  - ecs-offload-workers
  - schema-evolution-workflow
  - TypeScript Patch for Tool Calling Support
  - sibilant-macro-targets
references:
  - uuid: 7ab1a3cd-80a7-4d69-ae21-1da07cd0523c
    line: 311
    col: 0
    score: 1
  - uuid: 7ab1a3cd-80a7-4d69-ae21-1da07cd0523c
    line: 343
    col: 0
    score: 1
  - uuid: 7ab1a3cd-80a7-4d69-ae21-1da07cd0523c
    line: 1
    col: 0
    score: 0.99
  - uuid: 7ab1a3cd-80a7-4d69-ae21-1da07cd0523c
    line: 245
    col: 0
    score: 0.99
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 379
    col: 0
    score: 0.97
  - uuid: 7ab1a3cd-80a7-4d69-ae21-1da07cd0523c
    line: 358
    col: 0
    score: 0.93
  - uuid: 6f13f134-7536-4bc3-b695-5aaa2906bb9d
    line: 128
    col: 0
    score: 0.9
  - uuid: 6f13f134-7536-4bc3-b695-5aaa2906bb9d
    line: 108
    col: 0
    score: 0.9
  - uuid: 6f13f134-7536-4bc3-b695-5aaa2906bb9d
    line: 111
    col: 0
    score: 0.9
  - uuid: 7ab1a3cd-80a7-4d69-ae21-1da07cd0523c
    line: 340
    col: 0
    score: 0.9
  - uuid: 6f13f134-7536-4bc3-b695-5aaa2906bb9d
    line: 80
    col: 0
    score: 0.88
  - uuid: cdf2c6e4-0dbd-4f19-b645-ac619a6f267d
    line: 41
    col: 0
    score: 0.87
  - uuid: 8f4c1e86-1236-4936-84ca-6ed7082af6b7
    line: 367
    col: 0
    score: 0.87
  - uuid: 972c820f-63a8-49c6-831f-013832195478
    line: 367
    col: 0
    score: 0.87
  - uuid: cfa2be7b-13fd-404b-aaa4-80abc4fa8cd2
    line: 129
    col: 0
    score: 0.87
  - uuid: 0c501d52-ba38-42aa-ad25-2d78425dfaff
    line: 336
    col: 0
    score: 0.85
---
Note: Consolidated here → ../notes/js/ecs-scheduler-and-prefabs.md ^ref-c62a1815-1-0

Heck yes—let’s wire a **real system scheduler** on top of the ECS you’ve got, plus **resources**, **dependency graph**, **conflict-aware batching**, and **prefabs/blueprints**. Paste these under `shared/js/prom-lib/ds/`. ^ref-c62a1815-3-0

# 1) System Scheduler (archetype ECS + resource-aware DAG)

```ts
// shared/js/prom-lib/ds/ecs.scheduler.ts
// MIT. Zero deps (uses your World from ecs.ts and Graph from graph.ts)

import { World, CommandBuffer, ComponentType, Query } from "./ecs";
import { Graph } from "./graph";

export type Stage = "startup" | "update" | "late" | "render" | "cleanup";
export const DEFAULT_STAGE_ORDER: Stage[] = ["startup","update","late","render","cleanup"];

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
  before?: string[];                 // run before these
  after?: string[];                  // run after these
  reads?: ResourceName[];            // read-only resources
  writes?: ResourceName[];           // write resources (conflicts block parallelism)
  readsComponents?: ComponentType<any>[];   // optional: component reads (for conflict hints)
  writesComponents?: ComponentType<any>[];  // optional: component writes
  query?: (w: World) => QuerySpec;   // build once at compile-time
  run(ctx: SystemContext): void | Promise<void>;
  // Optional: skip this system if its query has no matching entities this frame
  skipIfEmpty?: boolean;
}

export type CompiledSystem = SystemSpec & {
  id: string;
  stage: Stage;
  queryMask?: Query;                 // compiled bitmasks
};

export type Batch = { stage: Stage; systems: CompiledSystem[] };

export interface SchedulePlan {
  stages: Stage[];
  batchesByStage: Map<Stage, Batch[]>; // each batch can run in parallel (conflict-free)
  topoOrder: string[];                 // flattened order (for debugging)
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
  has(name: ResourceName) { return this.map.has(name); }
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

  resourcesBag() { return this.resources; }

  register(sys: SystemSpec): this {
    if (!sys.name) throw new Error("system must have a name");
    this.systems.push(sys);
    return this;
  }

  compile(): SchedulePlan {
    // expand & compile queries
    const compiled: CompiledSystem[] = this.systems.map(s => {
      const stage = s.stage ?? "update";
      let queryMask: Query | undefined;
      if (s.query) {
        const q = s.query(this.world);
        queryMask = this.world.makeQuery({
          all: q.all, any: q.any, none: q.none, changed: q.changed
        });
      }
      return { ...s, id: s.name, stage, queryMask };
    });

    // barrier edges for stage order
    const stageRank = new Map<Stage, number>(this.stageOrder.map((s, i) => [s, i]));

    // dependency graph
    const g = new Graph<{ sys: CompiledSystem }, { reason: string }>({ directed: true });
    for (const s of compiled) g.addNode(s.id, { sys: s });

    // explicit before/after
    for (const s of compiled) {
      for (const a of (s.after ?? [])) if (a !== s.name) g.addEdge(a, s.name, { data: { reason: "after" }});
      for (const b of (s.before ?? [])) if (b !== s.name) g.addEdge(s.name, b, { data: { reason: "before" }});
    }

    // stage barriers (later stage depends on earlier stage)
    for (const a of compiled) {
      for (const b of compiled) {
        if (a.id === b.id) continue;
        const ra = stageRank.get(a.stage)!;
        const rb = stageRank.get(b.stage)!;
        if (ra < rb) g.addEdge(a.id, b.id, { data: { reason: `stage:${a.stage}->${b.stage}` }});
      }
    }

    // conflict edges (resources + component write hazards)
    const reads = (s: CompiledSystem) => new Set([...(s.reads ?? []), ...(s.readsComponents ?? []).map(c => `cmp:${c.id}`)]);
    const writes = (s: CompiledSystem) => new Set([...(s.writes ?? []), ...(s.writesComponents ?? []).map(c => `cmp:${c.id}`)]);

    for (let i=0;i<compiled.length;i++) {
      for (let j=i+1;j<compiled.length;j++) {
        const A = compiled[i], B = compiled[j];
        // same stage only — different stages already ordered
        if (A.stage !== B.stage) continue;

        const rA = reads(A), wA = writes(A);
        const rB = reads(B), wB = writes(B);

        const writeRead = intersects(wA, union(rB, wB)) || intersects(wB, union(rA, wA));
        if (writeRead) {
          // order: writers before readers; if both write same, tie-break by name
          const conflictOn = [...intersection(union(wA,wB), union(rA,rB,wA,wB))][0] ?? "unknown";
          if (intersects(wA, union(rB, wB)) && !intersects(wB, union(rA, wA))) {
            g.addEdge(A.id, B.id, { data: { reason: `conflict:${conflictOn}` }});
          } else if (intersects(wB, union(rA, wA)) && !intersects(wA, union(rB, wB))) {
            g.addEdge(B.id, A.id, { data: { reason: `conflict:${conflictOn}` }});
          } else {
            // both write same thing; deterministic order by name
            const [first, second] = A.id < B.id ? [A, B] : [B, A];
            g.addEdge(first.id, second.id, { data: { reason: `conflict:${conflictOn}:tie` }});
          }
        }
      }
    }

    // topo sort
    const order = g.topologicalSort(); // throws if cycle
    // layer into batches by removing edges level-by-level within each stage
    const batchesByStage = new Map<Stage, Batch[]>();
    for (const stage of this.stageOrder) {
      const nodes = order
        .map(id => g.getNode(id)?.data?.sys as CompiledSystem)
        .filter(s => s.stage === stage);
      // Greedy batching: place systems into earliest batch where no conflicts with batch members
      const batches: Batch[] = [];
      for (const s of nodes) {
        let placed = false;
        for (const b of batches) {
          if (!conflictsInBatch(b.systems, s)) {
            b.systems.push(s); placed = true; break;
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
          // Optionally skip systems with empty queries
          const runOne = async (s: CompiledSystem) => {
            if (s.skipIfEmpty && s.queryMask) {
              let any = false;
              for (const _ of this.world.iter(s.queryMask)) { any = true; break; }
              if (!any) return;
            }
            const ctx: SystemContext = { world: this.world, dt, time, resources: this.resources, cmd, stage };
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
function intersects<T>(a: Set<T>, b: Set<T>): boolean { for (const x of a) if (b.has(x)) return true; return false; }
function union<T>(a: Set<T>, b: Set<T>): Set<T> { const s = new Set<T>(a); for (const x of b) s.add(x); return s; }
function intersection<T>(a: Set<T>, b: Set<T>): Set<T> { const s = new Set<T>(); for (const x of a) if (b.has(x)) s.add(x); return s; }
function conflictsInBatch(existing: CompiledSystem[], candidate: CompiledSystem): boolean {
  const rC = new Set([...(candidate.reads ?? []), ...(candidate.readsComponents ?? []).map(c => `cmp:${c.id}`)]);
  const wC = new Set([...(candidate.writes ?? []), ...(candidate.writesComponents ?? []).map(c => `cmp:${c.id}`)]);
  for (const e of existing) {
    const rE = new Set([...(e.reads ?? []), ...(e.readsComponents ?? []).map(c => `cmp:${c.id}`)]);
    const wE = new Set([...(e.writes ?? []), ...(e.writesComponents ?? []).map(c => `cmp:${c.id}`)]);
    const conflict = intersects(wC, union(rE, wE)) || intersects(wE, union(rC, wC));
    if (conflict) return true;
  }
  return false;
}
```
^ref-c62a1815-7-0

## Tiny usage
 ^ref-c62a1815-246-0
```ts
import { World } from "./ecs";
import { Scheduler } from "./ecs.scheduler";

type Position = {x:number;y:number};
type Velocity = {x:number;y:number};
type Lifetime = {t:number};

const world = new World();
const CPos = world.defineComponent<Position>({ name:"Pos", defaults:()=>({x:0,y:0}) });
const CVel = world.defineComponent<Velocity>({ name:"Vel", defaults:()=>({x:0,y:0}) });
const CLife = world.defineComponent<Lifetime>({ name:"Life", defaults:()=>({t:1}) });

const sched = new Scheduler(world);
sched.resourcesBag().define("frame", { count: 0 });

sched
  .register({
    name: "physics",
    stage: "update",
    reads: ["frame"], writesComponents: [CPos],
    query: w => ({ all:[CPos, CVel] }),
    run: ({ world, dt }) => {
      const q = world.makeQuery({ all:[CPos, CVel] });
      for (const [e, _get, pos, vel] of world.iter(q, CPos, CVel)) {
        pos!.x += vel!.x * dt; pos!.y += vel!.y * dt;
        world.set(e, CPos, pos!);
      }
    }
  })
  .register({
    name: "decay",
    stage: "update",
    writesComponents: [CLife],
    query: w => ({ all:[CLife] }),
    run: ({ world, dt }) => {
      const q = world.makeQuery({ all:[CLife] });
      for (const [e, _get, life] of world.iter(q, CLife)) {
        life!.t -= dt;
        if (life!.t <= 0) world.destroyEntity(e);
        else world.set(e, CLife, life!);
      }
    }
  })
  .register({
    name: "render",
    stage: "render",
    readsComponents: [CPos],
    query: w => ({ all:[CPos], changed:[CPos] }),
    skipIfEmpty: true,
    after: ["physics"], // explicit
    run: ({ world }) => {
      const q = world.makeQuery({ all:[CPos], changed:[CPos] });
      for (const [e, _get, pos] of world.iter(q, CPos)) {
        // draw pos...
      }
    }
  });

await sched.runFrame(0.016, performance.now());
^ref-c62a1815-246-0
```
^ref-c62a1815-247-0

# 2) Prefabs / Blueprints ^ref-c62a1815-310-0
 ^ref-c62a1815-312-0
```ts
// shared/js/prom-lib/ds/ecs.prefab.ts
import { World, ComponentType } from "./ecs";

export type BlueprintStep<T=any> = { c: ComponentType<T>, v?: T | ((i: number) => T) };
export interface Blueprint {
  name: string;
  steps: BlueprintStep[];
}

export function makeBlueprint(name: string, steps: BlueprintStep[]): Blueprint {
  return { name, steps };
}

export function spawn(world: World, bp: Blueprint, count = 1, overrides?: Partial<Record<number, any>>): number[] {
  const ids: number[] = [];
  for (let i=0;i<count;i++) {
    const e = world.createEntity();
    for (const s of bp.steps) {
      const val = typeof s.v === "function" ? (s.v as any)(i) : s.v;
      world.addComponent(e, s.c as any, overrides?.[s.c.id] ?? val);
    }
    ids.push(e);
  }
  return ids;
^ref-c62a1815-310-0
} ^ref-c62a1815-338-0
^ref-c62a1815-312-0 ^ref-c62a1815-340-0
```
 ^ref-c62a1815-340-0 ^ref-c62a1815-342-0
**Usage:**

```ts
import { makeBlueprint, spawn } from "./ecs.prefab";
const Bullet = makeBlueprint("Bullet", [
  { c: CPos, v: (i)=>({x:i*10, y:0}) },
  { c: CVel, v: {x:0,y:100} },
  { c: CLife, v: {t:2} }
^ref-c62a1815-340-0
]);
^ref-c62a1815-343-0 ^ref-c62a1815-353-0
spawn(world, Bullet, 100); // spawns 100 bullets fast
```
^ref-c62a1815-352-0

# 3) Visual: system graph (you’ll see batches)

```mermaid
flowchart LR
  subgraph update
    physics --> decay
  end
  subgraph render
    render
^ref-c62a1815-352-0
  end ^ref-c62a1815-364-0
  classDef stage fill:#eef,stroke:#55f,color:#000;
  class render,physics,decay stage; ^ref-c62a1815-370-0
^ref-c62a1815-364-0 ^ref-c62a1815-368-0
```
^ref-c62a1815-364-0

*(In practice the scheduler builds a full DAG and packs conflict-free systems into parallel **batches** per stage.)*
 ^ref-c62a1815-376-0
# 4) Sibilant sprinkles (pseudo)

```lisp
; shared/sibilant/prom/ds/ecs-scheduler.sib (pseudo)
(defn scheduler [world] (new Scheduler world))
^ref-c62a1815-368-0
(defn sys [name stage query reads writes run]
  {:name name :stage stage :query query :reads reads :writes writes :run run})
(defn add-sys! [sched sys] (.register sched sys)) ^ref-c62a1815-379-0
^ref-c62a1815-381-0 ^ref-c62a1815-382-0
^ref-c62a1815-379-0 ^ref-c62a1815-383-0
(defn tick! [sched dt t] (.runFrame sched dt t))
^ref-c62a1815-385-0 ^ref-c62a1815-386-0
^ref-c62a1815-383-0 ^ref-c62a1815-387-0
^ref-c62a1815-382-0 ^ref-c62a1815-388-0
^ref-c62a1815-376-0
^ref-c62a1815-381-0 ^ref-c62a1815-389-0
^ref-c62a1815-379-0 ^ref-c62a1815-390-0
``` ^ref-c62a1815-381-0 ^ref-c62a1815-385-0
^ref-c62a1815-379-0
^ref-c62a1815-385-0
^ref-c62a1815-383-0 ^ref-c62a1815-393-0
^ref-c62a1815-382-0
^ref-c62a1815-381-0 ^ref-c62a1815-395-0
^ref-c62a1815-379-0 ^ref-c62a1815-396-0
^ref-c62a1815-376-0 ^ref-c62a1815-397-0
 ^ref-c62a1815-382-0 ^ref-c62a1815-386-0 ^ref-c62a1815-398-0
--- ^ref-c62a1815-383-0 ^ref-c62a1815-387-0 ^ref-c62a1815-393-0 ^ref-c62a1815-399-0
 ^ref-c62a1815-388-0 ^ref-c62a1815-400-0
If you want, I can add: ^ref-c62a1815-385-0 ^ref-c62a1815-389-0 ^ref-c62a1815-395-0
 ^ref-c62a1815-386-0 ^ref-c62a1815-390-0 ^ref-c62a1815-396-0 ^ref-c62a1815-402-0
* a **worker\_threads** pool for true parallel execution, ^ref-c62a1815-387-0 ^ref-c62a1815-397-0
* a **timeline tracer** (per-system duration, Gantt output), ^ref-c62a1815-388-0 ^ref-c62a1815-398-0
* or a **hot-reload** API to add/remove systems at runtime without full recompiles.
^ref-c62a1815-383-0 ^ref-c62a1815-393-0
^ref-c62a1815-382-0
^ref-c62a1815-381-0 ^ref-c62a1815-395-0
^ref-c62a1815-379-0 ^ref-c62a1815-396-0
^ref-c62a1815-376-0 ^ref-c62a1815-397-0
 ^ref-c62a1815-382-0 ^ref-c62a1815-386-0 ^ref-c62a1815-398-0
--- ^ref-c62a1815-383-0 ^ref-c62a1815-387-0 ^ref-c62a1815-393-0 ^ref-c62a1815-399-0
 ^ref-c62a1815-388-0 ^ref-c62a1815-400-0
If you want, I can add: ^ref-c62a1815-385-0 ^ref-c62a1815-389-0 ^ref-c62a1815-395-0
 ^ref-c62a1815-386-0 ^ref-c62a1815-390-0 ^ref-c62a1815-396-0 ^ref-c62a1815-402-0
* a **worker\_threads** pool for true parallel execution, ^ref-c62a1815-387-0 ^ref-c62a1815-397-0
* a **timeline tracer** (per-system duration, Gantt output), ^ref-c62a1815-388-0 ^ref-c62a1815-398-0
* or a **hot-reload** API to add/remove systems at runtime without full recompiles.
