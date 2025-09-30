import type { ClientSession, Db, MongoClient, MongoServerError } from 'mongodb';
import type { ReadonlyDeep } from 'type-fest';
import type { DeliveryContext, EventBus, EventRecord } from '@promethean/event/types.js';
import { retry } from '@promethean/utils';

type HandlerArgs<E> = {
    event: ReadonlyDeep<EventRecord<E>>;
    db: ReadonlyDeep<Db>;
    session: ReadonlyDeep<ClientSession>;
};

export type TxnProjectorOpts<E = unknown> = Readonly<{
    topic: string;
    group: string;
    client: MongoClient;
    handler: (args: ReadonlyDeep<HandlerArgs<E>>) => Promise<void>;
    from?: 'earliest' | 'latest';
    retries?: number;
}>;

const hasRetryableMongoLabel = (error: ReadonlyDeep<MongoServerError>): boolean => {
    const labels = error.errorLabels;
    if (!Array.isArray(labels)) return false;
    return labels.includes('TransientTransactionError') || labels.includes('UnknownTransactionCommitResult');
};

const isRetryableMongoError = (error: unknown): error is MongoServerError => {
    return (
        typeof error === 'object' &&
        error !== null &&
        'errorLabels' in error &&
        Array.isArray((error as { errorLabels?: unknown }).errorLabels)
    );
};

export async function startTransactionalProjector<E = unknown>(
    bus: ReadonlyDeep<EventBus>,
    db: ReadonlyDeep<Db>,
    opts: ReadonlyDeep<TxnProjectorOpts<E>>,
): Promise<() => Promise<void>> {
    const from = opts.from ?? 'earliest';
    const retries = opts.retries ?? 3;

    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types, functional/prefer-immutable-types
    const handleDelivery = async (event: EventRecord<unknown>, _ctx: DeliveryContext): Promise<void> => {
        await retry(
            async () => {
                const mongoClient = opts.client;
                return mongoClient.withSession(async (session: ReadonlyDeep<ClientSession>) => {
                    const transactionalSession = session as ClientSession;
                    await transactionalSession.withTransaction(
                        async () => {
                            const handlerArgs = {
                                event: event as ReadonlyDeep<EventRecord<E>>,
                                db,
                                session,
                            } as const satisfies HandlerArgs<E>;
                            await opts.handler(handlerArgs as ReadonlyDeep<HandlerArgs<E>>);
                        },
                        { writeConcern: { w: 'majority' } },
                    );
                });
            },
            {
                attempts: retries + 1,
                backoff: (attempt) => 100 * attempt + Math.floor(Math.random() * 50),
                shouldRetry: (error) => isRetryableMongoError(error) && hasRetryableMongoLabel(error),
            },
        );
    };

    return bus.subscribe(opts.topic, opts.group, handleDelivery, { from, manualAck: false, batchSize: 200 });
}
