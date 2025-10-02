import test, { type ExecutionContext } from "ava";

import type { ToolContext } from "../core/types.js";
import { githubContentsWrite } from "../tools/github/contents.js";

type HeaderEntry = readonly [string, string];

type HeaderSource =
  | Headers
  | Readonly<Record<string, string>>
  | ReadonlyArray<readonly [string, string]>;

type GithubWriteResult = Readonly<{
  readonly status: number;
  readonly data: { readonly commit: { readonly sha: string } };
}>;

const entriesFromHeaders = (headers: HeaderSource): readonly HeaderEntry[] => {
  if (headers instanceof Headers) {
    return Array.from(headers.entries()).map(
      ([key, value]) => [key, value] as const,
    );
  }
  if (Array.isArray(headers)) {
    return headers.map(([key, value]) => [key, value] as const);
  }
  return Object.entries(headers).map(([key, value]) => [key, value] as const);
};

const toHeadersRecord = (
  headers: HeaderSource | undefined,
): Readonly<Record<string, string>> => {
  if (!headers) {
    return {};
  }
  return entriesFromHeaders(headers).reduce<Readonly<Record<string, string>>>(
    (acc, [key, value]) => ({ ...acc, [key]: value }),
    {},
  );
};

const toBodyString = (body: unknown): string => {
  if (body === undefined || body === null) {
    return "";
  }
  return typeof body === "string" ? body : String(body);
};

const toUrlString = (input: unknown): string => {
  if (typeof input === "string") {
    return input;
  }
  if (input instanceof URL) {
    return input.toString();
  }
  if (input instanceof Request) {
    return input.url;
  }
  return String(input);
};

const parseJson = <T>(text: string): T => JSON.parse(text) as T;

const assertUtf8Request = (
  t: ExecutionContext,
  input: unknown,
  init: RequestInit | undefined,
): void => {
  t.is(
    toUrlString(input),
    "https://api.github.test/repos/promethean/mcp/contents/docs/read%20me.md",
  );
  const headers = toHeadersRecord(init?.headers as HeaderSource | undefined);
  t.deepEqual(headers, {
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
    "X-GitHub-Api-Version": "2022-11-28",
    Authorization: "Bearer test-token",
  });
  const payload = parseJson<{
    readonly message: string;
    readonly content: string;
    readonly encoding: string;
    readonly branch?: string;
  }>(toBodyString(init?.body));
  t.deepEqual(payload, {
    message: "docs: add readme",
    content: Buffer.from("Hello, world!", "utf8").toString("base64"),
    encoding: "base64",
    branch: "main",
  });
};

const createJsonResponse = (body: unknown, status: number): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

test("github.contents.write encodes utf-8 content", async (t) => {
  t.plan(5);
  const ctx: ToolContext = {
    env: {
      GITHUB_BASE_URL: "https://api.github.test",
      GITHUB_API_VERSION: "2022-11-28",
      GITHUB_TOKEN: "test-token",
    },
    fetch: (async (input, init) => {
      assertUtf8Request(t, input, init);
      return createJsonResponse(
        { commit: { sha: "abc123" }, content: { path: "docs/readme.md" } },
        201,
      );
    }) as typeof fetch,
    now: () => new Date(),
  };

  const tool = githubContentsWrite(ctx);
  const result = (await tool.invoke({
    owner: "promethean",
    repo: "mcp",
    path: "docs/read me.md",
    message: "docs: add readme",
    content: "Hello, world!",
    branch: "main",
  })) as GithubWriteResult;

  t.is(result.status, 201);
  t.deepEqual(result.data.commit, { sha: "abc123" });
});

test("github.contents.write accepts pre-encoded base64 content", async (t) => {
  t.plan(1);
  const encoded = Buffer.from("binary", "utf8").toString("base64");
  const ctx: ToolContext = {
    env: {},
    fetch: (async (_input, init) => {
      const payload = parseJson<{ readonly content: string }>(
        toBodyString(init?.body),
      );
      t.is(payload.content, encoded);
      return createJsonResponse({ ok: true }, 200);
    }) as typeof fetch,
    now: () => new Date(),
  };

  const tool = githubContentsWrite(ctx);
  await tool.invoke({
    owner: "promethean",
    repo: "mcp",
    path: "binary.bin",
    message: "chore: upload",
    content: encoded,
    encoding: "base64",
  });
});

test("github.contents.write throws on invalid base64 input", async (t) => {
  const ctx: ToolContext = {
    env: {},
    fetch: (async () => {
      throw new Error("fetch should not be called");
    }) as typeof fetch,
    now: () => new Date(),
  };

  const tool = githubContentsWrite(ctx);
  await t.throwsAsync(
    () =>
      tool.invoke({
        owner: "promethean",
        repo: "mcp",
        path: "bad.bin",
        message: "chore: upload",
        content: "not-base64@@",
        encoding: "base64",
      }),
    { message: /invalid base64/i },
  );
});
