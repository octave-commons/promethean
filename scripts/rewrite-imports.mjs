#!/usr/bin/env node
import { promises as fs } from "node:fs";
import path from "node:path";

const WRITE = process.argv.includes("--write");
const REPO = process.cwd();
const PKG_ROOTS = ["shared/ts"];
const SRC_DIR_NAME = "src";
const exts = [".ts", ".tsx", ".mts", ".cts", ".js", ".mjs", ".cjs"];

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

async function* walkDirs(root, depth = 2) {
  if (depth < 0) return;
  const entries = await fs
    .readdir(root, { withFileTypes: true })
    .catch(() => []);
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const p = path.join(root, e.name);
    yield p;
    yield* walkDirs(p, depth - 1);
  }
}

async function* walkFiles(dir) {
  const entries = await fs
    .readdir(dir, { withFileTypes: true })
    .catch(() => []);
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      yield* walkFiles(p);
    } else if (exts.some((x) => p.endsWith(x))) {
      yield p;
    }
  }
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
    for await (const d of walkDirs(abs, 1)) {
      const pj = path.join(d, "package.json");
      if (!(await exists(pj))) continue;
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
    for await (const f of await walkFiles(pkg.src)) {
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
