import { promises as fs } from "fs";
import * as path from "path";
import { pathToFileURL } from "url";

import ts from "typescript";
import {
  posToLine,
  getJsDocText,
  getNodeText,
  relFromRepo,
  parseArgs,
} from "@promethean/utils";
import { scanFiles } from "@promethean/file-indexer";

import { openLevelCache } from "@promethean/level-cache";
import { makeProgram, sha1 } from "./utils.js";
import type { FunctionInfo, FnKind } from "./types.js";

export type ScanArgs = {
  "--root"?: string;
  "--ext"?: string;
  "--tsconfig"?: string;
  "--out"?: string;
};

export async function collectSourceFiles(
  root: string,
  exts: Set<string>,
): Promise<string[]> {
  const resolvedRoot = path.resolve(root);
  const result = await scanFiles({
    root: resolvedRoot,
    exts,
    collect: true,
  });
  return (result.files ?? []).map((file) =>
    path.isAbsolute(file.path)
      ? path.resolve(file.path)
      : path.resolve(resolvedRoot, file.path),
  );
}

type PackageMeta = {
  pkgName: string;
};

const missingPackages = new Set<string>();

async function loadPackageMeta(
  pkgFolder: string,
  cache: Map<string, PackageMeta | null>,
): Promise<PackageMeta | null> {
  if (cache.has(pkgFolder)) {
    return cache.get(pkgFolder) ?? null;
  }
  const pkgRoot = path.join(process.cwd(), "packages", pkgFolder);
  const pkgJsonPath = path.join(pkgRoot, "package.json");
  try {
    const pkgJson = JSON.parse(await fs.readFile(pkgJsonPath, "utf-8"));
    const meta: PackageMeta = {
      pkgName:
        typeof pkgJson.name === "string" && pkgJson.name.length > 0
          ? pkgJson.name
          : pkgFolder,
    };
    cache.set(pkgFolder, meta);
    return meta;
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err?.code !== "ENOENT") {
      console.warn(
        `simtasks: failed to load package metadata for ${pkgFolder}: ${err?.message ?? err}`,
      );
    } else if (!missingPackages.has(pkgFolder)) {
      missingPackages.add(pkgFolder);
      console.warn(`simtasks: skipping missing package ${pkgFolder}`);
    }
    cache.set(pkgFolder, null);
    return null;
  }
}

export async function gatherFunctionInfo(
  program: ts.Program,
): Promise<FunctionInfo[]> {
  const checker = program.getTypeChecker();
  const rootFiles = new Set(
    program.getRootFileNames().map((f) => path.resolve(f)),
  );
  const results: FunctionInfo[] = [];
  const pkgMetaCache = new Map<string, PackageMeta | null>();
  for (const sf of program.getSourceFiles()) {
    const fileAbs = path.resolve(sf.fileName);
    if (!rootFiles.has(fileAbs)) continue;
    const infos = await gatherFromSourceFile(sf, checker, pkgMetaCache);
    results.push(...infos);
  }
  return results;
}

export async function writeResults(outPath: string, functions: FunctionInfo[]) {
  const cache = await openLevelCache<FunctionInfo[]>({ path: outPath });
  await cache.set("functions", functions);
  await cache.close();
}

export async function scan(args: ScanArgs) {
  const ROOT = path.resolve(args["--root"] ?? "packages");
  const EXTS = new Set(
    (args["--ext"] ?? ".ts,.tsx,.js,.jsx")
      .split(",")
      .map((s) => s.trim().toLowerCase()),
  );
  const OUT = path.resolve(args["--out"] ?? ".cache/simtasks/functions");

  const files = await collectSourceFiles(ROOT, EXTS);
  const program = makeProgram(files, args["--tsconfig"] || undefined);
  const functions = await gatherFunctionInfo(program);
  await writeResults(OUT, functions);
  console.log(
    `simtasks: scanned ${functions.length} functions -> ${path.relative(
      process.cwd(),
      OUT,
    )}`,
  );
}

async function gatherFromSourceFile(
  sf: ts.SourceFile,
  checker: ts.TypeChecker,
  pkgMetaCache: Map<string, PackageMeta | null>,
): Promise<FunctionInfo[]> {
  const fileAbs = path.resolve(sf.fileName);
  const src = sf.getFullText();
  const fileRel = relFromRepo(fileAbs);

  const bits = fileRel.split("/");
  if (bits[0] !== "packages" || bits.length < 2) return [];

  const pkgFolder = bits[1]!;
  const pkgMeta = await loadPackageMeta(pkgFolder, pkgMetaCache);
  if (!pkgMeta) return [];
  const pkgName = pkgMeta.pkgName;
  const moduleRel = bits.slice(2).join("/");

  const functions: FunctionInfo[] = [];
  const ctx: VisitContext = {
    sf,
    src,
    pkgName,
    pkgFolder,
    fileAbs,
    fileRel,
    moduleRel,
    checker,
    functions,
  };
  visit(ctx, sf);
  return functions;
}

type VisitContext = {
  sf: ts.SourceFile;
  src: string;
  pkgName: string;
  pkgFolder: string;
  fileAbs: string;
  fileRel: string;
  moduleRel: string;
  checker: ts.TypeChecker;
  functions: FunctionInfo[];
};

function visit(ctx: VisitContext, node: ts.Node): void {
  if (ts.isFunctionDeclaration(node) && node.name) {
    const signature = getSignature(ctx.checker, node);
    push(ctx, {
      kind: "function",
      name: node.name.text,
      node,
      exported: hasExport(node),
      ...(signature ? { signature } : {}),
    });
  }

  if (ts.isVariableStatement(node)) {
    const exported = hasExport(node);
    for (const decl of node.declarationList.declarations) {
      const name = decl.name.getText();
      const init = (decl as any).initializer as ts.Node | undefined;
      if (!init) continue;
      if (ts.isFunctionExpression(init)) {
        const signature = getSignature(ctx.checker, init);
        push(ctx, {
          kind: "function",
          name,
          node: decl,
          exported,
          ...(signature ? { signature } : {}),
        });
      } else if (ts.isArrowFunction(init)) {
        const signature = getSignature(ctx.checker, init);
        push(ctx, {
          kind: "arrow",
          name,
          node: decl,
          exported,
          ...(signature ? { signature } : {}),
        });
      }
    }
  }

  if (ts.isClassDeclaration(node) && node.name) {
    const className = node.name.text;
    for (const m of node.members) {
      if (ts.isMethodDeclaration(m) && m.name && ts.isIdentifier(m.name)) {
        const exported = hasExport(node);
        const signature = getSignature(ctx.checker, m);
        push(ctx, {
          kind: "method",
          name: m.name.text,
          node: m,
          exported,
          ...(signature ? { signature } : {}),
          className,
        });
      }
    }
  }

  ts.forEachChild(node, (n) => visit(ctx, n));
}

type PushArgs = {
  kind: FnKind;
  name: string;
  node: ts.Node;
  exported: boolean;
  signature?: string;
  className?: string;
};

function push(ctx: VisitContext, args: PushArgs): void {
  const {
    sf,
    src,
    pkgName,
    pkgFolder,
    fileAbs,
    fileRel,
    moduleRel,
    functions,
  } = ctx;
  const { kind, name, node, exported, signature, className } = args;
  const startLine = posToLine(sf, node.getStart());
  const endLine = posToLine(sf, node.getEnd());
  const jsdoc = getJsDocText(node);
  const snippet = getNodeText(src, node);
  const id = sha1(
    [
      pkgName,
      moduleRel,
      kind,
      className ?? "",
      name,
      signature ?? "",
      startLine,
      endLine,
    ].join("|"),
  );
  const base: any = {
    id,
    pkgName,
    pkgFolder,
    fileAbs,
    fileRel,
    moduleRel,
    name,
    kind,
    exported,
    startLine,
    endLine,
    snippet,
  };
  if (className) base.className = className;
  if (signature) base.signature = signature;
  if (jsdoc) base.jsdoc = jsdoc;
  functions.push(base as FunctionInfo);
}

function getSignature(
  checker: ts.TypeChecker,
  node: ts.SignatureDeclaration | ts.ArrowFunction,
): string | undefined {
  const sig = checker.getSignatureFromDeclaration(node as any);
  return sig ? checker.signatureToString(sig) : undefined;
}

function hasExport(node: ts.Node): boolean {
  const m = ts.getCombinedModifierFlags(node as any);
  return (
    (m & ts.ModifierFlags.Export) !== 0 || (m & ts.ModifierFlags.Default) !== 0
  );
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const args = parseArgs({
    "--root": "packages",
    "--ext": ".ts,.tsx,.js,.jsx",
    "--tsconfig": "",
    "--out": ".cache/simtasks/functions",
  });
  scan(args).catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
