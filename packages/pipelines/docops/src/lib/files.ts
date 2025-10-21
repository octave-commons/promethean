import * as path from "node:path";
import { promises as fs } from "node:fs";

export type FileTreeOptions = {
  maxDepth: number;
  maxEntries: number;
  includeMeta: boolean;
  exts: string[]; // lowercase extensions like .md
};

const DEFAULT_SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  ".obsidian",
  ".cache",
  "dist",
  "build",
  "coverage",
]);

async function readFrontmatterLength(fp: string): Promise<number> {
  try {
    const st = await fs.stat(fp);
    if (st.size <= 0) return 0;
    const fd = await (fs as any).open(fp, "r");
    try {
      const headLen = Math.min(256 * 1024, st.size);
      const buf = Buffer.allocUnsafe(headLen);
      await fd.read(buf, 0, headLen, 0);
      const head = buf.toString("utf8");
      if (!head.startsWith("---")) return 0;
      const m = head.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/);
      return m ? m[0].length : 0;
    } finally {
      await fd.close();
    }
  } catch {
    return 0;
  }
}

export async function buildFileTree(
  dir: string,
  opts: FileTreeOptions,
): Promise<any[]> {
  const exts = new Set(opts.exts);
  async function tree(p: string, depth: number): Promise<any[]> {
    if (depth < 0) return [];
    const ents = await fs.readdir(p, { withFileTypes: true });
    const dirs = ents.filter(
      (e) => e.isDirectory() && !DEFAULT_SKIP_DIRS.has(e.name),
    );
    const files = ents.filter((e) => e.isFile());
    const limited = dirs.concat(files).slice(0, opts.maxEntries);
    const out: any[] = [];
    for (const e of limited) {
      if (e.name.startsWith(".#")) continue;
      const fp = path.join(p, e.name);
      if (e.isDirectory()) {
        const children = await tree(fp, depth - 1);
        out.push({ name: e.name, type: "dir", children });
      } else {
        const ok = exts.has(path.extname(e.name).toLowerCase());
        if (!ok) continue;
        if (!opts.includeMeta) {
          out.push({ name: e.name, type: "file", path: fp });
        } else {
          try {
            const st = await fs.stat(fp);
            const fmLen = await readFrontmatterLength(fp);
            out.push({
              name: e.name,
              type: "file",
              path: fp,
              size: st.size,
              fmLen,
            });
          } catch {
            out.push({ name: e.name, type: "file", path: fp });
          }
        }
      }
    }
    return out;
  }
  return await tree(dir, opts.maxDepth);
}
