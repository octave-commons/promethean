import { Dirent, promises as fs } from 'fs';
import * as path from 'path';

export type FileEntry = {
    path: string; // full path
    relative: string; // path relative to the root
    name: string; // base filename
    type: 'file' | 'dir' | 'symlink';
};

export type WalkOptions = {
    includeHidden?: boolean; // include dotfiles
    maxDepth?: number; // how deep to recurse
    typeFilter?: 'file' | 'dir'; // restrict results
};

/**
 * Walk a directory tree and collect entries.
 */
export async function walkDir(root: string, opts: WalkOptions = {}, depth = 0, base = root): Promise<FileEntry[]> {
    const { includeHidden = false, maxDepth = Infinity, typeFilter } = opts;

    if (depth > maxDepth) return [];

    let entries: FileEntry[] = [];
    let dirents: Dirent[];

    try {
        dirents = await fs.readdir(root, { withFileTypes: true });
    } catch (err) {
        console.error(`walkDir error: ${err}`);
        return [];
    }

    for (const dirent of dirents) {
        if (!includeHidden && dirent.name.startsWith('.')) continue;

        const fullPath = path.join(root, dirent.name);
        const relative = path.relative(base, fullPath);
        const entry: FileEntry = {
            path: fullPath,
            relative,
            name: dirent.name,
            type: dirent.isDirectory() ? 'dir' : 'file',
        };

        if (!typeFilter || typeFilter === entry.type) {
            entries.push(entry);
        }

        if (dirent.isDirectory()) {
            const children = await walkDir(fullPath, opts, depth + 1, base);
            entries = entries.concat(children);
        }
    }

    return entries;
}

/**
 * List files only.
 */
export async function listFiles(root: string, opts: Omit<WalkOptions, 'typeFilter'> = {}) {
    return walkDir(root, { ...opts, typeFilter: 'file' });
}

/**
 * List directories only.
 */
export async function listDirs(root: string, opts: Omit<WalkOptions, 'typeFilter'> = {}) {
    return walkDir(root, { ...opts, typeFilter: 'dir' });
}
