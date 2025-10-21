import test from 'ava';
import express from 'express';
import { loadModel } from '../../dist/index.js';

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
