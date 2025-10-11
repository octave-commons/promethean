export { BaseProvider } from './base.js';
export { OllamaProvider } from './ollama.js';
export { VLLMProvider } from './vllm.js';
export { OpenAIProvider } from './openai.js';

import { BaseProvider } from './base.js';
import { OllamaProvider } from './ollama.js';
import { VLLMProvider } from './vllm.js';
import { OpenAIProvider } from './openai.js';
import { ProviderConfig, ProviderType } from '../types/index.js';

export function createProvider(config: ProviderConfig): BaseProvider {
  switch (config.type) {
    case 'ollama':
      return new OllamaProvider(config);
    case 'vllm':
      return new VLLMProvider(config);
    case 'openai':
      return new OpenAIProvider(config);
    default:
      throw new Error(`Unsupported provider type: ${config.type}`);
  }
}

export function getSupportedProviders(): ProviderType[] {
  return ['ollama', 'vllm', 'openai'];
}
