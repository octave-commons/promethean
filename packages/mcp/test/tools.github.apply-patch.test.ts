import { mkdirSync, writeFileSync } from "node:fs";
import { EventEmitter } from "node:events";
import { join } from "node:path";
import { PassThrough } from "node:stream";

import test from "ava";
import esmock from "esmock";

import { githubApplyPatchTool } from "../src/tools/github/apply-patch.js";

type FetchCall = {
  readonly url: string;
  readonly init: RequestInit;
};

const parseRequest = async (init: RequestInit): Promise<unknown> => {
  const body = init.body;
  if (!body) return null;
  if (typeof body === "string") return JSON.parse(body);
  if (body instanceof ArrayBuffer) {
    return JSON.parse(Buffer.from(body).toString("utf8"));
  }
  if (ArrayBuffer.isView(body)) {
    return JSON.parse(Buffer.from(body.buffer).toString("utf8"));
  }
  throw new Error("Unsupported request body type");
};

test("github.apply_patch commits new file", async (t) => {
  const calls: FetchCall[] = [];

  const fetchImpl: typeof fetch = async (input, init = {}) => {
    const url = typeof input === "string" ? input : (input as URL).toString();
    const method = (init.method ?? "GET").toUpperCase();
    calls.push({ url, init: { ...init, method } });

    if (url.startsWith("https://api.github.com/git/ref/")) {
      return new Response("Not found", { status: 404 });
    }

    if (
      url === "https://api.github.com/repos/octo/demo/git/ref/heads/main" &&
      method === "GET"
    ) {
      return new Response(JSON.stringify({ object: { sha: "abc123" } }), {
        status: 200,
      });
    }

    if (url === "https://api.github.com/graphql" && method === "POST") {
      const payload = (await parseRequest(init)) as any;
      const additions = payload?.variables?.input?.fileChanges?.additions;
      t.deepEqual(additions, [
        {
          path: "docs/README.txt",
          contents: Buffer.from("Hello world\n").toString("base64"),
        },
      ]);
      return new Response(
        JSON.stringify({
          data: {
            createCommitOnBranch: {
              commit: {
                oid: "def456",
                url: "https://github.com/octo/demo/commit/def456",
              },
            },
          },
        }),
        { status: 200 },
      );
    }

    throw new Error(`Unexpected request: ${method} ${url}`);
  };

  const ctx: any = {
    env: {
      GITHUB_TOKEN: "token",
    },
    fetch: fetchImpl,
  };

  const tool = githubApplyPatchTool(ctx);
  const diff = `diff --git a/docs/README.txt b/docs/README.txt
new file mode 100644
index 0000000..e69de29
--- /dev/null
+++ b/docs/README.txt
@@ -0,0 +1 @@
+Hello world
`;

  const result: any = await tool.invoke({
    owner: "octo",
    repo: "demo",
    branch: "main",
    message: "docs: add README",
    diff,
  });

  t.true(result.ok);
  t.is(result.commitOid, "def456");
  t.is(result.additions, 1);
  t.is(result.deletions, 0);
  t.true(calls.some((call) => call.url.endsWith("git/ref/heads/main")));
});

type MockChildProcess = EventEmitter & {
  readonly stdout: PassThrough;
  readonly stderr: PassThrough;
  readonly stdin: PassThrough;
};

const createGitApplySpawnStub = () => {
  const history = { value: [] as ReadonlyArray<ReadonlyArray<string>> };

  const spawnImpl = ((
    _command: string,
    argsOrOptions?:
      | ReadonlyArray<string>
      | import("node:child_process").SpawnOptions,
    maybeOptions?: import("node:child_process").SpawnOptions,
  ) => {
    const args = Array.isArray(argsOrOptions) ? argsOrOptions : [];
    const options = Array.isArray(argsOrOptions) ? maybeOptions : argsOrOptions;
    history.value = history.value.concat([Object.freeze(Array.from(args))]);
    const stdout = new PassThrough();
    const stderr = new PassThrough();
    const stdin = new PassThrough();

    const child = Object.assign(new EventEmitter(), {
      stdout,
      stderr,
      stdin,
    }) as MockChildProcess;

    const cwd =
      options && typeof options === "object" && "cwd" in options
        ? (options.cwd as string | undefined)
        : undefined;

    queueMicrotask(() => {
      if (args.includes("--3way")) {
        if (cwd) {
          mkdirSync(join(cwd, "docs"), { recursive: true });
          writeFileSync(join(cwd, "docs/README.txt"), "Hello world\n", "utf8");
        }
        stdout.end("");
        stderr.end("");
        (child.emit as (event: "close", code: number | null) => boolean)(
          "close",
          0,
        );
        return;
      }

      stdout.end("");
      stderr.end("patch failed");
      (child.emit as (event: "close", code: number | null) => boolean)(
        "close",
        1,
      );
    });

    return child as unknown as import("node:child_process").ChildProcessWithoutNullStreams;
  }) as typeof import("node:child_process").spawn;

  return {
    spawnImpl,
    getCalls: () => history.value,
  } as const;
};

test.serial(
  "github.apply_patch retries git apply with --3way fallback",
  async (t) => {
    const fetchCalls: FetchCall[] = [];
    const stub = createGitApplySpawnStub();

    const modulePath = new URL(
      "../src/tools/github/apply-patch.js",
      import.meta.url,
    ).pathname;
    const mod = await esmock<
      typeof import("../src/tools/github/apply-patch.js")
    >(modulePath, {
      "node:child_process": { spawn: stub.spawnImpl },
    });

    const fetchImpl: typeof fetch = async (input, init = {}) => {
      const url = typeof input === "string" ? input : (input as URL).toString();
      const method = (init.method ?? "GET").toUpperCase();
      fetchCalls.push({ url, init: { ...init, method } });

      if (url.startsWith("https://api.github.com/git/ref/")) {
        return new Response("Not found", { status: 404 });
      }

      if (
        url === "https://api.github.com/repos/octo/demo/git/ref/heads/main" &&
        method === "GET"
      ) {
        return new Response(JSON.stringify({ object: { sha: "abc123" } }), {
          status: 200,
        });
      }

      if (url === "https://api.github.com/graphql" && method === "POST") {
        return new Response(
          JSON.stringify({
            data: {
              createCommitOnBranch: {
                commit: {
                  oid: "def456",
                  url: "https://github.com/octo/demo/commit/def456",
                },
              },
            },
          }),
          { status: 200 },
        );
      }

      throw new Error(`Unexpected request: ${method} ${url}`);
    };

    const ctx: any = {
      env: {
        GITHUB_TOKEN: "token",
      },
      fetch: fetchImpl,
    };

    const tool = mod.githubApplyPatchTool(ctx);
    const diff = `diff --git a/docs/README.txt b/docs/README.txt
new file mode 100644
index 0000000..e69de29
--- /dev/null
+++ b/docs/README.txt
@@ -0,0 +1 @@
+Hello world
`;

    const result: any = await tool.invoke({
      owner: "octo",
      repo: "demo",
      branch: "main",
      message: "docs: add README",
      diff,
    });

    t.true(result.ok);
    t.deepEqual(stub.getCalls(), [
      ["apply", "--whitespace=nowarn"],
      ["apply", "--whitespace=nowarn", "--3way"],
    ]);
    t.true(
      fetchCalls.some(
        (call) =>
          call.url.endsWith("git/ref/heads/main") && call.init.method === "GET",
      ),
    );
  },
);

test("github.apply_patch commits file edits", async (t) => {
  const calls: FetchCall[] = [];

  const fetchImpl: typeof fetch = async (input, init = {}) => {
    const url = typeof input === "string" ? input : (input as URL).toString();
    const method = (init.method ?? "GET").toUpperCase();
    calls.push({ url, init: { ...init, method } });

    if (
      url ===
        "https://api.github.com/repos/octo/demo/contents/src/app.txt?ref=main" &&
      method === "GET"
    ) {
      return new Response(
        JSON.stringify({
          content: Buffer.from("hello\n").toString("base64"),
          encoding: "base64",
        }),
      );
    }

    if (
      url === "https://api.github.com/repos/octo/demo/git/ref/heads/main" &&
      method === "GET"
    ) {
      return new Response(JSON.stringify({ object: { sha: "abc123" } }));
    }

    if (url === "https://api.github.com/graphql" && method === "POST") {
      const payload = (await parseRequest(init)) as any;
      const additions = payload?.variables?.input?.fileChanges?.additions;
      t.deepEqual(additions, [
        {
          path: "src/app.txt",
          contents: Buffer.from("goodbye\n").toString("base64"),
        },
      ]);
      return new Response(
        JSON.stringify({
          data: {
            createCommitOnBranch: {
              commit: {
                oid: "fed321",
                url: "https://github.com/octo/demo/commit/fed321",
              },
            },
          },
        }),
      );
    }

    throw new Error(`Unexpected request: ${method} ${url}`);
  };

  const ctx: any = {
    env: {
      GITHUB_TOKEN: "token",
    },
    fetch: fetchImpl,
  };

  const tool = githubApplyPatchTool(ctx);
  const diff = `diff --git a/src/app.txt b/src/app.txt
index e965047..8ddddef 100644
--- a/src/app.txt
+++ b/src/app.txt
@@ -1 +1 @@
-hello
+goodbye
`;

  const result: any = await tool.invoke({
    owner: "octo",
    repo: "demo",
    branch: "main",
    message: "feat: update app greeting",
    diff,
  });

  t.true(result.ok);
  t.is(result.commitOid, "fed321");
  t.is(result.additions, 1);
  t.is(result.deletions, 0);
  t.true(
    calls.some((call) =>
      call.url.startsWith(
        "https://api.github.com/repos/octo/demo/contents/src/app.txt",
      ),
    ),
  );
});

test("github.apply_patch commits deletions only", async (t) => {
  const calls: FetchCall[] = [];

  const fetchImpl: typeof fetch = async (input, init = {}) => {
    const url = typeof input === "string" ? input : (input as URL).toString();
    const method = (init.method ?? "GET").toUpperCase();
    calls.push({ url, init: { ...init, method } });

    if (
      url ===
        "https://api.github.com/repos/octo/demo/contents/src/app.txt?ref=main" &&
      method === "GET"
    ) {
      return new Response(
        JSON.stringify({
          content: Buffer.from("hello\n").toString("base64"),
          encoding: "base64",
        }),
      );
    }

    if (
      url === "https://api.github.com/repos/octo/demo/git/ref/heads/main" &&
      method === "GET"
    ) {
      return new Response(JSON.stringify({ object: { sha: "abc123" } }));
    }

    if (url === "https://api.github.com/graphql" && method === "POST") {
      const payload = (await parseRequest(init)) as any;
      const fileChanges = payload?.variables?.input?.fileChanges;
      t.deepEqual(fileChanges, {
        additions: [],
        deletions: [{ path: "src/app.txt" }],
      });
      return new Response(
        JSON.stringify({
          data: {
            createCommitOnBranch: {
              commit: {
                oid: "fed321",
                url: "https://github.com/octo/demo/commit/fed321",
              },
            },
          },
        }),
      );
    }

    throw new Error(`Unexpected request: ${method} ${url}`);
  };

  const ctx: any = {
    env: {
      GITHUB_TOKEN: "token",
    },
    fetch: fetchImpl,
  };

  const tool = githubApplyPatchTool(ctx);
  const diff = `diff --git a/src/app.txt b/src/app.txt
deleted file mode 100644
index e965047..0000000
--- a/src/app.txt
+++ /dev/null
@@ -1 +0,0 @@
-hello
`;

  const result: any = await tool.invoke({
    owner: "octo",
    repo: "demo",
    branch: "main",
    message: "refactor: remove unused app file",
    diff,
  });

  t.true(result.ok);
  t.is(result.commitOid, "fed321");
  t.is(result.additions, 0);
  t.is(result.deletions, 1);
  t.true(calls.some((call) => call.url === "https://api.github.com/graphql"));
});

test("github.apply_patch rejects binary patches", async (t) => {
  const calls: FetchCall[] = [];

  const fetchImpl: typeof fetch = async (input, init = {}) => {
    const url = typeof input === "string" ? input : (input as URL).toString();
    const method = (init.method ?? "GET").toUpperCase();
    calls.push({ url, init: { ...init, method } });
    throw new Error(`Unexpected request: ${method} ${url}`);
  };

  const ctx: any = {
    env: {
      GITHUB_TOKEN: "token",
    },
    fetch: fetchImpl,
  };

  const tool = githubApplyPatchTool(ctx);
  const diff = `diff --git a/bin/app.bin b/bin/app.bin
new file mode 100644
index 0000000..1234567
Binary files /dev/null and b/bin/app.bin differ
`;

  const error = await t.throwsAsync(async () =>
    tool.invoke({
      owner: "octo",
      repo: "demo",
      branch: "main",
      message: "feat: add binary", // message irrelevant
      diff,
    }),
  );

  t.truthy(error);
  t.is(
    error?.message,
    "Binary patches are not supported by github.apply_patch",
  );
  t.is(calls.length, 0);
});

test("github.apply_patch rejects rename diffs", async (t) => {
  const calls: FetchCall[] = [];

  const fetchImpl: typeof fetch = async (input, init = {}) => {
    const url = typeof input === "string" ? input : (input as URL).toString();
    const method = (init.method ?? "GET").toUpperCase();
    calls.push({ url, init: { ...init, method } });
    throw new Error(`Unexpected request: ${method} ${url}`);
  };

  const ctx: any = {
    env: {
      GITHUB_TOKEN: "token",
    },
    fetch: fetchImpl,
  };

  const tool = githubApplyPatchTool(ctx);
  const diff = `diff --git a/src/old.txt b/src/new.txt
similarity index 100%
rename from src/old.txt
rename to src/new.txt
--- a/src/old.txt
+++ b/src/new.txt
`;

  const error = await t.throwsAsync(async () =>
    tool.invoke({
      owner: "octo",
      repo: "demo",
      branch: "main",
      message: "chore: rename file",
      diff,
    }),
  );

  t.truthy(error);
  t.is(error?.message, "Renames are not supported by github.apply_patch");
  t.is(calls.length, 0);
});

test("github.apply_patch rejects unsafe paths", async (t) => {
  const calls: FetchCall[] = [];

  const fetchImpl: typeof fetch = async (input, init = {}) => {
    const url = typeof input === "string" ? input : (input as URL).toString();
    const method = (init.method ?? "GET").toUpperCase();
    calls.push({ url, init: { ...init, method } });
    throw new Error(`Unexpected request: ${method} ${url}`);
  };

  const ctx: any = {
    env: {
      GITHUB_TOKEN: "token",
    },
    fetch: fetchImpl,
  };

  const tool = githubApplyPatchTool(ctx);
  const diff = `diff --git a/../secrets.txt b/../secrets.txt
new file mode 100644
index 0000000..e69de29
--- /dev/null
+++ b/../secrets.txt
@@ -0,0 +1 @@
+classified
`;

  const error = await t.throwsAsync(async () =>
    tool.invoke({
      owner: "octo",
      repo: "demo",
      branch: "main",
      message: "docs: add secret",
      diff,
    }),
  );

  t.truthy(error);
  t.is(error?.message, "Unsafe relative path in diff: ../secrets.txt");
  t.is(calls.length, 0);
});

test("github.apply_patch surfaces git apply conflicts", async (t) => {
  const calls: FetchCall[] = [];

  const fetchImpl: typeof fetch = async (input, init = {}) => {
    const url = typeof input === "string" ? input : (input as URL).toString();
    const method = (init.method ?? "GET").toUpperCase();
    calls.push({ url, init: { ...init, method } });

    if (
      url ===
        "https://api.github.com/repos/octo/demo/contents/src/app.txt?ref=main" &&
      method === "GET"
    ) {
      return new Response(
        JSON.stringify({
          content: Buffer.from("hello\n").toString("base64"),
          encoding: "base64",
        }),
      );
    }

    if (url === "https://api.github.com/graphql") {
      t.fail("git apply conflict should not trigger GraphQL commit");
    }

    throw new Error(`Unexpected request: ${method} ${url}`);
  };

  const ctx: any = {
    env: {
      GITHUB_TOKEN: "token",
    },
    fetch: fetchImpl,
  };

  const tool = githubApplyPatchTool(ctx);
  const diff = `diff --git a/src/app.txt b/src/app.txt
index e965047..8ddddef 100644
--- a/src/app.txt
+++ b/src/app.txt
@@ -1 +1 @@
-bye
+goodbye
`;

  const error = await t.throwsAsync(async () =>
    tool.invoke({
      owner: "octo",
      repo: "demo",
      branch: "main",
      message: "fix: update greeting",
      diff,
    }),
  );

  t.truthy(error);
  t.true(error instanceof Error);
  t.true(error.message.startsWith("git apply exited with code"));
  t.false(calls.some((call) => call.url === "https://api.github.com/graphql"));
});
