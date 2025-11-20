import test from 'ava';
import { loadDriver } from '../../dist/drivers/index.js';
import ollama from 'ollama';

test('loads ollama driver and generates', async (t) => {
    process.env.LLM_DRIVER = 'ollama';
    process.env.LLM_MODEL = 'test';
    const orig = ollama.chat;
    ollama.chat = async () => ({ message: { content: 'hello' } });
    const driver = await loadDriver();
    const res = await driver.generate({
        prompt: 'hi',
        context: [],
        format: null,
        tools: [],
    });
    t.is(res, 'hello');
    ollama.chat = orig;
});

test('loads huggingface driver and generates', async (t) => {
    process.env.LLM_DRIVER = 'huggingface';
    process.env.LLM_MODEL = 'test';
    const driver = await loadDriver();
    const orig = driver.client;
    driver.client = { textGeneration: async () => ({ generated_text: 'hi' }) };
    const res = await driver.generate({
        prompt: 'hi',
        context: [],
        format: null,
        tools: [],
    });
    t.is(res, 'hi');
    driver.client = orig;
});
