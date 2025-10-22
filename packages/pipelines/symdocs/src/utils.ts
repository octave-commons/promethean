import * as path from "path";
import type * as ts from "typescript";

export { sha1 } from "@promethean/utils";

// Dynamic import to handle ES module compatibility
let tsMod: any;
try {
  tsMod = await import("typescript");
} catch {
  tsMod = require("typescript");
}

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
    target: 7,    // ES2022 = ES2020 in newer TS versions (7)
    module: 99,   // ESNext = 99 in TypeScript ModuleKind enum
    strict: true,
  };
  const options = tsconfigPath
    ? (() => {
        const configFile = tsMod.readConfigFile(tsconfigPath, tsMod.sys.readFile);
        if (configFile.error) {
          throw new Error(
            tsMod.formatDiagnosticsWithColorAndContext([configFile.error], {
              getCanonicalFileName: (f: string) => f,
              getCurrentDirectory: tsMod.sys.getCurrentDirectory,
              getNewLine: () => tsMod.sys.newLine,
            }),
          );
        }
        const parse = tsMod.parseJsonConfigFileContent(
          configFile.config,
          tsMod.sys,
          path.dirname(tsconfigPath),
        );
        return { ...parse.options, ...baseOptions };
      })()
    : baseOptions;
  return tsMod.createProgram(rootFiles, options);
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
