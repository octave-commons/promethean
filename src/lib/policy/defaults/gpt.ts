import type { ModelId, ModelRoutingRule, PlanType, ProviderId } from "../schema.js";

export const DEFAULT_GPT_PROVIDER_ORDER: readonly ProviderId[] = [
  "openai",
  "factory",
  "openrouter",
  "requesty",
  "vivgrid",
];

export const GPT_OSS_PROVIDER_ORDER: readonly ProviderId[] = [
  "openai",
  "factory",
  "ollama-cloud",
  "openrouter",
  "requesty",
  "vivgrid",
];

export const CLAUDE_OPUS_46_PROVIDER_ORDER: readonly ProviderId[] = [
  "factory",
  "openrouter",
  "requesty",
  "vivgrid",
];

export const GLM_PROVIDER_ORDER: readonly ProviderId[] = [
  "ollama-cloud",
  "zai",
  "requesty",
  "factory",
  "openrouter",
  "openai",
  "vivgrid",
];

export const GPT_FREE_BLOCKED_MODELS: readonly ModelId[] = [
  "gpt-5.3-codex",
  "gpt-5-mini",
];

export const PAID_PLAN_WEIGHTS: Record<PlanType, number> = {
  plus: 5,
  pro: 4,
  business: 4,
  enterprise: 4,
  team: 2,
  unknown: 1,
  free: 0,
};

export const PAID_PLANS: readonly PlanType[] = ["plus", "pro", "business", "enterprise", "team"];

function escapeRegexLiteral(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const GPT_FREE_BLOCKED_MODEL_PATTERN = new RegExp(
  `^(?:${GPT_FREE_BLOCKED_MODELS.map(escapeRegexLiteral).join("|")})$`,
);

export function buildFreeBlockedConstraints(
  models: readonly ModelId[],
): Record<ModelId, { readonly requiresPlan: PlanType[]; readonly excludesPlan: PlanType[] }> {
  const constraints: Record<ModelId, { readonly requiresPlan: PlanType[]; readonly excludesPlan: PlanType[] }> = {};
  for (const model of models) {
    constraints[model] = {
      requiresPlan: [...PAID_PLANS],
      excludesPlan: ["free"],
    };
  }
  return constraints;
}

export function createGptModelRoutingRules(): readonly ModelRoutingRule[] {
  return [
    {
      modelPattern: /^glm-/,
      preferredProviders: GLM_PROVIDER_ORDER,
      accountOrdering: { kind: "prefer_free" },
    },
    {
      modelPattern: /^claude-opus-4-6(?:-fast)?$/,
      preferredProviders: CLAUDE_OPUS_46_PROVIDER_ORDER,
      excludedProviders: ["openai", "ollama-cloud"],
      accountOrdering: { kind: "prefer_free" },
    },
    {
      modelPattern: /^gpt-oss/,
      preferredProviders: GPT_OSS_PROVIDER_ORDER,
      accountOrdering: { kind: "prefer_free" },
    },
    {
      modelPattern: GPT_FREE_BLOCKED_MODEL_PATTERN,
      requiresPaidPlan: true,
      preferredProviders: DEFAULT_GPT_PROVIDER_ORDER,
      excludedProviders: ["ollama-cloud"],
      accountOrdering: { kind: "custom_weight", weights: PAID_PLAN_WEIGHTS },
    },
    {
      modelPattern: /^gpt-[6-9]/,
      requiresPaidPlan: true,
      preferredProviders: DEFAULT_GPT_PROVIDER_ORDER,
      excludedProviders: ["ollama-cloud"],
      accountOrdering: { kind: "custom_weight", weights: PAID_PLAN_WEIGHTS },
    },
    {
      modelPattern: /^gpt-/,
      preferredProviders: DEFAULT_GPT_PROVIDER_ORDER,
      excludedProviders: ["ollama-cloud"],
      accountOrdering: { kind: "prefer_free" },
    },
  ];
}
