// @shared/ts/dist/fsStreamConcurrent.ts
import { promises as fs } from 'fs';
import * as path from 'path';

export type NodeType = 'file' | 'dir' | 'symlink';

export type StreamNode = {
    name: string;
    path: string;
    relative: string;
    type: NodeType;
    size?: number;
    mtimeMs?: number;
    ext?: string;
    depth: number;
};

export type StreamEventType = 'enter' | 'exit' | 'node' | 'error';

export type StreamEvent = {
    type: StreamEventType;
    node?: StreamNode;
    error?: unknown;
    atPath?: string;
};

export type StreamOptions = {
    includeHidden?: boolean;
    maxDepth?: number;
    followSymlinks?: boolean;
    typeFilter?: NodeType | 'any';
    predicate?: (absPath: string, direntLike: DirentLike) => boolean;
    onError?: (err: unknown, absPath: string) => void;
    signal?: AbortSignal;
    concurrency?: number; // NEW: max concurrent fs ops
};

export type DirentLike = {
    name: string;
    isDirectory(): boolean;
    isFile(): boolean;
    isSymbolicLink(): boolean;
};

const isHidden = (n: string) => n.startsWith('.');

async function statOrLstat(p: string, follow: boolean) {
    return follow ? fs.stat(p) : fs.lstat(p);
}

/**
 * Streaming DFS with bounded concurrency
 */
export async function* streamTreeConcurrent(root: string, opts: StreamOptions = {}): AsyncGenerator<StreamEvent> {
    const {
        includeHidden = false,
        maxDepth = Infinity,
        followSymlinks = false,
        typeFilter = 'any',
        predicate,
        onError,
        signal,
        concurrency = 16,
    } = opts;

    const base = path.resolve(root);

    // Work queue of directories to process
    type Task = { dirPath: string; depth: number; parent?: StreamNode };
    const queue: Task[] = [{ dirPath: base, depth: 0 }];

    let active = 0;
    let done = false;

    const waiters: (() => void)[] = [];
    const notify = () => {
        while (waiters.length && active < concurrency && queue.length) {
            waiters.shift()?.();
        }
    };

    async function nextTask(): Promise<Task | null> {
        while (!signal?.aborted) {
            if (queue.length && active < concurrency) {
                active++;
                return queue.shift()!;
            }
            if (done) return null;
            await new Promise<void>((res) => waiters.push(res));
        }
        return null;
    }

    async function release() {
        active--;
        notify();
    }

    async function processTask(task: Task): Promise<StreamEvent[]> {
        const out: StreamEvent[] = [];
        const { dirPath, depth } = task;
        let s;
        try {
            s = await statOrLstat(dirPath, followSymlinks);
        } catch (e) {
            onError?.(e, dirPath);
            return [{ type: 'error', error: e, atPath: dirPath }];
        }

        let type: NodeType = s.isDirectory() ? 'dir' : s.isSymbolicLink() ? 'symlink' : 'file';

        if (followSymlinks && (await fs.lstat(dirPath)).isSymbolicLink()) {
            try {
                const t = await fs.stat(dirPath);
                type = t.isDirectory() ? 'dir' : 'file';
                s = t;
            } catch {
                // broken symlink stays symlink
            }
        }

        const name = path.basename(dirPath);
        if (!includeHidden && isHidden(name)) return [];
        const direntLike: DirentLike = {
            name,
            isDirectory: () => type === 'dir',
            isFile: () => type === 'file',
            isSymbolicLink: () => type === 'symlink',
        };
        if (predicate && !predicate(dirPath, direntLike)) return [];

        if (typeFilter !== 'any' && type !== typeFilter) {
            if (type === 'dir') return [];
        }

        const node: StreamNode = {
            name,
            path: dirPath,
            relative: path.relative(base, dirPath),
            type,
            ...(type === 'file' ? { size: s.size } : {}),
            mtimeMs: s.mtimeMs,
            ...(type === 'file' ? { ext: path.extname(name) } : {}),
            depth,
        };

        if (type === 'dir') {
            out.push({ type: 'enter', node });
            if (depth < maxDepth) {
                try {
                    const children = await fs.readdir(dirPath, { withFileTypes: true });
                    for (const c of children) {
                        queue.push({ dirPath: path.join(dirPath, c.name), depth: depth + 1 });
                    }
                    notify();
                } catch (e) {
                    onError?.(e, dirPath);
                    out.push({ type: 'error', error: e, atPath: dirPath });
                }
            }
            out.push({ type: 'exit', node });
        } else {
            out.push({ type: 'node', node });
        }
        return out;
    }

    // Orchestrator
    const workers: Promise<void>[] = Array.from({ length: concurrency }, () =>
        (async () => {
            while (true) {
                const task = await nextTask();
                if (!task) return;
                  try {
                      await processTask(task);
                  } finally {
                      release();
                  }
              }
          })(),
    );

    // Main event loop: yield events as tasks are processed
    while (active > 0 || queue.length > 0) {
        const task = await nextTask();
        if (!task) break;
        try {
            const events = await processTask(task);
            for (const ev of events) {
                yield ev;
            }
        } finally {
            release();
        }
    }

    done = true;
    await Promise.all(workers);
}
