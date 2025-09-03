import { promises as fs } from "fs";
import * as path from "path";
import matter from "gray-matter";
import { parseArgs, slugify, extnamePrefer } from "./utils.js";
import type { Front } from "./types.js";

const args = parseArgs({ "--dir": "docs/unique", "--dry-run": "false" });
const ROOT = path.resolve(args["--dir"]);
const DRY = args["--dry-run"] === "true";

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

async function main() {
  const files = await listAllMarkdown(ROOT);
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
main().catch((e) => { console.error(e); process.exit(1); });
