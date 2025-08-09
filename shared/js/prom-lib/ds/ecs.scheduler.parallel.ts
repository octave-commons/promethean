import { Scheduler, SystemSpec, SystemContext } from "./ecs.scheduler";
import { applyPatches, Patch } from "./ecs.patches";
import { createPortablePool, WorkerPool } from "../worker/pool";
import type { World, ComponentType } from "./ecs";

export type OffloadSpec = {
  nodeModule?: string;
  browserJobName?: string;
  reads: ComponentType<any>[];
  writes?: ComponentType<any>[];
  extra?: (ctx: SystemContext) => any;
};

export interface OffloadableSystem extends SystemSpec {
  offload: OffloadSpec;
}

export class ParallelScheduler extends Scheduler {
  private pool!: WorkerPool;
  private ready = false;

  async initPool(opts?: {
    size?: number;
    browserWorkers?: Record<string, () => Worker>;
  }) {
    this.pool = await createPortablePool(opts);
    this.ready = true;
  }

  protected async runSystem(sys: SystemSpec, ctx: SystemContext) {
    const as = sys as OffloadableSystem;
    if (!("offload" in as)) return super.runSystem(sys, ctx);

    if (!this.ready) await this.initPool();

    const q = sys.query
      ? this.world.makeQuery(sys.query(this.world))
      : undefined;
    const eids: number[] = [];
    const cols: Record<number, any[]> = {};
    for (const c of as.offload.reads.concat(as.offload.writes ?? []))
      cols[c.id] = [];

    if (q) {
      for (const [e] of this.world.iter(q)) {
        eids.push(e);
        for (const c of as.offload.reads.concat(as.offload.writes ?? []))
          cols[c.id].push(this.world.get(e, c));
      }
    }

    const payload = {
      eids,
      cols,
      dt: ctx.dt,
      time: ctx.time,
      writes: (as.offload.writes ?? []).map((c) => c.id),
      extra: as.offload.extra?.(ctx),
    };

    const jobId =
      typeof window !== "undefined"
        ? as.offload.browserJobName ?? as.name
        : as.offload.nodeModule ?? as.name;

    const patches = (await this.pool.run(jobId, payload)) as Patch[];
    if (patches && patches.length) applyPatches(this.world, patches);
  }

  async runFrame(dt: number, time: number, opts: { parallel?: boolean } = {}) {
    if (!this["plan"]) this.compile();
    const cmd = this["world"].beginTick();
    const plan = this["plan"]!;

    const call = (s: SystemSpec) =>
      this.runSystem(s, {
        world: this["world"],
        dt,
        time,
        resources: this["resources"],
        cmd,
        stage: s.stage ?? "update",
      });

    try {
      for (const stage of plan.stages) {
        const batches = plan.batchesByStage.get(stage)!;
        for (const batch of batches) {
          if (opts.parallel ?? true) await Promise.all(batch.systems.map(call));
          else for (const s of batch.systems) await call(s);
        }
      }
    } finally {
      cmd.flush();
      this["world"].endTick();
    }
  }

  async close() {
    if (this.ready) await this.pool.close();
  }
}
