import { World } from "@promethean/ds/ecs.js";
import { Scheduler } from "@promethean/ds/ecs.scheduler.js";

import { defineHeartbeatComponents } from "./components.js";
import {
  createPersistenceSystem,
  closePersistence,
} from "./systems/persistence.js";
import { createHeartbeatIngestSystem } from "./systems/ingest.js";
import { createMonitorSystem } from "./systems/monitor.js";
import { createKillSystem } from "./systems/kill.js";
import { createQueueSystem, createPublishSystem } from "./systems/publish.js";

export function createHeartbeatWorld(options) {
  const world = new World();
  const scheduler = new Scheduler(world);
  const components = defineHeartbeatComponents(world);

  const cmd = world.beginTick();
  const serviceEntity = cmd.createEntity();
  cmd.add(serviceEntity, components.BrokerQueue);
  cmd.flush();
  world.endTick();

  const resources = scheduler.resourcesBag();
  resources
    .define("incoming", { events: [] })
    .define("persistence", {
      sessionId: options.sessionId,
      allowedInstances: options.allowedInstances,
      heartbeatTimeout: options.heartbeatTimeout,
      dbName: options.dbName,
      collectionName: options.collectionName,
      getMongoClient: options.getMongoClient,
      client: null,
      collection: null,
      initPromise: null,
    })
    .define("processIndex", { byPid: new Map() })
    .define("service", { entity: serviceEntity, dirty: false })
    .define("timers", {
      nextCheck: Date.now(),
      checkInterval: options.checkInterval,
    })
    .define("outgoingEvents", { events: [] })
    .define("broker", { client: options.broker, lastPublishedVersion: 0 });

  scheduler
    .register(createPersistenceSystem())
    .register(createHeartbeatIngestSystem(world, components))
    .register(createMonitorSystem(world, components))
    .register(createKillSystem(world, components))
    .register(createQueueSystem(components))
    .register(createPublishSystem(components));

  let lastTime = Date.now();
  async function run(time = Date.now()) {
    const dt = time - lastTime;
    lastTime = time;
    await scheduler.runFrame(dt, time, { parallel: false });
  }

  function enqueueHeartbeat(event) {
    resources.get("incoming").events.push(event);
  }

  async function forceMonitor(time = Date.now()) {
    const timers = resources.get("timers");
    timers.nextCheck = Math.min(timers.nextCheck, time);
    await run(time);
    await run(time + 1);
  }

  async function close() {
    await closePersistence(resources.get("persistence"));
  }

  async function cleanup() {
    const persistence = resources.get("persistence");
    if (!persistence.collection) return;
    try {
      await persistence.collection.updateMany(
        { sessionId: persistence.sessionId, killedAt: { $exists: false } },
        { $set: { killedAt: Date.now() } },
      );
    } catch (err) {
      console.error("heartbeat cleanup failed", err);
    }
  }

  return {
    world,
    scheduler,
    resources,
    run,
    enqueueHeartbeat,
    forceMonitor,
    close,
    cleanup,
  };
}
