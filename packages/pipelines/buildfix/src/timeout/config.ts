/**
 * BuildFix timeout configuration
 *
 * This module provides centralized timeout configuration for all BuildFix operations.
 * Timeouts are organized by operation type and can be customized per environment.
 */

import type { TimeoutConfig } from './timeout-manager.js';

/**
 * Environment-specific timeout configurations
 */
export const ENVIRONMENT_TIMEOUTS: Record<string, Partial<TimeoutConfig>> = {
  // Development environment - shorter timeouts for faster feedback
  development: {
    default: 15000, // 15 seconds
    process: 30000, // 30 seconds
    ollama: 60000, // 1 minute
    tsc: 60000, // 1 minute
    git: 30000, // 30 seconds
    fileIO: 10000, // 10 seconds
    buildfix: 300000, // 5 minutes
    benchmark: 600000, // 10 minutes
  },

  // Production environment - balanced timeouts
  production: {
    default: 30000, // 30 seconds
    process: 60000, // 1 minute
    ollama: 120000, // 2 minutes
    tsc: 180000, // 3 minutes
    git: 90000, // 1.5 minutes
    fileIO: 30000, // 30 seconds
    buildfix: 600000, // 10 minutes
    benchmark: 1800000, // 30 minutes
  },

  // CI/CD environment - longer timeouts for resource-constrained environments
  ci: {
    default: 60000, // 1 minute
    process: 120000, // 2 minutes
    ollama: 300000, // 5 minutes
    tsc: 300000, // 5 minutes
    git: 180000, // 3 minutes
    fileIO: 60000, // 1 minute
    buildfix: 1200000, // 20 minutes
    benchmark: 3600000, // 1 hour
  },

  // Testing environment - very short timeouts for fast test execution
  test: {
    default: 5000, // 5 seconds
    process: 10000, // 10 seconds
    ollama: 15000, // 15 seconds
    tsc: 15000, // 15 seconds
    git: 10000, // 10 seconds
    fileIO: 5000, // 5 seconds
    buildfix: 60000, // 1 minute
    benchmark: 120000, // 2 minutes
  },
};

/**
 * Model-specific timeout configurations
 */
export const MODEL_TIMEOUTS: Record<string, Partial<TimeoutConfig>> = {
  // Fast models
  'qwen3:4b': {
    ollama: 30000, // 30 seconds
  },
  'qwen3:8b': {
    ollama: 45000, // 45 seconds
  },

  // Medium models
  'qwen3:14b': {
    ollama: 60000, // 1 minute
  },
  'qwen3:32b': {
    ollama: 90000, // 1.5 minutes
  },

  // Large models
  'qwen3:72b': {
    ollama: 120000, // 2 minutes
  },
  'gpt-oss:20b-cloud': {
    ollama: 120000, // 2 minutes
  },

  // Very large models
  'llama3:70b': {
    ollama: 180000, // 3 minutes
  },
  'codellama:70b': {
    ollama: 180000, // 3 minutes
  },
};

/**
 * Operation-specific timeout configurations
 */
export const OPERATION_TIMEOUTS: Record<string, Partial<TimeoutConfig>> = {
  // Error collection operations
  'error-collection': {
    tsc: 120000, // 2 minutes for TypeScript compilation
    fileIO: 30000, // 30 seconds for file operations
  },

  // Plan generation operations
  'plan-generation': {
    ollama: 180000, // 3 minutes for LLM planning
    fileIO: 15000, // 15 seconds for file operations
  },

  // Code application operations
  'code-application': {
    process: 90000, // 1.5 minutes for snippet application
    fileIO: 30000, // 30 seconds for file operations
  },

  // Validation operations
  validation: {
    tsc: 120000, // 2 minutes for TypeScript compilation
    fileIO: 15000, // 15 seconds for file operations
  },

  // Benchmark operations
  benchmark: {
    buildfix: 1800000, // 30 minutes for entire benchmark
    ollama: 300000, // 5 minutes per LLM call
    tsc: 300000, // 5 minutes per compilation
  },
};

/**
 * Get the current environment
 */
export function getCurrentEnvironment(): string {
  const nodeEnv = process.env.NODE_ENV;
  const buildfixEnv = process.env.BUILDFIX_ENV;

  return buildfixEnv || nodeEnv || 'development';
}

/**
 * Get timeout configuration for the current environment
 */
export function getEnvironmentTimeouts(): Partial<TimeoutConfig> {
  const env = getCurrentEnvironment();
  return ENVIRONMENT_TIMEOUTS[env] || ENVIRONMENT_TIMEOUTS.development!;
}

/**
 * Get timeout configuration for a specific model
 */
export function getModelTimeouts(model: string): Partial<TimeoutConfig> {
  // Check for exact model match
  if (MODEL_TIMEOUTS[model]) {
    return MODEL_TIMEOUTS[model];
  }

  // Check for partial model match (e.g., 'qwen3' matches 'qwen3:4b')
  const modelPrefix = model ? model.split(':')[0] : '';
  if (modelPrefix) {
    for (const [modelName, timeouts] of Object.entries(MODEL_TIMEOUTS)) {
      if (modelName.startsWith(modelPrefix)) {
        return timeouts;
      }
    }
  }

  return {};
}

/**
 * Get timeout configuration for a specific operation
 */
export function getOperationTimeouts(operation: string): Partial<TimeoutConfig> {
  return OPERATION_TIMEOUTS[operation] || {};
}

/**
 * Build complete timeout configuration
 */
export function buildTimeoutConfig(options: {
  model?: string;
  operation?: string;
  customTimeouts?: Partial<TimeoutConfig>;
}): TimeoutConfig {
  const { model, operation, customTimeouts } = options;

  // Start with environment defaults
  const environmentTimeouts = getEnvironmentTimeouts();

  // Apply model-specific timeouts
  const modelTimeouts = model ? getModelTimeouts(model) : {};

  // Apply operation-specific timeouts
  const operationTimeouts = operation ? getOperationTimeouts(operation) : {};

  // Apply custom timeouts (highest priority)
  const custom = customTimeouts || {};

  // Merge all configurations (later configs override earlier ones)
  const mergedConfig: TimeoutConfig = {
    // Default values
    default: 30000,
    process: 60000,
    ollama: 120000,
    tsc: 180000,
    git: 90000,
    fileIO: 30000,
    buildfix: 600000,
    benchmark: 1800000,

    // Apply overrides in order of precedence
    ...environmentTimeouts,
    ...modelTimeouts,
    ...operationTimeouts,
    ...custom,
  };

  return mergedConfig;
}

/**
 * Validate timeout configuration
 */
export function validateTimeoutConfig(config: Partial<TimeoutConfig>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check for negative values
  for (const [key, value] of Object.entries(config)) {
    if (typeof value === 'number' && value <= 0) {
      errors.push(`Timeout ${key} must be positive, got ${value}`);
    }
  }

  // Check for reasonable ranges
  if (config.ollama && config.ollama > 600000) {
    errors.push('Ollama timeout should not exceed 10 minutes for good user experience');
  }

  if (config.buildfix && config.buildfix > 3600000) {
    errors.push('BuildFix timeout should not exceed 1 hour to prevent hanging');
  }

  if (config.tsc && config.tsc > 600000) {
    errors.push('TypeScript compilation timeout should not exceed 10 minutes');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get recommended timeouts for different scenarios
 */
export const RECOMMENDED_TIMEOUTS = {
  // Quick development iteration
  quickIteration: {
    default: 10000,
    ollama: 30000,
    tsc: 30000,
    buildfix: 120000,
  },

  // Standard development
  standardDevelopment: {
    default: 30000,
    ollama: 60000,
    tsc: 60000,
    buildfix: 300000,
  },

  // Large codebase
  largeCodebase: {
    default: 60000,
    ollama: 120000,
    tsc: 180000,
    buildfix: 600000,
  },

  // CI/CD pipeline
  ciPipeline: {
    default: 60000,
    ollama: 300000,
    tsc: 300000,
    buildfix: 1200000,
  },
} as const;
