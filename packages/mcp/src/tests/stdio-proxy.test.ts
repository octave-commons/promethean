import { chmodSync, mkdtempSync, writeFileSync } from "node:fs";
import path from "node:path";
import { tmpdir } from "node:os";

import test from "ava";

import { createStdioEnv, resolveCommandPath } from "../proxy/stdio-proxy.js";

const EXEC_PATH = "/usr/local/bin/node";

const segments = (value: string | undefined): readonly string[] =>
  value?.split(path.delimiter) ?? [];

test("createStdioEnv merges current env with overrides", (t) => {
  const baseEnv: NodeJS.ProcessEnv = {
    PATH: "/tmp/base",
    KEEP: "1",
  };

  const env = createStdioEnv({ PATH: "/override", EXTRA: "yes" }, baseEnv, EXEC_PATH);

  t.is(env.EXTRA, "yes");
  t.is(env.KEEP, "1");
  t.true(env.PATH?.startsWith("/override"));
  t.true(segments(env.PATH).includes(path.dirname(EXEC_PATH)));
});

test("createStdioEnv copies Path when PATH is missing", (t) => {
  const baseEnv: NodeJS.ProcessEnv = {
    Path: "/windows/base",
  };

  const env = createStdioEnv({}, baseEnv, EXEC_PATH);

  const pathSegments = segments(env.PATH);
  t.true(pathSegments[0] === "/windows/base");
  t.true(pathSegments.includes(path.dirname(EXEC_PATH)));
});

test("createStdioEnv falls back to exec directory when no path is present", (t) => {
  const baseEnv: NodeJS.ProcessEnv = {};

  const env = createStdioEnv({}, baseEnv, EXEC_PATH);

  t.is(env.PATH, path.dirname(EXEC_PATH));
});

test("resolveCommandPath returns absolute binary when present in PATH", (t) => {
  const tempDir = mkdtempSync(path.join(tmpdir(), "mcp-cmd-"));
  const scriptPath = path.join(tempDir, "mycmd");
  writeFileSync(scriptPath, "#!/bin/sh\nexit 0\n", { mode: 0o755 });
  chmodSync(scriptPath, 0o755);

  const env = { PATH: tempDir } as Readonly<Record<string, string>>;
  t.is(resolveCommandPath("mycmd", env), scriptPath);
});

test("resolveCommandPath leaves command unchanged when not found", (t) => {
  const env = { PATH: "/nonexistent" } as Readonly<Record<string, string>>;
  t.is(resolveCommandPath("nonexistent-command", env), "nonexistent-command");
});
