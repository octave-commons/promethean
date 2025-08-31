import type { BrokerClient as JsBrokerClient } from '@promethean/legacy/brokerClient.js';

type Handler<T> = (msg: T) => void;

export class AgentBus {
    private open = false;
    private pending: {
        topic?: string;
        handler?: Handler<any>;
        payload?: any;
        queue?: string;
        task?: any;
        kind: 'pub' | 'sub' | 'enq';
    }[] = [];

    constructor(private broker: JsBrokerClient) {
        // `BrokerClient.connect()` opens the socket; mirror previous "open" behavior.
        void this.broker.connect().then(() => {
            this.open = true;
            for (const item of this.pending) {
                if (item.kind === 'sub' && item.handler && item.topic) {
                    this.broker.subscribe(item.topic, (evt: any) => {
                        const arr = this.handlers.get(item.topic!);
                        if (arr) arr.forEach((fn) => fn(evt?.payload));
                    });
                } else if (item.kind === 'pub' && item.topic) {
                    // maintain legacy shape
                    this.broker.publish(item.topic, item.payload);
                } else if (item.kind === 'enq' && item.queue) {
                    this.broker.enqueue(item.queue, item.task);
                }
            }
            this.pending = [];
        });
    }

    private handlers = new Map<string, Handler<any>[]>();

    publish<T extends { topic: string }>(msg: T) {
        if (!this.open) this.pending.push({ kind: 'pub', topic: msg.topic, payload: msg });
        else this.broker.publish(msg.topic, msg);
    }

    subscribe<T>(topic: string, handler: Handler<T>) {
        const arr = this.handlers.get(topic) ?? [];
        arr.push(handler);
        this.handlers.set(topic, arr);
        if (!this.open) this.pending.push({ kind: 'sub', topic, handler });
        else {
            this.broker.subscribe(topic, (evt: any) => {
                const list = this.handlers.get(topic);
                if (list) list.forEach((fn) => fn(evt?.payload));
            });
        }
    }
    enqueue(queue: string, task: any) {
        console.log('enqueieing to agent bus', queue);
        if (!this.open) this.pending.push({ kind: 'enq', queue, task });
        else this.broker.enqueue(queue, task);
    }
}
