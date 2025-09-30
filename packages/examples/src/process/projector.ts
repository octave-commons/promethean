// loosen typing to avoid cross-package type coupling
import { Topics } from '@promethean/event/topics.js';

import { HeartbeatPayload, ProcessState } from './types.js';

const STALE_MS = 15_000;

type ProjectorEvent = { readonly ts: number; readonly payload: HeartbeatPayload };
type ProjectorHandler = (event: ProjectorEvent, context: Readonly<unknown>) => Promise<void>;
type ProjectorBus = {
    publish<T>(topic: string, payload: T, options?: Readonly<{ key?: string }>): Promise<unknown>;
    subscribe(
        topic: string,
        group: string,
        handler: ProjectorHandler,
        options?: Readonly<Record<string, unknown>>,
    ): Promise<() => Promise<void>>;
};

const topics = Topics as Readonly<{ HeartbeatReceived: string; ProcessState: string }>;

const keyOf = (heartbeat: HeartbeatPayload) => `${heartbeat.host}:${heartbeat.name}:${heartbeat.pid}`;

const toProcessState = (event: ProjectorEvent): ProcessState => {
    const heartbeat = event.payload;
    return {
        processId: keyOf(heartbeat),
        name: heartbeat.name,
        host: heartbeat.host,
        pid: heartbeat.pid,
        ...(heartbeat.sid !== undefined ? { sid: heartbeat.sid } : {}),
        cpu_pct: heartbeat.cpu_pct,
        mem_mb: heartbeat.mem_mb,
        last_seen_ts: event.ts,
        status: 'alive',
    };
};

const startStalenessScanner = (
    cache: Map<string, ProcessState>,
    publishState: (state: ProcessState) => Promise<void>,
) =>
    setInterval(async () => {
        const now = Date.now();
        for (const [_key, state] of cache) {
            const status = now - state.last_seen_ts > STALE_MS ? 'stale' : 'alive';
            if (status !== state.status) {
                state.status = status;
                await publishState(state);
            }
        }
    }, 5_000);

export async function startProcessProjector(bus: ProjectorBus): Promise<() => void> {
    const cache = new Map<string, ProcessState>();

    async function publishState(ps: ProcessState): Promise<void> {
        await bus.publish(topics.ProcessState, ps, { key: ps.processId });
    }

    // subscriber
    const unsubscribe = await bus.subscribe(
        topics.HeartbeatReceived,
        'process-projector',
        async (event: ProjectorEvent) => {
            const state = toProcessState(event);
            cache.set(state.processId, state);
            await publishState(state);
        },
        { from: 'earliest' },
    );

    // staleness scanner
    const intervalHandle = startStalenessScanner(cache, publishState);

    return (): void => {
        clearInterval(intervalHandle);
        void unsubscribe();
    };
}
