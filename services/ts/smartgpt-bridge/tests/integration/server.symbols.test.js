import test from 'ava';
import path from 'path';
import { withServer } from '../helpers/server.js';

const ROOT = path.join(process.cwd(), 'tests', 'fixtures');

test('POST /symbols/index then /symbols/find', async (t) => {
    await withServer(ROOT, async (req) => {
        const idx = await req
            .post('/symbols/index')
            .send({ paths: ['**/*.ts'] })
            .expect(200);
        t.true(idx.body.ok);
        const res = await req
            .post('/symbols/find')
            .send({ query: 'User', kind: 'class' })
            .expect(200);
        t.true(res.body.ok);
        t.true(
            res.body.results.some((r) => r.name === 'User' && r.path.endsWith('multiSymbols.ts')),
        );
    });
});
