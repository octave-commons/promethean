import type { IncomingHttpHeaders } from "node:http";

import type { ProxyConfig } from "../config.js";
import { requestWantsReasoningTrace } from "../provider-utils.js";
import { resolveRequestRoutingState } from "../provider-routing.js";
import { PROVIDER_STRATEGIES } from "./registry.js";
import type { ResolvedRequestAuth } from "../request-auth.js";
import type { ProviderStrategy, StrategyRequestContext } from "./shared.js";

function selectMatchingStrategy(context: StrategyRequestContext): ProviderStrategy {
  return PROVIDER_STRATEGIES.find((entry) => entry.matches(context))
    ?? PROVIDER_STRATEGIES[PROVIDER_STRATEGIES.length - 1]!;
}

export function selectProviderStrategy(
  config: ProxyConfig,
  clientHeaders: IncomingHttpHeaders,
  requestBody: Record<string, unknown>,
  requestedModelInput: string,
  routingModelInput: string,
  requestAuth?: Pick<ResolvedRequestAuth, "kind" | "tenantId" | "keyId" | "subject">,
): {
  readonly strategy: ProviderStrategy;
  readonly context: StrategyRequestContext;
} {
  const routingState = resolveRequestRoutingState(config, routingModelInput);
  const clientWantsStream = requestBody.stream === true;
  const needsReasoningTrace = requestWantsReasoningTrace(requestBody);
  const upstreamAttemptTimeoutMs = clientWantsStream
    ? Math.min(config.requestTimeoutMs, config.streamBootstrapTimeoutMs)
    : config.requestTimeoutMs;

  const context: StrategyRequestContext = {
    config,
    clientHeaders,
    requestBody,
    requestAuth,
    requestedModelInput,
    routingModelInput,
    routedModel: routingState.routedModel,
    explicitOllama: routingState.explicitOllama,
    openAiPrefixed: routingState.openAiPrefixed,
    factoryPrefixed: routingState.factoryPrefixed,
    localOllama: routingState.localOllama,
    clientWantsStream,
    needsReasoningTrace,
    upstreamAttemptTimeoutMs,
  };

  return { strategy: selectMatchingStrategy(context), context };
}

export function buildResponsesPassthroughContext(
  config: ProxyConfig,
  clientHeaders: IncomingHttpHeaders,
  requestBody: Record<string, unknown>,
  requestedModelInput: string,
  routingModelInput: string,
  requestAuth?: Pick<ResolvedRequestAuth, "kind" | "tenantId" | "keyId" | "subject">,
): {
  readonly strategy: ProviderStrategy;
  readonly context: StrategyRequestContext;
} {
  const routingState = resolveRequestRoutingState(config, routingModelInput);
  const clientWantsStream = requestBody.stream === true;
  const upstreamAttemptTimeoutMs = clientWantsStream
    ? Math.min(config.requestTimeoutMs, config.streamBootstrapTimeoutMs)
    : config.requestTimeoutMs;

  const context: StrategyRequestContext = {
    config,
    clientHeaders,
    requestBody,
    requestAuth,
    requestedModelInput,
    routingModelInput,
    routedModel: routingState.routedModel,
    explicitOllama: false,
    openAiPrefixed: routingState.openAiPrefixed
      || (!routingState.factoryPrefixed && config.upstreamProviderId === config.openaiProviderId),
    factoryPrefixed: routingState.factoryPrefixed,
    localOllama: false,
    clientWantsStream,
    needsReasoningTrace: false,
    upstreamAttemptTimeoutMs,
    responsesPassthrough: true,
  };

  return { strategy: selectMatchingStrategy(context), context };
}

export function buildImagesPassthroughContext(
  config: ProxyConfig,
  clientHeaders: IncomingHttpHeaders,
  requestBody: Record<string, unknown>,
  model: string,
  requestAuth?: Pick<ResolvedRequestAuth, "kind" | "tenantId" | "keyId" | "subject">,
): {
  readonly strategy: ProviderStrategy;
  readonly context: StrategyRequestContext;
} {
  const routingState = resolveRequestRoutingState(config, model);

  const context: StrategyRequestContext = {
    config,
    clientHeaders,
    requestBody,
    requestAuth,
    requestedModelInput: model,
    routingModelInput: model,
    routedModel: routingState.routedModel,
    explicitOllama: false,
    openAiPrefixed: routingState.openAiPrefixed,
    factoryPrefixed: routingState.factoryPrefixed,
    localOllama: false,
    clientWantsStream: false,
    needsReasoningTrace: false,
    upstreamAttemptTimeoutMs: config.requestTimeoutMs,
    imagesPassthrough: true,
  };

  return { strategy: selectMatchingStrategy(context), context };
}
