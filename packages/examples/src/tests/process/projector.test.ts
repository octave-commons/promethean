/* eslint-disable functional/immutable-data, functional/prefer-immutable-types, @typescript-eslint/prefer-readonly-parameter-types, max-lines-per-function */
import test from 'ava';
import { Topics } from '@promethean/event/topics.js';

import {
    startProcessProjector,
    type ProcessProjectorBus,
    type ProcessProjectorDeliveryContext,
    type ProcessProjectorEventRecord,
    type ProcessProjectorPublishOptions,
} from '../../process/projector.js';
import type { HeartbeatPayload, ProcessState } from '../../process/types.js';

const topics = Topics as Readonly<{ HeartbeatReceived: string; ProcessState: string }>;

class Deferred<T> {
    #resolve: ((value: T) => void) | undefined;
    #settled = false;
    readonly promise: Promise<T>;

    constructor() {
        this.promise = new Promise<T>((resolve) => {
            this.#resolve = resolve;
        });
    }

    resolve(value: T): void {
        if (this.#settled) {
            return;
        }
        if (this.#resolve === undefined) {
            throw new Error('deferred not initialised');
        }
        this.#settled = true;
        this.#resolve(value);
    }

    isSettled(): boolean {
        return this.#settled;
    }
}

type PublishCall = {
    readonly topic: string;
    readonly payload: ProcessState;
    readonly options: ProcessProjectorPublishOptions;
};

type EventHandler = (
    event: ProcessProjectorEventRecord<HeartbeatPayload>,
    ctx: ProcessProjectorDeliveryContext,
) => Promise<void>;

type SubscriptionRecord = {
    readonly topic: string;
    readonly group: string;
    readonly options: Readonly<Record<string, unknown>> | undefined;
    readonly handler: EventHandler;
};

type TimerStub = {
    readonly awaitHandle: () => Promise<ReturnType<typeof setInterval>>;
    readonly awaitCleared: () => Promise<ReturnType<typeof setInterval>>;
    readonly restore: () => void;
    readonly runCallback: () => Promise<void>;
};

function stubTimers(): TimerStub {
    const originalSetInterval = globalThis.setInterval;
    const originalClearInterval = globalThis.clearInterval;

    const handleDeferred = new Deferred<ReturnType<typeof setInterval>>();
    const callbackDeferred = new Deferred<() => Promise<void>>();
    const clearedDeferred = new Deferred<ReturnType<typeof setInterval>>();

    globalThis.setInterval = ((
        fn: (...args: readonly never[]) => unknown,
        _delay?: number,
        ...args: readonly never[]
    ) => {
        const handle = Symbol('interval') as unknown as ReturnType<typeof setInterval>;
        handleDeferred.resolve(handle);
        callbackDeferred.resolve(async () => {
            await fn(...args);
        });
        return handle;
    }) as unknown as typeof setInterval;

    globalThis.clearInterval = ((handle: ReturnType<typeof setInterval>) => {
        clearedDeferred.resolve(handle);
    }) as typeof clearInterval;

    return {
        awaitHandle: () => handleDeferred.promise,
        awaitCleared: () => clearedDeferred.promise,
        restore: () => {
            globalThis.setInterval = originalSetInterval;
            globalThis.clearInterval = originalClearInterval;
        },
        runCallback: async () => {
            const callback = await callbackDeferred.promise;
            await callback();
        },
    };
}

function createBus() {
    const subscription = new Deferred<SubscriptionRecord>();
    const firstPublish = new Deferred<PublishCall>();
    const secondPublish = new Deferred<PublishCall>();
    const unsubscribeDeferred = new Deferred<void>();

    const bus: ProcessProjectorBus = {
        async publish(topic, payload, options = {}) {
            const call: PublishCall = {
                topic,
                payload: payload as ProcessState,
                options,
            };
            if (!firstPublish.isSettled()) {
                firstPublish.resolve(call);
            } else if (!secondPublish.isSettled()) {
                secondPublish.resolve(call);
            } else {
                throw new Error('received more publish calls than expected');
            }

            return {
                id: 'record',
                ts: Date.now(),
                topic,
                payload,
                headers: undefined,
            };
        },
        async subscribe(topic, group, onEvent, options) {
            subscription.resolve({ topic, group, options, handler: onEvent });
            return async () => {
                unsubscribeDeferred.resolve();
            };
        },
    };

    return { bus, subscription, firstPublish, secondPublish, unsubscribeDeferred };
}

test.serial('startProcessProjector publishes fresh process state on heartbeat', async (t) => {
    const timers = stubTimers();
    t.teardown(() => {
        timers.restore();
    });
    const { bus, subscription, firstPublish, secondPublish, unsubscribeDeferred } = createBus();

    const stop = await startProcessProjector(bus);
    const handle = await timers.awaitHandle();
    const { handler, ...subscriptionInfo } = await subscription.promise;
    t.deepEqual(subscriptionInfo, {
        topic: topics.HeartbeatReceived,
        group: 'process-projector',
        options: { from: 'earliest' },
    });

    const heartbeat: HeartbeatPayload = {
        pid: 42,
        name: 'orchestrator',
        host: 'alpha',
        cpu_pct: 12.5,
        mem_mb: 256,
    };
    const timestamp = 1_000;

    const event: ProcessProjectorEventRecord<HeartbeatPayload> = {
        id: 'hb-1',
        topic: topics.HeartbeatReceived,
        payload: heartbeat,
        ts: timestamp,
    };
    const ctx: ProcessProjectorDeliveryContext = { attempt: 1, maxAttempts: 1 };

    await handler(event, ctx);

    const call = await firstPublish.promise;
    t.is(call.topic, topics.ProcessState);
    t.deepEqual(call.payload, {
        processId: 'alpha:orchestrator:42',
        name: 'orchestrator',
        host: 'alpha',
        pid: 42,
        cpu_pct: 12.5,
        mem_mb: 256,
        last_seen_ts: timestamp,
        status: 'alive',
    });
    t.deepEqual(call.options, { key: 'alpha:orchestrator:42' });
    t.false(secondPublish.isSettled());

    await stop();
    await unsubscribeDeferred.promise;
    const cleared = await timers.awaitCleared();
    t.is(cleared, handle);
});

test.serial('process projector marks entries stale when heartbeats stop arriving', async (t) => {
    const timers = stubTimers();
    t.teardown(() => {
        timers.restore();
    });
    const { bus, subscription, firstPublish, secondPublish, unsubscribeDeferred } = createBus();

    const stop = await startProcessProjector(bus);
    const handle = await timers.awaitHandle();
    const { handler } = await subscription.promise;

    const heartbeat: HeartbeatPayload = {
        pid: 7,
        name: 'worker',
        host: 'beta',
        cpu_pct: 40,
        mem_mb: 512,
        sid: 'session-1',
    };
    const firstTimestamp = 5_000;

    const event: ProcessProjectorEventRecord<HeartbeatPayload> = {
        id: 'hb-1',
        topic: topics.HeartbeatReceived,
        payload: heartbeat,
        ts: firstTimestamp,
    };
    const ctx: ProcessProjectorDeliveryContext = { attempt: 1, maxAttempts: 1 };

    await handler(event, ctx);
    await firstPublish.promise;

    const originalNow = Date.now;
    t.teardown(() => {
        Date.now = originalNow;
    });
    Date.now = () => firstTimestamp + 20_000;
    await timers.runCallback();
    Date.now = originalNow;

    const staleCall = await secondPublish.promise;
    t.is(staleCall.topic, topics.ProcessState);
    t.is(staleCall.payload.status, 'stale');
    t.is(staleCall.payload.last_seen_ts, firstTimestamp);
    t.deepEqual(staleCall.payload, {
        processId: 'beta:worker:7',
        name: 'worker',
        host: 'beta',
        pid: 7,
        sid: 'session-1',
        cpu_pct: 40,
        mem_mb: 512,
        last_seen_ts: firstTimestamp,
        status: 'stale',
    });
    t.deepEqual(staleCall.options, { key: 'beta:worker:7' });

    await stop();
    await unsubscribeDeferred.promise;
    const cleared = await timers.awaitCleared();
    t.is(cleared, handle);
});
/* eslint-enable functional/immutable-data, functional/prefer-immutable-types, @typescript-eslint/prefer-readonly-parameter-types, max-lines-per-function */
