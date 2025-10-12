import { promises as fs } from "node:fs";
import * as path from "node:path";
import * as url from "node:url";
import { randomUUID } from "node:crypto";

import test from "ava";

import { run } from "../utils.js";

const PKG_ROOT = path.resolve(
  path.dirname(url.fileURLToPath(import.meta.url)),
  "../..",
);

// Minimal tsconfig with a single file containing a type error
async function createProject() {
  const dir = path.join(PKG_ROOT, "test-tmp", `proj-${randomUUID()}`);
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

test("bf:01-errors writes error list", async (t) => {
  const dir = await createProject();
  const outPath = path.join(dir, "errors.json");
  const tsconfig = path.join(dir, "tsconfig.json");
  const { code } = await run(
    "node",
    [
      path.join(PKG_ROOT, "dist/01-errors.js"),
      "--root",
      "false",
      "--tsconfig",
      tsconfig,
      "--out",
      outPath,
    ],
    { cwd: PKG_ROOT },
  );
  t.is(code, 0);
  const data = JSON.parse(await fs.readFile(outPath, "utf-8"));
  t.true(Array.isArray(data.errors));
  t.true(data.errors.length >= 1);
  t.truthy(data.errors[0].code);
});