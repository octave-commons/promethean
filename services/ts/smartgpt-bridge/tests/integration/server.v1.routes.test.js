import test from 'ava';
import path from 'path';
import { withServer } from '../helpers/server.js';

const ROOT = path.join(process.cwd(), 'tests', 'fixtures');

test('GET /v1/files/ returns flat file list', async (t) => {
    await withServer(ROOT, async (req) => {
        const res = await req.get('/v1/files/').expect(200);
        t.true(res.body.ok);
        t.true(Array.isArray(res.body.entries));
    });
});

test('GET /v1/files/?tree=true returns directory tree', async (t) => {
    await withServer(ROOT, async (req) => {
        const res = await req.get('/v1/files/').query({ tree: true, depth: 2 }).expect(200);
        t.true(res.body.ok);
        t.truthy(res.body.tree);
        t.is(res.body.base, '.');
    });
});

test('GET /v1/files/readme.md returns file snippet', async (t) => {
    await withServer(ROOT, async (req) => {
        const res = await req.get('/v1/files/readme.md').query({ line: 3, context: 1 }).expect(200);
        t.true(res.body.ok);
        t.is(res.body.path, 'readme.md');
        t.true(typeof res.body.snippet === 'string');
    });
});
