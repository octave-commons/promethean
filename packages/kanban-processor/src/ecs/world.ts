import { World } from "@promethean/ds/ecs.js";
import { Scheduler, ResourceBag } from "@promethean/ds/ecs.scheduler.js";

import { defineKanbanComponents } from "./components.js";
import {
  createFilesystemSystem,
  type FileEvent,
  type FileResources,
} from "./systems/filesystem.js";
import { createDiffSystem } from "./systems/diff.js";
import {
  createPersistenceSystem,
  type PersistenceResource,
  closePersistence,
} from "./systems/persistence.js";
import { createPublishSystem, createQueueSystem } from "./systems/publish.js";

export type KanbanWorldOptions = {
  boardPath: string;
  tasksPath: string;
  contextStore: any;
  getMongoClient: () => Promise<any>;
  broker: { publish(type: string, payload: any): void } | null;
  disabled?: boolean;
};

export type KanbanWorld = {
  enqueue(event: FileEvent): void;
  run(): Promise<void>;
  close(): Promise<void>;
  resources: ResourceBag;
  scheduler: Scheduler;
};

export function createKanbanWorld(options: KanbanWorldOptions): KanbanWorld {
  const world = new World();
  const scheduler = new Scheduler(world);
  const C = defineKanbanComponents(world);

  const cmd = world.beginTick();
  const entity = cmd.createEntity();
  cmd.add(entity, C.BoardSnapshot);
  cmd.add(entity, C.TaskDiff);
  cmd.add(entity, C.BrokerQueue);
  cmd.add(entity, C.PreviousCards);
  cmd.flush();
  world.endTick();

  const resources = scheduler.resourcesBag();
  const fsRes: FileResources = {
    queue: [],
    ignoreBoard: false,
    ignoreTasks: false,
    timers: [],
  };
  resources.define("fs", fsRes);
  resources.define("paths", {
    boardPath: options.boardPath,
    tasksPath: options.tasksPath,
  });
  resources.define("flags", { disable: options.disabled ?? false });
  const persistence: PersistenceResource = {
    context: options.contextStore,
    getMongoClient: options.getMongoClient,
    store: null,
    mongoClient: null,
    initPromise: null,
    lastVersion: 0,
  };
  resources.define("persistence", persistence);
  resources.define("broker", { client: options.broker });

  scheduler
    .register(
      createFilesystemSystem({ BoardSnapshot: C.BoardSnapshot }, entity),
    )
    .register(
      createDiffSystem(
        {
          BoardSnapshot: C.BoardSnapshot,
          TaskDiff: C.TaskDiff,
          PreviousCards: C.PreviousCards,
        },
        entity,
      ),
    )
    .register(createPersistenceSystem({ TaskDiff: C.TaskDiff }, entity))
    .register(
      createQueueSystem(
        { TaskDiff: C.TaskDiff, BrokerQueue: C.BrokerQueue },
        entity,
      ),
    )
    .register(createPublishSystem({ BrokerQueue: C.BrokerQueue }, entity));

  let lastTime = Date.now();
  async function run(time = Date.now()) {
    const dt = time - lastTime;
    lastTime = time;
    await scheduler.runFrame(dt, time, { parallel: false });
  }

  function enqueue(event: FileEvent) {
    fsRes.queue.push(event);
  }

  async function close() {
    for (const timer of fsRes.timers.splice(0)) clearTimeout(timer);
    await closePersistence(persistence);
  }

  return {
    enqueue,
    run,
    close,
    resources,
    scheduler,
  };
}
