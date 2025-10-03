import { sanitizeForLog } from "./sanitize.js";
import type {
  DiffPlan,
  GithubCommitResult,
  GithubCommitSuccess,
} from "./types.js";

type BuildSuccessOptions = {
  readonly kind: "Committed" | "CheckOnly";
  readonly summary: string;
  readonly plan?: DiffPlan;
  readonly oid?: string;
  readonly message?: GithubCommitSuccess["message"];
};

export const buildSuccess = ({
  kind,
  summary,
  plan,
  oid,
  message,
}: BuildSuccessOptions): GithubCommitSuccess => ({
  ok: true,
  kind,
  summary,
  ...(plan ? { plan } : {}),
  ...(oid ? { oid } : {}),
  ...(message ? { message } : {}),
});

const firstString = (
  values: readonly (string | undefined | null)[],
): string | null =>
  values.find(
    (value): value is string => typeof value === "string" && value.length > 0,
  ) ?? null;

const readConflictFromMessage = (
  message: unknown,
): {
  readonly expectedHeadOid: string;
  readonly actualHeadOid: string;
} | null => {
  if (typeof message !== "string") {
    return null;
  }
  const match = message.match(
    /expectedHeadOid[^A-Za-z0-9]*([0-9a-fA-F]{4,40}).*actual[^0-9a-fA-F]*([0-9a-fA-F]{4,40})/,
  );
  if (!match) {
    return null;
  }
  const expected = match[1];
  const actual = match[2];
  if (!expected || !actual) {
    return null;
  }
  return { expectedHeadOid: expected, actualHeadOid: actual };
};

const readConflictFromExtensions = (
  extensions: Record<string, unknown> | undefined,
): {
  readonly expectedHeadOid: string;
  readonly actualHeadOid: string;
} | null => {
  if (!extensions) {
    return null;
  }
  const expected = firstString([
    extensions.expectedHeadOid as string | undefined,
    extensions.expectedOid as string | undefined,
    extensions.expected as string | undefined,
  ]);
  const actual = firstString([
    extensions.currentOid as string | undefined,
    extensions.actualHeadOid as string | undefined,
    extensions.actual as string | undefined,
  ]);
  if (!expected || !actual) {
    return null;
  }
  return { expectedHeadOid: expected, actualHeadOid: actual };
};
const extractConflict = (
  error: unknown,
): {
  readonly expectedHeadOid: string;
  readonly actualHeadOid: string;
} | null => {
  if (!error || typeof error !== "object") {
    return null;
  }
  const candidate = error as {
    readonly extensions?: Record<string, unknown>;
    readonly message?: string;
  };
  return (
    readConflictFromExtensions(candidate.extensions) ??
    readConflictFromMessage(candidate.message)
  );
};

const buildConflictResult = (
  conflict: {
    readonly expectedHeadOid: string;
    readonly actualHeadOid: string;
  },
  summary: string,
): GithubCommitResult => ({
  ok: false,
  kind: "Conflict",
  expectedHeadOid: conflict.expectedHeadOid,
  actualHeadOid: conflict.actualHeadOid,
  summary,
});

const logGraphqlFailure = (
  response: Response,
  errors: readonly unknown[],
  context: Record<string, unknown> | undefined,
): void => {
  const details: Record<string, unknown> = {
    status: response.status,
    errors,
    ...(context ? { context } : {}),
  };
  console.error(
    "[apply_patch] GitHub commit failed",
    JSON.stringify(sanitizeForLog(details)),
  );
};

const readCommitOid = (data: unknown): string | null => {
  if (!data || typeof data !== "object") {
    return null;
  }
  const record = data as {
    readonly createCommitOnBranch?: {
      readonly commit?: { readonly oid?: string };
    };
  };
  return record.createCommitOnBranch?.commit?.oid ?? null;
};

type HandleGraphqlResponseArgs = {
  readonly response: Response;
  readonly payload: unknown;
  readonly summary: string;
  readonly successMessage?: GithubCommitSuccess["message"];
  readonly context?: Record<string, unknown>;
};

export const handleGraphqlResponse = ({
  response,
  payload,
  summary,
  successMessage,
  context,
}: HandleGraphqlResponseArgs): GithubCommitResult => {
  const record = payload as {
    readonly errors?: unknown[];
    readonly data?: unknown;
  };
  const errors = Array.isArray(record.errors) ? record.errors : null;
  if (errors && errors.length > 0) {
    const conflict = extractConflict(errors[0]);
    if (conflict) {
      return buildConflictResult(conflict, summary);
    }
    logGraphqlFailure(response, errors, context);
    return { ok: false, kind: "GraphQLError", summary };
  }
  const commitOid = readCommitOid(record.data);
  if (!commitOid) {
    console.error(
      "[apply_patch] Unexpected GitHub response",
      JSON.stringify(sanitizeForLog(record)),
    );
    return { ok: false, kind: "UnexpectedResponse", summary };
  }
  return buildSuccess({
    kind: "Committed",
    summary,
    oid: commitOid,
    message: successMessage,
  });
};
