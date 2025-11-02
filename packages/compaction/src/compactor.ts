// Module types resolved at runtime; loosen compile-time types here

import { sleep } from '@promethean-os/utils/sleep.js';

export type CompactorOptions = {
    topic: string;
    snapshotTopic: string;
    keySource?: (e: any) => string | undefined; // optional, if state events are not keyed
    intervalMs?: number; // how often to snapshot
    batchKeys?: string[]; // optional, restrict to a key set
};

export function startCompactor(store: any, bus: any, opts: CompactorOptions) {
    const every = opts.intervalMs ?? 30_000;

    let stopped = false;
    (async function loop() {
        while (!stopped) {
            try {
                const keys = opts.batchKeys;
                if (!store.latestByKey) throw new Error('latestByKey not supported by store');
                const latest = await store.latestByKey(opts.topic, keys ?? []);
                const entries = Object.entries(latest);
                if (entries.length === 0) {
                    await sleep(every);
                    continue;
                }

                for (const [key, rec] of entries) {
                    await bus.publish(
                        opts.snapshotTopic,
                        { key, payload: (rec as any)?.payload, ts: (rec as any)?.ts ?? Date.now() },
                        { key },
                    );
                }
            } catch (e) {
                // log and continue
            } finally {
                await sleep(every);
            }
        }
    })();

    return () => {
        stopped = true;
    };
}
