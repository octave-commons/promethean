/**
 * Pantheon LLM Adapter for OpenAI
 * Implements LlmPort for OpenAI API integration
 */

import type { LlmPort, Message } from '@promethean-os/pantheon-core';
import OpenAI from 'openai';
import { z } from 'zod';
import {
  OpenAIAdapterError,
  ValidationError,
  TimeoutError,
  RateLimitError,
} from '@promethean-os/pantheon-core';

// Retry configuration
export type RetryConfig = {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableErrors: string[];
};

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
  retryableErrors: ['rate_limit_exceeded', 'insufficient_quota', 'temporary_error', 'timeout'],
};

// Input validation schemas
const MessageSchema = z.object({
  role: z.enum(['system', 'user', 'assistant']),
  content: z.string().min(1, 'Message content cannot be empty'),
});

const MessagesArraySchema = z.array(MessageSchema).min(1, 'At least one message is required');

const OpenAIConfigSchema = z.object({
  apiKey: z.string().min(1, 'API key is required and cannot be empty'),
  baseURL: z.string().url().optional(),
  organization: z.string().optional(),
  defaultModel: z.string().optional(),
  defaultTemperature: z.number().min(0).max(2).optional(),
  defaultMaxTokens: z.number().positive().optional(),
  defaultTopP: z.number().min(0).max(1).optional(),
  defaultFrequencyPenalty: z.number().min(-2).max(2).optional(),
  defaultPresencePenalty: z.number().min(-2).max(2).optional(),
  timeout: z.number().positive().optional(),
  retryConfig: z
    .object({
      maxRetries: z.number().min(0).max(10).optional(),
      baseDelay: z.number().positive().optional(),
      maxDelay: z.number().positive().optional(),
      backoffMultiplier: z.number().positive().optional(),
      retryableErrors: z.array(z.string()).optional(),
    })
    .optional(),
});

const CompletionOptionsSchema = z.object({
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().positive().optional(),
  topP: z.number().min(0).max(1).optional(),
  frequencyPenalty: z.number().min(-2).max(2).optional(),
  presencePenalty: z.number().min(-2).max(2).optional(),
});

// Retry logic with exponential backoff
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG,
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if error is retryable
      const isRetryable = isRetryableError(lastError, config.retryableErrors);

      // Don't retry on last attempt or if error is not retryable
      if (attempt === config.maxRetries || !isRetryable) {
        throw new OpenAIAdapterError(
          `OpenAI operation failed after ${attempt + 1} attempts: ${lastError.message}`,
          lastError,
          isRetryable,
        );
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        config.baseDelay * Math.pow(config.backoffMultiplier, attempt),
        config.maxDelay,
      );

      // Add jitter to prevent thundering herd
      const jitter = Math.random() * 0.1 * delay;
      const finalDelay = delay + jitter;

      console.warn(
        `OpenAI operation failed (attempt ${attempt + 1}/${config.maxRetries + 1}), retrying in ${finalDelay}ms:`,
        lastError.message,
      );
      await new Promise((resolve) => setTimeout(resolve, finalDelay));
    }
  }

  throw lastError!;
}

function isRetryableError(error: Error, retryableErrors: string[]): boolean {
  // Check for common OpenAI error patterns
  const errorMessage = error.message.toLowerCase();

  // Rate limit errors
  if (errorMessage.includes('rate limit') || errorMessage.includes('rate_limit_exceeded')) {
    return true;
  }

  // Timeout errors
  if (errorMessage.includes('timeout') || errorMessage.includes('connection')) {
    return true;
  }

  // Server errors (5xx)
  if (
    errorMessage.includes('internal server error') ||
    errorMessage.includes('service unavailable')
  ) {
    return true;
  }

  // Check against specific retryable error codes
  return retryableErrors.some((retryableError) =>
    errorMessage.includes(retryableError.toLowerCase()),
  );
}

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
  timeout?: number;
  retryConfig?: Partial<RetryConfig>;
};

export const makeOpenAIAdapter = (config: OpenAIAdapterConfig): LlmPort => {
  // Validate configuration
  const validatedConfig = OpenAIConfigSchema.parse(config);

  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...validatedConfig.retryConfig };

  const client = new OpenAI({
    apiKey: validatedConfig.apiKey,
    baseURL: validatedConfig.baseURL,
    organization: validatedConfig.organization,
    timeout: validatedConfig.timeout || 30000,
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
      // Validate inputs
      const validatedMessages = MessagesArraySchema.parse(messages);
      const validatedOpts = CompletionOptionsSchema.parse(opts || {});

      const model = validatedOpts.model || validatedConfig.defaultModel || 'gpt-3.5-turbo';
      const temperature = validatedOpts.temperature ?? validatedConfig.defaultTemperature ?? 0.7;
      const maxTokens = validatedOpts.maxTokens ?? validatedConfig.defaultMaxTokens;
      const topP = validatedOpts.topP ?? validatedConfig.defaultTopP;
      const frequencyPenalty =
        validatedOpts.frequencyPenalty ?? validatedConfig.defaultFrequencyPenalty;
      const presencePenalty =
        validatedOpts.presencePenalty ?? validatedConfig.defaultPresencePenalty;

      const completionParams: any = {
        model,
        temperature,
        messages: validatedMessages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
      };

      // Add optional parameters only if they're defined
      if (maxTokens !== undefined) completionParams.max_tokens = maxTokens;
      if (topP !== undefined) completionParams.top_p = topP;
      if (frequencyPenalty !== undefined) completionParams.frequency_penalty = frequencyPenalty;
      if (presencePenalty !== undefined) completionParams.presence_penalty = presencePenalty;

      return retryWithBackoff(async () => {
        try {
          const completion = await client.chat.completions.create(completionParams);

          const choice = completion.choices[0];
          if (!choice?.message?.content) {
            throw new OpenAIAdapterError('No response from OpenAI', undefined, false);
          }

          return {
            role: 'assistant',
            content: choice.message.content,
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          const isRetryable = isRetryableError(
            error instanceof Error ? error : new Error(errorMessage),
            retryConfig.retryableErrors,
          );

          throw new OpenAIAdapterError(
            `OpenAI API error: ${errorMessage}`,
            error instanceof Error ? error : new Error(errorMessage),
            isRetryable,
          );
        }
      }, retryConfig);
    },
  };
};
