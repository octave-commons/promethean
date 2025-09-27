#!/usr/bin/env node
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const TS_ROOT = path.join(ROOT, "shared", "ts");

function readJSON(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

// Build name -> dir map for all packages under shared/ts
const nameToDir = new Map();
const dirToName = new Map();
for (const entry of fs.readdirSync(TS_ROOT, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const dir = path.join(TS_ROOT, entry.name);
  const pj = path.join(dir, "package.json");
  if (!fs.existsSync(pj)) continue;
  const pkg = readJSON(pj);
  if (!pkg.name) continue;
  nameToDir.set(pkg.name, dir);
  dirToName.set(dir, pkg.name);
}

// Helper: resolve relative file: path from one package dir to another
function fileDep(fromDir, toDir) {
  const rel = path.relative(fromDir, toDir) || ".";
  const norm = rel.replace(/\\/g, "/");
  return `file:${norm}`;
}

// Collect imports of the form @promethean/<pkg>/... within a package dir
function collectImports(pkgDir) {
  const results = new Set();
  const stack = [pkgDir];
  while (stack.length) {
    const cur = stack.pop();
    for (const e of fs.readdirSync(cur, { withFileTypes: true })) {
      const p = path.join(cur, e.name);
      if (e.isDirectory()) {
        if (e.name === "dist" || e.name === "node_modules") continue;
        stack.push(p);
      } else if (e.isFile() && (p.endsWith(".ts") || p.endsWith(".tsx"))) {
        const text = fs.readFileSync(p, "utf8");
        const re =
          /(from\s+['"])(@promethean\/[^'"\n]+)(['"])|import\(\s*['"](@promethean\/[^'"\n]+)['"]\s*\)/g;
        let m;
        while ((m = re.exec(text))) {
          const spec = (m[2] || m[4] || "").trim();
          if (!spec) continue;
          const m2 = spec.match(/^@promethean\/([^\/]+)/);
          if (!m2) continue;
          const depName = `@promethean/${m2[1]}`;
          results.add(depName);
        }
        const reLegacy =
          /(from\s+['"])(@promethean\/legacy\/[^'"\n]+)(['"])|import\(\s*['"](@promethean\/legacy\/[^'"\n]+)['"]\s*\)/g;
        if (reLegacy.test(text)) results.add("@promethean/legacy");
      }
    }
  }
  return results;
}

// Update package.json dependencies to include needed deps
const changes = [];
for (const [dir, pkgName] of dirToName.entries()) {
  const pjPath = path.join(dir, "package.json");
  const pkg = readJSON(pjPath);
  const deps = pkg.dependencies || {};
  const needed = collectImports(path.join(dir, "src"));
  // Remove self
  needed.delete(pkgName);
  let changed = false;
  for (const depName of needed) {
    if (deps[depName]) continue;
    if (depName === "@promethean/legacy") {
      deps[depName] = "file:../../legacy";
      changed = true;
      continue;
    }
    const targetDir = nameToDir.get(depName);
    if (!targetDir) continue; // unknown, skip
    deps[depName] = fileDep(dir, targetDir);
    changed = true;
  }
  if (changed) {
    pkg.dependencies = deps;
    fs.writeFileSync(pjPath, JSON.stringify(pkg, null, 2) + "\n");
    changes.push({ pkg: pkgName, deps: Object.keys(deps).sort() });
  }
}

console.log(`sync-package-deps: updated ${changes.length} packages`);
for (const c of changes) {
  console.log(` - ${c.pkg}`);
}
