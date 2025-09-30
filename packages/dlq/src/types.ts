export type DeadLetterEvent = Readonly<{
    id?: string;
    sid?: string;
    topic: string;
    key?: string;
    headers?: Readonly<Record<string, unknown>>;
    payload: unknown;
    caused_by?: ReadonlyArray<string>;
    tags?: ReadonlyArray<string>;
    ts?: number;
}>;

export type DLQRecord = Readonly<{
    topic: string;
    group?: string;
    original: DeadLetterEvent;
    err: string;
    ts: number;
    attempts?: number;
}>;

export type DLQScanParams = Readonly<{
    afterId?: string;
    ts?: number;
    limit?: number;
}>;

export type StoredRecord = Readonly<{
    id: string;
    payload?: unknown;
}>;

export type DLQStore = Readonly<{
    scan(topic: string, params: DLQScanParams): Promise<ReadonlyArray<StoredRecord>>;
}>;

export type DeliveryCtx = Readonly<{
    attempt: number;
    maxAttempts: number;
}>;

export type DLQEvent = DeadLetterEvent & Readonly<{ id: string }>;

export type DLQBus = Readonly<{
    publish(topic: string, payload: unknown, opts?: Readonly<Record<string, unknown>>): Promise<unknown>;
    subscribe(
        topic: string,
        group: string,
        handler: (event: DLQEvent, ctx?: DeliveryCtx) => Promise<void>,
        opts?: Readonly<Record<string, unknown>>,
    ): Promise<unknown>;
}>;

export const DLQ_TOPIC_PREFIX = 'dlq.';

export const dlqTopic = (t: string): string => `${DLQ_TOPIC_PREFIX}${t}`;
