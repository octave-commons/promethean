import { createHash } from 'crypto';
import { promises as fs } from 'fs';
import * as path from 'path';

import type { ComponentType, World } from '@promethean/ds/ecs.js';
import { makeStrictSystem, type SystemCtx, type SystemSpec } from '@promethean/ds/system.js';

import { ensureDir } from './ensureDir.js';
import { buildTree, flattenTree, type TreeNode, type TreeOptions } from './tree.js';
import { walkDir, type FileEntry, type WalkOptions } from './util.js';

export type SnapshotMode = 'tree' | 'flat';

export type DirectoryContentIntent = {
    encoding?: BufferEncoding;
    files?: string[];
    extensions?: string[];
};

export type DirectoryIntentState = {
    root: string;
    mode?: SnapshotMode;
    walk?: WalkOptions;
    tree?: TreeOptions;
    loadContent?: DirectoryContentIntent | false;
};

export type SnapshotFile = {
    encoding: BufferEncoding;
    data: string;
};

export type DirectorySnapshotState = {
    root: string;
    mode: SnapshotMode;
    capturedAt: number;
    version: number;
    hash: string;
    entries: FileEntry[];
    tree?: TreeNode;
    contents?: Record<string, SnapshotFile>;
};

export type DirectoryWriteOperation =
    | { kind: 'write'; relative: string; content: string | Buffer; encoding?: BufferEncoding }
    | { kind: 'mkdir'; relative: string }
    | { kind: 'remove'; relative: string; recursive?: boolean };

export type DirectoryWriteBufferState = {
    operations: DirectoryWriteOperation[];
    lastAppliedAt?: number;
    lastAppliedHash?: string;
    lastError?: string;
};

export type FsComponents = {
    DirectoryIntent: ComponentType<DirectoryIntentState>;
    DirectorySnapshot: ComponentType<DirectorySnapshotState>;
    DirectoryWriteBuffer: ComponentType<DirectoryWriteBufferState>;
};

export type FsSystems = {
    scan: (dt: number) => Promise<void>;
    write: (dt: number) => Promise<void>;
};

export function registerFsComponents(world: World): FsComponents {
    const DirectoryIntent = world.defineComponent<DirectoryIntentState>({
        name: 'fs.DirectoryIntent',
        equals: (a: DirectoryIntentState | undefined, b: DirectoryIntentState | undefined) =>
            stableIntent(a) === stableIntent(b),
    });
    const DirectorySnapshot = world.defineComponent<DirectorySnapshotState>({
        name: 'fs.DirectorySnapshot',
        equals: (a: DirectorySnapshotState | undefined, b: DirectorySnapshotState | undefined) =>
            !!a && !!b && a.hash === b.hash,
    });
    const DirectoryWriteBuffer = world.defineComponent<DirectoryWriteBufferState>({
        name: 'fs.DirectoryWriteBuffer',
        equals: (a: DirectoryWriteBufferState | undefined, b: DirectoryWriteBufferState | undefined) =>
            stableBuffer(a) === stableBuffer(b),
        defaults: () => ({ operations: [] }),
    });
    return { DirectoryIntent, DirectorySnapshot, DirectoryWriteBuffer };
}

export function initFsEcs(world: World): { components: FsComponents; systems: FsSystems } {
    const components = registerFsComponents(world);
    const systems = {
        scan: makeStrictSystem(world, makeScannerSpec(world, components)),
        write: makeStrictSystem(world, makeWriterSpec(world, components)),
    };
    return { components, systems };
}

function makeScannerSpec(world: World, { DirectoryIntent, DirectorySnapshot }: FsComponents): SystemSpec {
    const query = world.makeQuery({ all: [DirectoryIntent] });
    return {
        name: 'fs.directory.scan',
        reads: [DirectoryIntent],
        owns: [DirectorySnapshot],
        query: () => query,
        run: async (ctx: SystemCtx) => {
            for (const [entity, views] of ctx.entityIter({ intent: DirectoryIntent, snapshot: DirectorySnapshot })) {
                const intent = views.intent.read();
                if (!intent) continue;

                const absRoot = path.resolve(intent.root);
                const mode: SnapshotMode = intent.mode ?? 'tree';
                const entries: FileEntry[] = [];
                let tree: TreeNode | undefined;

                if (mode === 'tree') {
                    tree = await buildTree(absRoot, intent.tree ?? {});
                    entries.push(...flattenTree(tree).map(treeNodeToEntry));
                } else {
                    const walked = await walkDir(absRoot, intent.walk ?? {});
                    entries.push(...walked);
                }

                const normalizedEntries = entries.map((entry) => normalizeEntry(entry));
                const contents = await maybeLoadContents(absRoot, normalizedEntries, intent.loadContent);
                const hash = computeSnapshotHash(absRoot, mode, normalizedEntries, contents, tree);

                const prev = ctx.world.has(entity, DirectorySnapshot)
                    ? (ctx.world.get(entity, DirectorySnapshot) as DirectorySnapshotState | undefined)
                    : undefined;

                if (prev && prev.hash === hash) {
                    ctx.carry(entity, DirectorySnapshot);
                    continue;
                }

                const next: DirectorySnapshotState = {
                    root: absRoot,
                    mode,
                    capturedAt: Date.now(),
                    version: prev ? prev.version + 1 : 1,
                    hash,
                    entries: normalizedEntries,
                    ...(tree ? { tree } : {}),
                    ...(contents ? { contents } : {}),
                };

                if (!prev) ctx.world.addComponent(entity, DirectorySnapshot, next);
                else ctx.set(entity, DirectorySnapshot, next);
            }
        },
    };
}

function makeWriterSpec(world: World, { DirectoryIntent, DirectoryWriteBuffer }: FsComponents): SystemSpec {
    const query = world.makeQuery({ all: [DirectoryIntent, DirectoryWriteBuffer] });
    return {
        name: 'fs.directory.write',
        reads: [DirectoryIntent],
        owns: [DirectoryWriteBuffer],
        query: () => query,
        run: async (ctx: SystemCtx) => {
            for (const [entity, views] of ctx.entityIter({ intent: DirectoryIntent, buffer: DirectoryWriteBuffer })) {
                const intent = views.intent.read();
                const buffer = views.buffer.read();
                if (!intent || !buffer || buffer.operations.length === 0) {
                    if (buffer) views.buffer.carry();
                    continue;
                }

                const absRoot = path.resolve(intent.root);
                const pending = [...buffer.operations];
                const applied: DirectoryWriteOperation[] = [];
                let lastError: string | undefined;

                for (const op of pending) {
                    try {
                        await applyOperation(absRoot, op);
                        applied.push(op);
                    } catch (err) {
                        lastError = err instanceof Error ? err.message : String(err);
                        break;
                    }
                }

                const remaining = lastError ? pending.slice(applied.length) : [];
                const next: DirectoryWriteBufferState = { operations: remaining };
                if (lastError) {
                    next.lastError = lastError;
                } else {
                    next.lastAppliedAt = Date.now();
                    const appliedHash = hashOperations(applied);
                    if (appliedHash) next.lastAppliedHash = appliedHash;
                }

                ctx.set(entity, DirectoryWriteBuffer, next);
            }
        },
    };
}

function normalizeEntry(entry: FileEntry): FileEntry {
    return {
        ...entry,
        relative: normalizeRelative(entry.relative),
        path: path.resolve(entry.path),
    };
}

function treeNodeToEntry(node: TreeNode): FileEntry {
    const type = node.type === 'dir' ? 'dir' : node.type === 'symlink' ? 'symlink' : 'file';
    return {
        path: node.path,
        relative: node.relative,
        name: node.name,
        type,
    };
}

function normalizeRelative(rel: string): string {
    if (!rel) return '';
    return rel.split(path.sep).join('/');
}

async function maybeLoadContents(
    absRoot: string,
    entries: FileEntry[],
    intent: DirectoryContentIntent | false | undefined,
): Promise<Record<string, SnapshotFile> | undefined> {
    if (!intent) return undefined;
    const encoding = intent.encoding ?? 'utf8';
    const requestedFiles = new Set((intent.files ?? []).map(normalizeRelative));
    const extFilter = new Set(
        (intent.extensions ?? []).map((ext) => (ext.startsWith('.') ? ext.toLowerCase() : `.${ext.toLowerCase()}`)),
    );

    const matched = entries.filter((entry) => {
        if (entry.type !== 'file') return false;
        if (requestedFiles.size > 0) return requestedFiles.has(entry.relative);
        if (extFilter.size === 0) return true;
        const ext = path.extname(entry.relative).toLowerCase();
        return extFilter.has(ext);
    });

    if (matched.length === 0) return undefined;

    const contents: Record<string, SnapshotFile> = {};
    for (const entry of matched) {
        const abs = path.join(absRoot, entry.relative);
        try {
            const data = await fs.readFile(abs, encoding);
            contents[entry.relative] = { encoding, data };
        } catch {
            // Ignore read errors; snapshot consumers can handle missing files.
        }
    }
    return Object.keys(contents).length ? contents : undefined;
}

function computeSnapshotHash(
    root: string,
    mode: SnapshotMode,
    entries: FileEntry[],
    contents: Record<string, SnapshotFile> | undefined,
    tree: TreeNode | undefined,
): string {
    const h = createHash('sha256');
    h.update(root);
    h.update(mode);
    for (const entry of [...entries].sort((a, b) => a.relative.localeCompare(b.relative))) {
        h.update(entry.relative);
        h.update(entry.type);
    }
    if (contents) {
        for (const [rel, snapshot] of Object.entries(contents).sort(([a], [b]) => a.localeCompare(b))) {
            h.update(rel);
            h.update(snapshot.data);
            h.update(snapshot.encoding);
        }
    }
    if (tree) {
        const nodes = flattenTree(tree).map(
            (node) => `${node.relative}:${node.type}:${node.mtimeMs ?? ''}:${node.size ?? ''}`,
        );
        nodes.sort();
        for (const node of nodes) h.update(node);
    }
    return h.digest('hex');
}

async function applyOperation(root: string, op: DirectoryWriteOperation) {
    const absPath = path.join(root, normalizeRelative(op.relative));
    switch (op.kind) {
        case 'mkdir':
            await ensureDir(absPath);
            return;
        case 'remove':
            await fs.rm(absPath, { force: true, recursive: op.recursive ?? true });
            return;
        case 'write': {
            const dir = path.dirname(absPath);
            await ensureDir(dir);
            if (typeof op.content === 'string') {
                await fs.writeFile(absPath, op.content, op.encoding ?? 'utf8');
            } else {
                await fs.writeFile(absPath, op.content);
            }
            return;
        }
        default:
            throw new Error(`Unsupported operation ${(op as any).kind}`);
    }
}

function hashOperations(ops: DirectoryWriteOperation[]): string | undefined {
    if (ops.length === 0) return undefined;
    const h = createHash('sha256');
    for (const op of ops) {
        h.update(op.kind);
        h.update(op.relative);
        if (op.kind === 'write') {
            h.update(typeof op.content === 'string' ? op.content : op.content.toString('base64'));
            if (op.encoding) h.update(op.encoding);
        }
    }
    return h.digest('hex');
}

function stableIntent(intent: DirectoryIntentState | undefined): string {
    if (!intent) return '';
    const base = {
        root: path.resolve(intent.root),
        mode: intent.mode ?? 'tree',
        walk: intent.walk ?? {},
        tree: intent.tree ?? {},
        loadContent: intent.loadContent
            ? {
                  encoding: intent.loadContent.encoding ?? 'utf8',
                  files: (intent.loadContent.files ?? []).map(normalizeRelative).sort(),
                  extensions: (intent.loadContent.extensions ?? []).map((ext) => ext.toLowerCase()).sort(),
              }
            : null,
    };
    return JSON.stringify(base);
}

function stableBuffer(buffer: DirectoryWriteBufferState | undefined): string {
    if (!buffer) return '';
    return JSON.stringify({
        operations: buffer.operations.map((op) => ({
            ...op,
            ...(op.kind === 'write' && typeof op.content !== 'string'
                ? { content: op.content.toString('base64'), binary: true }
                : {}),
        })),
        lastAppliedAt: buffer.lastAppliedAt ?? null,
        lastAppliedHash: buffer.lastAppliedHash ?? null,
        lastError: buffer.lastError ?? null,
    });
}
