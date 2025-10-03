import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import type { Addition, Deletion } from "./github-types.js";
import type { DiffFile, DiffPlan, GithubCommitOptions } from "./types.js";

export type GitEnvironment = NodeJS.ProcessEnv & {
  readonly GIT_INDEX_FILE?: string;
};

export const summarizeFiles = (plan: DiffPlan, limit = 5): string => {
  const names = plan.files
    .map((file) => file.newPath || file.oldPath)
    .filter((name): name is string => Boolean(name));
  if (names.length === 0) {
    return "no files";
  }
  if (names.length <= limit) {
    return names.join(", ");
  }
  const shown = names.slice(0, limit).join(", ");
  return `${shown}, +${names.length - limit} more`;
};

export const appendTrailers = (
  body: string | undefined,
  trailers: readonly string[],
): string => {
  const trimmed = body ? body.trimEnd() : "";
  const entries = trimmed ? [trimmed, ...trailers] : [...trailers];
  return entries.join("\n");
};

export const runGit = (
  args: readonly string[],
  repoRoot: string,
  env: GitEnvironment,
): string => {
  const result = spawnSync("git", args, {
    cwd: repoRoot,
    encoding: "utf8",
    env,
  });
  if (result.status !== 0) {
    const message =
      result.stderr || result.stdout || `git ${args.join(" ")} failed`;
    throw new Error(message.trim());
  }
  return result.stdout;
};

const withTemporaryIndex = <T>(
  diff: string,
  repoRoot: string,
  task: (env: GitEnvironment) => T,
): T => {
  const tempDir = mkdtempSync(join(tmpdir(), "apply-patch-"));
  const indexPath = join(tempDir, "index");
  const patchPath = join(tempDir, "plan.patch");
  writeFileSync(patchPath, diff, "utf8");
  const env: GitEnvironment = { ...process.env, GIT_INDEX_FILE: indexPath };
  try {
    runGit(["read-tree", "HEAD"], repoRoot, env);
    runGit(
      ["apply", "--cached", "--whitespace=nowarn", patchPath],
      repoRoot,
      env,
    );
    return task(env);
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
};

const materializeFile = (
  file: DiffFile,
  repoRoot: string,
  env: GitEnvironment,
): Addition | null => {
  if (file.binary) {
    throw new Error(
      `Binary patch not supported: ${
        file.newPath || file.oldPath || "unknown"
      }`,
    );
  }
  if (file.status === "deleted") {
    return null;
  }
  const target = file.newPath || file.oldPath;
  if (!target) {
    return null;
  }
  const result = spawnSync("git", ["show", `:${target}`], {
    cwd: repoRoot,
    encoding: "utf8",
    env,
  });
  if (result.status !== 0) {
    const message =
      result.stderr || result.stdout || `Unable to materialize ${target}`;
    throw new Error(message.trim());
  }
  return {
    path: target,
    contents: Buffer.from(result.stdout, "utf8").toString("base64"),
  };
};

export const computeAdditions = (
  plan: DiffPlan,
  diff: string,
  repoRoot: string,
): Addition[] =>
  withTemporaryIndex(diff, repoRoot, (env) =>
    plan.files
      .map((file) => materializeFile(file, repoRoot, env))
      .filter((addition): addition is Addition => addition !== null),
  );

export const computeDeletions = (plan: DiffPlan): readonly Deletion[] =>
  plan.files
    .filter(
      (file) =>
        file.status === "deleted" ||
        (file.status === "renamed" && Boolean(file.oldPath)),
    )
    .map((file) => file.oldPath)
    .filter((path): path is string => Boolean(path))
    .map((path): Deletion => ({ path }));

export const ensureCheckSucceeds = (
  diff: string,
  repoRoot: string,
):
  | { readonly ok: true }
  | {
      readonly ok: false;
      readonly stdout: string;
      readonly stderr: string;
    } => {
  const result = spawnSync("git", ["apply", "--check", "--whitespace=nowarn"], {
    cwd: repoRoot,
    encoding: "utf8",
    input: diff,
  });
  return result.status === 0
    ? { ok: true }
    : { ok: false, stdout: result.stdout, stderr: result.stderr };
};

export const buildGraphqlPayload = (
  options: GithubCommitOptions,
  additions: readonly Addition[],
  deletions: readonly { readonly path: string }[],
  bodyWithTrailers: string,
): { readonly query: string; readonly variables: Record<string, unknown> } => ({
  query: `mutation ApplyPatch($input: CreateCommitOnBranchInput!) {
    createCommitOnBranch(input: $input) {
      commit {
        oid
        messageHeadline
      }
    }
  }`,
  variables: {
    input: {
      branch: {
        repositoryNameWithOwner: options.repositoryNameWithOwner,
        branchName: options.branchName,
      },
      expectedHeadOid: options.expectedHeadOid,
      message: {
        headline: options.message?.headline ?? "apply patch",
        body: bodyWithTrailers,
      },
      fileChanges: {
        additions,
        deletions,
      },
    },
  },
});

export const ensureDiffProvided = (options: GithubCommitOptions): void => {
  if (!options.diff || !options.diff.trim()) {
    throw new Error(
      'GitHub commit mode requires a unified diff in "patch" or "diff"',
    );
  }
  if (!options.repositoryNameWithOwner || !options.branchName) {
    throw new Error(
      "GitHub commit mode requires repositoryNameWithOwner and branchName",
    );
  }
  if (!options.expectedHeadOid) {
    throw new Error("GitHub commit mode requires expectedHeadOid");
  }
  if (!options.repoRoot) {
    throw new Error("GitHub commit mode requires repoRoot");
  }
};
