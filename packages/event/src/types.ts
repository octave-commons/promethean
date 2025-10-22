export type UUID = string;
export type Millis = number;
export type Vec8 = [number, number, number, number, number, number, number, number];

export type EventHeaders = Record<string, string>;
export type EventTags = string[];
export type CausedBy = UUID[];

export type EventRecord<T = unknown> = {
    id: UUID; // uuidv7
    sid?: UUID; // boot/session id
    ts: Millis; // epoch ms
    topic: string; // e.g. "heartbeat.received"
    key?: string; // for compaction/partitioning
    partition?: number; // adapter-defined
    headers?: EventHeaders;
    payload: T; // JSON-safe
    caused_by?: CausedBy;
    tags?: EventTags;
};

export type DeliveryContext = {
    attempt: number;
    maxAttempts: number;
    // last known offset for this subscription/group in this topic
    cursor?: CursorPosition;
};

export type CursorPosition = {
    topic: string;
    lastId?: UUID; // last delivered acked id
    lastTs?: Millis; // optional for time-based catchup
};

export type SubscribeOptions = {
    group: string; // durable consumer group name
    from?: 'latest' | 'earliest' | 'ts' | 'afterId';
    ts?: Millis;
    afterId?: UUID;
    batchSize?: number; // default 100
    maxInFlight?: number; // default 1000
    ackTimeoutMs?: number; // default 30_000
    maxAttempts?: number; // default 5
    manualAck?: boolean; // if true, caller must ack explicitly
    filter?(e: EventRecord): boolean;
    topics?: string[]; // if adapter supports multi-topic fan-in
};

export type PublishOptions = {
    id?: UUID;
    ts?: Millis;
    key?: string;
    headers?: EventHeaders;
    tags?: EventTags;
    caused_by?: CausedBy;
    sid?: UUID;
};

export type Ack = {
    id: UUID;
    ok: boolean;
    err?: string;
};

export type EventBus = {
    publish<T>(topic: string, payload: T, opts?: PublishOptions): Promise<EventRecord<T>>;
    subscribe(
        topic: string,
        group: string,
        handler: (e: EventRecord, ctx: DeliveryContext) => Promise<void>,
        opts?: Omit<SubscribeOptions, 'group'>,
    ): Promise<() => Promise<void>>; // unsubscribe
    ack(topic: string, group: string, id: UUID): Promise<Ack>;
    nack(topic: string, group: string, id: UUID, reason?: string): Promise<Ack>;
    // cursor utilities
    getCursor(topic: string, group: string): Promise<CursorPosition | null>;
    setCursor(topic: string, group: string, cursor: CursorPosition): Promise<void>;
};

export type CursorStore = {
    get(topic: string, group: string): Promise<CursorPosition | null>;
    set(topic: string, group: string, cursor: CursorPosition): Promise<void>;
};

export type EventStore = {
    insert<T>(e: EventRecord<T>): Promise<void>;
    // range scan from afterId OR from ts; returns ascending by ts (then id)
    scan(topic: string, params: { afterId?: UUID; ts?: Millis; limit?: number }): Promise<EventRecord[]>;
    // optional compaction helpers
    latestByKey?(topic: string, keys: string[]): Promise<Record<string, EventRecord | undefined>>;
};
