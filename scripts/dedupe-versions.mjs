// dedupe-to-kanban-largest.mjs
//
// WHAT THIS DOES (updated):
//   • Fuzzy-cluster filenames that look like versions of the same task
//     (ignores trailing numbers / "v2" / "final" noise, treats .md and .md.bak as same base ext).
//   • In each cluster: **KEEP THE LARGEST FILE BY SIZE**. Ties → newer mtime → shorter name.
//   • Move all smaller siblings to a timestamped `.dedupe_trash_*` unless `--rm` is set.
//   • Parse your Kanban board Markdown (lines like `- [ ] [[Task name]]` or `- [x] [[Task name]]`).
//   • If `--rename` is set, rename the kept (largest) file to the **exact Kanban task title**
//     plus the base extension (ignoring a trailing `.bak`). No lowercasing, no reformatting.
//
// WHAT IT DOES *NOT* DO:
//   • It does not prefer non-.bak or any specific name/extension—**size alone decides** the keeper.
//   • It does not "sanitize" the Kanban title beyond OS-unsafe edge cases; it uses the title as-is.
//
// USAGE
//   node dedupe-to-kanban-largest.mjs [DIR]
//       [--apply] [--rm]
//       [--rename]                 # actually rename keepers to matching Kanban titles
//       [--board <pathOrUrl>]      # Kanban .md path or URL (default: Promethean dev board raw URL)
//       [--ext md]                 # operate only on one extension family (.md & .md.bak)
//       [--dist 2] [--ratio 0.12]  # filename clustering fuzz (BK-tree + Levenshtein)
//       [--taskdist 3] [--taskratio 0.14] # cluster→task title matching fuzz
//       [--rename-solo]            # also rename singletons (clusters with 1 file)
//       [--plan out.json]          # write a JSON change plan (preview or audit)
//
// DEFAULT BOARD (per your project setting #75):
//   https://raw.githubusercontent.com/riatzukiza/promethean/dev/docs/agile/boards/kanban.md
//
// SAFETY
//   • Dry-run by default; shows plan without making changes.
//   • Use --apply to enact. Use --rm to permanently delete instead of moving to trash.
//   • If a Kanban title contains a '/' (rare), we SKIP renaming that cluster and warn.

import { readdir, stat, mkdir, rename, rm, writeFile, readFile } from 'fs/promises';
import { join, resolve } from 'path';
import https from 'https';

// ---------- CLI ----------
const args = process.argv.slice(2);
const DIR = resolve(args[0] || '.');
const APPLY = args.includes('--apply');
const PERMA = args.includes('--rm');
const DO_RENAME = args.includes('--rename');
const RENAME_SOLO = args.includes('--rename-solo');
const ONLY_EXT = getFlag('--ext'); // e.g. 'md'

const BASE_DIST = toInt(getFlag('--dist'), 2);
const RATIO = toFloat(getFlag('--ratio'), 0.12);
const TASK_BASE_DIST = toInt(getFlag('--taskdist'), 3);
const TASK_RATIO = toFloat(getFlag('--taskratio'), 0.14);
const PLAN_OUT = getFlag('--plan');
const BOARD =
  getFlag('--board') ||
  'https://raw.githubusercontent.com/riatzukiza/promethean/dev/docs/agile/boards/kanban.md';

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

function removeDuplicateExtensions(path) {
  const extensionRegex = /\.[a-zA-Z0-9]+$/g;
  let currentExtension = '';

  return path.replace(extensionRegex, (match) => {
    if (currentExtension === match.slice(1)) {
      return '';
    } else {
      currentExtension = match.slice(1);
      return match;
    }
  });
}

// ---------- String & filename helpers ----------
function stripTrailingBak(name) {
  return name.endsWith('.bak') ? name.slice(0, -4) : name;
}
function splitNameAndExtNoBak(filename) {
  const noBak = stripTrailingBak(filename);
  const dot = noBak.lastIndexOf('.');
  if (dot < 0) return { base: noBak, ext: '' };
  return { base: noBak.slice(0, dot), ext: noBak.slice(dot) };
}

const VERSIONY = /(?:[\s_-]*(?:\d+|v\d+|ver\d+|final|draft|copy|old|new|backup|bak))$/i;
function stripVersiony(base) {
  let s = base;
  for (let i = 0; i < 4; i++) {
    const t = s.replace(VERSIONY, '');
    if (t === s) break;
    s = t;
  }
  return s.replace(/[\s_-]+$/g, '').trim();
}
function sanitizeForKey(base) {
  // for fuzzy comparison only
  return base
    .toLowerCase()
    .replace(/[._-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/[^a-z0-9 ]+/g, '')
    .trim();
}

function isOSUnsafeFilename(title) {
  // On cross-platform repos, these are usually problematic. We only *warn* and skip rename if present.
  return /\//.test(title); // keep strict: forward slash breaks paths on all OSes
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
      const tmp = dp[j];
      const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + cost);
      prev = tmp;
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

// ---------- Kanban parsing ----------
async function readBoardMarkdown(src) {
  if (/^https?:\/\//i.test(src)) return await httpGet(src);
  const p = resolve(src);
  return (await readFile(p)).toString('utf8');
}
function httpGet(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (
          res.statusCode &&
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location
        ) {
          return resolve(httpGet(res.headers.location));
        }
        if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        const chunks = [];
        res.on('data', (d) => chunks.push(d));
        res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
      })
      .on('error', reject);
  });
}
function extractKanbanTasks(md) {
  const re = /^\s*-\s*\[(?: |x|X|-)\]\s*\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/gm; // [[Title]] or [[Title|Alias]]
  const titles = [];
  let m;
  while ((m = re.exec(md)) !== null) titles.push(m[1].trim());
  const seen = new Set();
  const tasks = [];
  for (const t of titles) {
    if (!seen.has(t)) {
      seen.add(t);
      tasks.push({ title: t, key: sanitizeForKey(t) });
    }
  }
  return tasks;
}

// ---------- IO & indexing ----------
function hasWantedExt(name) {
  if (!ONLY_EXT) return true;
  return (
    name.toLowerCase().endsWith('.' + ONLY_EXT.toLowerCase()) ||
    name.toLowerCase().endsWith('.' + ONLY_EXT.toLowerCase() + '.bak')
  );
}
function fileInfo(direntName) {
  const name = direntName;
  const { base, ext } = splitNameAndExtNoBak(name);
  const rawBase = base; // before stripping versiony
  const cleanBase = stripVersiony(rawBase);
  const key = sanitizeForKey(cleanBase);
  return { name, rawBase, cleanBase, key, ext };
}

// ---------- MAIN ----------
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
  console.log('No files to process.');
  process.exit(0);
}

// Group by base extension (ignoring .bak), then by fuzzy key
const byExt = new Map(); // ext -> Map(key -> files[])
for (const f of files) {
  if (!byExt.has(f.ext)) byExt.set(f.ext, new Map());
  const m = byExt.get(f.ext);
  if (!m.has(f.key)) m.set(f.key, []);
  m.get(f.key).push(f);
}

// Parse Kanban
let tasks = [];
try {
  const md = await readBoardMarkdown(BOARD);
  tasks = extractKanbanTasks(md);
  if (tasks.length === 0) console.warn('Warning: No tasks found in board.');
} catch (e) {
  console.warn(`Warning: Failed to read board (${BOARD}):`, e.message);
}

// Build clusters by fuzzy-merging keys within each extension
const clusters = []; // { ext, keys: string[], files: File[], label }
for (const [ext, map] of byExt) {
  const keys = [...map.keys()];
  const tree = new BKTree();
  keys.forEach((k) => tree.add(k));
  const visited = new Set();
  for (const k of keys) {
    if (visited.has(k)) continue;
    const maxDist = Math.max(BASE_DIST, Math.ceil(k.length * RATIO));
    const near = tree.near(k, maxDist).filter((x) => !visited.has(x));
    near.forEach((x) => visited.add(x));
    const mergedFiles = near.flatMap((x) => map.get(x));
    const candidateBases = Array.from(new Set(mergedFiles.map((f) => f.cleanBase))).sort();
    // Label (only for display / fallback): choose the shortest clean base
    const label = candidateBases.sort((a, b) => a.length - b.length || a.localeCompare(b))[0] || k;
    clusters.push({ ext, keys: near, files: mergedFiles, label });
  }
}

// Keeper = largest-by-size
function cmpLargest(a, b) {
  if (a.size !== b.size) return b.size - a.size; // larger wins
  if (a.mtimeMs !== b.mtimeMs) return b.mtimeMs - a.mtimeMs; // newer wins
  if (a.name.length !== b.name.length) return a.name.length - b.name.length; // shorter name as tie-breaker
  return a.name.localeCompare(b.name);
}

function bestTaskMatch(labelSanitized, tasksList) {
  if (!tasksList || tasksList.length === 0) return null;
  let best = null;
  let bestDist = Infinity;
  for (const t of tasksList) {
    const d = levenshtein(labelSanitized, t.key);
    if (d < bestDist) {
      bestDist = d;
      best = t;
    }
  }
  const maxDist = Math.max(TASK_BASE_DIST, Math.ceil(labelSanitized.length * TASK_RATIO));
  return bestDist <= maxDist ? best : null;
}

const actions = [];
for (const cl of clusters) {
  const sorted = [...cl.files].sort(cmpLargest);
  const keep = sorted[0];
  const drops = sorted.slice(1);

  // Only rename if duplicates OR user asked to rename singletons
  const shouldConsiderRename = DO_RENAME && (drops.length > 0 || RENAME_SOLO);

  // Determine desired rename target from Kanban
  let desiredName = null;
  let matchedTask = null;
  if (shouldConsiderRename) {
    const labelSan = sanitizeForKey(cl.label);
    const task = bestTaskMatch(labelSan, tasks);
    if (task) {
      if (isOSUnsafeFilename(task.title)) {
        console.warn(`Skipping rename: task title has OS-unsafe character '/' → ${task.title}`);
      } else {
        matchedTask = task.title; // exact title as filename stem
        const keepExt = splitNameAndExtNoBak(keep.name).ext; // base ext (ignoring .bak)
        desiredName = matchedTask;
      }
    }
  }

  actions.push({
    ext: cl.ext,
    label: cl.label,
    keep,
    drops,
    desiredName,
    matchedTask,
  });
}

// Report plan
for (const a of actions) {
  const header = `\nCluster (ext=${a.ext || '(none)'}): label "${a.label}"`;
  console.log(header);
  if (a.matchedTask) console.log(`  ↳ matches Kanban: "${a.matchedTask}"`);
  console.log(
    `  KEEP -> ${rel(a.keep.path)} (${a.keep.size} bytes)` +
      (a.desiredName ? `  ⇒  ${a.desiredName}` : ''),
  );
  for (const d of a.drops) console.log(`  drop -> ${rel(d.path)} (${d.size} bytes)`);
}

// Optionally write a plan JSON
if (PLAN_OUT) {
  const plan = actions.map((a) => ({
    label: a.label,
    ext: a.ext,
    keep: { path: rel(a.keep.path), size: a.keep.size },
    drops: a.drops.map((d) => ({ path: rel(d.path), size: d.size })),
    renameTo: a.desiredName || null,
    matchedTask: a.matchedTask || null,
  }));
  await writeFile(resolve(PLAN_OUT), JSON.stringify(plan, null, 2));
  console.log(`\nWrote plan → ${PLAN_OUT}`);
}

if (!APPLY) {
  console.log(
    `\nDry run. Use --apply to make changes. Flags: [--rename] [--rm] [--board <path|url>] [--ext md] [--dist N] [--ratio 0.12] [--taskdist N] [--taskratio 0.14] [--rename-solo] [--plan out.json]`,
  );
  process.exit(0);
}

let trashDir = null;
if (!PERMA) {
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  trashDir = join(DIR, `.dedupe_trash_${ts}`);
  await mkdir(trashDir, { recursive: true });
}

// Execute
for (const a of actions) {
  for (const d of a.drops) {
    await rm(d.path);
  }
  if (a.desiredName) {
    if (a.desiredName !== a.keep.path) await rename(a.keep.path, join(DIR, a.desiredName));
  }
}

console.log(
  PERMA ? '\nDeleted extras.' : `\nMoved extras to ${trashDir ? rel(trashDir) : '(none)'}.`,
);
if (DO_RENAME) console.log('Renamed keepers where a Kanban match existed.');

// ---------- helpers ----------
function rel(p) {
  return p.replace(DIR + '/', '');
}
