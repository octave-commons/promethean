#!/usr/bin/env node
// SPDX-License-Identifier: GPL-3.0-only
// find-broken-imports.mjs
// Node 18+. No external deps.

import fs from "fs";
import path from "path";
import module from "node:module";

// -----------------------------
// Config
// -----------------------------
const ALLOWED_EXTS = [
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".mts",
  ".cts",
  ".cjs",
  ".json",
];
const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  ".hg",
  ".svn",
  "dist",
  "build",
  "out",
  ".next",
  ".turbo",
  ".cache",
  "coverage",
]);
const MAX_CANDIDATES = 5;
const BUILTINS = new Set(module.builtinModules);

// -----------------------------
// CLI args
// -----------------------------
const args = new Set(process.argv.slice(2));
function argValue(flag, def = null) {
  const idx = process.argv.indexOf(flag);
  return idx >= 0 ? process.argv[idx + 1] || def : def;
}
const ROOT = path.resolve(argValue("--root", process.cwd()));
const CHECK_NODE_MODULES = args.has("--check-node-modules");

// -----------------------------
// FS utils
// -----------------------------
function fileExists(p) {
  try {
    return fs.statSync(p).isFile();
  } catch {
    return false;
  }
}
function dirExists(p) {
  try {
    return fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
}
function safeReadFile(p) {
  try {
    return fs.readFileSync(p, "utf8");
  } catch {
    return null;
  }
}
function isProbablyTextFile(p) {
  return ALLOWED_EXTS.includes(path.extname(p).toLowerCase());
}

function listFilesRec(dir) {
  const out = [];
  const stack = [dir];
  while (stack.length) {
    const cur = stack.pop();
    let entries;
    try {
      entries = fs.readdirSync(cur, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const e of entries) {
      if (e.isDirectory()) {
        if (SKIP_DIRS.has(e.name)) continue;
        stack.push(path.join(cur, e.name));
      } else if (e.isFile()) {
        const fp = path.join(cur, e.name);
        if (isProbablyTextFile(fp)) out.push(fp);
      }
    }
  }
  return out;
}

// --- replace the old tryResolveFile with this ---
function tryResolveFile(basePath) {
  // If exactly there, done.
  if (fileExists(basePath)) return basePath;

  const ext = path.extname(basePath);
  const hasExt = !!ext;

  // Probe alternatives by stripping the provided extension (if any)
  const stem = hasExt ? basePath.slice(0, -ext.length) : basePath;

  // 1) Same stem, any allowed extension (handles ./types.js -> ./types.ts)
  for (const e of ALLOWED_EXTS) {
    const p = stem + e;
    if (fileExists(p)) return p;
  }

  // 2) Directory index under stem (./dir or ./dir.js -> ./dir/index.*)
  const asDir = stem; // try as a directory
  if (dirExists(asDir)) {
    for (const e of ALLOWED_EXTS) {
      const p = path.join(asDir, "index" + e);
      if (fileExists(p)) return p;
    }
  }

  // 3) If no stem match, and we *didn’t* have an ext, try adding extensions directly
  //    (covers bare ./util -> ./util.ts)
  if (!hasExt) {
    for (const e of ALLOWED_EXTS) {
      const p = basePath + e;
      if (fileExists(p)) return p;
    }
  }

  return null;
}

// -----------------------------
// package.json (module root) helpers
// -----------------------------
function findNearestPackageRoot(startDir) {
  let cur = startDir;
  while (true) {
    const pj = path.join(cur, "package.json");
    if (fileExists(pj)) return cur;
    const parent = path.dirname(cur);
    if (parent === cur) break;
    cur = parent;
  }
  return null;
}
function sameModule(importerFile, intendedAbsPath) {
  const impRoot = findNearestPackageRoot(path.dirname(importerFile));
  if (!impRoot) return false;
  // Even if intended path doesn’t exist, we can still compare its path prefix
  const normIntended = path.normalize(intendedAbsPath);
  return normIntended.startsWith(impRoot + path.sep);
}

// -----------------------------
// tsconfig baseUrl + simple paths
// -----------------------------
function loadTsConfig(projectRoot) {
  for (const name of ["tsconfig.json", "jsconfig.json"]) {
    const f = path.join(projectRoot, name);
    if (fileExists(f)) {
      try {
        return JSON.parse(fs.readFileSync(f, "utf8"));
      } catch {
        return null;
      }
    }
  }
  return null;
}

function resolveWithTsPaths(spec, fromFile, tsconf) {
  if (!tsconf?.compilerOptions) return { resolved: null, attemptedAbs: null };
  const { baseUrl, paths } = tsconf.compilerOptions;
  const base = baseUrl ? path.resolve(ROOT, baseUrl) : ROOT;

  // relative or absolute path-like
  if (spec.startsWith("./") || spec.startsWith("../") || spec.startsWith("/")) {
    const abs = spec.startsWith("/")
      ? path.join(ROOT, spec)
      : path.resolve(path.dirname(fromFile), spec);
    return { resolved: tryResolveFile(abs), attemptedAbs: abs };
  }

  // paths mapping (single * support)
  if (paths && typeof paths === "object") {
    for (const [alias, targets] of Object.entries(paths)) {
      const starIdx = alias.indexOf("*");
      if (starIdx === -1) {
        if (alias === spec) {
          for (const t of targets) {
            const abs = path.resolve(base, t);
            const r = tryResolveFile(abs);
            if (r) return { resolved: r, attemptedAbs: abs };
          }
        }
      } else {
        const prefix = alias.slice(0, starIdx);
        const suffix = alias.slice(starIdx + 1);
        if (spec.startsWith(prefix) && spec.endsWith(suffix)) {
          const mid = spec.slice(prefix.length, spec.length - suffix.length);
          for (const t of targets) {
            const tStar = t.indexOf("*");
            const mapped =
              tStar >= 0 ? t.slice(0, tStar) + mid + t.slice(tStar + 1) : t;
            const abs = path.resolve(base, mapped);
            const r = tryResolveFile(abs);
            if (r) return { resolved: r, attemptedAbs: abs };
          }
        }
      }
    }
  }

  // baseUrl join attempt for path-like non-bare
  const abs = path.resolve(base, spec);
  return { resolved: tryResolveFile(abs), attemptedAbs: abs };
}

// -----------------------------
// Node modules (optional)
// -----------------------------
function resolveFromNodeModules(spec, fromFile) {
  let cur = path.dirname(fromFile);
  while (true) {
    const nm = path.join(cur, "node_modules", spec);
    if (dirExists(nm)) {
      const pkg = path.join(nm, "package.json");
      if (fileExists(pkg)) {
        try {
          const data = JSON.parse(fs.readFileSync(pkg, "utf8"));
          const entry = data.module || data.exports || data.main || "index.js";
          const target = Array.isArray(entry)
            ? entry[0]
            : typeof entry === "string"
              ? entry
              : "index.js";
          const res = tryResolveFile(path.join(nm, target));
          if (res) return res;
        } catch {}
      }
      const fallback = tryResolveFile(nm);
      if (fallback) return fallback;
    }
    const parent = path.dirname(cur);
    if (parent === cur) break;
    cur = parent;
  }
  return null;
}

// -----------------------------
// Import extraction (regex)
// -----------------------------
const IMPORT_PATTERNS = [
  /import\s+(?:[^'"]*?)\s+from\s+['"]([^'"]+)['"]/g,
  /export\s+(?:[^'"]*?)\s+from\s+['"]([^'"]+)['"]/g,
  /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
];
function findImportsInText(text) {
  const specs = [];
  for (const re of IMPORT_PATTERNS) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(text)) !== null) specs.push(m[1]);
  }
  return specs;
}

// -----------------------------
// Fuzzy scoring
// -----------------------------
function levenshtein(a, b) {
  const m = a.length,
    n = b.length;
  if (!m) return n;
  if (!n) return m;
  const dp = Array.from({ length: m + 1 }, (_, i) => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost,
      );
    }
  }
  return dp[m][n];
}
function normScore(a, b) {
  const aa = a.toLowerCase(),
    bb = b.toLowerCase();
  const dist = levenshtein(aa, bb);
  const maxLen = Math.max(aa.length, bb.length) || 1;
  return 1 - dist / maxLen;
}
function makePathIndex(allFiles) {
  const idx = new Map();
  for (const f of allFiles) {
    const base = path.basename(f, path.extname(f));
    if (!idx.has(base)) idx.set(base, []);
    idx.get(base).push(f);
  }
  return idx;
}

// -----------------------------
// Main
// -----------------------------
function resolveLocal(spec, fromFile) {
  if (spec.startsWith("./") || spec.startsWith("../") || spec.startsWith("/")) {
    const abs = spec.startsWith("/")
      ? path.join(ROOT, spec)
      : path.resolve(path.dirname(fromFile), spec);
    return { resolved: tryResolveFile(abs), attemptedAbs: abs };
  }
  return { resolved: null, attemptedAbs: null };
}

function main() {
  console.log(`Scanning: ${ROOT}`);
  const tsconf = loadTsConfig(ROOT);

  const files = listFilesRec(ROOT);
  const pathIndex = makePathIndex(files);

  const results = [];
  for (const f of files) {
    const rel = path.relative(ROOT, f);
    const text = safeReadFile(f);
    if (text == null) continue;

    const specs = findImportsInText(text);
    for (const spec of specs) {
      // Skip Node built-ins
      if (BUILTINS.has(spec) || spec.startsWith("node:")) {
        results.push({
          file: rel,
          spec,
          status: "builtin",
          note: "node core module",
        });
        continue;
      }

      const isBare =
        !spec.startsWith(".") && !spec.startsWith("/") && !spec.includes(":");

      // Try resolve: local, ts paths, node_modules (optional)
      let { resolved, attemptedAbs } = resolveLocal(spec, f);
      if (!resolved) {
        const r = resolveWithTsPaths(spec, f, tsconf);
        resolved = r.resolved;
        attemptedAbs = attemptedAbs || r.attemptedAbs;
      }
      if (!resolved && isBare && CHECK_NODE_MODULES) {
        resolved = resolveFromNodeModules(spec, f);
      }

      if (resolved) {
        results.push({
          file: rel,
          spec,
          status: "ok",
          resolved: path.relative(ROOT, resolved),
        });
        continue;
      }

      // Handle same-module dist/… build artifacts and src mapping
      const looksLikeDistPath = /(^|[/\\])dist([/\\]|$)/.test(spec);
      if (attemptedAbs && looksLikeDistPath && sameModule(f, attemptedAbs)) {
        // Map dist -> src inside same module and try resolve
        const mappedAbs = attemptedAbs.replace(
          new RegExp(`\\${path.sep}dist\\${path.sep}`),
          `${path.sep}src${path.sep}`,
        );
        const mappedResolved = tryResolveFile(mappedAbs);
        if (mappedResolved) {
          results.push({
            file: rel,
            spec,
            status: "build-artifact",
            note: "same-module dist import; mapped to src",
            mapped: path.relative(ROOT, mappedResolved),
          });
          continue;
        }
        // If src didn’t resolve, still mark as build artifact (can’t build yet)
        results.push({
          file: rel,
          spec,
          status: "build-artifact",
          note: "same-module dist import; src mapping not found",
        });
        continue;
      }

      // Bare imports skipped unless checking node_modules
      if (isBare && !CHECK_NODE_MODULES) {
        results.push({
          file: rel,
          spec,
          status: "external",
          note: "bare import (skipped)",
        });
        continue;
      }

      // Fuzzy candidates: prefer same-module
      const wantedBase = path.basename(spec).replace(/\.[a-z0-9]+$/i, "");
      const candidatesRaw = (pathIndex.get(wantedBase) || [])
        .map((c) => {
          const candRel = path.relative(ROOT, c);
          const specish = spec.replace(/^[./]+/, "");
          let score = normScore(specish, candRel);
          // small bonuses
          if (path.extname(spec) && path.extname(spec) === path.extname(c))
            score += 0.05;
          const specDir = path.dirname(specish);
          const candDir = path.dirname(candRel);
          if (candDir.includes(specDir) || specDir.includes(candDir))
            score += 0.05;
          // strong bonus for same module
          if (sameModule(f, c)) score += 0.15;
          return { path: candRel, score };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, MAX_CANDIDATES);

      results.push({
        file: rel,
        spec,
        status: "missing",
        candidates: candidatesRaw,
      });
    }
  }

  // Summaries
  const missing = results.filter((r) => r.status === "missing");
  const artifacts = results.filter((r) => r.status === "build-artifact");
  const ok = results.filter((r) => r.status === "ok");
  const external = results.filter((r) => r.status === "external");

  console.log("\n=== Import Resolution Summary ===");
  console.log(`OK:             ${ok.length}`);
  console.log(`Build-artifact: ${artifacts.length} (same-module dist)`);
  console.log(`Missing:        ${missing.length}`);
  console.log(
    `External:       ${external.length} ${
      CHECK_NODE_MODULES ? "(checked)" : "(skipped)"
    }`,
  );

  if (artifacts.length) {
    console.log("\n--- Same-module dist imports ---");
    for (const r of artifacts) {
      console.log(
        `[${r.file}] -> "${r.spec}"  ${
          r.mapped ? `mapped -> ${r.mapped}` : "(no src mapping found)"
        }`,
      );
    }
  }
  if (missing.length) {
    console.log("\n--- Missing Imports (top candidates) ---");
    for (const r of missing) {
      console.log(`\n[${r.file}] -> "${r.spec}"`);
      if (!r.candidates?.length) {
        console.log("  No candidates found.");
      } else {
        r.candidates.forEach((c, i) => {
          console.log(`  ${i + 1}. ${c.path}  (score=${c.score.toFixed(3)})`);
        });
      }
    }
  }

  const reportPath = path.join(ROOT, "broken-imports.report.json");
  fs.writeFileSync(
    reportPath,
    JSON.stringify({ root: ROOT, results }, null, 2),
    "utf8",
  );
  console.log(`\nWrote report: ${reportPath}`);
}

main();
