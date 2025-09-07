import { sleep as wait } from '@promethean/utils';
import { spawn } from 'child_process';
import { ProcSpec, StartedProc } from './process.js';
import { waitForHttp } from './waitForHttp.js';
import { waitForLog } from './waitForLog.js';
import { waitForTcp } from './waitForTcp.js';

export const startProcess = async (spec: ProcSpec): Promise<StartedProc> => {
    const { cmd, args = [], cwd, env = process.env, stdio = 'inherit', ready } = spec;

    const proc = spawn(cmd, [...args], { cwd, env, stdio });
    const stop = async () => {
        if (proc.killed) return;
        const exited = new Promise<void>((resolve) => proc.once('exit', () => resolve()));
        const closed = new Promise<void>((resolve) => proc.once('close', () => resolve()));
        proc.kill('SIGTERM');
        await wait(500);
        if (!proc.killed) proc.kill('SIGKILL');
        await Promise.all([exited, closed]);
    };

    if (ready) {
        if (ready.kind === 'http') await waitForHttp(ready.url, ready.timeoutMs);
        else if (ready.kind === 'tcp') await waitForTcp(ready.port, ready.host, ready.timeoutMs);
        else if (ready.kind === 'log') {
            if (stdio !== 'pipe') throw new Error('log readiness requires stdio: "pipe"');
            await waitForLog(proc, ready.pattern, ready.timeoutMs);
        }
    }

    return { proc, stop };
};
