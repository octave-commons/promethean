/**
 * Default configurations for DirectoryAdapter
 */
import type { DirectoryAdapterConfig, SecurityOptions } from './types.js';
/**
 * Default security configuration
 */
export declare const DEFAULT_SECURITY_CONFIG: SecurityOptions;
/**
 * Default directory adapter configuration
 */
export declare const DEFAULT_DIRECTORY_ADAPTER_CONFIG: DirectoryAdapterConfig;
/**
 * Development configuration (more permissive)
 */
export declare const DEVELOPMENT_CONFIG: DirectoryAdapterConfig;
/**
 * Production configuration (most secure)
 */
export declare const PRODUCTION_CONFIG: DirectoryAdapterConfig;
/**
 * Test configuration (minimal security, fast operations)
 */
export declare const TEST_CONFIG: DirectoryAdapterConfig;
/**
 * Get configuration by environment
 */
export declare const getConfig: (environment?: "development" | "production" | "test") => DirectoryAdapterConfig;
/**
 * Create custom configuration with overrides
 */
export declare const createConfig: (base?: DirectoryAdapterConfig, overrides?: Partial<DirectoryAdapterConfig>) => DirectoryAdapterConfig;
//# sourceMappingURL=config.d.ts.map