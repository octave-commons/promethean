import test from 'ava';

import { withProc } from '../withProc.js';

const sleeper = "console.log('READY'); setTimeout(() => {}, 2000)";

test(
    'withProc macro provides pid and stop()',
    withProc,
    {
        cmd: 'node',
        args: ['-e', sleeper],
        cwd: process.cwd(),
        stdio: 'pipe',
        ready: { kind: 'log', pattern: /READY/ },
    },
    async (t, { procPid, stop }) => {
        t.true(procPid > 0);
        await stop();
        const killed = (() => {
            try {
                process.kill(procPid, 0);
                return false;
            } catch {
                return true;
            }
        })();
        t.true(killed);
    },
);
