import test from 'ava';
import path from 'path';
import fs from 'fs/promises';
import { execa } from 'execa';
import { grep } from '../../src/grep.js';

const ROOT = path.join(process.cwd(), 'tests', 'fixtures');

async function runRg(pattern, opts) {
    const {
        flags = 'g',
        paths = ['**/*.md'],
        exclude = [],
        maxMatches = 200,
        context = 1,
    } = opts || {};
    const args = ['--json', '--max-count', String(maxMatches), '-C', String(context)];
    if (flags.includes('i')) args.push('-i');
    exclude.forEach((ex) => args.push('--glob', `!${ex}`));
    const searchPaths = [];
    for (const p of paths) {
        if (/[?*{}\[\]]/.test(p)) {
            args.push('--glob', p);
        } else {
            searchPaths.push(p);
        }
    }
    args.push(pattern);
    if (searchPaths.length) {
        args.push(...searchPaths);
    } else {
        args.push('.');
    }
    const { stdout } = await execa('rg', args, { cwd: ROOT });
    const lines = stdout.split(/\r?\n/).filter(Boolean);
    const out = [];
    const cache = new Map();
    for (const line of lines) {
        const obj = JSON.parse(line);
        if (obj.type !== 'match') continue;
        const relPath = obj.data.path.text.startsWith('./')
            ? obj.data.path.text.slice(2)
            : obj.data.path.text;
        let fileLines = cache.get(relPath);
        if (!fileLines) {
            const text = await fs.readFile(path.join(ROOT, relPath), 'utf8');
            fileLines = text.split(/\r?\n/);
            cache.set(relPath, fileLines);
        }
        const lineNumber = obj.data.line_number;
        const lineText = obj.data.lines.text.replace(/\n$/, '');
        const column = (obj.data.submatches?.[0]?.start ?? 0) + 1;
        const start = Math.max(0, lineNumber - 1 - context);
        const end = Math.min(fileLines.length, lineNumber - 1 + context + 1);
        const snippet = fileLines.slice(start, end).join('\n');
        out.push({
            path: relPath,
            line: lineNumber,
            column,
            lineText,
            snippet,
            startLine: start + 1,
            endLine: end,
        });
        if (out.length >= maxMatches) break;
    }
    return out;
}

test('grep: matches ripgrep output with context and flags', async (t) => {
    const opts = { pattern: 'heading', flags: 'i', paths: ['**/*.md'], context: 1 };
    const [results, expected] = await Promise.all([grep(ROOT, opts), runRg(opts.pattern, opts)]);
    t.deepEqual(results, expected);
    t.snapshot(results);
});

test('grep: invalid regex throws error', async (t) => {
    await t.throwsAsync(() => grep(ROOT, { pattern: '(*invalid', paths: ['**/*.md'] }));
});
