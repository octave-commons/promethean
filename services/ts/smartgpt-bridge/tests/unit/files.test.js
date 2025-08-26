import test from 'ava';
import path from 'node:path';
import { viewFile, resolvePath } from '../../src/files.ts';

const ROOT = path.join(process.cwd(), 'tests', 'fixtures');

test('viewFile: returns correct window around line', async (t) => {
    const out = await viewFile(ROOT, 'readme.md', 3, 2);
    t.is(out.path, 'readme.md');
    t.is(out.focusLine, 3);
    t.is(out.startLine, 1);
    t.true(out.endLine >= 3);
    t.true(out.snippet.includes('tiny readme'));
});

test('resolvePath: fuzzy by basename', async (t) => {
    const p = await resolvePath(ROOT, 'hello.ts');
    t.true(p.endsWith(path.join('tests', 'fixtures', 'hello.ts')));
});
