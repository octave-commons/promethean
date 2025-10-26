import { z } from 'zod';

import { SchemaRegistry } from './registry.js';

export const reg = new SchemaRegistry();

reg.register({
    topic: 'heartbeat.received',
    version: 1,
    compat: 'backward',
    schema: z.object({
        pid: z.number(),
        name: z.string(),
        host: z.string(),
        cpu_pct: z.number(),
        mem_mb: z.number(),
        sid: z.string().optional(),
    }),
});

reg.register({
    topic: 'process.state',
    version: 1,
    compat: 'backward',
    schema: z.object({
        processId: z.string(),
        name: z.string(),
        host: z.string(),
        pid: z.number(),
        sid: z.string().optional(),
        cpu_pct: z.number(),
        mem_mb: z.number(),
        last_seen_ts: z.number(),
        status: z.enum(['alive', 'stale']),
    }),
});
