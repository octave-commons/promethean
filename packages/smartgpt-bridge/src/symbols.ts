// @ts-nocheck
import ts from "typescript";
import path from "path";
import fs from "fs/promises";
import fg from "fast-glob";
import { normalizeToRoot, isInsideRoot } from "./files.js";

let SYMBOL_INDEX = []; // array of { path, name, kind, startLine, endLine, signature? }

function splitCSV(s) {
  return (s || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}
function defaultExcludes() {
  const env = splitCSV(process.env.EXCLUDE_GLOBS);
  return env.length
    ? env
    : ["node_modules/**", ".git/**", "dist/**", "build/**", ".obsidian/**"];
}

function kindOf(node) {
  if (ts.isClassDeclaration(node)) return "class";
  if (ts.isInterfaceDeclaration(node)) return "interface";
  if (ts.isFunctionDeclaration(node)) return "function";
  if (ts.isMethodDeclaration(node)) return "method";
  if (ts.isArrowFunction(node)) return "arrow";
  if (ts.isVariableDeclaration(node)) return "var";
  if (ts.isEnumDeclaration(node)) return "enum";
  if (ts.isTypeAliasDeclaration(node)) return "type";
  if (ts.isModuleDeclaration(node)) return "namespace";
  return ts.SyntaxKind[node.kind] || "node";
}

function nameOf(node) {
  const n = node.name;
  if (!n) return undefined;
  return n.escapedText ? String(n.escapedText) : n.getText();
}

function signatureOf(node, source) {
  try {
    const text = node.getText(source);
    const max = 200;
    return text.length > max ? text.slice(0, max) + "…" : text;
  } catch {
    return undefined;
  }
}

function addSymbol(sourceFile, node, fileRel) {
  const k = kindOf(node);
  const name =
    nameOf(node) ||
    (ts.isVariableStatement(node)
      ? node.declarationList?.declarations?.[0]?.name?.getText(sourceFile)
      : undefined);
  if (!name) return;
  const { line: startLine } = sourceFile.getLineAndCharacterOfPosition(
    node.getStart(),
  );
  const { line: endLine } = sourceFile.getLineAndCharacterOfPosition(node.end);
  SYMBOL_INDEX.push({
    path: fileRel,
    name,
    kind: k,
    startLine: startLine + 1,
    endLine: endLine + 1,
    signature: signatureOf(node, sourceFile),
  });
}

function walk(sourceFile, fileRel) {
  function visit(node) {
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
      addSymbol(sourceFile, node, fileRel);
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
}

export async function symbolsIndex(ROOT_PATH, opts = {}) {
  SYMBOL_INDEX = [];
  const include = opts.paths || ["**/*.{ts,tsx,js,jsx}"];
  const exclude = opts.exclude || defaultExcludes();
  const files = await fg(include, {
    cwd: ROOT_PATH,
    ignore: exclude,
    onlyFiles: true,
    dot: false,
    absolute: true,
  });
  let count = 0;
  for (const abs of files) {
    if (!isInsideRoot(ROOT_PATH, abs)) continue;
    let text = "";
    try {
      const safeAbs = normalizeToRoot(ROOT_PATH, abs);
      text = await fs.readFile(safeAbs, "utf8");
    } catch {
      continue;
    }
    const rel = path.relative(ROOT_PATH, abs);
    const sf = ts.createSourceFile(abs, text, ts.ScriptTarget.Latest, true);
    walk(sf, rel);
    count++;
  }
  return { files: count, symbols: SYMBOL_INDEX.length, builtAt: Date.now() };
}

export async function symbolsFind(query, opts = {}) {
  const q = String(query || "").toLowerCase();
  const kind = opts.kind ? String(opts.kind).toLowerCase() : null;
  const pathFilter = opts.path ? String(opts.path).toLowerCase() : null;
  const limit = Number(opts.limit || 200);
  const out = [];
  for (const s of SYMBOL_INDEX) {
    if (q && !s.name.toLowerCase().includes(q)) continue;
    if (kind && s.kind.toLowerCase() !== kind) continue;
    if (pathFilter && !s.path.toLowerCase().includes(pathFilter)) continue;
    out.push(s);
    if (out.length >= limit) break;
  }
  return out;
}
