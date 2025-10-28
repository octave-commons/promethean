import { createHash } from 'crypto';
import { promises as fs } from 'fs';
import * as path from 'path';

import type { DirectoryContentIntent, SnapshotFile, SnapshotMode } from './ecs.js';
import { normalizeRelative } from './pathUtils.js';
import { buildTree, flattenTree, type TreeNode, type TreeOptions } from './tree.js';
import { walkDir, type FileEntry, type WalkOptions } from './util.js';

export type EntriesResult = {
    readonly entries: readonly FileEntry[];
    readonly tree?: TreeNode;
};

export async function loadEntries(
    absRoot: string,
    mode: SnapshotMode,
    treeOptions: TreeOptions | undefined,
    walkOptions: WalkOptions | undefined,
): Promise<EntriesResult> {
    if (mode === 'tree') {
        const tree = await buildTree(absRoot, treeOptions ?? {});
        const entries = flattenTree(tree).map(treeNodeToEntry);
        return { entries, tree };
    }
    const entries = await walkDir(absRoot, walkOptions ?? {});
    return { entries };
}

export function normalizeEntry(entry: FileEntry): FileEntry {
    return {
        ...entry,
        relative: normalizeRelative(entry.relative),
        path: path.resolve(entry.path),
    };
}

export async function maybeLoadContents(
    absRoot: string,
    entries: readonly FileEntry[],
    intent: DirectoryContentIntent | false | undefined,
): Promise<Record<string, SnapshotFile> | undefined> {
    if (!intent) return undefined;
    const encoding = intent.encoding ?? 'utf8';
    const requestedFiles = new Set((intent.files ?? []).map(normalizeRelative));
    const extFilter = new Set(
        (intent.extensions ?? []).map((ext) => (ext.startsWith('.') ? ext.toLowerCase() : `.${ext.toLowerCase()}`)),
    );

    const matched = Array.from(entries).filter((entry) => {
        if (entry.type !== 'file') return false;
        if (requestedFiles.size > 0) return requestedFiles.has(entry.relative);
        if (extFilter.size === 0) return true;
        const ext = path.extname(entry.relative).toLowerCase();
        return extFilter.has(ext);
    });

    if (matched.length === 0) return undefined;

    const pairs = await Promise.all(
        matched.map(async (entry) => {
            const abs = path.join(absRoot, entry.relative);
            const data = await fs.readFile(abs, encoding).catch(() => undefined);
            return data ? ([entry.relative, { encoding, data }] as const) : null;
        }),
    );
    const filtered = pairs.filter((pair): pair is readonly [string, SnapshotFile] => pair !== null);
    if (filtered.length === 0) return undefined;
    return Object.fromEntries(filtered);
}

export function computeSnapshotHash({
    root,
    mode,
    entries,
    contents,
    tree,
}: {
    readonly root: string;
    readonly mode: SnapshotMode;
    readonly entries: readonly FileEntry[];
    readonly contents?: Record<string, SnapshotFile>;
    readonly tree?: TreeNode;
}): string {
    const h = createHash('sha256');
    h.update(root);
    h.update(mode);
    entries
        .slice()
        .sort((a, b) => a.relative.localeCompare(b.relative))
        .forEach((entry) => {
            h.update(entry.relative);
            h.update(entry.type);
        });
    if (contents) {
        Object.entries(contents)
            .sort(([a], [b]) => a.localeCompare(b))
            .forEach(([rel, snapshot]) => {
                h.update(rel);
                h.update(snapshot.data);
                h.update(snapshot.encoding);
            });
    }
    if (tree) {
        flattenTree(tree)
            .map((node) => `${node.relative}:${node.type}:${node.mtimeMs ?? ''}:${node.size ?? ''}`)
            .sort()
            .forEach((serialized) => h.update(serialized));
    }
    return h.digest('hex');
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
