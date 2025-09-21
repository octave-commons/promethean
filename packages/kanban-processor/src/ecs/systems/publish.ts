import type {
  SystemSpec,
  SystemContext,
} from "@promethean/ds/ecs.scheduler.js";

export type BrokerResource = {
  client: { publish(type: string, payload: any): void } | null;
};

type BrokerQueueComponent = {
  lastVersion: number;
  pending: { type: string; payload: any }[];
};

export function createQueueSystem(
  components: { TaskDiff: any; BrokerQueue: any },
  entity: number,
): SystemSpec {
  return {
    name: "kanban.queue",
    stage: "render",
    readsComponents: [components.TaskDiff, components.BrokerQueue],
    writesComponents: [components.BrokerQueue],
    run({ world, cmd }: SystemContext) {
      const diff = world.get(entity, components.TaskDiff) as
        | { version: number; events: { type: string; payload: any }[] }
        | undefined;
      if (!diff || diff.version === 0) return;

      const queue =
        (world.get(entity, components.BrokerQueue) as
          | BrokerQueueComponent
          | undefined) || components.BrokerQueue.defaults?.();
      if (!queue) return;
      if (queue.lastVersion === diff.version) return;

      cmd.set(entity, components.BrokerQueue, {
        lastVersion: diff.version,
        pending: diff.events.slice(),
      });
    },
  };
}

export function createPublishSystem(
  components: { BrokerQueue: any },
  entity: number,
): SystemSpec {
  return {
    name: "kanban.publish",
    stage: "cleanup",
    reads: ["broker"],
    writesComponents: [components.BrokerQueue],
    async run({ resources, world, cmd }: SystemContext) {
      const queue = world.get(entity, components.BrokerQueue) as
        | BrokerQueueComponent
        | undefined;
      if (!queue || queue.pending.length === 0) return;

      const broker = resources.get("broker") as BrokerResource;
      if (!broker.client) return;

      for (const event of queue.pending) {
        try {
          broker.client.publish(event.type, event.payload);
        } catch (err) {
          console.error("kanban publish failed", err);
        }
      }

      cmd.set(entity, components.BrokerQueue, {
        lastVersion: queue.lastVersion,
        pending: [],
      });
    },
  };
}
