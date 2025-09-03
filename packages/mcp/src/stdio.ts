#!/usr/bin/env node
// SPDX-License-Identifier: GPL-3.0-only
import dotenv from 'dotenv';
import WebSocket from 'ws';
import readline from 'readline';

dotenv.config();

const url = process.env.MCP_SERVER_URL || 'ws://localhost:4410/mcp';
const token = process.env.MCP_TOKEN;

const ws = new WebSocket(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
});

ws.on('open', () => {
    const rl = readline.createInterface({ input: process.stdin });
    rl.on('line', (line) => ws.send(line));
    ws.on('message', (data) => {
        process.stdout.write(data.toString() + '\n');
    });
    ws.on('close', () => rl.close());
});

ws.on('close', () => process.exit(0));
ws.on('error', (err) => {
    console.error('WS error', err);
    process.exit(1);
});
