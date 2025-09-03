// SPDX-License-Identifier: GPL-3.0-only
// Loosen types to decouple cross-package declarations at build time
import { dlqTopic } from './types';

export async function replayDLQ(
    store: any,
    bus: any,
    topic: string,
    { limit = 1000, transform }: { limit?: number; transform?: (e: any) => any | void },
) {
    const dlq = dlqTopic(topic);
    const batch = await store.scan(dlq, { ts: 0, limit });
    for (const rec of batch) {
        const orig = (rec.payload as any)?.original as any;
        if (!orig) continue;
        const tweaked = transform ? transform(orig) || orig : orig;
        await bus.publish(tweaked.topic, tweaked.payload, {
            headers: tweaked.headers,
            key: tweaked.key,
            sid: tweaked.sid,
            caused_by: (tweaked.caused_by || []).concat(rec.id),
        });
    }
}
