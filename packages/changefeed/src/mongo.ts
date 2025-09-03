// SPDX-License-Identifier: GPL-3.0-only
// @ts-nocheck
import type { Db, ResumeToken } from 'mongodb';
import { EventBus } from '@promethean/event/types.js';

export interface ChangefeedOptions {
    collection: string;
    topic: string;
    fullDocument?: 'updateLookup' | 'whenAvailable'; // default "updateLookup"
    resumeTokenStore?: {
        load(): Promise<ResumeToken | null>;
        save(tok: ResumeToken): Promise<void>;
    };
    filter?: (doc: any) => boolean; // drop noisy changes if needed
    map?: (doc: any) => any; // transform doc->payload
}

export async function startMongoChangefeed(db: Db, bus: EventBus, opts: ChangefeedOptions) {
    const coll = db.collection(opts.collection);
    const resume = await opts.resumeTokenStore?.load();

    const cs = coll.watch([], {
        fullDocument: opts.fullDocument ?? 'updateLookup',
        resumeAfter: resume ?? undefined,
    });

    let stopped = false;
    (async () => {
        for await (const change of cs) {
            if (stopped) break;
            const doc = change.fullDocument ?? change.documentKey;
            if (opts.filter && !opts.filter(doc)) continue;

            const payload = opts.map ? opts.map(doc) : doc;
            await bus.publish(opts.topic, payload, {
                key: String(doc._id),
                headers: {
                    'x-mongo-op': change.operationType,
                    'x-change-clusterTime': String(change.clusterTime),
                },
            });

            if (opts.resumeTokenStore && change._id) await opts.resumeTokenStore.save(change._id);
        }
    })().catch(() => {
        /* log, retry/backoff in real code */
    });

    return () => {
        stopped = true;
        cs.close();
    };
}
