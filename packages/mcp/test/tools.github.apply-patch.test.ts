import test from "ava";

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
