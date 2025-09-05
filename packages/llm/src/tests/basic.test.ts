import test from 'ava';
import { loadModel } from '../index.ts';

test('loadModel resolves a driver', async (t) => {
    process.env.LLM_DRIVER = 'ollama';
    process.env.LLM_MODEL = 'test-model';
    const driver = await loadModel();
    t.truthy(driver);
});
