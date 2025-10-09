import test from 'ava';
import { mkdtemp, writeFile, symlink, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { writeFileContent } from '../files.js';

test('writeFileContent rejects symlink escape attempts', async (t) => {
  const sandbox = await mkdtemp(join(tmpdir(), 'mcp-security-test-'));
  const outsideFile = join(sandbox, '..', 'outside-secret.txt');

  // Create a file outside the sandbox
  await writeFile(outsideFile, 'secret content');

  // Create a symlink inside the sandbox pointing outside
  const symlinkPath = join(sandbox, 'escape-symlink');
  await symlink(outsideFile, symlinkPath);

  // Attempt to write through the symlink should fail
  await t.throwsAsync(
    async () => {
      await writeFileContent(sandbox, 'escape-symlink', 'malicious content');
    },
    { message: /symlink escape detected/ },
  );

  // Verify the original file wasn't modified
  const content = await readFile(outsideFile, 'utf8');
  t.is(content, 'secret content');
});

test('writeFileContent allows legitimate symlinks within sandbox', async (t) => {
  const sandbox = await mkdtemp(join(tmpdir(), 'mcp-security-test-'));
  const targetFile = join(sandbox, 'target.txt');
  const symlinkPath = join(sandbox, 'internal-symlink');

  // Create a file inside the sandbox
  await writeFile(targetFile, 'original content');

  // Create a symlink inside the sandbox pointing to another file inside
  await symlink(targetFile, symlinkPath);

  // Writing through the symlink should succeed
  await writeFileContent(sandbox, 'internal-symlink', 'updated content');

  // Verify the target file was updated
  const content = await readFile(targetFile, 'utf8');
  t.is(content, 'updated content');
});

test('writeFileContent prevents parent directory symlink escape', async (t) => {
  const sandbox = await mkdtemp(join(tmpdir(), 'mcp-security-test-'));
  const outsideDir = join(sandbox, '..', 'outside-dir');

  // Create a directory outside the sandbox
  await mkdtemp(outsideDir);

  // Create a symlink to the outside directory
  const maliciousSymlink = join(sandbox, 'malicious-dir');
  await symlink(outsideDir, maliciousSymlink);

  // Attempt to write through the malicious directory symlink should fail
  await t.throwsAsync(
    async () => {
      await writeFileContent(sandbox, 'malicious-dir/escape.txt', 'malicious content');
    },
    { message: /symlink escape detected/ },
  );
});
