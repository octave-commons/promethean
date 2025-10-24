// SPDX-License-Identifier: GPL-3.0-only
// Logger Configuration - Environment-based configuration for logging

import type { LoggerConfig, LogLevel } from './types.js';

/**
 * Default logging configuration
 */
const DEFAULT_CONFIG: LoggerConfig = {
  level: 'info',
  service: 'promethean',
  colorize: true,
  timestamp: true,
  json: false,
  file: {
    enabled: false,
    filename: 'promethean-%DATE%.log',
    dirname: './logs',
    maxSize: '20m',
    maxFiles: '14d',
    datePattern: 'YYYY-MM-DD',
  },
  console: {
    enabled: true,
    level: 'info',
  },
};

/**
 * Get log level from environment variable
 */
const getLogLevelFromEnv = (): LogLevel => {
  const envLevel = process.env.LOG_LEVEL?.toLowerCase();
  const validLevels: LogLevel[] = ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'];

  if (envLevel && validLevels.includes(envLevel as LogLevel)) {
    return envLevel as LogLevel;
  }

  // Default to info in production, debug in development
  return process.env.NODE_ENV === 'production' ? 'info' : 'debug';
};

/**
 * Get boolean configuration from environment variable
 */
const getBoolFromEnv = (key: string, defaultValue: boolean): boolean => {
  const value = process.env[key]?.toLowerCase();
  if (value === undefined) return defaultValue;
  return value === 'true' || value === '1';
};

/**
 * Create configuration from environment variables
 */
export const createConfigFromEnv = (): LoggerConfig => {
  const level = getLogLevelFromEnv();

  return {
    level,
    service: process.env.LOG_SERVICE || DEFAULT_CONFIG.service,
    colorize: getBoolFromEnv('LOG_COLORIZE', DEFAULT_CONFIG.colorize!),
    timestamp: getBoolFromEnv('LOG_TIMESTAMP', DEFAULT_CONFIG.timestamp!),
    json: getBoolFromEnv('LOG_JSON', DEFAULT_CONFIG.json!),
    silent: getBoolFromEnv('LOG_SILENT', false),
    file: {
      enabled: getBoolFromEnv('LOG_FILE_ENABLED', DEFAULT_CONFIG.file.enabled),
      filename: process.env.LOG_FILE_FILENAME || DEFAULT_CONFIG.file.filename,
      dirname: process.env.LOG_FILE_DIRNAME || DEFAULT_CONFIG.file.dirname,
      maxSize: process.env.LOG_FILE_MAXSIZE || DEFAULT_CONFIG.file.maxSize,
      maxFiles: process.env.LOG_FILE_MAXFILES || DEFAULT_CONFIG.file.maxFiles,
      datePattern: process.env.LOG_FILE_DATE_PATTERN || DEFAULT_CONFIG.file.datePattern,
    },
    console: {
      enabled: getBoolFromEnv('LOG_CONSOLE_ENABLED', DEFAULT_CONFIG.console.enabled),
      level: (process.env.LOG_CONSOLE_LEVEL?.toLowerCase() as LogLevel) || level,
    },
  };
};

/**
 * Merge user configuration with defaults
 */
export const mergeConfig = (userConfig: Partial<LoggerConfig> = {}): LoggerConfig => {
  const envConfig = createConfigFromEnv();

  return {
    ...DEFAULT_CONFIG,
    ...envConfig,
    ...userConfig,
    file: {
      ...DEFAULT_CONFIG.file,
      ...envConfig.file,
      ...userConfig.file,
    },
    console: {
      ...DEFAULT_CONFIG.console,
      ...envConfig.console,
      ...userConfig.console,
    },
  };
};

/**
 * Validate log level
 */
export const isValidLogLevel = (level: string): level is LogLevel => {
  const validLevels: LogLevel[] = ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'];
  return validLevels.includes(level as LogLevel);
};
