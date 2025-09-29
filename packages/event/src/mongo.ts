import type { Collection, Db, IndexSpecification } from 'mongodb';

import type { EventRecord, EventStore, CursorStore, CursorPosition, UUID } from './types.js';
import { InMemoryEventBus } from './memory.js';

export class MongoEventStore implements EventStore {
    private coll: Collection<EventRecord>;
    constructor(db: Db, collectionName = 'events') {
        this.coll = db.collection<EventRecord>(collectionName);
    }
    static async ensureIndexes(db: Db, name = 'events'): Promise<void> {
        const coll = db.collection(name);
        const idx: Array<{ key: IndexSpecification; unique?: boolean }> = [
            { key: { topic: 1, ts: 1, id: 1 } },
            { key: { topic: 1, key: 1, ts: -1 } }, // supports compaction queries
            { key: { id: 1 }, unique: true },
            { key: { 'headers.correlationId': 1 } },
        ];
        await Promise.all(idx.map((i) => coll.createIndex(i.key, { unique: i.unique })));
    }
    async insert<T>(e: EventRecord<T>): Promise<void> {
        await this.coll.insertOne(e as EventRecord);
    }
    async scan(topic: string, params: { afterId?: UUID; ts?: number; limit?: number }): Promise<EventRecord[]> {
        const q: Record<string, unknown> = { topic };
        if (params.afterId) q.id = { $gt: params.afterId };
        if (params.ts) q.ts = { $gte: params.ts };
        const cur = this.coll
            .find(q)
            .sort({ ts: 1, id: 1 })
            .limit(params.limit ?? 1000);
        return cur.toArray();
    }
    async latestByKey(topic: string, keys: string[]): Promise<Record<string, EventRecord | undefined>> {
        const baseEntries = keys.map((key) => [key, undefined] as const);
        const out = Object.fromEntries(baseEntries) as Record<string, EventRecord | undefined>;
        const cur = this.coll.aggregate<{ _id: string; doc: EventRecord }>([
            { $match: { topic, key: { $in: keys } } },
            { $sort: { key: 1, ts: -1, id: -1 } },
            { $group: { _id: '$key', doc: { $first: '$$ROOT' } } },
        ]);
        for await (const { _id, doc } of cur) out[_id] = doc;
        return out;
    }
}

export class MongoCursorStore implements CursorStore {
    private coll: Collection<CursorPosition & { _id: string }>;
    constructor(db: Db, collectionName = 'cursors') {
        this.coll = db.collection(collectionName);
        this.coll.createIndex({ _id: 1 }, { unique: true }).catch(() => {});
    }
    key(t: string, g: string): string {
        return `${t}::${g}`;
    }
    async get(topic: string, group: string): Promise<CursorPosition | null> {
        const doc = await this.coll.findOne({ _id: this.key(topic, group) });
        if (!doc) return null;
        const { _id, ...rest } = doc;
        return rest as CursorPosition;
    }
    async set(topic: string, group: string, cursor: CursorPosition): Promise<void> {
        await this.coll.updateOne({ _id: this.key(topic, group) }, { $set: cursor }, { upsert: true });
    }
}

// Quick composition (drop-in replacement for InMemoryEventBus)
export class MongoEventBus extends InMemoryEventBus {}
