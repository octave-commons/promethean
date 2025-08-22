import { getLogCollection } from './index.js';

export async function cleanupChromaLogs(
    days = Number(process.env.LOG_TTL_DAYS || 30),
    max = Number(process.env.LOG_MAX_CHROMA || 100000),
) {
    const col = await getLogCollection();
    if (!col) return { deleted: 0 };
    let deleted = 0;
    const cutoff = new Date(Date.now() - days * 86400 * 1000).toISOString();
    try {
        const old = await col.get({ where: { createdAt: { $lt: cutoff } }, include: ['ids'] });
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
                const all = await col.get({ include: ['ids', 'metadatas'] });
                const pairs = (all.ids || []).map((id, i) => ({
                    id,
                    createdAt: all.metadatas?.[i]?.createdAt,
                }));
                pairs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
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
