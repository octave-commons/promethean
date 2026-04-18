/* eslint-disable functional/no-let, functional/immutable-data, @typescript-eslint/require-await, @typescript-eslint/no-unused-vars */
import test from 'ava';
import * as fs from 'node:fs/promises';

import { writeFileContent } from '../files.js';

test('debug writeFileContent', async (t) => {
  const sandbox = '/tmp/debug-test';
  await fs.mkdir(sandbox, { recursive: true });

  try {
    await writeFileContent(sandbox, 'test.txt', 'hello');
    t.pass();
  } catch (error) {
    console.log('Error:', error);
    t.fail();
  } finally {
    await fs.rm(sandbox, { recursive: true, force: true });
  }
});