// packages/test-harness/tests/dummy-server.spec.ts
import http from 'node:http';

import test from 'ava';

import { startDummyServer } from '../dummy-server.js';

test('dummy server responds', async (t) => {
    const { url, stop } = await startDummyServer(0);
    const ok = await new Promise<boolean>((resolve) => {
        http.get(new URL('/health', url), (res) => {
            resolve((res.statusCode ?? 0) === 200);
            res.resume();
        }).on('error', () => resolve(false));
    });
    t.true(ok);
    await stop();
});
