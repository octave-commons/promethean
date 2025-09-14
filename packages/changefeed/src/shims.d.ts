declare module '@promethean/event/types.js' {
    export type EventRecord<T = unknown> = { payload: T };
    export type PublishOptions = {
        key?: string;
        headers?: Record<string, string>;
    } & Record<string, unknown>;
    export type EventBus = {
        publish<T>(topic: string, payload: T, opts?: PublishOptions): Promise<EventRecord<T>>;
    }
}
