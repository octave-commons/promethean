import type { ModelInfo, ModelRoutingRule } from "../schema.js";

export function matchesPattern(value: string, pattern: string | RegExp): boolean {
  if (typeof pattern === "string") {
    return value === pattern || value.startsWith(pattern);
  }
  return pattern.test(value);
}

export function findMatchingRoutingRule(
  model: ModelInfo,
  rules: readonly ModelRoutingRule[],
): ModelRoutingRule | undefined {
  for (const rule of rules) {
    if (matchesPattern(model.routedModel, rule.modelPattern)) {
      return rule;
    }
  }

  return undefined;
}

export function findMatchingProviderPreferenceRule(
  model: ModelInfo,
  rules: readonly ModelRoutingRule[],
): ModelRoutingRule | undefined {
  for (const rule of rules) {
    if (!matchesPattern(model.routedModel, rule.modelPattern)) {
      continue;
    }

    if ((rule.preferredProviders?.length ?? 0) > 0 || (rule.excludedProviders?.length ?? 0) > 0) {
      return rule;
    }
  }

  return undefined;
}
