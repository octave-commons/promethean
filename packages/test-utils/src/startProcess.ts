import { spawn } from 'child_process';

import { sleep as wait } from '@promethean-os/utils';

import { ProcSpec, StartedProc } from './process.js';
import { waitForHttp } from './waitForHttp.js';
import { waitForLog } from './waitForLog.js';
import { waitForTcp } from './waitForTcp.js';

type ImmutableProcSpec = {
    readonly cmd: ProcSpec['cmd'];
    readonly args?: readonly string[];
    readonly cwd: ProcSpec['cwd'];
    readonly env?: ProcSpec['env'];
    readonly stdio?: ProcSpec['stdio'];
    readonly ready?: ProcSpec['ready'];
};

type ImmutableStartedProc = Readonly<StartedProc>;

/* eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types, functional/prefer-immutable-types --
   Node's ProcessEnv and ChildProcess types expose mutable interfaces; callers rely on this signature so we wrap
   the contract locally without cloning. */
export const startProcess = async (spec: ImmutableProcSpec): Promise<ImmutableStartedProc> => {
    const { cmd, args = [] as readonly string[], cwd, env = process.env, stdio = 'inherit', ready } = spec;

    const proc = spawn(cmd, [...args], { cwd, env, stdio });
    const hasExited = () => proc.exitCode !== null || proc.signalCode !== null;

    const stop = async () => {
        const exited = hasExited()
            ? Promise.resolve()
            : new Promise<void>((resolve) => proc.once('exit', () => resolve()));
        const closed = hasExited()
            ? Promise.resolve()
            : new Promise<void>((resolve) => proc.once('close', () => resolve()));

        if (!hasExited()) {
            proc.kill('SIGTERM');
            await wait(500);
            if (!hasExited()) proc.kill('SIGKILL');
        }

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

    return { proc, stop } as ImmutableStartedProc;
};
