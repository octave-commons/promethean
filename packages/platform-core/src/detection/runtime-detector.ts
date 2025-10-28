/**
 * Runtime detection utilities for cross-platform compatibility layer
 * Provides functions to detect the current runtime environment
 */

import { RuntimeEnvironment } from '../models/RuntimeInfo.js';

/**
 * Runtime detection result interface
 */
export interface RuntimeDetectionResult {
  /** Detected runtime environment */
  environment: RuntimeEnvironment;

  /** Confidence level in the detection (0-1) */
  confidence: number;

  /** Detection method used */
  method: 'global' | 'process' | 'api' | 'feature' | 'heuristic';

  /** Additional metadata about the detection */
  metadata?: Record<string, unknown>;
}

/**
 * Detect the current runtime environment
 * @returns RuntimeDetectionResult with detected environment
 */
export const detectRuntimeEnvironment = (): RuntimeDetectionResult => {
  // Check for Node.js environment
  const nodeResult = detectNodeEnvironment();
  if (nodeResult.confidence > 0.8) {
    return nodeResult;
  }

  // Check for Deno environment
  const denoResult = detectDenoEnvironment();
  if (denoResult.confidence > 0.8) {
    return denoResult;
  }

  // Check for browser environment
  const browserResult = detectBrowserEnvironment();
  if (browserResult.confidence > 0.8) {
    return browserResult;
  }

  // Check for edge environment
  const edgeResult = detectEdgeEnvironment();
  if (edgeResult.confidence > 0.8) {
    return edgeResult;
  }

  // Fallback to unknown
  return {
    environment: RuntimeEnvironment.UNKNOWN,
    confidence: 0.1,
    method: 'heuristic',
    metadata: { reason: 'Unable to detect runtime environment' },
  };
};

/**
 * Detect Node.js environment
 * @returns RuntimeDetectionResult for Node.js detection
 */
export const detectNodeEnvironment = (): RuntimeDetectionResult => {
  const confidence = calculateNodeConfidence();

  return {
    environment: RuntimeEnvironment.NODE,
    confidence,
    method: confidence > 0.9 ? 'process' : 'global',
    metadata: {
      hasProcess: typeof process !== 'undefined',
      hasGlobal: typeof global !== 'undefined',
      hasRequire: typeof require !== 'undefined',
      hasModule: typeof module !== 'undefined',
      hasExports: typeof exports !== 'undefined',
      processVersion: typeof process !== 'undefined' ? process.version : undefined,
      processPlatform: typeof process !== 'undefined' ? process.platform : undefined,
    },
  };
};

/**
 * Detect Deno environment
 * @returns RuntimeDetectionResult for Deno detection
 */
export const detectDenoEnvironment = (): RuntimeDetectionResult => {
  const confidence = calculateDenoConfidence();
  const hasDeno = typeof globalThis !== 'undefined' && 'Deno' in globalThis;
  const denoGlobal = hasDeno ? (globalThis as any).Deno : undefined;

  return {
    environment: RuntimeEnvironment.DENO,
    confidence,
    method: confidence > 0.9 ? 'global' : 'feature',
    metadata: {
      hasDeno,
      hasDenoVersion: denoGlobal && typeof denoGlobal.version !== 'undefined',
      hasDenoArgs: denoGlobal && typeof denoGlobal.args !== 'undefined',
      denoVersion: denoGlobal?.version?.deno,
    },
  };
};

/**
 * Detect browser environment
 * @returns RuntimeDetectionResult for browser detection
 */
export const detectBrowserEnvironment = (): RuntimeDetectionResult => {
  const confidence = calculateBrowserConfidence();

  return {
    environment: RuntimeEnvironment.BROWSER,
    confidence,
    method: confidence > 0.9 ? 'global' : 'feature',
    metadata: {
      hasWindow: typeof window !== 'undefined',
      hasDocument: typeof document !== 'undefined',
      hasNavigator: typeof navigator !== 'undefined',
      hasLocation: typeof location !== 'undefined',
      hasLocalStorage: typeof localStorage !== 'undefined',
      hasSessionStorage: typeof sessionStorage !== 'undefined',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    },
  };
};

/**
 * Detect edge environment (Cloudflare Workers, Vercel Edge, etc.)
 * @returns RuntimeDetectionResult for edge detection
 */
export const detectEdgeEnvironment = (): RuntimeDetectionResult => {
  const confidence = calculateEdgeConfidence();

  return {
    environment: RuntimeEnvironment.EDGE,
    confidence,
    method: 'feature',
    metadata: {
      hasFetch: typeof fetch !== 'undefined',
      hasRequest: typeof Request !== 'undefined',
      hasResponse: typeof Response !== 'undefined',
      hasHeaders: typeof Headers !== 'undefined',
      hasGlobalThis: typeof globalThis !== 'undefined',
      hasNoWindow: typeof window === 'undefined',
      hasNoDocument: typeof document === 'undefined',
      hasNoProcess: typeof process === 'undefined',
    },
  };
};

/**
 * Calculate confidence level for Node.js detection
 * @returns Confidence level between 0 and 1
 */
const calculateNodeConfidence = (): number => {
  let confidence = 0;

  if (typeof process !== 'undefined') {
    confidence += 0.4;

    if (typeof process.versions !== 'undefined' && process.versions.node) {
      confidence += 0.3;
    }

    if (typeof process.platform !== 'undefined') {
      confidence += 0.2;
    }

    if (typeof process.release !== 'undefined') {
      confidence += 0.1;
    }
  }

  if (typeof global !== 'undefined') {
    confidence += 0.2;
  }

  if (typeof require !== 'undefined') {
    confidence += 0.2;
  }

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    confidence += 0.2;
  }

  if (typeof exports !== 'undefined') {
    confidence += 0.1;
  }

  return Math.min(confidence, 1);
};

/**
 * Calculate confidence level for Deno detection
 * @returns Confidence level between 0 and 1
 */
const calculateDenoConfidence = (): number => {
  let confidence = 0;
  const hasDeno = typeof globalThis !== 'undefined' && 'Deno' in globalThis;
  const denoGlobal = hasDeno ? (globalThis as any).Deno : undefined;

  if (hasDeno) {
    confidence += 0.5;

    if (denoGlobal && typeof denoGlobal.version !== 'undefined') {
      confidence += 0.3;
    }

    if (denoGlobal && typeof denoGlobal.args !== 'undefined') {
      confidence += 0.1;
    }

    if (denoGlobal && typeof denoGlobal.env !== 'undefined') {
      confidence += 0.1;
    }
  }

  // Deno should not have Node.js process object
  if (typeof process === 'undefined') {
    confidence += 0.1;
  }

  return Math.min(confidence, 1);
};

/**
 * Calculate confidence level for browser detection
 * @returns Confidence level between 0 and 1
 */
const calculateBrowserConfidence = (): number => {
  let confidence = 0;

  if (typeof window !== 'undefined') {
    confidence += 0.3;
  }

  if (typeof document !== 'undefined') {
    confidence += 0.3;
  }

  if (typeof navigator !== 'undefined') {
    confidence += 0.2;

    if (typeof navigator.userAgent !== 'undefined') {
      confidence += 0.1;
    }
  }

  if (typeof location !== 'undefined') {
    confidence += 0.1;
  }

  if (typeof localStorage !== 'undefined') {
    confidence += 0.05;
  }

  if (typeof sessionStorage !== 'undefined') {
    confidence += 0.05;
  }

  return Math.min(confidence, 1);
};

/**
 * Calculate confidence level for edge detection
 * @returns Confidence level between 0 and 1
 */
const calculateEdgeConfidence = (): number => {
  let confidence = 0;

  // Edge environments typically have fetch API but no DOM
  if (typeof fetch !== 'undefined') {
    confidence += 0.2;
  }

  if (typeof Request !== 'undefined') {
    confidence += 0.2;
  }

  if (typeof Response !== 'undefined') {
    confidence += 0.2;
  }

  if (typeof Headers !== 'undefined') {
    confidence += 0.2;
  }

  // Edge environments should not have these
  if (typeof window === 'undefined') {
    confidence += 0.1;
  }

  if (typeof document === 'undefined') {
    confidence += 0.1;
  }

  if (typeof process === 'undefined') {
    confidence += 0.1;
  }

  const hasDeno = typeof globalThis !== 'undefined' && 'Deno' in globalThis;
  if (!hasDeno) {
    confidence += 0.1;
  }

  return Math.min(confidence, 1);
};

/**
 * Get runtime-specific global object
 * @returns The appropriate global object for the current runtime
 */
export const getRuntimeGlobal = (): unknown => {
  const detection = detectRuntimeEnvironment();

  switch (detection.environment) {
    case RuntimeEnvironment.NODE:
      return typeof global !== 'undefined' ? global : {};

    case RuntimeEnvironment.BROWSER:
      return typeof window !== 'undefined' ? window : {};

    case RuntimeEnvironment.DENO: {
      const hasDeno = typeof globalThis !== 'undefined' && 'Deno' in globalThis;
      return hasDeno ? (globalThis as any).Deno : {};
    }

    case RuntimeEnvironment.EDGE:
      return typeof globalThis !== 'undefined' ? globalThis : {};

    default:
      return typeof globalThis !== 'undefined' ? globalThis : {};
  }
};

/**
 * Check if the current runtime supports a specific global API
 * @param apiName Name of the global API to check
 * @returns boolean indicating if the API is supported
 */
export const supportsGlobalAPI = (apiName: string): boolean => {
  const globalObj = getRuntimeGlobal() as Record<string, unknown>;
  return typeof globalObj[apiName] !== 'undefined';
};
