/**
 * BuildFix Error Classification System
 *
 * This module provides structured error types and classification for BuildFix operations.
 * It replaces generic error handling with proper error categorization and context.
 */

export enum BuildFixErrorType {
  /** Configuration errors (invalid options, missing files, etc.) */
  CONFIGURATION = 'configuration',

  /** System resource errors (disk space, memory, permissions) */
  SYSTEM_RESOURCE = 'system_resource',

  /** Network/LLM service errors (Ollama unavailable, timeouts) */
  NETWORK_SERVICE = 'network_service',

  /** TypeScript compilation errors */
  TYPESCRIPT_COMPILATION = 'typescript_compilation',

  /** File operation errors (read/write/permission issues) */
  FILE_OPERATION = 'file_operation',

  /** Timeout errors (operations exceeded time limits) */
  TIMEOUT = 'timeout',

  /** Git operation errors */
  GIT_OPERATION = 'git_operation',

  /** Process execution errors */
  PROCESS_EXECUTION = 'process_execution',

  /** Unknown or uncategorized errors */
  UNKNOWN = 'unknown',
}

export enum ErrorSeverity {
  /** Fatal error - cannot recover, operation must fail */
  FATAL = 'fatal',

  /** Recoverable error - can retry with backoff */
  RECOVERABLE = 'recoverable',

  /** Degraded error - can continue with reduced functionality */
  DEGRADED = 'degraded',
}

export interface BuildFixErrorContext {
  /** The operation being performed when error occurred */
  operation: string;

  /** File path if applicable */
  filePath?: string;

  /** Command being executed if applicable */
  command?: string;

  /** Timeout configuration if applicable */
  timeout?: number;

  /** Attempt number if retrying */
  attempt?: number;

  /** Additional context data */
  [key: string]: unknown;
}

export interface BuildFixError {
  /** Error type classification */
  type: BuildFixErrorType;

  /** Error severity level */
  severity: ErrorSeverity;

  /** Human-readable error message */
  message: string;

  /** Original error object if available */
  originalError?: Error;

  /** Error context information */
  context: BuildFixErrorContext;

  /** Timestamp when error occurred */
  timestamp: number;

  /** Stack trace if available */
  stack?: string;

  /** Whether this error is retryable */
  retryable: boolean;

  /** Suggested recovery actions */
  recoverySuggestions: string[];
}

/**
 * Creates a structured BuildFixError from an unknown error
 */
export function createBuildFixError(
  error: unknown,
  type: BuildFixErrorType,
  context: BuildFixErrorContext,
  severity: ErrorSeverity = ErrorSeverity.FATAL,
): BuildFixError {
  const message = extractErrorMessage(error);
  const originalError = error instanceof Error ? error : undefined;

  return {
    type,
    severity,
    message,
    originalError,
    context,
    timestamp: Date.now(),
    stack: originalError?.stack,
    retryable: isRetryableError(type, severity),
    recoverySuggestions: getRecoverySuggestions(type, context),
  };
}

/**
 * Classifies an unknown error into a BuildFixErrorType
 */
export function classifyError(error: unknown, context: BuildFixErrorContext): BuildFixErrorType {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || '';

    // Timeout errors
    if (
      message.includes('timeout') ||
      message.includes('timed out') ||
      stack.includes('timeout') ||
      error.name === 'TimeoutError'
    ) {
      return BuildFixErrorType.TIMEOUT;
    }

    // File system errors
    if (
      message.includes('enoent') ||
      message.includes('eacces') ||
      message.includes('permission denied') ||
      message.includes('no such file') ||
      message.includes('file not found') ||
      message.includes('disk')
    ) {
      return BuildFixErrorType.FILE_OPERATION;
    }

    // Network/service errors
    if (
      message.includes('econnrefused') ||
      message.includes('network') ||
      message.includes('connection') ||
      message.includes('ollama') ||
      message.includes('fetch failed') ||
      message.includes('socket')
    ) {
      return BuildFixErrorType.NETWORK_SERVICE;
    }

    // Git errors
    if (
      message.includes('git') ||
      context.operation.includes('git') ||
      context.command?.startsWith('git')
    ) {
      return BuildFixErrorType.GIT_OPERATION;
    }

    // Process execution errors
    if (
      message.includes('spawn') ||
      message.includes('command not found') ||
      message.includes('executable') ||
      context.command
    ) {
      return BuildFixErrorType.PROCESS_EXECUTION;
    }

    // TypeScript errors
    if (
      message.includes('typescript') ||
      message.includes('tsconfig') ||
      context.operation.includes('tsc') ||
      context.filePath?.endsWith('.ts')
    ) {
      return BuildFixErrorType.TYPESCRIPT_COMPILATION;
    }

    // System resource errors
    if (
      message.includes('memory') ||
      message.includes('emfile') ||
      message.includes('resource') ||
      message.includes('quota')
    ) {
      return BuildFixErrorType.SYSTEM_RESOURCE;
    }
  }

  // Configuration errors based on context
  if (context.operation.includes('config') || context.filePath?.includes('tsconfig')) {
    return BuildFixErrorType.CONFIGURATION;
  }

  return BuildFixErrorType.UNKNOWN;
}

/**
 * Extracts a meaningful error message from various error types
 */
export function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (typeof error === 'number' || typeof error === 'boolean') {
    return String(error);
  }

  if (error && typeof error === 'object') {
    try {
      return JSON.stringify(error);
    } catch {
      return 'Object error (cannot serialize)';
    }
  }

  return 'Unknown error';
}

/**
 * Determines if an error is retryable based on type and severity
 */
function isRetryableError(type: BuildFixErrorType, severity: ErrorSeverity): boolean {
  if (severity === ErrorSeverity.FATAL) return false;

  switch (type) {
    case BuildFixErrorType.NETWORK_SERVICE:
    case BuildFixErrorType.TIMEOUT:
    case BuildFixErrorType.SYSTEM_RESOURCE:
      return true;

    case BuildFixErrorType.PROCESS_EXECUTION:
      return true; // Often retryable (e.g., temporary resource issues)

    case BuildFixErrorType.FILE_OPERATION:
    case BuildFixErrorType.GIT_OPERATION:
    case BuildFixErrorType.TYPESCRIPT_COMPILATION:
    case BuildFixErrorType.CONFIGURATION:
      return false; // Usually not retryable without changes

    default:
      return false;
  }
}

/**
 * Provides recovery suggestions based on error type and context
 */
function getRecoverySuggestions(type: BuildFixErrorType, _context: BuildFixErrorContext): string[] {
  switch (type) {
    case BuildFixErrorType.TIMEOUT:
      return [
        'Increase timeout configuration',
        'Check system resource availability',
        'Try with a smaller file or simpler error',
      ];

    case BuildFixErrorType.NETWORK_SERVICE:
      return [
        'Check if Ollama service is running',
        'Verify network connectivity',
        'Check Ollama model availability',
      ];

    case BuildFixErrorType.FILE_OPERATION:
      return [
        'Check file permissions',
        'Verify file exists and is accessible',
        'Check available disk space',
      ];

    case BuildFixErrorType.GIT_OPERATION:
      return [
        'Check if directory is a git repository',
        'Verify git installation',
        'Check git repository state',
      ];

    case BuildFixErrorType.PROCESS_EXECUTION:
      return [
        'Check if command exists in PATH',
        'Verify executable permissions',
        'Check system resource limits',
      ];

    case BuildFixErrorType.TYPESCRIPT_COMPILATION:
      return [
        'Check tsconfig.json configuration',
        'Verify TypeScript installation',
        'Check for syntax errors in source files',
      ];

    case BuildFixErrorType.CONFIGURATION:
      return [
        'Review BuildFix configuration options',
        'Check file paths and references',
        'Validate required parameters',
      ];

    case BuildFixErrorType.SYSTEM_RESOURCE:
      return ['Free up system memory', 'Check disk space availability', 'Close other applications'];

    default:
      return [
        'Check system logs for more details',
        'Try running with verbose logging',
        'Report issue if problem persists',
      ];
  }
}

/**
 * Converts a BuildFixError to a user-friendly message
 */
export function formatErrorForUser(error: BuildFixError): string {
  const typeLabel = error.type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  return `${typeLabel}: ${error.message}`;
}

/**
 * Converts a BuildFixError to a log-friendly format
 */
export function formatErrorForLogging(error: BuildFixError): string {
  return JSON.stringify(
    {
      type: error.type,
      severity: error.severity,
      message: error.message,
      operation: error.context.operation,
      filePath: error.context.filePath,
      timestamp: error.timestamp,
      retryable: error.retryable,
      suggestions: error.recoverySuggestions,
    },
    null,
    2,
  );
}
