// SPDX-License-Identifier: GPL-3.0-only
// Using loose typing to avoid cross-package type coupling at build time
import { dlqTopic } from './types';

export function withDLQ(bus: any, { maxAttempts = 5, group }: { maxAttempts?: number; group: string }) {
    return async function subscribeWithDLQ(topic: string, handler: (e: any) => Promise<void>, opts: any = {}) {
        let attempts = new Map<string, number>();

        return bus.subscribe(
            topic,
            group,
            async (e: any) => {
                const n = (attempts.get(e.id) ?? 0) + 1;
                attempts.set(e.id, n);

                try {
                    await handler(e);
                    attempts.delete(e.id);
                } catch (err: any) {
                    if (n >= maxAttempts) {
                        await bus.publish(dlqTopic(topic), {
                            topic,
                            group,
                            original: e,
                            err: String(err?.stack ?? err?.message ?? err),
                            ts: Date.now(),
                            attempts: n,
                        });
                        attempts.delete(e.id);
                    } else {
                        throw err; // cause redelivery
                    }
                }
            },
            opts,
        );
    };
}
