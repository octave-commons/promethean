---
uuid: 004a0f06-3808-4421-b9e1-41b5b41ebcb8
created_at: ecs-offload-workers.md
filename: ecs-offload-workers
title: ecs-offload-workers
description: >-
  A portable worker pool for ECS systems that runs in parallel across Node.js
  and browsers, using pure functions and patches to update the ECS world safely.
tags:
  - ecs
  - worker
  - parallel
  - portable
  - patches
  - node
  - browser
  - safe
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
^ref-6498b9d7-149-0 ^ref-6498b9d7-151-0

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
^ref-6498b9d7-187-0 ^ref-6498b9d7-194-0

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
^ref-6498b9d7-427-0
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
* a **timeline tracer** that measures per-system worker time and renders a Gantt chart.
