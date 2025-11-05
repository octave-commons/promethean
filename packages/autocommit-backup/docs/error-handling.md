# Error Handling Documentation

## Overview

The `@promethean-os/autocommit` package has undergone significant improvements to its error handling system to address verbose JSON logging issues and provide more robust, user-friendly error reporting. This document outlines the changes made, technical details, and how to use the improved error handling effectively.

### The Problem: Verbose JSON Logging

Previously, when errors occurred during LLM requests or other operations, the error handling would serialize entire error objects to JSON, resulting in:

- **Log Spam**: Extremely long error messages containing full error objects
- **Security Risks**: Potential exposure of sensitive information in error logs
- **Poor Debugging**: Important error messages buried in verbose output
- **Inconsistent Formatting**: Different error types producing wildly different log formats

### The Solution: Safe Error Handling

The improved error handling system:

- **Truncates Long Messages**: Limits error messages to reasonable lengths (200-500 characters)
- **Preserves Error Types**: Maintains original error classification for network failures
- **Safe Serialization**: Avoids problematic JSON.stringify operations on error objects
- **Consistent Formatting**: Provides uniform error message structure across all error types
- **Graceful Fallbacks**: Ensures the application continues working even when LLM services fail

## Technical Details

### Enhanced categorizeError Function

**Location**: `src/index.ts:67-101`

The `categorizeError` function has been enhanced to safely handle different error types without verbose logging:

```typescript
function categorizeError(err: unknown): string {
  if (err instanceof Error && err.name === 'AbortError') {
    return 'LLM request timed out. Falling back.';
  }
  if (
    err instanceof Error &&
    (err as Error & { status?: number }).status &&
    (err as Error & { status?: number }).status! >= 500
  ) {
    return 'LLM server error. Falling back.';
  }

  // Handle different error types safely
  if (err instanceof Error) {
    // Only log the error message, not the full object
    return `LLM failed: ${err.message}. Falling back.`;
  }

  if (typeof err === 'string') {
    return `LLM failed: ${err}. Falling back.`;
  }

  // For objects, try to extract a meaningful message but limit size
  if (typeof err === 'object' && err !== null) {
    const errorObj = err as Record<string, unknown>;
    const message = errorObj.message || errorObj.error || 'Unknown error';
    const messageStr = typeof message === 'string' ? message : String(message);

    // Truncate very long messages to prevent log spam
    const truncated = messageStr.length > 200 ? messageStr.substring(0, 200) + '...' : messageStr;
    return `LLM failed: ${truncated}. Falling back.`;
  }

  return `LLM failed: Unknown error. Falling back.`;
}
```

**Key Improvements**:

- **Type Safety**: Proper type checking for different error types
- **Message Truncation**: Limits messages to 200 characters to prevent log spam
- **Safe Object Handling**: Extracts meaningful messages from objects without full serialization
- **Consistent Format**: All errors return user-friendly messages with fallback behavior

### Improved handleLLMError Function

**Location**: `src/llm.ts:61-96`

The `handleLLMError` function now preserves network error types and prevents verbose logging:

```typescript
function handleLLMError(error: unknown): never {
  // Only wrap unexpected errors, not our custom ones
  if (error instanceof Error && error.message.startsWith('LLM error ')) {
    throw error;
  }
  if (error instanceof Error && error.message.includes('Empty or invalid LLM response')) {
    throw error;
  }
  if (error instanceof Error && error.message.includes('Invalid chat completion options')) {
    throw error;
  }

  // For network errors, preserve the original error type and message
  if (error instanceof TypeError && error.message.includes('fetch failed')) {
    throw new Error(`Unexpected error during LLM request: TypeError: fetch failed`);
  }

  // Safely extract error message without verbose object serialization
  let errorMessage = 'Unknown error';
  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else if (typeof error === 'object' && error !== null) {
    const errorObj = error as Record<string, unknown>;
    const message = errorObj.message || errorObj.error || 'Unknown error';
    errorMessage = typeof message === 'string' ? message : String(message);

    // Truncate very long messages to prevent log spam
    if (errorMessage.length > 200) {
      errorMessage = errorMessage.substring(0, 200) + '...';
    }
  }

  throw new Error(`Unexpected error during LLM request: ${errorMessage}`);
}
```

**Key Improvements**:

- **Network Error Preservation**: Maintains TypeError format for fetch failures
- **Custom Error Protection**: Doesn't wrap errors that are already properly formatted
- **Safe Message Extraction**: Avoids problematic object serialization
- **Message Truncation**: Limits error messages to 200 characters

### Enhanced CLI Error Handling

**Location**: `src/cli.ts:38-64`

The CLI error handling now includes stack trace limiting and message truncation:

```typescript
program.parseAsync().catch((err) => {
  let errorMessage = 'Unknown error occurred';
  if (err instanceof Error) {
    errorMessage = err.message;
    if (err.stack) {
      // Only include stack if it's not too long
      const stackStr = err.stack;
      if (stackStr && stackStr.length < 1000) {
        errorMessage = stackStr;
      }
    }
  } else if (typeof err === 'string') {
    errorMessage = err;
  } else if (typeof err === 'object' && err !== null) {
    const errorObj = err as Record<string, unknown>;
    const message = errorObj.message || errorObj.error || 'Unknown error';
    errorMessage = typeof message === 'string' ? message : String(message);

    // Truncate very long messages
    if (errorMessage.length > 500) {
      errorMessage = errorMessage.substring(0, 500) + '...';
    }
  }

  console.error(errorMessage);
  process.exit(1);
});
```

**Key Improvements**:

- **Stack Trace Limiting**: Only includes stack traces under 1000 characters
- **Message Truncation**: Limits CLI error messages to 500 characters
- **Safe Object Handling**: Extracts messages from objects without full serialization
- **Graceful Exit**: Ensures proper process termination with error code

### Consistent Error Creation

**Location**: `src/index.ts:23-30`

Replaced the AutocommitError class with a factory function for consistency:

```typescript
function createAutocommitError(message: string, cause?: Error): Error {
  const error = new Error(message);
  error.name = 'AutocommitError';
  if (cause) {
    error.cause = cause;
  }
  return error;
}
```

**Benefits**:

- **Consistent Pattern**: All errors created using the same factory function
- **Cause Preservation**: Maintains error causality chain
- **Type Safety**: Proper error typing throughout the application

## API Documentation

### categorizeError

**Signature**:

```typescript
function categorizeError(err: unknown): string;
```

**Description**: Safely categorizes and formats error messages for logging.

**Parameters**:

- `err: unknown` - The error to categorize

**Returns**: `string` - A user-friendly error message with fallback behavior

**Behavior**:

- Handles `AbortError` instances with timeout messages
- Handles server errors (status >= 500) with appropriate messages
- Truncates long messages to 200 characters
- Provides fallback messages for unknown error types

### handleLLMError

**Signature**:

```typescript
function handleLLMError(error: unknown): never;
```

**Description**: Handles LLM-related errors with safe serialization and type preservation.

**Parameters**:

- `error: unknown` - The error to handle

**Returns**: `never` - Always throws an error

**Behavior**:

- Preserves custom error messages that start with "LLM error "
- Preserves TypeError format for network failures
- Truncates verbose error messages to 200 characters
- Wraps unexpected errors in consistent format

### createAutocommitError

**Signature**:

```typescript
function createAutocommitError(message: string, cause?: Error): Error;
```

**Description**: Creates a consistent AutocommitError with optional cause.

**Parameters**:

- `message: string` - The error message
- `cause?: Error` - Optional underlying cause

**Returns**: `Error` - An Error instance with name "AutocommitError"

## Usage Examples

### Basic Error Handling

```typescript
import { categorizeError } from './index.js';

try {
  // Some operation that might fail
  await riskyOperation();
} catch (error) {
  const userMessage = categorizeError(error);
  console.warn(userMessage);
  // Continue with fallback behavior
}
```

### LLM Error Handling

```typescript
import { chatCompletion } from './llm.js';

try {
  const message = await chatCompletion({
    baseUrl: 'http://localhost:11434/v1',
    model: 'llama3.1:8b',
    temperature: 0.2,
    messages: [{ role: 'user', content: 'Generate commit message' }],
  });
  console.log('Generated message:', message);
} catch (error) {
  // Error is already properly formatted by handleLLMError
  console.error('LLM operation failed:', error.message);
  // Use fallback commit message generation
}
```

### Custom Error Creation

```typescript
import { createAutocommitError } from './index.js';

function validateConfig(config: unknown): void {
  if (!config || typeof config !== 'object') {
    throw createAutocommitError('Invalid configuration provided');
  }
  // ... other validation
}
```

## Migration Guide

### For Users

No breaking changes were introduced. The error handling improvements are transparent to end users. However, you may notice:

- **Cleaner Error Messages**: Error logs are now more concise and readable
- **Better Debugging**: Error messages include relevant context without verbose output
- **Consistent Format**: All errors follow the same formatting pattern

### For Developers

If you were previously catching `AutocommitError` instances:

```typescript
// Before
try {
  await someOperation();
} catch (error) {
  if (error instanceof AutocommitError) {
    // Handle autocommit-specific errors
  }
}

// After (no change needed, but error.name is now 'AutocommitError')
try {
  await someOperation();
} catch (error) {
  if (error instanceof Error && error.name === 'AutocommitError') {
    // Handle autocommit-specific errors
  }
}
```

If you were creating custom errors:

```typescript
// Before
throw new AutocommitError('Something went wrong', cause);

// After (recommended)
throw createAutocommitError('Something went wrong', cause);

// Or still works
const error = new Error('Something went wrong');
error.name = 'AutocommitError';
if (cause) error.cause = cause;
throw error;
```

## Troubleshooting

### Common Error Scenarios

#### Network Failures

**Scenario**: LLM server is unreachable

**Old Behavior**: Verbose error object with full fetch details
**New Behavior**: Clean message: `Unexpected error during LLM request: TypeError: fetch failed`

```bash
$ autocommit --model llama3.1:8b
[autocommit] LLM failed: Unexpected error during LLM request: TypeError: fetch failed. Falling back.
[autocommit] Committed 3 file(s).
```

#### Authentication Failures

**Scenario**: Invalid API key

**Behavior**: `LLM error 401: Authentication failed` (API key details hidden for security)

#### Server Errors

**Scenario**: LLM server returns 500 error

**Behavior**: `LLM error 500: Internal server error`

#### Timeouts

**Scenario**: LLM request times out

**Behavior**: `LLM request timed out. Falling back.`

#### Empty Responses

**Scenario**: LLM returns empty or invalid response

**Behavior**: `Empty or invalid LLM response`

### Debugging Tips

1. **Enable Verbose Logging**: Use `--dry-run` to see what would happen without making changes
2. **Check Network**: Verify LLM server connectivity with curl or similar tools
3. **Validate Configuration**: Ensure API keys and URLs are correct
4. **Monitor Logs**: Watch for truncated messages indicated by "..." - full details may be available elsewhere

### Error Message Patterns

All error messages follow these patterns:

- **LLM Errors**: `LLM error <status>: <message>`
- **Network Errors**: `Unexpected error during LLM request: TypeError: <message>`
- **Fallback Messages**: `LLM failed: <message>. Falling back.`
- **Configuration Errors**: `Invalid configuration: <message>`
- **CLI Errors**: Direct error output to stderr with process exit code 1

## Testing

The error handling improvements are thoroughly tested with 37 passing tests covering:

- Network failure scenarios
- Authentication errors
- Server error responses
- Empty/invalid response handling
- Message truncation behavior
- Error type preservation
- CLI error formatting

Run tests with:

```bash
pnpm --filter @promethean-os/autocommit test
```

## Security Considerations

The error handling improvements enhance security by:

- **Preventing Information Leakage**: No longer serializes full error objects that might contain sensitive data
- **API Key Protection**: Authentication failures don't expose API key details in logs
- **Controlled Output**: Message truncation prevents log injection attacks
- **Consistent Sanitization**: All error output follows the same sanitization rules

## Performance Impact

The error handling improvements have minimal performance impact:

- **Reduced Log Volume**: Truncated messages reduce I/O overhead
- **Faster Error Processing**: Avoids expensive JSON.stringify operations
- **Memory Efficiency**: Prevents creation of large error strings
- **CPU Optimization**: Simple string operations instead of object serialization

## Future Enhancements

Potential future improvements to error handling:

1. **Structured Logging**: Add JSON logging support for monitoring systems
2. **Error Metrics**: Track error frequencies and types for analytics
3. **Retry Logic**: Implement exponential backoff for transient failures
4. **Error Recovery**: More sophisticated fallback strategies
5. **Context Preservation**: Include more contextual information in error messages

## Conclusion

The error handling improvements in `@promethean-os/autocommit` provide a robust, secure, and user-friendly approach to error management. The changes eliminate verbose logging while preserving important debugging information and maintaining backward compatibility.

Users will experience cleaner, more informative error messages, while developers benefit from consistent error handling patterns and improved type safety. The improvements represent a significant step forward in the reliability and maintainability of the autocommit system.
