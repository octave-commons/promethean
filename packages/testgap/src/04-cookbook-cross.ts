import * as path from "path";
import { promises as fs } from "fs";

import { globby } from "globby";
import { parseArgs } from "@promethean-os/utils";

import { writeJSON } from "./utils.js";

const args = parseArgs({
  "--recipes": "docs/cookbook/**/*.md",
  "--out": ".cache/testgap/cookbook.json",
});

function extractImports(code: string): string[] {
  const imps: string[] = [];
  const re1 = /from\s+['"]([^'"]+)['"]/g;
  const re2 = /require\(\s*['"]([^'"]+)['"]\s*\)/g;
  let m: RegExpExecArray | null;
  while ((m = re1.exec(code))) {
    const s = m?.[1];
    if (s != null) imps.push(s);
  }
  while ((m = re2.exec(code))) {
    const s = m?.[1];
    if (s != null) imps.push(s);
  }
  return Array.from(new Set(imps));
}

async function main() {
  const files = await globby([args["--recipes"] ?? "docs/cookbook/**/*.md"]);
  const hits = [];

  for (const f of files) {
    const raw = await fs.readFile(f, "utf-8");
    const m = raw.match(/```(\w+)?[^\n]*\n([\s\S]*?)```/);
    if (!m) continue;
    const code = m[2] ?? "";
    const imported = extractImports(code).filter((s) => s.startsWith("@"));
    const pkg = imported.find((s) => s.includes("/")) || imported[0] || "";
    hits.push({ recipe: f, pkg, imported });
  }

  const outPath = path.resolve(args["--out"] ?? ".cache/testgap/cookbook.json");
  await writeJSON(outPath, {
    analyzedAt: new Date().toISOString(),
    hits,
  });
  console.log(
    `testgap: cookbook cross → ${
      args["--out"] ?? ".cache/testgap/cookbook.json"
    } (${hits.length} recipes)`,
  );
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
