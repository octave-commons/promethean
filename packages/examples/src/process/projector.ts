import { Topics } from '@promethean/event/topics.js';
import type { ReadonlyDeep } from 'type-fest';

import type { HeartbeatPayload, ProcessState } from './types.js';

const STALE_MS = 15_000;

const topics = Topics as Readonly<{ HeartbeatReceived: string; ProcessState: string }>;

type ProjectorState = ReadonlyDeep<ProcessState>;
type ProcessCache = ReadonlyDeep<Map<string, ProjectorState>>;

type PublishOptionsSubset = Readonly<{ key: string }>;
type SubscribeOptionsSubset = Readonly<{ from?: 'latest' | 'earliest' | 'ts' | 'afterId' }>;

type ProcessBus = Readonly<{
    publish: (topic: string, payload: ProjectorState, options: PublishOptionsSubset) => Promise<unknown>;
    subscribe: (
        topic: string,
        group: string,
        handler: (event: unknown, context: unknown) => Promise<void>,
        options: SubscribeOptionsSubset,
    ) => Promise<(() => Promise<void>) | void>;
}>;

type CacheComputation = {
    readonly nextCache: ProcessCache;
    readonly updates: ReadonlyArray<ProjectorState>;
};

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const isHeartbeatPayload = (payload: unknown): payload is ReadonlyDeep<HeartbeatPayload> => {
    if (!isRecord(payload)) {
        return false;
    }
    const { pid, name, host, cpu_pct: cpuPct, mem_mb: memMb, sid } = payload;
    const isNumber = (input: unknown): input is number => typeof input === 'number' && Number.isFinite(input);
    return (
        isNumber(pid) &&
        typeof name === 'string' &&
        typeof host === 'string' &&
        isNumber(cpuPct) &&
        isNumber(memMb) &&
        (sid === undefined || typeof sid === 'string')
    );
};

const keyOf = (heartbeat: ReadonlyDeep<HeartbeatPayload>): string =>
    `${heartbeat.host}:${heartbeat.name}:${heartbeat.pid}`;

const toProcessState = (heartbeat: ReadonlyDeep<HeartbeatPayload>, timestamp: number): ProjectorState => {
    const sid = heartbeat.sid;
    const state = {
        processId: keyOf(heartbeat),
        name: heartbeat.name,
        host: heartbeat.host,
        pid: heartbeat.pid,
        ...(sid === undefined ? {} : { sid }),
        cpu_pct: heartbeat.cpu_pct,
        mem_mb: heartbeat.mem_mb,
        last_seen_ts: timestamp,
        status: 'alive',
    } satisfies ProcessState;
    return Object.freeze(state) as ProjectorState;
};

const createInitialCache = (): ProcessCache => Object.freeze(new Map<string, ProjectorState>()) as ProcessCache;

const upsertCache = (cache: ProcessCache, state: ProjectorState): ProcessCache => {
    const entries = Array.from(cache.entries()).filter(([key]) => key !== state.processId);
    return Object.freeze(new Map<string, ProjectorState>([...entries, [state.processId, state]])) as ProcessCache;
};

const computeUpdatedState = (state: ProjectorState, status: ProcessState['status']): ProjectorState =>
    status === state.status ? state : (Object.freeze({ ...state, status }) as ProjectorState);

const computeStaleness = (cache: ProcessCache, now: number): CacheComputation => {
    const entries = Array.from(cache.entries()).map(([key, state]) => {
        const status: ProcessState['status'] = now - state.last_seen_ts > STALE_MS ? 'stale' : 'alive';
        const nextState = computeUpdatedState(state, status);
        return { key, state: nextState, changed: nextState !== state };
    });
    const nextCache = Object.freeze(
        new Map<string, ProjectorState>(entries.map(({ key, state }) => [key, state] as const)),
    ) as ProcessCache;
    const updates = entries.filter(({ changed }) => changed).map(({ state }) => state);
    return { nextCache, updates };
};

export async function startProcessProjector(bus: ProcessBus): Promise<() => void> {
    // eslint-disable-next-line functional/no-let
    let cache: ProcessCache = createInitialCache();

    const publishState = async (state: ProjectorState): Promise<void> => {
        await bus.publish(topics.ProcessState, state, { key: state.processId });
    };

    const unsubscribe = await bus.subscribe(
        topics.HeartbeatReceived,
        'process-projector',
        async (event: unknown, _context: unknown) => {
            if (!isRecord(event)) {
                return;
            }
            const { payload, ts } = event;
            if (!isHeartbeatPayload(payload) || typeof ts !== 'number') {
                return;
            }
            const processState = toProcessState(payload, ts);
            cache = upsertCache(cache, processState);
            await publishState(processState);
        },
        { from: 'earliest' },
    );

    const timer = setInterval(async () => {
        const now = Date.now();
        const { nextCache, updates } = computeStaleness(cache, now);
        cache = nextCache;
        await Promise.all(updates.map(publishState));
    }, 5_000);

    return () => {
        clearInterval(timer);
        if (typeof unsubscribe === 'function') {
            void unsubscribe();
        }
    };
}
