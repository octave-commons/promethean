import http from 'node:http';

import test from 'ava';

import { startDummyServer } from '../dummy-server.js';

test('dummy server root returns hello', async (t) => {
    const { url, stop } = await startDummyServer(0);
    const body = await new Promise<string>((resolve, reject) => {
        http.get(new URL('/', url), (res) => {
            const chunks: Buffer[] = [];
            res.on('data', (c) => chunks.push(c as Buffer));
            res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
        }).on('error', reject);
    });
    t.is(body, 'hello');
    await stop();
});
