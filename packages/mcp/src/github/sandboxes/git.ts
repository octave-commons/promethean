import { execFile } from "node:child_process";
import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

type ExecFileResult = { readonly stdout: string; readonly stderr: string };

type GitArguments = readonly string[];

const SANDBOX_DIRECTORY_NAME = ".sandboxes";
const execFileAsync = promisify(execFile);
const MAX_BUFFER_SIZE = 10 * 1024 * 1024;

export class GitCommandError extends Error {
  public readonly args: GitArguments;

  public constructor(message: string, args: GitArguments, cause?: unknown) {
    super(message, { cause });
    this.name = "GitCommandError";
    this.args = args;
  }
}

const runGit = (cwd: string, args: GitArguments): Promise<ExecFileResult> =>
  execFileAsync("git", args, {
    cwd,
    encoding: "utf8",
    maxBuffer: MAX_BUFFER_SIZE,
  }).then(
    (result) => ({ stdout: result.stdout, stderr: result.stderr }),
    (error: unknown) => {
      const message =
        error instanceof Error && typeof error.message === "string"
          ? error.message
          : `git ${args.join(" ")} failed`;
      throw new GitCommandError(message, args, error);
    },
  );

const sanitizeSandboxId = (value: string): string => {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    throw new Error("sandboxId must not be empty");
  }

  if (trimmed === "." || trimmed === "..") {
    throw new Error("sandboxId cannot be '.' or '..'");
  }

  if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(trimmed)) {
    throw new Error(
      "sandboxId may only contain alphanumeric characters, dots, underscores, or hyphens",
    );
  }

  return trimmed;
};

const sanitizeGitRef = (value?: string): string | undefined => {
  if (value === undefined) {
    return undefined;
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    throw new Error("ref must not be empty");
  }

  if (!/^[A-Za-z0-9][A-Za-z0-9._:/-]*$/.test(trimmed)) {
    throw new Error("ref contains unsupported characters");
  }

  return trimmed;
};

const isInsideDirectory = (root: string, target: string): boolean => {
  const relative = path.relative(root, target);
  return (
    relative === "" ||
    (!relative.startsWith("..") && !path.isAbsolute(relative))
  );
};

const ensureWithinDirectory = (root: string, target: string) => {
  if (!isInsideDirectory(root, target)) {
    throw new Error(`Path ${target} escapes sandbox root ${root}`);
  }
};

const resolveRepositoryRoot = async (repoPath: string): Promise<string> => {
  const absolute = path.resolve(repoPath);
  const { stdout } = await runGit(absolute, ["rev-parse", "--show-toplevel"]);
  return path.resolve(stdout.trim());
};

const sandboxRootFor = (repoRoot: string): string =>
  path.join(repoRoot, SANDBOX_DIRECTORY_NAME);

const parseWorktreeEntries = (stdout: string): readonly WorktreeEntry[] => {
  const blocks = stdout
    .split(/\n{2,}/u)
    .map((block) => block.trim())
    .filter(Boolean);

  return blocks.map((block) => {
    const lines = block.split("\n");
    const pathLine = lines.find((line) => line.startsWith("worktree "));
    const headLine = lines.find((line) => line.startsWith("HEAD "));
    const branchLine = lines.find((line) => line.startsWith("branch "));
    const detached = lines.some((line) => line.trim() === "detached");

    if (!pathLine || !headLine) {
      throw new Error("Malformed git worktree list output");
    }

    const branch = detached
      ? undefined
      : branchLine?.slice("branch ".length).replace(/^refs\/heads\//u, "");

    return {
      path: pathLine.slice("worktree ".length).trim(),
      head: headLine.slice("HEAD ".length).trim(),
      branch: branch?.trim() ?? undefined,
    } satisfies WorktreeEntry;
  });
};

type WorktreeEntry = Readonly<{
  path: string;
  head: string;
  branch?: string;
}>;

const worktreeExists = async (
  repoRoot: string,
  target: string,
): Promise<boolean> => {
  const { stdout } = await runGit(repoRoot, [
    "worktree",
    "list",
    "--porcelain",
  ]);
  return parseWorktreeEntries(stdout).some(
    (entry) => path.resolve(entry.path) === path.resolve(target),
  );
};

export type SandboxInfo = Readonly<{
  id: string;
  path: string;
  head: string;
  branch?: string;
}>;

export type CreateSandboxOptions = Readonly<{
  repoPath: string;
  sandboxId: string;
  ref?: string;
  branch?: string;
}>;

export const createSandbox = async (
  options: CreateSandboxOptions,
): Promise<SandboxInfo> => {
  const sanitizedId = sanitizeSandboxId(options.sandboxId);
  const branchRef = sanitizeGitRef(options.branch);
  const checkoutRef = sanitizeGitRef(options.ref);
  const repoRoot = await resolveRepositoryRoot(options.repoPath);
  const sandboxesRoot = sandboxRootFor(repoRoot);
  await mkdir(sandboxesRoot, { recursive: true });

  const target = path.join(sandboxesRoot, sanitizedId);
  ensureWithinDirectory(sandboxesRoot, target);

  if (await worktreeExists(repoRoot, target)) {
    throw new Error(`Sandbox ${sanitizedId} already exists`);
  }

  const args = [
    "worktree",
    "add",
    ...(branchRef ? ["-b", branchRef] : []),
    target,
    ...(checkoutRef ? [checkoutRef] : []),
  ] as const;

  await runGit(repoRoot, args);

  const { stdout } = await runGit(repoRoot, [
    "worktree",
    "list",
    "--porcelain",
  ]);
  const entries = parseWorktreeEntries(stdout);
  const created = entries.find(
    (entry) => path.resolve(entry.path) === path.resolve(target),
  );

  if (!created) {
    throw new Error(`Failed to locate sandbox ${sanitizedId} after creation`);
  }

  return {
    id: sanitizedId,
    path: path.resolve(created.path),
    head: created.head,
    branch: created.branch,
  };
};

export type ListSandboxesOptions = Readonly<{ repoPath: string }>;

export const listSandboxes = async (
  options: ListSandboxesOptions,
): Promise<readonly SandboxInfo[]> => {
  const repoRoot = await resolveRepositoryRoot(options.repoPath);
  const sandboxesRoot = sandboxRootFor(repoRoot);
  const { stdout } = await runGit(repoRoot, [
    "worktree",
    "list",
    "--porcelain",
  ]);
  return parseWorktreeEntries(stdout)
    .map((entry) => ({
      entry,
      resolvedPath: path.resolve(entry.path),
    }))
    .filter(({ resolvedPath }) =>
      isInsideDirectory(sandboxesRoot, resolvedPath),
    )
    .map(({ entry, resolvedPath }) => ({
      id: path.relative(sandboxesRoot, resolvedPath),
      path: resolvedPath,
      head: entry.head,
      branch: entry.branch,
    }))
    .filter((info) => info.id.length > 0 && !info.id.includes(path.sep));
};

export type RemoveSandboxOptions = Readonly<{
  repoPath: string;
  sandboxId: string;
}>;

export const removeSandbox = async (
  options: RemoveSandboxOptions,
): Promise<void> => {
  const sanitizedId = sanitizeSandboxId(options.sandboxId);
  const repoRoot = await resolveRepositoryRoot(options.repoPath);
  const sandboxesRoot = sandboxRootFor(repoRoot);
  const target = path.join(sandboxesRoot, sanitizedId);
  ensureWithinDirectory(sandboxesRoot, target);

  if (!(await worktreeExists(repoRoot, target))) {
    throw new Error(`Sandbox ${sanitizedId} does not exist`);
  }

  await runGit(repoRoot, ["worktree", "remove", target]);
  await rm(target, { recursive: true, force: true });
};
