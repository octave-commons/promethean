/**
 * Core platform interface for cross-platform compatibility layer
 * Defines the contract for platform detection and capability management
 */

import { PlatformCapabilities } from '../models/Capabilities';
import { FeatureSet } from '../models/Capabilities';
import { RuntimeInfo } from '../models/RuntimeInfo';
import { RuntimeEnvironment } from '../models/RuntimeInfo';

/**
 * Main platform interface that provides platform detection,
 * capability management, and runtime information
 */
export interface IPlatform {
  /** Platform name (e.g., 'node', 'browser', 'deno', 'edge') */
  readonly name: string;

  /** Platform version string */
  readonly version: string;

  /** System architecture (e.g., 'x64', 'arm64', 'wasm32') */
  readonly architecture: string;

  /** Runtime environment type */
  readonly runtime: RuntimeEnvironment;

  /**
   * Get platform capabilities
   * @returns PlatformCapabilities object containing supported features
   */
  getCapabilities(): PlatformCapabilities;

  /**
   * Detect available features on the current platform
   * @returns Promise resolving to FeatureSet with detected features
   */
  detectFeatures(): Promise<FeatureSet>;

  /**
   * Get detailed runtime information
   * @returns RuntimeInfo object with detailed runtime data
   */
  getRuntimeInfo(): RuntimeInfo;

  /**
   * Check if a specific feature is supported
   * @param featureName Name of the feature to check
   * @returns boolean indicating if feature is supported
   */
  supportsFeature(featureName: string): boolean;

  /**
   * Get platform-specific configuration
   * @returns Object containing platform-specific settings
   */
  getConfiguration(): Record<string, unknown>;
}
