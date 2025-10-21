/**
 * MCP Authorization Configuration
 *
 * This file demonstrates how to configure user roles and permissions
 * for the MCP authorization system.
 */

export interface AuthConfig {
  /**
   * Default role for unauthenticated users
   */
  defaultRole: 'guest' | 'user';

  /**
   * Enable strict authorization (deny by default)
   */
  strictMode: boolean;

  /**
   * Require authentication for dangerous operations
   */
  requireAuthForDangerous: boolean;

  /**
   * Session timeout in minutes
   */
  sessionTimeout: number;

  /**
   * Enable audit logging
   */
  enableAuditLog: boolean;

  /**
   * Rate limiting per user
   */
  rateLimiting: {
    requestsPerMinute: number;
    dangerousRequestsPerHour: number;
  };

  /**
   * IP whitelist for admin operations
   */
  adminIpWhitelist: string[];

  /**
   * Custom role mappings (optional)
   */
  roleMappings?: Record<
    string,
    {
      role: 'guest' | 'user' | 'developer' | 'admin';
      permissions: string[];
      restrictions?: string[];
    }
  >;
}

export const defaultAuthConfig: AuthConfig = {
  defaultRole: 'user',
  strictMode: true,
  requireAuthForDangerous: true,
  sessionTimeout: 60, // 1 hour
  enableAuditLog: true,
  rateLimiting: {
    requestsPerMinute: 100,
    dangerousRequestsPerHour: 10,
  },
  adminIpWhitelist: ['127.0.0.1', '::1'], // localhost only
};

/**
 * Environment variable based configuration
 */
export function getAuthConfig(): AuthConfig {
  return {
    defaultRole: (process.env.MCP_DEFAULT_ROLE as any) || defaultAuthConfig.defaultRole,
    strictMode: process.env.MCP_STRICT_MODE === 'true' || defaultAuthConfig.strictMode,
    requireAuthForDangerous:
      process.env.MCP_REQUIRE_AUTH_DANGEROUS !== 'false' ||
      defaultAuthConfig.requireAuthForDangerous,
    sessionTimeout: parseInt(process.env.MCP_SESSION_TIMEOUT || '60', 10),
    enableAuditLog: process.env.MCP_ENABLE_AUDIT !== 'false' || defaultAuthConfig.enableAuditLog,
    rateLimiting: {
      requestsPerMinute: parseInt(process.env.MCP_RATE_LIMIT_RPM || '100', 10),
      dangerousRequestsPerHour: parseInt(process.env.MCP_RATE_LIMIT_DANGEROUS_PH || '10', 10),
    },
    adminIpWhitelist:
      process.env.MCP_ADMIN_IP_WHITELIST?.split(',') || defaultAuthConfig.adminIpWhitelist,
  };
}
