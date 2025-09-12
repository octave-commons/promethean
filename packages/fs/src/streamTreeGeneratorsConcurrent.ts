// @shared/ts/dist/fsStreamConcurrent.ts
import { promises as fs } from 'fs';
import * as path from 'path';

export type NodeType = 'file' | 'dir' | 'symlink';
export type StreamEventType = 'enter' | 'exit' | 'node' | 'error';

export type StreamNode = {
    name: string;
    path: string; // absolute
    relative: string; // relative to root
    type: NodeType;
    size?: number;
    mtimeMs?: number;
    ext?: string;
    depth: number;
};

export type StreamEvent = {
    type: StreamEventType;
    node?: StreamNode;
    error?: unknown;
    atPath?: string;
};

export type DirentLike = {
    name: string;
    isDirectory(): boolean;
    isFile(): boolean;
    isSymbolicLink(): boolean;
};

export type StreamOptions = {
    includeHidden?: boolean;
    maxDepth?: number;
    followSymlinks?: boolean;
    typeFilter?: NodeType | 'any';
    predicate?: (absPath: string, direntLike: DirentLike) => boolean; // prune subtrees early
    onError?: (err: unknown, absPath: string) => void;
    signal?: AbortSignal;
    concurrency?: number; // max concurrent fs ops (default 16)
    queueHighWater?: number; // optional: backpressure to throttle workers
};

const EOF = Symbol('EOF');

/** Minimal async queue (channel) */
class AsyncQueue<T> implements AsyncIterable<T | typeof EOF> {
    private buf: (T | typeof EOF)[] = [];
    private resolvers: ((v: IteratorResult<T | typeof EOF>) => void)[] = [];
    private ended = false;
    private sentEOF = false;

    push(item: T) {
        if (this.ended) return;
        if (this.resolvers.length) {
            const r = this.resolvers.shift()!;
            r({ value: item, done: false });
        } else {
            this.buf.push(item);
        }
    }
    end() {
        if (this.ended) return;
        this.ended = true;
        if (this.resolvers.length) {
            const r = this.resolvers.shift()!;
            this.sentEOF = true;
            r({ value: EOF, done: false });
        } else {
            this.buf.push(EOF);
        }
    }
    get size() {
        return this.buf.length;
    }

    [Symbol.asyncIterator](): AsyncIterator<T | typeof EOF> {
        return {
            next: () =>
                new Promise<IteratorResult<T | typeof EOF>>((res) => {
                    if (this.buf.length) {
                        const value = this.buf.shift()!;
                        if (value === EOF) this.sentEOF = true;
                        res({ value, done: false });
                    } else if (this.sentEOF) {
                        res({ value: undefined, done: true });
                    } else {
                        this.resolvers.push(res);
                    }
                }),
        };
    }
}

const isHidden = (name: string) => name.startsWith('.');

async function statOrLstat(p: string, follow: boolean) {
    return follow ? fs.stat(p) : fs.lstat(p);
}

/**
 * Streaming DFS with bounded concurrency via an async queue.
 * Yields: enter/exit for dirs; node for files/symlinks; error on failures.
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
        queueHighWater = 1024,
    } = opts;

    const base = path.resolve(root);

    type Task = { absPath: string; depth: number };
    const queue = new AsyncQueue<StreamEvent>();
    const taskStack: Task[] = [{ absPath: base, depth: 0 }]; // DFS: LIFO

    let running = 0;
    let closed = false;

    const maybeStop = () => signal?.aborted;

    const spawnWorker = async () => {
        running++;
        try {
            while (!maybeStop()) {
                const task = taskStack.pop();
                if (!task) break;

                const { absPath, depth } = task;

                // Backpressure: if queue is too full, yield to consumer
                while (queue.size >= queueHighWater && !maybeStop()) {
                    await new Promise((r) => setTimeout(r, 1));
                }

                // Stat
                let s;
                try {
                    s = await statOrLstat(absPath, followSymlinks);
                } catch (e) {
                    onError?.(e, absPath);
                    queue.push({ type: 'error', error: e, atPath: absPath });
                    continue;
                }

                // Determine type, respecting followSymlinks
                let nodeType: NodeType = s.isDirectory() ? 'dir' : s.isSymbolicLink() ? 'symlink' : 'file';

                if (followSymlinks) {
                    try {
                        const lst = await fs.lstat(absPath);
                        if (lst.isSymbolicLink()) {
                            try {
                                const tgt = await fs.stat(absPath);
                                nodeType = tgt.isDirectory() ? 'dir' : 'file';
                                s = tgt;
                            } catch {
                                nodeType = 'symlink'; // broken
                            }
                        }
                    } catch {
                        // ignore; keep earlier type
                    }
                }

                const name = path.basename(absPath);
                if (!includeHidden && isHidden(name)) continue;

                const direntLike: DirentLike = {
                    name,
                    isDirectory: () => nodeType === 'dir',
                    isFile: () => nodeType === 'file',
                    isSymbolicLink: () => nodeType === 'symlink',
                };
                if (predicate && !predicate(absPath, direntLike)) continue;

                if (typeFilter !== 'any' && nodeType !== typeFilter) {
                    if (nodeType === 'dir') continue;
                }

                const node: StreamNode = {
                    name,
                    path: absPath,
                    relative: path.relative(base, absPath),
                    type: nodeType,
                    ...(nodeType === 'file' ? { size: s.size } : {}),
                    mtimeMs: s.mtimeMs,
                    ...(nodeType === 'file' ? { ext: path.extname(name) } : {}),
                    depth,
                };

                if (nodeType !== 'dir') {
                    queue.push({ type: 'node', node });
                    continue;
                }

                // Directory: enter, children (DFS push), exit
                queue.push({ type: 'enter', node });
                if (depth < maxDepth) {
                    try {
                        const children = await fs.readdir(absPath, { withFileTypes: true });
                        // Push in reverse so natural order is preserved when popping (DFS)
                        for (const c of [...children].reverse()) {
                            taskStack.push({ absPath: path.join(absPath, c.name), depth: depth + 1 });
                        }
                    } catch (e) {
                        onError?.(e, absPath);
                        queue.push({ type: 'error', error: e, atPath: absPath });
                    }
                }
                queue.push({ type: 'exit', node });
            }
        } finally {
            running--;
            if (running === 0 && !closed) {
                closed = true;
                queue.end();
            }
        }
    };

    // Start workers (up to #tasks)
    const workerCount = Math.max(1, Math.min(concurrency, taskStack.length || concurrency));
    Array.from({ length: workerCount }).forEach(() => {
        void spawnWorker();
    });

    // Drain the queue to the consumer
    for await (const ev of queue) {
        if (ev === EOF) break;
        if (maybeStop()) break;
        yield ev;
    }
}

/** Convenience: files-only stream */
export async function* streamFilesConcurrent(
    root: string,
    opts: Omit<StreamOptions, 'typeFilter'> = {},
): AsyncGenerator<StreamNode> {
    for await (const ev of streamTreeConcurrent(root, { ...opts, typeFilter: 'any' })) {
        if (ev.type === 'node' && ev.node?.type === 'file') yield ev.node;
    }
}

/** Map nodes to transformed items while streaming (with the same concurrency under the hood) */
export async function* mapStreamConcurrent<T>(
    root: string,
    transform: (n: StreamNode) => Promise<T | null> | T | null,
    opts: StreamOptions = {},
): AsyncGenerator<T> {
    for await (const ev of streamTreeConcurrent(root, opts)) {
        if (ev.type === 'node' && ev.node) {
            const out = await transform(ev.node);
            if (out != null) yield out;
        }
    }
}
