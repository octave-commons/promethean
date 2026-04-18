import type {
  AccountInfo,
  AccountOrderingRule,
  ModelInfo,
  PlanType,
  PolicyConfig,
  ProviderId,
} from "../schema.js";
import { findMatchingRoutingRule } from "./matchers.js";

export interface AccountOrderingResult {
  readonly ordered: readonly AccountInfo[];
  readonly appliesConstraint: boolean;
  readonly constraintReason?: string;
}

export function sortAccountsByPlanWeight(
  accounts: readonly AccountInfo[],
  weights: Record<PlanType, number>,
): AccountInfo[] {
  return [...accounts].sort((left, right) => {
    const leftWeight = weights[left.planType] ?? weights.unknown ?? 1;
    const rightWeight = weights[right.planType] ?? weights.unknown ?? 1;
    return rightWeight - leftWeight;
  });
}

export function applyAccountOrdering(
  accounts: readonly AccountInfo[],
  rule: AccountOrderingRule,
): AccountInfo[] {
  switch (rule.kind) {
    case "prefer_plans": {
      const planSet = new Set(rule.plans);
      const preferred = accounts.filter((account) => planSet.has(account.planType));
      const remaining = accounts.filter((account) => !planSet.has(account.planType));
      return [...preferred, ...remaining];
    }

    case "exclude_plans": {
      const planSet = new Set(rule.plans);
      return accounts.filter((account) => !planSet.has(account.planType));
    }

    case "prefer_free": {
      const free = accounts.filter((account) => account.planType === "free");
      const nonFree = accounts.filter((account) => account.planType !== "free");
      return [...free, ...nonFree];
    }

    case "custom_weight":
      return sortAccountsByPlanWeight(accounts, rule.weights);

    default:
      return [...accounts];
  }
}

export function createAccountOrdering(
  _providerId: ProviderId,
  accounts: readonly AccountInfo[],
  model: ModelInfo,
  config: PolicyConfig,
): AccountOrderingResult {
  const rule = findMatchingRoutingRule(model, config.modelRouting.rules);
  const orderingRule = rule?.accountOrdering ?? config.modelRouting.defaultAccountOrdering;
  const constraints = config.accountPreferences.modelConstraints[model.routedModel];

  if (constraints?.requiresPlan?.length) {
    const requiredPlans = new Set(constraints.requiresPlan);
    const hasMatchingAccount = accounts.some((account) => requiredPlans.has(account.planType));
    if (hasMatchingAccount) {
      const qualified = accounts.filter((account) => requiredPlans.has(account.planType));
      return {
        ordered: applyAccountOrdering(qualified, orderingRule),
        appliesConstraint: true,
        constraintReason: `Model ${model.routedModel} requires ${constraints.requiresPlan.join(" or ")} plan`,
      };
    }
  }

  if (constraints?.excludesPlan?.length) {
    const excludedPlans = new Set(constraints.excludesPlan);
    const filtered = accounts.filter((account) => !excludedPlans.has(account.planType));
    if (filtered.length > 0) {
      return {
        ordered: applyAccountOrdering(filtered, orderingRule),
        appliesConstraint: true,
        constraintReason: `Model ${model.routedModel} excludes ${constraints.excludesPlan.join(", ")} plans`,
      };
    }
  }

  return {
    ordered: applyAccountOrdering(accounts, orderingRule),
    appliesConstraint: false,
  };
}
