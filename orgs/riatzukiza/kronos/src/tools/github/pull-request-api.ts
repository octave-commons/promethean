import { z } from "zod";
import type { ReadonlyDeep } from "type-fest";

import type { ToolContext } from "../../core/types.js";

export type PullRequestIdentity = Readonly<{
  readonly owner: string;
  readonly repo: string;
  readonly number: number;
}>;

export const pullRequestIdentityShape = {
  owner: z.string().describe("Repository owner."),
  repo: z.string().describe("Repository name."),
  number: z.number().int().describe("Pull request number."),
} as const;

export const PullRequestIdentitySchema = z.object(pullRequestIdentityShape);

export type PullRequestSummary = Readonly<{
  readonly id: string;
  readonly number: number;
  readonly state: string;
  readonly headSha: string | null;
  readonly baseSha: string | null;
  readonly author: string | null;
  readonly isDraft: boolean;
}>;

export type PullRequestFile = Readonly<{
  readonly path: string;
  readonly status: string;
  readonly additions: number;
  readonly deletions: number;
  readonly patch: string | null;
}>;

export const DEFAULT_REST_BASE = "https://api.github.com" as const;
export const DEFAULT_GRAPHQL_BASE = "https://api.github.com/graphql" as const;

const RawPullRequestSchema = z.object({
  node_id: z.string(),
  number: z.number().int(),
  state: z.string(),
  draft: z.boolean().optional(),
  head: z.object({ sha: z.string() }).nullable(),
  base: z.object({ sha: z.string() }).nullable(),
  user: z.object({ login: z.string() }).nullable(),
});

const RawPullRequestFilesSchema = z.array(
  z.object({
    filename: z.string(),
    status: z.string(),
    additions: z.number().int(),
    deletions: z.number().int(),
    patch: z.string().optional(),
  }),
);

type RawPullRequest = z.infer<typeof RawPullRequestSchema>;
type RawPullRequestFiles = z.infer<typeof RawPullRequestFilesSchema>;

type GraphqlRequest = Readonly<{
  readonly query: string;
  readonly variables?: Record<string, unknown>;
}>;

export const buildRestHeaders = (
  token: string | undefined,
): Readonly<Record<string, string>> => ({
  Accept: "application/vnd.github+json",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

export const buildGraphqlHeaders = (
  token: string | undefined,
): Readonly<Record<string, string>> => ({
  "Content-Type": "application/json",
  Accept: "application/json",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

const mapPullRequestSummary = (
  raw: ReadonlyDeep<RawPullRequest>,
): PullRequestSummary => ({
  id: raw.node_id,
  number: raw.number,
  state: raw.state,
  headSha: raw.head?.sha ?? null,
  baseSha: raw.base?.sha ?? null,
  author: raw.user?.login ?? null,
  isDraft: raw.draft === true,
});

const mapPullRequestFiles = (
  files: ReadonlyDeep<RawPullRequestFiles>,
): readonly PullRequestFile[] =>
  files.map<PullRequestFile>((file) => ({
    path: file.filename,
    status: file.status,
    additions: file.additions,
    deletions: file.deletions,
    patch: file.patch ?? null,
  }));

type FetchPullRequestSummaryOptions = ReadonlyDeep<{
  readonly ctx: ToolContext;
  readonly identity: PullRequestIdentity;
}>;

export const fetchPullRequestSummary = async (
  options: FetchPullRequestSummaryOptions,
): Promise<PullRequestSummary> => {
  const { ctx, identity } = options;
  const base = ctx.env.GITHUB_BASE_URL ?? DEFAULT_REST_BASE;
  const token = ctx.env.GITHUB_TOKEN;
  const url = new URL(
    `/repos/${identity.owner}/${identity.repo}/pulls/${identity.number}`,
    base,
  );
  const response = await ctx.fetch(url, {
    method: "GET",
    headers: buildRestHeaders(token),
  } as RequestInit);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Failed to load pull request ${identity.owner}/${identity.repo}#${identity.number}: ${response.status} ${text}`,
    );
  }
  const json: unknown = await response.json();
  const parsed = RawPullRequestSchema.parse(json);
  return mapPullRequestSummary(parsed);
};

type FetchPullRequestFilesOptions = ReadonlyDeep<{
  readonly ctx: ToolContext;
  readonly identity: PullRequestIdentity;
}>;

export const fetchPullRequestFiles = async (
  options: FetchPullRequestFilesOptions,
): Promise<readonly PullRequestFile[]> => {
  const { ctx, identity } = options;
  const base = ctx.env.GITHUB_BASE_URL ?? DEFAULT_REST_BASE;
  const token = ctx.env.GITHUB_TOKEN;
  const url = new URL(
    `/repos/${identity.owner}/${identity.repo}/pulls/${identity.number}/files`,
    base,
  );
  url.searchParams.set("per_page", "300");
  const response = await ctx.fetch(url, {
    method: "GET",
    headers: buildRestHeaders(token),
  } as RequestInit);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Failed to load PR files for ${identity.owner}/${identity.repo}#${identity.number}: ${response.status} ${text}`,
    );
  }
  const json: unknown = await response.json();
  const parsed = RawPullRequestFilesSchema.parse(json);
  return mapPullRequestFiles(parsed);
};

type CallGithubGraphqlOptions = ReadonlyDeep<{
  readonly ctx: ToolContext;
  readonly request: GraphqlRequest;
}>;

export const callGithubGraphql = async (
  options: CallGithubGraphqlOptions,
): Promise<unknown> => {
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
  } as RequestInit);
  const payload = (await response.json()) as {
    data?: unknown;
    errors?: ReadonlyArray<{ readonly message?: string }>;
  };
  if (!response.ok) {
    throw new Error(
      `GitHub GraphQL request failed with ${response.status}: ${JSON.stringify(
        payload,
      )}`,
    );
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
