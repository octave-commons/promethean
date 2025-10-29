import test from 'ava';
import { temporaryDirectory } from 'tempy';
import { execa } from 'execa';
import { join } from 'path';
import { performCommit } from '../index.js';
import { Config } from '../config.js';
import { addAll, hasStagedChanges, commit } from '../git.js';

test('performCommit handles "nothing to commit" gracefully', async (t) => {
  const tempDir = temporaryDirectory();

  // Initialize git repo
  await execa('git', ['init'], { cwd: tempDir });
  await execa('git', ['config', 'user.name', 'test'], { cwd: tempDir });
  await execa('git', ['config', 'user.email', 'test@example.com'], { cwd: tempDir });

  const config: Config = {
    path: tempDir,
    debounceMs: 100,
    baseUrl: 'http://localhost:11434/v1',
    model: 'test',
    quiet: true,
    dryRun: false,
    maxDiffBytes: 1000000,
    temperature: 0.7,
    signoff: false,
    recursive: false,
    handleSubrepos: false,
    exclude: '',
    subrepoStrategy: 'integrated',
  };

  const log = () => {};
  const warn = () => {};

  // Test 1: No changes at all
  await performCommit(config, tempDir, log, warn);
  t.pass('Should not throw when there are no changes');

  // Test 2: Create a file and commit it
  const testFile = join(tempDir, 'test.txt');
  await execa('touch', [testFile]);
  await performCommit(config, tempDir, log, warn);

  // Should have committed file
  const status = await execa('git', ['status', '--porcelain'], { cwd: tempDir });
  t.is(status.stdout.trim(), '');

  // Test 3: Simulate race condition - another process commits while we're generating message
  // Create another file
  const testFile2 = join(tempDir, 'test2.txt');
  await execa('touch', [testFile2]);

  // Stage it
  await addAll(tempDir);
  t.true(await hasStagedChanges(tempDir));

  // Commit it manually (simulating another process)
  await commit(tempDir, 'Manual commit', false);

  // Now try to perform commit - should handle gracefully
  await performCommit(config, tempDir, log, warn);
  t.pass('Should handle race condition gracefully');
});

test('commit function throws specific error for "nothing to commit"', async (t) => {
  const tempDir = temporaryDirectory();

  // Initialize git repo
  await execa('git', ['init'], { cwd: tempDir });
  await execa('git', ['config', 'user.name', 'test'], { cwd: tempDir });
  await execa('git', ['config', 'user.email', 'test@example.com'], { cwd: tempDir });

  try {
    await commit(tempDir, 'test message', false);
    t.fail('Should have thrown an error');
  } catch (error) {
    if (error instanceof Error) {
      t.is(error.message, 'nothing to commit, working tree clean');
    } else {
      t.fail('Should have thrown an Error instance');
    }
  }
});

test('commit function throws specific error for "nothing to commit"', async (t) => {
  const tempDir = temporaryDirectory();

  // Initialize git repo
  await execa('git', ['init'], { cwd: tempDir });
  await execa('git', ['config', 'user.name', 'test'], { cwd: tempDir });
  await execa('git', ['config', 'user.email', 'test@example.com'], { cwd: tempDir });

  try {
    await commit(tempDir, 'test message', false);
    t.fail('Should have thrown an error');
  } catch (error) {
    if (error instanceof Error) {
      t.is(error.message, 'nothing to commit, working tree clean');
    } else {
      t.fail('Should have thrown an Error instance');
    }
  }
});
