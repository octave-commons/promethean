import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

import test from "ava";

import { applyPatchTool } from "../tools/apply-patch.js";

const execFileAsync = promisify(execFile);

const baseCtx = {
  env: {} as Readonly<Record<string, string | undefined>>,
  fetch,
  now: () => new Date(),
} as const;

const buildCtx = (root: string) => ({
  ...baseCtx,
  env: { ...baseCtx.env, MCP_ROOT_PATH: root } as typeof baseCtx.env,
});

test.serial("applies universal diff patches within MCP root", async (t) => {
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-apply-patch-"));
  t.teardown(async () => {
    await fs.rm(tmp, { recursive: true, force: true });
  });

  await execFileAsync("git", ["init"], { cwd: tmp });
  const target = path.join(tmp, "example.txt");
  await fs.writeFile(target, "hello\n", "utf8");

  const diff = [
    "diff --git a/example.txt b/example.txt",
    "--- a/example.txt",
    "+++ b/example.txt",
    "@@ -1 +1,2 @@",
    " hello",
    "+world",
    "",
  ].join("\n");

  const tool = applyPatchTool(buildCtx(tmp));
  const result = (await tool.invoke({ diff })) as {
    ok: boolean;
    stdout: string;
    stderr: string;
    check: boolean;
  };

  t.true(result.ok);
  t.false(result.check);

  const content = await fs.readFile(target, "utf8");
  t.true(content.includes("world"));
});

test.serial("supports dry-run validation", async (t) => {
  const tmp = await fs.mkdtemp(
    path.join(os.tmpdir(), "mcp-apply-patch-check-"),
  );
  t.teardown(async () => {
    await fs.rm(tmp, { recursive: true, force: true });
  });

  await execFileAsync("git", ["init"], { cwd: tmp });
  const target = path.join(tmp, "check.txt");
  await fs.writeFile(target, "alpha\n", "utf8");

  const diff = [
    "diff --git a/check.txt b/check.txt",
    "--- a/check.txt",
    "+++ b/check.txt",
    "@@ -1 +1,2 @@",
    " alpha",
    "+beta",
    "",
  ].join("\n");

  const tool = applyPatchTool(buildCtx(tmp));
  const validation = (await tool.invoke({ diff, check: true })) as {
    ok: boolean;
    check: boolean;
  };

  t.true(validation.ok);
  t.true(validation.check);

  const content = await fs.readFile(target, "utf8");
  t.is(content, "alpha\n");
});
