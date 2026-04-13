/**
 * Logging utility that writes all output to stderr.
 * MCP stdio servers must only output JSON-RPC on stdout.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const logLevelOrder: LogLevel[] = ['debug', 'info', 'warn', 'error'];
let currentLogLevel: LogLevel = 'info';

/**
 * Set the minimum log level to output.
 * Levels: debug < info < warn < error
 */
export function setLogLevel(level: LogLevel): void {
  currentLogLevel = level;
}

/**
 * Get the current log level.
 */
export function getLogLevel(): LogLevel {
  return currentLogLevel;
}

function shouldLog(level: LogLevel): boolean {
  return logLevelOrder.indexOf(level) >= logLevelOrder.indexOf(currentLogLevel);
}

function formatMessage(level: LogLevel, message: string, meta?: Record<string, unknown>): string {
  const timestamp = new Date().toISOString();
  const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
}

/**
 * Log a debug message.
 */
export function debug(message: string, meta?: Record<string, unknown>): void {
  if (shouldLog('debug')) {
    process.stderr.write(formatMessage('debug', message, meta) + '\n');
  }
}

/**
 * Log an info message.
 */
export function info(message: string, meta?: Record<string, unknown>): void {
  if (shouldLog('info')) {
    process.stderr.write(formatMessage('info', message, meta) + '\n');
  }
}

/**
 * Log a warning message.
 */
export function warn(message: string, meta?: Record<string, unknown>): void {
  if (shouldLog('warn')) {
    process.stderr.write(formatMessage('warn', message, meta) + '\n');
  }
}

/**
 * Log an error message.
 */
export function error(message: string, meta?: Record<string, unknown>): void {
  if (shouldLog('error')) {
    process.stderr.write(formatMessage('error', message, meta) + '\n');
  }
}

/**
 * Log an error with a stack trace.
 */
export function errorWithStack(message: string, error: unknown): void {
  const stack = error instanceof Error ? error.stack : String(error);
  process.stderr.write(formatMessage('error', message, { stack }) + '\n');
}
