/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types, functional/prefer-immutable-types */
declare module '@promethean/legacy/serviceTemplate.js' {
    export type Broker = {
        publish(topic: string, message: unknown): void;
    };
    export type BrokerTask = {
        id: string;
        payload?: {
            prompt?: string;
            context?: readonly unknown[];
            format?: unknown;
            tools?: unknown;
            replyTopic?: string;
        };
    };
    export function startService(opts: {
        id: string;
        queues: readonly string[];
        handleTask: (task: BrokerTask) => Promise<void>;
    }): Promise<Broker>;
}

declare module '@promethean/legacy/heartbeat/index.js' {
    export class HeartbeatClient {
        constructor(options: { name: string });
        sendOnce(): Promise<void>;
        start(): void;
    }
}
