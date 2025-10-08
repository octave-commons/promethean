import fs from "node:fs/promises";
import path from "node:path";

import { listDir, readFile, searchFiles } from "@promethean/fs/fileExplorer.js";
import { buildTree } from "@promethean/fs/tree.js";

import { loadGitIgnore } from "./gitignore-util.js";

function resolveDir(ROOT_PATH: string, rel: string = "."): string {
  const base = path.resolve(ROOT_PATH);
  const abs = path.resolve(base, rel);
  const relToBase = path.relative(base, abs);
  if (relToBase.startsWith("..") || path.isAbsolute(relToBase)) {
    throw new Error("path outside root");
  }
  return abs;
}

export function normalizeToRoot(
  ROOT_PATH: string,
  inputPath: string | null | undefined,
): string {
  const base = path.resolve(ROOT_PATH);
  const p = String(inputPath || "");
  if (p === "/" || p === "") return base;
  let candidate: string;
  if (path.isAbsolute(p)) {
    const absolute = path.resolve(p);
    if (isInsideRoot(ROOT_PATH, absolute)) {
      candidate = absolute;
    } else if (p.startsWith(path.sep)) {
      candidate = path.resolve(base, p.slice(1));
    } else {
      throw new Error("path outside root");
    }
  } else {
    candidate = path.resolve(base, p.replace(/^[\\/]+/, ""));
  }
  const relToBase = path.relative(base, candidate);
  if (relToBase.startsWith("..") || path.isAbsolute(relToBase)) {
    throw new Error("path outside root");
  }
  return candidate;
}

export function isInsideRoot(ROOT_PATH: string, absOrRel: string): boolean {
  const base = path.resolve(ROOT_PATH);
  const abs = path.isAbsolute(absOrRel)
    ? path.resolve(absOrRel)
    : path.resolve(base, absOrRel);
  const relToBase = path.relative(base, abs);
  return !(relToBase.startsWith("..") || path.isAbsolute(relToBase));
}

export async function resolvePath(
  ROOT_PATH: string,
  p: string | null | undefined,
): Promise<string | null> {
  if (!p) return null;
  const absCandidate = path.resolve(ROOT_PATH, p);
  if (isInsideRoot(ROOT_PATH, absCandidate)) {
    try {
      const st = await fs.stat(absCandidate);
      if (st.isFile()) return absCandidate;
    } catch {}
  }
  const matches = (await searchFiles(ROOT_PATH, p, 1)) as Array<{
    relative: string;
  }>;
  for (const m of matches) {
    const full = path.resolve(ROOT_PATH, m.relative);
    if (isInsideRoot(ROOT_PATH, full)) return full;
  }
  return null;
}

export async function viewFile(
  ROOT_PATH: string,
  relOrFuzzy: string,
  line: number = 1,
  context: number = 25,
) {
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

const RX: Record<string, RegExp> = {
  nodeA: /\(?(?<file>(?:[A-Za-z]:)?[^():\n]+?):(?<line>\d+):(?<col>\d+)\)?/g,
  nodeB: /at\s+.*?\((?<file>[^()]+?):(?<line>\d+):(?<col>\d+)\)/g,
  py: /File\s+"(?<file>[^"]+)",\s+line\s+(?<line>\d+)/g,
  go: /(?<file>(?:[A-Za-z]:)?[^\s:]+?):(?<line>\d+)/g,
};

function normalizeStacktracePath(file: string): string {
  return file.replace(/\\/g, "/");
}

export async function locateStacktrace(
  ROOT_PATH: string,
  text: string,
  context: number = 25,
) {
  const results: any[] = [];
  for (const re of Object.values(RX)) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while (true) {
      m = re.exec(text);
      if (!m) break;
      const g = m.groups as Record<string, string> | undefined;
      const file = g?.file ? normalizeStacktracePath(g.file) : undefined;
      const line = Number(g?.line || 1);
      const col = g?.col ? Number(g.col) : undefined;
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

async function safeView(
  ROOT_PATH: string,
  file: string,
  line: number,
  context: number,
) {
  try {
    return await viewFile(ROOT_PATH, file, line, context);
  } catch {
    return null;
  }
}

type ListDirOptions = {
  hidden?: boolean;
  includeHidden?: boolean;
  type?: string;
};
export async function listDirectory(
  ROOT_PATH: string,
  rel: string,
  options: ListDirOptions = {},
) {
  const includeHidden = Boolean(
    (options as any).hidden || options.includeHidden,
  );
  const type = (options as any).type as string | undefined;
  const abs = resolveDir(ROOT_PATH, rel || ".");
  const ig = await loadGitIgnore(ROOT_PATH, abs);
  const entries = await listDir(ROOT_PATH, rel || ".", { includeHidden });
  const out: Array<{
    name: string;
    path: string;
    type: string;
    size: number | null;
    mtimeMs: number | null;
  }> = [];
  for (const e of entries) {
    if (ig.ignores(e.relative)) continue;
    if (type && e.type !== type) continue;
    const childAbs = path.resolve(ROOT_PATH, e.relative);
    if (!isInsideRoot(ROOT_PATH, childAbs)) continue;
    let size: number | null = null;
    let mtimeMs: number | null = null;
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

type TreeOptions = { includeHidden?: boolean; depth?: number };
export async function treeDirectory(
  ROOT_PATH: string,
  rel: string,
  options: TreeOptions = {},
) {
  const includeHidden = Boolean(options.includeHidden);
  const depth = Number(options.depth || 1);
  const abs = resolveDir(ROOT_PATH, rel || ".");
  const relBase = path.relative(ROOT_PATH, abs) || ".";
  const ig = await loadGitIgnore(ROOT_PATH, abs);
  const raw = await buildTree(abs, {
    includeHidden,
    maxDepth: depth,
    predicate: (absPath) => {
      const relPath = path.relative(ROOT_PATH, absPath);
      if (!relPath) return true;
      return !ig.ignores(relPath);
    },
  });
  function mapNode(node: any) {
    const relPath = path
      .join(relBase, (node.relative as string | undefined) || "")
      .replace(/\\/g, "/");
    const base: any = {
      name: node.name,
      path: relPath || ".",
      type: node.type,
    };
    if (node.children) base.children = (node.children as any[]).map(mapNode);
    if (typeof node.size === "number") base.size = node.size;
    if (typeof node.mtimeMs === "number") base.mtimeMs = node.mtimeMs;
    return base;
  }
  return { ok: true, base: relBase, tree: mapNode(raw) };
}

export async function writeFileContent(
  ROOT_PATH: string,
  filePath: string,
  content: string,
) {
  // Check for symlink security issues before normalizing the path
  await checkSymlinkSecurity(ROOT_PATH, filePath);

  const abs = normalizeToRoot(ROOT_PATH, filePath);
  await fs.writeFile(abs, content, "utf8");
  return { path: filePath };
}

/**
 * Check if a file path is safe with respect to symlinks
 */
async function checkSymlinkSecurity(ROOT_PATH: string, filePath: string): Promise<void> {
  const base = path.resolve(ROOT_PATH);

  // Check if the file already exists as a symlink - use lstat to detect symlinks
  const fullPath = path.resolve(base, filePath);

  try {
    const stat = await fs.lstat(fullPath);
    if (stat.isSymbolicLink()) {
      // Resolve the symlink and check if it points outside the root
      const realPath = await fs.realpath(fullPath);
      if (!isInsideRoot(ROOT_PATH, realPath)) {
        throw new Error("Security: Symlink points outside allowed directory");
      }
    }
    // If we get here, the file exists and is safe
    return;
  } catch (error: any) {
    // Re-throw security violations immediately
    if (error.message?.includes('Security:')) {
      throw error;
    }

    // File doesn't exist, check all path components for symlinks
    const pathComponents = filePath.split('/').filter(Boolean);
    let currentPath = base;

    for (const component of pathComponents) {
      currentPath = path.join(currentPath, component);

      try {
        // Use lstat to check if the path component itself is a symlink
        const stat = await fs.lstat(currentPath);
        if (stat.isSymbolicLink()) {
          const realPath = await fs.realpath(currentPath);
          if (!isInsideRoot(ROOT_PATH, realPath)) {
            throw new Error("Security: Path component symlink points outside allowed directory");
          }
        }
      } catch (statError: any) {
        // Re-throw security violations immediately
        if (statError.message?.includes('Security:')) {
          throw statError;
        }
        // Path component doesn't exist, continue checking
      }
    }
  }
}


export async function writeFileLines(
  ROOT_PATH: string,
  filePath: string,
  lines: string[],
  startLine: number,
) {
  // Check for symlink security issues before normalizing the path
  await checkSymlinkSecurity(ROOT_PATH, filePath);

  const abs = normalizeToRoot(ROOT_PATH, filePath);

  let fileLines: string[] = [];
  try {
    const raw = await fs.readFile(abs, "utf8");
    fileLines = raw.split(/\r?\n/);
  } catch {
    // treat as empty file when the target does not exist yet
  }
  const idx = Math.max(0, startLine - 1);
  fileLines.splice(idx, lines.length, ...lines);
  await fs.writeFile(abs, fileLines.join("\n"), "utf8");
  return { path: filePath };
}
