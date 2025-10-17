import { OpenAIProvider, setDefaultModelProvider } from "@openai/agents";

type OpenAIProviderOptions = ConstructorParameters<typeof OpenAIProvider>[0];

export function createOpenAIModelProvider(
  options?: OpenAIProviderOptions,
): OpenAIProvider {
  return new OpenAIProvider(options);
}

export function registerOpenAIDefaultModelProvider(
  options?: OpenAIProviderOptions,
): OpenAIProvider {
  const provider = new OpenAIProvider(options);
  setDefaultModelProvider(provider);
  return provider;
}
