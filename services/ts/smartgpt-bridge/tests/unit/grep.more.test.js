import test from 'ava';
import path from 'node:path';
import { grep } from '../../src/grep.ts';

const ROOT = path.join(process.cwd(), 'tests', 'fixtures');

test('grep: maxMatches limits results', async (t) => {
    const results = await grep(ROOT, {
        pattern: '.',
        flags: 'g',
        paths: ['**/*.md', '**/*.ts'],
        maxMatches: 1,
        context: 0,
    });
    t.is(results.length, 1);
});
