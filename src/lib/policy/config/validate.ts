import type { PolicyConfig } from "../schema.js";

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validateAccountOrderingRule(rule: unknown): boolean {
  if (!isObject(rule) || typeof rule.kind !== "string") {
    return false;
  }

  switch (rule.kind) {
    case "prefer_plans":
    case "exclude_plans":
      return Array.isArray(rule.plans) && rule.plans.every((plan) => typeof plan === "string");
    case "prefer_free":
      return true;
    case "custom_weight":
      return isObject(rule.weights);
    default:
      return false;
  }
}

function validateModelRoutingRule(rule: unknown): boolean {
  if (!isObject(rule)) {
    return false;
  }

  if (typeof rule.modelPattern !== "string" && !(rule.modelPattern instanceof RegExp)) {
    return false;
  }

  if (rule.preferredProviders !== undefined && (!Array.isArray(rule.preferredProviders) || !rule.preferredProviders.every((provider) => typeof provider === "string"))) {
    return false;
  }

  if (rule.excludedProviders !== undefined && (!Array.isArray(rule.excludedProviders) || !rule.excludedProviders.every((provider) => typeof provider === "string"))) {
    return false;
  }

  if (rule.accountOrdering !== undefined && !validateAccountOrderingRule(rule.accountOrdering)) {
    return false;
  }

  if (rule.requiresPaidPlan !== undefined && typeof rule.requiresPaidPlan !== "boolean") {
    return false;
  }

  if (rule.fallbackModels !== undefined && !Array.isArray(rule.fallbackModels)) {
    return false;
  }

  return true;
}

function validateStrategySelectionRule(rule: unknown): boolean {
  if (!isObject(rule)) {
    return false;
  }

  if (typeof rule.providerPattern !== "string" && !(rule.providerPattern instanceof RegExp)) {
    return false;
  }

  if (rule.preferredStrategies !== undefined && !Array.isArray(rule.preferredStrategies)) {
    return false;
  }

  if (rule.excludedStrategies !== undefined && !Array.isArray(rule.excludedStrategies)) {
    return false;
  }

  return true;
}

function validatePlanWeights(weights: unknown): boolean {
  if (!isObject(weights)) {
    return false;
  }

  const validPlanTypes = ["free", "plus", "pro", "team", "business", "enterprise", "unknown"];
  for (const [key, value] of Object.entries(weights)) {
    if (!validPlanTypes.includes(key) || typeof value !== "number") {
      return false;
    }
  }

  return true;
}

function validateFallbackBehavior(fallback: unknown): boolean {
  if (!isObject(fallback)) {
    return false;
  }

  for (const field of ["maxAttempts", "retryDelayMs", "retryBackoffMultiplier", "transientRetryCount"]) {
    if (fallback[field] !== undefined && typeof fallback[field] !== "number") {
      return false;
    }
  }

  if (fallback.transientStatusCodes !== undefined && !Array.isArray(fallback.transientStatusCodes)) {
    return false;
  }

  for (const field of ["skipOnRateLimit", "skipOnModelNotFound", "skipOnAccountIncompatible", "skipOnServerError"]) {
    if (fallback[field] !== undefined && typeof fallback[field] !== "boolean") {
      return false;
    }
  }

  return true;
}

function validateModelConstraints(constraints: unknown): boolean {
  if (!isObject(constraints)) {
    return false;
  }

  for (const value of Object.values(constraints)) {
    if (!isObject(value)) {
      return false;
    }

    if (value.requiresPlan !== undefined && !Array.isArray(value.requiresPlan)) {
      return false;
    }

    if (value.excludesPlan !== undefined && !Array.isArray(value.excludesPlan)) {
      return false;
    }
  }

  return true;
}

export function validatePolicyConfig(config: unknown, filePath: string): DeepPartial<PolicyConfig> {
  if (!isObject(config)) {
    throw new Error(`Policy config file ${filePath} must be a JSON object`);
  }

  if (config.version !== undefined && config.version !== "1.0") {
    throw new Error(`Policy config file ${filePath} must have version "1.0"`);
  }

  if (config.modelRouting !== undefined) {
    if (!isObject(config.modelRouting)) {
      throw new Error(`Policy config file ${filePath}: modelRouting must be an object`);
    }

    if (config.modelRouting.rules !== undefined && !Array.isArray(config.modelRouting.rules)) {
      throw new Error(`Policy config file ${filePath}: modelRouting.rules must be an array`);
    }

    for (const rule of (config.modelRouting.rules as unknown[]) ?? []) {
      if (!validateModelRoutingRule(rule)) {
        throw new Error(`Policy config file ${filePath}: invalid modelRouting rule`);
      }
    }

    if (
      config.modelRouting.defaultAccountOrdering !== undefined
      && !validateAccountOrderingRule(config.modelRouting.defaultAccountOrdering)
    ) {
      throw new Error(`Policy config file ${filePath}: invalid modelRouting.defaultAccountOrdering`);
    }
  }

  if (config.strategySelection !== undefined) {
    if (!isObject(config.strategySelection)) {
      throw new Error(`Policy config file ${filePath}: strategySelection must be an object`);
    }

    if (config.strategySelection.rules !== undefined && !Array.isArray(config.strategySelection.rules)) {
      throw new Error(`Policy config file ${filePath}: strategySelection.rules must be an array`);
    }

    for (const rule of (config.strategySelection.rules as unknown[]) ?? []) {
      if (!validateStrategySelectionRule(rule)) {
        throw new Error(`Policy config file ${filePath}: invalid strategySelection rule`);
      }
    }

    if (config.strategySelection.defaultOrder !== undefined && !Array.isArray(config.strategySelection.defaultOrder)) {
      throw new Error(`Policy config file ${filePath}: strategySelection.defaultOrder must be an array`);
    }
  }

  if (config.fallback !== undefined && !validateFallbackBehavior(config.fallback)) {
    throw new Error(`Policy config file ${filePath}: invalid fallback configuration`);
  }

  if (config.accountPreferences !== undefined) {
    if (!isObject(config.accountPreferences)) {
      throw new Error(`Policy config file ${filePath}: accountPreferences must be an object`);
    }

    if (config.accountPreferences.planWeights !== undefined && !validatePlanWeights(config.accountPreferences.planWeights)) {
      throw new Error(`Policy config file ${filePath}: invalid accountPreferences.planWeights`);
    }

    if (config.accountPreferences.modelConstraints !== undefined && !validateModelConstraints(config.accountPreferences.modelConstraints)) {
      throw new Error(`Policy config file ${filePath}: invalid accountPreferences.modelConstraints`);
    }
  }

  return config as DeepPartial<PolicyConfig>;
}
