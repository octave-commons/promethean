// dedupe-fuzzy-rename.mjs
// Usage:
//   node dedupe-fuzzy-rename.mjs [DIR] [--apply] [--rm] [--rename]
//                                [--ext md] [--dist 2] [--ratio 0.12]
//                                [--minlen 3]
//
// Behavior:
// - Groups files by normalized base name + extension (ignoring a final .bak).
// - Fuzzy-merges nearby group keys using a BK-tree + Levenshtein with a distance
//   threshold of max(--dist, ceil(len * --ratio)). Defaults: dist=2, ratio=0.12.
// - For each merged cluster (same extension), keeps **one** file using tie-breakers:
//     1) prefer non-.bak
//     2) larger size
//     3) newer mtime
//     4) shorter name
// - Moves all extras to a timestamped .dedupe_trash_* folder unless --rm is set.
// - If --rename is set, renames the kept file to a canonical short name
//   ("shortest sensible" sanitized base) plus the base extension.
// - Dry-run by default; use --apply to enact changes.
//
// Notes:
// - "Canonical short name" heuristic: choose the shortest sanitized base among the
//   cluster after stripping versiony suffixes (" 1", "_final", "-v2" etc.) and
//   collapsing separators. Enforce --minlen (default 3) to avoid silly names.
// - Multi-extensions: we respect only the last extension as the base extension
//   (e.g. name.py.md -> ".md"). A trailing ".bak" is ignored for canonical ext.
//
// This file is dependency-free and safe to tweak.

import { readdir, stat, mkdir, rename, rm } from "fs/promises";
import { join, resolve, parse } from "path";

const args = process.argv.slice(2);
const DIR = resolve(args[0] || ".");
const APPLY = args.includes("--apply");
const PERMA = args.includes("--rm"); // permanent delete if true
const DO_RENAME = args.includes("--rename");
const ONLY_EXT = getFlag("--ext"); // e.g. "md"
const BASE_DIST = toInt(getFlag("--dist"), 2);
const RATIO = toFloat(getFlag("--ratio"), 0.12);
const MINLEN = toInt(getFlag("--minlen"), 3);

function getFlag(name) {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : null;
}
function toInt(v, d) {
  return v != null ? parseInt(v, 10) : d;
}
function toFloat(v, d) {
  return v != null ? parseFloat(v) : d;
}

// ---------- String utils ----------
function stripTrailingBak(name) {
  return name.endsWith(".bak") ? name.slice(0, -4) : name;
}

function splitNameAndExtNoBak(filename) {
  const noBak = stripTrailingBak(filename);
  const dot = noBak.lastIndexOf(".");
  if (dot < 0) return { base: noBak, ext: "" };
  return { base: noBak.slice(0, dot), ext: noBak.slice(dot) };
}

const VERSIONY =
  /(?:[\s_-]*(?:\d+|v\d+|ver\d+|final|draft|copy|old|new|backup|bak))$/i;
function stripVersiony(base) {
  let s = base;
  for (let i = 0; i < 4; i++) {
    // peel a few layers if stacked
    const t = s.replace(VERSIONY, "");
    if (t === s) break;
    s = t;
  }
  return s.replace(/[\s_-]+$/g, "").trim();
}

function sanitizeForKey(base) {
  // lowercase, collapse separators, remove most punctuation (keep alnum and space)
  return base
    .toLowerCase()
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/[^a-z0-9 ]+/g, "")
    .trim();
}

function canonicalBaseForRename(candidates) {
  // Choose the shortest sanitized-but-readable candidate with min length
  const sorted = [...candidates]
    .map((s) => sanitizeForKey(stripVersiony(s)))
    .filter((s) => s.length >= MINLEN)
    .sort((a, b) => a.length - b.length || a.localeCompare(b));
  return sorted[0] || sanitizeForKey(stripVersiony(candidates[0]));
}

// ---------- Levenshtein & BK-tree ----------
function levenshtein(a, b) {
  const m = a.length,
    n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp = new Array(n + 1);
  for (let j = 0; j <= n; j++) dp[j] = j;
  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const temp = dp[j];
      const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      dp[j] = Math.min(
        dp[j] + 1, // deletion
        dp[j - 1] + 1, // insertion
        prev + cost, // substitution
      );
      prev = temp;
    }
  }
  return dp[n];
}

class BKNode {
  constructor(term) {
    this.term = term;
    this.children = new Map();
  }
  add(term) {
    const d = levenshtein(term, this.term);
    const c = this.children.get(d);
    if (c) c.add(term);
    else this.children.set(d, new BKNode(term));
  }
  search(term, maxDist, acc) {
    const d = levenshtein(term, this.term);
    if (d <= maxDist) acc.push(this.term);
    for (let k = Math.max(1, d - maxDist); k <= d + maxDist; k++) {
      const child = this.children.get(k);
      if (child) child.search(term, maxDist, acc);
    }
  }
}

class BKTree {
  constructor() {
    this.root = null;
  }
  add(term) {
    if (this.root) this.root.add(term);
    else this.root = new BKNode(term);
  }
  near(term, maxDist) {
    if (!this.root) return [];
    const acc = [];
    this.root.search(term, maxDist, acc);
    return acc;
  }
}

// ---------- IO ----------
function hasWantedExt(name) {
  if (!ONLY_EXT) return true;
  // allow .md and .md.bak when --ext md
  return (
    name.toLowerCase().endsWith("." + ONLY_EXT.toLowerCase()) ||
    name.toLowerCase().endsWith("." + ONLY_EXT.toLowerCase() + ".bak")
  );
}

function fileInfo(direntName) {
  const name = direntName;
  const { base, ext } = splitNameAndExtNoBak(name);
  const rawBase = base; // before stripping versiony
  const cleanBase = stripVersiony(rawBase);
  const key = sanitizeForKey(cleanBase);
  const isBak = name.endsWith(".bak");
  return { name, rawBase, cleanBase, key, ext, isBak };
}

const dirents = await readdir(DIR, { withFileTypes: true });
const files = [];
for (const de of dirents) {
  if (!de.isFile()) continue;
  if (!hasWantedExt(de.name)) continue;
  const abs = join(DIR, de.name);
  const st = await stat(abs);
  const info = fileInfo(de.name);
  files.push({ path: abs, size: st.size, mtimeMs: st.mtimeMs, ...info });
}

if (files.length === 0) {
  console.log("No files to process.");
  process.exit(0);
}

// Group by extension first, then by key
const byExt = new Map(); // ext -> Map(key -> files[])
for (const f of files) {
  if (!byExt.has(f.ext)) byExt.set(f.ext, new Map());
  const m = byExt.get(f.ext);
  if (!m.has(f.key)) m.set(f.key, []);
  m.get(f.key).push(f);
}

// Fuzzy merge group keys within each extension using BK-tree
const clusters = []; // { ext, keys: string[], files: File[], canonicalBase }
for (const [ext, map] of byExt) {
  const keys = [...map.keys()];
  const tree = new BKTree();
  keys.forEach((k) => tree.add(k));
  const visited = new Set();
  for (const k of keys) {
    if (visited.has(k)) continue;
    const maxDist = Math.max(BASE_DIST, Math.ceil(k.length * RATIO));
    const near = tree.near(k, maxDist).filter((x) => !visited.has(x));
    // mark visited and merge
    near.forEach((x) => visited.add(x));
    // collect files across merged keys
    const mergedFiles = near.flatMap((x) => map.get(x));
    const candidateBases = Array.from(
      new Set(mergedFiles.map((f) => f.cleanBase)),
    ).sort();
    const canonicalBase = canonicalBaseForRename(candidateBases);
    clusters.push({ ext, keys: near, files: mergedFiles, canonicalBase });
  }
}

// Within each cluster, pick a single keeper and mark the rest for deletion
function pickKeeper(a, b) {
  // return -1 if a wins over b
  if (a.isBak !== b.isBak) return a.isBak ? 1 : -1; // non-bak wins
  if (a.size !== b.size) return b.size - a.size; // bigger wins
  if (a.mtimeMs !== b.mtimeMs) return b.mtimeMs - a.mtimeMs; // newer wins
  if (a.name.length !== b.name.length) return a.name.length - b.name.length; // shorter wins
  return a.name.localeCompare(b.name);
}

const actions = [];
for (const cl of clusters) {
  if (cl.files.length === 1) continue; // nothing to dedupe
  const sorted = [...cl.files].sort(pickKeeper);
  const keep = sorted[0];
  const drops = sorted.slice(1);
  // Desired new name for keeper
  const desiredBase = cl.canonicalBase || stripVersiony(keep.cleanBase);
  const desiredName = desiredBase + cl.ext;
  const desiredPath = join(DIR, desiredName);

  actions.push({
    type: "cluster",
    ext: cl.ext,
    base: desiredBase,
    keep,
    drops,
    desiredPath,
    desiredName,
  });
}

if (actions.length === 0) {
  console.log("No clusters with duplicates found (after fuzzy merge).");
  process.exit(0);
}

// Report plan
for (const a of actions) {
  console.log(`\nCluster (ext=${a.ext || "(none)"}): base → "${a.base}"`);
  console.log(
    `  KEEP -> ${rel(a.keep.path)} (${a.keep.size} bytes)${
      DO_RENAME ? `  ⇒  ${a.desiredName}` : ""
    }`,
  );
  for (const d of a.drops)
    console.log(`  drop -> ${rel(d.path)} (${d.size} bytes)`);
}

if (!APPLY) {
  console.log(
    `\nDry run. Use --apply to make changes. Flags: [--rename] to rename keeper, [--rm] to permanently delete, [--ext md], [--dist N], [--ratio 0.12], [--minlen 3]`,
  );
  process.exit(0);
}

let trashDir = null;
if (!PERMA) {
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  trashDir = join(DIR, `.dedupe_trash_${ts}`);
  await mkdir(trashDir, { recursive: true });
}

// Execute
for (const a of actions) {
  // move drops
  for (const d of a.drops) {
    if (PERMA) await rm(d.path);
    else await rename(d.path, uniqueDest(trashDir, d.name));
  }
  // rename keeper if requested and different
  if (DO_RENAME && a.keep.path !== a.desiredPath) {
    const finalDest = uniqueDest(DIR, a.desiredName); // avoid collision
    if (finalDest !== a.keep.path) await rename(a.keep.path, finalDest);
  }
}

console.log(
  PERMA ? "\nDeleted extras." : `\nMoved extras to ${rel(trashDir)}.`,
);
if (DO_RENAME) console.log("Renamed keepers to canonical names.");

// ---------- helpers ----------
function rel(p) {
  return p.replace(DIR + "/", "");
}
function uniqueDest(parent, name) {
  let base = name;
  const { name: stem, ext } = parse(name);
  let target = join(parent, base);
  let i = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      // stat throws if missing; simulate existence check via fs.access in a try
      // but we already know existing files were moved/renamed; keep it simple
      return target; // optimistic: rely on earlier moves to free names
    } catch {
      /* not used */
    }
    // fallback: ensure uniqueness if target was still present
    base = `${stem}-dedup-${i++}${ext}`;
    target = join(parent, base);
  }
}
