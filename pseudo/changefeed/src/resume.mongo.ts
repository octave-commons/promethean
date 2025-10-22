import type { Db, ResumeToken } from 'mongodb';

/** Persisted resume token storage. */
export type ResumeTokenStore = {
    load(): Promise<ResumeToken | null>;
    save(token: ResumeToken): Promise<void>;
};

/**
 * Factory for a MongoDB-backed resume token store.
 * @param db - Mongo database instance.
 * @param key - Document key under the changefeed_tokens collection.
 */
export function tokenStore(db: Db, key = 'changefeed:default'): ResumeTokenStore {
    const coll = db.collection<{ _id: string; token: ResumeToken }>('changefeed_tokens');
    return {
        async load(): Promise<ResumeToken | null> {
            const d = await coll.findOne({ _id: key }, { projection: { token: 1 } });
            return d?.token ?? null;
        },
        async save(token: ResumeToken): Promise<void> {
            await coll.updateOne({ _id: key }, { $set: { token } }, { upsert: true });
        },
    };
}
