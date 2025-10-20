/**
 * Pantheon LLM Adapter for Anthropic Claude
 * Implements LlmPort for Claude API integration
 */

import type { LlmPort, Message } from '@promethean/pantheon-core';
import Anthropic from '@anthropic-ai/sdk';

export type ClaudeAdapterConfig = {
  apiKey: string;
  baseURL?: string;
  defaultModel?: string;
  defaultTemperature?: number;
  maxTokens?: number;
};

export const makeClaudeAdapter = (config: ClaudeAdapterConfig): LlmPort => {
  const client = new Anthropic({
    apiKey: config.apiKey,
    baseURL: config.baseURL,
  });

  return {
    complete: async (
      messages: Message[],
      opts?: { model?: string; temperature?: number },
    ): Promise<Message> => {
      const model = opts?.model || config.defaultModel || 'claude-3-haiku-20240307';
      const temperature = opts?.temperature ?? config.defaultTemperature ?? 0.7;
      const maxTokens = config.maxTokens || 1024;

      try {
        // Convert messages to Claude format
        const systemMessage = messages.find((msg) => msg.role === 'system');
        const conversationMessages = messages.filter((msg) => msg.role !== 'system');

        const response = await client.messages.create({
          model,
          temperature,
          max_tokens: maxTokens,
          system: systemMessage?.content,
          messages: conversationMessages.map((msg) => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
          })),
        });

        const content = response.content[0];
        if (!content || content.type !== 'text') {
          throw new Error('Unexpected response type from Claude');
        }

        return {
          role: 'assistant',
          content: content.text,
        };
      } catch (error) {
        throw new Error(
          `Claude API error: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    },
  };
};
