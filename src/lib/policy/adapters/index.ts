import type { ProviderCredential } from "../../key-pool.js";
import type { ProviderRoute } from "../../provider-routing.js";
import type { PolicyEngine, PlanType } from "../engine/index.js";
import { toAccountInfo, toModelInfo, toPlanType } from "./model-info.js";

export function orderAccountsByPolicy(
  policy: PolicyEngine,
  providerId: string,
  accounts: readonly ProviderCredential[],
  routedModel: string,
  context: {
    openAiPrefixed: boolean;
    localOllama: boolean;
    explicitOllama: boolean;
  },
): ProviderCredential[] {
  if (accounts.length === 0) {
    return [];
  }

  const modelInfo = toModelInfo(routedModel, routedModel, context);
  const result = policy.orderAccounts(providerId, accounts.map(toAccountInfo), modelInfo);
  const orderedIds = new Set(result.ordered.map((account) => account.accountId));
  const orderedCredentials: ProviderCredential[] = [];

  for (const info of result.ordered) {
    const credential = accounts.find((account) => account.accountId === info.accountId);
    if (credential) {
      orderedCredentials.push(credential);
    }
  }

  if (result.appliesConstraint) {
    return orderedCredentials;
  }

  for (const credential of accounts) {
    if (!orderedIds.has(credential.accountId)) {
      orderedCredentials.push(credential);
    }
  }

  return orderedCredentials;
}

export function orderProviderRoutesByPolicy(
  policy: PolicyEngine,
  routes: readonly ProviderRoute[],
  requestedModel: string,
  routedModel: string,
  context: {
    openAiPrefixed: boolean;
    localOllama: boolean;
    explicitOllama: boolean;
  },
): ProviderRoute[] {
  if (routes.length <= 1) {
    return [...routes];
  }

  const modelInfo = toModelInfo(requestedModel, routedModel, context);
  const orderedProviderIds = policy.orderProviders(routes.map((route) => route.providerId), modelInfo);
  const routeByProviderId = new Map(routes.map((route) => [route.providerId, route]));
  const orderedRoutes: ProviderRoute[] = [];

  for (const providerId of orderedProviderIds) {
    const route = routeByProviderId.get(providerId);
    if (route) {
      orderedRoutes.push(route);
    }
  }

  return orderedRoutes;
}

export function getPlanWeightsForModel(
  policy: PolicyEngine,
  modelId: string,
): Record<string, number> {
  const constraints = policy.getModelConstraints(modelId);
  const baseWeights = policy.getPlanWeights();

  if (constraints?.requiresPlan?.length) {
    const requiredPlans = new Set(constraints.requiresPlan);
    const adjusted: Record<string, number> = {};

    for (const [plan, weight] of Object.entries(baseWeights)) {
      adjusted[plan] = requiredPlans.has(plan as PlanType) ? weight + 10 : weight - 5;
    }

    return adjusted;
  }

  return { ...baseWeights };
}

export { toPlanType, toAccountInfo, toModelInfo };
