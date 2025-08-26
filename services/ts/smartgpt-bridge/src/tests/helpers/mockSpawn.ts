// @ts-nocheck
import { EventEmitter } from 'node:events';

export function mockSpawnFactory(script = []) {
    return function mockSpawn(cmd, _args, _opts) {
        const ee = new EventEmitter();
        const proc = {
            pid: 4242,
            stdout: new EventEmitter(),
            stderr: new EventEmitter(),
            stdin: { write: () => {} },
            on: (ev, cb) => ee.on(ev, cb),
        };
        // Drive the script: [{ type:'stdout'|'stderr'|'exit', data:'...', code:0 }]
        setImmediate(() => {
            for (const step of script) {
                if (step.type === 'stdout') proc.stdout.emit('data', Buffer.from(step.data));
                if (step.type === 'stderr') proc.stderr.emit('data', Buffer.from(step.data));
                if (step.type === 'exit') ee.emit('exit', step.code ?? 0, null);
            }
        });
        return proc;
    };
}
