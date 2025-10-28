import { promises as fs } from 'node:fs';
import * as path from 'node:path';

import { listFiles, type FileEntry } from './util.js';

export type DirEntry = {
    name: string;
    relative: string;
    type: 'file' | 'dir';
};

function resolvePath(root: string, rel: string): string {
    const base = path.resolve(root);
    const target = path.resolve(base, rel);
    if (!target.startsWith(base)) {
        throw new Error('Access denied');
    }
    return target;
}

export async function listDir(root: string, rel = '.', opts: { includeHidden?: boolean } = {}): Promise<DirEntry[]> {
    const dirPath = resolvePath(root, rel);
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    return entries
        .filter((d) => opts.includeHidden || !d.name.startsWith('.'))
        .map((d) => ({
            name: d.name,
            relative: path.relative(root, path.join(dirPath, d.name)),
            type: d.isDirectory() ? 'dir' : 'file',
        }));
}

export async function readFile(root: string, rel: string, maxBytes = 65536): Promise<string> {
    const filePath = resolvePath(root, rel);
    const stat = await fs.stat(filePath);
    if (!stat.isFile()) throw new Error('Not a file');
    const data = await fs.readFile(filePath, 'utf8');
    return data.length > maxBytes ? data.slice(0, maxBytes) : data;
}

export async function searchFiles(root: string, query: string, limit = 20): Promise<FileEntry[]> {
    const q = query.toLowerCase();
    const entries = await listFiles(root, { includeHidden: false });
    return entries.filter((e) => e.relative.toLowerCase().includes(q)).slice(0, limit);
}
