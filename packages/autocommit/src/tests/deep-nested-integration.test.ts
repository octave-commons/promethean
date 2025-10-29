import test from 'ava';
import { execa } from 'execa';
import { mkdir, writeFile, rm } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';

import { start } from '../../dist/index.js';
import { Config } from '../../dist/config.js';

// Helper to create random directory name
const randomName = () => randomUUID().substring(0, 8);

// Helper to create random file content
const randomContent = () => `content-${Math.random().toString(36).substring(2)}`;

// Helper to check if path is inside a git repository
async function isInsideGit(filePath: string, gitRepos: string[]): Promise<boolean> {
  for (const repo of gitRepos) {
    if (filePath.startsWith(repo)) {
      return true;
    }
  }
  return false;
}

test('deep nested git tree with random file changes', async (t) => {
  const tempDir = join(tmpdir(), `deep-test-${Date.now()}`);
  const gitRepos: string[] = [];

  try {
    // Create deep nested structure
    let currentDir = tempDir;
    const depth = 5;

    for (let level = 0; level < depth; level++) {
      // Create 5 directories at each level
      for (let i = 0; i < 5; i++) {
        const dirName = `${randomName()}-${level}-${i}`;
        const dirPath = join(currentDir, dirName);
        await mkdir(dirPath, { recursive: true });

        // Randomly decide if this should be a git repo
        if (Math.random() < 0.3) {
          // 30% chance
          await execa('git', ['init'], { cwd: dirPath });
          await execa('git', ['config', 'user.name', 'test'], { cwd: dirPath });
          await execa('git', ['config', 'user.email', 'test@test.com'], { cwd: dirPath });
          gitRepos.push(dirPath);

          // Create 5 random files in this git repo
          for (let j = 0; j < 5; j++) {
            const fileName = `file-${j}.txt`;
            await writeFile(join(dirPath, fileName), randomContent());
          }

          // Add and commit initial files
          await execa('git', ['add', '.'], { cwd: dirPath });
          await execa('git', ['commit', '-m', `Initial commit level ${level} dir ${i}`], {
            cwd: dirPath,
          });

          // Randomly make it a subrepo (20% chance for git repos)
          if (Math.random() < 0.2) {
            await writeFile(
              join(dirPath, '.gitrepo'),
              `
subdir = ${dirName}
remote = https://github.com/example/${dirName}.git
branch = main
            `.trim(),
            );
          }
        } else {
          // Just create regular files
          for (let j = 0; j < 3; j++) {
            const fileName = `non-git-file-${j}.txt`;
            await writeFile(join(dirPath, fileName), randomContent());
          }
        }
      }

      // Pick one directory to go deeper
      const subdirs = await execa('find', [currentDir, '-maxdepth', '1', '-type', 'd'], {
        cwd: tempDir,
      });
      const subdirList = subdirs.stdout.trim().split('\n').filter(Boolean);
      if (subdirList.length > 0) {
        currentDir = subdirList[Math.floor(Math.random() * subdirList.length)];
      }
    }

    console.log(`Created ${gitRepos.length} git repositories:`);
    gitRepos.forEach((repo, i) => console.log(`  ${i + 1}. ${repo}`));

    // Start autocommit on the entire tree
    const config: Config = {
      path: tempDir,
      recursive: true,
      handleSubrepos: true,
      subrepoStrategy: 'separate',
      debounceMs: 200,
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

    const watcher = await start(config);

    // Wait for initialization
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Make 10 random file changes throughout the tree
    for (let change = 0; change < 10; change++) {
      // Pick random directory from our created structure
      const allDirs = await execa('find', [tempDir, '-type', 'd'], { cwd: tempDir });
      const dirList = allDirs.stdout.trim().split('\n').filter(Boolean);
      const randomDir = dirList[Math.floor(Math.random() * dirList.length)];

      // Create random file in that directory
      const fileName = `change-${change}-${randomName()}.txt`;
      const filePath = join(randomDir, fileName);
      await writeFile(filePath, randomContent());

      console.log(`Change ${change + 1}: Created ${fileName} in ${randomDir}`);

      // Check if this file is inside a git repo
      const insideGit = await isInsideGit(filePath, gitRepos);
      console.log(`  File inside git repo: ${insideGit}`);

      // Wait a bit for file system events
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Check git status of each repo to see what changed
      for (const repo of gitRepos) {
        try {
          const { stdout } = await execa('git', ['status', '--porcelain'], {
            cwd: repo,
            reject: false,
          });
          if (stdout.trim()) {
            console.log(`  Git status in ${repo}:`);
            console.log(`    ${stdout.trim().split('\n').join('\n    ')}`);
          }
        } catch {
          // Ignore git errors
        }
      }
    }

    // Wait for all debounces and processing
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Clean up
    watcher.close();

    t.pass('Deep nested test completed without crashes');
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});
