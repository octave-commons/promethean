import type { ProviderCredential } from "../../key-pool.js";
import type { AccountInfo, ModelInfo, PlanType } from "../schema.js";

export function toPlanType(planType: string | undefined): PlanType {
  if (!planType) {
    return "unknown";
  }

  switch (planType.toLowerCase().trim()) {
    case "free":
      return "free";
    case "plus":
      return "plus";
    case "pro":
      return "pro";
    case "team":
      return "team";
    case "business":
      return "business";
    case "enterprise":
      return "enterprise";
    default:
      return "unknown";
  }
}

export function toAccountInfo(credential: ProviderCredential): AccountInfo {
  return {
    providerId: credential.providerId,
    accountId: credential.accountId,
    planType: toPlanType(credential.planType),
    authType: credential.authType,
    isExpired: credential.expiresAt !== undefined && Date.now() > credential.expiresAt,
    isRateLimited: false,
  };
}

export function toModelInfo(
  requestedModel: string,
  routedModel: string,
  context: {
    openAiPrefixed: boolean;
    localOllama: boolean;
    explicitOllama: boolean;
  },
): ModelInfo {
  return {
    requestedModel,
    routedModel,
    isGptModel: routedModel.startsWith("gpt-"),
    isOpenAiPrefixed: context.openAiPrefixed,
    isLocal: context.localOllama,
    isOllama: context.explicitOllama,
  };
}
