import test from 'ava';

import { withDLQ } from '../subscribe.js';
import { DLQRecord, dlqTopic } from '../types.js';

type FakeEvent = {
    readonly id: string;
    readonly topic: string;
    readonly payload: Readonly<Record<string, unknown>>;
    readonly headers?: Readonly<Record<string, unknown>>;
    readonly key?: string;
    readonly sid?: string;
    readonly caused_by?: ReadonlyArray<string>;
};

type SubscribeResult = { readonly trigger: (event: FakeEvent) => Promise<void> };

type BusSubscribeFn = (
    topic: string,
    group: string,
    handler: (event: FakeEvent) => Promise<void>,
    opts?: Readonly<Record<string, unknown>>,
) => Promise<SubscribeResult>;

type SubscribeFn = (
    topic: string,
    handler: (event: FakeEvent) => Promise<void>,
    opts?: Readonly<Record<string, unknown>>,
) => Promise<SubscribeResult>;

type FakeBus = {
    readonly publish: (topic: string, payload: Readonly<DLQRecord>) => Promise<void>;
    readonly subscribe: BusSubscribeFn;
};

const createBus = (publish: FakeBus['publish']): FakeBus => ({
    publish,
    subscribe: async (
        _topic: string,
        _group: string,
        handler: (event: FakeEvent) => Promise<void>,
    ): Promise<SubscribeResult> => ({ trigger: handler }),
});

const toSubscribeFn = (subscribeRaw: unknown): SubscribeFn => {
    const typed = subscribeRaw as (
        topic: string,
        handler: (event: FakeEvent) => Promise<void>,
        opts?: Readonly<Record<string, unknown>>,
    ) => Promise<unknown>;

    return async (topic, handler, opts) => {
        const result = await typed(topic, handler, opts);
        return result as SubscribeResult;
    };
};

test('sends events to the DLQ after exceeding max attempts', async (t) => {
    t.plan(8);

    const bus = createBus(async (topic, payload) => {
        const expectedEvent: FakeEvent = { id: 'evt-1', topic: 'primary.topic', payload: { value: 1 } };

        t.is(topic, dlqTopic('primary.topic'));
        t.deepEqual(payload.original, expectedEvent);
        t.is(payload.group, 'group-a');
        t.is(payload.attempts, 2);
        t.true(typeof payload.ts === 'number');
        t.regex(payload.err, /boom/);
    });

    const subscribe = toSubscribeFn(withDLQ(bus, { group: 'group-a', maxAttempts: 2 }));
    const handler = async () => {
        throw new Error('boom');
    };

    const { trigger } = await subscribe('primary.topic', handler);

    const event: FakeEvent = { id: 'evt-1', topic: 'primary.topic', payload: { value: 1 } };
    await t.throwsAsync(trigger(event), { message: 'boom' });
    await t.notThrowsAsync(trigger(event));
});

test('resets attempt tracking after a successful retry', async (t) => {
    t.plan(3);

    const bus = createBus(async () => {
        t.fail('dead-letter publish should not be invoked');
    });

    const subscribe = toSubscribeFn(withDLQ(bus, { group: 'group-b', maxAttempts: 2 }));

    const behaviorIterator = (function* () {
        yield 'throw' as const;
        yield 'resolve' as const;
        yield 'throw' as const;
    })();

    const handler = async () => {
        const behavior = behaviorIterator.next().value ?? 'resolve';
        if (behavior === 'throw') {
            throw new Error('flaky');
        }
    };

    const { trigger } = await subscribe('retry.topic', handler);

    const event: FakeEvent = { id: 'evt-2', topic: 'retry.topic', payload: { value: 2 } };
    await t.throwsAsync(trigger(event), { message: 'flaky' });
    await t.notThrowsAsync(trigger(event));
    await t.throwsAsync(trigger(event), { message: 'flaky' });
});
