import * as path from "path";

import * as ts from "typescript";
export {
  sha1,
  cosine,
  getJsDocText,
  getNodeText,
  parseArgs,
} from "@promethean/utils";

export function makeProgram(rootFiles: string[], tsconfigPath?: string) {
  let options: ts.CompilerOptions = {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    strict: true,
  };
  if (tsconfigPath) {
    const cfg = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
    const parsed = ts.parseJsonConfigFileContent(
      cfg.config,
      ts.sys,
      path.dirname(tsconfigPath),
    );
    options = { ...parsed.options, ...options };
  }
  return ts.createProgram(rootFiles, options);
}
