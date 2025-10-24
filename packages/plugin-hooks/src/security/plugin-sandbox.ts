import type { HookResult, HookContext } from '../types.js';

/**
 * Security policy for plugin sandbox
 */
export interface SecurityPolicy {
  /** Allowed system calls */
  allowedSystemCalls?: string[];
  /** Allowed file system paths */
  allowedPaths?: string[];
  /** Blocked file system paths */
  blockedPaths?: string[];
  /** Network access restrictions */
  networkPolicy?: {
    allowedDomains?: string[];
    allowedPorts?: number[];
    blockedDomains?: string[];
    blockedPorts?: number[];
  };
  /** Resource limits */
  resourceLimits?: {
    maxMemory?: number; // in MB
    maxCpuTime?: number; // in ms
    maxExecutionTime?: number; // in ms
    maxFileSize?: number; // in bytes
  };
  /** API access restrictions */
  apiRestrictions?: {
    allowedApis?: string[];
    blockedApis?: string[];
    requirePermissions?: string[];
  };
}

/**
 * Sandbox execution context
 */
export interface SandboxContext {
  pluginName: string;
  policy: SecurityPolicy;
  startTime: number;
  memoryUsage: number;
  cpuTime: number;
  networkRequests: number;
  fileOperations: number;
}

/**
 * Violation types
 */
export enum ViolationType {
  SYSTEM_CALL = 'system_call',
  FILE_ACCESS = 'file_access',
  NETWORK_ACCESS = 'network_access',
  RESOURCE_LIMIT = 'resource_limit',
  API_ACCESS = 'api_access',
  EXECUTION_TIME = 'execution_time',
}

/**
 * Security violation record
 */
export interface SecurityViolation {
  type: ViolationType;
  pluginName: string;
  timestamp: number;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details?: Record<string, unknown>;
  blocked: boolean;
}

/**
 * Plugin sandbox for secure execution
 */
export class PluginSandbox {
  private activeSandboxes: Map<string, SandboxContext> = new Map();
  private violations: SecurityViolation[] = [];
  private maxViolations = 100;

  constructor(private defaultPolicy: SecurityPolicy = {}) {}

  /**
   * Create a sandbox for plugin execution
   */
  createSandbox(pluginName: string, policy?: Partial<SecurityPolicy>): SandboxContext {
    const mergedPolicy = { ...this.defaultPolicy, ...policy };

    const context: SandboxContext = {
      pluginName,
      policy: mergedPolicy,
      startTime: Date.now(),
      memoryUsage: 0,
      cpuTime: 0,
      networkRequests: 0,
      fileOperations: 0,
    };

    this.activeSandboxes.set(pluginName, context);
    return context;
  }

  /**
   * Execute a function within sandbox constraints
   */
  async executeInSandbox<T>(
    pluginName: string,
    fn: () => Promise<T> | T,
    context?: Partial<HookContext>,
  ): Promise<T> {
    const sandbox = this.activeSandboxes.get(pluginName);
    if (!sandbox) {
      throw new Error(`No sandbox found for plugin: ${pluginName}`);
    }

    const startTime = Date.now();
    const startMemory = this.getMemoryUsage();

    try {
      // Check resource limits before execution
      this.checkResourceLimits(sandbox);

      // Execute the function with monitoring
      const result = await this.withMonitoring(pluginName, fn);

      // Check resource limits after execution
      const executionTime = Date.now() - startTime;
      const memoryUsed = this.getMemoryUsage() - startMemory;

      if (
        sandbox.policy.resourceLimits?.maxExecutionTime &&
        executionTime > sandbox.policy.resourceLimits.maxExecutionTime
      ) {
        this.recordViolation({
          type: ViolationType.EXECUTION_TIME,
          pluginName,
          timestamp: Date.now(),
          description: `Execution time ${executionTime}ms exceeded limit ${sandbox.policy.resourceLimits.maxExecutionTime}ms`,
          severity: 'high',
          details: { executionTime, limit: sandbox.policy.resourceLimits.maxExecutionTime },
          blocked: true,
        });
        throw new Error(`Plugin execution time exceeded limit`);
      }

      if (
        sandbox.policy.resourceLimits?.maxMemory &&
        memoryUsed > sandbox.policy.resourceLimits.maxMemory * 1024 * 1024
      ) {
        this.recordViolation({
          type: ViolationType.RESOURCE_LIMIT,
          pluginName,
          timestamp: Date.now(),
          description: `Memory usage ${memoryUsed} bytes exceeded limit ${sandbox.policy.resourceLimits.maxMemory}MB`,
          severity: 'high',
          details: { memoryUsed, limit: sandbox.policy.resourceLimits.maxMemory },
          blocked: true,
        });
        throw new Error(`Plugin memory usage exceeded limit`);
      }

      return result;
    } catch (error) {
      // Record any security-related errors
      if (error instanceof SecurityError) {
        this.recordViolation({
          type: ViolationType.SYSTEM_CALL,
          pluginName,
          timestamp: Date.now(),
          description: error.message,
          severity: 'medium',
          details: { originalError: error },
          blocked: true,
        });
      }
      throw error;
    }
  }

  /**
   * Wrap plugin hook handlers with sandbox security
   */
  wrapHookHandler<T, R>(
    pluginName: string,
    handler: (data: T, context: HookContext) => HookResult<R> | Promise<HookResult<R>>,
  ): (data: T, context: HookContext) => Promise<HookResult<R>> {
    return async (data: T, context: HookContext): Promise<HookResult<R>> => {
      try {
        const result = await this.executeInSandbox(
          pluginName,
          () => handler(data, context),
          context,
        );
        return result;
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error : new Error(String(error)),
        };
      }
    };
  }

  /**
   * Monitor function execution for security violations
   */
  private async withMonitoring<T>(pluginName: string, fn: () => Promise<T> | T): Promise<T> {
    const sandbox = this.activeSandboxes.get(pluginName)!;

    // Override global functions to monitor access
    const originalFetch = globalThis.fetch;
    const originalRequire = globalThis.require;

    try {
      // Monitor network requests
      globalThis.fetch = async (...args) => {
        sandbox.networkRequests++;

        const url = args[0] as string;
        if (!this.isNetworkAllowed(sandbox.policy, url)) {
          throw new SecurityError(`Network access to ${url} is not allowed`);
        }

        return originalFetch(...args);
      };

      // Monitor module imports (if in Node.js environment)
      if (typeof globalThis.require !== 'undefined') {
        globalThis.require = (id: string) => {
          if (!this.isModuleAllowed(sandbox.policy, id)) {
            throw new SecurityError(`Module import ${id} is not allowed`);
          }
          return originalRequire(id);
        };
      }

      return await fn();
    } finally {
      // Restore original functions
      globalThis.fetch = originalFetch;
      globalThis.require = originalRequire;
    }
  }

  /**
   * Check if network access is allowed by policy
   */
  private isNetworkAllowed(policy: SecurityPolicy, url: string): boolean {
    if (!policy.networkPolicy) return true;

    const { allowedDomains, blockedDomains, allowedPorts, blockedPorts } = policy.networkPolicy;

    try {
      const parsedUrl = new URL(url);
      const domain = parsedUrl.hostname;
      const port = parsedUrl.port
        ? parseInt(parsedUrl.port)
        : parsedUrl.protocol === 'https:'
          ? 443
          : 80;

      // Check blocked domains
      if (blockedDomains?.some((blocked) => domain.includes(blocked))) {
        return false;
      }

      // Check blocked ports
      if (blockedPorts?.includes(port)) {
        return false;
      }

      // Check allowed domains (if specified)
      if (allowedDomains && allowedDomains.length > 0) {
        if (!allowedDomains.some((allowed) => domain.includes(allowed))) {
          return false;
        }
      }

      // Check allowed ports (if specified)
      if (allowedPorts && allowedPorts.length > 0) {
        if (!allowedPorts.includes(port)) {
          return false;
        }
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if module import is allowed by policy
   */
  private isModuleAllowed(policy: SecurityPolicy, moduleId: string): boolean {
    if (!policy.apiRestrictions) return true;

    const { allowedApis, blockedApis } = policy.apiRestrictions;

    // Check blocked APIs
    if (blockedApis?.some((blocked) => moduleId.includes(blocked))) {
      return false;
    }

    // Check allowed APIs (if specified)
    if (allowedApis && allowedApis.length > 0) {
      if (!allowedApis.some((allowed) => moduleId.includes(allowed))) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check resource limits before execution
   */
  private checkResourceLimits(sandbox: SandboxContext): void {
    const limits = sandbox.policy.resourceLimits;
    if (!limits) return;

    const currentMemory = this.getMemoryUsage();

    if (limits.maxMemory && currentMemory > limits.maxMemory * 1024 * 1024) {
      throw new SecurityError(
        `Memory limit exceeded: ${currentMemory} > ${limits.maxMemory * 1024 * 1024}`,
      );
    }
  }

  /**
   * Get current memory usage (simplified)
   */
  private getMemoryUsage(): number {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage().heapUsed;
    }
    return 0;
  }

  /**
   * Record a security violation
   */
  private recordViolation(violation: SecurityViolation): void {
    this.violations.push(violation);

    // Maintain violation history limit
    if (this.violations.length > this.maxViolations) {
      this.violations = this.violations.slice(-this.maxViolations);
    }

    // Log violation
    console.warn(
      `[SECURITY VIOLATION] ${violation.type}: ${violation.description}`,
      violation.details,
    );
  }

  /**
   * Get security violations for a plugin
   */
  getViolations(pluginName?: string): SecurityViolation[] {
    if (pluginName) {
      return this.violations.filter((v) => v.pluginName === pluginName);
    }
    return [...this.violations];
  }

  /**
   * Get sandbox statistics
   */
  getSandboxStats(pluginName?: string): {
    activeSandboxes: number;
    totalViolations: number;
    violationsByType: Record<ViolationType, number>;
    pluginStats?: Array<{
      pluginName: string;
      memoryUsage: number;
      cpuTime: number;
      networkRequests: number;
      fileOperations: number;
      violations: number;
    }>;
  } {
    const stats = {
      activeSandboxes: this.activeSandboxes.size,
      totalViolations: this.violations.length,
      violationsByType: {
        [ViolationType.SYSTEM_CALL]: 0,
        [ViolationType.FILE_ACCESS]: 0,
        [ViolationType.NETWORK_ACCESS]: 0,
        [ViolationType.RESOURCE_LIMIT]: 0,
        [ViolationType.API_ACCESS]: 0,
        [ViolationType.EXECUTION_TIME]: 0,
      } as Record<ViolationType, number>,
    };

    // Count violations by type
    for (const violation of this.violations) {
      stats.violationsByType[violation.type]++;
    }

    // Add plugin-specific stats if requested
    if (pluginName || this.activeSandboxes.size > 0) {
      const pluginStats = Array.from(this.activeSandboxes.entries()).map(([name, sandbox]) => ({
        pluginName: name,
        memoryUsage: sandbox.memoryUsage,
        cpuTime: sandbox.cpuTime,
        networkRequests: sandbox.networkRequests,
        fileOperations: sandbox.fileOperations,
        violations: this.violations.filter((v) => v.pluginName === name).length,
      }));

      if (pluginName) {
        stats.pluginStats = pluginStats.filter((p) => p.pluginName === pluginName);
      } else {
        stats.pluginStats = pluginStats;
      }
    }

    return stats;
  }

  /**
   * Destroy sandbox for a plugin
   */
  destroySandbox(pluginName: string): void {
    this.activeSandboxes.delete(pluginName);
  }

  /**
   * Clear all violations
   */
  clearViolations(): void {
    this.violations = [];
  }

  /**
   * Update security policy for a plugin
   */
  updatePolicy(pluginName: string, policy: Partial<SecurityPolicy>): void {
    const sandbox = this.activeSandboxes.get(pluginName);
    if (sandbox) {
      sandbox.policy = { ...sandbox.policy, ...policy };
    }
  }
}

/**
 * Security error for sandbox violations
 */
export class SecurityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SecurityError';
  }
}
