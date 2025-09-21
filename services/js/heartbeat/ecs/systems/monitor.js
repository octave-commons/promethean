export function createMonitorSystem(world, components) {
  return {
    name: "heartbeat.monitor",
    stage: "late",
    reads: ["persistence", "timers", "processIndex", "outgoingEvents"],
    writes: ["timers", "processIndex", "outgoingEvents"],
    writesComponents: [components.MonitoredProcess, components.KillRequest],
    async run({ resources, cmd, time = Date.now() }) {
      const persistence = resources.get("persistence");
      if (!persistence.collection) return;
      const timers = resources.get("timers");
      const processIndex = resources.get("processIndex");
      const outgoing = resources.get("outgoingEvents");

      const now = time;
      if (now < timers.nextCheck) return;
      timers.nextCheck = now + timers.checkInterval;

      let stale = [];
      try {
        stale = await persistence.collection
          .find({
            last: { $lt: now - persistence.heartbeatTimeout },
            killedAt: { $exists: false },
          })
          .toArray();
      } catch (err) {
        console.error("heartbeat monitor query failed", err);
        return;
      }

      for (const doc of stale) {
        const pid = doc.pid;
        if (!pid) continue;
        let entity = processIndex.byPid.get(pid);
        if (!entity) {
          entity = cmd.createEntity();
          cmd.add(entity, components.MonitoredProcess, {
            pid,
            name: doc.name || "",
            sessionId: doc.sessionId || persistence.sessionId,
            lastHeartbeat: doc.last || 0,
          });
          processIndex.byPid.set(pid, entity);
        } else {
          cmd.set(entity, components.MonitoredProcess, {
            pid,
            name: doc.name || "",
            sessionId: doc.sessionId || persistence.sessionId,
            lastHeartbeat: doc.last || 0,
          });
        }

        const killData = {
          pid,
          requestedAt: now,
          reason: "stale",
        };
        if (world.has(entity, components.KillRequest)) {
          cmd.set(entity, components.KillRequest, killData);
        } else {
          cmd.add(entity, components.KillRequest, killData);
        }

        outgoing.events.push({
          type: "heartbeat.kill.requested",
          payload: { pid, name: doc.name, sessionId: doc.sessionId },
        });
      }
    },
  };
}
