import { promises as fs } from 'fs';
import * as path from 'path';

import type { defineFsComponents } from '../components.js';
import type { WriteBufferState } from '../components.js';

export type WriteBufferSystemDeps = {
    mkdir: (dir: string) => Promise<void>;
    writeFile: (file: string, data: string | Uint8Array, encoding?: BufferEncoding) => Promise<void>;
    rm: (target: string, opts?: { recursive?: boolean }) => Promise<void>;
};

const defaultDeps: WriteBufferSystemDeps = {
    mkdir: async (dir) => {
        await fs.mkdir(dir, { recursive: true });
    },
    writeFile: async (file, data, encoding) => {
        if (typeof data === 'string') await fs.writeFile(file, data, { encoding: encoding ?? 'utf8' });
        else await fs.writeFile(file, data);
    },
    rm: async (target, opts) => fs.rm(target, { recursive: opts?.recursive ?? false, force: true }),
};

function ensureParents(write: { path: string }, seen: Set<string>, deps: WriteBufferSystemDeps) {
    const dir = path.dirname(write.path);
    if (seen.has(dir)) return Promise.resolve();
    seen.add(dir);
    return deps.mkdir(dir);
}

export function WriteBufferSystem(
    w: any,
    C: ReturnType<typeof defineFsComponents>,
    deps: WriteBufferSystemDeps = defaultDeps,
) {
    const { WriteBuffer } = C;
    const query = w.makeQuery({ all: [WriteBuffer] });

    return async function run(_dt: number) {
        for (const [entity] of w.iter(query)) {
            const buffer = w.get(entity, WriteBuffer) as WriteBufferState | undefined;
            if (!buffer) continue;
            const pending = buffer.ensure.length + buffer.writes.length + buffer.deletes.length;
            if (pending === 0) {
                w.carry(entity, WriteBuffer);
                continue;
            }

            const ensuredDirs = new Set<string>();
            let ensured = 0;
            let wrote = 0;
            let deleted = 0;
            let error: { message: string } | null = null;

            try {
                for (const dir of buffer.ensure) {
                    await deps.mkdir(dir);
                    ensured++;
                }

                for (const write of buffer.writes) {
                    await ensureParents(write, ensuredDirs, deps);
                    await deps.writeFile(write.path, write.data, write.encoding);
                    wrote++;
                }

                for (const del of buffer.deletes) {
                    await deps.rm(del.path, { recursive: del.recursive ?? false });
                    deleted++;
                }
            } catch (err) {
                error = { message: (err as Error).message };
            }

            w.set(entity, WriteBuffer, {
                ensure: [],
                writes: [],
                deletes: [],
                lastFlush: {
                    at: Date.now(),
                    ensured,
                    wrote,
                    deleted,
                    error,
                },
            });
        }
    };
}
