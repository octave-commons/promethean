// @ts-nocheck
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

function baseDir() {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    return path.join(__dirname, '../logs/indexer');
}

function safeName(s) {
    return String(s || '').replace(/[^a-zA-Z0-9._-]/g, '_');
}

export function stateDirForRoot(rootPath) {
    return path.join(baseDir(), safeName(rootPath || 'root'));
}

async function ensureDir(p) {
    await fs.mkdir(p, { recursive: true });
}

export async function loadBootstrapState(rootPath) {
    const dir = stateDirForRoot(rootPath);
    const p = path.join(dir, 'bootstrap.json');
    try {
        const raw = await fs.readFile(p, 'utf8');
        const state = JSON.parse(raw);
        if (state && state.rootPath === rootPath) return state;
    } catch {}
    return null;
}

export async function saveBootstrapState(rootPath, state) {
    const dir = stateDirForRoot(rootPath);
    await ensureDir(dir);
    const p = path.join(dir, 'bootstrap.json');
    const next = { ...state, rootPath };
    await fs.writeFile(p, JSON.stringify(next, null, 2), 'utf8');
}

export async function deleteBootstrapState(rootPath) {
    const dir = stateDirForRoot(rootPath);
    const p = path.join(dir, 'bootstrap.json');
    try {
        await fs.unlink(p);
    } catch {}
}
