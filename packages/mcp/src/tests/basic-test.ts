/* eslint-disable functional/no-let, functional/immutable-data, @typescript-eslint/require-await, @typescript-eslint/no-unused-vars */
import test from 'ava';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';


test('basic test works', (t) => {
  t.is(2 + 2, 4);
});

test('file operations work', async (t) => {
  const testDir = '/tmp/test-basic';
  await fs.mkdir(testDir, { recursive: true });
  await fs.writeFile(path.join(testDir, 'test.txt'), 'hello');
  const content = await fs.readFile(path.join(testDir, 'test.txt'), 'utf8');
  t.is(content, 'hello');
  await fs.rm(testDir, { recursive: true, force: true });
});