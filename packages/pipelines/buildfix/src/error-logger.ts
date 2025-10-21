/**
 * BuildFix Error Logging System
 *
 * Provides structured logging for BuildFix operations with proper error handling.
 * Replaces silent fallbacks with comprehensive logging and error tracking.
 */

import { promises as fs } from 'fs';
import * as path from 'path';
import {
  BuildFixError,
  BuildFixErrorType,
  ErrorSeverity,
  formatErrorForLogging,
} from './error-types.js';

export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  message: string;
  operation?: string;
  filePath?: string;
  error?: BuildFixError;
  duration?: number;
  metadata?: Record<string, unknown>;
}

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
}

export class BuildFixLogger {
  private static instance: BuildFixLogger;
  private logFile?: string;
  private logLevel: LogLevel = LogLevel.INFO;
  private logBuffer: LogEntry[] = [];
  private maxBufferSize = 1000;
  private flushInterval = 5000; // 5 seconds
  private flushTimer?: NodeJS.Timeout;

  private constructor() {
    // Set up periodic flush
    this.flushTimer = setInterval(() => {
      this.flush().catch(console.error);
    }, this.flushInterval);
  }

  static getInstance(): BuildFixLogger {
    if (!BuildFixLogger.instance) {
      BuildFixLogger.instance = new BuildFixLogger();
    }
    return BuildFixLogger.instance;
  }

  /**
   * Configure the logger
   */
  configure(options: {
    logFile?: string;
    logLevel?: LogLevel;
    maxBufferSize?: number;
    flushInterval?: number;
  }): void {
    if (options.logFile) {
      this.logFile = options.logFile;
    }
    if (options.logLevel) {
      this.logLevel = options.logLevel;
    }
    if (options.maxBufferSize) {
      this.maxBufferSize = options.maxBufferSize;
    }
    if (options.flushInterval) {
      this.flushInterval = options.flushInterval;
      if (this.flushTimer) {
        clearInterval(this.flushTimer);
      }
      this.flushTimer = setInterval(() => {
        this.flush().catch(console.error);
      }, this.flushInterval);
    }
  }

  /**
   * Log a debug message
   */
  debug(message: string, metadata?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, metadata);
  }

  /**
   * Log an info message
   */
  info(message: string, metadata?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, metadata);
  }

  /**
   * Log a warning message
   */
  warn(message: string, metadata?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, metadata);
  }

  /**
   * Log an error message
   */
  error(message: string, error?: BuildFixError, metadata?: Record<string, unknown>): void {
    this.log(LogLevel.ERROR, message, metadata, error);
  }

  /**
   * Log a fatal error
   */
  fatal(message: string, error?: BuildFixError, metadata?: Record<string, unknown>): void {
    this.log(LogLevel.FATAL, message, metadata, error);
  }

  /**
   * Log a structured error with full context
   */
  logError(
    error: unknown,
    operation: string,
    context: Record<string, unknown> = {},
    severity: ErrorSeverity = ErrorSeverity.FATAL,
  ): void {
    const { createBuildFixError, classifyError } = require('./error-types.js');

    const errorType = classifyError(error, { operation, ...context });
    const buildFixError = createBuildFixError(
      error,
      errorType,
      { operation, ...context },
      severity,
    );

    const level =
      severity === ErrorSeverity.FATAL
        ? LogLevel.FATAL
        : severity === ErrorSeverity.DEGRADED
          ? LogLevel.WARN
          : LogLevel.ERROR;

    this.log(level, `Error in ${operation}: ${buildFixError.message}`, context, buildFixError);
  }

  /**
   * Log a fallback operation (replaces silent fallbacks)
   */
  logFallback(
    primaryOperation: string,
    fallbackOperation: string,
    error: unknown,
    context: Record<string, unknown> = {},
  ): void {
    this.warn(`Fallback activated: ${primaryOperation} → ${fallbackOperation}`, {
      primaryOperation,
      fallbackOperation,
      originalError: error instanceof Error ? error.message : String(error),
      ...context,
    });

    // Also log the original error with full context
    this.logError(error, primaryOperation, context, ErrorSeverity.DEGRADED);
  }

  /**
   * Log a file operation with proper error handling
   */
  async logFileOperation<T>(
    operation: string,
    filePath: string,
    fileOperation: () => Promise<T>,
    fallbackValue?: T,
  ): Promise<T> {
    const startTime = Date.now();

    try {
      this.debug(`Starting file operation: ${operation}`, { filePath });
      const result = await fileOperation();
      const duration = Date.now() - startTime;

      this.debug(`File operation completed: ${operation}`, {
        filePath,
        duration,
        success: true,
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      this.logError(error, operation, {
        filePath,
        duration,
        success: false,
      });

      if (fallbackValue !== undefined) {
        this.warn(`Using fallback value for ${operation}`, { filePath });
        return fallbackValue;
      }

      throw error;
    }
  }

  /**
   * Internal log method
   */
  private log(
    level: LogLevel,
    message: string,
    metadata: Record<string, unknown> = {},
    error?: BuildFixError,
  ): void {
    // Skip if below log level
    if (!this.shouldLog(level)) {
      return;
    }

    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      message,
      ...metadata,
      error,
    };

    // Add to buffer
    this.logBuffer.push(entry);

    // Flush if buffer is full
    if (this.logBuffer.length >= this.maxBufferSize) {
      this.flush().catch(console.error);
    }

    // Also log to console for immediate visibility
    this.logToConsole(entry);
  }

  /**
   * Check if we should log at this level
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR, LogLevel.FATAL];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  /**
   * Log to console with appropriate formatting
   */
  private logToConsole(entry: LogEntry): void {
    const timestamp = new Date(entry.timestamp).toISOString();
    const prefix = `[${timestamp}] [${entry.level.toUpperCase()}]`;

    let message = `${prefix} ${entry.message}`;

    if (entry.operation) {
      message += ` (operation: ${entry.operation})`;
    }

    if (entry.filePath) {
      message += ` (file: ${entry.filePath})`;
    }

    if (entry.duration) {
      message += ` (${entry.duration}ms)`;
    }

    // Log based on level
    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(message);
        break;
      case LogLevel.INFO:
        console.info(message);
        break;
      case LogLevel.WARN:
        console.warn(message);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(message);
        if (entry.error) {
          console.error('Error details:', formatErrorForLogging(entry.error));
        }
        break;
    }

    // Log additional metadata
    if (entry.metadata && Object.keys(entry.metadata).length > 0) {
      console.debug('Metadata:', JSON.stringify(entry.metadata, null, 2));
    }
  }

  /**
   * Flush log buffer to file
   */
  private async flush(): Promise<void> {
    if (!this.logFile || this.logBuffer.length === 0) {
      return;
    }

    try {
      const entries = [...this.logBuffer];
      this.logBuffer = [];

      // Ensure log directory exists
      await fs.mkdir(path.dirname(this.logFile), { recursive: true });

      // Format entries for file output
      const logLines = entries.map((entry) => {
        const timestamp = new Date(entry.timestamp).toISOString();
        let line = `${timestamp} [${entry.level.toUpperCase()}] ${entry.message}`;

        if (entry.operation) line += ` [op: ${entry.operation}]`;
        if (entry.filePath) line += ` [file: ${entry.filePath}]`;
        if (entry.duration) line += ` [${entry.duration}ms]`;

        if (entry.metadata && Object.keys(entry.metadata).length > 0) {
          line += ` ${JSON.stringify(entry.metadata)}`;
        }

        if (entry.error) {
          line += `\nError: ${formatErrorForLogging(entry.error)}`;
        }

        return line;
      });

      // Append to log file
      await fs.appendFile(this.logFile, logLines.join('\n') + '\n', 'utf-8');
    } catch (error) {
      console.error('Failed to flush log buffer:', error);
      // Put entries back in buffer for retry
      this.logBuffer.unshift(...this.logBuffer);
    }
  }

  /**
   * Get recent log entries
   */
  getRecentEntries(count = 100): LogEntry[] {
    return this.logBuffer.slice(-count);
  }

  /**
   * Get error statistics
   */
  getErrorStats(): Record<BuildFixErrorType, number> {
    const stats: Record<string, number> = {};

    for (const entry of this.logBuffer) {
      if (entry.error) {
        stats[entry.error.type] = (stats[entry.error.type] || 0) + 1;
      }
    }

    return stats as Record<BuildFixErrorType, number>;
  }

  /**
   * Cleanup and close logger
   */
  async close(): Promise<void> {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    await this.flush();
  }
}

// Export singleton instance
export const logger = BuildFixLogger.getInstance();
