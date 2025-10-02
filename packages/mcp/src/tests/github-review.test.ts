import test from "ava";

import { githubReviewOpenPullRequest } from "../tools/github/code-review.js";
import type { ToolContext } from "../core/types.js";

test("github.review.openPullRequest issues repository lookup and create mutation", async (t) => {
  const requests: Array<{ query: string; variables: Record<string, unknown> }> =
    [];
  const responses = [
    {
      data: {
        repository: {
          id: "repo-id",
        },
      },
    },
    {
      data: {
        createPullRequest: {
          pullRequest: {
            id: "pr-id",
            number: 42,
            url: "https://example.test/pr/42",
          },
        },
      },
    },
  ];

  const ctx: ToolContext = {
    env: {
      GITHUB_TOKEN: "test-token",
    },
    fetch: async (_input, init) => {
      const payload = JSON.parse(String(init?.body ?? "{}"));
      requests.push({ query: payload.query, variables: payload.variables });
      const next = responses.shift();
      if (!next) {
        throw new Error("unexpected request");
      }
      return {
        ok: true,
        status: 200,
        json: async () => next,
      } as unknown as Response;
    },
    now: () => new Date(),
  };

  const tool = githubReviewOpenPullRequest(ctx);
  const result = (await tool.invoke({
    owner: "octocat",
    repo: "hello-world",
    baseRefName: "main",
    headRefName: "feature",
    title: "Add feature",
    body: "Details",
  })) as { id: string; number: number; url: string };

  t.is(result.id, "pr-id");
  t.is(result.number, 42);
  t.is(result.url, "https://example.test/pr/42");
  t.is(requests.length, 2);
  t.true(requests[0]?.query.includes("repository"));
  t.deepEqual(requests[1]?.variables, {
    input: {
      repositoryId: "repo-id",
      baseRefName: "main",
      headRefName: "feature",
      title: "Add feature",
      body: "Details",
    },
  });
});
