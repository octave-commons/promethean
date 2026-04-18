import test from "ava";

import { githubRequestTool } from "../tools/github/request.js";

test("github_request decodes base64 encoded content payloads", async (t) => {
  const rawContent = Buffer.from("console.log('hi');", "utf8")
    .toString("base64")
    .replace(/(.{8})/g, "$1\n");
  const response = new Response(
    JSON.stringify({
      name: "index.ts",
      path: "src/index.ts",
      encoding: "base64",
      content: rawContent,
    }),
    {
      status: 200,
      headers: { "content-type": "application/json" },
    },
  );

  const tool = githubRequestTool({
    env: {
      GITHUB_BASE_URL: "https://api.github.test",
      GITHUB_API_VERSION: "2022-11-28",
      GITHUB_TOKEN: "secret",
    },
    fetch: (async () => response.clone()) as typeof fetch,
    now: () => new Date(),
  });

  const result = (await tool.invoke({
    method: "GET",
    path: "/repos/promethean/mcp/contents/src/index.ts",
  })) as {
    status: number;
    data: {
      content: string;
      rawContent: string;
      encoding: string;
      rawEncoding: string;
    };
  };

  t.is(result.status, 200);
  t.deepEqual(result.data, {
    name: "index.ts",
    path: "src/index.ts",
    content: "console.log('hi');",
    rawContent,
    encoding: "utf-8",
    rawEncoding: "base64",
  });
});
