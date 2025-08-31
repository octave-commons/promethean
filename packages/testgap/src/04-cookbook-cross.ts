/* eslint-disable no-console */
import globby from "globby";
import * as path from "path";
import { promises as fs } from "fs";
import { parseArgs, writeJSON } from "./utils.js";
import type { CookbookCross } from "./types.js";

const args = parseArgs({
  "--recipes": "docs/cookbook/**/*.md",
  "--out": ".cache/testgap/cookbook.json"
});

function extractImports(code: string): string[] {
  const imps: string[] = [];
  const re1 = /from\s+['"]([^'"]+)['"]/g;
  const re2 = /require\(\s*['"]([^'"]+)['"]\s*\)/g;
  let m; while ((m = re1.exec(code))) imps.push(m[1]);
  while ((m = re2.exec(code))) imps.push(m[1]);
  return Array.from(new Set(imps));
}

async function main() {
  const files = await globby([args["--recipes"]]);
  const hits = [];

  for (const f of files) {
    const raw = await fs.readFile(f, "utf-8");
    const m = raw.match(/```(\w+)?[^\n]*\n([\s\S]*?)```/);
    if (!m) continue;
    const code = m[2];
    const imported = extractImports(code).filter(s => s.startsWith("@"));
    const pkg = imported.find(s => s.includes("/")) || imported[0] || "";
    hits.push({ recipe: f, pkg, imported });
  }

  await writeJSON(path.resolve(args["--out"]), { analyzedAt: new Date().toISOString(), hits });
  console.log(`testgap: cookbook cross → ${args["--out"]} (${hits.length} recipes)`);
}
main().catch(e => { console.error(e); process.exit(1); });
