---
uuid: 8f4c1e86-1236-4936-84ca-6ed7082af6b7
created_at: 2025.08.08.21.08.70.md
filename: archetype-ecs
description: >-
  A lightweight TypeScript ECS implementation with 64-component bitmasks, SoA
  storage, and efficient query handling for real-time applications.
tags:
  - ecs
  - typescript
  - archetype
  - soa
  - query
  - component
  - entity
related_to_title: []
related_to_uuid: []
references: []
---
Note: Consolidated here → ../notes/js/archetype-ecs.md ^ref-8f4c1e86-1-0

Heck yes—here’s a **small but legit archetype-based ECS** you can drop in as `shared/js/prom-lib/ds/ecs.ts`. It’s fast enough for real work: 64-component bitmasks (bigint), archetype tables with SoA storage, add/remove in O(1), queries with `all/any/none`, a `CommandBuffer` for safe structural changes, “changed since last tick” flags, and a tiny scheduler. ^ref-8f4c1e86-3-0

# ECS (TypeScript)

```ts
// shared/js/prom-lib/ds/ecs.ts
// MIT. Zero deps. Archetype ECS with 64-bit signature mask.
// NOTE: 64 components max (extend to 128+ via two bigints if needed).

export type Entity = number;       // 32-bit index, versioned via generations[]
export type ComponentId = number;

const MAX_COMPONENTS = 64;

export interface ComponentSpec<T> {
  name: string;
  defaults?: () => T;            // create default component payload
  onAdd?: (w: World, e: Entity, v: T) => void;
  onRemove?: (w: World, e: Entity, v: T) => void;
}

export interface ComponentType<T> extends ComponentSpec<T> {
  id: ComponentId;               // 0..63
  mask: bigint;                  // 1n << id
}

export type Query = {
  all?: bigint;                  // must have all bits
  any?: bigint;                  // must have at least one
  none?: bigint;                 // must have none
  changed?: bigint;              // at least one changed since last tick
};

type Column = any[];             // SoA column per component id
type Edge = Map<ComponentId, Archetype>; // add/remove graph edges for fast moves

class Archetype {
  mask: bigint;
  entities: Entity[] = [];
  // per component id -> column array
  columns: Map<ComponentId, Column> = new Map();
  addEdges: Edge = new Map();    // if you add comp X, go to archetype Y
  rmEdges: Edge = new Map();     // if you remove comp X, go to archetype Z
  // changed flags per comp id (bitset of rows changed in this tick)
  // For simplicity we track "row touched this tick" as a sparse Set per comp id.
  changed: Map<ComponentId, Set<number>> = new Map();

  constructor(mask: bigint) { this.mask = mask; }

  ensureColumn(cid: ComponentId) {
    if (!this.columns.has(cid)) this.columns.set(cid, []);
    if (!this.changed.has(cid)) this.changed.set(cid, new Set());
  }
}

function hasAll(mask: bigint, all: bigint)   { return (mask & all) === all; }
function hasAny(mask: bigint, any: bigint)   { return any === 0n ? true : (mask & any) !== 0n; }
function hasNone(mask: bigint, none: bigint) { return (mask & none) === 0n; }

export class World {
  // entity bookkeeping
  private generations: number[] = [];      // version per index
  private freeList: number[] = [];         // recycled indices
  private alive = new Set<Entity>();       // quick existence check

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
    if (typeof init === "bigint") {
      // mask-only init: fill with defaults
      for (let cid=0; cid<this.nextCompId; cid++) {
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
    const { arch, row } = this.loc[e & 0xffff];
    // call onRemove hooks for all comps present
    for (let cid=0; cid<this.nextCompId; cid++) {
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
    const idx = e & 0xffff, gen = e >>> 16;
    return this.generations[idx] === gen && this.alive.has(e);
  }

  // === Components ops ===
  addComponent<T>(e: Entity, ct: ComponentType<T>, value?: T): void {
    this.requireAlive(e);
    const idx = e & 0xffff;
    const from = this.loc[idx].arch;
    if ((from.mask & ct.mask) !== 0n) {
      // already has: set value + mark changed
      const row = this.loc[idx].row;
      from.columns.get(ct.id)![row] = value ?? from.columns.get(ct.id)![row];
      from.changed.get(ct.id)!.add(row);
      return;
    }
    // move to new archetype with component added
    const to = this.nextArchetype(from, ct.id, true);
    const oldRow = this.loc[idx].row;
    const payloads: Record<number, any> = {};
    // carry over existing columns
    for (const [cid, col] of from.columns) payloads[cid] = col[oldRow];
    // new comp value (or default)
    payloads[ct.id] = value ?? ct.defaults?.();
    this.move(e, from, oldRow, to, payloads);
    ct.onAdd?.(this, e, payloads[ct.id]);
  }

  removeComponent<T>(e: Entity, ct: ComponentType<T>): void {
    this.requireAlive(e);
    const idx = e & 0xffff;
    const from = this.loc[idx].arch;
    if ((from.mask & ct.mask) === 0n) return; // nothing to do
    const to = this.nextArchetype(from, ct.id, false);
    const oldRow = this.loc[idx].row;
    const payloads: Record<number, any> = {};
    // carry over existing columns except the removed one
    for (const [cid, col] of from.columns) if (cid !== ct.id) payloads[cid] = col[oldRow];
    const oldVal = from.columns.get(ct.id)![oldRow];
    this.move(e, from, oldRow, to, payloads);
    ct.onRemove?.(this, e, oldVal);
  }

  get<T>(e: Entity, ct: ComponentType<T>): T | undefined {
    if (!this.isAlive(e)) return undefined;
    const { arch, row } = this.loc[e & 0xffff];
    if ((arch.mask & ct.mask) === 0n) return undefined;
    return arch.columns.get(ct.id)![row];
  }

  set<T>(e: Entity, ct: ComponentType<T>, value: T): void {
    this.requireAlive(e);
    const { arch, row } = this.loc[e & 0xffff];
    if ((arch.mask & ct.mask) === 0n) throw new Error(`entity lacks component '${ct.name}'`);
    arch.columns.get(ct.id)![row] = value;
    arch.changed.get(ct.id)!.add(row);
  }

  has(e: Entity, ct: ComponentType<any>): boolean {
    if (!this.isAlive(e)) return false;
    const { arch } = this.loc[e & 0xffff];
    return (arch.mask & ct.mask) !== 0n;
  }

  // === Query + iteration ===
  // Build a query mask set: pass ComponentType(s) for all/any/none/changed
  makeQuery(opts: { all?: ComponentType<any>[]; any?: ComponentType<any>[]; none?: ComponentType<any>[]; changed?: ComponentType<any>[] }): Query {
    const bit = (arr?: ComponentType<any>[]) => (arr && arr.length ? arr.map(c=>c.mask).reduce((a,b)=>a|b, 0n) : 0n);
    return { all: bit(opts.all), any: bit(opts.any), none: bit(opts.none), changed: bit(opts.changed) };
  }

  // Iterate matching entities. Returns generator of (e, getters) tuples to keep it ergonomic.
  *iter<T1=unknown,T2=unknown,T3=unknown>(q: Query, c1?: ComponentType<T1>, c2?: ComponentType<T2>, c3?: ComponentType<T3>):
    IterableIterator<[Entity, (ct: ComponentType<any>) => any, T1?, T2?, T3?]> {
    for (const arch of this.archetypes.values()) {
      const m = arch.mask;
      if (q.all && !hasAll(m, q.all)) continue;
      if (q.any && !hasAny(m, q.any)) continue;
      if (q.none && !hasNone(m, q.none)) continue;
      const rows = arch.entities.length;
      const needChanged = q.changed && q.changed !== 0n;
      for (let row=0; row<rows; row++) {
        if (needChanged) {
          // require at least one of the 'changed' components touched this tick
          let ok = false;
          for (let cid=0; cid<this.nextCompId; cid++) {
            const bit = 1n << BigInt(cid);
            if ((q.changed! & bit) !== 0n) {
              if (arch.changed.get(cid)?.has(row)) { ok = true; break; }
            }
          }
          if (!ok) continue;
        }
        const e = arch.entities[row];
        const get = (ct: ComponentType<any>) => arch.columns.get(ct.id)![row];
        const v1 = c1 ? arch.columns.get(c1.id)![row] : undefined;
        const v2 = c2 ? arch.columns.get(c2.id)![row] : undefined;
        const v3 = c3 ? arch.columns.get(c3.id)![row] : undefined;
        yield [e, get, v1 as any, v2 as any, v3 as any];
      }
    }
  }

  // === Ticking & command buffers ===
  beginTick(): CommandBuffer {
    if (this._inTick) throw new Error("nested tick not allowed");
    this._inTick = true;
    // clear 'changed' flags at start of tick
    for (const a of this.archetypes.values()) for (const s of a.changed.values()) s.clear();
    return new CommandBuffer(this);
  }

  endTick(): void {
    if (!this._inTick) return;
    this._inTick = false;
  }

  // === Internals ===
  private getOrCreateArchetype(mask: bigint): Archetype {
    let a = this.archetypes.get(mask);
    if (!a) {
      a = new Archetype(mask);
      // initialize columns for existing comps present in mask
      for (let cid=0; cid<this.nextCompId; cid++) {
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
      const toMask = adding ? (from.mask | (1n << BigInt(cid))) : (from.mask & ~(1n << BigInt(cid)));
      to = this.getOrCreateArchetype(toMask);
      // ensure necessary columns exist there
      for (let i=0; i<this.nextCompId; i++) {
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
    for (const [cid, col] of arch.columns) {
      if (col.length < arch.entities.length) col.push(undefined);
      arch.changed.get(cid)!.add(row); // mark as changed on arrival
    }
    // stash loc
    this.loc[e & 0xffff] = { arch, row };
    return this.loc[e & 0xffff];
  }

  private removeRow(arch: Archetype, row: number): void {
    const last = arch.entities.length - 1;
    const eLast = arch.entities[last];
    // swap-remove entity row
    arch.entities[row] = eLast;
    arch.entities.pop();
    for (const [cid, col] of arch.columns) {
      col[row] = col[last];
      col.pop();
      // mark changed for touched rows
      arch.changed.get(cid)!.add(row);
    }
    // update moved entity loc
    const idxLast = eLast & 0xffff;
    this.loc[idxLast] = { arch, row };
  }

  private move(e: Entity, from: Archetype, oldRow: number, to: Archetype, payloads: Record<number, any>) {
    // add to 'to'
    const loc = this.addRow(to, e);
    // seed columns from payloads
    for (const [cid, val] of Object.entries(payloads)) {
      const n = Number(cid);
      to.columns.get(n)![loc.row] = val;
      to.changed.get(n)!.add(loc.row);
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
  constructor(w: World) { this.world = w; }

  createEntity(init?: Record<ComponentId, any> | bigint): Entity {
    let temp: Entity = -1;
    this.ops.push(() => { temp = this.world.createEntity(init); });
    return temp;
  }
  destroyEntity(e: Entity) { this.ops.push(() => this.world.destroyEntity(e)); }
  add<T>(e: Entity, ct: ComponentType<T>, v?: T) { this.ops.push(() => this.world.addComponent(e, ct, v)); }
  remove<T>(e: Entity, ct: ComponentType<T>) { this.ops.push(() => this.world.removeComponent(e, ct)); }
  set<T>(e: Entity, ct: ComponentType<T>, v: T) { this.ops.push(() => this.world.set(e, ct, v)); }

  flush() {
    for (const op of this.ops) op();
    this.ops.length = 0;
  }
}
```
^ref-8f4c1e86-7-0 ^ref-8f4c1e86-363-0

# Tiny usage demo
 ^ref-8f4c1e86-366-0
```ts
import { World } from "./ecs";

// 1) Define components
type Position = { x:number; y:number };
type Velocity = { x:number; y:number };
type Lifetime = { t:number };

const world = new World();
const CPos = world.defineComponent<Position>({ name: "Position", defaults: () => ({x:0,y:0}) });
const CVel = world.defineComponent<Velocity>({ name: "Velocity", defaults: () => ({x:0,y:0}) });
const CLife = world.defineComponent<Lifetime>({ name: "Lifetime", defaults: () => ({t:1.0}) });

// 2) Spawn
const e = world.createEntity();
world.addComponent(e, CPos, {x:0,y:0});
world.addComponent(e, CVel, {x:2,y:1});
world.addComponent(e, CLife, {t:3});

// 3) Systems (per tick)
function physics(dt: number) {
  const q = world.makeQuery({ all:[CPos, CVel] });
  for (const [ent, get, pos, vel] of world.iter(q, CPos, CVel)) {
    pos!.x += vel!.x * dt;
    pos!.y += vel!.y * dt;
    world.set(ent, CPos, pos!); // mark changed
  }
}

function decay(dt: number) {
  const q = world.makeQuery({ all:[CLife] });
  for (const [ent, get, life] of world.iter(q, CLife)) {
    life!.t -= dt;
    if (life!.t <= 0) world.destroyEntity(ent);
    else world.set(ent, CLife, life!);
  }
}

// 4) Tick with a command buffer (optional for structural ops)
function tick(dt: number) {
  const cmd = world.beginTick();
  physics(dt);
  decay(dt);
  cmd.flush();
  world.endTick();
}
^ref-8f4c1e86-366-0
```

# Extras you can add (optional, easy bolt-ons)
 ^ref-8f4c1e86-417-0
* **System scheduler** with dependencies (use the DAG you already have—toposort the system graph and run). ^ref-8f4c1e86-418-0
* **Events**: fire component `onAdd/onRemove` (already supported) + `onChanged` subscription via `changed:` queries. ^ref-8f4c1e86-419-0
* **Serialization**: `World → JSON` by dumping archetypes and columns; `JSON → World` by rebuilding rows.
* **More than 64 components**: maintain two (or N) `bigint` masks per archetype and per query.

# Mermaid (shape of the ECS) ^ref-8f4c1e86-423-0

```mermaid
flowchart LR
  subgraph World
    A[Archetype 0b0011]:::arch
    B[Archetype 0b0111]:::arch
    C[Archetype 0b0010]:::arch
    A-- add C2 -->B
    B-- remove C1 -->C
    A -- SoA columns --> ColsA[(Pos[], Vel[])]
    B -- SoA columns --> ColsB[(Pos[], Vel[], Life[])]
  end
  Sys1[Physics System] -->|query all:[Pos,Vel]| A & B
  Sys2[Lifetime System] -->|query all:[Life]| B
^ref-8f4c1e86-423-0
  classDef arch fill:#eef,stroke:#88f;
```
 ^ref-8f4c1e86-441-0
# Sibilant sprinkles (pseudo)

```lisp
; shared/sibilant/prom/ds/ecs.sib (pseudo)
(defn make-world [] (new World))
(defn defcomp [w name defaults] (.defineComponent w {:name name :defaults defaults}))
(defn query [w & {:all [] :any [] :none [] :changed []}]
^ref-8f4c1e86-441-0
  (.makeQuery w {:all all :any any :none none :changed changed})) ^ref-8f4c1e86-450-0
(defn iter [w q & comps] (.iter w q ~@comps))
``` ^ref-8f4c1e86-452-0
^ref-8f4c1e86-444-0
 ^ref-8f4c1e86-453-0
Want me to wire a **system scheduler** that uses the Graph you already have (with per-system resources, parallel-safe stages), or add a **prefab/blueprint** loader?<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [ecs-scheduler-and-prefabs](ecs-scheduler-and-prefabs.md)
- [System Scheduler with Resource-Aware DAG](system-scheduler-with-resource-aware-dag.md)
- [JavaScript](chunks/javascript.md)
- [Unique Info Dump Index](unique-info-dump-index.md)
- [Language-Agnostic Mirror System](language-agnostic-mirror-system.md)
- [graph-ds](graph-ds.md)
- [ecs-offload-workers](ecs-offload-workers.md)
- [typed-struct-compiler](typed-struct-compiler.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [aionian-circuit-math](aionian-circuit-math.md)
- [Diagrams](chunks/diagrams.md)
- [DSL](chunks/dsl.md)
- [Local-Only-LLM-Workflow](local-only-llm-workflow.md)
- [Interop and Source Maps](interop-and-source-maps.md)
- [Lispy Macros with syntax-rules](lispy-macros-with-syntax-rules.md)
- [js-to-lisp-reverse-compiler](js-to-lisp-reverse-compiler.md)
- [Lisp-Compiler-Integration](lisp-compiler-integration.md)
- [Promethean Infrastructure Setup](promethean-infrastructure-setup.md)
- [Performance-Optimized-Polyglot-Bridge](performance-optimized-polyglot-bridge.md)
- [compiler-kit-foundations](compiler-kit-foundations.md)
- [Agent Tasks: Persistence Migration to DualStore](agent-tasks-persistence-migration-to-dualstore.md)
- [2d-sandbox-field](2d-sandbox-field.md)
- [Admin Dashboard for User Management](admin-dashboard-for-user-management.md)
- [Agent Reflections and Prompt Evolution](agent-reflections-and-prompt-evolution.md)
- [api-gateway-versioning](api-gateway-versioning.md)
- [Math Fundamentals](chunks/math-fundamentals.md)
- [AI-Centric OS with MCP Layer](ai-centric-os-with-mcp-layer.md)
- [Board Walk – 2025-08-11](board-walk-2025-08-11.md)
- [Cross-Target Macro System in Sibilant](cross-target-macro-system-in-sibilant.md)
- [Window Management](chunks/window-management.md)
- [State Snapshots API and Transactional Projector](state-snapshots-api-and-transactional-projector.md)
- [Sibilant Meta-Prompt DSL](sibilant-meta-prompt-dsl.md)
- [template-based-compilation](template-based-compilation.md)
- [i3-config-validation-methods](i3-config-validation-methods.md)
- [sibilant-macro-targets](sibilant-macro-targets.md)
- [sibilant-meta-string-templating-runtime](sibilant-meta-string-templating-runtime.md)
- [sibilant-metacompiler-overview](sibilant-metacompiler-overview.md)
- [ts-to-lisp-transpiler](ts-to-lisp-transpiler.md)
- [Services](chunks/services.md)
- [Event Bus MVP](event-bus-mvp.md)
- [Cross-Language Runtime Polymorphism](cross-language-runtime-polymorphism.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [Debugging Broker Connections and Agent Behavior](debugging-broker-connections-and-agent-behavior.md)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler](ollama-llm-provider-for-pseudo-code-transpiler.md)
- [ParticleSimulationWithCanvasAndFFmpeg](particlesimulationwithcanvasandffmpeg.md)
- [Per-Domain Policy System for JS Crawler](per-domain-policy-system-for-js-crawler.md)
- [Mongo Outbox Implementation](mongo-outbox-implementation.md)
- [EidolonField](eidolonfield.md)
- [Eidolon Field Abstract Model](eidolon-field-abstract-model.md)
- [Migrate to Provider-Tenant Architecture](migrate-to-provider-tenant-architecture.md)
- [field-dynamics-math-blocks](field-dynamics-math-blocks.md)
- [balanced-bst](balanced-bst.md)
- [Exception Layer Analysis](exception-layer-analysis.md)
- [markdown-to-org-transpiler](markdown-to-org-transpiler.md)
- [Event Bus Projections Architecture](event-bus-projections-architecture.md)
- [field-interaction-equations](field-interaction-equations.md)
- [field-node-diagram-outline](field-node-diagram-outline.md)
- [Tooling](chunks/tooling.md)
- [Duck's Self-Referential Perceptual Loop](ducks-self-referential-perceptual-loop.md)
- [Shared](chunks/shared.md)
- [Simulation Demo](chunks/simulation-demo.md)
- [observability-infrastructure-setup](observability-infrastructure-setup.md)
- [obsidian-ignore-node-modules-regex](obsidian-ignore-node-modules-regex.md)
- [eidolon-node-lifecycle](eidolon-node-lifecycle.md)
- [Factorio AI with External Agents](factorio-ai-with-external-agents.md)
- [Matplotlib Animation with Async Execution](matplotlib-animation-with-async-execution.md)
- [Model Selection for Lightweight Conversational Tasks](model-selection-for-lightweight-conversational-tasks.md)
- [Obsidian Templating Plugins Integration Guide](obsidian-templating-plugins-integration-guide.md)
- [AI-First-OS-Model-Context-Protocol](ai-first-os-model-context-protocol.md)
- [Promethean Event Bus MVP v0.1](promethean-event-bus-mvp-v0-1.md)
- [Promethean Web UI Setup](promethean-web-ui-setup.md)
- [Promethean-native config design](promethean-native-config-design.md)
- [Promethean_Eidolon_Synchronicity_Model](promethean-eidolon-synchronicity-model.md)
- [promethean-system-diagrams](promethean-system-diagrams.md)
- [Prompt_Folder_Bootstrap](prompt-folder-bootstrap.md)
- [prompt-programming-language-lisp](prompt-programming-language-lisp.md)
- [Canonical Org-Babel Matplotlib Animation Template](canonical-org-babel-matplotlib-animation-template.md)
- [Board Automation Improvements](board-automation-improvements.md)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop](polyglot-s-expr-bridge-python-js-lisp-interop.md)
- [zero-copy-snapshots-and-workers](zero-copy-snapshots-and-workers.md)
- [Local-First Intention→Code Loop with Free Models](local-first-intention-code-loop-with-free-models.md)
- [mystery-lisp-search-session](mystery-lisp-search-session.md)
- [set-assignment-in-lisp-ast](set-assignment-in-lisp-ast.md)
- [Protocol_0_The_Contradiction_Engine](protocol-0-the-contradiction-engine.md)
- [Creative Moments](creative-moments.md)
- [Local-Offline-Model-Deployment-Strategy](local-offline-model-deployment-strategy.md)
- [Obsidian ChatGPT Plugin Integration](obsidian-chatgpt-plugin-integration.md)
- [Operations](chunks/operations.md)
- [polymorphic-meta-programming-engine](polymorphic-meta-programming-engine.md)
- [Post-Linguistic Transhuman Design Frameworks](post-linguistic-transhuman-design-frameworks.md)
- [Fnord Tracer Protocol](fnord-tracer-protocol.md)
- [heartbeat-fragment-demo](heartbeat-fragment-demo.md)
- [field-node-diagram-set](field-node-diagram-set.md)
- [field-node-diagram-visualizations](field-node-diagram-visualizations.md)
- [heartbeat-simulation-snippets](heartbeat-simulation-snippets.md)
- [homeostasis-decay-formulas](homeostasis-decay-formulas.md)
- [i3-bluetooth-setup](i3-bluetooth-setup.md)
- [Shared Package Structure](shared-package-structure.md)
- [ripple-propagation-demo](ripple-propagation-demo.md)
- [Provider-Agnostic Chat Panel Implementation](provider-agnostic-chat-panel-implementation.md)
- [layer-1-uptime-diagrams](layer-1-uptime-diagrams.md)
- [lisp-dsl-for-window-management](lisp-dsl-for-window-management.md)
- [Promethean Workflow Optimization](promethean-workflow-optimization.md)
- [Prometheus Observability Stack](prometheus-observability-stack.md)
- [Pure-Node Crawl Stack with Playwright and Crawlee](pure-node-crawl-stack-with-playwright-and-crawlee.md)
- [RAG UI Panel with Qdrant and PostgREST](rag-ui-panel-with-qdrant-and-postgrest.md)
- [Pure TypeScript Search Microservice](pure-typescript-search-microservice.md)
- [komorebi-group-window-hack](komorebi-group-window-hack.md)
- [schema-evolution-workflow](schema-evolution-workflow.md)
- [Self-Agency in AI Interaction](self-agency-in-ai-interaction.md)
- [shared-package-layout-clarification](shared-package-layout-clarification.md)
- [DuckDuckGoSearchPipeline](duckduckgosearchpipeline.md)
- [pm2-orchestration-patterns](pm2-orchestration-patterns.md)
- [polyglot-repl-interface-layer](polyglot-repl-interface-layer.md)
- [Promethean Pipelines: Local TypeScript-First Workflow](promethean-pipelines-local-typescript-first-workflow.md)
- [Promethean Pipelines](promethean-pipelines.md)
- [Stateful Partitions and Rebalancing](stateful-partitions-and-rebalancing.md)
- [Duck's Attractor States](ducks-attractor-states.md)
- [Promethean Documentation Pipeline Overview](promethean-documentation-pipeline-overview.md)
- [WebSocket Gateway Implementation](websocket-gateway-implementation.md)
- [universal-intention-code-fabric](universal-intention-code-fabric.md)
- [Promethean State Format](promethean-state-format.md)
- [Promethean Agent Config DSL](promethean-agent-config-dsl.md)
- [Ghostly Smoke Interference](ghostly-smoke-interference.md)
- [refactor-relations](refactor-relations.md)
- [Promethean Agent DSL TS Scaffold](promethean-agent-dsl-ts-scaffold.md)
- [prom-lib-rate-limiters-and-replay-api](prom-lib-rate-limiters-and-replay-api.md)
- [Voice Access Layer Design](voice-access-layer-design.md)
- [TypeScript Patch for Tool Calling Support](typescript-patch-for-tool-calling-support.md)
- [promethean-requirements](promethean-requirements.md)
- [Functional Refactor of TypeScript Document Processing](functional-refactor-of-typescript-document-processing.md)
- [plan-update-confirmation](plan-update-confirmation.md)
- [Chroma-Embedding-Refactor](chroma-embedding-refactor.md)
- [Recursive Prompt Construction Engine](recursive-prompt-construction-engine.md)
## Sources
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L175](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-175-0) (line 175, col 0, score 0.72)
- [ParticleSimulationWithCanvasAndFFmpeg — L281](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-281-0) (line 281, col 0, score 0.72)
- [Per-Domain Policy System for JS Crawler — L498](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-498-0) (line 498, col 0, score 0.72)
- [Performance-Optimized-Polyglot-Bridge — L449](performance-optimized-polyglot-bridge.md#^ref-f5579967-449-0) (line 449, col 0, score 0.72)
- [pm2-orchestration-patterns — L247](pm2-orchestration-patterns.md#^ref-51932e7b-247-0) (line 247, col 0, score 0.72)
- [polyglot-repl-interface-layer — L184](polyglot-repl-interface-layer.md#^ref-9c79206d-184-0) (line 184, col 0, score 0.72)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L523](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-523-0) (line 523, col 0, score 0.72)
- [polymorphic-meta-programming-engine — L240](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-240-0) (line 240, col 0, score 0.72)
- [Post-Linguistic Transhuman Design Frameworks — L102](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-102-0) (line 102, col 0, score 0.72)
- [2d-sandbox-field — L211](2d-sandbox-field.md#^ref-c710dc93-211-0) (line 211, col 0, score 0.74)
- [Agent Reflections and Prompt Evolution — L148](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-148-0) (line 148, col 0, score 0.74)
- [Agent Tasks: Persistence Migration to DualStore — L165](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-165-0) (line 165, col 0, score 0.74)
- [AI-Centric OS with MCP Layer — L428](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-428-0) (line 428, col 0, score 0.74)
- [aionian-circuit-math — L164](aionian-circuit-math.md#^ref-f2d83a77-164-0) (line 164, col 0, score 0.74)
- [api-gateway-versioning — L307](api-gateway-versioning.md#^ref-0580dcd3-307-0) (line 307, col 0, score 0.74)
- [Board Walk – 2025-08-11 — L147](board-walk-2025-08-11.md#^ref-7aa1eb92-147-0) (line 147, col 0, score 0.74)
- [Chroma Toolkit Consolidation Plan — L182](chroma-toolkit-consolidation-plan.md#^ref-5020e892-182-0) (line 182, col 0, score 0.74)
- [Diagrams — L14](chunks/diagrams.md#^ref-45cd25b5-14-0) (line 14, col 0, score 0.74)
- [DSL — L16](chunks/dsl.md#^ref-e87bc036-16-0) (line 16, col 0, score 0.74)
- [JavaScript — L14](chunks/javascript.md#^ref-c1618c66-14-0) (line 14, col 0, score 0.74)
- [Math Fundamentals — L15](chunks/math-fundamentals.md#^ref-c6e87433-15-0) (line 15, col 0, score 0.74)
- [Services — L15](chunks/services.md#^ref-75ea4a6a-15-0) (line 15, col 0, score 0.74)
- [RAG UI Panel with Qdrant and PostgREST — L384](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-384-0) (line 384, col 0, score 0.72)
- [Promethean Event Bus MVP v0.1 — L423](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-423-0) (line 423, col 0, score 0.75)
- [graph-ds — L5](graph-ds.md#^ref-6620e2f2-5-0) (line 5, col 0, score 0.63)
- [ecs-scheduler-and-prefabs — L7](ecs-scheduler-and-prefabs.md#^ref-c62a1815-7-0) (line 7, col 0, score 0.74)
- [System Scheduler with Resource-Aware DAG — L5](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-5-0) (line 5, col 0, score 0.74)
- [zero-copy-snapshots-and-workers — L70](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-70-0) (line 70, col 0, score 0.72)
- [zero-copy-snapshots-and-workers — L15](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-15-0) (line 15, col 0, score 0.63)
- [ecs-offload-workers — L209](ecs-offload-workers.md#^ref-6498b9d7-209-0) (line 209, col 0, score 0.64)
- [Shared Package Structure — L124](shared-package-structure.md#^ref-66a72fc3-124-0) (line 124, col 0, score 0.69)
- [ecs-scheduler-and-prefabs — L310](ecs-scheduler-and-prefabs.md#^ref-c62a1815-310-0) (line 310, col 0, score 0.74)
- [System Scheduler with Resource-Aware DAG — L308](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-308-0) (line 308, col 0, score 0.74)
- [Pure TypeScript Search Microservice — L155](pure-typescript-search-microservice.md#^ref-d17d3a96-155-0) (line 155, col 0, score 0.68)
- [komorebi-group-window-hack — L32](komorebi-group-window-hack.md#^ref-dd89372d-32-0) (line 32, col 0, score 0.67)
- [Promethean Event Bus MVP v0.1 — L28](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-28-0) (line 28, col 0, score 0.67)
- [Promethean Agent DSL TS Scaffold — L210](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-210-0) (line 210, col 0, score 0.67)
- [Mongo Outbox Implementation — L381](mongo-outbox-implementation.md#^ref-9c1acd1e-381-0) (line 381, col 0, score 0.66)
- [Promethean Agent DSL TS Scaffold — L696](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-696-0) (line 696, col 0, score 0.66)
- [EidolonField — L184](eidolonfield.md#^ref-49d1e1e5-184-0) (line 184, col 0, score 0.7)
- [Eidolon Field Abstract Model — L99](eidolon-field-abstract-model.md#^ref-5e8b2388-99-0) (line 99, col 0, score 0.65)
- [Fnord Tracer Protocol — L92](fnord-tracer-protocol.md#^ref-fc21f824-92-0) (line 92, col 0, score 0.65)
- [Migrate to Provider-Tenant Architecture — L160](migrate-to-provider-tenant-architecture.md#^ref-54382370-160-0) (line 160, col 0, score 0.66)
- [JavaScript — L4](chunks/javascript.md#^ref-c1618c66-4-0) (line 4, col 0, score 0.64)
- [Unique Info Dump Index — L30](unique-info-dump-index.md#^ref-30ec3ba6-30-0) (line 30, col 0, score 0.64)
- [field-dynamics-math-blocks — L78](field-dynamics-math-blocks.md#^ref-7cfc230d-78-0) (line 78, col 0, score 0.64)
- [Board Walk – 2025-08-11 — L112](board-walk-2025-08-11.md#^ref-7aa1eb92-112-0) (line 112, col 0, score 0.64)
- [Stateful Partitions and Rebalancing — L351](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-351-0) (line 351, col 0, score 0.67)
- [promethean-requirements — L4](promethean-requirements.md#^ref-95205cd3-4-0) (line 4, col 0, score 0.63)
- [ecs-offload-workers — L33](ecs-offload-workers.md#^ref-6498b9d7-33-0) (line 33, col 0, score 0.63)
- [Promethean Agent DSL TS Scaffold — L107](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-107-0) (line 107, col 0, score 0.65)
- [balanced-bst — L3](balanced-bst.md#^ref-d3e7db72-3-0) (line 3, col 0, score 0.65)
- [Performance-Optimized-Polyglot-Bridge — L170](performance-optimized-polyglot-bridge.md#^ref-f5579967-170-0) (line 170, col 0, score 0.64)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L194](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-194-0) (line 194, col 0, score 0.62)
- [EidolonField — L81](eidolonfield.md#^ref-49d1e1e5-81-0) (line 81, col 0, score 0.61)
- [Promethean Agent DSL TS Scaffold — L588](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-588-0) (line 588, col 0, score 0.59)
- [Promethean Agent DSL TS Scaffold — L780](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-780-0) (line 780, col 0, score 0.65)
- [prom-lib-rate-limiters-and-replay-api — L9](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-9-0) (line 9, col 0, score 0.66)
- [Exception Layer Analysis — L34](exception-layer-analysis.md#^ref-21d5cc09-34-0) (line 34, col 0, score 0.62)
- [ripple-propagation-demo — L9](ripple-propagation-demo.md#^ref-8430617b-9-0) (line 9, col 0, score 0.64)
- [refactor-relations — L10](refactor-relations.md#^ref-41ce0216-10-0) (line 10, col 0, score 0.64)
- [Stateful Partitions and Rebalancing — L36](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-36-0) (line 36, col 0, score 0.6)
- [Migrate to Provider-Tenant Architecture — L111](migrate-to-provider-tenant-architecture.md#^ref-54382370-111-0) (line 111, col 0, score 0.59)
- [Chroma-Embedding-Refactor — L111](chroma-embedding-refactor.md#^ref-8b256935-111-0) (line 111, col 0, score 0.59)
- [Agent Tasks: Persistence Migration to DualStore — L7](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-7-0) (line 7, col 0, score 0.59)
- [Promethean Web UI Setup — L415](promethean-web-ui-setup.md#^ref-bc5172ca-415-0) (line 415, col 0, score 0.59)
- [Stateful Partitions and Rebalancing — L202](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-202-0) (line 202, col 0, score 0.66)
- [Interop and Source Maps — L85](interop-and-source-maps.md#^ref-cdfac40c-85-0) (line 85, col 0, score 0.63)
- [typed-struct-compiler — L357](typed-struct-compiler.md#^ref-78eeedf7-357-0) (line 357, col 0, score 0.63)
- [Lispy Macros with syntax-rules — L9](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-9-0) (line 9, col 0, score 0.65)
- [ParticleSimulationWithCanvasAndFFmpeg — L30](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-30-0) (line 30, col 0, score 0.64)
- [Language-Agnostic Mirror System — L507](language-agnostic-mirror-system.md#^ref-d2b3628c-507-0) (line 507, col 0, score 0.64)
- [Language-Agnostic Mirror System — L336](language-agnostic-mirror-system.md#^ref-d2b3628c-336-0) (line 336, col 0, score 0.64)
- [schema-evolution-workflow — L313](schema-evolution-workflow.md#^ref-d8059b6a-313-0) (line 313, col 0, score 0.62)
- [Promethean Agent DSL TS Scaffold — L647](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-647-0) (line 647, col 0, score 0.63)
- [compiler-kit-foundations — L166](compiler-kit-foundations.md#^ref-01b21543-166-0) (line 166, col 0, score 0.65)
- [Promethean-native config design — L160](promethean-native-config-design.md#^ref-ab748541-160-0) (line 160, col 0, score 0.63)
- [TypeScript Patch for Tool Calling Support — L67](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-67-0) (line 67, col 0, score 0.63)
- [schema-evolution-workflow — L29](schema-evolution-workflow.md#^ref-d8059b6a-29-0) (line 29, col 0, score 0.63)
- [State Snapshots API and Transactional Projector — L179](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-179-0) (line 179, col 0, score 0.64)
- [compiler-kit-foundations — L359](compiler-kit-foundations.md#^ref-01b21543-359-0) (line 359, col 0, score 0.62)
- [Promethean Agent DSL TS Scaffold — L787](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-787-0) (line 787, col 0, score 0.63)
- [ecs-scheduler-and-prefabs — L246](ecs-scheduler-and-prefabs.md#^ref-c62a1815-246-0) (line 246, col 0, score 0.7)
- [System Scheduler with Resource-Aware DAG — L244](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-244-0) (line 244, col 0, score 0.7)
- [js-to-lisp-reverse-compiler — L13](js-to-lisp-reverse-compiler.md#^ref-58191024-13-0) (line 13, col 0, score 0.64)
- [Functional Refactor of TypeScript Document Processing — L114](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-114-0) (line 114, col 0, score 0.63)
- [Language-Agnostic Mirror System — L273](language-agnostic-mirror-system.md#^ref-d2b3628c-273-0) (line 273, col 0, score 0.64)
- [typed-struct-compiler — L16](typed-struct-compiler.md#^ref-78eeedf7-16-0) (line 16, col 0, score 0.63)
- [Event Bus MVP — L99](event-bus-mvp.md#^ref-534fe91d-99-0) (line 99, col 0, score 0.64)
- [Sibilant Meta-Prompt DSL — L91](sibilant-meta-prompt-dsl.md#^ref-af5d2824-91-0) (line 91, col 0, score 0.66)
- [Agent Tasks: Persistence Migration to DualStore — L8](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-8-0) (line 8, col 0, score 0.65)
- [Migrate to Provider-Tenant Architecture — L38](migrate-to-provider-tenant-architecture.md#^ref-54382370-38-0) (line 38, col 0, score 0.64)
- [Lispy Macros with syntax-rules — L217](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-217-0) (line 217, col 0, score 0.64)
- [Per-Domain Policy System for JS Crawler — L115](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-115-0) (line 115, col 0, score 0.64)
- [typed-struct-compiler — L339](typed-struct-compiler.md#^ref-78eeedf7-339-0) (line 339, col 0, score 0.64)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L26](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-26-0) (line 26, col 0, score 0.63)
- [Promethean Event Bus MVP v0.1 — L572](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-572-0) (line 572, col 0, score 0.67)
- [schema-evolution-workflow — L393](schema-evolution-workflow.md#^ref-d8059b6a-393-0) (line 393, col 0, score 0.66)
- [Promethean Event Bus MVP v0.1 — L747](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-747-0) (line 747, col 0, score 0.65)
- [Promethean Event Bus MVP v0.1 — L474](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-474-0) (line 474, col 0, score 0.64)
- [Promethean Event Bus MVP v0.1 — L380](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-380-0) (line 380, col 0, score 0.64)
- [Event Bus MVP — L7](event-bus-mvp.md#^ref-534fe91d-7-0) (line 7, col 0, score 0.64)
- [plan-update-confirmation — L847](plan-update-confirmation.md#^ref-b22d79c6-847-0) (line 847, col 0, score 0.62)
- [ecs-offload-workers — L15](ecs-offload-workers.md#^ref-6498b9d7-15-0) (line 15, col 0, score 0.74)
- [ecs-scheduler-and-prefabs — L340](ecs-scheduler-and-prefabs.md#^ref-c62a1815-340-0) (line 340, col 0, score 0.72)
- [System Scheduler with Resource-Aware DAG — L338](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-338-0) (line 338, col 0, score 0.72)
- [zero-copy-snapshots-and-workers — L267](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-267-0) (line 267, col 0, score 0.7)
- [zero-copy-snapshots-and-workers — L306](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-306-0) (line 306, col 0, score 0.69)
- [ecs-offload-workers — L335](ecs-offload-workers.md#^ref-6498b9d7-335-0) (line 335, col 0, score 0.69)
- [ecs-offload-workers — L359](ecs-offload-workers.md#^ref-6498b9d7-359-0) (line 359, col 0, score 0.68)
- [2d-sandbox-field — L129](2d-sandbox-field.md#^ref-c710dc93-129-0) (line 129, col 0, score 0.67)
- [Cross-Language Runtime Polymorphism — L141](cross-language-runtime-polymorphism.md#^ref-c34c36a6-141-0) (line 141, col 0, score 0.63)
- [Cross-Language Runtime Polymorphism — L139](cross-language-runtime-polymorphism.md#^ref-c34c36a6-139-0) (line 139, col 0, score 0.63)
- [Promethean Agent Config DSL — L19](promethean-agent-config-dsl.md#^ref-2c00ce45-19-0) (line 19, col 0, score 0.63)
- [Cross-Language Runtime Polymorphism — L121](cross-language-runtime-polymorphism.md#^ref-c34c36a6-121-0) (line 121, col 0, score 0.63)
- [ripple-propagation-demo — L89](ripple-propagation-demo.md#^ref-8430617b-89-0) (line 89, col 0, score 0.63)
- [EidolonField — L200](eidolonfield.md#^ref-49d1e1e5-200-0) (line 200, col 0, score 0.63)
- [Promethean Event Bus MVP v0.1 — L497](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-497-0) (line 497, col 0, score 0.62)
- [Performance-Optimized-Polyglot-Bridge — L347](performance-optimized-polyglot-bridge.md#^ref-f5579967-347-0) (line 347, col 0, score 0.62)
- [Eidolon Field Abstract Model — L178](eidolon-field-abstract-model.md#^ref-5e8b2388-178-0) (line 178, col 0, score 0.62)
- [Chroma Toolkit Consolidation Plan — L199](chroma-toolkit-consolidation-plan.md#^ref-5020e892-199-0) (line 199, col 0, score 1)
- [ecs-offload-workers — L453](ecs-offload-workers.md#^ref-6498b9d7-453-0) (line 453, col 0, score 1)
- [ecs-scheduler-and-prefabs — L385](ecs-scheduler-and-prefabs.md#^ref-c62a1815-385-0) (line 385, col 0, score 1)
- [eidolon-field-math-foundations — L128](eidolon-field-math-foundations.md#^ref-008f2ac0-128-0) (line 128, col 0, score 1)
- [Local-Only-LLM-Workflow — L177](local-only-llm-workflow.md#^ref-9a8ab57e-177-0) (line 177, col 0, score 1)
- [markdown-to-org-transpiler — L297](markdown-to-org-transpiler.md#^ref-ab54cdd8-297-0) (line 297, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L162](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-162-0) (line 162, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L441](performance-optimized-polyglot-bridge.md#^ref-f5579967-441-0) (line 441, col 0, score 1)
- [Dynamic Context Model for Web Components — L154](dynamic-context-model-for-web-components.md#^ref-f7702bf8-154-0) (line 154, col 0, score 0.65)
- [Dynamic Context Model for Web Components — L363](dynamic-context-model-for-web-components.md#^ref-f7702bf8-363-0) (line 363, col 0, score 0.65)
- [Stateful Partitions and Rebalancing — L347](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-347-0) (line 347, col 0, score 0.65)
- [Stateful Partitions and Rebalancing — L513](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-513-0) (line 513, col 0, score 0.65)
- [Promethean Event Bus MVP v0.1 — L96](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-96-0) (line 96, col 0, score 0.64)
- [Voice Access Layer Design — L214](voice-access-layer-design.md#^ref-543ed9b3-214-0) (line 214, col 0, score 0.64)
- [Provider-Agnostic Chat Panel Implementation — L13](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-13-0) (line 13, col 0, score 0.64)
- [schema-evolution-workflow — L467](schema-evolution-workflow.md#^ref-d8059b6a-467-0) (line 467, col 0, score 0.63)
- [Mongo Outbox Implementation — L148](mongo-outbox-implementation.md#^ref-9c1acd1e-148-0) (line 148, col 0, score 0.63)
- [Promethean Web UI Setup — L262](promethean-web-ui-setup.md#^ref-bc5172ca-262-0) (line 262, col 0, score 0.63)
- [Promethean Event Bus MVP v0.1 — L17](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-17-0) (line 17, col 0, score 0.63)
- [Promethean State Format — L26](promethean-state-format.md#^ref-23df6ddb-26-0) (line 26, col 0, score 0.7)
- [Language-Agnostic Mirror System — L30](language-agnostic-mirror-system.md#^ref-d2b3628c-30-0) (line 30, col 0, score 0.68)
- [schema-evolution-workflow — L224](schema-evolution-workflow.md#^ref-d8059b6a-224-0) (line 224, col 0, score 0.66)
- [Promethean-native config design — L62](promethean-native-config-design.md#^ref-ab748541-62-0) (line 62, col 0, score 0.66)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L150](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-150-0) (line 150, col 0, score 0.65)
- [Language-Agnostic Mirror System — L523](language-agnostic-mirror-system.md#^ref-d2b3628c-523-0) (line 523, col 0, score 0.65)
- [Promethean-native config design — L59](promethean-native-config-design.md#^ref-ab748541-59-0) (line 59, col 0, score 0.65)
- [polymorphic-meta-programming-engine — L3](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-3-0) (line 3, col 0, score 0.65)
- [api-gateway-versioning — L280](api-gateway-versioning.md#^ref-0580dcd3-280-0) (line 280, col 0, score 0.64)
- [Agent Tasks: Persistence Migration to DualStore — L97](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-97-0) (line 97, col 0, score 0.64)
- [AI-Centric OS with MCP Layer — L351](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-351-0) (line 351, col 0, score 0.61)
- [Fnord Tracer Protocol — L149](fnord-tracer-protocol.md#^ref-fc21f824-149-0) (line 149, col 0, score 0.6)
- [pm2-orchestration-patterns — L11](pm2-orchestration-patterns.md#^ref-51932e7b-11-0) (line 11, col 0, score 0.59)
- [Promethean-native config design — L355](promethean-native-config-design.md#^ref-ab748541-355-0) (line 355, col 0, score 0.59)
- [schema-evolution-workflow — L3](schema-evolution-workflow.md#^ref-d8059b6a-3-0) (line 3, col 0, score 0.59)
- [Board Walk – 2025-08-11 — L13](board-walk-2025-08-11.md#^ref-7aa1eb92-13-0) (line 13, col 0, score 0.59)
- [Board Walk – 2025-08-11 — L31](board-walk-2025-08-11.md#^ref-7aa1eb92-31-0) (line 31, col 0, score 0.59)
- [Fnord Tracer Protocol — L26](fnord-tracer-protocol.md#^ref-fc21f824-26-0) (line 26, col 0, score 0.59)
- [Fnord Tracer Protocol — L39](fnord-tracer-protocol.md#^ref-fc21f824-39-0) (line 39, col 0, score 0.59)
- [Recursive Prompt Construction Engine — L11](recursive-prompt-construction-engine.md#^ref-babdb9eb-11-0) (line 11, col 0, score 0.58)
- [Language-Agnostic Mirror System — L11](language-agnostic-mirror-system.md#^ref-d2b3628c-11-0) (line 11, col 0, score 0.81)
- [ecs-scheduler-and-prefabs — L352](ecs-scheduler-and-prefabs.md#^ref-c62a1815-352-0) (line 352, col 0, score 0.79)
- [System Scheduler with Resource-Aware DAG — L350](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-350-0) (line 350, col 0, score 0.79)
- [Promethean Pipelines: Local TypeScript-First Workflow — L219](promethean-pipelines-local-typescript-first-workflow.md#^ref-6b63edca-219-0) (line 219, col 0, score 0.77)
- [Promethean Pipelines — L58](promethean-pipelines.md#^ref-8b8e6103-58-0) (line 58, col 0, score 0.75)
- [RAG UI Panel with Qdrant and PostgREST — L336](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-336-0) (line 336, col 0, score 0.74)
- [Promethean Infrastructure Setup — L501](promethean-infrastructure-setup.md#^ref-6deed6ac-501-0) (line 501, col 0, score 0.74)
- [Duck's Attractor States — L5](ducks-attractor-states.md#^ref-13951643-5-0) (line 5, col 0, score 0.73)
- [Promethean Event Bus MVP v0.1 — L832](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-832-0) (line 832, col 0, score 0.73)
- [Promethean Web UI Setup — L581](promethean-web-ui-setup.md#^ref-bc5172ca-581-0) (line 581, col 0, score 0.72)
- [Promethean Documentation Pipeline Overview — L78](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-78-0) (line 78, col 0, score 0.72)
- [Stateful Partitions and Rebalancing — L187](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-187-0) (line 187, col 0, score 0.71)
- [universal-intention-code-fabric — L9](universal-intention-code-fabric.md#^ref-c14edce7-9-0) (line 9, col 0, score 0.71)
- [Event Bus Projections Architecture — L67](event-bus-projections-architecture.md#^ref-cf6b9b17-67-0) (line 67, col 0, score 0.7)
- [Promethean Agent Config DSL — L239](promethean-agent-config-dsl.md#^ref-2c00ce45-239-0) (line 239, col 0, score 0.7)
- [Ghostly Smoke Interference — L11](ghostly-smoke-interference.md#^ref-b6ae7dfa-11-0) (line 11, col 0, score 0.7)
- [ecs-scheduler-and-prefabs — L368](ecs-scheduler-and-prefabs.md#^ref-c62a1815-368-0) (line 368, col 0, score 0.75)
- [System Scheduler with Resource-Aware DAG — L366](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-366-0) (line 366, col 0, score 0.75)
- [graph-ds — L343](graph-ds.md#^ref-6620e2f2-343-0) (line 343, col 0, score 0.75)
- [Stateful Partitions and Rebalancing — L499](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-499-0) (line 499, col 0, score 0.74)
- [State Snapshots API and Transactional Projector — L303](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-303-0) (line 303, col 0, score 0.72)
- [Event Bus MVP — L509](event-bus-mvp.md#^ref-534fe91d-509-0) (line 509, col 0, score 0.71)
- [WebSocket Gateway Implementation — L595](websocket-gateway-implementation.md#^ref-e811123d-595-0) (line 595, col 0, score 0.71)
- [schema-evolution-workflow — L450](schema-evolution-workflow.md#^ref-d8059b6a-450-0) (line 450, col 0, score 0.71)
- [Mongo Outbox Implementation — L516](mongo-outbox-implementation.md#^ref-9c1acd1e-516-0) (line 516, col 0, score 0.68)
- [Cross-Target Macro System in Sibilant — L160](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-160-0) (line 160, col 0, score 0.63)
- [ecs-scheduler-and-prefabs — L3](ecs-scheduler-and-prefabs.md#^ref-c62a1815-3-0) (line 3, col 0, score 0.8)
- [System Scheduler with Resource-Aware DAG — L1](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-1-0) (line 1, col 0, score 0.8)
- [ecs-scheduler-and-prefabs — L364](ecs-scheduler-and-prefabs.md#^ref-c62a1815-364-0) (line 364, col 0, score 0.7)
- [System Scheduler with Resource-Aware DAG — L362](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-362-0) (line 362, col 0, score 0.7)
- [ecs-offload-workers — L452](ecs-offload-workers.md#^ref-6498b9d7-452-0) (line 452, col 0, score 0.68)
- [eidolon-field-math-foundations — L126](eidolon-field-math-foundations.md#^ref-008f2ac0-126-0) (line 126, col 0, score 0.68)
- [Event Bus MVP — L565](event-bus-mvp.md#^ref-534fe91d-565-0) (line 565, col 0, score 0.68)
- [field-interaction-equations — L178](field-interaction-equations.md#^ref-b09141b7-178-0) (line 178, col 0, score 0.68)
- [graph-ds — L379](graph-ds.md#^ref-6620e2f2-379-0) (line 379, col 0, score 0.68)
- [heartbeat-fragment-demo — L130](heartbeat-fragment-demo.md#^ref-dd00677a-130-0) (line 130, col 0, score 0.68)
- [Exception Layer Analysis — L172](exception-layer-analysis.md#^ref-21d5cc09-172-0) (line 172, col 0, score 0.63)
- [field-dynamics-math-blocks — L154](field-dynamics-math-blocks.md#^ref-7cfc230d-154-0) (line 154, col 0, score 0.63)
- [field-interaction-equations — L164](field-interaction-equations.md#^ref-b09141b7-164-0) (line 164, col 0, score 0.63)
- [field-node-diagram-outline — L120](field-node-diagram-outline.md#^ref-1f32c94a-120-0) (line 120, col 0, score 0.63)
- [field-node-diagram-set — L149](field-node-diagram-set.md#^ref-22b989d5-149-0) (line 149, col 0, score 0.63)
- [field-node-diagram-visualizations — L99](field-node-diagram-visualizations.md#^ref-e9b27b06-99-0) (line 99, col 0, score 0.63)
- [graph-ds — L365](graph-ds.md#^ref-6620e2f2-365-0) (line 365, col 0, score 0.63)
- [heartbeat-fragment-demo — L111](heartbeat-fragment-demo.md#^ref-dd00677a-111-0) (line 111, col 0, score 0.63)
- [heartbeat-simulation-snippets — L101](heartbeat-simulation-snippets.md#^ref-23e221e9-101-0) (line 101, col 0, score 0.63)
- [Promethean_Eidolon_Synchronicity_Model — L74](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-74-0) (line 74, col 0, score 1)
- [Promethean Event Bus MVP v0.1 — L929](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-929-0) (line 929, col 0, score 1)
- [Promethean Infrastructure Setup — L597](promethean-infrastructure-setup.md#^ref-6deed6ac-597-0) (line 597, col 0, score 1)
- [Promethean-native config design — L421](promethean-native-config-design.md#^ref-ab748541-421-0) (line 421, col 0, score 1)
- [promethean-system-diagrams — L217](promethean-system-diagrams.md#^ref-b51e19b4-217-0) (line 217, col 0, score 1)
- [Promethean Web UI Setup — L629](promethean-web-ui-setup.md#^ref-bc5172ca-629-0) (line 629, col 0, score 1)
- [Prompt_Folder_Bootstrap — L193](prompt-folder-bootstrap.md#^ref-bd4f0976-193-0) (line 193, col 0, score 1)
- [prompt-programming-language-lisp — L107](prompt-programming-language-lisp.md#^ref-d41a06d1-107-0) (line 107, col 0, score 1)
- [field-node-diagram-visualizations — L89](field-node-diagram-visualizations.md#^ref-e9b27b06-89-0) (line 89, col 0, score 1)
- [graph-ds — L373](graph-ds.md#^ref-6620e2f2-373-0) (line 373, col 0, score 1)
- [heartbeat-fragment-demo — L99](heartbeat-fragment-demo.md#^ref-dd00677a-99-0) (line 99, col 0, score 1)
- [heartbeat-simulation-snippets — L86](heartbeat-simulation-snippets.md#^ref-23e221e9-86-0) (line 86, col 0, score 1)
- [homeostasis-decay-formulas — L154](homeostasis-decay-formulas.md#^ref-37b5d236-154-0) (line 154, col 0, score 1)
- [Interop and Source Maps — L518](interop-and-source-maps.md#^ref-cdfac40c-518-0) (line 518, col 0, score 1)
- [komorebi-group-window-hack — L205](komorebi-group-window-hack.md#^ref-dd89372d-205-0) (line 205, col 0, score 1)
- [layer-1-uptime-diagrams — L166](layer-1-uptime-diagrams.md#^ref-4127189a-166-0) (line 166, col 0, score 1)
- [Lisp-Compiler-Integration — L558](lisp-compiler-integration.md#^ref-cfee6d36-558-0) (line 558, col 0, score 1)
- [DSL — L18](chunks/dsl.md#^ref-e87bc036-18-0) (line 18, col 0, score 1)
- [JavaScript — L27](chunks/javascript.md#^ref-c1618c66-27-0) (line 27, col 0, score 1)
- [compiler-kit-foundations — L616](compiler-kit-foundations.md#^ref-01b21543-616-0) (line 616, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L198](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-198-0) (line 198, col 0, score 1)
- [Dynamic Context Model for Web Components — L408](dynamic-context-model-for-web-components.md#^ref-f7702bf8-408-0) (line 408, col 0, score 1)
- [ecs-offload-workers — L489](ecs-offload-workers.md#^ref-6498b9d7-489-0) (line 489, col 0, score 1)
- [ecs-scheduler-and-prefabs — L415](ecs-scheduler-and-prefabs.md#^ref-c62a1815-415-0) (line 415, col 0, score 1)
- [graph-ds — L380](graph-ds.md#^ref-6620e2f2-380-0) (line 380, col 0, score 1)
- [Interop and Source Maps — L519](interop-and-source-maps.md#^ref-cdfac40c-519-0) (line 519, col 0, score 1)
- [JavaScript — L21](chunks/javascript.md#^ref-c1618c66-21-0) (line 21, col 0, score 1)
- [compiler-kit-foundations — L626](compiler-kit-foundations.md#^ref-01b21543-626-0) (line 626, col 0, score 1)
- [ecs-offload-workers — L488](ecs-offload-workers.md#^ref-6498b9d7-488-0) (line 488, col 0, score 1)
- [ecs-scheduler-and-prefabs — L412](ecs-scheduler-and-prefabs.md#^ref-c62a1815-412-0) (line 412, col 0, score 1)
- [Language-Agnostic Mirror System — L547](language-agnostic-mirror-system.md#^ref-d2b3628c-547-0) (line 547, col 0, score 1)
- [System Scheduler with Resource-Aware DAG — L407](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-407-0) (line 407, col 0, score 1)
- [template-based-compilation — L130](template-based-compilation.md#^ref-f8877e5e-130-0) (line 130, col 0, score 1)
- [typed-struct-compiler — L386](typed-struct-compiler.md#^ref-78eeedf7-386-0) (line 386, col 0, score 1)
- [Math Fundamentals — L20](chunks/math-fundamentals.md#^ref-c6e87433-20-0) (line 20, col 0, score 1)
- [Services — L20](chunks/services.md#^ref-75ea4a6a-20-0) (line 20, col 0, score 1)
- [compiler-kit-foundations — L620](compiler-kit-foundations.md#^ref-01b21543-620-0) (line 620, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L237](cross-language-runtime-polymorphism.md#^ref-c34c36a6-237-0) (line 237, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L40](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-40-0) (line 40, col 0, score 1)
- [Dynamic Context Model for Web Components — L401](dynamic-context-model-for-web-components.md#^ref-f7702bf8-401-0) (line 401, col 0, score 1)
- [ecs-scheduler-and-prefabs — L386](ecs-scheduler-and-prefabs.md#^ref-c62a1815-386-0) (line 386, col 0, score 1)
- [eidolon-field-math-foundations — L127](eidolon-field-math-foundations.md#^ref-008f2ac0-127-0) (line 127, col 0, score 1)
- [Event Bus MVP — L557](event-bus-mvp.md#^ref-534fe91d-557-0) (line 557, col 0, score 1)
- [JavaScript — L15](chunks/javascript.md#^ref-c1618c66-15-0) (line 15, col 0, score 1)
- [compiler-kit-foundations — L612](compiler-kit-foundations.md#^ref-01b21543-612-0) (line 612, col 0, score 1)
- [ecs-offload-workers — L490](ecs-offload-workers.md#^ref-6498b9d7-490-0) (line 490, col 0, score 1)
- [ecs-scheduler-and-prefabs — L414](ecs-scheduler-and-prefabs.md#^ref-c62a1815-414-0) (line 414, col 0, score 1)
- [graph-ds — L367](graph-ds.md#^ref-6620e2f2-367-0) (line 367, col 0, score 1)
- [template-based-compilation — L115](template-based-compilation.md#^ref-f8877e5e-115-0) (line 115, col 0, score 1)
- [Unique Info Dump Index — L98](unique-info-dump-index.md#^ref-30ec3ba6-98-0) (line 98, col 0, score 1)
- [zero-copy-snapshots-and-workers — L379](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-379-0) (line 379, col 0, score 1)
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
- [field-node-diagram-outline — L111](field-node-diagram-outline.md#^ref-1f32c94a-111-0) (line 111, col 0, score 1)
- [field-node-diagram-set — L144](field-node-diagram-set.md#^ref-22b989d5-144-0) (line 144, col 0, score 1)
- [field-node-diagram-visualizations — L94](field-node-diagram-visualizations.md#^ref-e9b27b06-94-0) (line 94, col 0, score 1)
- [Fnord Tracer Protocol — L258](fnord-tracer-protocol.md#^ref-fc21f824-258-0) (line 258, col 0, score 1)
- [graph-ds — L398](graph-ds.md#^ref-6620e2f2-398-0) (line 398, col 0, score 1)
- [heartbeat-fragment-demo — L110](heartbeat-fragment-demo.md#^ref-dd00677a-110-0) (line 110, col 0, score 1)
- [heartbeat-simulation-snippets — L99](heartbeat-simulation-snippets.md#^ref-23e221e9-99-0) (line 99, col 0, score 1)
- [homeostasis-decay-formulas — L151](homeostasis-decay-formulas.md#^ref-37b5d236-151-0) (line 151, col 0, score 1)
- [i3-bluetooth-setup — L119](i3-bluetooth-setup.md#^ref-5e408692-119-0) (line 119, col 0, score 1)
- [Diagrams — L13](chunks/diagrams.md#^ref-45cd25b5-13-0) (line 13, col 0, score 1)
- [DSL — L15](chunks/dsl.md#^ref-e87bc036-15-0) (line 15, col 0, score 1)
- [JavaScript — L18](chunks/javascript.md#^ref-c1618c66-18-0) (line 18, col 0, score 1)
- [Math Fundamentals — L14](chunks/math-fundamentals.md#^ref-c6e87433-14-0) (line 14, col 0, score 1)
- [Services — L14](chunks/services.md#^ref-75ea4a6a-14-0) (line 14, col 0, score 1)
- [Shared — L7](chunks/shared.md#^ref-623a55f7-7-0) (line 7, col 0, score 1)
- [Simulation Demo — L10](chunks/simulation-demo.md#^ref-557309a3-10-0) (line 10, col 0, score 1)
- [Tooling — L9](chunks/tooling.md#^ref-6cb4943e-9-0) (line 9, col 0, score 1)
- [Window Management — L15](chunks/window-management.md#^ref-9e8ae388-15-0) (line 15, col 0, score 1)
- [2d-sandbox-field — L221](2d-sandbox-field.md#^ref-c710dc93-221-0) (line 221, col 0, score 1)
- [aionian-circuit-math — L165](aionian-circuit-math.md#^ref-f2d83a77-165-0) (line 165, col 0, score 1)
- [api-gateway-versioning — L319](api-gateway-versioning.md#^ref-0580dcd3-319-0) (line 319, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L116](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-116-0) (line 116, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L209](chroma-toolkit-consolidation-plan.md#^ref-5020e892-209-0) (line 209, col 0, score 1)
- [DSL — L13](chunks/dsl.md#^ref-e87bc036-13-0) (line 13, col 0, score 1)
- [Math Fundamentals — L16](chunks/math-fundamentals.md#^ref-c6e87433-16-0) (line 16, col 0, score 1)
- [Services — L16](chunks/services.md#^ref-75ea4a6a-16-0) (line 16, col 0, score 1)
- [Shared — L5](chunks/shared.md#^ref-623a55f7-5-0) (line 5, col 0, score 1)
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
- [Admin Dashboard for User Management — L43](admin-dashboard-for-user-management.md#^ref-2901a3e9-43-0) (line 43, col 0, score 1)
- [api-gateway-versioning — L300](api-gateway-versioning.md#^ref-0580dcd3-300-0) (line 300, col 0, score 1)
- [observability-infrastructure-setup — L399](observability-infrastructure-setup.md#^ref-b4e64f8c-399-0) (line 399, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L79](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-79-0) (line 79, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L165](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-165-0) (line 165, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L266](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-266-0) (line 266, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L488](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-488-0) (line 488, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L436](performance-optimized-polyglot-bridge.md#^ref-f5579967-436-0) (line 436, col 0, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L504](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-504-0) (line 504, col 0, score 1)
- [polymorphic-meta-programming-engine — L244](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-244-0) (line 244, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L91](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-91-0) (line 91, col 0, score 1)
- [Language-Agnostic Mirror System — L532](language-agnostic-mirror-system.md#^ref-d2b3628c-532-0) (line 532, col 0, score 1)
- [Lispy Macros with syntax-rules — L399](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-399-0) (line 399, col 0, score 1)
- [Local-Only-LLM-Workflow — L183](local-only-llm-workflow.md#^ref-9a8ab57e-183-0) (line 183, col 0, score 1)
- [markdown-to-org-transpiler — L306](markdown-to-org-transpiler.md#^ref-ab54cdd8-306-0) (line 306, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L314](migrate-to-provider-tenant-architecture.md#^ref-54382370-314-0) (line 314, col 0, score 1)
- [mystery-lisp-search-session — L127](mystery-lisp-search-session.md#^ref-513dc4c7-127-0) (line 127, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L171](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-171-0) (line 171, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L255](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-255-0) (line 255, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L448](performance-optimized-polyglot-bridge.md#^ref-f5579967-448-0) (line 448, col 0, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L505](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-505-0) (line 505, col 0, score 1)
- [DSL — L20](chunks/dsl.md#^ref-e87bc036-20-0) (line 20, col 0, score 1)
- [compiler-kit-foundations — L606](compiler-kit-foundations.md#^ref-01b21543-606-0) (line 606, col 0, score 1)
- [Interop and Source Maps — L514](interop-and-source-maps.md#^ref-cdfac40c-514-0) (line 514, col 0, score 1)
- [js-to-lisp-reverse-compiler — L437](js-to-lisp-reverse-compiler.md#^ref-58191024-437-0) (line 437, col 0, score 1)
- [Language-Agnostic Mirror System — L534](language-agnostic-mirror-system.md#^ref-d2b3628c-534-0) (line 534, col 0, score 1)
- [Lisp-Compiler-Integration — L536](lisp-compiler-integration.md#^ref-cfee6d36-536-0) (line 536, col 0, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L515](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-515-0) (line 515, col 0, score 1)
- [set-assignment-in-lisp-ast — L148](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-148-0) (line 148, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L153](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-153-0) (line 153, col 0, score 1)
- [AI-Centric OS with MCP Layer — L404](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-404-0) (line 404, col 0, score 1)
- [DSL — L17](chunks/dsl.md#^ref-e87bc036-17-0) (line 17, col 0, score 1)
- [compiler-kit-foundations — L619](compiler-kit-foundations.md#^ref-01b21543-619-0) (line 619, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L217](cross-language-runtime-polymorphism.md#^ref-c34c36a6-217-0) (line 217, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L177](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-177-0) (line 177, col 0, score 1)
- [Dynamic Context Model for Web Components — L387](dynamic-context-model-for-web-components.md#^ref-f7702bf8-387-0) (line 387, col 0, score 1)
- [ecs-offload-workers — L472](ecs-offload-workers.md#^ref-6498b9d7-472-0) (line 472, col 0, score 1)
- [eidolon-field-math-foundations — L145](eidolon-field-math-foundations.md#^ref-008f2ac0-145-0) (line 145, col 0, score 1)
- [AI-Centric OS with MCP Layer — L405](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-405-0) (line 405, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L219](chroma-toolkit-consolidation-plan.md#^ref-5020e892-219-0) (line 219, col 0, score 1)
- [DSL — L19](chunks/dsl.md#^ref-e87bc036-19-0) (line 19, col 0, score 1)
- [JavaScript — L25](chunks/javascript.md#^ref-c1618c66-25-0) (line 25, col 0, score 1)
- [compiler-kit-foundations — L608](compiler-kit-foundations.md#^ref-01b21543-608-0) (line 608, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L261](cross-language-runtime-polymorphism.md#^ref-c34c36a6-261-0) (line 261, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L181](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-181-0) (line 181, col 0, score 1)
- [Dynamic Context Model for Web Components — L400](dynamic-context-model-for-web-components.md#^ref-f7702bf8-400-0) (line 400, col 0, score 1)
- [ecs-offload-workers — L466](ecs-offload-workers.md#^ref-6498b9d7-466-0) (line 466, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L146](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-146-0) (line 146, col 0, score 1)
- [api-gateway-versioning — L282](api-gateway-versioning.md#^ref-0580dcd3-282-0) (line 282, col 0, score 1)
- [Dynamic Context Model for Web Components — L382](dynamic-context-model-for-web-components.md#^ref-f7702bf8-382-0) (line 382, col 0, score 1)
- [ecs-offload-workers — L456](ecs-offload-workers.md#^ref-6498b9d7-456-0) (line 456, col 0, score 1)
- [ecs-scheduler-and-prefabs — L390](ecs-scheduler-and-prefabs.md#^ref-c62a1815-390-0) (line 390, col 0, score 1)
- [eidolon-field-math-foundations — L125](eidolon-field-math-foundations.md#^ref-008f2ac0-125-0) (line 125, col 0, score 1)
- [Mongo Outbox Implementation — L572](mongo-outbox-implementation.md#^ref-9c1acd1e-572-0) (line 572, col 0, score 1)
- [observability-infrastructure-setup — L360](observability-infrastructure-setup.md#^ref-b4e64f8c-360-0) (line 360, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L163](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-163-0) (line 163, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L472](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-472-0) (line 472, col 0, score 1)
- [Admin Dashboard for User Management — L39](admin-dashboard-for-user-management.md#^ref-2901a3e9-39-0) (line 39, col 0, score 1)
- [Board Walk – 2025-08-11 — L141](board-walk-2025-08-11.md#^ref-7aa1eb92-141-0) (line 141, col 0, score 1)
- [JavaScript — L31](chunks/javascript.md#^ref-c1618c66-31-0) (line 31, col 0, score 1)
- [ecs-offload-workers — L459](ecs-offload-workers.md#^ref-6498b9d7-459-0) (line 459, col 0, score 1)
- [ecs-scheduler-and-prefabs — L395](ecs-scheduler-and-prefabs.md#^ref-c62a1815-395-0) (line 395, col 0, score 1)
- [eidolon-field-math-foundations — L156](eidolon-field-math-foundations.md#^ref-008f2ac0-156-0) (line 156, col 0, score 1)
- [i3-config-validation-methods — L64](i3-config-validation-methods.md#^ref-d28090ac-64-0) (line 64, col 0, score 1)
- [Interop and Source Maps — L533](interop-and-source-maps.md#^ref-cdfac40c-533-0) (line 533, col 0, score 1)
- [sibilant-macro-targets — L172](sibilant-macro-targets.md#^ref-c5c9a5c6-172-0) (line 172, col 0, score 1)
- [Sibilant Meta-Prompt DSL — L205](sibilant-meta-prompt-dsl.md#^ref-af5d2824-205-0) (line 205, col 0, score 1)
- [sibilant-meta-string-templating-runtime — L137](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-137-0) (line 137, col 0, score 1)
- [sibilant-metacompiler-overview — L90](sibilant-metacompiler-overview.md#^ref-61d4086b-90-0) (line 90, col 0, score 1)
- [State Snapshots API and Transactional Projector — L366](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-366-0) (line 366, col 0, score 1)
- [System Scheduler with Resource-Aware DAG — L394](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-394-0) (line 394, col 0, score 1)
- [template-based-compilation — L104](template-based-compilation.md#^ref-f8877e5e-104-0) (line 104, col 0, score 1)
- [ts-to-lisp-transpiler — L8](ts-to-lisp-transpiler.md#^ref-ba11486b-8-0) (line 8, col 0, score 1)
- [typed-struct-compiler — L384](typed-struct-compiler.md#^ref-78eeedf7-384-0) (line 384, col 0, score 1)
- [Pure TypeScript Search Microservice — L538](pure-typescript-search-microservice.md#^ref-d17d3a96-538-0) (line 538, col 0, score 1)
- [RAG UI Panel with Qdrant and PostgREST — L374](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-374-0) (line 374, col 0, score 1)
- [ripple-propagation-demo — L120](ripple-propagation-demo.md#^ref-8430617b-120-0) (line 120, col 0, score 1)
- [schema-evolution-workflow — L502](schema-evolution-workflow.md#^ref-d8059b6a-502-0) (line 502, col 0, score 1)
- [Self-Agency in AI Interaction — L53](self-agency-in-ai-interaction.md#^ref-49a9a860-53-0) (line 53, col 0, score 1)
- [set-assignment-in-lisp-ast — L161](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-161-0) (line 161, col 0, score 1)
- [shared-package-layout-clarification — L185](shared-package-layout-clarification.md#^ref-36c8882a-185-0) (line 185, col 0, score 1)
- [Shared Package Structure — L181](shared-package-structure.md#^ref-66a72fc3-181-0) (line 181, col 0, score 1)
- [sibilant-macro-targets — L173](sibilant-macro-targets.md#^ref-c5c9a5c6-173-0) (line 173, col 0, score 1)
- [Sibilant Meta-Prompt DSL — L194](sibilant-meta-prompt-dsl.md#^ref-af5d2824-194-0) (line 194, col 0, score 1)
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
- [eidolon-node-lifecycle — L63](eidolon-node-lifecycle.md#^ref-938eca9c-63-0) (line 63, col 0, score 1)
- [EidolonField — L269](eidolonfield.md#^ref-49d1e1e5-269-0) (line 269, col 0, score 1)
- [Event Bus MVP — L566](event-bus-mvp.md#^ref-534fe91d-566-0) (line 566, col 0, score 1)
- [Event Bus Projections Architecture — L185](event-bus-projections-architecture.md#^ref-cf6b9b17-185-0) (line 185, col 0, score 1)
- [Exception Layer Analysis — L165](exception-layer-analysis.md#^ref-21d5cc09-165-0) (line 165, col 0, score 1)
- [Factorio AI with External Agents — L160](factorio-ai-with-external-agents.md#^ref-a4d90289-160-0) (line 160, col 0, score 1)
- [field-dynamics-math-blocks — L165](field-dynamics-math-blocks.md#^ref-7cfc230d-165-0) (line 165, col 0, score 1)
- [field-interaction-equations — L184](field-interaction-equations.md#^ref-b09141b7-184-0) (line 184, col 0, score 1)
- [field-node-diagram-outline — L132](field-node-diagram-outline.md#^ref-1f32c94a-132-0) (line 132, col 0, score 1)
- [Simulation Demo — L32](chunks/simulation-demo.md#^ref-557309a3-32-0) (line 32, col 0, score 1)
- [Tooling — L26](chunks/tooling.md#^ref-6cb4943e-26-0) (line 26, col 0, score 1)
- [Window Management — L36](chunks/window-management.md#^ref-9e8ae388-36-0) (line 36, col 0, score 1)
- [compiler-kit-foundations — L639](compiler-kit-foundations.md#^ref-01b21543-639-0) (line 639, col 0, score 1)
- [Creative Moments — L10](creative-moments.md#^ref-10d98225-10-0) (line 10, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L258](cross-language-runtime-polymorphism.md#^ref-c34c36a6-258-0) (line 258, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L215](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-215-0) (line 215, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L50](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-50-0) (line 50, col 0, score 1)
- [DuckDuckGoSearchPipeline — L16](duckduckgosearchpipeline.md#^ref-e979c50f-16-0) (line 16, col 0, score 1)
- [AI-Centric OS with MCP Layer — L420](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-420-0) (line 420, col 0, score 1)
- [aionian-circuit-math — L177](aionian-circuit-math.md#^ref-f2d83a77-177-0) (line 177, col 0, score 1)
- [Board Automation Improvements — L18](board-automation-improvements.md#^ref-ac60a1d6-18-0) (line 18, col 0, score 1)
- [Board Walk – 2025-08-11 — L140](board-walk-2025-08-11.md#^ref-7aa1eb92-140-0) (line 140, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L118](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-118-0) (line 118, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L177](chroma-toolkit-consolidation-plan.md#^ref-5020e892-177-0) (line 177, col 0, score 1)
- [Diagrams — L47](chunks/diagrams.md#^ref-45cd25b5-47-0) (line 47, col 0, score 1)
- [JavaScript — L35](chunks/javascript.md#^ref-c1618c66-35-0) (line 35, col 0, score 1)
- [Math Fundamentals — L33](chunks/math-fundamentals.md#^ref-c6e87433-33-0) (line 33, col 0, score 1)
- [Services — L31](chunks/services.md#^ref-75ea4a6a-31-0) (line 31, col 0, score 1)
- [compiler-kit-foundations — L640](compiler-kit-foundations.md#^ref-01b21543-640-0) (line 640, col 0, score 1)
- [markdown-to-org-transpiler — L313](markdown-to-org-transpiler.md#^ref-ab54cdd8-313-0) (line 313, col 0, score 1)
- [Matplotlib Animation with Async Execution — L79](matplotlib-animation-with-async-execution.md#^ref-687439f9-79-0) (line 79, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L299](migrate-to-provider-tenant-architecture.md#^ref-54382370-299-0) (line 299, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L151](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-151-0) (line 151, col 0, score 1)
- [Mongo Outbox Implementation — L587](mongo-outbox-implementation.md#^ref-9c1acd1e-587-0) (line 587, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L77](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-77-0) (line 77, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L120](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-120-0) (line 120, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L179](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-179-0) (line 179, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L282](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-282-0) (line 282, col 0, score 1)
- [2d-sandbox-field — L225](2d-sandbox-field.md#^ref-c710dc93-225-0) (line 225, col 0, score 1)
- [Admin Dashboard for User Management — L49](admin-dashboard-for-user-management.md#^ref-2901a3e9-49-0) (line 49, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L150](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-150-0) (line 150, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L163](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-163-0) (line 163, col 0, score 1)
- [AI-First-OS-Model-Context-Protocol — L9](ai-first-os-model-context-protocol.md#^ref-618198f4-9-0) (line 9, col 0, score 1)
- [aionian-circuit-math — L179](aionian-circuit-math.md#^ref-f2d83a77-179-0) (line 179, col 0, score 1)
- [api-gateway-versioning — L304](api-gateway-versioning.md#^ref-0580dcd3-304-0) (line 304, col 0, score 1)
- [balanced-bst — L295](balanced-bst.md#^ref-d3e7db72-295-0) (line 295, col 0, score 1)
- [Board Automation Improvements — L13](board-automation-improvements.md#^ref-ac60a1d6-13-0) (line 13, col 0, score 1)
- [AI-Centric OS with MCP Layer — L427](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-427-0) (line 427, col 0, score 1)
- [AI-First-OS-Model-Context-Protocol — L13](ai-first-os-model-context-protocol.md#^ref-618198f4-13-0) (line 13, col 0, score 1)
- [aionian-circuit-math — L158](aionian-circuit-math.md#^ref-f2d83a77-158-0) (line 158, col 0, score 1)
- [api-gateway-versioning — L288](api-gateway-versioning.md#^ref-0580dcd3-288-0) (line 288, col 0, score 1)
- [balanced-bst — L301](balanced-bst.md#^ref-d3e7db72-301-0) (line 301, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L178](chroma-toolkit-consolidation-plan.md#^ref-5020e892-178-0) (line 178, col 0, score 1)
- [Diagrams — L39](chunks/diagrams.md#^ref-45cd25b5-39-0) (line 39, col 0, score 1)
- [DSL — L41](chunks/dsl.md#^ref-e87bc036-41-0) (line 41, col 0, score 1)
- [JavaScript — L40](chunks/javascript.md#^ref-c1618c66-40-0) (line 40, col 0, score 1)
- [Math Fundamentals — L40](chunks/math-fundamentals.md#^ref-c6e87433-40-0) (line 40, col 0, score 1)
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
- [Diagrams — L50](chunks/diagrams.md#^ref-45cd25b5-50-0) (line 50, col 0, score 1)
- [DSL — L44](chunks/dsl.md#^ref-e87bc036-44-0) (line 44, col 0, score 1)
- [Math Fundamentals — L43](chunks/math-fundamentals.md#^ref-c6e87433-43-0) (line 43, col 0, score 1)
- [Operations — L15](chunks/operations.md#^ref-f1add613-15-0) (line 15, col 0, score 1)
- [Shared — L31](chunks/shared.md#^ref-623a55f7-31-0) (line 31, col 0, score 1)
- [Simulation Demo — L34](chunks/simulation-demo.md#^ref-557309a3-34-0) (line 34, col 0, score 1)
- [Window Management — L38](chunks/window-management.md#^ref-9e8ae388-38-0) (line 38, col 0, score 1)
- [compiler-kit-foundations — L651](compiler-kit-foundations.md#^ref-01b21543-651-0) (line 651, col 0, score 1)
- [Creative Moments — L15](creative-moments.md#^ref-10d98225-15-0) (line 15, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L263](cross-language-runtime-polymorphism.md#^ref-c34c36a6-263-0) (line 263, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L219](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-219-0) (line 219, col 0, score 1)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
