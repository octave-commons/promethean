import { parseUnifiedDiff } from "./diff.js";
import {
  appendTrailers,
  buildGraphqlPayload,
  computeAdditions,
  computeDeletions,
  ensureCheckSucceeds,
  ensureDiffProvided,
  summarizeFiles,
} from "./github-utils.js";
import { buildSuccess, handleGraphqlResponse } from "./github-response.js";
import type { Addition, Deletion } from "./github-types.js";
import { sanitizeForLog } from "./sanitize.js";
import type {
  DiffPlan,
  GithubCommitOptions,
  GithubCommitOverrides,
  GithubCommitResult,
  GithubCommitSuccess,
} from "./types.js";

export const DEFAULT_GITHUB_GRAPHQL_URL =
  process.env.GITHUB_GRAPHQL_URL?.trim() || "https://api.github.com/graphql";

type SleepFn = (ms: number) => Promise<void>;
type RandomFn = () => number;

type FetchImpl = typeof fetch;

type GraphqlPayload = {
  readonly query: string;
  readonly variables: Record<string, unknown>;
};

type RetryConfig = {
  readonly fetchImpl: FetchImpl;
  readonly url: string;
  readonly init: RequestInit;
  readonly sleepFn: SleepFn;
  readonly randomFn: RandomFn;
  readonly maxAttempts: number;
};

const defaultSleep: SleepFn = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const attemptFetch = async (
  config: RetryConfig,
  attempt = 0,
): Promise<Response> => {
  const response = await config.fetchImpl(config.url, config.init);
  if (
    (response.status === 502 || response.status === 503) &&
    attempt + 1 < config.maxAttempts
  ) {
    const jitter = Math.floor(config.randomFn() * 150);
    const delay = (attempt + 1) * 200 + jitter;
    await config.sleepFn(delay);
    return attemptFetch(config, attempt + 1);
  }
  return response;
};

const fetchWithRetry = (config: RetryConfig): Promise<Response> =>
  attemptFetch(config, 0);

const buildHeaders = (token: string): Record<string, string> => ({
  "Content-Type": "application/json",
  "User-Agent": "apply_patch/1.0",
  Authorization: `Bearer ${token}`,
});

const prepareFileChanges = (
  plan: DiffPlan,
  diff: string,
  repoRoot: string,
): {
  readonly additions: Addition[];
  readonly deletions: readonly Deletion[];
} => ({
  additions: computeAdditions(plan, diff, repoRoot),
  deletions: computeDeletions(plan),
});

const requireToken = (options: GithubCommitOptions): string => {
  const token = options.token || process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("GITHUB_TOKEN is required for GitHub commit mode");
  }
  return token;
};

const preparePlan = (
  options: GithubCommitOptions,
): { readonly plan: DiffPlan; readonly summary: string } => {
  const plan = parseUnifiedDiff(options.diff);
  const summary = summarizeFiles(plan);
  return { plan, summary };
};

const handleCheckOnly = (
  plan: DiffPlan,
  summary: string,
  options: GithubCommitOptions,
): GithubCommitResult | null => {
  if (!options.checkOnly) {
    return null;
  }
  const checkResult = ensureCheckSucceeds(options.diff, options.repoRoot);
  if (checkResult.ok) {
    return buildSuccess({ kind: "CheckOnly", summary, plan });
  }
  console.error(
    "[apply_patch] GitHub check failed",
    JSON.stringify(
      sanitizeForLog({
        stdout: checkResult.stdout,
        stderr: checkResult.stderr,
      }),
    ),
  );
  return { ok: false, kind: "CheckFailed", summary, plan };
};

type ExecuteRequestArgs = {
  readonly options: GithubCommitOptions;
  readonly overrides: GithubCommitOverrides;
  readonly payload: GraphqlPayload;
  readonly token: string;
  readonly summary: string;
  readonly successMessage?: GithubCommitSuccess["message"];
};

const executeRequest = async ({
  options,
  overrides,
  payload,
  token,
  summary,
  successMessage,
}: ExecuteRequestArgs): Promise<GithubCommitResult> => {
  const fetchImpl = overrides.fetchImpl ?? globalThis.fetch;
  if (!fetchImpl) {
    throw new Error("Global fetch is not available");
  }
  const headers = buildHeaders(token);
  const response = await fetchWithRetry({
    fetchImpl,
    url: options.graphqlUrl ?? DEFAULT_GITHUB_GRAPHQL_URL,
    init: {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    },
    sleepFn: overrides.sleep ?? defaultSleep,
    randomFn: overrides.random ?? Math.random,
    maxAttempts: 3,
  });
  const parsedResult = await response
    .json()
    .then((value: unknown) => ({ ok: true as const, value }))
    .catch((error: unknown) => ({ ok: false as const, error }));
  if (!parsedResult.ok) {
    console.error(
      "[apply_patch] GitHub response parse error",
      sanitizeForLog({
        error:
          parsedResult.error instanceof Error
            ? parsedResult.error.message
            : String(parsedResult.error),
      }),
    );
    return { ok: false, kind: "ParseError", summary };
  }
  return handleGraphqlResponse({
    response,
    payload: parsedResult.value,
    summary,
    successMessage,
    context: { headers },
  });
};

export async function createGithubCommit(
  options: GithubCommitOptions,
  overrides: GithubCommitOverrides = {},
): Promise<GithubCommitResult> {
  ensureDiffProvided(options);
  const { plan, summary } = preparePlan(options);
  const checkOnlyResult = handleCheckOnly(plan, summary, options);
  if (checkOnlyResult) {
    return checkOnlyResult;
  }
  const token = requireToken(options);
  const { additions, deletions } = prepareFileChanges(
    plan,
    options.diff,
    options.repoRoot,
  );
  const trailers = ["mcp: apply_patch", `changes: ${summary}`];
  const headline = options.message?.headline ?? "apply patch";
  const bodyWithTrailers = appendTrailers(
    options.message?.body ?? "",
    trailers,
  );
  const successMessage = { headline, body: bodyWithTrailers };
  const payload: GraphqlPayload = buildGraphqlPayload(
    options,
    additions,
    deletions,
    bodyWithTrailers,
  );
  return executeRequest({
    options,
    overrides,
    payload,
    token,
    summary,
    successMessage,
  });
}
