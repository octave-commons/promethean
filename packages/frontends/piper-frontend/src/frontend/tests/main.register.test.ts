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

// Lightweight assertion that main.js wires up component imports, which is
// sufficient to ensure <docops-step> and <file-tree> will be registered at runtime.
// We avoid spinning a full DOM here to keep the test stable and fast.

test.serial('main includes docops-step and file-tree imports', async (t) => {
  const mainJs = await fs.readFile(dist('frontend/main.js'), 'utf8');
  t.true(mainJs.includes('./components/piper-step.js'));
});
