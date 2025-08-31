import test from 'ava';
import {
    runChatBoth,
    runChatStreamBoth,
    runEmbedBoth,
    compareErrors,
    ParityClients,
} from '@promethean/parity/runner.js';

const clients: ParityClients = {
    broker: {
        async chat() {
            return { text: 'b', usage: {}, finish_reason: 'done' };
        },
        async chatStream(_payload: any, onChunk: (c: any) => void) {
            onChunk({ id: '1', text: 'b1' });
            onChunk({ id: '2', text: 'b2' });
        },
        async embed() {
            return { embedding: [0.1, 0.2] };
        },
    },
    bridge: {
        async chat() {
            return { text: 'h', usage: {}, finish_reason: 'done' };
        },
        async chatStream(_payload: any, onChunk: (c: any) => void) {
            onChunk({ id: '1', text: 'h1' });
            onChunk({ id: '2', text: 'h2' });
        },
        async embed() {
            return { embedding: [0.1, 0.2] };
        },
    },
};

test('runChatBoth returns normalized results', async (t) => {
    const res = await runChatBoth({}, clients);
    t.deepEqual(res, {
        broker: { text: 'b', usage: {}, finish_reason: 'done' },
        bridge: { text: 'h', usage: {}, finish_reason: 'done' },
    });
});

test('runChatStreamBoth collects normalized streams', async (t) => {
    const res = await runChatStreamBoth({}, clients);
    t.deepEqual(res, {
        broker: [{ text: 'b1' }, { text: 'b2' }],
        bridge: [{ text: 'h1' }, { text: 'h2' }],
    });
});

test('runEmbedBoth returns normalized embeddings', async (t) => {
    const res = await runEmbedBoth({}, clients);
    t.deepEqual(res, {
        broker: { embedding: [0.1, 0.2] },
        bridge: { embedding: [0.1, 0.2] },
    });
});

test('compareErrors normalizes both errors', (t) => {
    const res = compareErrors({ code: 500, message: 'x', meta: 'a' }, { code: 500, message: 'x', stack: 'b' });
    t.deepEqual(res, {
        broker: { code: 500, message: 'x' },
        bridge: { code: 500, message: 'x' },
    });
});
