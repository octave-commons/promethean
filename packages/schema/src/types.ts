export type EventHeaders = Readonly<Record<string, string>>;

export type PublishOptions = Readonly<{ readonly headers?: EventHeaders }> & Readonly<Record<string, unknown>>;

export type DeliveryContext = Readonly<{
    readonly attempt: number;
    readonly maxAttempts: number;
}> &
    Readonly<Record<string, unknown>>;

export type EventRecord<T = unknown> = Readonly<{
    readonly topic: string;
    readonly payload: T;
    readonly ts: number;
    readonly headers?: EventHeaders;
}> &
    Readonly<Record<string, unknown>>;

export type SubscribeOptions = Readonly<Record<string, unknown>>;

export type SchemaEventBus = Readonly<{
    publish<T>(topic: string, payload: T, opts?: PublishOptions): Promise<EventRecord<T>>;
    subscribe(
        topic: string,
        group: string,
        handler: (event: EventRecord, ctx: DeliveryContext) => Promise<void>,
        opts?: SubscribeOptions,
    ): Promise<() => Promise<void>>;
}> &
    Readonly<Record<string, unknown>>;
