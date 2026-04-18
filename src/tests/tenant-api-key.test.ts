import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_TENANT_ID,
  TENANT_API_KEY_PREFIX,
  buildTenantApiKeyPrefix,
  generateTenantApiKey,
  hashTenantApiKey,
  normalizeTenantId,
} from "../lib/tenant-api-key.js";

test("default tenant id remains stable", () => {
  assert.equal(DEFAULT_TENANT_ID, "default");
});

test("normalizeTenantId trims and lowercases", () => {
  assert.equal(normalizeTenantId("  Open-Hax  "), "open-hax");
});

test("generateTenantApiKey returns prefixed secret", () => {
  const token = generateTenantApiKey();
  assert.ok(token.startsWith(TENANT_API_KEY_PREFIX));
  assert.ok(token.length > TENANT_API_KEY_PREFIX.length + 16);
});

test("buildTenantApiKeyPrefix exposes only visible prefix", () => {
  const token = "ohpk_abcdefghijklmnopqrstuvwxyz";
  assert.equal(buildTenantApiKeyPrefix(token), "ohpk_abcdefg");
});

test("hashTenantApiKey is deterministic and pepper-sensitive", () => {
  const token = "ohpk_example_secret";
  const first = hashTenantApiKey(token, "pepper-a");
  const second = hashTenantApiKey(token, "pepper-a");
  const third = hashTenantApiKey(token, "pepper-b");

  assert.equal(first, second);
  assert.notEqual(first, third);
  assert.equal(first.length, 64);
});
