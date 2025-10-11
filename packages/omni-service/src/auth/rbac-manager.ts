import type { Role, PermissionCheck } from './types.js';
import { DEFAULT_ROLES, PermissionUtils } from './types.js';

/**
 * Role-Based Access Control (RBAC) Manager
 * Handles role definitions, permission checking, and access control
 */
export class RBACManager {
  private roles: Map<string, Role> = new Map();
  private permissionsCache: Map<string, Set<string>> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private cacheTTL: number;

  constructor(cacheTTL: number = 300) {
    // 5 minutes default
    this.cacheTTL = cacheTTL;

    // Load default roles
    DEFAULT_ROLES.forEach((role) => {
      this.roles.set(role.name, role);
    });
  }

  /**
   * Add or update a role
   */
  addRole(role: Role): void {
    this.roles.set(role.name, role);
    this.clearPermissionCache(); // Clear cache when roles change
  }

  /**
   * Get a role by name
   */
  getRole(name: string): Role | undefined {
    return this.roles.get(name);
  }

  /**
   * Get all roles
   */
  getAllRoles(): Role[] {
    return Array.from(this.roles.values());
  }

  /**
   * Get permissions for a user based on their roles
   */
  getUserPermissions(userId: string, userRoles: string[]): Set<string> {
    const cacheKey = `${userId}:${userRoles.join(',')}`;

    // Check cache first
    const cached = this.permissionsCache.get(cacheKey);
    const expiry = this.cacheExpiry.get(cacheKey);

    if (cached && expiry && Date.now() < expiry) {
      return cached;
    }

    // Compute permissions
    const permissions = new Set(
      PermissionUtils.flattenPermissions(Array.from(this.roles.values()), userRoles),
    );

    // Cache result
    this.permissionsCache.set(cacheKey, permissions);
    this.cacheExpiry.set(cacheKey, Date.now() + this.cacheTTL * 1000);

    return permissions;
  }

  /**
   * Check if a user has a specific permission
   */
  hasPermission(
    userId: string,
    userRoles: string[],
    resource: string,
    action: string,
  ): PermissionCheck {
    const permissions = this.getUserPermissions(userId, userRoles);

    // Check each permission
    for (const permission of permissions) {
      if (PermissionUtils.matchesPermission(permission, resource, action)) {
        return { granted: true };
      }
    }

    return {
      granted: false,
      reason: `User lacks permission for ${action} on ${resource}`,
      requiredPermission: PermissionUtils.formatPermission(resource, [action]),
    };
  }

  /**
   * Check if user has any of the specified permissions
   */
  hasAnyPermission(
    userId: string,
    userRoles: string[],
    resource: string,
    actions: string[],
  ): PermissionCheck {
    const permissions = this.getUserPermissions(userId, userRoles);

    for (const action of actions) {
      for (const permission of permissions) {
        if (PermissionUtils.matchesPermission(permission, resource, action)) {
          return { granted: true };
        }
      }
    }

    return {
      granted: false,
      reason: `User lacks any of the required permissions for ${actions.join(' or ')} on ${resource}`,
      requiredPermission: PermissionUtils.formatPermission(resource, actions),
    };
  }

  /**
   * Check if user has all specified permissions
   */
  hasAllPermissions(
    userId: string,
    userRoles: string[],
    resource: string,
    actions: string[],
  ): PermissionCheck {
    for (const action of actions) {
      const check = this.hasPermission(userId, userRoles, resource, action);
      if (!check.granted) {
        return {
          granted: false,
          reason: `User lacks permission for ${action} on ${resource}: ${check.reason}`,
          requiredPermission: PermissionUtils.formatPermission(resource, actions),
        };
      }
    }

    return { granted: true };
  }

  /**
   * Check if user has admin access to a resource
   */
  hasAdminAccess(userId: string, userRoles: string[], resource: string): PermissionCheck {
    return this.hasPermission(userId, userRoles, resource, 'admin');
  }

  /**
   * Check if user can read a resource
   */
  canRead(userId: string, userRoles: string[], resource: string): PermissionCheck {
    return this.hasPermission(userId, userRoles, resource, 'read');
  }

  /**
   * Check if user can write to a resource
   */
  canWrite(userId: string, userRoles: string[], resource: string): PermissionCheck {
    return this.hasPermission(userId, userRoles, resource, 'write');
  }

  /**
   * Check if user can delete a resource
   */
  canDelete(userId: string, userRoles: string[], resource: string): PermissionCheck {
    return this.hasPermission(userId, userRoles, resource, 'delete');
  }

  /**
   * Get all permissions for a resource
   */
  getResourcePermissions(resource: string): string[] {
    const permissions: string[] = [];

    for (const role of this.roles.values()) {
      for (const permission of role.permissions) {
        if (
          permission.resource === resource ||
          permission.resource === '*' ||
          (permission.resource.endsWith('*') &&
            resource.startsWith(permission.resource.slice(0, -1)))
        ) {
          permissions.push(
            PermissionUtils.formatPermission(permission.resource, permission.actions),
          );
        }
      }
    }

    return [...new Set(permissions)]; // Remove duplicates
  }

  /**
   * Validate role inheritance doesn't create circular dependencies
   */
  validateRoleInheritance(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const checkRole = (roleName: string, path: string[]): void => {
      if (visiting.has(roleName)) {
        errors.push(`Circular inheritance detected: ${path.join(' -> ')} -> ${roleName}`);
        return;
      }

      if (visited.has(roleName)) return;
      visiting.add(roleName);

      const role = this.roles.get(roleName);
      if (!role) return;

      if (role.inherits) {
        role.inherits.forEach((inheritedRole) => {
          checkRole(inheritedRole, [...path, roleName]);
        });
      }

      visiting.delete(roleName);
      visited.add(roleName);
    };

    for (const roleName of this.roles.keys()) {
      checkRole(roleName, [roleName]);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Clear permission cache
   */
  clearPermissionCache(): void {
    this.permissionsCache.clear();
    this.cacheExpiry.clear();
  }

  /**
   * Clean up expired cache entries
   */
  cleanupCache(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, expiry] of this.cacheExpiry) {
      if (expiry < now) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach((key) => {
      this.permissionsCache.delete(key);
      this.cacheExpiry.delete(key);
    });
  }

  /**
   * Get role hierarchy for user
   */
  getRoleHierarchy(userRoles: string[]): string[] {
    const hierarchy = new Set<string>(userRoles);
    const visited = new Set<string>();

    const processRole = (roleName: string): void => {
      if (visited.has(roleName)) return;
      visited.add(roleName);

      const role = this.roles.get(roleName);
      if (!role?.inherits) return;

      role.inherits.forEach((inheritedRole) => {
        if (!hierarchy.has(inheritedRole)) {
          hierarchy.add(inheritedRole);
        }
        processRole(inheritedRole);
      });
    };

    userRoles.forEach(processRole);
    return Array.from(hierarchy);
  }

  /**
   * Check if user has a specific role
   */
  hasRole(_userId: string, userRoles: string[], roleName: string): boolean {
    const hierarchy = this.getRoleHierarchy(userRoles);
    return hierarchy.includes(roleName);
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(_userId: string, userRoles: string[], roleNames: string[]): boolean {
    const hierarchy = this.getRoleHierarchy(userRoles);
    return roleNames.some((role) => hierarchy.includes(role));
  }

  /**
   * Get role information for user
   */
  getUserRoleInfo(userId: string, userRoles: string[]) {
    const hierarchy = this.getRoleHierarchy(userRoles);
    const roleDetails = hierarchy
      .map((roleName) => this.roles.get(roleName))
      .filter(Boolean) as Role[];

    return {
      directRoles: userRoles,
      inheritedRoles: hierarchy.filter((role) => !userRoles.includes(role)),
      allRoles: hierarchy,
      roleDetails,
      permissions: this.getUserPermissions(userId, userRoles),
    };
  }
}
