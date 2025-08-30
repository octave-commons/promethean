import { MongoEventStore } from '@promethean/event/mongo.js';
import { EventBus, EventRecord } from '@promethean/event/types.js';
import { dlqTopic } from './types';

export async function replayDLQ(
    store: MongoEventStore,
    bus: EventBus,
    topic: string,
    { limit = 1000, transform }: { limit?: number; transform?: (e: EventRecord) => EventRecord | void },
) {
    const dlq = dlqTopic(topic);
    const batch = await store.scan(dlq, { ts: 0, limit });
    for (const rec of batch) {
        const orig = (rec.payload as any)?.original as EventRecord;
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
