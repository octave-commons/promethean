/* eslint-disable functional/no-loop-statements, functional/no-let, functional/immutable-data, functional/prefer-immutable-types, promise/param-names, no-restricted-syntax, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any, max-lines-per-function */
import test from 'ava';
import type { Db, ResumeToken } from 'mongodb';
import type { EventBus } from '@promethean/event/types.js';

import { startMongoChangefeed } from '../mongo.js';

test('changefeed publishes mapped payloads and saves resume token', async (t) => {
    type Doc = { _id: number; foo: string };
    type Payload = string;

    const events = [
        {
            fullDocument: { _id: 1, foo: 'bar' },
            operationType: 'insert',
            clusterTime: 1 as any,
            _id: { token: 1 } as unknown,
        },
    ];

    let closed = false;
    const cs = {
        async *[Symbol.asyncIterator]() {
            for (const ev of events) {
                if (closed) break;
                yield ev;
            }
            while (!closed) {
                await new Promise((r) => setTimeout(r, 1));
            }
        },
        close: async () => {
            closed = true;
        },
    };

    const coll = { watch: () => cs };
    const db = { collection: () => coll } as unknown as Db;

    const published: Payload[] = [];
    const bus: EventBus = {
        publish: async <T>(_topic: string, payload: T) => {
            published.push(payload as unknown as Payload);
            return { payload };
        },
    } as EventBus;

    const saved: ResumeToken[] = [];
    const store = {
        load: async () => null,
        save: async (tok: ResumeToken) => {
            saved.push(tok);
        },
    };

    const stop = await startMongoChangefeed<Doc, Payload>(db, bus, {
        collection: 'c',
        topic: 't',
        resumeTokenStore: store,
        filter: (d) => d.foo === 'bar',
        map: (d) => d.foo,
    });

    await new Promise((r) => setTimeout(r, 10));
    await stop();

    t.deepEqual(published, ['bar']);
    t.is(published.length, 1);
    t.is(saved.length, 1);
    t.deepEqual(saved[0]!, events[0]!._id);
});
