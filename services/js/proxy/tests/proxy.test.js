import test from 'ava';
import express from 'express';
import request from 'supertest';
import { start, stop } from '../index.js';
import { io as ioClient } from 'socket.io-client';

let backendServer;
let proxy;

test.before(async () => {
    const app = express();
    app.get('/hello', (req, res) => res.json({ ok: true }));
    backendServer = await new Promise((resolve) => {
        const s = app.listen(0, () => resolve(s));
    });
    const port = backendServer.address().port;
    proxy = await start(0, { '/api': `http://127.0.0.1:${port}` });
});

test.after.always(async () => {
    if (backendServer) await new Promise((r) => backendServer.close(r));
    await stop();
});

test('proxies requests', async (t) => {
    const res = await request(proxy).get('/api/hello').expect(200);
    t.deepEqual(res.body, { ok: true });
});

test('routes websocket events', async (t) => {
    const port = proxy.address().port;
    const url = `http://127.0.0.1:${port}`;

    const clientA = ioClient(url);
    const clientB = ioClient(url);

    await Promise.all([
        new Promise((resolve) => clientA.on('connect', resolve)),
        new Promise((resolve) => clientB.on('connect', resolve)),
    ]);

    const payload = { hello: 'world' };
    const received = new Promise((resolve) => clientB.on('test', resolve));

    clientA.emit('test', payload);

    t.deepEqual(await received, payload);

    clientA.close();
    clientB.close();
});
