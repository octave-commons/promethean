import assert from "node:assert/strict";
import test from "node:test";

import { createPolicyEngine, DEFAULT_POLICY_CONFIG, type ModelInfo } from "../lib/policy/index.js";
import { orderProviderRoutesByPolicy } from "../lib/provider-policy.js";

function createModelInfo(routedModel: string): ModelInfo {
  return {
    requestedModel: routedModel,
    routedModel,
    isGptModel: routedModel.startsWith("gpt-"),
    isOpenAiPrefixed: false,
    isLocal: false,
    isOllama: false,
  };
}

test("de-prioritizes vivgrid and excludes ollama-cloud for gpt model provider ordering", () => {
  const policy = createPolicyEngine(DEFAULT_POLICY_CONFIG);

  const ordered = policy.orderProviders(
    ["vivgrid", "ollama-cloud", "openai"],
    createModelInfo("gpt-5.4"),
  );

  assert.deepEqual(ordered, ["openai", "vivgrid"]);
});

test("gpt-5.4 provider ordering includes factory", () => {
  const policy = createPolicyEngine(DEFAULT_POLICY_CONFIG);

  const ordered = policy.orderProviders(
    ["vivgrid", "factory", "openai"],
    createModelInfo("gpt-5.4"),
  );

  assert.deepEqual(ordered, ["openai", "factory", "vivgrid"]);
});

test("claude-opus-4-6 provider ordering prefers factory and excludes openai", () => {
  const policy = createPolicyEngine(DEFAULT_POLICY_CONFIG);

  const ordered = policy.orderProviders(
    ["requesty", "factory", "openai", "vivgrid"],
    createModelInfo("claude-opus-4-6"),
  );

  assert.deepEqual(ordered, ["factory", "requesty", "vivgrid"]);
});

test("prefers ollama-cloud then zai for glm provider ordering", () => {
  const policy = createPolicyEngine(DEFAULT_POLICY_CONFIG);

  const ordered = policy.orderProviders(
    ["vivgrid", "requesty", "zai", "ollama-cloud", "openai"],
    createModelInfo("glm-5"),
  );

  assert.deepEqual(ordered, ["ollama-cloud", "zai", "requesty", "openai", "vivgrid"]);
});

test("keeps ollama-cloud available for gpt-oss provider ordering", () => {
  const policy = createPolicyEngine(DEFAULT_POLICY_CONFIG);

  const ordered = policy.orderProviders(
    ["vivgrid", "ollama-cloud", "openai"],
    createModelInfo("gpt-oss-120b"),
  );

  assert.deepEqual(ordered, ["openai", "ollama-cloud", "vivgrid"]);
});

test("filters excluded provider routes for gpt models", () => {
  const policy = createPolicyEngine(DEFAULT_POLICY_CONFIG);

  const orderedRoutes = orderProviderRoutesByPolicy(
    policy,
    [
      { providerId: "ollama-cloud", baseUrl: "https://ollama.invalid" },
      { providerId: "vivgrid", baseUrl: "https://vivgrid.invalid" },
      { providerId: "openai", baseUrl: "https://openai.invalid" },
    ],
    "gpt-5.2",
    "gpt-5.2",
    {
      openAiPrefixed: false,
      localOllama: false,
      explicitOllama: false,
    },
  );

  assert.deepEqual(
    orderedRoutes.map((route) => route.providerId),
    ["openai", "vivgrid"],
  );
});
