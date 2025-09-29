#!/usr/bin/env node
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const START_DIR = path.resolve(ROOT, "shared/ts");

/**
 * Return true if spec is a package subpath that should get a .js suffix.
 */
function needsJs(spec) {
  if (spec.endsWith(".js") || spec.endsWith(".mjs") || spec.endsWith(".cjs"))
    return false;
  const prefixes = ["@promethean/", "@promethean/legacy/", "@shared/ts/"];
  const match = prefixes.find((p) => spec.startsWith(p));
  if (!match) return false;
  // Must be a subpath (pkg/subpath), not package root
  const rest = spec.slice(match.length);
  return rest.includes("/");
}

function patchContent(src) {
  let changed = false;
  const replacer = (_m, p1, spec, p3) => {
    if (needsJs(spec)) {
      changed = true;
      return `${p1}${spec}.js${p3}`;
    }
    return _m;
  };
  // import/export ... from '...'
  const reFrom = /(from\s+['"])(@[^'"\n]+)(['"])/g;
  let out = src.replace(reFrom, replacer);
  // export * from '...'
  const reExport =
    /(export\s+(?:\*|\{[^}]*\})\s+from\s+['"])(@[^'"\n]+)(['"])/g;
  out = out.replace(reExport, replacer);
  // dynamic import('...')
  const reDyn = /(import\(\s*['"])(@[^'"\n]+)(['"]\s*\))/g;
  out = out.replace(reDyn, replacer);
  return { out, changed };
}

function* walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === "dist" || e.name === "node_modules") continue;
      yield* walk(p);
    } else if (e.isFile() && (p.endsWith(".ts") || p.endsWith(".tsx"))) {
      yield p;
    }
  }
}

let filesPatched = 0;
let importsPatched = 0;
for (const file of walk(START_DIR)) {
  const src = fs.readFileSync(file, "utf8");
  const { out, changed } = patchContent(src);
  if (changed) {
    fs.writeFileSync(file, out);
    filesPatched++;
  }
}
console.log(`append-js-extensions: patched ${filesPatched} files`);
