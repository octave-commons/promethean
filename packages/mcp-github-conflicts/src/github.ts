import type { ReadonlyDeep } from "type-fest";

export type JsonObject = ReadonlyDeep<Record<string, unknown>>;

export type RepoCoordinates = {
  readonly owner: string;
  readonly name: string;
};

export type PullRequestCoordinates = {
  readonly repo: RepoCoordinates;
  readonly number: number;
};

export type MergeableState =
  | "CONFLICTING"
  | "MERGEABLE"
  | "UNKNOWN"
  | "UNMERGEABLE"
  | "DRAFT"
  | "BEHIND"
  | "BLOCKED";

export type MergeStateStatus =
  | "BEHIND"
  | "BLOCKED"
  | "CLEAN"
  | "DIRTY"
  | "DRAFT"
  | "HAS_HOOKS"
  | "UNKNOWN";

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

export type PullRequestFetcher = (
  coordinates: Readonly<PullRequestCoordinates>,
) => Promise<PullRequestStatus>;

export type Delay = (milliseconds: number) => Promise<void>;

export type PullRequestPollOptions = {
  readonly waitForKnown?: boolean;
  readonly attempts?: number;
  readonly delayMs?: number;
  readonly delay?: Delay;
};

const defaultHeaders = (token: string): Readonly<Record<string, string>> =>
  ({
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  }) as const;

const isJsonObject = (value: unknown): value is JsonObject =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const toPlainJson = <T extends JsonObject>(value: T): T =>
  JSON.parse(JSON.stringify(value)) as T;

const deepFreeze = <T>(value: T): ReadonlyDeep<T> => {
  if (Array.isArray(value)) {
    return value.map((item) => deepFreeze(item)) as unknown as ReadonlyDeep<T>;
  }

  if (isJsonObject(value)) {
    const frozenEntries = Object.entries(value).reduce<Record<string, unknown>>(
      (accumulator, [key, entry]) => ({
        ...accumulator,
        [key]: deepFreeze(entry),
      }),
      {},
    );

    return Object.freeze(frozenEntries) as ReadonlyDeep<T>;
  }

  return value as ReadonlyDeep<T>;
};

type JsonRequestInit = Readonly<{
  method?: string;
  body?: string;
  headers?: Readonly<Record<string, string>>;
}>;

export const defaultDelay: Delay = (milliseconds: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });

export class GitHubRequestError extends Error {
  public readonly status: number;

  public constructor(message: string, status: number) {
    super(message);
    this.name = "GitHubRequestError";
    this.status = status;
  }
}

export const createRestJsonClient =
  (token: string, fetchImpl: typeof fetch) =>
  async <T>(url: string, init: JsonRequestInit = {}): Promise<T> => {
    const response = await fetchImpl(url, {
      ...init,
      headers: {
        ...defaultHeaders(token),
        "Content-Type": "application/json",
        ...(init.headers ?? {}),
      },
    });

    const raw = await response.text();
    const data: JsonObject =
      raw.trim().length === 0
        ? deepFreeze({})
        : deepFreeze(toPlainJson(JSON.parse(raw) as Record<string, unknown>));
    const message =
      typeof data.message === "string" ? data.message : response.statusText;

    if (!response.ok) {
      throw new GitHubRequestError(message, response.status);
    }

    return toPlainJson(data) as T;
  };

export const createGraphQLClient =
  (token: string, fetchImpl: typeof fetch) =>
  async <T>(query: string, variables: JsonObject = {}): Promise<T> => {
    const response = await fetchImpl("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        ...defaultHeaders(token),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables }),
    });

    const rawPayload = await response.text();
    const payload: JsonObject = deepFreeze(
      toPlainJson(JSON.parse(rawPayload) as Record<string, unknown>),
    );
    const errors = Array.isArray(payload.errors)
      ? payload.errors.filter((candidate): candidate is JsonObject =>
          isJsonObject(candidate),
        )
      : [];
    const firstError = errors[0];
    const messageValue = firstError?.message;

    if (!response.ok) {
      throw new GitHubRequestError(
        typeof messageValue === "string" ? messageValue : response.statusText,
        response.status,
      );
    }

    if (errors.length > 0) {
      throw new Error(JSON.stringify(errors));
    }

    const data = payload.data as T | undefined;

    if (!data) {
      throw new Error("GitHub response missing data");
    }

    return toPlainJson(data);
  };

const pullRequestQuery = `
  query ($owner:String!, $name:String!, $number:Int!) {
    repository(owner:$owner, name:$name) {
      pullRequest(number:$number) {
        id
        number
        url
        headRefName
        headRefOid
        baseRefName
        mergeable
        mergeStateStatus
      }
    }
  }
`;

export const createPullRequestFetcher =
  (
    gqlClient: <T>(query: string, variables?: JsonObject) => Promise<T>,
  ): PullRequestFetcher =>
  async (coordinates) => {
    const data = await gqlClient<{
      readonly repository?: {
        readonly pullRequest?: PullRequestStatus;
      };
    }>(pullRequestQuery, {
      owner: coordinates.repo.owner,
      name: coordinates.repo.name,
      number: coordinates.number,
    });

    const pullRequest = data.repository?.pullRequest;

    if (!pullRequest) {
      throw new Error("Pull request not found");
    }

    return pullRequest;
  };

export const pollPullRequestStatus = async (
  fetcher: PullRequestFetcher,
  coordinates: PullRequestCoordinates,
  options: Readonly<PullRequestPollOptions> = {},
): Promise<PullRequestStatus> => {
  const configuration: Readonly<{
    readonly waitForKnown: boolean;
    readonly attempts: number;
    readonly delayMs: number;
    readonly delay: Delay;
  }> = {
    waitForKnown: options.waitForKnown ?? true,
    attempts: options.attempts ?? 10,
    delayMs: options.delayMs ?? 1200,
    delay: options.delay ?? defaultDelay,
  };

  const iterate = async (
    attempt: number,
    current: PullRequestStatus,
  ): Promise<PullRequestStatus> => {
    if (
      !configuration.waitForKnown ||
      current.mergeable !== "UNKNOWN" ||
      attempt >= configuration.attempts
    ) {
      return current;
    }

    await configuration.delay(configuration.delayMs);
    const next = await fetcher(coordinates);
    return iterate(attempt + 1, next);
  };

  const initial = await fetcher(coordinates);
  return iterate(0, initial);
};

export const updatePullRequestBranch =
  (restClient: <T>(url: string, init?: JsonRequestInit) => Promise<T>) =>
  async (
    coordinates: Readonly<PullRequestCoordinates>,
    expectedHeadOid?: string,
  ): Promise<JsonObject> => {
    const body = expectedHeadOid ? { expected_head_sha: expectedHeadOid } : {};

    const url = `https://api.github.com/repos/${coordinates.repo.owner}/${coordinates.repo.name}/pulls/${coordinates.number}/update-branch`;

    return restClient<JsonObject>(url, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  };

export type AutoMergeMethod = "SQUASH" | "MERGE" | "REBASE";

export const enablePullRequestAutoMerge =
  (gqlClient: <T>(query: string, variables?: JsonObject) => Promise<T>) =>
  async (
    pullRequestId: string,
    expectedHeadOid: string,
    method: AutoMergeMethod,
  ): Promise<void> => {
    await gqlClient(pullRequestEnableMutation, {
      pr: pullRequestId,
      method,
      expected: expectedHeadOid,
    });
  };

const pullRequestEnableMutation = `
  mutation($pr:ID!, $method:PullRequestMergeMethod!, $expected:String!){
    enablePullRequestAutoMerge(input:{pullRequestId:$pr, mergeMethod:$method, expectedHeadOid:$expected}){
      clientMutationId
    }
  }
`;

export const enqueuePullRequest =
  (gqlClient: <T>(query: string, variables?: JsonObject) => Promise<T>) =>
  async (pullRequestId: string): Promise<JsonObject> =>
    gqlClient<JsonObject>(pullRequestEnqueueMutation, { id: pullRequestId });

const pullRequestEnqueueMutation = `
  mutation($id:ID!){
    enqueuePullRequest(input:{pullRequestId:$id}){
      mergeQueueEntry{
        id
        position
      }
    }
  }
`;

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

export type FetchMergeTriples = (
  coordinates: Readonly<PullRequestCoordinates>,
) => Promise<readonly MergeTriple[]>;

export type ApplyResolution = (
  coordinates: Readonly<PullRequestCoordinates>,
  resolutions: readonly Resolution[],
  expectedHeadOid: string,
) => Promise<string>;
