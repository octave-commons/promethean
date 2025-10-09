import test from 'ava';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { checkDuplicateFragments, changelogModified } from '../scripts/check-changelog.mjs';

const makeTempDir = () => mkdtempSync(path.join(tmpdir(), 'changelog-'));

test('checkDuplicateFragments returns true when fragments are unique', (t) => {
  const dir = makeTempDir();
  writeFileSync(path.join(dir, '2023.added.md'), '');
  writeFileSync(path.join(dir, '2024.changed.md'), '');
  t.true(checkDuplicateFragments(dir));
  rmSync(dir, { recursive: true, force: true });
});

test('checkDuplicateFragments returns false when duplicates exist', (t) => {
  const dir = makeTempDir();
  writeFileSync(path.join(dir, '2023.added.md'), '');
  writeFileSync(path.join(dir, '2023.changed.md'), '');
  t.false(checkDuplicateFragments(dir));
  rmSync(dir, { recursive: true, force: true });
});

test('checkDuplicateFragments tolerates different dotted timestamps', (t) => {
  const dir = makeTempDir();
  writeFileSync(path.join(dir, '2025.09.03.02.14.07.changed.md'), '');
  writeFileSync(path.join(dir, '2025.09.03.02.15.00.added.md'), '');
  t.true(checkDuplicateFragments(dir));
  rmSync(dir, { recursive: true, force: true });
});

test('checkDuplicateFragments flags same dotted timestamp across types', (t) => {
  const dir = makeTempDir();
  writeFileSync(path.join(dir, '2025.09.03.02.14.07.changed.md'), '');
  writeFileSync(path.join(dir, '2025.09.03.02.14.07.fixed.md'), '');
  t.false(checkDuplicateFragments(dir));
  rmSync(dir, { recursive: true, force: true });
});

test('changelogModified detects staged changelog', (t) => {
  const runner = () => ({ stdout: 'CHANGELOG.md\n' });
  t.true(changelogModified('CHANGELOG.md', runner));
});

test('changelogModified returns false when changelog not staged', (t) => {
  const runner = () => ({ stdout: '' });
  t.false(changelogModified('CHANGELOG.md', runner));
});
