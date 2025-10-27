/**
 * Capability and feature detection models for cross-platform compatibility layer
 * Defines data structures for platform capabilities and feature detection
 */

/**
 * Platform capabilities interface
 * Defines the capabilities and features supported by the current platform
 */
export interface PlatformCapabilities {
  /** Core runtime capabilities */
  runtime: RuntimeCapabilities;

  /** File system capabilities */
  filesystem: FilesystemCapabilities;

  /** Network capabilities */
  network: NetworkCapabilities;

  /** Security capabilities */
  security: SecurityCapabilities;

  /** Performance and monitoring capabilities */
  performance: PerformanceCapabilities;

  /** Platform-specific capabilities */
  platform: PlatformSpecificCapabilities;
}

/**
 * Runtime capabilities
 */
export interface RuntimeCapabilities {
  /** Support for asynchronous operations */
  async: boolean;

  /** Support for promises */
  promises: boolean;

  /** Support for async/await */
  asyncAwait: boolean;

  /** Support for workers/threads */
  workers: boolean;

  /** Support for shared workers */
  sharedWorkers: boolean;

  /** Support for service workers */
  serviceWorkers: boolean;

  /** Support for WebAssembly */
  webassembly: boolean;

  /** Support for WebGL */
  webgl: boolean;

  /** Support for WebGPU */
  webgpu: boolean;

  /** Support for BigInt */
  bigint: boolean;

  /** Support for dynamic imports */
  dynamicImports: boolean;

  /** Support for ES modules */
  esModules: boolean;

  /** Support for CommonJS modules */
  commonjs: boolean;
}

/**
 * File system capabilities
 */
export interface FilesystemCapabilities {
  /** Support for file reading */
  read: boolean;

  /** Support for file writing */
  write: boolean;

  /** Support for directory operations */
  directories: boolean;

  /** Support for file watching */
  watch: boolean;

  /** Support for file streams */
  streams: boolean;

  /** Support for file system events */
  events: boolean;

  /** Support for symbolic links */
  symlinks: boolean;

  /** Support for file permissions */
  permissions: boolean;

  /** Support for file locking */
  locking: boolean;

  /** Support for file system statistics */
  stats: boolean;

  /** Support for temporary files */
  temp: boolean;
}

/**
 * Network capabilities
 */
export interface NetworkCapabilities {
  /** Support for HTTP requests */
  http: boolean;

  /** Support for HTTPS requests */
  https: boolean;

  /** Support for WebSocket */
  websocket: boolean;

  /** Support for WebRTC */
  webrtc: boolean;

  /** Support for TCP sockets */
  tcp: boolean;

  /** Support for UDP sockets */
  udp: boolean;

  /** Support for DNS resolution */
  dns: boolean;

  /** Support for network events */
  events: boolean;

  /** Support for network streams */
  streams: boolean;

  /** Support for network interfaces */
  interfaces: boolean;

  /** Support for network statistics */
  stats: boolean;
}

/**
 * Security capabilities
 */
export interface SecurityCapabilities {
  /** Support for cryptographic operations */
  crypto: boolean;

  /** Support for TLS/SSL */
  tls: boolean;

  /** Support for authentication */
  auth: boolean;

  /** Support for authorization */
  authorization: boolean;

  /** Support for encryption */
  encryption: boolean;

  /** Support for hashing */
  hashing: boolean;

  /** Support for digital signatures */
  signatures: boolean;

  /** Support for certificates */
  certificates: boolean;

  /** Support for secure random */
  secureRandom: boolean;

  /** Support for key management */
  keyManagement: boolean;
}

/**
 * Performance and monitoring capabilities
 */
export interface PerformanceCapabilities {
  /** Support for performance measurement */
  measurement: boolean;

  /** Support for performance monitoring */
  monitoring: boolean;

  /** Support for performance profiling */
  profiling: boolean;

  /** Support for memory profiling */
  memoryProfiling: boolean;

  /** Support for CPU profiling */
  cpuProfiling: boolean;

  /** Support for event loop monitoring */
  eventLoopMonitoring: boolean;

  /** Support for garbage collection monitoring */
  gcMonitoring: boolean;

  /** Support for performance marks */
  marks: boolean;

  /** Support for performance measures */
  measures: boolean;

  /** Support for performance observers */
  observers: boolean;
}

/**
 * Platform-specific capabilities
 */
export interface PlatformSpecificCapabilities {
  /** Node.js specific capabilities */
  node?: NodeCapabilities;

  /** Browser specific capabilities */
  browser?: BrowserCapabilities;

  /** Deno specific capabilities */
  deno?: DenoCapabilities;

  /** Edge runtime specific capabilities */
  edge?: EdgeCapabilities;
}

/**
 * Node.js specific capabilities
 */
export interface NodeCapabilities {
  /** Support for native modules */
  nativeModules: boolean;

  /** Support for N-API */
  napi: boolean;

  /** Support for worker threads */
  workerThreads: boolean;

  /** Support for child processes */
  childProcesses: boolean;

  /** Support for cluster module */
  cluster: boolean;

  /** Support for inspector/debugger */
  inspector: boolean;

  /** Support for V8 coverage */
  v8Coverage: boolean;

  /** Support for process reporting */
  reporting: boolean;

  /** Support for policy */
  policy: boolean;

  /** Support for permissions */
  permissions: boolean;
}

/**
 * Browser specific capabilities
 */
export interface BrowserCapabilities {
  /** Support for DOM manipulation */
  dom: boolean;

  /** Support for CSS manipulation */
  css: boolean;

  /** Support for HTML5 APIs */
  html5: boolean;

  /** Support for Geolocation API */
  geolocation: boolean;

  /** Support for Notifications API */
  notifications: boolean;

  /** Support for Push API */
  push: boolean;

  /** Support for Payment Request API */
  payment: boolean;

  /** Support for Credential Management API */
  credentials: boolean;

  /** Support for Web Authentication API */
  webauthn: boolean;

  /** Support for Screen Orientation API */
  screenOrientation: boolean;
}

/**
 * Deno specific capabilities
 */
export interface DenoCapabilities {
  /** Support for Deno permissions */
  permissions: boolean;

  /** Support for Deno KV */
  kv: boolean;

  /** Support for Deno Cron */
  cron: boolean;

  /** Support for Deno Deploy */
  deploy: boolean;

  /** Support for Deno test runner */
  test: boolean;

  /** Support for Deno lint */
  lint: boolean;

  /** Support for Deno fmt */
  fmt: boolean;

  /** Support for Deno info */
  info: boolean;

  /** Support for Deno cache */
  cache: boolean;

  /** Support for Deno compile */
  compile: boolean;
}

/**
 * Edge runtime specific capabilities
 */
export interface EdgeCapabilities {
  /** Support for edge KV storage */
  kv: boolean;

  /** Support for edge Durable Objects */
  durableObjects: boolean;

  /** Support for edge R2 storage */
  r2: boolean;

  /** Support for edge D1 database */
  d1: boolean;

  /** Support for edge AI/ML */
  ai: boolean;

  /** Support for edge streaming */
  streaming: boolean;

  /** Support for edge caching */
  caching: boolean;

  /** Support for edge logging */
  logging: boolean;

  /** Support for edge metrics */
  metrics: boolean;

  /** Support for edge tracing */
  tracing: boolean;
}

/**
 * Feature detection result
 */
export interface FeatureResult {
  /** Feature name */
  name: string;

  /** Whether the feature is supported */
  supported: boolean;

  /** Feature version (if applicable) */
  version?: string;

  /** Additional metadata about the feature */
  metadata?: Record<string, unknown>;

  /** Confidence level in the detection (0-1) */
  confidence: number;

  /** Detection method used */
  method: 'api' | 'property' | 'function' | 'event' | 'other';
}

/**
 * Feature set containing multiple feature detection results
 */
export interface FeatureSet {
  /** Array of feature detection results */
  features: FeatureResult[];

  /** Timestamp when features were detected */
  timestamp: number;

  /** Platform environment where features were detected */
  environment: string;

  /** Detection summary statistics */
  summary: {
    total: number;
    supported: number;
    unsupported: number;
    unknown: number;
  };
}
