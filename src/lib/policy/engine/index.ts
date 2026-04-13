import type {
  AccountInfo,
  FallbackBehavior,
  ModelInfo,
  PlanType,
  PolicyConfig,
  ProviderId,
  StrategyInfo,
} from "../schema.js";
import { DEFAULT_FALLBACK_BEHAVIOR, DEFAULT_PLAN_WEIGHTS } from "../schema.js";
import { findMatchingProviderPreferenceRule } from "./matchers.js";
import { createAccountOrdering, type AccountOrderingResult } from "./account-ordering.js";
import { orderProvidersForModel } from "./provider-ordering.js";
import { selectStrategyByPolicy } from "./strategy-selection.js";

export interface PolicyEngine {
  orderAccounts(
    providerId: ProviderId,
    accounts: readonly AccountInfo[],
    model: ModelInfo,
  ): AccountOrderingResult;

  orderProviders(
    providerIds: readonly ProviderId[],
    model: ModelInfo,
  ): readonly ProviderId[];

  selectStrategy(
    strategies: readonly StrategyInfo[],
    providerId: ProviderId,
  ): StrategyInfo | undefined;

  getFallbackBehavior(): FallbackBehavior;
  getPlanWeights(): Record<PlanType, number>;
  getModelConstraints(modelId: string): PolicyConfig["accountPreferences"]["modelConstraints"][string] | undefined;
}

export function createPolicyEngine(config: PolicyConfig): PolicyEngine {
  return {
    orderAccounts(providerId, accounts, model) {
      return createAccountOrdering(providerId, accounts, model, config);
    },

    orderProviders(providerIds, model) {
      const rule = findMatchingProviderPreferenceRule(model, config.modelRouting.rules);
      return orderProvidersForModel(providerIds, model, rule);
    },

    selectStrategy(strategies, providerId) {
      return selectStrategyByPolicy(strategies, providerId, config);
    },

    getFallbackBehavior(): FallbackBehavior {
      return config.fallback;
    },

    getPlanWeights(): Record<PlanType, number> {
      return config.accountPreferences.planWeights;
    },

    getModelConstraints(modelId: string): PolicyConfig["accountPreferences"]["modelConstraints"][string] | undefined {
      return config.accountPreferences.modelConstraints[modelId];
    },
  };
}

export type { AccountOrderingResult } from "./account-ordering.js";
export type { ProviderId, AccountId, PlanType, ModelInfo, AccountInfo } from "../schema.js";
export { DEFAULT_PLAN_WEIGHTS, DEFAULT_FALLBACK_BEHAVIOR };
