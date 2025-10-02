import { execFile } from "node:child_process";
import { mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";

import test from "ava";

import {
  createSandbox,
  listSandboxes,
  removeSandbox,
  type SandboxInfo,
} from "../git.js";

const execFileAsync = promisify(execFile);

const initRepository = async (): Promise<string> => {
  const root = await mkdtemp(path.join(os.tmpdir(), "sandbox-repo-"));
  await execFileAsync("git", ["init", "-b", "main"], { cwd: root });
  await execFileAsync("git", ["config", "user.email", "test@example.com"], {
    cwd: root,
  });
  await execFileAsync("git", ["config", "user.name", "Test User"], {
    cwd: root,
  });
  await execFileAsync("git", ["config", "commit.gpgsign", "false"], {
    cwd: root,
  });
  await execFileAsync("git", ["config", "core.autocrlf", "false"], {
    cwd: root,
  });
  await execFileAsync("git", ["config", "advice.detachedHead", "false"], {
    cwd: root,
  });
  await execFileAsync("git", ["config", "init.defaultBranch", "main"], {
    cwd: root,
  });
  await execFileAsync("git", ["config", "pull.rebase", "false"], { cwd: root });

  const readmePath = path.join(root, "README.md");
  await writeFile(readmePath, "# test repo\n", "utf8");
  await execFileAsync("git", ["add", "README.md"], { cwd: root });
  await execFileAsync("git", ["commit", "-m", "initial"], { cwd: root });

  return root;
};

test("createSandbox creates a dedicated worktree", async (t) => {
  const repo = await initRepository();
  const sandbox = await createSandbox({
    repoPath: repo,
    sandboxId: "feature-one",
    ref: "HEAD",
    branch: "feature/one",
  });

  t.is(sandbox.id, "feature-one");
  t.true(sandbox.path.endsWith(path.join(".sandboxes", "feature-one")));
  t.is(sandbox.branch, "feature/one");

  const { stdout } = await execFileAsync(
    "git",
    ["rev-parse", "--abbrev-ref", "HEAD"],
    {
      cwd: sandbox.path,
    },
  );
  t.is(stdout.trim(), "feature/one");
});

test("listSandboxes enumerates created sandboxes", async (t) => {
  const repo = await initRepository();
  const sandboxA = await createSandbox({
    repoPath: repo,
    sandboxId: "alpha",
    ref: "HEAD",
    branch: "feature/alpha",
  });
  const sandboxB = await createSandbox({
    repoPath: repo,
    sandboxId: "beta",
    ref: "HEAD",
  });

  const sandboxes = await listSandboxes({ repoPath: repo });
  const identifiers = sandboxes.map((entry) => entry.id).sort();

  t.deepEqual(identifiers, ["alpha", "beta"]);
  const alpha = sandboxes.find((entry) => entry.id === "alpha") as SandboxInfo;
  t.is(alpha.branch, sandboxA.branch);
  const beta = sandboxes.find((entry) => entry.id === "beta") as SandboxInfo;
  t.is(beta.head, sandboxB.head);
});

test("removeSandbox deletes git worktree", async (t) => {
  const repo = await initRepository();
  await createSandbox({ repoPath: repo, sandboxId: "gamma", ref: "HEAD" });

  await removeSandbox({ repoPath: repo, sandboxId: "gamma" });

  const sandboxes = await listSandboxes({ repoPath: repo });
  t.false(sandboxes.some((entry) => entry.id === "gamma"));

  await t.throwsAsync(
    () => removeSandbox({ repoPath: repo, sandboxId: "gamma" }),
    { message: /does not exist/u },
  );
});
