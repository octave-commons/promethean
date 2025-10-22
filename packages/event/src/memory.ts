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

export class InMemoryEventBus implements EventBus {
    private store: EventStore;
    private cursors: CursorStore;
    private subs = new Map<GroupKey, Subscription>();
    private nextId = 1;

    constructor(store?: EventStore, cursors?: CursorStore) {
        this.store = store ?? new InMemoryStore();
        this.cursors = cursors ?? new InMemoryCursorStore();
    }

    private async ensureCursor(
        topic: string,
        group: string,
        from: SubscribeOptions['from'] = 'latest',
        ts?: number,
        afterId?: UUID,
    ): Promise<CursorPosition> {
        const cur = await this.cursors.get(topic, group);
        if (cur) return cur;
        let lastId: UUID | undefined;
        if (from === 'latest') {
            const tail = await this.store.scan(topic, { limit: 1, afterId: undefined });
            if (tail.length) lastId = tail[tail.length - 1]!.id;
        } else if (from === 'afterId' && afterId) {
            lastId = afterId;
        } else if (from === 'ts' && ts) {
            const head = await this.store.scan(topic, { ts, limit: 1 });
            if (head.length) {
                // start before the first >= ts
                // simpler: set no lastId and drain logic will find first >= ts
                lastId = undefined;
            }
        }
        const pos: CursorPosition = { topic, lastId, lastTs: undefined };
        await this.cursors.set(topic, group, pos);
        return pos;
    }

    async publish<T>(topic: string, payload: T, opts: PublishOptions = {}): Promise<EventRecord<T>> {
        const rec: EventRecord<T> = {
            id: opts.id ?? String(this.nextId++),
            sid: opts.sid,
            ts: opts.ts ?? Date.now(),
            topic,
            key: opts.key,
            headers: opts.headers,
            payload,
            caused_by: opts.caused_by,
            tags: opts.tags,
        };
        await this.store.insert(rec);
        // Nudge subs for this topic
        for (const sub of this.subs.values()) if (sub.topic === topic) this.drain(sub);
        return rec;
    }

    async subscribe(
        topic: string,
        group: string,
        handler: Handler,
        opts: Omit<SubscribeOptions, 'group'> = {},
    ): Promise<() => Promise<void>> {
        const key = gkey(topic, group);
        if (this.subs.has(key)) throw new Error(`Group already subscribed: ${key}`);
        await this.ensureCursor(topic, group, opts.from, opts.ts, opts.afterId);
        const sub = new Subscription(topic, group, handler, {
            group,
            ...opts,
        } as SubscribeOptions);
        this.subs.set(key, sub);
        this.drain(sub);
        return async () => {
            sub.active = false;
            if (sub.retryTimer) clearTimeout(sub.retryTimer);
            this.subs.delete(key);
        };
    }

    async ack(topic: string, group: string, id: UUID): Promise<Ack> {
        const key = gkey(topic, group);
        const cur = (await this.cursors.get(topic, group)) ?? { topic };
        cur.lastId = id;
        await this.cursors.set(topic, group, cur);
        const sub = this.subs.get(key);
        if (sub?.manualAck && sub.inFlightId === id) {
            sub.inFlightId = undefined;
            this.drain(sub);
        }
        return { id, ok: true };
    }

    async nack(topic: string, group: string, id: UUID): Promise<Ack> {
        const sub = this.subs.get(gkey(topic, group));
        if (sub) {
            // drop inFlight marker, schedule retry
            if (sub.inFlightId === id) sub.inFlightId = undefined;
            if (sub.retryTimer) clearTimeout(sub.retryTimer);
            sub.retryTimer = setTimeout(() => {
                sub.retryTimer = undefined;
                this.drain(sub);
            }, sub.retryDelayMs);
        }
        return { id, ok: true };
    }

    async getCursor(topic: string, group: string): Promise<CursorPosition | null> {
        return this.cursors.get(topic, group);
    }

    async setCursor(topic: string, group: string, cursor: CursorPosition): Promise<void> {
        await this.cursors.set(topic, group, cursor);
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
