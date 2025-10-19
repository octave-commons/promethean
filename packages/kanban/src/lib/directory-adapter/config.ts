/**
 * Default configurations for DirectoryAdapter
 */

import type { DirectoryAdapterConfig, SecurityOptions } from './types.js';

/**
 * Default security configuration
 */
export const DEFAULT_SECURITY_CONFIG: SecurityOptions = {
  level: 'strict',
  allowedExtensions: ['.md'],
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowPathTraversal: false,
  allowSymlinks: false,
  requireAuthentication: false,
  auditLog: true,
};

/**
 * Default directory adapter configuration
 */
export const DEFAULT_DIRECTORY_ADAPTER_CONFIG: DirectoryAdapterConfig = {
  baseDirectory: 'docs/agile/tasks',
  security: DEFAULT_SECURITY_CONFIG,
  backup: {
    enabled: true,
    directory: 'docs/agile/tasks/backups',
    retentionDays: 30,
    compressionEnabled: true,
    hashVerification: true,
  },
  cache: {
    enabled: true,
    ttl: 24 * 60 * 60 * 1000, // 24 hours
  },
  performance: {
    enableStreaming: true,
    batchSize: 100,
    maxConcurrentOps: 10,
  },
};

/**
 * Development configuration (more permissive)
 */
export const DEVELOPMENT_CONFIG: DirectoryAdapterConfig = {
  ...DEFAULT_DIRECTORY_ADAPTER_CONFIG,
  security: {
    ...DEFAULT_SECURITY_CONFIG,
    level: 'moderate',
    requireAuthentication: false,
  },
  backup: {
    ...DEFAULT_DIRECTORY_ADAPTER_CONFIG.backup,
    retentionDays: 7, // Shorter retention for dev
  },
};

/**
 * Production configuration (most secure)
 */
export const PRODUCTION_CONFIG: DirectoryAdapterConfig = {
  ...DEFAULT_DIRECTORY_ADAPTER_CONFIG,
  security: {
    ...DEFAULT_SECURITY_CONFIG,
    level: 'strict',
    requireAuthentication: true,
    maxFileSize: 5 * 1024 * 1024, // Smaller limit for production
  },
  backup: {
    ...DEFAULT_DIRECTORY_ADAPTER_CONFIG.backup,
    retentionDays: 90, // Longer retention for production
  },
  performance: {
    ...DEFAULT_DIRECTORY_ADAPTER_CONFIG.performance,
    maxConcurrentOps: 5, // More conservative for production
  },
};

/**
 * Test configuration (minimal security, fast operations)
 */
export const TEST_CONFIG: DirectoryAdapterConfig = {
  ...DEFAULT_DIRECTORY_ADAPTER_CONFIG,
  baseDirectory: 'test-data/tasks',
  security: {
    ...DEFAULT_SECURITY_CONFIG,
    level: 'permissive',
    requireAuthentication: false,
    auditLog: false,
  },
  backup: {
    enabled: false,
    directory: 'test-data/backups',
    retentionDays: 1,
    compressionEnabled: false,
    hashVerification: false,
  },
  cache: {
    enabled: false,
    ttl: 60 * 1000, // 1 minute for tests
  },
  performance: {
    enableStreaming: false,
    batchSize: 10,
    maxConcurrentOps: 1,
  },
};

/**
 * Get configuration by environment
 */
export const getConfig = (
  environment: 'development' | 'production' | 'test' = 'development',
): DirectoryAdapterConfig => {
  switch (environment) {
    case 'production':
      return PRODUCTION_CONFIG;
    case 'test':
      return TEST_CONFIG;
    case 'development':
    default:
      return DEVELOPMENT_CONFIG;
  }
};

/**
 * Create custom configuration with overrides
 */
export const createConfig = (
  base: DirectoryAdapterConfig = DEFAULT_DIRECTORY_ADAPTER_CONFIG,
  overrides: Partial<DirectoryAdapterConfig> = {},
): DirectoryAdapterConfig => {
  return {
    ...base,
    ...overrides,
    security: {
      ...base.security,
      ...overrides.security,
    },
    backup: {
      ...base.backup,
      ...overrides.backup,
    },
    cache: {
      ...base.cache,
      ...overrides.cache,
    },
    performance: {
      ...base.performance,
      ...overrides.performance,
    },
  };
};
