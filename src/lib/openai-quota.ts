import type { CredentialAccountView, CredentialStoreLike } from "./credential-store.js";

const OPENAI_TOKEN_URL = "https://auth.openai.com/oauth/token";
const OPENAI_USAGE_URL = "https://chatgpt.com/backend-api/wham/usage";
const OPENAI_CLIENT_ID = "app_EMoamEEZ73f0CkXaXp7hrann";
const OPENAI_REFRESH_BUFFER_MS = 60 * 1000;
const OPENAI_USAGE_TIMEOUT_MS = 15_000;

export interface OpenAiQuotaWindow {
  readonly usedPercent: number | null;
  readonly remainingPercent: number | null;
  readonly resetsAt: string | null;
  readonly resetAfterSeconds: number | null;
}

export interface OpenAiQuotaAccountSnapshot {
  readonly providerId: string;
  readonly accountId: string;
  readonly displayName: string;
  readonly email?: string;
  readonly planType?: string;
  readonly chatgptAccountId?: string;
  readonly status: "ok" | "error";
  readonly fetchedAt: string;
  readonly fiveHour: OpenAiQuotaWindow | null;
  readonly weekly: OpenAiQuotaWindow | null;
  readonly error?: string;
}

export interface OpenAiQuotaSnapshotResponse {
  readonly generatedAt: string;
  readonly accounts: readonly OpenAiQuotaAccountSnapshot[];
}

interface LoggerLike {
  info?: (payload: unknown, message?: string) => void;
  warn?: (payload: unknown, message?: string) => void;
}

interface JwtClaims {
  readonly sub?: string;
  readonly email?: string;
  readonly chatgpt_account_id?: string;
  readonly "https://api.openai.com/profile"?: {
    readonly email?: string;
  };
  readonly "https://api.openai.com/auth"?: {
    readonly chatgpt_account_id?: string;
    readonly chatgpt_plan_type?: string;
  };
}

interface RefreshedOpenAiTokens {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly expiresAt?: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function asNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function parseJwtClaims(token: string): JwtClaims | undefined {
  const parts = token.split(".");
  if (parts.length !== 3) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(Buffer.from(parts[1] ?? "", "base64url").toString("utf8"));
    return isRecord(parsed) ? (parsed as JwtClaims) : undefined;
  } catch {
    return undefined;
  }
}

function deriveOAuthMetadataFromToken(token: string): {
  readonly email?: string;
  readonly subject?: string;
  readonly chatgptAccountId?: string;
  readonly planType?: string;
} {
  const claims = parseJwtClaims(token);
  if (!claims) {
    return {};
  }

  const profile = isRecord(claims["https://api.openai.com/profile"])
    ? claims["https://api.openai.com/profile"]
    : undefined;
  const auth = isRecord(claims["https://api.openai.com/auth"])
    ? claims["https://api.openai.com/auth"]
    : undefined;

  const email = (asString(claims.email) ?? asString(profile?.email))?.trim().toLowerCase();
  const subject = asString(claims.sub)?.trim();
  const chatgptAccountId = (asString(claims.chatgpt_account_id)
    ?? asString(auth?.chatgpt_account_id))?.trim();
  const planType = asString(auth?.chatgpt_plan_type)?.trim().toLowerCase();

  return {
    email: email && email.length > 0 ? email : undefined,
    subject: subject && subject.length > 0 ? subject : undefined,
    chatgptAccountId: chatgptAccountId && chatgptAccountId.length > 0 ? chatgptAccountId : undefined,
    planType: planType && planType.length > 0 ? planType : undefined,
  };
}

function normalizePercent(value: number): number {
  const normalized = value > 0 && value < 1 ? value * 100 : value;
  return Math.min(100, Math.max(0, normalized));
}

function normalizeResetsAt(resetsAt: string | undefined, resetAfterSeconds: number | undefined): string | null {
  if (resetsAt) {
    const parsed = new Date(resetsAt);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }

  if (typeof resetAfterSeconds === "number" && Number.isFinite(resetAfterSeconds)) {
    return new Date(Date.now() + resetAfterSeconds * 1000).toISOString();
  }

  return null;
}

function normalizeResetAfterSeconds(resetsAt: string | undefined, resetAfterSeconds: number | undefined): number | null {
  if (typeof resetAfterSeconds === "number" && Number.isFinite(resetAfterSeconds)) {
    return Math.max(0, Math.round(resetAfterSeconds));
  }

  if (resetsAt) {
    const parsed = new Date(resetsAt);
    if (!Number.isNaN(parsed.getTime())) {
      return Math.max(0, Math.round((parsed.getTime() - Date.now()) / 1000));
    }
  }

  return null;
}

function parseQuotaWindow(value: unknown): OpenAiQuotaWindow | null {
  if (!isRecord(value)) {
    return null;
  }

  const rawUsedPercent = asNumber(value.used_percent)
    ?? asNumber(value.usedPercent)
    ?? asNumber(value.percent_used)
    ?? asNumber(value.percentUsed);
  const rawRemainingPercent = asNumber(value.remaining_percent)
    ?? asNumber(value.remainingPercent)
    ?? asNumber(value.percent_remaining)
    ?? asNumber(value.percentRemaining);
  const usedUnits = asNumber(value.used)
    ?? asNumber(value.used_units)
    ?? asNumber(value.usedUnits)
    ?? asNumber(value.used_tokens)
    ?? asNumber(value.usedTokens);
  const remainingUnits = asNumber(value.remaining)
    ?? asNumber(value.remaining_units)
    ?? asNumber(value.remainingUnits)
    ?? asNumber(value.remaining_tokens)
    ?? asNumber(value.remainingTokens);
  const limitUnits = asNumber(value.limit)
    ?? asNumber(value.quota)
    ?? asNumber(value.total)
    ?? asNumber(value.max)
    ?? asNumber(value.maximum);
  const rawResetsAt = asString(value.resets_at)
    ?? asString(value.resetsAt)
    ?? asString(value.reset_at)
    ?? asString(value.resetAt)
    ?? asString(value.reset);
  const rawResetAfterSeconds = asNumber(value.reset_after_seconds) ?? asNumber(value.resetAfterSeconds);

  let usedPercent = typeof rawUsedPercent === "number" ? normalizePercent(rawUsedPercent) : null;
  let remainingPercent = typeof rawRemainingPercent === "number" ? normalizePercent(rawRemainingPercent) : null;

  if (remainingPercent === null && usedPercent !== null) {
    remainingPercent = Math.max(0, 100 - usedPercent);
  }

  if (usedPercent === null && remainingPercent !== null) {
    usedPercent = Math.max(0, 100 - remainingPercent);
  }

  if ((usedPercent === null || remainingPercent === null) && typeof limitUnits === "number" && limitUnits > 0) {
    if (usedPercent === null && typeof usedUnits === "number") {
      usedPercent = normalizePercent((usedUnits / limitUnits) * 100);
    }
    if (remainingPercent === null && typeof remainingUnits === "number") {
      remainingPercent = normalizePercent((remainingUnits / limitUnits) * 100);
    }
  }

  const resetsAt = normalizeResetsAt(rawResetsAt, rawResetAfterSeconds);
  const resetAfterSeconds = normalizeResetAfterSeconds(rawResetsAt, rawResetAfterSeconds);

  if (usedPercent === null && remainingPercent === null && !resetsAt && resetAfterSeconds === null) {
    return null;
  }

  return {
    usedPercent,
    remainingPercent,
    resetsAt,
    resetAfterSeconds,
  };
}

function quotaErrorMessage(responseStatus: number, responseText: string): string {
  const trimmed = responseText.trim();
  if (trimmed.length === 0) {
    return `HTTP ${responseStatus}`;
  }

  try {
    const parsed = JSON.parse(trimmed);
    if (isRecord(parsed)) {
      const detail = isRecord(parsed.detail) ? parsed.detail : undefined;
      const detailCode = asString(detail?.code)?.trim();
      const detailMessage = asString(detail?.message)?.trim();

      if (detailCode && detailCode.length > 0) {
        return detailMessage && detailMessage.length > 0
          ? `${detailCode}: ${detailMessage}`
          : detailCode;
      }

      const message = asString(parsed.message)
        ?? (isRecord(parsed.error) ? asString(parsed.error.message) ?? asString(parsed.error) : undefined)
        ?? asString(parsed.detail);
      if (message && message.trim().length > 0) {
        return message.trim();
      }
    }
  } catch {
    // Fall through to plain text.
  }

  return trimmed.length > 160 ? `${trimmed.slice(0, 157)}...` : trimmed;
}

function quotaErrorCode(responseText: string): string | undefined {
  const trimmed = responseText.trim();
  if (trimmed.length === 0) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(trimmed);
    if (!isRecord(parsed)) {
      return undefined;
    }

    const detail = isRecord(parsed.detail) ? parsed.detail : undefined;
    const detailCode = asString(detail?.code)?.trim()?.toLowerCase();
    if (detailCode && detailCode.length > 0) {
      return detailCode;
    }

    const error = isRecord(parsed.error) ? parsed.error : undefined;
    const errorCode = (asString(error?.code) ?? asString(parsed.code))?.trim()?.toLowerCase();
    return errorCode && errorCode.length > 0 ? errorCode : undefined;
  } catch {
    return undefined;
  }
}

async function refreshOpenAiToken(refreshToken: string, fetchFn: typeof fetch): Promise<RefreshedOpenAiTokens | null> {
  const response = await fetchFn(OPENAI_TOKEN_URL, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: OPENAI_CLIENT_ID,
    }).toString(),
  });

  if (!response.ok) {
    return null;
  }

  const payload = await response.json();
  if (!isRecord(payload)) {
    return null;
  }

  const accessToken = asString(payload.access_token)?.trim();
  const nextRefreshToken = asString(payload.refresh_token)?.trim();
  const expiresIn = asNumber(payload.expires_in);

  if (!accessToken || !nextRefreshToken) {
    return null;
  }

  return {
    accessToken,
    refreshToken: nextRefreshToken,
    expiresAt: typeof expiresIn === "number" ? Date.now() + expiresIn * 1000 : undefined,
  };
}

function accountNeedsRefresh(account: CredentialAccountView): boolean {
  if (account.authType !== "oauth_bearer") {
    return false;
  }

  if (typeof account.expiresAt !== "number") {
    return false;
  }

  return account.expiresAt <= Date.now() + OPENAI_REFRESH_BUFFER_MS;
}

async function ensureFreshAccount(
  providerId: string,
  account: CredentialAccountView,
  credentialStore: CredentialStoreLike,
  fetchFn: typeof fetch,
  logger?: LoggerLike,
): Promise<CredentialAccountView> {
  if (!accountNeedsRefresh(account)) {
    return account;
  }

  const refreshToken = account.refreshToken?.trim();
  if (!refreshToken) {
    return account;
  }

  const refreshed = await refreshOpenAiToken(refreshToken, fetchFn);
  if (!refreshed) {
    logger?.warn?.({ providerId, accountId: account.id }, "failed to refresh OpenAI quota token");
    return account;
  }

  const derived = deriveOAuthMetadataFromToken(refreshed.accessToken);
  const nextAccount: CredentialAccountView = {
    ...account,
    secret: refreshed.accessToken,
    secretPreview: account.secretPreview,
    refreshToken: refreshed.refreshToken,
    refreshTokenPreview: account.refreshTokenPreview,
    expiresAt: refreshed.expiresAt,
    chatgptAccountId: derived.chatgptAccountId ?? account.chatgptAccountId,
    email: derived.email ?? account.email,
    subject: derived.subject ?? account.subject,
    planType: derived.planType ?? account.planType,
  };

  await credentialStore.upsertOAuthAccount(
    providerId,
    nextAccount.id,
    refreshed.accessToken,
    refreshed.refreshToken,
    refreshed.expiresAt,
    nextAccount.chatgptAccountId,
    nextAccount.email,
    nextAccount.subject,
    nextAccount.planType,
  );

  await credentialStore.flush?.();

  logger?.info?.({ providerId, accountId: account.id }, "refreshed OpenAI quota token");
  return nextAccount;
}

async function fetchUsagePayload(
  accessToken: string,
  chatgptAccountId: string | undefined,
  fetchFn: typeof fetch,
): Promise<{ readonly payload: unknown; readonly resolvedChatgptAccountId?: string }> {
  const attempt = async (workspaceId: string | undefined): Promise<{ readonly ok: true; readonly payload: unknown } | { readonly ok: false; readonly status: number; readonly text: string }> => {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, OPENAI_USAGE_TIMEOUT_MS);

    try {
      const headers: Record<string, string> = {
        authorization: `Bearer ${accessToken}`,
        accept: "application/json",
        originator: "codex_cli_rs",
      };
      if (workspaceId && workspaceId.trim().length > 0) {
        headers["chatgpt-account-id"] = workspaceId.trim();
      }

      const response = await fetchFn(OPENAI_USAGE_URL, {
        method: "GET",
        headers,
        signal: controller.signal,
      });

      if (!response.ok) {
        const text = await response.text();
        return { ok: false, status: response.status, text };
      }

      const payload = await response.json();
      return { ok: true, payload };
    } finally {
      clearTimeout(timeout);
    }
  };

  const primary = await attempt(chatgptAccountId);
  if (primary.ok) {
    return { payload: primary.payload, resolvedChatgptAccountId: chatgptAccountId };
  }

  const code = quotaErrorCode(primary.text);
  const shouldRetryWithoutWorkspace = (code === "deactivated_workspace" || code === "invalid_workspace")
    && typeof chatgptAccountId === "string"
    && chatgptAccountId.trim().length > 0;

  if (shouldRetryWithoutWorkspace) {
    const fallback = await attempt(undefined);
    if (fallback.ok) {
      return { payload: fallback.payload, resolvedChatgptAccountId: undefined };
    }
    throw new Error(quotaErrorMessage(fallback.status, fallback.text));
  }

  throw new Error(quotaErrorMessage(primary.status, primary.text));
}

function normalizePlanType(payload: unknown, fallback?: string): string | undefined {
  if (!isRecord(payload)) {
    return fallback;
  }

  const usage = isRecord(payload.usage) ? payload.usage : payload;
  const planType = asString(usage.plan_type)?.trim().toLowerCase();
  return planType && planType.length > 0 ? planType : fallback;
}

function extractQuotaWindows(payload: unknown): {
  readonly fiveHour: OpenAiQuotaWindow | null;
  readonly weekly: OpenAiQuotaWindow | null;
} {
  if (!isRecord(payload)) {
    return { fiveHour: null, weekly: null };
  }

  const usage = isRecord(payload.usage) ? payload.usage : payload;
  const rateLimit = isRecord(usage.rate_limit) ? usage.rate_limit : undefined;
  const primaryWindow = rateLimit?.primary_window ?? usage.primary ?? usage.session ?? usage.fiveHour ?? usage.five_hour;
  const secondaryWindow = rateLimit?.secondary_window ?? usage.secondary ?? usage.weekly ?? usage.week;

  return {
    fiveHour: parseQuotaWindow(primaryWindow),
    weekly: parseQuotaWindow(secondaryWindow),
  };
}

async function fetchQuotaForAccount(
  providerId: string,
  account: CredentialAccountView,
  credentialStore: CredentialStoreLike,
  fetchFn: typeof fetch,
  logger?: LoggerLike,
): Promise<OpenAiQuotaAccountSnapshot> {
  const fetchedAt = new Date().toISOString();

  try {
    const freshAccount = await ensureFreshAccount(providerId, account, credentialStore, fetchFn, logger);
    const accessToken = freshAccount.secret?.trim();
    if (!accessToken) {
      return {
        providerId,
        accountId: freshAccount.id,
        displayName: freshAccount.displayName,
        email: freshAccount.email,
        planType: freshAccount.planType,
        chatgptAccountId: freshAccount.chatgptAccountId,
        status: "error",
        fetchedAt,
        fiveHour: null,
        weekly: null,
        error: "Missing access token",
      };
    }

    const rawChatgptAccountId = freshAccount.chatgptAccountId?.trim();
    const chatgptAccountId = rawChatgptAccountId && rawChatgptAccountId.length > 0 ? rawChatgptAccountId : undefined;

    const usageResult = await fetchUsagePayload(accessToken, chatgptAccountId, fetchFn);
    const payload = usageResult.payload;
    const resolvedChatgptAccountId = usageResult.resolvedChatgptAccountId;

    const { fiveHour, weekly } = extractQuotaWindows(payload);
    const planType = normalizePlanType(payload, freshAccount.planType);

    const shouldPersistPlanType = Boolean(planType && planType !== freshAccount.planType);
    const shouldPersistWorkspace = resolvedChatgptAccountId !== chatgptAccountId;

    if (shouldPersistPlanType || shouldPersistWorkspace) {
      await credentialStore.upsertOAuthAccount(
        providerId,
        freshAccount.id,
        accessToken,
        freshAccount.refreshToken,
        freshAccount.expiresAt,
        resolvedChatgptAccountId,
        freshAccount.email,
        freshAccount.subject,
        planType,
      );

      await credentialStore.flush?.();
    }

    return {
      providerId,
      accountId: freshAccount.id,
      displayName: freshAccount.displayName,
      email: freshAccount.email,
      planType,
      chatgptAccountId: resolvedChatgptAccountId,
      status: "ok",
      fetchedAt,
      fiveHour,
      weekly,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger?.warn?.({ providerId, accountId: account.id, error: message }, "failed to fetch OpenAI quota usage");
    return {
      providerId,
      accountId: account.id,
      displayName: account.displayName,
      email: account.email,
      planType: account.planType,
      chatgptAccountId: account.chatgptAccountId,
      status: "error",
      fetchedAt,
      fiveHour: null,
      weekly: null,
      error: message,
    };
  }
}

export async function fetchOpenAiQuotaSnapshots(
  credentialStore: CredentialStoreLike,
  options: {
    readonly providerId: string;
    readonly accountId?: string;
    readonly fetchFn?: typeof fetch;
    readonly logger?: LoggerLike;
  },
): Promise<OpenAiQuotaSnapshotResponse> {
  const fetchFn = options.fetchFn ?? fetch;
  const providers = await credentialStore.listProviders(true);
  const provider = providers.find((entry) => entry.id === options.providerId);
  const accounts = (provider?.accounts ?? [])
    .filter((account) => account.authType === "oauth_bearer")
    .filter((account) => !options.accountId || account.id === options.accountId)
    .sort((left, right) => {
      const leftLabel = (left.email ?? left.displayName ?? left.id).toLowerCase();
      const rightLabel = (right.email ?? right.displayName ?? right.id).toLowerCase();
      return leftLabel.localeCompare(rightLabel);
    });

  const snapshots = await Promise.all(
    accounts.map((account) => fetchQuotaForAccount(options.providerId, account, credentialStore, fetchFn, options.logger)),
  );

  return {
    generatedAt: new Date().toISOString(),
    accounts: snapshots,
  };
}
