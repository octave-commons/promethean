// SPDX-License-Identifier: GPL-3.0-only
// Winston Logger - Winston-based implementation of the Logger interface

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import type { Logger, LoggerConfig, LogLevel, LogContext, CorrelationContext } from './types.js';
import { mergeConfig } from './config.js';

/**
 * Create Winston logger instance from configuration
 */
const createWinstonLogger = (config: LoggerConfig): winston.Logger => {
  const transports: winston.transport[] = [];

  // Console transport
  if (config.console.enabled) {
    const consoleFormat = config.json
      ? winston.format.json()
      : winston.format.combine(
          config.colorize ? winston.format.colorize() : winston.format.uncolorize(),
          config.timestamp ? winston.format.timestamp() : winston.format.uncolorize(),
          winston.format.printf(
            ({
              level,
              message,
              timestamp,
              service,
              module,
              ...meta
            }: winston.Logform.TransformableInfo) => {
              const prefix = [];
              if (timestamp) prefix.push(timestamp as string);
              if (service) prefix.push(`[${service as string}]`);
              if (module) prefix.push(`[${module as string}]`);

              const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
              return `${prefix.join(' ')} ${level}: ${message}${metaStr}`;
            },
          ),
        );

    transports.push(
      new winston.transports.Console({
        level: config.console.level || config.level,
        format: consoleFormat,
        silent: config.silent,
      }),
    );
  }

  // File transport
  if (config.file.enabled) {
    const fileFormat = config.json
      ? winston.format.json()
      : winston.format.combine(
          winston.format.timestamp(),
          winston.format.printf(
            ({
              level,
              message,
              timestamp,
              service,
              module,
              ...meta
            }: winston.Logform.TransformableInfo) => {
              const prefix = [];
              if (timestamp) prefix.push(timestamp as string);
              if (service) prefix.push(`[${service as string}]`);
              if (module) prefix.push(`[${module as string}]`);

              const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
              return `${prefix.join(' ')} ${level}: ${message}${metaStr}`;
            },
          ),
        );

    transports.push(
      new DailyRotateFile({
        filename: config.file.filename || 'promethean-%DATE%.log',
        dirname: config.file.dirname || './logs',
        datePattern: config.file.datePattern || 'YYYY-MM-DD',
        maxSize: config.file.maxSize || '20m',
        maxFiles: config.file.maxFiles || '14d',
        level: config.level,
        format: fileFormat,
        silent: config.silent,
      }),
    );
  }

  return winston.createLogger({
    level: config.level,
    defaultMeta: {
      service: config.service,
    },
    transports,
    exitOnError: false,
  });
};

/**
 * Create Winston-based Logger implementation
 */
const createWinstonLoggerInstance = (
  winstonLogger: winston.Logger,
  config: LoggerConfig,
  defaultContext: LogContext = {},
  correlation: CorrelationContext = {},
): Logger => ({
  error: (message: string, context?: LogContext): void => {
    createWinstonLoggerInstance(winstonLogger, config, defaultContext, correlation).log(
      'error',
      message,
      context,
    );
  },

  warn: (message: string, context?: LogContext): void => {
    createWinstonLoggerInstance(winstonLogger, config, defaultContext, correlation).log(
      'warn',
      message,
      context,
    );
  },

  info: (message: string, context?: LogContext): void => {
    createWinstonLoggerInstance(winstonLogger, config, defaultContext, correlation).log(
      'info',
      message,
      context,
    );
  },

  http: (message: string, context?: LogContext): void => {
    createWinstonLoggerInstance(winstonLogger, config, defaultContext, correlation).log(
      'http',
      message,
      context,
    );
  },

  verbose: (message: string, context?: LogContext): void => {
    createWinstonLoggerInstance(winstonLogger, config, defaultContext, correlation).log(
      'verbose',
      message,
      context,
    );
  },

  debug: (message: string, context?: LogContext): void => {
    createWinstonLoggerInstance(winstonLogger, config, defaultContext, correlation).log(
      'debug',
      message,
      context,
    );
  },

  silly: (message: string, context?: LogContext): void => {
    createWinstonLoggerInstance(winstonLogger, config, defaultContext, correlation).log(
      'silly',
      message,
      context,
    );
  },

  log: (level: LogLevel, message: string, context?: LogContext): void => {
    const mergedContext = {
      ...defaultContext,
      ...context,
      correlation,
    };
    winstonLogger.log(level, message, mergedContext);
  },

  child: (context: LogContext): Logger => {
    const mergedContext = { ...defaultContext, ...context };
    return createWinstonLoggerInstance(winstonLogger, config, mergedContext, correlation);
  },

  withCorrelation: (newCorrelation: CorrelationContext): Logger => {
    return createWinstonLoggerInstance(winstonLogger, config, defaultContext, newCorrelation);
  },

  setLevel: (_level: LogLevel): void => {
    console.warn('Dynamic level changing not yet implemented');
  },

  getLevel: (): LogLevel => {
    return winstonLogger.level as LogLevel;
  },
});

/**
 * Create a new logger instance
 */
export const createLogger = (config: Partial<LoggerConfig> = {}): Logger => {
  const finalConfig = mergeConfig(config);
  const winstonLogger = createWinstonLogger(finalConfig);

  return new WinstonLogger(winstonLogger, finalConfig);
};
