declare module '@promethean/event/types.js' {
    export type EventRecord<T = unknown> = { payload: T };
    export type PublishOptions = Record<string, unknown>;
    export interface EventBus {
        publish<T>(topic: string, payload: T, opts?: PublishOptions): Promise<EventRecord<T>>;
    }
}
