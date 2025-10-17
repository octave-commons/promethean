import type { BrokerClient as JsBrokerClient } from '@promethean/legacy/brokerClient.js';

type Handler<T> = (msg: T) => void;

type BusMessage = { readonly topic: string } & Record<string, unknown>;

type PendingAction =
    | { readonly kind: 'pub'; readonly topic: string; readonly payload: BusMessage }
    | { readonly kind: 'sub'; readonly topic: string; readonly handler: Handler<unknown> }
    | { readonly kind: 'enq'; readonly queue: string; readonly task: unknown };

const extractPayload = (event: unknown): unknown =>
    typeof event === 'object' && event !== null && 'payload' in event
        ? (event as { payload?: unknown }).payload
        : undefined;

export class AgentBus {
    private open = false;
    private pending: ReadonlyArray<PendingAction> = [];
    private handlers: Record<string, ReadonlyArray<Handler<unknown>>> = {};

    constructor(private readonly broker: JsBrokerClient) {
        void this.broker.connect().then(() => {
            this.open = true;
            this.pending.forEach((action) => {
                if (action.kind === 'sub') {
                    this.broker.subscribe(action.topic, (evt) => {
                        const payload = extractPayload(evt);
                        const current = this.handlers[action.topic] ?? [];
                        current.forEach((fn) => fn(payload));
                    });
                } else if (action.kind === 'pub') {
                    this.broker.publish(action.topic, action.payload);
                } else if (action.kind === 'enq') {
                    this.broker.enqueue(action.queue, action.task);
                }
            });
            this.pending = [];
        });
    }

    publish<T extends BusMessage>(msg: T): void {
        if (!this.open) {
            this.pending = [...this.pending, { kind: 'pub', topic: msg.topic, payload: msg }];
            return;
        }
        this.broker.publish(msg.topic, msg);
    }

    subscribe<T>(topic: string, handler: Handler<T>): void {
        const current = this.handlers[topic] ?? [];
        this.handlers = { ...this.handlers, [topic]: [...current, handler as Handler<unknown>] };
        if (!this.open) {
            this.pending = [...this.pending, { kind: 'sub', topic, handler: handler as Handler<unknown> }];
            return;
        }
        this.broker.subscribe(topic, (evt) => {
            const payload = extractPayload(evt) as T;
            const subscribers = this.handlers[topic] ?? [];
            subscribers.forEach((fn) => fn(payload));
        });
    }

    enqueue(queue: string, task: unknown): void {
        if (!this.open) {
            this.pending = [...this.pending, { kind: 'enq', queue, task }];
            return;
        }
        this.broker.enqueue(queue, task);
    }
}
