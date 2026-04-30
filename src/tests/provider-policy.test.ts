import assert from "node:assert/strict";
import test from "node:test";

import type { ProviderCredential } from "../lib/key-pool.js";
import { createPolicyEngine, DEFAULT_POLICY_CONFIG } from "../lib/policy/index.js";
import { orderAccountsByPolicy } from "../lib/provider-policy.js";

// ── helpers ──────────────────────────────────────────────────────────

const FREE_PLUS_ACCOUNTS: readonly ProviderCredential[] = [
  {
    providerId: "openai",
    accountId: "oa-free",
    token: "free-token",
    authType: "oauth_bearer",
    chatgptAccountId: "cgpt-free",
    planType: "free",
  },
  {
    providerId: "openai",
    accountId: "oa-plus",
    token: "plus-token",
    authType: "oauth_bearer",
    chatgptAccountId: "cgpt-plus",
    planType: "plus",
  },
];

const PLUS_FREE_ACCOUNTS: readonly ProviderCredential[] = [
  {
    providerId: "openai",
    accountId: "oa-plus",
    token: "plus-token",
    authType: "oauth_bearer",
    chatgptAccountId: "cgpt-plus",
    planType: "plus",
  },
  {
    providerId: "openai",
    accountId: "oa-free",
    token: "free-token",
    authType: "oauth_bearer",
    chatgptAccountId: "cgpt-free",
    planType: "free",
  },
];

const DEFAULT_CTX = { openAiPrefixed: false, localOllama: false, explicitOllama: false };

function orderedIds(
  model: string,
  accounts: readonly ProviderCredential[] = FREE_PLUS_ACCOUNTS,
): string[] {
  const policy = createPolicyEngine(DEFAULT_POLICY_CONFIG);
  return orderAccountsByPolicy(policy, "openai", accounts, model, DEFAULT_CTX)
    .map((a) => a.accountId);
}

// ── Free-account availability last verified 2026-03-18 ──────────────

// BLOCKED on free: gpt-5.3-codex, gpt-5-mini

test("gpt-5.4 policy allows and prefers free accounts", () => {
  assert.deepEqual(orderedIds("gpt-5.4", PLUS_FREE_ACCOUNTS), ["oa-free", "oa-plus"]);
});

test("gpt-5.3-codex policy excludes free accounts", () => {
  assert.deepEqual(orderedIds("gpt-5.3-codex"), ["oa-plus"]);
});

test("gpt-5-mini policy excludes free accounts", () => {
  assert.deepEqual(orderedIds("gpt-5-mini"), ["oa-plus"]);
});

// WORKS on free: gpt-5, gpt-5.1, gpt-5.1-codex, gpt-5.1-codex-max, gpt-5.2, gpt-5.2-codex

test("gpt-5 policy allows and prefers free accounts", () => {
  assert.deepEqual(orderedIds("gpt-5", PLUS_FREE_ACCOUNTS), ["oa-free", "oa-plus"]);
});

test("gpt-5.1 policy allows and prefers free accounts", () => {
  assert.deepEqual(orderedIds("gpt-5.1", PLUS_FREE_ACCOUNTS), ["oa-free", "oa-plus"]);
});

test("gpt-5.1-codex policy allows and prefers free accounts", () => {
  assert.deepEqual(orderedIds("gpt-5.1-codex", PLUS_FREE_ACCOUNTS), ["oa-free", "oa-plus"]);
});

test("gpt-5.1-codex-max policy allows and prefers free accounts", () => {
  assert.deepEqual(orderedIds("gpt-5.1-codex-max", PLUS_FREE_ACCOUNTS), ["oa-free", "oa-plus"]);
});

test("gpt-5.2 policy allows and prefers free accounts", () => {
  assert.deepEqual(orderedIds("gpt-5.2", PLUS_FREE_ACCOUNTS), ["oa-free", "oa-plus"]);
});

test("gpt-5.2-codex policy allows and prefers free accounts", () => {
  assert.deepEqual(orderedIds("gpt-5.2-codex", PLUS_FREE_ACCOUNTS), ["oa-free", "oa-plus"]);
});
