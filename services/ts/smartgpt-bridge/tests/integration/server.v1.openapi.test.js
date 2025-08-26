import test from 'ava';
import path from 'node:path';
import { withServer } from '../helpers/server.js';

const ROOT = path.join(process.cwd(), 'tests', 'fixtures');

function countOperations(paths) {
    return Object.values(paths).reduce((sum, item) => sum + Object.keys(item).length, 0);
}

test('GET /v1/openapi.json exposes no more than 30 ops', async (t) => {
    await withServer(ROOT, async (req) => {
        const res = await req.get('/v1/openapi.json').expect(200);
        const ops = countOperations(res.body.paths || {});
        t.true(ops <= 30);
    });
});
