/**
 * Functional In-Memory Event Bus
 *
 * This file contains pure functional implementations of event bus operations.
 * These were previously instance methods on InMemoryEventBus class.
 */

import type {
    EventRecord,
    PublishOptions,
    SubscribeOptions,
    DeliveryContext,
    CursorPosition,
    EventStore,
    CursorStore,
    Ack,
    UUID,
    Handler,
} from './types.js';

type GroupKey = string; // `${topic}::${group}`
const gkey = (t: string, g: string): string => `${t}::${g}`;

// Event bus state interface
export interface InMemoryEventBusState {
    store: EventStore;
    cursors: CursorStore;
    subs: Map<GroupKey, Subscription>;
    nextId: number;
}

// Subscription state
export interface Subscription {
    topic: string;
    group: string;
    handler: Handler;
    active: boolean;
    draining: boolean;
    manualAck: boolean;
    inFlightId?: UUID;
    attemptById: Map<UUID, number>;
    retryDelayMs: number;
    maxAttempts: number;
    retryTimer?: any;
}

// Create initial event bus state
export const createInMemoryEventBusState = (store?: EventStore, cursors?: CursorStore): InMemoryEventBusState => ({
    store: store ?? new InMemoryStore(),
    cursors: cursors ?? new InMemoryCursorStore(),
    subs: new Map(),
    nextId: 1,
});

// Ensure cursor exists
export const ensureCursor = async (
    state: InMemoryEventBusState,
    topic: string,
    group: string,
    from: SubscribeOptions['from'] = 'latest',
    ts?: number,
    afterId?: UUID,
): Promise<{ cursor: CursorPosition; newState: InMemoryEventBusState }> => {
    const cur = await state.cursors.get(topic, group);
    if (cur) return { cursor: cur, newState: state };

    let lastId: UUID | undefined;
    if (from === 'latest') {
        const tail = await state.store.scan(topic, { limit: 1, afterId: undefined });
        if (tail.length) lastId = tail[tail.length - 1]!.id;
    } else if (from === 'afterId' && afterId) {
        lastId = afterId;
    } else if (from === 'ts' && ts) {
        const head = await state.store.scan(topic, { ts, limit: 1 });
        if (head.length) {
            // start before the first >= ts
            // simpler: set no lastId and drain logic will find first >= ts
            lastId = undefined;
        }
    }

    const pos: CursorPosition = { topic, lastId, lastTs: undefined };
    await state.cursors.set(topic, group, pos);
    return { cursor: pos, newState: state };
};

// Publish event
export const publishEvent = async <T>(
    state: InMemoryEventBusState,
    topic: string,
    payload: T,
    opts: PublishOptions = {},
): Promise<{ event: EventRecord<T>; newState: InMemoryEventBusState }> => {
    const rec: EventRecord<T> = {
        id: opts.id ?? String(state.nextId),
        sid: opts.sid,
        ts: opts.ts ?? Date.now(),
        topic,
        key: opts.key,
        headers: opts.headers,
        payload,
        caused_by: opts.caused_by,
        tags: opts.tags,
    };

    await state.store.insert(rec);

    // Nudge subs for this topic
    const newState = {
        ...state,
        nextId: state.nextId + 1,
    };

    // Trigger draining for subscriptions
    for (const sub of state.subs.values()) {
        if (sub.topic === topic) {
            // Note: In a real functional implementation, this would need to be handled differently
            // to avoid side effects. For now, we'll keep the original behavior.
            setTimeout(() => drainSubscription(newState, sub), 0);
        }
    }

    return { event: rec, newState };
};

// Subscribe to topic
export const subscribeToTopic = async (
    state: InMemoryEventBusState,
    topic: string,
    group: string,
    handler: Handler,
    opts: Omit<SubscribeOptions, 'group'> = {},
): Promise<{ unsubscribe: () => Promise<void>; newState: InMemoryEventBusState }> => {
    const key = gkey(topic, group);
    if (state.subs.has(key)) throw new Error(`Group already subscribed: ${key}`);

    const { cursor } = await ensureCursor(state, topic, group, opts.from, opts.ts, opts.afterId);

    const sub: Subscription = {
        topic,
        group,
        handler,
        active: true,
        draining: false,
        manualAck: opts.manualAck ?? false,
        inFlightId: undefined,
        attemptById: new Map(),
        retryDelayMs: opts.retryDelayMs ?? 1000,
        maxAttempts: opts.maxAttempts ?? 5,
    };

    const newSubs = new Map(state.subs);
    newSubs.set(key, sub);

    const newState = {
        ...state,
        subs: newSubs,
    };

    // Start draining
    setTimeout(() => drainSubscription(newState, sub), 0);

    const unsubscribe = async () => {
        sub.active = false;
        if (sub.retryTimer) clearTimeout(sub.retryTimer);
        newSubs.delete(key);
    };

    return { unsubscribe, newState };
};

// Acknowledge event
export const acknowledgeEvent = async (
    state: InMemoryEventBusState,
    topic: string,
    group: string,
    id: UUID,
): Promise<{ ack: Ack; newState: InMemoryEventBusState }> => {
    const key = gkey(topic, group);
    const cur = (await state.cursors.get(topic, group)) ?? { topic };
    cur.lastId = id;
    await state.cursors.set(topic, group, cur);

    const sub = state.subs.get(key);
    if (sub?.manualAck && sub.inFlightId === id) {
        sub.inFlightId = undefined;
        // Continue draining
        setTimeout(() => drainSubscription(state, sub), 0);
    }

    return { ack: { id, ok: true }, newState: state };
};

// Negative acknowledge event
export const negativeAcknowledgeEvent = async (
    state: InMemoryEventBusState,
    topic: string,
    group: string,
    id: UUID,
): Promise<{ ack: Ack; newState: InMemoryEventBusState }> => {
    const sub = state.subs.get(gkey(topic, group));
    if (sub) {
        // drop inFlight marker, schedule retry
        if (sub.inFlightId === id) sub.inFlightId = undefined;
        if (sub.retryTimer) clearTimeout(sub.retryTimer);
        sub.retryTimer = setTimeout(() => {
            sub.retryTimer = undefined;
            drainSubscription(state, sub);
        }, sub.retryDelayMs);
    }

    return { ack: { id, ok: true }, newState: state };
};

// Get cursor
export const getCursor = async (
    state: InMemoryEventBusState,
    topic: string,
    group: string,
): Promise<CursorPosition | null> => {
    return state.cursors.get(topic, group);
};

// Set cursor
export const setCursor = async (
    state: InMemoryEventBusState,
    topic: string,
    group: string,
    cursor: CursorPosition,
): Promise<InMemoryEventBusState> => {
    await state.cursors.set(topic, group, cursor);
    return state;
};

// Core draining loop; delivers a single event per turn unless auto-ack
const drainSubscription = async (state: InMemoryEventBusState, sub: Subscription): Promise<void> => {
    if (!sub.active || sub.draining) return;
    sub.draining = true;

    try {
        // Pause if waiting for manual ack
        if (sub.manualAck && sub.inFlightId) return;

        const cur = await state.cursors.get(sub.topic, sub.group);
        if (!cur) return;

        const afterId = cur.lastId;
        const batch = await state.store.scan(sub.topic, {
            afterId,
            limit: 1,
        });

        if (!batch.length) return; // nothing to do
        const next = batch[0]!;

        // delivery context
        const attempt = (sub.attemptById.get(next.id) ?? 0) + 1;
        sub.attemptById.set(next.id, attempt);
        const ctx: DeliveryContext = {
            attempt,
            maxAttempts: sub.maxAttempts,
            cursor: cur,
        };

        try {
            await Promise.resolve(sub.handler(next, ctx));
        } catch (_err) {
            // schedule retry; don't advance cursor
            if (attempt < sub.maxAttempts) {
                if (sub.retryTimer) clearTimeout(sub.retryTimer);
                sub.retryTimer = setTimeout(() => {
                    sub.retryTimer = undefined;
                    drainSubscription(state, sub);
                }, sub.retryDelayMs);
            }
            return;
        }

        if (sub.manualAck) {
            // wait for external ack
            sub.inFlightId = next.id;
            return;
        }

        // auto-ack path: advance cursor and loop
        await acknowledgeEvent(state, sub.topic, sub.group, next.id);
        // tail recurse via re-entry
        return drainSubscription(state, sub);
    } finally {
        sub.draining = false;
        // opportunistic kick if more work queued
        const cur = await state.cursors.get(sub.topic, sub.group);
        const batch = await state.store.scan(sub.topic, {
            afterId: cur?.lastId,
            limit: 1,
        });
        if (sub.active && !sub.draining && batch.length && (!sub.manualAck || !sub.inFlightId)) {
            queueMicrotask(() => drainSubscription(state, sub));
        }
    }
};

// Import the store implementations (these would need to be extracted from the original file)
class InMemoryStore implements EventStore {
    private store = new Map<string, EventRecord<unknown>[]>();

    private events(topic: string): EventRecord<unknown>[] {
        let arr = this.store.get(topic);
        if (!arr) {
            arr = [];
            this.store.set(topic, arr);
        }
        return arr;
    }

    async insert<T>(e: EventRecord<T>): Promise<void> {
        this.events(e.topic).push(e);
    }

    async scan(
        topic: string,
        opts: { afterId?: UUID; ts?: number; limit?: number } = {},
    ): Promise<EventRecord<unknown>[]> {
        const evts = this.events(topic);
        let start = 0;
        if (opts.afterId) {
            start = evts.findIndex((e) => e.id === opts.afterId) + 1;
        } else if (opts.ts !== undefined) {
            start = evts.findIndex((e) => e.ts! >= opts.ts);
        }
        return evts.slice(start, start + (opts.limit ?? evts.length));
    }
}

class InMemoryCursorStore implements CursorStore {
    private store = new Map<string, CursorPosition>();

    private key(topic: string, group: string): string {
        return `${topic}::${group}`;
    }

    async get(topic: string, group: string): Promise<CursorPosition | null> {
        return this.store.get(this.key(topic, group)) ?? null;
    }

    async set(topic: string, group: string, pos: CursorPosition): Promise<void> {
        this.store.set(this.key(topic, group), pos);
    }
}
