import { contextStore } from "../sinks.js";
import type { ChromaCleanupResult, ChromaCollection } from "../types/agents.js";

const DAY_MS = 24 * 60 * 60 * 1000;

function resolveCollection(): ChromaCollection | null {
  try {
    const { chromaCollection } = contextStore.getCollection("bridge_logs") as {
      chromaCollection?: ChromaCollection;
    };
    return chromaCollection ?? null;
  } catch {
    return null;
  }
}

async function removeEntriesOlderThan(
  collection: ChromaCollection,
  cutoff: number,
): Promise<number> {
  try {
    const result = await collection.get({
      where: { timestamp: { $lt: cutoff } },
    });
    const ids = result.ids ?? [];
    if (!ids.length) return 0;
    await collection.delete({ ids });
    return ids.length;
  } catch {
    return 0;
  }
}

function sortByTimestamp(
  ids: string[],
  timestamps: Array<{ timestamp?: number }> = [],
) {
  return ids
    .map((id, index) => ({
      id,
      timestamp: timestamps[index]?.timestamp ?? 0,
    }))
    .sort((a, b) => a.timestamp - b.timestamp)
    .map((entry) => entry.id);
}

async function removeExcessEntries(
  collection: ChromaCollection,
  max: number,
): Promise<number> {
  if (max <= 0) return 0;
  try {
    const count = await collection.count();
    if (count <= max) return 0;
    const all = await collection.get({ include: ["metadatas"] });
    const orderedIds = sortByTimestamp(all.ids ?? [], all.metadatas ?? []);
    const toDelete = orderedIds.slice(0, Math.max(0, count - max));
    if (!toDelete.length) return 0;
    await collection.delete({ ids: toDelete });
    return toDelete.length;
  } catch {
    return 0;
  }
}

export async function cleanupChromaLogs(
  days = Number(process.env.LOG_TTL_DAYS || 30),
  max = Number(process.env.LOG_MAX_CHROMA || 100000),
): Promise<ChromaCleanupResult> {
  const collection = resolveCollection();
  if (!collection) return { deleted: 0 };
  const cutoff = Date.now() - days * DAY_MS;
  const removedByAge = await removeEntriesOlderThan(collection, cutoff);
  const removedByCapacity = await removeExcessEntries(collection, max);
  return { deleted: removedByAge + removedByCapacity };
}

export function scheduleChromaCleanup(): void {
  const days = Number(process.env.LOG_TTL_DAYS || 30);
  const max = Number(process.env.LOG_MAX_CHROMA || 100000);
  const run = () => {
    cleanupChromaLogs(days, max).catch(() => {});
  };
  run();
  setInterval(run, DAY_MS);
}
