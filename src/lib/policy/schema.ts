export type ProviderId = string;
export type AccountId = string;
export type ModelId = string;
export type PlanType = "free" | "plus" | "pro" | "team" | "business" | "enterprise" | "unknown";

export interface AccountInfo {
  readonly providerId: ProviderId;
  readonly accountId: AccountId;
  readonly planType: PlanType;
  readonly authType: "api_key" | "oauth_bearer" | "local";
  readonly isExpired?: boolean;
  readonly isRateLimited?: boolean;
  readonly rateLimitExpiresAt?: number;
}

export interface ModelInfo {
  readonly requestedModel: ModelId;
  readonly routedModel: ModelId;
  readonly isGptModel: boolean;
  readonly isOpenAiPrefixed: boolean;
  readonly isLocal: boolean;
  readonly isOllama: boolean;
}

export type UpstreamMode =
  | "chat_completions"
  | "responses"
  | "messages"
  | "openai_chat_completions"
  | "openai_responses"
  | "ollama_chat"
  | "local_ollama_chat";

export interface StrategyInfo {
  readonly mode: UpstreamMode;
  readonly isLocal: boolean;
  readonly priority: number;
}

export interface RequestContext {
  readonly model: ModelInfo;
  readonly clientWantsStream: boolean;
  readonly needsReasoningTrace: boolean;
}

export type AccountOrderingRule =
  | { readonly kind: "prefer_plans"; readonly plans: readonly PlanType[] }
  | { readonly kind: "exclude_plans"; readonly plans: readonly PlanType[] }
  | { readonly kind: "prefer_free" }
  | { readonly kind: "custom_weight"; readonly weights: Record<PlanType, number> };

export interface ModelRoutingRule {
  readonly modelPattern: string | RegExp;
  readonly preferredProviders?: readonly ProviderId[];
  readonly excludedProviders?: readonly ProviderId[];
  readonly accountOrdering?: AccountOrderingRule;
  readonly requiresPaidPlan?: boolean;
  readonly fallbackModels?: readonly ModelId[];
}

export interface StrategySelectionRule {
  readonly providerPattern: string | RegExp;
  readonly preferredStrategies?: readonly UpstreamMode[];
  readonly excludedStrategies?: readonly UpstreamMode[];
}

export interface FallbackBehavior {
  readonly maxAttempts: number;
  readonly retryDelayMs: number;
  readonly retryBackoffMultiplier: number;
  readonly transientRetryCount: number;
  readonly transientStatusCodes: readonly number[];
  readonly skipOnRateLimit: boolean;
  readonly skipOnModelNotFound: boolean;
  readonly skipOnAccountIncompatible: boolean;
  readonly skipOnServerError: boolean;
}

export interface PolicyConfig {
  readonly version: "1.0";

  readonly modelRouting: {
    readonly rules: readonly ModelRoutingRule[];
    readonly defaultAccountOrdering: AccountOrderingRule;
  };

  readonly strategySelection: {
    readonly rules: readonly StrategySelectionRule[];
    readonly defaultOrder: readonly UpstreamMode[];
  };

  readonly fallback: FallbackBehavior;

  readonly accountPreferences: {
    readonly planWeights: Record<PlanType, number>;
    readonly modelConstraints: Record<ModelId, {
      readonly requiresPlan?: PlanType[];
      readonly excludesPlan?: PlanType[];
    }>;
  };
}

export const DEFAULT_PLAN_WEIGHTS: Record<PlanType, number> = {
  plus: 5,
  pro: 4,
  business: 4,
  enterprise: 4,
  team: 2,
  unknown: 1,
  free: 0,
};

export const DEFAULT_FALLBACK_BEHAVIOR: FallbackBehavior = {
  maxAttempts: 50,
  retryDelayMs: 1000,
  retryBackoffMultiplier: 2,
  transientRetryCount: 2,
  transientStatusCodes: [502, 503, 504],
  skipOnRateLimit: true,
  skipOnModelNotFound: false,
  skipOnAccountIncompatible: true,
  skipOnServerError: false,
};
