import { Dirent, promises as fs } from 'fs';
import * as path from 'path';

export type FileEntry = {
    readonly path: string; // full path
    readonly relative: string; // path relative to the root
    readonly name: string; // base filename
    readonly type: 'file' | 'dir' | 'symlink';
};

export type WalkOptions = {
    readonly includeHidden?: boolean; // include dotfiles
    readonly maxDepth?: number; // how deep to recurse
    readonly typeFilter?: 'file' | 'dir'; // restrict results
};

type NormalizedWalkOptions = {
    readonly includeHidden: boolean;
    readonly maxDepth: number;
    readonly typeFilter?: 'file' | 'dir';
};

type WalkParams = {
    readonly root: string;
    readonly base: string;
    readonly depth: number;
    readonly opts: NormalizedWalkOptions;
};

type CollectParams = WalkParams & { readonly dirent: Dirent };

const hidden = (name: string) => name.startsWith('.');

const normalizeWalkOptions = (opts: WalkOptions = {}): NormalizedWalkOptions => ({
    includeHidden: opts.includeHidden ?? false,
    maxDepth: opts.maxDepth ?? Infinity,
    typeFilter: opts.typeFilter,
});

const readDirSafe = async (dir: string): Promise<Dirent[]> =>
    fs.readdir(dir, { withFileTypes: true }).catch((error: unknown) => {
        console.error(`walkDir error: ${error}`);
        return [];
    });

const entryType = (dirent: Dirent): FileEntry['type'] => {
    if (dirent.isDirectory()) return 'dir';
    if (dirent.isSymbolicLink()) return 'symlink';
    return 'file';
};

const toEntry = ({ dirent, root, base }: CollectParams): FileEntry => {
    const fullPath = path.join(root, dirent.name);
    return {
        path: fullPath,
        relative: path.relative(base, fullPath),
        name: dirent.name,
        type: entryType(dirent),
    };
};

const shouldInclude = ({ dirent, opts }: CollectParams) => opts.includeHidden || !hidden(dirent.name);

const collectEntriesForDirent = async (params: CollectParams): Promise<FileEntry[]> => {
    if (!shouldInclude(params)) return [];
    const entry = toEntry(params);
    const includeSelf = !params.opts.typeFilter || params.opts.typeFilter === entry.type;
    const childEntries =
        entry.type === 'dir' && params.depth < params.opts.maxDepth
            ? await walkDirInternal({
                  root: path.join(params.root, params.dirent.name),
                  base: params.base,
                  depth: params.depth + 1,
                  opts: params.opts,
              })
            : [];
    return includeSelf ? [entry, ...childEntries] : childEntries;
};

const walkDirInternal = async ({ root, base, depth, opts }: WalkParams): Promise<FileEntry[]> => {
    if (depth > opts.maxDepth) return [];
    const dirents = await readDirSafe(root);
    const entryLists = await Promise.all(
        dirents.map((dirent) =>
            collectEntriesForDirent({
                dirent,
                root,
                base,
                depth,
                opts,
            }),
        ),
    );
    return entryLists.flat();
};

/**
 * Walk a directory tree and collect entries.
 */
export async function walkDir(root: string, opts: WalkOptions = {}): Promise<FileEntry[]> {
    const normalized = normalizeWalkOptions(opts);
    const absRoot = path.resolve(root);
    return walkDirInternal({ root: absRoot, base: absRoot, depth: 0, opts: normalized });
}

/**
 * List files only.
 */
export async function listFiles(root: string, opts: Omit<WalkOptions, 'typeFilter'> = {}): Promise<FileEntry[]> {
    return walkDir(root, { ...opts, typeFilter: 'file' });
}

/**
 * List directories only.
 */
export async function listDirs(root: string, opts: Omit<WalkOptions, 'typeFilter'> = {}): Promise<FileEntry[]> {
    return walkDir(root, { ...opts, typeFilter: 'dir' });
}
