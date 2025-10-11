import fs from 'node:fs/promises';
import path from 'node:path';
import { globby } from 'globby';
import { parseFrontmatter, stringifyFrontmatter, normalizeStringList } from '@promethean/markdown/frontmatter';

export type Ctx = {
    repoRoot: string;
    parseFrontmatter: typeof parseFrontmatter;
    stringifyFrontmatter: typeof stringifyFrontmatter;
    normalizeStringList: typeof normalizeStringList;
};

export type Migration = { id: number; name: string; up: (ctx: Ctx) => Promise<void> };

const STATE_FILE = path.join(process.cwd(), '.promethean/migrations.json');

async function readState(): Promise<{ applied: number[] }> {
    try {
        const txt = await fs.readFile(STATE_FILE, 'utf8');
        return JSON.parse(txt);
    } catch {
        return { applied: [] };
    }
}

async function writeState(applied: number[]) {
    await fs.mkdir(path.dirname(STATE_FILE), { recursive: true });
    await fs.writeFile(STATE_FILE, JSON.stringify({ applied }, null, 2), 'utf8');
}

async function loadMigrations(): Promise<Migration[]> {
    const files = await globby('packages/migrations/src/migrations/*.ts', { absolute: true });
    const mods: any[] = [];
    for (const f of files) {
        const url = pathToFileUrl(f);
        const mod = await import(url);
        mods.push(mod);
    }
    const migs: Migration[] = mods.map((m: any) => ({ id: m.id, name: m.name, up: m.up }));
    migs.sort((a, b) => a.id - b.id);
    return migs;
}

function pathToFileUrl(p: string) {
    const u = new URL('file://');
    u.pathname = path.resolve(p);
    return u.href;
}

async function cmdList() {
    const state = await readState();
    const migs = await loadMigrations();
    const lines: string[] = [];
    for (const m of migs) {
        const flag = state.applied.includes(m.id) ? '[x]' : '[ ]';
        lines.push(flag + '  ' + String(m.id).padStart(3, '0') + '  ' + m.name);
    }
    console.log(lines.join('\n'));
}

async function cmdUp() {
    const state = await readState();
    const migs = await loadMigrations();
    const ctx: Ctx = { repoRoot: process.cwd(), parseFrontmatter, stringifyFrontmatter, normalizeStringList };
    const pending = migs.filter((m) => !state.applied.includes(m.id));
    for (const m of pending) {
        console.log('running migration ' + m.id + ' ' + m.name);
        await m.up(ctx);
        state.applied.push(m.id);
        await writeState(state.applied);
        console.log('applied ' + m.id + ' ' + m.name);
    }
    if (pending.length === 0) console.log('No pending migrations.');
}

async function main() {
    const cmd = process.argv[2] ?? 'list';
    if (cmd === 'list') return cmdList();
    if (cmd === 'up') return cmdUp();
    console.error('Unknown command: ' + cmd);
    process.exit(1);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
