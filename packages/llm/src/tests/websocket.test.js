// SPDX-License-Identifier: GPL-3.0-only
import test from 'ava';
import { WebSocket } from 'ws';
import { start, setGenerateFn } from '../dist/index.js';

let server;

if (process.env.SKIP_NETWORK_TESTS === '1') {
    test('llm websocket network tests skipped in sandbox', (t) => t.pass());
} else {
    test.before(async () => {
        process.env.DISABLE_BROKER = '1';
        process.env.NODE_ENV = 'test';
        process.env.name = 'llm';
        setGenerateFn(async () => 'hi');
        server = await start(0);
    });

    test.after.always(() => {
        if (server) server.close();
    });

    test('generate via websocket', async (t) => {
        const port = server.address().port;
        const ws = new WebSocket(`ws://127.0.0.1:${port}/generate`);
        const payload = { prompt: 'hi', context: [], format: null, tools: [] };
        const response = await new Promise((resolve, reject) => {
            ws.on('open', () => ws.send(JSON.stringify(payload)));
            ws.on('message', (msg) => {
                resolve(JSON.parse(msg.toString()));
            });
            ws.on('error', reject);
        });
        t.is(response.reply, 'hi');
        ws.close();
    });
}
