import type { ProviderStrategy, StrategyRequestContext } from "./shared.js";
import { providerUsesOpenAiChatCompletions } from "./shared.js";
import { shouldUseResponsesUpstream } from "../responses-compat.js";
import { GeminiChatProviderStrategy } from "./strategies/gemini.js";
import { FactoryChatCompletionsProviderStrategy, FactoryMessagesProviderStrategy, FactoryResponsesPassthroughStrategy, FactoryResponsesProviderStrategy } from "./strategies/factory.js";
import { OpenAiChatCompletionsProviderStrategy, OpenAiResponsesPassthroughStrategy, OpenAiResponsesProviderStrategy } from "./strategies/openai.js";
import { LocalOllamaProviderStrategy, OllamaProviderStrategy } from "./strategies/ollama.js";
import { ChatCompletionsProviderStrategy, ImagesGenerationsPassthroughStrategy, MessagesProviderStrategy, ResponsesPassthroughStrategy, ResponsesProviderStrategy, ZaiChatCompletionsProviderStrategy } from "./strategies/standard.js";

export const GEMINI_CHAT_STRATEGY = new GeminiChatProviderStrategy();
export const ZAI_CHAT_STRATEGY = new ZaiChatCompletionsProviderStrategy();

export const PROVIDER_STRATEGIES: readonly ProviderStrategy[] = [
  new ImagesGenerationsPassthroughStrategy(),
  new OpenAiResponsesPassthroughStrategy(),
  new FactoryResponsesPassthroughStrategy(),
  new ResponsesPassthroughStrategy(),
  new OllamaProviderStrategy(),
  new LocalOllamaProviderStrategy(),
  new FactoryMessagesProviderStrategy(),
  new FactoryResponsesProviderStrategy(),
  new FactoryChatCompletionsProviderStrategy(),
  new OpenAiResponsesProviderStrategy(),
  new OpenAiChatCompletionsProviderStrategy(),
  new MessagesProviderStrategy(),
  new ResponsesProviderStrategy(),
  new ChatCompletionsProviderStrategy(),
];

export function selectRemoteProviderStrategyForRoute(
  context: StrategyRequestContext,
  providerId: string,
): ProviderStrategy {
  const normalizedProviderId = providerId.trim().toLowerCase();

  if (normalizedProviderId === "gemini" && context.responsesPassthrough !== true && context.imagesPassthrough !== true) {
    return GEMINI_CHAT_STRATEGY;
  }

  if (normalizedProviderId === "zai" && context.responsesPassthrough !== true && context.imagesPassthrough !== true) {
    return ZAI_CHAT_STRATEGY;
  }

  if (providerUsesOpenAiChatCompletions(providerId) && context.responsesPassthrough !== true && context.imagesPassthrough !== true) {
    // Models that need the Responses API (gpt-*) should use the responses
    // strategy even for requesty/openrouter -- their /v1/chat/completions
    // endpoint rejects tools+reasoning_effort for newer models.
    const needsResponses = shouldUseResponsesUpstream(context.routedModel, context.config.responsesModelPrefixes);
    if (!needsResponses) {
      return PROVIDER_STRATEGIES.find((entry) => entry.mode === "chat_completions" && entry.matches({
        ...context,
        factoryPrefixed: false,
        openAiPrefixed: false,
        explicitOllama: false,
        localOllama: false,
      })) ?? PROVIDER_STRATEGIES[PROVIDER_STRATEGIES.length - 1]!;
    }
  }

  const routeContext: StrategyRequestContext = {
    ...context,
    openAiPrefixed: providerId === context.config.openaiProviderId,
    factoryPrefixed: providerId === "factory",
    explicitOllama: false,
    localOllama: false,
  };

  return PROVIDER_STRATEGIES.find((entry) => !entry.isLocal && entry.matches(routeContext))
    ?? PROVIDER_STRATEGIES[PROVIDER_STRATEGIES.length - 1]!;
}
