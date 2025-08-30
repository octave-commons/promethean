#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";

const WRITE = process.argv.includes("--write");
const REPO = process.cwd();
const ROOT = path.join(REPO, "shared/ts");
const SCOPE = "@promethean";
const exts = [".ts", ".tsx", ".mts", ".cts", ".js", ".mjs", ".cjs"];

const exists = async (p) => !!(await fs.stat(p).catch(() => null));

async function listPackages() {
  const dirs = await fs.readdir(ROOT, { withFileTypes: true });
  const pkgs = [];
  for (const d of dirs) {
    if (!d.isDirectory()) continue;
    const dir = path.join(ROOT, d.name);
    if (!(await exists(path.join(dir, "package.json")))) continue;
    if (!(await exists(path.join(dir, "src")))) continue;
    const pkg = JSON.parse(
      await fs.readFile(path.join(dir, "package.json"), "utf8"),
    );
    pkgs.push({
      dir,
      name: pkg.name,
      short: d.name,
      src: path.join(dir, "src"),
    });
  }
  return pkgs;
}

function* importMatches(code) {
  // capture bare and side-effect imports/exports
  const re =
    /\b(?:import|export)\b[^'"]*from\s*['"]([^'"]+)['"]|^\s*import\s*['"]([^'"]+)['"]/gm;
  let m;
  while ((m = re.exec(code))) {
    const spec = m[1] ?? m[2];
    if (spec?.startsWith("../"))
      yield { spec, start: m.index, end: re.lastIndex };
  }
}

async function* walk(dir) {
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (exts.some((x) => p.endsWith(x))) yield p;
  }
}

function rewriteSpec(currentPkg, spec, knownShorts, knownFulls) {
  // Normalize '../<pkg>/rest/of/path'
  const parts = spec.split("/");
  // Strip leading '..' segments until we leave src
  // We only care about the first segment AFTER the '..' chain
  let i = 0;
  while (i < parts.length && parts[i] === "..") i++;
  if (i === 0 || i >= parts.length) return null;

  const candidate = parts[i]; // presumed <pkg> dir
  const rest = parts.slice(i + 1).join("/"); // subpath after <pkg>

  // If that candidate matches a known package folder, rewrite
  if (knownShorts.has(candidate)) {
    const targetFull = knownShorts.get(candidate); // e.g. @promethean/event
    if (targetFull === currentPkg) return null; // don’t rewrite into self
    // deep form: @scope/pkg[/rest]
    return rest ? `${targetFull}/${rest}` : `${targetFull}`;
  }

  // Also handle '../@scope/pkg/...' just in case
  const scopedMaybe = parts.slice(i, i + 2).join("/");
  if (
    knownFulls.has(scopedMaybe) &&
    knownFulls.get(scopedMaybe) !== currentPkg
  ) {
    const rest2 = parts.slice(i + 2).join("/");
    return rest2 ? `${scopedMaybe}/${rest2}` : scopedMaybe;
  }

  return null;
}

async function ensureWildcardExport(pkgJsonPath) {
  const pkg = JSON.parse(await fs.readFile(pkgJsonPath, "utf8"));
  pkg.exports = pkg.exports || {};
  if (!pkg.exports["./*"]) {
    pkg.exports["./*"] = "./dist/*";
    await fs.writeFile(
      pkgJsonPath,
      JSON.stringify(pkg, null, 2) + "\n",
      "utf8",
    );
    return true;
  }
  return false;
}

async function main() {
  const pkgs = await listPackages();
  const byShort = new Map(pkgs.map((p) => [p.short, p.name]));
  const byFull = new Map(pkgs.map((p) => [p.name, p.name]));

  let changedCount = 0;
  let filesChanged = 0;

  for (const pkg of pkgs) {
    let pkgTouched = false;
    for await (const file of walk(pkg.src)) {
      const original = await fs.readFile(file, "utf8");
      let code = original;

      for (const m of importMatches(original)) {
        const rewritten = rewriteSpec(pkg.name, m.spec, byShort, byFull);
        if (rewritten && rewritten !== m.spec) {
          code = code.replace(m.spec, rewritten);
          console.log(
            `${path.relative(REPO, file)}: ${m.spec} -> ${rewritten}`,
          );
          changedCount++;
          pkgTouched = true;
        }
      }

      if (pkgTouched && code !== original && WRITE) {
        await fs.writeFile(file, code, "utf8");
        filesChanged++;
      }
    }

    // also ensure wildcard export for deep imports
    if (WRITE) {
      const pkgJsonPath = path.join(pkg.dir, "package.json");
      const did = await ensureWildcardExport(pkgJsonPath);
      if (did)
        console.log(`exports * added: ${path.relative(REPO, pkgJsonPath)}`);
    }
  }

  console.log(
    WRITE
      ? `\nRewrote ${changedCount} import(s) across ${filesChanged} file(s).`
      : `\n(dry run) Would rewrite ${changedCount} import(s). Use --write to apply.`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
