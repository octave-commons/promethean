import test from "ava";
import { mkdtemp, writeFile, stat, mkdir } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

test("generate-layer-images creates missing image files", async (t) => {
  const tmp = await mkdtemp(path.join(os.tmpdir(), "layer-"));
  const layerDir = path.join(tmp, "layer");
  await mkdir(layerDir, { recursive: true });
  await writeFile(path.join(layerDir, "README.org"), "[[img/foo.png]]");
  await execFileAsync("pnpm", [
    "--filter",
    "@promethean/image-link-generator",
    "run",
    "build",
  ]);
  await execFileAsync("pnpm", ["tsx", "scripts/generate-layer-images.ts", tmp]);
  const exists = await stat(path.join(layerDir, "img/foo.png"))
    .then(() => true)
    .catch(() => false);
  t.true(exists);
});
