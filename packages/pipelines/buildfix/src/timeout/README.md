# BuildFix Timeout System

This directory contains the comprehensive timeout handling system for BuildFix, providing robust timeout protection for all operations including LLM calls, process execution, file I/O, and benchmark operations.

## Architecture

The timeout system consists of several key components:

### Core Components

1. **Timeout Manager** (`timeout-manager.ts`)
   - Central timeout coordination
   - Operation-specific timeout configuration
   - Timeout event tracking and statistics

2. **Process Wrapper** (`process-wrapper.ts`)
   - Timeout-protected process execution
   - Process tree management
   - Resource monitoring and cleanup

3. **Ollama Wrapper** (`ollama-wrapper.ts`)
   - Timeout-protected LLM API calls
   - Retry logic with exponential backoff
   - Performance optimization with npm package fallback

4. **Monitoring System** (`monitoring.ts`)
   - Real-time operation monitoring
   - Performance metrics collection
   - Resource usage tracking

5. **Configuration** (`config.ts`)
   - Environment-specific timeout settings
   - Model-specific optimizations
   - Operation-specific configurations

6. **BuildFix Wrapper** (`buildfix-wrapper.ts`)
   - High-level timeout integration
   - Enhanced error handling
   - Resource monitoring integration

## Usage

### Basic Timeout Protection

```typescript
import { withTimeout, globalTimeoutManager } from './timeout-manager.js';

// Simple timeout protection
const result = await withTimeout('ollama', async () => {
  return await callLLM(prompt);
}, { model: 'qwen3:4b', prompt: 'test' });
```

### Process Execution with Timeouts

```typescript
import { ProcessWrapper } from './timeout/process-wrapper.js';

const result = await ProcessWrapper.execute('npm', ['install'], {
  timeout: 300000, // 5 minutes
  cwd: '/project/path',
});

if (result.timedOut) {
  console.log('Process timed out');
}
```

### LLM Calls with Timeouts

```typescript
import { globalOllamaWrapper } from './timeout/ollama-wrapper.js';

const response = await globalOllamaWrapper.generateJSON('qwen3:4b', prompt, {
  timeout: 60000, // 1 minute
  temperature: 0.2,
});

if (response.timedOut) {
  console.log('LLM call timed out');
}
```

### BuildFix with Enhanced Timeout Support

```typescript
import { BuildFix } from '../buildfix.js';

const buildFix = new BuildFix();

const result = await buildFix.fixErrors(source, {
  filePath: 'src/file.ts',
  model: 'qwen3:4b',
  timeout: 600000, // 10 minutes total
  tscTimeout: 120000, // 2 minutes per compilation
  ollamaTimeout: 180000, // 3 minutes per LLM call
  enableMonitoring: true,
  maxMemory: 512 * 1024 * 1024, // 512MB memory limit
});
```

## Configuration

### Environment-Specific Timeouts

The system automatically detects the environment and applies appropriate timeouts:

- **Development**: Shorter timeouts for fast feedback
- **Production**: Balanced timeouts for reliability
- **CI/CD**: Longer timeouts for resource-constrained environments
- **Testing**: Very short timeouts for fast test execution

### Model-Specific Optimizations

Different LLM models have different performance characteristics:

```typescript
// Fast models get shorter timeouts
'qwen3:4b': { ollama: 30000 }, // 30 seconds

// Large models get longer timeouts
'llama3:70b': { ollama: 180000 }, // 3 minutes
```

### Operation-Specific Timeouts

Different operations require different timeout strategies:

```typescript
// Plan generation needs more time for complex reasoning
'plan-generation': { ollama: 180000 },

// Validation operations are typically faster
'validation': { tsc: 120000, fileIO: 15000 },
```

## Monitoring and Observability

### Performance Metrics

The monitoring system tracks:

- Operation success/failure rates
- Average and maximum durations
- Timeout frequency by operation type
- Resource usage patterns

### Real-time Monitoring

```typescript
import { globalMonitor } from './timeout/monitoring.js';

// Get performance statistics
const stats = globalMonitor.getPerformanceStats();
console.log(`Success rate: ${stats.successfulOperations / stats.totalOperations * 100}%`);

// Get recent events
const events = globalMonitor.getRecentEvents(10);
events.forEach(event => {
  console.log(`${event.type}: ${JSON.stringify(event.data)}`);
});

// Generate monitoring report
const report = globalMonitor.generateReport();
console.log(report);
```

### Resource Monitoring

```typescript
import { ProcessWrapper } from './timeout/process-wrapper.js';

const result = await ProcessWrapper.executeWithMonitoring('node', ['script.js'], {
  timeout: 60000,
  maxMemory: 512 * 1024 * 1024, // 512MB
  maxCpu: 80, // 80% CPU
});

console.log(`Max memory used: ${result.maxMemoryUsage} bytes`);
console.log(`Max CPU used: ${result.maxCpuUsage}%`);
```

## Error Handling

### Timeout Errors

The system provides detailed timeout error information:

```typescript
import { TimeoutError } from './timeout/timeout-manager.js';

try {
  await withTimeout('operation', async () => {
    // Long-running operation
  });
} catch (error) {
  if (error instanceof TimeoutError) {
    console.log(`Operation ${error.operation} timed out`);
    console.log(`Timeout: ${error.timeoutMs}ms`);
    console.log(`Actual duration: ${error.actualDuration}ms`);
  }
}
```

### Graceful Degradation

All timeout-protected functions include fallback mechanisms:

- LLM wrappers fall back to HTTP implementations
- Process wrappers fall back to standard execution
- BuildFix continues with original implementations if wrappers fail

## Best Practices

### 1. Choose Appropriate Timeouts

```typescript
// Good: Environment-aware timeouts
const config = buildTimeoutConfig({
  model: 'qwen3:4b',
  operation: 'plan-generation',
});

// Bad: Fixed timeouts for all situations
const timeout = 60000; // Too rigid
```

### 2. Enable Monitoring in Production

```typescript
const result = await buildFix.fixErrors(source, {
  filePath: 'src/file.ts',
  enableMonitoring: true, // Always enable in production
});
```

### 3. Handle Timeouts Gracefully

```typescript
try {
  const result = await withTimeout('operation', asyncOperation);
  return result;
} catch (error) {
  if (error instanceof TimeoutError) {
    // Log the timeout and provide fallback
    logger.warn('Operation timed out', { 
      operation: error.operation,
      duration: error.actualDuration 
    });
    return getFallbackResult();
  }
  throw error; // Re-throw non-timeout errors
}
```

### 4. Use Resource Monitoring for Long Operations

```typescript
const result = await ProcessWrapper.executeWithMonitoring('npm', ['run', 'build'], {
  timeout: 600000, // 10 minutes
  maxMemory: 1024 * 1024 * 1024, // 1GB
  maxCpu: 90, // 90% CPU
});
```

## Configuration Examples

### Development Environment

```typescript
const devConfig = {
  default: 15000, // 15 seconds
  ollama: 30000, // 30 seconds
  tsc: 30000, // 30 seconds
  buildfix: 120000, // 2 minutes
};
```

### Production Environment

```typescript
const prodConfig = {
  default: 30000, // 30 seconds
  ollama: 120000, // 2 minutes
  tsc: 180000, // 3 minutes
  buildfix: 600000, // 10 minutes
};
```

### CI/CD Environment

```typescript
const ciConfig = {
  default: 60000, // 1 minute
  ollama: 300000, // 5 minutes
  tsc: 300000, // 5 minutes
  buildfix: 1200000, // 20 minutes
};
```

## Testing

The timeout system includes comprehensive tests:

```bash
# Run timeout integration tests
pnpm test packages/buildfix/src/tests/timeout-integration.test.ts

# Run all BuildFix tests
pnpm test packages/buildfix
```

## Troubleshooting

### Common Issues

1. **Frequent Timeouts**
   - Check environment configuration
   - Verify model-specific timeouts
   - Monitor resource usage

2. **Performance Issues**
   - Enable monitoring to identify bottlenecks
   - Check timeout statistics
   - Review resource limits

3. **Memory Leaks**
   - Ensure proper cleanup of timeouts
   - Monitor process wrapper statistics
   - Check for abandoned operations

### Debug Information

```typescript
// Get timeout manager statistics
const stats = globalTimeoutManager.getStats();
console.log('Active timeouts:', stats.activeTimeouts);
console.log('Longest running:', stats.longestRunning);

// Get monitoring report
const report = globalMonitor.generateReport();
console.log(report);

// Get process information
const processes = ProcessWrapper.getActiveProcesses();
console.log('Active processes:', processes.length);
```

## Migration Guide

### From Original BuildFix

1. **Update FixOptions interface** - New timeout properties are optional
2. **Enable monitoring** - Add `enableMonitoring: true` for production
3. **Configure timeouts** - Use environment-specific configurations
4. **Handle timeout errors** - Add TimeoutError catch blocks

### Example Migration

```typescript
// Before
const result = await buildFix.fixErrors(source, {
  filePath: 'src/file.ts',
  model: 'qwen3:4b',
});

// After
const result = await buildFix.fixErrors(source, {
  filePath: 'src/file.ts',
  model: 'qwen3:4b',
  timeout: 300000, // 5 minutes
  enableMonitoring: true,
  tscTimeout: 120000, // 2 minutes
  ollamaTimeout: 90000, // 1.5 minutes
});
```

This timeout system provides comprehensive protection against hanging operations while maintaining the flexibility and performance of the original BuildFix system.