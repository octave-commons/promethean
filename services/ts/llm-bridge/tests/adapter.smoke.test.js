import assert from 'node:assert';
import { handleEvent, setBroker } from '../src/index.js';

async function run() {
    const enqueues = [];
    const publishes = [];
    const handlers = new Map();

    const fakeBroker = {
        subscribe(topic, handler) {
            handlers.set(topic, handler);
        },
        unsubscribe(topic) {
            handlers.delete(topic);
        },
        enqueue(queue, task) {
            enqueues.push({ queue, task });
        },
        publish(topic, payload) {
            publishes.push({ topic, payload });
        },
    };

    setBroker(fakeBroker);

    const corrId = 'abc-123';
    const event = {
        type: 'agent.llm.request',
        payload: {
            topic: 'agent.llm.request',
            corrId,
            turnId: 42,
            ts: Date.now(),
            prompt: 'Hello',
            context: [],
        },
    };

    await handleEvent(event);

    assert.equal(enqueues.length, 1, 'should enqueue one llm.generate task');
    assert.equal(enqueues[0].queue, 'llm.generate');
    assert.ok(enqueues[0].task.replyTopic.includes(corrId));

    const replyTopic = enqueues[0].task.replyTopic;
    // Simulate LLM service publishing a reply
    const handler = handlers.get(replyTopic);
    assert.ok(handler, 'reply handler subscribed');

    handler({ payload: { reply: 'Hi there' } });

    assert.equal(publishes.length, 1, 'should publish one llm result event');
    assert.equal(publishes[0].topic, 'agent.llm.result');
    assert.equal(publishes[0].payload.ok, true);
    assert.equal(publishes[0].payload.corrId, corrId);
    assert.equal(publishes[0].payload.turnId, 42);
    assert.equal(publishes[0].payload.text, 'Hi there');

    console.log('ok');
}

run().catch((err) => {
    console.error(err);
    process.exit(1);
});
