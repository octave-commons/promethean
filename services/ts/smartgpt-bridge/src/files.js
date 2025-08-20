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

export async function resolvePath(ROOT_PATH, p) {
    if (!p) return null;
    const abs = path.isAbsolute(p) ? p : path.join(ROOT_PATH, p);
    try {
        const st = await fs.stat(abs);
        if (st.isFile()) return abs;
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
    return path.join(ROOT_PATH, best);
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
    const raw = await fs.readFile(abs, 'utf8');
    const lines = raw.split(/\r?\n/);
    const L = Math.max(1, Math.min(lines.length, Number(line) || 1));
    const ctx = Math.max(0, Number(context) || 0);
    const start = Math.max(1, L - ctx);
    const end = Math.min(lines.length, L + ctx);
    return {
        path: path.relative(ROOT_PATH, abs),
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
