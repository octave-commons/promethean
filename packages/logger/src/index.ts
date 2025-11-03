// SPDX-License-Identifier: GPL-3.0-only
// Main Logger exports

// Type exports
export type {
  LogLevel,
  LogContext,
  LogEntry,
  LoggerConfig,
  Logger,
  LoggerFactory,
  CorrelationContext,
} from './types.js';

// Configuration exports
export { createConfigFromEnv, mergeConfig, isValidLogLevel } from './config.js';

// Winston implementation exports
export { createLogger } from './winston-logger.js';

// Factory export
export { createLoggerFactory, loggerFactory, getLogger, createNamedLogger } from './factory.js';

// Correlation utilities
export {
  generateCorrelationId,
  generateRequestId,
  generateTraceId,
  extractCorrelationContext,
  createCorrelationContext,
  mergeCorrelationContext,
} from './correlation.js';
