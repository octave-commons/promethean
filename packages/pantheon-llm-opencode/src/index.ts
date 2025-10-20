/**
 * Pantheon LLM Adapter for OpenCode
 * Implements LlmPort for OpenCode client integration
 */

import type { LlmPort, Message } from '@promethean/pantheon-core';

export type OpenCodeAdapterConfig = {
  // OpenCode doesn't typically need API keys since it's local
  modelPath?: string;
  defaultModel?: string;
  defaultTemperature?: number;
};

export const makeOpenCodeAdapter = (_config: OpenCodeAdapterConfig): LlmPort => {
  return {
    complete: async (
      messages: Message[],
      _opts?: { model?: string; temperature?: number },
    ): Promise<Message> => {
      // This is a placeholder implementation
      // In a real implementation, you would integrate with the OpenCode client
      // to handle local model inference or connect to OpenCode services

      console.warn('OpenCode adapter is not fully implemented - placeholder response');

      // For now, return a simple response indicating the adapter needs implementation
      return {
        role: 'assistant',
        content: `OpenCode adapter received ${messages.length} messages. This is a placeholder response - the OpenCode integration needs to be implemented with actual model inference.`,
      };
    },
  };
};
