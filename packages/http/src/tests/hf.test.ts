import test from 'ava';
import esmock from 'esmock';
import { createHfClient as createFromIndex } from '@promethean/http';

test('embeddings uses HF API', async t => {
    const mockRequest = async () => ({
        statusCode: 200,
        body: { json: async () => [[1, 2, 3]] },
    });

    const modulePath = new URL('../hf.js', import.meta.url).pathname;
    const { createHfClient } = await esmock(modulePath, {
        undici: { request: mockRequest },
    });

    const client = createHfClient({ apiKey: 'key', baseUrl: 'https://example.com' });
    const result = await client.embeddings('model', ['text']);
    t.deepEqual(result, [[1, 2, 3]]);
});

test('index exposes createHfClient', t => {
    t.is(typeof createFromIndex, 'function');
});
