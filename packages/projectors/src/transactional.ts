// @ts-nocheck
import type { Db, ClientSession } from 'mongodb';
import type { EventBus, EventRecord } from '@promethean-os/event/types.js';
import { retry } from '@promethean-os/utils';

export type TxnProjectorOpts<E = any> = {
    topic: string;
    group: string;
    handler: (e: EventRecord<E>, db: Db, s: ClientSession) => Promise<void>;
    from?: 'earliest' | 'latest';
    retries?: number;
};

export async function startTransactionalProjector<E = any>(bus: EventBus, db: Db, opts: TxnProjectorOpts<E>) {
    const from = opts.from ?? 'earliest';
    const retries = opts.retries ?? 3;

    return bus.subscribe(
        opts.topic,
        opts.group,
        async (e) => {
            await retry(
                async () => {
                    const s = db.client.startSession();
                    try {
                        await s.withTransaction(
                            async () => {
                                await opts.handler(e, db, s);
                            },
                            { writeConcern: { w: 'majority' } },
                        );
                    } finally {
                        await s.endSession();
                    }
                },
                {
                    attempts: retries + 1,
                    backoff: (a) => 100 * a + Math.floor(Math.random() * 50),
                    shouldRetry: (err) => {
                        const labels: readonly string[] | undefined = (err as any)?.errorLabels;
                        return Array.isArray(labels) && (
                            labels.includes('TransientTransactionError') ||
                            labels.includes('UnknownTransactionCommitResult')
                        );
                    },
                },
            );
        },
        { from, manualAck: false, batchSize: 200 },
    );
}
