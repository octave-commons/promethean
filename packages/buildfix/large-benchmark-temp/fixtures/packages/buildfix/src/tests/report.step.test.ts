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

test("bf:03-report renders markdown report", async (t) => {
  const tmp = path.join(PKG_ROOT, "test-tmp", `report-${randomUUID()}`);
  const histRoot = path.join(tmp, "history");
  const key = "k1";
  await fs.mkdir(path.join(histRoot, key), { recursive: true });
  await fs.writeFile(
    path.join(histRoot, key, "history.json"),
    JSON.stringify({ key, file: "f.ts", code: "TS1", attempts: [] }, null, 2),
  );
  const summaryPath = path.join(tmp, "summary.json");
  await fs.writeFile(
    summaryPath,
    JSON.stringify(
      {
        iteratedAt: new Date().toISOString(),
        tsconfig: "tsconfig.json",
        maxCycles: 0,
        items: [{ key, resolved: false, attempts: 0 }],
      },
      null,
      2,
    ),
  );
  const outDir = path.join(tmp, "reports");
  const { code } = await run(
    "node",
    [
      path.join(PKG_ROOT, "dist/03-report.js"),
      "--summary",
      summaryPath,
      "--history-root",
      histRoot,
      "--out",
      outDir,
    ],
    { cwd: PKG_ROOT },
  );
  t.is(code, 0);
  const files = await fs.readdir(outDir);
  t.true(files.some((f) => f.endsWith(".md")));
});
