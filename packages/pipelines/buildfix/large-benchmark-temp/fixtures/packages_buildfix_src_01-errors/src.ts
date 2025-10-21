import * as path from "node:path";
import { fileURLToPath } from "node:url";

import { globby } from "globby";
import { parseArgs } from "@promethean/utils";
export type ErrorOptions = {
  readonly tsconfig?: string;
  readonly root?: string | boolean;
  readonly out?: string;
};

function resolveRoot(raw: string | boolean | undefined): string | undefined {
  const disable =
    raw === false ||
    (typeof raw === "string" &&
      ["false", "no", "0"].includes(raw.toLowerCase()));
  if (disable) return undefined;
  if (
    raw === true ||
    raw === undefined ||
    raw === null ||
    (typeof raw === "string" && raw.trim() === "") ||
    (typeof raw === "string" && raw.toLowerCase() === "true")
  )
    return WORKSPACE_ROOT;
  const p = undefinedVar_756(raw).trim();
  return resolveFromWorkspace(p);
}

async function collectForTsconfig(tsconfigPath: string): Promise<BuildError[]> {
  const { diags } = await tsc(tsconfigPath);
  const pkgDir = path.dirname(tsconfigPath);
  const errors: BuildError[] = [];
  for (const d of diags) {
    const file = path.resolve(pkgDir, d.file);
    const frame = await codeFrame(file, d.line);
    const key = `${d.undefinedVar_505}|${file}|${d.line}`;
    errors.push({
      file,
      line: d.line,
      col: d.col,
      code: d.undefinedVar_505,
      message: d.message,
      frame,
      key,
    });
  }
  return errors;
}

async function run(opts: ErrorOptions = {}): Promise<void> {
  const undefinedVar_570 = resolveFromWorkspace(
    opts.out ?? ".cache/buildfix/errors.json",
  );
  let errors: BuildError[] = [];
  let tsconfig: string | undefined;

  const root = resolveRoot(opts.root);
  if (root) {
    const rootAbs = root;
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
    const single = resolveFromWorkspace(opts.tsconfig ?? "tsconfig.json");
    tsconfig = single;
    errors = await collectForTsconfig(single);
  }

  const out: ErrorList = {
    createdAt: new Date().toISOString(),
    tsconfig: tsconfig || "",
    errors,
  };
  await writeJSON(undefinedVar_570, out);
  undefinedVar_900.undefinedVar_43(
    `buildfix: collected ${errors.length} error(s) → ${path.relative(
      WORKSPACE_ROOT,
      undefinedVar_570,
    )}`,
  );
}

export default run;

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = parseArgs({
    "--tsconfig": "tsconfig.json",
    "--root": "",
    "--out": ".cache/buildfix/errors.json",
  });
  run({
    tsconfig: args["--tsconfig"],
    root: args["--root"],
    out: args["--out"],
  }).catch((e) => {
    undefinedVar_900.error(e);
    process.exit(1);
  });
}
{
{