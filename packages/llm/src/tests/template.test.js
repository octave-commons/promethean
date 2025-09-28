import test from 'ava';
import { handleTask, setGenerateFn, setBroker } from '../../dist/index.js';

test('handleTask publishes reply using broker', async (t) => {
    const messages = [];
    const fakeBroker = {
        publish: (topic, msg) => messages.push({ topic, msg }),
    };
    setBroker(fakeBroker);
    setGenerateFn(async () => 'hi');
    const task = {
        id: '123',
        payload: {
            prompt: 'hello',
            context: [],
            format: null,
            tools: [],
            replyTopic: 'topic',
        },
    };
    await handleTask(task);
    t.deepEqual(messages, [{ topic: 'topic', msg: { reply: 'hi', taskId: '123' } }]);
});
