/**
 * User Management Data Models
 *
 * Core data structures for user registry and management
 * following the project's functional programming style and security requirements.
 */

import type { UserRole } from '../../core/authorization.js';

/**
 * User account status
 */
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';

/**
 * User authentication method
 */
export type AuthMethod = 'oauth' | 'api_key' | 'environment' | 'ldap';

/**
 * User account information
 */
export type User = Readonly<{
  readonly id: string;
  readonly username: string;
  readonly email?: string;
  readonly name?: string;
  readonly avatar?: string;
  readonly role: UserRole;
  readonly status: UserStatus;
  readonly authMethod: AuthMethod;
  readonly provider?: string; // OAuth provider
  readonly providerUserId?: string; // User ID from provider
  readonly permissions: readonly string[];
  readonly customRoles: readonly string[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly lastLoginAt?: Date;
  readonly metadata: Record<string, unknown>;
}>;

/**
 * User creation data
 */
export type CreateUserRequest = Readonly<{
  readonly username: string;
  readonly email?: string;
  readonly name?: string;
  readonly role: UserRole;
  readonly authMethod: AuthMethod;
  readonly provider?: string;
  readonly providerUserId?: string;
  readonly permissions?: readonly string[];
  readonly customRoles?: readonly string[];
  readonly metadata?: Record<string, unknown>;
}>;

/**
 * User update data
 */
export type UpdateUserRequest = Readonly<{
  readonly username?: string;
  readonly email?: string;
  readonly name?: string;
  readonly role?: UserRole;
  readonly status?: UserStatus;
  readonly permissions?: readonly string[];
  readonly customRoles?: readonly string[];
  readonly metadata?: Record<string, unknown>;
}>;

/**
 * User search filters
 */
export type UserSearchFilters = Readonly<{
  readonly status?: UserStatus;
  readonly role?: UserRole;
  readonly authMethod?: AuthMethod;
  readonly provider?: string;
  readonly createdAfter?: Date;
  readonly createdBefore?: Date;
  readonly lastLoginAfter?: Date;
  readonly lastLoginBefore?: Date;
  readonly search?: string; // Search in username, email, name
}>;

/**
 * User search results
 */
export type UserSearchResult = Readonly<{
  readonly users: readonly User[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly hasNext: boolean;
  readonly hasPrevious: boolean;
}>;

/**
 * Custom role definition
 */
export type CustomRole = Readonly<{
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly permissions: readonly string[];
  readonly inherits?: readonly string[]; // Role inheritance
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly metadata: Record<string, unknown>;
}>;

/**
 * Custom role creation data
 */
export type CreateCustomRoleRequest = Readonly<{
  readonly name: string;
  readonly description?: string;
  readonly permissions: readonly string[];
  readonly inherits?: readonly string[];
  readonly metadata?: Record<string, unknown>;
}>;

/**
 * User session information
 */
export type UserSession = Readonly<{
  readonly sessionId: string;
  readonly userId: string;
  readonly authMethod: AuthMethod;
  readonly provider?: string;
  readonly ipAddress?: string;
  readonly userAgent?: string;
  readonly createdAt: Date;
  readonly lastAccessAt: Date;
  readonly expiresAt: Date;
  readonly metadata: Record<string, unknown>;
}>;

/**
 * User activity log entry
 */
export type UserActivityLog = Readonly<{
  readonly id: string;
  readonly userId: string;
  readonly action: string;
  readonly resource?: string;
  readonly details?: Record<string, unknown>;
  readonly ipAddress?: string;
  readonly userAgent?: string;
  readonly timestamp: Date;
  readonly metadata: Record<string, unknown>;
}>;

/**
 * User statistics
 */
export type UserStats = Readonly<{
  readonly totalUsers: number;
  readonly activeUsers: number;
  readonly usersByRole: Record<UserRole, number>;
  readonly usersByAuthMethod: Record<AuthMethod, number>;
  readonly usersByProvider: Record<string, number>;
  readonly recentLogins: number; // Last 24 hours
  readonly newUsers: number; // Last 30 days
}>;

/**
 * User registry configuration
 */
export type UserRegistryConfig = Readonly<{
  readonly storagePath: string;
  readonly enableCustomRoles: boolean;
  readonly enableActivityLogging: boolean;
  readonly sessionTimeout: number; // seconds
  readonly maxSessionsPerUser: number;
  readonly enableUserSearch: boolean;
  readonly defaultRole: UserRole;
  readonly autoActivateUsers: boolean;
}>;