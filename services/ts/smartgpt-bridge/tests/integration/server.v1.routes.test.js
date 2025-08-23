import test from 'ava';
import path from 'path';
import { withServer } from '../helpers/server.js';

const ROOT = path.join(process.cwd(), 'tests', 'fixtures');

test('GET /v1/files proxies to list', async (t) => {
    await withServer(ROOT, async (req) => {
        const res = await req.get('/v1/files').expect(200);
        t.true(res.body.ok);
        t.true(Array.isArray(res.body.entries));
    });
});
