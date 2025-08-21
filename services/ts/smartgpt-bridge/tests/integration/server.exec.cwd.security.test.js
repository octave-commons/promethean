import test from 'ava';
import path from 'path';
import { withServer } from '../helpers/server.js';

const ROOT = path.join(process.cwd(), 'tests', 'fixtures');

test.serial('exec run blocks cwd outside root', async (t) => {
    const prev = { EXEC_ENABLED: process.env.EXEC_ENABLED };
    try {
        process.env.EXEC_ENABLED = 'true';
        await withServer(ROOT, async (req) => {
            const res = await req.post('/exec/run').send({ command: 'pwd', cwd: '/' }).expect(200);
            t.false(res.body.ok);
            t.regex(res.body.error || '', /cwd outside root/i);
        });
    } finally {
        process.env.EXEC_ENABLED = prev.EXEC_ENABLED;
    }
});
