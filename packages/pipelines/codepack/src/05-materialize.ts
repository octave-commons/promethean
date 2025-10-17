// src/05-materialize.ts
import { promises as fs } from "fs";
import * as path from "path";
import { openLevelCache } from "@promethean/level-cache";
import { parseArgs, ensureDir } from "./utils.js";
import type { CodeBlock, NamedGroup } from "./types.js";

const args = parseArgs({
  "--blocks": ".cache/codepack/blocks",
  "--names": ".cache/codepack/names",
  "--out": "out/code_groups",
  "--dry-run": "false",
});

function safeJoin(...parts: string[]) {
  const p = path.join(...parts).replace(/\\/g, "/");
  if (p.includes("..")) throw new Error("refusing to write paths with ..");
  return p;
}

async function exists(p: string) {
  try {
    await fs.stat(p);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const blocksPath = path.resolve(args["--blocks"] ?? ".cache/codepack/blocks");
  const namesPath = path.resolve(args["--names"] ?? ".cache/codepack/names");
  const outRoot = path.resolve(args["--out"] ?? "out/code_groups");
  const dry = (args["--dry-run"] ?? "false") === "true";

  const blockCache = await openLevelCache<CodeBlock>({
    path: blocksPath,
    namespace: "blocks",
  });
  const byId = new Map<string, CodeBlock>();
  for await (const [id, b] of blockCache.entries()) {
    byId.set(id, b);
  }
  await blockCache.close();

  const nameCache = await openLevelCache<NamedGroup>({
    path: namesPath,
    namespace: "names",
  });
  const groups: NamedGroup[] = [];
  for await (const [, g] of nameCache.entries()) groups.push(g);
  await nameCache.close();

  for (const group of groups) {
    const dirAbs = safeJoin(outRoot, group.dir);
    if (!dry) await ensureDir(dirAbs);

    // write README
    const readmeAbs = path.join(dirAbs, "README.md");
    if (!dry) await fs.writeFile(readmeAbs, group.readme, "utf-8");

    // write files
    const perFile = group.files.reduce<Record<string, string[]>>((acc, f) => {
      (acc[f.filename] ||= []).push(f.id);
      return acc;
    }, {});

    for (const [filename, ids] of Object.entries(perFile)) {
      const target = path.join(dirAbs, filename);

      // if multiple ids to same filename, concatenate with clear separators
      const parts = ids
        .map((id) => {
          const b = byId.get(id);
          if (!b) return undefined;
          const header = [
            `/* source: ${b.relPath}:${b.startLine}-${b.endLine} */`,
            b.hintedName ? `/* hinted: ${b.hintedName} */` : "",
          ]
            .filter(Boolean)
            .join("\n");
          return `${header}\n${b.code.trim()}\n`;
        })
        .filter((p): p is string => Boolean(p));
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

      if (dry)
        console.log(`[dry] write ${path.relative(process.cwd(), outPath)}`);
      else await fs.writeFile(outPath, content, "utf-8");
    }
  }

  console.log(`materialized -> ${path.relative(process.cwd(), outRoot)}`);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
