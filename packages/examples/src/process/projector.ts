import { Topics } from '@promethean/event/topics.js';

import { HeartbeatPayload, ProcessState } from './types.js';

const STALE_MS = 15_000;

type CachedState = Readonly<ProcessState>;

const CACHE_STATE = new WeakMap<object, ReadonlyMap<string, CachedState>>();
const TOPIC_NAMES = Topics as Readonly<Record<string, unknown>>;

type EventHeaders = Readonly<Record<string, string>>;

type ProjectorEventRecord<T> = Readonly<{
    readonly topic: string;
    readonly payload: T;
    readonly ts: number;
    readonly headers?: EventHeaders;
}> &
    Readonly<Record<string, unknown>>;

type ProjectorPublishOptions = Readonly<{ readonly key?: string }> & Readonly<Record<string, unknown>>;

type ProjectorDeliveryContext = Readonly<{
    readonly attempt: number;
    readonly maxAttempts: number;
}>;

type ProjectorEventBus = Readonly<{
    publish<T>(topic: string, payload: T, options?: ProjectorPublishOptions): Promise<ProjectorEventRecord<T>>;
    subscribe(
        topic: string,
        group: string,
        handler: (event: ProjectorEventRecord<HeartbeatPayload>, ctx: ProjectorDeliveryContext) => Promise<void>,
        options?: Readonly<Record<string, unknown>>,
    ): Promise<() => Promise<void>>;
}>;

export type ProcessProjectorBus = ProjectorEventBus;
export type ProcessProjectorEventRecord<T> = ProjectorEventRecord<T>;
export type ProcessProjectorDeliveryContext = ProjectorDeliveryContext;
export type ProcessProjectorPublishOptions = ProjectorPublishOptions;

const heartbeatKey = (heartbeat: HeartbeatPayload): string => `${heartbeat.host}:${heartbeat.name}:${heartbeat.pid}`;

const toProcessState = (heartbeat: HeartbeatPayload, event: ProjectorEventRecord<HeartbeatPayload>): CachedState => ({
    processId: heartbeatKey(heartbeat),
    name: heartbeat.name,
    host: heartbeat.host,
    pid: heartbeat.pid,
    ...(heartbeat.sid !== undefined ? { sid: heartbeat.sid } : {}),
    cpu_pct: heartbeat.cpu_pct,
    mem_mb: heartbeat.mem_mb,
    last_seen_ts: event.ts,
    status: 'alive',
});

const upsertState = (
    cache: ReadonlyMap<string, CachedState>,
    key: string,
    state: CachedState,
): ReadonlyMap<string, CachedState> => new Map([...cache.entries()].filter(([k]) => k !== key).concat([[key, state]]));

const updateStatuses = async (
    cache: ReadonlyMap<string, CachedState>,
    publish: (state: CachedState) => Promise<unknown>,
): Promise<ReadonlyMap<string, CachedState>> => {
    const now = Date.now();
    const transitions = Array.from(cache.entries()).map(([key, state]) => {
        const status = now - state.last_seen_ts > STALE_MS ? 'stale' : 'alive';
        if (status === state.status) {
            return { key, state, publish: undefined };
        }
        const nextState: CachedState = { ...state, status };
        return { key, state: nextState, publish: publish(nextState) };
    });

    await Promise.all(transitions.flatMap((transition) => (transition.publish ? [transition.publish] : [])));

    return new Map(transitions.map(({ key, state }) => [key, state] as const));
};

export async function startProcessProjector<TBus extends ProjectorEventBus>(bus: TBus): Promise<() => Promise<void>> {
    const token = {};
    CACHE_STATE.set(token, new Map());

    const getCache = (): ReadonlyMap<string, CachedState> => CACHE_STATE.get(token) ?? new Map();
    const setCache = (next: ReadonlyMap<string, CachedState>): ReadonlyMap<string, CachedState> => {
        CACHE_STATE.set(token, next);
        return next;
    };

    const processStateTopic = String(TOPIC_NAMES.ProcessState ?? 'process.state');
    const heartbeatTopic = String(TOPIC_NAMES.HeartbeatReceived ?? 'heartbeat.received');

    const publishState = (state: CachedState) => bus.publish(processStateTopic, state, { key: state.processId });

    const unsubscribe = await bus.subscribe(
        heartbeatTopic,
        'process-projector',
        async (event: ProjectorEventRecord<HeartbeatPayload>) => {
            const state = toProcessState(event.payload, event);
            const key = state.processId;
            setCache(upsertState(getCache(), key, state));
            await publishState(state);
        },
        { from: 'earliest' },
    );

    const tick = async () => {
        setCache(await updateStatuses(getCache(), publishState));
    };

    const interval = setInterval(() => {
        void tick();
    }, 5_000);

    return async () => {
        clearInterval(interval);
        await unsubscribe();
        CACHE_STATE.delete(token);
    };
}
