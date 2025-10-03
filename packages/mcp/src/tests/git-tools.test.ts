import test from "ava";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

import {
  githubReviewCheckoutBranch,
  githubReviewCommit,
  githubReviewCreateBranch,
  githubReviewPush,
  githubReviewRevertCommits,
} from "../tools/github/code-review.js";
import type { ToolContext } from "../core/types.js";

const execFileAsync = promisify(execFile);

const ctx: ToolContext = Object.freeze({
  env: {},
  fetch: (() => {
    throw new Error("fetch should not be called in git tool tests");
  }) as unknown as typeof fetch,
  now: () => new Date(),
});

const tempRepos: string[] = [];

const initRepo = async (): Promise<string> => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-git-"));
  tempRepos.push(dir);
  await execFileAsync("git", ["init"], { cwd: dir });
  await execFileAsync("git", ["config", "user.email", "ci@example.com"], {
    cwd: dir,
  });
  await execFileAsync("git", ["config", "user.name", "CI"], { cwd: dir });
  await fs.writeFile(path.join(dir, "README.md"), "hello\n");
  await execFileAsync("git", ["add", "README.md"], { cwd: dir });
  await execFileAsync("git", ["commit", "-m", "initial"], { cwd: dir });
  await execFileAsync("git", ["branch", "-M", "main"], { cwd: dir });
  return dir;
};

const readBranch = async (cwd: string): Promise<string> => {
  const { stdout } = await execFileAsync(
    "git",
    ["rev-parse", "--abbrev-ref", "HEAD"],
    {
      cwd,
      encoding: "utf8",
    },
  );
  return stdout.trim();
};

const readFile = async (cwd: string, file: string): Promise<string> => {
  const data = await fs.readFile(path.join(cwd, file), "utf8");
  return data;
};

test.after.always(async () => {
  await Promise.all(
    tempRepos.map(async (dir) =>
      fs.rm(dir, { recursive: true, force: true }).catch(() => undefined),
    ),
  );
});

const commitTool = githubReviewCommit(ctx);
const createBranchTool = githubReviewCreateBranch(ctx);
const checkoutBranchTool = githubReviewCheckoutBranch(ctx);
const revertTool = githubReviewRevertCommits(ctx);
const pushTool = githubReviewPush(ctx);

test("github.review.commit stages provided paths", async (t) => {
  const repo = await initRepo();
  await fs.writeFile(path.join(repo, "feature.txt"), "feature\n");

  const result = (await commitTool.invoke({
    cwd: repo,
    message: "feat: add feature",
    paths: ["feature.txt"],
  })) as { committed: boolean };

  t.true(result.committed);
  const log = await execFileAsync("git", ["log", "-1", "--pretty=%s"], {
    cwd: repo,
    encoding: "utf8",
  });
  t.is(log.stdout.trim(), "feat: add feature");
});

test("github.review.createBranch checks out new branch", async (t) => {
  const repo = await initRepo();
  await createBranchTool.invoke({ cwd: repo, branch: "feature/branch" });
  t.is(await readBranch(repo), "feature/branch");
});

test("github.review.checkoutBranch switches branch", async (t) => {
  const repo = await initRepo();
  await createBranchTool.invoke({ cwd: repo, branch: "feature/b" });
  await checkoutBranchTool.invoke({ cwd: repo, branch: "main" });
  t.is(await readBranch(repo), "main");
});

test("github.review.revertCommits reverts last commit", async (t) => {
  const repo = await initRepo();
  const file = path.join(repo, "README.md");
  await fs.writeFile(file, "change\n");
  await commitTool.invoke({
    cwd: repo,
    message: "chore: change",
    paths: ["README.md"],
  });
  const { stdout: commitId } = await execFileAsync(
    "git",
    ["rev-parse", "HEAD"],
    { cwd: repo, encoding: "utf8" },
  );

  await revertTool.invoke({ cwd: repo, commits: [commitId.trim()] });

  t.is(await readFile(repo, "README.md"), "hello\n");
});

test("github.review.push pushes to remote", async (t) => {
  const repo = await initRepo();
  const remoteDir = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-remote-"));
  tempRepos.push(remoteDir);
  await execFileAsync("git", ["init", "--bare"], { cwd: remoteDir });
  await execFileAsync("git", ["remote", "add", "origin", remoteDir], {
    cwd: repo,
  });

  const result = (await pushTool.invoke({
    cwd: repo,
    branch: "main",
    remote: "origin",
    setUpstream: true,
  })) as { pushed: boolean };

  t.true(result.pushed);
  const { stdout } = await execFileAsync("git", ["rev-parse", "main"], {
    cwd: remoteDir,
    encoding: "utf8",
  });
  const localHead = await execFileAsync("git", ["rev-parse", "HEAD"], {
    cwd: repo,
    encoding: "utf8",
  });
  t.is(stdout.trim(), localHead.stdout.trim());
});
