// LLM Bridge Service
// Subscribes to agent.llm.request events, enqueues llm.generate tasks, and
// republishes results to agent.llm.result with the original metadata.

import { startService } from '../../../../shared/js/serviceTemplate.js';

/** @type {import('../../../../shared/js/brokerClient.js').BrokerClient | undefined} */
let broker;

export function setBroker(b) {
    broker = b;
}

// Track pending requests so we can reconstruct LlmResult metadata
/** @type {Map<string, { turnId: number; ts: number; replyTopic: string }>} */
const pending = new Map();

export async function handleEvent(event) {
    try {
        if (event?.type !== 'agent.llm.request') return;
        const req = event.payload || {};
        const { corrId, turnId, ts, prompt, context = [], format } = req;
        if (!corrId || !prompt) return;

        const replyTopic = `llm.bridge.reply.${corrId}`;

        // store metadata for result publishing
        pending.set(corrId, { turnId, ts, replyTopic });

        // subscribe one-off for this correlation id
        broker.subscribe(replyTopic, (evt) => {
            try {
                const meta = pending.get(corrId);
                if (!meta) return;
                pending.delete(corrId);
                const reply = evt?.payload?.reply;
                const text = typeof reply === 'string' ? reply : JSON.stringify(reply);

                // Publish standardized result event back onto the bus
                broker.publish('agent.llm.result', {
                    topic: 'agent.llm.result',
                    ok: true,
                    text,
                    corrId,
                    turnId: meta.turnId,
                    ts: Date.now(),
                });
            } catch (err) {
                console.error('[llm-bridge] failed to handle reply', err);
            } finally {
                // best-effort cleanup
                broker.unsubscribe(replyTopic);
            }
        });

        // enqueue the LLM task in the queue the service consumes
        broker.enqueue('llm.generate', {
            prompt,
            context,
            format: format === 'json' ? 'json' : null,
            replyTopic,
        });
    } catch (err) {
        console.error('[llm-bridge] handleEvent error', err);
    }
}

async function main() {
    try {
        broker = await startService({
            id: process.env.name || 'llm-bridge',
            topics: ['agent.llm.request'],
            handleEvent,
        });
        // heartbeat is handled by other services; bridge is lightweight
        console.log('[llm-bridge] started');
    } catch (err) {
        console.error('[llm-bridge] failed to start', err);
        process.exit(1);
    }
}

if (process.env.NODE_ENV !== 'test') {
    main();
}
