declare module '@promethean/event/mongo.js';

declare module '@promethean/event/types.js' {
    import type { ReadonlyDeep } from 'type-fest';

    export type EventRecord<T = unknown> = ReadonlyDeep<
        {
            readonly id?: string;
            readonly ts?: number;
            readonly topic?: string;
            readonly key?: string;
            readonly payload: T;
            readonly headers?: Record<string, string>;
        } & Record<string, unknown>
    >;

    export type PublishOptions = ReadonlyDeep<
        {
            readonly key?: string;
            readonly headers?: Record<string, string>;
        } & Record<string, unknown>
    >;

    export type EventBus = {
        publish<T>(topic: string, payload: ReadonlyDeep<T>, opts?: PublishOptions): Promise<EventRecord<T>>;
    };
}
