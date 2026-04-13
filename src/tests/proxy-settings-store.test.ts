import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import type { Sql } from "../lib/db/index.js";
import { ProxySettingsStore } from "../lib/proxy-settings-store.js";

function createMockSql(seed: Record<string, {
  fastMode: boolean;
  requestsPerMinute?: number | null;
  allowedProviderIds?: readonly string[] | null;
  disabledProviderIds?: readonly string[] | null;
}> = {}): {
  readonly sql: Sql;
  readonly values: Map<string, {
    fastMode: boolean;
    requestsPerMinute?: number | null;
    allowedProviderIds?: readonly string[] | null;
    disabledProviderIds?: readonly string[] | null;
  }>;
} {
  const values = new Map(Object.entries(seed));

  const sql = ((strings: TemplateStringsArray, ...params: readonly unknown[]) => {
    const query = strings.join("?").replace(/\s+/g, " ").trim();

    if (query.startsWith("SELECT value FROM config WHERE key = ?")) {
      const key = String(params[0]);
      const value = values.get(key);
      return Promise.resolve(value ? [{ value }] : []);
    }

    if (query.startsWith("INSERT INTO config (key, value, updated_at) VALUES (?, ?::jsonb, NOW()) ON CONFLICT (key) DO NOTHING")) {
      const key = String(params[0]);
      if (!values.has(key)) {
        values.set(key, JSON.parse(String(params[1])) as {
          fastMode: boolean;
          requestsPerMinute?: number | null;
          allowedProviderIds?: readonly string[] | null;
          disabledProviderIds?: readonly string[] | null;
        });
      }
      return Promise.resolve([]);
    }

    if (query.startsWith("INSERT INTO config (key, value, updated_at) VALUES (?, ?::jsonb, NOW()) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()")) {
      const key = String(params[0]);
      values.set(key, JSON.parse(String(params[1])) as {
        fastMode: boolean;
        requestsPerMinute?: number | null;
        allowedProviderIds?: readonly string[] | null;
        disabledProviderIds?: readonly string[] | null;
      });
      return Promise.resolve([]);
    }

    throw new Error(`Unsupported SQL query in test: ${query}`);
  }) as unknown as Sql;

  return { sql, values };
}

test("proxy settings store preserves file-backed default tenant behavior", async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "proxx-settings-store-"));
  const settingsPath = path.join(tempDir, "proxy-settings.json");
  await writeFile(settingsPath, JSON.stringify({ fastMode: true }), "utf8");

  const store = new ProxySettingsStore(settingsPath);
  try {
    await store.warmup();
    assert.deepEqual(store.get(), { fastMode: true, requestsPerMinute: null, allowedProviderIds: null, disabledProviderIds: null });
    assert.deepEqual(await store.getForTenant("default"), { fastMode: true, requestsPerMinute: null, allowedProviderIds: null, disabledProviderIds: null });
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("proxy settings store scopes SQL-backed settings by tenant", async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "proxx-settings-store-"));
  const settingsPath = path.join(tempDir, "proxy-settings.json");
  const mock = createMockSql({ proxy_settings: { fastMode: false, requestsPerMinute: null, allowedProviderIds: null, disabledProviderIds: null } });
  const store = new ProxySettingsStore(settingsPath, mock.sql);

  try {
    await store.warmup();
    await store.setForTenant({ fastMode: true, requestsPerMinute: 3, allowedProviderIds: ["factory"], disabledProviderIds: ["openai"] }, "acme");

    assert.deepEqual(await store.getForTenant("default"), { fastMode: false, requestsPerMinute: null, allowedProviderIds: null, disabledProviderIds: null });
    assert.deepEqual(await store.getForTenant("acme"), { fastMode: true, requestsPerMinute: 3, allowedProviderIds: ["factory"], disabledProviderIds: ["openai"] });
    assert.deepEqual(mock.values.get("proxy_settings"), { fastMode: false, requestsPerMinute: null, allowedProviderIds: null, disabledProviderIds: null });
    assert.deepEqual(mock.values.get("proxy_settings:acme"), { fastMode: true, requestsPerMinute: 3, allowedProviderIds: ["factory"], disabledProviderIds: ["openai"] });
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});
