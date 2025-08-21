import test from 'ava';
import path from 'path';
import { grep } from '../../src/grep.js';

const ROOT = path.join(process.cwd(), 'tests', 'fixtures');

test('grep: finds heading with context and flags', async (t) => {
    const results = await grep(ROOT, {
        pattern: 'heading',
        flags: 'i',
        paths: ['**/*.md'],
        context: 1,
    });
    t.true(results.length >= 1);
    const first = results[0];
    t.is(first.path, 'readme.md');
    t.truthy(first.snippet.includes('## Heading'));
    t.truthy(first.startLine <= first.line && first.endLine >= first.line);
});

test('grep: invalid regex throws 400-level error', async (t) => {
    await t.throwsAsync(() => grep(ROOT, { pattern: '(*invalid', paths: ['**/*.md'] }));
});
