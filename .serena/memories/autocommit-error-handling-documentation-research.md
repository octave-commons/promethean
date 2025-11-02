# Autocommit Error Handling Documentation Research

## Key Findings

### Recent Error Handling Improvements (Based on Git History)

1. **Network Error Handling (commit 0daed2293)**:
   - Enhanced `handleLLMError` function to preserve TypeError format for network failures
   - Added specific handling for `fetch failed` errors
   - Prevents verbose JSON logging of network errors

2. **Logging Clarity (commit a5a84b34e)**:
   - Added repository type context to watch messages
   - Clear distinction between git repositories and subrepos in logs
   - Better debugging information

3. **Error Consistency (commit 978626483)**:
   - Replaced AutocommitError class with createAutocommitError factory function
   - Consistent error creation patterns throughout codebase

### Current Error Handling Architecture

#### categorizeError Function (index.ts:67-101)
- Handles different error types safely
- Truncates long messages to prevent log spam (200 char limit)
- Provides fallback behavior for unknown errors
- Specific handling for AbortError and server errors

#### handleLLMError Function (llm.ts:61-96)
- Preserves original error types for network failures
- Safe error message extraction without verbose object serialization
- Message truncation to prevent log spam (200 char limit)
- Custom error wrapping for unexpected errors

#### CLI Error Handling (cli.ts:38-64)
- Stack trace limiting (1000 char limit)
- Message truncation for long errors (500 char limit)
- Safe object-to-string conversion
- Graceful error display and exit

### Test Coverage
- All 37 tests passing
- Comprehensive error scenario coverage in llm.unit.test.ts
- Network failure, authentication, server error, empty response scenarios

### Key Improvements Made
1. **Verbose JSON Logging Issue**: Fixed by implementing safe error serialization
2. **Network Error Preservation**: TypeError format maintained for fetch failures
3. **Message Truncation**: Prevents log spam from long error messages
4. **Type Safety**: Better error type checking and handling
5. **Consistent Patterns**: Factory functions for error creation

## Documentation Plan
1. Overview of the verbose logging problem and solution
2. Technical deep-dive into each error handling function
3. API documentation with updated signatures
4. Usage examples showing new error handling in practice
5. Migration guide for users upgrading
6. Troubleshooting guide for common error scenarios