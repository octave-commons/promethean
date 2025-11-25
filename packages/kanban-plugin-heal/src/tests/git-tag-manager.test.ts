import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { execSync } from 'node:child_process';
import path from 'node:path';
import os from 'node:os';
import { GitTagManager } from '../git-tag-manager.js';

const withTempRepo = async (): Promise<string> => {
  const repoRoot = await mkdtemp(path.join(os.tmpdir(), 'heal-plugin-git-'));
  execSync('git init', { cwd: repoRoot });
  execSync('git config user.name "Test User"', { cwd: repoRoot });
  execSync('git config user.email "test@example.com"', { cwd: repoRoot });
  return repoRoot;
};

const resetGitEnv = (): (() => void) => {
  const originalDir = process.env.GIT_DIR;
  const originalWorkTree = process.env.GIT_WORK_TREE;
  delete process.env.GIT_DIR;
  delete process.env.GIT_WORK_TREE;
  return () => {
    if (originalDir !== undefined) {
      process.env.GIT_DIR = originalDir;
    } else {
      delete process.env.GIT_DIR;
    }
    if (originalWorkTree !== undefined) {
      process.env.GIT_WORK_TREE = originalWorkTree;
    } else {
      delete process.env.GIT_WORK_TREE;
    }
  };
};

test('GitTagManager creates heal tags correctly', async () => {
  const restoreEnv = resetGitEnv();
  try {
    const repoRoot = await withTempRepo();
    await writeFile(path.join(repoRoot, 'test.txt'), 'initial content');
    execSync('git add test.txt', { cwd: repoRoot });
    execSync('git commit -m "Initial commit"', { cwd: repoRoot });

    const manager = new GitTagManager(repoRoot);
    const result = await manager.createHealTag('Test healing operation');

    assert.equal(result.success, true);
    assert.ok(result.tag.startsWith('heal-'));
    assert.ok(result.commitSha.length > 0);
    assert.equal(result.metadata.annotated, true);

    const tags = await manager.getHealTags();
    assert.ok(tags.includes(result.tag));
  } finally {
    restoreEnv();
  }
});

test('GitTagManager handles tag deletion', async () => {
  const restoreEnv = resetGitEnv();
  try {
    const repoRoot = await withTempRepo();
    await writeFile(path.join(repoRoot, 'test.txt'), 'content');
    execSync('git add test.txt', { cwd: repoRoot });
    execSync('git commit -m "Initial"', { cwd: repoRoot });

    const manager = new GitTagManager(repoRoot);
    const createResult = await manager.createHealTag('Test tag');
    assert.equal(createResult.success, true);

    let tags = await manager.getHealTags();
    assert.ok(tags.includes(createResult.tag));

    const deleteResult = await manager.deleteTag(createResult.tag);
    assert.equal(deleteResult.success, true);

    tags = await manager.getHealTags();
    assert.equal(tags.includes(createResult.tag), false);
  } finally {
    restoreEnv();
  }
});
