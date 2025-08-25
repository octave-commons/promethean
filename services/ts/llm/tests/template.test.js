import test from 'ava';
import { handleTask, setCallOllamaFn, setBroker } from '../src/index.js';

test('handleTask publishes reply using broker', async (t) => {
    const messages = [];
    const fakeBroker = {
        publish: (topic, msg) => messages.push({ topic, msg }),
    };
    setBroker(fakeBroker);
    setCallOllamaFn(async () => 'hi');
    const task = {
        id: '123',
        payload: {
            prompt: 'hello',
            context: [],
            format: null,
            replyTopic: 'topic',
        },
    };
    await handleTask(task);
    t.deepEqual(messages, [{ topic: 'topic', msg: { reply: 'hi', taskId: '123' } }]);
});
