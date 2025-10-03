import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "ava";

import { createGithubCommit } from "../../scripts/apply_patch.js";

function initRepo() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "apply-patch-"));
  const git = (args, options = {}) => {
    const res = spawnSync("git", args, {
      cwd: dir,
      encoding: "utf8",
      ...options,
    });
    if (res.status !== 0) {
      throw new Error(
        res.stderr || res.stdout || `git ${args.join(" ")} failed`,
      );
    }
    return res.stdout.trim();
  };
  git(["init"]);
  git(["checkout", "-b", "main"]);
  git(["config", "user.email", "ci@example.com"]);
  git(["config", "user.name", "CI"]);
  fs.mkdirSync(path.join(dir, "src"), { recursive: true });
  const initial = [
    "console.log('start');",
    "console.log('middle');",
    "console.log('end');",
    "",
  ].join("\n");
  fs.writeFileSync(path.join(dir, "src", "app.js"), initial, "utf8");
  git(["add", "."]);
  git(["commit", "-m", "init"]);
  return { dir, git };
}

function cleanup(pathToRemove) {
  fs.rmSync(pathToRemove, { recursive: true, force: true });
}

function readFixture(name) {
  return fs.readFileSync(
    path.join("tests", "__fixtures__", "apply_patch", name),
    "utf8",
  );
}

test("createGithubCommit builds request with trailers and summary", async (t) => {
  const { dir, git } = initRepo();
  t.teardown(() => cleanup(dir));
  const diff = readFixture("modify-file.diff");
  const expectedHeadOid = git(["rev-parse", "HEAD"]);
  const requests = [];
  const fetchImpl = async (url, options) => {
    requests.push({
      url,
      options: { ...options, headers: { ...options.headers } },
    });
    return {
      status: 200,
      async json() {
        return {
          data: {
            createCommitOnBranch: {
              commit: {
                oid: "abc123",
                messageHeadline: "feat: test",
              },
            },
          },
        };
      },
    };
  };

  const result = await createGithubCommit(
    {
      repoRoot: dir,
      diff,
      repositoryNameWithOwner: "owner/repo",
      branchName: "main",
      expectedHeadOid,
      message: { headline: "feat: test", body: "body" },
      graphqlUrl: "https://example.test/graphql",
      token: "secrettoken",
    },
    { fetchImpl, sleep: async () => {}, random: () => 0.1 },
  );

  t.true(result.ok);
  t.is(requests.length, 1);
  const payload = JSON.parse(requests[0].options.body);
  t.is(payload.variables.input.expectedHeadOid, expectedHeadOid);
  t.deepEqual(payload.variables.input.fileChanges.deletions, []);
  t.is(requests[0].options.headers.Authorization, "Bearer secrettoken");
  const body = payload.variables.input.message.body;
  t.true(body.includes("mcp: apply_patch"));
  t.true(body.includes("changes: src/app.js"));
});

test("createGithubCommit returns conflict object", async (t) => {
  const { dir, git } = initRepo();
  t.teardown(() => cleanup(dir));
  const diff = readFixture("modify-file.diff");
  const expectedHeadOid = git(["rev-parse", "HEAD"]);

  const fetchImpl = async () => ({
    status: 200,
    async json() {
      return {
        errors: [
          {
            message: "expectedHeadOid mismatch",
            extensions: {
              expectedHeadOid: "abc",
              actualHeadOid: "def",
            },
          },
        ],
      };
    },
  });

  const result = await createGithubCommit(
    {
      repoRoot: dir,
      diff,
      repositoryNameWithOwner: "owner/repo",
      branchName: "main",
      expectedHeadOid,
      message: { headline: "feat: test" },
      graphqlUrl: "https://example.test/graphql",
      token: "secrettoken",
    },
    { fetchImpl, sleep: async () => {}, random: () => 0.5 },
  );

  t.false(result.ok);
  t.is(result.kind, "Conflict");
  t.is(result.expectedHeadOid, "abc");
  t.is(result.actualHeadOid, "def");
});

test("createGithubCommit redacts secrets in logs", async (t) => {
  const { dir, git } = initRepo();
  t.teardown(() => cleanup(dir));
  const diff = readFixture("modify-file.diff");
  const expectedHeadOid = git(["rev-parse", "HEAD"]);
  const fetchImpl = async () => ({
    status: 200,
    async json() {
      return {
        errors: [
          {
            message: "bad token",
            extensions: {},
          },
        ],
      };
    },
  });

  const messages = [];
  const original = console.error;
  console.error = (...args) => {
    messages.push(args.join(" "));
  };
  try {
    await createGithubCommit(
      {
        repoRoot: dir,
        diff,
        repositoryNameWithOwner: "owner/repo",
        branchName: "main",
        expectedHeadOid,
        message: { headline: "feat" },
        graphqlUrl: "https://example.test/graphql",
        token: "ghp_secret1234567890",
      },
      { fetchImpl, sleep: async () => {}, random: () => 0.2 },
    );
  } finally {
    console.error = original;
  }

  const joined = messages.join("\n");
  t.false(joined.includes("ghp_secret1234567890"));
  t.true(joined.includes("[redacted]"));
});

test("createGithubCommit retries on 502", async (t) => {
  const { dir, git } = initRepo();
  t.teardown(() => cleanup(dir));
  const diff = readFixture("modify-file.diff");
  const expectedHeadOid = git(["rev-parse", "HEAD"]);
  let calls = 0;
  const fetchImpl = async () => {
    calls += 1;
    if (calls === 1) {
      return {
        status: 502,
        async json() {
          return {};
        },
      };
    }
    return {
      status: 200,
      async json() {
        return {
          data: {
            createCommitOnBranch: {
              commit: {
                oid: "after-retry",
              },
            },
          },
        };
      },
    };
  };

  const result = await createGithubCommit(
    {
      repoRoot: dir,
      diff,
      repositoryNameWithOwner: "owner/repo",
      branchName: "main",
      expectedHeadOid,
      message: { headline: "feat" },
      graphqlUrl: "https://example.test/graphql",
      token: "secrettoken",
    },
    { fetchImpl, sleep: async () => {}, random: () => 0 },
  );

  t.true(result.ok);
  t.is(calls, 2);
});
