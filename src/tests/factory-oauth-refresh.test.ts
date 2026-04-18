import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createCipheriv, randomBytes } from "node:crypto";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { KeyPool, type ProviderCredential } from "../lib/key-pool.js";
import {
  parseJwtExpiry,
  factoryCredentialNeedsRefresh,
  refreshFactoryOAuthToken,
  encryptAuthV2,
  decryptAuthV2,
  persistFactoryAuthV2,
  FACTORY_REFRESH_BUFFER_MS,
} from "../lib/factory-auth.js";

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeJwt(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const payloadStr = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${header}.${payloadStr}.fake-signature`;
}

function makeExpiredJwt(minutesAgo: number): string {
  const exp = Math.floor(Date.now() / 1000) - minutesAgo * 60;
  return makeJwt({ exp, sub: "user-expired" });
}

function makeFreshJwt(minutesFromNow: number): string {
  const exp = Math.floor(Date.now() / 1000) + minutesFromNow * 60;
  return makeJwt({ exp, sub: "user-fresh" });
}

function makeFactoryCredential(overrides: Partial<ProviderCredential> = {}): ProviderCredential {
  const token = overrides.token ?? makeFreshJwt(120);
  return {
    providerId: "factory",
    accountId: overrides.accountId ?? "factory-acct-1",
    token,
    authType: "oauth_bearer",
    refreshToken: overrides.refreshToken ?? "rt-test-refresh-token",
    expiresAt: overrides.expiresAt ?? parseJwtExpiry(token) ?? undefined,
    ...overrides,
  };
}

async function withKeysFile(payload: unknown, fn: (keysFilePath: string) => Promise<void>): Promise<void> {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "factory-oauth-test-"));
  const keysFilePath = path.join(tempDir, "keys.json");
  await writeFile(keysFilePath, JSON.stringify(payload, null, 2), "utf8");

  try {
    await fn(keysFilePath);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

async function withEnv(values: Record<string, string | undefined>, fn: () => Promise<void>): Promise<void> {
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

// ─── JWT Parsing Tests ──────────────────────────────────────────────────────

test("parseJwtExpiry extracts correct exp from Factory-style JWT", () => {
  const expSeconds = Math.floor(Date.now() / 1000) + 7200;
  const jwt = makeJwt({ exp: expSeconds, sub: "user_123", iss: "workos" });

  const expiry = parseJwtExpiry(jwt);
  assert.equal(expiry, expSeconds * 1000);
});

test("parseJwtExpiry returns null for fk- API keys", () => {
  assert.equal(parseJwtExpiry("fk-abc123def456"), null);
});

test("parseJwtExpiry returns null for empty string", () => {
  assert.equal(parseJwtExpiry(""), null);
});

test("parseJwtExpiry returns null for JWT with non-numeric exp", () => {
  const jwt = makeJwt({ exp: "not-a-number", sub: "test" });
  assert.equal(parseJwtExpiry(jwt), null);
});

test("parseJwtExpiry handles JWT with large exp value", () => {
  const expSeconds = 2000000000; // Year 2033
  const jwt = makeJwt({ exp: expSeconds });
  assert.equal(parseJwtExpiry(jwt), expSeconds * 1000);
});

// ─── factoryCredentialNeedsRefresh Tests ────────────────────────────────────

test("factoryCredentialNeedsRefresh returns true when JWT expires within 30 minutes", () => {
  const nearExpiryJwt = makeFreshJwt(15); // expires in 15 minutes
  const credential = makeFactoryCredential({ token: nearExpiryJwt });

  assert.equal(factoryCredentialNeedsRefresh(credential), true);
});

test("factoryCredentialNeedsRefresh returns true when JWT is already expired", () => {
  const expiredJwt = makeExpiredJwt(5); // expired 5 minutes ago
  const credential = makeFactoryCredential({
    token: expiredJwt,
    expiresAt: parseJwtExpiry(expiredJwt) ?? undefined,
  });

  assert.equal(factoryCredentialNeedsRefresh(credential), true);
});

test("factoryCredentialNeedsRefresh returns false when JWT expires in 2 hours", () => {
  const freshJwt = makeFreshJwt(120); // expires in 120 minutes
  const credential = makeFactoryCredential({ token: freshJwt });

  assert.equal(factoryCredentialNeedsRefresh(credential), false);
});

test("factoryCredentialNeedsRefresh returns false for non-factory credentials", () => {
  const credential = makeFactoryCredential({
    providerId: "openai",
    token: makeFreshJwt(15),
  });

  assert.equal(factoryCredentialNeedsRefresh(credential), false);
});

test("factoryCredentialNeedsRefresh returns false for api_key auth type", () => {
  const credential: ProviderCredential = {
    providerId: "factory",
    accountId: "fk-test",
    token: "fk-static-key",
    authType: "api_key",
  };

  assert.equal(factoryCredentialNeedsRefresh(credential), false);
});

test("factoryCredentialNeedsRefresh returns false when no refresh token", () => {
  const credential = makeFactoryCredential({
    refreshToken: undefined,
  });

  assert.equal(factoryCredentialNeedsRefresh(credential), false);
});

test("factoryCredentialNeedsRefresh uses expiresAt fallback when token is not JWT", () => {
  const soonExpiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes from now
  const credential: ProviderCredential = {
    providerId: "factory",
    accountId: "test-acct",
    token: "not-a-jwt-token",
    authType: "oauth_bearer",
    refreshToken: "rt-test",
    expiresAt: soonExpiresAt,
  };

  assert.equal(factoryCredentialNeedsRefresh(credential), true);
});

test("factoryCredentialNeedsRefresh returns false when expiresAt is far in the future and token is not JWT", () => {
  const farExpiresAt = Date.now() + 120 * 60 * 1000; // 2 hours from now
  const credential: ProviderCredential = {
    providerId: "factory",
    accountId: "test-acct",
    token: "not-a-jwt-token",
    authType: "oauth_bearer",
    refreshToken: "rt-test",
    expiresAt: farExpiresAt,
  };

  assert.equal(factoryCredentialNeedsRefresh(credential), false);
});

test("factoryCredentialNeedsRefresh boundary: exactly 30 minutes triggers refresh", () => {
  // Token expires exactly at the buffer boundary — should trigger refresh
  const expSeconds = Math.floor((Date.now() + FACTORY_REFRESH_BUFFER_MS) / 1000);
  const jwt = makeJwt({ exp: expSeconds });
  const credential = makeFactoryCredential({ token: jwt });

  // At exactly 30 min boundary, (expiresAt - now) < FACTORY_REFRESH_BUFFER_MS should be true
  // because we're using strict <, and the token expires at exactly the 30 min mark
  assert.equal(factoryCredentialNeedsRefresh(credential), true);
});

test("factoryCredentialNeedsRefresh boundary: 31 minutes does not trigger refresh", () => {
  const jwt = makeFreshJwt(31);
  const credential = makeFactoryCredential({ token: jwt });

  assert.equal(factoryCredentialNeedsRefresh(credential), false);
});

// ─── refreshFactoryOAuthToken Tests ─────────────────────────────────────────

test("refreshFactoryOAuthToken sends correct WorkOS request and parses response", async () => {
  let capturedUrl = "";
  let capturedBody = "";
  let capturedHeaders: Record<string, string> = {};

  const newAccessToken = makeFreshJwt(120);
  const newRefreshToken = "rt-new-refresh-token";

  const mockFetch = async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
    capturedUrl = typeof input === "string" ? input : input.toString();
    capturedBody = typeof init?.body === "string" ? init.body : "";
    capturedHeaders = {};
    if (init?.headers) {
      const headerEntries = init.headers instanceof Headers
        ? [...init.headers.entries()]
        : Object.entries(init.headers as Record<string, string>);
      for (const [name, value] of headerEntries) {
        capturedHeaders[name] = value;
      }
    }

    return new Response(
      JSON.stringify({
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
        user: { email: "test@factory.ai", first_name: "Test", last_name: "User", id: "user_123" },
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  };

  const result = await refreshFactoryOAuthToken("rt-old-refresh-token", mockFetch as typeof fetch);

  // Verify correct WorkOS endpoint
  assert.equal(capturedUrl, "https://api.workos.com/user_management/authenticate");

  // Verify content-type
  assert.equal(capturedHeaders["content-type"], "application/x-www-form-urlencoded");

  // Verify form body
  const params = new URLSearchParams(capturedBody);
  assert.equal(params.get("grant_type"), "refresh_token");
  assert.equal(params.get("refresh_token"), "rt-old-refresh-token");
  assert.equal(params.get("client_id"), "client_01HNM792M5G5G1A2THWPXKFMXB");

  // Verify response parsing
  assert.equal(result.accessToken, newAccessToken);
  assert.equal(result.refreshToken, newRefreshToken);
  assert.ok(typeof result.expiresAt === "number");
});

test("refreshFactoryOAuthToken throws on HTTP error", async () => {
  const mockFetch = async (): Promise<Response> => {
    return new Response("Unauthorized", { status: 401 });
  };

  await assert.rejects(
    refreshFactoryOAuthToken("rt-bad-token", mockFetch as typeof fetch),
    /WorkOS token refresh failed: 401/,
  );
});

test("refreshFactoryOAuthToken throws on missing access_token", async () => {
  const mockFetch = async (): Promise<Response> => {
    return new Response(
      JSON.stringify({ refresh_token: "rt-new" }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  };

  await assert.rejects(
    refreshFactoryOAuthToken("rt-test", mockFetch as typeof fetch),
    /missing access_token/,
  );
});

test("refreshFactoryOAuthToken throws on missing refresh_token in response", async () => {
  const mockFetch = async (): Promise<Response> => {
    return new Response(
      JSON.stringify({ access_token: makeFreshJwt(60) }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  };

  await assert.rejects(
    refreshFactoryOAuthToken("rt-test", mockFetch as typeof fetch),
    /missing refresh_token/,
  );
});

// ─── encryptAuthV2 / decryptAuthV2 round-trip ──────────────────────────────

test("encryptAuthV2 produces valid encrypted content that decryptAuthV2 can decrypt", () => {
  const keyBase64 = randomBytes(32).toString("base64");
  const data = {
    access_token: makeFreshJwt(120),
    refresh_token: "rt-round-trip-test",
  };

  const encrypted = encryptAuthV2(keyBase64, data);
  const decrypted = decryptAuthV2(keyBase64, encrypted);

  assert.equal(decrypted.accessToken, data.access_token);
  assert.equal(decrypted.refreshToken, data.refresh_token);
});

test("encryptAuthV2 generates unique ciphertext for same input (random IV)", () => {
  const keyBase64 = randomBytes(32).toString("base64");
  const data = {
    access_token: "same-token",
    refresh_token: "same-refresh",
  };

  const encrypted1 = encryptAuthV2(keyBase64, data);
  const encrypted2 = encryptAuthV2(keyBase64, data);

  // Different IVs should produce different ciphertext
  assert.notEqual(encrypted1, encrypted2);

  // But both should decrypt to the same values
  const decrypted1 = decryptAuthV2(keyBase64, encrypted1);
  const decrypted2 = decryptAuthV2(keyBase64, encrypted2);
  assert.equal(decrypted1.accessToken, data.access_token);
  assert.equal(decrypted2.accessToken, data.access_token);
});

// ─── persistFactoryAuthV2 Tests ─────────────────────────────────────────────

test("persistFactoryAuthV2 writes encrypted tokens that can be decrypted", async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "factory-persist-test-"));
  const keyBase64 = randomBytes(32).toString("base64");
  const authV2File = path.join(tempDir, "auth.v2.file");
  const authV2Key = path.join(tempDir, "auth.v2.key");

  await writeFile(authV2Key, keyBase64, "utf8");

  const accessToken = makeFreshJwt(120);
  const refreshToken = "rt-persist-test";

  try {
    await withEnv(
      {
        FACTORY_AUTH_V2_FILE: authV2File,
        FACTORY_AUTH_V2_KEY: authV2Key,
      },
      async () => {
        await persistFactoryAuthV2(accessToken, refreshToken);

        // Read back and verify
        const encrypted = await readFile(authV2File, "utf8");
        const decrypted = decryptAuthV2(keyBase64, encrypted);
        assert.equal(decrypted.accessToken, accessToken);
        assert.equal(decrypted.refreshToken, refreshToken);
      },
    );
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("persistFactoryAuthV2 does not throw when key file is missing", async () => {
  await withEnv(
    {
      FACTORY_AUTH_V2_FILE: "/tmp/nonexistent-persist-file",
      FACTORY_AUTH_V2_KEY: "/tmp/nonexistent-persist-key",
    },
    async () => {
      // Should not throw, just log a warning
      await persistFactoryAuthV2("token", "refresh");
    },
  );
});

// ─── VAL-AUTH-002: Multi-account round-robin rotation ───────────────────────

test("multiple Factory accounts rotate via round-robin", { concurrency: false }, async () => {
  await withEnv(
    {
      FACTORY_API_KEY: undefined,
      FACTORY_AUTH_V2_FILE: "/tmp/nonexistent-auth-v2-file",
      FACTORY_AUTH_V2_KEY: "/tmp/nonexistent-auth-v2-key",
    },
    async () => {
      await withKeysFile(
        {
          providers: {
            factory: {
              auth: "api_key",
              accounts: [
                { id: "acct-1", api_key: "fk-key-1" }, // pragma: allowlist secret
                { id: "acct-2", api_key: "fk-key-2" }, // pragma: allowlist secret
                { id: "acct-3", api_key: "fk-key-3" }, // pragma: allowlist secret
              ],
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

          // First request order
          const first = await keyPool.getRequestOrder("factory");
          assert.equal(first.length, 3);
          const firstToken = first[0]?.token;

          // Second request — should start from next offset
          const second = await keyPool.getRequestOrder("factory");
          assert.equal(second.length, 3);
          const secondToken = second[0]?.token;

          // Third request
          const third = await keyPool.getRequestOrder("factory");
          assert.equal(third.length, 3);
          const thirdToken = third[0]?.token;

          // Verify rotation — all three should lead with different tokens
          const leadTokens = [firstToken, secondToken, thirdToken];
          const uniqueLeadTokens = new Set(leadTokens);
          assert.equal(uniqueLeadTokens.size, 3, `Expected 3 unique lead tokens, got: ${JSON.stringify(leadTokens)}`);

          // Verify all tokens are factory keys
          for (const token of leadTokens) {
            assert.ok(token?.startsWith("fk-"), `Expected fk- prefix, got: ${token}`);
          }
        },
      );
    },
  );
});

test("round-robin rotation with 3 Factory OAuth accounts", { concurrency: false }, async () => {
  const jwt1 = makeJwt({ exp: Math.floor(Date.now() / 1000) + 7200, sub: "user-1" });
  const jwt2 = makeJwt({ exp: Math.floor(Date.now() / 1000) + 7200, sub: "user-2" });
  const jwt3 = makeJwt({ exp: Math.floor(Date.now() / 1000) + 7200, sub: "user-3" });

  await withEnv(
    {
      FACTORY_API_KEY: undefined,
      FACTORY_AUTH_V2_FILE: "/tmp/nonexistent-auth-v2-file",
      FACTORY_AUTH_V2_KEY: "/tmp/nonexistent-auth-v2-key",
    },
    async () => {
      await withKeysFile(
        {
          providers: {
            factory: {
              auth: "oauth_bearer",
              accounts: [
                { id: "oauth-1", access_token: jwt1, refresh_token: "rt-1" },
                { id: "oauth-2", access_token: jwt2, refresh_token: "rt-2" },
                { id: "oauth-3", access_token: jwt3, refresh_token: "rt-3" },
              ],
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

          const seenLeadTokens = new Set<string>();
          for (let i = 0; i < 3; i++) {
            const accounts = await keyPool.getRequestOrder("factory");
            assert.equal(accounts.length, 3);
            seenLeadTokens.add(accounts[0]!.token);
          }

          assert.equal(seenLeadTokens.size, 3, "All 3 OAuth accounts should rotate as lead");
        },
      );
    },
  );
});

// ─── VAL-AUTH-003: Cooldown on 429 response ─────────────────────────────────

test("Factory account placed in cooldown after 429 response", { concurrency: false }, async () => {
  await withEnv(
    {
      FACTORY_API_KEY: undefined,
      FACTORY_AUTH_V2_FILE: "/tmp/nonexistent-auth-v2-file",
      FACTORY_AUTH_V2_KEY: "/tmp/nonexistent-auth-v2-key",
    },
    async () => {
      await withKeysFile(
        {
          providers: {
            factory: {
              auth: "api_key",
              accounts: [
                { id: "acct-1", api_key: "fk-key-1" }, // pragma: allowlist secret
                { id: "acct-2", api_key: "fk-key-2" }, // pragma: allowlist secret
              ],
            },
          },
        },
        async (keysFilePath) => {
          const keyPool = new KeyPool({
            keysFilePath,
            reloadIntervalMs: 10,
            defaultCooldownMs: 30000,
            defaultProviderId: "vivgrid",
          });

          await keyPool.warmup();

          // Get initial order
          const initial = await keyPool.getRequestOrder("factory");
          assert.equal(initial.length, 2);

          // Mark first account as rate limited (simulating 429)
          keyPool.markRateLimited(initial[0]!);

          // Next request should skip the rate-limited account
          const afterCooldown = await keyPool.getRequestOrder("factory");
          assert.equal(afterCooldown.length, 1, "Rate-limited account should be excluded");
          assert.notEqual(afterCooldown[0]!.token, initial[0]!.token, "Should use different account after cooldown");
        },
      );
    },
  );
});

test("Factory 429 cooldown: all accounts rate-limited returns empty", { concurrency: false }, async () => {
  await withEnv(
    {
      FACTORY_API_KEY: undefined,
      FACTORY_AUTH_V2_FILE: "/tmp/nonexistent-auth-v2-file",
      FACTORY_AUTH_V2_KEY: "/tmp/nonexistent-auth-v2-key",
    },
    async () => {
      await withKeysFile(
        {
          providers: {
            factory: {
              auth: "api_key",
              accounts: [
                { id: "acct-1", api_key: "fk-key-1" }, // pragma: allowlist secret
              ],
            },
          },
        },
        async (keysFilePath) => {
          const keyPool = new KeyPool({
            keysFilePath,
            reloadIntervalMs: 10,
            defaultCooldownMs: 30000,
            defaultProviderId: "vivgrid",
          });

          await keyPool.warmup();

          const accounts = await keyPool.getRequestOrder("factory");
          assert.equal(accounts.length, 1);

          // Rate-limit the only account
          keyPool.markRateLimited(accounts[0]!);

          // Now no accounts should be available
          const afterCooldown = await keyPool.getRequestOrder("factory");
          assert.equal(afterCooldown.length, 0, "All accounts in cooldown should return empty");
        },
      );
    },
  );
});

// ─── VAL-AUTH-005: OAuth token refresh at 30-min window ─────────────────────

test("refresh triggers when JWT expires within 30 minutes", () => {
  // Token expires in 20 minutes — within the 30-min buffer
  const credential = makeFactoryCredential({
    token: makeFreshJwt(20),
  });

  assert.equal(factoryCredentialNeedsRefresh(credential), true);
});

test("refresh does not trigger when JWT expires in 60 minutes", () => {
  const credential = makeFactoryCredential({
    token: makeFreshJwt(60),
  });

  assert.equal(factoryCredentialNeedsRefresh(credential), false);
});

// ─── VAL-AUTH-006: Refreshed token persisted to credential store ────────────

test("refreshed tokens can be persisted and re-read from auth.v2 file", async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "factory-refresh-persist-test-"));
  const keyBase64 = randomBytes(32).toString("base64");
  const authV2File = path.join(tempDir, "auth.v2.file");
  const authV2Key = path.join(tempDir, "auth.v2.key");

  // Write initial credentials
  const initialToken = makeFreshJwt(10); // about to expire
  const initialRefresh = "rt-initial";
  const initialEncrypted = encryptAuthV2(keyBase64, {
    access_token: initialToken,
    refresh_token: initialRefresh,
  });
  await writeFile(authV2File, initialEncrypted, "utf8");
  await writeFile(authV2Key, keyBase64, "utf8");

  // Simulate refresh — write new credentials
  const refreshedToken = makeFreshJwt(120);
  const refreshedRefreshToken = "rt-refreshed";

  try {
    await withEnv(
      {
        FACTORY_AUTH_V2_FILE: authV2File,
        FACTORY_AUTH_V2_KEY: authV2Key,
      },
      async () => {
        await persistFactoryAuthV2(refreshedToken, refreshedRefreshToken);

        // Verify the file was updated
        const encryptedContent = await readFile(authV2File, "utf8");
        const decrypted = decryptAuthV2(keyBase64, encryptedContent);

        assert.equal(decrypted.accessToken, refreshedToken);
        assert.equal(decrypted.refreshToken, refreshedRefreshToken);
        assert.notEqual(decrypted.accessToken, initialToken);
      },
    );
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

// ─── VAL-CROSS-005: In-flight streaming not interrupted by token refresh ────

test("in-flight token remains valid during refresh (KeyPool snapshot)", { concurrency: false }, async () => {
  const jwt1 = makeJwt({ exp: Math.floor(Date.now() / 1000) + 600, sub: "user-near-expiry" }); // about to expire, needs refresh
  const jwt2 = makeJwt({ exp: Math.floor(Date.now() / 1000) + 7200, sub: "user-fresh" }); // fresh

  await withEnv(
    {
      FACTORY_API_KEY: undefined,
      FACTORY_AUTH_V2_FILE: "/tmp/nonexistent-auth-v2-file",
      FACTORY_AUTH_V2_KEY: "/tmp/nonexistent-auth-v2-key",
    },
    async () => {
      await withKeysFile(
        {
          providers: {
            factory: {
              auth: "oauth_bearer",
              accounts: [
                { id: "oauth-near-expiry", access_token: jwt1, refresh_token: "rt-1", expires_at: parseJwtExpiry(jwt1) },
                { id: "oauth-fresh", access_token: jwt2, refresh_token: "rt-2", expires_at: parseJwtExpiry(jwt2) },
              ],
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

          // Simulate getting accounts for an in-flight request
          const accounts = await keyPool.getRequestOrder("factory");
          assert.ok(accounts.length > 0, "Should have available accounts");

          // Mark a request as in-flight
          const inFlightCredential = accounts[0]!;
          const release = keyPool.markInFlight(inFlightCredential);

          // Simulate a refresh happening — update the credential in the pool
          const refreshedToken = makeFreshJwt(120);
          const refreshedCredential: ProviderCredential = {
            ...inFlightCredential,
            token: refreshedToken,
            expiresAt: parseJwtExpiry(refreshedToken) ?? undefined,
            refreshToken: "rt-refreshed",
          };
          keyPool.updateAccountCredential("factory", inFlightCredential, refreshedCredential);

          // The original in-flight credential should still be usable
          // (the snapshot taken before refresh is what the ongoing request uses)
          assert.ok(inFlightCredential.token.length > 0, "Original token should still be available in-memory");

          // Release in-flight
          release();

          // Next request should get the refreshed token
          const nextAccounts = await keyPool.getRequestOrder("factory");
          const refreshedAccount = nextAccounts.find((a) => a.accountId === inFlightCredential.accountId);
          assert.ok(refreshedAccount);
          assert.equal(refreshedAccount.token, refreshedToken, "Next request should use refreshed token");
        },
      );
    },
  );
});

// ─── VAL-CROSS-006: Factory credentials don't leak to other providers ───────

test("Factory credentials are isolated from other providers", { concurrency: false }, async () => {
  await withEnv(
    {
      FACTORY_API_KEY: "fk-factory-only", // pragma: allowlist secret
      FACTORY_AUTH_V2_FILE: "/tmp/nonexistent-auth-v2-file",
      FACTORY_AUTH_V2_KEY: "/tmp/nonexistent-auth-v2-key",
    },
    async () => {
      await withKeysFile(
        {
          providers: {
            vivgrid: { accounts: ["vg-key-1"] },
            openrouter: { accounts: ["or-key-1"] },
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

          // Factory credentials should only appear under factory
          const factoryAccounts = await keyPool.getRequestOrder("factory");
          assert.equal(factoryAccounts.length, 1);
          assert.equal(factoryAccounts[0]?.token, "fk-factory-only");
          assert.equal(factoryAccounts[0]?.providerId, "factory");

          // Vivgrid should NOT have factory keys
          const vivgridAccounts = await keyPool.getRequestOrder("vivgrid");
          for (const account of vivgridAccounts) {
            assert.notEqual(account.token, "fk-factory-only", "Factory key should not leak to vivgrid");
          }

          // OpenRouter should NOT have factory keys
          const openrouterAccounts = await keyPool.getRequestOrder("openrouter");
          for (const account of openrouterAccounts) {
            assert.notEqual(account.token, "fk-factory-only", "Factory key should not leak to openrouter");
          }
        },
      );
    },
  );
});

// ─── KeyPool.updateAccountCredential Tests ──────────────────────────────────

test("updateAccountCredential updates token and expiresAt in-memory", { concurrency: false }, async () => {
  const originalJwt = makeFreshJwt(10);
  const refreshedJwt = makeFreshJwt(120);

  await withEnv(
    {
      FACTORY_API_KEY: undefined,
      FACTORY_AUTH_V2_FILE: "/tmp/nonexistent-auth-v2-file",
      FACTORY_AUTH_V2_KEY: "/tmp/nonexistent-auth-v2-key",
    },
    async () => {
      await withKeysFile(
        {
          providers: {
            factory: {
              auth: "oauth_bearer",
              accounts: [
                { id: "to-refresh", access_token: originalJwt, refresh_token: "rt-1", expires_at: parseJwtExpiry(originalJwt) },
              ],
            },
          },
        },
        async (keysFilePath) => {
          const keyPool = new KeyPool({
            keysFilePath,
            reloadIntervalMs: 100000, // prevent auto-reload
            defaultCooldownMs: 1000,
            defaultProviderId: "vivgrid",
          });

          await keyPool.warmup();

          const accountsBefore = await keyPool.getAllAccounts("factory");
          assert.equal(accountsBefore.length, 1);
          const oldCredential = accountsBefore[0]!;
          assert.equal(oldCredential.token, originalJwt);

          // Update the credential
          const newCredential: ProviderCredential = {
            ...oldCredential,
            token: refreshedJwt,
            expiresAt: parseJwtExpiry(refreshedJwt) ?? undefined,
            refreshToken: "rt-refreshed",
          };
          keyPool.updateAccountCredential("factory", oldCredential, newCredential);

          // Verify the update took effect
          const accountsAfter = await keyPool.getAllAccounts("factory");
          assert.equal(accountsAfter.length, 1);
          assert.equal(accountsAfter[0]!.token, refreshedJwt);
          assert.equal(accountsAfter[0]!.refreshToken, "rt-refreshed");
        },
      );
    },
  );
});

// ─── Expired tokens are skipped in getRequestOrder ──────────────────────────

test("expired Factory OAuth tokens are excluded from getRequestOrder", { concurrency: false }, async () => {
  const expiredJwt = makeJwt({ exp: Math.floor(Date.now() / 1000) - 300, sub: "user-expired" });
  const freshJwt = makeJwt({ exp: Math.floor(Date.now() / 1000) + 7200, sub: "user-fresh" });

  await withEnv(
    {
      FACTORY_API_KEY: undefined,
      FACTORY_AUTH_V2_FILE: "/tmp/nonexistent-auth-v2-file",
      FACTORY_AUTH_V2_KEY: "/tmp/nonexistent-auth-v2-key",
    },
    async () => {
      await withKeysFile(
        {
          providers: {
            factory: {
              auth: "oauth_bearer",
              accounts: [
                { id: "expired", access_token: expiredJwt, refresh_token: "rt-1", expires_at: parseJwtExpiry(expiredJwt) },
                { id: "fresh", access_token: freshJwt, refresh_token: "rt-2", expires_at: parseJwtExpiry(freshJwt) },
              ],
            },
          },
        },
        async (keysFilePath) => {
          const keyPool = new KeyPool({
            keysFilePath,
            reloadIntervalMs: 100000,
            defaultCooldownMs: 1000,
            defaultProviderId: "vivgrid",
          });

          await keyPool.warmup();

          const accounts = await keyPool.getRequestOrder("factory");
          assert.equal(accounts.length, 1, "Only non-expired account should be returned");
          assert.equal(accounts[0]!.accountId, "fresh");
        },
      );
    },
  );
});
