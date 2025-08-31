// src/05-materialize.ts
import { promises as fs } from "fs";
import * as path from "path";
import { parseArgs, ensureDir } from "./utils.js";
import type { BlockManifest, NamePlan } from "./types.js";

const args = parseArgs({
  "--blocks": ".cache/codepack/blocks.json",
  "--names": ".cache/codepack/names.json",
  "--out": "out/code_groups",
  "--dry-run": "false"
});

function safeJoin(...parts: string[]) {
  const p = path.join(...parts).replace(/\\/g,"/");
  if (p.includes("..")) throw new Error("refusing to write paths with ..");
  return p;
}

async function exists(p:string) { try { await fs.stat(p); return true; } catch { return false; } }

async function main() {
  const blocksPath = path.resolve(args["--blocks"]);
  const namesPath = path.resolve(args["--names"]);
  const outRoot = path.resolve(args["--out"]);
  const dry = args["--dry-run"] === "true";

  const { blocks }: BlockManifest = JSON.parse(await fs.readFile(blocksPath,"utf-8"));
  const plan: NamePlan = JSON.parse(await fs.readFile(namesPath,"utf-8"));

  const byId = new Map(blocks.map(b => [b.id, b]));

  for (const group of plan.groups) {
    const dirAbs = safeJoin(outRoot, group.dir);
    if (!dry) await ensureDir(dirAbs);

    // write README
    const readmeAbs = path.join(dirAbs, "README.md");
    if (!dry) await fs.writeFile(readmeAbs, group.readme, "utf-8");

    // write files
    const perFile: Record<string, string[]> = {};
    for (const f of group.files) {
      (perFile[f.filename] ||= []).push(f.id);
    }

    for (const [filename, ids] of Object.entries(perFile)) {
      const target = path.join(dirAbs, filename);

      // if multiple ids to same filename, concatenate with clear separators
      const parts: string[] = [];
      for (let i=0;i<ids.length;i++) {
        const b = byId.get(ids[i]);
        if (!b) continue;
        const header = [
          `/* source: ${b.relPath}:${b.startLine}-${b.endLine} */`,
          b.hintedName ? `/* hinted: ${b.hintedName} */` : "",
        ].filter(Boolean).join("\n");
        parts.push(`${header}\n${b.code.trim()}\n`);
      }
      const content = parts.join("\n/* --- next-part --- */\n\n");

      // avoid clobbering existing files: append -1, -2,...
      let outPath = target;
      if (await exists(outPath)) {
        const ext = path.extname(target);
        const base = path.basename(target, ext);
        const dir = path.dirname(target);
        let i = 1;
        while (await exists(path.join(dir, `${base}-${i}${ext}`))) i++;
        outPath = path.join(dir, `${base}-${i}${ext}`);
      }

      if (dry) console.log(`[dry] write ${path.relative(process.cwd(), outPath)}`);
      else await fs.writeFile(outPath, content, "utf-8");
    }
  }

  console.log(`materialized -> ${path.relative(process.cwd(), outRoot)}`);
}
main().catch(e => { console.error(e); process.exit(1); });
