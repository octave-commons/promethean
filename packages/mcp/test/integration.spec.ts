import test from 'ava';
import WebSocket, { WebSocketServer, RawData } from 'ws';
import { startServer } from '../src/server.js';
import { once } from 'events';
import type { AddressInfo } from 'net';

async function createMockBridge() {
    const wss = new WebSocketServer({ port: 0 });
    wss.on('connection', (ws: WebSocket) => {
        ws.on('message', (data: RawData) => {
            const msg = JSON.parse(data.toString());
            if (msg.kind === 'tool.call') {
                ws.send(JSON.stringify({ kind: 'tool.chunk', id: msg.id, data: { part: 1 } }));
                ws.send(
                    JSON.stringify({
                        kind: 'tool.result',
                        id: msg.id,
                        result: [{ id: 'a', score: 0.9 }],
                    }),
                );
            }
            if (msg.kind === 'tool.cancel') {
                ws.send(JSON.stringify({ kind: 'tool.error', id: msg.id, error: 'cancelled' }));
            }
        });
    });
    await once(wss, 'listening');
    const port = (wss.address() as AddressInfo).port;
    return { wss, port };
}

test.skip('tools/call streams progress and result', async (t) => {
    const bridge = await createMockBridge();
    process.env.SMARTGPT_BRIDGE_URL = `ws://localhost:${bridge.port}`;
    const server = await startServer({ port: 0 });
    const client = new WebSocket(`ws://localhost:${server.port}/mcp`);
    try {
        await once(client, 'open');
        client.send(
            JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'tools/call',
                params: { name: 'search.query', arguments: { query: 'hi' } },
            }),
        );
        const [progressRaw] = await once(client, 'message');
        const progress = JSON.parse(progressRaw.toString());
        const [resultRaw] = await once(client, 'message');
        const result = JSON.parse(resultRaw.toString());
        t.is(progress.method, 'tools/progress');
        t.truthy(result.result);
    } finally {
        const closed = once(client, 'close');
        client.close();
        await closed;
        await server.close();
        await new Promise((res) => bridge.wss.close(res));
    }
});

test.skip('tools/cancel forwards cancel frame', async (t) => {
    const bridge = await createMockBridge();
    process.env.SMARTGPT_BRIDGE_URL = `ws://localhost:${bridge.port}`;
    const server = await startServer({ port: 0 });
    const client = new WebSocket(`ws://localhost:${server.port}/mcp`);
    try {
        await once(client, 'open');
        client.send(
            JSON.stringify({
                jsonrpc: '2.0',
                id: 2,
                method: 'tools/call',
                params: { name: 'search.query', arguments: { query: 'test' } },
            }),
        );
        client.send(
            JSON.stringify({ jsonrpc: '2.0', id: 3, method: 'tools/cancel', params: { id: 2 } }),
        );
        const [raw] = await once(client, 'message');
        const msg = JSON.parse(raw.toString());
        t.truthy(msg.result || msg.error);
    } finally {
        const closed = once(client, 'close');
        client.close();
        await closed;
        await server.close();
        await new Promise((res) => bridge.wss.close(res));
    }
});
