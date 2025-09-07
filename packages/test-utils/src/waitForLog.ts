import type { ChildProcess } from 'child_process';

export const waitForLog = (proc: ChildProcess, pattern: RegExp, timeoutMs = 15000): Promise<void> =>
    new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error(`Log pattern not seen: ${pattern}`)), timeoutMs);
        const onData = (chunk: Buffer) => {
            if (pattern.test(chunk.toString())) {
                cleanup();
                resolve();
            }
        };
        const onExit = () => {
            cleanup();
            reject(new Error('Process exited before readiness'));
        };
        const cleanup = () => {
            clearTimeout(timer);
            proc.stdout?.off('data', onData);
            proc.stderr?.off('data', onData);
            proc.off('exit', onExit);
        };
        proc.on('exit', onExit);
        proc.stdout?.on('data', onData);
        proc.stderr?.on('data', onData);
    });
