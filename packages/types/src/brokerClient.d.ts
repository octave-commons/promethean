// SPDX-License-Identifier: GPL-3.0-only
declare module '@shared/js/brokerClient.js' {
    export class BrokerClient {
        constructor(opts?: { url?: string; id?: string });
        connect(): Promise<void>;
        socket?: any;
        subscribe(topic: string, handler: (event: any) => void): void;
        unsubscribe(topic: string): void;
        publish(type: string, payload: any, opts?: Record<string, any>): void;
        enqueue(queue: string, task: any): void;
        ready(queue: string): void;
        ack(taskId: string): void;
        heartbeat(): void;
        onTaskReceived(cb: (task: any) => void): void;
    }
    export { BrokerClient as default };
}
