import fs from 'fs/promises';
import path from 'path';
import fg from 'fast-glob';
import { normalizeToRoot, isInsideRoot } from './files.js';

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

export async function grep(ROOT_PATH, opts) {
    const {
        pattern,
        flags = 'g',
        paths = ['**/*.{ts,tsx,js,jsx,py,go,rs,md,txt,json,yml,yaml,sh}'],
        exclude = defaultExcludes(),
        maxMatches = 200,
        context = 2,
    } = opts || {};
    if (!pattern || typeof pattern !== 'string') throw new Error("Missing regex 'pattern'");
    let rx;
    try {
        rx = new RegExp(pattern, flags);
    } catch (e) {
        throw new Error('Invalid regex: ' + e.message);
    }
    const files = await fg(paths, {
        cwd: ROOT_PATH,
        ignore: exclude,
        onlyFiles: true,
        dot: false,
        absolute: true,
    });
    const out = [];
    for (const abs of files) {
        if (!isInsideRoot(ROOT_PATH, abs)) continue;
        if (out.length >= maxMatches) break;
        let text = '';
        try {
            const safeAbs = normalizeToRoot(ROOT_PATH, abs);
            text = await fs.readFile(safeAbs, 'utf8');
        } catch {
            continue;
        }
        const rel = path.relative(ROOT_PATH, abs);
        const lines = text.split(/\r?\n/);
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (rx.test(line)) {
                const start = Math.max(0, i - context);
                const end = Math.min(lines.length, i + context + 1);
                out.push({
                    path: rel,
                    line: i + 1,
                    column: line.search(rx) + 1 || 1,
                    lineText: line,
                    snippet: lines.slice(start, end).join('\n'),
                    startLine: start + 1,
                    endLine: end,
                });
                if (out.length >= maxMatches) break;
            }
            rx.lastIndex = 0;
        }
    }
    return out;
}
