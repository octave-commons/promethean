import test from 'ava';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { findInvalidFragments } from '../scripts/check-changelog-fragments.mjs';

const makeTempDir = () => mkdtempSync(path.join(tmpdir(), 'frag-'));

test('findInvalidFragments returns empty list when all names valid', (t) => {
  const dir = makeTempDir();
  writeFileSync(path.join(dir, '2023.added.md'), '');
  writeFileSync(path.join(dir, '2024.fixed.md'), '');
  writeFileSync(path.join(dir, '2025.09.03.02.14.07.changed.md'), '');
  t.deepEqual(findInvalidFragments(dir), []);
  rmSync(dir, { recursive: true, force: true });
});

test('findInvalidFragments detects invalid names', (t) => {
  const dir = makeTempDir();
  writeFileSync(path.join(dir, 'invalid.md'), '');
  writeFileSync(path.join(dir, '2023.added.md'), '');
  t.deepEqual(findInvalidFragments(dir), ['invalid.md']);
  rmSync(dir, { recursive: true, force: true });
});
