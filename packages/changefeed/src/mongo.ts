/* eslint-disable functional/no-let, functional/no-loop-statements, functional/no-try-statements, max-lines-per-function */
import type { Db, ChangeStreamDocument } from 'mongodb';
import type { EventBus } from '@promethean/event/types.js';
import { retry, createLogger } from '@promethean/utils';

import type { ResumeTokenStore } from './resume.mongo.js';

export type ChangefeedOptions<TDoc, TPayload = TDoc> = {
    collection: string;
    topic: string;
    fullDocument?: 'updateLookup' | 'whenAvailable'; // default "updateLookup"
    resumeTokenStore?: ResumeTokenStore;
    filter?: (doc: TDoc) => boolean; // drop noisy changes if needed
    map?: (doc: TDoc) => TPayload; // transform doc->payload
};

/**
 * Start a MongoDB changefeed and publish mapped payloads to an EventBus.
 * @returns cleanup function to stop the feed.
 */
export async function startMongoChangefeed<TDoc extends { _id?: unknown }, TPayload = TDoc>(
    db: Db,
    bus: EventBus,
    opts: ChangefeedOptions<TDoc, TPayload>,
): Promise<() => Promise<void>> {
    const coll = db.collection<TDoc>(opts.collection);
    const log = createLogger({ service: `changefeed:${opts.collection}` });

    let stopped = false;
    let currentStream: { close(): Promise<void> } | null = null;

    let resume: unknown | null = null;
    try {
        resume = await opts.resumeTokenStore?.load();
    } catch (err) {
        log.error('resume token load failed', { err });
        throw err;
    }

    const runner = (async () => {
        while (!stopped) {
            try {
                await retry(
                    async () => {
                        const cs = coll.watch<TDoc>([], {
                            fullDocument: opts.fullDocument ?? 'updateLookup',
                            resumeAfter: resume ?? undefined,
                            maxAwaitTimeMS: 10_000,
                        });
                        currentStream = cs;
                        try {
                            for await (const change of cs) {
                                if (stopped) break;
                                const c = change as ChangeStreamDocument<TDoc>;
                                const doc =
                                    'fullDocument' in c && (c as any).fullDocument
                                        ? ((c as any).fullDocument as TDoc)
                                        : (c as any).documentKey?.['_id'] !== undefined
                                          ? ({ _id: (c as any).documentKey._id } as TDoc)
                                          : undefined;
                                if (!doc) continue; // no usable doc
                                if (opts.filter && !opts.filter(doc)) continue;
                                const payload = opts.map ? opts.map(doc) : (doc as unknown as TPayload);
                                await bus.publish<TPayload>(opts.topic, payload, {
                                    key: String((change as any)._id ?? doc._id ?? ''),
                                    headers: {
                                        'x-mongo-op': change.operationType,
                                        'x-change-clusterTime': String(change.clusterTime),
                                        'x-change-docId': String(doc._id ?? ''),
                                        'x-change-resumeToken': JSON.stringify((change as any)._id ?? null),
                                    },
                                });
                                if (opts.resumeTokenStore && (change as any)._id) {
                                    await opts.resumeTokenStore.save((change as any)._id);
                                    resume = (change as any)._id;
                                }
                            }
                        } finally {
                            await cs.close();
                        }
                    },
                    {
                        attempts: 5,
                        backoff: (a) => Math.floor(2 ** Math.min(a, 8) * 100 * Math.random()),
                        shouldRetry: () => !stopped,
                        onRetry: (err, attempt) => {
                            log.warn(`watch failed (attempt ${attempt})`, { err });
                        },
                    },
                );
            } catch (err) {
                if (!stopped) {
                    log.error('watch aborted', { err });
                }
            }
        }
    })().catch((err) => {
        log.error('unexpected error', { err });
    });

    return async () => {
        stopped = true;
        await currentStream?.close();
        await runner.catch(() => {});
    };
}
