import test from 'ava';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { readFileSlice, applyEdits } from '../../agents/shared.js';

const withTempFile = async (content: string, fn: (file: string) => Promise<void>) => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'pantheon-shared-'));
  const file = path.join(dir, 'sample.md');
  await fs.writeFile(file, content, 'utf8');
  try {
    await fn(file);
  } finally {
    // best-effort cleanup
    try { await fs.rm(dir, { recursive: true, force: true }); } catch {}
  }
};

test('readFileSlice returns surrounding context', async (t) => {
  const lines = Array.from({ length: 40 }, (_, i) => `line ${i + 1}`).join('\n');
  await withTempFile(lines, async (file) => {
    const { slice, start, end, total } = await readFileSlice(file, 20);
    t.true(slice.includes('line 20'));
    t.is(start, 14); // 6 lines of lookbehind
    t.is(end, 26);   // 6 lines of lookahead
    t.is(total, 40);
  });
});

test('applyEdits performs minimal line range replacement', async (t) => {
  const initial = ['# Title', '', 'Paragraph A', 'Paragraph B', ''].join('\n');
  await withTempFile(initial, async (file) => {
    const changed = await applyEdits([
      {
        path: file,
        startLine: 3, // replace line 3 only
        endLine: 3,
        replacement: 'Paragraph A (fixed)',
      },
    ]);
    t.is(changed, 1);
    const final = await fs.readFile(file, 'utf8');
    t.true(final.includes('Paragraph A (fixed)'));
    t.true(final.includes('Paragraph B'));
    t.true(final.startsWith('# Title'));
  });
});
