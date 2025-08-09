import type { World } from "./ecs";

export interface SystemContext {
  world: World;
  dt: number;
  time: number;
  resources?: Record<string, any>;
  cmd: any;
  stage: string;
}

export interface SystemSpec {
  name: string;
  stage?: string;
  query?: (world: World) => any;
  run(ctx: SystemContext): any;
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

  register(spec: SystemSpec) {
    this.systems.push(spec);
  }

  compile() {
    const stages: string[] = [];
    const batchesByStage = new Map<string, { systems: SystemSpec[] }[]>();
    for (const sys of this.systems) {
      const stage = sys.stage ?? "update";
      if (!stages.includes(stage)) stages.push(stage);
      let batches = batchesByStage.get(stage);
      if (!batches) {
        batches = [{ systems: [] }];
        batchesByStage.set(stage, batches);
      }
      batches[0].systems.push(sys);
    }
    this.plan = { stages, batchesByStage };
  }

  protected async runSystem(sys: SystemSpec, ctx: SystemContext) {
    await sys.run(ctx);
  }

  async runFrame(dt: number, time: number) {
    if (!this.plan) this.compile();
    const cmd = this.world.beginTick();
    try {
      for (const stage of this.plan!.stages) {
        const batches = this.plan!.batchesByStage.get(stage)!;
        for (const batch of batches) {
          for (const sys of batch.systems) {
            await this.runSystem(sys, {
              world: this.world,
              dt,
              time,
              resources: this.resources,
              cmd,
              stage,
            });
          }
        }
      }
    } finally {
      cmd.flush();
      this.world.endTick();
    }
  }
}
