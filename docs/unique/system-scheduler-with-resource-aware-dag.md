---
uuid: ba244286-4e84-425b-8bf6-b80c4eb783fc
created_at: 2025.08.08.21.08.68.md
filename: System Scheduler with Resource-Aware DAG
description: >-
  A real-time system scheduler for ECS that handles resource-aware dependency
  graphs, conflict-aware batching, and prefab/blueprint management. Integrates
  with existing ECS and graph systems for efficient parallel execution.
tags:
  - scheduler
  - ecs
  - resource
  - dag
  - batching
  - prefab
  - blueprint
  - dependency
  - parallelism
related_to_title: []
related_to_uuid: []
references: []
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

# 2) Prefabs / Blueprints ^ref-ba244286-308-0

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
```
 ^ref-ba244286-338-0
**Usage:**

```ts
import { makeBlueprint, spawn } from "./ecs.prefab";
const Bullet = makeBlueprint("Bullet", [
  { c: CPos, v: (i)=>({x:i*10, y:0}) },
  { c: CVel, v: {x:0,y:100} },
  { c: CLife, v: {t:2} }
^ref-ba244286-338-0
]);
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
```
^ref-ba244286-362-0

*(In practice the scheduler builds a full DAG and packs conflict-free systems into parallel **batches** per stage.)*

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
* or a **hot-reload** API to add/remove systems at runtime without full recompiles.<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [ecs-scheduler-and-prefabs](ecs-scheduler-and-prefabs.md)
- [ecs-offload-workers](ecs-offload-workers.md)
- [Prompt_Folder_Bootstrap](prompt-folder-bootstrap.md)
- [markdown-to-org-transpiler](markdown-to-org-transpiler.md)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler](ollama-llm-provider-for-pseudo-code-transpiler.md)
- [Promethean Infrastructure Setup](promethean-infrastructure-setup.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [archetype-ecs](archetype-ecs.md)
- [Performance-Optimized-Polyglot-Bridge](performance-optimized-polyglot-bridge.md)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop](polyglot-s-expr-bridge-python-js-lisp-interop.md)
- [JavaScript](chunks/javascript.md)
- [compiler-kit-foundations](compiler-kit-foundations.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [Local-First Intention→Code Loop with Free Models](local-first-intention-code-loop-with-free-models.md)
- [Interop and Source Maps](interop-and-source-maps.md)
- [js-to-lisp-reverse-compiler](js-to-lisp-reverse-compiler.md)
- [Agent Tasks: Persistence Migration to DualStore](agent-tasks-persistence-migration-to-dualstore.md)
- [aionian-circuit-math](aionian-circuit-math.md)
- [Math Fundamentals](chunks/math-fundamentals.md)
- [Local-Only-LLM-Workflow](local-only-llm-workflow.md)
- [api-gateway-versioning](api-gateway-versioning.md)
- [Debugging Broker Connections and Agent Behavior](debugging-broker-connections-and-agent-behavior.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [Admin Dashboard for User Management](admin-dashboard-for-user-management.md)
- [graph-ds](graph-ds.md)
- [Agent Reflections and Prompt Evolution](agent-reflections-and-prompt-evolution.md)
- [Canonical Org-Babel Matplotlib Animation Template](canonical-org-babel-matplotlib-animation-template.md)
- [zero-copy-snapshots-and-workers](zero-copy-snapshots-and-workers.md)
- [2d-sandbox-field](2d-sandbox-field.md)
- [DSL](chunks/dsl.md)
- [Cross-Language Runtime Polymorphism](cross-language-runtime-polymorphism.md)
- [Window Management](chunks/window-management.md)
- [AI-Centric OS with MCP Layer](ai-centric-os-with-mcp-layer.md)
- [Diagrams](chunks/diagrams.md)
- [Board Walk – 2025-08-11](board-walk-2025-08-11.md)
- [Cross-Target Macro System in Sibilant](cross-target-macro-system-in-sibilant.md)
- [Board Automation Improvements](board-automation-improvements.md)
- [Promethean Event Bus MVP v0.1](promethean-event-bus-mvp-v0-1.md)
- [Matplotlib Animation with Async Execution](matplotlib-animation-with-async-execution.md)
- [State Snapshots API and Transactional Projector](state-snapshots-api-and-transactional-projector.md)
- [typed-struct-compiler](typed-struct-compiler.md)
- [i3-config-validation-methods](i3-config-validation-methods.md)
- [template-based-compilation](template-based-compilation.md)
- [Sibilant Meta-Prompt DSL](sibilant-meta-prompt-dsl.md)
- [sibilant-macro-targets](sibilant-macro-targets.md)
- [sibilant-meta-string-templating-runtime](sibilant-meta-string-templating-runtime.md)
- [sibilant-metacompiler-overview](sibilant-metacompiler-overview.md)
- [ts-to-lisp-transpiler](ts-to-lisp-transpiler.md)
- [Unique Info Dump Index](unique-info-dump-index.md)
- [Event Bus MVP](event-bus-mvp.md)
- [Services](chunks/services.md)
- [field-interaction-equations](field-interaction-equations.md)
- [Tooling](chunks/tooling.md)
- [Per-Domain Policy System for JS Crawler](per-domain-policy-system-for-js-crawler.md)
- [Mongo Outbox Implementation](mongo-outbox-implementation.md)
- [Migrate to Provider-Tenant Architecture](migrate-to-provider-tenant-architecture.md)
- [Language-Agnostic Mirror System](language-agnostic-mirror-system.md)
- [Eidolon Field Abstract Model](eidolon-field-abstract-model.md)
- [Exception Layer Analysis](exception-layer-analysis.md)
- [field-dynamics-math-blocks](field-dynamics-math-blocks.md)
- [field-node-diagram-outline](field-node-diagram-outline.md)
- [EidolonField](eidolonfield.md)
- [prom-lib-rate-limiters-and-replay-api](prom-lib-rate-limiters-and-replay-api.md)
- [Promethean Agent Config DSL](promethean-agent-config-dsl.md)
- [Model Selection for Lightweight Conversational Tasks](model-selection-for-lightweight-conversational-tasks.md)
- [observability-infrastructure-setup](observability-infrastructure-setup.md)
- [Duck's Self-Referential Perceptual Loop](ducks-self-referential-perceptual-loop.md)
- [ParticleSimulationWithCanvasAndFFmpeg](particlesimulationwithcanvasandffmpeg.md)
- [Shared](chunks/shared.md)
- [Simulation Demo](chunks/simulation-demo.md)
- [obsidian-ignore-node-modules-regex](obsidian-ignore-node-modules-regex.md)
- [Obsidian Templating Plugins Integration Guide](obsidian-templating-plugins-integration-guide.md)
- [polymorphic-meta-programming-engine](polymorphic-meta-programming-engine.md)
- [eidolon-node-lifecycle](eidolon-node-lifecycle.md)
- [Event Bus Projections Architecture](event-bus-projections-architecture.md)
- [Factorio AI with External Agents](factorio-ai-with-external-agents.md)
- [AI-First-OS-Model-Context-Protocol](ai-first-os-model-context-protocol.md)
- [balanced-bst](balanced-bst.md)
- [heartbeat-fragment-demo](heartbeat-fragment-demo.md)
- [heartbeat-simulation-snippets](heartbeat-simulation-snippets.md)
- [i3-bluetooth-setup](i3-bluetooth-setup.md)
- [field-node-diagram-visualizations](field-node-diagram-visualizations.md)
- [Promethean-native config design](promethean-native-config-design.md)
- [Promethean_Eidolon_Synchronicity_Model](promethean-eidolon-synchronicity-model.md)
- [Duck's Attractor States](ducks-attractor-states.md)
- [Promethean Web UI Setup](promethean-web-ui-setup.md)
- [field-node-diagram-set](field-node-diagram-set.md)
- [promethean-system-diagrams](promethean-system-diagrams.md)
- [prompt-programming-language-lisp](prompt-programming-language-lisp.md)
- [Lispy Macros with syntax-rules](lispy-macros-with-syntax-rules.md)
- [mystery-lisp-search-session](mystery-lisp-search-session.md)
- [Creative Moments](creative-moments.md)
- [Protocol_0_The_Contradiction_Engine](protocol-0-the-contradiction-engine.md)
- [Local-Offline-Model-Deployment-Strategy](local-offline-model-deployment-strategy.md)
- [Obsidian ChatGPT Plugin Integration](obsidian-chatgpt-plugin-integration.md)
- [Operations](chunks/operations.md)
- [Fnord Tracer Protocol](fnord-tracer-protocol.md)
- [homeostasis-decay-formulas](homeostasis-decay-formulas.md)
- [Post-Linguistic Transhuman Design Frameworks](post-linguistic-transhuman-design-frameworks.md)
- [Lisp-Compiler-Integration](lisp-compiler-integration.md)
- [layer-1-uptime-diagrams](layer-1-uptime-diagrams.md)
- [ripple-propagation-demo](ripple-propagation-demo.md)
- [Shared Package Structure](shared-package-structure.md)
- [Promethean Workflow Optimization](promethean-workflow-optimization.md)
- [Prometheus Observability Stack](prometheus-observability-stack.md)
- [Provider-Agnostic Chat Panel Implementation](provider-agnostic-chat-panel-implementation.md)
- [Pure-Node Crawl Stack with Playwright and Crawlee](pure-node-crawl-stack-with-playwright-and-crawlee.md)
- [lisp-dsl-for-window-management](lisp-dsl-for-window-management.md)
- [schema-evolution-workflow](schema-evolution-workflow.md)
- [RAG UI Panel with Qdrant and PostgREST](rag-ui-panel-with-qdrant-and-postgrest.md)
- [Pure TypeScript Search Microservice](pure-typescript-search-microservice.md)
- [Recursive Prompt Construction Engine](recursive-prompt-construction-engine.md)
- [Redirecting Standard Error](redirecting-standard-error.md)
- [Self-Agency in AI Interaction](self-agency-in-ai-interaction.md)
- [set-assignment-in-lisp-ast](set-assignment-in-lisp-ast.md)
- [shared-package-layout-clarification](shared-package-layout-clarification.md)
- [DuckDuckGoSearchPipeline](duckduckgosearchpipeline.md)
- [Chroma-Embedding-Refactor](chroma-embedding-refactor.md)
- [Promethean Pipelines: Local TypeScript-First Workflow](promethean-pipelines-local-typescript-first-workflow.md)
- [Stateful Partitions and Rebalancing](stateful-partitions-and-rebalancing.md)
- [Ghostly Smoke Interference](ghostly-smoke-interference.md)
- [Smoke Resonance Visualizations](smoke-resonance-visualizations.md)
- [refactor-relations](refactor-relations.md)
- [Promethean Documentation Pipeline Overview](promethean-documentation-pipeline-overview.md)
- [WebSocket Gateway Implementation](websocket-gateway-implementation.md)
- [Promethean Pipelines](promethean-pipelines.md)
- [universal-intention-code-fabric](universal-intention-code-fabric.md)
- [Universal Lisp Interface](universal-lisp-interface.md)
- [Promethean Agent DSL TS Scaffold](promethean-agent-dsl-ts-scaffold.md)
- [pm2-orchestration-patterns](pm2-orchestration-patterns.md)
- [Promethean State Format](promethean-state-format.md)
## Sources
- [ecs-scheduler-and-prefabs — L3](ecs-scheduler-and-prefabs.md#^ref-c62a1815-3-0) (line 3, col 0, score 1)
- [archetype-ecs — L450](archetype-ecs.md#^ref-8f4c1e86-450-0) (line 450, col 0, score 0.8)
- [ecs-offload-workers — L452](ecs-offload-workers.md#^ref-6498b9d7-452-0) (line 452, col 0, score 0.76)
- [eidolon-field-math-foundations — L126](eidolon-field-math-foundations.md#^ref-008f2ac0-126-0) (line 126, col 0, score 0.76)
- [Event Bus MVP — L565](event-bus-mvp.md#^ref-534fe91d-565-0) (line 565, col 0, score 0.76)
- [field-interaction-equations — L178](field-interaction-equations.md#^ref-b09141b7-178-0) (line 178, col 0, score 0.76)
- [graph-ds — L379](graph-ds.md#^ref-6620e2f2-379-0) (line 379, col 0, score 0.76)
- [heartbeat-fragment-demo — L130](heartbeat-fragment-demo.md#^ref-dd00677a-130-0) (line 130, col 0, score 0.76)
- [heartbeat-simulation-snippets — L121](heartbeat-simulation-snippets.md#^ref-23e221e9-121-0) (line 121, col 0, score 0.76)
- [i3-bluetooth-setup — L115](i3-bluetooth-setup.md#^ref-5e408692-115-0) (line 115, col 0, score 0.76)
- [ecs-scheduler-and-prefabs — L7](ecs-scheduler-and-prefabs.md#^ref-c62a1815-7-0) (line 7, col 0, score 1)
- [ecs-scheduler-and-prefabs — L1](ecs-scheduler-and-prefabs.md#^ref-c62a1815-1-0) (line 1, col 0, score 0.75)
- [JavaScript — L6](chunks/javascript.md#^ref-c1618c66-6-0) (line 6, col 0, score 0.71)
- [Admin Dashboard for User Management — L41](admin-dashboard-for-user-management.md#^ref-2901a3e9-41-0) (line 41, col 0, score 0.69)
- [Agent Reflections and Prompt Evolution — L140](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-140-0) (line 140, col 0, score 0.69)
- [Agent Tasks: Persistence Migration to DualStore — L136](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-136-0) (line 136, col 0, score 0.69)
- [Board Walk – 2025-08-11 — L148](board-walk-2025-08-11.md#^ref-7aa1eb92-148-0) (line 148, col 0, score 0.69)
- [Canonical Org-Babel Matplotlib Animation Template — L111](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-111-0) (line 111, col 0, score 0.69)
- [Chroma Toolkit Consolidation Plan — L169](chroma-toolkit-consolidation-plan.md#^ref-5020e892-169-0) (line 169, col 0, score 0.69)
- [JavaScript — L12](chunks/javascript.md#^ref-c1618c66-12-0) (line 12, col 0, score 0.69)
- [Math Fundamentals — L21](chunks/math-fundamentals.md#^ref-c6e87433-21-0) (line 21, col 0, score 0.69)
- [Services — L27](chunks/services.md#^ref-75ea4a6a-27-0) (line 27, col 0, score 0.69)
- [Tooling — L17](chunks/tooling.md#^ref-6cb4943e-17-0) (line 17, col 0, score 0.69)
- [ecs-scheduler-and-prefabs — L246](ecs-scheduler-and-prefabs.md#^ref-c62a1815-246-0) (line 246, col 0, score 1)
- [archetype-ecs — L366](archetype-ecs.md#^ref-8f4c1e86-366-0) (line 366, col 0, score 0.72)
- [zero-copy-snapshots-and-workers — L70](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-70-0) (line 70, col 0, score 0.78)
- [archetype-ecs — L7](archetype-ecs.md#^ref-8f4c1e86-7-0) (line 7, col 0, score 0.69)
- [ecs-offload-workers — L209](ecs-offload-workers.md#^ref-6498b9d7-209-0) (line 209, col 0, score 0.62)
- [ecs-scheduler-and-prefabs — L310](ecs-scheduler-and-prefabs.md#^ref-c62a1815-310-0) (line 310, col 0, score 1)
- [ecs-offload-workers — L15](ecs-offload-workers.md#^ref-6498b9d7-15-0) (line 15, col 0, score 0.63)
- [Per-Domain Policy System for JS Crawler — L141](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-141-0) (line 141, col 0, score 0.66)
- [ecs-offload-workers — L306](ecs-offload-workers.md#^ref-6498b9d7-306-0) (line 306, col 0, score 0.7)
- [zero-copy-snapshots-and-workers — L156](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-156-0) (line 156, col 0, score 0.64)
- [ecs-offload-workers — L7](ecs-offload-workers.md#^ref-6498b9d7-7-0) (line 7, col 0, score 0.65)
- [Event Bus MVP — L99](event-bus-mvp.md#^ref-534fe91d-99-0) (line 99, col 0, score 0.67)
- [Event Bus MVP — L392](event-bus-mvp.md#^ref-534fe91d-392-0) (line 392, col 0, score 0.68)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L7](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-7-0) (line 7, col 0, score 0.67)
- [Event Bus MVP — L7](event-bus-mvp.md#^ref-534fe91d-7-0) (line 7, col 0, score 0.67)
- [compiler-kit-foundations — L31](compiler-kit-foundations.md#^ref-01b21543-31-0) (line 31, col 0, score 0.69)
- [State Snapshots API and Transactional Projector — L248](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-248-0) (line 248, col 0, score 0.66)
- [Mongo Outbox Implementation — L381](mongo-outbox-implementation.md#^ref-9c1acd1e-381-0) (line 381, col 0, score 0.69)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L194](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-194-0) (line 194, col 0, score 0.66)
- [Lisp-Compiler-Integration — L27](lisp-compiler-integration.md#^ref-cfee6d36-27-0) (line 27, col 0, score 0.67)
- [Performance-Optimized-Polyglot-Bridge — L170](performance-optimized-polyglot-bridge.md#^ref-f5579967-170-0) (line 170, col 0, score 0.64)
- [ecs-scheduler-and-prefabs — L368](ecs-scheduler-and-prefabs.md#^ref-c62a1815-368-0) (line 368, col 0, score 1)
- [graph-ds — L5](graph-ds.md#^ref-6620e2f2-5-0) (line 5, col 0, score 0.67)
- [Stateful Partitions and Rebalancing — L202](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-202-0) (line 202, col 0, score 0.64)
- [refactor-relations — L10](refactor-relations.md#^ref-41ce0216-10-0) (line 10, col 0, score 0.66)
- [Stateful Partitions and Rebalancing — L351](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-351-0) (line 351, col 0, score 0.63)
- [schema-evolution-workflow — L393](schema-evolution-workflow.md#^ref-d8059b6a-393-0) (line 393, col 0, score 0.66)
- [Migrate to Provider-Tenant Architecture — L96](migrate-to-provider-tenant-architecture.md#^ref-54382370-96-0) (line 96, col 0, score 0.66)
- [Migrate to Provider-Tenant Architecture — L185](migrate-to-provider-tenant-architecture.md#^ref-54382370-185-0) (line 185, col 0, score 0.66)
- [compiler-kit-foundations — L359](compiler-kit-foundations.md#^ref-01b21543-359-0) (line 359, col 0, score 0.68)
- [Stateful Partitions and Rebalancing — L448](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-448-0) (line 448, col 0, score 0.71)
- [Lispy Macros with syntax-rules — L9](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-9-0) (line 9, col 0, score 0.65)
- [Lisp-Compiler-Integration — L188](lisp-compiler-integration.md#^ref-cfee6d36-188-0) (line 188, col 0, score 0.64)
- [compiler-kit-foundations — L50](compiler-kit-foundations.md#^ref-01b21543-50-0) (line 50, col 0, score 0.68)
- [typed-struct-compiler — L16](typed-struct-compiler.md#^ref-78eeedf7-16-0) (line 16, col 0, score 0.67)
- [Language-Agnostic Mirror System — L336](language-agnostic-mirror-system.md#^ref-d2b3628c-336-0) (line 336, col 0, score 0.67)
- [ecs-scheduler-and-prefabs — L364](ecs-scheduler-and-prefabs.md#^ref-c62a1815-364-0) (line 364, col 0, score 1)
- [field-node-diagram-visualizations — L39](field-node-diagram-visualizations.md#^ref-e9b27b06-39-0) (line 39, col 0, score 0.63)
- [markdown-to-org-transpiler — L7](markdown-to-org-transpiler.md#^ref-ab54cdd8-7-0) (line 7, col 0, score 0.63)
- [Promethean Event Bus MVP v0.1 — L510](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-510-0) (line 510, col 0, score 0.66)
- [universal-intention-code-fabric — L277](universal-intention-code-fabric.md#^ref-c14edce7-277-0) (line 277, col 0, score 0.66)
- [Promethean Agent DSL TS Scaffold — L647](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-647-0) (line 647, col 0, score 0.66)
- [universal-intention-code-fabric — L252](universal-intention-code-fabric.md#^ref-c14edce7-252-0) (line 252, col 0, score 0.63)
- [Agent Tasks: Persistence Migration to DualStore — L81](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-81-0) (line 81, col 0, score 0.66)
- [zero-copy-snapshots-and-workers — L267](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-267-0) (line 267, col 0, score 0.62)
- [zero-copy-snapshots-and-workers — L306](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-306-0) (line 306, col 0, score 0.77)
- [ecs-offload-workers — L359](ecs-offload-workers.md#^ref-6498b9d7-359-0) (line 359, col 0, score 0.65)
- [ecs-offload-workers — L397](ecs-offload-workers.md#^ref-6498b9d7-397-0) (line 397, col 0, score 0.65)
- [archetype-ecs — L441](archetype-ecs.md#^ref-8f4c1e86-441-0) (line 441, col 0, score 0.75)
- [2d-sandbox-field — L145](2d-sandbox-field.md#^ref-c710dc93-145-0) (line 145, col 0, score 0.65)
- [Chroma-Embedding-Refactor — L64](chroma-embedding-refactor.md#^ref-8b256935-64-0) (line 64, col 0, score 0.84)
- [Chroma-Embedding-Refactor — L109](chroma-embedding-refactor.md#^ref-8b256935-109-0) (line 109, col 0, score 0.84)
- [Chroma-Embedding-Refactor — L258](chroma-embedding-refactor.md#^ref-8b256935-258-0) (line 258, col 0, score 0.84)
- [Chroma Toolkit Consolidation Plan — L72](chroma-toolkit-consolidation-plan.md#^ref-5020e892-72-0) (line 72, col 0, score 0.84)
- [Chroma Toolkit Consolidation Plan — L88](chroma-toolkit-consolidation-plan.md#^ref-5020e892-88-0) (line 88, col 0, score 0.84)
- [Chroma Toolkit Consolidation Plan — L107](chroma-toolkit-consolidation-plan.md#^ref-5020e892-107-0) (line 107, col 0, score 0.84)
- [Chroma Toolkit Consolidation Plan — L148](chroma-toolkit-consolidation-plan.md#^ref-5020e892-148-0) (line 148, col 0, score 0.68)
- [Chroma Toolkit Consolidation Plan — L162](chroma-toolkit-consolidation-plan.md#^ref-5020e892-162-0) (line 162, col 0, score 0.67)
- [i3-config-validation-methods — L9](i3-config-validation-methods.md#^ref-d28090ac-9-0) (line 9, col 0, score 0.67)
- [Local-First Intention→Code Loop with Free Models — L47](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-47-0) (line 47, col 0, score 0.67)
- [Local-Only-LLM-Workflow — L128](local-only-llm-workflow.md#^ref-9a8ab57e-128-0) (line 128, col 0, score 0.66)
- [Universal Lisp Interface — L30](universal-lisp-interface.md#^ref-b01856b4-30-0) (line 30, col 0, score 0.66)
- [Promethean-native config design — L32](promethean-native-config-design.md#^ref-ab748541-32-0) (line 32, col 0, score 0.66)
- [ecs-scheduler-and-prefabs — L340](ecs-scheduler-and-prefabs.md#^ref-c62a1815-340-0) (line 340, col 0, score 1)
- [WebSocket Gateway Implementation — L447](websocket-gateway-implementation.md#^ref-e811123d-447-0) (line 447, col 0, score 0.69)
- [WebSocket Gateway Implementation — L56](websocket-gateway-implementation.md#^ref-e811123d-56-0) (line 56, col 0, score 0.68)
- [universal-intention-code-fabric — L68](universal-intention-code-fabric.md#^ref-c14edce7-68-0) (line 68, col 0, score 0.68)
- [Chroma-Embedding-Refactor — L66](chroma-embedding-refactor.md#^ref-8b256935-66-0) (line 66, col 0, score 0.68)
- [ecs-scheduler-and-prefabs — L338](ecs-scheduler-and-prefabs.md#^ref-c62a1815-338-0) (line 338, col 0, score 1)
- [Prompt_Folder_Bootstrap — L24](prompt-folder-bootstrap.md#^ref-bd4f0976-24-0) (line 24, col 0, score 1)
- [Prompt_Folder_Bootstrap — L42](prompt-folder-bootstrap.md#^ref-bd4f0976-42-0) (line 42, col 0, score 1)
- [Prompt_Folder_Bootstrap — L66](prompt-folder-bootstrap.md#^ref-bd4f0976-66-0) (line 66, col 0, score 1)
- [Prompt_Folder_Bootstrap — L84](prompt-folder-bootstrap.md#^ref-bd4f0976-84-0) (line 84, col 0, score 1)
- [Prompt_Folder_Bootstrap — L103](prompt-folder-bootstrap.md#^ref-bd4f0976-103-0) (line 103, col 0, score 1)
- [Prompt_Folder_Bootstrap — L130](prompt-folder-bootstrap.md#^ref-bd4f0976-130-0) (line 130, col 0, score 1)
- [Prompt_Folder_Bootstrap — L152](prompt-folder-bootstrap.md#^ref-bd4f0976-152-0) (line 152, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L144](chroma-toolkit-consolidation-plan.md#^ref-5020e892-144-0) (line 144, col 0, score 0.88)
- [Lispy Macros with syntax-rules — L365](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-365-0) (line 365, col 0, score 0.65)
- [Lisp-Compiler-Integration — L491](lisp-compiler-integration.md#^ref-cfee6d36-491-0) (line 491, col 0, score 0.64)
- [typed-struct-compiler — L339](typed-struct-compiler.md#^ref-78eeedf7-339-0) (line 339, col 0, score 0.64)
- [Interop and Source Maps — L482](interop-and-source-maps.md#^ref-cdfac40c-482-0) (line 482, col 0, score 0.64)
- [ecs-offload-workers — L335](ecs-offload-workers.md#^ref-6498b9d7-335-0) (line 335, col 0, score 0.62)
- [Event Bus MVP — L258](event-bus-mvp.md#^ref-534fe91d-258-0) (line 258, col 0, score 0.62)
- [Chroma-Embedding-Refactor — L260](chroma-embedding-refactor.md#^ref-8b256935-260-0) (line 260, col 0, score 0.62)
- [ecs-scheduler-and-prefabs — L352](ecs-scheduler-and-prefabs.md#^ref-c62a1815-352-0) (line 352, col 0, score 1)
- [archetype-ecs — L423](archetype-ecs.md#^ref-8f4c1e86-423-0) (line 423, col 0, score 0.79)
- [Language-Agnostic Mirror System — L11](language-agnostic-mirror-system.md#^ref-d2b3628c-11-0) (line 11, col 0, score 0.77)
- [Promethean Pipelines: Local TypeScript-First Workflow — L219](promethean-pipelines-local-typescript-first-workflow.md#^ref-6b63edca-219-0) (line 219, col 0, score 0.75)
- [Ghostly Smoke Interference — L11](ghostly-smoke-interference.md#^ref-b6ae7dfa-11-0) (line 11, col 0, score 0.73)
- [Smoke Resonance Visualizations — L57](smoke-resonance-visualizations.md#^ref-ac9d3ac5-57-0) (line 57, col 0, score 0.73)
- [Promethean_Eidolon_Synchronicity_Model — L3](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-3-0) (line 3, col 0, score 0.73)
- [RAG UI Panel with Qdrant and PostgREST — L336](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-336-0) (line 336, col 0, score 0.72)
- [Duck's Attractor States — L5](ducks-attractor-states.md#^ref-13951643-5-0) (line 5, col 0, score 0.72)
- [Promethean Event Bus MVP v0.1 — L832](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-832-0) (line 832, col 0, score 0.71)
- [Promethean Documentation Pipeline Overview — L78](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-78-0) (line 78, col 0, score 0.71)
- [Promethean Pipelines — L58](promethean-pipelines.md#^ref-8b8e6103-58-0) (line 58, col 0, score 0.7)
- [State Snapshots API and Transactional Projector — L235](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-235-0) (line 235, col 0, score 0.68)
- [Lisp-Compiler-Integration — L13](lisp-compiler-integration.md#^ref-cfee6d36-13-0) (line 13, col 0, score 0.68)
- [universal-intention-code-fabric — L9](universal-intention-code-fabric.md#^ref-c14edce7-9-0) (line 9, col 0, score 0.68)
- [Promethean Web UI Setup — L581](promethean-web-ui-setup.md#^ref-bc5172ca-581-0) (line 581, col 0, score 0.68)
- [archetype-ecs — L453](archetype-ecs.md#^ref-8f4c1e86-453-0) (line 453, col 0, score 0.81)
- [Chroma Toolkit Consolidation Plan — L199](chroma-toolkit-consolidation-plan.md#^ref-5020e892-199-0) (line 199, col 0, score 0.81)
- [ecs-offload-workers — L453](ecs-offload-workers.md#^ref-6498b9d7-453-0) (line 453, col 0, score 0.81)
- [ecs-scheduler-and-prefabs — L385](ecs-scheduler-and-prefabs.md#^ref-c62a1815-385-0) (line 385, col 0, score 0.81)
- [eidolon-field-math-foundations — L128](eidolon-field-math-foundations.md#^ref-008f2ac0-128-0) (line 128, col 0, score 0.81)
- [Local-Only-LLM-Workflow — L177](local-only-llm-workflow.md#^ref-9a8ab57e-177-0) (line 177, col 0, score 0.81)
- [markdown-to-org-transpiler — L297](markdown-to-org-transpiler.md#^ref-ab54cdd8-297-0) (line 297, col 0, score 0.81)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L162](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-162-0) (line 162, col 0, score 0.81)
- [Event Bus MVP — L509](event-bus-mvp.md#^ref-534fe91d-509-0) (line 509, col 0, score 0.73)
- [Stateful Partitions and Rebalancing — L499](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-499-0) (line 499, col 0, score 0.72)
- [schema-evolution-workflow — L450](schema-evolution-workflow.md#^ref-d8059b6a-450-0) (line 450, col 0, score 0.72)
- [WebSocket Gateway Implementation — L595](websocket-gateway-implementation.md#^ref-e811123d-595-0) (line 595, col 0, score 0.7)
- [graph-ds — L343](graph-ds.md#^ref-6620e2f2-343-0) (line 343, col 0, score 0.69)
- [State Snapshots API and Transactional Projector — L303](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-303-0) (line 303, col 0, score 0.68)
- [Cross-Language Runtime Polymorphism — L193](cross-language-runtime-polymorphism.md#^ref-c34c36a6-193-0) (line 193, col 0, score 0.64)
- [template-based-compilation — L90](template-based-compilation.md#^ref-f8877e5e-90-0) (line 90, col 0, score 0.64)
- [ecs-offload-workers — L446](ecs-offload-workers.md#^ref-6498b9d7-446-0) (line 446, col 0, score 1)
- [ecs-scheduler-and-prefabs — L379](ecs-scheduler-and-prefabs.md#^ref-c62a1815-379-0) (line 379, col 0, score 1)
- [markdown-to-org-transpiler — L289](markdown-to-org-transpiler.md#^ref-ab54cdd8-289-0) (line 289, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L153](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-153-0) (line 153, col 0, score 1)
- [Promethean Infrastructure Setup — L558](promethean-infrastructure-setup.md#^ref-6deed6ac-558-0) (line 558, col 0, score 0.98)
- [eidolon-field-math-foundations — L105](eidolon-field-math-foundations.md#^ref-008f2ac0-105-0) (line 105, col 0, score 0.88)
- [Performance-Optimized-Polyglot-Bridge — L429](performance-optimized-polyglot-bridge.md#^ref-f5579967-429-0) (line 429, col 0, score 0.85)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L497](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-497-0) (line 497, col 0, score 0.85)
- [Local-Only-LLM-Workflow — L163](local-only-llm-workflow.md#^ref-9a8ab57e-163-0) (line 163, col 0, score 0.85)
- [2d-sandbox-field — L180](2d-sandbox-field.md#^ref-c710dc93-180-0) (line 180, col 0, score 0.81)
- [Eidolon Field Abstract Model — L176](eidolon-field-abstract-model.md#^ref-5e8b2388-176-0) (line 176, col 0, score 0.81)
- [Exception Layer Analysis — L134](exception-layer-analysis.md#^ref-21d5cc09-134-0) (line 134, col 0, score 0.81)
- [field-dynamics-math-blocks — L117](field-dynamics-math-blocks.md#^ref-7cfc230d-117-0) (line 117, col 0, score 0.81)
- [field-node-diagram-outline — L82](field-node-diagram-outline.md#^ref-1f32c94a-82-0) (line 82, col 0, score 0.81)
- [layer-1-uptime-diagrams — L140](layer-1-uptime-diagrams.md#^ref-4127189a-140-0) (line 140, col 0, score 0.81)
- [EidolonField — L228](eidolonfield.md#^ref-49d1e1e5-228-0) (line 228, col 0, score 0.81)
- [ecs-scheduler-and-prefabs — L381](ecs-scheduler-and-prefabs.md#^ref-c62a1815-381-0) (line 381, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L13](performance-optimized-polyglot-bridge.md#^ref-f5579967-13-0) (line 13, col 0, score 0.68)
- [Performance-Optimized-Polyglot-Bridge — L394](performance-optimized-polyglot-bridge.md#^ref-f5579967-394-0) (line 394, col 0, score 0.67)
- [ecs-offload-workers — L75](ecs-offload-workers.md#^ref-6498b9d7-75-0) (line 75, col 0, score 0.65)
- [ecs-offload-workers — L5](ecs-offload-workers.md#^ref-6498b9d7-5-0) (line 5, col 0, score 0.65)
- [prom-lib-rate-limiters-and-replay-api — L375](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-375-0) (line 375, col 0, score 0.64)
- [ecs-offload-workers — L39](ecs-offload-workers.md#^ref-6498b9d7-39-0) (line 39, col 0, score 0.64)
- [ecs-offload-workers — L444](ecs-offload-workers.md#^ref-6498b9d7-444-0) (line 444, col 0, score 0.63)
- [ecs-scheduler-and-prefabs — L382](ecs-scheduler-and-prefabs.md#^ref-c62a1815-382-0) (line 382, col 0, score 1)
- [ecs-offload-workers — L450](ecs-offload-workers.md#^ref-6498b9d7-450-0) (line 450, col 0, score 0.9)
- [Fnord Tracer Protocol — L131](fnord-tracer-protocol.md#^ref-fc21f824-131-0) (line 131, col 0, score 0.65)
- [Fnord Tracer Protocol — L185](fnord-tracer-protocol.md#^ref-fc21f824-185-0) (line 185, col 0, score 0.62)
- [Fnord Tracer Protocol — L238](fnord-tracer-protocol.md#^ref-fc21f824-238-0) (line 238, col 0, score 0.62)
- [Fnord Tracer Protocol — L24](fnord-tracer-protocol.md#^ref-fc21f824-24-0) (line 24, col 0, score 0.61)
- [Sibilant Meta-Prompt DSL — L148](sibilant-meta-prompt-dsl.md#^ref-af5d2824-148-0) (line 148, col 0, score 0.61)
- [Fnord Tracer Protocol — L58](fnord-tracer-protocol.md#^ref-fc21f824-58-0) (line 58, col 0, score 0.61)
- [ecs-scheduler-and-prefabs — L383](ecs-scheduler-and-prefabs.md#^ref-c62a1815-383-0) (line 383, col 0, score 1)
- [Promethean Infrastructure Setup — L540](promethean-infrastructure-setup.md#^ref-6deed6ac-540-0) (line 540, col 0, score 0.68)
- [Language-Agnostic Mirror System — L513](language-agnostic-mirror-system.md#^ref-d2b3628c-513-0) (line 513, col 0, score 0.67)
- [RAG UI Panel with Qdrant and PostgREST — L107](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-107-0) (line 107, col 0, score 0.66)
- [Promethean Agent Config DSL — L10](promethean-agent-config-dsl.md#^ref-2c00ce45-10-0) (line 10, col 0, score 0.65)
- [pm2-orchestration-patterns — L238](pm2-orchestration-patterns.md#^ref-51932e7b-238-0) (line 238, col 0, score 0.64)
- [Promethean Agent Config DSL — L300](promethean-agent-config-dsl.md#^ref-2c00ce45-300-0) (line 300, col 0, score 0.64)
- [ecs-offload-workers — L207](ecs-offload-workers.md#^ref-6498b9d7-207-0) (line 207, col 0, score 0.64)
- [Promethean State Format — L26](promethean-state-format.md#^ref-23df6ddb-26-0) (line 26, col 0, score 0.63)
- [Exception Layer Analysis — L172](exception-layer-analysis.md#^ref-21d5cc09-172-0) (line 172, col 0, score 1)
- [field-dynamics-math-blocks — L154](field-dynamics-math-blocks.md#^ref-7cfc230d-154-0) (line 154, col 0, score 1)
- [field-interaction-equations — L164](field-interaction-equations.md#^ref-b09141b7-164-0) (line 164, col 0, score 1)
- [field-node-diagram-outline — L120](field-node-diagram-outline.md#^ref-1f32c94a-120-0) (line 120, col 0, score 1)
- [field-node-diagram-set — L149](field-node-diagram-set.md#^ref-22b989d5-149-0) (line 149, col 0, score 1)
- [field-node-diagram-visualizations — L99](field-node-diagram-visualizations.md#^ref-e9b27b06-99-0) (line 99, col 0, score 1)
- [graph-ds — L365](graph-ds.md#^ref-6620e2f2-365-0) (line 365, col 0, score 1)
- [heartbeat-fragment-demo — L111](heartbeat-fragment-demo.md#^ref-dd00677a-111-0) (line 111, col 0, score 1)
- [heartbeat-simulation-snippets — L101](heartbeat-simulation-snippets.md#^ref-23e221e9-101-0) (line 101, col 0, score 1)
- [Math Fundamentals — L20](chunks/math-fundamentals.md#^ref-c6e87433-20-0) (line 20, col 0, score 1)
- [Services — L20](chunks/services.md#^ref-75ea4a6a-20-0) (line 20, col 0, score 1)
- [compiler-kit-foundations — L620](compiler-kit-foundations.md#^ref-01b21543-620-0) (line 620, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L237](cross-language-runtime-polymorphism.md#^ref-c34c36a6-237-0) (line 237, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L40](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-40-0) (line 40, col 0, score 1)
- [Dynamic Context Model for Web Components — L401](dynamic-context-model-for-web-components.md#^ref-f7702bf8-401-0) (line 401, col 0, score 1)
- [ecs-scheduler-and-prefabs — L386](ecs-scheduler-and-prefabs.md#^ref-c62a1815-386-0) (line 386, col 0, score 1)
- [eidolon-field-math-foundations — L127](eidolon-field-math-foundations.md#^ref-008f2ac0-127-0) (line 127, col 0, score 1)
- [Event Bus MVP — L557](event-bus-mvp.md#^ref-534fe91d-557-0) (line 557, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L136](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-136-0) (line 136, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L108](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-108-0) (line 108, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L168](chroma-toolkit-consolidation-plan.md#^ref-5020e892-168-0) (line 168, col 0, score 1)
- [ecs-scheduler-and-prefabs — L387](ecs-scheduler-and-prefabs.md#^ref-c62a1815-387-0) (line 387, col 0, score 1)
- [Event Bus MVP — L564](event-bus-mvp.md#^ref-534fe91d-564-0) (line 564, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L316](migrate-to-provider-tenant-architecture.md#^ref-54382370-316-0) (line 316, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L142](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-142-0) (line 142, col 0, score 1)
- [prom-lib-rate-limiters-and-replay-api — L405](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-405-0) (line 405, col 0, score 1)
- [Admin Dashboard for User Management — L40](admin-dashboard-for-user-management.md#^ref-2901a3e9-40-0) (line 40, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L156](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-156-0) (line 156, col 0, score 1)
- [api-gateway-versioning — L297](api-gateway-versioning.md#^ref-0580dcd3-297-0) (line 297, col 0, score 1)
- [ecs-offload-workers — L454](ecs-offload-workers.md#^ref-6498b9d7-454-0) (line 454, col 0, score 1)
- [ecs-scheduler-and-prefabs — L388](ecs-scheduler-and-prefabs.md#^ref-c62a1815-388-0) (line 388, col 0, score 1)
- [eidolon-field-math-foundations — L129](eidolon-field-math-foundations.md#^ref-008f2ac0-129-0) (line 129, col 0, score 1)
- [field-interaction-equations — L177](field-interaction-equations.md#^ref-b09141b7-177-0) (line 177, col 0, score 1)
- [js-to-lisp-reverse-compiler — L422](js-to-lisp-reverse-compiler.md#^ref-58191024-422-0) (line 422, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L157](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-157-0) (line 157, col 0, score 1)
- [api-gateway-versioning — L298](api-gateway-versioning.md#^ref-0580dcd3-298-0) (line 298, col 0, score 1)
- [ecs-offload-workers — L455](ecs-offload-workers.md#^ref-6498b9d7-455-0) (line 455, col 0, score 1)
- [ecs-scheduler-and-prefabs — L389](ecs-scheduler-and-prefabs.md#^ref-c62a1815-389-0) (line 389, col 0, score 1)
- [eidolon-field-math-foundations — L130](eidolon-field-math-foundations.md#^ref-008f2ac0-130-0) (line 130, col 0, score 1)
- [i3-config-validation-methods — L63](i3-config-validation-methods.md#^ref-d28090ac-63-0) (line 63, col 0, score 1)
- [Interop and Source Maps — L531](interop-and-source-maps.md#^ref-cdfac40c-531-0) (line 531, col 0, score 1)
- [Language-Agnostic Mirror System — L548](language-agnostic-mirror-system.md#^ref-d2b3628c-548-0) (line 548, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L143](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-143-0) (line 143, col 0, score 1)
- [api-gateway-versioning — L282](api-gateway-versioning.md#^ref-0580dcd3-282-0) (line 282, col 0, score 1)
- [archetype-ecs — L470](archetype-ecs.md#^ref-8f4c1e86-470-0) (line 470, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L201](chroma-toolkit-consolidation-plan.md#^ref-5020e892-201-0) (line 201, col 0, score 1)
- [Dynamic Context Model for Web Components — L382](dynamic-context-model-for-web-components.md#^ref-f7702bf8-382-0) (line 382, col 0, score 1)
- [ecs-offload-workers — L456](ecs-offload-workers.md#^ref-6498b9d7-456-0) (line 456, col 0, score 1)
- [ecs-scheduler-and-prefabs — L390](ecs-scheduler-and-prefabs.md#^ref-c62a1815-390-0) (line 390, col 0, score 1)
- [eidolon-field-math-foundations — L125](eidolon-field-math-foundations.md#^ref-008f2ac0-125-0) (line 125, col 0, score 1)
- [i3-config-validation-methods — L61](i3-config-validation-methods.md#^ref-d28090ac-61-0) (line 61, col 0, score 1)
- [Mongo Outbox Implementation — L572](mongo-outbox-implementation.md#^ref-9c1acd1e-572-0) (line 572, col 0, score 1)
- [observability-infrastructure-setup — L360](observability-infrastructure-setup.md#^ref-b4e64f8c-360-0) (line 360, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L163](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-163-0) (line 163, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L472](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-472-0) (line 472, col 0, score 1)
- [field-node-diagram-outline — L111](field-node-diagram-outline.md#^ref-1f32c94a-111-0) (line 111, col 0, score 1)
- [field-node-diagram-set — L144](field-node-diagram-set.md#^ref-22b989d5-144-0) (line 144, col 0, score 1)
- [field-node-diagram-visualizations — L94](field-node-diagram-visualizations.md#^ref-e9b27b06-94-0) (line 94, col 0, score 1)
- [Fnord Tracer Protocol — L258](fnord-tracer-protocol.md#^ref-fc21f824-258-0) (line 258, col 0, score 1)
- [graph-ds — L398](graph-ds.md#^ref-6620e2f2-398-0) (line 398, col 0, score 1)
- [heartbeat-fragment-demo — L110](heartbeat-fragment-demo.md#^ref-dd00677a-110-0) (line 110, col 0, score 1)
- [heartbeat-simulation-snippets — L99](heartbeat-simulation-snippets.md#^ref-23e221e9-99-0) (line 99, col 0, score 1)
- [homeostasis-decay-formulas — L151](homeostasis-decay-formulas.md#^ref-37b5d236-151-0) (line 151, col 0, score 1)
- [i3-bluetooth-setup — L119](i3-bluetooth-setup.md#^ref-5e408692-119-0) (line 119, col 0, score 1)
- [Admin Dashboard for User Management — L39](admin-dashboard-for-user-management.md#^ref-2901a3e9-39-0) (line 39, col 0, score 1)
- [archetype-ecs — L471](archetype-ecs.md#^ref-8f4c1e86-471-0) (line 471, col 0, score 1)
- [Board Walk – 2025-08-11 — L141](board-walk-2025-08-11.md#^ref-7aa1eb92-141-0) (line 141, col 0, score 1)
- [JavaScript — L31](chunks/javascript.md#^ref-c1618c66-31-0) (line 31, col 0, score 1)
- [ecs-offload-workers — L459](ecs-offload-workers.md#^ref-6498b9d7-459-0) (line 459, col 0, score 1)
- [ecs-scheduler-and-prefabs — L395](ecs-scheduler-and-prefabs.md#^ref-c62a1815-395-0) (line 395, col 0, score 1)
- [eidolon-field-math-foundations — L156](eidolon-field-math-foundations.md#^ref-008f2ac0-156-0) (line 156, col 0, score 1)
- [i3-config-validation-methods — L64](i3-config-validation-methods.md#^ref-d28090ac-64-0) (line 64, col 0, score 1)
- [Admin Dashboard for User Management — L46](admin-dashboard-for-user-management.md#^ref-2901a3e9-46-0) (line 46, col 0, score 1)
- [DSL — L22](chunks/dsl.md#^ref-e87bc036-22-0) (line 22, col 0, score 1)
- [compiler-kit-foundations — L609](compiler-kit-foundations.md#^ref-01b21543-609-0) (line 609, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L229](cross-language-runtime-polymorphism.md#^ref-c34c36a6-229-0) (line 229, col 0, score 1)
- [ecs-offload-workers — L460](ecs-offload-workers.md#^ref-6498b9d7-460-0) (line 460, col 0, score 1)
- [ecs-scheduler-and-prefabs — L396](ecs-scheduler-and-prefabs.md#^ref-c62a1815-396-0) (line 396, col 0, score 1)
- [eidolon-field-math-foundations — L157](eidolon-field-math-foundations.md#^ref-008f2ac0-157-0) (line 157, col 0, score 1)
- [i3-config-validation-methods — L57](i3-config-validation-methods.md#^ref-d28090ac-57-0) (line 57, col 0, score 1)
- [Promethean_Eidolon_Synchronicity_Model — L74](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-74-0) (line 74, col 0, score 1)
- [Promethean Event Bus MVP v0.1 — L929](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-929-0) (line 929, col 0, score 1)
- [Promethean Infrastructure Setup — L597](promethean-infrastructure-setup.md#^ref-6deed6ac-597-0) (line 597, col 0, score 1)
- [Promethean-native config design — L421](promethean-native-config-design.md#^ref-ab748541-421-0) (line 421, col 0, score 1)
- [promethean-system-diagrams — L217](promethean-system-diagrams.md#^ref-b51e19b4-217-0) (line 217, col 0, score 1)
- [Promethean Web UI Setup — L629](promethean-web-ui-setup.md#^ref-bc5172ca-629-0) (line 629, col 0, score 1)
- [Prompt_Folder_Bootstrap — L193](prompt-folder-bootstrap.md#^ref-bd4f0976-193-0) (line 193, col 0, score 1)
- [prompt-programming-language-lisp — L107](prompt-programming-language-lisp.md#^ref-d41a06d1-107-0) (line 107, col 0, score 1)
- [sibilant-macro-targets — L172](sibilant-macro-targets.md#^ref-c5c9a5c6-172-0) (line 172, col 0, score 1)
- [Sibilant Meta-Prompt DSL — L205](sibilant-meta-prompt-dsl.md#^ref-af5d2824-205-0) (line 205, col 0, score 1)
- [sibilant-meta-string-templating-runtime — L137](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-137-0) (line 137, col 0, score 1)
- [sibilant-metacompiler-overview — L90](sibilant-metacompiler-overview.md#^ref-61d4086b-90-0) (line 90, col 0, score 1)
- [State Snapshots API and Transactional Projector — L366](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-366-0) (line 366, col 0, score 1)
- [template-based-compilation — L104](template-based-compilation.md#^ref-f8877e5e-104-0) (line 104, col 0, score 1)
- [ts-to-lisp-transpiler — L8](ts-to-lisp-transpiler.md#^ref-ba11486b-8-0) (line 8, col 0, score 1)
- [typed-struct-compiler — L384](typed-struct-compiler.md#^ref-78eeedf7-384-0) (line 384, col 0, score 1)
- [Unique Info Dump Index — L103](unique-info-dump-index.md#^ref-30ec3ba6-103-0) (line 103, col 0, score 1)
- [Math Fundamentals — L31](chunks/math-fundamentals.md#^ref-c6e87433-31-0) (line 31, col 0, score 1)
- [Tooling — L19](chunks/tooling.md#^ref-6cb4943e-19-0) (line 19, col 0, score 1)
- [compiler-kit-foundations — L634](compiler-kit-foundations.md#^ref-01b21543-634-0) (line 634, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L212](cross-language-runtime-polymorphism.md#^ref-c34c36a6-212-0) (line 212, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L180](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-180-0) (line 180, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L56](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-56-0) (line 56, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L45](ducks-self-referential-perceptual-loop.md#^ref-71726f04-45-0) (line 45, col 0, score 1)
- [Dynamic Context Model for Web Components — L384](dynamic-context-model-for-web-components.md#^ref-f7702bf8-384-0) (line 384, col 0, score 1)
- [ecs-offload-workers — L468](ecs-offload-workers.md#^ref-6498b9d7-468-0) (line 468, col 0, score 1)
- [ecs-scheduler-and-prefabs — L413](ecs-scheduler-and-prefabs.md#^ref-c62a1815-413-0) (line 413, col 0, score 1)
- [Eidolon Field Abstract Model — L214](eidolon-field-abstract-model.md#^ref-5e8b2388-214-0) (line 214, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L214](chroma-toolkit-consolidation-plan.md#^ref-5020e892-214-0) (line 214, col 0, score 1)
- [Tooling — L18](chunks/tooling.md#^ref-6cb4943e-18-0) (line 18, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L226](cross-language-runtime-polymorphism.md#^ref-c34c36a6-226-0) (line 226, col 0, score 1)
- [ecs-offload-workers — L473](ecs-offload-workers.md#^ref-6498b9d7-473-0) (line 473, col 0, score 1)
- [ecs-scheduler-and-prefabs — L399](ecs-scheduler-and-prefabs.md#^ref-c62a1815-399-0) (line 399, col 0, score 1)
- [eidolon-field-math-foundations — L146](eidolon-field-math-foundations.md#^ref-008f2ac0-146-0) (line 146, col 0, score 1)
- [Event Bus MVP — L556](event-bus-mvp.md#^ref-534fe91d-556-0) (line 556, col 0, score 1)
- [i3-bluetooth-setup — L106](i3-bluetooth-setup.md#^ref-5e408692-106-0) (line 106, col 0, score 1)
- [Language-Agnostic Mirror System — L532](language-agnostic-mirror-system.md#^ref-d2b3628c-532-0) (line 532, col 0, score 1)
- [Lispy Macros with syntax-rules — L399](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-399-0) (line 399, col 0, score 1)
- [Local-Only-LLM-Workflow — L183](local-only-llm-workflow.md#^ref-9a8ab57e-183-0) (line 183, col 0, score 1)
- [markdown-to-org-transpiler — L306](markdown-to-org-transpiler.md#^ref-ab54cdd8-306-0) (line 306, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L314](migrate-to-provider-tenant-architecture.md#^ref-54382370-314-0) (line 314, col 0, score 1)
- [mystery-lisp-search-session — L127](mystery-lisp-search-session.md#^ref-513dc4c7-127-0) (line 127, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L171](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-171-0) (line 171, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L255](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-255-0) (line 255, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L448](performance-optimized-polyglot-bridge.md#^ref-f5579967-448-0) (line 448, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L153](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-153-0) (line 153, col 0, score 1)
- [archetype-ecs — L468](archetype-ecs.md#^ref-8f4c1e86-468-0) (line 468, col 0, score 1)
- [DSL — L17](chunks/dsl.md#^ref-e87bc036-17-0) (line 17, col 0, score 1)
- [compiler-kit-foundations — L619](compiler-kit-foundations.md#^ref-01b21543-619-0) (line 619, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L217](cross-language-runtime-polymorphism.md#^ref-c34c36a6-217-0) (line 217, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L177](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-177-0) (line 177, col 0, score 1)
- [Dynamic Context Model for Web Components — L387](dynamic-context-model-for-web-components.md#^ref-f7702bf8-387-0) (line 387, col 0, score 1)
- [ecs-offload-workers — L472](ecs-offload-workers.md#^ref-6498b9d7-472-0) (line 472, col 0, score 1)
- [eidolon-field-math-foundations — L145](eidolon-field-math-foundations.md#^ref-008f2ac0-145-0) (line 145, col 0, score 1)
- [Pure TypeScript Search Microservice — L538](pure-typescript-search-microservice.md#^ref-d17d3a96-538-0) (line 538, col 0, score 1)
- [RAG UI Panel with Qdrant and PostgREST — L374](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-374-0) (line 374, col 0, score 1)
- [Recursive Prompt Construction Engine — L200](recursive-prompt-construction-engine.md#^ref-babdb9eb-200-0) (line 200, col 0, score 1)
- [Redirecting Standard Error — L31](redirecting-standard-error.md#^ref-b3555ede-31-0) (line 31, col 0, score 1)
- [ripple-propagation-demo — L120](ripple-propagation-demo.md#^ref-8430617b-120-0) (line 120, col 0, score 1)
- [schema-evolution-workflow — L502](schema-evolution-workflow.md#^ref-d8059b6a-502-0) (line 502, col 0, score 1)
- [Self-Agency in AI Interaction — L53](self-agency-in-ai-interaction.md#^ref-49a9a860-53-0) (line 53, col 0, score 1)
- [set-assignment-in-lisp-ast — L161](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-161-0) (line 161, col 0, score 1)
- [shared-package-layout-clarification — L185](shared-package-layout-clarification.md#^ref-36c8882a-185-0) (line 185, col 0, score 1)
- [Shared Package Structure — L181](shared-package-structure.md#^ref-66a72fc3-181-0) (line 181, col 0, score 1)
- [sibilant-macro-targets — L173](sibilant-macro-targets.md#^ref-c5c9a5c6-173-0) (line 173, col 0, score 1)
- [Diagrams — L13](chunks/diagrams.md#^ref-45cd25b5-13-0) (line 13, col 0, score 1)
- [DSL — L15](chunks/dsl.md#^ref-e87bc036-15-0) (line 15, col 0, score 1)
- [JavaScript — L18](chunks/javascript.md#^ref-c1618c66-18-0) (line 18, col 0, score 1)
- [Math Fundamentals — L14](chunks/math-fundamentals.md#^ref-c6e87433-14-0) (line 14, col 0, score 1)
- [Services — L14](chunks/services.md#^ref-75ea4a6a-14-0) (line 14, col 0, score 1)
- [Shared — L7](chunks/shared.md#^ref-623a55f7-7-0) (line 7, col 0, score 1)
- [Simulation Demo — L10](chunks/simulation-demo.md#^ref-557309a3-10-0) (line 10, col 0, score 1)
- [Tooling — L9](chunks/tooling.md#^ref-6cb4943e-9-0) (line 9, col 0, score 1)
- [Window Management — L15](chunks/window-management.md#^ref-9e8ae388-15-0) (line 15, col 0, score 1)
- [markdown-to-org-transpiler — L313](markdown-to-org-transpiler.md#^ref-ab54cdd8-313-0) (line 313, col 0, score 1)
- [Matplotlib Animation with Async Execution — L79](matplotlib-animation-with-async-execution.md#^ref-687439f9-79-0) (line 79, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L299](migrate-to-provider-tenant-architecture.md#^ref-54382370-299-0) (line 299, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L151](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-151-0) (line 151, col 0, score 1)
- [Mongo Outbox Implementation — L587](mongo-outbox-implementation.md#^ref-9c1acd1e-587-0) (line 587, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L77](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-77-0) (line 77, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L120](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-120-0) (line 120, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L179](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-179-0) (line 179, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L282](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-282-0) (line 282, col 0, score 1)
- [Admin Dashboard for User Management — L43](admin-dashboard-for-user-management.md#^ref-2901a3e9-43-0) (line 43, col 0, score 1)
- [api-gateway-versioning — L300](api-gateway-versioning.md#^ref-0580dcd3-300-0) (line 300, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L305](migrate-to-provider-tenant-architecture.md#^ref-54382370-305-0) (line 305, col 0, score 1)
- [observability-infrastructure-setup — L399](observability-infrastructure-setup.md#^ref-b4e64f8c-399-0) (line 399, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L79](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-79-0) (line 79, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L165](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-165-0) (line 165, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L266](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-266-0) (line 266, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L488](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-488-0) (line 488, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L436](performance-optimized-polyglot-bridge.md#^ref-f5579967-436-0) (line 436, col 0, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L504](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-504-0) (line 504, col 0, score 1)
- [polymorphic-meta-programming-engine — L244](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-244-0) (line 244, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L91](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-91-0) (line 91, col 0, score 1)
- [AI-Centric OS with MCP Layer — L420](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-420-0) (line 420, col 0, score 1)
- [aionian-circuit-math — L177](aionian-circuit-math.md#^ref-f2d83a77-177-0) (line 177, col 0, score 1)
- [Board Automation Improvements — L18](board-automation-improvements.md#^ref-ac60a1d6-18-0) (line 18, col 0, score 1)
- [Board Walk – 2025-08-11 — L140](board-walk-2025-08-11.md#^ref-7aa1eb92-140-0) (line 140, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L118](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-118-0) (line 118, col 0, score 1)
- [Diagrams — L47](chunks/diagrams.md#^ref-45cd25b5-47-0) (line 47, col 0, score 1)
- [JavaScript — L35](chunks/javascript.md#^ref-c1618c66-35-0) (line 35, col 0, score 1)
- [Math Fundamentals — L33](chunks/math-fundamentals.md#^ref-c6e87433-33-0) (line 33, col 0, score 1)
- [Services — L31](chunks/services.md#^ref-75ea4a6a-31-0) (line 31, col 0, score 1)
- [compiler-kit-foundations — L640](compiler-kit-foundations.md#^ref-01b21543-640-0) (line 640, col 0, score 1)
- [markdown-to-org-transpiler — L318](markdown-to-org-transpiler.md#^ref-ab54cdd8-318-0) (line 318, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L322](migrate-to-provider-tenant-architecture.md#^ref-54382370-322-0) (line 322, col 0, score 1)
- [Mongo Outbox Implementation — L579](mongo-outbox-implementation.md#^ref-9c1acd1e-579-0) (line 579, col 0, score 1)
- [observability-infrastructure-setup — L369](observability-infrastructure-setup.md#^ref-b4e64f8c-369-0) (line 369, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L183](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-183-0) (line 183, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L483](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-483-0) (line 483, col 0, score 1)
- [polymorphic-meta-programming-engine — L241](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-241-0) (line 241, col 0, score 1)
- [prom-lib-rate-limiters-and-replay-api — L415](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-415-0) (line 415, col 0, score 1)
- [Promethean Agent Config DSL — L352](promethean-agent-config-dsl.md#^ref-2c00ce45-352-0) (line 352, col 0, score 1)
- [zero-copy-snapshots-and-workers — L363](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-363-0) (line 363, col 0, score 1)
- [Simulation Demo — L32](chunks/simulation-demo.md#^ref-557309a3-32-0) (line 32, col 0, score 1)
- [Tooling — L26](chunks/tooling.md#^ref-6cb4943e-26-0) (line 26, col 0, score 1)
- [Window Management — L36](chunks/window-management.md#^ref-9e8ae388-36-0) (line 36, col 0, score 1)
- [compiler-kit-foundations — L639](compiler-kit-foundations.md#^ref-01b21543-639-0) (line 639, col 0, score 1)
- [Creative Moments — L10](creative-moments.md#^ref-10d98225-10-0) (line 10, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L258](cross-language-runtime-polymorphism.md#^ref-c34c36a6-258-0) (line 258, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L215](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-215-0) (line 215, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L50](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-50-0) (line 50, col 0, score 1)
- [eidolon-node-lifecycle — L63](eidolon-node-lifecycle.md#^ref-938eca9c-63-0) (line 63, col 0, score 1)
- [EidolonField — L269](eidolonfield.md#^ref-49d1e1e5-269-0) (line 269, col 0, score 1)
- [Event Bus MVP — L566](event-bus-mvp.md#^ref-534fe91d-566-0) (line 566, col 0, score 1)
- [Event Bus Projections Architecture — L185](event-bus-projections-architecture.md#^ref-cf6b9b17-185-0) (line 185, col 0, score 1)
- [Exception Layer Analysis — L165](exception-layer-analysis.md#^ref-21d5cc09-165-0) (line 165, col 0, score 1)
- [Factorio AI with External Agents — L160](factorio-ai-with-external-agents.md#^ref-a4d90289-160-0) (line 160, col 0, score 1)
- [field-dynamics-math-blocks — L165](field-dynamics-math-blocks.md#^ref-7cfc230d-165-0) (line 165, col 0, score 1)
- [field-interaction-equations — L184](field-interaction-equations.md#^ref-b09141b7-184-0) (line 184, col 0, score 1)
- [field-node-diagram-outline — L132](field-node-diagram-outline.md#^ref-1f32c94a-132-0) (line 132, col 0, score 1)
- [archetype-ecs — L457](archetype-ecs.md#^ref-8f4c1e86-457-0) (line 457, col 0, score 1)
- [JavaScript — L21](chunks/javascript.md#^ref-c1618c66-21-0) (line 21, col 0, score 1)
- [compiler-kit-foundations — L626](compiler-kit-foundations.md#^ref-01b21543-626-0) (line 626, col 0, score 1)
- [ecs-offload-workers — L488](ecs-offload-workers.md#^ref-6498b9d7-488-0) (line 488, col 0, score 1)
- [ecs-scheduler-and-prefabs — L412](ecs-scheduler-and-prefabs.md#^ref-c62a1815-412-0) (line 412, col 0, score 1)
- [Language-Agnostic Mirror System — L547](language-agnostic-mirror-system.md#^ref-d2b3628c-547-0) (line 547, col 0, score 1)
- [template-based-compilation — L130](template-based-compilation.md#^ref-f8877e5e-130-0) (line 130, col 0, score 1)
- [typed-struct-compiler — L386](typed-struct-compiler.md#^ref-78eeedf7-386-0) (line 386, col 0, score 1)
- [DuckDuckGoSearchPipeline — L16](duckduckgosearchpipeline.md#^ref-e979c50f-16-0) (line 16, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L138](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-138-0) (line 138, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L193](chroma-toolkit-consolidation-plan.md#^ref-5020e892-193-0) (line 193, col 0, score 1)
- [Diagrams — L43](chunks/diagrams.md#^ref-45cd25b5-43-0) (line 43, col 0, score 1)
- [Services — L41](chunks/services.md#^ref-75ea4a6a-41-0) (line 41, col 0, score 1)
- [ecs-scheduler-and-prefabs — L417](ecs-scheduler-and-prefabs.md#^ref-c62a1815-417-0) (line 417, col 0, score 1)
- [eidolon-node-lifecycle — L62](eidolon-node-lifecycle.md#^ref-938eca9c-62-0) (line 62, col 0, score 1)
- [Event Bus MVP — L583](event-bus-mvp.md#^ref-534fe91d-583-0) (line 583, col 0, score 1)
- [Event Bus Projections Architecture — L182](event-bus-projections-architecture.md#^ref-cf6b9b17-182-0) (line 182, col 0, score 1)
- [Fnord Tracer Protocol — L266](fnord-tracer-protocol.md#^ref-fc21f824-266-0) (line 266, col 0, score 1)
- [i3-bluetooth-setup — L128](i3-bluetooth-setup.md#^ref-5e408692-128-0) (line 128, col 0, score 1)
- [layer-1-uptime-diagrams — L193](layer-1-uptime-diagrams.md#^ref-4127189a-193-0) (line 193, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L181](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-181-0) (line 181, col 0, score 1)
- [JavaScript — L11](chunks/javascript.md#^ref-c1618c66-11-0) (line 11, col 0, score 1)
- [ecs-offload-workers — L457](ecs-offload-workers.md#^ref-6498b9d7-457-0) (line 457, col 0, score 1)
- [ecs-scheduler-and-prefabs — L419](ecs-scheduler-and-prefabs.md#^ref-c62a1815-419-0) (line 419, col 0, score 1)
- [Interop and Source Maps — L534](interop-and-source-maps.md#^ref-cdfac40c-534-0) (line 534, col 0, score 1)
- [Lisp-Compiler-Integration — L539](lisp-compiler-integration.md#^ref-cfee6d36-539-0) (line 539, col 0, score 1)
- [Lispy Macros with syntax-rules — L412](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-412-0) (line 412, col 0, score 1)
- [State Snapshots API and Transactional Projector — L353](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-353-0) (line 353, col 0, score 1)
- [Unique Info Dump Index — L72](unique-info-dump-index.md#^ref-30ec3ba6-72-0) (line 72, col 0, score 1)
- [promethean-system-diagrams — L207](promethean-system-diagrams.md#^ref-b51e19b4-207-0) (line 207, col 0, score 1)
- [Promethean Web UI Setup — L633](promethean-web-ui-setup.md#^ref-bc5172ca-633-0) (line 633, col 0, score 1)
- [Promethean Workflow Optimization — L20](promethean-workflow-optimization.md#^ref-d614d983-20-0) (line 20, col 0, score 1)
- [Prometheus Observability Stack — L543](prometheus-observability-stack.md#^ref-e90b5a16-543-0) (line 543, col 0, score 1)
- [Prompt_Folder_Bootstrap — L216](prompt-folder-bootstrap.md#^ref-bd4f0976-216-0) (line 216, col 0, score 1)
- [prompt-programming-language-lisp — L116](prompt-programming-language-lisp.md#^ref-d41a06d1-116-0) (line 116, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L156](protocol-0-the-contradiction-engine.md#^ref-9a93a756-156-0) (line 156, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L238](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-238-0) (line 238, col 0, score 1)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L445](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-445-0) (line 445, col 0, score 1)
- [Shared Package Structure — L195](shared-package-structure.md#^ref-66a72fc3-195-0) (line 195, col 0, score 1)
- [Language-Agnostic Mirror System — L538](language-agnostic-mirror-system.md#^ref-d2b3628c-538-0) (line 538, col 0, score 1)
- [layer-1-uptime-diagrams — L178](layer-1-uptime-diagrams.md#^ref-4127189a-178-0) (line 178, col 0, score 1)
- [Lisp-Compiler-Integration — L550](lisp-compiler-integration.md#^ref-cfee6d36-550-0) (line 550, col 0, score 1)
- [lisp-dsl-for-window-management — L223](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-223-0) (line 223, col 0, score 1)
- [Lispy Macros with syntax-rules — L406](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-406-0) (line 406, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L168](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-168-0) (line 168, col 0, score 1)
- [Local-Only-LLM-Workflow — L201](local-only-llm-workflow.md#^ref-9a8ab57e-201-0) (line 201, col 0, score 1)
- [markdown-to-org-transpiler — L323](markdown-to-org-transpiler.md#^ref-ab54cdd8-323-0) (line 323, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L496](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-496-0) (line 496, col 0, score 1)
- [ripple-propagation-demo — L118](ripple-propagation-demo.md#^ref-8430617b-118-0) (line 118, col 0, score 1)
- [Math Fundamentals — L34](chunks/math-fundamentals.md#^ref-c6e87433-34-0) (line 34, col 0, score 1)
- [Services — L22](chunks/services.md#^ref-75ea4a6a-22-0) (line 22, col 0, score 1)
- [Shared — L29](chunks/shared.md#^ref-623a55f7-29-0) (line 29, col 0, score 1)
- [Simulation Demo — L23](chunks/simulation-demo.md#^ref-557309a3-23-0) (line 23, col 0, score 1)
- [Tooling — L16](chunks/tooling.md#^ref-6cb4943e-16-0) (line 16, col 0, score 1)
- [Window Management — L25](chunks/window-management.md#^ref-9e8ae388-25-0) (line 25, col 0, score 1)
- [compiler-kit-foundations — L627](compiler-kit-foundations.md#^ref-01b21543-627-0) (line 627, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L171](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-171-0) (line 171, col 0, score 1)
- [Duck's Attractor States — L81](ducks-attractor-states.md#^ref-13951643-81-0) (line 81, col 0, score 1)
- [2d-sandbox-field — L225](2d-sandbox-field.md#^ref-c710dc93-225-0) (line 225, col 0, score 1)
- [Admin Dashboard for User Management — L49](admin-dashboard-for-user-management.md#^ref-2901a3e9-49-0) (line 49, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L150](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-150-0) (line 150, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L163](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-163-0) (line 163, col 0, score 1)
- [AI-First-OS-Model-Context-Protocol — L9](ai-first-os-model-context-protocol.md#^ref-618198f4-9-0) (line 9, col 0, score 1)
- [aionian-circuit-math — L179](aionian-circuit-math.md#^ref-f2d83a77-179-0) (line 179, col 0, score 1)
- [api-gateway-versioning — L304](api-gateway-versioning.md#^ref-0580dcd3-304-0) (line 304, col 0, score 1)
- [archetype-ecs — L479](archetype-ecs.md#^ref-8f4c1e86-479-0) (line 479, col 0, score 1)
- [balanced-bst — L295](balanced-bst.md#^ref-d3e7db72-295-0) (line 295, col 0, score 1)
- [aionian-circuit-math — L165](aionian-circuit-math.md#^ref-f2d83a77-165-0) (line 165, col 0, score 1)
- [api-gateway-versioning — L319](api-gateway-versioning.md#^ref-0580dcd3-319-0) (line 319, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L116](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-116-0) (line 116, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L209](chroma-toolkit-consolidation-plan.md#^ref-5020e892-209-0) (line 209, col 0, score 1)
- [DSL — L13](chunks/dsl.md#^ref-e87bc036-13-0) (line 13, col 0, score 1)
- [Math Fundamentals — L16](chunks/math-fundamentals.md#^ref-c6e87433-16-0) (line 16, col 0, score 1)
- [Services — L16](chunks/services.md#^ref-75ea4a6a-16-0) (line 16, col 0, score 1)
- [Shared — L5](chunks/shared.md#^ref-623a55f7-5-0) (line 5, col 0, score 1)
- [Simulation Demo — L12](chunks/simulation-demo.md#^ref-557309a3-12-0) (line 12, col 0, score 1)
- [AI-Centric OS with MCP Layer — L427](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-427-0) (line 427, col 0, score 1)
- [AI-First-OS-Model-Context-Protocol — L13](ai-first-os-model-context-protocol.md#^ref-618198f4-13-0) (line 13, col 0, score 1)
- [api-gateway-versioning — L288](api-gateway-versioning.md#^ref-0580dcd3-288-0) (line 288, col 0, score 1)
- [archetype-ecs — L480](archetype-ecs.md#^ref-8f4c1e86-480-0) (line 480, col 0, score 1)
- [balanced-bst — L301](balanced-bst.md#^ref-d3e7db72-301-0) (line 301, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L178](chroma-toolkit-consolidation-plan.md#^ref-5020e892-178-0) (line 178, col 0, score 1)
- [Diagrams — L39](chunks/diagrams.md#^ref-45cd25b5-39-0) (line 39, col 0, score 1)
- [DSL — L41](chunks/dsl.md#^ref-e87bc036-41-0) (line 41, col 0, score 1)
- [JavaScript — L40](chunks/javascript.md#^ref-c1618c66-40-0) (line 40, col 0, score 1)
- [Math Fundamentals — L40](chunks/math-fundamentals.md#^ref-c6e87433-40-0) (line 40, col 0, score 1)
- [Services — L38](chunks/services.md#^ref-75ea4a6a-38-0) (line 38, col 0, score 1)
- [Lispy Macros with syntax-rules — L408](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-408-0) (line 408, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L182](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-182-0) (line 182, col 0, score 1)
- [Local-Offline-Model-Deployment-Strategy — L307](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-307-0) (line 307, col 0, score 1)
- [Local-Only-LLM-Workflow — L210](local-only-llm-workflow.md#^ref-9a8ab57e-210-0) (line 210, col 0, score 1)
- [markdown-to-org-transpiler — L320](markdown-to-org-transpiler.md#^ref-ab54cdd8-320-0) (line 320, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L272](migrate-to-provider-tenant-architecture.md#^ref-54382370-272-0) (line 272, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L136](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-136-0) (line 136, col 0, score 1)
- [Mongo Outbox Implementation — L583](mongo-outbox-implementation.md#^ref-9c1acd1e-583-0) (line 583, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L48](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-48-0) (line 48, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L109](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-109-0) (line 109, col 0, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L529](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-529-0) (line 529, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L138](protocol-0-the-contradiction-engine.md#^ref-9a93a756-138-0) (line 138, col 0, score 1)
- [Admin Dashboard for User Management — L45](admin-dashboard-for-user-management.md#^ref-2901a3e9-45-0) (line 45, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L170](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-170-0) (line 170, col 0, score 1)
- [AI-Centric OS with MCP Layer — L416](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-416-0) (line 416, col 0, score 1)
- [AI-First-OS-Model-Context-Protocol — L11](ai-first-os-model-context-protocol.md#^ref-618198f4-11-0) (line 11, col 0, score 1)
- [aionian-circuit-math — L178](aionian-circuit-math.md#^ref-f2d83a77-178-0) (line 178, col 0, score 1)
- [api-gateway-versioning — L312](api-gateway-versioning.md#^ref-0580dcd3-312-0) (line 312, col 0, score 1)
- [balanced-bst — L297](balanced-bst.md#^ref-d3e7db72-297-0) (line 297, col 0, score 1)
- [Board Walk – 2025-08-11 — L131](board-walk-2025-08-11.md#^ref-7aa1eb92-131-0) (line 131, col 0, score 1)
- [Operations — L8](chunks/operations.md#^ref-f1add613-8-0) (line 8, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L135](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-135-0) (line 135, col 0, score 1)
- [ecs-offload-workers — L481](ecs-offload-workers.md#^ref-6498b9d7-481-0) (line 481, col 0, score 1)
- [ecs-scheduler-and-prefabs — L418](ecs-scheduler-and-prefabs.md#^ref-c62a1815-418-0) (line 418, col 0, score 1)
- [eidolon-node-lifecycle — L49](eidolon-node-lifecycle.md#^ref-938eca9c-49-0) (line 49, col 0, score 1)
- [Event Bus MVP — L545](event-bus-mvp.md#^ref-534fe91d-545-0) (line 545, col 0, score 1)
- [Event Bus Projections Architecture — L148](event-bus-projections-architecture.md#^ref-cf6b9b17-148-0) (line 148, col 0, score 1)
- [Fnord Tracer Protocol — L242](fnord-tracer-protocol.md#^ref-fc21f824-242-0) (line 242, col 0, score 1)
- [i3-bluetooth-setup — L104](i3-bluetooth-setup.md#^ref-5e408692-104-0) (line 104, col 0, score 1)
- [layer-1-uptime-diagrams — L173](layer-1-uptime-diagrams.md#^ref-4127189a-173-0) (line 173, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L147](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-147-0) (line 147, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L147](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-147-0) (line 147, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L107](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-107-0) (line 107, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L217](chroma-toolkit-consolidation-plan.md#^ref-5020e892-217-0) (line 217, col 0, score 1)
- [ecs-scheduler-and-prefabs — L435](ecs-scheduler-and-prefabs.md#^ref-c62a1815-435-0) (line 435, col 0, score 1)
- [Promethean Event Bus MVP v0.1 — L940](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-940-0) (line 940, col 0, score 1)
- [prompt-programming-language-lisp — L128](prompt-programming-language-lisp.md#^ref-d41a06d1-128-0) (line 128, col 0, score 1)
- [Matplotlib Animation with Async Execution — L15](matplotlib-animation-with-async-execution.md#^ref-687439f9-15-0) (line 15, col 0, score 0.75)
- [Agent Tasks: Persistence Migration to DualStore — L176](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-176-0) (line 176, col 0, score 0.75)
- [DSL — L44](chunks/dsl.md#^ref-e87bc036-44-0) (line 44, col 0, score 1)
- [JavaScript — L48](chunks/javascript.md#^ref-c1618c66-48-0) (line 48, col 0, score 1)
- [Math Fundamentals — L43](chunks/math-fundamentals.md#^ref-c6e87433-43-0) (line 43, col 0, score 1)
- [Operations — L15](chunks/operations.md#^ref-f1add613-15-0) (line 15, col 0, score 1)
- [Services — L43](chunks/services.md#^ref-75ea4a6a-43-0) (line 43, col 0, score 1)
- [Simulation Demo — L34](chunks/simulation-demo.md#^ref-557309a3-34-0) (line 34, col 0, score 1)
- [Window Management — L38](chunks/window-management.md#^ref-9e8ae388-38-0) (line 38, col 0, score 1)
- [compiler-kit-foundations — L651](compiler-kit-foundations.md#^ref-01b21543-651-0) (line 651, col 0, score 1)
- [Creative Moments — L15](creative-moments.md#^ref-10d98225-15-0) (line 15, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L263](cross-language-runtime-polymorphism.md#^ref-c34c36a6-263-0) (line 263, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L219](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-219-0) (line 219, col 0, score 1)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
