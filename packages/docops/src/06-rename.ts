import { promises as fs } from "fs";
import * as path from "path";
import { pathToFileURL } from "node:url";

import matter from "gray-matter";
import { listFilesRec } from "@promethean/utils";
import { fileExists } from "@promethean/utils/fs.js";

import { parseArgs, slugify, extnamePrefer } from "./utils.js";
import type { Front } from "./types.js";
// CLI

export type RenameOptions = { dir: string; dryRun?: boolean; files?: string[] };

const uniqueTarget = async (
  dir: string,
  base: string,
  ext: string,
  i = 0,
): Promise<string> => {
  const candidate = path.join(dir, `${base}${i ? `-${i}` : ""}${ext}`);
  return (await fileExists(candidate))
    ? uniqueTarget(dir, base, ext, i + 1)
    : candidate;
};

export async function runRename(opts: RenameOptions): Promise<void> {
  const root = path.resolve(opts.dir);
  const dry = Boolean(opts.dryRun);
  const files = await listFilesRec(root, new Set([".md", ".mdx", ".txt"]));
  const wanted = opts.files?.length
    ? new Set(opts.files.map((p) => path.resolve(p)))
    : null;
  const targets = wanted
    ? files.filter((f: string) => wanted.has(path.resolve(f)))
    : files;
  await Promise.all(
    targets.map(async (f: string) => {
      const raw = await fs.readFile(f, "utf-8");
      const fm = (matter(raw).data || {}) as Front;
      if (!fm.filename) return;

      const dir = path.dirname(f);
      const base = slugify(fm.filename);
      const ext = extnamePrefer(f);
      const target = await uniqueTarget(dir, base, ext);
      if (path.basename(f) === path.basename(target)) return;
      if (dry) console.log(`Would rename: ${f} -> ${target}`);
      else await fs.rename(f, target);
    }),
  );
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
