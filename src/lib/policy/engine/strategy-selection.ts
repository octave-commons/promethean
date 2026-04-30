import type { ProviderId, PolicyConfig, StrategyInfo } from "../schema.js";
import { matchesPattern } from "./matchers.js";

export function selectStrategyByPolicy(
  strategies: readonly StrategyInfo[],
  providerId: ProviderId,
  config: PolicyConfig,
): StrategyInfo | undefined {
  const providerRules = config.strategySelection.rules.filter((rule) =>
    matchesPattern(providerId, rule.providerPattern),
  );

  for (const rule of providerRules) {
    if (rule.preferredStrategies) {
      for (const preferredMode of rule.preferredStrategies) {
        const match = strategies.find((strategy) => strategy.mode === preferredMode);
        if (match) {
          return match;
        }
      }
    }

    if (rule.excludedStrategies) {
      const excluded = new Set(rule.excludedStrategies);
      const allowed = strategies.filter((strategy) => !excluded.has(strategy.mode));
      if (allowed.length > 0) {
        return allowed[0];
      }
    }
  }

  for (const defaultMode of config.strategySelection.defaultOrder) {
    const match = strategies.find((strategy) => strategy.mode === defaultMode);
    if (match) {
      return match;
    }
  }

  return strategies[0];
}
