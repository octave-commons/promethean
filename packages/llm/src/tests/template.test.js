import test from 'ava';

let handleTask;
let setGenerateFn;
let setBroker;
let loadModel;

test.before(async () => {
    process.env.NODE_ENV = 'test';
    ({ handleTask, setGenerateFn, setBroker, loadModel } = await import('../../dist/index.js'));
});

test.after.always(async () => {
    delete process.env.NODE_ENV;
    setBroker(null);
    setGenerateFn(async ({ prompt, context = [], format = null, tools = [] }) => {
        const driver = await loadModel();
        return driver.generate({ prompt, context, format, tools });
    });
});

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
