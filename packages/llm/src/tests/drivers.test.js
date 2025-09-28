import test from 'ava';
import ollama from 'ollama';

let loadDriver;

test.before(async () => {
    process.env.NODE_ENV = 'test';
    ({ loadDriver } = await import('../../dist/drivers/index.js'));
});

test.after.always(() => {
    delete process.env.NODE_ENV;
    delete process.env.LLM_DRIVER;
    delete process.env.LLM_MODEL;
});

test('loads ollama driver and generates', async (t) => {
    process.env.LLM_DRIVER = 'ollama';
    process.env.LLM_MODEL = 'test';
    const orig = ollama.chat;
    try {
        ollama.chat = async () => ({ message: { content: 'hello' } });
        const driver = await loadDriver();
        const res = await driver.generate({
            prompt: 'hi',
            context: [],
            format: null,
            tools: [],
        });
        t.is(res, 'hello');
    } finally {
        ollama.chat = orig;
    }
});

test('loads huggingface driver and generates', async (t) => {
    process.env.LLM_DRIVER = 'huggingface';
    process.env.LLM_MODEL = 'test';
    const driver = await loadDriver();
    const orig = driver.client;
    try {
        driver.client = { textGeneration: async () => ({ generated_text: 'hi' }) };
        const res = await driver.generate({
            prompt: 'hi',
            context: [],
            format: null,
            tools: [],
        });
        t.is(res, 'hi');
    } finally {
        driver.client = orig;
    }
});
