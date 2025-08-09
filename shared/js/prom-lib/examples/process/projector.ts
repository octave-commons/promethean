import { EventBus } from "../../event/types";
import { Topics } from "../../event/config";
import { HeartbeatPayload, ProcessState } from "./types";

const STALE_MS = 15_000;

export async function startProcessProjector(bus: EventBus) {
  const cache = new Map<string, ProcessState>(); // in-memory; replace with Mongo if you want persistence

  function keyOf(h: HeartbeatPayload) {
    return `${h.host}:${h.name}:${h.pid}`;
  }

  async function publishState(ps: ProcessState) {
    await bus.publish(Topics.ProcessState.name, ps, { key: ps.processId });
  }

  // subscriber
  await bus.subscribe(
    Topics.HeartbeatReceived.name,
    "process-projector",
    async (e) => {
      const hb = e.payload as HeartbeatPayload;
      const k = keyOf(hb);
      const ps: ProcessState = {
        processId: k,
        name: hb.name,
        host: hb.host,
        pid: hb.pid,
        sid: hb.sid,
        cpu_pct: hb.cpu_pct,
        mem_mb: hb.mem_mb,
        last_seen_ts: e.ts,
        status: "alive",
      };
      cache.set(k, ps);
      await publishState(ps);
    },
    { from: "earliest" },
  );

  // staleness scanner
  const t = setInterval(async () => {
    const now = Date.now();
    for (const [k, ps] of cache) {
      const status = now - ps.last_seen_ts > STALE_MS ? "stale" : "alive";
      if (status !== ps.status) {
        ps.status = status;
        await publishState(ps);
      }
    }
  }, 5_000);

  return () => clearInterval(t);
}
