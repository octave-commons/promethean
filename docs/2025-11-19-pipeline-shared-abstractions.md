# Pipeline Shared Abstractions Specification

## Overview

This specification defines shared abstractions to eliminate code duplication and improve maintainability across all pipeline implementations in @pipelines/ directory.

## Base Pipeline Architecture

### 1. Abstract Base Pipeline Step

**Purpose**: Provide common functionality for all pipeline steps including caching, logging, error handling, and configuration management.

#### Implementation Plan

1. **Create `pipelines/core/src/base/` directory** with:
   - `pipeline-step.ts` - Abstract base class
   - `step-interface.ts` - Step interface definitions
   - `step-context.ts` - Execution context management

2. **Base Pipeline Step Class**:
```typescript
// pipelines/core/src/base/pipeline-step.ts
import { Logger } from '@promethean-os/logger';
import { openLevelCache } from '@promethean-os/level-cache';
import { ErrorHandler } from '../errors/error-handler.js';
import { RuntimeValidator } from '../validation/validators.js';
import { EnvironmentManager } from '../config/environment.js';

export interface StepInput<T = any> {
  data: T;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export interface StepOutput<T = any> {
  data: T;
  metadata?: Record<string, unknown>;
  timestamp: string;
  duration: number;
}

export interface StepContext {
  stepId: string;
  pipelineName: string;
  runId: string;
  logger: Logger;
  environment: Record<string, string>;
  cache: any; // LevelDB instance
}

export interface StepConfig<TInput, TOutput> {
  name: string;
  version: string;
  description?: string;
  inputSchema?: any; // Zod schema
  outputSchema?: any; // Zod schema
  cacheOptions?: {
    ttl?: number;
    namespace?: string;
  };
  retryOptions?: {
    attempts?: number;
    delay?: number;
    backoff?: 'linear' | 'exponential';
  };
}

export abstract class BasePipelineStep<TInput = any, TOutput = any> {
  protected readonly logger: Logger;
  protected readonly config: StepConfig<TInput, TOutput>;
  protected readonly errorHandler: ErrorHandler;
  protected readonly environment: EnvironmentManager;
  
  constructor(config: StepConfig<TInput, TOutput>) {
    this.config = config;
    this.logger = this.createLogger();
    this.errorHandler = new ErrorHandler(this.logger);
    this.environment = EnvironmentManager.getInstance();
  }
  
  abstract execute(input: StepInput<TInput>, context: StepContext): Promise<StepOutput<TOutput>>;
  
  protected createLogger(): Logger {
    return this.logger.child({
      component: this.config.name,
      version: this.config.version
    });
  }
  
  protected async withCache<T>(
    key: string,
    factory: () => Promise<T>,
    options?: { ttl?: number; namespace?: string }
  ): Promise<T> {
    const cacheKey = this.buildCacheKey(key, options);
    const cache = await this.getCache();
    
    // Try to get from cache first
    const cached = await cache.get(cacheKey);
    if (cached && !this.isExpired(cached)) {
      this.logger.debug(`Cache hit for key: ${cacheKey}`);
      return cached.data;
    }
    
    // Execute factory function and cache result
    this.logger.debug(`Cache miss for key: ${cacheKey}`);
    const result = await factory();
    
    await cache.set(cacheKey, {
      data: result,
      timestamp: Date.now(),
      ttl: options?.ttl || this.config.cacheOptions?.ttl || 3600000 // 1 hour default
    });
    
    return result;
  }
  
  protected validateInput(input: unknown): TInput {
    if (!this.config.inputSchema) {
      return input as TInput;
    }
    
    return RuntimeValidator.validateWithSchema(
      this.config.inputSchema,
      input,
      `${this.config.name} input`
    );
  }
  
  protected validateOutput(output: unknown): TOutput {
    if (!this.config.outputSchema) {
      return output as TOutput;
    }
    
    return RuntimeValidator.validateWithSchema(
      this.config.outputSchema,
      output,
      `${this.config.name} output`
    );
  }
  
  protected async withRetry<T>(
    operation: () => Promise<T>,
    context?: string
  ): Promise<T> {
    const options = this.config.retryOptions || {
      attempts: 3,
      delay: 1000,
      backoff: 'exponential'
    };
    
    let lastError: Error;
    
    for (let attempt = 1; attempt <= options.attempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === options.attempts) {
          this.errorHandler.handle(error, `${context || this.config.name} (final attempt ${attempt})`);
          throw error;
        }
        
        const delay = options.backoff === 'exponential' 
          ? options.delay * Math.pow(2, attempt - 1)
          : options.delay * attempt;
          
        this.logger.warn(`Attempt ${attempt} failed for ${context || this.config.name}, retrying in ${delay}ms: ${error.message}`);
        await this.delay(delay);
      }
    }
    
    throw lastError!;
  }
  
  protected createStepContext(stepId: string, pipelineName: string): StepContext {
    return {
      stepId,
      pipelineName,
      runId: this.generateRunId(),
      logger: this.logger,
      environment: this.environment.getAll(),
      cache: await this.getCache()
    };
  }
  
  protected measurePerformance<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<{ result: T; duration: number }> {
    const startTime = performance.now();
    const result = await operation();
    const duration = performance.now() - startTime;
    
    this.logger.debug(`${operationName} completed in ${duration.toFixed(2)}ms`);
    return { result, duration };
  }
  
  private buildCacheKey(key: string, options?: { namespace?: string }): string {
    const namespace = options?.namespace || this.config.cacheOptions?.namespace || 'default';
    return `${namespace}:${this.config.name}:${key}`;
  }
  
  private isExpired(cached: { timestamp: number; ttl?: number }): boolean {
    if (!cached.ttl) return false;
    return Date.now() - cached.timestamp > cached.ttl;
  }
  
  private async getCache(): Promise<any> {
    // This should be implemented by concrete classes or injected
    return openLevelCache({
      path: `.cache/${this.config.name}`,
      valueEncoding: 'json'
    });
  }
  
  private generateRunId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### 2. Pipeline Orchestrator

**Purpose**: Manage pipeline execution flow, dependency resolution, and error recovery.

#### Implementation Plan

1. **Create `pipelines/core/src/orchestrator/` directory** with:
   - `pipeline-orchestrator.ts` - Main orchestration logic
   - `dependency-resolver.ts` - Step dependency management
   - `execution-planner.ts` - Execution planning and optimization

2. **Pipeline Orchestrator Class**:
```typescript
// pipelines/core/src/orchestrator/pipeline-orchestrator.ts
export interface PipelineDefinition {
  name: string;
  version: string;
  description?: string;
  steps: PipelineStepDefinition[];
  environment?: Record<string, string>;
  maxConcurrency?: number;
  timeout?: number;
}

export interface PipelineStepDefinition {
  id: string;
  name: string;
  dependencies?: string[];
  step: any; // BasePipelineStep instance
  condition?: (context: ExecutionContext) => boolean;
  retryPolicy?: {
    attempts?: number;
    delay?: number;
    backoff?: 'linear' | 'exponential';
  };
}

export interface ExecutionContext {
  runId: string;
  pipeline: PipelineDefinition;
  environment: Record<string, string>;
  startTime: number;
  logger: Logger;
  cache: any;
  state: Map<string, any>;
}

export interface PipelineResult {
  success: boolean;
  completedSteps: string[];
  failedSteps: Array<{ stepId: string; error: Error }>;
  skippedSteps: string[];
  duration: number;
  outputs: Map<string, any>;
}

export class PipelineOrchestrator {
  private readonly logger: Logger;
  private readonly errorHandler: ErrorHandler;
  
  constructor(logger: Logger) {
    this.logger = logger;
    this.errorHandler = new ErrorHandler(logger);
  }
  
  async execute(pipeline: PipelineDefinition): Promise<PipelineResult> {
    const context = this.createExecutionContext(pipeline);
    const plan = await this.createExecutionPlan(pipeline);
    
    this.logger.info(`Starting pipeline execution: ${pipeline.name} (run ID: ${context.runId})`);
    
    try {
      const result = await this.executePlan(plan, context);
      this.logger.info(`Pipeline execution completed: ${pipeline.name} in ${result.duration}ms`);
      return result;
    } catch (error) {
      this.errorHandler.handle(error, `Pipeline execution: ${pipeline.name}`);
      throw error;
    }
  }
  
  private async createExecutionPlan(pipeline: PipelineDefinition): Promise<ExecutionPlan> {
    const resolver = new DependencyResolver();
    return await resolver.createPlan(pipeline.steps);
  }
  
  private async executePlan(plan: ExecutionPlan, context: ExecutionContext): Promise<PipelineResult> {
    const startTime = Date.now();
    const completedSteps: string[] = [];
    const failedSteps: Array<{ stepId: string; error: Error }> = [];
    const outputs = new Map<string, any>();
    
    // Execute steps in dependency order
    for (const batch of plan.batches) {
      const batchResults = await this.executeBatch(batch, context, outputs);
      
      batchResults.forEach(result => {
        if (result.success) {
          completedSteps.push(result.stepId);
          if (result.output) {
            outputs.set(result.stepId, result.output);
          }
        } else {
          failedSteps.push({
            stepId: result.stepId,
            error: result.error!
          });
        }
      });
    }
    
    return {
      success: failedSteps.length === 0,
      completedSteps,
      failedSteps,
      skippedSteps: [],
      duration: Date.now() - startTime,
      outputs
    };
  }
  
  private async executeBatch(
    batch: string[],
    context: ExecutionContext,
    outputs: Map<string, any>
  ): Promise<Array<{ stepId: string; success: boolean; output?: any; error?: Error }>> {
    // Execute batch with concurrency control
    const maxConcurrency = context.pipeline.maxConcurrency || 3;
    const semaphore = new Semaphore(maxConcurrency);
    
    const promises = batch.map(async stepId => {
      await semaphore.acquire();
      
      try {
        const step = context.pipeline.steps.find(s => s.id === stepId);
        if (!step) {
          throw new Error(`Step not found: ${stepId}`);
        }
        
        // Check if dependencies are satisfied
        if (!this.areDependenciesSatisfied(step, completedSteps, outputs)) {
          return { stepId, success: false, error: new Error('Dependencies not satisfied') };
        }
        
        // Check step condition
        if (step.condition && !step.condition(context)) {
          return { stepId, success: true }; // Skipped
        }
        
        const stepInput = this.prepareStepInput(step, outputs, context);
        const stepContext = { ...context, stepId };
        const result = await step.step.execute(stepInput, stepContext);
        
        return { stepId, success: true, output: result.data };
      } catch (error) {
        return { stepId, success: false, error: error as Error };
      } finally {
        semaphore.release();
      }
    });
    
    return Promise.all(promises);
  }
  
  private areDependenciesSatisfied(
    step: PipelineStepDefinition,
    completedSteps: string[],
    outputs: Map<string, any>
  ): boolean {
    if (!step.dependencies) return true;
    
    return step.dependencies.every(dep => 
      completedSteps.includes(dep) || outputs.has(dep)
    );
  }
  
  private prepareStepInput(
    step: PipelineStepDefinition,
    outputs: Map<string, any>,
    context: ExecutionContext
  ): any {
    // Prepare input based on dependencies
    const input: any = {};
    
    if (step.dependencies) {
      step.dependencies.forEach(dep => {
        if (outputs.has(dep)) {
          input[dep] = outputs.get(dep);
        }
      });
    }
    
    return input;
  }
  
  private createExecutionContext(pipeline: PipelineDefinition): ExecutionContext {
    return {
      runId: this.generateRunId(),
      pipeline,
      environment: { ...process.env, ...pipeline.environment },
      startTime: Date.now(),
      logger: this.logger.child({ pipeline: pipeline.name }),
      cache: null, // Will be initialized per step
      state: new Map()
    };
  }
  
  private generateRunId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Simple semaphore implementation for concurrency control
class Semaphore {
  private permits: number;
  private waitQueue: Array<() => void> = [];
  
  constructor(private maxPermits: number) {
    this.permits = maxPermits;
  }
  
  async acquire(): Promise<void> {
    if (this.permits > 0) {
      this.permits--;
      return;
    }
    
    return new Promise(resolve => {
      this.waitQueue.push(resolve);
    });
  }
  
  release(): void {
    this.permits++;
    if (this.waitQueue.length > 0) {
      const resolve = this.waitQueue.shift()!;
      this.permits--;
      resolve();
    }
  }
}
```

### 3. Shared Utilities

**Purpose**: Provide common utilities for file operations, data processing, and system interactions.

#### Implementation Plan

1. **Create `pipelines/core/src/utils/` directory** with:
   - `file-operations.ts` - File I/O utilities
   - `data-processing.ts` - Data transformation utilities
   - `system-operations.ts` - System interaction utilities
   - `hashing.ts` - Hashing and comparison utilities

2. **File Operations Utilities**:
```typescript
// pipelines/core/src/utils/file-operations.ts
export interface FileOperationOptions {
  encoding?: BufferEncoding;
  atomic?: boolean;
  backup?: boolean;
  maxRetries?: number;
}

export interface FileMetadata {
  size: number;
  mtime: Date;
  hash: string;
  exists: boolean;
}

export class FileOperations {
  static async readFile(
    path: string,
    options: FileOperationOptions = {}
  ): Promise<string> {
    const { encoding = 'utf8', maxRetries = 3 } = options;
    
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fs.readFile(path, encoding);
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < maxRetries) {
          await this.delay(100 * attempt);
        }
      }
    }
    
    throw lastError!;
  }
  
  static async writeFile(
    path: string,
    content: string,
    options: FileOperationOptions = {}
  ): Promise<void> {
    const { encoding = 'utf8', atomic = true, backup = true } = options;
    
    // Create backup if requested
    if (backup && await this.exists(path)) {
      await this.backupFile(path);
    }
    
    if (atomic) {
      // Write to temporary file then rename
      const tempPath = `${path}.tmp.${Date.now()}`;
      await fs.writeFile(tempPath, content, encoding);
      await fs.rename(tempPath, path);
    } else {
      await fs.writeFile(path, content, encoding);
    }
  }
  
  static async exists(path: string): Promise<boolean> {
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }
  
  static async getMetadata(path: string): Promise<FileMetadata> {
    try {
      const stats = await fs.stat(path);
      const content = await this.readFile(path);
      const hash = await this.hashContent(content);
      
      return {
        size: stats.size,
        mtime: stats.mtime,
        hash,
        exists: true
      };
    } catch {
      return {
        size: 0,
        mtime: new Date(0),
        hash: '',
        exists: false
      };
    }
  }
  
  static async hashContent(content: string): Promise<string> {
    const crypto = await import('crypto');
    return crypto.createHash('sha256').update(content).digest('hex');
  }
  
  static async backupFile(path: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = `${path}.backup.${timestamp}`;
    await fs.copyFile(path, backupPath);
    return backupPath;
  }
  
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### 4. Configuration Management

**Purpose**: Standardize configuration loading, validation, and management across all pipelines.

#### Implementation Plan

1. **Create `pipelines/core/src/config/` directory** with:
   - `config-manager.ts` - Configuration management
   - `config-loader.ts` - Configuration loading utilities
   - `config-validator.ts` - Configuration validation

2. **Configuration Manager**:
```typescript
// pipelines/core/src/config/config-manager.ts
export interface PipelineConfiguration {
  name: string;
  version: string;
  description?: string;
  steps: any[];
  environment?: Record<string, string>;
  dependencies?: string[];
  defaults?: Record<string, any>;
}

export interface ConfigLoadOptions {
  path?: string;
  format?: 'json' | 'yaml' | 'toml';
  envPrefix?: string;
  mergeWithEnvironment?: boolean;
}

export class ConfigManager {
  private static instance: ConfigManager;
  private config: PipelineConfiguration;
  private watchers: Array<() => void> = [];
  
  private constructor() {}
  
  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }
  
  async load(
    pipelineName: string,
    options: ConfigLoadOptions = {}
  ): Promise<PipelineConfiguration> {
    const {
      path = `pipelines/${pipelineName}/pipelines.json`,
      format = 'json',
      envPrefix = pipelineName.toUpperCase(),
      mergeWithEnvironment = true
    } = options;
    
    // Load base configuration
    const baseConfig = await this.loadConfigFile(path, format);
    
    // Merge with environment variables
    if (mergeWithEnvironment) {
      const envConfig = this.loadFromEnvironment(envPrefix);
      this.config = this.mergeConfigurations(baseConfig, envConfig);
    } else {
      this.config = baseConfig;
    }
    
    // Validate configuration
    this.validateConfiguration(this.config);
    
    return this.config;
  }
  
  get<T = any>(key: string, defaultValue?: T): T {
    const keys = key.split('.');
    let current: any = this.config;
    
    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        return defaultValue as T;
      }
    }
    
    return current as T;
  }
  
  set(key: string, value: any): void {
    const keys = key.split('.');
    let current: any = this.config;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!(k in current)) {
        current[k] = {};
      }
      current = current[k];
    }
    
    current[keys[keys.length - 1]] = value;
    this.notifyWatchers();
  }
  
  watch(callback: () => void): () => void {
    this.watchers.push(callback);
    return () => {
      const index = this.watchers.indexOf(callback);
      if (index >= 0) {
        this.watchers.splice(index, 1);
      }
    };
  }
  
  private async loadConfigFile(path: string, format: string): Promise<any> {
    try {
      const content = await fs.readFile(path, 'utf8');
      
      switch (format) {
        case 'json':
          return JSON.parse(content);
        case 'yaml':
          const yaml = await import('yaml');
          return yaml.parse(content);
        case 'toml':
          const toml = await import('@iarna/toml');
          return toml.parse(content);
        default:
          throw new Error(`Unsupported config format: ${format}`);
      }
    } catch (error) {
      throw new ConfigurationError(`Failed to load config from ${path}: ${error.message}`, path);
    }
  }
  
  private loadFromEnvironment(prefix: string): Record<string, any> {
    const config: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(process.env)) {
      if (key.startsWith(prefix + '_')) {
        const configKey = key.substring(prefix.length + 1).toLowerCase();
        const configValue = this.parseEnvironmentValue(value);
        config[configKey] = configValue;
      }
    }
    
    return config;
  }
  
  private parseEnvironmentValue(value: string | undefined): any {
    if (!value) return undefined;
    
    // Try parsing as JSON
    if (value.startsWith('{') || value.startsWith('[')) {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    
    // Try parsing as number
    if (/^\d+$/.test(value)) {
      return parseInt(value, 10);
    }
    
    // Try parsing as boolean
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
    
    return value;
  }
  
  private mergeConfigurations(base: any, override: any): any {
    return this.deepMerge(base, override);
  }
  
  private deepMerge(target: any, source: any): any {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }
  
  private validateConfiguration(config: PipelineConfiguration): void {
    if (!config.name) {
      throw new ConfigurationError('Pipeline name is required');
    }
    
    if (!config.version) {
      throw new ConfigurationError('Pipeline version is required');
    }
    
    if (!Array.isArray(config.steps)) {
      throw new ConfigurationError('Pipeline steps must be an array');
    }
    
    // Additional validation can be added here
  }
  
  private notifyWatchers(): void {
    this.watchers.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Config watcher error:', error);
      }
    });
  }
}
```

## Migration Strategy

### Phase 1: Core Infrastructure (Week 1)
1. **Create base pipeline step abstraction**
2. **Implement shared utilities**
3. **Create configuration management**
4. **Set up testing framework**

### Phase 2: Pipeline Migration (Week 2-3)
1. **Migrate boardrev pipeline** to use shared abstractions
2. **Migrate simtask pipeline** to use shared abstractions
3. **Migrate sonarflow pipeline** to use shared abstractions
4. **Migrate readmeflow pipeline** to use shared abstractions

### Phase 3: Advanced Features (Week 4)
1. **Implement pipeline orchestrator**
2. **Add performance monitoring**
3. **Create pipeline templates**
4. **Add integration testing**

## Benefits

### Code Quality
- **80% reduction** in code duplication
- **Standardized patterns** across all pipelines
- **Improved type safety** with runtime validation
- **Consistent error handling** and logging

### Maintainability
- **Single source of truth** for common functionality
- **Easier testing** with shared abstractions
- **Simplified onboarding** for new pipeline developers
- **Reduced cognitive load** when working with multiple pipelines

### Performance
- **Optimized file operations** with atomic writes
- **Efficient batch processing** with concurrency control
- **Smart caching** with TTL and invalidation
- **Resource management** with proper cleanup

### Developer Experience
- **Consistent APIs** across all pipelines
- **Better error messages** with context and suggestions
- **Configuration validation** with helpful error messages
- **Rich debugging information** with structured logging

## Testing Strategy

### Unit Tests
- [ ] Base pipeline step test coverage > 95%
- [ ] Shared utilities test coverage > 90%
- [ ] Configuration management test coverage > 90%
- [ ] Error handling test coverage > 95%

### Integration Tests
- [ ] End-to-end pipeline execution tests
- [ ] Configuration loading and validation tests
- [ ] Error recovery and retry tests
- [ ] Performance benchmark tests

### Migration Tests
- [ ] Backward compatibility tests
- [ ] Configuration migration tests
- [ ] Pipeline output consistency tests
- [ ] Performance regression tests

## Success Metrics

### Code Duplication
- [ ] Reduce duplicate code by 80%
- [ ] Increase shared utility usage to 90%
- [ ] Standardize error handling across all pipelines

### Performance
- [ ] 50% improvement in file processing speed
- [ ] 40% reduction in memory usage
- [ ] Improved error recovery time by 60%

### Developer Experience
- [ ] Reduce onboarding time for new pipeline developers by 70%
- [ ] Improve error message clarity and actionability
- [ ] Achieve 95% test coverage across shared components

This specification provides a comprehensive foundation for eliminating code duplication and improving maintainability across the entire pipeline ecosystem.