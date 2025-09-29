import path from "path";
import fs from "fs/promises";

import ts from "typescript";

import { scanFiles } from "@promethean/file-indexer";
import type { IndexedFile } from "@promethean/file-indexer";

import { normalizeToRoot, isInsideRoot } from "./files.js";
import {
  createInclusionChecker,
  deriveExtensions,
  toPosixPath,
} from "./glob.js";

export type SymbolEntry = {
  path: string;
  name: string;
  kind: string;
  startLine: number;
  endLine: number;
  signature?: string;
};

let SYMBOL_INDEX: SymbolEntry[] = []; // array of { path, name, kind, startLine, endLine, signature? }

export type SymbolsSnapshot = {
  entries: readonly SymbolEntry[];
  builtAt: number;
  root: string;
};

function splitCSV(s: string | undefined): string[] {
  return (s || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}
function defaultExcludes(): string[] {
  const env = splitCSV(process.env.EXCLUDE_GLOBS);
  return env.length
    ? env
    : ["node_modules/**", ".git/**", "dist/**", "build/**", ".obsidian/**"];
}

function toIgnoreDirs(patterns: readonly string[]): string[] {
  return patterns
    .map((raw) => raw.trim())
    .filter((value) => value.length > 0)
    .map((value) => value.replace(/^!/, ""))
    .map((value) => value.replace(/\\/g, "/"))
    .map((value) => value.replace(/\/\*\*.*$/, ""))
    .map((value) => value.replace(/^\*\*\//, ""))
    .map((value) => value.replace(/^\//, ""))
    .map((value) => value.replace(/\/$/, ""))
    .filter((value) => value.length > 0)
    .map((value) => path.normalize(value));
}

function kindOf(node: ts.Node): string {
  if (ts.isClassDeclaration(node)) return "class";
  if (ts.isInterfaceDeclaration(node)) return "interface";
  if (ts.isFunctionDeclaration(node)) return "function";
  if (ts.isMethodDeclaration(node)) return "method";
  if (ts.isArrowFunction(node)) return "arrow";
  if (ts.isVariableDeclaration(node)) return "var";
  if (ts.isEnumDeclaration(node)) return "enum";
  if (ts.isTypeAliasDeclaration(node)) return "type";
  if (ts.isModuleDeclaration(node)) return "namespace";
  return ts.SyntaxKind[(node as any).kind] || "node";
}

function nameOf(node: ts.Node): string | undefined {
  const n = (node as any).name as ts.Node | undefined;
  if (!n) return undefined;
  const e = (n as any).escapedText;
  return e != null ? String(e) : (n as any).getText?.() ?? undefined;
}

function signatureOf(node: ts.Node, source: ts.SourceFile): string | undefined {
  try {
    const text = (node as any).getText(source) as string;
    const max = 200;
    return text.length > max ? text.slice(0, max) + "…" : text;
  } catch {
    return undefined;
  }
}

function addSymbol(
  target: SymbolEntry[],
  sourceFile: ts.SourceFile,
  node: ts.Node,
  fileRel: string,
) {
  const k = kindOf(node);
  const name =
    nameOf(node) ||
    (ts.isVariableStatement(node)
      ? (node.declarationList?.declarations?.[0] as any)?.name?.getText(
          sourceFile,
        )
      : undefined);
  if (!name) return;
  const { line: startLine } = sourceFile.getLineAndCharacterOfPosition(
    (node as any).getStart(),
  );
  const { line: endLine } = sourceFile.getLineAndCharacterOfPosition(
    (node as any).end,
  );
  const entry: SymbolEntry = {
    path: fileRel,
    name,
    kind: k,
    startLine: startLine + 1,
    endLine: endLine + 1,
  };
  const sig = signatureOf(node, sourceFile);
  if (sig !== undefined) (entry as any).signature = sig;
  target.push(entry);
}

function walk(
  sourceFile: ts.SourceFile,
  fileRel: string,
  target: SymbolEntry[],
) {
  function visit(node: ts.Node) {
    if (
      ts.isClassDeclaration(node) ||
      ts.isInterfaceDeclaration(node) ||
      ts.isFunctionDeclaration(node) ||
      ts.isMethodDeclaration(node) ||
      ts.isVariableStatement(node) ||
      ts.isEnumDeclaration(node) ||
      ts.isTypeAliasDeclaration(node) ||
      ts.isModuleDeclaration(node)
    ) {
      addSymbol(target, sourceFile, node, fileRel);
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
}

type SymbolsIndexOptions = { paths?: string[]; exclude?: string[] };
export async function symbolsIndex(
  ROOT_PATH: string,
  opts: SymbolsIndexOptions = {},
): Promise<{
  files: number;
  symbols: number;
  builtAt: number;
  snapshot: SymbolsSnapshot;
}> {
  const include = opts.paths || ["**/*.{ts,tsx,js,jsx}"];
  const exclude = opts.exclude || defaultExcludes();
  const ignoreDirs = toIgnoreDirs(exclude);
  const extCandidates = deriveExtensions(include);
  const shouldInclude = include.length
    ? createInclusionChecker(include)
    : () => true;
  const shouldExclude = exclude.length
    ? createInclusionChecker(exclude)
    : () => false;
  let count = 0;
  const entries: SymbolEntry[] = [];
  await scanFiles({
    root: ROOT_PATH,
    ...(extCandidates ? { exts: extCandidates } : {}),
    ignoreDirs,
    readContent: true,
    onFile: async (file: IndexedFile) => {
      const abs = path.isAbsolute(file.path)
        ? file.path
        : normalizeToRoot(ROOT_PATH, file.path);
      if (!isInsideRoot(ROOT_PATH, abs)) return;
      const rel = path.relative(ROOT_PATH, abs);
      const normalized = toPosixPath(rel);
      if (shouldExclude(normalized)) return;
      if (!shouldInclude(normalized)) return;
      const text = file.content ?? (await fs.readFile(abs, "utf8"));
      const sf = ts.createSourceFile(abs, text, ts.ScriptTarget.Latest, true);
      walk(sf, rel, entries);
      count++;
    },
  });
  const builtAt = Date.now();
  const snapshot: SymbolsSnapshot = {
    entries,
    builtAt,
    root: path.resolve(ROOT_PATH),
  };
  SYMBOL_INDEX = entries;
  return {
    files: count,
    symbols: entries.length,
    builtAt,
    snapshot,
  };
}

type SymbolsFindOptions = {
  kind?: string;
  path?: string;
  limit?: number;
  snapshot?: SymbolsSnapshot;
};
export async function symbolsFind(
  query: string,
  opts: SymbolsFindOptions = {},
): Promise<SymbolEntry[]> {
  const q = String(query || "").toLowerCase();
  const kind = opts.kind ? String(opts.kind).toLowerCase() : null;
  const pathFilter = opts.path ? String(opts.path).toLowerCase() : null;
  const limit = Number(opts.limit || 200);
  const source = opts.snapshot?.entries ?? SYMBOL_INDEX;
  const out: SymbolEntry[] = [];
  for (const s of source) {
    if (q && !s.name.toLowerCase().includes(q)) continue;
    if (kind && s.kind.toLowerCase() !== kind) continue;
    if (pathFilter && !s.path.toLowerCase().includes(pathFilter)) continue;
    out.push(s);
    if (out.length >= limit) break;
  }
  return out;
}
