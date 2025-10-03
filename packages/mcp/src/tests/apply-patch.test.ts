import { execFile } from "node:child_process";
import { EventEmitter } from "node:events";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { PassThrough } from "node:stream";
import { promisify } from "node:util";

import test from "ava";
import esmock from "esmock";

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

type MockChildProcess = EventEmitter & {
  readonly stdout: PassThrough;
  readonly stderr: PassThrough;
  readonly stdin: PassThrough;
};

const createSpawnStub = () => {
  const history = { value: [] as ReadonlyArray<ReadonlyArray<string>> };

  const spawnImpl = ((
    _command: string,
    argsOrOptions?:
      | ReadonlyArray<string>
      | import("node:child_process").SpawnOptions,
    maybeOptions?: import("node:child_process").SpawnOptions,
  ) => {
    const args = Array.isArray(argsOrOptions) ? argsOrOptions : [];
    const options = Array.isArray(argsOrOptions) ? maybeOptions : argsOrOptions;
    void options;
    history.value = history.value.concat([Object.freeze(Array.from(args))]);
    const stdout = new PassThrough();
    const stderr = new PassThrough();
    const stdin = new PassThrough();

    const child = Object.assign(new EventEmitter(), {
      stdout,
      stderr,
      stdin,
    }) as MockChildProcess;

    queueMicrotask(() => {
      if (args.includes("--3way")) {
        stdout.end("");
        stderr.end("");
        (child.emit as (event: "close", code: number | null) => boolean)(
          "close",
          0,
        );
        return;
      }

      stdout.end("");
      stderr.end("patch failed");
      (child.emit as (event: "close", code: number | null) => boolean)(
        "close",
        1,
      );
    });

    return child as unknown as import("node:child_process").ChildProcessWithoutNullStreams;
  }) as typeof import("node:child_process").spawn;

  return {
    spawnImpl,
    getCalls: () => history.value,
  } as const;
};

test.serial("retries with --3way on git apply failure", async (t) => {
  const stub = createSpawnStub();
  const modulePath = new URL("../tools/apply-patch.js", import.meta.url)
    .pathname;

  const mod = await esmock<typeof import("../tools/apply-patch.js")>(
    modulePath,
    {
      "node:child_process": { spawn: stub.spawnImpl },
    },
  );

  const tool = mod.applyPatchTool(buildCtx(process.cwd()));
  const diff = [
    "diff --git a/example.txt b/example.txt",
    "--- a/example.txt",
    "+++ b/example.txt",
    "@@ -1 +1,2 @@",
    " example",
    "+patched",
    "",
  ].join("\n");

  const result = (await tool.invoke({ diff })) as { ok: boolean };

  t.true(result.ok);
  t.deepEqual(stub.getCalls(), [
    ["apply", "--whitespace=nowarn"],
    ["apply", "--whitespace=nowarn", "--3way"],
  ]);
});

test.serial("adds --check to --3way fallback when validating", async (t) => {
  const stub = createSpawnStub();
  const modulePath = new URL("../tools/apply-patch.js", import.meta.url)
    .pathname;

  const mod = await esmock<typeof import("../tools/apply-patch.js")>(
    modulePath,
    {
      "node:child_process": { spawn: stub.spawnImpl },
    },
  );

  const tool = mod.applyPatchTool(buildCtx(process.cwd()));
  const diff = [
    "diff --git a/example.txt b/example.txt",
    "--- a/example.txt",
    "+++ b/example.txt",
    "@@ -1 +1,2 @@",
    " example",
    "+patched",
    "",
  ].join("\n");

  const result = (await tool.invoke({ diff, check: true })) as {
    ok: boolean;
    check: boolean;
  };

  t.true(result.ok);
  t.true(result.check);
  t.deepEqual(stub.getCalls(), [
    ["apply", "--whitespace=nowarn", "--check"],
    ["apply", "--whitespace=nowarn", "--3way", "--check"],
  ]);
});
