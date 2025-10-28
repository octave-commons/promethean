import type { ReadonlyDeep } from 'type-fest';
export type JsonObject = ReadonlyDeep<Record<string, unknown>>;
export type RepoCoordinates = {
    readonly owner: string;
    readonly name: string;
};
export type PullRequestCoordinates = {
    readonly repo: RepoCoordinates;
    readonly number: number;
};
export type MergeableState = 'CONFLICTING' | 'MERGEABLE' | 'UNKNOWN' | 'UNMERGEABLE' | 'DRAFT' | 'BEHIND' | 'BLOCKED';
export type MergeStateStatus = 'BEHIND' | 'BLOCKED' | 'CLEAN' | 'DIRTY' | 'DRAFT' | 'HAS_HOOKS' | 'UNKNOWN';
export type PullRequestStatus = {
    readonly id: string;
    readonly number: number;
    readonly url: string;
    readonly headRefName: string;
    readonly headRefOid: string;
    readonly baseRefName: string;
    readonly mergeable: MergeableState;
    readonly mergeStateStatus: MergeStateStatus;
};
export type PullRequestFetcher = (coordinates: Readonly<PullRequestCoordinates>) => Promise<PullRequestStatus>;
export type Delay = (milliseconds: number) => Promise<void>;
export type PullRequestPollOptions = {
    readonly waitForKnown?: boolean;
    readonly attempts?: number;
    readonly delayMs?: number;
    readonly delay?: Delay;
};
type JsonRequestInit = Readonly<{
    method?: string;
    body?: string;
    headers?: Readonly<Record<string, string>>;
}>;
export declare const defaultDelay: Delay;
export declare class GitHubRequestError extends Error {
    readonly status: number;
    constructor(message: string, status: number);
}
export declare const createRestJsonClient: (token: string, fetchImpl: typeof fetch) => <T>(url: string, init?: JsonRequestInit) => Promise<T>;
export declare const createGraphQLClient: (token: string, fetchImpl: typeof fetch) => <T>(query: string, variables?: JsonObject) => Promise<T>;
export declare const createPullRequestFetcher: (gqlClient: <T>(query: string, variables?: JsonObject) => Promise<T>) => PullRequestFetcher;
export declare const pollPullRequestStatus: (fetcher: PullRequestFetcher, coordinates: PullRequestCoordinates, options?: Readonly<PullRequestPollOptions>) => Promise<PullRequestStatus>;
export declare const updatePullRequestBranch: (restClient: <T>(url: string, init?: JsonRequestInit) => Promise<T>) => (coordinates: Readonly<PullRequestCoordinates>, expectedHeadOid?: string) => Promise<JsonObject>;
export type AutoMergeMethod = 'SQUASH' | 'MERGE' | 'REBASE';
export declare const enablePullRequestAutoMerge: (gqlClient: <T>(query: string, variables?: JsonObject) => Promise<T>) => (pullRequestId: string, expectedHeadOid: string, method: AutoMergeMethod) => Promise<void>;
export declare const enqueuePullRequest: (gqlClient: <T>(query: string, variables?: JsonObject) => Promise<T>) => (pullRequestId: string) => Promise<JsonObject>;
export type MergeTriple = {
    readonly path: string;
    readonly base: string;
    readonly ours: string;
    readonly theirs: string;
};
export type Resolution = {
    readonly path: string;
    readonly content: string;
};
export type FetchMergeTriples = (coordinates: Readonly<PullRequestCoordinates>) => Promise<readonly MergeTriple[]>;
export type ApplyResolution = (coordinates: Readonly<PullRequestCoordinates>, resolutions: readonly Resolution[], expectedHeadOid: string) => Promise<string>;
export {};
//# sourceMappingURL=github.d.ts.map