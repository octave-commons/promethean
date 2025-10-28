import { z } from "zod";
export const pullRequestIdentityShape = {
    owner: z.string().describe("Repository owner."),
    repo: z.string().describe("Repository name."),
    number: z.number().int().describe("Pull request number."),
};
export const PullRequestIdentitySchema = z.object(pullRequestIdentityShape);
export const DEFAULT_REST_BASE = "https://api.github.com";
export const DEFAULT_GRAPHQL_BASE = "https://api.github.com/graphql";
const RawPullRequestSchema = z.object({
    node_id: z.string(),
    number: z.number().int(),
    state: z.string(),
    draft: z.boolean().optional(),
    head: z.object({ sha: z.string() }).nullable(),
    base: z.object({ sha: z.string() }).nullable(),
    user: z.object({ login: z.string() }).nullable(),
});
const RawPullRequestFilesSchema = z.array(z.object({
    filename: z.string(),
    status: z.string(),
    additions: z.number().int(),
    deletions: z.number().int(),
    patch: z.string().optional(),
}));
export const buildRestHeaders = (token) => ({
    Accept: "application/vnd.github+json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
});
export const buildGraphqlHeaders = (token) => ({
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
});
const mapPullRequestSummary = (raw) => ({
    id: raw.node_id,
    number: raw.number,
    state: raw.state,
    headSha: raw.head?.sha ?? null,
    baseSha: raw.base?.sha ?? null,
    author: raw.user?.login ?? null,
    isDraft: raw.draft === true,
});
const mapPullRequestFiles = (files) => files.map((file) => ({
    path: file.filename,
    status: file.status,
    additions: file.additions,
    deletions: file.deletions,
    patch: file.patch ?? null,
}));
export const fetchPullRequestSummary = async (options) => {
    const { ctx, identity } = options;
    const base = ctx.env.GITHUB_BASE_URL ?? DEFAULT_REST_BASE;
    const token = ctx.env.GITHUB_TOKEN;
    const url = new URL(`/repos/${identity.owner}/${identity.repo}/pulls/${identity.number}`, base);
    const response = await ctx.fetch(url, {
        method: "GET",
        headers: buildRestHeaders(token),
    });
    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to load pull request ${identity.owner}/${identity.repo}#${identity.number}: ${response.status} ${text}`);
    }
    const json = await response.json();
    const parsed = RawPullRequestSchema.parse(json);
    return mapPullRequestSummary(parsed);
};
export const fetchPullRequestFiles = async (options) => {
    const { ctx, identity } = options;
    const base = ctx.env.GITHUB_BASE_URL ?? DEFAULT_REST_BASE;
    const token = ctx.env.GITHUB_TOKEN;
    const url = new URL(`/repos/${identity.owner}/${identity.repo}/pulls/${identity.number}/files`, base);
    url.searchParams.set("per_page", "300");
    const response = await ctx.fetch(url, {
        method: "GET",
        headers: buildRestHeaders(token),
    });
    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to load PR files for ${identity.owner}/${identity.repo}#${identity.number}: ${response.status} ${text}`);
    }
    const json = await response.json();
    const parsed = RawPullRequestFilesSchema.parse(json);
    return mapPullRequestFiles(parsed);
};
export const callGithubGraphql = async (options) => {
    const { ctx, request } = options;
    const token = ctx.env.GITHUB_TOKEN;
    if (!token) {
        throw new Error("GitHub GraphQL tools require GITHUB_TOKEN to be set.");
    }
    const endpoint = ctx.env.GITHUB_GRAPHQL_URL ?? DEFAULT_GRAPHQL_BASE;
    const response = await ctx.fetch(endpoint, {
        method: "POST",
        headers: buildGraphqlHeaders(token),
        body: JSON.stringify({
            query: request.query,
            variables: request.variables ?? {},
        }),
    });
    const payload = (await response.json());
    if (!response.ok) {
        throw new Error(`GitHub GraphQL request failed with ${response.status}: ${JSON.stringify(payload)}`);
    }
    if (payload.errors?.length) {
        const message = payload.errors
            .map((error) => error.message ?? "Unknown error")
            .join("; ");
        throw new Error(`GitHub GraphQL request returned errors: ${message}`);
    }
    if (!payload.data) {
        throw new Error("GitHub GraphQL response missing data field");
    }
    return payload.data;
};
//# sourceMappingURL=pull-request-api.js.map