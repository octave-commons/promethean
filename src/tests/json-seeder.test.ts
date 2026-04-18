import assert from "node:assert/strict";
import test from "node:test";

import { seedFromJsonValue } from "../lib/db/json-seeder.js";

interface ProviderRow {
  readonly id: string;
}

function createFakeSql() {
  const providers = new Map<string, string>();
  const accounts = new Map<string, {
    providerId: string;
    token: string;
    refreshToken: string | null;
    expiresAt: number | null;
  }>();

  const sql = async (strings: TemplateStringsArray, ...values: readonly unknown[]) => {
    const query = strings.join("?");

    if (query.includes("INSERT INTO providers")) {
      const providerId = String(values[0]);
      const authType = String(values[1]);
      const exists = providers.has(providerId);
      const doNothing = query.includes("DO NOTHING");

      if (!exists || !doNothing) {
        providers.set(providerId, authType);
        return [{ id: providerId }] as ProviderRow[];
      }

      return [] as ProviderRow[];
    }

    if (query.includes("INSERT INTO accounts")) {
      const accountId = String(values[0]);
      const providerId = String(values[1]);
      const key = `${providerId}:${accountId}`;
      const exists = accounts.has(key);
      const doNothing = query.includes("DO NOTHING");

      if (!exists || !doNothing) {
        accounts.set(key, {
          providerId,
          token: String(values[2]),
          refreshToken: values[3] === null ? null : String(values[3]),
          expiresAt: typeof values[4] === "number" ? values[4] : null,
        });
        return [{ id: accountId }] as ProviderRow[];
      }

      return [] as ProviderRow[];
    }

    throw new Error(`Unhandled SQL in test fake: ${query}`);
  };

  return {
    sql: sql as unknown,
    providers,
    accounts,
  };
}

test("seedFromJsonValue does not overwrite existing DB accounts in seed-only mode", async () => {
  const fake = createFakeSql();

  await seedFromJsonValue(
    fake.sql as never,
    {
      providers: {
        openai: {
          auth: "oauth_bearer",
          accounts: [{ id: "acct-1", access_token: "seed-token-a" }],
        },
      },
    },
    "openai",
    { skipExistingProviders: true },
  );

  await seedFromJsonValue(
    fake.sql as never,
    {
      providers: {
        openai: {
          auth: "oauth_bearer",
          accounts: [
            { id: "acct-1", access_token: "seed-token-b" },
            { id: "acct-2", access_token: "seed-token-c" },
          ],
        },
      },
    },
    "openai",
    { skipExistingProviders: true },
  );

  assert.equal(fake.providers.get("openai"), "oauth_bearer");
  assert.equal(fake.accounts.get("openai:acct-1")?.token, "seed-token-a");
  assert.equal(fake.accounts.get("openai:acct-2")?.token, "seed-token-c");
});
