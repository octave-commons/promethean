import type { World } from "./ecs";

export interface SystemContext {
  world: World;
  dt: number;
  time: number;
  resources: Record<string, any>;
  cmd: { flush(): void };
  stage: string;
}

export interface SystemSpec {
  name: string;
  stage?: string;
  query?: (w: World) => { all: any[] };
  run(ctx: SystemContext): void | Promise<void>;
}

export class Scheduler {
  protected world: World;
  protected systems: SystemSpec[] = [];
  protected resources: Record<string, any> = {};
  protected plan?: {
    stages: string[];
    batchesByStage: Map<string, { systems: SystemSpec[] }[]>;
  };

  constructor(world: World) {
    this.world = world;
  }

  register(sys: SystemSpec) {
    this.systems.push(sys);
  }

  compile() {
    const stages = ["startup", "update", "late", "render", "cleanup"];
    const batchesByStage = new Map<string, { systems: SystemSpec[] }[]>();
    for (const stage of stages) batchesByStage.set(stage, [{ systems: [] }]);
    for (const s of this.systems) {
      const st = s.stage ?? "update";
      const arr = batchesByStage.get(st);
      if (!arr) batchesByStage.set(st, [{ systems: [s] }]);
      else arr[0].systems.push(s);
    }
    const activeStages = stages.filter(
      (st) => (batchesByStage.get(st)?.[0].systems.length ?? 0) > 0,
    );
    this.plan = { stages: activeStages, batchesByStage };
  }

  protected async runSystem(sys: SystemSpec, ctx: SystemContext) {
    await sys.run(ctx);
  }

  async runFrame(dt: number, time: number) {
    if (!this.plan) this.compile();
    const cmd = { flush() {} };
    for (const stage of this.plan!.stages) {
      const batches = this.plan!.batchesByStage.get(stage)!;
      for (const batch of batches) {
        for (const s of batch.systems) {
          await this.runSystem(s, {
            world: this.world,
            dt,
            time,
            resources: this.resources,
            cmd,
            stage: s.stage ?? "update",
          });
        }
      }
    }
  }
}
