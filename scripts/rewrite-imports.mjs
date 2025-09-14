#!/usr/bin/env node
import { promises as fs } from "node:fs";
import path from "node:path";
import { listFilesRec } from "@promethean/utils";

const WRITE = process.argv.includes("--write");
const REPO = process.cwd();
const PKG_ROOTS = ["shared/ts"];
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
async function readJSON(p) {
  return JSON.parse(await fs.readFile(p, "utf8"));
}

function parseMatches(code) {
  const re =
    /\b(?:import|export)\b[^'"]*from\s*['"]([^'"]+)['"]|^\s*import\s*['"]([^'"]+)['"]/gm;
  const out = [];
  let m;
  while ((m = re.exec(code))) {
    const spec = m[1] ?? m[2];
    if (spec?.startsWith("./") || spec?.startsWith("../"))
      out.push({ start: m.index, end: re.lastIndex, spec });
  }
  return out;
}

function resolveCandidates(fromFile, spec) {
  const base = path.resolve(path.dirname(fromFile), spec);
  return [
    base,
    ...exts.map((e) => base + e),
    path.join(base, "index.ts"),
    path.join(base, "index.tsx"),
  ];
}

async function collectPackages() {
  const pkgs = [];
  for (const root of PKG_ROOTS) {
    const abs = path.join(REPO, root);
    if (!(await exists(abs))) continue;
    const files = await listFilesRec(abs, new Set([".json"]));
    for (const pj of files) {
      if (path.basename(pj) !== "package.json") continue;
      const d = path.dirname(pj);
      const pkg = await readJSON(pj);
      const src = path.join(d, SRC_DIR_NAME);
      if (!(await exists(src))) continue;
      pkgs.push({ name: pkg.name, dir: d, src });
    }
  }
  return pkgs;
}

function findOwner(file, pkgs) {
  for (const p of pkgs) {
    if (file.startsWith(p.src + path.sep) || file === p.src) return p;
  }
  return null;
}

async function main() {
  const pkgs = await collectPackages();
  if (!pkgs.length) {
    console.log("No packages found.");
    return;
  }
  let total = 0;

  for (const pkg of pkgs) {
    const files = await listFilesRec(pkg.src, EXT_SET);
    for (const f of files) {
      let code = await fs.readFile(f, "utf8");
      let changed = 0;

      for (const m of parseMatches(code)) {
        for (const cand of resolveCandidates(f, m.spec)) {
          if (!(await exists(cand))) continue;
          const owner = findOwner(cand, pkgs);
          if (owner && owner.name !== pkg.name) {
            const newSpec = owner.name; // e.g. @promethean/agent
            code = code.replace(m.spec, newSpec);
            console.log(`${path.relative(REPO, f)}: ${m.spec} -> ${newSpec}`);
            changed++;
            total++;
            break;
          }
        }
      }
      if (changed && WRITE) await fs.writeFile(f, code, "utf8");
    }
  }
  console.log(
    WRITE
      ? `\nRewrote ${total} import(s).`
      : `\n(dry run) Would rewrite ${total} import(s). Use --write to apply.`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
