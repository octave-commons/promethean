import test from 'ava';
import { sleep } from '@promethean/utils/sleep.js';

type CompactorModule = typeof import('../compactor.js');

type StoreCall = {
    readonly topic: string;
    readonly keys: ReadonlyArray<string>;
};

type PublishMessage = {
    readonly key: string;
    readonly payload: unknown;
    readonly ts: number;
};

type PublishRecord = {
    readonly topic: string;
    readonly message: PublishMessage;
    readonly metadata: {
        readonly key: string;
    };
};

type LatestByKeyRecord = {
    readonly payload?: unknown;
    readonly ts?: number;
};

type LatestByKeyResponse = Record<string, LatestByKeyRecord>;

type Deferred<T> = {
    readonly promise: Promise<T>;
    readonly resolve: (value: T) => void;
};

class DeferredImpl<T> {
    readonly promise: Promise<T>;
    private readonly resolveInternal!: (value: T) => void;

    constructor() {
        this.promise = new Promise<T>((resolve) => {
            (this as unknown as { resolveInternal: (value: T) => void }).resolveInternal = resolve;
        });
    }

    resolve(value: T): void {
        this.resolveInternal(value);
    }
}

const createDeferred = <T>(): Deferred<T> => {
    const impl = new DeferredImpl<T>();
    return {
        promise: impl.promise,
        resolve: (value: T) => {
            impl.resolve(value);
        },
    } as const;
};

const loadCompactor = async (): Promise<CompactorModule> => import('../compactor.js');

const stopCompactor = async (stop: () => void): Promise<void> => {
    stop();
    await sleep(60);
};

test('startCompactor publishes latest entries to the snapshot topic', async (t) => {
    const { startCompactor } = await loadCompactor();

    const storeCall = createDeferred<StoreCall>();
    const publishCall = createDeferred<PublishRecord>();

    const store = {
        latestByKey: async (topic: string, keys: ReadonlyArray<string>): Promise<LatestByKeyResponse> => {
            storeCall.resolve({ topic, keys });
            return {
                alpha: { payload: { foo: 'bar' }, ts: 123 },
            } satisfies LatestByKeyResponse;
        },
    } as const;

    const bus = {
        publish: async (topic: string, message: PublishMessage, metadata: PublishRecord['metadata']): Promise<void> => {
            publishCall.resolve({ topic, message, metadata });
        },
    } as const;

    const stop = startCompactor(store, bus, {
        topic: 'state.events',
        snapshotTopic: 'state.snapshots',
        batchKeys: ['alpha'],
        intervalMs: 50,
    });

    t.teardown(async () => stopCompactor(stop));

    const [storeInvocation, publishInvocation] = await Promise.all([storeCall.promise, publishCall.promise]);

    await stopCompactor(stop);

    t.deepEqual(storeInvocation, {
        topic: 'state.events',
        keys: ['alpha'],
    });

    t.deepEqual(publishInvocation, {
        topic: 'state.snapshots',
        message: { key: 'alpha', payload: { foo: 'bar' }, ts: 123 },
        metadata: { key: 'alpha' },
    });
});

test('startCompactor skips publishing when no entries are available', async (t) => {
    const { startCompactor } = await loadCompactor();

    const storeCall = createDeferred<StoreCall>();
    const publishCall = createDeferred<PublishRecord>();

    const store = {
        latestByKey: async (topic: string, keys: ReadonlyArray<string>): Promise<LatestByKeyResponse> => {
            storeCall.resolve({ topic, keys });
            return {};
        },
    } as const;

    const bus = {
        publish: async (topic: string, message: PublishMessage, metadata: PublishRecord['metadata']): Promise<void> => {
            publishCall.resolve({ topic, message, metadata });
        },
    } as const;

    const stop = startCompactor(store, bus, {
        topic: 'state.events',
        snapshotTopic: 'state.snapshots',
        intervalMs: 50,
    });

    t.teardown(async () => stopCompactor(stop));

    const storeInvocation = await storeCall.promise;

    const outcome = await Promise.race([
        publishCall.promise.then(() => 'publish' as const),
        sleep(60).then(() => 'timeout' as const),
    ]);

    await stopCompactor(stop);

    t.deepEqual(storeInvocation, {
        topic: 'state.events',
        keys: [],
    });

    t.is(outcome, 'timeout');
});
