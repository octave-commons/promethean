import test from 'ava';
import express from 'express';

let loadModel;

test.before(async () => {
    process.env.NODE_ENV = 'test';
    ({ loadModel } = await import('../../dist/index.js'));
});

test.after.always(() => {
    delete process.env.NODE_ENV;
    delete process.env.LLM_DRIVER;
    delete process.env.LLM_MODEL;
});

test('loadModel resolves a driver', async (t) => {
    process.env.LLM_DRIVER = 'ollama';
    process.env.LLM_MODEL = 'test-model';
    const driver = await loadModel();
    t.truthy(driver);
});

test('express app initializes', (t) => {
    const app = express();
    t.truthy(app);
});
