import assert from "node:assert/strict";
import test from "node:test";

import { estimateRequestCost, getModelPricing } from "../lib/model-pricing.js";

test("uses models.dev pricing for direct OpenAI models", () => {
  const pricing = getModelPricing("openai", "gpt-5.4");

  assert.equal(pricing.pricingFound, true);
  assert.equal(pricing.pricingSource, "models.dev");
  assert.equal(pricing.pricingProviderId, "openai");
  assert.equal(pricing.inputPer1MTokens, 2.5);
  assert.equal(pricing.outputPer1MTokens, 15);
});

test("falls back to canonical vendor pricing for factory Claude models", () => {
  const pricing = getModelPricing("factory", "factory/claude-opus-4-6");

  assert.equal(pricing.pricingFound, true);
  assert.equal(pricing.pricingProviderId, "anthropic");
  assert.equal(pricing.pricingModelId, "claude-opus-4-6");
  assert.equal(pricing.inputPer1MTokens, 5);
  assert.equal(pricing.outputPer1MTokens, 25);
});

test("falls back from ollama-cloud router entries to vendor pricing when router price is absent", () => {
  const pricing = getModelPricing("ollama-cloud", "glm-5");

  assert.equal(pricing.pricingFound, true);
  assert.equal(pricing.pricingProviderId, "zai");
  assert.equal(pricing.inputPer1MTokens, 1);
  assert.equal(pricing.outputPer1MTokens, 3.2);
});

test("local ollama models remain zero-cost but still track energy estimates", () => {
  const estimate = estimateRequestCost("ollama", "ollama/qwen3.5:4b-q8_0", 1000, 500);

  assert.equal(estimate.costUsd, 0);
  assert.ok(estimate.energyJoules > 0);
  assert.ok(estimate.waterEvaporatedMl > 0);
});
