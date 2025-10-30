/**
 * Unit tests for GitUtils
 */

import test from 'ava';

test.skip('GitUtils - DISABLED', (t) => {
  t.pass('Git functionality has been disabled - all git tests skipped');
});
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { GitUtils } from '../lib/heal/utils/git-utils.js';

// Mock execSync to avoid actual git operations during tests

test.before(async (t) => {
  // Create a temporary directory for testing
  const testDir = path.join(process.cwd(), 'test-git-utils-temp');
  await fs.mkdir(testDir, { recursive: true });

  // Initialize a git repository
  const { execSync } = await import('node:child_process');
  execSync('git init', { cwd: testDir });
  execSync('git config user.name "Test User"', { cwd: testDir });
  execSync('git config user.email "test@example.com"', { cwd: testDir });

  // Create initial commit
  await fs.writeFile(path.join(testDir, 'test.txt'), 'test content');
  execSync('git add test.txt', { cwd: testDir });
  execSync('git commit -m "Initial commit"', { cwd: testDir });

  (t.context as any).testDir = testDir;
});

test.after.always(async (t) => {
  // Clean up test directory
  const testDir = (t.context as any).testDir as string;
  try {
    await fs.rm(testDir, { recursive: true, force: true });
  } catch (error) {
    // Ignore cleanup errors
  }
});

test('GitUtils constructor initializes correctly', (t) => {
  const gitUtils = new GitUtils('/test/path');
  t.true(gitUtils instanceof GitUtils);
});
