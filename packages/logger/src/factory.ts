// SPDX-License-Identifier: GPL-3.0-only
// Logger Factory - Factory for creating and managing logger instances

import type { Logger, LoggerFactory, LoggerConfig, CorrelationContext } from './types.js';
import { createLogger } from './winston-logger.js';

/**
 * Global logger factory implementation
 */
const createLoggerFactoryImpl = (): LoggerFactory => {
  const loggers = new Map<string, Logger>();
  const globalConfigRef = { value: {} as Partial<LoggerConfig> };

  return {
    create: (config: Partial<LoggerConfig> = {}): Logger => {
      return createLogger({ ...globalConfigRef.value, ...config });
    },

    get: (name?: string): Logger => {
      const key = name || 'default';

      if (!loggers.has(key)) {
        const logger = createLogger({ ...globalConfigRef.value, module: name });
        loggers.set(key, logger);
      }

      return loggers.get(key)!;
    },

    configure: (config: Partial<LoggerConfig>): void => {
      globalConfigRef.value = { ...globalConfigRef.value, ...config };

      // Update existing loggers
      loggers.forEach((_, key) => {
        const module = key === 'default' ? undefined : key;
        loggers.set(key, createLogger({ ...globalConfigRef.value, module }));
      });
    },

    withCorrelation: (correlation: CorrelationContext): Logger => {
      return createLogger({ ...globalConfigRef.value, correlation });
    },

    shutdown: async (): Promise<void> => {
      // Close all Winston loggers
      const shutdownPromises = Array.from(loggers.values()).map(async () => Promise.resolve());

      await Promise.all(shutdownPromises);
      loggers.clear();
    },
  };
};

/**
 * Global logger factory instance
 */
export const loggerFactory = createLoggerFactoryImpl();

/**
 * Create logger factory function
 */
export const createLoggerFactory = (): LoggerFactory => {
  return createLoggerFactoryImpl();
};

/**
 * Convenience function to get the default logger
 */
export const getLogger = (name?: string): Logger => {
  return loggerFactory.get(name);
};

/**
 * Convenience function to create a new logger
 */
export const createNamedLogger = (name: string, config?: Partial<LoggerConfig>): Logger => {
  return loggerFactory.create({ ...config, module: name });
};
