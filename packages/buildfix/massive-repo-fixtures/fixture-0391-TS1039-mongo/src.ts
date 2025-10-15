/* eslint-disable functional/no-let, functional/no-loop-statements, functional/no-try-statements */
import type { Db, ChangeStreamDocument, Collection, Document } from 'mongodb';
import type { EventBus } from '@promethean/event/types.js';
import { retry, createLogger } from '@promethean/utils';

import type { ResumeTokenStore } from './resume.mongo.js';

export type ChangefeedOptions<TDoc, TPayload = TDoc> = {
    collection: string;
    topic: string;
    fullDocument?: 'updateLookup' | 'whenAvailable'; // default 'updateLookup'
    resumeTokenStore?: ResumeTokenStore;
    filter?: (doc: TDoc) => boolean; // drop noisy changes if needed
    map?: (doc: TDoc) => TPayload; // transform doc->payload
};

/**
 * Start a MongoDB changefeed and publish mapped payloads to an EventBus.
 * @returns cleanup function to stop the feed.
 */
export async function startMongoChangefeed<TDoc extends Document & { _id?: unknown }, TPayload = TDoc>(
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

    const runner = runChangefeedWatch({
        coll,
        bus,
        opts,
        log,
        getStopped: () => stopped,
        setCurrentStream: (s) => {
            currentStream = s;
        },
        getResume: () => resume,
        setResume: (t) => {
            resume = t;
        },
    }).catch((err) => {
        log.error('unexpected error', { err });
    });

    return async () => {
        stopped = true;
        await currentStream?.close();
        await runner;
    };
}

function extractDoc<TDoc extends Document>(change: ChangeStreamDocument<TDoc>): TDoc | undefined {
    if ('fullDocument' in change && change.fullDocument) {
        return change.fullDocument;
    }
    const docId = (change as { documentKey?: { _id?: unknown } }).documentKey?._id;
    return docId !== undefined ? ({ _id: docId } as unknown as TDoc) : undefined;
}

type PublishArgs<TDoc extends Document, TPayload> = {
    topic: string;
    change: ChangeStreamDocument<TDoc> & { _id?: unknown };
    payload: TPayload;
    doc: TDoc & { _id?: unknown };
};

async function publishChange<TDoc extends Document, TPayload>(
    bus: EventBus,
    args: PublishArgs<TDoc, TPayload>,
): Promise<void> {
    const { topic, change, payload, doc } = args;
    const changeId = change._id;
    const docId = doc._id;
    await bus.publish<TPayload>(topic, payload, {
        key: String(changeId ?? docId ?? ''),
        headers: {
            'x-mongo-op': change.operationType,
            'x-change-clusterTime': String(change.clusterTime),
            'x-change-docId': String(docId ?? ''),
            'x-change-resumeToken': JSON.stringify(changeId ?? null),
        },
    });
}

async function persistResumeToken(
    store: ResumeTokenStore | undefined,
    change: ChangeStreamDocument<Document> & { _id?: unknown },
    current: unknown | null,
): Promise<unknown | null> {
    const id = change._id;
    if (store && id) {
        await store.save(id);
        return id;
    }
    return current;
}

type WatchArgs<TDoc extends Document & { _id?: unknown }, TPayload> = {
    coll: Collection<TDoc>;
    bus: EventBus;
    opts: ChangefeedOptions<TDoc, TPayload>;
    log: ReturnType<typeof createLogger>;
    getStopped: () => boolean;
    setCurrentStream: (s: { close(): Promise<void> } | null) => void;
    getResume: () => unknown | null;
    setResume: (token: unknown | null) => void;
};

async function watchOnce<TDoc extends Document & { _id?: unknown }, TPayload>(
    args: WatchArgs<TDoc, TPayload>,
): Promise<void> {
    const { coll, bus, opts, getStopped, setCurrentStream, getResume, setResume } = args;
    const cs = coll.watch<TDoc>([], {
        fullDocument: opts.fullDocument ?? 'updateLookup',
        resumeAfter: getResume() ?? undefined,
        maxAwaitTimeMS: 10_000,
    });
    setCurrentStream(cs);
    try {
        for await (const change of cs) {
            if (getStopped()) break;
            const doc = extractDoc<TDoc>(change);
            if (!doc) continue;
            if (opts.filter && !opts.filter(doc)) continue;
            const payload = opts.map ? opts.map(doc) : (doc as unknown as TPayload);
            await publishChange(bus, {
                topic: opts.topic,
                change: change as ChangeStreamDocument<TDoc> & { _id?: unknown },
                payload,
                doc: doc as TDoc & { _id?: unknown },
            });
            const updated = await persistResumeToken(
                opts.resumeTokenStore,
                change as ChangeStreamDocument<Document> & { _id?: unknown },
                getResume(),
            );
            setResume(updated);
        }
    } finally {
        await cs.close();
    }
}

async function runChangefeedWatch<TDoc extends Document & { _id?: unknown }, TPayload>(
    args: WatchArgs<TDoc, TPayload>,
): Promise<void> {
    const { log, getStopped } = args;
    while (!getStopped()) {
        try {
            await retry(() => watchOnce(args), {
                attempts: 5,
                backoff: (a) => Math.floor(2 ** Math.min(a, 8) * 100 * Math.random()),
                shouldRetry: () => !getStopped(),
                onRetry: (err, attempt) => {
                    log.warn(`watch failed (attempt ${attempt})`, { err });
                },
            });
        } catch (err) {
            if (!getStopped()) {
                log.error('watch aborted', { err });
            }
        }
    }
}
