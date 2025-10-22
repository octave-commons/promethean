// In-memory EventBus implementation that conforms to ./types
import type {
    EventBus,
    EventRecord,
    PublishOptions,
    SubscribeOptions,
    DeliveryContext,
    CursorPosition,
    EventStore,
    CursorStore,
    Ack,
    UUID,
} from './types.js';

type GroupKey = string; // `${topic}::${group}`
const gkey = (t: string, g: string): string => `${t}::${g}`;

class InMemoryStore implements EventStore {
    private store = new Map<string, EventRecord<unknown>[]>(); // topic -> events

    private events(topic: string): EventRecord<unknown>[] {
        let arr = this.store.get(topic);
        if (!arr) {
            arr = [];
            this.store.set(topic, arr);
        }
        return arr;
    }

    async insert<T>(e: EventRecord<T>): Promise<void> {
        this.events(e.topic).push(e as unknown as EventRecord);
    }

    async scan(
        topic: string,
        params: { afterId?: UUID; ts?: number; limit?: number },
    ): Promise<EventRecord<unknown>[]> {
        const evs = this.events(topic);
        let startIndex = 0;
        if (params.afterId) {
            const idx = evs.findIndex((e) => e.id === params.afterId);
            startIndex = idx >= 0 ? idx + 1 : 0;
        } else if (params.ts) {
            const idx = evs.findIndex((e) => e.ts >= (params.ts as number));
            startIndex = idx >= 0 ? idx : evs.length; // if none >= ts, start at end
        }
        const end = Math.min(evs.length, startIndex + (params.limit ?? 1000));
        return evs.slice(startIndex, end);
    }

    async latestByKey(topic: string, keys: string[]): Promise<Record<string, EventRecord<unknown> | undefined>> {
        const evs = this.events(topic);
        const out: Record<string, EventRecord<unknown> | undefined> = {};
        for (const k of keys) {
            // last event with matching key
            for (let i = evs.length - 1; i >= 0; i--) {
                const e = evs[i]!;
                if (e.key === k) {
                    out[k] = e;
                    break;
                }
            }
            if (!(k in out)) out[k] = undefined;
        }
        return out;
    }
}

class InMemoryCursorStore implements CursorStore {
    private cursors = new Map<GroupKey, CursorPosition>();
    get(topic: string, group: string): Promise<CursorPosition | null> {
        return Promise.resolve(this.cursors.get(gkey(topic, group)) ?? null);
    }
    set(topic: string, group: string, cursor: CursorPosition): Promise<void> {
        this.cursors.set(gkey(topic, group), { ...cursor });
        return Promise.resolve();
    }
}

type Handler = (e: EventRecord<unknown>, ctx: DeliveryContext) => Promise<void> | void;

class Subscription {
    topic: string;
    group: string;
    handler: Handler;
    manualAck: boolean;
    retryDelayMs: number;
    maxAttempts: number;
    active = true;
    draining = false;
    inFlightId?: string;
    attemptById = new Map<string, number>();
    retryTimer?: ReturnType<typeof setTimeout>;

    constructor(topic: string, group: string, handler: Handler, opts: SubscribeOptions) {
        this.topic = topic;
        this.group = group;
        this.handler = handler;
        this.manualAck = !!opts.manualAck;
        this.retryDelayMs = opts.ackTimeoutMs ?? 10;
        this.maxAttempts = opts.maxAttempts ?? 5;
    }
}

// Import functional implementations
import {
    createInMemoryEventBusState,
    publishEvent,
    subscribeToTopic,
    acknowledgeEvent,
    negativeAcknowledgeEvent,
    getCursor as getCursorFn,
    setCursor as setCursorFn,
    InMemoryEventBusState,
} from './memory-functional.js';

/**
 * @deprecated Use the functional implementations from './memory-functional' instead.
 * This class is provided for backward compatibility and will be removed in a future version.
 */
export class InMemoryEventBus implements EventBus {
    private state: InMemoryEventBusState;

    constructor(store?: EventStore, cursors?: CursorStore) {
        this.state = createInMemoryEventBusState(store, cursors);
    }

    async publish<T>(topic: string, payload: T, opts: PublishOptions = {}): Promise<EventRecord<T>> {
        console.warn('InMemoryEventBus.publish is deprecated. Use publishEvent from memory-functional instead.');
        const result = await publishEvent(this.state, topic, payload, opts);
        this.state = result.newState;
        return result.event;
    }

    async subscribe(
        topic: string,
        group: string,
        handler: Handler,
        opts: Omit<SubscribeOptions, 'group'> = {},
    ): Promise<() => Promise<void>> {
        console.warn('InMemoryEventBus.subscribe is deprecated. Use subscribeToTopic from memory-functional instead.');
        const result = await subscribeToTopic(this.state, topic, group, handler, opts);
        this.state = result.newState;
        return result.unsubscribe;
    }

    async ack(topic: string, group: string, id: UUID): Promise<Ack> {
        console.warn('InMemoryEventBus.ack is deprecated. Use acknowledgeEvent from memory-functional instead.');
        const result = await acknowledgeEvent(this.state, topic, group, id);
        this.state = result.newState;
        return result.ack;
    }

    async nack(topic: string, group: string, id: UUID): Promise<Ack> {
        console.warn(
            'InMemoryEventBus.nack is deprecated. Use negativeAcknowledgeEvent from memory-functional instead.',
        );
        const result = await negativeAcknowledgeEvent(this.state, topic, group, id);
        this.state = result.newState;
        return result.ack;
    }

    async getCursor(topic: string, group: string): Promise<CursorPosition | null> {
        console.warn('InMemoryEventBus.getCursor is deprecated. Use getCursor from memory-functional instead.');
        return getCursorFn(this.state, topic, group);
    }

    async setCursor(topic: string, group: string, cursor: CursorPosition): Promise<void> {
        console.warn('InMemoryEventBus.setCursor is deprecated. Use setCursor from memory-functional instead.');
        this.state = await setCursorFn(this.state, topic, group, cursor);
    }

    // Core draining loop; delivers a single event per turn unless auto-ack
    private async drain(sub: Subscription): Promise<void> {
        if (!sub.active || sub.draining) return;
        sub.draining = true;
        try {
            // Pause if waiting for manual ack
            if (sub.manualAck && sub.inFlightId) return;

            const cur = await this.cursors.get(sub.topic, sub.group);
            if (!cur) return;
            const afterId = cur.lastId;
            const batch = await this.store.scan(sub.topic, {
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
                        this.drain(sub);
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
            await this.ack(sub.topic, sub.group, next.id);
            // tail recurse via re-entry
            return this.drain(sub);
        } finally {
            sub.draining = false;
            // opportunistic kick if more work queued
            const cur = await this.cursors.get(sub.topic, sub.group);
            const batch = await this.store.scan(sub.topic, {
                afterId: cur?.lastId,
                limit: 1,
            });
            if (sub.active && !sub.draining && batch.length && (!sub.manualAck || !sub.inFlightId)) {
                queueMicrotask(() => this.drain(sub));
            }
        }
    }
}
