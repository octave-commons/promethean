import { dlqTopic } from './types.js';
import type { DeadLetterEvent, DLQBus, DLQRecord, DLQStore, StoredRecord } from './types.js';

type ReplayTransform = (event: DeadLetterEvent) => DeadLetterEvent | void;

type ReplayOptions = Readonly<{
    limit?: number;
    transform?: ReplayTransform;
}>;

const isDlqRecord = (value: unknown): value is DLQRecord => {
    if (typeof value !== 'object' || value === null) return false;
    const candidate = value as { readonly original?: unknown; readonly topic?: unknown };
    if (typeof candidate.topic !== 'string') return false;
    const original = candidate.original as DeadLetterEvent | undefined;
    return typeof original === 'object' && original !== null && typeof original.topic === 'string';
};

const republishSequentially = async (
    bus: DLQBus,
    records: ReadonlyArray<StoredRecord>,
    transform?: ReplayTransform,
    index = 0,
): Promise<void> => {
    if (index >= records.length) return;
    const record = records[index];
    if (!record) return;
    const payload = record.payload;
    if (isDlqRecord(payload) && payload.original) {
        const tweaked = transform?.(payload.original) ?? payload.original;
        const causedBy = [...(tweaked.caused_by ?? []), record.id];
        await bus.publish(tweaked.topic, tweaked.payload, {
            headers: tweaked.headers,
            key: tweaked.key,
            sid: tweaked.sid,
            caused_by: causedBy,
        });
    }
    await republishSequentially(bus, records, transform, index + 1);
};

export async function replayDLQ(
    store: DLQStore,
    bus: DLQBus,
    topic: string,
    { limit = 1000, transform }: ReplayOptions = {},
): Promise<void> {
    const dlq = dlqTopic(topic);
    const batch = await store.scan(dlq, { ts: 0, limit });
    await republishSequentially(bus, batch, transform);
}
