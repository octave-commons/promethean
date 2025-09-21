import { join } from "path";

import { ContextStore } from "@promethean/persistence/contextStore.js";
import { getMongoClient } from "@promethean/persistence/clients.js";
import type { MongoClient } from "mongodb";
// @ts-ignore legacy broker typing
import { BrokerClient } from "@promethean/legacy/brokerClient.js";

import { createKanbanWorld } from "./ecs/world.js";
import { EVENTS, type FileResources } from "./ecs/systems/filesystem.js";

const defaultRepoRoot = process.env.REPO_ROOT || "";

export type KanbanProcessorHandle = {
  close(): Promise<void>;
  world: ReturnType<typeof createKanbanWorld>;
  broker: any;
};

export function startKanbanProcessor(
  repoRoot = defaultRepoRoot,
): KanbanProcessorHandle {
  const boardPath = join(repoRoot, "docs", "agile", "boards", "kanban.md");
  const tasksPath = join(repoRoot, "docs", "agile", "tasks");

  const ctx = new ContextStore();
  const brokerUrl = process.env.BROKER_URL || "ws://localhost:7000";
  const broker = new BrokerClient({ url: brokerUrl, id: "kanban-processor" });

  const world = createKanbanWorld({
    boardPath,
    tasksPath,
    contextStore: ctx,
    getMongoClient: () => getMongoClient() as Promise<MongoClient>,
    broker,
    disabled: process.env.KANBAN_DISABLE_PROCESS === "1",
  });

  const QUEUE = "kanban-processor";
  let running = Promise.resolve();

  const drain = () => {
    running = running.then(async () => {
      const fsRes = world.resources.get("fs") as FileResources;
      while (fsRes.queue.length) {
        await world.run();
      }
    });
    return running;
  };

  broker
    .connect()
    .then(() => {
      broker.subscribe(EVENTS.boardChange, () => {
        broker.enqueue(QUEUE, { kind: "board" });
      });
      broker.subscribe(EVENTS.taskAdd, () => {
        broker.enqueue(QUEUE, { kind: "tasks" });
      });
      broker.subscribe(EVENTS.taskChange, () => {
        broker.enqueue(QUEUE, { kind: "tasks" });
      });
      broker.ready(QUEUE);
      console.log("kanban processor connected to broker");
    })
    .catch((err: unknown) => console.error("broker connect failed", err));

  broker.onTaskReceived((task: any) => {
    const kind = task.payload?.kind === "tasks" ? "tasks" : "board";
    world.enqueue({ kind });
    drain()
      .catch((err) => console.error("kanban frame failed", err))
      .finally(() => {
        broker.ack(task.id);
        broker.ready(QUEUE);
      });
  });

  return {
    async close() {
      broker.socket?.close();
      await world.close();
    },
    world,
    broker,
  };
}

if (process.env.NODE_ENV !== "test") {
  startKanbanProcessor();
  console.log("Kanban processor running...");
}
