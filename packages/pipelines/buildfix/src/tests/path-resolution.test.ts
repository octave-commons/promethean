import test from 'ava';
import { promises as fs } from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { tmpdir } from 'os';

import {
  findRepositoryRoot,
  findNearestTsconfig,
  resolveDiagnosticFile,
  resolveFromRepository,
  getBuildFixPackagePath,
  getBuildFixDirectories,
  getWorkspaceRoot,
  normalizePathSeparators,
  getRelativePathFromRepo,
} from '../path-resolution.js';

test.serial('findRepositoryRoot finds repo root from subdirectory', async (t) => {
  // Create a temporary repository structure
  const repoDir = path.join(tmpdir(), `buildfix-test-${randomUUID()}`);
  const subdir = path.join(repoDir, 'packages', 'buildfix', 'src');

  try {
    await fs.mkdir(subdir, { recursive: true });
    await fs.writeFile(path.join(repoDir, 'pnpm-workspace.yaml'), '');

    const foundRoot = findRepositoryRoot(subdir);
    t.is(foundRoot, path.resolve(repoDir));
  } finally {
    await fs.rm(repoDir, { recursive: true, force: true });
  }
});

test.serial('findRepositoryRoot returns start dir if no marker found', async (t) => {
  const tempDir = path.join(tmpdir(), `buildfix-test-${randomUUID()}`);

  try {
    await fs.mkdir(tempDir, { recursive: true });

    const foundRoot = findRepositoryRoot(tempDir);
    t.is(foundRoot, path.resolve(tempDir));
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

test.serial('findRepositoryRoot uses custom marker', async (t) => {
  const repoDir = path.join(tmpdir(), `buildfix-test-${randomUUID()}`);
  const subdir = path.join(repoDir, 'deep', 'nested');

  try {
    await fs.mkdir(subdir, { recursive: true });
    await fs.writeFile(path.join(repoDir, 'package.json'), '');

    const foundRoot = findRepositoryRoot(subdir, { workspaceMarker: 'package.json' });
    t.is(foundRoot, path.resolve(repoDir));
  } finally {
    await fs.rm(repoDir, { recursive: true, force: true });
  }
});

test.serial('findNearestTsconfig finds tsconfig in parent directory', async (t) => {
  const repoDir = path.join(tmpdir(), `buildfix-test-${randomUUID()}`);
  const subdir = path.join(repoDir, 'src', 'components');

  try {
    await fs.mkdir(subdir, { recursive: true });
    await fs.writeFile(
      path.join(repoDir, 'tsconfig.json'),
      JSON.stringify({ compilerOptions: { target: 'ES2020' } }),
    );

    const tsconfigPath = await findNearestTsconfig(subdir);
    t.is(tsconfigPath, path.join(repoDir, 'tsconfig.json'));
  } finally {
    await fs.rm(repoDir, { recursive: true, force: true });
  }
});

test.serial('findNearestTsconfig returns undefined if not found', async (t) => {
  const tempDir = path.join(tmpdir(), `buildfix-test-${randomUUID()}`);

  try {
    await fs.mkdir(tempDir, { recursive: true });

    const tsconfigPath = await findNearestTsconfig(tempDir);
    t.is(tsconfigPath, undefined);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

test.serial('findNearestTsconfig uses custom tsconfig name', async (t) => {
  const repoDir = path.join(tmpdir(), `buildfix-test-${randomUUID()}`);
  const subdir = path.join(repoDir, 'src');

  try {
    await fs.mkdir(subdir, { recursive: true });
    await fs.writeFile(
      path.join(repoDir, 'tsconfig.build.json'),
      JSON.stringify({ compilerOptions: { target: 'ES2020' } }),
    );

    const tsconfigPath = await findNearestTsconfig(subdir, { tsconfigName: 'tsconfig.build.json' });
    t.is(tsconfigPath, path.join(repoDir, 'tsconfig.build.json'));
  } finally {
    await fs.rm(repoDir, { recursive: true, force: true });
  }
});

test('resolveDiagnosticFile resolves relative paths', (t) => {
  const tsconfigPath = '/project/tsconfig.json';
  const diagFile = 'src/file.ts';

  const resolved = resolveDiagnosticFile(tsconfigPath, diagFile);
  t.is(resolved, '/project/src/file.ts');
});

test('resolveDiagnosticFile returns absolute paths unchanged', (t) => {
  const tsconfigPath = '/project/tsconfig.json';
  const diagFile = '/absolute/path/to/file.ts';

  const resolved = resolveDiagnosticFile(tsconfigPath, diagFile);
  t.is(resolved, '/absolute/path/to/file.ts');
});

test('resolveFromRepository resolves relative paths', (t) => {
  // We can't easily mock process.cwd(), so we'll test with absolute paths
  const testDir = '/test/repo';

  // We can't easily mock process.cwd(), so we'll test with absolute paths
  const relativePath = 'packages/buildfix';
  const absolutePath = '/some/absolute/path';

  const resolvedRelative = resolveFromRepository(relativePath, testDir);
  const resolvedAbsolute = resolveFromRepository(absolutePath, testDir);

  t.true(resolvedRelative.endsWith(relativePath));
  t.is(resolvedAbsolute, absolutePath);
});

test('getWorkspaceRoot returns resolved path', (t) => {
  const workspaceRoot = getWorkspaceRoot();
  t.is(typeof workspaceRoot, 'string');
  t.true(path.isAbsolute(workspaceRoot));
});

test('normalizePathSeparators converts to forward slashes', (t) => {
  const windowsPath = 'src\\components\\Button.tsx';
  const unixPath = 'src/components/Button.tsx';

  t.is(normalizePathSeparators(windowsPath), 'src/components/Button.tsx');
  t.is(normalizePathSeparators(unixPath), 'src/components/Button.tsx');
});

test('getRelativePathFromRepo returns relative path', (t) => {
  const absolutePath = '/repo/root/packages/buildfix/src/file.ts';
  const startDir = '/repo/root';

  const relativePath = getRelativePathFromRepo(absolutePath, startDir);
  t.is(relativePath, 'packages/buildfix/src/file.ts');
});

test('getBuildFixDirectories returns all expected directories', (t) => {
  const dirs = getBuildFixDirectories();

  t.is(typeof dirs.repositoryRoot, 'string');
  t.is(typeof dirs.buildFixPath, 'string');
  t.is(typeof dirs.tempDir, 'string');
  t.is(typeof dirs.cacheDir, 'string');
  t.is(typeof dirs.metricsDir, 'string');
  t.is(typeof dirs.plansDir, 'string');

  // Verify the paths are constructed correctly
  t.true(dirs.buildFixPath.endsWith('packages/buildfix'));
  t.true(dirs.tempDir.endsWith('.benchmark-temp'));
  t.true(dirs.cacheDir.endsWith('.benchmark-cache'));
  t.true(dirs.metricsDir.endsWith('.benchmark-metrics'));
  t.true(dirs.plansDir.endsWith('plans'));
});

test('getBuildFixPackagePath returns correct path', (t) => {
  const buildFixPath = getBuildFixPackagePath();

  t.is(typeof buildFixPath, 'string');
  t.true(buildFixPath.endsWith('packages/buildfix'));
  t.true(path.isAbsolute(buildFixPath));
});

test('path resolution functions handle edge cases', (t) => {
  // Test empty paths
  t.is(normalizePathSeparators(''), '');

  // Test root paths
  t.is(normalizePathSeparators('/'), '/');

  // Test paths with multiple separators
  t.is(normalizePathSeparators('path//with///multiple'), 'path/with/multiple');
});

test('resolveDiagnosticFile handles edge cases', (t) => {
  const tsconfigPath = '/project/tsconfig.json';

  // Test empty relative path
  t.is(resolveDiagnosticFile(tsconfigPath, ''), '/project');

  // Test current directory
  t.is(resolveDiagnosticFile(tsconfigPath, '.'), '/project');

  // Test parent directory
  t.is(resolveDiagnosticFile(tsconfigPath, '..'), path.dirname(path.dirname(tsconfigPath)));
});
