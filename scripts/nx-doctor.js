#!/usr/bin/env node
import { promises as fs } from "node:fs";
import path from "node:path";

const REPO = process.cwd();
const ROOTS = ["shared/ts"]; // add more roots if needed
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

async function* walkDirs(root, depth = 2) {
  // depth 0 = root only, 1 = children, etc.
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
    for await (const cand of walkDirs(abs, 1)) {
      // immediate children by default
      const pkgJson = path.join(cand, "package.json");
      const srcDir = path.join(cand, SRC_DIR_NAME);
      if (await exists(pkgJson)) {
        const pj = JSON.parse(await fs.readFile(pkgJson, "utf8"));
        pkgs.push({
          dir: cand,
          name: pj.name ?? path.basename(cand),
          hasSrc: await exists(srcDir),
          src: srcDir,
        });
      }
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
    for await (const f of walkFiles(p.src)) {
      const code = await fs.readFile(f, "utf8");
      const imps = parseImports(code).slice(0, 5);
      samples.push({ file: path.relative(REPO, f), imports: imps });
      break;
    }
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
