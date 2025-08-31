// @ts-nocheck
import fs from "node:fs/promises";
import path from "node:path";
import { listDir, readFile, searchFiles } from "@promethean/fs/fileExplorer.js";
import { buildTree } from "@promethean/fs/tree.js";
import { loadGitIgnore } from "./gitignore-util.js";

function resolveDir(ROOT_PATH, rel = ".") {
  const base = path.resolve(ROOT_PATH);
  const abs = path.resolve(base, rel);
  if (!abs.startsWith(base)) throw new Error("path outside root");
  return abs;
}

export async function resolvePath(ROOT_PATH, p) {
  if (!p) return null;
  const absCandidate = path.resolve(ROOT_PATH, p);
  try {
    const st = await fs.stat(absCandidate);
    if (st.isFile()) return absCandidate;
  } catch {}
  const matches = await searchFiles(ROOT_PATH, p, 1);
  if (matches.length) return path.resolve(ROOT_PATH, matches[0].relative);
  return null;
}

export async function viewFile(ROOT_PATH, relOrFuzzy, line = 1, context = 25) {
  const abs = await resolvePath(ROOT_PATH, relOrFuzzy);
  if (!abs) throw new Error("file not found");
  const rel = path.relative(ROOT_PATH, abs);
  const raw = await readFile(ROOT_PATH, rel);
  const lines = raw.split(/\r?\n/);
  const L = Math.max(1, Math.min(lines.length, Number(line) || 1));
  const ctx = Math.max(0, Number(context) || 0);
  const start = Math.max(1, L - ctx);
  const end = Math.min(lines.length, L + ctx);
  return {
    path: rel,
    totalLines: lines.length,
    startLine: start,
    endLine: end,
    focusLine: L,
    snippet: lines.slice(start - 1, end).join("\n"),
  };
}

const RX = {
  nodeA: /\(?(?<file>[^():\n]+?):(?<line>\d+):(?<col>\d+)\)?/g,
  nodeB: /at\s+.*?\((?<file>[^()]+?):(?<line>\d+):(?<col>\d+)\)/g,
  py: /File\s+"(?<file>[^"]+)",\s+line\s+(?<line>\d+)/g,
  go: /(?<file>[^\s:]+?):(?<line>\d+)/g,
};

export async function locateStacktrace(ROOT_PATH, text, context = 25) {
  const results = [];
  for (const key of Object.keys(RX)) {
    const re = RX[key];
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while (true) {
      m = re.exec(text);
      if (!m) break;
      const file = m.groups?.file;
      const line = Number(m.groups?.line || 1);
      const col = m.groups?.col ? Number(m.groups.col) : undefined;
      if (!file) continue;
      const snippet = await safeView(ROOT_PATH, file, line, context);
      if (snippet) {
        results.push({
          path: snippet.path,
          line,
          column: col,
          resolved: true,
          relPath: snippet.path,
          startLine: snippet.startLine,
          endLine: snippet.endLine,
          focusLine: snippet.focusLine,
          snippet: snippet.snippet,
        });
      } else {
        results.push({ path: file, line, column: col, resolved: false });
      }
    }
  }
  return results;
}

async function safeView(ROOT_PATH, file, line, context) {
  try {
    return await viewFile(ROOT_PATH, file, line, context);
  } catch {
    return null;
  }
}

export async function listDirectory(ROOT_PATH, rel, options = {}) {
  const includeHidden = Boolean(options.hidden || options.includeHidden);
  const type = options.type;
  const abs = resolveDir(ROOT_PATH, rel || ".");
  const ig = await loadGitIgnore(ROOT_PATH, abs);
  const entries = await listDir(ROOT_PATH, rel || ".", { includeHidden });
  const out = [];
  for (const e of entries) {
    if (ig.ignores(e.relative)) continue;
    if (type && e.type !== type) continue;
    const childAbs = path.resolve(ROOT_PATH, e.relative);
    let size = null;
    let mtimeMs = null;
    try {
      const s = await fs.stat(childAbs);
      size = e.type === "file" ? s.size : null;
      mtimeMs = s.mtimeMs;
    } catch {}
    out.push({ name: e.name, path: e.relative, type: e.type, size, mtimeMs });
  }
  out.sort((a, b) => {
    if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
  return { ok: true, base: path.relative(ROOT_PATH, abs) || ".", entries: out };
}

export async function treeDirectory(ROOT_PATH, rel, options = {}) {
  const includeHidden = Boolean(options.includeHidden);
  const depth = Number(options.depth || 1);
  const abs = resolveDir(ROOT_PATH, rel || ".");
  const relBase = path.relative(ROOT_PATH, abs) || ".";
  const ig = await loadGitIgnore(ROOT_PATH, abs);
  const raw = await buildTree(abs, {
    includeHidden,
    maxDepth: depth,
    predicate: (absPath, dirent) => {
      const relPath = path.relative(ROOT_PATH, path.join(absPath, dirent.name));
      return !ig.ignores(relPath);
    },
  });
  function mapNode(node) {
    const relPath = path.join(relBase, node.relative || "").replace(/\\/g, "/");
    const base = { name: node.name, path: relPath || ".", type: node.type };
    if (node.children) base.children = node.children.map(mapNode);
    if (typeof node.size === "number") base.size = node.size;
    if (typeof node.mtimeMs === "number") base.mtimeMs = node.mtimeMs;
    return base;
  }
  return { ok: true, base: relBase, tree: mapNode(raw) };
}
