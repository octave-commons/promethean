import test from 'ava';

import { reconstructAt } from '../reconstruct.js';

type TimetravelEvent<TPayload> = Readonly<{
    ts: number;
    key: string;
    payload: TPayload;
}>;

type ScanOpts = Readonly<{
    ts: number;
    limit: number;
}>;

const createStore = <TPayload>(events: ReadonlyArray<TimetravelEvent<TPayload>>) => ({
    async scan(_topic: string, opts: ScanOpts) {
        return events.filter((event) => event.ts >= opts.ts);
    },
});

test('reconstructAt applies events up to the target timestamp', async (t) => {
    const events: ReadonlyArray<TimetravelEvent<{ readonly count: number }>> = [
        { ts: 10, key: 'alpha', payload: { count: 1 } },
        { ts: 15, key: 'beta', payload: { count: 99 } },
        { ts: 20, key: 'alpha', payload: { count: 2 } },
        { ts: 30, key: 'alpha', payload: { count: 3 } },
    ];
    const store = createStore(events);

    const result = await reconstructAt(store, {
        topic: 'process.state',
        key: 'alpha',
        atTs: 25,
        apply: (_prev, event: TimetravelEvent<{ readonly count: number }>) => event.payload,
    });

    t.deepEqual(result, { state: { count: 2 }, ts: 20 });
});

test('reconstructAt uses snapshot baseline when provided', async (t) => {
    const events: ReadonlyArray<TimetravelEvent<{ readonly delta: number }>> = [
        { ts: 40, key: 'alpha', payload: { delta: 3 } },
        { ts: 50, key: 'alpha', payload: { delta: 7 } },
        { ts: 60, key: 'alpha', payload: { delta: 11 } },
    ];
    const store = createStore(events);

    const result = await reconstructAt<{ readonly total: number }>(store, {
        topic: 'process.state',
        key: 'alpha',
        atTs: 55,
        apply: (prev, event: TimetravelEvent<{ readonly delta: number }>) => ({
            total: (prev?.total ?? 0) + event.payload.delta,
        }),
        fetchSnapshot: async (key, upTo) => {
            t.is(key, 'alpha');
            t.is(upTo, 55);
            return { state: { total: 5 }, ts: 45 } as const;
        },
    });

    t.deepEqual(result, { state: { total: 12 }, ts: 50 });
});
