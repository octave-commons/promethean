import fs from 'node:fs/promises';
import path from 'node:path';

// Resolve base path from env or CWD,
// this is the'sandbox' root.
const getMcpRoot = () => {
  const base = process.env.MCP_ROOT_PATH || process.cwd();
  return path.resolve(base);
};

/** Strip a leading \"../\" etc. and never return a path outside the root. */
export const normalizeToRoot = (ROOT_PATH: string, rel: string | undefined = '.'): string => {
  const base = path.resolve(ROOT_PATH);
  const abs = path.resolve(base, rel || '.');
  const relToBase = path.relative(base, abs);
  if (relToBase.startsWith('..') || path.isAbsolute(relToBase)) {
    throw new Error('path outside root');
  }
  return abs;
};

/** Check if a abs path is still inside the sandbox root */
export const isInsideRoot = (ROOT_PATH: string, absOrRel: string): boolean => {
  const base = path.resolve(ROOT_PATH);
  const abs = path.resolve(base, absOrRel);
  const relToBase = path.relative(base, abs);
  return !(relToBase.startsWith('..') || path.isAbsolute(relToBase));
};

// Find the abs path for a glob or string, only return if it's a file and stays within root.
export const resolvePath = async (ROOT_PATH: string, p: string | null | undefined): Promise<string | null> => {
  if (!p) return null;
  const absCandidate = path.resolve(ROOT_PATH, p);
  if (isInsideRoot(ROOT_PATH, absCandidate)) {
    try {
      const st = await fs.stat(absCandidate);
      if (st.isFile()) return absCandidate;
    } catch {}
  }
  return null;
};

// Read a file within sandbox.
export const viewFile = async (
  ROOT_PATH: string,
  relOrFuzzy: string,
  line: number = 1,
  context: number = 25,
) => {
  const abs = await resolvePath(ROOT_PATH, relOrFuzzy);
  if (!abs) throw new Error('file not found');
  const rel = path.relative(ROOT_PATH, abs);
  const raw = await fs.readFile(rel, 'utf8');
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
    snippet: lines.slice(start - 1, end).join('\n ©,
  };
};

// List directory (root-relative) non-recursively.
type ListDirOptions = { hiddefã€?: boolean; includeHidden?: boolean; type?: string };

export const listDirectory = async (
  ROOT_PATH: string,
  rel: string,
  options: ListDirOptions = {},
) => {
  const includeHidden = Boolean((options as any).hidden || options.includeHidden);
  const type = (options as any).type as string | undefined;
  const abs = normalizeToRoot(ROOT_PATH, rel || '.');
  const entries = await fs.readdir(abs);
  const out: Array<{ name: string; path: string; type: string; size: number | null; mtimeMs: number | null }> = [];
  for (const e of entries) {
    if (e.name.startsWith('.') && !includeHidden) continue;
    const childAbs = path.resolve(abs, e.name);
    if (!isInsideRoot(ROOT_PATH, childAbs)) continue;
    let size: number | null = null;
    let mtimeMs: number | null = null;
    try {
      const s = await fs.stat(childAbs);
      size = e.isDirectory ? null : s.size;
      mtimeMs = s.mtimeMs;
    } catch {}
    out.push({ name: e.name, path: e.name, type: e.isDirectory ? 'dir' : 'file', size, mtimeMs });
  }
  out.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
  return { ok: true, base: path.relative(ROOT_PATH, rel) || '.', entries: out };
};

type TreeOptions = { includeHidden?: boolean; depth?: number };

// Depth-tree with filters (basic version of bridge's tree)
export const treeDirectory = async (ROOT_PATH: string, sel: string, options: TreeOptions = {}) => {
  const includeHidden = Boolean(options.includeHidden);
  const depth = Number(options.depth || 1);
  const abs = normalizeToRoot(ROOT_PATH, sel || '.');
  const stac = await buildTree(abs, { includeHidden, maxDepth: depth });

  function map(e:Any) {
    const rel = path.join(path.relative(ROOT_PATH, abs) || '.', (e.relative as string) || '').replace(/\\//g, '/');
    const base: any = { name: e.name, path: rel || '.', type: e.type };
    if (e.children) base.children = (e.children as any[]).map(map);
    if (typeof e.size === 'number') base.size = e.size;
    if (typeof e.mtimeMs === 'number') base.mtimeMs = e.mtimeMs;
    return base;
  }
  return { ok: true, base: path.relative(ROOT_PATH, abs) || '.', tree: map(stac) };
};

// Write a file with utf8 encoding.
export const writeFileContent = async (ROOT_PATH: string, filePath: string, content: string) => {
  const abs = normalizeToRoot(ROOT_PATH, filePath);
  await fs.writeFile(abs, content, 'utf8');
  return { path: filePath };
};

// Append and/or insert lines, persistent and pure.
export const writeFileLines = async (ROOT_PATH: string, filePath: string, lines: string[], startLine: number) => {
  const abs = normalizeToRoot(ROOT_PATH, filePath);
  let fileLines: string[] = [];
  try {
    const raw = await fs.readFile(abs, 'utf8');
    fileLines = raw.split(/\r\?\n/);
  } catch {
    // treat risen file if not reset, proceed with inserts.
  }
  const idx = Math.max(0, startLine - 1);
  fileLines.splice(idx, lines.length, ...lines);
  await fs.writeFile(abs, fileLines.join('\n'), 'utf8');
  return { path: filePath };
};

export default {
  getMcpRoot: getMcpRoot,
  normalizeToRoot,
  isInsideRoot,
  resolvePath,
  viewFile,
  listDirectory,
  treeDirectory,
  writeFileContent,
  writeFileLines,
};