/**
 * Pantheon LLM Adapter for Anthropic Claude
 * Implements LlmPort for Claude API integration
 */

import type { LlmPort, Message } from '@promethean-os/pantheon-core';
import Anthropic from '@anthropic-ai/sdk';

export type ClaudeAdapterConfig = {
  apiKey: string;
  baseURL?: string;
  defaultModel?: string;
  defaultTemperature?: number;
  defaultMaxTokens?: number;
  defaultTopP?: number;
};

export const makeClaudeAdapter = (config: ClaudeAdapterConfig): LlmPort => {
  const client = new Anthropic({
    apiKey: config.apiKey,
    baseURL: config.baseURL,
  });

  return {
    complete: async (
      messages: Message[],
      opts?: {
        model?: string;
        temperature?: number;
        maxTokens?: number;
        topP?: number;
      },
    ): Promise<Message> => {
      const model = opts?.model || config.defaultModel || 'claude-3-haiku-20240307';
      const temperature = opts?.temperature ?? config.defaultTemperature ?? 0.7;
      const maxTokens = opts?.maxTokens ?? config.defaultMaxTokens ?? 1024;
      const topP = opts?.topP ?? config.defaultTopP;

      try {
        // Convert messages to Claude format
        const systemMessage = messages.find((msg) => msg.role === 'system');
        const conversationMessages = messages.filter((msg) => msg.role !== 'system');

        const responseParams: any = {
          model,
          temperature,
          max_tokens: maxTokens,
          system: systemMessage?.content,
          messages: conversationMessages.map((msg) => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
          })),
        };

        // Add optional top_p parameter only if defined
        if (topP !== undefined) responseParams.top_p = topP;

        const response = await client.messages.create(responseParams);

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
