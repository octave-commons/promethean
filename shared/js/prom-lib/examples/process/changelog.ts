import type { Db } from "mongodb";
import { EventBus } from "../../event/types";
import { startChangelogProjector } from "../../projectors/changelog";

export async function startProcessChangelog(db: Db, bus: EventBus) {
  return startChangelogProjector(db, bus, {
    topic: "process.state",
    collection: "processes",
    keyOf: (e) => (e.payload as any)?.processId,
    map: (e) => {
      const p = e.payload as any;
      return {
        processId: p.processId,
        name: p.name,
        host: p.host,
        pid: p.pid,
        sid: p.sid,
        cpu_pct: p.cpu_pct,
        mem_mb: p.mem_mb,
        status: p.status,
        last_seen_ts: p.last_seen_ts,
      };
    },
    indexes: [{ keys: { host: 1, name: 1 } }, { keys: { status: 1 } }],
  });
}
