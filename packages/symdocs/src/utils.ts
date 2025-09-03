// SPDX-License-Identifier: GPL-3.0-only
import { promises as fs } from "fs";
import * as path from "path";
import * as crypto from "crypto";
import * as ts from "typescript";

export const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";

export function parseArgs(defaults: Record<string, string>) {
  const out = { ...defaults };
  const a = process.argv.slice(2);
  for (let i = 0; i < a.length; i++) {
    const k = a[i];
    if (!k.startsWith("--")) continue;
    const v = a[i + 1] && !a[i + 1].startsWith("--") ? a[++i] : "true";
    out[k] = v;
  }
  return out;
}

export async function listFilesRec(root: string, exts: Set<string>) {
  const out: string[] = [];
  async function walk(d: string) {
    const ents = await fs.readdir(d, { withFileTypes: true });
    for (const e of ents) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) await walk(p);
      else out.push(p);
    }
  }
  await walk(root);
  return out.filter((p) => exts.has(path.extname(p).toLowerCase()));
}

export function sha1(s: string) {
  return crypto.createHash("sha1").update(s).digest("hex");
}

export function relFromRepo(abs: string) {
  return path.relative(process.cwd(), abs).replace(/\\/g, "/");
}

export function getLangFromExt(p: string): "ts" | "tsx" | "js" | "jsx" {
  const e = path.extname(p).toLowerCase();
  if (e === ".ts") return "ts";
  if (e === ".tsx") return "tsx";
  if (e === ".jsx") return "jsx";
  return "js";
}

export function makeProgram(rootFiles: string[], tsconfigPath?: string) {
  let options: ts.CompilerOptions = {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    strict: true,
  };

  if (tsconfigPath) {
    const configFile = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
    if (configFile.error) {
      throw new Error(ts.formatDiagnosticsWithColorAndContext([configFile.error], {
        getCanonicalFileName: (f) => f,
        getCurrentDirectory: ts.sys.getCurrentDirectory,
        getNewLine: () => ts.sys.newLine,
      }));
    }
    const parse = ts.parseJsonConfigFileContent(configFile.config, ts.sys, path.dirname(tsconfigPath));
    options = { ...parse.options, ...options };
  }

  return ts.createProgram(rootFiles, options);
}

export function getJsDocText(node: ts.Node): string | undefined {
  const jsdocs = ts.getJSDocCommentsAndTags(node);
  if (!jsdocs?.length) return undefined;
  const texts: string[] = [];
  for (const d of jsdocs) {
    // @ts-ignore - d may have comment property
    const c = (d as any).comment;
    if (typeof c === "string") texts.push(c);
  }
  return texts.join("\n\n").trim() || undefined;
}

export function getNodeText(src: string, node: ts.Node): string {
  const sf = node.getSourceFile();
  return src.slice(node.getFullStart(), node.getEnd());
}

export function posToLine(sf: ts.SourceFile, pos: number) {
  const { line } = sf.getLineAndCharacterOfPosition(pos);
  return line + 1;
}

export function signatureForFunction(checker: ts.TypeChecker, decl: ts.FunctionLikeDeclarationBase): string | undefined {
  const sig = checker.getSignatureFromDeclaration(decl as ts.SignatureDeclaration);
  return sig ? checker.signatureToString(sig) : undefined;
}

export function typeToString(checker: ts.TypeChecker, node: ts.Node): string | undefined {
  const t = checker.getTypeAtLocation(node);
  try {
    return checker.typeToString(t);
  } catch { return undefined; }
}
