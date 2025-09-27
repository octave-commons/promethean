import test from "ava";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { ensureCliPerms } from "../../scripts/ensure-cli-perms.mjs";

test("ensureCliPerms ignores missing targets", (t) => {
  const code = ensureCliPerms([
    path.join(os.tmpdir(), "does-not-exist", "file.js"),
  ]);
  t.is(code, 0);
});

test("ensureCliPerms sets executable mode on existing files", (t) => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "ensure-cli-perms-"));
  const target = path.join(tempDir, "script.sh");

  try {
    fs.writeFileSync(target, "echo test\n", { mode: 0o644 });
    fs.chmodSync(target, 0o644);

    const beforeMode = fs.statSync(target).mode & 0o777;
    t.is(beforeMode, 0o644);

    const code = ensureCliPerms([target]);

    t.is(code, 0);
    const afterMode = fs.statSync(target).mode & 0o777;
    t.is(afterMode, 0o755);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test("ensureCliPerms reports non-ENOENT errors", (t) => {
  const errors = [];
  const code = ensureCliPerms(["/tmp/fake-path"], {
    existsSync: () => true,
    chmodSync: () => {
      const err = new Error("permission denied");
      err.code = "EPERM";
      throw err;
    },
    onError: (...args) => {
      errors.push(args);
    },
  });

  t.is(code, 1);
  t.is(errors.length, 1);
  t.true(String(errors[0][0]).includes("Failed to adjust permissions"));
});
