#!/usr/bin/env node
import { promises as fs } from "node:fs";
import path from "node:path";

const DRY = process.argv.includes("--dry");
const REPO = process.cwd();
const PKG_ROOTS = ["shared/ts"]; // add more roots if needed
const SRC_DIR_NAME = "src";
const exts = [".ts", ".tsx", ".mts", ".cts", ".js", ".mjs", ".cjs"];

const isRel = (s) => s?.startsWith("./") || s?.startsWith("../");

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
async function writeJSON(p, obj) {
  const s = JSON.stringify(obj, null, 2) + "\n";
  if (!DRY) await fs.writeFile(p, s, "utf8");
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

function parseSpecs(code) {
  const specs = [];
  const re =
    /\b(?:import|export)\b[^'"]*from\s*['"]([^'"]+)['"]|^\s*import\s*['"]([^'"]+)['"]/gm;
  let m;
  while ((m = re.exec(code))) specs.push(m[1] ?? m[2]);
  return specs;
}

function resolveRelative(fromFile, spec) {
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
      pkgs.push({
        dir: d,
        name: pkg.name ?? path.basename(d),
        short: path.basename(d), // directory name
        src,
        hasSrc: await exists(src),
      });
    }
  }
  return pkgs.filter((p) => p.hasSrc);
}

function mapByName(pkgs) {
  const byFull = new Map(); // "@promethean/agent" -> pkg
  const byShort = new Map(); // "agent" -> pkg
  for (const p of pkgs) {
    byShort.set(p.short, p);
    if (p.name) byFull.set(p.name, p);
    // also map "@scope/short" if name matches that pattern
    if (!p.name?.includes("/") && p.short) byFull.set(p.short, p);
  }
  return { byFull, byShort };
}

async function main() {
  const pkgs = await collectPackages();
  if (!pkgs.length) {
    console.log("Found 0 packages under", PKG_ROOTS.join(", "));
    process.exit(0);
  }
  const { byFull, byShort } = mapByName(pkgs);
  const deps = new Map(pkgs.map((p) => [p.name, new Set()]));

  // detect deps from imports
  for (const p of pkgs) {
    for await (const f of walkFiles(p.src)) {
      const code = await fs.readFile(f, "utf8");
      for (const s of parseSpecs(code)) {
        if (!s) continue;
        if (isRel(s)) {
          for (const cand of resolveRelative(f, s)) {
            if (await exists(cand)) {
              // which package owns this file?
              for (const other of pkgs) {
                if (
                  cand.startsWith(other.src + path.sep) &&
                  other.name !== p.name
                ) {
                  deps.get(p.name).add(other.name);
                }
              }
              break;
            }
          }
        } else {
          // scoped or bare import
          if (byFull.has(s) && s !== p.name) deps.get(p.name).add(s);
          // if spec is "@promethean/agent/foo", take first 2 segments
          const parts = s.split("/");
          if (parts.length >= 2 && parts[0].startsWith("@")) {
            const base = `${parts[0]}/${parts[1]}`;
            if (byFull.has(base) && base !== p.name) deps.get(p.name).add(base);
          } else if (byShort.has(s) && byShort.get(s).name !== p.name) {
            deps.get(p.name).add(byShort.get(s).name);
          }
        }
      }
    }
  }

  // write per-pkg tsconfig references + workspace deps
  for (const p of pkgs) {
    const list = [...deps.get(p.name)].sort();
    const tsPath = path.join(p.dir, "tsconfig.json");
    const pjPath = path.join(p.dir, "package.json");
    const ts = (await exists(tsPath))
      ? await readJSON(tsPath)
      : {
          extends: "../../config/tsconfig.base.json",
          compilerOptions: {
            rootDir: "src",
            outDir: "dist",
            composite: true,
            declaration: true,
          },
          include: ["src/**/*"],
        };
    const pj = await readJSON(pjPath);

    // compute relative reference paths using directory names
    ts.references = list.map((full) => {
      const target = byFull.get(full);
      const relPath = path.relative(p.dir, target.dir) || ".";
      return { path: relPath.startsWith(".") ? relPath : `./${relPath}` };
    });

    // ensure workspace deps
    pj.dependencies = pj.dependencies || {};
    for (const full of list)
      pj.dependencies[full] = pj.dependencies[full] || "workspace:*";

    console.log(`refs  ${p.name}: [${list.join(", ")}]`);
    if (!DRY) await writeJSON(tsPath, ts);
    if (!DRY) await writeJSON(pjPath, pj);
  }

  // root tsconfig
  const rootTsPath = path.join(REPO, "tsconfig.json");
  const root = (await exists(rootTsPath))
    ? await readJSON(rootTsPath)
    : { files: [] };
  root.references = pkgs.map((p) => ({
    path: `./${path.relative(REPO, p.dir)}`,
  }));
  console.log(`root  tsconfig.json: ${pkgs.length} references`);
  if (!DRY) await writeJSON(rootTsPath, root);

  if (DRY) console.log("(dry run) wrote nothing.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
