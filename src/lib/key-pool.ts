import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { getTelemetry } from "./telemetry/otel.js";

import { normalizeEpochMilliseconds } from "./epoch.js";
import { loadFactoryAuthV2, parseJwtExpiry } from "./factory-auth.js";

export type ProviderAuthType = "api_key" | "oauth_bearer";

export interface KeyPoolConfig {
  readonly keysFilePath: string;
  readonly reloadIntervalMs: number;
  readonly defaultCooldownMs: number;
  readonly defaultProviderId: string;
  readonly accountStore?: ProviderAccountStore;
  readonly preferAccountStoreProviders?: boolean;
  readonly expiryBufferMs?: number;
}

export interface ProviderCredential {
  readonly providerId: string;
  readonly accountId: string;
  readonly token: string;
  readonly authType: ProviderAuthType;
  readonly chatgptAccountId?: string;
  readonly planType?: string;
  readonly refreshToken?: string;
  readonly expiresAt?: number;
}

export interface KeyPoolStatus {
  readonly providerId: string;
  readonly authType: ProviderAuthType | "unknown";
  readonly totalAccounts: number;
  readonly availableAccounts: number;
  readonly cooldownAccounts: number;
  readonly inFlightAccounts: number;
  readonly nextReadyInMs: number;
}

export interface KeyPoolAccountStatus {
  readonly providerId: string;
  readonly accountId: string;
  readonly authType: ProviderAuthType;
  readonly available: boolean;
  readonly inFlight: boolean;
  readonly cooldownUntil?: number;
  readonly nextReadyInMs: number;
}

interface ProviderState {
  readonly authType: ProviderAuthType;
  readonly accounts: ProviderCredential[];
  nextOffset: number;
}

export interface ProviderAccountStore {
  getAllProviders(): Promise<Map<string, { authType: ProviderAuthType }>>;
  getAllAccounts(): Promise<Map<string, ProviderCredential[]>>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function normalizeProviderId(providerId: string): string {
  const normalized = providerId.trim();
  return normalized.length > 0 ? normalized : "default";
}

function parseAuthType(rawAuthType: unknown): ProviderAuthType {
  const authType = asString(rawAuthType)?.trim().toLowerCase();
  if (!authType || authType === "api_key" || authType === "api-key") {
    return "api_key";
  }

  if (authType === "oauth_bearer" || authType === "oauth-bearer" || authType === "oauth") {
    return "oauth_bearer";
  }

  throw new Error(`Unsupported provider auth type: ${String(rawAuthType)}`);
}

function readTokenFromAccount(account: unknown, authType: ProviderAuthType): string | undefined {
  if (typeof account === "string") {
    const token = account.trim();
    return token.length > 0 ? token : undefined;
  }

  if (!isRecord(account)) {
    return undefined;
  }

  const preferredKeys = authType === "oauth_bearer"
    ? ["access_token", "token", "bearer_token", "api_key", "key"]
    : ["api_key", "key", "token", "access_token"];

  for (const key of preferredKeys) {
    const token = asString(account[key])?.trim();
    if (token && token.length > 0) {
      return token;
    }
  }

  return undefined;
}

function deterministicAccountId(providerId: string, token: string): string {
  const chars = createHash("sha256")
    .update(providerId)
    .update("\0")
    .update(token)
    .digest("hex")
    .slice(0, 32)
    .split("");

  chars[12] = "5";
  const variantNibble = Number.parseInt(chars[16] ?? "0", 16);
  chars[16] = ((variantNibble & 0x3) | 0x8).toString(16);

  const hex = chars.join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

function readAccountId(providerId: string, index: number, account: unknown, token?: string): string {
  if (!isRecord(account)) {
    return token ? deterministicAccountId(providerId, token) : `${providerId}-${index + 1}`;
  }

  const rawId = asString(account["id"]) ??
    asString(account["name"]) ??
    asString(account["account_id"]) ??
    asString(account["label"]);

  const cleaned = rawId?.trim();
  if (cleaned && cleaned.length > 0) {
    return cleaned;
  }

  return token ? deterministicAccountId(providerId, token) : `${providerId}-${index + 1}`;
}

function readChatgptAccountId(account: unknown): string | undefined {
  if (!isRecord(account)) {
    return undefined;
  }

  const rawAccountId = asString(account["chatgpt_account_id"])
    ?? asString(account["chatgptAccountId"])
    ?? asString(account["upstream_account_id"])
    ?? asString(account["upstreamAccountId"]);
  const normalized = rawAccountId?.trim();
  return normalized && normalized.length > 0 ? normalized : undefined;
}

function readPlanType(account: unknown): string | undefined {
  if (!isRecord(account)) {
    return undefined;
  }

  const rawPlanType = asString(account["plan_type"])
    ?? asString(account["planType"]);
  const normalized = rawPlanType?.trim().toLowerCase();
  return normalized && normalized.length > 0 ? normalized : undefined;
}

function readExpiresAt(account: unknown): number | undefined {
  if (!isRecord(account)) {
    return undefined;
  }

  const rawExpiresAt = account["expires_at"] ?? account["expiresAt"];
  return typeof rawExpiresAt === "number" && Number.isFinite(rawExpiresAt)
    ? normalizeEpochMilliseconds(rawExpiresAt)
    : undefined;
}

function readRefreshToken(account: unknown): string | undefined {
  if (!isRecord(account)) {
    return undefined;
  }

  const rawRefreshToken = asString(account["refresh_token"])
    ?? asString(account["refreshToken"]);
  const normalized = rawRefreshToken?.trim();
  return normalized && normalized.length > 0 ? normalized : undefined;
}

function normalizeProviderAccounts(
  providerId: string,
  authType: ProviderAuthType,
  rawAccounts: unknown
): ProviderCredential[] {
  if (!Array.isArray(rawAccounts)) {
    return [];
  }

  const uniqueTokens = new Set<string>();
  const normalized: ProviderCredential[] = [];

  for (const [index, rawAccount] of rawAccounts.entries()) {
    const token = readTokenFromAccount(rawAccount, authType);
    if (!token || uniqueTokens.has(token)) {
      continue;
    }

    uniqueTokens.add(token);
    normalized.push({
      providerId,
      accountId: readAccountId(providerId, index, rawAccount, token),
      token,
      authType,
      chatgptAccountId: readChatgptAccountId(rawAccount),
      planType: readPlanType(rawAccount),
      expiresAt: readExpiresAt(rawAccount),
      refreshToken: readRefreshToken(rawAccount),
    });
  }

  return normalized;
}

function parseProviderState(providerId: string, rawProvider: unknown): ProviderState {
  if (Array.isArray(rawProvider)) {
    const accounts = normalizeProviderAccounts(providerId, "api_key", rawProvider);
    return {
      authType: "api_key",
      accounts,
      nextOffset: 0
    };
  }

  if (!isRecord(rawProvider)) {
    return {
      authType: "api_key",
      accounts: [],
      nextOffset: 0
    };
  }

  const authType = parseAuthType(rawProvider["auth"]);
  const rawAccounts = rawProvider["accounts"] ?? rawProvider["keys"];
  const accounts = normalizeProviderAccounts(providerId, authType, rawAccounts);
  return {
    authType,
    accounts,
    nextOffset: 0
  };
}

function parseProviders(raw: unknown, defaultProviderId: string): Map<string, ProviderState> {
  const providers = new Map<string, ProviderState>();

  const normalizedDefaultProviderId = normalizeProviderId(defaultProviderId);

  if (Array.isArray(raw) || (isRecord(raw) && Array.isArray(raw["keys"]))) {
    const state = parseProviderState(normalizedDefaultProviderId, Array.isArray(raw) ? raw : raw["keys"]);
    if (state.accounts.length > 0) {
      providers.set(normalizedDefaultProviderId, state);
    }
    return providers;
  }

  if (!isRecord(raw)) {
    throw new Error("Invalid keys JSON: expected an array, {\"keys\": []}, or {\"providers\": {...}}.");
  }

  const rawProviders = isRecord(raw["providers"]) ? raw["providers"] : null;
  if (!rawProviders) {
    throw new Error("Invalid keys JSON: missing top-level \"providers\" object.");
  }

  for (const [rawProviderId, rawProvider] of Object.entries(rawProviders)) {
    const providerId = normalizeProviderId(rawProviderId);
    const state = parseProviderState(providerId, rawProvider);
    if (state.accounts.length === 0) {
      continue;
    }

    providers.set(providerId, state);
  }

  return providers;
}

async function readProvidersFile(path: string, defaultProviderId: string): Promise<Map<string, ProviderState>> {
  const contents = await readFile(path, "utf8");
  const parsed: unknown = JSON.parse(contents);
  const providers = parseProviders(parsed, defaultProviderId);

  if (providers.size === 0) {
    throw new Error("No provider accounts found in keys file");
  }

  return providers;
}

function readProvidersFromJsonValue(raw: unknown, defaultProviderId: string): Map<string, ProviderState> {
  const providers = parseProviders(raw, defaultProviderId);

  if (providers.size === 0) {
    throw new Error("No provider accounts found in inline keys JSON");
  }

  return providers;
}

function readProvidersFromJsonEnv(defaultProviderId: string): Map<string, ProviderState> {
  const raw = process.env.PROXY_KEYS_JSON ?? process.env.UPSTREAM_KEYS_JSON ?? process.env.VIVGRID_KEYS_JSON;
  const normalized = raw?.trim();
  if (!normalized) {
    return new Map<string, ProviderState>();
  }

  try {
    const parsed: unknown = JSON.parse(normalized);
    return readProvidersFromJsonValue(parsed, defaultProviderId);
  } catch (error) {
    console.warn(
      `[key-pool] Failed to parse inline keys JSON from env: ${error instanceof Error ? error.message : String(error)}`
    );
    return new Map<string, ProviderState>();
  }
}

function createEnvProviderState(providerId: string, token: string): ProviderState {
  const normalizedProviderId = normalizeProviderId(providerId);
  const normalizedToken = token.trim();
  return {
    authType: "api_key",
    accounts: [{
      providerId: normalizedProviderId,
      accountId: deterministicAccountId(normalizedProviderId, normalizedToken),
      token: normalizedToken,
      authType: "api_key",
    }],
    nextOffset: 0,
  };
}

function readProvidersFromEnv(): Map<string, ProviderState> {
  const providers = new Map<string, ProviderState>();
  const rawFactoryKey = process.env.FACTORY_API_KEY;
  if (typeof rawFactoryKey === "string") {
    const factoryKey = rawFactoryKey.trim();
    if (factoryKey.length > 0) {
      providers.set("factory", createEnvProviderState("factory", factoryKey));
    } else {
      console.warn("[key-pool] FACTORY_API_KEY is set but empty — skipping factory provider from env");
    }
  }

  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  if (geminiKey) {
    providers.set(
      normalizeProviderId(process.env.GEMINI_PROVIDER_ID ?? "gemini"),
      createEnvProviderState(process.env.GEMINI_PROVIDER_ID ?? "gemini", geminiKey),
    );
  }

  const zaiKey = (process.env.ZAI_API_KEY ?? process.env.ZHIPU_API_KEY ?? "").trim();
  if (zaiKey) {
    providers.set(
      normalizeProviderId(process.env.ZAI_PROVIDER_ID ?? process.env.ZHIPU_PROVIDER_ID ?? "zai"),
      createEnvProviderState(process.env.ZAI_PROVIDER_ID ?? process.env.ZHIPU_PROVIDER_ID ?? "zai", zaiKey),
    );
  }

  const mistralKey = (process.env.MISTRAL_API_KEY ?? "").trim();
  if (mistralKey) {
    providers.set(
      normalizeProviderId(process.env.MISTRAL_PROVIDER_ID ?? "mistral"),
      createEnvProviderState(process.env.MISTRAL_PROVIDER_ID ?? "mistral", mistralKey),
    );
  }

  const openrouterKey = process.env.OPENROUTER_API_KEY?.trim();
  if (openrouterKey) {
    providers.set(
      normalizeProviderId(process.env.OPENROUTER_PROVIDER_ID ?? "openrouter"),
      createEnvProviderState(process.env.OPENROUTER_PROVIDER_ID ?? "openrouter", openrouterKey),
    );
  }

  const requestyKey = (process.env.REQUESTY_API_TOKEN ?? process.env.REQUESTY_API_KEY ?? "").trim();
  if (requestyKey) {
    providers.set(
      normalizeProviderId(process.env.REQUESTY_PROVIDER_ID ?? "requesty"),
      createEnvProviderState(process.env.REQUESTY_PROVIDER_ID ?? "requesty", requestyKey),
    );
  }

  return providers;
}

function mergeProviderStates(left: ProviderState | undefined, right: ProviderState | undefined): ProviderState | undefined {
  if (!left) {
    return right;
  }
  if (!right) {
    return left;
  }

  const seen = new Set<string>();
  const accounts: ProviderCredential[] = [];
  for (const account of [...left.accounts, ...right.accounts]) {
    if (seen.has(account.token)) {
      continue;
    }
    seen.add(account.token);
    accounts.push(account);
  }

  return {
    authType: left.authType,
    accounts,
    nextOffset: left.nextOffset,
  };
}

async function readProvidersFromAccountStore(accountStore: ProviderAccountStore): Promise<Map<string, ProviderState>> {
  const providers = await accountStore.getAllProviders();
  const accountsByProvider = await accountStore.getAllAccounts();
  const merged = new Map<string, ProviderState>();
  const providerIds = new Set<string>([
    ...providers.keys(),
    ...accountsByProvider.keys(),
  ]);

  for (const providerId of providerIds) {
    const authType = providers.get(providerId)?.authType ?? accountsByProvider.get(providerId)?.[0]?.authType ?? "api_key";
    const accounts = accountsByProvider.get(providerId) ?? [];
    if (accounts.length === 0) {
      continue;
    }

    merged.set(providerId, {
      authType,
      accounts,
      nextOffset: 0,
    });
  }

  return merged;
}

async function readFactoryOAuthProviders(): Promise<Map<string, ProviderState>> {
  const providers = new Map<string, ProviderState>();

  try {
    const credentials = await loadFactoryAuthV2();
    if (!credentials) {
      return providers;
    }

    const expiresAt = parseJwtExpiry(credentials.accessToken) ?? undefined;
    const account: ProviderCredential = {
      providerId: "factory",
      accountId: deterministicAccountId("factory", credentials.accessToken),
      token: credentials.accessToken,
      authType: "oauth_bearer",
      refreshToken: credentials.refreshToken.length > 0 ? credentials.refreshToken : undefined,
      expiresAt,
    };

    providers.set("factory", {
      authType: "oauth_bearer",
      accounts: [account],
      nextOffset: 0,
    });
  } catch (error) {
    console.warn(
      `[key-pool] Failed to load Factory OAuth credentials: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  return providers;
}

async function readProvidersFromSources(
  path: string,
  defaultProviderId: string,
  accountStore?: ProviderAccountStore,
  preferAccountStoreProviders = false,
): Promise<Map<string, ProviderState>> {
  const envProviders = readProvidersFromEnv();
  const inlineJsonProviders = accountStore
    ? new Map<string, ProviderState>()
    : readProvidersFromJsonEnv(defaultProviderId);
  let fileProviders: Map<string, ProviderState> | null = null;
  let accountStoreProviders: Map<string, ProviderState> | null = null;
  // Only load factory auth from files when no DB account store is available;
  // when a DB is present, factory credentials should already be seeded there.
  const factoryOAuthProviders = accountStore
    ? new Map<string, ProviderState>()
    : await readFactoryOAuthProviders();

  if (accountStore) {
    accountStoreProviders = await readProvidersFromAccountStore(accountStore);
  }

  if (!accountStore) {
    try {
      fileProviders = await readProvidersFile(path, defaultProviderId);
    } catch (error) {
      if (envProviders.size === 0 && inlineJsonProviders.size === 0 && (accountStoreProviders?.size ?? 0) === 0 && factoryOAuthProviders.size === 0) {
        throw error;
      }
    }
  }

  const merged = new Map<string, ProviderState>();
  for (const [providerId, state] of accountStoreProviders ?? []) {
    merged.set(providerId, state);
  }
  for (const [providerId, state] of fileProviders ?? []) {
    if (preferAccountStoreProviders && merged.has(providerId)) {
      continue;
    }
    merged.set(providerId, mergeProviderStates(merged.get(providerId), state) ?? state);
  }
  for (const [providerId, state] of inlineJsonProviders) {
    if (preferAccountStoreProviders && merged.has(providerId)) {
      continue;
    }
    merged.set(providerId, mergeProviderStates(merged.get(providerId), state) ?? state);
  }
  for (const [providerId, state] of envProviders) {
    if (preferAccountStoreProviders && merged.has(providerId)) {
      continue;
    }
    merged.set(providerId, mergeProviderStates(merged.get(providerId), state) ?? state);
  }
  for (const [providerId, state] of factoryOAuthProviders) {
    merged.set(providerId, mergeProviderStates(merged.get(providerId), state) ?? state);
  }

  if (merged.size === 0) {
    throw new Error("No provider accounts found in keys file or environment");
  }

  return merged;
}

function accountCooldownKey(credential: ProviderCredential): string {
  return `${credential.providerId}\0${credential.token}`;
}

function resolveExpiryBufferMs(expiryBufferMs: unknown): number {
  return Number.isFinite(expiryBufferMs)
    ? Math.max(expiryBufferMs as number, 0)
    : 60_000;
}

export class KeyPool {
  private readonly cooldownByAccountKey = new Map<string, number>();
  private readonly inFlightByAccountKey = new Map<string, number>();
  private providers = new Map<string, ProviderState>();
  private lastReloadAt = 0;
  private reloadInFlight: Promise<void> | null = null;

  public constructor(private readonly config: KeyPoolConfig) {}

  public async warmup(): Promise<void> {
    await this.ensureFreshProviders(true);
  }

  public async getRequestOrder(providerId: string = this.config.defaultProviderId): Promise<ProviderCredential[]> {
    await this.ensureFreshProviders(false);

    const normalizedProviderId = normalizeProviderId(providerId);
    const providerState = this.providers.get(normalizedProviderId);
    if (!providerState || providerState.accounts.length === 0) {
      throw new Error(`No accounts configured for provider: ${normalizedProviderId}`);
    }

    const accountCount = providerState.accounts.length;
    const now = Date.now();
    const startOffset = providerState.nextOffset % accountCount;
    providerState.nextOffset = (providerState.nextOffset + 1) % accountCount;

    const expiryBuffer = resolveExpiryBufferMs(this.config.expiryBufferMs);
    const idle: ProviderCredential[] = [];
    const busy: ProviderCredential[] = [];
    for (let index = 0; index < accountCount; index += 1) {
      const credential = providerState.accounts[(startOffset + index) % accountCount];
      if (!credential) {
        continue;
      }

      const isExpired = typeof credential.expiresAt === "number" && credential.expiresAt <= now + expiryBuffer;
      if (isExpired) {
        continue;
      }

      const cooldownUntil = this.cooldownByAccountKey.get(accountCooldownKey(credential)) ?? 0;
      if (cooldownUntil <= now) {
        if ((this.inFlightByAccountKey.get(accountCooldownKey(credential)) ?? 0) > 0) {
          busy.push(credential);
        } else {
          idle.push(credential);
        }
      }
    }

    return [...idle, ...busy];
  }

  public async getAllAccounts(providerId: string = this.config.defaultProviderId): Promise<ProviderCredential[]> {
    await this.ensureFreshProviders(false);

    const normalizedProviderId = normalizeProviderId(providerId);
    const providerState = this.providers.get(normalizedProviderId);
    if (!providerState) {
      return [];
    }

    return [...providerState.accounts];
  }

  public updateAccountCredential(providerId: string, oldCredential: ProviderCredential, newCredential: ProviderCredential): void {
    const normalizedProviderId = normalizeProviderId(providerId);
    const providerState = this.providers.get(normalizedProviderId);
    if (!providerState) {
      return;
    }

    const index = providerState.accounts.findIndex(
      (account) => account.accountId === oldCredential.accountId && account.providerId === oldCredential.providerId
    );
    if (index >= 0) {
      providerState.accounts[index] = newCredential;
    }
  }

  public async getRequestOrderWithRefresh(
    providerId: string = this.config.defaultProviderId,
    refreshExpiredToken: (credential: ProviderCredential) => Promise<ProviderCredential | null>,
  ): Promise<ProviderCredential[]> {
    await this.ensureFreshProviders(false);

    const normalizedProviderId = normalizeProviderId(providerId);
    const providerState = this.providers.get(normalizedProviderId);
    if (!providerState || providerState.accounts.length === 0) {
      throw new Error(`No accounts configured for provider: ${normalizedProviderId}`);
    }

    const accountCount = providerState.accounts.length;
    const now = Date.now();
    const startOffset = providerState.nextOffset % accountCount;
    providerState.nextOffset = (providerState.nextOffset + 1) % accountCount;

    const expiryBuffer = resolveExpiryBufferMs(this.config.expiryBufferMs);

    const idle: ProviderCredential[] = [];
    const busy: ProviderCredential[] = [];
    const refreshCandidates: ProviderCredential[] = [];

    for (let index = 0; index < accountCount; index += 1) {
      const credential = providerState.accounts[(startOffset + index) % accountCount];
      if (!credential) {
        continue;
      }

      const cooldownUntil = this.cooldownByAccountKey.get(accountCooldownKey(credential)) ?? 0;
      if (cooldownUntil > now) {
        continue;
      }

      const needsRefresh = typeof credential.expiresAt === "number"
        && credential.expiresAt <= now + expiryBuffer;

      if (needsRefresh) {
        if (credential.refreshToken) {
          refreshCandidates.push(credential);
        }
        continue;
      }

      if ((this.inFlightByAccountKey.get(accountCooldownKey(credential)) ?? 0) > 0) {
        busy.push(credential);
      } else {
        idle.push(credential);
      }
    }

    const refreshed: ProviderCredential[] = [];
    for (const credential of refreshCandidates) {
      try {
        const refreshedAccount = await refreshExpiredToken(credential);
        if (refreshedAccount) {
          refreshed.push(refreshedAccount);
        }
      } catch {
        // Skip accounts that fail refresh.
      }
    }

    return [...idle, ...busy, ...refreshed];
  }

  public isAccountExpired(credential: ProviderCredential): boolean {
    if (typeof credential.expiresAt !== "number") {
      return false;
    }
    return Date.now() >= credential.expiresAt;
  }

  public getExpiredAccountsWithRefreshTokens(providerId: string = this.config.defaultProviderId): ProviderCredential[] {
    const normalizedProviderId = normalizeProviderId(providerId);
    const providerState = this.providers.get(normalizedProviderId);
    if (!providerState) {
      return [];
    }

    const now = Date.now();
    return providerState.accounts.filter(
      (account) => typeof account.expiresAt === "number"
        && account.expiresAt <= now
        && typeof account.refreshToken === "string"
        && account.refreshToken.length > 0
    );
  }

  public getExpiringAccounts(windowMs: number): ProviderCredential[] {
    const now = Date.now();
    const result: ProviderCredential[] = [];

    for (const providerState of this.providers.values()) {
      for (const account of providerState.accounts) {
        if (
          typeof account.expiresAt === "number"
          && account.expiresAt > now
          && account.expiresAt <= now + windowMs
          && typeof account.refreshToken === "string"
          && account.refreshToken.length > 0
        ) {
          result.push(account);
        }
      }
    }

    return result;
  }

  public getAllExpiredWithRefreshTokens(): ProviderCredential[] {
    const now = Date.now();
    const result: ProviderCredential[] = [];

    for (const providerState of this.providers.values()) {
      for (const account of providerState.accounts) {
        if (
          typeof account.expiresAt === "number"
          && account.expiresAt <= now
          && typeof account.refreshToken === "string"
          && account.refreshToken.length > 0
        ) {
          result.push(account);
        }
      }
    }

    return result;
  }

  public markInFlight(credential: ProviderCredential): () => void {
    const key = accountCooldownKey(credential);
    const current = this.inFlightByAccountKey.get(key) ?? 0;
    this.inFlightByAccountKey.set(key, current + 1);
    let released = false;
    return () => {
      if (released) {
        return;
      }
      released = true;
      const next = (this.inFlightByAccountKey.get(key) ?? 1) - 1;
      if (next <= 0) {
        this.inFlightByAccountKey.delete(key);
      } else {
        this.inFlightByAccountKey.set(key, next);
      }
    };
  }

  public markRateLimited(credential: ProviderCredential, retryAfterMs?: number): void {
    const cooldown = Math.max(retryAfterMs ?? this.config.defaultCooldownMs, 1000);
    this.cooldownByAccountKey.set(accountCooldownKey(credential), Date.now() + cooldown);
    getTelemetry().recordMetric("proxy.key_pool.rate_limited", 1, {
      "proxy.provider_id": credential.providerId ?? this.config.defaultProviderId,
      "proxy.account_id": credential.accountId,
    });
  }

  public async msUntilAnyKeyReady(providerId: string = this.config.defaultProviderId): Promise<number> {
    const status = await this.getStatus(providerId);
    return status.nextReadyInMs;
  }

  public async getStatus(providerId: string = this.config.defaultProviderId): Promise<KeyPoolStatus> {
    await this.ensureFreshProviders(false);

    const normalizedProviderId = normalizeProviderId(providerId);
    const providerState = this.providers.get(normalizedProviderId);
    if (!providerState) {
      return {
        providerId: normalizedProviderId,
        authType: "unknown",
        totalAccounts: 0,
        availableAccounts: 0,
        cooldownAccounts: 0,
        inFlightAccounts: 0,
        nextReadyInMs: 0
      };
    }

    const now = Date.now();
    let availableAccounts = 0;
    let inFlightAccounts = 0;
    let minDelay = Number.POSITIVE_INFINITY;

    for (const credential of providerState.accounts) {
      const cooldownUntil = this.cooldownByAccountKey.get(accountCooldownKey(credential)) ?? 0;
      if ((this.inFlightByAccountKey.get(accountCooldownKey(credential)) ?? 0) > 0) {
        inFlightAccounts += 1;
      }
      if (cooldownUntil <= now) {
        availableAccounts += 1;
        continue;
      }

      minDelay = Math.min(minDelay, cooldownUntil - now);
    }

    const totalAccounts = providerState.accounts.length;
    const nextReadyInMs = availableAccounts > 0
      ? 0
      : Number.isFinite(minDelay)
        ? Math.max(minDelay, 0)
        : 0;

    return {
      providerId: normalizedProviderId,
        authType: providerState.authType,
        totalAccounts,
        availableAccounts,
        cooldownAccounts: Math.max(totalAccounts - availableAccounts, 0),
        inFlightAccounts,
        nextReadyInMs
      };
  }

  public async getAllStatuses(): Promise<Record<string, KeyPoolStatus>> {
    await this.ensureFreshProviders(false);

    const statuses: Record<string, KeyPoolStatus> = {};
    for (const providerId of this.providers.keys()) {
      statuses[providerId] = await this.getStatus(providerId);
    }

    return statuses;
  }

  public async getAllAccountStatuses(): Promise<Record<string, readonly KeyPoolAccountStatus[]>> {
    await this.ensureFreshProviders(false);

    const now = Date.now();
    const statuses: Record<string, readonly KeyPoolAccountStatus[]> = {};

    for (const [providerId, providerState] of this.providers.entries()) {
      statuses[providerId] = providerState.accounts.map((credential) => {
        const key = accountCooldownKey(credential);
        const cooldownUntil = this.cooldownByAccountKey.get(key);
        const inFlight = (this.inFlightByAccountKey.get(key) ?? 0) > 0;
        const available = (cooldownUntil ?? 0) <= now;
        return {
          providerId,
          accountId: credential.accountId,
          authType: credential.authType,
          available,
          inFlight,
          cooldownUntil,
          nextReadyInMs: available || cooldownUntil === undefined ? 0 : Math.max(cooldownUntil - now, 0),
        };
      });
    }

    return statuses;
  }

  private async ensureFreshProviders(forceReload: boolean): Promise<void> {
    const now = Date.now();
    const needsReload =
      forceReload ||
      this.providers.size === 0 ||
      now - this.lastReloadAt >= this.config.reloadIntervalMs;

    if (!needsReload) {
      return;
    }

    if (this.reloadInFlight) {
      await this.reloadInFlight;
      return;
    }

    this.reloadInFlight = this.reloadProviders().finally(() => {
      this.reloadInFlight = null;
    });

    await this.reloadInFlight;
  }

  private async reloadProviders(): Promise<void> {
    this.lastReloadAt = Date.now();

    try {
      const providers = await readProvidersFromSources(
        this.config.keysFilePath,
        this.config.defaultProviderId,
        this.config.accountStore,
        this.config.preferAccountStoreProviders,
      );
      const previousOffsets = new Map<string, number>();
      for (const [providerId, state] of this.providers.entries()) {
        previousOffsets.set(providerId, state.nextOffset);
      }

      for (const [providerId, state] of providers.entries()) {
        const previousOffset = previousOffsets.get(providerId) ?? 0;
        state.nextOffset = state.accounts.length > 0 ? previousOffset % state.accounts.length : 0;
      }

      this.providers = providers;
      this.pruneCooldownMap();
    } catch (error) {
      if (this.providers.size === 0) {
        throw error;
      }
    }
  }

  private pruneCooldownMap(): void {
    const activeKeys = new Set<string>();

    for (const providerState of this.providers.values()) {
      for (const credential of providerState.accounts) {
        activeKeys.add(accountCooldownKey(credential));
      }
    }

    for (const key of this.cooldownByAccountKey.keys()) {
      if (!activeKeys.has(key)) {
        this.cooldownByAccountKey.delete(key);
      }
    }

    for (const key of this.inFlightByAccountKey.keys()) {
      if (!activeKeys.has(key)) {
        this.inFlightByAccountKey.delete(key);
      }
    }
  }
}
