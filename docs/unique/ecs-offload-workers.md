---
uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
created_at: 2025.08.08.21.08.31.md
filename: ecs-offload-workers
description: >-
  A portable worker pool for offloading ECS systems to parallelize processing
  while maintaining compatibility across Node.js and browsers.
tags:
  - ecs
  - worker
  - parallel
  - portable
  - offload
  - patch
  - snapshot
related_to_title:
  - ecs-scheduler-and-prefabs
  - System Scheduler with Resource-Aware DAG
  - markdown-to-org-transpiler
  - Ollama-LLM-Provider-for-Pseudo-Code-Transpiler
  - Promethean Infrastructure Setup
  - zero-copy-snapshots-and-workers
  - eidolon-field-math-foundations
  - Performance-Optimized-Polyglot-Bridge
  - 'Polyglot S-expr Bridge: Python-JS-Lisp Interop'
  - JavaScript
  - Unique Info Dump Index
  - WebSocket Gateway Implementation
  - archetype-ecs
  - Mongo Outbox Implementation
  - Lisp-Compiler-Integration
  - Interop and Source Maps
  - Chroma Toolkit Consolidation Plan
  - compiler-kit-foundations
  - 'Agent Tasks: Persistence Migration to DualStore'
  - Local-Only-LLM-Workflow
  - js-to-lisp-reverse-compiler
  - Local-First Intention→Code Loop with Free Models
  - aionian-circuit-math
  - Math Fundamentals
  - Diagrams
  - DSL
  - observability-infrastructure-setup
  - Dynamic Context Model for Web Components
  - api-gateway-versioning
  - Promethean Event Bus MVP v0.1
  - Event Bus MVP
  - prom-lib-rate-limiters-and-replay-api
  - Debugging Broker Connections and Agent Behavior
  - Admin Dashboard for User Management
  - schema-evolution-workflow
  - Services
  - graph-ds
  - Language-Agnostic Mirror System
  - typed-struct-compiler
  - smart-chatgpt-thingy
related_to_uuid:
  - c62a1815-c43b-4a3b-88e6-d7fa008a155e
  - ba244286-4e84-425b-8bf6-b80c4eb783fc
  - ab54cdd8-13ce-4dcb-a9cd-da2d86e0305f
  - b362e12e-2802-4e41-9a21-6e0c7ad419a2
  - 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
  - 62bec6f0-4e13-4f38-aca4-72c84ba02367
  - 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
  - f5579967-762d-4cfd-851e-4f71b4cb77a1
  - 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
  - c1618c66-f73a-4e04-9bfa-ef38755f7acc
  - 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
  - e811123d-5841-4e52-bf8c-978f26db4230
  - 8f4c1e86-1236-4936-84ca-6ed7082af6b7
  - 9c1acd1e-c6a4-4a49-a66f-6da8b1bc9333
  - cfee6d36-b9f5-4587-885a-cdfddb4f054e
  - cdfac40c-00e4-458f-96a7-4c37d0278731
  - 5020e892-8f18-443a-b707-6d0f3efcfe22
  - 01b21543-7e03-4129-8fe4-b6306be69dee
  - 93d2ba51-8689-49ee-94e2-296092e48058
  - 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
  - 58191024-d04a-4520-8aae-a18be7b94263
  - 871490c7-a050-429b-88b2-55dfeaa1f8d5
  - f2d83a77-7f86-4c56-8538-1350167a0c6c
  - c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
  - 45cd25b5-ed36-49ab-82c8-10d0903e34db
  - e87bc036-1570-419e-a558-f45b9c0db698
  - b4e64f8c-4dc9-4941-a877-646c5ada068e
  - f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
  - 0580dcd3-533d-4834-8a2f-eae3771960a9
  - fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
  - 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
  - aee4718b-9f8b-4635-a0c1-ef61c9bea8f1
  - 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
  - 2901a3e9-96f0-497c-ae2c-775f28a702dd
  - d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
  - 75ea4a6a-8270-488d-9d37-799c288e5f70
  - 6620e2f2-de6d-45d8-a722-5d26e160b370
  - d2b3628c-6cad-4664-8551-94ef8280851d
  - 78eeedf7-75bc-4692-a5a7-bb6857270621
  - 2facccf8-69cf-4a7d-b24b-de966ec70283
references: []
---
Note: Consolidated here → ../notes/js/ecs-offload-workers.md

Heck yeah—let’s make this **parallel, portable, and safe**:

* **Node backend:** uses `worker_threads` pool.
* **Browser/static site:** falls back to Web Workers (if available) or runs in-process.
* **Contract:** offloaded systems run pure functions on a **snapshot** and return **patches**; the main thread applies patches to the ECS world.

Below is a small, drop-in layer. You don’t have to rewrite your ECS—just mark which systems are offloadable.

---

# 1) Minimal patch format

```ts
// shared/js/prom-lib/ds/ecs.patches.ts
export type Patch =
  | { kind: "set"; eid: number; cid: number; value: any }
  | { kind: "destroy"; eid: number }
  | { kind: "add"; eid: number; cid: number; value?: any }
  | { kind: "remove"; eid: number; cid: number };

export function applyPatches(world: import("./ecs").World, patches: Patch[]) {
  for (const p of patches) {
    if (p.kind === "set") world.set(p.eid, world["comps"][p.cid]!, p.value);
    else if (p.kind === "destroy") world.destroyEntity(p.eid);
    else if (p.kind === "add") world.addComponent(p.eid, world["comps"][p.cid]!, p.value);
    else if (p.kind === "remove") world.removeComponent(p.eid, world["comps"][p.cid]!);
  }
}
```

> This uses your existing component table (`world["comps"]`)—if you kept it truly private, expose a helper that maps `cid → ComponentType`.

---

# 2) Portable worker pool (Node + browser + fallback)

```ts
// shared/js/prom-lib/worker/pool.ts
export type JobInput = any;
export type JobOutput = any;
export type JobModule = string; // ESM path for Node worker to import

export interface WorkerPool {
  run(moduleOrName: string, input: JobInput): Promise<JobOutput>;
  close(): Promise<void>;
}

const isNode = typeof process !== "undefined" && !!(process.versions as any)?.node;
const isBrowser = typeof window !== "undefined";

export async function createPortablePool(opts: {
  size?: number;
  // Node: pass absolute or importable ESM module paths when calling run()
  // Browser: name→factory map (because bundlers need Worker(URL))
  browserWorkers?: Record<string, () => Worker>;
} = {}): Promise<WorkerPool> {
  if (isNode) {
    const m = await import("./pool.node.js"); // compiled JS
    return new m.NodeWorkerPool(opts.size ?? Math.max(1, require("os").cpus().length - 1));
  }
  if (isBrowser && typeof Worker !== "undefined" && opts.browserWorkers) {
    const m = await import("./pool.browser.js");
    return new m.BrowserWorkerPool(opts.browserWorkers);
  }
  // Fallback (static page without workers)
  const m = await import("./pool.local.js");
  return new m.LocalPool();
}
```

### 2a) Node pool (worker\_threads)

```ts
// shared/js/prom-lib/worker/pool.node.ts
import { Worker } from "node:worker_threads";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

type Task = { id: number; mod: string; input: any; resolve: (v:any)=>void; reject:(e:any)=>void };

export class NodeWorkerPool {
  private size: number;
  private workers: Worker[] = [];
  private idle: Worker[] = [];
  private q: Task[] = [];
  private nextId = 1;
  private runnerURL: string;

  constructor(size = Math.max(1, os.cpus().length - 1)) {
    this.size = size;
    // runner script (ESM)
    const here = path.dirname(fileURLToPath(import.meta.url));
    this.runnerURL = pathToFileURL(path.join(here, "runner.node.js")).href;
    for (let i=0;i<this.size;i++) this.spawn();
  }

  private spawn() {
    const w = new Worker(this.runnerURL, { type: "module" });
    w.on("message", (msg) => {
      const task = this._tasks.get(msg.id);
      if (!task) return;
      this._tasks.delete(msg.id);
      this.idle.push(w);
      if (msg.ok) task.resolve(msg.out); else task.reject(new Error(msg.err || "job failed"));
      this._drain();
    });
    w.on("error", (err) => {
      // fail any running task on this worker
      for (const [id, t] of this._tasks) if ((t as any).worker === w) { t.reject(err); this._tasks.delete(id); }
      // respawn
      this.workers = this.workers.filter(x => x !== w);
      this.spawn();
    });
    (w as any)._busy = false;
    this.workers.push(w);
    this.idle.push(w);
  }

  private _tasks = new Map<number, Task>();

  private _drain() {
    while (this.q.length && this.idle.length) {
      const t = this.q.shift()!;
      const w = this.idle.pop()!;
      (t as any).worker = w;
      this._tasks.set(t.id, t);
      w.postMessage({ id: t.id, mod: t.mod, input: t.input });
    }
  }

  run(mod: string, input: any) {
    return new Promise((resolve, reject) => {
      const id = this.nextId++;
      this.q.push({ id, mod, input, resolve, reject });
      this._drain();
    });
  }

  async close() {
    for (const w of this.workers) w.terminate();
    this.workers.length = 0; this.idle.length = 0; this.q.length = 0; this._tasks.clear();
  }
}
```

```ts
// shared/js/prom-lib/worker/runner.node.ts
// A tiny generic Node worker: dynamic-import module and call handle(input)
import { parentPort } from "node:worker_threads";

parentPort!.on("message", async (msg) => {
  const { id, mod, input } = msg;
  try {
    const m = await import(mod);           // ESM module path
    const fn = (m.handle ?? m.default) as (x:any)=>any|Promise<any>;
    const out = await fn(input);
    parentPort!.postMessage({ id, ok: true, out });
  } catch (e:any) {
    parentPort!.postMessage({ id, ok: false, err: e?.message ?? String(e) });
  }
});
```

### 2b) Browser pool (Web Workers)

```ts
// shared/js/prom-lib/worker/pool.browser.ts
export class BrowserWorkerPool {
  private factories: Record<string, () => Worker>;
  constructor(factories: Record<string, () => Worker>) { this.factories = factories; }
  run(name: string, input: any) {
    return new Promise((resolve, reject) => {
      const w = this.factories[name]();
      const onMsg = (ev: MessageEvent) => { w.removeEventListener("message", onMsg); w.terminate(); resolve(ev.data); };
      const onErr = (e: ErrorEvent) => { w.removeEventListener("error", onErr); w.terminate(); reject(e.error || new Error(e.message)); };
      w.addEventListener("message", onMsg); w.addEventListener("error", onErr);
      w.postMessage(input);
    });
  }
  async close() {}
}
```

```ts
// shared/js/prom-lib/worker/pool.local.ts
export class LocalPool {
  async run(modOrName: string, input: any) {
    // Synchronous fallback: dynamic import & call handle()
    const m = await import(/* @vite-ignore */ modOrName).catch(()=>({ default: (x:any)=>x }));
    const fn = (m.handle ?? m.default) as any;
    return fn ? fn(input) : input;
  }
  async close() {}
}
```

> **Browser bundlers:** create worker factories like
> `() => new Worker(new URL("./physics.worker.ts", import.meta.url), { type: "module" })`

---

# 3) Offloading systems (scheduler add-on)

We extend your scheduler so any system can declare an **offload** block. The world stays on the main thread; workers only receive **snapshots** (entity ids + component columns) and reply with **patches**.

```ts
// shared/js/prom-lib/ds/ecs.scheduler.parallel.ts
import { Scheduler, SystemSpec, SystemContext } from "./ecs.scheduler";
import { applyPatches, Patch } from "./ecs.patches";
import { createPortablePool, WorkerPool } from "../worker/pool";
import type { World, ComponentType } from "./ecs";

export type OffloadSpec = {
  // Node: ESM module path (e.g. file:// or dist path). Module must export `handle(input)`.
  nodeModule?: string;
  // Browser: name to resolve via BrowserWorkerPool factories
  browserJobName?: string;
  // Which components to snapshot and allow writes for
  reads: ComponentType<any>[];
  writes?: ComponentType<any>[];
  // Optional extra payload per frame
  extra?: (ctx: SystemContext) => any;
};

export interface OffloadableSystem extends SystemSpec {
  offload: OffloadSpec;
}

export class ParallelScheduler extends Scheduler {
  private pool!: WorkerPool;
  private ready = false;

  async initPool(opts?: { size?: number; browserWorkers?: Record<string, () => Worker> }) {
    this.pool = await createPortablePool(opts);
    this.ready = true;
  }

  // override tiny bit: when running batches, offload systems with .offload
  protected async runSystem(sys: SystemSpec, ctx: SystemContext) {
    const as = sys as OffloadableSystem;
    if (!("offload" in as)) return sys.run(ctx);

    if (!this.ready) await this.initPool();

    // Build snapshot from query (if any)
    const q = sys.query ? this.world.makeQuery(sys.query(this.world)) : undefined;
    const eids: number[] = [];
    const cols: Record<number, any[]> = {};
    for (const c of as.offload.reads.concat(as.offload.writes ?? [])) cols[c.id] = [];

    if (q) {
      for (const [e] of this.world.iter(q)) {
        eids.push(e);
        for (const c of as.offload.reads.concat(as.offload.writes ?? [])) cols[c.id].push(this.world.get(e, c));
      }
    }

    const payload = {
      eids, cols, dt: ctx.dt, time: ctx.time,
      writes: (as.offload.writes ?? []).map(c => c.id),
      extra: as.offload.extra?.(ctx)
    };

    // choose job id
    const jobId = (typeof window !== "undefined")
      ? (as.offload.browserJobName ?? as.name)
      : (as.offload.nodeModule ?? as.name);

    const patches = await this.pool.run(jobId, payload) as Patch[];
    if (patches && patches.length) applyPatches(this.world, patches);
  }

  async runFrame(dt: number, time: number, opts: { parallel?: boolean } = {}) {
    // call parent’s logic but route per-system execution through runSystem()
    // small override → copy of parent with one change:
    if (!this["plan"]) this.compile();
    const cmd = this["world"].beginTick();
    const plan = this["plan"]!;

    const call = (s: SystemSpec) => this.runSystem(s, { world: this["world"], dt, time, resources: this["resources"], cmd, stage: s.stage ?? "update" });

    try {
      for (const stage of plan.stages) {
        const batches = plan.batchesByStage.get(stage)!;
        for (const batch of batches) {
          if (opts.parallel ?? true) await Promise.all(batch.systems.map(call));
          else for (const s of batch.systems) await call(s);
        }
      }
    } finally { cmd.flush(); this["world"].endTick(); }
  }

  async close() { if (this.ready) await this.pool.close(); }
}
```

---

# 4) Example worker job (physics)

### 4a) Node: `physics.job.ts` (ESM file path you pass to `.offload.nodeModule`)

```ts
// services/js/workers/physics.job.ts
import type { Patch } from "../../shared/js/prom-lib/ds/ecs.patches";

export type PhysicsInput = {
  eids: number[];
  cols: Record<number, any[]>; // cid -> column values (arrays aligned with eids)
  dt: number; time: number; writes: number[]; extra?: any;
};

export async function handle(input: PhysicsInput): Promise<Patch[]> {
  // Suppose: cols[POS_CID] = [{x,y}...], cols[VEL_CID] = [{x,y}...]
  const POS = input.extra.POS as number;
  const VEL = input.extra.VEL as number;
  const pos = input.cols[POS] as {x:number;y:number}[];
  const vel = input.cols[VEL] as {x:number;y:number}[];
  const patches: Patch[] = [];
  for (let i=0;i<input.eids.length;i++) {
    const p = pos[i], v = vel[i];
    if (!p || !v) continue;
    patches.push({ kind: "set", eid: input.eids[i], cid: POS, value: { x: p.x + v.x*input.dt, y: p.y + v.y*input.dt } });
  }
  return patches;
}
export default handle;
```

### 4b) Browser worker: `physics.worker.ts`

```ts
// services/web/workers/physics.worker.ts
import type { Patch } from "../../shared/js/prom-lib/ds/ecs.patches";

self.onmessage = (ev: MessageEvent) => {
  const input = ev.data as any;
  const POS = input.extra.POS as number;
  const VEL = input.extra.VEL as number;
  const pos = input.cols[POS] as {x:number;y:number}[];
  const vel = input.cols[VEL] as {x:number;y:number}[];
  const patches: Patch[] = [];
  for (let i=0;i<input.eids.length;i++) {
    const p = pos[i], v = vel[i];
    if (!p || !v) continue;
    patches.push({ kind:"set", eid: input.eids[i], cid: POS, value:{ x: p.x + v.x*input.dt, y: p.y + v.y*input.dt }});
  }
  (self as any).postMessage(patches);
};
```

---

# 5) Wiring it together

```ts
// server-side (Node) — parallel ECS loop
import { World } from "../../shared/js/prom-lib/ds/ecs";
import { ParallelScheduler } from "../../shared/js/prom-lib/ds/ecs.scheduler.parallel";

type Position = {x:number;y:number};
type Velocity = {x:number;y:number};

const world = new World();
const CPos = world.defineComponent<Position>({ name:"Pos", defaults:()=>({x:0,y:0}) });
const CVel = world.defineComponent<Velocity>({ name:"Vel", defaults:()=>({x:0,y:0}) });

const sched = new ParallelScheduler(world);
await sched.initPool(); // Node pool

sched.register({
  name: "physics",
  stage: "update",
  query: w => ({ all:[CPos, CVel] }),
  // offload:
  offload: {
    nodeModule: new URL("file://" + require("path").resolve("services/js/workers/physics.job.js")).href,
    reads: [CVel, CPos], writes: [CPos],
    extra: () => ({ POS: CPos.id, VEL: CVel.id })
  },
  // fallback (if no workers) still runs here via run()
  async run({ world, dt }) {
    const q = world.makeQuery({ all:[CPos, CVel] });
    for (const [e, _get, p, v] of world.iter(q, CPos, CVel)) {
      p!.x += v!.x * dt; p!.y += v!.y * dt; world.set(e, CPos, p!);
    }
  }
});

// main loop
setInterval(() => sched.runFrame(0.016, Date.now()), 16);
```

```ts
// browser/static site — Web Worker pool
import { World } from "../../shared/js/prom-lib/ds/ecs";
import { ParallelScheduler } from "../../shared/js/prom-lib/ds/ecs.scheduler.parallel";
import { createPortablePool } from "../../shared/js/prom-lib/worker/pool";

const world = new World();
const CPos = world.defineComponent<{x:number;y:number}>({ name:"Pos", defaults:()=>({x:0,y:0}) });
const CVel = world.defineComponent<{x:number;y:number}>({ name:"Vel", defaults:()=>({x:0,y:0}) });

const sched = new ParallelScheduler(world);
await sched.initPool({
  browserWorkers: {
    physics: () => new Worker(new URL("../../services/web/workers/physics.worker.ts", import.meta.url), { type: "module" })
  }
});

sched.register({
  name: "physics",
  stage: "update",
  query: w => ({ all:[CPos, CVel] }),
  offload: {
    browserJobName: "physics",
    reads: [CVel, CPos], writes: [CPos],
    extra: () => ({ POS: CPos.id, VEL: CVel.id })
  },
  run() {} // not used when offloaded, but kept as local fallback
});

function frame(ts:number){ sched.runFrame(0.016, ts); requestAnimationFrame(frame); }
requestAnimationFrame(frame);
```

---

# 6) Backend sim + client

* **Server:** run the Node `ParallelScheduler`. Every N frames, publish a compact **state snapshot** (or just changed positions) over your existing **WS gateway** (`process.state` or a separate `render.state` topic).
* **Client (static site):** subscribe via the typed SDK you already have; apply deltas to a read-only **view-world** (no worker threads needed). If you want client-side physics too, keep the workerized version above for cosmetic prediction and reconcile with server snapshots.

---

# 7) Notes & gotchas

* Workers must be **pure**: no access to your `World`. They only see `{ eids, cols, dt, time, extra }` and return **patches**.
* Keep payloads small. If you push large numeric arrays, consider **TypedArrays**; transfer them via `postMessage(…, [arr.buffer])` (add that in your worker if you need zero-copy).
* Paths for `nodeModule`: give absolute **ESM** URLs (e.g., `file://…/physics.job.js`).
* On static hosting with no workers allowed (old browsers, CSP), the pool auto-falls back to **in-process** execution.

If you want, I can add:

* a **typed snapshot builder** (auto columns from `reads/writes`),
* **zero-copy** support via SharedArrayBuffer (Node + browser w/ proper COOP/COEP),
* a **timeline tracer** that measures per-system worker time and renders a Gantt chart.<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [ecs-scheduler-and-prefabs](ecs-scheduler-and-prefabs.md)
- [System Scheduler with Resource-Aware DAG](system-scheduler-with-resource-aware-dag.md)
- [markdown-to-org-transpiler](markdown-to-org-transpiler.md)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler](ollama-llm-provider-for-pseudo-code-transpiler.md)
- [Promethean Infrastructure Setup](promethean-infrastructure-setup.md)
- [zero-copy-snapshots-and-workers](zero-copy-snapshots-and-workers.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [Performance-Optimized-Polyglot-Bridge](performance-optimized-polyglot-bridge.md)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop](polyglot-s-expr-bridge-python-js-lisp-interop.md)
- [JavaScript](chunks/javascript.md)
- [Unique Info Dump Index](unique-info-dump-index.md)
- [WebSocket Gateway Implementation](websocket-gateway-implementation.md)
- [archetype-ecs](archetype-ecs.md)
- [Mongo Outbox Implementation](mongo-outbox-implementation.md)
- [Lisp-Compiler-Integration](lisp-compiler-integration.md)
- [Interop and Source Maps](interop-and-source-maps.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [compiler-kit-foundations](compiler-kit-foundations.md)
- [Agent Tasks: Persistence Migration to DualStore](agent-tasks-persistence-migration-to-dualstore.md)
- [Local-Only-LLM-Workflow](local-only-llm-workflow.md)
- [js-to-lisp-reverse-compiler](js-to-lisp-reverse-compiler.md)
- [Local-First Intention→Code Loop with Free Models](local-first-intention-code-loop-with-free-models.md)
- [aionian-circuit-math](aionian-circuit-math.md)
- [Math Fundamentals](chunks/math-fundamentals.md)
- [Diagrams](chunks/diagrams.md)
- [DSL](chunks/dsl.md)
- [observability-infrastructure-setup](observability-infrastructure-setup.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [api-gateway-versioning](api-gateway-versioning.md)
- [Promethean Event Bus MVP v0.1](promethean-event-bus-mvp-v0-1.md)
- [Event Bus MVP](event-bus-mvp.md)
- [prom-lib-rate-limiters-and-replay-api](prom-lib-rate-limiters-and-replay-api.md)
- [Debugging Broker Connections and Agent Behavior](debugging-broker-connections-and-agent-behavior.md)
- [Admin Dashboard for User Management](admin-dashboard-for-user-management.md)
- [schema-evolution-workflow](schema-evolution-workflow.md)
- [Services](chunks/services.md)
- [graph-ds](graph-ds.md)
- [Language-Agnostic Mirror System](language-agnostic-mirror-system.md)
- [typed-struct-compiler](typed-struct-compiler.md)
- [smart-chatgpt-thingy](smart-chatgpt-thingy.md)
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
