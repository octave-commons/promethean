import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile, mkdir } from "node:fs/promises";
import { createCipheriv, randomBytes } from "node:crypto";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { loadConfig } from "../lib/config.js";
import { KeyPool, type ProviderAccountStore } from "../lib/key-pool.js";
import { decryptAuthV2, parseJwtExpiry } from "../lib/factory-auth.js";
import {
  resolveRequestRoutingState,
  hasModelPrefix,
  stripModelPrefix,
} from "../lib/provider-routing.js";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

async function withEnv(values: Record<string, string | undefined>, fn: () => Promise<void> | void): Promise<void> {
  const previous = new Map<string, string | undefined>();
  for (const [key, value] of Object.entries(values)) {
    previous.set(key, process.env[key]);
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }

  try {
    await fn();
  } finally {
    for (const [key, value] of previous.entries()) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
}

async function withKeysFile(payload: unknown, fn: (keysFilePath: string) => Promise<void>): Promise<void> {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "factory-config-test-"));
  const keysFilePath = path.join(tempDir, "keys.json");
  await writeFile(keysFilePath, JSON.stringify(payload, null, 2), "utf8");

  try {
    await fn(keysFilePath);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

function encryptAuthV2(keyBase64: string, data: { access_token: string; refresh_token: string }): string {
  const key = Buffer.from(keyBase64.trim(), "base64");
  const iv = randomBytes(16);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(data), "utf-8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString("base64")}:${authTag.toString("base64")}:${ciphertext.toString("base64")}`;
}

// --- VAL-CONFIG-001: Factory provider registered in provider base-URL map ---

test("defaultProviderBaseUrl returns https://api.factory.ai for factory", async () => {
  await withEnv(
    {
      PROXY_AUTH_TOKEN: "test-token",
      FACTORY_BASE_URL: undefined,
    },
    () => {
      const config = loadConfig("/tmp/factory-config-test");
      assert.equal(config.upstreamProviderBaseUrls["factory"], "https://api.factory.ai");
    },
  );
});

test("FACTORY_BASE_URL env var overrides factory base URL", async () => {
  await withEnv(
    {
      PROXY_AUTH_TOKEN: "test-token",
      FACTORY_BASE_URL: "https://custom.factory.example.com/api",
    },
    () => {
      const config = loadConfig("/tmp/factory-config-test");
      assert.equal(config.upstreamProviderBaseUrls["factory"], "https://custom.factory.example.com/api");
    },
  );
});

test("defaultProviderBaseUrl returns z.ai and mistral defaults", async () => {
  await withEnv(
    {
      PROXY_AUTH_TOKEN: "test-token",
      ZAI_BASE_URL: undefined,
      ZHIPU_BASE_URL: undefined,
      MISTRAL_BASE_URL: undefined,
    },
    () => {
      const config = loadConfig("/tmp/provider-config-test");
      assert.equal(config.upstreamProviderBaseUrls["zai"], "https://api.z.ai/api/paas/v4");
      assert.equal(config.upstreamProviderBaseUrls["mistral"], "https://api.mistral.ai/v1");
    },
  );
});

// --- VAL-CONFIG-002: FACTORY_API_KEY env var creates a factory provider in KeyPool ---

test("FACTORY_API_KEY env var creates factory provider in KeyPool", { concurrency: false }, async () => {
  await withEnv(
    {
      FACTORY_API_KEY: "fk-test-factory-key-123", // pragma: allowlist secret
      FACTORY_AUTH_V2_FILE: "/tmp/nonexistent-auth-v2-file",
      FACTORY_AUTH_V2_KEY: "/tmp/nonexistent-auth-v2-key",
    },
    async () => {
      await withKeysFile(
        {
          providers: {
            vivgrid: { accounts: ["vg-key-1"] },
          },
        },
        async (keysFilePath) => {
          const keyPool = new KeyPool({
            keysFilePath,
            reloadIntervalMs: 10,
            defaultCooldownMs: 1000,
            defaultProviderId: "vivgrid",
          });

          await keyPool.warmup();
          const factoryAccounts = await keyPool.getRequestOrder("factory");

          assert.equal(factoryAccounts.length, 1);
          assert.equal(factoryAccounts[0]?.providerId, "factory");
          assert.equal(factoryAccounts[0]?.token, "fk-test-factory-key-123");
          assert.equal(factoryAccounts[0]?.authType, "api_key");
          assert.ok(UUID_PATTERN.test(factoryAccounts[0]?.accountId ?? ""));
        },
      );
    },
  );
});

// --- VAL-CONFIG-003: Factory provider appears in fallback list when configured ---

test("Factory provider appears in fallback list when UPSTREAM_FALLBACK_PROVIDER_IDS includes factory", async () => {
  await withEnv(
    {
      PROXY_AUTH_TOKEN: "test-token",
      UPSTREAM_FALLBACK_PROVIDER_IDS: "factory,ollama-cloud",
    },
    () => {
      const config = loadConfig("/tmp/factory-config-test");
      assert.ok(config.upstreamFallbackProviderIds.includes("factory"));
    },
  );
});

// --- VAL-CONFIG-005: Factory provider excluded when in DISABLED_PROVIDER_IDS ---

test("Factory provider excluded when DISABLED_PROVIDER_IDS=factory", async () => {
  await withEnv(
    {
      PROXY_AUTH_TOKEN: "test-token",
      DISABLED_PROVIDER_IDS: "factory",
    },
    () => {
      const config = loadConfig("/tmp/factory-config-test");
      assert.ok(config.disabledProviderIds.includes("factory"));
    },
  );
});

// --- VAL-AUTH-008: Empty or malformed FACTORY_API_KEY logs warning, does not crash ---

test("empty FACTORY_API_KEY is skipped gracefully", { concurrency: false }, async () => {
  await withEnv(
    {
      FACTORY_API_KEY: "   ",
      FACTORY_AUTH_V2_FILE: "/tmp/nonexistent-auth-v2-file",
      FACTORY_AUTH_V2_KEY: "/tmp/nonexistent-auth-v2-key",
    },
    async () => {
      await withKeysFile(
        {
          providers: {
            vivgrid: { accounts: ["vg-key-1"] },
          },
        },
        async (keysFilePath) => {
          const keyPool = new KeyPool({
            keysFilePath,
            reloadIntervalMs: 10,
            defaultCooldownMs: 1000,
            defaultProviderId: "vivgrid",
          });

          await keyPool.warmup();
          const factoryAccounts = await keyPool.getAllAccounts("factory");
          assert.equal(factoryAccounts.length, 0);
        },
      );
    },
  );
});

// --- Factory model prefix routing ---

test("factory/ prefix is recognized and strips prefix", () => {
  const prefixes = ["factory/", "factory:"];
  assert.ok(hasModelPrefix("factory/claude-opus-4-5", prefixes));
  assert.ok(hasModelPrefix("factory:gpt-5", prefixes));
  assert.ok(!hasModelPrefix("claude-opus-4-5", prefixes));
  assert.equal(stripModelPrefix("factory/claude-opus-4-5", prefixes), "claude-opus-4-5");
  assert.equal(stripModelPrefix("factory:gpt-5", prefixes), "gpt-5");
});

test("resolveRequestRoutingState recognizes factory/ prefix", async () => {
  await withEnv(
    {
      PROXY_AUTH_TOKEN: "test-token",
    },
    () => {
      const config = loadConfig("/tmp/factory-config-test");
      const state = resolveRequestRoutingState(config, "factory/claude-opus-4-5");

      assert.equal(state.factoryPrefixed, true);
      assert.equal(state.openAiPrefixed, false);
      assert.equal(state.explicitOllama, false);
      assert.equal(state.localOllama, false);
      assert.equal(state.routedModel, "claude-opus-4-5");
    },
  );
});

test("resolveRequestRoutingState recognizes factory: prefix", async () => {
  await withEnv(
    {
      PROXY_AUTH_TOKEN: "test-token",
    },
    () => {
      const config = loadConfig("/tmp/factory-config-test");
      const state = resolveRequestRoutingState(config, "factory:gpt-5");

      assert.equal(state.factoryPrefixed, true);
      assert.equal(state.routedModel, "gpt-5");
    },
  );
});

test("resolveRequestRoutingState does not set factoryPrefixed for non-factory models", async () => {
  await withEnv(
    {
      PROXY_AUTH_TOKEN: "test-token",
    },
    () => {
      const config = loadConfig("/tmp/factory-config-test");
      const state = resolveRequestRoutingState(config, "claude-opus-4-5");

      assert.equal(state.factoryPrefixed, false);
      assert.equal(state.routedModel, "claude-opus-4-5");
    },
  );
});

// --- Factory auth.v2 decryption ---

test("decryptAuthV2 correctly decrypts AES-256-GCM encrypted credentials", () => {
  const keyBase64 = randomBytes(32).toString("base64");
  const originalData = { access_token: "test-access-token-jwt", refresh_token: "test-refresh-token" };
  const encrypted = encryptAuthV2(keyBase64, originalData);

  const decrypted = decryptAuthV2(keyBase64, encrypted);
  assert.equal(decrypted.accessToken, "test-access-token-jwt");
  assert.equal(decrypted.refreshToken, "test-refresh-token");
});

test("decryptAuthV2 throws on invalid format", () => {
  const keyBase64 = randomBytes(32).toString("base64");
  assert.throws(() => decryptAuthV2(keyBase64, "invalid-content"), /Invalid auth\.v2\.file format/);
});

test("decryptAuthV2 throws on wrong key", () => {
  const originalKey = randomBytes(32).toString("base64");
  const wrongKey = randomBytes(32).toString("base64");
  const originalData = { access_token: "test-token", refresh_token: "test-refresh" };
  const encrypted = encryptAuthV2(originalKey, originalData);

  assert.throws(() => decryptAuthV2(wrongKey, encrypted));
});

// --- JWT expiry parsing ---

test("parseJwtExpiry extracts expiry from valid JWT", () => {
  const expSeconds = Math.floor(Date.now() / 1000) + 3600;
  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({ exp: expSeconds, sub: "test" })).toString("base64url");
  const signature = "test-signature";
  const jwt = `${header}.${payload}.${signature}`;

  const expiry = parseJwtExpiry(jwt);
  assert.equal(expiry, expSeconds * 1000);
});

test("parseJwtExpiry returns null for non-JWT token", () => {
  assert.equal(parseJwtExpiry("fk-some-api-key"), null);
  assert.equal(parseJwtExpiry("not-a-jwt"), null);
});

test("parseJwtExpiry returns null for JWT without exp claim", () => {
  const header = Buffer.from(JSON.stringify({ alg: "RS256" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({ sub: "test" })).toString("base64url");
  const jwt = `${header}.${payload}.signature`;

  assert.equal(parseJwtExpiry(jwt), null);
});

// --- VAL-AUTH-007: Env var and OAuth credentials coexist ---

test("FACTORY_API_KEY and file-based factory keys coexist in KeyPool", { concurrency: false }, async () => {
  await withEnv(
    {
      FACTORY_API_KEY: "fk-env-key", // pragma: allowlist secret
      FACTORY_AUTH_V2_FILE: "/tmp/nonexistent-auth-v2-file",
      FACTORY_AUTH_V2_KEY: "/tmp/nonexistent-auth-v2-key",
    },
    async () => {
      await withKeysFile(
        {
          providers: {
            vivgrid: { accounts: ["vg-key-1"] },
            factory: {
              auth: "api_key",
              accounts: ["fk-file-key"],
            },
          },
        },
        async (keysFilePath) => {
          const keyPool = new KeyPool({
            keysFilePath,
            reloadIntervalMs: 10,
            defaultCooldownMs: 1000,
            defaultProviderId: "vivgrid",
          });

          await keyPool.warmup();
          const factoryAccounts = await keyPool.getRequestOrder("factory");

          assert.equal(factoryAccounts.length, 2);
          const tokens = new Set(factoryAccounts.map((a) => a.token));
          assert.ok(tokens.has("fk-env-key"));
          assert.ok(tokens.has("fk-file-key"));
        },
      );
    },
  );
});

test("DB-backed KeyPool ignores keys.json and inline keys JSON at runtime", { concurrency: false }, async () => {
  const accountStore: ProviderAccountStore = {
    async getAllProviders() {
      return new Map([
        ["openai", { authType: "oauth_bearer" }],
      ]);
    },
    async getAllAccounts() {
      return new Map([
        ["openai", [{
          providerId: "openai",
          accountId: "db-openai-1",
          token: "db-openai-token",
          authType: "oauth_bearer",
        }]],
      ]);
    },
  };

  await withEnv(
    {
      PROXY_KEYS_JSON: JSON.stringify({
        providers: {
          vivgrid: { accounts: ["inline-vivgrid-token"] },
        },
      }),
      FACTORY_API_KEY: undefined,
      FACTORY_AUTH_V2_FILE: "/tmp/nonexistent-auth-v2-file",
      FACTORY_AUTH_V2_KEY: "/tmp/nonexistent-auth-v2-key",
      GEMINI_API_KEY: undefined,
      OPENROUTER_API_KEY: undefined,
      REQUESTY_API_KEY: undefined,
      REQUESTY_API_TOKEN: undefined,
    },
    async () => {
      await withKeysFile(
        {
          providers: {
            requesty: { accounts: ["file-requesty-token"] },
          },
        },
        async (keysFilePath) => {
          const keyPool = new KeyPool({
            keysFilePath,
            reloadIntervalMs: 10,
            defaultCooldownMs: 1000,
            defaultProviderId: "openai",
            accountStore,
            preferAccountStoreProviders: true,
          });

          await keyPool.warmup();

          const openAiAccounts = await keyPool.getAllAccounts("openai");
          assert.equal(openAiAccounts.length, 1);
          assert.equal(openAiAccounts[0]?.token, "db-openai-token");

          const requestyAccounts = await keyPool.getAllAccounts("requesty");
          const vivgridAccounts = await keyPool.getAllAccounts("vivgrid");

          assert.equal(requestyAccounts.length, 0);
          assert.equal(vivgridAccounts.length, 0);
        },
      );
    },
  );
});

// --- VAL-AUTH-004: OAuth tokens loaded from encrypted auth.v2 ---

test("decryptAuthV2 round-trips correctly with encryptAuthV2", () => {
  const keyBase64 = randomBytes(32).toString("base64");
  const data = {
    access_token: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0IiwiZXhwIjoxNzAwMDAwMDAwfQ.sig", // pragma: allowlist secret
    refresh_token: "refresh-token-value",
  };

  const encrypted = encryptAuthV2(keyBase64, data);
  const decrypted = decryptAuthV2(keyBase64, encrypted);

  assert.equal(decrypted.accessToken, data.access_token);
  assert.equal(decrypted.refreshToken, data.refresh_token);
});

// --- VAL-AUTH-004: OAuth tokens loaded from mock encrypted auth.v2 ---

test("OAuth tokens loaded from encrypted auth.v2 files into KeyPool", { concurrency: false }, async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "factory-auth-v2-test-"));
  const keyBase64 = randomBytes(32).toString("base64");
  const expSeconds = Math.floor(Date.now() / 1000) + 7200; // 2 hours from now
  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({ exp: expSeconds, sub: "test-user" })).toString("base64url");
  const fakeJwt = `${header}.${payload}.fake-signature`;
  const authData = { access_token: fakeJwt, refresh_token: "test-refresh-token" };
  const encrypted = encryptAuthV2(keyBase64, authData);

  const authV2FilePath = path.join(tempDir, "auth.v2.file");
  const authV2KeyPath = path.join(tempDir, "auth.v2.key");
  await writeFile(authV2FilePath, encrypted, "utf8");
  await writeFile(authV2KeyPath, keyBase64, "utf8");

  try {
    await withEnv(
      {
        FACTORY_API_KEY: undefined,
        FACTORY_AUTH_V2_FILE: authV2FilePath,
        FACTORY_AUTH_V2_KEY: authV2KeyPath,
      },
      async () => {
        await withKeysFile(
          {
            providers: {
              vivgrid: { accounts: ["vg-key-1"] },
            },
          },
          async (keysFilePath) => {
            const keyPool = new KeyPool({
              keysFilePath,
              reloadIntervalMs: 10,
              defaultCooldownMs: 1000,
              defaultProviderId: "vivgrid",
            });

            await keyPool.warmup();
            const factoryAccounts = await keyPool.getRequestOrder("factory");

            assert.equal(factoryAccounts.length, 1);
            assert.equal(factoryAccounts[0]?.token, fakeJwt);
            assert.equal(factoryAccounts[0]?.authType, "oauth_bearer");
            assert.equal(factoryAccounts[0]?.providerId, "factory");
            assert.equal(factoryAccounts[0]?.refreshToken, "test-refresh-token");
            assert.equal(factoryAccounts[0]?.expiresAt, expSeconds * 1000);
          },
        );
      },
    );
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

// --- VAL-AUTH-007 (full): Both fk- key and OAuth token coexist ---

test("fk- API key and OAuth token coexist as separate accounts under factory", { concurrency: false }, async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "factory-auth-coexist-test-"));
  const keyBase64 = randomBytes(32).toString("base64");
  const expSeconds = Math.floor(Date.now() / 1000) + 7200;
  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({ exp: expSeconds, sub: "test-user" })).toString("base64url");
  const fakeJwt = `${header}.${payload}.fake-signature`;
  const authData = { access_token: fakeJwt, refresh_token: "test-refresh" };
  const encrypted = encryptAuthV2(keyBase64, authData);

  const authV2FilePath = path.join(tempDir, "auth.v2.file");
  const authV2KeyPath = path.join(tempDir, "auth.v2.key");
  await writeFile(authV2FilePath, encrypted, "utf8");
  await writeFile(authV2KeyPath, keyBase64, "utf8");

  try {
    await withEnv(
      {
        FACTORY_API_KEY: "fk-my-api-key", // pragma: allowlist secret
        FACTORY_AUTH_V2_FILE: authV2FilePath,
        FACTORY_AUTH_V2_KEY: authV2KeyPath,
      },
      async () => {
        await withKeysFile(
          {
            providers: {
              vivgrid: { accounts: ["vg-key-1"] },
            },
          },
          async (keysFilePath) => {
            const keyPool = new KeyPool({
              keysFilePath,
              reloadIntervalMs: 10,
              defaultCooldownMs: 1000,
              defaultProviderId: "vivgrid",
            });

            await keyPool.warmup();
            const factoryAccounts = await keyPool.getRequestOrder("factory");

            assert.equal(factoryAccounts.length, 2);
            const apiKeyAccount = factoryAccounts.find((a) => a.authType === "api_key");
            const oauthAccount = factoryAccounts.find((a) => a.authType === "oauth_bearer");

            assert.ok(apiKeyAccount);
            assert.equal(apiKeyAccount.token, "fk-my-api-key");
            assert.equal(apiKeyAccount.providerId, "factory");

            assert.ok(oauthAccount);
            assert.equal(oauthAccount.token, fakeJwt);
            assert.equal(oauthAccount.providerId, "factory");
            assert.equal(oauthAccount.refreshToken, "test-refresh");
          },
        );
      },
    );
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

// --- factoryModelPrefixes config ---

test("factoryModelPrefixes defaults to factory/ and factory:", async () => {
  await withEnv(
    {
      PROXY_AUTH_TOKEN: "test-token",
      FACTORY_MODEL_PREFIXES: undefined,
    },
    () => {
      const config = loadConfig("/tmp/factory-config-test");
      assert.deepEqual([...config.factoryModelPrefixes], ["factory/", "factory:"]);
    },
  );
});

test("FACTORY_MODEL_PREFIXES env var overrides factory prefixes", async () => {
  await withEnv(
    {
      PROXY_AUTH_TOKEN: "test-token",
      FACTORY_MODEL_PREFIXES: "fai/,fai:",
    },
    () => {
      const config = loadConfig("/tmp/factory-config-test");
      assert.deepEqual([...config.factoryModelPrefixes], ["fai/", "fai:"]);
    },
  );
});

// --- VAL-AUTH-001: fk- API keys accepted for Factory requests ---

test("fk- prefixed API key loads into KeyPool under factory provider", { concurrency: false }, async () => {
  await withEnv(
    {
      FACTORY_API_KEY: "fk-abcdef123456", // pragma: allowlist secret
      FACTORY_AUTH_V2_FILE: "/tmp/nonexistent-auth-v2-file",
      FACTORY_AUTH_V2_KEY: "/tmp/nonexistent-auth-v2-key",
    },
    async () => {
      await withKeysFile(
        {
          providers: {
            vivgrid: { accounts: ["vg-key-1"] },
          },
        },
        async (keysFilePath) => {
          const keyPool = new KeyPool({
            keysFilePath,
            reloadIntervalMs: 10,
            defaultCooldownMs: 1000,
            defaultProviderId: "vivgrid",
          });

          await keyPool.warmup();
          const factoryAccounts = await keyPool.getRequestOrder("factory");

          assert.equal(factoryAccounts.length, 1);
          assert.equal(factoryAccounts[0]?.token, "fk-abcdef123456");
          assert.equal(factoryAccounts[0]?.authType, "api_key");
          assert.equal(factoryAccounts[0]?.providerId, "factory");
        },
      );
    },
  );
});

// --- factory/ prefix takes precedence over openai/ and ollama/ ---

test("factory/ prefix takes precedence over other prefix patterns", async () => {
  await withEnv(
    {
      PROXY_AUTH_TOKEN: "test-token",
    },
    () => {
      const config = loadConfig("/tmp/factory-config-test");

      // factory/ prefix should be recognized as factory, not openai or ollama
      const state = resolveRequestRoutingState(config, "factory/openai/gpt-5");
      assert.equal(state.factoryPrefixed, true);
      assert.equal(state.openAiPrefixed, false);
      assert.equal(state.explicitOllama, false);
      assert.equal(state.routedModel, "openai/gpt-5");
    },
  );
});
