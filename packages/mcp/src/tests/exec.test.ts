import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import test from "ava";
import { z } from "zod";

import { execListTool, execRunTool } from "../tools/exec.js";

const ListEntrySchema = z.object({
  id: z.string(),
  command: z.string(),
  args: z.array(z.string()),
  description: z.string().optional(),
  allowExtraArgs: z.boolean(),
  cwd: z.string(),
  timeoutMs: z.number(),
});

const ListResultSchema = z.array(ListEntrySchema);

const RunResultSchema = z.object({
  commandId: z.string(),
  command: z.string(),
  args: z.array(z.string()),
  cwd: z.string(),
  exitCode: z.number().int().nullable(),
  signal: z.string().optional(),
  stdout: z.string(),
  stderr: z.string(),
  durationMs: z.number(),
  timedOut: z.boolean(),
});

const writeConfig = (payload: unknown) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "mcp-exec-"));
  const file = path.join(dir, "config.json");
  fs.writeFileSync(file, JSON.stringify(payload, null, 2), "utf8");
  return file;
};

const mkCtx = (configPath: string) => ({
  env: {
    MCP_EXEC_CONFIG: configPath,
    MCP_ROOT_PATH: process.cwd(),
  } as NodeJS.ProcessEnv,
  fetch: async () =>
    new Response(JSON.stringify({ ok: true }), { status: 200 }),
  now: () => new Date(),
});

test("exec.list returns allowlisted commands", async (t) => {
  const configPath = writeConfig({
    commands: [
      {
        id: "git.status",
        command: "git",
        args: ["status", "--short"],
        description: "Git status in short form",
      },
    ],
  });
  const tool = execListTool(mkCtx(configPath));
  const commands = ListResultSchema.parse(await tool.invoke(undefined));
  t.is(commands.length, 1);
  const first = commands[0]!;
  t.is(first.id, "git.status");
  t.is(first.command, "git");
});

test("exec.run executes approved command", async (t) => {
  const configPath = writeConfig({
    commands: [
      {
        id: "echo.exec",
        command: "/bin/echo",
        args: ["exec-ok"],
      },
    ],
  });
  const tool = execRunTool(mkCtx(configPath));
  const result = RunResultSchema.parse(
    await tool.invoke({ commandId: "echo.exec" }),
  );
  t.is(result.exitCode, 0);
  t.true(result.stdout.includes("exec-ok"), JSON.stringify(result));
  t.false(result.timedOut);
});

test("exec.run rejects extra args when not allowed", async (t) => {
  const configPath = writeConfig({
    commands: [
      {
        id: "node.strict",
        command: process.execPath,
        args: ["-p", "process.argv.length"],
      },
    ],
  });
  const tool = execRunTool(mkCtx(configPath));
  await t.throwsAsync(
    async () => tool.invoke({ commandId: "node.strict", args: ["--version"] }),
    { message: /does not permit overriding args/ },
  );
});

test("exec.run appends extra args when allowed", async (t) => {
  const configPath = writeConfig({
    commands: [
      {
        id: "echo.args",
        command: "/bin/echo",
        args: [],
        allowExtraArgs: true,
      },
    ],
  });
  const tool = execRunTool(mkCtx(configPath));
  const result = RunResultSchema.parse(
    await tool.invoke({
      commandId: "echo.args",
      args: ["foo", "bar"],
    }),
  );
  t.is(result.exitCode, 0);
  t.is(result.stdout.trim(), "foo bar", JSON.stringify(result));
});

test("exec.run respects timeout", async (t) => {
  const configPath = writeConfig({
    defaultTimeoutMs: 50,
    forceKillDelayMs: 50,
    commands: [
      {
        id: "node.sleep",
        command: process.execPath,
        args: [
          "-e",
          "setTimeout(() => console.log('awake'), 200); setInterval(() => {}, 1000);",
        ],
      },
    ],
  });
  const tool = execRunTool(mkCtx(configPath));
  const result = RunResultSchema.parse(
    await tool.invoke({ commandId: "node.sleep" }),
  );
  t.true(result.timedOut);
  t.truthy(result.durationMs < 500);
});
