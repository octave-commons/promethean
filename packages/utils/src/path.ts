import * as path from "path";

/**
 * Return the repository-relative path for an absolute path.
 * Always uses forward slashes as separators for cross-platform consistency.
 */
export function relFromRepo(absPath: string): string {
  const repoRoot = process.cwd();
  const abs = path.resolve(absPath);
  const rel = path.relative(repoRoot, abs);
  return rel.split(path.sep).join("/");
}
