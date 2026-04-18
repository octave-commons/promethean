#!/usr/bin/env node

import { writeFile } from "node:fs/promises";

const SOURCE_URL = "https://models.dev/api.json";
const JSON_OUTPUT_PATH = new URL("../src/lib/data/models-dev-pricing.json", import.meta.url);
const TS_OUTPUT_PATH = new URL("../src/lib/data/models-dev-pricing-data.ts", import.meta.url);

const response = await fetch(SOURCE_URL);
if (!response.ok) {
  throw new Error(`Failed to fetch ${SOURCE_URL}: ${response.status}`);
}

const upstream = await response.json();
const providers = {};

for (const [providerId, provider] of Object.entries(upstream).sort(([left], [right]) => left.localeCompare(right))) {
  const models = {};
  const rawModels = provider && typeof provider === "object" && provider !== null && "models" in provider
    ? provider.models
    : {};

  for (const [modelId, model] of Object.entries(rawModels).sort(([left], [right]) => left.localeCompare(right))) {
    const rawCost = model && typeof model === "object" && model !== null && "cost" in model
      ? model.cost
      : null;
    if (!rawCost || typeof rawCost !== "object") {
      continue;
    }

    const cost = {};
    for (const key of ["input", "output", "reasoning", "cache_read", "cache_write"]) {
      const value = rawCost[key];
      if (typeof value === "number" && Number.isFinite(value)) {
        cost[key] = value;
      }
    }

    if (Object.keys(cost).length > 0) {
      models[modelId] = cost;
    }
  }

  if (Object.keys(models).length > 0) {
    providers[providerId] = { models };
  }
}

const payload = {
  generatedAt: new Date().toISOString(),
  sourceUrl: SOURCE_URL,
  providers,
};

await writeFile(JSON_OUTPUT_PATH, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
await writeFile(
  TS_OUTPUT_PATH,
  `const modelsDevPricingSnapshot = ${JSON.stringify(payload, null, 2)} as const;\n\nexport default modelsDevPricingSnapshot;\n`,
  "utf8",
);
console.log(`Wrote ${JSON_OUTPUT_PATH.pathname}`);
console.log(`Wrote ${TS_OUTPUT_PATH.pathname}`);
