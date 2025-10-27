/**
 * Pantheon Utilities Module
 * Common utility functions and helpers
 */

import type { Actor, Message, ContextSource } from '@promethean-os/pantheon-core';

// === ID Generation ===

export const generateId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
};

export const generateActorId = (name: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const sanitizedName = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  return `actor_${sanitizedName}_${timestamp}_${random}`;
};

// === Message Processing ===

export const createMessage = (
  role: 'system' | 'user' | 'assistant',
  content: string,
  images?: string[],
): Message => ({
  role,
  content,
  images,
});

export const createSystemMessage = (content: string): Message => createMessage('system', content);

export const createUserMessage = (content: string): Message => createMessage('user', content);

export const createAssistantMessage = (content: string): Message =>
  createMessage('assistant', content);

export const truncateMessages = (
  messages: Message[],
  maxTokens: number = 4000,
  avgTokensPerChar: number = 0.25,
): Message[] => {
  const maxChars = Math.floor(maxTokens / avgTokensPerChar);
  let totalChars = 0;
  const result: Message[] = [];

  // Process messages in reverse order (most recent first)
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    if (!message) continue;

    const messageChars = message.content.length;

    if (totalChars + messageChars <= maxChars) {
      result.unshift(message);
      totalChars += messageChars;
    } else {
      // Add partial message if it's the last one
      if (result.length === 0) {
        const remainingChars = maxChars - totalChars;
        const partialContent = message.content.substring(0, remainingChars);
        result.unshift({
          ...message,
          content: partialContent + '...[truncated]',
        });
      }
      break;
    }
  }

  return result;
};

// === Context Management ===

export const createContextSource = (
  id: string,
  label: string,
  where?: Record<string, unknown>,
  metadata?: Record<string, unknown>,
): ContextSource => ({
  id,
  label,
  where,
  metadata,
});

export const mergeContextSources = (...sources: ContextSource[][]): ContextSource[] => {
  const seen = new Set<string>();
  const result: ContextSource[] = [];

  for (const sourceArray of sources) {
    for (const source of sourceArray) {
      if (!seen.has(source.id)) {
        seen.add(source.id);
        result.push(source);
      }
    }
  }

  return result;
};

// === Actor Utilities ===

export const createActorSummary = (actor: Actor): string => {
  const status = actor.state;
  const goalCount = actor.goals.length;
  const talentCount = actor.script.talents.length;
  const lastActivity = actor.updatedAt.toISOString();

  return `Actor ${actor.script.name} (${actor.id}): ${status}, ${goalCount} goals, ${talentCount} talents, last active ${lastActivity}`;
};

export const isActorActive = (actor: Actor): boolean => {
  return actor.state === 'running' || actor.state === 'idle';
};

export const isActorCompleted = (actor: Actor): boolean => {
  return actor.state === 'completed' || actor.state === 'failed';
};

export const getActorAge = (actor: Actor): number => {
  return Date.now() - actor.createdAt.getTime();
};

export const getActorIdleTime = (actor: Actor): number => {
  return Date.now() - actor.updatedAt.getTime();
};

// === Configuration Utilities ===

export const mergeConfigs = <T extends Record<string, any>>(
  defaultConfig: T,
  userConfig: Partial<T>,
): T => {
  return {
    ...defaultConfig,
    ...userConfig,
  };
};

export const validateConfig = <T extends Record<string, any>>(
  config: any,
  requiredKeys: (keyof T)[],
): config is T => {
  return requiredKeys.every((key) => key in config);
};

// === Error Handling ===

export class PantheonError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'PantheonError';
  }
}

export const createError = (
  code: string,
  message: string,
  details?: Record<string, unknown>,
): PantheonError => {
  return new PantheonError(message, code, details);
};

export const isError = (error: unknown): error is PantheonError => {
  return error instanceof PantheonError;
};

// === Async Utilities ===

export const withTimeout = <T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutError?: Error,
): Promise<T> => {
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(timeoutError || new Error(`Operation timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  return Promise.race([promise, timeout]);
};

export const retry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000,
  backoff: 'linear' | 'exponential' = 'exponential',
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === maxRetries) {
        break;
      }

      const delay =
        backoff === 'exponential' ? delayMs * Math.pow(2, attempt) : delayMs * (attempt + 1);

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
};

// === Logging Utilities ===

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface Logger {
  debug: (message: string, meta?: unknown) => void;
  info: (message: string, meta?: unknown) => void;
  warn: (message: string, meta?: unknown) => void;
  error: (message: string, meta?: unknown) => void;
}

export const createConsoleLogger = (level: LogLevel = 'info'): Logger => {
  const levels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  const currentLevel = levels[level];

  const shouldLog = (logLevel: LogLevel): boolean => {
    return levels[logLevel] >= currentLevel;
  };

  return {
    debug: (message: string, meta?: unknown) => {
      if (shouldLog('debug')) {
        console.debug(`[Pantheon] ${message}`, meta);
      }
    },
    info: (message: string, meta?: unknown) => {
      if (shouldLog('info')) {
        console.info(`[Pantheon] ${message}`, meta);
      }
    },
    warn: (message: string, meta?: unknown) => {
      if (shouldLog('warn')) {
        console.warn(`[Pantheon] ${message}`, meta);
      }
    },
    error: (message: string, meta?: unknown) => {
      if (shouldLog('error')) {
        console.error(`[Pantheon] ${message}`, meta);
      }
    },
  };
};

export const createNullLogger = (): Logger => ({
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
});

// === Performance Utilities ===

export const createTimer = (): (() => number) => {
  const start = performance.now();
  return () => performance.now() - start;
};

export const measureAsync = async <T>(
  fn: () => Promise<T>,
  label?: string,
): Promise<[T, number]> => {
  const timer = createTimer();
  try {
    const result = await fn();
    const duration = timer();
    if (label) {
      console.debug(`[Performance] ${label}: ${duration.toFixed(2)}ms`);
    }
    return [result, duration];
  } catch (error) {
    const duration = timer();
    if (label) {
      console.debug(`[Performance] ${label} (failed): ${duration.toFixed(2)}ms`);
    }
    throw error;
  }
};
