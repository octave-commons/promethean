import fs from "node:fs";
import path from "node:path";
import test from "ava";

import { parseUnifiedDiff } from "../../scripts/apply_patch.js";

const FIXTURE_DIR = path.resolve("tests/__fixtures__/apply_patch");

for (const name of fs.readdirSync(FIXTURE_DIR)) {
  const diff = fs.readFileSync(path.join(FIXTURE_DIR, name), "utf8");
  test(`parse plan for ${name}`, (t) => {
    const plan = parseUnifiedDiff(diff);
    t.snapshot(plan);
  });
}
