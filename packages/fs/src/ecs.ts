import * as path from 'path';

import type { ComponentType, World } from '@promethean/ds/ecs.js';
import { makeStrictSystem, type SystemCtx, type SystemSpec } from '@promethean/ds/system.js';

import { normalizeRelative } from './pathUtils.js';
import { computeSnapshotHash, loadEntries, maybeLoadContents, normalizeEntry } from './snapshot.js';
import type { TreeNode, TreeOptions } from './tree.js';
import { applyOperationsSequentially, hashOperations } from './writeOperations.js';
import type { FileEntry, WalkOptions } from './util.js';

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
        run: (ctx: SystemCtx) => scanDirectoryIntents(ctx, DirectoryIntent, DirectorySnapshot),
    };
}

function makeWriterSpec(world: World, { DirectoryIntent, DirectoryWriteBuffer }: FsComponents): SystemSpec {
    const query = world.makeQuery({ all: [DirectoryIntent, DirectoryWriteBuffer] });
    return {
        name: 'fs.directory.write',
        reads: [DirectoryIntent],
        owns: [DirectoryWriteBuffer],
        query: () => query,
        run: (ctx: SystemCtx) => flushWriteBuffers(ctx, DirectoryIntent, DirectoryWriteBuffer),
    };
}

async function scanDirectoryIntents(
    ctx: SystemCtx,
    DirectoryIntent: ComponentType<DirectoryIntentState>,
    DirectorySnapshot: ComponentType<DirectorySnapshotState>,
): Promise<void> {
    const intentComponents = [DirectoryIntent] as [ComponentType<DirectoryIntentState>];
    const intents = Array.from(ctx.iterAll<[DirectoryIntentState]>(...intentComponents));
    await Promise.all(
        intents.map(async ([entity, intent]) => {
            await updateSnapshot(ctx, entity, intent, DirectorySnapshot);
        }),
    );
}

async function updateSnapshot(
    ctx: SystemCtx,
    entity: number,
    intent: DirectoryIntentState,
    DirectorySnapshot: ComponentType<DirectorySnapshotState>,
): Promise<void> {
    const absRoot = path.resolve(intent.root);
    const mode: SnapshotMode = intent.mode ?? 'tree';
    const { entries, tree } = await loadEntries(absRoot, mode, intent.tree, intent.walk);
    const normalizedEntries = entries.map(normalizeEntry);
    const contents = await maybeLoadContents(absRoot, normalizedEntries, intent.loadContent);
    const hash = computeSnapshotHash({
        root: absRoot,
        mode,
        entries: normalizedEntries,
        contents,
        tree,
    });
    const previous = ctx.get(entity, DirectorySnapshot);

    if (previous && previous.hash === hash) {
        ctx.carry(entity, DirectorySnapshot);
        return;
    }

    const next: DirectorySnapshotState = {
        root: absRoot,
        mode,
        capturedAt: Date.now(),
        version: previous ? previous.version + 1 : 1,
        hash,
        entries: normalizedEntries,
        ...(tree ? { tree } : {}),
        ...(contents ? { contents } : {}),
    };

    if (!previous) {
        ctx.world.addComponent(entity, DirectorySnapshot, next);
        return;
    }
    ctx.set(entity, DirectorySnapshot, next);
}

async function flushWriteBuffers(
    ctx: SystemCtx,
    DirectoryIntent: ComponentType<DirectoryIntentState>,
    DirectoryWriteBuffer: ComponentType<DirectoryWriteBufferState>,
): Promise<void> {
    const bufferComponents = [DirectoryIntent, DirectoryWriteBuffer] as [
        ComponentType<DirectoryIntentState>,
        ComponentType<DirectoryWriteBufferState>,
    ];
    const buffers = Array.from(ctx.iterAll<[DirectoryIntentState, DirectoryWriteBufferState]>(...bufferComponents));
    await Promise.all(
        buffers.map(async ([entity, intent, buffer]) => {
            if (buffer.operations.length === 0) {
                ctx.carry(entity, DirectoryWriteBuffer);
                return;
            }
            const absRoot = path.resolve(intent.root);
            const result = await applyOperationsSequentially(absRoot, buffer.operations);
            const appliedHash = hashOperations(result.applied);
            const next: DirectoryWriteBufferState = {
                operations: result.error ? buffer.operations.slice(result.applied.length) : [],
                ...(result.error
                    ? { lastError: result.error }
                    : {
                          lastAppliedAt: Date.now(),
                          ...(appliedHash ? { lastAppliedHash: appliedHash } : {}),
                      }),
            };
            ctx.set(entity, DirectoryWriteBuffer, next);
        }),
    );
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
