import { EventBus } from "../../event/types";

export async function startProcessProjector(bus: EventBus) {
  return bus.subscribe(
    "heartbeat.received",
    "process-projector",
    async (e) => {
      const p = e.payload as any;
      await bus.publish(
        "process.state",
        {
          processId: `${p.host}-${p.pid}`,
          name: p.name,
          host: p.host,
          pid: p.pid,
          sid: p.sid,
          cpu_pct: p.cpu_pct,
          mem_mb: p.mem_mb,
          last_seen_ts: e.ts,
          status: "alive",
        },
        { key: `${p.host}-${p.pid}` },
      );
    },
    { from: "earliest", manualAck: false },
  );
}
