import fs from 'node:fs/promises';
import path from 'node:path';

// Resolve base path from env or CWD,
// this is the 'sandbox' root.
export const getMcpRoot = (): string => {
  const base = process.env.MCP_ROOT_PATH || process.cwd();
  return path.resolve(base);
};

/** Strip a leading "../" etc. and never return a path outside the root. */
export const normalizeToRoot = (ROOT_PATH: string, rel: string | undefined = '.'): string => {
  const base = path.resolve(ROOT_PATH);
  const abs = path.resolve(base, rel || '.');
  const relToBase = path.relative(base, abs);
  if (relToBase.startsWith('..') || path.isAbsolute(relToBase)) {
    throw new Error('path outside root');
  }
  return abs;
};

/** Check if an absolute path is still inside the sandbox root. */
export const isInsideRoot = (ROOT_PATH: string, absOrRel: string): boolean => {
  const base = path.resolve(ROOT_PATH);
  const abs = path.resolve(base, absOrRel);
  const relToBase = path.relative(base, abs);
  return !(relToBase.startsWith('..') || path.isAbsolute(relToBase));
};

// Resolve the absolute path for a string, only return if it's a file and stays within root.
export const resolvePath = async (
  ROOT_PATH: string,
  p: string | null | undefined,
): Promise<string | null> => {
  if (!p) return null;
  try {
    const absCandidate = normalizeToRoot(ROOT_PATH, p);
    if (!isInsideRoot(ROOT_PATH, absCandidate)) return null;
    const st = await fs.stat(absCandidate);
    if (st.isFile()) return absCandidate;
  } catch {
    return null;
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
  const rel = path.relative(ROOT_PATH, abs).replace(/\\/g, '/');
  const raw = await fs.readFile(abs, 'utf8');
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
    snippet: lines.slice(start - 1, end).join('\n'),
  };
};

// List directory (root-relative) non-recursively.
type ListDirOptions = Readonly<{ hidden?: boolean; includeHidden?: boolean }>;

type ListDirEntry = {
  name: string;
  path: string;
  type: 'dir' | 'file';
  size: number | null;
  mtimeMs: number | null;
};

export const listDirectory = async (
  ROOT_PATH: string,
  rel: string,
  options: ListDirOptions = {},
) => {
  const includeHidden = Boolean(options.hidden ?? options.includeHidden);
  const abs = normalizeToRoot(ROOT_PATH, rel || '.');
  const dirents = await fs.readdir(abs, { withFileTypes: true });
  const entries = dirents
    .filter((entry) => !entry.name.startsWith('.') || includeHidden)
    .map(async (entry) => {
      const childAbs = path.resolve(abs, entry.name);
      if (!isInsideRoot(ROOT_PATH, childAbs)) return null;
      const stats = await fs.stat(childAbs).catch(() => null);
      const size = stats && !entry.isDirectory() ? stats.size : null;
      const mtimeMs = stats ? stats.mtimeMs : null;
      return {
        name: entry.name,
        path: entry.name,
        type: entry.isDirectory() ? 'dir' : 'file',
        size,
        mtimeMs,
      } as ListDirEntry;
    });
  const materialized = (await Promise.all(entries)).filter((e): e is ListDirEntry => e !== null);
  materialized.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
  return {
    ok: true,
    base: path.relative(ROOT_PATH, abs).replace(/\\/g, '/') || '.',
    entries: materialized,
  };
};

type TreeOptions = { includeHidden?: boolean; depth?: number };
type TreeNode = {
  name: string;
  path: string;
  type: 'dir' | 'file';
  size?: number;
  mtimeMs?: number;
  children?: TreeNode[];
};

// Depth-tree with filters (basic version of bridge's tree)
export const treeDirectory = async (ROOT_PATH: string, sel: string, options: TreeOptions = {}) => {
  const includeHidden = options.includeHidden ?? false;
  const maxDepth = Math.max(1, Number(options.depth || 1));
  const abs = normalizeToRoot(ROOT_PATH, sel || '.');
  const baseRel = (path.relative(ROOT_PATH, abs) || '.').replace(/\\/g, '/');

  const walk = async (
    currentAbs: string,
    relToRoot: string,
    level: number,
  ): Promise<TreeNode[]> => {
    const dirents = await fs.readdir(currentAbs, { withFileTypes: true });
    const nodes = await Promise.all(
      dirents.map(async (entry) => {
        if (entry.name.startsWith('.') && !includeHidden) return null;
        const childAbs = path.join(currentAbs, entry.name);
        if (!isInsideRoot(ROOT_PATH, childAbs)) return null;
        const childRel = relToRoot === '.' ? entry.name : `${relToRoot}/${entry.name}`;
        const stats = await fs.stat(childAbs).catch(() => null);
        const baseNode: TreeNode = {
          name: entry.name,
          path: childRel,
          type: entry.isDirectory() ? 'dir' : 'file',
          ...(stats && !entry.isDirectory() ? { size: stats.size } : {}),
          ...(stats ? { mtimeMs: stats.mtimeMs } : {}),
        };
        if (!entry.isDirectory() || level >= maxDepth) {
          return baseNode;
        }
        const children = await walk(childAbs, childRel, level + 1);
        return { ...baseNode, children };
      }),
    );
    const materialized = nodes.filter((node): node is TreeNode => node !== null);
    materialized.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    return materialized;
  };

  const tree = await walk(abs, baseRel === '' ? '.' : baseRel, 1);
  return { ok: true, base: baseRel, tree };
};

// Check if any component of the path is a symlink that could escape the sandbox
const validatePathSecurity = async (ROOT_PATH: string, targetPath: string): Promise<void> => {
  const root = path.resolve(ROOT_PATH);
  const target = path.resolve(targetPath);

  // Check each path component for symlinks
  const components = path.relative(root, target).split(path.sep);
  let currentPath = root;

  for (const component of components) {
    if (component === '..') {
      throw new Error('path traversal detected');
    }

    if (component === '') continue; // Skip empty components

    currentPath = path.join(currentPath, component);

    try {
      const stats = await fs.lstat(currentPath);
      if (stats.isSymbolicLink()) {
        const linkTarget = await fs.readlink(currentPath);
        const resolvedTarget = path.resolve(path.dirname(currentPath), linkTarget);

        // Check if the symlink target would escape the sandbox
        if (!isInsideRoot(root, resolvedTarget)) {
          throw new Error('symlink escape detected');
        }
      }
    } catch (error) {
      // If we can't stat the path, continue checking parent directories
      // This handles cases where we're creating new files/directories
      // But don't swallow symlink escape errors
      if (error instanceof Error && error.message.includes('symlink escape detected')) {
        throw error;
      }
    }
  }

  // Also check all parent directories up to the root
  let checkPath = target;
  while (checkPath !== root && checkPath !== path.dirname(checkPath)) {
    checkPath = path.dirname(checkPath);
    try {
      const stats = await fs.lstat(checkPath);
      if (stats.isSymbolicLink()) {
        const linkTarget = await fs.readlink(checkPath);
        const resolvedTarget = path.resolve(path.dirname(checkPath), linkTarget);

        // Check if the symlink target would escape the sandbox
        if (!isInsideRoot(root, resolvedTarget)) {
          throw new Error('parent symlink escape detected');
        }
      }
    } catch (error) {
      // Directory doesn't exist or can't be accessed
      // But don't swallow symlink escape errors
      if (error instanceof Error && error.message.includes('symlink escape detected')) {
        throw error;
      }
    }
  }
};

// Write a file with utf8 encoding.
export const writeFileContent = async (ROOT_PATH: string, filePath: string, content: string) => {
  const abs = normalizeToRoot(ROOT_PATH, filePath);

  // Validate path security before any file operations
  await validatePathSecurity(ROOT_PATH, abs);

  // Also validate the parent directory path before mkdir
  const parentDir = path.dirname(abs);
  if (parentDir !== abs) {
    await validatePathSecurity(ROOT_PATH, parentDir);
  }

  await fs.mkdir(parentDir, { recursive: true });
  await fs.writeFile(abs, content, 'utf8');
  return { path: filePath };
};

// Append and/or insert lines, persistent and pure.
export const writeFileLines = async (
  ROOT_PATH: string,
  filePath: string,
  lines: string[],
  startLine: number,
) => {
  const abs = normalizeToRoot(ROOT_PATH, filePath);

  // Validate path security before writing
  await validatePathSecurity(ROOT_PATH, abs);

  await fs.mkdir(path.dirname(abs), { recursive: true });
  let fileLines: string[] = [];
  try {
    const raw = await fs.readFile(abs, 'utf8');
    fileLines = raw.split(/\r?\n/);
  } catch {
    // Missing file: start from empty and proceed with inserts.
  }
  const idx = Math.max(0, Math.min(fileLines.length, startLine - 1));
  const next = [...fileLines.slice(0, idx), ...lines, ...fileLines.slice(idx)];
  await fs.writeFile(abs, next.join('\n'), 'utf8');
  return { path: filePath };
};

export default {
  getMcpRoot,
  normalizeToRoot,
  isInsideRoot,
  resolvePath,
  viewFile,
  listDirectory,
  treeDirectory,
  writeFileContent,
  writeFileLines,
};
