# Pipeline Code Smells Remediation Specification

## Overview

This specification addresses critical code smells identified in the @pipelines/ directory to improve code quality, maintainability, security, and performance across all pipeline implementations.

## Critical Issues (High Priority)

### 1. Shared CLI Utilities Extraction

**Problem**: Each pipeline reimplements its own argument parsing logic, leading to code duplication and inconsistency.

**Solution**: Create standardized CLI utilities in `pipelines/core/`.

#### Implementation Plan

1. **Create `pipelines/core/src/cli/` directory** with:
   - `argument-parser.ts` - Standardized argument parsing
   - `command-builder.ts` - Command construction utilities
   - `validation.ts` - Input validation utilities

2. **Standardized CLI Interface**:
```typescript
// pipelines/core/src/cli/types.ts
export interface PipelineArgs {
  [key: string]: string | number | boolean;
}

export interface PipelineConfig<T extends PipelineArgs> {
  defaults: T;
  description?: string;
  binaryName: string;
  environment?: Record<string, string>;
}

export interface CommandDefinition<T extends PipelineArgs> {
  name: string;
  description: string;
  config: PipelineConfig<T>;
  handler: (args: T) => Promise<void>;
}
```

3. **Migration Steps**:
   - Update `pipelines/boardrev` to use shared CLI
   - Update `pipelines/simtask` to use shared CLI
   - Update `pipelines/sonarflow` to use shared CLI
   - Update `pipelines/readmeflow` to use shared CLI
   - Update `pipelines/semverguard` to use shared CLI

**Acceptance Criteria**:
- [ ] All pipelines use shared CLI utilities
- [ ] Consistent argument parsing across pipelines
- [ ] Reduced code duplication by 80%
- [ ] All CLI tests pass

### 2. Standardized Error Handling

**Problem**: Inconsistent error handling patterns across pipelines (logger.error vs console.error + process.exit).

**Solution**: Create standardized error handling with custom error classes.

#### Implementation Plan

1. **Create `pipelines/core/src/errors/` directory** with:
   - `pipeline-error.ts` - Custom error classes
   - `error-handler.ts` - Standardized error handling
   - `error-codes.ts` - Error code constants

2. **Standardized Error Classes**:
```typescript
// pipelines/core/src/errors/pipeline-error.ts
export class PipelineError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly exitCode: number = 1,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'PipelineError';
  }
}

export class ValidationError extends PipelineError {
  constructor(message: string, field: string, value: unknown) {
    super(message, 'VALIDATION_ERROR', 2, { field, value });
  }
}

export class ConfigurationError extends PipelineError {
  constructor(message: string, configPath?: string) {
    super(message, 'CONFIG_ERROR', 3, { configPath });
  }
}
```

3. **Standardized Error Handler**:
```typescript
// pipelines/core/src/errors/error-handler.ts
export class ErrorHandler {
  constructor(private readonly logger: Logger) {}
  
  handle(error: unknown, context?: string): never {
    if (error instanceof PipelineError) {
      this.logger.error(`${error.code}: ${error.message}`, {
        context,
        exitCode: error.exitCode,
        errorContext: error.context
      });
      process.exit(error.exitCode);
    }
    
    const message = error instanceof Error ? error.message : String(error);
    this.logger.error(`Unexpected error: ${message}`, { context });
    process.exit(1);
  }
}
```

**Acceptance Criteria**:
- [ ] All pipelines use standardized error handling
- [ ] Consistent error logging format
- [ ] Proper error codes and context
- [ ] Graceful error recovery where possible

### 3. Environment Variable Security

**Problem**: Direct environment variable access without validation, creating security vulnerabilities.

**Solution**: Implement secure environment variable handling with validation.

#### Implementation Plan

1. **Create `pipelines/core/src/config/` directory** with:
   - `environment.ts` - Environment variable validation
   - `config-loader.ts` - Configuration loading utilities
   - `schema-validation.ts` - Runtime validation schemas

2. **Secure Environment Handling**:
```typescript
// pipelines/core/src/config/environment.ts
export interface EnvironmentConfig {
  SONAR_HOST_URL?: string;
  SONAR_TOKEN?: string;
  SONAR_PROJECT_KEY?: string;
  OLLAMA_URL?: string;
  OPENAI_API_KEY?: string;
  NODE_ENV?: string;
}

export interface RequiredEnvironmentConfig {
  SONAR_HOST_URL: string;
  SONAR_TOKEN: string;
  SONAR_PROJECT_KEY: string;
}

export class EnvironmentManager {
  private static instance: EnvironmentManager;
  private config: EnvironmentConfig;
  
  private constructor() {
    this.config = this.validateAndLoad();
  }
  
  static getInstance(): EnvironmentManager {
    if (!EnvironmentManager.instance) {
      EnvironmentManager.instance = new EnvironmentManager();
    }
    return EnvironmentManager.instance;
  }
  
  private validateAndLoad(): EnvironmentConfig {
    const config: Partial<EnvironmentConfig> = {};
    const errors: string[] = [];
    
    // Validate required variables
    for (const key of ['SONAR_HOST_URL', 'SONAR_TOKEN', 'SONAR_PROJECT_KEY']) {
      const value = process.env[key];
      if (!value) {
        errors.push(`Missing required environment variable: ${key}`);
      } else {
        // Basic validation
        if (key.includes('URL') && !this.isValidUrl(value)) {
          errors.push(`Invalid URL format for ${key}: ${value}`);
        } else {
          config[key as keyof EnvironmentConfig] = value;
        }
      }
    }
    
    // Validate optional variables
    const optionalVars = ['OLLAMA_URL', 'OPENAI_API_KEY', 'NODE_ENV'];
    for (const key of optionalVars) {
      const value = process.env[key];
      if (value) {
        if (key.includes('URL') && !this.isValidUrl(value)) {
          errors.push(`Invalid URL format for ${key}: ${value}`);
        } else {
          config[key as keyof EnvironmentConfig] = value;
        }
      }
    }
    
    if (errors.length > 0) {
      throw new ConfigurationError(
        `Environment validation failed: ${errors.join(', ')}`,
        'environment'
      );
    }
    
    return config as EnvironmentConfig;
  }
  
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
  
  get<K extends keyof EnvironmentConfig>(key: K): EnvironmentConfig[K] {
    return this.config[key];
  }
  
  require<K extends keyof RequiredEnvironmentConfig>(key: K): RequiredEnvironmentConfig[K] {
    const value = this.config[key];
    if (!value) {
      throw new ConfigurationError(`Required environment variable ${key} is not set`);
    }
    return value;
  }
}
```

**Acceptance Criteria**:
- [ ] All environment variables validated before use
- [ ] Secure URL validation for all URL variables
- [ ] Proper error messages for missing/invalid variables
- [ ] Environment variable documentation updated

## Medium Priority Issues

### 4. Standardized Naming Conventions

**Problem**: Inconsistent naming across packages, binaries, and functions.

**Solution**: Establish and enforce naming conventions.

#### Implementation Plan

1. **Create `pipelines/core/src/conventions/` directory** with:
   - `naming.ts` - Naming convention definitions
   - `validators.ts` - Naming convention validators
   - `generators.ts` - Name generation utilities

2. **Naming Convention Standards**:
```typescript
// pipelines/core/src/conventions/naming.ts
export const NAMING_CONVENTIONS = {
  packages: {
    pattern: '<domain>-<action>',
    examples: ['code-scan', 'board-review', 'quality-analyze'],
    validation: /^[a-z]+-[a-z]+$/,
    description: 'Domain-action pattern for package names'
  },
  binaries: {
    pattern: '<domain>-<step>-<action>',
    examples: ['code-scan-collect', 'board-review-ensure', 'quality-fetch'],
    validation: /^[a-z]+-[a-z]+-[a-z]+$/,
    description: 'Domain-step-action pattern for binary names'
  },
  functions: {
    pattern: '<verb><Noun>',
    examples: ['collectFiles', 'ensureFrontmatter', 'fetchIssues'],
    validation: /^[a-z]+[A-Z][a-z]+$/,
    description: 'VerbNoun pattern for function names'
  },
  files: {
    pattern: '<step>-<purpose>.ts',
    examples: ['01-scan.ts', '02-process.ts', '03-generate.ts'],
    validation: /^\d{2}-[a-z]+\.ts$/,
    description: 'Numbered step-purpose pattern for step files'
  },
  directories: {
    pattern: '<purpose>',
    examples: ['steps', 'utils', 'types', 'config'],
    validation: /^[a-z]+$/,
    description: 'Lowercase purpose names for directories'
  }
} as const;

export type NamingConvention = typeof NAMING_CONVENTIONS[keyof typeof NAMING_CONVENTIONS];
```

3. **Migration Plan**:
   - Rename `simtasks` → `similarity-task`
   - Rename `boardrev` → `board-review`
   - Rename `sonarflow` → `quality-analyze`
   - Update all binary names to follow convention
   - Update all function names to follow convention

**Acceptance Criteria**:
- [ ] All package names follow domain-action pattern
- [ ] All binary names follow domain-step-action pattern
- [ ] All function names follow verbNoun pattern
- [ ] All file names follow numbered step-purpose pattern
- [ ] Naming validation tests pass

### 5. Improved File Organization

**Problem**: Inconsistent file organization across pipelines.

**Solution**: Standardize directory structure for all pipelines.

#### Implementation Plan

1. **Standardized Directory Structure**:
```
src/
├── steps/
│   ├── 01-scan/
│   │   ├── index.ts
│   │   ├── types.ts
│   │   ├── utils.ts
│   │   └── tests/
│   ├── 02-process/
│   │   ├── index.ts
│   │   ├── types.ts
│   │   ├── utils.ts
│   │   └── tests/
│   ├── 03-analyze/
│   │   ├── index.ts
│   │   ├── types.ts
│   │   ├── utils.ts
│   │   └── tests/
│   └── 04-generate/
│       ├── index.ts
│       ├── types.ts
│       ├── utils.ts
│       └── tests/
├── shared/
│   ├── types.ts
│   ├── utils.ts
│   ├── config.ts
│   └── tests/
├── cli/
│   ├── index.ts
│   └── commands.ts
└── index.ts
```

2. **Migration Steps**:
   - Reorganize `pipelines/boardrev` with step subdirectories
   - Reorganize `pipelines/simtask` with step subdirectories
   - Reorganize `pipelines/sonarflow` with step subdirectories
   - Create shared utilities directories
   - Update all import paths

**Acceptance Criteria**:
- [ ] All pipelines follow standardized directory structure
- [ ] Step files organized in subdirectories
- [ ] Shared utilities properly separated
- [ ] All import paths updated correctly

### 6. Runtime Type Safety

**Problem**: Missing runtime type validation using type assertions without checks.

**Solution**: Implement comprehensive runtime type validation using Zod.

#### Implementation Plan

1. **Create `pipelines/core/src/validation/` directory** with:
   - `schemas.ts` - Zod schema definitions
   - `validators.ts` - Runtime validation functions
   - `type-guards.ts` - Type guard utilities

2. **Schema Definitions**:
```typescript
// pipelines/core/src/validation/schemas.ts
import { z } from 'zod';

export const SonarIssueSchema = z.object({
  key: z.string(),
  rule: z.string(),
  severity: z.enum(['BLOCKER', 'CRITICAL', 'MAJOR', 'MINOR', 'INFO']),
  type: z.enum(['BUG', 'VULNERABILITY', 'CODE_SMELL', 'SECURITY_HOTSPOT']),
  component: z.string(),
  project: z.string(),
  line: z.number().optional(),
  message: z.string(),
  debt: z.string(),
  tags: z.array(z.string()).optional()
});

export const PackageInfoSchema = z.object({
  name: z.string(),
  version: z.string(),
  description: z.string().optional(),
  dependencies: z.record(z.string()).optional(),
  devDependencies: z.record(z.string()).optional(),
  scripts: z.record(z.string()).optional()
});

export const PipelineConfigSchema = z.object({
  name: z.string(),
  version: z.string(),
  description: z.string().optional(),
  steps: z.array(z.any()),
  environment: z.record(z.string()).optional()
});
```

3. **Validation Functions**:
```typescript
// pipelines/core/src/validation/validators.ts
export class RuntimeValidator {
  static validateSonarIssue(data: unknown): SonarIssue {
    try {
      return SonarIssueSchema.parse(data);
    } catch (error) {
      throw new ValidationError(
        `Invalid Sonar issue data: ${error.message}`,
        'sonarIssue',
        data
      );
    }
  }
  
  static validatePackageInfo(data: unknown): PackageInfo {
    try {
      return PackageInfoSchema.parse(data);
    } catch (error) {
      throw new ValidationError(
        `Invalid package info data: ${error.message}`,
        'packageInfo',
        data
      );
    }
  }
  
  static validateWithSchema<T>(
    schema: z.ZodSchema<T>,
    data: unknown,
    context: string
  ): T {
    try {
      return schema.parse(data);
    } catch (error) {
      throw new ValidationError(
        `Validation failed for ${context}: ${error.message}`,
        context,
        data
      );
    }
  }
}
```

**Acceptance Criteria**:
- [ ] All external data validated with Zod schemas
- [ ] No more type assertions without validation
- [ ] Comprehensive error messages for validation failures
- [ ] Type safety tests pass

## Performance Improvements

### 7. Batch Processing Implementation

**Problem**: Sequential file processing without batching leads to poor performance.

**Solution**: Implement efficient batch processing with concurrency control.

#### Implementation Plan

1. **Create `pipelines/core/src/performance/` directory** with:
   - `batch-processor.ts` - Batch processing utilities
   - `concurrency-controller.ts` - Concurrency management
   - `performance-monitor.ts` - Performance monitoring

2. **Batch Processing Implementation**:
```typescript
// pipelines/core/src/performance/batch-processor.ts
export interface BatchOptions {
  concurrency: number;
  batchSize: number;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

export interface BatchResult<T, E = Error> {
  successful: T[];
  failed: Array<{ item: T; error: E }>;
  totalProcessed: number;
  duration: number;
}

export class BatchProcessor<T, R> {
  constructor(
    private readonly processor: (item: T) => Promise<R>,
    private readonly options: BatchOptions = {
      concurrency: 10,
      batchSize: 50,
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000
    }
  ) {}
  
  async process(items: T[]): Promise<BatchResult<T, R>> {
    const startTime = Date.now();
    const batches = this.chunk(items, this.options.batchSize);
    const successful: R[] = [];
    const failed: Array<{ item: T; error: Error }> = [];
    
    for (const batch of batches) {
      const batchResults = await this.processBatchWithConcurrency(batch);
      
      batchResults.forEach(result => {
        if (result.status === 'fulfilled') {
          successful.push(result.value);
        } else {
          failed.push({
            item: this.getItemFromResult(result.reason),
            error: result.reason
          });
        }
      });
    }
    
    return {
      successful,
      failed,
      totalProcessed: items.length,
      duration: Date.now() - startTime
    };
  }
  
  private async processBatchWithConcurrency(
    batch: T[]
  ): Promise<PromiseSettledResult<R>[]> {
    const concurrentBatch = batch.slice(0, this.options.concurrency);
    return Promise.allSettled(
      concurrentBatch.map(item => 
        this.withRetry(() => this.processor(item))
      )
    );
  }
  
  private async withRetry<T>(
    operation: () => Promise<T>,
    attempts: number = 0
  ): Promise<T> {
    try {
      return await Promise.race([
        operation(),
        this.timeout(this.options.timeout)
      ]);
    } catch (error) {
      if (attempts < this.options.retryAttempts) {
        await this.delay(this.options.retryDelay);
        return this.withRetry(operation, attempts + 1);
      }
      throw error;
    }
  }
  
  private chunk<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
  
  private timeout(ms: number): Promise<never> {
    return new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Operation timeout')), ms)
    );
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  private getItemFromResult(reason: unknown): T {
    // Extract original item from error context
    return (reason as any)?.item || reason as T;
  }
}
```

**Acceptance Criteria**:
- [ ] File processing uses batch operations
- [ ] Configurable concurrency limits
- [ ] Proper error handling and retry logic
- [ ] Performance monitoring and metrics
- [ ] 50%+ improvement in processing speed

## Implementation Timeline

### Phase 1: Critical Issues (Week 1-2)
1. **Shared CLI Utilities** - 3 days
2. **Standardized Error Handling** - 2 days  
3. **Environment Variable Security** - 2 days

### Phase 2: Medium Priority (Week 3-4)
1. **Naming Conventions** - 2 days
2. **File Organization** - 3 days
3. **Runtime Type Safety** - 3 days

### Phase 3: Performance (Week 5-6)
1. **Batch Processing** - 4 days
2. **Performance Monitoring** - 2 days
3. **Integration Testing** - 2 days

## Testing Strategy

### Unit Tests
- [ ] CLI utilities test coverage > 90%
- [ ] Error handling test coverage > 95%
- [ ] Environment validation test coverage > 90%
- [ ] Type validation test coverage > 95%

### Integration Tests  
- [ ] End-to-end pipeline tests
- [ ] Performance benchmark tests
- [ ] Security validation tests
- [ ] Error scenario tests

### Regression Tests
- [ ] All existing pipeline functionality preserved
- [ ] Configuration compatibility maintained
- [ ] Performance improvements verified
- [ ] No breaking changes introduced

## Success Metrics

### Code Quality
- [ ] Reduce code duplication by 80%
- [ ] Improve test coverage by 30%
- [ ] Eliminate all high-severity code smells
- [ ] Standardize naming conventions across all pipelines

### Performance
- [ ] 50%+ improvement in file processing speed
- [ ] 40%+ reduction in memory usage
- [ ] Improved error recovery time
- [ ] Better resource utilization

### Maintainability
- [ ] Consistent error handling across all pipelines
- [ ] Shared utilities reduce maintenance burden
- [ ] Standardized configuration management
- [ ] Improved developer onboarding experience

## Dependencies

### Internal Dependencies
- `@promethean-os/logger` - Standardized logging
- `@promethean-os/utils` - Shared utilities
- `zod` - Runtime type validation

### External Dependencies
- No new external dependencies required
- Leverage existing workspace packages

## Risks and Mitigations

### Breaking Changes
- **Risk**: Pipeline configuration changes may break existing setups
- **Mitigation**: Backward compatibility layer and migration guide

### Performance Regression
- **Risk**: New abstractions may impact performance
- **Mitigation**: Comprehensive benchmarking and optimization

### Adoption Resistance
- **Risk**: Teams may resist new patterns
- **Mitigation**: Gradual migration with clear benefits documentation

## Conclusion

This specification provides a comprehensive roadmap for addressing critical code smells in the @pipelines/ directory. By implementing these changes systematically, we'll achieve:

1. **Improved Code Quality**: Eliminate duplication and inconsistencies
2. **Enhanced Security**: Proper environment variable validation
3. **Better Performance**: Efficient batch processing and concurrency
4. **Increased Maintainability**: Standardized patterns and abstractions
5. **Superior Developer Experience**: Consistent naming and organization

The phased approach ensures minimal disruption while delivering significant improvements to the pipeline ecosystem.