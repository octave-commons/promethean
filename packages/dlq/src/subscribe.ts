import { dlqTopic } from './types.js';
import type { DLQBus, DLQEvent, DLQRecord, DeliveryCtx } from './types.js';

type WithDlqOptions = Readonly<{
    group: string;
    maxAttempts?: number;
}>;

type SubscribeOverrides = Readonly<Record<string, unknown>>;

type EventHandler = (event: DLQEvent, ctx?: DeliveryCtx) => Promise<void>;

type DeadLetterParams = Readonly<{
    topic: string;
    group: string;
    event: DLQEvent;
    err: unknown;
    attempts: number;
}>;

const formatError = (err: unknown): string => {
    const error = err as { readonly stack?: unknown; readonly message?: unknown };
    const stack = typeof error?.stack === 'string' ? error.stack : undefined;
    const message = typeof error?.message === 'string' ? error.message : undefined;
    return stack ?? message ?? String(err);
};

const createDeadLetter = ({ topic, group, event, err, attempts }: DeadLetterParams): DLQRecord =>
    Object.freeze({
        topic,
        group,
        original: event,
        err: formatError(err),
        ts: Date.now(),
        attempts,
    });

const toSubscribeOptions = (base: SubscribeOverrides, maxAttempts: number): Readonly<Record<string, unknown>> => ({
    ...base,
    maxAttempts,
});

type AttemptParams = Readonly<{
    handler: EventHandler;
    bus: DLQBus;
    topic: string;
    group: string;
    attemptLimit: number;
    event: DLQEvent;
    ctx: DeliveryCtx;
}>;

const withAttemptLimit = ({ handler, bus, topic, group, attemptLimit, event, ctx }: AttemptParams): Promise<void> =>
    handler(event, ctx).catch(async (err: unknown) => {
        const attempt = ctx?.attempt ?? attemptLimit;
        if (attempt >= attemptLimit) {
            const deadLetter = createDeadLetter({ topic, group, event, err, attempts: attempt });
            await bus.publish(dlqTopic(topic), deadLetter);
            return;
        }
        throw err;
    });

export function withDLQ(bus: DLQBus, { maxAttempts = 5, group }: WithDlqOptions) {
    return async function subscribeWithDLQ(
        topic: string,
        handler: EventHandler,
        opts: SubscribeOverrides = {},
    ): Promise<unknown> {
        const subscribeOpts = toSubscribeOptions(opts, maxAttempts);

        return bus.subscribe(
            topic,
            group,
            (event: DLQEvent, ctx?: DeliveryCtx) =>
                withAttemptLimit({
                    handler,
                    bus,
                    topic,
                    group,
                    attemptLimit: Math.max(maxAttempts, ctx?.maxAttempts ?? maxAttempts),
                    event,
                    ctx: ctx ?? { attempt: 0, maxAttempts },
                }),
            subscribeOpts,
        );
    };
}
