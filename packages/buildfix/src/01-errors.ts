/* eslint-disable no-console */
import * as path from "path";
import { parseArgs, tsc, codeFrame, writeJSON } from "./utils.js";
import type { ErrorList, BuildError } from "./types.js";

const args = parseArgs({
  "--tsconfig": "tsconfig.json",
  "--out": ".cache/buildfix/errors.json",
});

async function main() {
  const tsconfig = path.resolve(args["--tsconfig"]);
  const { diags } = await tsc(tsconfig);

  const errors: BuildError[] = [];
  for (const d of diags) {
    const file = path.resolve(d.file);
    const frame = await codeFrame(file, d.line);
    const key = `${d.code}|${file}|${d.line}`;
    errors.push({ file, line: d.line, col: d.col, code: d.code, message: d.message, frame, key });
  }

  const out: ErrorList = { createdAt: new Date().toISOString(), tsconfig, errors };
  await writeJSON(path.resolve(args["--out"]), out);
  console.log(`buildfix: collected ${errors.length} error(s) → ${args["--out"]}`);
}

main().catch(e => { console.error(e); process.exit(1); });
