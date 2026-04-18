import type { ModelInfo, ModelRoutingRule, ProviderId } from "../schema.js";

export function orderProvidersByRule(
  providerIds: readonly ProviderId[],
  rule: ModelRoutingRule | undefined,
): ProviderId[] {
  if (providerIds.length <= 1) {
    return [...providerIds];
  }

  const originalOrder = new Map(providerIds.map((providerId, index) => [providerId, index]));
  const excludedProviders = new Set(rule?.excludedProviders ?? []);
  const filteredProviderIds = providerIds.filter((providerId) => !excludedProviders.has(providerId));
  const preferredProviders = rule?.preferredProviders ?? [];
  if (preferredProviders.length === 0) {
    return [...filteredProviderIds];
  }

  const preferredOrder = new Map(preferredProviders.map((providerId, index) => [providerId, index]));

  return [...filteredProviderIds].sort((left, right) => {
    const leftPriority = preferredOrder.get(left) ?? preferredProviders.length;
    const rightPriority = preferredOrder.get(right) ?? preferredProviders.length;
    if (leftPriority !== rightPriority) {
      return leftPriority - rightPriority;
    }
    return (originalOrder.get(left) ?? 0) - (originalOrder.get(right) ?? 0);
  });
}

export function orderProvidersForModel(
  providerIds: readonly ProviderId[],
  _model: ModelInfo,
  rule: ModelRoutingRule | undefined,
): ProviderId[] {
  return orderProvidersByRule(providerIds, rule);
}
