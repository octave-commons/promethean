import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

export function stableId(input: string): string {
  return crypto.createHash("sha1").update(input).digest("hex").slice(0, 12);
}

export function fileExists(p: string): boolean {
  try { fs.accessSync(p); return true; } catch { return false; }
}

// Detect if path is likely a git work tree (not bare).
// Accept either a .git directory OR a .git file pointing to actual gitdir (e.g., worktrees).
export function isGitWorkTree(dir: string): boolean {
  const dotGit = path.join(dir, ".git");
  try {
    const stat = fs.lstatSync(dotGit);
    if (stat.isDirectory()) return true;
    if (stat.isFile()) {
      const content = fs.readFileSync(dotGit, "utf8");
      return /gitdir\s*:\s*/i.test(content);
    }
  } catch {}
  return false;
}