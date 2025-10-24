import type { Plugin, PluginContext } from '../types.js';
import {
  PluginSandbox,
  SecurityPolicy,
  SecurityViolation,
  ViolationType,
} from './plugin-sandbox.js';

/**
 * Security configuration
 */
export interface SecurityConfig {
  /** Default security policy for all plugins */
  defaultPolicy?: SecurityPolicy;
  /** Plugin-specific security policies */
  pluginPolicies?: Record<string, SecurityPolicy>;
  /** Global security settings */
  globalSettings?: {
    maxViolationsPerPlugin?: number;
    autoBlockOnViolation?: boolean;
    violationRetentionDays?: number;
    requireCodeSigning?: boolean;
    allowedPublishers?: string[];
  };
  /** Monitoring settings */
  monitoring?: {
    enableRealTimeMonitoring?: boolean;
    violationAlertThreshold?: number;
    reportInterval?: number; // in minutes
  };
}

/**
 * Security audit log entry
 */
export interface SecurityAuditLog {
  id: string;
  timestamp: number;
  pluginName: string;
  action:
    | 'plugin_loaded'
    | 'plugin_unloaded'
    | 'violation_detected'
    | 'policy_updated'
    | 'sandbox_created'
    | 'sandbox_destroyed';
  details: Record<string, unknown>;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

/**
 * Comprehensive security manager for plugin system
 */
export class SecurityManager {
  private sandbox: PluginSandbox;
  private auditLog: SecurityAuditLog[] = [];
  private blockedPlugins: Set<string> = new Set();
  private trustedPublishers: Set<string> = new Set();
  private config: Required<SecurityConfig>;

  constructor(config: SecurityConfig = {}) {
    this.config = {
      defaultPolicy: {},
      pluginPolicies: {},
      globalSettings: {
        maxViolationsPerPlugin: 10,
        autoBlockOnViolation: true,
        violationRetentionDays: 30,
        requireCodeSigning: false,
        allowedPublishers: [],
      },
      monitoring: {
        enableRealTimeMonitoring: true,
        violationAlertThreshold: 5,
        reportInterval: 60,
      },
      ...config,
    };

    this.sandbox = new PluginSandbox(this.config.defaultPolicy);
    this.initializeTrustedPublishers();
  }

  /**
   * Initialize trusted publishers
   */
  private initializeTrustedPublishers(): void {
    if (this.config.globalSettings.allowedPublishers) {
      this.config.globalSettings.allowedPublishers.forEach((publisher) => {
        this.trustedPublishers.add(publisher);
      });
    }
  }

  /**
   * Validate plugin before loading
   */
  async validatePlugin(plugin: Plugin): Promise<{
    valid: boolean;
    violations: SecurityViolation[];
    warnings: string[];
  }> {
    const violations: SecurityViolation[] = [];
    const warnings: string[] = [];

    // Check if plugin is blocked
    if (this.blockedPlugins.has(plugin.metadata.name)) {
      violations.push({
        type: ViolationType.API_ACCESS,
        pluginName: plugin.metadata.name,
        timestamp: Date.now(),
        description: 'Plugin is blocked due to security violations',
        severity: 'critical',
        blocked: true,
      });
      return { valid: false, violations, warnings };
    }

    // Check publisher trust
    if (this.config.globalSettings.requireCodeSigning) {
      const publisher = (plugin.metadata as any).publisher;
      if (!publisher || !this.trustedPublishers.has(publisher)) {
        violations.push({
          type: ViolationType.API_ACCESS,
          pluginName: plugin.metadata.name,
          timestamp: Date.now(),
          description: `Untrusted publisher: ${publisher || 'unknown'}`,
          severity: 'high',
          blocked: true,
        });
      }
    }

    // Check dependencies
    if (plugin.metadata.dependencies) {
      for (const dep of plugin.metadata.dependencies) {
        if (this.blockedPlugins.has(dep)) {
          warnings.push(`Dependency ${dep} is blocked`);
        }
      }
    }

    // Check for suspicious patterns in plugin metadata
    const suspiciousPatterns = [/eval/i, /exec/i, /system/i, /shell/i, /process\.exit/i];

    const metadataString = JSON.stringify(plugin.metadata);
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(metadataString)) {
        warnings.push(`Suspicious pattern detected in plugin metadata`);
        break;
      }
    }

    const valid = violations.length === 0;
    return { valid, violations, warnings };
  }

  /**
   * Create secure sandbox for plugin
   */
  createSecureSandbox(pluginName: string): PluginSandbox {
    const pluginPolicy = this.config.pluginPolicies?.[pluginName] || this.config.defaultPolicy;
    this.sandbox.createSandbox(pluginName, pluginPolicy);

    this.logAudit({
      id: this.generateAuditId(),
      timestamp: Date.now(),
      pluginName,
      action: 'sandbox_created',
      details: { policy: pluginPolicy },
      severity: 'info',
    });

    return this.sandbox;
  }

  /**
   * Wrap plugin with security measures
   */
  async securePlugin(plugin: Plugin): Promise<Plugin> {
    const validation = await this.validatePlugin(plugin);

    if (!validation.valid) {
      this.logAudit({
        id: this.generateAuditId(),
        timestamp: Date.now(),
        pluginName: plugin.metadata.name,
        action: 'plugin_loaded',
        details: {
          rejected: true,
          violations: validation.violations,
          warnings: validation.warnings,
        },
        severity: 'critical',
      });
      throw new Error(
        `Plugin validation failed: ${validation.violations.map((v) => v.description).join(', ')}`,
      );
    }

    // Log warnings if any
    if (validation.warnings.length > 0) {
      this.logAudit({
        id: this.generateAuditId(),
        timestamp: Date.now(),
        pluginName: plugin.metadata.name,
        action: 'plugin_loaded',
        details: {
          warnings: validation.warnings,
        },
        severity: 'warning',
      });
    }

    // Create secure sandbox
    const sandbox = this.createSecureSandbox(plugin.metadata.name);

    // Wrap plugin methods with security
    const securePlugin: Plugin = {
      metadata: plugin.metadata,
      initialize: plugin.initialize
        ? async (context: PluginContext) => {
            return sandbox.executeInSandbox(plugin.metadata.name, () =>
              plugin.initialize!(context),
            );
          }
        : undefined,
      destroy: plugin.destroy
        ? async () => {
            return sandbox.executeInSandbox(plugin.metadata.name, () => plugin.destroy!());
          }
        : undefined,
      getHooks: plugin.getHooks
        ? () => {
            const hooks = plugin.getHooks!();
            return hooks.map((hook) => ({
              ...hook,
              handler: sandbox.wrapHookHandler(plugin.metadata.name, hook.handler),
            }));
          }
        : undefined,
    };

    this.logAudit({
      id: this.generateAuditId(),
      timestamp: Date.now(),
      pluginName: plugin.metadata.name,
      action: 'plugin_loaded',
      details: { secured: true },
      severity: 'info',
    });

    return securePlugin;
  }

  /**
   * Handle security violation
   */
  handleViolation(violation: SecurityViolation): void {
    // Log the violation
    this.logAudit({
      id: this.generateAuditId(),
      timestamp: violation.timestamp,
      pluginName: violation.pluginName,
      action: 'violation_detected',
      details: violation,
      severity:
        violation.severity === 'critical'
          ? 'critical'
          : violation.severity === 'high'
            ? 'error'
            : violation.severity === 'medium'
              ? 'warning'
              : 'info',
    });

    // Check if plugin should be blocked
    const pluginViolations = this.sandbox.getViolations(violation.pluginName);
    if (pluginViolations.length >= this.config.globalSettings.maxViolationsPerPlugin) {
      if (this.config.globalSettings.autoBlockOnViolation) {
        this.blockPlugin(violation.pluginName);
      }
    }

    // Check for alert threshold
    if (this.config.monitoring.enableRealTimeMonitoring) {
      const recentViolations = pluginViolations.filter(
        (v) => Date.now() - v.timestamp < 60000, // Last minute
      );

      if (recentViolations.length >= this.config.monitoring.violationAlertThreshold) {
        this.triggerSecurityAlert(violation.pluginName, recentViolations);
      }
    }
  }

  /**
   * Block a plugin due to security violations
   */
  blockPlugin(pluginName: string): void {
    this.blockedPlugins.add(pluginName);

    this.logAudit({
      id: this.generateAuditId(),
      timestamp: Date.now(),
      pluginName,
      action: 'plugin_unloaded',
      details: { blocked: true, reason: 'Too many security violations' },
      severity: 'critical',
    });

    console.error(`[SECURITY] Plugin ${pluginName} has been blocked due to security violations`);
  }

  /**
   * Unblock a plugin
   */
  unblockPlugin(pluginName: string): void {
    this.blockedPlugins.delete(pluginName);

    this.logAudit({
      id: this.generateAuditId(),
      timestamp: Date.now(),
      pluginName,
      action: 'plugin_loaded',
      details: { unblocked: true },
      severity: 'info',
    });
  }

  /**
   * Trigger security alert
   */
  private triggerSecurityAlert(pluginName: string, violations: SecurityViolation[]): void {
    const alert = {
      pluginName,
      violationCount: violations.length,
      severity: violations.some((v) => v.severity === 'critical') ? 'critical' : 'high',
      violations: violations.slice(-5), // Last 5 violations
      timestamp: Date.now(),
    };

    console.error('[SECURITY ALERT]', alert);

    // In a real implementation, this would send alerts to monitoring systems
    // For now, we just log to console
  }

  /**
   * Update security policy for a plugin
   */
  updatePluginPolicy(pluginName: string, policy: Partial<SecurityPolicy>): void {
    if (!this.config.pluginPolicies) {
      this.config.pluginPolicies = {};
    }

    this.config.pluginPolicies[pluginName] = {
      ...(this.config.pluginPolicies[pluginName] || {}),
      ...policy,
    };

    this.sandbox.updatePolicy(pluginName, policy);

    this.logAudit({
      id: this.generateAuditId(),
      timestamp: Date.now(),
      pluginName,
      action: 'policy_updated',
      details: { policy },
      severity: 'info',
    });
  }

  /**
   * Get security report
   */
  getSecurityReport(): {
    totalPlugins: number;
    blockedPlugins: number;
    totalViolations: number;
    violationsByType: Record<ViolationType, number>;
    violationsByPlugin: Record<string, number>;
    recentViolations: SecurityViolation[];
    auditLogSize: number;
  } {
    const violations = this.sandbox.getViolations();
    const violationsByType: Record<ViolationType, number> = {
      [ViolationType.SYSTEM_CALL]: 0,
      [ViolationType.FILE_ACCESS]: 0,
      [ViolationType.NETWORK_ACCESS]: 0,
      [ViolationType.RESOURCE_LIMIT]: 0,
      [ViolationType.API_ACCESS]: 0,
      [ViolationType.EXECUTION_TIME]: 0,
    };

    const violationsByPlugin: Record<string, number> = {};

    for (const violation of violations) {
      violationsByType[violation.type]++;
      violationsByPlugin[violation.pluginName] =
        (violationsByPlugin[violation.pluginName] || 0) + 1;
    }

    const recentViolations = violations
      .filter((v) => Date.now() - v.timestamp < 24 * 60 * 60 * 1000) // Last 24 hours
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 50); // Last 50

    return {
      totalPlugins: 0, // This would come from plugin manager
      blockedPlugins: this.blockedPlugins.size,
      totalViolations: violations.length,
      violationsByType,
      violationsByPlugin,
      recentViolations,
      auditLogSize: this.auditLog.length,
    };
  }

  /**
   * Get audit log
   */
  getAuditLog(options?: {
    pluginName?: string;
    action?: string;
    severity?: string;
    limit?: number;
    since?: number;
  }): SecurityAuditLog[] {
    let filtered = [...this.auditLog];

    if (options?.pluginName) {
      filtered = filtered.filter((log) => log.pluginName === options.pluginName);
    }

    if (options?.action) {
      filtered = filtered.filter((log) => log.action === options.action);
    }

    if (options?.severity) {
      filtered = filtered.filter((log) => log.severity === options.severity);
    }

    if (options?.since) {
      filtered = filtered.filter((log) => log.timestamp >= options.since!);
    }

    if (options?.limit) {
      filtered = filtered.slice(-options.limit);
    }

    return filtered.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Log audit entry
   */
  private logAudit(entry: SecurityAuditLog): void {
    this.auditLog.push(entry);

    // Maintain audit log size
    const maxEntries = 10000;
    if (this.auditLog.length > maxEntries) {
      this.auditLog = this.auditLog.slice(-maxEntries);
    }
  }

  /**
   * Generate audit ID
   */
  private generateAuditId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get sandbox instance
   */
  getSandbox(): PluginSandbox {
    return this.sandbox;
  }

  /**
   * Get configuration
   */
  getConfig(): Required<SecurityConfig> {
    return { ...this.config };
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.auditLog = [];
    this.blockedPlugins.clear();
    this.sandbox.clearViolations();
  }
}
