import { createHash } from 'crypto';
import { promises as fs } from 'fs';

import { walkDir } from '../../util.js';
import { buildTree } from '../../tree.js';
import type { defineFsComponents } from '../components.js';
import type { DirectoryIntentState, DirectorySnapshotState } from '../components.js';

export type DirectorySnapshotSystemDeps = {
    walkDir: typeof walkDir;
    buildTree: typeof buildTree;
    readFile: (absPath: string, encoding: BufferEncoding) => Promise<string>;
};

const defaultDeps: DirectorySnapshotSystemDeps = {
    walkDir,
    buildTree,
    readFile: async (absPath, encoding) => fs.readFile(absPath, { encoding }),
};

function shouldCaptureFile(intent: DirectoryIntentState, entry: { type: string; name: string }) {
    const capture = intent.capture;
    if (!capture?.contents) return false;
    if (!capture.suffixes || capture.suffixes.length === 0) return true;
    return capture.suffixes.some((suffix) => entry.name.endsWith(suffix));
}

function computeSignature(snapshot: Omit<DirectorySnapshotState, 'signature'>) {
    const hash = createHash('sha1');
    const sortedEntries = [...snapshot.entries].map((entry) => `${entry.relative}:${entry.type}`).sort();
    for (const line of sortedEntries) hash.update(line);

    const fileKeys = Object.keys(snapshot.files).sort();
    for (const key of fileKeys) {
        hash.update(key);
        hash.update('\u0000');
        hash.update(snapshot.files[key] ?? '');
    }

    if (snapshot.tree) {
        const queue = [snapshot.tree];
        while (queue.length) {
            const node = queue.pop()!;
            hash.update(`${node.relative}:${node.type}:${node.mtimeMs ?? 0}:${node.size ?? 0}`);
            if (node.children) queue.push(...node.children);
        }
    }

    return hash.digest('hex');
}

async function buildSnapshot(
    intent: DirectoryIntentState,
    deps: DirectorySnapshotSystemDeps,
): Promise<Omit<DirectorySnapshotState, 'signature'>> {
    const entries = await deps.walkDir(intent.path, intent.walk);
    const captureEncoding = intent.capture?.encoding ?? 'utf8';
    const files: Record<string, string> = {};

    for (const entry of entries) {
        if (entry.type !== 'file') continue;
        if (!shouldCaptureFile(intent, entry)) continue;
        try {
            files[entry.relative] = await deps.readFile(entry.path, captureEncoding);
        } catch (err) {
            files[entry.relative] = `__ERROR__:${(err as Error).message}`;
        }
    }

    let tree = null;
    if (intent.tree !== null) {
        try {
            tree = await deps.buildTree(intent.path, intent.tree);
        } catch (err) {
            console.warn('DirectorySnapshotSystem buildTree failed', err);
        }
    }

    return {
        entries,
        tree,
        files,
        version: 1,
        updatedAt: Date.now(),
        error: null,
    };
}

export function DirectorySnapshotSystem(
    w: any,
    C: ReturnType<typeof defineFsComponents>,
    deps: DirectorySnapshotSystemDeps = defaultDeps,
) {
    const { DirectoryIntent, DirectorySnapshot } = C;
    const query = w.makeQuery({ all: [DirectoryIntent] });

    return async function run(_dt: number) {
        for (const [entity] of w.iter(query)) {
            const intent = w.get(entity, DirectoryIntent);
            if (!intent) continue;

            try {
                const baseSnapshot = await buildSnapshot(intent, deps);
                const signature = computeSignature(baseSnapshot);
                const prev = w.get(entity, DirectorySnapshot);
                if (!prev) {
                    w.addComponent(entity, DirectorySnapshot, { ...baseSnapshot, signature });
                    continue;
                }
                if (prev.signature !== signature) {
                    w.set(entity, DirectorySnapshot, {
                        ...baseSnapshot,
                        signature,
                        version: prev.version + 1,
                    });
                } else {
                    w.carry(entity, DirectorySnapshot);
                }
            } catch (err) {
                const prev = w.get(entity, DirectorySnapshot);
                const payload: DirectorySnapshotState = {
                    entries: prev?.entries ?? [],
                    tree: prev?.tree ?? null,
                    files: prev?.files ?? {},
                    version: (prev?.version ?? 0) + 1,
                    updatedAt: Date.now(),
                    signature: prev?.signature ?? '',
                    error: { message: (err as Error).message },
                };
                if (!prev) w.addComponent(entity, DirectorySnapshot, payload);
                else w.set(entity, DirectorySnapshot, payload);
            }
        }
    };
}
