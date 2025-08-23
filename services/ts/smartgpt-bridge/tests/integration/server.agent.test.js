import test from 'ava';
import path from 'path';
import { withServer } from '../helpers/server.js';

const ROOT = path.join(process.cwd(), 'tests', 'fixtures');

test('agent endpoints basic flows without starting a process', async (t) => {
    await withServer(ROOT, async (req) => {
        const list = await req.get('/agent/list').expect(200);
        t.true(list.body.ok);
        t.true(Array.isArray(list.body.agents));

        const status404 = await req.get('/agent/status').query({ id: 'nope' }).expect(404);
        t.false(status404.body.ok);

        const logs404 = await req.get('/agent/logs').query({ id: 'nope' }).expect(404);
        t.false(logs404.body.ok);

        const stream400 = await req.get('/agent/stream').expect(400);
        t.is(stream400.status, 400);

        const send400 = await req.post('/agent/send').send({}).expect(400);
        t.is(send400.status, 400);

        const interruptFalse = await req.post('/agent/interrupt').send({ id: 'nope' }).expect(200);
        t.deepEqual(interruptFalse.body, { ok: false });

        const killFalse = await req
            .post('/agent/kill')
            .send({ id: 'nope', force: true })
            .expect(200);
        t.deepEqual(killFalse.body, { ok: false });

        const resumeFalse = await req.post('/agent/resume').send({ id: 'nope' }).expect(200);
        t.false(resumeFalse.body.ok);
    });
});
