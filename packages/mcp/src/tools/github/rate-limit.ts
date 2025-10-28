import type { ToolFactory, ToolSpec } from "../../core/types.js";

export const githubRateLimitTool: ToolFactory = (ctx) => {
  const base = ctx.env.GITHUB_BASE_URL ?? "https://api.github.com";
  const token = ctx.env.GITHUB_TOKEN;

  return {
    spec: {
      name: "github_rate_limit",
      description: "Get GitHub REST /rate_limit snapshot.",
      stability: "experimental",
      since: "0.1.0",
    } satisfies ToolSpec,
    invoke: async () => {
      const res = await ctx.fetch(new URL("/rate_limit", base), {
        headers: {
          Accept: "application/vnd.github+json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      return await res.json(); // typed as unknown in Tool; MCP wrapper returns as JSON content
    },
  };
};
