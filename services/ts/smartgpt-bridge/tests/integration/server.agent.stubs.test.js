import test from 'ava';
import path from 'path';
import { withServer } from '../helpers/server.js';
import { supervisor } from '../../src/agent.js';

const ROOT = path.join(process.cwd(), 'tests', 'fixtures');

test('agent endpoints success paths via stubbed supervisor', async (t) => {
    // Stub supervisor methods
    const orig = {
        start: supervisor.start,
        status: supervisor.status,
        send: supervisor.send,
        interrupt: supervisor.interrupt,
        kill: supervisor.kill,
        resume: supervisor.resume,
        logs: supervisor.logs,
        list: supervisor.list,
    };
    try {
        supervisor.start = () => ({ id: 'S1', pid: 111 });
        supervisor.status = () => ({ id: 'S1', exited: false, paused_by_guard: false, bytes: 0 });
        supervisor.send = () => true;
        supervisor.interrupt = () => true;
        supervisor.kill = () => true;
        supervisor.resume = () => true;
        supervisor.logs = () => ({ total: 0, chunk: '' });
        supervisor.list = () => [{ id: 'S1', exited: false }];

        await withServer(ROOT, async (req) => {
            const st = await req.post('/agent/start').send({ prompt: 'hello' }).expect(200);
            t.true(st.body.ok);
            const send = await req
                .post('/agent/send')
                .send({ id: 'S1', input: 'ping' })
                .expect(200);
            t.true(send.body.ok);
            const intr = await req.post('/agent/interrupt').send({ id: 'S1' }).expect(200);
            t.true(intr.body.ok);
            const kill = await req.post('/agent/kill').send({ id: 'S1', force: true }).expect(200);
            t.true(kill.body.ok);
            const resm = await req.post('/agent/resume').send({ id: 'S1' }).expect(200);
            t.true(resm.body.ok);
            const logs = await req.get('/agent/logs').query({ id: 'S1', since: 0 }).expect(200);
            t.true(logs.body.ok);
            const status = await req.get('/agent/status').query({ id: 'S1' }).expect(200);
            t.true(status.body.ok);
            const list = await req.get('/agent/list').expect(200);
            t.true(list.body.ok);
        });
    } finally {
        Object.assign(supervisor, orig);
    }
});
