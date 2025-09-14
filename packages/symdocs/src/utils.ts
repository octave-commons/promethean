import * as path from "path";

import type * as ts from "typescript";
import tsModule from "typescript";

// Support both ESM and CJS builds of the TypeScript compiler.
// When imported via ESM, `typescript` exposes its API under the `default` key.
// Normalise so `tsc` always references the compiler object regardless of import style.
const tsc: typeof ts = ((tsModule as unknown as { default?: typeof ts })
  .default ?? tsModule) as typeof ts;
export { sha1 } from "@promethean/utils";

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
    target: tsc.ScriptTarget.ES2022,
    module: tsc.ModuleKind.ESNext,
    strict: true,
  };
  const options: ts.CompilerOptions = tsconfigPath
    ? (() => {
        const configFile = tsc.readConfigFile(tsconfigPath, tsc.sys.readFile);
        if (configFile.error) {
          throw new Error(
            tsc.formatDiagnosticsWithColorAndContext([configFile.error], {
              getCanonicalFileName: (f) => f,
              getCurrentDirectory: tsc.sys.getCurrentDirectory,
              getNewLine: () => tsc.sys.newLine,
            }),
          );
        }
        const parse = tsc.parseJsonConfigFileContent(
          configFile.config as unknown,
          tsc.sys,
          path.dirname(tsconfigPath),
        );
        return { ...parse.options, ...baseOptions } as ts.CompilerOptions;
      })()
    : baseOptions;
  return tsc.createProgram(rootFiles, options);
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
