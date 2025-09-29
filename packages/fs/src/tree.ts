// @shared/ts/dist/fsTree.ts
import { Dirent, promises as fs } from 'fs';
import * as path from 'path';

export type NodeType = 'file' | 'dir' | 'symlink';

export type TreeNode = {
    name: string; // basename
    path: string; // absolute path
    relative: string; // path relative to root
    type: NodeType;
    size?: number; // bytes (for files if available)
    mtimeMs?: number; // modified time (ms since epoch)
    ext?: string; // ".ts", ".md", etc. (files only)
    children?: TreeNode[]; // present for dirs
};

export type TreeOptions = {
    includeHidden?: boolean; // include dotfiles/dirs (default: false)
    maxDepth?: number; // 0 = only root, 1 = root + children, ... (default: Infinity)
    followSymlinks?: boolean; // lstat vs stat (default: false)
    typeFilter?: NodeType | 'any'; // restrict subtree nodes (default: "any")
    onError?: (err: unknown, absPath: string) => void; // error hook (default: swallow/log)
    predicate?: (absPath: string, dirent: Dirent) => boolean; // skip nodes if returns false
};

const isHidden = (name: string) => name.startsWith('.');

async function statOrLstat(p: string, followSymlinks: boolean, onError: (arg0: Error, arg1: string) => void) {
    try {
        return followSymlinks ? await fs.stat(p) : await fs.lstat(p);
    } catch (e) {
        onError(e as Error, p);
        return null;
    }
}
export async function buildTree(root: string, opts: TreeOptions = {}): Promise<TreeNode> {
    const {
        includeHidden = false,
        maxDepth = Infinity,
        followSymlinks = false,
        typeFilter = 'any',
        onError = (e, p) => console.warn('fsTree:', { path: p, error: e }),
        predicate,
    } = opts;

    // Normalize root
    const absRoot = path.resolve(root);
    const rootName = path.basename(absRoot);

    async function readDir(p: string): Promise<Dirent[]> {
        try {
            return await fs.readdir(p, { withFileTypes: true });
        } catch (e) {
            onError(e, p);
            return [];
        }
    }

    async function nodeFromPath(p: string, base: string, depth: number): Promise<TreeNode | null> {
        const s = await statOrLstat(p, followSymlinks, onError);
        if (!s) return null;

        const name = path.basename(p);
        const relative = path.relative(base, p);

        let type: NodeType = s.isDirectory() ? 'dir' : s.isSymbolicLink() ? 'symlink' : 'file';
        // If we don't follow symlinks, symlink to dir/file stays "symlink".
        // If we *do* follow, reclassify based on target:
        if (followSymlinks && s.isSymbolicLink()) {
            try {
                const target = await fs.stat(p);
                type = target.isDirectory() ? 'dir' : 'file';
            } catch {
                // broken symlink -> keep as "symlink"
            }
        }

        if (
            (!includeHidden && isHidden(name)) ||
            (predicate && !predicate(p, new DummyDirent(name, type, path.dirname(p), p)))
        ) {
            return null;
        }

        if (typeFilter !== 'any' && type !== typeFilter && type !== 'dir') {
            return null;
        }

        const baseNode: TreeNode = {
            name,
            path: p,
            relative,
            type,
            ...(type === 'file' ? { size: s.size } : {}),
            mtimeMs: s.mtimeMs,
            ...(type === 'file' ? { ext: path.extname(name) } : {}),
        };

        if (type === 'dir' && depth < maxDepth) {
            const entries = await readDir(p);
            const children: TreeNode[] = [];
            for (const d of entries) {
                const childAbs = path.join(p, d.name);
                const child = await nodeFromPath(childAbs, base, depth + 1);
                if (child) children.push(child);
            }
            baseNode.children = children;
        }

        return baseNode;
    }

    // Kick off
    const rootNode = await nodeFromPath(absRoot, absRoot, 0);
    if (!rootNode) {
        // If root itself was filtered or errored, synthesize minimal node
        return {
            name: rootName,
            path: absRoot,
            relative: '',
            type: 'dir',
            children: [],
        };
    }
    return rootNode;
}

/**
 * Flatten a tree into a list (preorder). Handy for search, indexing, etc.
 */
export function flattenTree(root: TreeNode): TreeNode[] {
    const out: TreeNode[] = [];
    (function walk(n: TreeNode) {
        out.push(n);
        if (n.children) for (const c of n.children) walk(c);
    })(root);
    return out;
}

/**
 * Filter a tree in-place, keeping nodes for which `keep(node)` is true.
 * If a directory ends up with no kept descendants and itself fails keep(), it is removed.
 */
export function filterTree(node: TreeNode, keep: (n: TreeNode) => boolean): TreeNode | null {
    if (node.children) {
        node.children = node.children.map((c) => filterTree(c, keep)).filter((c): c is TreeNode => c !== null);
    }
    const hasChildren = !!(node.children && node.children.length);
    return keep(node) || (node.type === 'dir' && hasChildren) ? node : null;
}

/**
 * Utility: Make a compact tree (collapse directories that have a single directory child).
 * Useful for pretty “tree” UIs that avoid long linear chains like src/foo/bar/baz.
 */
export function collapseSingleChildDirs(node: TreeNode): TreeNode {
    if (!node.children || node.children.length !== 1) {
        if (node.children) {
            const children = node.children.map(collapseSingleChildDirs);
            return { ...node, children };
        }
        return node;
    }
    const only = node.children[0]!;
    if (node.type === 'dir' && only.type === 'dir') {
        const merged: TreeNode = {
            name: only.name, // keep basename contract
            relative: only.relative, // must match `path` relative to root
            path: only.path,
            type: only.type,
            ...(only.size !== undefined ? { size: only.size } : {}),
            ...(only.mtimeMs !== undefined ? { mtimeMs: only.mtimeMs } : {}),
            ...(only.ext ? { ext: only.ext } : {}),
            ...(only.children ? { children: only.children } : {}),
        };
        return collapseSingleChildDirs(merged);
    }
    const children = node.children.map(collapseSingleChildDirs);
    return { ...node, children };
}

/** Minimal Dirent-like shim for the predicate hook */
class DummyDirent implements Dirent {
    name: string;
    private _type: NodeType;
    constructor(name: string, type: NodeType, parentPath = '', path = '') {
        this.name = name;
        this._type = type;
        this.parentPath = parentPath;
        this.path = path;
    }
    parentPath: string;
    path: string;
    isBlockDevice(): boolean {
        return false;
    }
    isCharacterDevice(): boolean {
        return false;
    }
    isDirectory(): boolean {
        return this._type === 'dir';
    }
    isFIFO(): boolean {
        return false;
    }
    isFile(): boolean {
        return this._type === 'file';
    }
    isSocket(): boolean {
        return false;
    }
    isSymbolicLink(): boolean {
        return this._type === 'symlink';
    }
}
