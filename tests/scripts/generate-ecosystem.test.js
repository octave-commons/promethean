import test from "ava";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const PACKAGE_BUILD_TARGET = "@promethean/shadow-conf";

test("aggregates apps from edn definitions", async (t) => {
  execFileSync("pnpm", ["--filter", PACKAGE_BUILD_TARGET, "build"], {
    stdio: "inherit",
  });

  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "ecosystem-"));
  const inputDir = path.join(tmpRoot, "system", "daemons");
  fs.mkdirSync(path.join(inputDir, "service-a"), { recursive: true });
  fs.writeFileSync(
    path.join(inputDir, "service-a", "ecosystem.edn"),
    '{:apps [{:name "a"}]}\n',
  );
  fs.mkdirSync(path.join(inputDir, "service-b"), { recursive: true });
  fs.writeFileSync(
    path.join(inputDir, "service-b", "ecosystem.edn"),
    '{:apps [{:name "b"}]}\n',
  );

  const outputDir = path.join(tmpRoot, "out");
  const packageRoot = path.join(process.cwd(), "packages", "shadow-conf");
  const manifestPath = path.join(packageRoot, "package.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const relativeBinPath = manifest.bin?.["shadow-conf"];
  if (typeof relativeBinPath !== "string") {
    throw new Error("shadow-conf bin path missing from package manifest");
  }
  const binPath = path.join(packageRoot, relativeBinPath);

  execFileSync(
    "node",
    [binPath, "ecosystem", "--input-dir", inputDir, "--out", outputDir],
    { stdio: "inherit" },
  );

  const { apps } = await import(
    pathToFileURL(path.join(outputDir, "ecosystem.generated.mjs"))
  );
  t.deepEqual(apps, [
    {
      name: "a",
    },
    {
      name: "b",
    },
  ]);
});
