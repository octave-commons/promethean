import { z } from "zod";

/**
 * JWT Token payload structure
 */
export interface JWTPayload {
  sub: string;           // Subject (user ID)
  iat: number;           // Issued at (timestamp)
  exp: number;           // Expires at (timestamp)
  aud: string;           // Audience (service name)
  iss: string;           // Issuer (auth service)
  roles: string[];       // User roles
  permissions: string[]; // User permissions (flattened)
  type: "access" | "refresh"; // Token type
}

/**
 * Role definition with permissions
 */
export interface Role {
  name: string;
  description: string;
  permissions: Permission[];
  inherits?: string[]; // Parent roles for inheritance
}

/**
 * Individual permission definition
 */
export interface Permission {
  resource: string;
  actions: ("read" | "write" | "delete" | "admin")[];
  conditions?: Record<string, any>; // Optional conditions
}

/**
 * User context for request handling
 */
export interface UserContext {
  id: string;
  username?: string;
  email?: string;
  roles: string[];
  permissions: Set<string>;
  metadata?: Record<string, any>;
  tokenType: "access" | "refresh" | "apikey";
}

/**
 * Authentication configuration
 */
export interface AuthConfig {
  jwt: {
    secret: string;
    algorithm: "HS256" | "RS256";
    expiresIn: string;
    issuer: string;
    audience: string;
    refreshExpiresIn: string;
  };
  apikey: {
    enabled: boolean;
    headerName: string;
    queryParam?: string;
  };
  rbac: {
    defaultRoles: string[];
    permissionsCacheTTL: number; // in seconds
  };
  session: {
    enabled: boolean;
    cookieName: string;
    cookieOptions: {
      httpOnly: boolean;
      secure: boolean;
      sameSite: "strict" | "lax" | "none";
      maxAge: number;
    };
  };
}

/**
 * Authentication result
 */
export interface AuthResult {
  success: boolean;
  user?: UserContext;
  error?: string;
  statusCode?: number;
}

/**
 * Permission check result
 */
export interface PermissionCheck {
  granted: boolean;
  reason?: string;
  requiredPermission?: string;
}

/**
 * JWT token validation schema
 */
export const JWTPayloadSchema = z.object({
  sub: z.string(),
  iat: z.number(),
  exp: z.number(),
  aud: z.string(),
  iss: z.string(),
  roles: z.array(z.string()),
  permissions: z.array(z.string()),
  type: z.enum(["access", "refresh"]),
});

/**
 * Role schema validation
 */
export const RoleSchema = z.object({
  name: z.string(),
  description: z.string(),
  permissions: z.array(z.object({
    resource: z.string(),
    actions: z.array(z.enum(["read", "write", "delete", "admin"])),
    conditions: z.record(z.any()).optional(),
  })),
  inherits: z.array(z.string()).optional(),
});

/**
 * User context schema validation
 */
export const UserContextSchema = z.object({
  id: z.string(),
  username: z.string().optional(),
  email: z.string().email().optional(),
  roles: z.array(z.string()),
  permissions: z.instanceof(Set),
  metadata: z.record(z.any()).optional(),
  tokenType: z.enum(["access", "refresh", "apikey"]),
});

/**
 * Default roles for the system
 */
export const DEFAULT_ROLES: Role[] = [
  {
    name: "admin",
    description: "Full system administrator",
    permissions: [
      { resource: "*", actions: ["read", "write", "delete", "admin"] },
    ],
  },
  {
    name: "user",
    description: "Regular authenticated user",
    permissions: [
      { resource: "user:profile", actions: ["read", "write"] },
      { resource: "api:*", actions: ["read"] },
    ],
  },
  {
    name: "readonly",
    description: "Read-only access",
    permissions: [
      { resource: "api:*", actions: ["read"] },
      { resource: "health:*", actions: ["read"] },
    ],
  },
  {
    name: "service",
    description: "Service-to-service access",
    permissions: [
      { resource: "api:*", actions: ["read", "write"] },
      { resource: "health:*", actions: ["read"] },
    ],
  },
];

/**
 * Utility functions for permission formatting
 */
export class PermissionUtils {
  /**
   * Flatten permissions from roles
   */
  static flattenPermissions(roles: Role[], roleNames: string[]): string[] {
    const permissions = new Set<string>();
    const visited = new Set<string>();
    
    const processRole = (roleName: string) => {
      if (visited.has(roleName)) return;
      visited.add(roleName);
      
      const role = roles.find(r => r.name === roleName);
      if (!role) return;
      
      // Add role permissions
      role.permissions.forEach(perm => {
        const key = `${perm.resource}:${perm.actions.join(',')}`;
        permissions.add(key);
      });
      
      // Process inherited roles
      if (role.inherits) {
        role.inherits.forEach(inheritedRole => processRole(inheritedRole));
      }
    };
    
    roleNames.forEach(processRole);
    return Array.from(permissions);
  }
  
  /**
   * Check if a permission matches a resource-action pair
   */
  static matchesPermission(permission: string, resource: string, action: string): boolean {
    const [permResource, permActions] = permission.split(':');
    
    // Wildcard resource match
    if (permResource === '*') return true;
    
    // Exact resource match with wildcard action
    if (permResource === resource && permActions.split(',').includes('*')) {
      return true;
    }
    
    // Exact match
    if (permResource === resource && permActions.split(',').includes(action)) {
      return true;
    }
    
    // Resource wildcard match
    if (permResource.endsWith('*') && resource.startsWith(permResource.slice(0, -1))) {
      return permActions.split(',').includes(action) || permActions.split(',').includes('*');
    }
    
    return false;
  }
  
  /**
   * Format permission for storage
   */
  static formatPermission(resource: string, actions: string[]): string {
    return `${resource}:${actions.join(',')}`;
  }
}