import type { Db, ResumeToken } from 'mongodb';

export function tokenStore(db: Db, key = 'changefeed:default') {
    const coll = db.collection<{ _id: string; token: any }>('changefeed_tokens');
    return {
        async load(): Promise<ResumeToken | null> {
            const d = await coll.findOne({ _id: key });
            return (d?.token as any) ?? null;
        },
        async save(token: ResumeToken) {
            await coll.updateOne({ _id: key }, { $set: { token } }, { upsert: true });
        },
    };
}
