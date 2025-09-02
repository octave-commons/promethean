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
related_to_title: []
related_to_uuid: []
references: []
---
Note: Consolidated here → ../notes/js/ecs-offload-workers.md ^ref-6498b9d7-1-0

Heck yeah—let’s make this **parallel, portable, and safe**: ^ref-6498b9d7-3-0

* **Node backend:** uses `worker_threads` pool. ^ref-6498b9d7-5-0
* **Browser/static site:** falls back to Web Workers (if available) or runs in-process. ^ref-6498b9d7-6-0
* **Contract:** offloaded systems run pure functions on a **snapshot** and return **patches**; the main thread applies patches to the ECS world. ^ref-6498b9d7-7-0

Below is a small, drop-in layer. You don’t have to rewrite your ECS—just mark which systems are offloadable. ^ref-6498b9d7-9-0

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
^ref-6498b9d7-15-0
 ^ref-6498b9d7-33-0
> This uses your existing component table (`world["comps"]`)—if you kept it truly private, expose a helper that maps `cid → ComponentType`.

---

# 2) Portable worker pool (Node + browser + fallback)
 ^ref-6498b9d7-39-0
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
^ref-6498b9d7-39-0
```

### 2a) Node pool (worker\_threads) ^ref-6498b9d7-75-0

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
^ref-6498b9d7-75-0
}
```
^ref-6498b9d7-149-0

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
^ref-6498b9d7-149-0
  }
});
^ref-6498b9d7-169-0
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
^ref-6498b9d7-169-0
  }
  async close() {}
^ref-6498b9d7-187-0
}
```
^ref-6498b9d7-187-0

```ts
// shared/js/prom-lib/worker/pool.local.ts
export class LocalPool {
  async run(modOrName: string, input: any) {
    // Synchronous fallback: dynamic import & call handle()
    const m = await import(/* @vite-ignore */ modOrName).catch(()=>({ default: (x:any)=>x }));
    const fn = (m.handle ?? m.default) as any;
^ref-6498b9d7-187-0
    return fn ? fn(input) : input; ^ref-6498b9d7-200-0
  }
^ref-6498b9d7-200-0
  async close() {}
} ^ref-6498b9d7-207-0
^ref-6498b9d7-207-0 ^ref-6498b9d7-209-0
^ref-6498b9d7-200-0
```
^ref-6498b9d7-207-0
^ref-6498b9d7-200-0
 ^ref-6498b9d7-209-0
> **Browser bundlers:** create worker factories like
> `() => new Worker(new URL("./physics.worker.ts", import.meta.url), { type: "module" })` ^ref-6498b9d7-207-0

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
^ref-6498b9d7-209-0
    } finally { cmd.flush(); this["world"].endTick(); }
  }
 ^ref-6498b9d7-306-0
^ref-6498b9d7-306-0
  async close() { if (this.ready) await this.pool.close(); }
^ref-6498b9d7-306-0
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
^ref-6498b9d7-306-0
    if (!p || !v) continue;
    patches.push({ kind: "set", eid: input.eids[i], cid: POS, value: { x: p.x + v.x*input.dt, y: p.y + v.y*input.dt } });
  }
^ref-6498b9d7-335-0
^ref-6498b9d7-335-0
  return patches;
^ref-6498b9d7-335-0
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
^ref-6498b9d7-335-0
  for (let i=0;i<input.eids.length;i++) {
    const p = pos[i], v = vel[i];
    if (!p || !v) continue;
^ref-6498b9d7-359-0
^ref-6498b9d7-359-0
    patches.push({ kind:"set", eid: input.eids[i], cid: POS, value:{ x: p.x + v.x*input.dt, y: p.y + v.y*input.dt }});
^ref-6498b9d7-359-0
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
^ref-6498b9d7-359-0
    for (const [e, _get, p, v] of world.iter(q, CPos, CVel)) {
      p!.x += v!.x * dt; p!.y += v!.y * dt; world.set(e, CPos, p!);
    }
^ref-6498b9d7-397-0
^ref-6498b9d7-397-0
  }
^ref-6498b9d7-397-0
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
^ref-6498b9d7-397-0
    browserJobName: "physics",
    reads: [CVel, CPos], writes: [CPos],
    extra: () => ({ POS: CPos.id, VEL: CVel.id })
^ref-6498b9d7-435-0
^ref-6498b9d7-434-0 ^ref-6498b9d7-441-0
^ref-6498b9d7-448-0 ^ref-6498b9d7-449-0
^ref-6498b9d7-446-0 ^ref-6498b9d7-450-0
^ref-6498b9d7-444-0
^ref-6498b9d7-443-0 ^ref-6498b9d7-452-0
^ref-6498b9d7-442-0 ^ref-6498b9d7-453-0
^ref-6498b9d7-441-0 ^ref-6498b9d7-454-0
^ref-6498b9d7-435-0 ^ref-6498b9d7-455-0
^ref-6498b9d7-434-0 ^ref-6498b9d7-456-0
  }, ^ref-6498b9d7-442-0 ^ref-6498b9d7-457-0
^ref-6498b9d7-463-0
^ref-6498b9d7-461-0 ^ref-6498b9d7-465-0
^ref-6498b9d7-460-0 ^ref-6498b9d7-466-0
^ref-6498b9d7-459-0 ^ref-6498b9d7-467-0
^ref-6498b9d7-457-0 ^ref-6498b9d7-468-0
^ref-6498b9d7-456-0
^ref-6498b9d7-455-0
^ref-6498b9d7-454-0 ^ref-6498b9d7-471-0
^ref-6498b9d7-453-0 ^ref-6498b9d7-472-0
^ref-6498b9d7-452-0 ^ref-6498b9d7-473-0
^ref-6498b9d7-450-0
^ref-6498b9d7-449-0
^ref-6498b9d7-448-0 ^ref-6498b9d7-476-0
^ref-6498b9d7-446-0 ^ref-6498b9d7-477-0
^ref-6498b9d7-444-0 ^ref-6498b9d7-478-0
^ref-6498b9d7-443-0
^ref-6498b9d7-442-0
^ref-6498b9d7-441-0 ^ref-6498b9d7-481-0
^ref-6498b9d7-435-0
^ref-6498b9d7-434-0 ^ref-6498b9d7-483-0
^ref-6498b9d7-421-0 ^ref-6498b9d7-484-0
  run() {} // not used when offloaded, but kept as local fallback ^ref-6498b9d7-434-0 ^ref-6498b9d7-443-0
}); ^ref-6498b9d7-435-0 ^ref-6498b9d7-444-0 ^ref-6498b9d7-459-0 ^ref-6498b9d7-486-0
 ^ref-6498b9d7-460-0 ^ref-6498b9d7-487-0
function frame(ts:number){ sched.runFrame(0.016, ts); requestAnimationFrame(frame); } ^ref-6498b9d7-446-0 ^ref-6498b9d7-461-0 ^ref-6498b9d7-488-0
requestAnimationFrame(frame); ^ref-6498b9d7-489-0
``` ^ref-6498b9d7-448-0 ^ref-6498b9d7-463-0 ^ref-6498b9d7-490-0
 ^ref-6498b9d7-449-0 ^ref-6498b9d7-491-0
--- ^ref-6498b9d7-441-0 ^ref-6498b9d7-450-0 ^ref-6498b9d7-465-0
 ^ref-6498b9d7-442-0 ^ref-6498b9d7-466-0
# 6) Backend sim + client ^ref-6498b9d7-443-0 ^ref-6498b9d7-452-0 ^ref-6498b9d7-467-0 ^ref-6498b9d7-494-0
 ^ref-6498b9d7-444-0 ^ref-6498b9d7-453-0 ^ref-6498b9d7-468-0
* **Server:** run the Node `ParallelScheduler`. Every N frames, publish a compact **state snapshot** (or just changed positions) over your existing **WS gateway** (`process.state` or a separate `render.state` topic). ^ref-6498b9d7-454-0 ^ref-6498b9d7-496-0
* **Client (static site):** subscribe via the typed SDK you already have; apply deltas to a read-only **view-world** (no worker threads needed). If you want client-side physics too, keep the workerized version above for cosmetic prediction and reconcile with server snapshots. ^ref-6498b9d7-446-0 ^ref-6498b9d7-455-0
 ^ref-6498b9d7-456-0 ^ref-6498b9d7-471-0
--- ^ref-6498b9d7-448-0 ^ref-6498b9d7-457-0 ^ref-6498b9d7-472-0
 ^ref-6498b9d7-449-0 ^ref-6498b9d7-473-0 ^ref-6498b9d7-500-0
# 7) Notes & gotchas ^ref-6498b9d7-450-0 ^ref-6498b9d7-459-0 ^ref-6498b9d7-501-0
 ^ref-6498b9d7-460-0
* Workers must be **pure**: no access to your `World`. They only see `{ eids, cols, dt, time, extra }` and return **patches**. ^ref-6498b9d7-452-0 ^ref-6498b9d7-461-0 ^ref-6498b9d7-476-0
* Keep payloads small. If you push large numeric arrays, consider **TypedArrays**; transfer them via `postMessage(…, [arr.buffer])` (add that in your worker if you need zero-copy). ^ref-6498b9d7-453-0 ^ref-6498b9d7-477-0
* Paths for `nodeModule`: give absolute **ESM** URLs (e.g., `file://…/physics.job.js`). ^ref-6498b9d7-454-0 ^ref-6498b9d7-463-0 ^ref-6498b9d7-478-0
* On static hosting with no workers allowed (old browsers, CSP), the pool auto-falls back to **in-process** execution. ^ref-6498b9d7-455-0
 ^ref-6498b9d7-456-0 ^ref-6498b9d7-465-0
If you want, I can add: ^ref-6498b9d7-457-0 ^ref-6498b9d7-466-0 ^ref-6498b9d7-481-0
 ^ref-6498b9d7-467-0
* a **typed snapshot builder** (auto columns from `reads/writes`), ^ref-6498b9d7-459-0 ^ref-6498b9d7-468-0 ^ref-6498b9d7-483-0
* **zero-copy** support via SharedArrayBuffer (Node + browser w/ proper COOP/COEP), ^ref-6498b9d7-460-0 ^ref-6498b9d7-484-0
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
- [Cross-Language Runtime Polymorphism](cross-language-runtime-polymorphism.md)
- [Agent Reflections and Prompt Evolution](agent-reflections-and-prompt-evolution.md)
- [2d-sandbox-field](2d-sandbox-field.md)
- [AI-Centric OS with MCP Layer](ai-centric-os-with-mcp-layer.md)
- [Window Management](chunks/window-management.md)
- [Board Walk – 2025-08-11](board-walk-2025-08-11.md)
- [Cross-Target Macro System in Sibilant](cross-target-macro-system-in-sibilant.md)
- [Board Automation Improvements](board-automation-improvements.md)
- [Tooling](chunks/tooling.md)
- [Canonical Org-Babel Matplotlib Animation Template](canonical-org-babel-matplotlib-animation-template.md)
- [State Snapshots API and Transactional Projector](state-snapshots-api-and-transactional-projector.md)
- [Sibilant Meta-Prompt DSL](sibilant-meta-prompt-dsl.md)
- [i3-config-validation-methods](i3-config-validation-methods.md)
- [sibilant-macro-targets](sibilant-macro-targets.md)
- [sibilant-meta-string-templating-runtime](sibilant-meta-string-templating-runtime.md)
- [sibilant-metacompiler-overview](sibilant-metacompiler-overview.md)
- [template-based-compilation](template-based-compilation.md)
- [ts-to-lisp-transpiler](ts-to-lisp-transpiler.md)
- [obsidian-ignore-node-modules-regex](obsidian-ignore-node-modules-regex.md)
- [EidolonField](eidolonfield.md)
- [Factorio AI with External Agents](factorio-ai-with-external-agents.md)
- [Per-Domain Policy System for JS Crawler](per-domain-policy-system-for-js-crawler.md)
- [ParticleSimulationWithCanvasAndFFmpeg](particlesimulationwithcanvasandffmpeg.md)
- [Migrate to Provider-Tenant Architecture](migrate-to-provider-tenant-architecture.md)
- [Promethean Agent Config DSL](promethean-agent-config-dsl.md)
- [polymorphic-meta-programming-engine](polymorphic-meta-programming-engine.md)
- [Eidolon Field Abstract Model](eidolon-field-abstract-model.md)
- [Exception Layer Analysis](exception-layer-analysis.md)
- [field-dynamics-math-blocks](field-dynamics-math-blocks.md)
- [field-node-diagram-outline](field-node-diagram-outline.md)
- [field-interaction-equations](field-interaction-equations.md)
- [Duck's Self-Referential Perceptual Loop](ducks-self-referential-perceptual-loop.md)
- [Shared](chunks/shared.md)
- [Simulation Demo](chunks/simulation-demo.md)
- [Matplotlib Animation with Async Execution](matplotlib-animation-with-async-execution.md)
- [Model Selection for Lightweight Conversational Tasks](model-selection-for-lightweight-conversational-tasks.md)
- [Obsidian Templating Plugins Integration Guide](obsidian-templating-plugins-integration-guide.md)
- [Event Bus Projections Architecture](event-bus-projections-architecture.md)
- [eidolon-node-lifecycle](eidolon-node-lifecycle.md)
- [AI-First-OS-Model-Context-Protocol](ai-first-os-model-context-protocol.md)
- [balanced-bst](balanced-bst.md)
- [Promethean-native config design](promethean-native-config-design.md)
- [Promethean Web UI Setup](promethean-web-ui-setup.md)
- [Stateful Partitions and Rebalancing](stateful-partitions-and-rebalancing.md)
- [field-node-diagram-set](field-node-diagram-set.md)
- [field-node-diagram-visualizations](field-node-diagram-visualizations.md)
- [heartbeat-fragment-demo](heartbeat-fragment-demo.md)
- [heartbeat-simulation-snippets](heartbeat-simulation-snippets.md)
- [i3-bluetooth-setup](i3-bluetooth-setup.md)
- [Promethean_Eidolon_Synchronicity_Model](promethean-eidolon-synchronicity-model.md)
- [promethean-system-diagrams](promethean-system-diagrams.md)
- [Prompt_Folder_Bootstrap](prompt-folder-bootstrap.md)
- [prompt-programming-language-lisp](prompt-programming-language-lisp.md)
- [Lispy Macros with syntax-rules](lispy-macros-with-syntax-rules.md)
- [mystery-lisp-search-session](mystery-lisp-search-session.md)
- [Protocol_0_The_Contradiction_Engine](protocol-0-the-contradiction-engine.md)
- [Local-Offline-Model-Deployment-Strategy](local-offline-model-deployment-strategy.md)
- [Obsidian ChatGPT Plugin Integration](obsidian-chatgpt-plugin-integration.md)
- [Operations](chunks/operations.md)
- [Fnord Tracer Protocol](fnord-tracer-protocol.md)
- [homeostasis-decay-formulas](homeostasis-decay-formulas.md)
- [polyglot-repl-interface-layer](polyglot-repl-interface-layer.md)
- [Post-Linguistic Transhuman Design Frameworks](post-linguistic-transhuman-design-frameworks.md)
- [Pure-Node Crawl Stack with Playwright and Crawlee](pure-node-crawl-stack-with-playwright-and-crawlee.md)
- [Shared Package Structure](shared-package-structure.md)
- [Provider-Agnostic Chat Panel Implementation](provider-agnostic-chat-panel-implementation.md)
- [layer-1-uptime-diagrams](layer-1-uptime-diagrams.md)
- [ripple-propagation-demo](ripple-propagation-demo.md)
- [lisp-dsl-for-window-management](lisp-dsl-for-window-management.md)
- [Promethean Workflow Optimization](promethean-workflow-optimization.md)
- [Prometheus Observability Stack](prometheus-observability-stack.md)
- [Pure TypeScript Search Microservice](pure-typescript-search-microservice.md)
- [RAG UI Panel with Qdrant and PostgREST](rag-ui-panel-with-qdrant-and-postgrest.md)
- [shared-package-layout-clarification](shared-package-layout-clarification.md)
- [komorebi-group-window-hack](komorebi-group-window-hack.md)
- [Self-Agency in AI Interaction](self-agency-in-ai-interaction.md)
- [set-assignment-in-lisp-ast](set-assignment-in-lisp-ast.md)
- [Creative Moments](creative-moments.md)
- [DuckDuckGoSearchPipeline](duckduckgosearchpipeline.md)
- [universal-intention-code-fabric](universal-intention-code-fabric.md)
- [Promethean Agent DSL TS Scaffold](promethean-agent-dsl-ts-scaffold.md)
- [Promethean-Copilot-Intent-Engine](promethean-copilot-intent-engine.md)
- [Chroma-Embedding-Refactor](chroma-embedding-refactor.md)
- [Functional Refactor of TypeScript Document Processing](functional-refactor-of-typescript-document-processing.md)
- [TypeScript Patch for Tool Calling Support](typescript-patch-for-tool-calling-support.md)
- [Functional Embedding Pipeline Refactor](functional-embedding-pipeline-refactor.md)
- [Promethean Dev Workflow Update](promethean-dev-workflow-update.md)
- [Layer1SurvivabilityEnvelope](layer1survivabilityenvelope.md)
- [Model Upgrade Calm-Down Guide](model-upgrade-calm-down-guide.md)
- [Promethean State Format](promethean-state-format.md)
- [Promethean Documentation Pipeline Overview](promethean-documentation-pipeline-overview.md)
- [Voice Access Layer Design](voice-access-layer-design.md)
- [pm2-orchestration-patterns](pm2-orchestration-patterns.md)
- [windows-tiling-with-autohotkey](windows-tiling-with-autohotkey.md)
- [Promethean Pipelines](promethean-pipelines.md)
## Sources
- [JavaScript — L7](chunks/javascript.md#^ref-c1618c66-7-0) (line 7, col 0, score 0.65)
- [Unique Info Dump Index — L42](unique-info-dump-index.md#^ref-30ec3ba6-42-0) (line 42, col 0, score 0.65)
- [Admin Dashboard for User Management — L42](admin-dashboard-for-user-management.md#^ref-2901a3e9-42-0) (line 42, col 0, score 0.81)
- [Agent Tasks: Persistence Migration to DualStore — L138](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-138-0) (line 138, col 0, score 0.67)
- [aionian-circuit-math — L160](aionian-circuit-math.md#^ref-f2d83a77-160-0) (line 160, col 0, score 0.64)
- [api-gateway-versioning — L291](api-gateway-versioning.md#^ref-0580dcd3-291-0) (line 291, col 0, score 0.67)
- [archetype-ecs — L458](archetype-ecs.md#^ref-8f4c1e86-458-0) (line 458, col 0, score 0.67)
- [Board Automation Improvements — L21](board-automation-improvements.md#^ref-ac60a1d6-21-0) (line 21, col 0, score 0.64)
- [Board Walk – 2025-08-11 — L145](board-walk-2025-08-11.md#^ref-7aa1eb92-145-0) (line 145, col 0, score 0.67)
- [Chroma Toolkit Consolidation Plan — L176](chroma-toolkit-consolidation-plan.md#^ref-5020e892-176-0) (line 176, col 0, score 0.67)
- [Layer1SurvivabilityEnvelope — L146](layer1survivabilityenvelope.md#^ref-64a9f9f9-146-0) (line 146, col 0, score 0.66)
- [Cross-Language Runtime Polymorphism — L3](cross-language-runtime-polymorphism.md#^ref-c34c36a6-3-0) (line 3, col 0, score 0.66)
- [obsidian-ignore-node-modules-regex — L36](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-36-0) (line 36, col 0, score 0.63)
- [Functional Embedding Pipeline Refactor — L25](functional-embedding-pipeline-refactor.md#^ref-a4a25141-25-0) (line 25, col 0, score 0.63)
- [Lisp-Compiler-Integration — L521](lisp-compiler-integration.md#^ref-cfee6d36-521-0) (line 521, col 0, score 0.61)
- [Language-Agnostic Mirror System — L1](language-agnostic-mirror-system.md#^ref-d2b3628c-1-0) (line 1, col 0, score 0.61)
- [Interop and Source Maps — L3](interop-and-source-maps.md#^ref-cdfac40c-3-0) (line 3, col 0, score 0.6)
- [EidolonField — L3](eidolonfield.md#^ref-49d1e1e5-3-0) (line 3, col 0, score 0.6)
- [api-gateway-versioning — L280](api-gateway-versioning.md#^ref-0580dcd3-280-0) (line 280, col 0, score 0.6)
- [prom-lib-rate-limiters-and-replay-api — L375](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-375-0) (line 375, col 0, score 0.59)
- [Promethean-native config design — L354](promethean-native-config-design.md#^ref-ab748541-354-0) (line 354, col 0, score 0.59)
- [Factorio AI with External Agents — L38](factorio-ai-with-external-agents.md#^ref-a4d90289-38-0) (line 38, col 0, score 0.59)
- [Factorio AI with External Agents — L26](factorio-ai-with-external-agents.md#^ref-a4d90289-26-0) (line 26, col 0, score 0.69)
- [Chroma Toolkit Consolidation Plan — L137](chroma-toolkit-consolidation-plan.md#^ref-5020e892-137-0) (line 137, col 0, score 0.67)
- [Per-Domain Policy System for JS Crawler — L463](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-463-0) (line 463, col 0, score 0.66)
- [WebSocket Gateway Implementation — L628](websocket-gateway-implementation.md#^ref-e811123d-628-0) (line 628, col 0, score 0.72)
- [ecs-scheduler-and-prefabs — L381](ecs-scheduler-and-prefabs.md#^ref-c62a1815-381-0) (line 381, col 0, score 0.63)
- [System Scheduler with Resource-Aware DAG — L379](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-379-0) (line 379, col 0, score 0.63)
- [Promethean-native config design — L363](promethean-native-config-design.md#^ref-ab748541-363-0) (line 363, col 0, score 0.65)
- [pm2-orchestration-patterns — L9](pm2-orchestration-patterns.md#^ref-51932e7b-9-0) (line 9, col 0, score 0.64)
- [pm2-orchestration-patterns — L129](pm2-orchestration-patterns.md#^ref-51932e7b-129-0) (line 129, col 0, score 0.64)
- [Performance-Optimized-Polyglot-Bridge — L375](performance-optimized-polyglot-bridge.md#^ref-f5579967-375-0) (line 375, col 0, score 0.64)
- [ParticleSimulationWithCanvasAndFFmpeg — L1](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-1-0) (line 1, col 0, score 0.63)
- [zero-copy-snapshots-and-workers — L306](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-306-0) (line 306, col 0, score 0.61)
- [Promethean Infrastructure Setup — L61](promethean-infrastructure-setup.md#^ref-6deed6ac-61-0) (line 61, col 0, score 0.65)
- [observability-infrastructure-setup — L44](observability-infrastructure-setup.md#^ref-b4e64f8c-44-0) (line 44, col 0, score 0.63)
- [api-gateway-versioning — L7](api-gateway-versioning.md#^ref-0580dcd3-7-0) (line 7, col 0, score 0.64)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L421](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-421-0) (line 421, col 0, score 0.63)
- [Migrate to Provider-Tenant Architecture — L82](migrate-to-provider-tenant-architecture.md#^ref-54382370-82-0) (line 82, col 0, score 0.62)
- [Promethean Event Bus MVP v0.1 — L825](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-825-0) (line 825, col 0, score 0.67)
- [Mongo Outbox Implementation — L538](mongo-outbox-implementation.md#^ref-9c1acd1e-538-0) (line 538, col 0, score 0.63)
- [universal-intention-code-fabric — L417](universal-intention-code-fabric.md#^ref-c14edce7-417-0) (line 417, col 0, score 0.62)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L499](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-499-0) (line 499, col 0, score 0.66)
- [Per-Domain Policy System for JS Crawler — L184](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-184-0) (line 184, col 0, score 0.61)
- [Promethean Agent Config DSL — L292](promethean-agent-config-dsl.md#^ref-2c00ce45-292-0) (line 292, col 0, score 0.68)
- [Migrate to Provider-Tenant Architecture — L261](migrate-to-provider-tenant-architecture.md#^ref-54382370-261-0) (line 261, col 0, score 0.67)
- [Math Fundamentals — L20](chunks/math-fundamentals.md#^ref-c6e87433-20-0) (line 20, col 0, score 0.64)
- [Services — L20](chunks/services.md#^ref-75ea4a6a-20-0) (line 20, col 0, score 0.64)
- [compiler-kit-foundations — L620](compiler-kit-foundations.md#^ref-01b21543-620-0) (line 620, col 0, score 0.64)
- [Cross-Language Runtime Polymorphism — L237](cross-language-runtime-polymorphism.md#^ref-c34c36a6-237-0) (line 237, col 0, score 0.64)
- [Debugging Broker Connections and Agent Behavior — L40](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-40-0) (line 40, col 0, score 0.64)
- [Dynamic Context Model for Web Components — L401](dynamic-context-model-for-web-components.md#^ref-f7702bf8-401-0) (line 401, col 0, score 0.71)
- [ecs-scheduler-and-prefabs — L386](ecs-scheduler-and-prefabs.md#^ref-c62a1815-386-0) (line 386, col 0, score 0.71)
- [eidolon-field-math-foundations — L127](eidolon-field-math-foundations.md#^ref-008f2ac0-127-0) (line 127, col 0, score 0.71)
- [Event Bus MVP — L557](event-bus-mvp.md#^ref-534fe91d-557-0) (line 557, col 0, score 0.71)
- [archetype-ecs — L366](archetype-ecs.md#^ref-8f4c1e86-366-0) (line 366, col 0, score 0.68)
- [ecs-scheduler-and-prefabs — L310](ecs-scheduler-and-prefabs.md#^ref-c62a1815-310-0) (line 310, col 0, score 0.7)
- [System Scheduler with Resource-Aware DAG — L308](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-308-0) (line 308, col 0, score 0.7)
- [zero-copy-snapshots-and-workers — L70](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-70-0) (line 70, col 0, score 0.66)
- [ecs-scheduler-and-prefabs — L246](ecs-scheduler-and-prefabs.md#^ref-c62a1815-246-0) (line 246, col 0, score 0.7)
- [System Scheduler with Resource-Aware DAG — L244](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-244-0) (line 244, col 0, score 0.7)
- [WebSocket Gateway Implementation — L322](websocket-gateway-implementation.md#^ref-e811123d-322-0) (line 322, col 0, score 0.67)
- [Event Bus MVP — L370](event-bus-mvp.md#^ref-534fe91d-370-0) (line 370, col 0, score 0.7)
- [ecs-scheduler-and-prefabs — L7](ecs-scheduler-and-prefabs.md#^ref-c62a1815-7-0) (line 7, col 0, score 0.65)
- [System Scheduler with Resource-Aware DAG — L5](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-5-0) (line 5, col 0, score 0.65)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L345](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-345-0) (line 345, col 0, score 0.7)
- [Lispy Macros with syntax-rules — L301](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-301-0) (line 301, col 0, score 0.69)
- [Mongo Outbox Implementation — L381](mongo-outbox-implementation.md#^ref-9c1acd1e-381-0) (line 381, col 0, score 0.66)
- [compiler-kit-foundations — L31](compiler-kit-foundations.md#^ref-01b21543-31-0) (line 31, col 0, score 0.71)
- [Mongo Outbox Implementation — L187](mongo-outbox-implementation.md#^ref-9c1acd1e-187-0) (line 187, col 0, score 0.67)
- [Pure TypeScript Search Microservice — L514](pure-typescript-search-microservice.md#^ref-d17d3a96-514-0) (line 514, col 0, score 0.64)
- [archetype-ecs — L7](archetype-ecs.md#^ref-8f4c1e86-7-0) (line 7, col 0, score 0.63)
- [RAG UI Panel with Qdrant and PostgREST — L50](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-50-0) (line 50, col 0, score 0.62)
- [Migrate to Provider-Tenant Architecture — L85](migrate-to-provider-tenant-architecture.md#^ref-54382370-85-0) (line 85, col 0, score 0.61)
- [Functional Refactor of TypeScript Document Processing — L115](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-115-0) (line 115, col 0, score 0.61)
- [Promethean-native config design — L343](promethean-native-config-design.md#^ref-ab748541-343-0) (line 343, col 0, score 0.6)
- [Shared Package Structure — L56](shared-package-structure.md#^ref-66a72fc3-56-0) (line 56, col 0, score 0.6)
- [Migrate to Provider-Tenant Architecture — L88](migrate-to-provider-tenant-architecture.md#^ref-54382370-88-0) (line 88, col 0, score 0.6)
- [Promethean Pipelines — L24](promethean-pipelines.md#^ref-8b8e6103-24-0) (line 24, col 0, score 0.6)
- [WebSocket Gateway Implementation — L219](websocket-gateway-implementation.md#^ref-e811123d-219-0) (line 219, col 0, score 0.71)
- [Performance-Optimized-Polyglot-Bridge — L170](performance-optimized-polyglot-bridge.md#^ref-f5579967-170-0) (line 170, col 0, score 0.66)
- [universal-intention-code-fabric — L186](universal-intention-code-fabric.md#^ref-c14edce7-186-0) (line 186, col 0, score 0.7)
- [State Snapshots API and Transactional Projector — L93](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-93-0) (line 93, col 0, score 0.69)
- [WebSocket Gateway Implementation — L56](websocket-gateway-implementation.md#^ref-e811123d-56-0) (line 56, col 0, score 0.65)
- [Promethean Event Bus MVP v0.1 — L604](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-604-0) (line 604, col 0, score 0.65)
- [Per-Domain Policy System for JS Crawler — L141](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-141-0) (line 141, col 0, score 0.69)
- [zero-copy-snapshots-and-workers — L156](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-156-0) (line 156, col 0, score 0.71)
- [zero-copy-snapshots-and-workers — L15](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-15-0) (line 15, col 0, score 0.63)
- [Promethean Web UI Setup — L351](promethean-web-ui-setup.md#^ref-bc5172ca-351-0) (line 351, col 0, score 0.7)
- [Language-Agnostic Mirror System — L471](language-agnostic-mirror-system.md#^ref-d2b3628c-471-0) (line 471, col 0, score 0.68)
- [Language-Agnostic Mirror System — L336](language-agnostic-mirror-system.md#^ref-d2b3628c-336-0) (line 336, col 0, score 0.65)
- [zero-copy-snapshots-and-workers — L267](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-267-0) (line 267, col 0, score 0.74)
- [Pure TypeScript Search Microservice — L178](pure-typescript-search-microservice.md#^ref-d17d3a96-178-0) (line 178, col 0, score 0.67)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L178](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-178-0) (line 178, col 0, score 0.71)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L132](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-132-0) (line 132, col 0, score 0.68)
- [AI-Centric OS with MCP Layer — L279](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-279-0) (line 279, col 0, score 0.64)
- [Functional Embedding Pipeline Refactor — L31](functional-embedding-pipeline-refactor.md#^ref-a4a25141-31-0) (line 31, col 0, score 0.67)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L194](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-194-0) (line 194, col 0, score 0.66)
- [universal-intention-code-fabric — L277](universal-intention-code-fabric.md#^ref-c14edce7-277-0) (line 277, col 0, score 0.67)
- [graph-ds — L5](graph-ds.md#^ref-6620e2f2-5-0) (line 5, col 0, score 0.65)
- [State Snapshots API and Transactional Projector — L9](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-9-0) (line 9, col 0, score 0.65)
- [Event Bus MVP — L99](event-bus-mvp.md#^ref-534fe91d-99-0) (line 99, col 0, score 0.68)
- [Stateful Partitions and Rebalancing — L351](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-351-0) (line 351, col 0, score 0.65)
- [RAG UI Panel with Qdrant and PostgREST — L172](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-172-0) (line 172, col 0, score 0.65)
- [Promethean Agent DSL TS Scaffold — L606](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-606-0) (line 606, col 0, score 0.7)
- [Chroma-Embedding-Refactor — L111](chroma-embedding-refactor.md#^ref-8b256935-111-0) (line 111, col 0, score 0.7)
- [Event Bus MVP — L258](event-bus-mvp.md#^ref-534fe91d-258-0) (line 258, col 0, score 0.68)
- [zero-copy-snapshots-and-workers — L202](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-202-0) (line 202, col 0, score 0.69)
- [Promethean Infrastructure Setup — L439](promethean-infrastructure-setup.md#^ref-6deed6ac-439-0) (line 439, col 0, score 0.69)
- [Promethean Infrastructure Setup — L358](promethean-infrastructure-setup.md#^ref-6deed6ac-358-0) (line 358, col 0, score 0.68)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L445](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-445-0) (line 445, col 0, score 0.71)
- [api-gateway-versioning — L79](api-gateway-versioning.md#^ref-0580dcd3-79-0) (line 79, col 0, score 0.68)
- [Promethean Infrastructure Setup — L456](promethean-infrastructure-setup.md#^ref-6deed6ac-456-0) (line 456, col 0, score 0.68)
- [Promethean Infrastructure Setup — L485](promethean-infrastructure-setup.md#^ref-6deed6ac-485-0) (line 485, col 0, score 0.68)
- [State Snapshots API and Transactional Projector — L248](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-248-0) (line 248, col 0, score 0.72)
- [Provider-Agnostic Chat Panel Implementation — L183](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-183-0) (line 183, col 0, score 0.71)
- [Event Bus MVP — L392](event-bus-mvp.md#^ref-534fe91d-392-0) (line 392, col 0, score 0.7)
- [Chroma-Embedding-Refactor — L28](chroma-embedding-refactor.md#^ref-8b256935-28-0) (line 28, col 0, score 0.7)
- [Local-First Intention→Code Loop with Free Models — L7](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-7-0) (line 7, col 0, score 0.69)
- [Promethean Event Bus MVP v0.1 — L697](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-697-0) (line 697, col 0, score 0.68)
- [TypeScript Patch for Tool Calling Support — L9](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-9-0) (line 9, col 0, score 0.69)
- [Chroma Toolkit Consolidation Plan — L139](chroma-toolkit-consolidation-plan.md#^ref-5020e892-139-0) (line 139, col 0, score 0.72)
- [compiler-kit-foundations — L140](compiler-kit-foundations.md#^ref-01b21543-140-0) (line 140, col 0, score 0.71)
- [WebSocket Gateway Implementation — L387](websocket-gateway-implementation.md#^ref-e811123d-387-0) (line 387, col 0, score 0.71)
- [schema-evolution-workflow — L9](schema-evolution-workflow.md#^ref-d8059b6a-9-0) (line 9, col 0, score 0.7)
- [Promethean Event Bus MVP v0.1 — L747](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-747-0) (line 747, col 0, score 0.7)
- [windows-tiling-with-autohotkey — L109](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-109-0) (line 109, col 0, score 0.63)
- [Migrate to Provider-Tenant Architecture — L111](migrate-to-provider-tenant-architecture.md#^ref-54382370-111-0) (line 111, col 0, score 0.62)
- [Chroma Toolkit Consolidation Plan — L6](chroma-toolkit-consolidation-plan.md#^ref-5020e892-6-0) (line 6, col 0, score 0.61)
- [Promethean State Format — L26](promethean-state-format.md#^ref-23df6ddb-26-0) (line 26, col 0, score 0.65)
- [ecs-scheduler-and-prefabs — L383](ecs-scheduler-and-prefabs.md#^ref-c62a1815-383-0) (line 383, col 0, score 0.64)
- [System Scheduler with Resource-Aware DAG — L381](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-381-0) (line 381, col 0, score 0.64)
- [Factorio AI with External Agents — L15](factorio-ai-with-external-agents.md#^ref-a4d90289-15-0) (line 15, col 0, score 0.64)
- [Promethean Agent Config DSL — L290](promethean-agent-config-dsl.md#^ref-2c00ce45-290-0) (line 290, col 0, score 0.64)
- [State Snapshots API and Transactional Projector — L3](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-3-0) (line 3, col 0, score 0.63)
- [JavaScript — L13](chunks/javascript.md#^ref-c1618c66-13-0) (line 13, col 0, score 0.64)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L507](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-507-0) (line 507, col 0, score 0.64)
- [polymorphic-meta-programming-engine — L237](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-237-0) (line 237, col 0, score 0.64)
- [prom-lib-rate-limiters-and-replay-api — L392](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-392-0) (line 392, col 0, score 0.64)
- [Promethean Event Bus MVP v0.1 — L912](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-912-0) (line 912, col 0, score 0.64)
- [Promethean Agent DSL TS Scaffold — L588](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-588-0) (line 588, col 0, score 0.64)
- [archetype-ecs — L441](archetype-ecs.md#^ref-8f4c1e86-441-0) (line 441, col 0, score 0.64)
- [Lispy Macros with syntax-rules — L319](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-319-0) (line 319, col 0, score 0.69)
- [zero-copy-snapshots-and-workers — L238](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-238-0) (line 238, col 0, score 0.76)
- [Stateful Partitions and Rebalancing — L166](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-166-0) (line 166, col 0, score 0.7)
- [Chroma-Embedding-Refactor — L260](chroma-embedding-refactor.md#^ref-8b256935-260-0) (line 260, col 0, score 0.7)
- [universal-intention-code-fabric — L127](universal-intention-code-fabric.md#^ref-c14edce7-127-0) (line 127, col 0, score 0.7)
- [Language-Agnostic Mirror System — L151](language-agnostic-mirror-system.md#^ref-d2b3628c-151-0) (line 151, col 0, score 0.67)
- [universal-intention-code-fabric — L252](universal-intention-code-fabric.md#^ref-c14edce7-252-0) (line 252, col 0, score 0.69)
- [Stateful Partitions and Rebalancing — L101](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-101-0) (line 101, col 0, score 0.67)
- [Lisp-Compiler-Integration — L440](lisp-compiler-integration.md#^ref-cfee6d36-440-0) (line 440, col 0, score 0.66)
- [Language-Agnostic Mirror System — L237](language-agnostic-mirror-system.md#^ref-d2b3628c-237-0) (line 237, col 0, score 0.66)
- [WebSocket Gateway Implementation — L333](websocket-gateway-implementation.md#^ref-e811123d-333-0) (line 333, col 0, score 0.64)
- [Mongo Outbox Implementation — L74](mongo-outbox-implementation.md#^ref-9c1acd1e-74-0) (line 74, col 0, score 0.64)
- [TypeScript Patch for Tool Calling Support — L131](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-131-0) (line 131, col 0, score 0.64)
- [Model Upgrade Calm-Down Guide — L33](model-upgrade-calm-down-guide.md#^ref-db74343f-33-0) (line 33, col 0, score 0.63)
- [Promethean-native config design — L32](promethean-native-config-design.md#^ref-ab748541-32-0) (line 32, col 0, score 0.65)
- [Promethean-native config design — L33](promethean-native-config-design.md#^ref-ab748541-33-0) (line 33, col 0, score 0.63)
- [Promethean-native config design — L35](promethean-native-config-design.md#^ref-ab748541-35-0) (line 35, col 0, score 0.63)
- [Chroma-Embedding-Refactor — L64](chroma-embedding-refactor.md#^ref-8b256935-64-0) (line 64, col 0, score 0.66)
- [Chroma-Embedding-Refactor — L109](chroma-embedding-refactor.md#^ref-8b256935-109-0) (line 109, col 0, score 0.66)
- [Chroma-Embedding-Refactor — L258](chroma-embedding-refactor.md#^ref-8b256935-258-0) (line 258, col 0, score 0.66)
- [Chroma Toolkit Consolidation Plan — L72](chroma-toolkit-consolidation-plan.md#^ref-5020e892-72-0) (line 72, col 0, score 0.66)
- [Promethean Event Bus MVP v0.1 — L294](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-294-0) (line 294, col 0, score 0.69)
- [Promethean-native config design — L297](promethean-native-config-design.md#^ref-ab748541-297-0) (line 297, col 0, score 0.65)
- [AI-Centric OS with MCP Layer — L420](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-420-0) (line 420, col 0, score 1)
- [aionian-circuit-math — L177](aionian-circuit-math.md#^ref-f2d83a77-177-0) (line 177, col 0, score 1)
- [archetype-ecs — L477](archetype-ecs.md#^ref-8f4c1e86-477-0) (line 477, col 0, score 1)
- [Board Walk – 2025-08-11 — L140](board-walk-2025-08-11.md#^ref-7aa1eb92-140-0) (line 140, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L118](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-118-0) (line 118, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L177](chroma-toolkit-consolidation-plan.md#^ref-5020e892-177-0) (line 177, col 0, score 1)
- [Diagrams — L47](chunks/diagrams.md#^ref-45cd25b5-47-0) (line 47, col 0, score 1)
- [JavaScript — L35](chunks/javascript.md#^ref-c1618c66-35-0) (line 35, col 0, score 1)
- [Math Fundamentals — L33](chunks/math-fundamentals.md#^ref-c6e87433-33-0) (line 33, col 0, score 1)
- [Services — L31](chunks/services.md#^ref-75ea4a6a-31-0) (line 31, col 0, score 1)
- [WebSocket Gateway Implementation — L614](websocket-gateway-implementation.md#^ref-e811123d-614-0) (line 614, col 0, score 0.7)
- [WebSocket Gateway Implementation — L48](websocket-gateway-implementation.md#^ref-e811123d-48-0) (line 48, col 0, score 0.68)
- [Migrate to Provider-Tenant Architecture — L84](migrate-to-provider-tenant-architecture.md#^ref-54382370-84-0) (line 84, col 0, score 0.67)
- [WebSocket Gateway Implementation — L43](websocket-gateway-implementation.md#^ref-e811123d-43-0) (line 43, col 0, score 0.66)
- [Shared Package Structure — L155](shared-package-structure.md#^ref-66a72fc3-155-0) (line 155, col 0, score 0.66)
- [Voice Access Layer Design — L196](voice-access-layer-design.md#^ref-543ed9b3-196-0) (line 196, col 0, score 0.65)
- [prom-lib-rate-limiters-and-replay-api — L58](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-58-0) (line 58, col 0, score 0.63)
- [Shared Package Structure — L137](shared-package-structure.md#^ref-66a72fc3-137-0) (line 137, col 0, score 0.62)
- [zero-copy-snapshots-and-workers — L3](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-3-0) (line 3, col 0, score 0.65)
- [JavaScript — L11](chunks/javascript.md#^ref-c1618c66-11-0) (line 11, col 0, score 1)
- [ecs-scheduler-and-prefabs — L419](ecs-scheduler-and-prefabs.md#^ref-c62a1815-419-0) (line 419, col 0, score 1)
- [Interop and Source Maps — L534](interop-and-source-maps.md#^ref-cdfac40c-534-0) (line 534, col 0, score 1)
- [Lisp-Compiler-Integration — L539](lisp-compiler-integration.md#^ref-cfee6d36-539-0) (line 539, col 0, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L500](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-500-0) (line 500, col 0, score 0.63)
- [Performance-Optimized-Polyglot-Bridge — L11](performance-optimized-polyglot-bridge.md#^ref-f5579967-11-0) (line 11, col 0, score 0.68)
- [Performance-Optimized-Polyglot-Bridge — L388](performance-optimized-polyglot-bridge.md#^ref-f5579967-388-0) (line 388, col 0, score 0.65)
- [prom-lib-rate-limiters-and-replay-api — L347](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-347-0) (line 347, col 0, score 0.65)
- [AI-Centric OS with MCP Layer — L383](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-383-0) (line 383, col 0, score 0.63)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L489](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-489-0) (line 489, col 0, score 0.63)
- [zero-copy-snapshots-and-workers — L7](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-7-0) (line 7, col 0, score 0.63)
- [Performance-Optimized-Polyglot-Bridge — L359](performance-optimized-polyglot-bridge.md#^ref-f5579967-359-0) (line 359, col 0, score 0.63)
- [Performance-Optimized-Polyglot-Bridge — L414](performance-optimized-polyglot-bridge.md#^ref-f5579967-414-0) (line 414, col 0, score 0.63)
- [shared-package-layout-clarification — L82](shared-package-layout-clarification.md#^ref-36c8882a-82-0) (line 82, col 0, score 0.69)
- [Dynamic Context Model for Web Components — L331](dynamic-context-model-for-web-components.md#^ref-f7702bf8-331-0) (line 331, col 0, score 0.66)
- [Promethean-native config design — L31](promethean-native-config-design.md#^ref-ab748541-31-0) (line 31, col 0, score 0.66)
- [obsidian-ignore-node-modules-regex — L6](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-6-0) (line 6, col 0, score 0.66)
- [obsidian-ignore-node-modules-regex — L12](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-12-0) (line 12, col 0, score 0.66)
- [Chroma Toolkit Consolidation Plan — L88](chroma-toolkit-consolidation-plan.md#^ref-5020e892-88-0) (line 88, col 0, score 0.66)
- [Chroma Toolkit Consolidation Plan — L107](chroma-toolkit-consolidation-plan.md#^ref-5020e892-107-0) (line 107, col 0, score 0.66)
- [Chroma Toolkit Consolidation Plan — L148](chroma-toolkit-consolidation-plan.md#^ref-5020e892-148-0) (line 148, col 0, score 0.66)
- [Agent Tasks: Persistence Migration to DualStore — L95](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-95-0) (line 95, col 0, score 0.65)
- [Performance-Optimized-Polyglot-Bridge — L394](performance-optimized-polyglot-bridge.md#^ref-f5579967-394-0) (line 394, col 0, score 0.63)
- [Performance-Optimized-Polyglot-Bridge — L13](performance-optimized-polyglot-bridge.md#^ref-f5579967-13-0) (line 13, col 0, score 0.61)
- [Voice Access Layer Design — L216](voice-access-layer-design.md#^ref-543ed9b3-216-0) (line 216, col 0, score 0.61)
- [Voice Access Layer Design — L212](voice-access-layer-design.md#^ref-543ed9b3-212-0) (line 212, col 0, score 0.61)
- [ecs-scheduler-and-prefabs — L379](ecs-scheduler-and-prefabs.md#^ref-c62a1815-379-0) (line 379, col 0, score 1)
- [markdown-to-org-transpiler — L289](markdown-to-org-transpiler.md#^ref-ab54cdd8-289-0) (line 289, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L153](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-153-0) (line 153, col 0, score 1)
- [System Scheduler with Resource-Aware DAG — L377](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-377-0) (line 377, col 0, score 1)
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
- [typed-struct-compiler — L355](typed-struct-compiler.md#^ref-78eeedf7-355-0) (line 355, col 0, score 0.71)
- [WebSocket Gateway Implementation — L618](websocket-gateway-implementation.md#^ref-e811123d-618-0) (line 618, col 0, score 0.66)
- [Model Upgrade Calm-Down Guide — L30](model-upgrade-calm-down-guide.md#^ref-db74343f-30-0) (line 30, col 0, score 0.66)
- [State Snapshots API and Transactional Projector — L317](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-317-0) (line 317, col 0, score 0.65)
- [State Snapshots API and Transactional Projector — L83](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-83-0) (line 83, col 0, score 0.64)
- [schema-evolution-workflow — L475](schema-evolution-workflow.md#^ref-d8059b6a-475-0) (line 475, col 0, score 0.64)
- [EidolonField — L234](eidolonfield.md#^ref-49d1e1e5-234-0) (line 234, col 0, score 0.63)
- [typed-struct-compiler — L339](typed-struct-compiler.md#^ref-78eeedf7-339-0) (line 339, col 0, score 0.63)
- [prom-lib-rate-limiters-and-replay-api — L338](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-338-0) (line 338, col 0, score 0.62)
- [State Snapshots API and Transactional Projector — L235](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-235-0) (line 235, col 0, score 0.62)
- [zero-copy-snapshots-and-workers — L5](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-5-0) (line 5, col 0, score 0.7)
- [zero-copy-snapshots-and-workers — L351](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-351-0) (line 351, col 0, score 0.7)
- [Agent Tasks: Persistence Migration to DualStore — L92](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-92-0) (line 92, col 0, score 0.66)
- [Agent Tasks: Persistence Migration to DualStore — L18](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-18-0) (line 18, col 0, score 0.65)
- [Cross-Language Runtime Polymorphism — L121](cross-language-runtime-polymorphism.md#^ref-c34c36a6-121-0) (line 121, col 0, score 0.64)
- [ecs-scheduler-and-prefabs — L382](ecs-scheduler-and-prefabs.md#^ref-c62a1815-382-0) (line 382, col 0, score 0.9)
- [System Scheduler with Resource-Aware DAG — L380](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-380-0) (line 380, col 0, score 0.9)
- [Fnord Tracer Protocol — L131](fnord-tracer-protocol.md#^ref-fc21f824-131-0) (line 131, col 0, score 0.67)
- [Sibilant Meta-Prompt DSL — L148](sibilant-meta-prompt-dsl.md#^ref-af5d2824-148-0) (line 148, col 0, score 0.65)
- [Promethean Documentation Pipeline Overview — L148](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-148-0) (line 148, col 0, score 0.65)
- [Fnord Tracer Protocol — L151](fnord-tracer-protocol.md#^ref-fc21f824-151-0) (line 151, col 0, score 0.63)
- [layer-1-uptime-diagrams — L81](layer-1-uptime-diagrams.md#^ref-4127189a-81-0) (line 81, col 0, score 0.63)
- [Fnord Tracer Protocol — L185](fnord-tracer-protocol.md#^ref-fc21f824-185-0) (line 185, col 0, score 0.62)
- [AI-Centric OS with MCP Layer — L22](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-22-0) (line 22, col 0, score 0.62)
- [Exception Layer Analysis — L172](exception-layer-analysis.md#^ref-21d5cc09-172-0) (line 172, col 0, score 1)
- [field-dynamics-math-blocks — L154](field-dynamics-math-blocks.md#^ref-7cfc230d-154-0) (line 154, col 0, score 1)
- [field-interaction-equations — L164](field-interaction-equations.md#^ref-b09141b7-164-0) (line 164, col 0, score 1)
- [field-node-diagram-outline — L120](field-node-diagram-outline.md#^ref-1f32c94a-120-0) (line 120, col 0, score 1)
- [field-node-diagram-set — L149](field-node-diagram-set.md#^ref-22b989d5-149-0) (line 149, col 0, score 1)
- [field-node-diagram-visualizations — L99](field-node-diagram-visualizations.md#^ref-e9b27b06-99-0) (line 99, col 0, score 1)
- [graph-ds — L365](graph-ds.md#^ref-6620e2f2-365-0) (line 365, col 0, score 1)
- [heartbeat-fragment-demo — L111](heartbeat-fragment-demo.md#^ref-dd00677a-111-0) (line 111, col 0, score 1)
- [heartbeat-simulation-snippets — L101](heartbeat-simulation-snippets.md#^ref-23e221e9-101-0) (line 101, col 0, score 1)
- [archetype-ecs — L453](archetype-ecs.md#^ref-8f4c1e86-453-0) (line 453, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L199](chroma-toolkit-consolidation-plan.md#^ref-5020e892-199-0) (line 199, col 0, score 1)
- [ecs-scheduler-and-prefabs — L385](ecs-scheduler-and-prefabs.md#^ref-c62a1815-385-0) (line 385, col 0, score 1)
- [eidolon-field-math-foundations — L128](eidolon-field-math-foundations.md#^ref-008f2ac0-128-0) (line 128, col 0, score 1)
- [Local-Only-LLM-Workflow — L177](local-only-llm-workflow.md#^ref-9a8ab57e-177-0) (line 177, col 0, score 1)
- [markdown-to-org-transpiler — L297](markdown-to-org-transpiler.md#^ref-ab54cdd8-297-0) (line 297, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L162](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-162-0) (line 162, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L441](performance-optimized-polyglot-bridge.md#^ref-f5579967-441-0) (line 441, col 0, score 1)
- [Admin Dashboard for User Management — L40](admin-dashboard-for-user-management.md#^ref-2901a3e9-40-0) (line 40, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L156](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-156-0) (line 156, col 0, score 1)
- [api-gateway-versioning — L297](api-gateway-versioning.md#^ref-0580dcd3-297-0) (line 297, col 0, score 1)
- [ecs-scheduler-and-prefabs — L388](ecs-scheduler-and-prefabs.md#^ref-c62a1815-388-0) (line 388, col 0, score 1)
- [eidolon-field-math-foundations — L129](eidolon-field-math-foundations.md#^ref-008f2ac0-129-0) (line 129, col 0, score 1)
- [field-interaction-equations — L177](field-interaction-equations.md#^ref-b09141b7-177-0) (line 177, col 0, score 1)
- [js-to-lisp-reverse-compiler — L422](js-to-lisp-reverse-compiler.md#^ref-58191024-422-0) (line 422, col 0, score 1)
- [Local-Only-LLM-Workflow — L174](local-only-llm-workflow.md#^ref-9a8ab57e-174-0) (line 174, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L157](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-157-0) (line 157, col 0, score 1)
- [api-gateway-versioning — L298](api-gateway-versioning.md#^ref-0580dcd3-298-0) (line 298, col 0, score 1)
- [ecs-scheduler-and-prefabs — L389](ecs-scheduler-and-prefabs.md#^ref-c62a1815-389-0) (line 389, col 0, score 1)
- [eidolon-field-math-foundations — L130](eidolon-field-math-foundations.md#^ref-008f2ac0-130-0) (line 130, col 0, score 1)
- [i3-config-validation-methods — L63](i3-config-validation-methods.md#^ref-d28090ac-63-0) (line 63, col 0, score 1)
- [Interop and Source Maps — L531](interop-and-source-maps.md#^ref-cdfac40c-531-0) (line 531, col 0, score 1)
- [Language-Agnostic Mirror System — L548](language-agnostic-mirror-system.md#^ref-d2b3628c-548-0) (line 548, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L143](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-143-0) (line 143, col 0, score 1)
- [Local-Only-LLM-Workflow — L172](local-only-llm-workflow.md#^ref-9a8ab57e-172-0) (line 172, col 0, score 1)
- [api-gateway-versioning — L282](api-gateway-versioning.md#^ref-0580dcd3-282-0) (line 282, col 0, score 1)
- [archetype-ecs — L470](archetype-ecs.md#^ref-8f4c1e86-470-0) (line 470, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L201](chroma-toolkit-consolidation-plan.md#^ref-5020e892-201-0) (line 201, col 0, score 1)
- [Dynamic Context Model for Web Components — L382](dynamic-context-model-for-web-components.md#^ref-f7702bf8-382-0) (line 382, col 0, score 1)
- [ecs-scheduler-and-prefabs — L390](ecs-scheduler-and-prefabs.md#^ref-c62a1815-390-0) (line 390, col 0, score 1)
- [eidolon-field-math-foundations — L125](eidolon-field-math-foundations.md#^ref-008f2ac0-125-0) (line 125, col 0, score 1)
- [i3-config-validation-methods — L61](i3-config-validation-methods.md#^ref-d28090ac-61-0) (line 61, col 0, score 1)
- [Mongo Outbox Implementation — L572](mongo-outbox-implementation.md#^ref-9c1acd1e-572-0) (line 572, col 0, score 1)
- [observability-infrastructure-setup — L360](observability-infrastructure-setup.md#^ref-b4e64f8c-360-0) (line 360, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L163](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-163-0) (line 163, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L472](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-472-0) (line 472, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L455](performance-optimized-polyglot-bridge.md#^ref-f5579967-455-0) (line 455, col 0, score 1)
- [Lispy Macros with syntax-rules — L412](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-412-0) (line 412, col 0, score 1)
- [State Snapshots API and Transactional Projector — L353](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-353-0) (line 353, col 0, score 1)
- [System Scheduler with Resource-Aware DAG — L410](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-410-0) (line 410, col 0, score 1)
- [Unique Info Dump Index — L72](unique-info-dump-index.md#^ref-30ec3ba6-72-0) (line 72, col 0, score 1)
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
- [ecs-scheduler-and-prefabs — L395](ecs-scheduler-and-prefabs.md#^ref-c62a1815-395-0) (line 395, col 0, score 1)
- [eidolon-field-math-foundations — L156](eidolon-field-math-foundations.md#^ref-008f2ac0-156-0) (line 156, col 0, score 1)
- [i3-config-validation-methods — L64](i3-config-validation-methods.md#^ref-d28090ac-64-0) (line 64, col 0, score 1)
- [Interop and Source Maps — L533](interop-and-source-maps.md#^ref-cdfac40c-533-0) (line 533, col 0, score 1)
- [Admin Dashboard for User Management — L46](admin-dashboard-for-user-management.md#^ref-2901a3e9-46-0) (line 46, col 0, score 1)
- [DSL — L22](chunks/dsl.md#^ref-e87bc036-22-0) (line 22, col 0, score 1)
- [compiler-kit-foundations — L609](compiler-kit-foundations.md#^ref-01b21543-609-0) (line 609, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L229](cross-language-runtime-polymorphism.md#^ref-c34c36a6-229-0) (line 229, col 0, score 1)
- [ecs-scheduler-and-prefabs — L396](ecs-scheduler-and-prefabs.md#^ref-c62a1815-396-0) (line 396, col 0, score 1)
- [eidolon-field-math-foundations — L157](eidolon-field-math-foundations.md#^ref-008f2ac0-157-0) (line 157, col 0, score 1)
- [i3-config-validation-methods — L57](i3-config-validation-methods.md#^ref-d28090ac-57-0) (line 57, col 0, score 1)
- [Interop and Source Maps — L515](interop-and-source-maps.md#^ref-cdfac40c-515-0) (line 515, col 0, score 1)
- [Language-Agnostic Mirror System — L539](language-agnostic-mirror-system.md#^ref-d2b3628c-539-0) (line 539, col 0, score 1)
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
- [Agent Tasks: Persistence Migration to DualStore — L152](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-152-0) (line 152, col 0, score 1)
- [api-gateway-versioning — L294](api-gateway-versioning.md#^ref-0580dcd3-294-0) (line 294, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L191](chroma-toolkit-consolidation-plan.md#^ref-5020e892-191-0) (line 191, col 0, score 1)
- [Services — L11](chunks/services.md#^ref-75ea4a6a-11-0) (line 11, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L228](cross-language-runtime-polymorphism.md#^ref-c34c36a6-228-0) (line 228, col 0, score 1)
- [Event Bus MVP — L547](event-bus-mvp.md#^ref-534fe91d-547-0) (line 547, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L312](migrate-to-provider-tenant-architecture.md#^ref-54382370-312-0) (line 312, col 0, score 1)
- [observability-infrastructure-setup — L362](observability-infrastructure-setup.md#^ref-b4e64f8c-362-0) (line 362, col 0, score 1)
- [AI-Centric OS with MCP Layer — L405](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-405-0) (line 405, col 0, score 1)
- [archetype-ecs — L469](archetype-ecs.md#^ref-8f4c1e86-469-0) (line 469, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L219](chroma-toolkit-consolidation-plan.md#^ref-5020e892-219-0) (line 219, col 0, score 1)
- [DSL — L19](chunks/dsl.md#^ref-e87bc036-19-0) (line 19, col 0, score 1)
- [Window Management — L26](chunks/window-management.md#^ref-9e8ae388-26-0) (line 26, col 0, score 1)
- [compiler-kit-foundations — L608](compiler-kit-foundations.md#^ref-01b21543-608-0) (line 608, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L261](cross-language-runtime-polymorphism.md#^ref-c34c36a6-261-0) (line 261, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L181](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-181-0) (line 181, col 0, score 1)
- [Dynamic Context Model for Web Components — L400](dynamic-context-model-for-web-components.md#^ref-f7702bf8-400-0) (line 400, col 0, score 1)
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
- [JavaScript — L19](chunks/javascript.md#^ref-c1618c66-19-0) (line 19, col 0, score 1)
- [Math Fundamentals — L31](chunks/math-fundamentals.md#^ref-c6e87433-31-0) (line 31, col 0, score 1)
- [Tooling — L19](chunks/tooling.md#^ref-6cb4943e-19-0) (line 19, col 0, score 1)
- [compiler-kit-foundations — L634](compiler-kit-foundations.md#^ref-01b21543-634-0) (line 634, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L212](cross-language-runtime-polymorphism.md#^ref-c34c36a6-212-0) (line 212, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L180](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-180-0) (line 180, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L56](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-56-0) (line 56, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L45](ducks-self-referential-perceptual-loop.md#^ref-71726f04-45-0) (line 45, col 0, score 1)
- [Dynamic Context Model for Web Components — L384](dynamic-context-model-for-web-components.md#^ref-f7702bf8-384-0) (line 384, col 0, score 1)
- [ecs-scheduler-and-prefabs — L413](ecs-scheduler-and-prefabs.md#^ref-c62a1815-413-0) (line 413, col 0, score 1)
- [Eidolon Field Abstract Model — L214](eidolon-field-abstract-model.md#^ref-5e8b2388-214-0) (line 214, col 0, score 1)
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
- [api-gateway-versioning — L300](api-gateway-versioning.md#^ref-0580dcd3-300-0) (line 300, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L305](migrate-to-provider-tenant-architecture.md#^ref-54382370-305-0) (line 305, col 0, score 1)
- [observability-infrastructure-setup — L399](observability-infrastructure-setup.md#^ref-b4e64f8c-399-0) (line 399, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L79](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-79-0) (line 79, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L165](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-165-0) (line 165, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L266](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-266-0) (line 266, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L488](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-488-0) (line 488, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L436](performance-optimized-polyglot-bridge.md#^ref-f5579967-436-0) (line 436, col 0, score 1)
- [polyglot-repl-interface-layer — L191](polyglot-repl-interface-layer.md#^ref-9c79206d-191-0) (line 191, col 0, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L504](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-504-0) (line 504, col 0, score 1)
- [polymorphic-meta-programming-engine — L244](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-244-0) (line 244, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L91](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-91-0) (line 91, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L153](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-153-0) (line 153, col 0, score 1)
- [archetype-ecs — L468](archetype-ecs.md#^ref-8f4c1e86-468-0) (line 468, col 0, score 1)
- [DSL — L17](chunks/dsl.md#^ref-e87bc036-17-0) (line 17, col 0, score 1)
- [compiler-kit-foundations — L619](compiler-kit-foundations.md#^ref-01b21543-619-0) (line 619, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L217](cross-language-runtime-polymorphism.md#^ref-c34c36a6-217-0) (line 217, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L177](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-177-0) (line 177, col 0, score 1)
- [Dynamic Context Model for Web Components — L387](dynamic-context-model-for-web-components.md#^ref-f7702bf8-387-0) (line 387, col 0, score 1)
- [ecs-scheduler-and-prefabs — L402](ecs-scheduler-and-prefabs.md#^ref-c62a1815-402-0) (line 402, col 0, score 1)
- [eidolon-field-math-foundations — L145](eidolon-field-math-foundations.md#^ref-008f2ac0-145-0) (line 145, col 0, score 1)
- [field-interaction-equations — L167](field-interaction-equations.md#^ref-b09141b7-167-0) (line 167, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L214](chroma-toolkit-consolidation-plan.md#^ref-5020e892-214-0) (line 214, col 0, score 1)
- [Tooling — L18](chunks/tooling.md#^ref-6cb4943e-18-0) (line 18, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L226](cross-language-runtime-polymorphism.md#^ref-c34c36a6-226-0) (line 226, col 0, score 1)
- [ecs-scheduler-and-prefabs — L399](ecs-scheduler-and-prefabs.md#^ref-c62a1815-399-0) (line 399, col 0, score 1)
- [eidolon-field-math-foundations — L146](eidolon-field-math-foundations.md#^ref-008f2ac0-146-0) (line 146, col 0, score 1)
- [Event Bus MVP — L556](event-bus-mvp.md#^ref-534fe91d-556-0) (line 556, col 0, score 1)
- [i3-bluetooth-setup — L106](i3-bluetooth-setup.md#^ref-5e408692-106-0) (line 106, col 0, score 1)
- [i3-config-validation-methods — L62](i3-config-validation-methods.md#^ref-d28090ac-62-0) (line 62, col 0, score 1)
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
- [2d-sandbox-field — L221](2d-sandbox-field.md#^ref-c710dc93-221-0) (line 221, col 0, score 1)
- [aionian-circuit-math — L165](aionian-circuit-math.md#^ref-f2d83a77-165-0) (line 165, col 0, score 1)
- [api-gateway-versioning — L319](api-gateway-versioning.md#^ref-0580dcd3-319-0) (line 319, col 0, score 1)
- [archetype-ecs — L463](archetype-ecs.md#^ref-8f4c1e86-463-0) (line 463, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L116](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-116-0) (line 116, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L209](chroma-toolkit-consolidation-plan.md#^ref-5020e892-209-0) (line 209, col 0, score 1)
- [DSL — L13](chunks/dsl.md#^ref-e87bc036-13-0) (line 13, col 0, score 1)
- [JavaScript — L17](chunks/javascript.md#^ref-c1618c66-17-0) (line 17, col 0, score 1)
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
- [AI-Centric OS with MCP Layer — L407](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-407-0) (line 407, col 0, score 1)
- [api-gateway-versioning — L284](api-gateway-versioning.md#^ref-0580dcd3-284-0) (line 284, col 0, score 1)
- [Services — L21](chunks/services.md#^ref-75ea4a6a-21-0) (line 21, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L43](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-43-0) (line 43, col 0, score 1)
- [Dynamic Context Model for Web Components — L407](dynamic-context-model-for-web-components.md#^ref-f7702bf8-407-0) (line 407, col 0, score 1)
- [eidolon-field-math-foundations — L167](eidolon-field-math-foundations.md#^ref-008f2ac0-167-0) (line 167, col 0, score 1)
- [Event Bus MVP — L562](event-bus-mvp.md#^ref-534fe91d-562-0) (line 562, col 0, score 1)
- [i3-bluetooth-setup — L123](i3-bluetooth-setup.md#^ref-5e408692-123-0) (line 123, col 0, score 1)
- [i3-config-validation-methods — L78](i3-config-validation-methods.md#^ref-d28090ac-78-0) (line 78, col 0, score 1)
- [zero-copy-snapshots-and-workers — L363](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-363-0) (line 363, col 0, score 1)
- [Simulation Demo — L32](chunks/simulation-demo.md#^ref-557309a3-32-0) (line 32, col 0, score 1)
- [Tooling — L26](chunks/tooling.md#^ref-6cb4943e-26-0) (line 26, col 0, score 1)
- [Window Management — L36](chunks/window-management.md#^ref-9e8ae388-36-0) (line 36, col 0, score 1)
- [compiler-kit-foundations — L639](compiler-kit-foundations.md#^ref-01b21543-639-0) (line 639, col 0, score 1)
- [Creative Moments — L10](creative-moments.md#^ref-10d98225-10-0) (line 10, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L258](cross-language-runtime-polymorphism.md#^ref-c34c36a6-258-0) (line 258, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L215](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-215-0) (line 215, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L50](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-50-0) (line 50, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L135](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-135-0) (line 135, col 0, score 1)
- [ecs-scheduler-and-prefabs — L418](ecs-scheduler-and-prefabs.md#^ref-c62a1815-418-0) (line 418, col 0, score 1)
- [Event Bus MVP — L545](event-bus-mvp.md#^ref-534fe91d-545-0) (line 545, col 0, score 1)
- [Event Bus Projections Architecture — L148](event-bus-projections-architecture.md#^ref-cf6b9b17-148-0) (line 148, col 0, score 1)
- [Fnord Tracer Protocol — L242](fnord-tracer-protocol.md#^ref-fc21f824-242-0) (line 242, col 0, score 1)
- [i3-bluetooth-setup — L104](i3-bluetooth-setup.md#^ref-5e408692-104-0) (line 104, col 0, score 1)
- [layer-1-uptime-diagrams — L173](layer-1-uptime-diagrams.md#^ref-4127189a-173-0) (line 173, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L147](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-147-0) (line 147, col 0, score 1)
- [Matplotlib Animation with Async Execution — L78](matplotlib-animation-with-async-execution.md#^ref-687439f9-78-0) (line 78, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L270](migrate-to-provider-tenant-architecture.md#^ref-54382370-270-0) (line 270, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L145](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-145-0) (line 145, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L291](migrate-to-provider-tenant-architecture.md#^ref-54382370-291-0) (line 291, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L155](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-155-0) (line 155, col 0, score 1)
- [Mongo Outbox Implementation — L550](mongo-outbox-implementation.md#^ref-9c1acd1e-550-0) (line 550, col 0, score 1)
- [observability-infrastructure-setup — L368](observability-infrastructure-setup.md#^ref-b4e64f8c-368-0) (line 368, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L72](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-72-0) (line 72, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L201](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-201-0) (line 201, col 0, score 1)
- [polymorphic-meta-programming-engine — L246](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-246-0) (line 246, col 0, score 1)
- [prom-lib-rate-limiters-and-replay-api — L384](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-384-0) (line 384, col 0, score 1)
- [Promethean Agent Config DSL — L329](promethean-agent-config-dsl.md#^ref-2c00ce45-329-0) (line 329, col 0, score 1)
- [Promethean Event Bus MVP v0.1 — L879](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-879-0) (line 879, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L134](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-134-0) (line 134, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L164](chroma-toolkit-consolidation-plan.md#^ref-5020e892-164-0) (line 164, col 0, score 1)
- [Services — L18](chunks/services.md#^ref-75ea4a6a-18-0) (line 18, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L230](cross-language-runtime-polymorphism.md#^ref-c34c36a6-230-0) (line 230, col 0, score 1)
- [eidolon-field-math-foundations — L148](eidolon-field-math-foundations.md#^ref-008f2ac0-148-0) (line 148, col 0, score 1)
- [Event Bus MVP — L549](event-bus-mvp.md#^ref-534fe91d-549-0) (line 549, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L282](migrate-to-provider-tenant-architecture.md#^ref-54382370-282-0) (line 282, col 0, score 1)
- [Mongo Outbox Implementation — L553](mongo-outbox-implementation.md#^ref-9c1acd1e-553-0) (line 553, col 0, score 1)
- [markdown-to-org-transpiler — L318](markdown-to-org-transpiler.md#^ref-ab54cdd8-318-0) (line 318, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L322](migrate-to-provider-tenant-architecture.md#^ref-54382370-322-0) (line 322, col 0, score 1)
- [Mongo Outbox Implementation — L579](mongo-outbox-implementation.md#^ref-9c1acd1e-579-0) (line 579, col 0, score 1)
- [observability-infrastructure-setup — L369](observability-infrastructure-setup.md#^ref-b4e64f8c-369-0) (line 369, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L183](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-183-0) (line 183, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L483](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-483-0) (line 483, col 0, score 1)
- [polymorphic-meta-programming-engine — L241](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-241-0) (line 241, col 0, score 1)
- [prom-lib-rate-limiters-and-replay-api — L415](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-415-0) (line 415, col 0, score 1)
- [Promethean Agent Config DSL — L352](promethean-agent-config-dsl.md#^ref-2c00ce45-352-0) (line 352, col 0, score 1)
- [eidolon-node-lifecycle — L63](eidolon-node-lifecycle.md#^ref-938eca9c-63-0) (line 63, col 0, score 1)
- [EidolonField — L269](eidolonfield.md#^ref-49d1e1e5-269-0) (line 269, col 0, score 1)
- [Event Bus MVP — L566](event-bus-mvp.md#^ref-534fe91d-566-0) (line 566, col 0, score 1)
- [Event Bus Projections Architecture — L185](event-bus-projections-architecture.md#^ref-cf6b9b17-185-0) (line 185, col 0, score 1)
- [Exception Layer Analysis — L165](exception-layer-analysis.md#^ref-21d5cc09-165-0) (line 165, col 0, score 1)
- [Factorio AI with External Agents — L160](factorio-ai-with-external-agents.md#^ref-a4d90289-160-0) (line 160, col 0, score 1)
- [field-dynamics-math-blocks — L165](field-dynamics-math-blocks.md#^ref-7cfc230d-165-0) (line 165, col 0, score 1)
- [field-interaction-equations — L184](field-interaction-equations.md#^ref-b09141b7-184-0) (line 184, col 0, score 1)
- [field-node-diagram-outline — L132](field-node-diagram-outline.md#^ref-1f32c94a-132-0) (line 132, col 0, score 1)
- [Services — L10](chunks/services.md#^ref-75ea4a6a-10-0) (line 10, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L209](cross-language-runtime-polymorphism.md#^ref-c34c36a6-209-0) (line 209, col 0, score 1)
- [Event Bus MVP — L548](event-bus-mvp.md#^ref-534fe91d-548-0) (line 548, col 0, score 1)
- [Mongo Outbox Implementation — L552](mongo-outbox-implementation.md#^ref-9c1acd1e-552-0) (line 552, col 0, score 1)
- [prom-lib-rate-limiters-and-replay-api — L382](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-382-0) (line 382, col 0, score 1)
- [Promethean Event Bus MVP v0.1 — L913](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-913-0) (line 913, col 0, score 1)
- [State Snapshots API and Transactional Projector — L333](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-333-0) (line 333, col 0, score 1)
- [Stateful Partitions and Rebalancing — L527](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-527-0) (line 527, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L172](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-172-0) (line 172, col 0, score 1)
- [AI-Centric OS with MCP Layer — L424](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-424-0) (line 424, col 0, score 1)
- [aionian-circuit-math — L183](aionian-circuit-math.md#^ref-f2d83a77-183-0) (line 183, col 0, score 1)
- [api-gateway-versioning — L310](api-gateway-versioning.md#^ref-0580dcd3-310-0) (line 310, col 0, score 1)
- [Board Walk – 2025-08-11 — L149](board-walk-2025-08-11.md#^ref-7aa1eb92-149-0) (line 149, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L211](chroma-toolkit-consolidation-plan.md#^ref-5020e892-211-0) (line 211, col 0, score 1)
- [Diagrams — L23](chunks/diagrams.md#^ref-45cd25b5-23-0) (line 23, col 0, score 1)
- [DSL — L27](chunks/dsl.md#^ref-e87bc036-27-0) (line 27, col 0, score 1)
- [Math Fundamentals — L39](chunks/math-fundamentals.md#^ref-c6e87433-39-0) (line 39, col 0, score 1)
- [Shared — L28](chunks/shared.md#^ref-623a55f7-28-0) (line 28, col 0, score 1)
- [Simulation Demo — L29](chunks/simulation-demo.md#^ref-557309a3-29-0) (line 29, col 0, score 1)
- [Tooling — L14](chunks/tooling.md#^ref-6cb4943e-14-0) (line 14, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L231](cross-language-runtime-polymorphism.md#^ref-c34c36a6-231-0) (line 231, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L53](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-53-0) (line 53, col 0, score 1)
- [archetype-ecs — L457](archetype-ecs.md#^ref-8f4c1e86-457-0) (line 457, col 0, score 1)
- [JavaScript — L21](chunks/javascript.md#^ref-c1618c66-21-0) (line 21, col 0, score 1)
- [compiler-kit-foundations — L626](compiler-kit-foundations.md#^ref-01b21543-626-0) (line 626, col 0, score 1)
- [ecs-scheduler-and-prefabs — L412](ecs-scheduler-and-prefabs.md#^ref-c62a1815-412-0) (line 412, col 0, score 1)
- [Language-Agnostic Mirror System — L547](language-agnostic-mirror-system.md#^ref-d2b3628c-547-0) (line 547, col 0, score 1)
- [System Scheduler with Resource-Aware DAG — L407](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-407-0) (line 407, col 0, score 1)
- [template-based-compilation — L130](template-based-compilation.md#^ref-f8877e5e-130-0) (line 130, col 0, score 1)
- [typed-struct-compiler — L386](typed-struct-compiler.md#^ref-78eeedf7-386-0) (line 386, col 0, score 1)
- [archetype-ecs — L456](archetype-ecs.md#^ref-8f4c1e86-456-0) (line 456, col 0, score 1)
- [DSL — L18](chunks/dsl.md#^ref-e87bc036-18-0) (line 18, col 0, score 1)
- [JavaScript — L27](chunks/javascript.md#^ref-c1618c66-27-0) (line 27, col 0, score 1)
- [compiler-kit-foundations — L616](compiler-kit-foundations.md#^ref-01b21543-616-0) (line 616, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L198](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-198-0) (line 198, col 0, score 1)
- [Dynamic Context Model for Web Components — L408](dynamic-context-model-for-web-components.md#^ref-f7702bf8-408-0) (line 408, col 0, score 1)
- [ecs-scheduler-and-prefabs — L415](ecs-scheduler-and-prefabs.md#^ref-c62a1815-415-0) (line 415, col 0, score 1)
- [graph-ds — L380](graph-ds.md#^ref-6620e2f2-380-0) (line 380, col 0, score 1)
- [Interop and Source Maps — L519](interop-and-source-maps.md#^ref-cdfac40c-519-0) (line 519, col 0, score 1)
- [archetype-ecs — L459](archetype-ecs.md#^ref-8f4c1e86-459-0) (line 459, col 0, score 1)
- [JavaScript — L15](chunks/javascript.md#^ref-c1618c66-15-0) (line 15, col 0, score 1)
- [compiler-kit-foundations — L612](compiler-kit-foundations.md#^ref-01b21543-612-0) (line 612, col 0, score 1)
- [ecs-scheduler-and-prefabs — L414](ecs-scheduler-and-prefabs.md#^ref-c62a1815-414-0) (line 414, col 0, score 1)
- [graph-ds — L367](graph-ds.md#^ref-6620e2f2-367-0) (line 367, col 0, score 1)
- [template-based-compilation — L115](template-based-compilation.md#^ref-f8877e5e-115-0) (line 115, col 0, score 1)
- [Unique Info Dump Index — L98](unique-info-dump-index.md#^ref-30ec3ba6-98-0) (line 98, col 0, score 1)
- [zero-copy-snapshots-and-workers — L379](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-379-0) (line 379, col 0, score 1)
- [JavaScript — L26](chunks/javascript.md#^ref-c1618c66-26-0) (line 26, col 0, score 1)
- [Lisp-Compiler-Integration — L556](lisp-compiler-integration.md#^ref-cfee6d36-556-0) (line 556, col 0, score 1)
- [Unique Info Dump Index — L130](unique-info-dump-index.md#^ref-30ec3ba6-130-0) (line 130, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L15](promethean-copilot-intent-engine.md#^ref-ae24a280-15-0) (line 15, col 0, score 0.72)
- [Functional Refactor of TypeScript Document Processing — L146](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-146-0) (line 146, col 0, score 0.69)
- [Promethean Dev Workflow Update — L42](promethean-dev-workflow-update.md#^ref-03a5578f-42-0) (line 42, col 0, score 0.66)
- [api-gateway-versioning — L275](api-gateway-versioning.md#^ref-0580dcd3-275-0) (line 275, col 0, score 0.65)
- [Dynamic Context Model for Web Components — L176](dynamic-context-model-for-web-components.md#^ref-f7702bf8-176-0) (line 176, col 0, score 0.65)
- [Promethean Infrastructure Setup — L552](promethean-infrastructure-setup.md#^ref-6deed6ac-552-0) (line 552, col 0, score 0.65)
- [Agent Tasks: Persistence Migration to DualStore — L180](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-180-0) (line 180, col 0, score 0.64)
- [Math Fundamentals — L34](chunks/math-fundamentals.md#^ref-c6e87433-34-0) (line 34, col 0, score 1)
- [Services — L22](chunks/services.md#^ref-75ea4a6a-22-0) (line 22, col 0, score 1)
- [Shared — L29](chunks/shared.md#^ref-623a55f7-29-0) (line 29, col 0, score 1)
- [Simulation Demo — L23](chunks/simulation-demo.md#^ref-557309a3-23-0) (line 23, col 0, score 1)
- [Tooling — L16](chunks/tooling.md#^ref-6cb4943e-16-0) (line 16, col 0, score 1)
- [Window Management — L25](chunks/window-management.md#^ref-9e8ae388-25-0) (line 25, col 0, score 1)
- [compiler-kit-foundations — L627](compiler-kit-foundations.md#^ref-01b21543-627-0) (line 627, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L171](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-171-0) (line 171, col 0, score 1)
- [DuckDuckGoSearchPipeline — L16](duckduckgosearchpipeline.md#^ref-e979c50f-16-0) (line 16, col 0, score 1)
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
- [2d-sandbox-field — L225](2d-sandbox-field.md#^ref-c710dc93-225-0) (line 225, col 0, score 1)
- [Admin Dashboard for User Management — L49](admin-dashboard-for-user-management.md#^ref-2901a3e9-49-0) (line 49, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L150](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-150-0) (line 150, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L163](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-163-0) (line 163, col 0, score 1)
- [AI-First-OS-Model-Context-Protocol — L9](ai-first-os-model-context-protocol.md#^ref-618198f4-9-0) (line 9, col 0, score 1)
- [aionian-circuit-math — L179](aionian-circuit-math.md#^ref-f2d83a77-179-0) (line 179, col 0, score 1)
- [api-gateway-versioning — L304](api-gateway-versioning.md#^ref-0580dcd3-304-0) (line 304, col 0, score 1)
- [archetype-ecs — L479](archetype-ecs.md#^ref-8f4c1e86-479-0) (line 479, col 0, score 1)
- [balanced-bst — L295](balanced-bst.md#^ref-d3e7db72-295-0) (line 295, col 0, score 1)
- [AI-Centric OS with MCP Layer — L427](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-427-0) (line 427, col 0, score 1)
- [AI-First-OS-Model-Context-Protocol — L13](ai-first-os-model-context-protocol.md#^ref-618198f4-13-0) (line 13, col 0, score 1)
- [aionian-circuit-math — L158](aionian-circuit-math.md#^ref-f2d83a77-158-0) (line 158, col 0, score 1)
- [api-gateway-versioning — L288](api-gateway-versioning.md#^ref-0580dcd3-288-0) (line 288, col 0, score 1)
- [balanced-bst — L301](balanced-bst.md#^ref-d3e7db72-301-0) (line 301, col 0, score 1)
- [Board Automation Improvements — L10](board-automation-improvements.md#^ref-ac60a1d6-10-0) (line 10, col 0, score 1)
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
- [Admin Dashboard for User Management — L45](admin-dashboard-for-user-management.md#^ref-2901a3e9-45-0) (line 45, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L170](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-170-0) (line 170, col 0, score 1)
- [AI-Centric OS with MCP Layer — L416](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-416-0) (line 416, col 0, score 1)
- [AI-First-OS-Model-Context-Protocol — L11](ai-first-os-model-context-protocol.md#^ref-618198f4-11-0) (line 11, col 0, score 1)
- [aionian-circuit-math — L178](aionian-circuit-math.md#^ref-f2d83a77-178-0) (line 178, col 0, score 1)
- [api-gateway-versioning — L312](api-gateway-versioning.md#^ref-0580dcd3-312-0) (line 312, col 0, score 1)
- [balanced-bst — L297](balanced-bst.md#^ref-d3e7db72-297-0) (line 297, col 0, score 1)
- [Board Walk – 2025-08-11 — L131](board-walk-2025-08-11.md#^ref-7aa1eb92-131-0) (line 131, col 0, score 1)
- [Operations — L8](chunks/operations.md#^ref-f1add613-8-0) (line 8, col 0, score 1)
- [DSL — L26](chunks/dsl.md#^ref-e87bc036-26-0) (line 26, col 0, score 1)
- [ecs-scheduler-and-prefabs — L433](ecs-scheduler-and-prefabs.md#^ref-c62a1815-433-0) (line 433, col 0, score 1)
- [Event Bus MVP — L577](event-bus-mvp.md#^ref-534fe91d-577-0) (line 577, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L174](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-174-0) (line 174, col 0, score 1)
- [Local-Only-LLM-Workflow — L211](local-only-llm-workflow.md#^ref-9a8ab57e-211-0) (line 211, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L334](migrate-to-provider-tenant-architecture.md#^ref-54382370-334-0) (line 334, col 0, score 1)
- [Mongo Outbox Implementation — L581](mongo-outbox-implementation.md#^ref-9c1acd1e-581-0) (line 581, col 0, score 1)
- [observability-infrastructure-setup — L397](observability-infrastructure-setup.md#^ref-b4e64f8c-397-0) (line 397, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L48](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-48-0) (line 48, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L202](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-202-0) (line 202, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L138](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-138-0) (line 138, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L193](chroma-toolkit-consolidation-plan.md#^ref-5020e892-193-0) (line 193, col 0, score 1)
- [Diagrams — L43](chunks/diagrams.md#^ref-45cd25b5-43-0) (line 43, col 0, score 1)
- [Services — L41](chunks/services.md#^ref-75ea4a6a-41-0) (line 41, col 0, score 1)
- [eidolon-node-lifecycle — L62](eidolon-node-lifecycle.md#^ref-938eca9c-62-0) (line 62, col 0, score 1)
- [Event Bus MVP — L583](event-bus-mvp.md#^ref-534fe91d-583-0) (line 583, col 0, score 1)
- [Event Bus Projections Architecture — L182](event-bus-projections-architecture.md#^ref-cf6b9b17-182-0) (line 182, col 0, score 1)
- [Fnord Tracer Protocol — L266](fnord-tracer-protocol.md#^ref-fc21f824-266-0) (line 266, col 0, score 1)
- [i3-bluetooth-setup — L128](i3-bluetooth-setup.md#^ref-5e408692-128-0) (line 128, col 0, score 1)
- [layer-1-uptime-diagrams — L193](layer-1-uptime-diagrams.md#^ref-4127189a-193-0) (line 193, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L181](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-181-0) (line 181, col 0, score 1)
- [Diagrams — L50](chunks/diagrams.md#^ref-45cd25b5-50-0) (line 50, col 0, score 1)
- [DSL — L44](chunks/dsl.md#^ref-e87bc036-44-0) (line 44, col 0, score 1)
- [JavaScript — L48](chunks/javascript.md#^ref-c1618c66-48-0) (line 48, col 0, score 1)
- [Services — L43](chunks/services.md#^ref-75ea4a6a-43-0) (line 43, col 0, score 1)
- [Simulation Demo — L34](chunks/simulation-demo.md#^ref-557309a3-34-0) (line 34, col 0, score 1)
- [Tooling — L28](chunks/tooling.md#^ref-6cb4943e-28-0) (line 28, col 0, score 1)
- [Window Management — L38](chunks/window-management.md#^ref-9e8ae388-38-0) (line 38, col 0, score 1)
- [compiler-kit-foundations — L651](compiler-kit-foundations.md#^ref-01b21543-651-0) (line 651, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L263](cross-language-runtime-polymorphism.md#^ref-c34c36a6-263-0) (line 263, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L219](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-219-0) (line 219, col 0, score 1)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
