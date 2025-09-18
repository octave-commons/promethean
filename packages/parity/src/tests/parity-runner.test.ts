import test from 'ava';
import { compareErrors, runChatBoth, runChatStreamBoth, runEmbedBoth } from '../runner.js';
import { normalizeChat, normalizeEmbed, normalizeError, normalizeStream } from '../normalizers.js';

test('normalizeChat extracts key response fields', (t) => {
    const normalized = normalizeChat({ text: 'hi', usage: { tokens: 5 }, finish_reason: 'stop', extra: 'x' });
    t.deepEqual(normalized, { text: 'hi', usage: { tokens: 5 }, finish_reason: 'stop' });
});

test('normalizeEmbed rounds embedding values', (t) => {
    const normalized = normalizeEmbed({ embedding: [1 / 3, 2 / 3] });
    t.deepEqual(normalized.embedding, [Number((1 / 3).toFixed(6)), Number((2 / 3).toFixed(6))]);
});

test('normalizeStream removes id fields from chunks', (t) => {
    const chunks = normalizeStream([
        { id: 'a', delta: 'foo' },
        { id: 'b', delta: 'bar' },
    ]);
    t.deepEqual(chunks, [{ delta: 'foo' }, { delta: 'bar' }]);
});

test('runChatBoth normalizes broker and bridge payloads', async (t) => {
    const clients = {
        broker: { chat: async () => ({ text: 'broker', usage: 1, finish_reason: 'stop' }) },
        bridge: { chat: async () => ({ text: 'bridge', usage: 2, finish_reason: 'length' }) },
    } as any;

    const result = await runChatBoth({ prompt: 'hi' }, clients);
    t.deepEqual(result, {
        broker: { text: 'broker', usage: 1, finish_reason: 'stop' },
        bridge: { text: 'bridge', usage: 2, finish_reason: 'length' },
    });
});

test('runChatStreamBoth relays chunks to callback and normalizes output', async (t) => {
    const brokerChunks = [{ id: 'b1', delta: 'b' }];
    const bridgeChunks = [{ id: 'h1', delta: 'h' }];
    const calls: Array<{ side: string; chunk: any }> = [];

    const clients = {
        broker: {
            chatStream: async (_payload: any, push: (chunk: any) => void) => {
                brokerChunks.forEach(push);
            },
        },
        bridge: {
            chatStream: async (_payload: any, push: (chunk: any) => void) => {
                bridgeChunks.forEach(push);
            },
        },
    } as any;

    const result = await runChatStreamBoth({ prompt: 'chat' }, clients, (side, chunk) => calls.push({ side, chunk }));
    t.is(calls.length, 2);
    t.like(calls[0], { side: 'broker' });
    t.like(calls[1], { side: 'bridge' });
    t.deepEqual(result, {
        broker: [{ delta: 'b' }],
        bridge: [{ delta: 'h' }],
    });
});

test('runEmbedBoth requires embed support on both clients', async (t) => {
    const clients = {
        broker: { embed: async () => ({ embedding: [0.123456789] }) },
        bridge: { embed: async () => ({ embedding: [0.987654321] }) },
    } as any;

    const result = await runEmbedBoth({ text: 'hello' }, clients);
    t.deepEqual(result.broker.embedding, [Number((0.123456789).toFixed(6))]);
    t.deepEqual(result.bridge.embedding, [Number((0.987654321).toFixed(6))]);

    await t.throwsAsync(() => runEmbedBoth({}, { broker: {}, bridge: {} } as any));
});

test('compareErrors normalizes error payloads', (t) => {
    const result = compareErrors({ code: 'bad', message: 'no' }, { code: 'worse', message: 'nope' });
    t.deepEqual(result, {
        broker: normalizeError({ code: 'bad', message: 'no' }),
        bridge: normalizeError({ code: 'worse', message: 'nope' }),
    });
});
