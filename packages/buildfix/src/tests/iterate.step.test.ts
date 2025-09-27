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

test("bf:02-iterate generates summary without attempts when max-cycles=0", async (t) => {
  const tmp = path.join(PKG_ROOT, "test-tmp", `iterate-${randomUUID()}`);
  await fs.mkdir(tmp, { recursive: true });
  const errors = {
    createdAt: new Date().toISOString(),
    tsconfig: "tsconfig.json",
    errors: [
      {
        key: "k1",
        file: "file.ts",
        line: 1,
        col: 1,
        code: "TS1",
        message: "msg",
        frame: "",
      },
    ],
  };
  const errorsPath = path.join(tmp, "errors.json");
  await fs.writeFile(errorsPath, JSON.stringify(errors, null, 2));

  const { code } = await run(
    "node",
    [
      path.join(PKG_ROOT, "dist/02-iterate.js"),
      "--errors",
      errorsPath,
      "--out",
      tmp,
      "--max-cycles",
      "0",
      "--git",
      "off",
    ],
    { cwd: PKG_ROOT },
  );
  t.is(code, 0);
  const summary = JSON.parse(
    await fs.readFile(path.join(tmp, "summary.json"), "utf-8"),
  );
  t.is(summary.items.length, 1);
  t.is(summary.items[0].attempts, 0);
  t.false(summary.items[0].resolved);
});
