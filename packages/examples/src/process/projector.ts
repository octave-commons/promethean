import { Topics } from '@promethean/event/topics.js';

import type { HeartbeatPayload, ProcessState } from './types.js';

const STALE_MS = 15_000;

type ImmutableHeartbeatPayload = Readonly<HeartbeatPayload>;

type HeartbeatEvent = Readonly<{ payload: ImmutableHeartbeatPayload; ts: number }>;

type PublishOptions = Readonly<{ key: string }>;

type SubscriptionOptions = Readonly<{ from: 'earliest' | 'latest' }>;

type CachedState = Readonly<ProcessState>;

type ProcessCache = Readonly<Record<string, CachedState>>;

type ProcessEventBus = Readonly<{
    publish: (topic: string, payload: CachedState, options: PublishOptions) => Promise<void>;
    subscribe: (
        topic: string,
        group: string,
        handler: (event: HeartbeatEvent) => Promise<void>,
        options: SubscriptionOptions,
    ) => Promise<void>;
}>;

const createCache = (entries: ReadonlyArray<readonly [string, CachedState]>): ProcessCache =>
    Object.freeze(
        entries.reduce<Record<string, CachedState>>(
            (accumulator, [key, state]) => ({
                ...accumulator,
                [key]: state,
            }),
            {},
        ),
    );

const removeEntry = (
    entries: ReadonlyArray<readonly [string, CachedState]>,
    key: string,
): ReadonlyArray<readonly [string, CachedState]> => entries.filter(([existingKey]) => existingKey !== key);

const cacheEntriesOf = (cache: ProcessCache): ReadonlyArray<readonly [string, CachedState]> =>
    Object.entries(cache) as ReadonlyArray<readonly [string, CachedState]>;

const upsertState = (cache: ProcessCache, key: string, state: CachedState): ProcessCache =>
    createCache([...removeEntry(cacheEntriesOf(cache), key), [key, state] as const]);

const computeStaleness = (
    cache: ProcessCache,
    now: number,
): { readonly cache: ProcessCache; readonly updates: ReadonlyArray<CachedState> } => {
    const { entries, updates } = cacheEntriesOf(cache).reduce(
        (
            accumulator,
            [key, state],
        ): {
            readonly entries: ReadonlyArray<readonly [string, CachedState]>;
            readonly updates: ReadonlyArray<CachedState>;
        } => {
            const nextStatus: CachedState['status'] = now - state.last_seen_ts > STALE_MS ? 'stale' : 'alive';
            if (nextStatus === state.status) {
                return {
                    entries: [...accumulator.entries, [key, state] as const],
                    updates: accumulator.updates,
                };
            }
            const updatedState: CachedState = { ...state, status: nextStatus };
            return {
                entries: [...accumulator.entries, [key, updatedState] as const],
                updates: [...accumulator.updates, updatedState],
            };
        },
        {
            entries: [] as ReadonlyArray<readonly [string, CachedState]>,
            updates: [] as ReadonlyArray<CachedState>,
        },
    );

    return {
        cache: createCache(entries),
        updates,
    };
};

const keyOf = (heartbeat: ImmutableHeartbeatPayload): string => `${heartbeat.host}:${heartbeat.name}:${heartbeat.pid}`;

const stateFromHeartbeat = (heartbeat: ImmutableHeartbeatPayload, timestamp: number): CachedState => ({
    processId: keyOf(heartbeat),
    name: heartbeat.name,
    host: heartbeat.host,
    pid: heartbeat.pid,
    ...(heartbeat.sid !== undefined ? { sid: heartbeat.sid } : {}),
    cpu_pct: heartbeat.cpu_pct,
    mem_mb: heartbeat.mem_mb,
    last_seen_ts: timestamp,
    status: 'alive',
});

const readTopic = (key: 'HeartbeatReceived' | 'ProcessState'): string => {
    const value = Reflect.get(Topics as Record<string, unknown>, key);
    if (typeof value !== 'string') {
        throw new Error(`missing topic mapping for ${key}`);
    }
    return value;
};

const topics: Readonly<{ HeartbeatReceived: string; ProcessState: string }> = Object.freeze({
    HeartbeatReceived: readTopic('HeartbeatReceived'),
    ProcessState: readTopic('ProcessState'),
});

export async function startProcessProjector(bus: ProcessEventBus): Promise<() => void> {
    // eslint-disable-next-line functional/no-let -- Projector maintains evolving cache state across events.
    let cache = createCache([]);

    const publishState = async (state: CachedState): Promise<void> => {
        await bus.publish(topics.ProcessState, state, { key: state.processId });
    };

    const heartbeatHandler = async (event: HeartbeatEvent): Promise<void> => {
        const heartbeat = event.payload;
        const nextState = stateFromHeartbeat(heartbeat, event.ts);
        cache = upsertState(cache, nextState.processId, nextState);
        await publishState(nextState);
    };

    await bus.subscribe(topics.HeartbeatReceived, 'process-projector', heartbeatHandler, { from: 'earliest' });

    const intervalHandle = setInterval(async () => {
        const now = Date.now();
        const { cache: nextCache, updates } = computeStaleness(cache, now);
        cache = nextCache;
        await Promise.all(updates.map((state) => publishState(state)));
    }, 5_000);

    return () => {
        clearInterval(intervalHandle);
    };
}
