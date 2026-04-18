import { dirname } from "node:path";
import { mkdir, readFile, writeFile } from "node:fs/promises";

import type { Sql } from "./db/index.js";
import { DEFAULT_TENANT_ID, normalizeTenantId } from "./tenant-api-key.js";

export interface ProxySettings {
  readonly fastMode: boolean;
  readonly requestsPerMinute: number | null;
  readonly allowedProviderIds: readonly string[] | null;
  readonly disabledProviderIds: readonly string[] | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

const CONFIG_KEY = "proxy_settings";

function normalizeProviderIdList(value: unknown): readonly string[] | null {
  if (value === null) {
    return null;
  }

  if (!Array.isArray(value)) {
    return null;
  }

  const normalized = [...new Set(
    value
      .filter((entry): entry is string => typeof entry === "string")
      .map((entry) => entry.trim().toLowerCase())
      .filter((entry) => entry.length > 0)
  )];

  return normalized.length > 0 ? normalized : null;
}

function normalizeSettings(value: unknown): ProxySettings {
  if (!isRecord(value)) {
    return { fastMode: false, requestsPerMinute: null, allowedProviderIds: null, disabledProviderIds: null };
  }

  const rawRequestsPerMinute = typeof value.requestsPerMinute === "number" && Number.isFinite(value.requestsPerMinute)
    ? Math.max(1, Math.floor(value.requestsPerMinute))
    : value.requestsPerMinute === null
      ? null
      : undefined;

  return {
    fastMode: typeof value.fastMode === "boolean" ? value.fastMode : false,
    requestsPerMinute: rawRequestsPerMinute ?? null,
    allowedProviderIds: normalizeProviderIdList(value.allowedProviderIds),
    disabledProviderIds: normalizeProviderIdList(value.disabledProviderIds),
  };
}

function normalizeSettingsTenantId(tenantId?: string): string {
  if (typeof tenantId !== "string" || tenantId.trim().length === 0) {
    return DEFAULT_TENANT_ID;
  }

  return normalizeTenantId(tenantId);
}

function configKeyForTenant(tenantId: string): string {
  return tenantId === DEFAULT_TENANT_ID ? CONFIG_KEY : `${CONFIG_KEY}:${tenantId}`;
}

export class ProxySettingsStore {
  private readonly settingsByTenant = new Map<string, ProxySettings>([
    [DEFAULT_TENANT_ID, { fastMode: false, requestsPerMinute: null, allowedProviderIds: null, disabledProviderIds: null }],
  ]);

  public constructor(
    private readonly filePath: string,
    private readonly sql?: Sql,
  ) {}

  public async warmup(): Promise<void> {
    const defaultSettings = await this.loadDefaultSettings();
    this.settingsByTenant.set(DEFAULT_TENANT_ID, defaultSettings);
  }

  private async loadDefaultSettings(): Promise<ProxySettings> {
    if (this.sql) {
      try {
        const rows = await this.sql<Array<{ value: ProxySettings }>>`
          SELECT value FROM config WHERE key = ${configKeyForTenant(DEFAULT_TENANT_ID)}
        `;
        if (rows.length > 0) {
          return normalizeSettings(rows[0]!.value);
        }
      } catch {
        return { fastMode: false, requestsPerMinute: null, allowedProviderIds: null, disabledProviderIds: null };
      }

      try {
        const raw = await readFile(this.filePath, "utf8");
        const parsed: unknown = JSON.parse(raw);
        const settings = normalizeSettings(parsed);

        try {
          await this.sql`
            INSERT INTO config (key, value, updated_at)
            VALUES (${configKeyForTenant(DEFAULT_TENANT_ID)}, ${JSON.stringify(settings)}::jsonb, NOW())
            ON CONFLICT (key) DO NOTHING
          `;
        } catch {
          // ignore seed failure
        }

        return settings;
      } catch {
        return { fastMode: false, requestsPerMinute: null, allowedProviderIds: null, disabledProviderIds: null };
      }
    }

    try {
      const raw = await readFile(this.filePath, "utf8");
      return normalizeSettings(JSON.parse(raw) as unknown);
    } catch {
      return { fastMode: false, requestsPerMinute: null, allowedProviderIds: null, disabledProviderIds: null };
    }
  }

  public get(): ProxySettings {
    return { ...(this.settingsByTenant.get(DEFAULT_TENANT_ID) ?? { fastMode: false, requestsPerMinute: null, allowedProviderIds: null, disabledProviderIds: null }) };
  }

  public async getForTenant(tenantId?: string): Promise<ProxySettings> {
    const normalizedTenantId = normalizeSettingsTenantId(tenantId);
    const cached = this.settingsByTenant.get(normalizedTenantId);
    if (cached) {
      return { ...cached };
    }

    if (this.sql) {
      try {
        const rows = await this.sql<Array<{ value: ProxySettings }>>`
          SELECT value FROM config WHERE key = ${configKeyForTenant(normalizedTenantId)}
        `;
        const row = rows[0];
        if (row) {
          const loaded = normalizeSettings(row.value);
          this.settingsByTenant.set(normalizedTenantId, loaded);
          return { ...loaded };
        }
      } catch {
        // Fall back to defaults when tenant lookup fails.
      }
    }

    const fallback = this.settingsByTenant.get(DEFAULT_TENANT_ID) ?? { fastMode: false, requestsPerMinute: null, allowedProviderIds: null, disabledProviderIds: null };
    this.settingsByTenant.set(normalizedTenantId, fallback);
    return { ...fallback };
  }

  public async set(next: Partial<ProxySettings>): Promise<ProxySettings> {
    return this.setForTenant(next, DEFAULT_TENANT_ID);
  }

  public async setForTenant(next: Partial<ProxySettings>, tenantId?: string): Promise<ProxySettings> {
    const normalizedTenantId = normalizeSettingsTenantId(tenantId);
    const currentSettings = await this.getForTenant(normalizedTenantId);
    const mergedSettings: ProxySettings = {
      ...currentSettings,
      ...next,
    };
    this.settingsByTenant.set(normalizedTenantId, mergedSettings);

    if (this.sql) {
      try {
        await this.sql`
          INSERT INTO config (key, value, updated_at)
          VALUES (${configKeyForTenant(normalizedTenantId)}, ${JSON.stringify(mergedSettings)}::jsonb, NOW())
          ON CONFLICT (key) DO UPDATE SET
            value = EXCLUDED.value,
            updated_at = NOW()
        `;
        return { ...mergedSettings };
      } catch {
        return { ...mergedSettings };
      }
    }

    try {
      await mkdir(dirname(this.filePath), { recursive: true });
      if (normalizedTenantId === DEFAULT_TENANT_ID) {
        await writeFile(this.filePath, JSON.stringify(mergedSettings, null, 2), "utf8");
      }
    } catch {
      // Read-only filesystem; settings are still in memory
    }

    return { ...mergedSettings };
  }
}
