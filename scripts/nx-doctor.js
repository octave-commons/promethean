#!/usr/bin/env node
import { promises as fs } from "node:fs";
import path from "node:path";
import { listFilesRec } from "@promethean/utils";

const REPO = process.cwd();
const ROOTS = ["shared/ts"]; // add more roots if needed
const SRC_DIR_NAME = "src";
const exts = [".ts", ".tsx", ".mts", ".cts", ".js", ".mjs", ".cjs"];
const EXT_SET = new Set(exts);

async function exists(p) {
  try {
    await fs.stat(p);
    return true;
  } catch {
    return false;
  }
}

function parseImports(code) {
  const out = [];
  const re =
    /\b(?:import|export)\b[^'"]*from\s*['"]([^'"]+)['"]|^\s*import\s*['"]([^'"]+)['"]/gm;
  let m;
  while ((m = re.exec(code))) out.push(m[1] ?? m[2]);
  return out;
}

async function main() {
  const pkgs = [];
  for (const root of ROOTS) {
    const abs = path.join(REPO, root);
    if (!(await exists(abs))) continue;
    const files = await listFilesRec(abs, new Set([".json"]));
    for (const pj of files) {
      if (path.basename(pj) !== "package.json") continue;
      const cand = path.dirname(pj);
      const srcDir = path.join(cand, SRC_DIR_NAME);
      const pjData = JSON.parse(await fs.readFile(pj, "utf8"));
      pkgs.push({
        dir: cand,
        name: pjData.name ?? path.basename(cand),
        hasSrc: await exists(srcDir),
        src: srcDir,
      });
    }
  }

  console.log(`Found ${pkgs.length} packages:`);
  for (const p of pkgs) {
    console.log(
      `- ${path.relative(REPO, p.dir)}  name=${p.name}  src=${
        p.hasSrc ? path.relative(REPO, p.src) : "MISSING"
      }`,
    );
  }

  // Sample a few files to see import styles
  const samples = [];
  for (const p of pkgs.slice(0, 5)) {
    if (!p.hasSrc) continue;
    const files = await listFilesRec(p.src, EXT_SET);
    if (!files.length) continue;
    const f = files[0];
    const code = await fs.readFile(f, "utf8");
    const imps = parseImports(code).slice(0, 5);
    samples.push({ file: path.relative(REPO, f), imports: imps });
  }

  console.log("\nSample imports:");
  for (const s of samples) {
    console.log(`• ${s.file}`);
    for (const i of s.imports) console.log(`   - ${i}`);
  }

  // Root tsconfig + workspace
  const rootTs = path.join(REPO, "tsconfig.json");
  if (await exists(rootTs)) {
    const ts = JSON.parse(await fs.readFile(rootTs, "utf8"));
    const refs = (ts.references || []).map((r) => r.path);
    console.log(`\nRoot tsconfig references: ${refs.length}`);
    for (const r of refs) console.log(`   - ${r}`);
  } else {
    console.log("\nNo root tsconfig.json");
  }

  const ws = path.join(REPO, "pnpm-workspace.yaml");
  console.log(
    (await exists(ws))
      ? "\nFound pnpm-workspace.yaml"
      : "\nNo pnpm-workspace.yaml",
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
