import { spawnSync } from "node:child_process";
import fs, { mkdtempSync } from "node:fs";
import path from "node:path";
import { tmpdir } from "node:os";

import test from "ava";

import {
  checkDuplicateFragments,
  changelogModified,
} from "../../changelog/check.js";

test("detects duplicate changelog fragments", (t) => {
  const dir = mkdtempSync(path.join(tmpdir(), "changelog-"));
  fs.writeFileSync(path.join(dir, "123.added.md"), "");
  fs.writeFileSync(path.join(dir, "123.fixed.md"), "");
  t.false(checkDuplicateFragments(dir));
});

test("detects direct changelog edits", (t) => {
  const runner = (
    _command: string,
    _args?: ReadonlyArray<string>,
    _options?: unknown,
  ) => ({ stdout: "CHANGELOG.md\n" });
  t.true(
    changelogModified("CHANGELOG.md", runner as unknown as typeof spawnSync),
  );
});
