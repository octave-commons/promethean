import { promises as fs } from "node:fs";
import * as path from "node:path";
import * as url from "node:url";
import { randomUUID } from "node:crypto";

import test from "ava";

import { run } from "../../utils.js";

const PKG_ROOT = path.resolve(
  path.dirname(url.fileURLToPath(import.meta.url)),
  "../../..",
);

async function createProject() {
  const dir = path.join(PKG_ROOT, "test-tmp", `pipeline-${randomUUID()}`);
  await fs.mkdir(path.join(dir, "src"), { recursive: true });
  await fs.writeFile(
    path.join(dir, "src", "bad.ts"),
    "export const x: number = 'oops';\n",
  );
  await fs.writeFile(
    path.join(dir, "tsconfig.json"),
    JSON.stringify(
      {
        compilerOptions: { target: "ES2020", strict: true },
        include: ["src/**/*"],
      },
      null,
      2,
    ),
  );
  return dir;
}

test.serial("buildfix pipeline runs end-to-end", async (t) => {
  const dir = await createProject();
  const errorsPath = path.join(dir, "errors.json");
  const tsconfig = path.join(dir, "tsconfig.json");

  // step 1
  t.is(
    (
      await run(
        "node",
        [
          path.join(PKG_ROOT, "dist/01-errors.js"),
          "--root",
          "false",
          "--tsconfig",
          tsconfig,
          "--out",
          errorsPath,
        ],
        { cwd: PKG_ROOT },
      )
    ).code,
    0,
  );

  // step 2
  t.is(
    (
      await run(
        "node",
        [
          path.join(PKG_ROOT, "dist/02-iterate.js"),
          "--errors",
          errorsPath,
          "--out",
          dir,
          "--max-cycles",
          "0",
          "--git",
          "off",
        ],
        { cwd: PKG_ROOT },
      )
    ).code,
    0,
  );

  // step 3
  const summaryPath = path.join(dir, "summary.json");
  const historyRoot = path.join(dir, "history");
  const reportDir = path.join(dir, "reports");
  t.is(
    (
      await run(
        "node",
        [
          path.join(PKG_ROOT, "dist/03-report.js"),
          "--summary",
          summaryPath,
          "--history-root",
          historyRoot,
          "--out",
          reportDir,
        ],
        { cwd: PKG_ROOT },
      )
    ).code,
    0,
  );

  const files = await fs.readdir(reportDir);
  t.true(files.some((f) => f.endsWith(".md")));
});