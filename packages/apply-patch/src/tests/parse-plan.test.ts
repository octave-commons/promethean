import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "ava";

import { parseUnifiedDiff } from "../index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(__dirname, "..", "..");
const repoRoot = resolve(packageRoot, "..", "..");
const FIXTURE_DIR = resolve(repoRoot, "tests", "__fixtures__", "apply_patch");

for (const name of readdirSync(FIXTURE_DIR)) {
  const diff = readFileSync(join(FIXTURE_DIR, name), "utf8");
  test(`parse plan for ${name}`, (t) => {
    const plan = parseUnifiedDiff(diff);
    t.snapshot(plan);
  });
}
