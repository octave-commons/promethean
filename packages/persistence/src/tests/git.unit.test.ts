import { tmpdir } from 'os';
import { join } from 'path';
import { mkdir, writeFile, rm } from 'fs/promises';
import { randomBytes } from 'crypto';

import { execa } from 'execa';
import test from 'ava';

import {
  hasRepo,
  listChangedFiles,
  addAll,
  hasStagedChanges,
  repoSummary,
  commit,
  sanitizeCommitMessage,
} from '../git.ts';

// Helper to create unique temp directory names
const getTempDir = () => {
  const random = randomBytes(4).toString('hex');
  return join(tmpdir(), `autocommit-test-${Date.now()}-${random}`);
};

test('sanitizeCommitMessage removes control characters', (t) => {
  const message = 'test\x00\x01\x07message';
  const sanitized = sanitizeCommitMessage(message);
  t.is(sanitized, 'testmessage');
});

test('sanitizeCommitMessage trims whitespace', (t) => {
  const message = '  test message  \n  ';
  const sanitized = sanitizeCommitMessage(message);
  t.is(sanitized, 'test message');
});

test('sanitizeCommitMessage limits length', (t) => {
  const longMessage = 'a'.repeat(3000);
  const sanitized = sanitizeCommitMessage(longMessage);
  t.true(sanitized.length <= 2000);
});

test('sanitizeCommitMessage handles empty input', (t) => {
  t.is(sanitizeCommitMessage(''), '');
  t.is(sanitizeCommitMessage(null as unknown as string), '');
  t.is(sanitizeCommitMessage(undefined as unknown as string), '');
});

test('sanitizeCommitMessage limits lines', (t) => {
  const manyLines = 'line1\n'.repeat(100);
  const sanitized = sanitizeCommitMessage(manyLines);
  const lines = sanitized.split('\n');
  t.true(lines.length <= 50);
});

test('sanitizeCommitMessage truncates long first line', (t) => {
  const longFirstLine = 'a'.repeat(100) + '\nsecond line';
  const sanitized = sanitizeCommitMessage(longFirstLine);
  const lines = sanitized.split('\n');
  if (lines.length > 0) {
    t.true(lines[0]!.length <= 72);
    t.true(lines[0]!.endsWith('...'));
  }
});

test('hasRepo returns false for non-existent directory', async (t) => {
  const result = await hasRepo('/tmp/nonexistent-directory-12345');
  t.false(result);
});

test('hasRepo returns false for directory without git', async (t) => {
  const tempDir = getTempDir();
  await mkdir(tempDir, { recursive: true });

  try {
    const result = await hasRepo(tempDir);
    t.false(result);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('hasRepo returns true for git repository', async (t) => {
  const tempDir = getTempDir();
  await mkdir(tempDir, { recursive: true });

  try {
    // Initialize git repo
    await execa('git', ['init'], { cwd: tempDir });
    await execa('git', ['config', 'user.name', 'Test User'], { cwd: tempDir });
    await execa('git', ['config', 'user.email', 'test@example.com'], { cwd: tempDir });

    const result = await hasRepo(tempDir);
    t.true(result);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('listChangedFiles returns empty array for clean repo', async (t) => {
  const tempDir = getTempDir();
  await mkdir(tempDir, { recursive: true });

  try {
    // Initialize git repo
    await execa('git', ['init'], { cwd: tempDir });
    await execa('git', ['config', 'user.name', 'Test User'], { cwd: tempDir });
    await execa('git', ['config', 'user.email', 'test@example.com'], { cwd: tempDir });

    const files = await listChangedFiles(tempDir);
    t.deepEqual(files, []);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('listChangedFiles detects new files', async (t) => {
  const tempDir = getTempDir();
  await mkdir(tempDir, { recursive: true });

  try {
    // Initialize git repo
    await execa('git', ['init'], { cwd: tempDir });
    await execa('git', ['config', 'user.name', 'Test User'], { cwd: tempDir });
    await execa('git', ['config', 'user.email', 'test@example.com'], { cwd: tempDir });

    // Create a file
    const testFile = join(tempDir, 'test.txt');
    await writeFile(testFile, 'test content');

    const files = await listChangedFiles(tempDir);
    t.deepEqual(files, ['test.txt']);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('hasStagedChanges returns false for repo with no staged changes', async (t) => {
  const tempDir = getTempDir();
  await mkdir(tempDir, { recursive: true });

  try {
    // Initialize git repo
    await execa('git', ['init'], { cwd: tempDir });
    await execa('git', ['config', 'user.name', 'Test User'], { cwd: tempDir });
    await execa('git', ['config', 'user.email', 'test@example.com'], { cwd: tempDir });

    const hasStaged = await hasStagedChanges(tempDir);
    t.false(hasStaged);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('commit throws error for empty message', async (t) => {
  const tempDir = getTempDir();
  await mkdir(tempDir, { recursive: true });

  try {
    // Initialize git repo
    await execa('git', ['init'], { cwd: tempDir });
    await execa('git', ['config', 'user.name', 'Test User'], { cwd: tempDir });
    await execa('git', ['config', 'user.email', 'test@example.com'], { cwd: tempDir });

    await t.throwsAsync(commit(tempDir, ''), {
      message: 'Invalid commit message: message is empty after sanitization',
    });
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('commit succeeds with valid message', async (t) => {
  const tempDir = getTempDir();
  await mkdir(tempDir, { recursive: true });

  try {
    // Initialize git repo
    await execa('git', ['init'], { cwd: tempDir });
    await execa('git', ['config', 'user.name', 'Test User'], { cwd: tempDir });
    await execa('git', ['config', 'user.email', 'test@example.com'], { cwd: tempDir });

    // Create and stage a file
    const testFile = join(tempDir, 'test.txt');
    await writeFile(testFile, 'test content');
    await addAll(tempDir);

    // This should not throw
    await commit(tempDir, 'test commit');

    // Test passes if no exception was thrown
    t.pass();
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('repoSummary returns branch and remote info', async (t) => {
  const tempDir = getTempDir();
  await mkdir(tempDir, { recursive: true });

  try {
    // Initialize git repo
    await execa('git', ['init'], { cwd: tempDir });
    await execa('git', ['config', 'user.name', 'Test User'], { cwd: tempDir });
    await execa('git', ['config', 'user.email', 'test@example.com'], { cwd: tempDir });

    const summary = await repoSummary(tempDir);
    t.true(summary.includes('branch:'));
    t.true(summary.includes('remote:'));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});
