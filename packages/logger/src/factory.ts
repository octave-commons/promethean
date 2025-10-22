// SPDX-License-Identifier: GPL-3.0-only
// Logger Factory - Factory for creating and managing logger instances

import type { Logger, LoggerFactory, LoggerConfig } from './types.js';
import { createLogger } from './winston-logger.js';

/**
 * Global logger factory implementation
 */
class LoggerFactoryImpl implements LoggerFactory {
  private loggers = new Map<string, Logger>();
  private globalConfig: Partial<LoggerConfig> = {};

  create(config: Partial<LoggerConfig> = {}): Logger {
    return createLogger({ ...this.globalConfig, ...config });
  }

  get(name?: string): Logger {
    const key = name || 'default';

    if (!this.loggers.has(key)) {
      const logger = this.create({ module: name });
      this.loggers.set(key, logger);
    }

    return this.loggers.get(key)!;
  }

  configure(config: Partial<LoggerConfig>): void {
    this.globalConfig = { ...this.globalConfig, ...config };

    // Update existing loggers
    this.loggers.forEach((_, key) => {
      const module = key === 'default' ? undefined : key;
      this.loggers.set(key, this.create({ ...this.globalConfig, module }));
    });
  }

  async shutdown(): Promise<void> {
    // Close all Winston loggers
    const shutdownPromises = Array.from(this.loggers.values()).map(async () => Promise.resolve());

    await Promise.all(shutdownPromises);
    this.loggers.clear();
  }
}

/**
 * Global logger factory instance
 */
export const loggerFactory = new LoggerFactoryImpl();

/**
 * Create logger factory function
 */
export const createLoggerFactory = (): LoggerFactory => {
  return loggerFactory;
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
