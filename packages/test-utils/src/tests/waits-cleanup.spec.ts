import { spawn } from 'node:child_process';

import test from 'ava';

import { waitForLog } from '../waitForLog.js';

test('waitForLog cleans up listeners after resolve', async (t) => {
    const code = "setTimeout(() => console.log('READY'), 20); setTimeout(() => {}, 200)";
    const child = spawn('node', ['-e', code], { stdio: 'pipe' });

    await waitForLog(child, /READY/, 1000);

    t.is(child.listenerCount('exit'), 0);
    t.is(child.stdout?.listenerCount('data') ?? -1, 0);
    t.is(child.stderr?.listenerCount('data') ?? -1, 0);
});
