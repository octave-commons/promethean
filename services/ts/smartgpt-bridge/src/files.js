import fs from 'fs/promises';
import path from 'path';
import fg from 'fast-glob';

function splitCSV(s) {
    return (s || '')
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean);
}
function defaultExcludes() {
    const env = splitCSV(process.env.EXCLUDE_GLOBS);
    return env.length ? env : ['node_modules/**', '.git/**', 'dist/**', 'build/**', '.obsidian/**'];
}

export function isInsideRoot(ROOT_PATH, abs) {
    const root = path.resolve(ROOT_PATH);
    const target = path.resolve(abs);
    return target === root || target.startsWith(root + path.sep);
}

export function normalizeToRoot(ROOT_PATH, p = '.') {
    const abs = path.resolve(path.isAbsolute(p) ? p : path.join(ROOT_PATH, p));
    if (!isInsideRoot(ROOT_PATH, abs)) throw new Error('path outside root');
    return abs;
}

export async function resolvePath(ROOT_PATH, p) {
    if (!p) return null;
    let abs;
    try {
        abs = normalizeToRoot(ROOT_PATH, p);
    } catch {
        abs = null;
    }
    try {
        if (abs) {
            const st = await fs.stat(abs);
            if (st.isFile()) return abs;
        }
    } catch {}
    // fuzzy by basename
    const base = path.basename(p);
    const matches = await fg([`**/${base}`], {
        cwd: ROOT_PATH,
        ignore: defaultExcludes(),
        onlyFiles: true,
        dot: false,
    });
    if (!matches.length) return null;
    // pick best by suffix overlap with incoming path
    let best = matches[0],
        bestScore = 0;
    for (const m of matches) {
        const score = suffixScore(p, m);
        if (score > bestScore) {
            best = m;
            bestScore = score;
        }
    }
    return normalizeToRoot(ROOT_PATH, best);
}

function suffixScore(a, b) {
    const aa = a.split(/[\/]+/).reverse();
    const bb = b.split(/[\/]+/).reverse();
    let i = 0;
    while (i < aa.length && i < bb.length && aa[i] === bb[i]) i++;
    return i;
}

export async function viewFile(ROOT_PATH, relOrFuzzy, line = 1, context = 25) {
    const abs = await resolvePath(ROOT_PATH, relOrFuzzy);
    if (!abs) throw new Error('file not found');
    const safeAbs = normalizeToRoot(ROOT_PATH, abs);
    const raw = await fs.readFile(safeAbs, 'utf8');
    const lines = raw.split(/\r?\n/);
    const L = Math.max(1, Math.min(lines.length, Number(line) || 1));
    const ctx = Math.max(0, Number(context) || 0);
    const start = Math.max(1, L - ctx);
    const end = Math.min(lines.length, L + ctx);
    return {
        path: path.relative(ROOT_PATH, safeAbs),
        totalLines: lines.length,
        startLine: start,
        endLine: end,
        focusLine: L,
        snippet: lines.slice(start - 1, end).join('\n'),
    };
}

const RX = {
    nodeA: /\(?(?<file>[^():\n]+?):(?<line>\d+):(?<col>\d+)\)?/g,
    nodeB: /at\s+.*?\((?<file>[^()]+?):(?<line>\d+):(?<col>\d+)\)/g,
    py: /File\s+"(?<file>[^"]+)",\s+line\s+(?<line>\d+)/g,
    go: /(?<file>[^\s:]+?):(?<line>\d+)/g,
};

export async function locateStacktrace(ROOT_PATH, text, context = 25) {
    const results = [];
    for (const key of Object.keys(RX)) {
        const re = RX[key];
        re.lastIndex = 0;
        let m;
        while ((m = re.exec(text))) {
            const file = m.groups?.file;
            const line = Number(m.groups?.line || 1);
            const col = m.groups?.col ? Number(m.groups.col) : undefined;
            if (!file) continue;
            const snippet = await safeView(ROOT_PATH, file, line, context);
            if (snippet) {
                results.push({
                    path: snippet.path,
                    line,
                    column: col,
                    resolved: true,
                    relPath: snippet.path,
                    startLine: snippet.startLine,
                    endLine: snippet.endLine,
                    focusLine: snippet.focusLine,
                    snippet: snippet.snippet,
                });
            } else {
                results.push({ path: file, line, column: col, resolved: false });
            }
        }
    }
    return results;
}

async function safeView(ROOT_PATH, file, line, context) {
    try {
        return await viewFile(ROOT_PATH, file, line, context);
    } catch {
        return null;
    }
}

export async function listDirectory(ROOT_PATH, rel = '.', options = {}) {
    const includeHidden = Boolean(options.includeHidden);
    const type = options.type; // 'file' | 'dir' | undefined
    const abs = normalizeToRoot(ROOT_PATH, rel || '.');
    const st = await fs.stat(abs).catch(() => null);
    if (!st || !st.isDirectory()) throw new Error('not a directory');
    const dirents = await fs.readdir(abs, { withFileTypes: true });
    const out = [];
    for (const d of dirents) {
        if (!includeHidden && d.name.startsWith('.')) continue;
        const isDir = d.isDirectory();
        const isFile = d.isFile();
        if (type === 'dir' && !isDir) continue;
        if (type === 'file' && !isFile) continue;
        const childAbs = path.join(abs, d.name);
        let size = null;
        let mtimeMs = null;
        try {
            const s = await fs.stat(childAbs);
            size = isFile ? s.size : null;
            mtimeMs = s.mtimeMs;
        } catch {}
        out.push({
            name: d.name,
            path: path.relative(ROOT_PATH, childAbs),
            type: isDir ? 'dir' : isFile ? 'file' : 'other',
            size,
            mtimeMs,
        });
    }
    // Sort: directories first, then alphabetical
    out.sort((a, b) => {
        if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
        return a.name.localeCompare(b.name);
    });
    return { ok: true, base: path.relative(ROOT_PATH, abs) || '.', entries: out };
}

export async function treeDirectory(ROOT_PATH, rel = '.', options = {}) {
    const includeHidden = Boolean(options.includeHidden);
    const depth = Number(options.depth || 1);
    const abs = normalizeToRoot(ROOT_PATH, rel || '.');
    const st = await fs.stat(abs).catch(() => null);
    if (!st || !st.isDirectory()) throw new Error('not a directory');

    async function walk(dir, remaining) {
        const dirents = await fs.readdir(dir, { withFileTypes: true });
        const children = [];
        for (const d of dirents) {
            if (!includeHidden && d.name.startsWith('.')) continue;
            const childAbs = path.join(dir, d.name);
            const relPath = path.relative(ROOT_PATH, childAbs);
            if (d.isDirectory()) {
                const child = {
                    name: d.name,
                    path: relPath,
                    type: 'dir',
                };
                if (remaining > 0) {
                    child.children = await walk(childAbs, remaining - 1);
                }
                children.push(child);
            } else if (d.isFile()) {
                let size = null;
                let mtimeMs = null;
                try {
                    const s = await fs.stat(childAbs);
                    size = s.size;
                    mtimeMs = s.mtimeMs;
                } catch {}
                children.push({
                    name: d.name,
                    path: relPath,
                    type: 'file',
                    size,
                    mtimeMs,
                });
            }
        }
        children.sort((a, b) => {
            if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
            return a.name.localeCompare(b.name);
        });
        return children;
    }

    const tree = {
        name: path.basename(abs) || '.',
        path: path.relative(ROOT_PATH, abs) || '.',
        type: 'dir',
        children: await walk(abs, depth - 1),
    };
    return { ok: true, base: tree.path, tree };
}
