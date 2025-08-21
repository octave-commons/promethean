import test from 'ava';
import express from 'express';

test('MODEL env variable overrides default', async (t) => {
    process.env.NODE_ENV = 'test';
    process.env.LLM_MODEL = 'test-model';
    const { MODEL } = await import('../src/index.js');
    t.is(MODEL, 'test-model');
});

test('express app initializes', (t) => {
    const app = express();
    t.truthy(app);
});
