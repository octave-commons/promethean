/**
 * Feature registry for cross-platform compatibility layer
 * Manages registration and detection of platform features
 */

import { FeatureResult, FeatureSet } from '../models/Capabilities.js';
import { RuntimeEnvironment } from '../models/RuntimeInfo.js';

/**
 * Feature detector function type
 */
export type FeatureDetector = () => FeatureResult;

/**
 * Feature registry configuration
 */
export interface FeatureRegistryConfig {
  /** Enable caching of feature detection results */
  enableCaching: boolean;

  /** Cache TTL in milliseconds */
  cacheTTL: number;

  /** Enable lazy detection (detect on first access) */
  enableLazyDetection: boolean;
}

/**
 * Feature registry interface
 */
export interface IFeatureRegistry {
  /**
   * Register a feature detector
   * @param name Feature name
   * @param detector Function to detect the feature
   * @param category Optional feature category
   */
  registerDetector(name: string, detector: FeatureDetector, category?: string): void;

  /**
   * Unregister a feature detector
   * @param name Feature name
   */
  unregisterDetector(name: string): void;

  /**
   * Detect a specific feature
   * @param name Feature name
   * @returns Feature detection result
   */
  detectFeature(name: string): FeatureResult;

  /**
   * Detect all registered features
   * @returns Feature set with all detection results
   */
  detectAllFeatures(): FeatureSet;

  /**
   * Get list of registered feature names
   * @returns Array of feature names
   */
  getRegisteredFeatures(): readonly string[];

  /**
   * Check if a feature is registered
   * @param name Feature name
   * @returns boolean indicating if feature is registered
   */
  hasFeature(name: string): boolean;

  /**
   * Clear feature detection cache
   */
  clearCache(): void;

  /**
   * Get feature categories
   * @returns Record of category to feature names
   */
  getCategories(): Record<string, readonly string[]>;
}

/**
 * Default feature registry implementation
 */
export class FeatureRegistry implements IFeatureRegistry {
  private readonly detectors = new Map<string, FeatureDetector>();
  private readonly categories = new Map<string, Set<string>>();
  private readonly cache = new Map<string, FeatureResult>();
  private readonly config: FeatureRegistryConfig;

  constructor(config: Partial<FeatureRegistryConfig> = {}) {
    this.config = {
      enableCaching: true,
      cacheTTL: 5 * 60 * 1000, // 5 minutes
      enableLazyDetection: false,
      ...config,
    };
  }

  registerDetector(name: string, detector: FeatureDetector, category?: string): void {
    this.detectors.set(name, detector);

    if (category) {
      if (!this.categories.has(category)) {
        this.categories.set(category, new Set());
      }
      this.categories.get(category)!.add(name);
    }
  }

  unregisterDetector(name: string): void {
    this.detectors.delete(name);
    this.cache.delete(name);

    // Remove from categories
    for (const [category, features] of this.categories.entries()) {
      features.delete(name);
      if (features.size === 0) {
        this.categories.delete(category);
      }
    }
  }

  detectFeature(name: string): FeatureResult {
    const detector = this.detectors.get(name);
    if (!detector) {
      return {
        name,
        supported: false,
        confidence: 0,
        method: 'other',
        metadata: { error: 'Feature detector not found' },
      };
    }

    // Check cache first
    if (this.config.enableCaching) {
      const cached = this.cache.get(name);
      if (cached && this.isCacheValid(cached)) {
        return cached;
      }
    }

    // Detect feature
    let result: FeatureResult;
    try {
      result = detector();
    } catch (error) {
      result = {
        name,
        supported: false,
        confidence: 0,
        method: 'other',
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
          originalError: error instanceof Error ? error.stack : String(error),
        },
      };
    }

    // Cache result with timestamp
    if (this.config.enableCaching) {
      const cachedResult = {
        ...result,
        metadata: {
          ...result.metadata,
          ['cacheTime']: Date.now(),
        },
      };
      this.cache.set(name, cachedResult);
    }

    return result;
  }

  detectAllFeatures(): FeatureSet {
    const features: FeatureResult[] = [];
    let supported = 0;
    let unsupported = 0;
    let unknown = 0;

    for (const name of this.detectors.keys()) {
      const result = this.detectFeature(name);
      features.push(result);

      if (result.supported) {
        supported++;
      } else if (result.confidence > 0.5) {
        unsupported++;
      } else {
        unknown++;
      }
    }

    return {
      features,
      timestamp: Date.now(),
      environment: this.getCurrentEnvironment(),
      summary: {
        total: features.length,
        supported,
        unsupported,
        unknown,
      },
    };
  }

  getRegisteredFeatures(): readonly string[] {
    return Array.from(this.detectors.keys());
  }

  hasFeature(name: string): boolean {
    return this.detectors.has(name);
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCategories(): Record<string, readonly string[]> {
    const result: Record<string, readonly string[]> = {};

    for (const [category, features] of this.categories.entries()) {
      result[category] = Array.from(features);
    }

    return result;
  }

  /**
   * Check if cached result is still valid
   * @param result Cached feature result
   * @returns boolean indicating if cache is valid
   */
  private isCacheValid(result: FeatureResult): boolean {
    const cacheAge = Date.now() - ((result.metadata?.['cacheTime'] as number) || 0);
    return cacheAge < this.config.cacheTTL;
  }

  /**
   * Get current runtime environment
   * @returns Runtime environment string
   */
  private getCurrentEnvironment(): string {
    // Simple environment detection - could be enhanced
    if (typeof process !== 'undefined' && process.versions?.node) {
      return RuntimeEnvironment.NODE;
    }
    if (typeof globalThis !== 'undefined' && 'Deno' in globalThis) {
      return RuntimeEnvironment.DENO;
    }
    if (typeof window !== 'undefined') {
      return RuntimeEnvironment.BROWSER;
    }
    return RuntimeEnvironment.UNKNOWN;
  }
}

/**
 * Create a feature registry with default configuration
 * @param config Optional configuration overrides
 * @returns New feature registry instance
 */
export const createFeatureRegistry = (
  config?: Partial<FeatureRegistryConfig>,
): IFeatureRegistry => {
  return new FeatureRegistry(config);
};

/**
 * Global feature registry instance
 */
export const globalFeatureRegistry = createFeatureRegistry();
