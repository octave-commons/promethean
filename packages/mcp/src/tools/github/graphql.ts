import type { ToolFactory } from "../../core/types.js";

export const githubGraphqlTool: ToolFactory = (ctx) => {
  const endpoint = ctx.env.GITHUB_GRAPHQL_URL ?? "https://api.github.com/graphql";
  const token = ctx.env.GITHUB_TOKEN;

  const spec = {
    name: "github_graphql",
    description: "Post a GraphQL query to GitHub.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string" },
        variables: { type: "object", additionalProperties: true }
      },
      required: ["query"]
    }
  } as const;

  const invoke = async (args: any) => {
    const res = await ctx.fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ query: args.query, variables: args.variables ?? {} })
    });
    return await res.json();
  };

  return { spec, invoke };
};
