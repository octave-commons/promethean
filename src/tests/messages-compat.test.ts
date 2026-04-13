import assert from "node:assert/strict";
import test from "node:test";

import { chatRequestToMessagesRequest, normalizeMessagesThinkingBudget } from "../lib/messages-compat.js";

function buildMessagesPayload(overrides: Record<string, unknown>): Record<string, unknown> {
  return chatRequestToMessagesRequest({
    model: "claude-opus-4-5",
    messages: [{ role: "user", content: "hello" }],
    ...overrides,
  });
}

function extractThinking(payload: Record<string, unknown>): Record<string, unknown> {
  const thinking = payload["thinking"];
  assert.ok(typeof thinking === "object" && thinking !== null);
  return thinking as Record<string, unknown>;
}

test("maps GPT reasoning brackets to Claude thinking budgets", () => {
  const cases = [
    ["low", 4096],
    ["medium", 12288],
    ["high", 24576],
    ["xhigh", 32768],
  ] as const;

  for (const [effort, expectedBudgetTokens] of cases) {
    const payload = buildMessagesPayload({ reasoning_effort: effort });
    assert.deepEqual(extractThinking(payload), {
      type: "enabled",
      budget_tokens: expectedBudgetTokens,
    });
  }
});

test("maps none reasoning effort to disabled Claude thinking", () => {
  const payload = buildMessagesPayload({ reasoning_effort: "none" });
  assert.deepEqual(payload["thinking"], { type: "disabled" });
});

test("clamps enabled thinking budgets below max_tokens", () => {
  const reasoningEffortPayload = buildMessagesPayload({
    reasoning_effort: "high",
    max_tokens: 4096,
  });
  assert.deepEqual(extractThinking(reasoningEffortPayload), {
    type: "enabled",
    budget_tokens: 4095,
  });

  const explicitThinkingPayload = buildMessagesPayload({
    thinking: {
      type: "enabled",
      budget_tokens: 5000,
    },
    max_completion_tokens: 2048,
  });
  assert.deepEqual(extractThinking(explicitThinkingPayload), {
    type: "enabled",
    budget_tokens: 2047,
  });
});

test("rejects enabled thinking when max_tokens is too small", () => {
  assert.throws(
    () => buildMessagesPayload({ reasoning_effort: "low", max_tokens: 1024 }),
    /Extended thinking requires max_tokens greater than 1024/,
  );
});

test("re-normalizes thinking budgets when max_tokens changes later in the pipeline", () => {
  const payload = normalizeMessagesThinkingBudget({
    model: "claude-opus-4-5",
    messages: [{ role: "user", content: "hello" }],
    max_tokens: 4096,
    thinking: {
      type: "enabled",
      budget_tokens: 24576,
    },
  });

  assert.deepEqual(extractThinking(payload), {
    type: "enabled",
    budget_tokens: 4095,
  });
});
