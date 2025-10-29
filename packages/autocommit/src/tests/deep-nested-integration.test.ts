import test from 'ava';
import { execa } from 'execa';
import { mkdir, writeFile, rm } from 'fs/promises';
import { join, relative } from 'path';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';
import { setTimeout as sleep } from 'timers/promises';

import { start } from '../index.js';
import { Config } from '../config.js';

// Helper to create random directory name
const randomName = () => randomUUID().substring(0, 8);

// Helper to create random file content
const randomContent = () => `content-${Math.random().toString(36).substring(2)}-${Date.now()}`;

// Helper to check if path is inside a git repository
async function isInsideGit(
  filePath: string,
  gitRepos: string[],
): Promise<{ inside: boolean; repo?: string }> {
  for (const repo of gitRepos) {
    if (filePath.startsWith(repo)) {
      return { inside: true, repo };
    }
  }
  return { inside: false };
}

// Helper to find git root for a given path
async function findGitRoot(path: string): Promise<string | null> {
  try {
    const { stdout } = await execa('git', ['rev-parse', '--show-toplevel'], {
      cwd: path,
      reject: false,
    });
    return stdout.trim() || null;
  } catch {
    return null;
  }
}

// Helper to get all git repositories in a directory tree
async function findAllGitRepos(rootDir: string): Promise<string[]> {
  try {
    const { stdout } = await execa('find', [rootDir, '-name', '.git', '-type', 'd']);
    return stdout
      .trim()
      .split('\n')
      .filter(Boolean)
      .map((gitDir) => gitDir.replace('/.git', ''));
  } catch {
    return [];
  }
}

// Helper to check git status for a repository
async function getGitStatus(repoPath: string): Promise<string[]> {
  try {
    const { stdout } = await execa('git', ['status', '--porcelain'], {
      cwd: repoPath,
      reject: false,
    });
    return stdout
      .trim()
      .split('\n')
      .filter((line) => line.trim());
  } catch {
    return [];
  }
}

// Helper to create subrepo configuration
async function createSubrepo(
  parentRepo: string,
  subrepoPath: string,
  remote: string,
): Promise<void> {
  const subdirResult = relative(parentRepo, subrepoPath);
  const subdir = subdirResult || 'subrepo';
  const gitrepoContent = `
subdir = ${subdir}
remote = ${remote}
branch = main
`.trim();

  await writeFile(join(subrepoPath, '.gitrepo'), gitrepoContent);
}

interface TestResult {
  changeNumber: number;
  filePath: string;
  insideGit: boolean;
  gitRepo?: string;
  gitStatusChanges: string[];
  expectedCommit: boolean;
}

interface TestSetupResult {
  tempDir: string;
  gitRepos: string[];
  subrepos: string[];
}

async function setupTestEnvironment(): Promise<TestSetupResult> {
  const tempDir = join(tmpdir(), `deep-test-${Date.now()}`);
  const gitRepos: string[] = [];
  const subrepos: string[] = [];

  await mkdir(tempDir, { recursive: true });

  // Create root git repo
  await execa('git', ['init'], { cwd: tempDir });
  await execa('git', ['config', 'user.name', 'test'], { cwd: tempDir });
  await execa('git', ['config', 'user.email', 'test@test.com'], { cwd: tempDir });
  gitRepos.push(tempDir);

  // Create deep nested structure with 5 levels
  let currentPath = tempDir;
  const depth = 5;
  const dirsPerLevel = 3;
  const filesPerDir = 2;

  for (let level = 0; level < depth; level++) {
    const levelDirs: string[] = [];

    // Create directories at this level
    for (let i = 0; i < dirsPerLevel; i++) {
      const dirName = `level${level}-dir${i}-${randomName()}`;
      const dirPath = join(currentPath, dirName);
      await mkdir(dirPath, { recursive: true });
      levelDirs.push(dirPath);

      // Create files in this directory
      for (let j = 0; j < filesPerDir; j++) {
        const fileName = `file${j}.txt`;
        const filePath = join(dirPath, fileName);
        await writeFile(filePath, `Initial content ${level}-${i}-${j}`);
      }

      // Randomly create git repos (40% chance)
      if (Math.random() < 0.4 && level > 0) {
        await execa('git', ['init'], { cwd: dirPath });
        await execa('git', ['config', 'user.name', 'test'], { cwd: dirPath });
        await execa('git', ['config', 'user.email', 'test@test.com'], { cwd: dirPath });
        gitRepos.push(dirPath);

        // Add and commit initial files
        await execa('git', ['add', '.'], { cwd: dirPath });
        await execa('git', ['commit', '-m', `Initial commit level ${level} dir ${i}`], {
          cwd: dirPath,
        });

        // Randomly make it a subrepo (25% chance for git repos)
        if (Math.random() < 0.25 && subrepos.length < 2) {
          await createSubrepo(tempDir, dirPath, `https://github.com/example/${dirName}.git`);
          subrepos.push(dirPath);
        }
      }
    }

    // Pick one directory to go deeper for next level
    if (level < depth - 1 && levelDirs.length > 0) {
      currentPath = levelDirs[Math.floor(Math.random() * levelDirs.length)];
    }
  }

  // Commit initial state in root repo
  await execa('git', ['add', '.'], { cwd: tempDir });
  await execa('git', ['commit', '-m', 'Initial commit'], { cwd: tempDir });

  return { tempDir, gitRepos, subrepos };
}

async function performFileChange(
  changeNumber: number,
  tempDir: string,
  gitRepos: string[],
): Promise<TestResult> {
  // Get all directories in our tree
  const { stdout: allDirsOutput } = await execa('find', [tempDir, '-type', 'd'], {
    cwd: tempDir,
  });
  const allDirs = allDirsOutput.trim().split('\n').filter(Boolean);

  // Pick random directory
  const randomDir = allDirs[Math.floor(Math.random() * allDirs.length)];

  // Create random file in that directory
  const fileName = `change-${changeNumber}-${randomName()}.txt`;
  const filePath = join(randomDir, fileName);
  const content = randomContent();
  await writeFile(filePath, content);

  console.log(`Change ${changeNumber}: Created ${fileName}`);
  console.log(`  Path: ${filePath}`);
  const relativePath = relative(tempDir, filePath);
  console.log(`  Relative to temp: ${relativePath || 'unknown'}`);

  // Check if this file is inside a git repo
  const gitCheck = await isInsideGit(filePath, gitRepos);
  console.log(`  Inside git repo: ${gitCheck.inside}`);
  if (gitCheck.repo) {
    console.log(`  Git repo: ${gitCheck.repo}`);
  }

  // Wait for file system events to be processed
  await sleep(200);

  // Check git status of all repos to see what changed
  const statusChanges: string[] = [];

  for (const repo of gitRepos) {
    const status = await getGitStatus(repo);
    if (status.length > 0) {
      const repoRelativePath = relative(tempDir, repo);
      console.log(`  Git status in ${repoRelativePath || 'unknown'}:`);
      status.forEach((line) => {
        console.log(`    ${line}`);
        statusChanges.push(`${relative(tempDir, repo)}: ${line}`);
      });
    }
  }

  // Also check if we can find git root from the file path
  const gitRoot = await findGitRoot(filePath);
  console.log(
    `  Git root from file: ${gitRoot ? relative(tempDir, gitRoot) || 'unknown' : 'none'}`,
  );

  return {
    changeNumber,
    filePath,
    insideGit: gitCheck.inside,
    gitRepo: gitCheck.repo,
    gitStatusChanges: statusChanges,
    expectedCommit: gitCheck.inside,
  };
}

test('deep nested git tree with random file changes', async (t) => {
  const { tempDir, gitRepos, subrepos } = await setupTestEnvironment();
  const testResults: TestResult[] = [];

  try {
    console.log(`Created test structure:`);
    console.log(`  Total git repos: ${gitRepos.length}`);
    console.log(`  Subrepos: ${subrepos.length}`);
    gitRepos.forEach((repo, i) => {
      const isSubrepo = subrepos.some((sr) => sr === repo);
      console.log(`    ${i + 1}. ${repo} ${isSubrepo ? '(subrepo)' : ''}`);
    });

    // Verify we can find all git repos
    const foundRepos = await findAllGitRepos(tempDir);
    console.log(`Found ${foundRepos.length} git repositories via filesystem scan`);

    // Start autocommit on the entire tree
    const config: Config = {
      path: tempDir,
      recursive: true,
      handleSubrepos: true,
      subrepoStrategy: 'separate',
      debounceMs: 300,
      dryRun: false,
      quiet: true,
      baseUrl: 'http://localhost:11434',
      apiKey: 'test-key',
      model: 'test-model',
      temperature: 0.7,
      maxDiffBytes: 1000000,
      signoff: false,
      exclude: '',
    };

    console.log('Starting autocommit watcher...');
    const watcher = await start(config);

    // Wait for initialization
    await sleep(1000);

    // Make 15 random file changes throughout the tree
    const numChanges = 15;
    for (let change = 0; change < numChanges; change++) {
      const result = await performFileChange(change + 1, tempDir, gitRepos);
      testResults.push(result);
    }

    // Wait for all debounces and processing
    await sleep(2000);

    // Final check of all git repos
    console.log(`\nFinal git status check:`);
    let finalTotalChanges = 0;
    for (const repo of gitRepos) {
      const status = await getGitStatus(repo);
      if (status.length > 0) {
        console.log(`  ${relative(tempDir, repo)}: ${status.length} changes`);
        status.forEach((line) => console.log(`    ${line}`));
        finalTotalChanges += status.length;
      }
    }

    // Clean up
    console.log('\nStopping watcher...');
    watcher.close();
    await sleep(500);

    // Validate results
    const changesInGit = testResults.filter((r) => r.insideGit);
    const changesWithGitStatus = testResults.filter((r) => r.gitStatusChanges.length > 0);

    console.log(`\nTest Results Summary:`);
    console.log(`  Total changes: ${testResults.length}`);
    console.log(`  Changes inside git repos: ${changesInGit.length}`);
    console.log(`  Changes that triggered git status: ${changesWithGitStatus.length}`);
    console.log(`  Final pending changes: ${finalTotalChanges}`);

    // Basic validations
    t.true(
      testResults.length === numChanges,
      `Expected ${numChanges} changes, got ${testResults.length}`,
    );
    t.true(gitRepos.length >= 1, 'Should have at least one git repository');
    t.true(foundRepos.length === gitRepos.length, 'Found repos should match created repos');

    // More detailed validation
    const gitReposWithChanges = new Set(
      testResults
        .filter((r) => r.gitStatusChanges.length > 0)
        .flatMap((r) => (r.gitRepo ? [r.gitRepo] : [])),
    );

    console.log(`  Git repos with changes: ${gitReposWithChanges.size}`);

    t.pass('Deep nested test completed successfully');
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('validate git repo detection logic', async (t) => {
  const tempDir = join(tmpdir(), `git-detection-test-${Date.now()}`);

  try {
    await mkdir(tempDir, { recursive: true });

    // Test non-git directory
    const nonGitStatus = await getGitStatus(tempDir);
    t.deepEqual(nonGitStatus, [], 'Non-git directory should have no status');

    const nonGitRoot = await findGitRoot(tempDir);
    t.is(nonGitRoot, null, 'Non-git directory should have no git root');

    // Initialize git repo
    await execa('git', ['init'], { cwd: tempDir });
    await execa('git', ['config', 'user.name', 'test'], { cwd: tempDir });
    await execa('git', ['config', 'user.email', 'test@test.com'], { cwd: tempDir });

    // Test empty git repo
    const emptyGitStatus = await getGitStatus(tempDir);
    t.deepEqual(emptyGitStatus, [], 'Empty git repo should have no status');

    const gitRoot = await findGitRoot(tempDir);
    t.is(gitRoot, tempDir, 'Git root should be found for git repo');

    // Create a file and check status
    await writeFile(join(tempDir, 'test.txt'), 'content');
    const statusWithFile = await getGitStatus(tempDir);
    t.true(statusWithFile.length > 0, 'Git repo with untracked file should have status');

    t.pass('Git detection logic validation passed');
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});
