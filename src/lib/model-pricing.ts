import modelsDevPricingSnapshot from "./data/models-dev-pricing-data.js";

/**
 * Model pricing, energy, and environmental cost estimation.
 *
 * Prices come from a compact snapshot generated from https://models.dev/api.json.
 * Energy and water are still best-effort local heuristics.
 */

interface ModelsDevCost {
  readonly input?: number;
  readonly output?: number;
  readonly reasoning?: number;
  readonly cache_read?: number;
  readonly cache_write?: number;
}

interface ModelsDevProviderSnapshot {
  readonly models: Readonly<Record<string, ModelsDevCost>>;
}

interface ModelsDevSnapshot {
  readonly generatedAt: string;
  readonly sourceUrl: string;
  readonly providers: Readonly<Record<string, ModelsDevProviderSnapshot>>;
}

interface EnergyProfile {
  readonly joulesPerInputToken: number;
  readonly joulesPerOutputToken: number;
}

export interface ModelPricing {
  readonly inputPer1MTokens: number;
  readonly outputPer1MTokens: number;
  readonly reasoningPer1MTokens: number;
  readonly cacheReadPer1MTokens: number;
  readonly cacheWritePer1MTokens: number;
  readonly joulesPerInputToken: number;
  readonly joulesPerOutputToken: number;
  readonly pricingFound: boolean;
  readonly pricingSource: "models.dev" | "local" | "unpriced";
  readonly pricingProviderId?: string;
  readonly pricingModelId?: string;
}

export interface RequestCostEstimate {
  readonly costUsd: number;
  readonly energyJoules: number;
  readonly waterEvaporatedMl: number;
}

interface ModelsDevResolvedCost {
  readonly providerKey: string;
  readonly modelId: string;
  readonly cost: ModelsDevCost;
}

interface ModelsDevIndexedEntry extends ModelsDevResolvedCost {
  readonly aliases: readonly string[];
}

const MODELS_DEV = modelsDevPricingSnapshot as ModelsDevSnapshot;

// Default data center water use efficiency: ~1.8 L/kWh (scope-1 evaporative cooling average).
// Source: University of Illinois CEE, "AI's Challenging Waters" (2025).
const DC_WUE_ML_PER_KWH = Number(process.env.DC_WATER_USE_EFFICIENCY_ML_PER_KWH ?? "1800");
const JOULES_PER_KWH = 3_600_000;

const ZERO_BILLING_COST: ModelsDevCost = {
  input: 0,
  output: 0,
  reasoning: 0,
  cache_read: 0,
  cache_write: 0,
};

const DEFAULT_ENERGY_PROFILE: EnergyProfile = {
  joulesPerInputToken: 0.5,
  joulesPerOutputToken: 1.5,
};

const ENERGY_RULES: ReadonlyArray<readonly [RegExp, EnergyProfile]> = [
  [/^gpt-5\.4$/, { joulesPerInputToken: 1.0, joulesPerOutputToken: 3.0 }],
  [/^gpt-5\.4-mini$/, { joulesPerInputToken: 0.3, joulesPerOutputToken: 1.0 }],
  [/^gpt-5\.4-nano$/, { joulesPerInputToken: 0.1, joulesPerOutputToken: 0.3 }],
  [/^gpt-5\.3-codex/, { joulesPerInputToken: 0.8, joulesPerOutputToken: 2.5 }],
  [/^gpt-5\.2-codex/, { joulesPerInputToken: 0.8, joulesPerOutputToken: 2.5 }],
  [/^gpt-5\.2/, { joulesPerInputToken: 0.8, joulesPerOutputToken: 2.5 }],
  [/^gpt-5\.1-codex-max/, { joulesPerInputToken: 1.0, joulesPerOutputToken: 3.0 }],
  [/^gpt-5\.1-codex/, { joulesPerInputToken: 0.8, joulesPerOutputToken: 2.5 }],
  [/^gpt-5\.1/, { joulesPerInputToken: 0.8, joulesPerOutputToken: 2.5 }],
  [/^gpt-5-mini/, { joulesPerInputToken: 0.3, joulesPerOutputToken: 1.0 }],
  [/^gpt-5$/, { joulesPerInputToken: 0.8, joulesPerOutputToken: 2.5 }],
  [/claude-opus-4-6-fast/, { joulesPerInputToken: 1.5, joulesPerOutputToken: 4.0 }],
  [/claude-opus-4-6/, { joulesPerInputToken: 1.0, joulesPerOutputToken: 3.0 }],
  [/claude-opus-4-5/, { joulesPerInputToken: 1.0, joulesPerOutputToken: 3.0 }],
  [/claude-opus-4-1/, { joulesPerInputToken: 1.5, joulesPerOutputToken: 4.0 }],
  [/claude-opus-4/, { joulesPerInputToken: 1.5, joulesPerOutputToken: 4.0 }],
  [/claude-sonnet-4-6/, { joulesPerInputToken: 0.8, joulesPerOutputToken: 2.5 }],
  [/claude-sonnet-4-5/, { joulesPerInputToken: 0.8, joulesPerOutputToken: 2.5 }],
  [/claude-sonnet/, { joulesPerInputToken: 0.8, joulesPerOutputToken: 2.5 }],
  [/claude-haiku-4-5/, { joulesPerInputToken: 0.3, joulesPerOutputToken: 1.0 }],
  [/claude-haiku/, { joulesPerInputToken: 0.2, joulesPerOutputToken: 0.5 }],
  [/gemini-3\.1-pro/, { joulesPerInputToken: 0.8, joulesPerOutputToken: 2.5 }],
  [/gemini-3-pro/, { joulesPerInputToken: 0.8, joulesPerOutputToken: 2.5 }],
  [/gemini-3-flash/, { joulesPerInputToken: 0.3, joulesPerOutputToken: 1.0 }],
  [/gemini-2\.5-pro/, { joulesPerInputToken: 0.8, joulesPerOutputToken: 2.5 }],
  [/gemini-2\.5-flash/, { joulesPerInputToken: 0.2, joulesPerOutputToken: 0.8 }],
  [/deepseek/, { joulesPerInputToken: 0.3, joulesPerOutputToken: 1.0 }],
  [/glm-/, { joulesPerInputToken: 0.3, joulesPerOutputToken: 1.0 }],
  [/kimi-/, { joulesPerInputToken: 0.3, joulesPerOutputToken: 1.0 }],
  [/minimax/, { joulesPerInputToken: 0.3, joulesPerOutputToken: 1.0 }],
  [/^qwen/, { joulesPerInputToken: 0.05, joulesPerOutputToken: 0.15 }],
  [/^llama/, { joulesPerInputToken: 0.05, joulesPerOutputToken: 0.15 }],
  [/^gemma/, { joulesPerInputToken: 0.05, joulesPerOutputToken: 0.15 }],
  [/^mistral/, { joulesPerInputToken: 0.05, joulesPerOutputToken: 0.15 }],
  [/^devstral/, { joulesPerInputToken: 0.05, joulesPerOutputToken: 0.15 }],
  [/^ministral/, { joulesPerInputToken: 0.05, joulesPerOutputToken: 0.15 }],
  [/^nemotron/, { joulesPerInputToken: 0.05, joulesPerOutputToken: 0.15 }],
  [/^cogito/, { joulesPerInputToken: 0.05, joulesPerOutputToken: 0.15 }],
  [/^rnj-/, { joulesPerInputToken: 0.05, joulesPerOutputToken: 0.15 }],
  [/^gpt-oss/, { joulesPerInputToken: 0.05, joulesPerOutputToken: 0.15 }],
];

function stripRoutingPrefix(model: string): string {
  const slashIndex = model.indexOf("/");
  return slashIndex >= 0 ? model.slice(slashIndex + 1) : model;
}

function normalizeLookupModel(model: string): string {
  return stripRoutingPrefix(model).trim().toLowerCase();
}

function candidateAliasesForLookup(model: string): string[] {
  const candidates = new Set<string>();
  const normalized = normalizeLookupModel(model);
  const withoutLatest = normalized.replace(/:latest$/u, "");

  for (const candidate of [normalized, withoutLatest]) {
    if (candidate.length === 0) {
      continue;
    }
    candidates.add(candidate);
    candidates.add(candidate.replace(/:/gu, "-"));
  }

  return [...candidates].sort((left, right) => right.length - left.length || left.localeCompare(right));
}

function aliasesForModelsDevModelId(modelId: string): string[] {
  const aliases = new Set<string>();
  const normalized = modelId.trim().toLowerCase();
  const parts = normalized.split("/");

  for (let index = 0; index < parts.length; index += 1) {
    const suffix = parts.slice(index).join("/");
    if (suffix.length > 0) {
      aliases.add(suffix);
      aliases.add(suffix.replace(/:/gu, "-"));
    }
  }

  aliases.add(normalized);
  aliases.add(normalized.replace(/:/gu, "-"));
  return [...aliases].sort((left, right) => right.length - left.length || left.localeCompare(right));
}

const MODELS_DEV_INDEX = new Map<string, readonly ModelsDevIndexedEntry[]>();
const MODELS_DEV_ALIAS_INDEX = new Map<string, ReadonlyMap<string, ModelsDevIndexedEntry>>();

for (const [providerKey, providerSnapshot] of Object.entries(MODELS_DEV.providers)) {
  const entries: ModelsDevIndexedEntry[] = [];
  const aliasIndex = new Map<string, ModelsDevIndexedEntry>();

  for (const [modelId, cost] of Object.entries(providerSnapshot.models)) {
    const entry: ModelsDevIndexedEntry = {
      providerKey,
      modelId,
      cost,
      aliases: aliasesForModelsDevModelId(modelId),
    };
    entries.push(entry);

    for (const alias of entry.aliases) {
      const existing = aliasIndex.get(alias);
      if (!existing || existing.modelId.length > entry.modelId.length) {
        aliasIndex.set(alias, entry);
      }
    }
  }

  MODELS_DEV_INDEX.set(providerKey, entries);
  MODELS_DEV_ALIAS_INDEX.set(providerKey, aliasIndex);
}

function directModelsDevProviderKey(providerId: string): string | undefined {
  const normalized = providerId.trim().toLowerCase();
  switch (normalized) {
    case "gemini":
      return "google";
    case "local-ollama":
    case "ollama":
    case "local":
      return undefined;
    default:
      return MODELS_DEV_INDEX.has(normalized) ? normalized : undefined;
  }
}

function vendorFallbackProvidersForModel(model: string): readonly string[] {
  const normalized = normalizeLookupModel(model);

  if (normalized.startsWith("gpt-")) {
    return ["openai"];
  }
  if (normalized.startsWith("claude-")) {
    return ["anthropic"];
  }
  if (normalized.startsWith("gemini-")) {
    return ["google"];
  }
  if (normalized.startsWith("glm-")) {
    return ["zai"];
  }
  if (normalized.startsWith("deepseek")) {
    return ["deepseek"];
  }
  if (normalized.startsWith("kimi-")) {
    return ["moonshotai"];
  }
  if (normalized.startsWith("minimax")) {
    return ["minimax"];
  }
  if (normalized.startsWith("qwen")) {
    return ["alibaba"];
  }
  if (normalized.startsWith("mistral") || normalized.startsWith("devstral") || normalized.startsWith("ministral")) {
    return ["mistral"];
  }
  if (normalized.startsWith("gemma")) {
    return ["google"];
  }
  if (normalized.startsWith("nemotron")) {
    return ["nvidia"];
  }
  if (normalized.startsWith("llama")) {
    return ["meta"];
  }

  return [];
}

function preferredModelsDevProviders(providerId: string, model: string): string[] {
  const result: string[] = [];
  const direct = directModelsDevProviderKey(providerId);
  if (direct) {
    result.push(direct);
  }

  for (const providerKey of vendorFallbackProvidersForModel(model)) {
    if (!result.includes(providerKey) && MODELS_DEV_INDEX.has(providerKey)) {
      result.push(providerKey);
    }
  }

  return result;
}

function matchScore(entry: ModelsDevIndexedEntry, candidate: string): number {
  if (entry.aliases.includes(candidate)) {
    return 1_000 - entry.modelId.length;
  }

  for (const alias of entry.aliases) {
    if (alias.startsWith(`${candidate}-`)) {
      return 850 - alias.length;
    }
    if (alias.startsWith(candidate)) {
      return 750 - alias.length;
    }
    if (alias.includes(candidate)) {
      return 500 - alias.length;
    }
  }

  return Number.NEGATIVE_INFINITY;
}

function findModelsDevCost(providerKey: string, model: string): ModelsDevResolvedCost | undefined {
  const aliasIndex = MODELS_DEV_ALIAS_INDEX.get(providerKey);
  const entries = MODELS_DEV_INDEX.get(providerKey);
  if (!aliasIndex || !entries) {
    return undefined;
  }

  const candidates = candidateAliasesForLookup(model);
  for (const candidate of candidates) {
    const exact = aliasIndex.get(candidate);
    if (exact) {
      return exact;
    }
  }

  let bestEntry: ModelsDevIndexedEntry | undefined;
  let bestScore = Number.NEGATIVE_INFINITY;
  for (const entry of entries) {
    for (const candidate of candidates) {
      const score = matchScore(entry, candidate);
      if (score > bestScore) {
        bestScore = score;
        bestEntry = entry;
      }
    }
  }

  return bestScore >= 400 ? bestEntry : undefined;
}

function resolveModelsDevCost(providerId: string, model: string): ModelsDevResolvedCost | undefined {
  for (const providerKey of preferredModelsDevProviders(providerId, model)) {
    const match = findModelsDevCost(providerKey, model);
    if (match) {
      return match;
    }
  }
  return undefined;
}

function resolveEnergyProfile(model: string): EnergyProfile {
  const normalized = normalizeLookupModel(model);
  for (const [pattern, profile] of ENERGY_RULES) {
    if (pattern.test(normalized)) {
      return profile;
    }
  }
  return DEFAULT_ENERGY_PROFILE;
}

export function getModelPricing(providerId: string, model: string): ModelPricing {
  const energyProfile = resolveEnergyProfile(model);
  const normalizedProvider = providerId.trim().toLowerCase();

  if (normalizedProvider === "ollama" || normalizedProvider === "local-ollama" || normalizedProvider === "local") {
    return {
      inputPer1MTokens: 0,
      outputPer1MTokens: 0,
      reasoningPer1MTokens: 0,
      cacheReadPer1MTokens: 0,
      cacheWritePer1MTokens: 0,
      ...energyProfile,
      pricingFound: true,
      pricingSource: "local",
    };
  }

  const resolved = resolveModelsDevCost(providerId, model);
  if (!resolved) {
    return {
      inputPer1MTokens: 0,
      outputPer1MTokens: 0,
      reasoningPer1MTokens: 0,
      cacheReadPer1MTokens: 0,
      cacheWritePer1MTokens: 0,
      ...energyProfile,
      pricingFound: false,
      pricingSource: "unpriced",
    };
  }

  const cost = resolved.cost;
  return {
    inputPer1MTokens: cost.input ?? 0,
    outputPer1MTokens: cost.output ?? 0,
    reasoningPer1MTokens: cost.reasoning ?? 0,
    cacheReadPer1MTokens: cost.cache_read ?? 0,
    cacheWritePer1MTokens: cost.cache_write ?? 0,
    ...energyProfile,
    pricingFound: true,
    pricingSource: "models.dev",
    pricingProviderId: resolved.providerKey,
    pricingModelId: resolved.modelId,
  };
}

export function estimateRequestCost(
  providerId: string,
  model: string,
  promptTokens: number,
  completionTokens: number,
): RequestCostEstimate {
  const pricing = getModelPricing(providerId, model);

  const costUsd =
    (promptTokens * pricing.inputPer1MTokens) / 1_000_000 +
    (completionTokens * pricing.outputPer1MTokens) / 1_000_000;

  const energyJoules =
    promptTokens * pricing.joulesPerInputToken +
    completionTokens * pricing.joulesPerOutputToken;

  const waterEvaporatedMl = (energyJoules / JOULES_PER_KWH) * DC_WUE_ML_PER_KWH;

  return { costUsd, energyJoules, waterEvaporatedMl };
}
