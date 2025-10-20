/**
 * Pantheon LLM Adapter for OpenAI
 * Implements LlmPort for OpenAI API integration
 */

import type { LlmPort, Message } from '@promethean/pantheon-core';
import OpenAI from 'openai';

export type OpenAIAdapterConfig = {
  apiKey: string;
  baseURL?: string;
  organization?: string;
  defaultModel?: string;
  defaultTemperature?: number;
  defaultMaxTokens?: number;
  defaultTopP?: number;
  defaultFrequencyPenalty?: number;
  defaultPresencePenalty?: number;
};

export const makeOpenAIAdapter = (config: OpenAIAdapterConfig): LlmPort => {
  const client = new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseURL,
    organization: config.organization,
  });

  return {
    complete: async (
      messages: Message[],
      opts?: { model?: string; temperature?: number },
    ): Promise<Message> => {
      const model = opts?.model || config.defaultModel || 'gpt-3.5-turbo';
      const temperature = opts?.temperature ?? config.defaultTemperature ?? 0.7;

      try {
        const completion = await client.chat.completions.create({
          model,
          temperature,
          messages: messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        });

        const choice = completion.choices[0];
        if (!choice?.message?.content) {
          throw new Error('No response from OpenAI');
        }

        return {
          role: 'assistant',
          content: choice.message.content,
        };
      } catch (error) {
        throw new Error(
          `OpenAI API error: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    },
  };
};
