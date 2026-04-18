#!/usr/bin/env node
/**
 * Quartz Garden (Cephalon Hive) — Import Graph Builder
 *
 * Generates file-level and subsystem-level import graphs for a source tree.
 *
 * Default target: packages/cephalon-ts/src
 * Output: services/cephalon-hive/quartz-garden/
 */

import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";

const DEFAULT_ROOT = "packages/cephalon-ts/src";
const DEFAULT_OUT_DIR = "services/cephalon-hive/quartz-garden";
const DEFAULT_ID = "cephalon-ts";
const DEFAULT_TITLE = "Cephalon TS imports";

const DEFAULT_ENTRYPOINTS = [
  "main.ts",
  "app.ts",
  "cli.ts",
  "hive-cli.ts",
];

const SOURCE_EXTS = new Set([".ts", ".tsx", ".js", ".mjs", ".cjs"]);
const RESOLVE_EXTS = [".ts", ".tsx", ".js", ".mjs", ".cjs"];

function toPosix(p) {
  return p.split(path.sep).join("/");
}

function isInside(child, parent) {
  const rel = path.relative(parent, child);
  return rel === "" || (!rel.startsWith(".." + path.sep) && rel !== ".." && !path.isAbsolute(rel));
}

function parseArgs(argv) {
  const args = {
    root: DEFAULT_ROOT,
    outDir: DEFAULT_OUT_DIR,
    id: DEFAULT_ID,
    title: DEFAULT_TITLE,
    includeTests: false,
    render: true,
    entrypoints: [...DEFAULT_ENTRYPOINTS],
  };

  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--root") {
      args.root = argv[i + 1] ?? args.root;
      i += 1;
      continue;
    }
    if (token === "--out") {
      args.outDir = argv[i + 1] ?? args.outDir;
      i += 1;
      continue;
    }
    if (token === "--id") {
      args.id = argv[i + 1] ?? args.id;
      i += 1;
      continue;
    }
    if (token === "--title") {
      args.title = argv[i + 1] ?? args.title;
      i += 1;
      continue;
    }
    if (token === "--include-tests") {
      args.includeTests = true;
      continue;
    }
    if (token === "--no-render") {
      args.render = false;
      continue;
    }
    if (token === "--entry") {
      const next = argv[i + 1];
      if (typeof next === "string" && next.trim().length > 0) {
        args.entrypoints.push(next);
      }
      i += 1;
      continue;
    }
  }

  // Deduplicate entrypoints while preserving order.
  args.entrypoints = args.entrypoints
    .map((entry) => entry.trim())
    .filter(Boolean)
    .filter((entry, idx, arr) => arr.indexOf(entry) === idx);

  args.id = String(args.id || DEFAULT_ID)
    .trim()
    .replaceAll(/[^a-zA-Z0-9_-]/g, "-")
    .replaceAll(/-+/g, "-")
    .replaceAll(/^-|-$/g, "") || DEFAULT_ID;

  args.title = String(args.title || DEFAULT_TITLE).trim() || DEFAULT_TITLE;

  return args;
}

function shouldIgnore(relPosix, includeTests) {
  if (relPosix.startsWith("node_modules/")) return true;
  if (relPosix.startsWith("dist/")) return true;
  if (relPosix.startsWith("coverage/")) return true;
  if (relPosix.startsWith(".shadow-cljs/")) return true;

  if (!includeTests) {
    if (relPosix.includes("/tests/")) return true;
    if (relPosix.includes("/__tests__/")) return true;
    if (/(^|\/)test\//.test(relPosix)) return true;
    if (/\.test\.[cm]?[jt]sx?$/.test(relPosix)) return true;
    if (/\.spec\.[cm]?[jt]sx?$/.test(relPosix)) return true;
  }

  return false;
}

async function walkFiles(rootAbs, includeTests) {
  /** @type {string[]} */
  const results = [];

  /** @type {string[]} */
  const stack = [rootAbs];
  while (stack.length > 0) {
    const dir = stack.pop();
    if (!dir) continue;

    const entries = await fsp.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const abs = path.join(dir, entry.name);
      const rel = toPosix(path.relative(rootAbs, abs));
      if (shouldIgnore(rel, includeTests)) continue;

      if (entry.isDirectory()) {
        stack.push(abs);
        continue;
      }

      const ext = path.extname(entry.name);
      if (!SOURCE_EXTS.has(ext)) continue;
      results.push(abs);
    }
  }

  results.sort();
  return results;
}

function extractImportSpecifiers(sourceText) {
  /** @type {Set<string>} */
  const specs = new Set();

  // ESM: import ... from 'x' / export ... from 'x' / import 'x'
  // NOTE: intentionally simple; we only need module spec strings.
  const esm = /\b(?:import|export)\s+(?:type\s+)?(?:[^;'"`]*?\s+from\s+)?["']([^"']+)["']/g;
  for (const match of sourceText.matchAll(esm)) {
    if (match[1]) specs.add(match[1]);
  }

  // Dynamic import('x')
  const dyn = /\bimport\(\s*["']([^"']+)["']\s*\)/g;
  for (const match of sourceText.matchAll(dyn)) {
    if (match[1]) specs.add(match[1]);
  }

  // CommonJS require('x')
  const req = /\brequire\(\s*["']([^"']+)["']\s*\)/g;
  for (const match of sourceText.matchAll(req)) {
    if (match[1]) specs.add(match[1]);
  }

  return [...specs];
}

function resolveCandidateFiles(absWithoutExtOrAsGiven) {
  // Return possible files for a given path which may already have an extension.
  const ext = path.extname(absWithoutExtOrAsGiven);
  const baseNoExt = ext ? absWithoutExtOrAsGiven.slice(0, -ext.length) : absWithoutExtOrAsGiven;

  /** @type {string[]} */
  const candidates = [];

  // 1) As-given
  candidates.push(absWithoutExtOrAsGiven);

  // 2) If it's a .js-ish spec, try .ts/.tsx
  if ([".js", ".mjs", ".cjs"].includes(ext)) {
    candidates.push(baseNoExt + ".ts");
    candidates.push(baseNoExt + ".tsx");
  }

  // 3) If it has an ext already, also try stripping it and re-adding common ones.
  for (const e of RESOLVE_EXTS) {
    candidates.push(baseNoExt + e);
  }

  // 4) Directory index resolution
  candidates.push(path.join(absWithoutExtOrAsGiven, "index.ts"));
  candidates.push(path.join(absWithoutExtOrAsGiven, "index.tsx"));
  candidates.push(path.join(absWithoutExtOrAsGiven, "index.js"));
  candidates.push(path.join(absWithoutExtOrAsGiven, "index.mjs"));
  candidates.push(path.join(absWithoutExtOrAsGiven, "index.cjs"));

  // 5) If ext was present, also try directory index on the no-ext form.
  candidates.push(path.join(baseNoExt, "index.ts"));
  candidates.push(path.join(baseNoExt, "index.tsx"));
  candidates.push(path.join(baseNoExt, "index.js"));
  candidates.push(path.join(baseNoExt, "index.mjs"));
  candidates.push(path.join(baseNoExt, "index.cjs"));

  // Dedup while preserving order.
  return candidates.filter((c, idx, arr) => arr.indexOf(c) === idx);
}

function resolveImportToFile(fromAbsFile, spec) {
  if (!spec.startsWith("./") && !spec.startsWith("../")) return null;
  const fromDir = path.dirname(fromAbsFile);
  const abs = path.resolve(fromDir, spec);

  for (const candidate of resolveCandidateFiles(abs)) {
    try {
      const stat = fs.statSync(candidate);
      if (stat.isFile()) return candidate;
    } catch {
      // ignore
    }
  }

  return null;
}

function groupForRelPath(relPosix) {
  const parts = relPosix.split("/");
  if (parts.length <= 1) return "(root)";
  return parts[0] || "(root)";
}

function stableColorForGroup(group) {
  // Tiny deterministic hash -> pastel-ish HSL.
  let hash = 0;
  for (let i = 0; i < group.length; i += 1) {
    hash = (hash * 31 + group.charCodeAt(i)) >>> 0;
  }
  const hue = hash % 360;
  return `"${hue} 0.28 0.96"`; // Graphviz H,S,L in "h s l" format.
}

function dotQuote(value) {
  return `"${String(value).replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`;
}

function renderDot(dotPath, svgPath, pngPath) {
  const svg = spawnSync("dot", ["-Tsvg", dotPath, "-o", svgPath], { stdio: "inherit" });
  if (svg.status !== 0) {
    throw new Error(`dot -Tsvg failed for ${dotPath}`);
  }
  const png = spawnSync("dot", ["-Tpng", dotPath, "-o", pngPath], { stdio: "inherit" });
  if (png.status !== 0) {
    throw new Error(`dot -Tpng failed for ${dotPath}`);
  }
}

function buildDotFile({
  title,
  rootRel,
  nodes,
  edges,
  groupBy,
  highlightNodes = new Set(),
}) {
  /** @type {string[]} */
  const lines = [];
  lines.push("digraph G {");
  lines.push("  graph [rankdir=LR, bgcolor=\"#fcfcff\", fontname=\"Helvetica\", fontsize=18, labelloc=\"t\", labeljust=\"l\", label=" + dotQuote(`${title} — ${rootRel}`) + "]; ");
  lines.push("  node  [shape=box, style=\"rounded,filled\", fontname=\"Helvetica\", fontsize=9, color=\"#c8c8d0\", fillcolor=\"#f4f4fb\"]; ");
  // Graphviz does not accept 3-digit hex colors, so use 6-digit.
  lines.push("  edge  [color=\"#99aabb\", arrowsize=0.55, penwidth=1.0];");
  lines.push("");

  const groups = new Map();
  for (const node of nodes) {
    const group = groupBy(node);
    const list = groups.get(group) ?? [];
    list.push(node);
    groups.set(group, list);
  }

  const groupNames = [...groups.keys()].sort((a, b) => a.localeCompare(b));

  for (const group of groupNames) {
    const clusterName = `cluster_${group.replaceAll(/[^a-zA-Z0-9_]/g, "_")}`;
    const color = stableColorForGroup(group);
    lines.push(`  subgraph ${clusterName} {`);
    lines.push("    style=\"rounded,filled\";");
    lines.push("    color=\"#e6e6ef\";");
    lines.push("    fillcolor=" + color + ";");
    lines.push("    fontname=\"Helvetica\";");
    lines.push("    fontsize=12;");
    lines.push("    label=" + dotQuote(group) + ";");

    for (const rel of groups.get(group) ?? []) {
      const isHot = highlightNodes.has(rel);
      const attrs = [
        "label=" + dotQuote(rel),
        "tooltip=" + dotQuote(rel),
      ];
      if (isHot) {
        attrs.push("color=\"#4b4be0\"");
        attrs.push("fillcolor=\"#e9e9ff\"");
        attrs.push("penwidth=2.2");
      }
      lines.push(`    ${dotQuote(rel)} [${attrs.join(", ")}];`);
    }

    lines.push("  }");
    lines.push("");
  }

  // Edges
  for (const { from, to } of edges) {
    lines.push(`  ${dotQuote(from)} -> ${dotQuote(to)};`);
  }

  lines.push("}");
  return lines.join("\n") + "\n";
}

function buildSubsystemDot({ title, rootRel, subsystems, edges }) {
  /** @type {string[]} */
  const lines = [];
  lines.push("digraph G {");
  lines.push("  graph [rankdir=LR, bgcolor=\"#fcfcff\", fontname=\"Helvetica\", fontsize=18, labelloc=\"t\", labeljust=\"l\", label=" + dotQuote(`${title} — ${rootRel}`) + "]; ");
  lines.push("  node  [shape=box, style=\"rounded,filled\", fontname=\"Helvetica\", fontsize=12, color=\"#c8c8d0\", fillcolor=\"#f4f4fb\"]; ");
  // 6-digit hex (Graphviz-compatible)
  lines.push("  edge  [color=\"#777788\", arrowsize=0.7];");
  lines.push("");

  for (const subsystem of subsystems) {
    const count = subsystem.count;
    const label = `${subsystem.name} (${count})`;
    const fill = stableColorForGroup(subsystem.name);
    lines.push(`  ${dotQuote(subsystem.name)} [label=${dotQuote(label)}, fillcolor=${fill}];`);
  }

  lines.push("");
  for (const edge of edges) {
    const width = Math.min(8, 1 + Math.log10(edge.count + 1) * 3);
    lines.push(
      `  ${dotQuote(edge.from)} -> ${dotQuote(edge.to)} [label=${dotQuote(String(edge.count))}, penwidth=${width.toFixed(2)}];`,
    );
  }

  lines.push("}");
  return lines.join("\n") + "\n";
}

function reachableSubgraph(entryRel, adjacency) {
  /** @type {Set<string>} */
  const visited = new Set();
  /** @type {string[]} */
  const queue = [entryRel];
  visited.add(entryRel);

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) continue;
    const next = adjacency.get(current) ?? new Set();
    for (const to of next) {
      if (visited.has(to)) continue;
      visited.add(to);
      queue.push(to);
    }
  }

  return visited;
}

async function main() {
  const args = parseArgs(process.argv);

  const rootAbs = path.resolve(process.cwd(), args.root);
  const outAbs = path.resolve(process.cwd(), args.outDir);
  await fsp.mkdir(outAbs, { recursive: true });

  const rootRel = toPosix(path.relative(process.cwd(), rootAbs));

  const filesAbs = await walkFiles(rootAbs, args.includeTests);
  const nodesRel = filesAbs.map((abs) => toPosix(path.relative(rootAbs, abs)));
  const nodeSet = new Set(nodesRel);

  /** @type {{ from: string, to: string, spec: string }[]} */
  const edges = [];

  /** @type {Map<string, Set<string>>} */
  const adjacency = new Map();

  for (const absFile of filesAbs) {
    const relFrom = toPosix(path.relative(rootAbs, absFile));
    const text = await fsp.readFile(absFile, "utf8");
    const specs = extractImportSpecifiers(text);

    for (const spec of specs) {
      const resolved = resolveImportToFile(absFile, spec);
      if (!resolved) continue;
      if (!isInside(resolved, rootAbs)) continue;
      const relTo = toPosix(path.relative(rootAbs, resolved));
      if (!nodeSet.has(relTo)) continue;

      edges.push({ from: relFrom, to: relTo, spec });
      const set = adjacency.get(relFrom) ?? new Set();
      set.add(relTo);
      adjacency.set(relFrom, set);
    }
  }

  // Full file graph
  {
    const dot = buildDotFile({
      title: `${args.title} (file-level)` ,
      rootRel,
      nodes: nodesRel,
      edges,
      groupBy: groupForRelPath,
    });

    const dotPath = path.join(outAbs, `${args.id}.imports.dot`);
    const svgPath = path.join(outAbs, `${args.id}.imports.svg`);
    const pngPath = path.join(outAbs, `${args.id}.imports.png`);

    await fsp.writeFile(dotPath, dot, "utf8");
    await fsp.writeFile(
      path.join(outAbs, `${args.id}.imports.json`),
      JSON.stringify({ id: args.id, title: args.title, root: rootRel, nodes: nodesRel, edges }, null, 2) + "\n",
      "utf8",
    );

    if (args.render) renderDot(dotPath, svgPath, pngPath);
  }

  // Subsystem graph
  {
    const subsystemCounts = new Map();
    for (const node of nodesRel) {
      const g = groupForRelPath(node);
      subsystemCounts.set(g, (subsystemCounts.get(g) ?? 0) + 1);
    }

    /** @type {{ name: string, count: number }[]} */
    const subsystems = [...subsystemCounts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    /** @type {Map<string, number>} */
    const edgeCounts = new Map();
    for (const e of edges) {
      const fromG = groupForRelPath(e.from);
      const toG = groupForRelPath(e.to);
      if (fromG === toG) continue;
      const key = `${fromG}→${toG}`;
      edgeCounts.set(key, (edgeCounts.get(key) ?? 0) + 1);
    }

    /** @type {{ from: string, to: string, count: number }[]} */
    const subEdges = [...edgeCounts.entries()]
      .map(([key, count]) => {
        const [from, to] = key.split("→");
        return { from, to, count };
      })
      .sort((a, b) => b.count - a.count);

    const dot = buildSubsystemDot({
      title: `${args.title} (subsystems)` ,
      rootRel,
      subsystems,
      edges: subEdges,
    });

    const dotPath = path.join(outAbs, `${args.id}.subsystems.dot`);
    const svgPath = path.join(outAbs, `${args.id}.subsystems.svg`);
    const pngPath = path.join(outAbs, `${args.id}.subsystems.png`);

    await fsp.writeFile(dotPath, dot, "utf8");
    await fsp.writeFile(
      path.join(outAbs, `${args.id}.subsystems.json`),
      JSON.stringify({ id: args.id, title: args.title, root: rootRel, subsystems, edges: subEdges }, null, 2) + "\n",
      "utf8",
    );

    if (args.render) renderDot(dotPath, svgPath, pngPath);
  }

  // Entrypoint subgraphs
  for (const entry of args.entrypoints) {
    const entryRel = toPosix(entry);
    if (!nodeSet.has(entryRel)) continue;

    const reachable = reachableSubgraph(entryRel, adjacency);

    const filteredNodes = nodesRel.filter((n) => reachable.has(n));
    const filteredEdges = edges.filter((e) => reachable.has(e.from) && reachable.has(e.to));

    const dot = buildDotFile({
      title: `${args.title} entry graph` ,
      rootRel,
      nodes: filteredNodes,
      edges: filteredEdges,
      groupBy: groupForRelPath,
      highlightNodes: new Set([entryRel]),
    });

    const safeName = entryRel.replaceAll("/", "__").replaceAll(".", "_");
    const dotPath = path.join(outAbs, `${args.id}.entry.${safeName}.dot`);
    const svgPath = path.join(outAbs, `${args.id}.entry.${safeName}.svg`);
    const pngPath = path.join(outAbs, `${args.id}.entry.${safeName}.png`);

    await fsp.writeFile(dotPath, dot, "utf8");
    if (args.render) renderDot(dotPath, svgPath, pngPath);
  }

  const summary = {
    id: args.id,
    title: args.title,
    root: rootRel,
    outDir: toPosix(path.relative(process.cwd(), outAbs)),
    nodes: nodesRel.length,
    edges: edges.length,
    includeTests: args.includeTests,
    rendered: args.render,
  };

  console.log("[quartz-garden] done", summary);
}

main().catch((error) => {
  console.error("[quartz-garden] failed", error);
  process.exitCode = 1;
});
