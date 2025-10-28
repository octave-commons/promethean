import { z } from "zod";
export const githubGraphqlTool = (ctx) => {
    const endpoint = ctx.env.GITHUB_GRAPHQL_URL ?? "https://api.github.com/graphql";
    const token = ctx.env.GITHUB_TOKEN;
    const shape = {
        query: z.string(),
        variables: z.record(z.any()).optional(),
    };
    const Schema = z.object(shape);
    return {
        spec: {
            name: "github_graphql",
            description: "Post a GraphQL query to GitHub.",
            inputSchema: Schema.shape, // <— shape, not z.object(...)
            stability: "experimental",
            since: "0.1.0",
        },
        invoke: async (raw) => {
            const args = Schema.parse(raw);
            const res = await ctx.fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    query: args.query,
                    variables: args.variables ?? {},
                }),
            });
            return await res.json();
        },
    };
};
//# sourceMappingURL=graphql.js.map