import test from 'ava';
import path from 'path';
import { withServer } from '../helpers/server.js';

const ROOT = path.join(process.cwd(), 'tests', 'fixtures');

test('GET /files/list blocks traversal outside root', async (t) => {
    await withServer(ROOT, async (req) => {
        const res = await req.get('/files/list').query({ path: '../../' }).expect(400);
        t.false(res.body.ok);
        t.truthy(res.body.error);
    });
});
