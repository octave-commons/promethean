import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { z } from "zod";

import { getMcpRoot } from "../files.js";
import type { ToolContext, ToolFactory, ToolSpec } from "../core/types.js";

const execFileAsync = promisify(execFile);

const MAX_BUFFER = 16 * 1024 * 1024;
const DEFAULT_TIMEOUT = 10 * 60 * 1000;
const NON_WHITESPACE = /\S/;

const PRESETS = ["ts-lib", "base", "web-frontend", "fastify-service"] as const;

export type NxPreset = (typeof PRESETS)[number];

const DEFAULT_PRESET: NxPreset = "ts-lib";
const GENERATOR_ID = "tools:package";

const PRESET_ALIASES = new Map<string, NxPreset>([
  ["ts-lib", "ts-lib"],
  ["tslib", "ts-lib"],
  ["library", "ts-lib"],
  ["lib", "ts-lib"],
  ["base", "base"],
  ["frontend", "web-frontend"],
  ["web-frontend", "web-frontend"],
  ["web", "web-frontend"],
  ["ui", "web-frontend"],
  ["fastify", "fastify-service"],
  ["fastify-service", "fastify-service"],
  ["service", "fastify-service"],
]) as ReadonlyMap<string, NxPreset>;

type NxExecError = Readonly<
  NodeJS.ErrnoException & {
    stdout?: string;
    stderr?: string;
    signal?: NodeJS.Signals;
  }
>;

const isDefinedString = (
  entry: readonly [string, string | undefined],
): entry is readonly [string, string] => typeof entry[1] === "string";

const sanitizeEnv = (
  env: Readonly<Record<string, string | undefined>>,
): Readonly<Record<string, string>> =>
  Object.fromEntries(
    Object.entries({ ...process.env, ...env }).filter(isDefinedString),
  ) as Readonly<Record<string, string>>;

const isExecError = (value: unknown): value is NxExecError =>
  Boolean(
    value &&
      typeof value === "object" &&
      "stdout" in value &&
      "stderr" in value,
  );

export type NxGenerateResult = Readonly<{
  command: string;
  args: readonly string[];
  cwd: string;
  exitCode: number | null;
  signal?: NodeJS.Signals | null;
  stdout: string;
  stderr: string;
  error?: string;
}>;

type NxExecutor = (args: readonly string[]) => Promise<NxGenerateResult>;

const toSuccessResult = (
  command: string,
  args: readonly string[],
  cwd: string,
): Pick<NxGenerateResult, "command" | "args" | "cwd" | "exitCode"> => ({
  command,
  args,
  cwd,
  exitCode: 0,
});

const mergeSuccess = (
  base: Pick<NxGenerateResult, "command" | "args" | "cwd" | "exitCode">,
  io: Readonly<{ stdout: string; stderr: string }>,
): NxGenerateResult => ({
  ...base,
  stdout: io.stdout,
  stderr: io.stderr,
});

const toErrorResult = (
  command: string,
  args: readonly string[],
  cwd: string,
  error: NxExecError,
): NxGenerateResult => {
  const exitCode = typeof error.code === "number" ? error.code : null;
  return {
    command,
    args,
    cwd,
    exitCode,
    signal: error.signal ?? null,
    stdout: error.stdout ?? "",
    stderr: error.stderr ?? "",
    error: exitCode && exitCode !== 0 ? error.message : undefined,
  };
};

const runNxCommand = (
  ctx: ToolContext,
  args: readonly string[],
): Promise<NxGenerateResult> => {
  const bin = ctx.env.PNPM_BIN ?? "pnpm";
  const cwd = getMcpRoot();
  const env = sanitizeEnv(ctx.env);
  const base = toSuccessResult(bin, args, cwd);

  const handleError = (
    error: unknown,
  ): NxGenerateResult | Promise<NxGenerateResult> => {
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
    env: { ...env },
    encoding: "utf8",
    maxBuffer: MAX_BUFFER,
    timeout: DEFAULT_TIMEOUT,
  })
    .then((io) => mergeSuccess(base, io))
    .catch(handleError);
};

const normalizePresetKey = (value: string): string =>
  value.trim().toLowerCase();

export const resolvePreset = (input?: string): NxPreset => {
  if (!input) {
    return DEFAULT_PRESET;
  }
  const preset = PRESET_ALIASES.get(normalizePresetKey(input));
  if (!preset) {
    const allowed = Array.from(
      new Set([DEFAULT_PRESET, ...PRESET_ALIASES.values()]),
    );
    throw new Error(
      `Unknown preset "${input}". Expected one of: ${Array.from(allowed).join(
        ", ",
      )}.`,
    );
  }
  return preset;
};

export const buildNxGenerateArgs = (
  options: Readonly<{ name: string; preset: NxPreset; dryRun: boolean }>,
): readonly string[] => {
  const baseArgs = [
    "exec",
    "nx",
    "generate",
    GENERATOR_ID,
    "--name",
    options.name,
    "--preset",
    options.preset,
    "--no-interactive",
  ] as const;

  if (!options.dryRun) {
    return baseArgs;
  }

  return [...baseArgs, "--dry-run"] as const;
};

const createTool = (
  _ctx: ToolContext,
  executor: NxExecutor,
): ReturnType<ToolFactory> => {
  const shape = {
    name: z.string().min(1).regex(NON_WHITESPACE),
    preset: z.string().min(1).regex(NON_WHITESPACE).optional(),
    dryRun: z.boolean().default(false),
  } as const;
  const Schema = z.object(shape);

  const spec = {
    name: "nx.generatePackage",
    description:
      "Generate a new workspace package using the Nx tools:package generator.",
    inputSchema: shape,
    stability: "experimental",
    since: "0.1.0",
  } satisfies ToolSpec;

  const invoke = async (raw: unknown) => {
    const parsed = Schema.parse(raw);
    const name = parsed.name.trim();
    const preset = resolvePreset(parsed.preset);
    const dryRun = parsed.dryRun ?? false;
    const args = buildNxGenerateArgs({ name, preset, dryRun });
    return executor(args);
  };

  return { spec, invoke };
};

export const nxGeneratePackage: ToolFactory = (ctx) =>
  createTool(ctx, (args) => runNxCommand(ctx, args));

export const __test__ = {
  createTool,
  resolvePreset,
  buildNxGenerateArgs,
  runNxCommand,
};
