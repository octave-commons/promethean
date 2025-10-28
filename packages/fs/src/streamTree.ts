// @shared/ts/dist/fsStream.ts
import { promises as fs } from 'fs';
import * as path from 'path';

export type NodeType = 'file' | 'dir' | 'symlink';

export type StreamNode = {
    name: string; // basename
    path: string; // absolute path
    relative: string; // path relative to the root
    type: NodeType;
    size?: number; // bytes (files only)
    mtimeMs?: number; // modified time (ms since epoch)
    ext?: string; // ".ts", ".md", etc. (files only)
    depth: number; // 0 for root, 1 for its children, ...
};

export type StreamEventType = 'enter' | 'exit' | 'node' | 'error';

export type StreamEvent = {
    type: StreamEventType;
    node?: StreamNode; // present for 'node' | 'enter' | 'exit'
    error?: unknown; // present for 'error'
    atPath?: string; // path where error occurred
};

export type StreamOptions = {
    includeHidden?: boolean; // include dotfiles/dirs (default: false)
    maxDepth?: number; // 0 = only root, 1 = root + children, ... (default: Infinity)
    followSymlinks?: boolean; // (default: false)
    typeFilter?: NodeType | 'any'; // (default: "any")
    predicate?: (absPath: string, direntLike: DirentLike) => boolean; // early prune
    onError?: (err: unknown, absPath: string) => void; // optional side logging
    signal?: AbortSignal; // cancel mid-walk
};

/** Minimal Dirent-like surface for predicate use */
export type DirentLike = {
    name: string;
    isDirectory(): boolean;
    isFile(): boolean;
    isSymbolicLink(): boolean;
};

const isHidden = (name: string) => name.startsWith('.');

async function statOrLstat(p: string, follow: boolean) {
    return follow ? fs.stat(p) : fs.lstat(p);
}

/**
 * Async generator that streams file system traversal events.
 * Order: depth-first; for directories you’ll see:
 *   1) { type: "enter", node: <dir> }
 *   2) children...
 *   3) { type: "exit",  node: <dir> }
 * For files/symlinks you get a single { type: "node", node: <file|symlink> }.
 */
export async function* streamTree(root: string, opts: StreamOptions = {}): AsyncGenerator<StreamEvent> {
    const {
        includeHidden = false,
        maxDepth = Infinity,
        followSymlinks = false,
        typeFilter = 'any',
        predicate,
        onError,
        signal,
    } = opts;

    const absRoot = path.resolve(root);
    const base = absRoot;

    async function makeNode(p: string, depth: number): Promise<StreamNode | null> {
        try {
            let s = await statOrLstat(p, followSymlinks);
            let type: NodeType = s.isDirectory() ? 'dir' : s.isSymbolicLink() ? 'symlink' : 'file';

            // If following symlinks and this is a link, reclassify based on target
            if (followSymlinks && (await fs.lstat(p)).isSymbolicLink()) {
                try {
                    const t = await fs.stat(p);
                    type = t.isDirectory() ? 'dir' : 'file';
                    s = t;
                } catch {
                    // broken symlink -> keep as symlink, keep original stat `s`
                }
            }

            const name = path.basename(p);
            if (!includeHidden && isHidden(name)) return null;

            const direntLike: DirentLike = {
                name,
                isDirectory: () => type === 'dir',
                isFile: () => type === 'file',
                isSymbolicLink: () => type === 'symlink',
            };
            if (predicate && !predicate(p, direntLike)) return null;

            if (typeFilter !== 'any' && type !== typeFilter) {
                // For streaming, if this is a dir filtered out, we also skip its children.
                if (type === 'dir') return null;
            }

            return {
                name,
                path: p,
                relative: path.relative(base, p),
                type,
                ...(type === 'file' ? { size: s.size } : {}),
                mtimeMs: s.mtimeMs,
                ...(type === 'file' ? { ext: path.extname(name) } : {}),
                depth,
            };
        } catch (e) {
            onError?.(e, p);
            return { type: 'error', atPath: p, error: e } as any; // handled by caller
        }
    }

    async function* dfs(dirPath: string, depth: number): AsyncGenerator<StreamEvent> {
        if (signal?.aborted) return;
        const node = await makeNode(dirPath, depth);
        if (!node) return;
        if ((node as any).type === 'error') {
            const { error, atPath } = node as any;
            yield { type: 'error', error, atPath };
            return;
        }

        if (node.type !== 'dir') {
            yield { type: 'node', node };
            return;
        }

        // Directory
        yield { type: 'enter', node };
        if (depth < maxDepth) {
            let entries: import('fs').Dirent[] = [];
            try {
                entries = await fs.readdir(dirPath, { withFileTypes: true });
            } catch (e) {
                onError?.(e, dirPath);
                yield { type: 'error', error: e, atPath: dirPath };
                // still yield exit to keep enter/exit paired
                yield { type: 'exit', node };
                return;
            }

            // Depth-first
            for (const d of entries) {
                if (signal?.aborted) break;
                const childAbs = path.join(dirPath, d.name);
                for await (const ev of dfs(childAbs, depth + 1)) {
                    yield ev;
                }
            }
        }
        yield { type: 'exit', node };
    }

    // Kick off
    for await (const ev of dfs(absRoot, 0)) {
        if (signal?.aborted) return;
        yield ev;
    }
}

/**
 * Convenience: stream *only* file nodes (skips enter/exit and dirs).
 */
export async function* streamFiles(
    root: string,
    opts: Omit<StreamOptions, 'typeFilter'> = {},
): AsyncGenerator<StreamNode> {
    for await (const ev of streamTree(root, { ...opts, typeFilter: 'any' })) {
        if (ev.type === 'node' && ev.node?.type === 'file') {
            yield ev.node;
        }
    }
}

/**
 * Convenience: stream nodes but map them through a transformer (e.g., to index docs).
 */
export async function* mapStream<T>(
    root: string,
    transform: (n: StreamNode) => Promise<T | null> | T | null,
    opts: StreamOptions = {},
): AsyncGenerator<T> {
    for await (const ev of streamTree(root, opts)) {
        if (ev.type === 'node' && ev.node) {
            const out = await transform(ev.node);
            if (out != null) yield out;
        }
    }
}
