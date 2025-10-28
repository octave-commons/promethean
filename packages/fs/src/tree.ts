// @shared/ts/dist/fsTree.ts
import type { Dirent, Stats } from 'fs';
import { promises as fs } from 'fs';
import * as path from 'path';

export type NodeType = 'file' | 'dir' | 'symlink';

export type TreeNode = Readonly<{
    name: string; // basename
    path: string; // absolute path
    relative: string; // path relative to root
    type: NodeType;
    size?: number; // bytes (for files if available)
    mtimeMs?: number; // modified time (ms since epoch)
    ext?: string; // ".ts", ".md", etc. (files only)
    children?: readonly TreeNode[]; // present for dirs
}>;

export type TreeOptions = {
    includeHidden?: boolean; // include dotfiles/dirs (default: false)
    maxDepth?: number; // 0 = only root, 1 = root + children, ... (default: Infinity)
    followSymlinks?: boolean; // lstat vs stat (default: false)
    typeFilter?: NodeType | 'any'; // restrict subtree nodes (default: "any")
    onError?: (err: unknown, absPath: string) => void; // error hook (default: swallow/log)
    predicate?: (absPath: string, dirent: Dirent) => boolean; // skip nodes if returns false
};

type NormalizedTreeOptions = {
    readonly includeHidden: boolean;
    readonly maxDepth: number;
    readonly followSymlinks: boolean;
    readonly typeFilter: NodeType | 'any';
    readonly onError: (err: unknown, absPath: string) => void;
    readonly predicate?: (absPath: string, dirent: Dirent) => boolean;
};

type TreeContext = {
    readonly base: string;
    readonly rootName: string;
    readonly opts: NormalizedTreeOptions;
};

const isHidden = (name: string) => name.startsWith('.');

const defaultOnError = (err: unknown, absPath: string) => console.warn('fsTree:', { path: absPath, error: err });

const normalizeTreeOptions = (opts: TreeOptions = {}): NormalizedTreeOptions => ({
    includeHidden: opts.includeHidden ?? false,
    maxDepth: opts.maxDepth ?? Infinity,
    followSymlinks: opts.followSymlinks ?? false,
    typeFilter: opts.typeFilter ?? 'any',
    onError: opts.onError ?? defaultOnError,
    predicate: opts.predicate,
});

const makeContext = (root: string, opts: TreeOptions = {}): TreeContext => {
    const normalized = normalizeTreeOptions(opts);
    const absRoot = path.resolve(root);
    return {
        base: absRoot,
        rootName: path.basename(absRoot),
        opts: normalized,
    };
};

const readDirEntries = async (absPath: string, ctx: TreeContext): Promise<Dirent[]> =>
    fs.readdir(absPath, { withFileTypes: true }).catch((err: unknown) => {
        ctx.opts.onError(err, absPath);
        return [];
    });

const statEntry = async (absPath: string, ctx: TreeContext): Promise<Stats | null> =>
    (ctx.opts.followSymlinks ? fs.stat(absPath) : fs.lstat(absPath)).catch((err: unknown) => {
        ctx.opts.onError(err, absPath);
        return null;
    });

const resolveSymlinkType = async (absPath: string, ctx: TreeContext): Promise<NodeType | null> =>
    fs
        .stat(absPath)
        .then((target) => (target.isDirectory() ? 'dir' : 'file'))
        .catch((err: unknown) => {
            ctx.opts.onError(err, absPath);
            return null;
        });

const classifyType = async (stats: Stats, absPath: string, ctx: TreeContext): Promise<NodeType> => {
    if (stats.isDirectory()) return 'dir';
    if (stats.isSymbolicLink()) {
        if (!ctx.opts.followSymlinks) return 'symlink';
        const resolved = await resolveSymlinkType(absPath, ctx);
        return resolved ?? 'symlink';
    }
    return 'file';
};

const makeDirent = (name: string, type: NodeType, parentPath: string, absPath: string): Dirent =>
    ({
        name,
        parentPath,
        path: absPath,
        isBlockDevice: () => false,
        isCharacterDevice: () => false,
        isDirectory: () => type === 'dir',
        isFIFO: () => false,
        isFile: () => type === 'file',
        isSocket: () => false,
        isSymbolicLink: () => type === 'symlink',
    }) as Dirent;

const shouldKeepNode = (absPath: string, type: NodeType, ctx: TreeContext): boolean => {
    const name = path.basename(absPath);
    if (!ctx.opts.includeHidden && isHidden(name)) return false;
    if (ctx.opts.predicate) {
        const dirent = makeDirent(name, type, path.dirname(absPath), absPath);
        if (!ctx.opts.predicate(absPath, dirent)) return false;
    }
    if (ctx.opts.typeFilter !== 'any' && type !== ctx.opts.typeFilter && type !== 'dir') return false;
    return true;
};

const baseNodeFor = (absPath: string, stats: Stats, type: NodeType, ctx: TreeContext): TreeNode => {
    const name = path.basename(absPath);
    const node = {
        name,
        path: absPath,
        relative: path.relative(ctx.base, absPath),
        type,
        ...(type === 'file' ? { size: stats.size, ext: path.extname(name) } : {}),
        mtimeMs: stats.mtimeMs,
    } satisfies TreeNode;
    return node;
};

const attachChildren = async (node: TreeNode, absPath: string, depth: number, ctx: TreeContext): Promise<TreeNode> => {
    if (node.type !== 'dir' || depth >= ctx.opts.maxDepth) return node;
    const entries = await readDirEntries(absPath, ctx);
    const children = await Promise.all(
        entries.map((entry) => createNode(path.join(absPath, entry.name), depth + 1, ctx)),
    );
    const present = children.filter((child): child is TreeNode => child !== null);
    if (present.length === 0) return node;
    return {
        ...node,
        children: present,
    } satisfies TreeNode;
};

const createNode = async (absPath: string, depth: number, ctx: TreeContext): Promise<TreeNode | null> => {
    const stats = await statEntry(absPath, ctx);
    if (!stats) return null;
    const type = await classifyType(stats, absPath, ctx);
    if (!shouldKeepNode(absPath, type, ctx)) return null;
    const node = baseNodeFor(absPath, stats, type, ctx);
    return attachChildren(node, absPath, depth, ctx);
};

const fallbackNode = (ctx: TreeContext): TreeNode =>
    ({
        name: ctx.rootName,
        path: ctx.base,
        relative: '',
        type: 'dir',
        children: [],
    }) satisfies TreeNode;

export async function buildTree(root: string, opts: TreeOptions = {}): Promise<TreeNode> {
    const ctx = makeContext(root, opts);
    const node = await createNode(ctx.base, 0, ctx);
    return node ?? fallbackNode(ctx);
}

/**
 * Flatten a tree into a list (preorder). Handy for search, indexing, etc.
 */
export function flattenTree(root: TreeNode): TreeNode[] {
    const children = Array.from(root.children ?? []);
    return [root, ...children.flatMap(flattenTree)];
}

/**
 * Filter a tree, keeping nodes for which `keep(node)` is true.
 * If a directory ends up with no kept descendants and itself fails keep(), it is removed.
 */
export function filterTree(node: TreeNode, keep: (n: TreeNode) => boolean): TreeNode | null {
    const filteredChildren = Array.from(node.children ?? [])
        .map((child) => filterTree(child, keep))
        .filter((child): child is TreeNode => child !== null);
    const hasChildren = filteredChildren.length > 0;
    const next = {
        ...node,
        ...(hasChildren ? { children: filteredChildren } : {}),
    } satisfies TreeNode;
    return keep(next) || (node.type === 'dir' && hasChildren) ? next : null;
}

/**
 * Utility: Make a compact tree (collapse directories that have a single directory child).
 * Useful for pretty “tree” UIs that avoid long linear chains like src/foo/bar/baz.
 */
export function collapseSingleChildDirs(node: TreeNode): TreeNode {
    const collapsedChildren = Array.from(node.children ?? []).map(collapseSingleChildDirs);
    if (collapsedChildren.length !== 1) {
        return collapsedChildren.length ? ({ ...node, children: collapsedChildren } satisfies TreeNode) : node;
    }
    const only = collapsedChildren[0]!;
    if (node.type === 'dir' && only.type === 'dir') {
        const merged = {
            name: only.name,
            relative: only.relative,
            path: only.path,
            type: only.type,
            ...(only.size !== undefined ? { size: only.size } : {}),
            ...(only.mtimeMs !== undefined ? { mtimeMs: only.mtimeMs } : {}),
            ...(only.ext ? { ext: only.ext } : {}),
            ...(only.children ? { children: only.children } : {}),
        } satisfies TreeNode;
        return collapseSingleChildDirs(merged);
    }
    return { ...node, children: collapsedChildren } satisfies TreeNode;
}
