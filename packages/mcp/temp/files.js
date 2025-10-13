"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeFileLines = exports.writeFileContent = exports.treeDirectory = exports.listDirectory = exports.viewFile = exports.resolvePath = exports.isInsideRoot = exports.normalizeToRoot = exports.getMcpRoot = void 0;
const fs = __importStar(require("node:fs/promises"));
const path = __importStar(require("node:path"));
// Resolve base path from env or CWD,
// this is the 'sandbox' root.
const getMcpRoot = () => {
    const base = process.env.MCP_ROOT_PATH || process.cwd();
    return path.resolve(base);
};
exports.getMcpRoot = getMcpRoot;
/** Strip a leading "../" etc. and never return a path outside the root. */
const normalizeToRoot = (ROOT_PATH, rel = '.') => {
    const base = path.resolve(ROOT_PATH);
    // If rel is already absolute, check if it's inside the root
    if (rel && path.isAbsolute(rel)) {
        const abs = path.resolve(rel);
        if ((0, exports.isInsideRoot)(ROOT_PATH, abs)) {
            return abs;
        }
        throw new Error('path outside root');
    }
    // Otherwise resolve relative to the base
    const abs = path.resolve(base, rel || '.');
    const relToBase = path.relative(base, abs);
    if (relToBase.startsWith('..') || path.isAbsolute(relToBase)) {
        throw new Error('path outside root');
    }
    return abs;
};
exports.normalizeToRoot = normalizeToRoot;
/** Check if an absolute path is still inside the sandbox root. */
const isInsideRoot = (ROOT_PATH, absOrRel) => {
    const base = path.resolve(ROOT_PATH);
    // If absOrRel is already absolute, use it directly
    const abs = path.isAbsolute(absOrRel) ? path.resolve(absOrRel) : path.resolve(base, absOrRel);
    const relToBase = path.relative(base, abs);
    return !(relToBase.startsWith('..') || path.isAbsolute(relToBase));
};
exports.isInsideRoot = isInsideRoot;
// Resolve the absolute path for a string, only return if it's a file and stays within root.
const resolvePath = async (ROOT_PATH, p) => {
    if (!p)
        return null;
    try {
        const absCandidate = (0, exports.normalizeToRoot)(ROOT_PATH, p);
        if (!(0, exports.isInsideRoot)(ROOT_PATH, absCandidate))
            return null;
        const st = await fs.stat(absCandidate);
        if (st.isFile())
            return absCandidate;
    }
    catch {
        return null;
    }
    return null;
};
exports.resolvePath = resolvePath;
// Read a file within sandbox.
const viewFile = async (ROOT_PATH, relOrFuzzy, line = 1, context = 25) => {
    const abs = await (0, exports.resolvePath)(ROOT_PATH, relOrFuzzy);
    if (!abs)
        throw new Error('file not found');
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
exports.viewFile = viewFile;
const listDirectory = async (ROOT_PATH, rel, options = {}) => {
    const includeHidden = Boolean(options.hidden ?? options.includeHidden);
    const abs = (0, exports.normalizeToRoot)(ROOT_PATH, rel || '.');
    const dirents = await fs.readdir(abs, { withFileTypes: true });
    const entries = dirents
        .filter((entry) => !entry.name.startsWith('.') || includeHidden)
        .map(async (entry) => {
        const childAbs = path.resolve(abs, entry.name);
        if (!(0, exports.isInsideRoot)(ROOT_PATH, childAbs))
            return null;
        const stats = await fs.stat(childAbs).catch(() => null);
        const size = stats && !entry.isDirectory() ? stats.size : null;
        const mtimeMs = stats ? stats.mtimeMs : null;
        return {
            name: entry.name,
            path: entry.name,
            type: entry.isDirectory() ? 'dir' : 'file',
            size,
            mtimeMs,
        };
    });
    const materialized = (await Promise.all(entries)).filter((e) => e !== null);
    materialized.sort((a, b) => {
        if (a.type !== b.type)
            return a.type === 'dir' ? -1 : 1;
        return a.name.localeCompare(b.name);
    });
    return {
        ok: true,
        base: path.relative(ROOT_PATH, abs).replace(/\\/g, '/') || '.',
        entries: materialized,
    };
};
exports.listDirectory = listDirectory;
// Depth-tree with filters (basic version of bridge's tree)
const treeDirectory = async (ROOT_PATH, sel, options = {}) => {
    const includeHidden = options.includeHidden ?? false;
    const maxDepth = Math.max(1, Number(options.depth || 1));
    const abs = (0, exports.normalizeToRoot)(ROOT_PATH, sel || '.');
    const baseRel = (path.relative(ROOT_PATH, abs) || '.').replace(/\\/g, '/');
    const walk = async (currentAbs, relToRoot, level) => {
        const dirents = await fs.readdir(currentAbs, { withFileTypes: true });
        const nodes = await Promise.all(dirents.map(async (entry) => {
            if (entry.name.startsWith('.') && !includeHidden)
                return null;
            const childAbs = path.join(currentAbs, entry.name);
            if (!(0, exports.isInsideRoot)(ROOT_PATH, childAbs))
                return null;
            const childRel = relToRoot === '.' ? entry.name : `${relToRoot}/${entry.name}`;
            const stats = await fs.stat(childAbs).catch(() => null);
            const baseNode = {
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
        }));
        const materialized = nodes.filter((node) => node !== null);
        materialized.sort((a, b) => {
            if (a.type !== b.type)
                return a.type === 'dir' ? -1 : 1;
            return a.name.localeCompare(b.name);
        });
        return materialized;
    };
    const tree = await walk(abs, baseRel === '' ? '.' : baseRel, 1);
    return { ok: true, base: baseRel, tree };
};
exports.treeDirectory = treeDirectory;
// Check if any component of the path is a symlink that could escape the sandbox
const validatePathSecurity = async (ROOT_PATH, targetPath) => {
    const root = path.resolve(ROOT_PATH);
    const target = path.resolve(targetPath);
    // Check each path component for symlinks
    const components = path.relative(root, target).split(path.sep);
    let currentPath = root;
    for (const component of components) {
        if (component === '..') {
            throw new Error('path traversal detected');
        }
        if (component === '')
            continue; // Skip empty components
        currentPath = path.join(currentPath, component);
        try {
            const stats = await fs.lstat(currentPath);
            if (stats.isSymbolicLink()) {
                const linkTarget = await fs.readlink(currentPath);
                const resolvedTarget = path.resolve(path.dirname(currentPath), linkTarget);
                // Check if the symlink target would escape the sandbox
                if (!(0, exports.isInsideRoot)(root, resolvedTarget)) {
                    throw new Error('symlink escape detected');
                }
            }
        }
        catch (error) {
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
                if (!(0, exports.isInsideRoot)(root, resolvedTarget)) {
                    throw new Error('parent symlink escape detected');
                }
            }
        }
        catch (error) {
            // Directory doesn't exist or can't be accessed
            // But don't swallow symlink escape errors
            if (error instanceof Error && error.message.includes('symlink escape detected')) {
                throw error;
            }
        }
    }
};
// Write a file with utf8 encoding.
const writeFileContent = async (ROOT_PATH, filePath, content) => {
    const abs = (0, exports.normalizeToRoot)(ROOT_PATH, filePath);
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
exports.writeFileContent = writeFileContent;
// Append and/or insert lines, persistent and pure.
const writeFileLines = async (ROOT_PATH, filePath, lines, startLine) => {
    const abs = (0, exports.normalizeToRoot)(ROOT_PATH, filePath);
    // Validate path security before writing
    await validatePathSecurity(ROOT_PATH, abs);
    await fs.mkdir(path.dirname(abs), { recursive: true });
    let fileLines = [];
    try {
        const raw = await fs.readFile(abs, 'utf8');
        fileLines = raw.split(/\r?\n/);
    }
    catch {
        // Missing file: start from empty and proceed with inserts.
    }
    const idx = Math.max(0, Math.min(fileLines.length, startLine - 1));
    const next = [...fileLines.slice(0, idx), ...lines, ...fileLines.slice(idx)];
    await fs.writeFile(abs, next.join('\n'), 'utf8');
    return { path: filePath };
};
exports.writeFileLines = writeFileLines;
exports.default = {
    getMcpRoot: exports.getMcpRoot,
    normalizeToRoot: exports.normalizeToRoot,
    isInsideRoot: exports.isInsideRoot,
    resolvePath: exports.resolvePath,
    viewFile: exports.viewFile,
    listDirectory: exports.listDirectory,
    treeDirectory: exports.treeDirectory,
    writeFileContent: exports.writeFileContent,
    writeFileLines: exports.writeFileLines,
};
