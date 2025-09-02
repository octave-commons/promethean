#!/usr/bin/env node
import { promises as fs } from "fs";
import * as path from "path";
import matter from "gray-matter";
import { parseArgs, slugify, extnamePrefer } from "./utils";
import type { Front } from "./types";

export type RenameOptions = { dir: string; dryRun?: boolean; files?: string[] };
let ROOT = path.resolve("docs/unique");
let DRY = false;

async function listAllMarkdown(root: string): Promise<string[]> {
  const out: string[] = [];
  async function walk(dir: string) {
    const ents = await fs.readdir(dir, { withFileTypes: true });
    for (const ent of ents) {
      const p = path.join(dir, ent.name);
      if (ent.isDirectory()) await walk(p);
      else out.push(p);
    }
  }
  await walk(root);
  return out.filter((p) => /\.(md|mdx|txt)$/i.test(p));
}
async function exists(p: string) { try { await fs.stat(p); return true; } catch { return false; } }

export async function runRename(opts: RenameOptions) {
  ROOT = path.resolve(opts.dir);
  DRY = Boolean(opts.dryRun);
  let files = await listAllMarkdown(ROOT);
  if (opts.files && opts.files.length) {
    const wanted = new Set(opts.files.map(p => path.resolve(p)));
    files = files.filter(f => wanted.has(path.resolve(f)));
  }
  for (const f of files) {
    const raw = await fs.readFile(f, "utf-8");
    const fm = (matter(raw).data || {}) as Front;
    if (!fm.filename) continue;

    const want = slugify(fm.filename) + extnamePrefer(f);
    const dir = path.dirname(f);
    const currentBase = path.basename(f);
    if (currentBase === want) continue;

    let target = path.join(dir, want);
    let i = 1;
    while (await exists(target)) {
      const base = slugify(fm.filename) + (i > 1 ? `-${i}` : "");
      target = path.join(dir, base + extnamePrefer(f));
      i++;
    }
    if (DRY) console.log(`Would rename: ${f} -> ${target}`);
    else { await fs.rename(f, target); }
  }
  console.log("06-rename: done.");
}
// CLI
import { pathToFileURL } from "node:url";
const isDirect = !!process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;
if (isDirect) {
  const args = parseArgs({ "--dir": "docs/unique", "--dry-run": "false" });
  runRename({ dir: args["--dir"], dryRun: args["--dry-run"] === "true" })
    .catch((e) => { console.error(e); process.exit(1); });
}
