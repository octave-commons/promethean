import * as path from 'path';
import { promises as fs } from 'fs';

import test from 'ava';

function dist(pathFromPkg: string) {
  // Reference the piper package's dist directory where frontend components are built
  const PKG = path.resolve(
    path.dirname(new URL(import.meta.url).pathname),
    '..',
    '..',
    '..',
    '..',
    'packages',
    'piper',
    'dist',
  );
  return path.join(PKG, pathFromPkg);
}

test.serial('piper-step module defines element and contains Run button markup', async (t) => {
  const js = await fs.readFile(dist('frontend/components/piper-step.js'), 'utf8');
  t.true(js.includes('registerHotElement("piper-step"'));
  t.true(js.includes('<button id="runBtn">Run</button>'));
});
