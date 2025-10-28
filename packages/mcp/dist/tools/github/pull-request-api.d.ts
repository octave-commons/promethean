import { z } from "zod";
import type { ReadonlyDeep } from "type-fest";
import type { ToolContext } from "../../core/types.js";
export type PullRequestIdentity = Readonly<{
    readonly owner: string;
    readonly repo: string;
    readonly number: number;
}>;
export declare const pullRequestIdentityShape: {
    readonly owner: z.ZodString;
    readonly repo: z.ZodString;
    readonly number: z.ZodNumber;
};
export declare const PullRequestIdentitySchema: z.ZodObject<{
    readonly owner: z.ZodString;
    readonly repo: z.ZodString;
    readonly number: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    number: number;
    owner: string;
    repo: string;
}, {
    number: number;
    owner: string;
    repo: string;
}>;
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
export declare const DEFAULT_REST_BASE: "https://api.github.com";
export declare const DEFAULT_GRAPHQL_BASE: "https://api.github.com/graphql";
type GraphqlRequest = Readonly<{
    readonly query: string;
    readonly variables?: Record<string, unknown>;
}>;
export declare const buildRestHeaders: (token: string | undefined) => Readonly<Record<string, string>>;
export declare const buildGraphqlHeaders: (token: string | undefined) => Readonly<Record<string, string>>;
type FetchPullRequestSummaryOptions = ReadonlyDeep<{
    readonly ctx: ToolContext;
    readonly identity: PullRequestIdentity;
}>;
export declare const fetchPullRequestSummary: (options: FetchPullRequestSummaryOptions) => Promise<PullRequestSummary>;
type FetchPullRequestFilesOptions = ReadonlyDeep<{
    readonly ctx: ToolContext;
    readonly identity: PullRequestIdentity;
}>;
export declare const fetchPullRequestFiles: (options: FetchPullRequestFilesOptions) => Promise<readonly PullRequestFile[]>;
type CallGithubGraphqlOptions = ReadonlyDeep<{
    readonly ctx: ToolContext;
    readonly request: GraphqlRequest;
}>;
export declare const callGithubGraphql: (options: CallGithubGraphqlOptions) => Promise<unknown>;
export {};
//# sourceMappingURL=pull-request-api.d.ts.map