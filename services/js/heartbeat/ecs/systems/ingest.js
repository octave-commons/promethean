import { getProcessMetrics } from "../helpers.js";

export function createHeartbeatIngestSystem(world, components) {
  return {
    name: "heartbeat.ingest",
    stage: "update",
    reads: [
      "incoming",
      "persistence",
      "processIndex",
      "service",
      "outgoingEvents",
    ],
    writes: ["incoming", "processIndex", "service", "outgoingEvents"],
    writesComponents: [
      components.MonitoredProcess,
      components.ProcessMetrics,
      components.KillRequest,
    ],
    async run({ resources, cmd }) {
      const queue = resources.get("incoming");
      if (!queue.events.length) return;

      const persistence = resources.get("persistence");
      if (!persistence.collection && persistence.initPromise) {
        await persistence.initPromise;
      }
      if (!persistence.collection) {
        return;
      }

      const processIndex = resources.get("processIndex");
      const service = resources.get("service");
      const outgoing = resources.get("outgoingEvents");

      const now = Date.now();
      const baseQueueLength = outgoing.events.length;
      const processUpdates = new Map();
      const metricUpdates = new Map();

      while (queue.events.length) {
        const event = queue.events.shift();
        if (!event) break;
        const pid = parseInt(event.pid, 10);
        const name = event.name;
        if (!pid || !name) continue;

        let existing = null;
        if (typeof persistence.collection.findOne === "function") {
          existing = await persistence.collection.findOne({
            pid,
            sessionId: persistence.sessionId,
          });
        } else {
          const docs = await persistence.collection
            .find({ pid, sessionId: persistence.sessionId })
            .toArray();
          existing = docs[0] ?? null;
        }

        if (!existing) {
          const allowed = persistence.allowedInstances[name] ?? Infinity;
          const count = await persistence.collection.countDocuments({
            name,
            sessionId: persistence.sessionId,
            last: { $gte: now - persistence.heartbeatTimeout },
            killedAt: { $exists: false },
          });
          if (count >= allowed) continue;
        }

        const metrics = await getProcessMetrics(pid);
        await persistence.collection.updateOne(
          { pid },
          {
            $set: {
              pid,
              last: now,
              name,
              sessionId: persistence.sessionId,
              ...metrics,
            },
            $unset: { killedAt: "" },
          },
          { upsert: true },
        );

        let entity = processIndex.byPid.get(pid);
        if (!entity) {
          entity = cmd.createEntity();
          cmd.add(entity, components.MonitoredProcess, {
            pid,
            name,
            sessionId: persistence.sessionId,
            lastHeartbeat: now,
          });
          cmd.add(entity, components.ProcessMetrics, metrics);
          processIndex.byPid.set(pid, entity);
        } else {
          processUpdates.set(entity, {
            pid,
            name,
            sessionId: persistence.sessionId,
            lastHeartbeat: now,
          });
          metricUpdates.set(entity, metrics);
        }

        if (world.has(entity, components.KillRequest)) {
          cmd.remove(entity, components.KillRequest);
        }

        outgoing.events.push({
          type: "heartbeat.received",
          payload: { pid, name, metrics, sessionId: persistence.sessionId },
        });
      }

      if (outgoing.events.length !== baseQueueLength) {
        service.dirty = true;
      }

      for (const [entity, data] of processUpdates) {
        cmd.set(entity, components.MonitoredProcess, data);
      }
      for (const [entity, data] of metricUpdates) {
        cmd.set(entity, components.ProcessMetrics, data);
      }
    },
  };
}
