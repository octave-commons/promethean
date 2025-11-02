import * as path from "path";

import ts from "typescript";
export {
  sha1,
  cosine,
  getJsDocText,
  getNodeText,
  parseArgs,
} from "@promethean-os/utils";

export function makeProgram(
  rootFiles: readonly string[],
  tsconfigPath?: string,
): ts.Program {
  const baseOptions: Readonly<ts.CompilerOptions> = {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    strict: true,
  };
  const options: ts.CompilerOptions = tsconfigPath
    ? {
        ...ts.parseJsonConfigFileContent(
          ts.readConfigFile(tsconfigPath, ts.sys.readFile).config,
          ts.sys,
          path.dirname(tsconfigPath),
        ).options,
        ...baseOptions,
      }
    : baseOptions;
  return ts.createProgram(rootFiles, options);
}
