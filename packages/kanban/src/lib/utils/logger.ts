/**
 * Centralized logging utility with configurable log levels
 */

export type LogLevel = 'silent' | 'error' | 'warn' | 'info' | 'debug';

// Initialize log level from environment or default to 'info'
const initialLogLevel = process.env.LOG_LEVEL as LogLevel;
const defaultLogLevel: LogLevel =
  initialLogLevel && ['silent', 'error', 'warn', 'info', 'debug'].includes(initialLogLevel)
    ? initialLogLevel
    : 'info';
var currentLogLevel: LogLevel = defaultLogLevel;

/**
 * Set the current log level
 * @param level The log level to set
 */
export function setLogLevel(level: LogLevel): void {
  currentLogLevel = level;
}

/**
 * Get the current log level
 * @returns The current log level
 */
export function getLogLevel(): LogLevel {
  return currentLogLevel;
}

/**
 * Check if a log level is enabled based on the current log level
 * @param level The log level to check
 * @returns Whether the log level is enabled
 */
function isLogLevelEnabled(level: LogLevel): boolean {
  const levels: LogLevel[] = ['silent', 'error', 'warn', 'info', 'debug'];
  const currentLevelIndex = levels.indexOf(currentLogLevel);
  const levelIndex = levels.indexOf(level);

  // If current level is 'silent', no logs are enabled
  if (currentLogLevel === 'silent') return false;

  // Check if the level is enabled based on the current level
  return levelIndex <= currentLevelIndex;
}

/**
 * Log an error message
 * @param message The message to log
 * @param optionalParams Optional parameters to log
 */
export function error(message: string, ...optionalParams: any[]): void {
  if (isLogLevelEnabled('error')) {
    console.error(`[ERROR] ${message}`, ...optionalParams);
  }
}

/**
 * Log a warning message
 * @param message The message to log
 * @param optionalParams Optional parameters to log
 */
export function warn(message: string, ...optionalParams: any[]): void {
  if (isLogLevelEnabled('warn')) {
    console.warn(`[WARN] ${message}`, ...optionalParams);
  }
}

/**
 * Log an info message
 * @param message The message to log
 * @param optionalParams Optional parameters to log
 */
export function info(message: string, ...optionalParams: any[]): void {
  if (isLogLevelEnabled('info')) {
    console.info(`[INFO] ${message}`, ...optionalParams);
  }
}

/**
 * Log a debug message
 * @param message The message to log
 * @param optionalParams Optional parameters to log
 */
export function debug(message: string, ...optionalParams: any[]): void {
  if (isLogLevelEnabled('debug')) {
    console.log(`[DEBUG] ${message}`, ...optionalParams);
  }
}

/**
 * Log a message (alias for info)
 * @param message The message to log
 * @param optionalParams Optional parameters to log
 */
export function log(message: string, ...optionalParams: any[]): void {
  info(message, ...optionalParams);
}

export default {
  setLogLevel,
  getLogLevel,
  error,
  warn,
  info,
  debug,
  log,
};
