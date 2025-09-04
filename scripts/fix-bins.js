#!/usr/bin/env node
/**
 * Walk all workspace packages, read their package.json, find "bin" entries,
 * and chmod +x each target. Cross-platform (no shx), minimal deps.
 */
const { promises: fs } = require("fs");
const path = require("path");

async function readJSON(p) {
  return JSON.parse(await fs.readFile(p, "utf8"));
}

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function chmodX(p) {
  const stat = await fs.stat(p);
  const mode = stat.mode | 0o755; // ensure exec bits
  if (stat.mode !== mode) {
    await fs.chmod(p, mode);
    console.log(`chmod +x ${p}`);
  }
}

async function fixPackage(pkgDir) {
  const pkgPath = path.join(pkgDir, "package.json");
  if (!(await exists(pkgPath))) return;
  const pkg = await readJSON(pkgPath);
  if (!pkg.bin) return;

  const bins = typeof pkg.bin === "string" ? [pkg.bin] : Object.values(pkg.bin);

  for (const rel of bins) {
    const abs = path.join(pkgDir, rel);
    if (await exists(abs)) {
      // ensure shebang exists (best effort, don’t mutate if missing)
      // You can enforce shebang by uncommenting the block below.
      // const content = await fs.readFile(abs, 'utf8');
      // if (!content.startsWith('#!')) {
      //   console.warn(`WARN: ${abs} has no shebang (#!/usr/bin/env node).`);
      // }
      await chmodX(abs);
    }
  }
}

async function main() {
  // Infer workspace package paths from pnpm
  // Works because pnpm writes a lockfile with importers, but we avoid parsing it.
  // Simpler: walk ./packages/* (adjust if your layout differs).
  const root = process.cwd();
  const pkgsRoot = path.join(root, "packages");
  if (!(await exists(pkgsRoot))) return;

  const entries = await fs.readdir(pkgsRoot, { withFileTypes: true });
  for (const ent of entries) {
    if (ent.isDirectory()) {
      await fixPackage(path.join(pkgsRoot, ent.name));
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
