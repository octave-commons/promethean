import { tmpdir } from 'os';
import { join } from 'path';
import { mkdir, writeFile, rm } from 'fs/promises';
import test from 'ava';

import { hasSubrepo, isSubrepoDir, findSubrepos } from '../git.js';

// Helper to create unique temp directory names
const getTempDir = () => {
  const random = Math.random().toString(36).substring(2, 8);
  return join(tmpdir(), `autocommit-test-${Date.now()}-${random}`);
};

test('hasSubrepo detects .gitrepo files', async (t) => {
  const tempDir = getTempDir();
  await mkdir(tempDir, { recursive: true });

  try {
    // Create a .gitrepo file
    const gitrepoContent = `
# Git Subrepo Configuration
subdir = test-subrepo
remote = https://github.com/example/repo.git
branch = main
`;
    await writeFile(join(tempDir, '.gitrepo'), gitrepoContent.trim());

    const hasSubrepoResult = await hasSubrepo(tempDir);
    t.true(hasSubrepoResult);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('isSubrepoDir correctly identifies subrepo directories', async (t) => {
  const tempDir = getTempDir();
  await mkdir(tempDir, { recursive: true });

  try {
    // Create a .gitrepo file
    await writeFile(
      join(tempDir, '.gitrepo'),
      'subdir = test\nremote = https://github.com/example/repo.git',
    );

    const isSubrepoResult = await isSubrepoDir(tempDir);
    t.true(isSubrepoResult);

    // Test non-subrepo directory
    const tempDir2 = getTempDir();
    await mkdir(tempDir2, { recursive: true });
    await writeFile(join(tempDir2, 'regular-file.txt'), 'content');

    const isNotSubrepoResult = await isSubrepoDir(tempDir2);
    t.false(isNotSubrepoResult);

    await rm(tempDir2, { recursive: true, force: true });
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('findSubrepos finds subrepo directories', async (t) => {
  const tempDir = getTempDir();
  await mkdir(tempDir, { recursive: true });

  try {
    // Create subrepo structure
    const subrepoPath = join(tempDir, 'subrepo1');
    await mkdir(subrepoPath, { recursive: true });
    await writeFile(
      join(subrepoPath, '.gitrepo'),
      'subdir = subrepo1\nremote = https://github.com/example/repo1.git',
    );

    const subrepoPath2 = join(tempDir, 'subrepo2');
    await mkdir(subrepoPath2, { recursive: true });
    await writeFile(
      join(subrepoPath2, '.gitrepo'),
      'subdir = subrepo2\nremote = https://github.com/example/repo2.git',
    );

    // Create regular directory
    const regularPath = join(tempDir, 'regular');
    await mkdir(regularPath, { recursive: true });
    await writeFile(join(regularPath, 'file.txt'), 'content');

    const subrepos = await findSubrepos(tempDir);
    t.is(subrepos.length, 2);
    t.true(subrepos.some((path: string) => path.includes('subrepo1')));
    t.true(subrepos.some((path: string) => path.includes('subrepo2')));
    t.false(subrepos.some((path: string) => path.includes('regular')));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});
