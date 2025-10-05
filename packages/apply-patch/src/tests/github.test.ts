import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import test, { type ExecutionContext } from "ava";

import { createGithubCommit } from "../index.js";

type GitRunner = (
  args: readonly string[],
  options?: Record<string, unknown>,
) => string;
type CapturedRequest = { readonly url: unknown; readonly options: RequestInit };

type GraphqlBody = {
  readonly variables: {
    readonly input: {
      readonly expectedHeadOid: string;
      readonly fileChanges: { readonly deletions: readonly unknown[] };
      readonly message: { readonly body: string };
    };
  };
};

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(__dirname, "..", "..");
const repoRoot = resolve(packageRoot, "..", "..");
const FIXTURE_DIR = resolve(repoRoot, "tests", "__fixtures__", "apply_patch");

const initRepo = (): { readonly dir: string; readonly git: GitRunner } => {
  const dir = mkdtempSync(join(tmpdir(), "apply-patch-"));
  const git: GitRunner = (args, options = {}) => {
    const result = spawnSync("git", args, {
      cwd: dir,
      encoding: "utf8",
      ...options,
    });
    if (result.status !== 0) {
      throw new Error(
        result.stderr || result.stdout || `git ${args.join(" ")} failed`,
      );
    }
    return result.stdout.trim();
  };
  git(["init"]);
  git(["checkout", "-b", "main"]);
  git(["config", "user.email", "ci@example.com"]);
  git(["config", "user.name", "CI"]);
  mkdirSync(join(dir, "src"), { recursive: true });
  writeFileSync(
    join(dir, "src", "app.js"),
    [
      "console.log('start');",
      "console.log('middle');",
      "console.log('end');",
      "",
    ].join("\n"),
    "utf8",
  );
  git(["add", "."]);
  git(["commit", "-m", "init"]);
  return { dir, git };
};

const cleanup = (pathToRemove: string): void => {
  rmSync(pathToRemove, { recursive: true, force: true });
};

const readFixture = (name: string): string =>
  readFileSync(join(FIXTURE_DIR, name), "utf8");

const createFetchMock =
  (requests: CapturedRequest[], body: unknown, status = 200): typeof fetch =>
  async (url, options) => {
    requests.push({ url, options: { ...(options ?? {}) } });
    return new Response(JSON.stringify(body), { status });
  };

const isGraphqlBody = (value: unknown): value is GraphqlBody => {
  if (!value || typeof value !== "object") {
    return false;
  }
  const record = value as Record<string, unknown>;
  const variables = record.variables;
  if (!variables || typeof variables !== "object") {
    return false;
  }
  const input = (variables as Record<string, unknown>).input;
  if (!input || typeof input !== "object") {
    return false;
  }
  const expectedHeadOid = (input as Record<string, unknown>).expectedHeadOid;
  const fileChanges = (input as Record<string, unknown>).fileChanges;
  const message = (input as Record<string, unknown>).message;
  if (typeof expectedHeadOid !== "string") {
    return false;
  }
  if (!fileChanges || typeof fileChanges !== "object") {
    return false;
  }
  const deletions = (fileChanges as Record<string, unknown>).deletions;
  if (!Array.isArray(deletions)) {
    return false;
  }
  if (!message || typeof message !== "object") {
    return false;
  }
  const body = (message as Record<string, unknown>).body;
  return typeof body === "string";
};

const parseGraphqlBody = (text: string): GraphqlBody => {
  const parsed = JSON.parse(text) as unknown;
  if (!isGraphqlBody(parsed)) {
    throw new Error("unexpected payload shape");
  }
  return parsed;
};

const withRepo = async <T>(
  t: ExecutionContext,
  run: (dir: string, git: GitRunner) => Promise<T> | T,
): Promise<T> => {
  const { dir, git } = initRepo();
  t.teardown(() => cleanup(dir));
  return run(dir, git);
};

test("createGithubCommit builds request with trailers and summary", async (t) => {
  await withRepo(t, async (dir, git) => {
    const diff = readFixture("modify-file.diff");
    const expectedHeadOid = git(["rev-parse", "HEAD"]);
    const requests: CapturedRequest[] = [];
    const fetchImpl = createFetchMock(requests, {
      data: {
        createCommitOnBranch: {
          commit: {
            oid: "abc123",
            messageHeadline: "feat: test",
          },
        },
      },
    });
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
    const firstRequest = requests[0];
    if (!firstRequest) {
      t.fail("expected request capture");
      return;
    }
    const bodyText =
      typeof firstRequest.options.body === "string"
        ? firstRequest.options.body
        : "{}";
    const payload = parseGraphqlBody(bodyText);
    if (!payload) {
      return;
    }
    t.is(payload.variables.input.expectedHeadOid, expectedHeadOid);
    t.deepEqual(payload.variables.input.fileChanges.deletions, []);
    const headers = new Headers(firstRequest.options.headers);
    t.is(headers.get("Authorization"), "Bearer secrettoken");
    const body = payload.variables.input.message.body;
    t.true(body.includes("mcp: apply_patch"));
    t.true(body.includes("changes: src/app.js"));
  });
});

test("createGithubCommit returns conflict object", async (t) => {
  await withRepo(t, async (dir, git) => {
    const diff = readFixture("modify-file.diff");
    const expectedHeadOid = git(["rev-parse", "HEAD"]);
    const fetchImpl = createFetchMock([], {
      errors: [
        {
          message: "expectedHeadOid mismatch",
          extensions: {
            expectedHeadOid: "abc",
            actualHeadOid: "def",
          },
        },
      ],
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
    if (result.kind === "Conflict") {
      t.is(result.expectedHeadOid, "abc");
      t.is(result.actualHeadOid, "def");
    }
  });
});

test("createGithubCommit redacts secrets in logs", async (t) => {
  await withRepo(t, async (dir, git) => {
    const diff = readFixture("modify-file.diff");
    const expectedHeadOid = git(["rev-parse", "HEAD"]);
    const fetchImpl = createFetchMock([], {
      errors: [
        {
          message: "bad token",
          extensions: {},
        },
      ],
    });
    const messages: string[] = [];
    const original = console.error;
    console.error = (...args: unknown[]) => {
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
});

test("createGithubCommit retries on 502", async (t) => {
  await withRepo(t, async (dir, git) => {
    const diff = readFixture("modify-file.diff");
    const expectedHeadOid = git(["rev-parse", "HEAD"]);
    const requests: CapturedRequest[] = [];
    const fetchImpl: typeof fetch = async (url, options) => {
      const attemptIndex = requests.length;
      const response =
        attemptIndex === 0
          ? new Response(JSON.stringify({}), { status: 502 })
          : new Response(
              JSON.stringify({
                data: {
                  createCommitOnBranch: {
                    commit: {
                      oid: "after-retry",
                    },
                  },
                },
              }),
              { status: 200 },
            );
      requests.push({ url, options: { ...(options ?? {}) } });
      return response;
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
    t.is(requests.length, 2);
  });
});
