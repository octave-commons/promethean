import type { User, SecurityContext } from "../types/security.js";

/**
 * Role-Based Access Control (RBAC) implementation
 */
export class RBAC {
  private static readonly DEFAULT_ROLES = {
    admin: ["read", "write", "delete", "manage_users", "manage_system"],
    user: ["read", "write"],
    readonly: ["read"],
  } as const;

  private static readonly ROLE_HIERARCHY = {
    admin: 3,
    user: 2,
    readonly: 1,
  } as const;

  /**
   * Check if a user has a specific permission
   */
  static hasPermission(
    user: User,
    requiredPermission: string,
  ): boolean {
    return user.permissions.includes(requiredPermission);
  }

  /**
   * Check if a user has any of the specified permissions
   */
  static hasAnyPermission(
    user: User,
    requiredPermissions: readonly string[],
  ): boolean {
    return requiredPermissions.some(permission => 
      this.hasPermission(user, permission)
    );
  }

  /**
   * Check if a user has all of the specified permissions
   */
  static hasAllPermissions(
    user: User,
    requiredPermissions: readonly string[],
  ): boolean {
    return requiredPermissions.every(permission => 
      this.hasPermission(user, permission)
    );
  }

  /**
   * Check if a user has a specific role
   */
  static hasRole(user: User, requiredRole: string): boolean {
    return user.roles.includes(requiredRole);
  }

  /**
   * Check if a user has any of the specified roles
   */
  static hasAnyRole(
    user: User,
    requiredRoles: readonly string[],
  ): boolean {
    return requiredRoles.some(role => this.hasRole(user, role));
  }

  /**
   * Check if a user's role meets or exceeds the required role level
   */
  static hasMinimumRole(user: User, minimumRole: keyof typeof this.ROLE_HIERARCHY): boolean {
    const userMaxLevel = Math.max(
      ...user.roles.map(role => this.ROLE_HIERARCHY[role as keyof typeof this.ROLE_HIERARCHY] || 0)
    );
    
    const requiredLevel = this.ROLE_HIERARCHY[minimumRole];
    return userMaxLevel >= requiredLevel;
  }

  /**
   * Get default permissions for a role
   */
  static getPermissionsForRole(role: string): readonly string[] {
    return this.DEFAULT_ROLES[role as keyof typeof this.DEFAULT_ROLES] || [];
  }

  /**
   * Create a user with default roles and permissions
   */
  static createUser(
    id: string,
    apiKey: string,
    roles: readonly string[] = ["readonly"],
  ): User {
    const permissions = roles.flatMap(role => this.getPermissionsForRole(role));
    
    return {
      id,
      roles: [...new Set(roles)], // Remove duplicates
      permissions: [...new Set(permissions)], // Remove duplicates
      apiKey,
      createdAt: new Date(),
    };
  }

  /**
   * Create a security context from a user
   */
  static createSecurityContext(user: User): SecurityContext {
    return {
      user,
      permissions: user.permissions,
      rateLimitOverride: user.rateLimitOverride,
    };
  }

  /**
   * Validate role names
   */
  static isValidRole(role: string): boolean {
    return role in this.DEFAULT_ROLES;
  }

  /**
   * Get all available roles
   */
  static getAvailableRoles(): readonly string[] {
    return Object.keys(this.DEFAULT_ROLES);
  }

  /**
   * Get role hierarchy level
   */
  static getRoleLevel(role: string): number {
    return this.ROLE_HIERARCHY[role as keyof typeof this.ROLE_HIERARCHY] || 0;
  }
}