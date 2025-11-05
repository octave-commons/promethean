import test from 'ava';

import { execa } from 'execa';
import { mkdir, writeFile, rm } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

import { findGitRepositories } from '../git.js';

test('findGitRepositories returns individual paths for subrepos', async (t) => {
  const tempDir = join(tmpdir(), `test-${Date.now()}`);

  try {
    await mkdir(tempDir, { recursive: true });

    // Create main repo
    await execa('git', ['init'], { cwd: tempDir });
    await execa('git', ['config', 'user.name', 'test'], { cwd: tempDir });
    await execa('git', ['config', 'user.email', 'test@test.com'], { cwd: tempDir });

    // Create subrepo directory
    const subrepoDir = join(tempDir, 'mysubrepo');
    await mkdir(subrepoDir, { recursive: true });

    // Add .gitrepo file to make it a subrepo
    await writeFile(
      join(subrepoDir, '.gitrepo'),
      `
subdir = mysubrepo
remote = https://github.com/example/repo.git
branch = main
    `.trim(),
    );

    // Initialize subrepo as git repo
    await execa('git', ['init'], { cwd: subrepoDir });
    await execa('git', ['config', 'user.name', 'test'], { cwd: subrepoDir });
    await execa('git', ['config', 'user.email', 'test@test.com'], { cwd: subrepoDir });
    await writeFile(join(subrepoDir, 'file.txt'), 'content');
    await execa('git', ['add', '.'], { cwd: subrepoDir });
    await execa('git', ['commit', '-m', 'initial'], { cwd: subrepoDir });

    // Test findGitRepositories
    const repos = await findGitRepositories(tempDir);

    // Should find both main repo and subrepo
    t.is(repos.length, 2);

    // Should include the subrepo path itself, not parent
    const hasSubrepoPath = repos.some((r) => r.includes('mysubrepo'));
    t.true(hasSubrepoPath, 'Should find subrepo by its path');

    // Subrepo path should be the actual subrepo directory
    const subrepoRepo = repos.find((r) => r.includes('mysubrepo'));
    t.is(subrepoRepo, subrepoDir, 'Subrepo should be its own directory');
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});
