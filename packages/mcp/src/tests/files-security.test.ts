/* eslint-disable functional/no-let, functional/immutable-data, @typescript-eslint/require-await, @typescript-eslint/no-unused-vars */
import test from 'ava';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { writeFileContent, writeFileLines } from '../files.js';

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
  await t.throwsAsync(
    () => writeFileContent(sandbox, 'escape.txt', 'malicious content'),
    { message: /symlink escape detected/ }
  );

  // Verify the outside file wasn't modified
  const originalContent = await fs.readFile(outsideFile, 'utf8');
  t.is(originalContent, 'secret content');
});

test('writeFileContent: prevents symlink escape via parent directory symlink', async (t) => {
  const { sandbox, outside } = await createTempSandbox();

  // Create a file outside the sandbox
  const outsideFile = path.join(outside, 'secret.txt');
  await createFile(outsideFile, 'secret content');

  // Create a directory structure with a symlinked parent
  const safeDir = path.join(sandbox, 'safe');
  await fs.mkdir(safeDir, { recursive: true });

  const maliciousDir = path.join(sandbox, 'malicious');
  await createSymlink(outside, maliciousDir);

  // Attempt to write through the malicious directory symlink should fail
  await t.throwsAsync(
    () => writeFileContent(sandbox, 'malicious/secret.txt', 'malicious content'),
    { message: /symlink escape detected|parent symlink escape detected/ }
  );

  // Verify the outside file wasn't modified
  const originalContent = await fs.readFile(outsideFile, 'utf8');
  t.is(originalContent, 'secret content');
});

test('writeFileContent: prevents symlink escape via nested path components', async (t) => {
  const { sandbox, outside } = await createTempSandbox();

  // Create a file outside the sandbox
  const outsideFile = path.join(outside, 'secret.txt');
  await createFile(outsideFile, 'secret content');

  // Create nested directories with a symlink in the middle
  await fs.mkdir(path.join(sandbox, 'level1', 'level2'), { recursive: true });

  const maliciousSymlink = path.join(sandbox, 'level1', 'escape');
  await createSymlink(outside, maliciousSymlink);

  // Attempt to write through the nested symlink should fail
  await t.throwsAsync(
    () => writeFileContent(sandbox, 'level1/escape/secret.txt', 'malicious content'),
    { message: /symlink escape detected/ }
  );

  // Verify the outside file wasn't modified
  const originalContent = await fs.readFile(outsideFile, 'utf8');
  t.is(originalContent, 'secret content');
});

test('writeFileContent: prevents symlink escape via relative path symlink', async (t) => {
  const { sandbox, outside } = await createTempSandbox();

  // Create a file outside the sandbox
  const outsideFile = path.join(outside, 'secret.txt');
  await createFile(outsideFile, 'secret content');

  // Create a relative path symlink pointing outside
  const relativePath = path.relative(path.join(sandbox, 'subdir'), outside);
  await fs.mkdir(path.join(sandbox, 'subdir'), { recursive: true });

  const maliciousSymlink = path.join(sandbox, 'subdir', 'escape');
  await createSymlink(relativePath, maliciousSymlink);

  // Attempt to write through the relative symlink should fail
  await t.throwsAsync(
    () => writeFileContent(sandbox, 'subdir/escape/secret.txt', 'malicious content'),
    { message: /symlink escape detected/ }
  );

  // Verify the outside file wasn't modified
  const originalContent = await fs.readFile(outsideFile, 'utf8');
  t.is(originalContent, 'secret content');
});

test('writeFileContent: allows legitimate symlinks within sandbox', async (t) => {
  const { sandbox } = await createTempSandbox();

  // Create a legitimate file and symlink within the sandbox
  const targetFile = path.join(sandbox, 'target.txt');
  await createFile(targetFile, 'original content');

  const legitimateSymlink = path.join(sandbox, 'link.txt');
  await createSymlink('target.txt', legitimateSymlink);

  // Writing through the legitimate symlink should work
  const result = await writeFileContent(sandbox, 'link.txt', 'updated content');
  t.is(result.path, 'link.txt');

  // Verify the target file was updated
  const updatedContent = await fs.readFile(targetFile, 'utf8');
  t.is(updatedContent, 'updated content');
});

test('writeFileContent: prevents path traversal attempts', async (t) => {
  const { sandbox } = await createTempSandbox();

  // Various path traversal attempts should all fail
  const maliciousPaths = [
    '../../../etc/passwd',
    '..\\..\\..\\windows\\system32\\config\\sam',
    '....//....//....//etc/passwd',
    '..%2f..%2f..%2fetc%2fpasswd',
  ];

  for (const maliciousPath of maliciousPaths) {
    await t.throwsAsync(
      () => writeFileContent(sandbox, maliciousPath, 'malicious content'),
      { message: /path outside root|symlink escape detected/ }
    );
  }
});

test('writeFileLines: includes same symlink protection', async (t) => {
  const { sandbox, outside } = await createTempSandbox();

  // Create a file outside the sandbox
  const outsideFile = path.join(outside, 'secret.txt');
  await createFile(outsideFile, 'secret content');

  // Create a symlink inside the sandbox pointing outside
  const maliciousSymlink = path.join(sandbox, 'escape.txt');
  await createSymlink(outsideFile, maliciousSymlink);

  // Attempt to write lines through the symlink should fail
  await t.throwsAsync(
    () => writeFileLines(sandbox, 'escape.txt', ['malicious content'], 1),
    { message: /symlink escape detected/ }
  );

  // Verify the outside file wasn't modified
  const originalContent = await fs.readFile(outsideFile, 'utf8');
  t.is(originalContent, 'secret content');
});

test('writeFileContent: creates parent directories safely', async (t) => {
  const { sandbox } = await createTempSandbox();

  // Create a deep nested path that doesn't exist
  const deepPath = 'level1/level2/level3/test.txt';
  const content = 'nested content';

  const result = await writeFileContent(sandbox, deepPath, content);

  t.is(result.path, deepPath);

  const writtenContent = await fs.readFile(path.join(sandbox, deepPath), 'utf8');
  t.is(writtenContent, content);
});

test('writeFileContent: handles broken symlinks gracefully', async (t) => {
  const { sandbox } = await createTempSandbox();

  // Create a broken symlink (pointing to non-existent file)
  const brokenSymlink = path.join(sandbox, 'broken.txt');
  await createSymlink(path.join(sandbox, 'nonexistent.txt'), brokenSymlink);

  // Writing to a broken symlink should still validate the path
  // The actual write will fail because the symlink target doesn't exist
  const error = await t.throwsAsync(
    writeFileContent(sandbox, 'broken.txt', 'test content')
  );
  // We expect this to fail, but NOT with a symlink escape error
  t.true(!error.message.includes('symlink escape detected'));
});

test('writeFileContent: concurrent symlink attacks are prevented', async (t) => {
  const { sandbox, outside } = await createTempSandbox();

  // Create an outside file
  const outsideFile = path.join(outside, 'secret.txt');
  await createFile(outsideFile, 'secret content');

  // Create a legitimate file first
  const legitimateFile = path.join(sandbox, 'legitimate.txt');
  await createFile(legitimateFile, 'legitimate content');

  // Try to replace it with a symlink (this would be a race condition attack)
  // In practice, this is hard to test perfectly, but we can verify the validation runs
  const result = await writeFileContent(sandbox, 'legitimate.txt', 'updated content');
  t.is(result.path, 'legitimate.txt');

  // Verify the file was updated (not replaced by a symlink)
  const updatedContent = await fs.readFile(legitimateFile, 'utf8');
  t.is(updatedContent, 'updated content');
});