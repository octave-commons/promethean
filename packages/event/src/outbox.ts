import type { EventBus, UUID } from './types.js';

export type OutboxStore<T = unknown> = {
    add(rec: { id: UUID; topic: string; payload: T; headers?: Record<string, string> }): Promise<void>;
    claimBatch(n: number): Promise<{ id: UUID; topic: string; payload: T; headers?: Record<string, string> }[]>;
    markSent(id: UUID): Promise<void>;
    markError(id: UUID, err: string): Promise<void>;
};
export async function runOutboxDrainer(outbox: OutboxStore, bus: EventBus, intervalMs = 250): Promise<void> {
    while (true) {
        const batch = await outbox.claimBatch(100);
        if (batch.length === 0) {
            await new Promise((resolve) => setTimeout(resolve, intervalMs));
            continue;
        }
        for (const rec of batch) {
            try {
                await bus.publish(rec.topic, rec.payload, { headers: rec.headers });
                await outbox.markSent(rec.id);
            } catch (e) {
                await outbox.markError(rec.id, (e as Error).message);
            }
        }
    }
}
