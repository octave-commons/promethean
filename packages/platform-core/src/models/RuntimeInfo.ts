/**
 * Runtime information models for cross-platform compatibility layer
 * Defines data structures for runtime environment detection and information
 */

/**
 * Runtime environment enumeration
 * Identifies the current execution environment
 */
export enum RuntimeEnvironment {
  NODE = 'node',
  BROWSER = 'browser',
  DENO = 'deno',
  EDGE = 'edge',
  UNKNOWN = 'unknown',
}

/**
 * Detailed runtime information structure
 * Contains comprehensive information about the current runtime environment
 */
export interface RuntimeInfo {
  /** Runtime environment type */
  environment: RuntimeEnvironment;

  /** Runtime version string */
  version: string;

  /** System architecture */
  architecture: string;

  /** Platform name */
  platform: string;

  /** Additional runtime-specific metadata */
  metadata: RuntimeMetadata;

  /** Timestamp when this info was captured */
  timestamp: number;
}

/**
 * Runtime metadata interface
 * Contains environment-specific metadata
 */
export interface RuntimeMetadata {
  /** Node.js specific metadata */
  node?: NodeMetadata;

  /** Browser specific metadata */
  browser?: BrowserMetadata;

  /** Deno specific metadata */
  deno?: DenoMetadata;

  /** Edge runtime specific metadata */
  edge?: EdgeMetadata;

  /** Generic metadata for unknown environments */
  generic?: Record<string, unknown>;
}

/**
 * Node.js runtime metadata
 */
export interface NodeMetadata {
  /** Node.js version */
  version: string;

  /** V8 engine version */
  v8Version: string;

  /** Platform (e.g., 'linux', 'darwin', 'win32') */
  platform: string;

  /** Architecture (e.g., 'x64', 'arm64') */
  arch: string;

  /** Node.js release information */
  release?: {
    name: string;
    lts?: boolean;
    sourceUrl?: string;
    headersUrl?: string;
    libUrl?: string;
  };

  /** Process information */
  process?: {
    pid: number;
    ppid: number;
    uid?: number;
    gid?: number;
    execPath: string;
    cwd: string;
  };
}

/**
 * Browser runtime metadata
 */
export interface BrowserMetadata {
  /** User agent string */
  userAgent: string;

  /** Browser name (e.g., 'Chrome', 'Firefox', 'Safari') */
  browserName: string;

  /** Browser version */
  browserVersion: string;

  /** Operating system */
  os: string;

  /** Device information */
  device?: {
    type: 'desktop' | 'mobile' | 'tablet';
    vendor?: string;
    model?: string;
  };

  /** Screen information */
  screen?: {
    width: number;
    height: number;
    colorDepth: number;
    pixelRatio: number;
  };

  /** Feature support */
  features?: {
    webgl: boolean;
    webgpu: boolean;
    webassembly: boolean;
    serviceworkers: boolean;
    sharedworkers: boolean;
    indexeddb: boolean;
    localstorage: boolean;
    sessionstorage: boolean;
    cookies: boolean;
  };
}

/**
 * Deno runtime metadata
 */
export interface DenoMetadata {
  /** Deno version */
  version: string;

  /** TypeScript version */
  typescriptVersion: string;

  /** V8 engine version */
  v8Version: string;

  /** Platform information */
  platform: string;

  /** Architecture */
  arch: string;

  /** Permission status */
  permissions?: {
    read: boolean;
    write: boolean;
    net: boolean;
    env: boolean;
    run: boolean;
    ffi: boolean;
    hrtime: boolean;
  };
}

/**
 * Edge runtime metadata (Cloudflare Workers, Vercel Edge, etc.)
 */
export interface EdgeMetadata {
  /** Edge runtime provider (e.g., 'cloudflare', 'vercel', 'deno-deploy') */
  provider: string;

  /** Runtime version */
  version: string;

  /** Region information */
  region?: string;

  /** Request context information */
  request?: {
    method: string;
    url: string;
    headers: Record<string, string>;
  };

  /** Environment variables */
  env?: Record<string, string>;

  /** Limits and constraints */
  limits?: {
    cpuTime: number;
    memory: number;
    diskSpace: number;
    subrequests: number;
  };
}
