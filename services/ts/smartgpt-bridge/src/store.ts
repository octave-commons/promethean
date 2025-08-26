// @ts-nocheck
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

function baseDir() {
    const envDir = process.env.AGENT_STATE_DIR;
    if (envDir && envDir.trim()) return envDir;
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    return path.join(__dirname, '../logs/agents');
}

async function ensureDir(p) {
    await fs.mkdir(p, { recursive: true });
}

function agentDir(id) {
    return path.join(baseDir(), id);
}

export async function initAgentMeta(meta) {
    const dir = agentDir(meta.id);
    await ensureDir(dir);
    await fs.writeFile(path.join(dir, 'meta.json'), JSON.stringify(meta, null, 2), 'utf8');
}

export async function updateAgentMeta(id, patch) {
    const dir = agentDir(id);
    await ensureDir(dir);
    let cur = {};
    try {
        const raw = await fs.readFile(path.join(dir, 'meta.json'), 'utf8');
        cur = JSON.parse(raw);
    } catch {}
    const next = { ...cur, ...patch };
    await fs.writeFile(path.join(dir, 'meta.json'), JSON.stringify(next, null, 2), 'utf8');
}

export async function appendAgentLog(id, chunk) {
    const dir = agentDir(id);
    await ensureDir(dir);
    const logPath = path.join(dir, 'output.log');
    await fs.appendFile(logPath, Buffer.isBuffer(chunk) ? chunk : String(chunk));
}

export async function readAgentLogTail(id, bytes = 8192) {
    const dir = agentDir(id);
    const logPath = path.join(dir, 'output.log');
    try {
        const data = await fs.readFile(logPath);
        const start = Math.max(0, data.length - bytes);
        return data.subarray(start).toString('utf8');
    } catch {
        return '';
    }
}

export async function listAgentMetas() {
    const dir = baseDir();
    try {
        const names = await fs.readdir(dir, { withFileTypes: true });
        const out = [];
        for (const d of names) {
            if (!d.isDirectory()) continue;
            try {
                const raw = await fs.readFile(path.join(dir, d.name, 'meta.json'), 'utf8');
                const meta = JSON.parse(raw);
                if (meta && meta.id) out.push(meta);
            } catch {}
        }
        return out;
    } catch {
        return [];
    }
}
