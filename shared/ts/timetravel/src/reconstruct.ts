import type { MongoEventStore } from '@promethean/event/mongo.js';
import type { EventRecord } from '@promethean/event/types.js';

export interface ReconstructOpts<T = any> {
    topic: string; // e.g., "process.state"
    snapshotTopic?: string; // e.g., "process.state.snapshot" (optional)
    key: string; // entity key
    atTs: number; // target timestamp (epoch ms)
    apply: (prev: T | null, e: EventRecord<T>) => T | null; // reducer: apply event->state
    fetchSnapshot?: (key: string, upTo: number) => Promise<{ state: T | null; ts: number } | null>;
}

export async function reconstructAt<T = any>(store: MongoEventStore, opts: ReconstructOpts<T>) {
    let baseState: T | null = null;
    let baseTs = 0;

    // optional snapshot as baseline
    if (opts.fetchSnapshot) {
        const snap = await opts.fetchSnapshot(opts.key, opts.atTs);
        if (snap) {
            baseState = snap.state;
            baseTs = snap.ts;
        }
    }

    // scan events after baseline up to atTs
    const events = await store.scan(opts.topic, { ts: baseTs, limit: 1_000_000 });
    for (const e of events) {
        if (e.ts > opts.atTs) break;
        if (e.key !== opts.key) continue;
        baseState = opts.apply(baseState, e as EventRecord<T>);
        baseTs = e.ts;
    }
    return { state: baseState, ts: baseTs };
}
