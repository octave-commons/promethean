// SPDX-License-Identifier: GPL-3.0-only
// Logger Types - Core types for the Promethean logging system

export type LogLevel = 'error' | 'warn' | 'info' | 'http' | 'verbose' | 'debug' | 'silly';

export type LogContext = Record<string, any>;

export interface LogEntry {
  readonly level: LogLevel;
  readonly message: string;
  readonly timestamp?: string;
  readonly context?: LogContext;
  readonly service?: string;
  readonly module?: string;
}

export interface LoggerConfig {
  readonly level?: LogLevel;
  readonly service?: string;
  readonly module?: string;
  readonly silent?: boolean;
  readonly colorize?: boolean;
  readonly timestamp?: boolean;
  readonly json?: boolean;
  readonly file: {
    readonly enabled: boolean;
    readonly filename?: string;
    readonly dirname?: string;
    readonly maxSize?: string;
    readonly maxFiles?: string;
    readonly datePattern?: string;
  };
  readonly console: {
    readonly enabled: boolean;
    readonly level?: LogLevel;
  };
}

export interface Logger {
  readonly error: (message: string, context?: LogContext) => void;
  readonly warn: (message: string, context?: LogContext) => void;
  readonly info: (message: string, context?: LogContext) => void;
  readonly http: (message: string, context?: LogContext) => void;
  readonly verbose: (message: string, context?: LogContext) => void;
  readonly debug: (message: string, context?: LogContext) => void;
  readonly silly: (message: string, context?: LogContext) => void;
  readonly log: (level: LogLevel, message: string, context?: LogContext) => void;
  readonly child: (context: LogContext) => Logger;
  readonly setLevel: (level: LogLevel) => void;
  readonly getLevel: () => LogLevel;
}

export interface LoggerFactory {
  readonly create: (config?: Partial<LoggerConfig>) => Logger;
  readonly get: (name?: string) => Logger;
  readonly configure: (config: Partial<LoggerConfig>) => void;
  readonly shutdown: () => Promise<void>;
}
