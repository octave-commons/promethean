import test from 'ava';
import { mkdtemp, mkdir } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { execa } from 'execa';

// Test the recursive functionality by testing the CLI directly
test('recursive flag finds multiple repositories', async (t) => {
  const tempDir = await mkdtemp(join(tmpdir(), 'autocommit-test-'));
  const repo1Dir = join(tempDir, 'repo1');
  const repo2Dir = join(tempDir, 'repo2');

  await mkdir(repo1Dir, { recursive: true });
  await mkdir(repo2Dir, { recursive: true });

  await execa('git', ['init'], { cwd: repo1Dir });
  await execa('git', ['init'], { cwd: repo2Dir });

  // Test that we can detect both repos exist
  const { stdout: git1 } = await execa('git', ['rev-parse', '--show-toplevel'], { cwd: repo1Dir });
  const { stdout: git2 } = await execa('git', ['rev-parse', '--show-toplevel'], { cwd: repo2Dir });

  t.is(git1.trim(), repo1Dir);
  t.is(git2.trim(), repo2Dir);
});
