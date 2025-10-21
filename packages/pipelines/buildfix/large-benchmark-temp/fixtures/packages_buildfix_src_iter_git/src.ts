import { spawn } from "node:child_process";
import { once } from "node:events";
import { text } from "node:stream/consumers";

import { git, isGitRepo, sanitizeBranch } from "../utils.js";

type ClosedProcess = {
  readonly status: "closed";
  readonly code: number | null;
  readonly signal: NodeJS.Signals | null;
};

type FailedProcess = {
  readonly status: "error";
};

type ProcessState = ClosedProcess | FailedProcess;

async function runGhCommand(
  args: readonly string[],
): Promise<string | undefined> {
  const child = spawn("gh", args, { stdio: ["ignore", "pipe", "inherit"] });

  const stdoutPromise = child.stdout
    ? text(child.stdout).catch(() => "")
    : Promise.resolve("");

  const closeEvent = once(child, "close") as Promise<
    [number | null, NodeJS.Signals | null]
  >;
  const errorEvent = once(child, "error") as Promise<[unknown]>;

  const outcomePromise = Promise.race([
    closeEvent.then(
      ([code, signal]): ProcessState => ({
        status: "closed",
        code,
        signal,
      }),
    ),
    errorEvent.then((): ProcessState => ({ status: "error" })),
  ]);

  const [outcome, output] = await Promise.all([outcomePromise, stdoutPromise]);

  if (outcome.status !== "closed" || outcome.signal || outcome.code !== 0) {
    return undefined;
  }

  const trimmed = output.trim();
  return trimmed ? trimmed : undefined;
}

export async function ensureBranch(branch: string): Promise<void> {
  const chk = await git(["rev-parse", "--verify", branch]);
  if (chk.code !== 0) await git(["checkout", "-b", branch]);
  else await git(["checkout", branch]);
}
export async function commitIfChanges(
  message: string,
): Promise<string | undefined> {
  const st = await git(["status", "--porcelain"]);
  if (!st.out) return undefined;
  await git(["add", "-A"]);
  const c = await git(["commit", "-m", message]);
  if (c.code !== 0) return undefined;
  const sha = await git(["rev-parse", "HEAD"]);
  return sha.out || undefined;
}
export async function pushBranch(
  branch: string,
  remote: string,
): Promise<boolean> {
  return (await git(["push", remote, branch])).code === 0;
}
export async function createPR(
  branch: string,
  title: string,
  bodyPath: string,
): Promise<string | undefined> {
  return runGhCommand([
    "pr",
    "create",
    "--fill",
    "--title",
    title,
    "--body-file",
    bodyPath,
    "--head",
    branch,
  ]);
}
export async function rollbackWorktree(): Promise<void> {
  // hard reset unstaged/staged changes; also drop untracked new files (e.g., snippets accidentally written in src/)
  await git(["reset", "--hard"]);
  await git(["clean", "-fd"]);
}

export { isGitRepo, sanitizeBranch };