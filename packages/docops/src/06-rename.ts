import { promises as fs } from "fs";
import * as path from "path";
import { pathToFileURL } from "node:url";

import matter from "gray-matter";
import { scanFiles } from "@promethean/file-indexer";
import type { IndexedFile } from "@promethean/file-indexer";

import { parseArgs, slugify, extnamePrefer } from "./utils.js";
import type { Front } from "./types.js";
// CLI

export type RenameOptions = { dir: string; dryRun?: boolean; files?: string[] };
let ROOT = path.resolve("docs/unique");
let DRY = false;

async function exists(p: string) {
  try {
    await fs.stat(p);
    return true;
  } catch {
    return false;
  }
}

export async function runRename(opts: RenameOptions) {
  ROOT = path.resolve(opts.dir);
  DRY = Boolean(opts.dryRun);
  const exts = new Set([".md", ".mdx", ".txt"]);
  const wanted =
    opts.files && opts.files.length
      ? new Set(opts.files.map((p) => path.resolve(p)))
      : null;
  await scanFiles({
    root: ROOT,
    exts,
    readContent: true,
    onFile: async (file: IndexedFile) => {
      const abs = path.isAbsolute(file.path)
        ? path.resolve(file.path)
        : path.resolve(ROOT, file.path);
      if (wanted && !wanted.has(abs)) return;
      const raw = file.content ?? (await fs.readFile(abs, "utf-8"));
      const fm = (matter(raw).data || {}) as Front;
      if (!fm.filename) return;

      const want = slugify(fm.filename) + extnamePrefer(abs);
      const dir = path.dirname(abs);
      const currentBase = path.basename(abs);
      if (currentBase === want) return;

      let target = path.join(dir, want);
      let i = 1;
      while (await exists(target)) {
        const base = slugify(fm.filename) + (i > 1 ? `-${i}` : "");
        target = path.join(dir, base + extnamePrefer(abs));
        i++;
      }
      if (DRY) console.log(`Would rename: ${abs} -> ${target}`);
      else {
        await fs.rename(abs, target);
      }
    },
  });
  console.log("06-rename: done.");
}
const isDirect =
  !!process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;
if (isDirect) {
  const args = parseArgs({ "--dir": "docs/unique", "--dry-run": "false" });
  const dir = args["--dir"] ?? "docs/unique";
  const dryRun = (args["--dry-run"] ?? "false") === "true";
  runRename({ dir, dryRun }).catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
