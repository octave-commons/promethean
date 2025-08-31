// @ts-nocheck
import { contextStore } from "../sinks.js";

export async function cleanupChromaLogs(
  days = Number(process.env.LOG_TTL_DAYS || 30),
  max = Number(process.env.LOG_MAX_CHROMA || 100000),
) {
  let col;
  try {
    col = contextStore.getCollection("bridge_logs").chromaCollection;
  } catch {
    return { deleted: 0 };
  }
  let deleted = 0;
  const cutoff = Date.now() - days * 86400 * 1000;
  try {
    const old = await col.get({
      where: { timestamp: { $lt: cutoff } },
      include: ["ids"],
    });
    if (old?.ids?.length) {
      await col.delete({ ids: old.ids });
      deleted += old.ids.length;
    }
  } catch {}

  if (max > 0) {
    try {
      const count = await col.count();
      if (count > max) {
        const excess = count - max;
        const all = await col.get({ include: ["ids", "metadatas"] });
        const pairs = (all.ids || []).map((id, i) => ({
          id,
          timestamp: all.metadatas?.[i]?.timestamp,
        }));
        pairs.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
        const toDelete = pairs.slice(0, excess).map((p) => p.id);
        if (toDelete.length) {
          await col.delete({ ids: toDelete });
          deleted += toDelete.length;
        }
      }
    } catch {}
  }
  return { deleted };
}

export function scheduleChromaCleanup() {
  const days = Number(process.env.LOG_TTL_DAYS || 30);
  const max = Number(process.env.LOG_MAX_CHROMA || 100000);
  const run = () => cleanupChromaLogs(days, max).catch(() => {});
  run();
  setInterval(run, 24 * 60 * 60 * 1000);
}
