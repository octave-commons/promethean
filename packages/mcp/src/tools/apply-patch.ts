import { spawn } from "node:child_process";
import { buffer } from "node:stream/consumers";
import { resolve as resolvePath } from "node:path";

import { z } from "zod";

import { getMcpRoot } from "../files.js";
import type { ToolFactory } from "../core/types.js";

const isUniversalDiff = (value: string): boolean =>
  /^(?:Index: |diff --git|---\s)/m.test(value);

type GitApplyResult = Readonly<{
  stdout: string;
  stderr: string;
}>;

type GitApplyOptions = Readonly<{
  cwd: string;
  check: boolean;
}>;

type GitApplyErrorInit = Readonly<{
  stdout: string;
  stderr: string;
  attemptedThreeWay?: boolean;
}>;

class GitApplyError extends Error {
  readonly code: number | null;
  readonly stdout: string;
  readonly stderr: string;
  readonly attemptedThreeWay: boolean;

  constructor(message: string, code: number | null, init: GitApplyErrorInit) {
    super(message);
    this.name = "GitApplyError";
    this.code = code;
    this.stdout = init.stdout;
    this.stderr = init.stderr;
    this.attemptedThreeWay = init.attemptedThreeWay ?? false;
  }
}

const joinOutputs = (...parts: ReadonlyArray<string>): string =>
  parts
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .join("\n");

const createGitArgs = (
  check: boolean,
  threeWay: boolean,
): readonly string[] => [
  "apply",
  "--whitespace=nowarn",
  ...(threeWay ? ["--3way"] : []),
  ...(check ? ["--check"] : []),
];

const runGitApplyAttempt = async (
  diff: string,
  options: GitApplyOptions,
  threeWay: boolean,
): Promise<GitApplyResult> => {
  const child = spawn("git", createGitArgs(options.check, threeWay), {
    cwd: options.cwd,
    stdio: ["pipe", "pipe", "pipe"],
  });

  const exitCodePromise = new Promise<number | null>((resolve, reject) => {
    child.once("error", reject);
    child.once("close", resolve);
  });

  const stdoutPromise = buffer(child.stdout).then((buf) =>
    buf.toString("utf8"),
  );
  const stderrPromise = buffer(child.stderr).then((buf) =>
    buf.toString("utf8"),
  );

  child.stdin.end(diff, "utf8");

  const [code, stdout, stderr] = await Promise.all([
    exitCodePromise,
    stdoutPromise,
    stderrPromise,
  ]);

  if (code === 0) {
    return { stdout, stderr };
  }

  throw new GitApplyError("git apply failed", code, {
    stdout,
    stderr,
    attemptedThreeWay: threeWay,
  });
};

const runGitApply = (
  diff: string,
  options: GitApplyOptions,
): Promise<GitApplyResult> =>
  runGitApplyAttempt(diff, options, false).catch((error: unknown) => {
    if (!(error instanceof GitApplyError)) {
      throw error as Error;
    }

    return runGitApplyAttempt(diff, options, true).catch(
      (fallbackError: unknown) => {
        if (fallbackError instanceof GitApplyError) {
          throw new GitApplyError(
            "git apply failed after attempting 3-way merge",
            fallbackError.code,
            {
              stdout: joinOutputs(error.stdout, fallbackError.stdout),
              stderr: joinOutputs(
                error.stderr,
                fallbackError.stderr,
                "git apply --3way also failed",
              ),
              attemptedThreeWay: true,
            },
          );
        }
        throw fallbackError as Error;
      },
    );
  });

export const applyPatchTool: ToolFactory = (ctx) => {
  const shape = {
    diff: z.string().min(1, "diff is required"),
    check: z.boolean().default(false),
  } as const;
  const Schema = z.object(shape);

  const spec = {
    name: "apply_patch",
    description:
      "Apply a universal diff patch to the MCP sandbox using git apply.",
    inputSchema: shape,
  } as const;

  const invoke = async (raw: unknown) => {
    const argsParsed = Schema.parse(raw);
    const { diff, check } = argsParsed;

    if (!isUniversalDiff(diff)) {
      throw new Error("Input does not look like a universal diff");
    }

    const cwd = ctx.env.MCP_ROOT_PATH
      ? resolvePath(ctx.env.MCP_ROOT_PATH)
      : getMcpRoot();
    const onSuccess = (result: GitApplyResult) => ({
      ok: true as const,
      stdout: result.stdout.trim(),
      stderr: result.stderr.trim(),
      check,
    });
    const onFailure = (error: unknown): never => {
      if (error instanceof GitApplyError) {
        const tail = [error.stdout.trim(), error.stderr.trim()]
          .filter((part) => part.length > 0)
          .join("\n");
        const details = tail.length > 0 ? `: ${tail}` : "";
        throw new Error(
          `git apply exited with code ${error.code ?? "unknown"}${details}`,
        );
      }
      throw error as Error;
    };
    return runGitApply(diff, { cwd, check }).then(onSuccess, onFailure);
  };

  return { spec, invoke };
};
