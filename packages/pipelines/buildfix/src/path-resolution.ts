import { promises as fs } from 'fs';
import * as nodePath from 'path';
import { existsSync } from 'fs';

/**
 * Centralized path resolution utilities for BuildFix
 * Eliminates duplication across providers and components
 */

export type PathResolutionOptions = {
  readonly workspaceMarker?: string;
  readonly tsconfigName?: string;
};

const DEFAULT_OPTIONS: PathResolutionOptions = {
  workspaceMarker: 'pnpm-workspace.yaml',
  tsconfigName: 'tsconfig.json',
};

/**
 * Find the repository root by traversing up from the current directory
 * looking for a workspace marker file (default: pnpm-workspace.yaml)
 */
export function findRepositoryRoot(
  startDir: string = process.cwd(),
  options: PathResolutionOptions = DEFAULT_OPTIONS,
): string {
  const { workspaceMarker } = { ...DEFAULT_OPTIONS, ...options };
  let current = nodePath.resolve(startDir);

  while (current !== '/' && current !== nodePath.parse(current).root) {
    if (workspaceMarker && existsSync(nodePath.join(current, workspaceMarker))) {
      return current;
    }
    current = nodePath.dirname(current);
  }

  // Fallback to start directory if no marker found
  return nodePath.resolve(startDir);
}

/**
 * Find the nearest tsconfig.json file by traversing up from the given directory
 */
export async function findNearestTsconfig(
  startDir: string,
  options: PathResolutionOptions = DEFAULT_OPTIONS,
): Promise<string | undefined> {
  const { tsconfigName } = { ...DEFAULT_OPTIONS, ...options };
  let current = nodePath.resolve(startDir);
  const root = nodePath.parse(current).root;

  while (true) {
    const candidate = nodePath.join(current, tsconfigName!);
    if (await pathExists(candidate)) {
      return candidate;
    }
    if (current === root) {
      break;
    }
    current = nodePath.dirname(current);
  }

  return undefined;
}

/**
 * Resolve a diagnostic file path relative to a tsconfig.json file
 */
export function resolveDiagnosticFile(tsconfigPath: string, diagFile: string): string {
  return nodePath.isAbsolute(diagFile)
    ? diagFile
    : nodePath.resolve(nodePath.dirname(tsconfigPath), diagFile);
}

/**
 * Resolve a path relative to the repository root
 */
export function resolveFromRepository(relativePath: string, startDir?: string): string {
  const repoRoot = findRepositoryRoot(startDir);
  return nodePath.isAbsolute(relativePath)
    ? relativePath
    : nodePath.resolve(repoRoot, relativePath);
}

/**
 * Get the BuildFix package path relative to repository root
 */
export function getBuildFixPackagePath(startDir?: string): string {
  const repoRoot = findRepositoryRoot(startDir);
  return nodePath.join(repoRoot, 'packages', 'buildfix');
}

/**
 * Get common BuildFix directories
 */
export function getBuildFixDirectories(startDir?: string) {
  const repoRoot = findRepositoryRoot(startDir);
  const buildFixPath = getBuildFixPackagePath(startDir);

  return {
    repositoryRoot: repoRoot,
    buildFixPath,
    tempDir: nodePath.join(repoRoot, '.benchmark-temp'),
    cacheDir: nodePath.join(repoRoot, '.benchmark-cache'),
    metricsDir: nodePath.join(repoRoot, '.benchmark-metrics'),
    plansDir: nodePath.join(buildFixPath, 'plans'),
  };
}

/**
 * Check if a path exists
 */
async function pathExists(candidate: string): Promise<boolean> {
  try {
    await fs.access(candidate);
    return true;
  } catch {
    return false;
  }
}

/**
 * Resolve workspace root with fallback to INIT_CWD environment variable
 * Maintains backward compatibility with existing WORKSPACE_ROOT usage
 */
export function getWorkspaceRoot(): string {
  return nodePath.resolve(process.env.INIT_CWD ?? process.cwd());
}

/**
 * Normalize path separators to forward slashes for cross-platform consistency
 */
export function normalizePathSeparators(path: string): string {
  return path.split(nodePath.sep).join('/');
}

/**
 * Get relative path from repository root with normalized separators
 */
export function getRelativePathFromRepo(absolutePath: string, startDir?: string): string {
  const repoRoot = findRepositoryRoot(startDir);
  const relative = nodePath.relative(repoRoot, nodePath.resolve(absolutePath));
  return normalizePathSeparators(relative);
}
