import { promises as fs } from "node:fs";
import * as path from "node:path";
import { randomUUID } from "node:crypto";
import * as url from "node:url";

import test from "ava";

import { run } from "../utils.js";

const PKG_ROOT = path.resolve(
  path.dirname(url.fileURLToPath(import.meta.url)),
  "..",
  "..",
);

async function createProject() {
  const dir = path.join(PKG_ROOT, "test-tmp", `initcwd-${randomUUID()}`);
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

async function fileExists(p: string) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

test.serial("uses INIT_CWD for relative paths", async (t) => {
  const dir = await createProject();
  const prev = process.env.INIT_CWD;
  process.env.INIT_CWD = dir;
  try {
    t.is(
      (
        await run(
          "node",
          [
            path.join(PKG_ROOT, "dist/01-errors.js"),
            "--tsconfig",
            "tsconfig.json",
            "--out",
            ".cache/buildfix/errors.json",
          ],
          { cwd: PKG_ROOT },
        )
      ).code,
      0,
    );
    t.true(await fileExists(path.join(dir, ".cache/buildfix/errors.json")));

    t.is(
      (
        await run(
          "node",
          [
            path.join(PKG_ROOT, "dist/02-iterate.js"),
            "--errors",
            ".cache/buildfix/errors.json",
            "--out",
            ".cache/buildfix",
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
    t.true(await fileExists(path.join(dir, ".cache/buildfix/summary.json")));

    t.is(
      (
        await run(
          "node",
          [
            path.join(PKG_ROOT, "dist/03-report.js"),
            "--summary",
            ".cache/buildfix/summary.json",
            "--history-root",
            ".cache/buildfix/history",
            "--out",
            "reports",
          ],
          { cwd: PKG_ROOT },
        )
      ).code,
      0,
    );
    const files = await fs.readdir(path.join(dir, "reports"));
    t.true(files.some((f) => f.endsWith(".md")));
  } finally {
    if (prev === undefined) delete process.env.INIT_CWD;
    else process.env.INIT_CWD = prev;
  }
});