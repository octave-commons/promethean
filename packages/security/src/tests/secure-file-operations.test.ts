import test from 'ava';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as os from 'node:os';
import {
  secureReadFile,
  secureWriteFile,
  secureAppendFile,
  secureDeleteFile,
  secureListDirectory,
  secureCreateDirectory,
  secureCopyFile,
  secureMoveFile,
  secureBatchOperation,
} from '../secure-file-operations.js';

const createTempSandbox = async () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  const sandbox = path.join(os.tmpdir(), `secure-ops-test-${timestamp}-${random}`);
  await fs.mkdir(sandbox, { recursive: true });
  return sandbox;
};

const createFile = async (filePath: string, content: string = 'test content') => {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content);
};

test('secureWriteFile: creates new file successfully', async (t) => {
  const sandbox = await createTempSandbox();
  const filePath = 'test.txt';
  const content = 'Hello, World!';

  const result = await secureWriteFile(sandbox, filePath, content);

  t.true(result.success);
  t.is(result.relativePath, filePath);
  t.true(result.absolutePath?.endsWith(filePath));
  t.true(result.metadata?.created);
  t.is(result.metadata?.size, content.length);

  // Verify file was actually written
  const actualContent = await fs.readFile(result.absolutePath!, 'utf8');
  t.is(actualContent, content);
});

test('secureWriteFile: prevents path traversal', async (t) => {
  const sandbox = await createTempSandbox();

  const result = await secureWriteFile(sandbox, '../../../etc/passwd', 'malicious');

  t.false(result.success);
  t.true(result.error?.includes('dangerous pattern') || result.error?.includes('escape'));
});

test('secureWriteFile: respects overwrite setting', async (t) => {
  const sandbox = await createTempSandbox();
  const filePath = 'test.txt';

  // Create initial file
  await secureWriteFile(sandbox, filePath, 'original');

  // Try to overwrite without permission
  const noOverwriteResult = await secureWriteFile(sandbox, filePath, 'modified', {
    overwrite: false,
  });
  t.false(noOverwriteResult.success);
  t.true(noOverwriteResult.error?.includes('already exists'));

  // Overwrite with permission
  const overwriteResult = await secureWriteFile(sandbox, filePath, 'modified', { overwrite: true });
  t.true(overwriteResult.success);
  t.true(overwriteResult.metadata?.modified);
});

test('secureWriteFile: creates parent directories', async (t) => {
  const sandbox = await createTempSandbox();
  const deepPath = 'level1/level2/level3/test.txt';
  const content = 'nested content';

  const result = await secureWriteFile(sandbox, deepPath, content, { createParents: true });

  t.true(result.success);
  t.is(result.relativePath, deepPath);

  // Verify file exists and content is correct
  const actualContent = await fs.readFile(result.absolutePath!, 'utf8');
  t.is(actualContent, content);
});

test('secureReadFile: reads existing file successfully', async (t) => {
  const sandbox = await createTempSandbox();
  const filePath = 'test.txt';
  const content = 'Hello, World!';

  // Create file first
  await createFile(path.join(sandbox, filePath), content);

  const result = await secureReadFile(sandbox, filePath);

  t.true(result.success);
  t.is(result.content, content);
  t.is(result.relativePath, filePath);
  t.is(result.metadata?.size, content.length);
});

test('secureReadFile: prevents path traversal', async (t) => {
  const sandbox = await createTempSandbox();

  const result = await secureReadFile(sandbox, '../../../etc/passwd');

  t.false(result.success);
  t.true(result.error?.includes('dangerous pattern') || result.error?.includes('escape'));
});

test('secureAppendFile: appends to existing file', async (t) => {
  const sandbox = await createTempSandbox();
  const filePath = 'test.txt';
  const initialContent = 'Hello';
  const appendContent = ', World!';

  // Create initial file
  await createFile(path.join(sandbox, filePath), initialContent);

  const result = await secureAppendFile(sandbox, filePath, appendContent);

  t.true(result.success);
  t.true(result.metadata?.modified);

  // Verify content was appended
  const finalContent = await fs.readFile(result.absolutePath!, 'utf8');
  t.is(finalContent, initialContent + appendContent);
});

test('secureAppendFile: creates new file if it doesnt exist', async (t) => {
  const sandbox = await createTempSandbox();
  const filePath = 'new.txt';
  const content = 'New content';

  const result = await secureAppendFile(sandbox, filePath, content, { createParents: true });

  t.true(result.success);
  t.true(result.metadata?.created);

  const actualContent = await fs.readFile(result.absolutePath!, 'utf8');
  t.is(actualContent, content);
});

test('secureDeleteFile: deletes existing file', async (t) => {
  const sandbox = await createTempSandbox();
  const filePath = 'test.txt';

  // Create file first
  await createFile(path.join(sandbox, filePath), 'content');

  const result = await secureDeleteFile(sandbox, filePath);

  t.true(result.success);
  t.is(result.relativePath, filePath);

  // Verify file was deleted
  await t.throwsAsync(fs.access(result.absolutePath!));
});

test('secureDeleteFile: prevents path traversal', async (t) => {
  const sandbox = await createTempSandbox();

  const result = await secureDeleteFile(sandbox, '../../../etc/passwd');

  t.false(result.success);
  t.true(result.error?.includes('dangerous pattern') || result.error?.includes('escape'));
});

test('secureDeleteFile: fails on non-existent file', async (t) => {
  const sandbox = await createTempSandbox();

  const result = await secureDeleteFile(sandbox, 'nonexistent.txt');

  t.false(result.success);
  t.true(result.error?.includes('does not exist'));
});

test('secureListDirectory: lists directory contents', async (t) => {
  const sandbox = await createTempSandbox();

  // Create test structure
  await createFile(path.join(sandbox, 'file1.txt'), 'content1');
  await createFile(path.join(sandbox, 'file2.txt'), 'content2');
  await fs.mkdir(path.join(sandbox, 'subdir'));
  await createFile(path.join(sandbox, 'subdir', 'nested.txt'), 'nested');

  const result = await secureListDirectory(sandbox, '.');

  t.true(result.success);
  t.true(result.entries?.length === 3); // file1.txt, file2.txt, subdir

  const fileNames = result.entries?.map((e) => e.name).sort();
  t.deepEqual(fileNames, ['file1.txt', 'file2.txt', 'subdir']);
});

test('secureListDirectory: respects includeHidden option', async (t) => {
  const sandbox = await createTempSandbox();

  // Create files including hidden
  await createFile(path.join(sandbox, 'visible.txt'), 'content');
  await createFile(path.join(sandbox, '.hidden.txt'), 'hidden');

  // Without includeHidden
  const result1 = await secureListDirectory(sandbox, '.', { includeHidden: false });
  t.true(result1.success);
  t.true(result1.entries?.every((e) => !e.name.startsWith('.')));

  // With includeHidden
  const result2 = await secureListDirectory(sandbox, '.', { includeHidden: true });
  t.true(result2.success);
  t.true(result2.entries?.some((e) => e.name.startsWith('.')));
});

test('secureCreateDirectory: creates new directory', async (t) => {
  const sandbox = await createTempSandbox();
  const dirPath = 'newdir';

  const result = await secureCreateDirectory(sandbox, dirPath);

  t.true(result.success);
  t.is(result.relativePath, dirPath);
  t.true(result.metadata?.created);

  // Verify directory exists
  const stats = await fs.stat(result.absolutePath!);
  t.true(stats.isDirectory());
});

test('secureCreateDirectory: handles existing directory', async (t) => {
  const sandbox = await createTempSandbox();
  const dirPath = 'existing';

  // Create directory first
  await fs.mkdir(path.join(sandbox, dirPath));

  const result = await secureCreateDirectory(sandbox, dirPath);

  t.true(result.success);
  t.false(result.metadata?.created);
});

test('secureCopyFile: copies file successfully', async (t) => {
  const sandbox = await createTempSandbox();
  const sourcePath = 'source.txt';
  const destPath = 'dest.txt';
  const content = 'copy test';

  // Create source file
  await createFile(path.join(sandbox, sourcePath), content);

  const result = await secureCopyFile(sandbox, sourcePath, destPath);

  t.true(result.success);
  t.is(result.relativePath, destPath);
  t.true(result.metadata?.created);

  // Verify content was copied
  const copiedContent = await fs.readFile(result.absolutePath!, 'utf8');
  t.is(copiedContent, content);

  // Verify original still exists
  const originalContent = await fs.readFile(path.join(sandbox, sourcePath), 'utf8');
  t.is(originalContent, content);
});

test('secureCopyFile: prevents path traversal in source', async (t) => {
  const sandbox = await createTempSandbox();

  const result = await secureCopyFile(sandbox, '../../../etc/passwd', 'dest.txt');

  t.false(result.success);
  t.true(result.error?.includes('Source path validation failed'));
});

test('secureCopyFile: prevents path traversal in destination', async (t) => {
  const sandbox = await createTempSandbox();

  // Create source file
  await createFile(path.join(sandbox, 'source.txt'), 'content');

  const result = await secureCopyFile(sandbox, 'source.txt', '../../../etc/passwd');

  t.false(result.success);
  t.true(result.error?.includes('Destination path validation failed'));
});

test('secureMoveFile: moves file successfully', async (t) => {
  const sandbox = await createTempSandbox();
  const sourcePath = 'source.txt';
  const destPath = 'dest.txt';
  const content = 'move test';

  // Create source file
  await createFile(path.join(sandbox, sourcePath), content);

  const result = await secureMoveFile(sandbox, sourcePath, destPath);

  t.true(result.success);
  t.is(result.relativePath, destPath);

  // Verify content was moved
  const movedContent = await fs.readFile(result.absolutePath!, 'utf8');
  t.is(movedContent, content);

  // Verify original no longer exists
  await t.throwsAsync(fs.access(path.join(sandbox, sourcePath)));
});

test('secureMoveFile: cleans up if copy fails', async (t) => {
  const sandbox = await createTempSandbox();
  const sourcePath = 'source.txt';
  const destPath = '../../../etc/passwd'; // Invalid destination
  const content = 'move test';

  // Create source file
  await createFile(path.join(sandbox, sourcePath), content);

  const result = await secureMoveFile(sandbox, sourcePath, destPath);

  t.false(result.success);

  // Verify original still exists (move should have failed)
  const originalContent = await fs.readFile(path.join(sandbox, sourcePath), 'utf8');
  t.is(originalContent, content);
});

test('secureBatchOperation: processes multiple operations', async (t) => {
  const sandbox = await createTempSandbox();

  const operations = [
    () => secureWriteFile(sandbox, 'file1.txt', 'content1'),
    () => secureWriteFile(sandbox, 'file2.txt', 'content2'),
    () => secureWriteFile(sandbox, 'file3.txt', 'content3'),
  ];

  const result = await secureBatchOperation(operations);

  t.is(result.results.length, 3);
  t.is(result.errors.length, 0);

  // Verify all files were created
  for (let i = 1; i <= 3; i++) {
    const content = await fs.readFile(path.join(sandbox, `file${i}.txt`), 'utf8');
    t.is(content, `content${i}`);
  }
});

test('secureBatchOperation: handles errors with continueOnError', async (t) => {
  const sandbox = await createTempSandbox();

  const operations = [
    () => secureWriteFile(sandbox, 'file1.txt', 'content1'),
    () => secureWriteFile(sandbox, '../../../etc/passwd', 'malicious'), // This will fail
    () => secureWriteFile(sandbox, 'file2.txt', 'content2'),
  ];

  const result = await secureBatchOperation(operations, { continueOnError: true });

  t.is(result.results.length, 2); // Only successful operations
  t.is(result.errors.length, 1); // One error

  // Verify valid files were still created
  const content1 = await fs.readFile(path.join(sandbox, 'file1.txt'), 'utf8');
  t.is(content1, 'content1');

  const content2 = await fs.readFile(path.join(sandbox, 'file2.txt'), 'utf8');
  t.is(content2, 'content2');
});

test('secureBatchOperation: stops on error without continueOnError', async (t) => {
  const sandbox = await createTempSandbox();

  const operations = [
    () => secureWriteFile(sandbox, 'file1.txt', 'content1'),
    () => secureWriteFile(sandbox, '../../../etc/passwd', 'malicious'), // This will fail
    () => secureWriteFile(sandbox, 'file2.txt', 'content2'),
  ];

  const result = await secureBatchOperation(operations, { continueOnError: false });

  t.is(result.results.length, 1); // Only first operation succeeded
  t.is(result.errors.length, 1); // One error

  // Verify only first file was created
  const content1 = await fs.readFile(path.join(sandbox, 'file1.txt'), 'utf8');
  t.is(content1, 'content1');

  // Second file should not exist
  await t.throwsAsync(fs.access(path.join(sandbox, 'file2.txt')));
});

test('secure operations: respect file extension restrictions', async (t) => {
  const sandbox = await createTempSandbox();

  const config = {
    allowedExtensions: ['.txt'],
    blockedExtensions: ['.exe'],
  };

  // Valid extension
  const validResult = await secureWriteFile(sandbox, 'test.txt', 'content', config);
  t.true(validResult.success);

  // Blocked extension
  const blockedResult = await secureWriteFile(sandbox, 'test.exe', 'content', config);
  t.false(blockedResult.success);
  t.true(blockedResult.error?.includes('not allowed'));

  // Not in allowed list
  const notAllowedResult = await secureWriteFile(sandbox, 'test.md', 'content', config);
  t.false(notAllowedResult.success);
  t.true(notAllowedResult.error?.includes('not in allowed list'));
});
