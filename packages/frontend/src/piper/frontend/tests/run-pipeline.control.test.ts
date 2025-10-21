import * as path from 'path';
import { promises as fs } from 'fs';

import test from 'ava';

function dist(p: string) {
  return path.join(
    path.resolve(
      path.dirname(new URL(import.meta.url).pathname),
      '..',
      '..',
      '..',
      '..',
      'packages',
      'piper',
      'dist',
    ),
    p,
  );
}

test.serial('main includes Run Pipeline control', async (t) => {
  const mainJs = await fs.readFile(dist('frontend/main.js'), 'utf8');
  t.true(mainJs.includes('Run Pipeline'));
  t.true(mainJs.includes('/api/run?'));
});
