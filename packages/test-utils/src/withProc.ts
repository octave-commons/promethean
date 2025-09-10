import type { Macro } from 'ava';

import { ProcSpec, IntegrationTestFn } from './process.js';
import { startProcess } from './startProcess.js';

export const withProc: Macro<[ProcSpec, IntegrationTestFn]> = {
    title: (ttl = '', _spec, _fn) => ttl || 'withProc',
    exec: async (t, spec, fn) => {
        const { proc, stop } = await startProcess(spec);
        try {
            await fn(t, { procPid: proc.pid ?? -1, stop });
        } finally {
            await stop();
        }
    },
};
