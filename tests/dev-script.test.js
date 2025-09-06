import test from 'ava';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { findRunnablePackages, buildDevArgs } from '../scripts/dev.mjs';

test('findRunnablePackages returns packages with dev script', async (t) => {
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'devpkg-'));
  const pkgsDir = path.join(tmp, 'packages');
  await fs.mkdir(path.join(pkgsDir, 'a'), { recursive: true });
  await fs.writeFile(
    path.join(pkgsDir, 'a', 'package.json'),
    JSON.stringify({ name: 'a', scripts: { dev: 'node index.js' } }),
    'utf8'
  );
  await fs.mkdir(path.join(pkgsDir, 'b'), { recursive: true });
  await fs.writeFile(
    path.join(pkgsDir, 'b', 'package.json'),
    JSON.stringify({ name: 'b', scripts: { test: 'echo test' } }),
    'utf8'
  );

  const pkgs = await findRunnablePackages(tmp);
  t.deepEqual(pkgs, ['a']);
});

test('buildDevArgs runs packages in parallel from workspace root', (t) => {
  const args = buildDevArgs(['a', 'b']);
  t.deepEqual(args, [
    'run',
    '-r',
    '--parallel',
    '--workspace-root',
    '--filter',
    'a',
    '--filter',
    'b',
    'dev',
  ]);
});
