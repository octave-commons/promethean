// @ts-nocheck
import test from 'ava';
import path from 'node:path';
import { withServer } from '../helpers/server.js';

const ROOT = path.join(process.cwd(), 'tests', 'fixtures');

test('POST /v0/symbols/index then /v0/symbols/find', async (t) => {
    await withServer(ROOT, async (req) => {
        const idx = await req
            .post('/v0/symbols/index')
            .send({ paths: ['**/*.ts'] })
            .expect(200);
        t.true(idx.body.ok);
        const res = await req
            .post('/v0/symbols/find')
            .send({ query: 'User', kind: 'class' })
            .expect(200);
        t.true(res.body.ok);
        t.true(
            res.body.results.some((r) => r.name === 'User' && r.path.endsWith('multiSymbols.ts')),
        );
    });
});
