import test from "ava";

import type { ToolContext } from "../core/types.js";
import { githubPrResolvePosition } from "../tools/github/pull-request-data.js";
import {
  githubPrReviewCommentInline,
  githubPrReviewSubmit,
} from "../tools/github/pull-request-review.js";
import {
  parseUnifiedPatch,
  resolveNewLinePosition,
} from "../tools/github/position-resolver.js";

const jsonResponse = <T>(payload: T): Response =>
  ({
    ok: true,
    status: 200,
    json: async () => payload,
  }) as unknown as Response;

const createCommentContext = (
  assertSuggestion: (payload: string) => void,
  patch: string,
): ToolContext => ({
  env: {
    GITHUB_TOKEN: "token",
  },
  now: () => new Date(),
  fetch: async (input, init) => {
    const url = typeof input === "string" ? input : String(input);
    if (url.includes("/pulls/42/files")) {
      return jsonResponse([
        {
          filename: "src/example.ts",
          status: "modified",
          additions: 1,
          deletions: 0,
          patch,
        },
      ]);
    }
    if (url.endsWith("/pulls/42")) {
      const pr = {
        node_id: "PR_node",
        number: 42,
        state: "OPEN",
        draft: false,
        head: { sha: "headsha" },
        base: { sha: "basesha" },
        user: { login: "octocat" },
      };
      return jsonResponse(pr);
    }
    if (url.includes("/graphql")) {
      const rawBody = String(init?.body ?? "");
      assertSuggestion(rawBody);
      return jsonResponse({
        data: {
          addPullRequestReviewThread: {
            thread: { id: "thread-1" },
            pullRequestReview: { id: "review-1" },
          },
        },
      });
    }
    throw new Error(`Unexpected URL ${url}`);
  },
});

test("parseUnifiedPatch captures diff metadata and line positions", (t) => {
  const patch = [
    "@@ -1,3 +1,4 @@",
    " line one",
    "-line two",
    "+line two updated",
    "+line two extra",
    " line three",
  ].join("\n");
  const hunks = parseUnifiedPatch(patch);
  t.is(hunks.length, 1);
  const hunk = hunks[0];
  t.truthy(hunk);
  if (!hunk) {
    t.fail("Expected a parsed hunk");
    return;
  }
  t.deepEqual(hunk.oldStart, 1);
  t.deepEqual(hunk.newStart, 1);
  t.is(hunk.lines.length, 5);
  const addition = hunk.lines.find((line) => line.type === "add");
  t.truthy(addition);
  t.is(addition?.newLine, 2);
  t.is(addition?.position, 3);
});

test("resolveNewLinePosition maps added line to RIGHT side with diff position", (t) => {
  const patch = [
    "@@ -10,3 +10,4 @@",
    " context",
    "-removed",
    "+added",
    " context2",
  ].join("\n");
  const hunks = parseUnifiedPatch(patch);
  const result = resolveNewLinePosition({ hunks, targetLine: 11 });
  if ("reason" in result) {
    t.fail(`Expected success but received ${result.reason}`);
    return;
  }
  t.is(result.line, 11);
  t.is(result.side, "RIGHT");
  t.true(result.position > 0);
});

test("github.pr.resolvePosition returns diff metadata for a valid line", async (t) => {
  const patch = [
    "@@ -1,2 +1,3 @@",
    " line one",
    "+line two",
    " line three",
  ].join("\n");
  const ctx: ToolContext = {
    env: {},
    now: () => new Date(),
    fetch: async (input) => {
      const url = typeof input === "string" ? input : String(input);
      if (!url.includes("/pulls/42/files")) {
        throw new Error(`Unexpected URL: ${url}`);
      }
      const body = [
        {
          filename: "src/example.ts",
          status: "modified",
          additions: 1,
          deletions: 0,
          patch,
        },
      ];
      return {
        ok: true,
        status: 200,
        json: async () => body,
      } as unknown as Response;
    },
  };

  const tool = githubPrResolvePosition(ctx);
  const result = (await tool.invoke({
    owner: "octocat",
    repo: "hello",
    number: 42,
    path: "src/example.ts",
    line: 2,
  })) as { ok: boolean; graphql?: { line: number; side: string } };

  t.true(result.ok);
  t.is(result.graphql?.line, 2);
  t.is(result.graphql?.side, "RIGHT");
});

test("github.pr.resolvePosition surfaces structured error when line missing", async (t) => {
  const ctx: ToolContext = {
    env: {},
    now: () => new Date(),
    fetch: async () =>
      ({
        ok: true,
        status: 200,
        json: async () => [
          {
            filename: "src/example.ts",
            status: "modified",
            additions: 0,
            deletions: 0,
            patch: undefined,
          },
        ],
      }) as unknown as Response,
  };

  const tool = githubPrResolvePosition(ctx);
  const result = (await tool.invoke({
    owner: "octocat",
    repo: "hello",
    number: 42,
    path: "src/example.ts",
    line: 5,
  })) as { ok: boolean; reason?: string };

  t.false(result.ok);
  t.is(result.reason, "PATCH_NOT_FOUND_OR_BINARY");
});

test("github.pr.review.commentInline posts suggestion with resolved coordinates", async (t) => {
  const patch = ["@@ -1,1 +1,2 @@", " line one", "+line two"].join("\n");
  const tool = githubPrReviewCommentInline(
    createCommentContext((body) => t.regex(body, /```suggestion/), patch),
  );
  const result = (await tool.invoke({
    owner: "octocat",
    repo: "hello",
    number: 42,
    path: "src/example.ts",
    line: 2,
    body: "Please adjust this.",
    suggestion: { after: ["line two"] },
  })) as { ok: boolean; threadId: string | null; reviewId: string | null };

  t.true(result.ok);
  t.is(result.threadId, "thread-1");
  t.is(result.reviewId, "review-1");
});

test("github.pr.review.submit returns review id and state", async (t) => {
  const ctx: ToolContext = {
    env: { GITHUB_TOKEN: "token" },
    now: () => new Date(),
    fetch: async (input, init) => {
      const url = typeof input === "string" ? input : String(input);
      if (!url.includes("/graphql")) {
        throw new Error(`Unexpected URL ${url}`);
      }
      const parsed = JSON.parse(String(init?.body ?? "{}")) as unknown;
      if (!parsed || typeof parsed !== "object") {
        throw new Error("Unexpected GraphQL payload");
      }
      const variables = (parsed as { variables?: unknown }).variables;
      if (!variables || typeof variables !== "object") {
        throw new Error("Unexpected GraphQL payload");
      }
      const inputData = (variables as { input?: unknown }).input;
      if (!inputData || typeof inputData !== "object") {
        throw new Error("Unexpected GraphQL payload");
      }
      const eventValue = (inputData as { event?: unknown }).event;
      if (typeof eventValue !== "string") {
        throw new Error("Unexpected GraphQL payload");
      }
      t.is(eventValue, "APPROVE");
      return jsonResponse({
        data: {
          submitPullRequestReview: {
            pullRequestReview: {
              id: "review-123",
              state: "APPROVED",
            },
          },
        },
      });
    },
  };

  const tool = githubPrReviewSubmit(ctx);
  const result = (await tool.invoke({
    reviewId: "review-123",
    event: "APPROVE",
  })) as { reviewId: string; state: string };

  t.is(result.reviewId, "review-123");
  t.is(result.state, "APPROVED");
});
