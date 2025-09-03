// SPDX-License-Identifier: GPL-3.0-only
import WebSocket from 'ws';
import dotenv from 'dotenv';
import { once } from 'events';

dotenv.config();

const [method = 'initialize', name, argJson] = process.argv.slice(2);
const url = process.env.MCP_SERVER_URL || 'ws://localhost:4410/mcp';
const token = process.env.MCP_TOKEN;

const ws = new WebSocket(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
});

ws.on('open', () => {
    const id = 1;
    let payload: any;
    if (method === 'tools/call') {
        const args = argJson ? JSON.parse(argJson) : {};
        payload = { jsonrpc: '2.0', id, method: 'tools/call', params: { name, arguments: args } };
    } else {
        payload = { jsonrpc: '2.0', id, method: 'initialize' };
    }
    ws.send(JSON.stringify(payload));
});

ws.on('message', (data) => {
    console.log(data.toString());
    ws.close();
});

ws.on('error', (err) => {
    console.error('WS error', err);
    process.exit(1);
});

await once(ws, 'close');
