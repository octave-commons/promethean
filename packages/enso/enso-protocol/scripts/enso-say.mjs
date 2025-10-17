import { EnsoClient } from '../dist/client.js';
import { connectWebSocket } from '../dist/transport.js';
import { randomUUID } from 'node:crypto';

const url = process.env.ENSO_URL || 'ws://localhost:7770/ws';
const room = process.env.ENSO_ROOM || 'duck:chat';
const text = process.env.TEXT || 'say quack if you hear me';

const hello = { proto: 'ENSO-1', caps: ['can.send.text','can.context.apply','can.tool.call'], agent: { name: 'tester', version: '0.0.0' } };

const client = new EnsoClient();
const { ready, close } = connectWebSocket(client, url, hello);
await ready;
await client.post({ id: randomUUID(), role: 'human', parts: [{kind:'text', text}], when: Date.now() }, { room });
await new Promise(r=>setTimeout(r, 1500));
await close();
console.log('sent:', text);
