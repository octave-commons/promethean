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
const gkey = (t: string, g: string) => `${t}::${g}`;

class InMemoryStore implements EventStore {
    private store = new Map<string, EventRecord[]>(); // topic -> events

    private events(topic: string) {
        const existing = this.store.get(topic);
        if (existing) return existing;
        const created: EventRecord[] = [];
        this.store.set(topic, created);
        return created;
    }

    async insert<T>(e: EventRecord<T>): Promise<void> {
        this.events(e.topic).push(e as unknown as EventRecord);
    }

    async scan(topic: string, params: { afterId?: UUID; ts?: number; limit?: number }): Promise<EventRecord[]> {
        const evs = this.events(topic);
        const startIndex = (() => {
            if (params.afterId) {
                const idx = evs.findIndex((e) => e.id === params.afterId);
                return idx >= 0 ? idx + 1 : 0;
            }
            if (params.ts) {
                const idx = evs.findIndex((e) => e.ts >= (params.ts as number));
                return idx >= 0 ? idx : evs.length; // if none >= ts, start at end
            }
            return 0;
        })();
        const end = Math.min(evs.length, startIndex + (params.limit ?? 1000));
        return evs.slice(startIndex, end);
    }

    async latestByKey(topic: string, keys: string[]): Promise<Record<string, EventRecord | undefined>> {
        const evs = this.events(topic);
        const reversed = [...evs].reverse();
        const entries = keys.map((k) => {
            const match = reversed.find((event) => event.key === k);
            return [k, match] as const;
        });
        return Object.fromEntries(entries) as Record<string, EventRecord | undefined>;
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

type Handler = (e: EventRecord, ctx: DeliveryContext) => Promise<void> | void;

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

    private async ensureCursor({
        topic,
        group,
        from = 'latest',
        ts,
        afterId,
    }: {
        topic: string;
        group: string;
        from?: SubscribeOptions['from'];
        ts?: number;
        afterId?: UUID;
    }): Promise<CursorPosition> {
        const existing = await this.cursors.get(topic, group);
        if (existing) return existing;

        const lastId = await (async (): Promise<UUID | undefined> => {
            if (from === 'latest') {
                const tail = await this.store.scan(topic, { limit: 1, afterId: undefined });
                return tail.length ? tail[tail.length - 1]!.id : undefined;
            }
            if (from === 'afterId' && afterId) {
                return afterId;
            }
            if (from === 'ts' && ts) {
                const head = await this.store.scan(topic, { ts, limit: 1 });
                if (head.length) {
                    return undefined;
                }
            }
            return undefined;
        })();

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
        for (const sub of this.subs.values()) if (sub.topic === topic) void this.drain(sub);
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
        await this.ensureCursor({ topic, group, from: opts.from, ts: opts.ts, afterId: opts.afterId });
        const sub = new Subscription(topic, group, handler, {
            group,
            ...opts,
        } as SubscribeOptions);
        this.subs.set(key, sub);
        void this.drain(sub);
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
            void this.drain(sub);
        }
        return { id, ok: true };
    }

    async nack(topic: string, group: string, id: UUID): Promise<Ack> {
        const sub = this.subs.get(gkey(topic, group));
        if (sub) {
            // drop inFlight marker, schedule retry
            if (sub.inFlightId === id) sub.inFlightId = undefined;
            this.scheduleRetry(sub);
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
            if (this.shouldPause(sub)) return;

            const delivery = await this.nextDelivery(sub);
            if (!delivery) return;

            const { event, cursor } = delivery;
            const ctx = this.prepareContext(sub, cursor, event);
            const delivered = await this.tryDeliver(sub, event, ctx);
            if (!delivered) return;

            if (sub.manualAck) {
                sub.inFlightId = event.id;
                return;
            }

            await this.ack(sub.topic, sub.group, event.id);
            await this.drain(sub);
        } finally {
            sub.draining = false;
            await this.maybeKick(sub);
        }
    }

    private shouldPause(sub: Subscription): boolean {
        return sub.manualAck && sub.inFlightId !== undefined;
    }

    private async nextDelivery(sub: Subscription): Promise<{ event: EventRecord; cursor: CursorPosition } | null> {
        const cursor = await this.cursors.get(sub.topic, sub.group);
        if (!cursor) return null;
        const batch = await this.store.scan(sub.topic, {
            afterId: cursor.lastId,
            limit: 1,
        });
        if (!batch.length) return null;
        return { event: batch[0]!, cursor };
    }

    private prepareContext(sub: Subscription, cursor: CursorPosition, event: EventRecord): DeliveryContext {
        const attempt = (sub.attemptById.get(event.id) ?? 0) + 1;
        sub.attemptById.set(event.id, attempt);
        return {
            attempt,
            maxAttempts: sub.maxAttempts,
            cursor,
        };
    }

    private async tryDeliver(sub: Subscription, event: EventRecord, ctx: DeliveryContext): Promise<boolean> {
        try {
            await Promise.resolve(sub.handler(event, ctx));
            return true;
        } catch (_err) {
            if (ctx.attempt < sub.maxAttempts) {
                this.scheduleRetry(sub);
            }
            return false;
        }
    }

    private scheduleRetry(sub: Subscription): void {
        if (sub.retryTimer) clearTimeout(sub.retryTimer);
        sub.retryTimer = setTimeout(() => {
            sub.retryTimer = undefined;
            void this.drain(sub);
        }, sub.retryDelayMs);
    }

    private async maybeKick(sub: Subscription): Promise<void> {
        const cursor = await this.cursors.get(sub.topic, sub.group);
        const batch = await this.store.scan(sub.topic, {
            afterId: cursor?.lastId,
            limit: 1,
        });
        if (sub.active && !sub.draining && batch.length && (!sub.manualAck || !sub.inFlightId)) {
            queueMicrotask(() => {
                void this.drain(sub);
            });
        }
    }
}
