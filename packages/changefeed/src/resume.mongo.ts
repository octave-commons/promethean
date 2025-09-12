import type { Db, ResumeToken } from 'mongodb';

export type ResumeTokenStore = {
    load(): Promise<ResumeToken | null>;
    save(token: ResumeToken): Promise<void>;
};

export function tokenStore(db: Db, key = 'changefeed:default'): ResumeTokenStore {
    const coll = db.collection<{ _id: string; token: ResumeToken }>('changefeed_tokens');
    return {
        async load(): Promise<ResumeToken | null> {
            const d = await coll.findOne({ _id: key });
            return d?.token ?? null;
        },
        async save(token: ResumeToken): Promise<void> {
            await coll.updateOne({ _id: key }, { $set: { token } }, { upsert: true });
        },
    };
}
