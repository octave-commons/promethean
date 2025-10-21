# Troubleshooting Guide - OpenCode Client

## Overview

This guide provides comprehensive troubleshooting information for common issues encountered when working with the `@promethean/opencode-client` package and its Ollama queue integration.

## Quick Diagnosis Checklist

Before diving into specific issues, run this quick diagnostic:

```typescript
import { getQueueInfo } from '@promethean/opencode-client';

async function quickDiagnosis() {
  try {
    const info = await getQueueInfo.execute({});
    const data = JSON.parse(info);
    
    console.log('=== Quick Diagnosis ===');
    console.log('✅ Queue API accessible');
    console.log(`📊 Queue status: ${data.pending} pending, ${data.running} running`);
    console.log(`🔄 Processor active: ${data.processorActive}`);
    console.log(`💾 Cache size: ${data.cacheSize} entries`);
    
    return data;
  } catch (error) {
    console.error('❌ Basic diagnosis failed:', error.message);
    return null;
  }
}
```

## Common Issues and Solutions

### 1. TypeScript Compilation Errors

#### Issue: `setProcessingInterval(null)` Type Error

**Symptoms:**
```
error TS2345: Argument of type 'null' is not assignable to parameter of type 'NodeJS.Timeout'.
```

**Cause:** Attempting to pass `null` directly to `setProcessingInterval()`.

**Solution:**
```typescript
// ❌ INCORRECT
setProcessingInterval(null);

// ✅ CORRECT
clearProcessingInterval();
```

**Files to Check:**
- `src/tools/ollama.ts`
- `src/actions/ollama/tools.ts`

#### Issue: Missing Imports

**Symptoms:**
```
error TS2305: Cannot find module '@promethean/ollama-queue' or its corresponding type declarations.
```

**Solution:**
```bash
# Install dependencies
pnpm install

# Check workspace configuration
cat pnpm-workspace.yaml
```

#### Issue: Type Mismatch in Tool Definitions

**Symptoms:**
```
error TS2322: Type 'string' is not assignable to type 'Tool<any>'.
```

**Solution:**
```typescript
// Ensure proper tool definition
export const myTool: any = tool({  // Use 'any' for tool definitions
  description: 'Tool description',
  args: {
    param: tool.schema.string().describe('Parameter')
  },
  async execute(args, context) {
    return JSON.stringify({ result: 'success' });
  }
});
```

### 2. Queue Processing Issues

#### Issue: Jobs Stuck in "pending" Status

**Symptoms:**
- Jobs submitted successfully but never progress to "running"
- Queue shows pending jobs but processor appears inactive

**Diagnosis:**
```typescript
import { getProcessingInterval, startQueueProcessor } from '@promethean/ollama-queue';

const interval = getProcessingInterval();
if (!interval) {
  console.log('❌ Queue processor is not running');
  startQueueProcessor(); // Start it manually
} else {
  console.log('✅ Queue processor is running');
}
```

**Common Causes and Solutions:**

1. **Processor Not Started:**
   ```typescript
   // Auto-start on first job submission (default behavior)
   // Or start manually:
   startQueueProcessor();
   ```

2. **Process Exit Before Processing:**
   ```typescript
   // Ensure process doesn't exit immediately
   process.on('SIGINT', () => {
     stopQueueProcessor();
     process.exit(0);
   });
   
   // Keep process alive
   setInterval(() => {}, 1000);
   ```

3. **Exception in Queue Processor:**
   ```typescript
   // Check console for error messages
   // Enable debug logging:
   process.env.DEBUG = 'ollama-queue:*';
   ```

#### Issue: Queue Processor Stops Unexpectedly

**Symptoms:**
- Processor works initially then stops
- No error messages visible

**Diagnosis:**
```typescript
import { getQueueInfo } from '@promethean/opencode-client';

async function monitorProcessor() {
  const info = await getQueueInfo.execute({});
  const data = JSON.parse(info);
  
  if (!data.processorActive && data.pending > 0) {
    console.warn('⚠️ Processor inactive with pending jobs');
    startQueueProcessor();
  }
}

setInterval(monitorProcessor, 5000);
```

**Solution:**
```typescript
// Add error handling to queue processing
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  // Restart processor if needed
  startQueueProcessor();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
});
```

### 3. Ollama API Connection Issues

#### Issue: Connection Refused

**Symptoms:**
```
Error: fetch failed
Error: connect ECONNREFUSED 127.0.0.1:11434
```

**Diagnosis:**
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Or check with the client
import { listModels } from '@promethean/opencode-client';

try {
  await listModels.execute({ detailed: false });
  console.log('✅ Ollama API accessible');
} catch (error) {
  console.error('❌ Ollama API not accessible:', error.message);
}
```

**Solutions:**

1. **Start Ollama Service:**
   ```bash
   # Install Ollama (if not installed)
   curl -fsSL https://ollama.ai/install.sh | sh
   
   # Start Ollama
   ollama serve
   
   # Pull a model (if needed)
   ollama pull llama2
   ```

2. **Check Custom Ollama URL:**
   ```bash
   # Set custom Ollama URL
   export OLLAMA_URL=http://your-ollama-server:11434
   
   # Or in code:
   process.env.OLLAMA_URL = 'http://your-ollama-server:11434';
   ```

3. **Verify Network Connectivity:**
   ```bash
   # Test connectivity
   telnet localhost 11434
   
   # Check firewall settings
   sudo ufw status
   ```

#### Issue: Model Not Found

**Symptoms:**
```
Error: model 'unknown-model' not found
```

**Solution:**
```typescript
// List available models first
import { listModels } from '@promethean/opencode-client';

const models = await listModels.execute({ detailed: true });
const modelData = JSON.parse(models);
console.log('Available models:', modelData.models);

// Use an available model
const modelName = modelData.models[0].name;
```

### 4. Cache Issues

#### Issue: Cache Not Working

**Symptoms:**
- Same prompts always hit Ollama API
- No cache hits reported
- High API usage

**Diagnosis:**
```typescript
import { manageCache } from '@promethean/opencode-client';

const stats = await manageCache.execute({ action: 'stats' });
const data = JSON.parse(stats);

console.log('Cache Statistics:');
console.log(`Total entries: ${data.totalSize}`);
console.log(`Model count: ${data.modelCount}`);
console.log(`Similarity threshold: ${data.similarityThreshold}`);
```

**Solutions:**

1. **Check Embedding Generation:**
   ```typescript
   // Test embedding generation
   import { getPromptEmbedding } from '@promethean/ollama-queue';
   
   try {
     const embedding = await getPromptEmbedding('test prompt', 'llama2');
     console.log('✅ Embedding generated, length:', embedding.length);
   } catch (error) {
     console.error('❌ Embedding failed:', error.message);
   }
   ```

2. **Verify Cache Initialization:**
   ```typescript
   import { initializeCache } from '@promethean/ollama-queue';
   
   const cache = await initializeCache('llama2');
   console.log('Cache initialized, size:', cache.size);
   ```

3. **Clear and Reset Cache:**
   ```typescript
   await manageCache.execute({ action: 'clear' });
   console.log('Cache cleared');
   ```

#### Issue: Memory Usage Too High

**Symptoms:**
- Process memory grows continuously
- System becomes slow over time

**Solution:**
```typescript
// Monitor cache size and clear if needed
async function manageMemory() {
  const stats = await manageCache.execute({ action: 'stats' });
  const data = JSON.parse(stats);
  
  if (data.totalSize > 10000) { // More than 10k entries
    console.log('Cache too large, clearing...');
    await manageCache.execute({ action: 'clear' });
  }
}

setInterval(manageMemory, 60000); // Check every minute
```

### 5. Performance Issues

#### Issue: Slow Job Processing

**Symptoms:**
- Jobs take very long to complete
- Queue backlog builds up

**Diagnosis:**
```typescript
import { getQueueInfo } from '@promethean/opencode-client';

async function diagnosePerformance() {
  const info = await getQueueInfo.execute({});
  const data = JSON.parse(info);
  
  console.log('Performance Metrics:');
  console.log(`Pending jobs: ${data.pending}`);
  console.log(`Running jobs: ${data.running}`);
  console.log(`Max concurrent: ${data.maxConcurrent}`);
  
  if (data.pending > 20) {
    console.warn('⚠️ High queue backlog detected');
  }
  
  if (data.running >= data.maxConcurrent) {
    console.warn('⚠️ Max concurrent jobs reached');
  }
}
```

**Solutions:**

1. **Increase Concurrent Jobs:**
   ```typescript
   // In ollama-queue configuration
   export const MAX_CONCURRENT_JOBS = 4; // Increase from default 2
   ```

2. **Optimize Job Parameters:**
   ```typescript
   // Use smaller prompts for faster processing
   const optimizedJob = await submitJob.execute({
     modelName: 'llama2',
     jobType: 'generate',
     prompt: shortPrompt, // Keep prompts concise
     options: {
       num_predict: 500,  // Limit response length
       temperature: 0.3   // Lower temperature for faster responses
     }
   }, context);
   ```

3. **Use Faster Models:**
   ```typescript
   // Prefer smaller, faster models for simple tasks
   const fastModel = 'llama2-7b'; // Instead of larger models
   ```

### 6. Memory and Resource Issues

#### Issue: Memory Leaks

**Symptoms:**
- Memory usage increases over time
- Process eventually crashes

**Diagnosis:**
```typescript
function monitorMemory() {
  const used = process.memoryUsage();
  console.log('Memory Usage:', {
    rss: `${Math.round(used.rss / 1024 / 1024)}MB`,
    heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)}MB`,
    heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)}MB`,
    external: `${Math.round(used.external / 1024 / 1024)}MB`
  });
}

setInterval(monitorMemory, 30000);
```

**Solutions:**

1. **Clear Cache Periodically:**
   ```typescript
   setInterval(async () => {
     await manageCache.execute({ action: 'clear' });
     console.log('Cache cleared to prevent memory buildup');
   }, 3600000); // Every hour
   ```

2. **Limit Queue Size:**
   ```typescript
   // Clean up old completed jobs
   setInterval(() => {
     const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago
     jobQueue = jobQueue.filter(job => 
       job.status !== 'completed' || job.completedAt > cutoff
     );
   }, 60000); // Every minute
   ```

### 7. Build and Deployment Issues

#### Issue: Build Fails After Changes

**Symptoms:**
```
error TS2307: Cannot find module '@promethean/ollama-queue'
```

**Solution:**
```bash
# Clean and rebuild
cd packages/opencode-client
rm -rf dist node_modules
pnpm install
pnpm build

# Check workspace dependencies
cd ../..
pnpm install
```

#### Issue: Runtime Errors in Production

**Symptoms:**
- Code works in development but fails in production
- Missing dependencies or wrong paths

**Solution:**
```bash
# Check production build
pnpm build
node dist/cli.js --help

# Verify all dependencies are included
cat package.json | grep -A 20 '"dependencies"'

# Check for missing workspace dependencies
cd ../ai/ollama-queue
pnpm build
```

## Debugging Tools and Techniques

### 1. Enable Debug Logging

```typescript
// Enable comprehensive debug logging
process.env.DEBUG = 'ollama-queue:*';

// Or specific modules
process.env.DEBUG = 'ollama-queue:process,ollama-queue:cache';
```

### 2. Add Custom Logging

```typescript
import { createLogger } from '@promethean/utils';

const logger = createLogger('opencode-client');

// Log job lifecycle
logger.info('Job submitted', { jobId, jobType, modelName });
logger.debug('Job status changed', { jobId, from: 'pending', to: 'running' });
logger.error('Job failed', { jobId, error: error.message });
```

### 3. Performance Profiling

```typescript
import { performance } from 'perf_hooks';

export async function profiledJobSubmission(params: any) {
  const start = performance.now();
  
  try {
    const result = await submitJob.execute(params, context);
    const end = performance.now();
    
    logger.info('Job submitted successfully', {
      duration: `${(end - start).toFixed(2)}ms`,
      jobId: JSON.parse(result).jobId
    });
    
    return result;
  } catch (error) {
    const end = performance.now();
    
    logger.error('Job submission failed', {
      duration: `${(end - start).toFixed(2)}ms`,
      error: error.message
    });
    
    throw error;
  }
}
```

### 4. Health Check Endpoint

```typescript
export async function healthCheck() {
  const checks = {
    queue: false,
    ollama: false,
    cache: false
  };
  
  try {
    // Check queue
    const queueInfo = await getQueueInfo.execute({});
    checks.queue = true;
    
    // Check Ollama
    await listModels.execute({ detailed: false });
    checks.ollama = true;
    
    // Check cache
    await manageCache.execute({ action: 'stats' });
    checks.cache = true;
    
  } catch (error) {
    logger.error('Health check failed', { error: error.message });
  }
  
  return {
    status: Object.values(checks).every(Boolean) ? 'healthy' : 'unhealthy',
    checks,
    timestamp: new Date().toISOString()
  };
}
```

## Getting Help

### 1. Check Existing Documentation

- [API Reference](./api-reference.md)
- [Development Guide](./development-guide.md)
- [Ollama Queue Integration](./ollama-queue-integration.md)
- [TypeScript Compilation Fixes](./typescript-compilation-fixes.md)

### 2. Enable Verbose Logging

```typescript
// Maximum debug information
process.env.DEBUG = '*';
process.env.NODE_ENV = 'development';

// Log all queue operations
import { jobQueue, activeJobs } from '@promethean/ollama-queue';

setInterval(() => {
  console.log('Queue State:', {
    totalJobs: jobQueue.length,
    activeJobs: activeJobs.size,
    pending: jobQueue.filter(j => j.status === 'pending').length,
    running: jobQueue.filter(j => j.status === 'running').length
  });
}, 10000);
```

### 3. Create Minimal Reproduction Case

When reporting issues, create a minimal example:

```typescript
// minimal-reproduction.ts
import { submitJob, getJobStatus } from '@promethean/opencode-client';

async function reproduceIssue() {
  try {
    const job = await submitJob.execute({
      modelName: 'llama2',
      jobType: 'generate',
      prompt: 'Test prompt'
    }, { agent: 'test', sessionID: 'test' });
    
    console.log('Job submitted:', job);
    
    // Add the problematic code here
    
  } catch (error) {
    console.error('Issue reproduced:', error);
  }
}

reproduceIssue();
```

### 4. Report Issues

Include this information when reporting issues:

1. **Environment:**
   - Node.js version
   - Package version
   - Ollama version
   - Operating system

2. **Error Details:**
   - Full error message
   - Stack trace
   - Steps to reproduce

3. **Context:**
   - What you were trying to do
   - Expected vs actual behavior
   - Any relevant configuration

4. **Debug Output:**
   - Debug logs
   - Health check results
   - Queue statistics

## Emergency Procedures

### 1. Clear All State

```typescript
import { manageCache } from '@promethean/opencode-client';
import { clearProcessingInterval } from '@promethean/ollama-queue';

// Emergency reset
async function emergencyReset() {
  try {
    // Stop processor
    clearProcessingInterval();
    
    // Clear cache
    await manageCache.execute({ action: 'clear' });
    
    // Clear queue (if needed)
    jobQueue.length = 0;
    activeJobs.clear();
    
    console.log('Emergency reset completed');
  } catch (error) {
    console.error('Emergency reset failed:', error);
  }
}
```

### 2. Restart Services

```bash
# Restart Ollama
pkill ollama
ollama serve

# Restart your application
pm2 restart opencode-client
# or
node dist/cli.js
```

### 3. Fallback to Direct API

If queue system fails, fall back to direct Ollama calls:

```typescript
async function fallbackDirectCall(prompt: string) {
  try {
    const response = await fetch(`${process.env.OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama2',
        prompt,
        stream: false
      })
    });
    
    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Fallback also failed:', error);
    throw error;
  }
}
```

This troubleshooting guide should help resolve most common issues. For persistent problems, refer to the other documentation files or create an issue with detailed information about the problem.