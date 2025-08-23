import test from 'ava';
import path from 'path';
import { withServer } from '../helpers/server.js';

const ROOT = path.join(process.cwd(), 'tests', 'fixtures');

test.serial('exec requires auth when enabled and allows with token', async (t) => {
    const prev = {
        AUTH_ENABLED: process.env.AUTH_ENABLED,
        AUTH_MODE: process.env.AUTH_MODE,
        AUTH_TOKENS: process.env.AUTH_TOKENS,
        EXEC_ENABLED: process.env.EXEC_ENABLED,
        EXEC_SHELL: process.env.EXEC_SHELL,
    };
    try {
        process.env.AUTH_ENABLED = 'true';
        process.env.AUTH_MODE = 'static';
        process.env.AUTH_TOKENS = 'secret-token';
        process.env.EXEC_ENABLED = 'true';
        process.env.EXEC_SHELL = 'true';

        await withServer(ROOT, async (req) => {
            // Missing token blocked
            await req.post('/v0/exec/run').send({ command: 'echo hello' }).expect(401);

            // With token succeeds
            const ok = await req
                .post('/v0/exec/run')
                .set('Authorization', 'Bearer secret-token')
                .send({ command: 'echo hello' })
                .expect(200);
            t.true(ok.body.ok);
            t.regex(ok.body.stdout || '', /hello/);

            // Guard blocks dangerous command
            const blocked = await req
                .post('/v0/exec/run')
                .set('Authorization', 'Bearer secret-token')
                .send({ command: 'rm -rf /tmp' })
                .expect(200);
            t.false(blocked.body.ok);
            t.regex(blocked.body.error || '', /blocked by guard/i);
        });
    } finally {
        process.env.AUTH_ENABLED = prev.AUTH_ENABLED;
        process.env.AUTH_MODE = prev.AUTH_MODE;
        process.env.AUTH_TOKENS = prev.AUTH_TOKENS;
        process.env.EXEC_ENABLED = prev.EXEC_ENABLED;
        process.env.EXEC_SHELL = prev.EXEC_SHELL;
    }
});
