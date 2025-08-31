import { AgentEnvelope } from '@shared/ts/dist/agent/envelope.js';

type Handler = (msg: AgentEnvelope<any>) => Promise<void>;

export function makeMockRuntime() {
    const handlers: Array<{ topic: string; fn: Handler }> = [];
    const published: AgentEnvelope<any>[] = [];

    const runtime = {
        async subscribe(topic: string, handler: Handler) {
            handlers.push({ topic, fn: handler });
        },
        async publish(topic: string, msg: AgentEnvelope<any>) {
            published.push({ ...msg, dst: topic });
        },
        // Test helper
        async emit(topic: string, msg: AgentEnvelope<any>) {
            for (const h of handlers) {
                // naive wildcard: '*' matches any segment
                const toRe = (t: string) =>
                    new RegExp(
                        '^' +
                            t
                                .split('.')
                                .map((s) =>
                                    s === '*' ? '[^. ]+' : s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
                                )
                                .join('.') +
                            '$',
                    );
                if (toRe(h.topic).test(topic)) {
                    await h.fn(msg);
                }
            }
        },
        getPublished() {
            return published;
        },
    };

    return runtime;
}
