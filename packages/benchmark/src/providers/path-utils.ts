import { existsSync } from 'fs';
import { join, dirname } from 'path';

/**
 * Local path resolution utilities for BuildFix benchmark providers
 * Duplicated from buildfix package to avoid cross-package imports
 */

export function findRepositoryRoot(startDir: string = process.cwd()): string {
  let current = startDir;

  while (current !== '/' && current !== dirname(current)) {
    if (existsSync(join(current, 'pnpm-workspace.yaml'))) {
      return current;
    }
    current = dirname(current);
  }

  // Fallback to start directory if no marker found
  return startDir;
}

export function getBuildFixDirectories(startDir?: string) {
  const repoRoot = findRepositoryRoot(startDir);

  return {
    repositoryRoot: repoRoot,
    buildFixPath: join(repoRoot, 'packages', 'buildfix'),
    tempDir: join(repoRoot, '.benchmark-temp'),
    cacheDir: join(repoRoot, '.benchmark-cache'),
    metricsDir: join(repoRoot, '.benchmark-metrics'),
    plansDir: join(repoRoot, 'packages', 'buildfix', 'plans'),
  };
}
