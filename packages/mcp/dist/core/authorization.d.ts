/**
 * Authorization framework for MCP tools
 *
 * This module provides role-based access control (RBAC) for MCP tools,
 * addressing P0 security vulnerability where any authenticated user
 * could perform destructive operations.
 */
import type { ToolFactory } from './types.js';
import { type AuthConfig } from '../config/auth-config.js';
/**
 * User roles with increasing privileges
 */
export type UserRole = 'guest' | 'user' | 'developer' | 'admin';
/**
 * Permission levels for tool operations
 */
export type PermissionLevel = 'read' | 'write' | 'delete' | 'admin';
/**
 * Tool categories for authorization grouping
 */
export type ToolCategory = 'files' | 'exec' | 'kanban' | 'github' | 'process' | 'sandbox' | 'system' | 'meta';
/**
 * Authorization context containing user information
 */
export type AuthContext = Readonly<{
    userId: string;
    role: UserRole;
    permissions: readonly PermissionLevel[];
    sessionToken?: string;
    ipAddress?: string;
    userAgent?: string;
}>;
/**
 * Tool authorization requirements
 */
export type ToolAuthRequirements = Readonly<{
    category: ToolCategory;
    requiredLevel: PermissionLevel;
    requiredRoles?: readonly UserRole[];
    dangerous?: boolean;
    auditLog?: boolean;
}>;
/**
 * Audit log entry for security events
 */
export type AuditLogEntry = Readonly<{
    timestamp: Date;
    userId: string;
    role: UserRole;
    toolName: string;
    action: string;
    args: unknown;
    result: 'allowed' | 'denied';
    reason?: string;
    ipAddress?: string;
    userAgent?: string;
}>;
/**
 * In-memory audit log (in production, use persistent storage)
 */
declare class AuditLogger {
    private entries;
    private maxSize;
    log(entry: AuditLogEntry): void;
    getRecent(count?: number): readonly AuditLogEntry[];
    getByUser(userId: string, count?: number): readonly AuditLogEntry[];
    getDenied(count?: number): readonly AuditLogEntry[];
}
export declare const auditLogger: AuditLogger;
/**
 * Create an authorized tool factory wrapper
 */
export declare function createAuthorizedToolFactory(originalFactory: ToolFactory, toolName: string): ToolFactory;
/**
 * Apply authorization to all tool factories
 */
export declare function applyAuthorization(factories: readonly ToolFactory[], toolNames: readonly string[]): readonly ToolFactory[];
/**
 * Get authorization requirements for a tool
 */
export declare function getToolAuthRequirements(toolName: string): ToolAuthRequirements | undefined;
/**
 * Get all tools requiring specific permission level
 */
export declare function getToolsByPermissionLevel(level: PermissionLevel): readonly string[];
/**
 * Get all dangerous tools
 */
export declare function getDangerousTools(): readonly string[];
/**
 * Get current authorization configuration
 */
export declare function getCurrentAuthConfig(): AuthConfig;
/**
 * Check if strict mode is enabled
 */
export declare function isStrictModeEnabled(): boolean;
/**
 * Check if authentication is required for dangerous operations
 */
export declare function isAuthRequiredForDangerous(): boolean;
/**
 * Check if an IP address is whitelisted for admin access
 */
export declare function isAdminIpWhitelisted(ipAddress: string): boolean;
/**
 * Validate admin IP address against whitelist
 */
export declare function validateAdminIp(ipAddress?: string): {
    valid: boolean;
    reason?: string;
};
/**
 * Get all tools that would be denied under strict mode
 */
export declare function getStrictModeDeniedTools(): readonly string[];
/**
 * Authorization health check - returns configuration status
 */
export declare function getAuthorizationHealth(): {
    strictMode: boolean;
    requireAuthForDangerous: boolean;
    adminIpWhitelistSize: number;
    auditLogEnabled: boolean;
    configuredTools: number;
    dangerousTools: number;
};
export {};
//# sourceMappingURL=authorization.d.ts.map