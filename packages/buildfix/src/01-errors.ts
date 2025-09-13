import * as path from "node:path";

import { globby } from "globby";
import { parseArgs } from "@promethean/utils";
import { tsc, codeFrame, writeJSON } from "./utils.js";
import type { ErrorList, BuildError } from "./types.js";

const args = parseArgs({
  "--tsconfig": "tsconfig.json",
  "--root": "",
  "--out": ".cache/buildfix/errors.json",
});

const rawRoot: unknown = args["--root"];
const disableRoot =
  rawRoot === false ||
  rawRoot === 0 ||
  (typeof rawRoot === "string" &&
    ["false", "no", "0"].includes(rawRoot.toLowerCase()));
const root: string | undefined = disableRoot
  ? undefined
  : rawRoot === true ||
      rawRoot === undefined ||
      rawRoot === null ||
      (typeof rawRoot === "string" && rawRoot.trim() === "") ||
      (typeof rawRoot === "string" && rawRoot.toLowerCase() === "true")
    ? process.cwd()
    : String(rawRoot).trim();

async function collectForTsconfig(tsconfigPath: string): Promise<BuildError[]> {
  const { diags } = await tsc(tsconfigPath);
  const pkgDir = path.dirname(tsconfigPath);
  const errors: BuildError[] = [];
  for (const d of diags) {
    const file = path.resolve(pkgDir, d.file);
    const frame = await codeFrame(file, d.line);
    const key = `${d.code}|${file}|${d.line}`;
    errors.push({
      file,
      line: d.line,
      col: d.col,
      code: d.code,
      message: d.message,
      frame,
      key,
    });
  }
  return errors;
}

async function main() {
  const outFile = path.resolve(args["--out"] as string);
  let errors: BuildError[] = [];
  let tsconfig: string | undefined;

  if (root) {
    const rootAbs = path.resolve(root);
    const tsconfigs = await globby(["**/tsconfig.json"], {
      cwd: rootAbs,
      gitignore: true,
      ignore: ["**/node_modules/**", "**/dist/**", "**/.cache/**"],
      absolute: true,
      expandDirectories: false,
      dot: false,
    });
    for (const cfg of tsconfigs) {
      const errs = await collectForTsconfig(cfg);
      errors = errors.concat(errs);
    }
    tsconfig = `workspace:${rootAbs}`;
  } else {
    const single = path.resolve(args["--tsconfig"] as string);
    tsconfig = single;
    errors = await collectForTsconfig(single);
  }

  const out: ErrorList = {
    createdAt: new Date().toISOString(),
    tsconfig: tsconfig || "",
    errors,
  };
  await writeJSON(outFile, out);
  console.log(
    `buildfix: collected ${errors.length} error(s) → ${args["--out"]}`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
