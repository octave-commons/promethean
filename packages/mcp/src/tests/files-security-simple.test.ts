/* eslint-disable functional/no-let, functional/immutable-data, @typescript-eslint/require-await, @typescript-eslint/no-unused-vars */
import test from 'ava';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { writeFileContent } from '../files.js';

const createTempSandbox = async () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  const sandbox = `/tmp/mcp-test-${timestamp}-${random}`;
  const outside = `/tmp/mcp-out-${timestamp}-${random}`;

  await fs.mkdir(sandbox, { recursive: true });
  await fs.mkdir(outside, { recursive: true });

  return { sandbox, outside };
};


  

const createSymlink = async (target: string, linkPath: string) => {
  await fs.symlink(target, linkPath);
};

const createFile = async (filePath: string, content: string = 'test content') => {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content);
};

test('writeFileContent: normal file operations work', async (t) => {
  const { sandbox } = await createTempSandbox();
  const filePath = 'test.txt';
  const content = 'Hello, World!';

  const result = await writeFileContent(sandbox, filePath, content);

  t.is(result.path, filePath);

  const writtenContent = await fs.readFile(path.join(sandbox, filePath), 'utf8');
  t.is(writtenContent, content);
});

test('writeFileContent: prevents symlink escape via direct symlink', async (t) => {
  const { sandbox, outside } = await createTempSandbox();

  // Create a file outside the sandbox
  const outsideFile = path.join(outside, 'secret.txt');
  await createFile(outsideFile, 'secret content');

  // Create a symlink inside the sandbox pointing outside
  const maliciousSymlink = path.join(sandbox, 'escape.txt');
  await createSymlink(outsideFile, maliciousSymlink);

  // Attempt to write through the symlink should fail
  const error = await t.throwsAsync(
    writeFileContent(sandbox, 'escape.txt', 'malicious content')
  );
  t.true(error.message.includes('symlink escape detected'));

  // Verify the outside file wasn't modified
  const originalContent = await fs.readFile(outsideFile, 'utf8');
  t.is(originalContent, 'secret content');
});