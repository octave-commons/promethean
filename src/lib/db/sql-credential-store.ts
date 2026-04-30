import crypto from "node:crypto";

import type { Sql } from "./index.js";
import type { ProviderCredential, ProviderAuthType } from "../key-pool.js";
import { normalizeEpochMilliseconds } from "../epoch.js";
import { DEFAULT_TENANT_ID, buildTenantApiKeyPrefix, generateTenantApiKey, hashTenantApiKey, normalizeTenantId } from "../tenant-api-key.js";
import type { CredentialAccountView, CredentialProviderView } from "../credential-store.js";
import {
  CREATE_TENANTS_TABLE,
  CREATE_USERS_TABLE,
  CREATE_TENANT_MEMBERSHIPS_TABLE,
  CREATE_TENANT_API_KEYS_TABLE,
  CREATE_TENANT_API_KEYS_TENANT_INDEX,
  CREATE_TENANT_API_KEYS_HASH_INDEX,
  CREATE_PROVIDERS_TABLE,
  CREATE_ACCOUNTS_TABLE,
  CREATE_ACCOUNTS_INDEX,
  CREATE_ACCOUNT_HEALTH_TABLE,
  CREATE_ACCOUNT_HEALTH_INDEX,
  CREATE_COOLDOWN_TABLE,
  CREATE_MODELS_TABLE,
  CREATE_CONFIG_TABLE,
  CREATE_VERSION_TABLE,
  INSERT_VERSION,
  CHECK_VERSION_EXISTS,
  UPSERT_PROVIDER,
  UPSERT_TENANT,
  UPSERT_USER,
  SELECT_USER_BY_SUBJECT,
  UPSERT_TENANT_MEMBERSHIP,
  SELECT_TENANT_MEMBERSHIPS_BY_USER,
  COUNT_TENANT_MEMBERSHIPS_FOR_TENANT,
  INSERT_ACCOUNT,
  INSERT_TENANT_API_KEY,
  SELECT_ACTIVE_TENANT_API_KEY_BY_HASH,
  SELECT_ALL_TENANTS,
  SELECT_TENANT_API_KEYS_BY_TENANT,
  SELECT_ALL_PROVIDERS,
  SELECT_ACCOUNTS_BY_PROVIDER,
  SELECT_ALL_ACCOUNTS,
  DELETE_ACCOUNT,
  REVOKE_TENANT_API_KEY,
  TOUCH_TENANT_API_KEY_LAST_USED,
  SET_COOLDOWN,
  GET_COOLDOWN,
  CLEAR_EXPIRED_COOLDOWNS,
  SCHEMA_VERSION,
} from "./schema.js";

interface ProviderRow {
  id: string;
  auth_type: string;
}

interface TenantRow {
  id: string;
  name: string;
  status: string;
}

interface UserRow {
  id: string;
  provider: string;
  subject: string;
  login: string | null;
  email: string | null;
  name: string | null;
  avatar_url: string | null;
}

interface TenantMembershipRow {
  tenant_id: string;
  role: string;
  tenant_name: string;
  tenant_status: string;
}

interface TenantApiKeyRow {
  id: string;
  tenant_id: string;
  label: string;
  prefix: string;
  scopes: string[] | string | null;
  created_at?: string | null;
  last_used_at?: string | null;
  revoked_at: string | null;
}

interface AccountRow {
  id: string;
  provider_id: string;
  token: string;
  refresh_token: string | null;
  expires_at: number | null;
  chatgpt_account_id: string | null;
  plan_type: string | null;
}

export interface SqlOpenAiAccountIdentityRow {
  readonly id: string;
  readonly provider_id: string;
  readonly chatgpt_account_id: string | null;
}

interface CooldownRow {
  cooldown_until: string;
}

function normalizeAuthType(raw: string): ProviderAuthType {
  const normalized = raw.trim().toLowerCase();
  if (normalized === "oauth" || normalized === "oauth_bearer" || normalized === "oauth-bearer") {
    return "oauth_bearer";
  }
  return "api_key";
}

function toProviderCredential(row: AccountRow, authType: ProviderAuthType): ProviderCredential {
  return {
    providerId: row.provider_id,
    accountId: row.id,
    token: row.token,
    authType,
    refreshToken: row.refresh_token ?? undefined,
    expiresAt: normalizeEpochMilliseconds(row.expires_at ?? undefined),
    chatgptAccountId: row.chatgpt_account_id ?? undefined,
    planType: row.plan_type ?? undefined,
  };
}

function escapeRegexLiteral(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isLegacyOpenAiAccountId(accountId: string, chatgptAccountId: string): boolean {
  return new RegExp(`^${escapeRegexLiteral(chatgptAccountId)}_[0-9a-f]{8}$`).test(accountId);
}

function isCurrentOpenAiAccountId(accountId: string, chatgptAccountId: string): boolean {
  return new RegExp(`^${escapeRegexLiteral(chatgptAccountId)}-[0-9a-f]{12}$`).test(accountId);
}

export function selectLegacyOpenAiDuplicateIds(rows: readonly SqlOpenAiAccountIdentityRow[]): string[] {
  const grouped = new Map<string, SqlOpenAiAccountIdentityRow[]>();

  for (const row of rows) {
    if (row.provider_id !== "openai" || !row.chatgpt_account_id) {
      continue;
    }
    const accounts = grouped.get(row.chatgpt_account_id) ?? [];
    accounts.push(row);
    grouped.set(row.chatgpt_account_id, accounts);
  }

  const idsToDelete: string[] = [];
  for (const [chatgptAccountId, accounts] of grouped.entries()) {
    const hasCurrentSibling = accounts.some((account) => isCurrentOpenAiAccountId(account.id, chatgptAccountId));
    if (!hasCurrentSibling) {
      continue;
    }
    for (const account of accounts) {
      if (isLegacyOpenAiAccountId(account.id, chatgptAccountId)) {
        idsToDelete.push(account.id);
      }
    }
  }

  return idsToDelete;
}

function maskSecret(secret: string): string {
  if (secret.length <= 8) {
    return `${secret.slice(0, 2)}***${secret.slice(-2)}`;
  }

  return `${secret.slice(0, 4)}...${secret.slice(-4)}`;
}

export interface SqlCredentialStoreStatus {
  initialized: boolean;
  tenantCount: number;
  providerCount: number;
  totalAccountCount: number;
}

export interface TenantView {
  id: string;
  name: string;
  status: string;
}

export type TenantMembershipRole = "owner" | "admin" | "member" | "viewer";

export interface UserView {
  id: string;
  provider: string;
  subject: string;
  login: string | null;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
}

export interface TenantMembershipView {
  tenantId: string;
  tenantName: string;
  tenantStatus: string;
  role: TenantMembershipRole;
}

export interface ResolvedUiSession {
  userId: string;
  subject: string;
  activeTenantId: string;
  role: TenantMembershipRole;
  memberships: readonly TenantMembershipView[];
}

export interface TenantApiKeyMatch {
  id: string;
  tenantId: string;
  label: string;
  prefix: string;
  scopes: readonly string[];
}

export interface TenantApiKeyView {
  id: string;
  tenantId: string;
  label: string;
  prefix: string;
  scopes: readonly string[];
  createdAt: string | null;
  lastUsedAt: string | null;
  revokedAt: string | null;
}

export interface CreatedTenantApiKey {
  id: string;
  tenantId: string;
  label: string;
  prefix: string;
  token: string;
  scopes: readonly string[];
}

function parseScopes(value: string[] | string | null): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }

  if (typeof value === "string") {
    try {
      const parsed: unknown = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
    } catch {
      return [];
    }
  }

  return [];
}

function normalizeMembershipRole(value: string): TenantMembershipRole {
  const normalized = value.trim().toLowerCase();
  if (normalized === "owner" || normalized === "admin" || normalized === "member" || normalized === "viewer") {
    return normalized;
  }

  return "viewer";
}

function toUserView(row: UserRow): UserView {
  return {
    id: row.id,
    provider: row.provider,
    subject: row.subject,
    login: row.login,
    email: row.email,
    name: row.name,
    avatarUrl: row.avatar_url,
  };
}

function toTenantMembershipView(row: TenantMembershipRow): TenantMembershipView {
  return {
    tenantId: row.tenant_id,
    tenantName: row.tenant_name,
    tenantStatus: row.tenant_status,
    role: normalizeMembershipRole(row.role),
  };
}

export class SqlCredentialStore {
  private initialized = false;
  private readonly cooldowns = new Map<string, number>();

  public constructor(
    private readonly sql: Sql,
    private readonly options: {
      readonly defaultTenantId?: string;
    } = {},
  ) {}

  public async init(): Promise<void> {
    await this.runMigrations();
    this.initialized = true;
  }

  private async runMigrations(): Promise<void> {
    await this.sql.unsafe(CREATE_TENANTS_TABLE);
    await this.sql.unsafe(CREATE_USERS_TABLE);
    await this.sql.unsafe(CREATE_TENANT_MEMBERSHIPS_TABLE);
    await this.sql.unsafe(CREATE_TENANT_API_KEYS_TABLE);
    await this.sql.unsafe(CREATE_TENANT_API_KEYS_TENANT_INDEX);
    await this.sql.unsafe(CREATE_TENANT_API_KEYS_HASH_INDEX);
    await this.sql.unsafe(CREATE_PROVIDERS_TABLE);
    await this.sql.unsafe(CREATE_ACCOUNTS_TABLE);
    await this.sql.unsafe(CREATE_ACCOUNTS_INDEX);
    await this.sql.unsafe(CREATE_COOLDOWN_TABLE);
    await this.sql.unsafe(CREATE_ACCOUNT_HEALTH_TABLE);
    await this.sql.unsafe(CREATE_ACCOUNT_HEALTH_INDEX);
    await this.sql.unsafe(CREATE_MODELS_TABLE);
    await this.sql.unsafe(CREATE_CONFIG_TABLE);
    await this.sql.unsafe(CREATE_VERSION_TABLE);

    const versionExists = await this.sql.unsafe<Array<{ "?column?": number }>>(
      CHECK_VERSION_EXISTS,
      [SCHEMA_VERSION]
    );
    if (versionExists.length === 0) {
      await this.sql.unsafe(INSERT_VERSION, [SCHEMA_VERSION]);
    }

    await this.ensureDefaultTenant();
  }

  private async ensureDefaultTenant(): Promise<void> {
    const tenantId = normalizeTenantId(this.options.defaultTenantId ?? DEFAULT_TENANT_ID);
    await this.sql.unsafe(UPSERT_TENANT, [tenantId, tenantId, "active"]);
  }

  public async getStatus(): Promise<SqlCredentialStoreStatus> {
    const tenants = await this.sql.unsafe<TenantRow[]>(SELECT_ALL_TENANTS);
    const providers = await this.sql.unsafe<ProviderRow[]>(SELECT_ALL_PROVIDERS);
    const accounts = await this.sql.unsafe<AccountRow[]>(SELECT_ALL_ACCOUNTS);

    return {
      initialized: this.initialized,
      tenantCount: tenants.length,
      providerCount: providers.length,
      totalAccountCount: accounts.length,
    };
  }

  public async listTenants(): Promise<TenantView[]> {
    const rows = await this.sql.unsafe<TenantRow[]>(SELECT_ALL_TENANTS);
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      status: row.status,
    }));
  }

  public async upsertUser(input: {
    provider: string;
    subject: string;
    login?: string | null;
    email?: string | null;
    name?: string | null;
    avatarUrl?: string | null;
  }): Promise<UserView> {
    const subject = input.subject.trim().toLowerCase();
    if (subject.length === 0) {
      throw new Error("user subject must not be empty");
    }

    const rows = await this.sql.unsafe<UserRow[]>(UPSERT_USER, [
      crypto.randomUUID(),
      input.provider.trim().toLowerCase(),
      subject,
      input.login?.trim() || null,
      input.email?.trim() || null,
      input.name?.trim() || null,
      input.avatarUrl?.trim() || null,
    ]);
    const row = rows[0];
    if (!row) {
      throw new Error("failed to upsert user");
    }

    return toUserView(row);
  }

  public async getUserBySubject(subject: string): Promise<UserView | undefined> {
    const normalizedSubject = subject.trim().toLowerCase();
    if (normalizedSubject.length === 0) {
      return undefined;
    }

    const rows = await this.sql.unsafe<UserRow[]>(SELECT_USER_BY_SUBJECT, [normalizedSubject]);
    const row = rows[0];
    return row ? toUserView(row) : undefined;
  }

  public async listUserMemberships(userId: string): Promise<TenantMembershipView[]> {
    const rows = await this.sql.unsafe<TenantMembershipRow[]>(SELECT_TENANT_MEMBERSHIPS_BY_USER, [userId]);
    return rows.map(toTenantMembershipView);
  }

  public async ensureTenantMembership(userId: string, tenantId: string, role: TenantMembershipRole): Promise<void> {
    const normalizedTenantId = normalizeTenantId(tenantId);
    await this.sql.unsafe(UPSERT_TENANT_MEMBERSHIP, [normalizedTenantId, userId, role]);
  }

  public async ensureDefaultTenantBootstrapMembership(userId: string): Promise<TenantMembershipRole> {
    const existingMemberships = await this.listUserMemberships(userId);
    const existingDefaultMembership = existingMemberships.find((membership) => membership.tenantId === DEFAULT_TENANT_ID);
    if (existingDefaultMembership) {
      return existingDefaultMembership.role;
    }

    const rows = await this.sql.unsafe<Array<{ count: string | number }>>(COUNT_TENANT_MEMBERSHIPS_FOR_TENANT, [DEFAULT_TENANT_ID]);
    const count = Number(rows[0]?.count ?? 0);
    const role: TenantMembershipRole = count === 0 ? "owner" : "admin";
    await this.ensureTenantMembership(userId, DEFAULT_TENANT_ID, role);
    return role;
  }

  public async resolveUiSession(subject: string, activeTenantId?: string): Promise<ResolvedUiSession | undefined> {
    const user = await this.getUserBySubject(subject);
    if (!user) {
      return undefined;
    }

    const memberships = await this.listUserMemberships(user.id);
    if (memberships.length === 0) {
      return undefined;
    }

    const normalizedActiveTenantId = typeof activeTenantId === "string" && activeTenantId.trim().length > 0
      ? normalizeTenantId(activeTenantId)
      : undefined;
    const activeMembership = (normalizedActiveTenantId
      ? memberships.find((membership) => membership.tenantId === normalizedActiveTenantId)
      : undefined)
      ?? memberships.find((membership) => membership.tenantId === DEFAULT_TENANT_ID)
      ?? memberships[0];

    return {
      userId: user.id,
      subject: user.subject,
      activeTenantId: activeMembership.tenantId,
      role: activeMembership.role,
      memberships,
    };
  }

  public async resolveTenantApiKey(token: string, pepper: string): Promise<TenantApiKeyMatch | undefined> {
    const tokenHash = hashTenantApiKey(token, pepper);
    const rows = await this.sql.unsafe<TenantApiKeyRow[]>(SELECT_ACTIVE_TENANT_API_KEY_BY_HASH, [tokenHash]);
    const row = rows[0];
    if (!row) {
      return undefined;
    }

    return {
      id: row.id,
      tenantId: row.tenant_id,
      label: row.label,
      prefix: row.prefix,
      scopes: parseScopes(row.scopes),
    };
  }

  public async listTenantApiKeys(tenantId: string): Promise<TenantApiKeyView[]> {
    const normalizedTenantId = normalizeTenantId(tenantId);
    const rows = await this.sql.unsafe<TenantApiKeyRow[]>(SELECT_TENANT_API_KEYS_BY_TENANT, [normalizedTenantId]);
    return rows.map((row) => ({
      id: row.id,
      tenantId: row.tenant_id,
      label: row.label,
      prefix: row.prefix,
      scopes: parseScopes(row.scopes),
      createdAt: row.created_at ?? null,
      lastUsedAt: row.last_used_at ?? null,
      revokedAt: row.revoked_at ?? null,
    }));
  }

  public async createTenantApiKey(tenantId: string, label: string, scopes: readonly string[], pepper: string): Promise<CreatedTenantApiKey> {
    const normalizedTenantId = normalizeTenantId(tenantId);
    const normalizedLabel = label.trim();
    if (normalizedLabel.length === 0) {
      throw new Error("tenant api key label must not be empty");
    }

    const token = generateTenantApiKey();
    const id = crypto.randomUUID();
    const prefix = buildTenantApiKeyPrefix(token);
    const tokenHash = hashTenantApiKey(token, pepper);
    const normalizedScopes = scopes.filter((scope): scope is string => typeof scope === "string" && scope.trim().length > 0);

    await this.sql.unsafe(INSERT_TENANT_API_KEY, [
      id,
      normalizedTenantId,
      normalizedLabel,
      prefix,
      tokenHash,
      JSON.stringify(normalizedScopes.length > 0 ? normalizedScopes : ["proxy:use"]),
    ]);

    return {
      id,
      tenantId: normalizedTenantId,
      label: normalizedLabel,
      prefix,
      token,
      scopes: normalizedScopes.length > 0 ? normalizedScopes : ["proxy:use"],
    };
  }

  public async revokeTenantApiKey(tenantId: string, keyId: string): Promise<boolean> {
    const normalizedTenantId = normalizeTenantId(tenantId);
    const result = await this.sql.unsafe<Array<{ id: string }>>(
      `${REVOKE_TENANT_API_KEY} RETURNING id`,
      [normalizedTenantId, keyId],
    );
    return result.length > 0;
  }

  public async touchTenantApiKeyLastUsed(tenantId: string, keyId: string): Promise<void> {
    const normalizedTenantId = normalizeTenantId(tenantId);
    await this.sql.unsafe(TOUCH_TENANT_API_KEY_LAST_USED, [normalizedTenantId, keyId]);
  }

  public async listProviders(revealSecrets: boolean): Promise<CredentialProviderView[]> {
    const providerRows = await this.sql.unsafe<ProviderRow[]>(SELECT_ALL_PROVIDERS);
    const accountRows = await this.sql.unsafe<AccountRow[]>(SELECT_ALL_ACCOUNTS);
    const authTypeByProvider = new Map<string, ProviderAuthType>(
      providerRows.map((row) => [row.id, normalizeAuthType(row.auth_type)])
    );
    const accountsByProvider = new Map<string, CredentialAccountView[]>();

    for (const row of accountRows) {
      const authType = authTypeByProvider.get(row.provider_id) ?? "api_key";
      const accounts = accountsByProvider.get(row.provider_id) ?? [];
      accounts.push({
        id: row.id,
        authType,
        displayName: row.chatgpt_account_id ?? row.id,
        secretPreview: maskSecret(row.token),
        secret: revealSecrets ? row.token : undefined,
        refreshTokenPreview: row.refresh_token ? maskSecret(row.refresh_token) : undefined,
        refreshToken: revealSecrets ? row.refresh_token ?? undefined : undefined,
        expiresAt: normalizeEpochMilliseconds(row.expires_at ?? undefined),
        chatgptAccountId: row.chatgpt_account_id ?? undefined,
        planType: row.plan_type ?? undefined,
      });
      accountsByProvider.set(row.provider_id, accounts);
    }

    return providerRows
      .map((row): CredentialProviderView => {
        const accounts = accountsByProvider.get(row.id) ?? [];
        return {
          id: row.id,
          authType: normalizeAuthType(row.auth_type),
          accountCount: accounts.length,
          accounts,
        };
      })
      .sort((left, right) => left.id.localeCompare(right.id));
  }

  public async getAllProviders(): Promise<Map<string, { authType: ProviderAuthType }>> {
    const rows = await this.sql.unsafe<ProviderRow[]>(SELECT_ALL_PROVIDERS);
    const result = new Map<string, { authType: ProviderAuthType }>();
    for (const row of rows) {
      result.set(row.id, { authType: normalizeAuthType(row.auth_type) });
    }
    return result;
  }

  public async getAccountsByProvider(providerId: string): Promise<ProviderCredential[]> {
    const rows = await this.sql.unsafe<AccountRow[]>(SELECT_ACCOUNTS_BY_PROVIDER, [providerId]);
    const providers = await this.getAllProviders();
    const authType = providers.get(providerId)?.authType ?? "api_key";
    return rows.map((row) => toProviderCredential(row, authType));
  }

  private inferAuthType(_token: string): ProviderAuthType {
    return "api_key";
  }

  public async getAllAccounts(): Promise<Map<string, ProviderCredential[]>> {
    const providers = await this.getAllProviders();
    const rows = await this.sql.unsafe<AccountRow[]>(SELECT_ALL_ACCOUNTS);
    const result = new Map<string, ProviderCredential[]>();

    for (const row of rows) {
      const accounts = result.get(row.provider_id) ?? [];
      const authType = providers.get(row.provider_id)?.authType ?? this.inferAuthType(row.token);
      accounts.push(toProviderCredential(row, authType));
      result.set(row.provider_id, accounts);
    }

    return result;
  }

  public async cleanupLegacyOpenAiDuplicates(chatgptAccountId?: string): Promise<number> {
    const rows = chatgptAccountId
      ? await this.sql.unsafe<AccountRow[]>(
        `${SELECT_ACCOUNTS_BY_PROVIDER.replace("ORDER BY id;", "AND chatgpt_account_id = $2 ORDER BY id;")}`,
        ["openai", chatgptAccountId],
      )
      : await this.sql.unsafe<AccountRow[]>(SELECT_ACCOUNTS_BY_PROVIDER, ["openai"]);
    const idsToDelete = selectLegacyOpenAiDuplicateIds(rows);

    if (idsToDelete.length === 0) {
      return 0;
    }

    await this.sql.begin(async (tx) => {
      await tx.unsafe(
        "DELETE FROM account_cooldown WHERE provider_id = 'openai' AND account_id = ANY($1::text[])",
        [idsToDelete],
      );
      await tx.unsafe(
        "DELETE FROM account_health WHERE provider_id = 'openai' AND account_id = ANY($1::text[])",
        [idsToDelete],
      );
      await tx.unsafe(
        "DELETE FROM accounts WHERE provider_id = 'openai' AND id = ANY($1::text[])",
        [idsToDelete],
      );
    });

    return idsToDelete.length;
  }

  public async upsertProvider(providerId: string, authType: ProviderAuthType): Promise<void> {
    await this.sql.unsafe(UPSERT_PROVIDER, [providerId, authType]);
  }

  public async upsertAccount(account: ProviderCredential): Promise<void> {
    await this.upsertProvider(account.providerId, account.authType);
    await this.sql.unsafe(INSERT_ACCOUNT, [
      account.accountId,
      account.providerId,
      account.token,
      account.refreshToken ?? null,
      account.expiresAt ?? null,
      account.chatgptAccountId ?? null,
      account.planType ?? null,
    ]);
  }

  public async upsertApiKeyAccount(providerId: string, accountId: string, apiKey: string): Promise<void> {
    await this.upsertAccount({
      providerId,
      accountId,
      token: apiKey,
      authType: "api_key",
    });
  }

  public async upsertOAuthAccount(
    providerId: string,
    accountId: string,
    accessToken: string,
    refreshToken?: string,
    expiresAt?: number,
    chatgptAccountId?: string,
    _email?: string,
    _subject?: string,
    planType?: string,
  ): Promise<void> {
    await this.upsertAccount({
      providerId,
      accountId,
      token: accessToken,
      authType: "oauth_bearer",
      refreshToken,
      expiresAt,
      chatgptAccountId,
      planType,
    });

    if (providerId === "openai" && chatgptAccountId) {
      await this.cleanupLegacyOpenAiDuplicates(chatgptAccountId);
    }
  }

  public async upsertAccounts(accounts: readonly ProviderCredential[]): Promise<void> {
    for (const account of accounts) {
      await this.upsertAccount(account);
    }
  }

  public async deleteAccount(providerId: string, accountId: string): Promise<void> {
    await this.sql.unsafe(DELETE_ACCOUNT, [accountId, providerId]);
  }

  public async removeAccount(providerId: string, accountId: string): Promise<boolean> {
    const deleted = await this.sql.begin(async (tx) => {
      const deleted = await tx.unsafe<Array<{ readonly id: string }>>(
        "DELETE FROM accounts WHERE id = $1 AND provider_id = $2 RETURNING id",
        [accountId, providerId],
      );

      await tx.unsafe(
        "DELETE FROM account_cooldown WHERE provider_id = $1 AND account_id = $2",
        [providerId, accountId],
      );
      await tx.unsafe(
        "DELETE FROM account_health WHERE provider_id = $1 AND account_id = $2",
        [providerId, accountId],
      );

      return deleted;
    });

    // Only mutate in-memory state after the transaction commits.
    this.cooldowns.delete(`${providerId}:${accountId}`);
    return deleted.length > 0;
  }

  public setCooldown(providerId: string, accountId: string, cooldownUntil: number): void {
    this.cooldowns.set(`${providerId}:${accountId}`, cooldownUntil);
  }

  public getCooldown(providerId: string, accountId: string): number | undefined {
    return this.cooldowns.get(`${providerId}:${accountId}`);
  }

  public async persistCooldown(providerId: string, accountId: string, cooldownUntil: number): Promise<void> {
    await this.sql.unsafe(SET_COOLDOWN, [providerId, accountId, cooldownUntil]);
    this.cooldowns.set(`${providerId}:${accountId}`, cooldownUntil);
  }

  public async loadCooldowns(): Promise<void> {
    const now = Date.now();
    await this.sql.unsafe(CLEAR_EXPIRED_COOLDOWNS, [now]);

    this.cooldowns.clear();
  }

  public async loadAccountsIntoKeyPool(
    keyPool: {
      updateAccountCredential(providerId: string, old: ProviderCredential, updated: ProviderCredential): void;
    },
    defaultProviderId: string,
  ): Promise<void> {
    const accountsByProvider = await this.getAllAccounts();

    for (const [providerId, accounts] of accountsByProvider) {
      for (const account of accounts) {
        keyPool.updateAccountCredential(providerId, account, account);
      }
    }

    if (!accountsByProvider.has(defaultProviderId)) {
      accountsByProvider.set(defaultProviderId, []);
    }
  }
}
