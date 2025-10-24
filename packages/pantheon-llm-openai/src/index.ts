/**
 * Pantheon LLM Adapter for OpenAI
 * Implements LlmPort for OpenAI API integration
 */

import type { LlmPort, Message } from '@promethean-os/pantheon-core';
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
      opts?: {
        model?: string;
        temperature?: number;
        maxTokens?: number;
        topP?: number;
        frequencyPenalty?: number;
        presencePenalty?: number;
      },
    ): Promise<Message> => {
      const model = opts?.model || config.defaultModel || 'gpt-3.5-turbo';
      const temperature = opts?.temperature ?? config.defaultTemperature ?? 0.7;
      const maxTokens = opts?.maxTokens ?? config.defaultMaxTokens;
      const topP = opts?.topP ?? config.defaultTopP;
      const frequencyPenalty = opts?.frequencyPenalty ?? config.defaultFrequencyPenalty;
      const presencePenalty = opts?.presencePenalty ?? config.defaultPresencePenalty;

      const completionParams: any = {
        model,
        temperature,
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
      };

      // Add optional parameters only if they're defined
      if (maxTokens !== undefined) completionParams.max_tokens = maxTokens;
      if (topP !== undefined) completionParams.top_p = topP;
      if (frequencyPenalty !== undefined) completionParams.frequency_penalty = frequencyPenalty;
      if (presencePenalty !== undefined) completionParams.presence_penalty = presencePenalty;

      try {
        const completion = await client.chat.completions.create(completionParams);

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
