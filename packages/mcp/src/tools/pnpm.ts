import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { z } from "zod";

import { getMcpRoot } from "../files.js";
import type { Tool, ToolContext, ToolFactory } from "../core/types.js";

const execFileAsync = promisify(execFile);

const MAX_BUFFER = 16 * 1024 * 1024;
const DEFAULT_TIMEOUT = 10 * 60 * 1000;

const NON_WHITESPACE = /\S/;

export type FilterInput = string | readonly string[] | undefined;

export type PnpmResult = Readonly<{
  command: string;
  args: readonly string[];
  cwd: string;
  exitCode: number | null;
  signal?: NodeJS.Signals | null;
  stdout: string;
  stderr: string;
  error?: string;
}>;

type PnpmExecutor = (args: readonly string[]) => Promise<PnpmResult>;

const isDefinedString = (
  entry: readonly [string, string | undefined],
): entry is readonly [string, string] => typeof entry[1] === "string";

const sanitizeEnv = (
  env: Readonly<Record<string, string | undefined>>,
): NodeJS.ProcessEnv =>
  Object.fromEntries(
    Object.entries({ ...process.env, ...env }).filter(isDefinedString),
  );

const isExecError = (
  value: unknown,
): value is NodeJS.ErrnoException & {
  stdout?: string;
  stderr?: string;
  signal?: NodeJS.Signals;
} =>
  Boolean(
    value &&
      typeof value === "object" &&
      "stdout" in value &&
      "stderr" in value,
  );

const toSuccessResult = (bin: string, args: readonly string[], cwd: string) =>
  ({
    command: bin,
    args,
    cwd,
    exitCode: 0,
  }) satisfies Pick<PnpmResult, "command" | "args" | "cwd" | "exitCode">;

const mergeSuccess = (
  base: Pick<PnpmResult, "command" | "args" | "cwd" | "exitCode">,
  io: Readonly<{ stdout: string; stderr: string }>,
): PnpmResult => ({
  ...base,
  stdout: io.stdout,
  stderr: io.stderr,
});

const toErrorResult = (
  bin: string,
  args: readonly string[],
  cwd: string,
  error: NodeJS.ErrnoException & {
    stdout?: string;
    stderr?: string;
    signal?: NodeJS.Signals;
  },
): PnpmResult => {
  const exitCode = typeof error.code === "number" ? error.code : null;
  return {
    command: bin,
    args,
    cwd,
    exitCode,
    signal: error.signal ?? null,
    stdout: error.stdout ?? "",
    stderr: error.stderr ?? "",
    error: exitCode && exitCode !== 0 ? error.message : undefined,
  };
};

const runPnpmCommand = (
  ctx: ToolContext,
  args: readonly string[],
): Promise<PnpmResult> => {
  const bin = ctx.env.PNPM_BIN ?? "pnpm";
  const cwd = getMcpRoot();
  const env = sanitizeEnv(ctx.env);
  const base = toSuccessResult(bin, args, cwd);
  const handleError = (error: unknown): PnpmResult | Promise<PnpmResult> => {
    if (!isExecError(error)) {
      return Promise.reject(error);
    }
    if (!(typeof error.code === "number" || error.code === null)) {
      return Promise.reject(error);
    }
    return toErrorResult(bin, args, cwd, error);
  };

  return execFileAsync(bin, args, {
    cwd,
    env,
    encoding: "utf8",
    maxBuffer: MAX_BUFFER,
    timeout: DEFAULT_TIMEOUT,
  })
    .then((io) => mergeSuccess(base, io))
    .catch(handleError);
};

const toStringArray = (value: string | readonly string[]): readonly string[] =>
  (Array.isArray(value) ? value : [value]) as readonly string[];

export const normalizeStringList = (
  value: string | readonly string[],
): readonly string[] =>
  toStringArray(value).map((entry: string) => entry.trim());

export const normalizeFilters = (filter?: FilterInput): readonly string[] => {
  if (!filter) return [];
  const values = normalizeStringList(filter).filter(
    (entry) => entry.length > 0,
  );
  return Array.from(new Set(values));
};

export const buildPnpmArgs = (
  command: readonly string[],
  options: Readonly<{ filter?: FilterInput }> = {},
): readonly string[] => [
  ...normalizeFilters(options.filter).flatMap((value) => ["--filter", value]),
  ...command,
];

const createExecutor = (ctx: ToolContext): PnpmExecutor => {
  return (args) => runPnpmCommand(ctx, args);
};

const NonEmptyString = z.string().min(1).regex(NON_WHITESPACE);
const StringList = z.union([NonEmptyString, z.array(NonEmptyString).min(1)]);
const OptionalStringList = StringList.optional();

const normalizeDependencies = (
  value: string | readonly string[],
): readonly string[] => {
  const values = normalizeStringList(value).filter((entry) => entry.length > 0);
  if (values.length === 0) {
    throw new Error("At least one dependency is required.");
  }
  return values;
};

const installShape = {
  filter: OptionalStringList,
  frozenLockfile: z.boolean().optional(),
  offline: z.boolean().optional(),
  force: z.boolean().optional(),
  ignoreScripts: z.boolean().optional(),
} as const;

const addShape = {
  dependencies: StringList,
  filter: OptionalStringList,
  dev: z.boolean().optional(),
  optional: z.boolean().optional(),
  peer: z.boolean().optional(),
  exact: z.boolean().optional(),
} as const;

const removeShape = {
  dependencies: StringList,
  filter: OptionalStringList,
} as const;

const runScriptShape = {
  script: NonEmptyString,
  args: z.array(z.string()).optional(),
  filter: OptionalStringList,
} as const;

const createInstallTool = (
  ctx: ToolContext,
  exec: PnpmExecutor = createExecutor(ctx),
): Tool => {
  const Schema = z.object(installShape);
  const spec = {
    name: "pnpm.install",
    description:
      "Run pnpm install at the workspace root or limited to filtered packages.",
    inputSchema: installShape,
  } as const;

  const invoke = async (raw: unknown) => {
    const { filter, frozenLockfile, offline, force, ignoreScripts } =
      Schema.parse(raw);
    const command = [
      "install",
      ...(frozenLockfile ? ["--frozen-lockfile"] : []),
      ...(offline ? ["--offline"] : []),
      ...(force ? ["--force"] : []),
      ...(ignoreScripts ? ["--ignore-scripts"] : []),
    ];
    const args = buildPnpmArgs(command, { filter });
    return exec(args);
  };

  return { spec, invoke };
};

const createAddTool = (
  ctx: ToolContext,
  exec: PnpmExecutor = createExecutor(ctx),
): Tool => {
  const Schema = z.object(addShape);
  const spec = {
    name: "pnpm.add",
    description:
      "Add dependencies via pnpm, optionally scoped to specific workspace packages.",
    inputSchema: addShape,
  } as const;

  const invoke = async (raw: unknown) => {
    const { dependencies, filter, dev, optional, peer, exact } =
      Schema.parse(raw);
    const deps = normalizeDependencies(dependencies);
    const flags = [
      ...(dev ? ["--save-dev"] : []),
      ...(optional ? ["--save-optional"] : []),
      ...(peer ? ["--save-peer"] : []),
      ...(exact ? ["--save-exact"] : []),
    ];
    const command = ["add", ...flags, ...deps];
    const args = buildPnpmArgs(command, { filter });
    return exec(args);
  };

  return { spec, invoke };
};

const createRemoveTool = (
  ctx: ToolContext,
  exec: PnpmExecutor = createExecutor(ctx),
): Tool => {
  const Schema = z.object(removeShape);
  const spec = {
    name: "pnpm.remove",
    description:
      "Remove dependencies via pnpm, optionally scoped to workspace filters.",
    inputSchema: removeShape,
  } as const;

  const invoke = async (raw: unknown) => {
    const { dependencies, filter } = Schema.parse(raw);
    const deps = normalizeDependencies(dependencies);
    const command = ["remove", ...deps];
    const args = buildPnpmArgs(command, { filter });
    return exec(args);
  };

  return { spec, invoke };
};

const createRunScriptTool = (
  ctx: ToolContext,
  exec: PnpmExecutor = createExecutor(ctx),
): Tool => {
  const Schema = z.object(runScriptShape);
  const spec = {
    name: "pnpm.runScript",
    description:
      "Execute a pnpm script, optionally filtered to specific workspace packages.",
    inputSchema: runScriptShape,
  } as const;

  const invoke = async (raw: unknown) => {
    const { script, args: extraArgs, filter } = Schema.parse(raw);
    const extras: readonly string[] = extraArgs ?? [];
    const sanitizedExtras = extras
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0);
    const argsSegment =
      sanitizedExtras.length > 0 ? ["--", ...sanitizedExtras] : [];
    const command = ["run", script, ...argsSegment];
    const args = buildPnpmArgs(command, { filter });
    return exec(args);
  };

  return { spec, invoke };
};

export const pnpmInstall: ToolFactory = (ctx) => createInstallTool(ctx);
export const pnpmAdd: ToolFactory = (ctx) => createAddTool(ctx);
export const pnpmRemove: ToolFactory = (ctx) => createRemoveTool(ctx);
export const pnpmRunScript: ToolFactory = (ctx) => createRunScriptTool(ctx);

export const __test__ = {
  createInstallTool,
  createAddTool,
  createRemoveTool,
  createRunScriptTool,
  createExecutor,
  runPnpmCommand,
  normalizeDependencies,
};
