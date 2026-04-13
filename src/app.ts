import { createHash } from "node:crypto";

import Fastify, { type FastifyInstance, type FastifyReply } from "fastify";

import { DEFAULT_MODELS, type ProxyConfig } from "./lib/config.js";
import { KeyPool, type ProviderCredential } from "./lib/key-pool.js";
import { CredentialStore } from "./lib/credential-store.js";
import { OpenAiOAuthManager, isTerminalOpenAiRefreshError, type OAuthTokens } from "./lib/openai-oauth.js";
import {
  factoryCredentialNeedsRefresh,
  parseJwtExpiry,
  persistFactoryAuthV2,
  refreshFactoryOAuthToken,
} from "./lib/factory-auth.js";
import { toOpenAiModel } from "./lib/models.js";
import { ProviderCatalogStore, type ResolvedCatalogWithPreferences } from "./lib/provider-catalog.js";
import { buildForwardHeaders } from "./lib/proxy.js";
import { initializePolicyEngine, createPolicyEngine, type PolicyEngine } from "./lib/policy/index.js";
import { DEFAULT_POLICY_CONFIG } from "./lib/policy/index.js";
import {
  buildOllamaCatalogRoutes,
  buildProviderRoutes,
  filterResponsesApiRoutes,
  filterImagesApiRoutes,
  minMsUntilAnyProviderKeyReady,
  resolveProviderRoutesForModel,
  resolveRequestRoutingState,
  type ProviderRoute,
  type ResolvedModelCatalog,
} from "./lib/provider-routing.js";
import {
  buildResponsesPassthroughContext,
  buildImagesPassthroughContext,
  executeLocalStrategy,
  executeProviderFallback,
  inspectProviderAvailability,
  selectProviderStrategy,
} from "./lib/provider-strategy.js";
import { orderProviderRoutesByPolicy } from "./lib/provider-policy.js";
import {
  fetchWithResponseTimeout,
  isRecord,
  sendOpenAiError,
  toErrorMessage,
} from "./lib/provider-utils.js";
import { getTelemetry, type TelemetrySpan } from "./lib/telemetry/otel.js";
import { RequestLogStore } from "./lib/request-log-store.js";
import { PromptAffinityStore } from "./lib/prompt-affinity-store.js";
import { ProxySettingsStore } from "./lib/proxy-settings-store.js";
import { registerUiRoutes } from "./lib/ui-routes.js";
import {
  ensureOllamaContextFits,
} from "./lib/ollama-context.js";
import {
  chatCompletionToNativeChat,
  chatCompletionToNativeGenerate,
  modelIdsToNativeTags,
  nativeChatToOpenAiRequest,
  nativeEmbedResponseToOpenAiEmbeddings,
  nativeEmbedToOpenAiRequest,
  nativeGenerateToChatRequest,
  openAiEmbeddingsToNativeEmbed,
  openAiEmbeddingsToNativeEmbeddings,
} from "./lib/ollama-native.js";
import { applyNativeOllamaAuth } from "./lib/native-auth.js";
import { requestHasExplicitNumCtx } from "./lib/ollama-compat.js";
import { createSqlConnection, closeConnection, type Sql } from "./lib/db/index.js";
import { SqlCredentialStore } from "./lib/db/sql-credential-store.js";
import { AccountHealthStore } from "./lib/db/account-health-store.js";
import { EventStore } from "./lib/db/event-store.js";
import { createDefaultLabelers } from "./lib/db/event-labelers.js";
import { SqlRequestUsageStore } from "./lib/db/sql-request-usage-store.js";
import { SqlAuthPersistence } from "./lib/auth/sql-persistence.js";
import { SqlGitHubAllowlist } from "./lib/auth/github-allowlist.js";
import { seedFromJsonFile, seedFromJsonValue, seedFactoryAuthFromFiles, seedModelsFromFile, loadModelsFromDb, getConfig, setConfig } from "./lib/db/json-seeder.js";
import { registerOAuthRoutes } from "./lib/oauth-routes.js";
import { RuntimeCredentialStore } from "./lib/runtime-credential-store.js";
import { TokenRefreshManager } from "./lib/token-refresh-manager.js";
import { DEFAULT_TENANT_ID } from "./lib/tenant-api-key.js";
import { resolveRequestAuth } from "./lib/request-auth.js";

interface ChatCompletionRequest {
  readonly model?: string;
  readonly messages?: unknown;
  readonly stream?: boolean;
  readonly [key: string]: unknown;
}

interface WebSearchToolRequest {
  readonly query?: unknown;
  readonly numResults?: unknown;
  readonly searchContextSize?: unknown;
  readonly allowedDomains?: unknown;
  readonly model?: unknown;
}

const PROXY_AUTH_COOKIE_NAME = "open_hax_proxy_auth_token";

function readCookieToken(cookieHeader: string | undefined, name: string): string | undefined {
  if (!cookieHeader) {
    return undefined;
  }

  for (const part of cookieHeader.split(";")) {
    const trimmed = part.trim();
    if (!trimmed.startsWith(`${name}=`)) {
      continue;
    }

    const rawValue = trimmed.slice(name.length + 1);
    try {
      return decodeURIComponent(rawValue);
    } catch {
      return rawValue;
    }
  }

  return undefined;
}

function extractPromptCacheKey(body: Record<string, unknown>): string | undefined {
  const raw = typeof body.prompt_cache_key === "string"
    ? body.prompt_cache_key
    : typeof body.promptCacheKey === "string"
      ? body.promptCacheKey
      : undefined;
  const normalized = raw?.trim();
  return normalized && normalized.length > 0 ? normalized : undefined;
}

function hashPromptCacheKey(promptCacheKey: string): string {
  const trimmed = promptCacheKey.trim();
  if (trimmed.length === 0) {
    return "<REDACTED>";
  }

  const digest = createHash("sha256").update(trimmed).digest("hex").slice(0, 12);
  return `sha256:${digest}`;
}

function summarizeResponsesRequestBody(body: Record<string, unknown>): Record<string, unknown> {
  const summary: Record<string, unknown> = {};

  if (typeof body.model === "string" && body.model.trim().length > 0) {
    summary.model = body.model;
  }

  if (typeof body.stream === "boolean") {
    summary.stream = body.stream;
  }

  if (typeof body.max_output_tokens === "number" && Number.isFinite(body.max_output_tokens)) {
    summary.max_output_tokens = body.max_output_tokens;
  }

  const input = body.input;
  if (typeof input === "string") {
    summary.input = { kind: "text", length: input.length, preview: input.slice(0, 200) };
    return summary;
  }

  if (!Array.isArray(input)) {
    summary.input = { kind: typeof input };
    return summary;
  }

  let textChars = 0;
  let firstTextPreview: string | undefined;
  let imageCount = 0;

  for (const item of input) {
    if (!isRecord(item)) {
      continue;
    }

    const content = item.content;
    if (typeof content === "string") {
      textChars += content.length;
      if (firstTextPreview === undefined && content.length > 0) {
        firstTextPreview = content.slice(0, 200);
      }
      continue;
    }

    if (!Array.isArray(content)) {
      continue;
    }

    for (const part of content) {
      if (!isRecord(part)) {
        continue;
      }

      const partType = typeof part.type === "string" ? part.type.toLowerCase() : "";
      const text = typeof part.text === "string" ? part.text : undefined;

      if (text) {
        textChars += text.length;
        if (firstTextPreview === undefined && text.length > 0) {
          firstTextPreview = text.slice(0, 200);
        }
      }

      if (partType.includes("image") || part.image_url !== undefined || part.imageUrl !== undefined) {
        imageCount += 1;
      }
    }
  }

  summary.input = {
    kind: "structured",
    itemCount: input.length,
    textChars,
    textPreview: firstTextPreview,
    imageCount,
  };

  return summary;
}

function joinUrl(baseUrl: string, path: string): string {
  const normalizedBase = baseUrl.replace(/\/+$/, "");
  let normalizedPath = path.startsWith("/") ? path : `/${path}`;

  // Avoid accidental `/v1/v1/...` joins when the provider base URL already includes the OpenAI version segment.
  const baseLower = normalizedBase.toLowerCase();
  const pathLower = normalizedPath.toLowerCase();
  if (pathLower.startsWith("/v1/") && baseLower.endsWith("/v1")) {
    normalizedPath = normalizedPath.slice(3);
  }

  return `${normalizedBase}${normalizedPath}`;
}

function parseJsonIfPossible(body: string): unknown {
  if (body.trim().length === 0) {
    return undefined;
  }

  try {
    return JSON.parse(body);
  } catch {
    return undefined;
  }
}

function extractResponseTextAndUrlCitations(payload: unknown): {
  readonly text: string;
  readonly citations: Array<{ readonly url: string; readonly title?: string }>;
  readonly responseId?: string;
} {
  if (!isRecord(payload)) {
    return { text: "", citations: [] };
  }

  const responseId = typeof payload.id === "string" ? payload.id : undefined;
  const output = Array.isArray(payload.output) ? payload.output : [];
  const texts: string[] = [];
  const citations = new Map<string, { url: string; title?: string }>();

  for (const item of output) {
    if (!isRecord(item) || item.type !== "message") {
      continue;
    }
    if (typeof item.role === "string" && item.role !== "assistant") {
      continue;
    }
    const content = Array.isArray(item.content) ? item.content : [];
    for (const part of content) {
      if (!isRecord(part) || part.type !== "output_text") {
        continue;
      }

      const text = typeof part.text === "string" ? part.text : "";
      if (text.length > 0) {
        texts.push(text);
      }

      const annotations = Array.isArray(part.annotations) ? part.annotations : [];
      for (const ann of annotations) {
        if (!isRecord(ann)) {
          continue;
        }
        if (ann.type !== "url_citation") {
          continue;
        }
        const url = typeof ann.url === "string" ? ann.url : "";
        if (!url) {
          continue;
        }
        if (!citations.has(url)) {
          const title = typeof ann.title === "string" && ann.title.trim().length > 0 ? ann.title.trim() : undefined;
          citations.set(url, { url, ...(title ? { title } : {}) });
        }
      }
    }
  }

  const combined = texts.join("\n\n").trim();
  return { text: combined, citations: Array.from(citations.values()), responseId };
}

function extractMarkdownLinks(text: string): Array<{ readonly url: string; readonly title?: string }> {
  const citations = new Map<string, { url: string; title?: string }>();
  const regex = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g;
  for (const match of text.matchAll(regex)) {
    const title = (match[1] ?? "").trim();
    const url = (match[2] ?? "").trim();
    if (!url) continue;
    if (citations.has(url)) continue;
    citations.set(url, { url, ...(title ? { title } : {}) });
  }
  return Array.from(citations.values());
}

function copyInjectedResponseHeaders(reply: FastifyReply, headers: Record<string, string | string[] | undefined>): void {
  for (const [name, value] of Object.entries(headers)) {
    if (typeof value === "undefined" || name.toLowerCase() === "content-length") {
      continue;
    }

    reply.header(name, value);
  }
}

const SUPPORTED_V1_ENDPOINTS = [
  "POST /v1/chat/completions",
  "POST /v1/responses",
  "POST /v1/images/generations",
  "POST /v1/embeddings",
  "GET /v1/models",
  "GET /v1/models/:model"
] as const;

const SUPPORTED_NATIVE_OLLAMA_ENDPOINTS = [
  "POST /api/chat",
  "POST /api/generate",
  "POST /api/embed",
  "POST /api/embeddings",
  "GET /api/tags"
] as const;

export async function createApp(config: ProxyConfig): Promise<FastifyInstance> {
  const app = Fastify({
    logger: true,
    bodyLimit: 300 * 1024 * 1024
  });

  let sql: Sql | undefined;
  let sqlCredentialStore: SqlCredentialStore | undefined;
  let sqlAuthPersistence: SqlAuthPersistence | undefined;
  let sqlGitHubAllowlist: SqlGitHubAllowlist | undefined;
  let accountHealthStore: AccountHealthStore | undefined;
  let eventStore: EventStore | undefined;
  let sqlRequestUsageStore: SqlRequestUsageStore | undefined;

  if (config.databaseUrl) {
    try {
      sql = createSqlConnection({ connectionString: config.databaseUrl });
      app.log.info("connecting to database");

      sqlCredentialStore = new SqlCredentialStore(sql, { defaultTenantId: DEFAULT_TENANT_ID });
      await sqlCredentialStore.init();
      app.log.info("credential store initialized");

      accountHealthStore = new AccountHealthStore(sql);
      await accountHealthStore.init();
      app.log.info("account health store initialized");

      eventStore = new EventStore(sql);
      await eventStore.init();
      for (const labeler of createDefaultLabelers()) {
        eventStore.registerLabeler(labeler);
      }
      app.log.info("event store initialized");

      sqlRequestUsageStore = new SqlRequestUsageStore(sql);
      await sqlRequestUsageStore.init();
      app.log.info("request usage store initialized");

      sqlAuthPersistence = new SqlAuthPersistence(sql);
      await sqlAuthPersistence.init();
      app.log.info("auth persistence initialized");

      sqlGitHubAllowlist = new SqlGitHubAllowlist(sql);
      app.log.info("github allowlist initialized");

      if (config.keysFilePath) {
        try {
          const seedResult = await seedFromJsonFile(sql, config.keysFilePath, config.upstreamProviderId, {
            skipExistingProviders: true,
          });
          app.log.info({ providers: seedResult.providers, accounts: seedResult.accounts }, "seeded credentials from json file");
        } catch (error) {
          app.log.warn({ error: toErrorMessage(error) }, "failed to seed credentials from json file; continuing with existing data");
        }
      }

      const inlineKeysJson = process.env.PROXY_KEYS_JSON ?? process.env.UPSTREAM_KEYS_JSON ?? process.env.VIVGRID_KEYS_JSON;
      if (typeof inlineKeysJson === "string" && inlineKeysJson.trim().length > 0) {
        try {
          const parsedInlineKeys: unknown = JSON.parse(inlineKeysJson);
          const seedResult = await seedFromJsonValue(sql, parsedInlineKeys, config.upstreamProviderId, {
            skipExistingProviders: true,
          });
          app.log.info({ providers: seedResult.providers, accounts: seedResult.accounts }, "seeded credentials from inline json env");
        } catch (error) {
          app.log.warn({ error: toErrorMessage(error) }, "failed to seed credentials from inline json env; continuing with existing data");
        }
      }

      // Seed Factory OAuth credentials from encrypted auth.v2 files into the DB.
      // Only imports on first boot when no factory accounts exist in the DB yet.
      try {
        const factorySeed = await seedFactoryAuthFromFiles(sql);
        if (factorySeed.seeded) {
          app.log.info("seeded Factory OAuth credentials from auth.v2 files into database");
        }
      } catch (error) {
        app.log.warn({ error: toErrorMessage(error) }, "failed to seed Factory OAuth credentials from auth.v2 files");
      }

      // Seed models from models.json into the DB (first boot only).
      if (config.modelsFilePath) {
        try {
          const modelSeed = await seedModelsFromFile(sql, config.modelsFilePath, DEFAULT_MODELS);
          if (modelSeed.seeded) {
            app.log.info({ count: modelSeed.count }, "seeded models from file into database");
          }
        } catch (error) {
          app.log.warn({ error: toErrorMessage(error) }, "failed to seed models from file");
        }
      }

      const removedLegacyOpenAiAccounts = await sqlCredentialStore.cleanupLegacyOpenAiDuplicates();
      if (removedLegacyOpenAiAccounts > 0) {
        app.log.warn({ count: removedLegacyOpenAiAccounts }, "removed legacy duplicate OpenAI account rows after seeding");
      }

      app.log.info("database connection established");
    } catch (error) {
      app.log.error({ error: toErrorMessage(error) }, "failed to initialize database connection");
      throw error;
    }
  }

  const keyPool = new KeyPool({
    keysFilePath: config.keysFilePath,
    reloadIntervalMs: config.keyReloadMs,
    defaultCooldownMs: config.keyCooldownMs,
    defaultProviderId: config.upstreamProviderId,
    accountStore: sqlCredentialStore,
    preferAccountStoreProviders: sqlCredentialStore !== undefined,
  });
  try {
    await keyPool.warmup();
  } catch (error) {
    app.log.warn({ error: toErrorMessage(error) }, "failed to warm up provider accounts; non-keyed routes may still work");
  }
  const requestLogStore = new RequestLogStore(
    config.requestLogsFilePath,
    config.requestLogsMaxEntries,
    config.requestLogsFlushMs,
    sqlRequestUsageStore,
  );
  await requestLogStore.warmup();
  const promptAffinityStore = new PromptAffinityStore(
    config.promptAffinityFilePath,
    config.promptAffinityFlushMs,
  );
  await promptAffinityStore.warmup();
  const proxySettingsStore = new ProxySettingsStore(config.settingsFilePath, sql);
  await proxySettingsStore.warmup();

  const tenantProviderAllowed = (settings: { readonly allowedProviderIds: readonly string[] | null; readonly disabledProviderIds: readonly string[] | null }, providerId: string): boolean => {
    const normalizedProviderId = providerId.trim().toLowerCase();
    if (settings.allowedProviderIds && !settings.allowedProviderIds.includes(normalizedProviderId)) {
      return false;
    }

    if (settings.disabledProviderIds?.includes(normalizedProviderId)) {
      return false;
    }

    return true;
  };

  const filterTenantProviderRoutes = (routes: readonly ProviderRoute[], settings: { readonly allowedProviderIds: readonly string[] | null; readonly disabledProviderIds: readonly string[] | null }): ProviderRoute[] => {
    return routes.filter((route) => tenantProviderAllowed(settings, route.providerId));
  };

  const resolveExplicitTenantProviderId = (model: string, settings: { readonly allowedProviderIds: readonly string[] | null; readonly disabledProviderIds: readonly string[] | null }): string | undefined => {
    const routingState = resolveRequestRoutingState(config, model);
    const providerId = routingState.factoryPrefixed
      ? "factory"
      : routingState.openAiPrefixed
        ? config.openaiProviderId
        : routingState.explicitOllama || routingState.localOllama
          ? "ollama"
          : undefined;

    return providerId && !tenantProviderAllowed(settings, providerId) ? providerId : undefined;
  };

  let policyEngine: PolicyEngine;
  try {
    policyEngine = await initializePolicyEngine(config.policyConfigPath);
    app.log.info({ policyConfigPath: config.policyConfigPath }, "policy engine initialized");
  } catch (error) {
    app.log.warn({ error: toErrorMessage(error) }, "failed to load policy config; using defaults");
    policyEngine = createPolicyEngine(DEFAULT_POLICY_CONFIG);
  }

  const credentialStore = new CredentialStore(config.keysFilePath, config.upstreamProviderId);
  const runtimeCredentialStore = new RuntimeCredentialStore(credentialStore, sqlCredentialStore);
  const oauthManager = new OpenAiOAuthManager({
    oauthScopes: config.openaiOauthScopes,
    clientId: config.openaiOauthClientId,
    issuer: config.openaiOauthIssuer,
    clientSecret: config.openaiOauthClientSecret,
  });

  const tokenRefreshManager = new TokenRefreshManager(
    async (credential) => {
      if (!credential.refreshToken) {
        return null;
      }

      // Factory OAuth credentials use WorkOS refresh, not OpenAI OAuth
      if (credential.providerId === "factory") {
        return refreshFactoryAccount(credential);
      }

      app.log.info({ accountId: credential.accountId, providerId: credential.providerId }, "refreshing expired OAuth token");

      let newTokens: OAuthTokens;
      try {
        newTokens = await oauthManager.refreshToken(credential.refreshToken);
      } catch (error) {
        if (isTerminalOpenAiRefreshError(error)) {
          const disabledCredential: ProviderCredential = {
            ...credential,
            refreshToken: undefined,
          };

          keyPool.updateAccountCredential(credential.providerId, credential, disabledCredential);
          if (typeof credential.expiresAt === "number" && credential.expiresAt <= Date.now()) {
            keyPool.markRateLimited(disabledCredential, 24 * 60 * 60 * 1000);
          }

          await runtimeCredentialStore.upsertOAuthAccount(
            credential.providerId,
            disabledCredential.accountId,
            disabledCredential.token,
            undefined,
            disabledCredential.expiresAt,
            disabledCredential.chatgptAccountId,
            undefined,
            undefined,
            disabledCredential.planType,
          );

          app.log.warn({
            accountId: credential.accountId,
            providerId: credential.providerId,
            code: error.code,
            status: error.status,
          }, "disabled terminally invalid OpenAI refresh token; full reauth required");
        }

        throw error;
      }

      const newCredential: ProviderCredential = {
        providerId: credential.providerId,
        accountId: newTokens.accountId,
        token: newTokens.accessToken,
        authType: "oauth_bearer",
        chatgptAccountId: newTokens.chatgptAccountId ?? credential.chatgptAccountId,
        planType: newTokens.planType,
        refreshToken: newTokens.refreshToken ?? credential.refreshToken,
        expiresAt: newTokens.expiresAt,
      };

      keyPool.updateAccountCredential(credential.providerId, credential, newCredential);

      await runtimeCredentialStore.upsertOAuthAccount(
        credential.providerId,
        newCredential.accountId,
        newCredential.token,
        newCredential.refreshToken,
        newCredential.expiresAt,
        newCredential.chatgptAccountId,
        newTokens.email,
        newTokens.subject,
        newTokens.planType,
      );

      app.log.info({
        accountId: newCredential.accountId,
        providerId: newCredential.providerId,
        expiresAt: newCredential.expiresAt,
      }, "OAuth token refreshed successfully");

      return newCredential;
    },
    app.log,
    {
      maxConcurrency: config.oauthRefreshMaxConcurrency,
      backgroundIntervalMs: config.oauthRefreshBackgroundIntervalMs,
      expiryBufferMs: 60_000,
      proactiveRefreshWindowMs: config.oauthRefreshProactiveWindowMs,
      maxConsecutiveFailures: 3,
    },
  );

  async function refreshExpiredOAuthAccount(credential: ProviderCredential): Promise<ProviderCredential | null> {
    return tokenRefreshManager.refresh(credential);
  }

  async function refreshFactoryAccount(credential: ProviderCredential): Promise<ProviderCredential | null> {
    if (!credential.refreshToken) {
      return null;
    }

    try {
      app.log.info({ accountId: credential.accountId, providerId: "factory" }, "refreshing Factory OAuth token via WorkOS");

      const refreshed = await refreshFactoryOAuthToken(credential.refreshToken);
      const expiresAt = refreshed.expiresAt ?? parseJwtExpiry(refreshed.accessToken) ?? undefined;

      const newCredential: ProviderCredential = {
        providerId: "factory",
        accountId: credential.accountId,
        token: refreshed.accessToken,
        authType: "oauth_bearer",
        refreshToken: refreshed.refreshToken,
        expiresAt,
      };

      // Update the credential in the KeyPool's in-memory state
      keyPool.updateAccountCredential("factory", credential, newCredential);

      // Persist to the credential store (file or SQL)
      await runtimeCredentialStore.upsertOAuthAccount(
        "factory",
        newCredential.accountId,
        newCredential.token,
        newCredential.refreshToken,
        newCredential.expiresAt,
      );

      if (!sqlCredentialStore) {
        try {
          await persistFactoryAuthV2(refreshed.accessToken, refreshed.refreshToken);
        } catch {
          // Expected to fail on read-only container filesystems; DB has the data.
        }
      }

      app.log.info({
        accountId: newCredential.accountId,
        providerId: "factory",
        expiresAt: newCredential.expiresAt,
      }, "Factory OAuth token refreshed successfully");

      return newCredential;
    } catch (error) {
      app.log.warn({
        error: toErrorMessage(error),
        accountId: credential.accountId,
        providerId: "factory",
      }, "failed to refresh Factory OAuth token");
      return null;
    }
  }

  async function ensureFreshAccounts(providerId: string): Promise<void> {
    const expiredAccounts = keyPool.getExpiredAccountsWithRefreshTokens(providerId);

    if (expiredAccounts.length > 0) {
      await tokenRefreshManager.refreshBatch(expiredAccounts);
    }

    // Factory OAuth: proactively refresh tokens within 30-min window (before they expire)
    if (providerId === "factory") {
      const allFactoryAccounts = await keyPool.getAllAccounts("factory").catch(() => [] as ProviderCredential[]);
      for (const account of allFactoryAccounts) {
        if (factoryCredentialNeedsRefresh(account)) {
          await tokenRefreshManager.refresh(account);
        }
      }
    }
  }

  async function refreshOpenAiOauthAccounts(accountId?: string): Promise<{
    readonly totalAccounts: number;
    readonly refreshedCount: number;
    readonly failedCount: number;
  }> {
    const allOpenAiAccounts = await keyPool.getAllAccounts(config.openaiProviderId).catch(() => [] as ProviderCredential[]);
    const normalizedAccountId = typeof accountId === "string" && accountId.trim().length > 0
      ? accountId.trim()
      : undefined;

    const candidates = allOpenAiAccounts.filter((account) => {
      if (account.authType !== "oauth_bearer") {
        return false;
      }

      if (typeof account.refreshToken !== "string" || account.refreshToken.trim().length === 0) {
        return false;
      }

      return normalizedAccountId === undefined || account.accountId === normalizedAccountId;
    });

    for (const account of candidates) {
      tokenRefreshManager.clearFailures(account);
    }

    const results = await tokenRefreshManager.refreshBatch(candidates);
    const refreshedCount = results.filter((result): result is ProviderCredential => result !== null).length;

    return {
      totalAccounts: candidates.length,
      refreshedCount,
      failedCount: candidates.length - refreshedCount,
    };
  }

  tokenRefreshManager.startBackgroundRefresh(() => {
    const expiring = keyPool.getExpiringAccounts(config.oauthRefreshProactiveWindowMs);
    const expired = keyPool.getAllExpiredWithRefreshTokens();
    return [...expired, ...expiring];
  });

  const ollamaCatalogRoutes = buildOllamaCatalogRoutes(config);
  const providerCatalogRoutes = buildProviderRoutes(config, false, true)
    .filter((route) => route.providerId !== "factory" || !config.disabledProviderIds.includes("factory"));
  const providerCatalogStore = new ProviderCatalogStore(
    config,
    keyPool,
    providerCatalogRoutes,
    ollamaCatalogRoutes,
  );

  async function getResolvedModelCatalog(forceRefresh = false): Promise<ResolvedModelCatalog> {
    const resolved = await providerCatalogStore.getCatalog(forceRefresh);
    return resolved.catalog;
  }

  function shouldRejectModelFromProviderCatalog(
    providerRoutes: readonly ProviderRoute[],
    routedModel: string,
    catalogBundle: ResolvedCatalogWithPreferences,
  ): boolean {
    let sawCatalogForCandidate = false;

    for (const route of providerRoutes) {
      const entry = catalogBundle.providerCatalogs[route.providerId];
      if (!entry) {
        return false;
      }

      sawCatalogForCandidate = true;
      if (entry.modelIds.includes(routedModel)) {
        return false;
      }
    }

    return sawCatalogForCandidate;
  }

  async function injectNativeBridge(
    url: string,
    payload: Record<string, unknown>,
    requestHeaders: Record<string, unknown>,
  ) {
    return app.inject({
      method: "POST",
      url,
      headers: {
        ...applyNativeOllamaAuth({ headers: requestHeaders } as never, config),
      },
      payload,
    });
  }

  if (config.allowUnauthenticated) {
    app.log.warn("proxy auth disabled via PROXY_ALLOW_UNAUTHENTICATED=true");
  }

  app.decorateRequest("openHaxAuth", null);

  app.addHook("onRequest", async (request, reply) => {
    const origin = request.headers.origin;
    reply.header("Access-Control-Allow-Origin", origin ?? "*");
    reply.header("Vary", "Origin");
    reply.header("Access-Control-Allow-Headers", "Authorization, Content-Type, Accept, X-Requested-With, Cookie");
    reply.header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");

    if (request.method === "OPTIONS") {
      return;
    }

    const rawPath = (request.raw.url ?? request.url).split("?", 1)[0] ?? request.url;
    const allowUnauthenticatedRoute = rawPath === "/health" || rawPath === "/api/ui/credentials/openai/oauth/browser/callback"
      || rawPath === "/auth/callback" || rawPath === "/auth/factory/callback"
      || rawPath === config.githubOAuthCallbackPath || rawPath === "/auth/login"
      || rawPath === "/auth/refresh" || rawPath === "/auth/logout";
    const allowUiSessionAuth = rawPath.startsWith("/api/ui/") || rawPath.startsWith("/auth/");

    if (allowUnauthenticatedRoute) {
      return;
    }

    const resolvedAuth = await resolveRequestAuth({
      allowUnauthenticated: config.allowUnauthenticated,
      proxyAuthToken: config.proxyAuthToken,
      authorization: request.headers.authorization,
      cookieToken: readCookieToken(request.headers.cookie, PROXY_AUTH_COOKIE_NAME),
      oauthAccessToken: allowUiSessionAuth ? readCookieToken(request.headers.cookie, "proxy_auth") : undefined,
      resolveTenantApiKey: sqlCredentialStore
        ? async (token) => sqlCredentialStore!.resolveTenantApiKey(token, config.proxyTokenPepper)
        : undefined,
      resolveUiSession: allowUiSessionAuth && sqlCredentialStore && sqlAuthPersistence
        ? async (token) => {
          const accessToken = await sqlAuthPersistence.getAccessToken(token);
          if (!accessToken) {
            return undefined;
          }

          const activeTenantId = typeof accessToken.extra?.activeTenantId === "string"
            ? accessToken.extra.activeTenantId
            : undefined;
          return sqlCredentialStore.resolveUiSession(accessToken.subject, activeTenantId);
        }
        : undefined,
    });

    if (!resolvedAuth) {
      sendOpenAiError(reply, 401, "Unauthorized", "invalid_request_error", "unauthorized");
      return;
    }

    (request as any).openHaxAuth = resolvedAuth;

    const enforceTenantQuotaRoute = request.method === "POST" && (
      rawPath === "/v1/chat/completions"
      || rawPath === "/v1/responses"
      || rawPath === "/v1/images/generations"
      || rawPath === "/v1/embeddings"
    );

    if (enforceTenantQuotaRoute && resolvedAuth.kind !== "unauthenticated") {
      const tenantId = resolvedAuth.tenantId ?? DEFAULT_TENANT_ID;
      const tenantSettings = await proxySettingsStore.getForTenant(tenantId);
      if (typeof tenantSettings.requestsPerMinute === "number" && tenantSettings.requestsPerMinute > 0) {
        const now = Date.now();
        const recentRequestCount = requestLogStore.countRequestsSince(now - 60_000, { tenantId });
        if (recentRequestCount >= tenantSettings.requestsPerMinute) {
          reply.header("retry-after", 60);
          sendOpenAiError(
            reply,
            429,
            `Tenant request quota exceeded for ${tenantId}. Allowed requests per minute: ${tenantSettings.requestsPerMinute}.`,
            "rate_limit_error",
            "tenant_quota_exceeded",
          );
          return;
        }
      }
    }

    if (
      resolvedAuth.kind === "tenant_api_key"
      && sqlCredentialStore
      && request.method === "POST"
      && rawPath.startsWith("/v1/")
      && resolvedAuth.tenantId
      && resolvedAuth.keyId
    ) {
      await sqlCredentialStore.touchTenantApiKeyLastUsed(resolvedAuth.tenantId, resolvedAuth.keyId);
    }
  });

  // Attach a telemetry span to each request
  app.decorateRequest("_otelSpan", null);

  app.addHook("onRequest", async (request) => {
    if (request.method === "OPTIONS") return;
    const span = getTelemetry().startSpan("http.request", {
      "http.method": request.method,
      "http.path": (request.raw.url ?? request.url).split("?")[0],
    });
    (request as any)._otelSpan = span;
  });

  app.addHook("onResponse", async (request, reply) => {
    const span = (request as any)._otelSpan as TelemetrySpan | null;
    if (!span) return;
    span.setAttribute("http.status_code", reply.statusCode);
    if (reply.statusCode >= 400) span.setStatus("error", `HTTP ${reply.statusCode}`);
    else span.setStatus("ok");
    span.end();
  });

  app.options("/", async (_request, reply) => {
    reply.code(204).send();
  });

  app.options("/health", async (_request, reply) => {
    reply.code(204).send();
  });

  app.options("/v1/chat/completions", async (_request, reply) => {
    reply.code(204).send();
  });

  app.options("/v1/responses", async (_request, reply) => {
    reply.code(204).send();
  });

  app.options("/v1/images/generations", async (_request, reply) => {
    reply.code(204).send();
  });

  app.options("/v1/embeddings", async (_request, reply) => {
    reply.code(204).send();
  });

  app.options("/v1/models", async (_request, reply) => {
    reply.code(204).send();
  });

  app.options("/v1/models/:model", async (_request, reply) => {
    reply.code(204).send();
  });

  app.options("/api/chat", async (_request, reply) => {
    reply.code(204).send();
  });

  app.options("/api/generate", async (_request, reply) => {
    reply.code(204).send();
  });

  app.options("/api/embed", async (_request, reply) => {
    reply.code(204).send();
  });

  app.options("/api/embeddings", async (_request, reply) => {
    reply.code(204).send();
  });

  app.options("/api/tags", async (_request, reply) => {
    reply.code(204).send();
  });

  app.options("/api/ui", async (_request, reply) => {
    reply.code(204).send();
  });

  app.options("/api/ui/*", async (_request, reply) => {
    reply.code(204).send();
  });

  app.get("/health", async () => {
    let keyPoolStatus: unknown;
    let keyPoolProviders: unknown;
    try {
      const status = await keyPool.getStatus(config.upstreamProviderId);
      keyPoolStatus = {
        providerId: status.providerId,
        authType: status.authType,
        totalKeys: status.totalAccounts,
        availableKeys: status.availableAccounts,
        cooldownKeys: status.cooldownAccounts,
        nextReadyInMs: status.nextReadyInMs
      };

      const allStatuses = await keyPool.getAllStatuses();
      keyPoolProviders = Object.fromEntries(
        Object.entries(allStatuses).map(([providerId, providerStatus]) => [
          providerId,
          {
            providerId: providerStatus.providerId,
            authType: providerStatus.authType,
            totalAccounts: providerStatus.totalAccounts,
            availableAccounts: providerStatus.availableAccounts,
            cooldownAccounts: providerStatus.cooldownAccounts,
            nextReadyInMs: providerStatus.nextReadyInMs
          }
        ])
      );
    } catch (error) {
      keyPoolStatus = { error: toErrorMessage(error) };
      keyPoolProviders = {};
    }

    return {
      ok: true,
      service: "open-hax-openai-proxy",
      authMode: config.proxyAuthToken ? "token" : "unauthenticated",
      keyPool: keyPoolStatus,
      keyPoolProviders
    };
  });

  app.get("/v1/models", async (_request, reply) => {
    const catalog = await getResolvedModelCatalog();
    reply.send({
      object: "list",
      data: catalog.modelIds.map(toOpenAiModel)
    });
  });

  app.get<{ Params: { model: string } }>("/v1/models/:model", async (request, reply) => {
    const catalog = await getResolvedModelCatalog();
    const model = catalog.modelIds.find((entry) => entry === request.params.model);
    if (!model) {
      sendOpenAiError(reply, 404, `Model not found: ${request.params.model}`, "invalid_request_error", "model_not_found");
      return;
    }

    reply.send(toOpenAiModel(model));
  });

  app.get("/api/tags", async (_request, reply) => {
    const catalog = await getResolvedModelCatalog();
    reply.send(modelIdsToNativeTags(catalog.modelIds));
  });

  app.post<{ Body: WebSearchToolRequest }>("/api/tools/websearch", async (request, reply) => {
    if (!isRecord(request.body)) {
      reply.code(400).send({ error: "invalid_body" });
      return;
    }

    const query = typeof request.body.query === "string" ? request.body.query.trim() : "";
    if (query.length === 0) {
      reply.code(400).send({ error: "query_required" });
      return;
    }

    const rawNumResults = typeof request.body.numResults === "number" ? request.body.numResults : Number.NaN;
    const numResults = Number.isFinite(rawNumResults)
      ? Math.max(1, Math.min(20, Math.trunc(rawNumResults)))
      : 8;

    const searchContextSize = typeof request.body.searchContextSize === "string"
      ? request.body.searchContextSize.trim().toLowerCase()
      : "";
    const contextSize = (searchContextSize === "low" || searchContextSize === "medium" || searchContextSize === "high")
      ? searchContextSize
      : undefined;

    const allowedDomains = Array.isArray(request.body.allowedDomains)
      ? request.body.allowedDomains
        .filter((entry): entry is string => typeof entry === "string")
        .map((entry) => entry.trim())
        .filter((entry) => entry.length > 0)
        .slice(0, 50)
      : [];

    const requestedModel = typeof request.body.model === "string" ? request.body.model.trim() : "";

    const fallbackModel = process.env.OPEN_HAX_WEBSEARCH_FALLBACK_MODEL?.trim() || "gpt-5.2";
    const candidateModels = [requestedModel, fallbackModel]
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0);
    const uniqueModels: string[] = [];
    for (const entry of candidateModels) {
      if (!uniqueModels.includes(entry)) {
        uniqueModels.push(entry);
      }
    }

    const authHeaders: Record<string, string> = {
      "content-type": "application/json",
      ...(config.proxyAuthToken ? { authorization: `Bearer ${config.proxyAuthToken}` } : {}),
    };

    const baseTool: Record<string, unknown> = {
      type: "web_search",
      external_web_access: true,
      ...(contextSize ? { search_context_size: contextSize } : {}),
    };

    const buildUserText = (withDomainsHint: boolean) => {
      const domainHint = withDomainsHint && allowedDomains.length > 0
        ? `\n\nRestrict sources to these domains when possible:\n${allowedDomains.map((d) => `- ${d}`).join("\n")}`
        : "";
      return [
        `Query: ${query}`,
        `Return up to ${numResults} results as a Markdown list. Each bullet must include a Markdown link and a 1-2 sentence snippet.`,
        `Do not fabricate URLs; every link must be backed by web_search citations.`,
        domainHint,
      ].join("\n");
    };

    const attemptPayload = async (model: string, includeDomainsInTool: boolean) => {
      const tool = includeDomainsInTool && allowedDomains.length > 0
        ? { ...baseTool, allowed_domains: allowedDomains }
        : baseTool;

      return app.inject({
        method: "POST",
        url: "/v1/responses",
        headers: authHeaders,
        payload: {
          model,
          instructions: "You are a web search helper. Use the web_search tool to gather sources and answer with citations.",
          input: [
            {
              role: "user",
              content: [{ type: "input_text", text: buildUserText(!includeDomainsInTool) }],
            },
          ],
          tools: [tool],
          tool_choice: "auto",
          store: false,
          stream: false,
        },
      });
    };

    let lastErrorPayload: unknown;

    for (const model of uniqueModels) {
      // Try the most structured tool payload first; fall back to hint-only if upstream rejects unknown fields.
      for (const includeDomainsInTool of [true, false]) {
        const injected = await attemptPayload(model, includeDomainsInTool);
        if (injected.statusCode !== 200) {
          lastErrorPayload = parseJsonIfPossible(injected.body) ?? injected.body;
          continue;
        }

        const json = parseJsonIfPossible(injected.body);
        const extracted = extractResponseTextAndUrlCitations(json);

        const output = extracted.text;
        const sources = extracted.citations.length > 0
          ? extracted.citations
          : extractMarkdownLinks(output);

        reply.send({
          output,
          sources: sources.slice(0, numResults),
          responseId: extracted.responseId,
          model,
        });
        return;
      }
    }

    reply.code(502).send({
      error: "websearch_failed",
      details: lastErrorPayload,
    });
  });

  app.post<{ Body: ChatCompletionRequest }>("/v1/chat/completions", async (request, reply) => {
    if (!isRecord(request.body)) {
      sendOpenAiError(reply, 400, "Request body must be a JSON object", "invalid_request_error", "invalid_body");
      return;
    }

    const proxySettings = await proxySettingsStore.getForTenant(
      ((request as { readonly openHaxAuth?: { readonly tenantId?: string } }).openHaxAuth?.tenantId) ?? DEFAULT_TENANT_ID,
    );
    const requestBody = proxySettings.fastMode
      ? {
        open_hax: {
          fast_mode: true,
          ...(isRecord(request.body.open_hax) ? request.body.open_hax : {}),
        },
        ...request.body,
      }
      : request.body;

    if (proxySettings.fastMode) {
      reply.header("x-open-hax-fast-mode", "priority");
    }

    const requestedModelInput = typeof requestBody.model === "string" ? requestBody.model : "";
    const explicitlyBlockedProviderId = resolveExplicitTenantProviderId(requestedModelInput, proxySettings);
    if (explicitlyBlockedProviderId) {
      sendOpenAiError(reply, 403, `Provider is disabled for this tenant: ${explicitlyBlockedProviderId}`, "invalid_request_error", "provider_not_allowed");
      return;
    }

    let routingModelInput = requestedModelInput;
    let resolvedModelCatalog: ResolvedModelCatalog | null = null;
    try {
      const catalogBundle = await providerCatalogStore.getCatalog();
      const catalog = catalogBundle.catalog;
      resolvedModelCatalog = catalog;
      const disabledModelSet = new Set(catalogBundle.preferences.disabled);
      if (disabledModelSet.has(requestedModelInput) || disabledModelSet.has(catalog.aliasTargets[requestedModelInput] ?? "")) {
        sendOpenAiError(reply, 403, `Model is disabled: ${requestedModelInput}`, "invalid_request_error", "model_disabled");
        return;
      }
      const aliasTarget = catalog.aliasTargets[requestedModelInput];
      if (typeof aliasTarget === "string" && aliasTarget.length > 0) {
        routingModelInput = aliasTarget;
        reply.header("x-open-hax-model-alias", `${requestedModelInput}->${aliasTarget}`);
      }
    } catch (error) {
      request.log.warn({ error: toErrorMessage(error) }, "failed to resolve dynamic model aliases; using requested model as-is");
    }

    const { strategy, context } = selectProviderStrategy(
      config,
      request.headers,
      requestBody,
      requestedModelInput,
      routingModelInput,
      (request as { readonly openHaxAuth?: { readonly kind: "legacy_admin" | "tenant_api_key" | "ui_session" | "unauthenticated"; readonly tenantId?: string; readonly keyId?: string; readonly subject?: string } }).openHaxAuth,
    );
    reply.header("x-open-hax-upstream-mode", strategy.mode);

    let providerRoutes: ProviderRoute[];
    if (context.factoryPrefixed) {
      const factoryBaseUrl = config.upstreamProviderBaseUrls["factory"] ?? "https://api.factory.ai";
      providerRoutes = config.disabledProviderIds.includes("factory")
        ? []
        : [{ providerId: "factory", baseUrl: factoryBaseUrl }];
    } else {
      providerRoutes = buildProviderRoutes(
        config,
        context.openAiPrefixed,
        !context.openAiPrefixed && strategy.mode === "responses"
      );
      if (!context.openAiPrefixed && resolvedModelCatalog) {
        providerRoutes = resolveProviderRoutesForModel(providerRoutes, context.routedModel, resolvedModelCatalog);
      }
    }
    providerRoutes = filterTenantProviderRoutes(providerRoutes, proxySettings);
    providerRoutes = orderProviderRoutesByPolicy(policyEngine, providerRoutes, context.requestedModelInput, context.routedModel, {
      openAiPrefixed: context.openAiPrefixed,
      localOllama: context.localOllama,
      explicitOllama: context.explicitOllama,
    });

    if (providerRoutes.length === 0) {
      sendOpenAiError(reply, 403, "No upstream providers are allowed for this tenant and request.", "invalid_request_error", "provider_not_allowed");
      return;
    }

    try {
      const catalogBundle = await providerCatalogStore.getCatalog();
      const disabledSet = new Set(catalogBundle.preferences.disabled);
      if (disabledSet.has(context.routedModel)) {
        sendOpenAiError(reply, 403, `Model is disabled: ${context.routedModel}`, "invalid_request_error", "model_disabled");
        return;
      }

      if (shouldRejectModelFromProviderCatalog(providerRoutes, context.routedModel, catalogBundle)) {
        sendOpenAiError(reply, 404, `Model not found: ${context.routedModel}`, "invalid_request_error", "model_not_found");
        return;
      }
    } catch (error) {
      request.log.warn({ error: toErrorMessage(error) }, "failed to verify provider model catalog; continuing without gating");
    }

    let payload: ReturnType<typeof strategy.buildPayload>;
    try {
      payload = strategy.buildPayload(context);
    } catch (error) {
      sendOpenAiError(reply, 400, toErrorMessage(error), "invalid_request_error", "invalid_provider_options");
      return;
    }

    if (strategy.mode === "ollama_chat" || strategy.mode === "local_ollama_chat") {
      const candidateRequestBody = payload.upstreamPayload;
      if (isRecord(candidateRequestBody) && !requestHasExplicitNumCtx(requestBody)) {
        const budget = await ensureOllamaContextFits(config.ollamaBaseUrl, candidateRequestBody, Math.min(config.requestTimeoutMs, 30_000));
        if (budget && budget.requiredContextTokens > budget.availableContextTokens) {
          sendOpenAiError(
            reply,
            400,
            `Request exceeds model context window for ${budget.model}. Estimated input tokens: ${budget.estimatedInputTokens}, requested output tokens: ${budget.requestedOutputTokens}, required total: ${budget.requiredContextTokens}, available: ${budget.availableContextTokens}. Reduce input size or request a larger context/model.`,
            "invalid_request_error",
            "ollama_context_overflow"
          );
          return;
        }
      }
    }

    if (strategy.isLocal) {
      if (!tenantProviderAllowed(proxySettings, "ollama")) {
        sendOpenAiError(reply, 403, "Provider is disabled for this tenant: ollama", "invalid_request_error", "provider_not_allowed");
        return;
      }

      await executeLocalStrategy(strategy, reply, requestLogStore, context, payload);
      return;
    }

    if (providerRoutes.length === 0) {
      sendOpenAiError(reply, 403, "No upstream providers are allowed for this tenant and request.", "invalid_request_error", "provider_not_allowed");
      return;
    }

    for (const providerId of new Set(providerRoutes.map((route) => route.providerId))) {
      await ensureFreshAccounts(providerId);
    }

    const availability = await inspectProviderAvailability(keyPool, providerRoutes);
    const promptCacheKey = extractPromptCacheKey(requestBody);
    const execution = await executeProviderFallback(
      strategy,
      reply,
      requestLogStore,
      promptAffinityStore,
      keyPool,
      providerRoutes,
      context,
      payload,
      promptCacheKey,
      refreshExpiredOAuthAccount,
      policyEngine,
      accountHealthStore,
      eventStore,
    );

    if (execution.handled) {
      return;
    }

    if (execution.candidateCount === 0) {
      const retryInMs = await minMsUntilAnyProviderKeyReady(keyPool, providerRoutes);
      if (retryInMs > 0) {
        reply.header("retry-after", Math.ceil(retryInMs / 1000));
      }

      if (!availability.sawConfiguredProvider) {
        sendOpenAiError(reply, 500, "Proxy is missing upstream account configuration", "server_error", "keys_unavailable");
        return;
      }

      sendOpenAiError(
        reply,
        429,
        "All upstream accounts are currently rate-limited. Retry after the cooldown window.",
        "rate_limit_error",
        "all_keys_rate_limited"
      );
      return;
    }

    const { summary } = execution;

    if (summary.sawUpstreamInvalidRequest) {
      app.log.warn({ providerRoutes, attempts: summary.attempts, upstreamMode: strategy.mode }, "all attempts exhausted due to upstream invalid-request responses");
      sendOpenAiError(
        reply,
        400,
        "No upstream account accepted the request payload. Check model availability and request parameters.",
        "invalid_request_error",
        "upstream_rejected_request"
      );
      return;
    }

    if (summary.sawRateLimit) {
      const retryInMs = await minMsUntilAnyProviderKeyReady(keyPool, providerRoutes);
      if (retryInMs > 0) {
        reply.header("retry-after", Math.ceil(retryInMs / 1000));
      }

      app.log.warn({ providerRoutes, attempts: summary.attempts, upstreamMode: strategy.mode }, "all attempts exhausted due to upstream rate limits");
      sendOpenAiError(
        reply,
        429,
        "No upstream account succeeded. Accounts may be rate-limited, quota-exhausted, or have outstanding balances.",
        "rate_limit_error",
        "no_available_key"
      );
      return;
    }

    if (summary.sawUpstreamServerError) {
      app.log.warn({ providerRoutes, attempts: summary.attempts, upstreamMode: strategy.mode }, "all attempts exhausted due to upstream server errors");
      sendOpenAiError(
        reply,
        502,
        "Upstream returned transient server errors across all available accounts.",
        "server_error",
        "upstream_server_error"
      );
      return;
    }

    if (summary.sawModelNotFound && !summary.sawRequestError) {
      app.log.warn({ providerRoutes, attempts: summary.attempts, upstreamMode: strategy.mode }, "all attempts exhausted due to model-not-found responses");
      sendOpenAiError(
        reply,
        404,
        `Model not found across available upstream providers: ${context.routedModel}`,
        "invalid_request_error",
        "model_not_found"
      );
      return;
    }

    const message = summary.sawRequestError
      ? "All upstream attempts failed due to network/transport errors."
      : "Upstream rejected the request with no successful fallback.";

    app.log.error({ providerRoutes, attempts: summary.attempts, upstreamMode: strategy.mode, sawRequestError: summary.sawRequestError }, "all upstream attempts exhausted");
    sendOpenAiError(reply, 502, message, "server_error", "upstream_unavailable");
  });

  app.post<{ Body: Record<string, unknown> }>("/v1/responses", async (request, reply) => {
    if (!isRecord(request.body)) {
      sendOpenAiError(reply, 400, "Request body must be a JSON object", "invalid_request_error", "invalid_body");
      return;
    }

    const tenantSettings = await proxySettingsStore.getForTenant(
      ((request as { readonly openHaxAuth?: { readonly tenantId?: string } }).openHaxAuth?.tenantId) ?? DEFAULT_TENANT_ID,
    );
    const requestBody = request.body;
    const promptCacheKey = extractPromptCacheKey(requestBody);

    app.log.info({
      responsesBody: summarizeResponsesRequestBody(requestBody),
      hasPromptCacheKey: Boolean(promptCacheKey),
      promptCacheKey: promptCacheKey ? hashPromptCacheKey(promptCacheKey) : undefined,
    }, "responses passthrough: incoming body");

    const requestedModelInput = typeof requestBody.model === "string" ? requestBody.model : "";
    if (requestedModelInput.length === 0) {
      sendOpenAiError(reply, 400, "Missing required field: model", "invalid_request_error", "missing_model");
      return;
    }

    const explicitlyBlockedProviderId = resolveExplicitTenantProviderId(requestedModelInput, tenantSettings);
    if (explicitlyBlockedProviderId) {
      sendOpenAiError(reply, 403, `Provider is disabled for this tenant: ${explicitlyBlockedProviderId}`, "invalid_request_error", "provider_not_allowed");
      return;
    }

    let routingModelInput = requestedModelInput;
    try {
      const catalogBundle = await providerCatalogStore.getCatalog();
      const catalog = catalogBundle.catalog;
      const disabledModelSet = new Set(catalogBundle.preferences.disabled);
      if (disabledModelSet.has(requestedModelInput) || disabledModelSet.has(catalog.aliasTargets[requestedModelInput] ?? "")) {
        sendOpenAiError(reply, 403, `Model is disabled: ${requestedModelInput}`, "invalid_request_error", "model_disabled");
        return;
      }
      const aliasTarget = catalog.aliasTargets[requestedModelInput];
      if (typeof aliasTarget === "string" && aliasTarget.length > 0) {
        routingModelInput = aliasTarget;
        reply.header("x-open-hax-model-alias", `${requestedModelInput}->${aliasTarget}`);
      }
    } catch (error) {
      request.log.warn({ error: toErrorMessage(error) }, "failed to resolve dynamic model aliases for /v1/responses; using requested model as-is");
    }

    const { strategy, context } = buildResponsesPassthroughContext(
      config,
      request.headers,
      requestBody,
      requestedModelInput,
      routingModelInput,
      (request as { readonly openHaxAuth?: { readonly kind: "legacy_admin" | "tenant_api_key" | "ui_session" | "unauthenticated"; readonly tenantId?: string; readonly keyId?: string; readonly subject?: string } }).openHaxAuth,
    );
    reply.header("x-open-hax-upstream-mode", strategy.mode);

    let providerRoutes: ProviderRoute[];
    if (context.factoryPrefixed) {
      const factoryBaseUrl = config.upstreamProviderBaseUrls["factory"] ?? "https://api.factory.ai";
      providerRoutes = config.disabledProviderIds.includes("factory")
        ? []
        : [{ providerId: "factory", baseUrl: factoryBaseUrl }];
    } else {
      providerRoutes = buildProviderRoutes(config, context.openAiPrefixed, true);
    }

    providerRoutes = filterResponsesApiRoutes(providerRoutes, config.openaiProviderId);
    providerRoutes = filterTenantProviderRoutes(providerRoutes, tenantSettings);
    providerRoutes = orderProviderRoutesByPolicy(policyEngine, providerRoutes, context.requestedModelInput, context.routedModel, {
      openAiPrefixed: context.openAiPrefixed,
      localOllama: false,
      explicitOllama: false,
    });

    if (providerRoutes.length === 0) {
      sendOpenAiError(reply, 403, "No upstream providers are allowed for this tenant and request.", "invalid_request_error", "provider_not_allowed");
      return;
    }

    try {
      const catalogBundle = await providerCatalogStore.getCatalog();
      const disabledSet = new Set(catalogBundle.preferences.disabled);
      if (disabledSet.has(context.routedModel)) {
        sendOpenAiError(reply, 403, `Model is disabled: ${context.routedModel}`, "invalid_request_error", "model_disabled");
        return;
      }

      if (shouldRejectModelFromProviderCatalog(providerRoutes, context.routedModel, catalogBundle)) {
        sendOpenAiError(reply, 404, `Model not found: ${context.routedModel}`, "invalid_request_error", "model_not_found");
        return;
      }
    } catch (error) {
      request.log.warn({ error: toErrorMessage(error) }, "failed to verify provider model catalog for /v1/responses; continuing without gating");
    }

    let payload: ReturnType<typeof strategy.buildPayload>;
    try {
      payload = strategy.buildPayload(context);
    } catch (error) {
      sendOpenAiError(reply, 400, toErrorMessage(error), "invalid_request_error", "invalid_provider_options");
      return;
    }

    if (providerRoutes.length === 0) {
      sendOpenAiError(reply, 403, "No upstream providers are allowed for this tenant and request.", "invalid_request_error", "provider_not_allowed");
      return;
    }

    for (const providerId of new Set(providerRoutes.map((route) => route.providerId))) {
      await ensureFreshAccounts(providerId);
    }

    const availability = await inspectProviderAvailability(keyPool, providerRoutes, promptCacheKey);
    const execution = await executeProviderFallback(
      strategy,
      reply,
      requestLogStore,
      promptAffinityStore,
      keyPool,
      providerRoutes,
      context,
      payload,
      availability.prompt_cache_key,
      refreshExpiredOAuthAccount,
      policyEngine,
      accountHealthStore,
      eventStore,
    );

    if (execution.handled) {
      return;
    }

    if (execution.candidateCount === 0) {
      const retryInMs = await minMsUntilAnyProviderKeyReady(keyPool, providerRoutes);
      if (retryInMs > 0) {
        reply.header("retry-after", Math.ceil(retryInMs / 1000));
      }

      if (!availability.sawConfiguredProvider) {
        sendOpenAiError(reply, 500, "Proxy is missing upstream account configuration for Responses API providers", "server_error", "keys_unavailable");
        return;
      }

      sendOpenAiError(
        reply,
        429,
        "All upstream accounts are currently rate-limited. Retry after the cooldown window.",
        "rate_limit_error",
        "all_keys_rate_limited"
      );
      return;
    }

    const { summary } = execution;

    if (summary.sawUpstreamInvalidRequest) {
      app.log.warn({ providerRoutes, attempts: summary.attempts, upstreamMode: strategy.mode }, "responses passthrough: all attempts exhausted due to upstream invalid-request responses");
      sendOpenAiError(
        reply,
        400,
        "No upstream account accepted the request payload. Check model availability and request parameters.",
        "invalid_request_error",
        "upstream_rejected_request"
      );
      return;
    }

    if (summary.sawRateLimit) {
      const retryInMs = await minMsUntilAnyProviderKeyReady(keyPool, providerRoutes);
      if (retryInMs > 0) {
        reply.header("retry-after", Math.ceil(retryInMs / 1000));
      }

      app.log.warn({ providerRoutes, attempts: summary.attempts, upstreamMode: strategy.mode }, "responses passthrough: all attempts exhausted due to upstream rate limits");
      sendOpenAiError(
        reply,
        429,
        "No upstream account succeeded. Accounts may be rate-limited, quota-exhausted, or have outstanding balances.",
        "rate_limit_error",
        "no_available_key"
      );
      return;
    }

    if (summary.sawUpstreamServerError) {
      app.log.warn({ providerRoutes, attempts: summary.attempts, upstreamMode: strategy.mode }, "responses passthrough: all attempts exhausted due to upstream server errors");
      sendOpenAiError(
        reply,
        502,
        "Upstream returned transient server errors across all available accounts.",
        "server_error",
        "upstream_server_error"
      );
      return;
    }

    if (summary.sawModelNotFound && !summary.sawRequestError) {
      app.log.warn({ providerRoutes, attempts: summary.attempts, upstreamMode: strategy.mode }, "responses passthrough: all attempts exhausted due to model-not-found responses");
      sendOpenAiError(
        reply,
        404,
        `Model not found across available Responses API providers: ${context.routedModel}`,
        "invalid_request_error",
        "model_not_found"
      );
      return;
    }

    const message = summary.sawRequestError
      ? "All upstream attempts failed due to network/transport errors."
      : "Upstream rejected the request with no successful fallback.";

    app.log.error({ providerRoutes, attempts: summary.attempts, upstreamMode: strategy.mode, sawRequestError: summary.sawRequestError }, "responses passthrough: all upstream attempts exhausted");
    sendOpenAiError(reply, 502, message, "server_error", "upstream_unavailable");
  });

  app.post<{ Body: Record<string, unknown> }>("/v1/images/generations", async (request, reply) => {
    if (!isRecord(request.body)) {
      sendOpenAiError(reply, 400, "Request body must be a JSON object", "invalid_request_error", "invalid_body");
      return;
    }

    const tenantSettings = await proxySettingsStore.getForTenant(
      ((request as { readonly openHaxAuth?: { readonly tenantId?: string } }).openHaxAuth?.tenantId) ?? DEFAULT_TENANT_ID,
    );
    const requestBody = request.body;
    const model = typeof requestBody.model === "string" ? requestBody.model : "";
    if (model.length === 0) {
      sendOpenAiError(reply, 400, "Missing required field: model", "invalid_request_error", "missing_model");
      return;
    }

    const explicitlyBlockedProviderId = resolveExplicitTenantProviderId(model, tenantSettings);
    if (explicitlyBlockedProviderId) {
      sendOpenAiError(reply, 403, `Provider is disabled for this tenant: ${explicitlyBlockedProviderId}`, "invalid_request_error", "provider_not_allowed");
      return;
    }

    const { strategy, context } = buildImagesPassthroughContext(
      config,
      request.headers,
      requestBody,
      model,
      (request as { readonly openHaxAuth?: { readonly kind: "legacy_admin" | "tenant_api_key" | "ui_session" | "unauthenticated"; readonly tenantId?: string; readonly keyId?: string; readonly subject?: string } }).openHaxAuth,
    );
    reply.header("x-open-hax-upstream-mode", strategy.mode);

    let payload: ReturnType<typeof strategy.buildPayload>;
    try {
      payload = strategy.buildPayload(context);
    } catch (error) {
      sendOpenAiError(reply, 400, toErrorMessage(error), "invalid_request_error", "invalid_provider_options");
      return;
    }

    let providerRoutes = filterImagesApiRoutes(
      buildProviderRoutes(config, context.openAiPrefixed, true),
      config.openaiProviderId,
    );
    providerRoutes = filterTenantProviderRoutes(providerRoutes, tenantSettings);
    providerRoutes = orderProviderRoutesByPolicy(policyEngine, providerRoutes, context.requestedModelInput, context.routedModel, {
      openAiPrefixed: context.openAiPrefixed,
      localOllama: false,
      explicitOllama: false,
    });

    if (providerRoutes.length === 0) {
      sendOpenAiError(reply, 403, "No upstream providers are allowed for this tenant and request.", "invalid_request_error", "provider_not_allowed");
      return;
    }

    for (const providerId of new Set(providerRoutes.map((route) => route.providerId))) {
      await ensureFreshAccounts(providerId);
    }

    const availability = await inspectProviderAvailability(keyPool, providerRoutes);
    const execution = await executeProviderFallback(
      strategy,
      reply,
      requestLogStore,
      promptAffinityStore,
      keyPool,
      providerRoutes,
      context,
      payload,
      undefined,
      refreshExpiredOAuthAccount,
      policyEngine,
      accountHealthStore,
      eventStore,
    );

    if (execution.handled) {
      return;
    }

    if (execution.candidateCount === 0) {
      const retryInMs = await minMsUntilAnyProviderKeyReady(keyPool, providerRoutes);
      if (retryInMs > 0) {
        reply.header("retry-after", Math.ceil(retryInMs / 1000));
      }

      if (!availability.sawConfiguredProvider) {
        sendOpenAiError(reply, 500, "Proxy is missing upstream account configuration for image generation providers", "server_error", "keys_unavailable");
        return;
      }

      sendOpenAiError(
        reply,
        429,
        "All upstream accounts are currently rate-limited. Retry after the cooldown window.",
        "rate_limit_error",
        "all_keys_rate_limited",
      );
      return;
    }

    const { summary } = execution;

    if (summary.sawUpstreamInvalidRequest) {
      sendOpenAiError(
        reply,
        400,
        "No upstream account accepted the image generation payload. Check model availability and request parameters.",
        "invalid_request_error",
        "upstream_rejected_request",
      );
      return;
    }

    if (summary.sawRateLimit) {
      const retryInMs = await minMsUntilAnyProviderKeyReady(keyPool, providerRoutes);
      if (retryInMs > 0) {
        reply.header("retry-after", Math.ceil(retryInMs / 1000));
      }

      sendOpenAiError(
        reply,
        429,
        "No upstream account succeeded. Accounts may be rate-limited, quota-exhausted, or have outstanding balances.",
        "rate_limit_error",
        "no_available_key",
      );
      return;
    }

    if (summary.sawUpstreamServerError) {
      sendOpenAiError(
        reply,
        502,
        "Upstream returned transient server errors across all available accounts.",
        "server_error",
        "upstream_server_error",
      );
      return;
    }

    if (summary.sawModelNotFound && !summary.sawRequestError) {
      sendOpenAiError(
        reply,
        404,
        `Model not found across available upstream providers: ${context.routedModel}`,
        "invalid_request_error",
        "model_not_found",
      );
      return;
    }

    if (summary.lastUpstreamAuthError) {
      sendOpenAiError(
        reply,
        summary.lastUpstreamAuthError.status,
        summary.lastUpstreamAuthError.message ?? "Upstream rejected the request due to authentication/authorization.",
        "invalid_request_error",
        "upstream_auth_error",
      );
      return;
    }

    const message = summary.sawRequestError
      ? "All upstream attempts failed due to network/transport errors."
      : "Upstream rejected the request with no successful fallback.";

    sendOpenAiError(reply, 502, message, "server_error", "upstream_unavailable");
  });

  app.post<{ Body: Record<string, unknown> }>("/v1/embeddings", async (request, reply) => {
    if (!isRecord(request.body)) {
      sendOpenAiError(reply, 400, "Request body must be a JSON object", "invalid_request_error", "invalid_body");
      return;
    }

    const tenantSettings = await proxySettingsStore.getForTenant(
      ((request as { readonly openHaxAuth?: { readonly tenantId?: string } }).openHaxAuth?.tenantId) ?? DEFAULT_TENANT_ID,
    );
    if (!tenantProviderAllowed(tenantSettings, "ollama")) {
      sendOpenAiError(reply, 403, "Provider is disabled for this tenant: ollama", "invalid_request_error", "provider_not_allowed");
      return;
    }

    const model = typeof request.body.model === "string" ? request.body.model : "";
    const routingState = selectProviderStrategy(
      config,
      request.headers,
      {
        model,
        messages: [{ role: "user", content: "embed" }],
        stream: false,
      },
      model,
      model,
      (request as { readonly openHaxAuth?: { readonly kind: "legacy_admin" | "tenant_api_key" | "ui_session" | "unauthenticated"; readonly tenantId?: string; readonly keyId?: string; readonly subject?: string } }).openHaxAuth,
    ).context;

    const routedModel = routingState.routedModel;
    const upstreamUrl = joinUrl(config.ollamaBaseUrl, "/api/embed");
    const embedBody = nativeEmbedToOpenAiRequest({
      ...request.body,
      model: routedModel,
    });

    let upstreamResponse: Response;
    try {
      upstreamResponse = await fetchWithResponseTimeout(upstreamUrl, {
        method: "POST",
        headers: buildForwardHeaders(request.headers),
        body: JSON.stringify({
          model: embedBody.model,
          input: embedBody.input,
        }),
      }, config.requestTimeoutMs);
    } catch (error) {
      sendOpenAiError(
        reply,
        502,
        `Embedding upstream request failed: ${toErrorMessage(error)}`,
        "server_error",
        "embedding_upstream_unavailable"
      );
      return;
    }

    if (!upstreamResponse.ok) {
      sendOpenAiError(
        reply,
        upstreamResponse.status >= 500 ? 502 : upstreamResponse.status,
        `Embedding upstream rejected the request: ${await upstreamResponse.text()}`,
        upstreamResponse.status >= 500 ? "server_error" : "invalid_request_error",
        "embedding_upstream_error"
      );
      return;
    }

    const upstreamJson = await upstreamResponse.json() as Record<string, unknown>;
    reply.send(nativeEmbedResponseToOpenAiEmbeddings(upstreamJson, embedBody.model));
  });

  app.post<{ Body: Record<string, unknown> }>("/api/chat", async (request, reply) => {
    const bridgeResponse = await injectNativeBridge(
      "/v1/chat/completions",
      nativeChatToOpenAiRequest(isRecord(request.body) ? request.body : {}),
      request.headers,
    );

    copyInjectedResponseHeaders(reply, bridgeResponse.headers as Record<string, string | string[] | undefined>);
    reply.code(bridgeResponse.statusCode);

    const contentType = String(bridgeResponse.headers["content-type"] ?? "application/json");
    const parsed = parseJsonIfPossible(bridgeResponse.body);
    if (contentType.toLowerCase().includes("application/json") && isRecord(parsed) && Array.isArray(parsed["choices"])) {
      reply.send(chatCompletionToNativeChat(parsed));
      return;
    }

    reply.send(bridgeResponse.body);
  });

  app.post<{ Body: Record<string, unknown> }>("/api/generate", async (request, reply) => {
    const bridgeResponse = await injectNativeBridge(
      "/v1/chat/completions",
      nativeGenerateToChatRequest(isRecord(request.body) ? request.body : {}),
      request.headers,
    );

    copyInjectedResponseHeaders(reply, bridgeResponse.headers as Record<string, string | string[] | undefined>);
    reply.code(bridgeResponse.statusCode);

    const contentType = String(bridgeResponse.headers["content-type"] ?? "application/json");
    const parsed = parseJsonIfPossible(bridgeResponse.body);
    if (contentType.toLowerCase().includes("application/json") && isRecord(parsed) && Array.isArray(parsed["choices"])) {
      reply.send(chatCompletionToNativeGenerate(parsed));
      return;
    }

    reply.send(bridgeResponse.body);
  });

  app.post<{ Body: Record<string, unknown> }>("/api/embed", async (request, reply) => {
    const bridgeResponse = await injectNativeBridge(
      "/v1/embeddings",
      nativeEmbedToOpenAiRequest(isRecord(request.body) ? request.body : {}),
      request.headers,
    );

    copyInjectedResponseHeaders(reply, bridgeResponse.headers as Record<string, string | string[] | undefined>);
    reply.code(bridgeResponse.statusCode);

    const contentType = String(bridgeResponse.headers["content-type"] ?? "application/json");
    const parsed = parseJsonIfPossible(bridgeResponse.body);
    if (contentType.toLowerCase().includes("application/json") && isRecord(parsed) && Array.isArray(parsed["data"])) {
      reply.send(openAiEmbeddingsToNativeEmbed(parsed));
      return;
    }

    reply.send(bridgeResponse.body);
  });

  app.post<{ Body: Record<string, unknown> }>("/api/embeddings", async (request, reply) => {
    const bridgeResponse = await injectNativeBridge(
      "/v1/embeddings",
      nativeEmbedToOpenAiRequest(isRecord(request.body) ? request.body : {}),
      request.headers,
    );

    copyInjectedResponseHeaders(reply, bridgeResponse.headers as Record<string, string | string[] | undefined>);
    reply.code(bridgeResponse.statusCode);

    const contentType = String(bridgeResponse.headers["content-type"] ?? "application/json");
    const parsed = parseJsonIfPossible(bridgeResponse.body);
    if (contentType.toLowerCase().includes("application/json") && isRecord(parsed) && Array.isArray(parsed["data"])) {
      reply.send(openAiEmbeddingsToNativeEmbeddings(parsed));
      return;
    }

    reply.send(bridgeResponse.body);
  });

  await registerUiRoutes(app, {
    config,
    keyPool,
    requestLogStore,
    credentialStore: runtimeCredentialStore,
    sqlCredentialStore,
    sqlRequestUsageStore,
    authPersistence: sqlAuthPersistence,
    proxySettingsStore,
    eventStore,
    refreshOpenAiOauthAccounts,
  });

  if (sql && sqlAuthPersistence && sqlGitHubAllowlist && sqlCredentialStore) {
    await registerOAuthRoutes(app, {
      clientId: config.githubOAuthClientId,
      clientSecret: config.githubOAuthClientSecret,
      callbackPath: config.githubOAuthCallbackPath,
      allowedUsers: config.githubAllowedUsers,
      sessionSecret: config.sessionSecret,
      upstreamProviderId: config.upstreamProviderId,
      keysFilePath: config.keysFilePath,
    }, {
      sql,
      authPersistence: sqlAuthPersistence,
      allowlist: sqlGitHubAllowlist,
      credentialStore: sqlCredentialStore,
    });
  }

  app.addHook("onClose", async () => {
    await tokenRefreshManager.stopAndWait();

    if (accountHealthStore) {
      await accountHealthStore.close();
    }
    if (eventStore) {
      await eventStore.close();
    }

    await promptAffinityStore.close();
    await requestLogStore.close();
    await credentialStore.close();
    if (sql) {
      await closeConnection(sql);
    }
  });

  app.setNotFoundHandler(async (request, reply) => {
    const rawUrl = request.raw.url ?? request.url;
    const path = rawUrl.split("?", 1)[0] ?? rawUrl;

    if (path.startsWith("/v1/")) {
      sendOpenAiError(
        reply,
        404,
        `Unsupported endpoint: ${request.method} ${path}. Supported endpoints: ${SUPPORTED_V1_ENDPOINTS.join(", ")}`,
        "invalid_request_error",
        "unsupported_endpoint"
      );
      return;
    }

    if (path.startsWith("/api/")) {
      reply.code(404).send({
        error: `Unsupported endpoint: ${request.method} ${path}. Supported native endpoints: ${SUPPORTED_NATIVE_OLLAMA_ENDPOINTS.join(", ")}`
      });
      return;
    }

    reply.code(404).send({ ok: false, error: "Not Found" });
  });

  return app;
}
