import test from 'ava';
import { mkdtemp, mkdir } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { findGitRepositories } from '../git';
import { execa } from 'execa';

async function createTempDir(): Promise<string> {
  return mkdtemp(join(tmpdir(), 'autocommit-test-'));
}

test('findGitRepositories finds no repos in empty directory', async (t) => {
  const tempDir = await createTempDir();
  const repos = await findGitRepositories(tempDir);
  t.deepEqual(repos, []);
});

test('findGitRepositories finds single repo', async (t) => {
  const tempDir = await createTempDir();
  const repoDir = join(tempDir, 'myrepo');

  await mkdir(repoDir, { recursive: true });
  await execa('git', ['init'], { cwd: repoDir });

  const repos = await findGitRepositories(tempDir);
  t.deepEqual(repos, [repoDir]);
});

test('findGitRepositories finds multiple repos', async (t) => {
  const tempDir = await createTempDir();
  const repo1Dir = join(tempDir, 'repo1');
  const repo2Dir = join(tempDir, 'repo2');
  const subRepoDir = join(tempDir, 'subdir', 'repo3');

  await mkdir(repo1Dir, { recursive: true });
  await mkdir(repo2Dir, { recursive: true });
  await mkdir(subRepoDir, { recursive: true });

  await execa('git', ['init'], { cwd: repo1Dir });
  await execa('git', ['init'], { cwd: repo2Dir });
  await execa('git', ['init'], { cwd: subRepoDir });

  const repos = await findGitRepositories(tempDir);
  t.deepEqual(repos.sort(), [repo1Dir, repo2Dir, subRepoDir].sort());
});

test('findGitRepositories skips node_modules and dist', async (t) => {
  const tempDir = await createTempDir();
  const repoDir = join(tempDir, 'repo');
  const nodeModulesRepoDir = join(tempDir, 'node_modules', 'badrepo');
  const distRepoDir = join(tempDir, 'dist', 'badrepo');

  await mkdir(repoDir, { recursive: true });
  await mkdir(nodeModulesRepoDir, { recursive: true });
  await mkdir(distRepoDir, { recursive: true });

  await execa('git', ['init'], { cwd: repoDir });
  await execa('git', ['init'], { cwd: nodeModulesRepoDir });
  await execa('git', ['init'], { cwd: distRepoDir });

  const repos = await findGitRepositories(tempDir);
  t.deepEqual(repos, [repoDir]);
});

test('findGitRepositories handles nested repos correctly', async (t) => {
  const tempDir = await createTempDir();
  const outerRepoDir = join(tempDir, 'outer');
  const innerRepoDir = join(tempDir, 'outer', 'inner');

  await mkdir(outerRepoDir, { recursive: true });
  await mkdir(innerRepoDir, { recursive: true });

  await execa('git', ['init'], { cwd: outerRepoDir });
  await execa('git', ['init'], { cwd: innerRepoDir });

  const repos = await findGitRepositories(tempDir);
  t.deepEqual(repos.sort(), [outerRepoDir, innerRepoDir].sort());
});
