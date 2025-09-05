---
uuid: 7ab1a3cd-80a7-4d69-ae21-1da07cd0523c
created_at: system-scheduler-with-resource-aware-dag.md
filename: system-scheduler
title: system-scheduler
description: >-
  A resource-aware system scheduler for ECS that handles dependency graphs,
  conflict-free batching, and prefab management. It supports stage-based
  execution with startup, update, late, render, and cleanup phases.
tags:
  - ecs
  - scheduler
  - resource-aware
  - dependency-graph
  - batching
  - prefabs
related_to_uuid:
  - c62a1815-c43b-4a3b-88e6-d7fa008a155e
  - 6620e2f2-de6d-45d8-a722-5d26e160b370
  - a4a25141-6380-40b9-9cd7-b554b246b303
  - 22b989d5-f4aa-4880-8632-709c21830f83
  - 2792d448-c3b5-4050-93dd-93768529d99c
  - 1f32c94a-4da4-4266-8ac0-6c282cfb401f
  - e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
  - fc21f824-4244-4030-a48e-c4170160ea1d
  - dd00677a-2280-45a7-91af-0728b21af3ad
  - 5e408692-0e74-400e-a617-84247c7353ad
  - 291c7d91-da8c-486c-9bc0-bd2254536e2d
  - dd89372d-10de-42a9-8c96-6bc13ea36d02
  - 64a9f9f9-58ee-4996-bdaf-9373845c6b29
  - babdb9eb-3b15-48a7-8a22-ecc53af7d397
  - 37b5d236-2b3e-4a95-a4e8-31655c3023ef
  - ffb9b2a9-744d-4a53-9565-130fceae0832
  - ad7f1ed3-c9bf-4e85-9eeb-6cc4b53155f3
  - 7b7ca860-780c-44fa-8d3f-be8bd9496fba
  - d144aa62-348c-4e5d-ae8f-38084c67ceca
  - 62bec6f0-4e13-4f38-aca4-72c84ba02367
  - 0f6f8f38-98d0-438f-9601-58f478acc0b7
  - e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
  - 18138627-a348-4fbb-b447-410dfb400564
  - 13951643-1741-46bb-89dc-1beebb122633
  - 1cfae310-35dc-49c2-98f1-b186da25d84b
related_to_title:
  - ecs-scheduler-and-prefabs
  - graph-ds
  - Functional Embedding Pipeline Refactor
  - field-node-diagram-set
  - Docops Feature Updates
  - field-node-diagram-outline
  - field-node-diagram-visualizations
  - Fnord Tracer Protocol
  - heartbeat-fragment-demo
  - i3-bluetooth-setup
  - Ice Box Reorganization
  - komorebi-group-window-hack
  - Layer1SurvivabilityEnvelope
  - Recursive Prompt Construction Engine
  - homeostasis-decay-formulas
  - obsidian-ignore-node-modules-regex
  - Local-Offline-Model-Deployment-Strategy
  - TypeScript Patch for Tool Calling Support
  - Model Selection for Lightweight Conversational Tasks
  - zero-copy-snapshots-and-workers
  - windows-tiling-with-autohotkey
  - ParticleSimulationWithCanvasAndFFmpeg
  - The Jar of Echoes
  - Duck's Attractor States
  - Functional Refactor of TypeScript Document Processing
references:
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 7
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 226
    col: 0
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 705
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 719
    col: 0
    score: 1
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 601
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 1060
    col: 0
    score: 1
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 726
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 996
    col: 0
    score: 1
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 667
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 736
    col: 0
    score: 1
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 645
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 739
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 816
    col: 0
    score: 1
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 312
    col: 0
    score: 1
  - uuid: babdb9eb-3b15-48a7-8a22-ecc53af7d397
    line: 4
    col: 0
    score: 1
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 247
    col: 0
    score: 0.99
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 304
    col: 0
    score: 0.94
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 209
    col: 0
    score: 0.94
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 394
    col: 0
    score: 0.94
  - uuid: ad7f1ed3-c9bf-4e85-9eeb-6cc4b53155f3
    line: 232
    col: 0
    score: 0.93
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 690
    col: 0
    score: 0.91
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 363
    col: 0
    score: 0.91
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 255
    col: 0
    score: 0.91
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 2421
    col: 0
    score: 0.88
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 2445
    col: 0
    score: 0.88
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 5039
    col: 0
    score: 0.88
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 2157
    col: 0
    score: 0.88
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 11209
    col: 0
    score: 0.88
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 11675
    col: 0
    score: 0.88
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 7117
    col: 0
    score: 0.88
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 7118
    col: 0
    score: 0.88
  - uuid: 8f4c1e86-1236-4936-84ca-6ed7082af6b7
    line: 367
    col: 0
    score: 0.87
  - uuid: b6ae7dfa-0c53-4eb9-aea8-65072b825bee
    line: 40
    col: 0
    score: 0.87
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 340
    col: 0
    score: 0.86
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 342
    col: 0
    score: 0.86
  - uuid: af5d2824-faad-476c-a389-e912d9bc672c
    line: 120
    col: 0
    score: 0.86
  - uuid: 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
    line: 527
    col: 0
    score: 0.85
  - uuid: 40e05c14-0db0-44c5-bf0a-2eece2f4c2a4
    line: 50
    col: 0
    score: 0.85
---
Heck yes—let’s wire a **real system scheduler** on top of the ECS you’ve got, plus **resources**, **dependency graph**, **conflict-aware batching**, and **prefabs/blueprints**. Paste these under `shared/js/prom-lib/ds/`. ^ref-ba244286-1-0

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
^ref-ba244286-5-0

## Tiny usage
 ^ref-ba244286-244-0
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
^ref-ba244286-244-0
```
^ref-ba244286-245-0

# 2) Prefabs / Blueprints ^ref-ba244286-308-0
 ^ref-ba244286-310-0
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
^ref-ba244286-308-0
} ^ref-ba244286-336-0
^ref-ba244286-310-0
```
 ^ref-ba244286-338-0 ^ref-ba244286-340-0
**Usage:** ^ref-ba244286-341-0

```ts
import { makeBlueprint, spawn } from "./ecs.prefab";
const Bullet = makeBlueprint("Bullet", [
  { c: CPos, v: (i)=>({x:i*10, y:0}) },
  { c: CVel, v: {x:0,y:100} },
  { c: CLife, v: {t:2} }
^ref-ba244286-338-0
]);
^ref-ba244286-341-0
spawn(world, Bullet, 100); // spawns 100 bullets fast
```
^ref-ba244286-350-0

# 3) Visual: system graph (you’ll see batches)

```mermaid
flowchart LR
  subgraph update
    physics --> decay
  end
  subgraph render
    render
^ref-ba244286-350-0
  end ^ref-ba244286-362-0
  classDef stage fill:#eef,stroke:#55f,color:#000;
  class render,physics,decay stage;
^ref-ba244286-362-0 ^ref-ba244286-366-0
``` ^ref-ba244286-370-0
^ref-ba244286-358-0
^ref-ba244286-362-0

*(In practice the scheduler builds a full DAG and packs conflict-free systems into parallel **batches** per stage.)* ^ref-ba244286-374-0

# 4) Sibilant sprinkles (pseudo)

```lisp
; shared/sibilant/prom/ds/ecs-scheduler.sib (pseudo)
(defn scheduler [world] (new Scheduler world))
^ref-ba244286-366-0
(defn sys [name stage query reads writes run]
  {:name name :stage stage :query query :reads reads :writes writes :run run})
(defn add-sys! [sched sys] (.register sched sys)) ^ref-ba244286-377-0
^ref-ba244286-379-0 ^ref-ba244286-380-0
^ref-ba244286-377-0 ^ref-ba244286-381-0
(defn tick! [sched dt t] (.runFrame sched dt t))
^ref-ba244286-381-0
^ref-ba244286-380-0
^ref-ba244286-374-0
^ref-ba244286-379-0
^ref-ba244286-377-0
``` ^ref-ba244286-379-0
^ref-ba244286-381-0
^ref-ba244286-380-0
^ref-ba244286-379-0
^ref-ba244286-377-0
^ref-ba244286-374-0
 ^ref-ba244286-380-0 ^ref-ba244286-394-0
--- ^ref-ba244286-381-0

If you want, I can add:

* a **worker\_threads** pool for true parallel execution, ^ref-ba244286-394-0
* a **timeline tracer** (per-system duration, Gantt output),
* or a **hot-reload** API to add/remove systems at runtime without full recompiles.
