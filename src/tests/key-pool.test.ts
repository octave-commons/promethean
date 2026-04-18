import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { KeyPool } from "../lib/key-pool.js";
import type { ProviderCredential, ProviderAuthType } from "../lib/key-pool.js";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

async function withKeysFile(payload: unknown, fn: (keysFilePath: string) => Promise<void>): Promise<void> {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "open-hax-key-pool-test-"));
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

test("accepts provider key arrays and generates internal UUID account IDs", async () => {
  await withKeysFile(
    {
      providers: {
        "ollama-cloud": {
          auth: "api_key",
          accounts: ["oc-key-1", "oc-key-2"]
        }
      }
    },
    async (keysFilePath) => {
      const keyPool = new KeyPool({
        keysFilePath,
        reloadIntervalMs: 10,
        defaultCooldownMs: 1000,
        defaultProviderId: "ollama-cloud"
      });

      await keyPool.warmup();
      const accounts = await keyPool.getRequestOrder("ollama-cloud");

      assert.equal(accounts.length, 2);
      assert.ok(accounts.every((account) => account.providerId === "ollama-cloud"));
      assert.ok(accounts.every((account) => account.authType === "api_key"));
      assert.ok(accounts.every((account) => UUID_PATTERN.test(account.accountId)));
      assert.equal(new Set(accounts.map((account) => account.accountId)).size, 2);
    }
  );
});

test("keeps generated account IDs stable across automatic key reloads", async () => {
  await withKeysFile(
    {
      providers: {
        "ollama-cloud": {
          accounts: ["oc-key-a", "oc-key-b"]
        }
      }
    },
    async (keysFilePath) => {
      const keyPool = new KeyPool({
        keysFilePath,
        reloadIntervalMs: 1,
        defaultCooldownMs: 1000,
        defaultProviderId: "ollama-cloud"
      });

      await keyPool.warmup();

      const firstIds = (await keyPool.getRequestOrder("ollama-cloud"))
        .map((account) => account.accountId)
        .sort();

      await new Promise((resolve) => {
        setTimeout(resolve, 5);
      });

      const secondIds = (await keyPool.getRequestOrder("ollama-cloud"))
        .map((account) => account.accountId)
        .sort();

      assert.deepEqual(secondIds, firstIds);
      assert.ok(secondIds.every((accountId) => UUID_PATTERN.test(accountId)));
    }
  );
});

test("preserves explicit account IDs while auto-generating for string entries", async () => {
  await withKeysFile(
    {
      providers: {
        "ollama-cloud": {
          auth: "api_key",
          accounts: [
            { id: "oc-primary", token: "oc-token-primary" },
            "oc-key-fallback"
          ]
        }
      }
    },
    async (keysFilePath) => {
      const keyPool = new KeyPool({
        keysFilePath,
        reloadIntervalMs: 10,
        defaultCooldownMs: 1000,
        defaultProviderId: "ollama-cloud"
      });

      await keyPool.warmup();
      const accounts = await keyPool.getRequestOrder("ollama-cloud");

      assert.equal(accounts.length, 2);
      const ids = new Set(accounts.map((account) => account.accountId));
      assert.ok(ids.has("oc-primary"));

      const generatedId = accounts
        .map((account) => account.accountId)
        .find((accountId) => accountId !== "oc-primary");
      assert.ok(typeof generatedId === "string");
      assert.ok(UUID_PATTERN.test(generatedId!));
    }
  );
});

test("prefers non-busy accounts before reusing in-flight accounts", async () => {
  await withKeysFile(
    {
      providers: {
        "ollama-cloud": {
          auth: "api_key",
          accounts: [
            { id: "oc-a", token: "oc-token-a" },
            { id: "oc-b", token: "oc-token-b" }
          ]
        }
      }
    },
    async (keysFilePath) => {
      const keyPool = new KeyPool({
        keysFilePath,
        reloadIntervalMs: 10,
        defaultCooldownMs: 1000,
        defaultProviderId: "ollama-cloud"
      });

      await keyPool.warmup();
      const initial = await keyPool.getRequestOrder("ollama-cloud");
      assert.equal(initial.length, 2);

      const release = keyPool.markInFlight(initial[0]!);
      const reordered = await keyPool.getRequestOrder("ollama-cloud");
      assert.equal(reordered.length, 2);
      assert.equal(reordered[0]?.accountId, initial[1]?.accountId);
      assert.equal(reordered[1]?.accountId, initial[0]?.accountId);

      release();
      const status = await keyPool.getStatus("ollama-cloud");
      assert.equal(status.inFlightAccounts, 0);
    }
  );
});

test("loads env-backed openrouter and requesty providers alongside file accounts", { concurrency: false }, async () => {
  await withEnv(
    {
      OPENROUTER_API_KEY: "or-token-1", // pragma: allowlist secret
      REQUESTY_API_TOKEN: "req-key-1", // pragma: allowlist secret
      OPENROUTER_PROVIDER_ID: undefined,
      REQUESTY_PROVIDER_ID: undefined,
    },
    async () => {
      await withKeysFile(
        {
          providers: {
            "ollama-cloud": {
              accounts: ["oc-key-1"],
            },
          },
        },
        async (keysFilePath) => {
          const keyPool = new KeyPool({
            keysFilePath,
            reloadIntervalMs: 10,
            defaultCooldownMs: 1000,
            defaultProviderId: "ollama-cloud",
          });

          await keyPool.warmup();
          const openrouterAccounts = await keyPool.getRequestOrder("openrouter");
          const requestyAccounts = await keyPool.getRequestOrder("requesty");

          assert.equal(openrouterAccounts.length, 1);
          assert.equal(openrouterAccounts[0]?.providerId, "openrouter");
          assert.equal(openrouterAccounts[0]?.token, "or-token-1");
          assert.ok(UUID_PATTERN.test(openrouterAccounts[0]?.accountId ?? ""));

          assert.equal(requestyAccounts.length, 1);
          assert.equal(requestyAccounts[0]?.providerId, "requesty");
          assert.equal(requestyAccounts[0]?.token, "req-key-1");
          assert.ok(UUID_PATTERN.test(requestyAccounts[0]?.accountId ?? ""));
        },
      );
    },
  );
});

test("loads env-backed gemini provider via GEMINI_API_KEY", { concurrency: false }, async () => {
  await withEnv(
    {
      GEMINI_API_KEY: "gem-key-1", // pragma: allowlist secret
      GEMINI_PROVIDER_ID: undefined,
      OPENROUTER_API_KEY: undefined,
      REQUESTY_API_TOKEN: undefined,
      REQUESTY_API_KEY: undefined,
      OPENROUTER_PROVIDER_ID: undefined,
      REQUESTY_PROVIDER_ID: undefined,
    },
    async () => {
      await withKeysFile(
        {
          providers: {
            "ollama-cloud": {
              accounts: ["oc-key-1"],
            },
          },
        },
        async (keysFilePath) => {
          const keyPool = new KeyPool({
            keysFilePath,
            reloadIntervalMs: 10,
            defaultCooldownMs: 1000,
            defaultProviderId: "ollama-cloud",
          });

          await keyPool.warmup();
          const geminiAccounts = await keyPool.getRequestOrder("gemini");

          assert.equal(geminiAccounts.length, 1);
          assert.equal(geminiAccounts[0]?.providerId, "gemini");
          assert.equal(geminiAccounts[0]?.token, "gem-key-1");
          assert.ok(UUID_PATTERN.test(geminiAccounts[0]?.accountId ?? ""));
        },
      );
    },
  );
});

test("loads env-backed zai and mistral providers", { concurrency: false }, async () => {
  await withEnv(
    {
      ZAI_API_KEY: "zai-key-1", // pragma: allowlist secret
      MISTRAL_API_KEY: "mistral-key-1", // pragma: allowlist secret
      ZAI_PROVIDER_ID: undefined,
      MISTRAL_PROVIDER_ID: undefined,
      GEMINI_API_KEY: undefined,
      OPENROUTER_API_KEY: undefined,
      REQUESTY_API_TOKEN: undefined,
      REQUESTY_API_KEY: undefined,
    },
    async () => {
      await withKeysFile(
        {
          providers: {
            "ollama-cloud": {
              accounts: ["oc-key-1"],
            },
          },
        },
        async (keysFilePath) => {
          const keyPool = new KeyPool({
            keysFilePath,
            reloadIntervalMs: 10,
            defaultCooldownMs: 1000,
            defaultProviderId: "ollama-cloud",
          });

          await keyPool.warmup();
          const zaiAccounts = await keyPool.getRequestOrder("zai");
          const mistralAccounts = await keyPool.getRequestOrder("mistral");

          assert.equal(zaiAccounts.length, 1);
          assert.equal(zaiAccounts[0]?.providerId, "zai");
          assert.equal(zaiAccounts[0]?.token, "zai-key-1");

          assert.equal(mistralAccounts.length, 1);
          assert.equal(mistralAccounts[0]?.providerId, "mistral");
          assert.equal(mistralAccounts[0]?.token, "mistral-key-1");
        },
      );
    },
  );
});

test("treats epoch-second OAuth expirations as future timestamps", async () => {
  const expiresAtSeconds = Math.floor(Date.now() / 1000) + 3600;

  await withKeysFile(
    {
      providers: {
        openai: {
          auth: "oauth_bearer",
          accounts: [{
            id: "oa-plus",
            access_token: "oa-token",
            refresh_token: "oa-refresh",
            expires_at: expiresAtSeconds,
            chatgpt_account_id: "cgpt-plus",
            plan_type: "plus",
          }],
        },
      },
    },
    async (keysFilePath) => {
      const keyPool = new KeyPool({
        keysFilePath,
        reloadIntervalMs: 10,
        defaultCooldownMs: 1000,
        defaultProviderId: "openai",
      });

      await keyPool.warmup();
      const accounts = await keyPool.getRequestOrder("openai");

      assert.equal(accounts.length, 1);
      assert.equal(accounts[0]?.accountId, "oa-plus");
      assert.equal(accounts[0]?.expiresAt, expiresAtSeconds * 1000);
      assert.equal(keyPool.isAccountExpired(accounts[0]!), false);
    },
  );
});

test("loads inline JSON credentials from env without a keys file", { concurrency: false }, async () => {
  await withEnv(
    {
      PROXY_KEYS_JSON: JSON.stringify({
        providers: {
          vivgrid: {
            auth: "api_key",
            accounts: [{ id: "env-vg", token: "vg-inline-token" }],
          },
        },
      }),
    },
    async () => {
      const keyPool = new KeyPool({
        keysFilePath: path.join(os.tmpdir(), `missing-${Date.now()}.json`),
        reloadIntervalMs: 10,
        defaultCooldownMs: 1000,
        defaultProviderId: "vivgrid",
      });

      await keyPool.warmup();
      const accounts = await keyPool.getRequestOrder("vivgrid");

      assert.equal(accounts.length, 1);
      assert.equal(accounts[0]?.providerId, "vivgrid");
      assert.equal(accounts[0]?.accountId, "env-vg");
      assert.equal(accounts[0]?.token, "vg-inline-token");
    },
  );
});

test("ignores malformed inline JSON credentials from env when another source is available", { concurrency: false }, async () => {
  await withEnv(
    {
      PROXY_KEYS_JSON: "{not-valid-json",
    },
    async () => {
      await withKeysFile(
        {
          providers: {
            vivgrid: {
              auth: "api_key",
              accounts: [{ id: "file-vg", token: "vg-file-token" }],
            },
          },
        },
        async (keysFilePath) => {
          const warnings: string[] = [];
          const originalWarn = console.warn;
          console.warn = (message?: unknown, ...args: unknown[]) => {
            warnings.push([message, ...args].map((value) => String(value)).join(" "));
          };

          try {
            const keyPool = new KeyPool({
              keysFilePath,
              reloadIntervalMs: 10,
              defaultCooldownMs: 1000,
              defaultProviderId: "vivgrid",
            });

            await keyPool.warmup();
            const accounts = await keyPool.getRequestOrder("vivgrid");

            assert.equal(accounts.length, 1);
            assert.equal(accounts[0]?.accountId, "file-vg");
            assert.equal(accounts[0]?.token, "vg-file-token");
            assert.ok(warnings.some((entry) => entry.includes("Failed to parse inline keys JSON from env")));
          } finally {
            console.warn = originalWarn;
          }
        },
      );
    },
  );
});

test("loads credentials from account store when database-backed source is configured", async () => {
  const accountStore = {
    async getAllProviders(): Promise<Map<string, { authType: ProviderAuthType }>> {
      return new Map([
        ["openai", { authType: "oauth_bearer" }],
      ]);
    },
    async getAllAccounts(): Promise<Map<string, ProviderCredential[]>> {
      return new Map([
        ["openai", [{
          providerId: "openai",
          accountId: "db-openai-1",
          token: "db-token-1",
          authType: "oauth_bearer",
          refreshToken: "db-refresh-1",
          chatgptAccountId: "cgpt-db-1",
        }]],
      ]);
    },
  };

  const keyPool = new KeyPool({
    keysFilePath: path.join(os.tmpdir(), `missing-${Date.now()}-${Math.random()}.json`),
    reloadIntervalMs: 10,
    defaultCooldownMs: 1000,
    defaultProviderId: "openai",
    accountStore,
  });

  await keyPool.warmup();
  const accounts = await keyPool.getRequestOrder("openai");

  assert.equal(accounts.length, 1);
  assert.equal(accounts[0]?.providerId, "openai");
  assert.equal(accounts[0]?.accountId, "db-openai-1");
  assert.equal(accounts[0]?.token, "db-token-1");
  assert.equal(accounts[0]?.authType, "oauth_bearer");
});
