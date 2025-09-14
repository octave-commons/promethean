import { promises as fs } from "fs";
import * as path from "path";
import * as crypto from "crypto";

import * as ts from "typescript";

export const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";

export function parseArgs(
  defaults: Record<string, string>,
): Record<string, string> {
  const args = process.argv.slice(2);
  const parse = (
    index: number,
    acc: Record<string, string>,
  ): Record<string, string> => {
    if (index >= args.length) return acc;
    const key = args[index] ?? "";
    if (!key.startsWith("--")) return parse(index + 1, acc);
    const next = args[index + 1] ?? "";
    const value = next && !next.startsWith("--") ? next : "true";
    const nextIndex = value === "true" ? index + 1 : index + 2;
    return parse(nextIndex, { ...acc, [key]: value });
  };
  return parse(0, { ...defaults });
}

export async function listFilesRec(
  root: string,
  exts: Set<string>,
): Promise<string[]> {
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

export function sha1(s: string): string {
  return crypto.createHash("sha1").update(s).digest("hex");
}

export function getLangFromExt(p: string): "ts" | "tsx" | "js" | "jsx" {
  const e = path.extname(p).toLowerCase();
  if (e === ".ts") return "ts";
  if (e === ".tsx") return "tsx";
  if (e === ".jsx") return "jsx";
  return "js";
}

export function makeProgram(
  rootFiles: string[],
  tsconfigPath?: string,
): ts.Program {
  const baseOptions: ts.CompilerOptions = {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    strict: true,
  };
  const options = tsconfigPath
    ? (() => {
        const configFile = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
        if (configFile.error) {
          throw new Error(
            ts.formatDiagnosticsWithColorAndContext([configFile.error], {
              getCanonicalFileName: (f) => f,
              getCurrentDirectory: ts.sys.getCurrentDirectory,
              getNewLine: () => ts.sys.newLine,
            }),
          );
        }
        const parse = ts.parseJsonConfigFileContent(
          configFile.config,
          ts.sys,
          path.dirname(tsconfigPath),
        );
        return { ...parse.options, ...baseOptions };
      })()
    : baseOptions;
  return ts.createProgram(rootFiles, options);
}

export function signatureForFunction(
  checker: ts.TypeChecker,
  decl: ts.FunctionLikeDeclarationBase,
): string | undefined {
  const sig = checker.getSignatureFromDeclaration(
    decl as ts.SignatureDeclaration,
  );
  return sig ? checker.signatureToString(sig) : undefined;
}

export function typeToString(
  checker: ts.TypeChecker,
  node: ts.Node,
): string | undefined {
  const t = checker.getTypeAtLocation(node);
  try {
    return checker.typeToString(t);
  } catch {
    return undefined;
  }
}
