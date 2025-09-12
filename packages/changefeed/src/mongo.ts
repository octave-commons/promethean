/* eslint-disable functional/no-let, functional/no-loop-statements, functional/no-try-statements, max-lines-per-function */
import type { Db } from 'mongodb';
import type { EventBus } from '@promethean/event/types.js';
import { retry } from '@promethean/utils';

import type { ResumeTokenStore } from './resume.mongo.js';

export type ChangefeedOptions<TDoc, TPayload = TDoc> = {
    collection: string;
    topic: string;
    fullDocument?: 'updateLookup' | 'whenAvailable'; // default "updateLookup"
    resumeTokenStore?: ResumeTokenStore;
    filter?: (doc: TDoc) => boolean; // drop noisy changes if needed
    map?: (doc: TDoc) => TPayload; // transform doc->payload
};

export function startMongoChangefeed<TDoc extends { _id?: unknown }, TPayload = TDoc>(
    db: Db,
    bus: EventBus,
    opts: ChangefeedOptions<TDoc, TPayload>,
): () => Promise<void> {
    const coll = db.collection<TDoc>(opts.collection);

    let stopped = false;
    let currentStream: { close(): Promise<void> } | null = null;

    (async () => {
        let resume = await opts.resumeTokenStore?.load();
        while (!stopped) {
            try {
                await retry(
                    async () => {
                        const cs = coll.watch<TDoc>([], {
                            fullDocument: opts.fullDocument ?? 'updateLookup',
                            resumeAfter: resume ?? undefined,
                        });
                        currentStream = cs;
                        try {
                            for await (const change of cs) {
                                if (stopped) break;
                                const c = change as { fullDocument?: TDoc; documentKey?: TDoc };
                                const doc = (c.fullDocument ?? c.documentKey)!;
                                if (opts.filter && !opts.filter(doc)) continue;
                                const payload = opts.map ? opts.map(doc) : (doc as unknown as TPayload);
                                await bus.publish<TPayload>(opts.topic, payload, {
                                    key: String(doc._id ?? ''),
                                    headers: {
                                        'x-mongo-op': change.operationType,
                                        'x-change-clusterTime': String(change.clusterTime),
                                    },
                                });
                                if (opts.resumeTokenStore && change._id) {
                                    await opts.resumeTokenStore.save(change._id);
                                    resume = change._id;
                                }
                            }
                        } finally {
                            await cs.close();
                        }
                    },
                    {
                        attempts: 5,
                        backoff: (a) => 100 * a + Math.floor(Math.random() * 50),
                        shouldRetry: () => !stopped,
                        onRetry: (err, attempt) => {
                            console.error(`[changefeed:${opts.collection}] watch failed (attempt ${attempt})`, err);
                        },
                    },
                );
            } catch (err) {
                if (!stopped) {
                    console.error(`[changefeed:${opts.collection}] watch aborted`, err);
                }
            }
        }
    })().catch((err) => {
        console.error(`[changefeed:${opts.collection}] unexpected error`, err);
    });

    return async () => {
        stopped = true;
        await currentStream?.close();
    };
}
