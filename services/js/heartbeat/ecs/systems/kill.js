export function createKillSystem(world, components) {
  const query = world.makeQuery({
    all: [components.KillRequest, components.MonitoredProcess],
  });
  return {
    name: "heartbeat.kill",
    stage: "render",
    reads: ["persistence", "processIndex", "outgoingEvents"],
    writes: ["processIndex", "outgoingEvents"],
    writesComponents: [components.KillRequest],
    async run({ world: w, resources, cmd }) {
      const persistence = resources.get("persistence");
      if (!persistence.collection) return;
      const processIndex = resources.get("processIndex");
      const outgoing = resources.get("outgoingEvents");

      for (const [entity, get] of w.iter(query)) {
        const proc = get(components.MonitoredProcess);
        const req = get(components.KillRequest);
        if (!proc || !req) continue;

        const pid = proc.pid;
        let killed = false;
        try {
          try {
            process.kill(pid, 0);
          } catch (err) {
            if (err && err.code === "ESRCH") {
              killed = true;
            } else {
              throw err;
            }
          }
          if (!killed) {
            process.kill(pid, "SIGKILL");
            killed = true;
          }
        } catch (err) {
          console.error(`failed to kill pid ${pid}`, err);
        }

        try {
          await persistence.collection.updateOne(
            { pid },
            { $set: { killedAt: req.requestedAt } },
          );
        } catch (err) {
          console.error("failed to mark kill in persistence", err);
        }

        outgoing.events.push({
          type: "heartbeat.killed",
          payload: { pid, name: proc.name, sessionId: proc.sessionId, killed },
        });

        cmd.remove(entity, components.KillRequest);
        processIndex.byPid.delete(pid);
        cmd.destroyEntity(entity);
      }
    },
  };
}
