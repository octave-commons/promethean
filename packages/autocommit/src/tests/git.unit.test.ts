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
} from '../git.js';

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

test('hasRepo detects git repositories', async (t) => {
  const tempDir = getTempDir();
  await mkdir(tempDir, { recursive: true });

  try {
    // Initialize git repo
    await execa('git', ['init'], { cwd: tempDir });

    const hasRepoResult = await hasRepo(tempDir);
    t.true(hasRepoResult);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('listChangedFiles returns changed files', async (t) => {
  const tempDir = getTempDir();
  await mkdir(tempDir, { recursive: true });

  try {
    // Initialize git repo
    await execa('git', ['init'], { cwd: tempDir });
    await execa('git', ['config', 'user.name', 'Test User'], { cwd: tempDir });
    await execa('git', ['config', 'user.email', 'test@example.com'], { cwd: tempDir });

    // Create and stage a file
    await writeFile(join(tempDir, 'test.txt'), 'content');
    await execa('git', ['add', 'test.txt'], { cwd: tempDir });

    const changedFiles = await listChangedFiles(tempDir);
    t.is(changedFiles.length, 1);
    t.true(changedFiles.includes('test.txt'));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('addAll stages all changes', async (t) => {
  const tempDir = getTempDir();
  await mkdir(tempDir, { recursive: true });

  try {
    // Initialize git repo
    await execa('git', ['init'], { cwd: tempDir });

    // Create files
    await writeFile(join(tempDir, 'file1.txt'), 'content1');
    await writeFile(join(tempDir, 'file2.txt'), 'content2');

    // Stage changes
    await addAll(tempDir);

    // Check staged changes
    const hasStaged = await hasStagedChanges(tempDir);
    t.true(hasStaged);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('hasStagedChanges detects staged changes', async (t) => {
  const tempDir = getTempDir();
  await mkdir(tempDir, { recursive: true });

  try {
    // Initialize git repo
    await execa('git', ['init'], { cwd: tempDir });

    // No changes yet
    const noChanges = await hasStagedChanges(tempDir);
    t.false(noChanges);

    // Create and stage a file
    await writeFile(join(tempDir, 'test.txt'), 'content');
    await execa('git', ['add', 'test.txt'], { cwd: tempDir });

    const hasChanges = await hasStagedChanges(tempDir);
    t.true(hasChanges);
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

test('commit creates commits with sanitized messages', async (t) => {
  const tempDir = getTempDir();
  await mkdir(tempDir, { recursive: true });

  try {
    // Initialize git repo
    await execa('git', ['init'], { cwd: tempDir });
    await execa('git', ['config', 'user.name', 'Test User'], { cwd: tempDir });
    await execa('git', ['config', 'user.email', 'test@example.com'], { cwd: tempDir });

    // Create and stage a file
    await writeFile(join(tempDir, 'test.txt'), 'content');
    await addAll(tempDir);

    // Create commit
    await commit(tempDir, 'test commit message');

    // Check commit was created
    const { stdout } = await execa('git', ['log', '--oneline', '-1'], { cwd: tempDir });
    t.true(stdout.includes('test commit message'));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});
