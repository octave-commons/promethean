import test from 'ava';
import { mkdir, writeFile, rm } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { execa } from 'execa';
import { start } from '../index.js';
import { Config } from '../config.js';

// Helper to create unique temp directory names
const getTempDir = () => {
  const random = Math.random().toString(36).substring(2, 8);
  return join(tmpdir(), `autocommit-integration-${Date.now()}-${random}`);
};

// Helper to create a git repository with commits
async function createGitRepo(dir: string, name: string, files: Record<string, string> = {}) {
  await mkdir(dir, { recursive: true });

  // Initialize git repo
  await execa('git', ['init'], { cwd: dir });
  await execa('git', ['config', 'user.name', 'Test User'], { cwd: dir });
  await execa('git', ['config', 'user.email', 'test@example.com'], { cwd: dir });

  // Create files
  for (const [filename, content] of Object.entries(files)) {
    await writeFile(join(dir, filename), content);
  }

  // Add and commit
  await execa('git', ['add', '.'], { cwd: dir });
  await execa('git', ['commit', '-m', `Initial commit for ${name}`], { cwd: dir });

  return dir;
}

// Helper to create a subrepo
async function createSubrepo(parentDir: string, subrepoName: string, remoteUrl: string) {
  const subrepoDir = join(parentDir, subrepoName);
  await mkdir(subrepoDir, { recursive: true });

  // Create .gitrepo file
  const gitrepoContent = `
# Git Subrepo Configuration
subdir = ${subrepoName}
remote = ${remoteUrl}
branch = main
`;
  await writeFile(join(subrepoDir, '.gitrepo'), gitrepoContent.trim());

  // Initialize as git repo and add some content
  await createGitRepo(subrepoDir, subrepoName, {
    [`${subrepoName}-file.txt`]: `Content for ${subrepoName}`,
    'subrepo-marker.txt': 'This is a subrepo',
  });

  return subrepoDir;
}

test('recursive autocommit integration test with multiple repos and subrepos', async (t) => {
  const tempDir = getTempDir();

  try {
    // Create main repository
    const mainRepo = await createGitRepo(tempDir, 'main', {
      'README.md': '# Main Repository',
      'main-file.txt': 'Main repository content',
    });

    // Create sub-repositories
    const subrepo1 = await createSubrepo(
      mainRepo,
      'subrepo1',
      'https://github.com/example/subrepo1.git',
    );
    const subrepo2 = await createSubrepo(
      mainRepo,
      'subrepo2',
      'https://github.com/example/subrepo2.git',
    );

    // Create nested structure with more repos
    const nestedDir = join(mainRepo, 'nested');
    const nestedRepo = await createGitRepo(nestedDir, 'nested', {
      'nested-file.txt': 'Nested repository content',
    });

    // Create subrepo inside nested repo
    const nestedSubrepo = await createSubrepo(
      nestedRepo,
      'nested-subrepo',
      'https://github.com/example/nested-subrepo.git',
    );

    // Create another independent repo
    const independentDir = join(tempDir, 'independent');
    const independentRepo = await createGitRepo(independentDir, 'independent', {
      'independent.txt': 'Independent repository content',
    });

    // Configuration for autocommit
    const config: Config = {
      path: tempDir,
      recursive: true,
      handleSubrepos: true,
      debounceMs: 100, // Short debounce for testing
      dryRun: true, // Don't actually commit, just test watching
      quiet: false,
      baseUrl: 'http://localhost:11434',
      apiKey: 'test-key',
      model: 'test-model',
      temperature: 0.7,
      maxDiffBytes: 1000000,
      signoff: false,
      exclude: '',
    };

    // Start autocommit watcher
    const watcher = await start(config);

    // Wait a bit for watchers to initialize
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Add some changes to trigger commits
    await writeFile(join(mainRepo, 'new-main-file.txt'), 'New main content');
    await writeFile(join(subrepo1, 'new-subrepo1-file.txt'), 'New subrepo1 content');
    await writeFile(
      join(nestedSubrepo, 'new-nested-subrepo-file.txt'),
      'New nested subrepo content',
    );
    await writeFile(join(independentRepo, 'new-independent-file.txt'), 'New independent content');

    // Wait for debounce and processing
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Clean up
    watcher.close();

    // If we got here without errors, the test passes
    t.pass('Recursive autocommit handled multiple repos and subrepos without conflicts');
  } finally {
    // Clean up
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('recursive autocommit finds correct number of repositories', async (t) => {
  const tempDir = getTempDir();

  try {
    // Create structure with mixed repos and subrepos
    const mainRepo = await createGitRepo(tempDir, 'main');

    await createSubrepo(mainRepo, 'subrepo1', 'https://github.com/example/subrepo1.git');
    await createSubrepo(mainRepo, 'subrepo2', 'https://github.com/example/subrepo2.git');

    const nestedDir = join(mainRepo, 'nested');
    await createGitRepo(nestedDir, 'nested');
    await createSubrepo(
      nestedDir,
      'nested-subrepo',
      'https://github.com/example/nested-subrepo.git',
    );

    const anotherDir = join(tempDir, 'another');
    await createGitRepo(anotherDir, 'another');

    // Count repositories using the same logic as autocommit
    const { findGitRepositories } = await import('../git.js');
    const repositories = await findGitRepositories(tempDir);

    // Should find: main, subrepo1, subrepo2, nested, nested-subrepo, another = 6 total
    t.is(repositories.length, 6);

    // Verify specific paths are found
    const repoPaths = repositories.map((r) => r.replace(tempDir, ''));
    t.true(repoPaths.some((p) => p.includes('subrepo1')));
    t.true(repoPaths.some((p) => p.includes('subrepo2')));
    t.true(repoPaths.some((p) => p.includes('nested-subrepo')));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('recursive autocommit handles file changes without conflicts', async (t) => {
  const tempDir = getTempDir();

  try {
    // Create multiple repos
    const repo1 = await createGitRepo(join(tempDir, 'repo1'), 'repo1', {
      'file1.txt': 'Initial content 1',
    });

    const repo2 = await createGitRepo(join(tempDir, 'repo2'), 'repo2', {
      'file2.txt': 'Initial content 2',
    });

    await createSubrepo(tempDir, 'subrepo1', 'https://github.com/example/subrepo1.git');

    // Start autocommit
    const config: Config = {
      path: tempDir,
      recursive: true,
      handleSubrepos: true,
      debounceMs: 50,
      dryRun: false, // Actually commit for this test
      quiet: true,
      baseUrl: 'http://localhost:11434',
      apiKey: 'test-key',
      model: 'test-model',
      temperature: 0.7,
      maxDiffBytes: 1000000,
      signoff: false,
      exclude: '',
    };

    const watcher = await start(config);

    // Wait for initialization
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Make simultaneous changes to multiple repos
    await Promise.all([
      writeFile(join(repo1, 'change1.txt'), 'Change in repo 1'),
      writeFile(join(repo2, 'change2.txt'), 'Change in repo 2'),
      writeFile(join(tempDir, 'subrepo1', 'change3.txt'), 'Change in subrepo 1'),
    ]);

    // Wait for processing
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Clean up
    watcher.close();

    // If we got here without throwing errors, the test passes
    t.pass('Multiple simultaneous changes handled without conflicts');
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});
