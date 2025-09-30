import test from 'ava';
import esmock from 'esmock';
import { createHfClient as createFromIndex } from '@promethean/http';

type MockResponse = {
    readonly statusCode: number;
    readonly body: {
        readonly json: () => Promise<ReadonlyArray<ReadonlyArray<number>>>;
    };
};

const mockRequest = async (): Promise<MockResponse> => ({
    statusCode: 200,
    body: {
        json: async () => [[1, 2, 3]] as const,
    },
});

test('embeddings uses HF API', async (t) => {
    const modulePath = new URL('../hf.js', import.meta.url).pathname;
    const mockedModule = (await esmock(modulePath, {
        undici: { request: mockRequest },
    })) as unknown as typeof import('../hf.js');
    const { createHfClient } = mockedModule;

    const client = createHfClient({ apiKey: 'key', baseUrl: 'https://example.com' });
    const result = await client.embeddings('model', ['text']);
    t.deepEqual(result, [[1, 2, 3]]);
});

test('index exposes createHfClient', (t) => {
    t.is(typeof createFromIndex, 'function');
});
