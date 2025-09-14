import { promises as fs } from "fs";
import * as path from "path";

const IGNORE_DIRS = new Set([
  "node_modules",
  "dist",
  "build",
  "coverage",
  ".turbo",
  ".next",
]);

/**
 * Recursively list files under `root` matching extensions in `exts`.
 * Hidden files/directories and common build outputs are skipped.
 */
export async function listFilesRec(
  root: string,
  exts: Set<string>,
): Promise<string[]> {
  const out: string[] = [];
  async function walk(dir: string) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      if (e.name.startsWith(".")) continue; // skip hidden
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (IGNORE_DIRS.has(e.name)) continue;
        await walk(full);
      } else {
        if (e.name.startsWith(".#")) continue; // emacs lockfiles
        const ext = path.extname(e.name).toLowerCase();
        if (exts.size === 0 || exts.has(ext)) out.push(full);
      }
    }
  }
  await walk(root);
  return out;
}
