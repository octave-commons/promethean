/**
 * Authorization framework for MCP tools
 *
 * This module provides role-based access control (RBAC) for MCP tools,
 * addressing P0 security vulnerability where any authenticated user
 * could perform destructive operations.
 */

import type { Tool, ToolFactory, ToolContext } from './types.js';

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
export type ToolCategory =
  | 'files' // File system operations
  | 'exec' // Command execution
  | 'kanban' // Task management
  | 'github' // GitHub operations
  | 'process' // Process management
  | 'sandbox' // Sandbox operations
  | 'system' // System-level operations
  | 'meta'; // Meta/help tools

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
  dangerous?: boolean; // Extra scrutiny for destructive operations
  auditLog?: boolean; // Force audit logging
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
 * Role hierarchy mapping
 */
const ROLE_HIERARCHY: Record<UserRole, number> = {
  guest: 0,
  user: 1,
  developer: 2,
  admin: 3,
} as const;

/**
 * Default role permissions
 */
const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, readonly PermissionLevel[]> = {
  guest: ['read'],
  user: ['read', 'write'],
  developer: ['read', 'write', 'delete'],
  admin: ['read', 'write', 'delete', 'admin'],
} as const;

/**
 * Tool authorization requirements mapping
 */
const TOOL_AUTH_REQUIREMENTS: Record<string, ToolAuthRequirements> = {
  // File operations - most dangerous
  files_write_content: {
    category: 'files',
    requiredLevel: 'write',
    dangerous: true,
    auditLog: true,
  },
  files_write_lines: {
    category: 'files',
    requiredLevel: 'write',
    dangerous: true,
    auditLog: true,
  },
  files_list_directory: {
    category: 'files',
    requiredLevel: 'read',
    dangerous: false,
    auditLog: false,
  },
  files_tree_directory: {
    category: 'files',
    requiredLevel: 'read',
    dangerous: false,
    auditLog: false,
  },
  files_view_file: {
    category: 'files',
    requiredLevel: 'read',
    dangerous: false,
    auditLog: false,
  },
  files_search: {
    category: 'files',
    requiredLevel: 'read',
    dangerous: false,
    auditLog: false,
  },

  // Command execution - extremely dangerous
  exec_run: {
    category: 'exec',
    requiredLevel: 'admin',
    requiredRoles: ['developer', 'admin'],
    dangerous: true,
    auditLog: true,
  },
  exec_list: {
    category: 'exec',
    requiredLevel: 'read',
    dangerous: false,
    auditLog: false,
  },

  // Kanban operations - task management
  kanban_delete_task: {
    category: 'kanban',
    requiredLevel: 'delete',
    dangerous: true,
    auditLog: true,
  },
  kanban_archive_task: {
    category: 'kanban',
    requiredLevel: 'write',
    dangerous: true,
    auditLog: true,
  },
  kanban_bulk_archive: {
    category: 'kanban',
    requiredLevel: 'delete',
    dangerous: true,
    auditLog: true,
  },
  kanban_merge_tasks: {
    category: 'kanban',
    requiredLevel: 'write',
    dangerous: true,
    auditLog: true,
  },
  kanban_update_status: {
    category: 'kanban',
    requiredLevel: 'write',
    dangerous: false,
    auditLog: true,
  },
  kanban_move_task: {
    category: 'kanban',
    requiredLevel: 'write',
    dangerous: false,
    auditLog: true,
  },
  kanban_update_task_description: {
    category: 'kanban',
    requiredLevel: 'write',
    dangerous: false,
    auditLog: true,
  },
  kanban_rename_task: {
    category: 'kanban',
    requiredLevel: 'write',
    dangerous: false,
    auditLog: true,
  },
  kanban_analyze_task: {
    category: 'kanban',
    requiredLevel: 'read',
    dangerous: false,
    auditLog: false,
  },
  kanban_rewrite_task: {
    category: 'kanban',
    requiredLevel: 'write',
    dangerous: true,
    auditLog: true,
  },
  kanban_breakdown_task: {
    category: 'kanban',
    requiredLevel: 'write',
    dangerous: true,
    auditLog: true,
  },
  kanban_get_board: {
    category: 'kanban',
    requiredLevel: 'read',
    dangerous: false,
    auditLog: false,
  },
  kanban_get_column: {
    category: 'kanban',
    requiredLevel: 'read',
    dangerous: false,
    auditLog: false,
  },
  kanban_find_task: {
    category: 'kanban',
    requiredLevel: 'read',
    dangerous: false,
    auditLog: false,
  },
  kanban_find_task_by_title: {
    category: 'kanban',
    requiredLevel: 'read',
    dangerous: false,
    auditLog: false,
  },
  kanban_search: {
    category: 'kanban',
    requiredLevel: 'read',
    dangerous: false,
    auditLog: false,
  },
  kanban_sync_board: {
    category: 'kanban',
    requiredLevel: 'write',
    dangerous: false,
    auditLog: true,
  },

  // GitHub operations
  github_apply_patch: {
    category: 'github',
    requiredLevel: 'write',
    dangerous: true,
    auditLog: true,
  },
  github_contents_write: {
    category: 'github',
    requiredLevel: 'write',
    dangerous: true,
    auditLog: true,
  },
  github_pr_review_submit: {
    category: 'github',
    requiredLevel: 'write',
    dangerous: true,
    auditLog: true,
  },
  github_review_open_pull_request: {
    category: 'github',
    requiredLevel: 'write',
    dangerous: true,
    auditLog: true,
  },
  github_review_commit: {
    category: 'github',
    requiredLevel: 'write',
    dangerous: true,
    auditLog: true,
  },
  github_review_push: {
    category: 'github',
    requiredLevel: 'write',
    dangerous: true,
    auditLog: true,
  },

  // Process management
  process_enqueue_task: {
    category: 'process',
    requiredLevel: 'write',
    dangerous: true,
    auditLog: true,
  },
  process_stop: {
    category: 'process',
    requiredLevel: 'delete',
    dangerous: true,
    auditLog: true,
  },
  process_update_task_runner_config: {
    category: 'process',
    requiredLevel: 'admin',
    requiredRoles: ['admin'],
    dangerous: true,
    auditLog: true,
  },

  // Sandbox operations
  sandbox_create: {
    category: 'sandbox',
    requiredLevel: 'write',
    dangerous: true,
    auditLog: true,
  },
  sandbox_delete: {
    category: 'sandbox',
    requiredLevel: 'delete',
    dangerous: true,
    auditLog: true,
  },

  // System operations
  apply_patch: {
    category: 'system',
    requiredLevel: 'write',
    dangerous: true,
    auditLog: true,
  },
  pnpm_add: {
    category: 'system',
    requiredLevel: 'write',
    dangerous: true,
    auditLog: true,
  },
  pnpm_remove: {
    category: 'system',
    requiredLevel: 'delete',
    dangerous: true,
    auditLog: true,
  },
  nx_generate_package: {
    category: 'system',
    requiredLevel: 'write',
    dangerous: true,
    auditLog: true,
  },

  // Meta tools - generally safe
  mcp_help: {
    category: 'meta',
    requiredLevel: 'read',
    dangerous: false,
    auditLog: false,
  },
  mcp_toolset: {
    category: 'meta',
    requiredLevel: 'read',
    dangerous: false,
    auditLog: false,
  },
  mcp_endpoints: {
    category: 'meta',
    requiredLevel: 'read',
    dangerous: false,
    auditLog: false,
  },
  mcp_validate_config: {
    category: 'meta',
    requiredLevel: 'read',
    dangerous: false,
    auditLog: false,
  },
} as const;

/**
 * In-memory audit log (in production, use persistent storage)
 */
class AuditLogger {
  private entries: AuditLogEntry[] = [];
  private maxSize = 10000; // Keep last 10k entries

  log(entry: AuditLogEntry): void {
    this.entries.push(entry);

    // Trim old entries
    if (this.entries.length > this.maxSize) {
      this.entries = this.entries.slice(-this.maxSize);
    }

    // Log to console for immediate visibility
    const level = entry.result === 'denied' ? 'WARN' : 'INFO';
    console.log(
      `[AUDIT:${level}] ${entry.timestamp.toISOString()} ${entry.userId}:${entry.role} ${entry.toolName} ${entry.action} ${entry.result}${entry.reason ? ` - ${entry.reason}` : ''}`,
    );
  }

  getRecent(count: number = 100): readonly AuditLogEntry[] {
    return this.entries.slice(-count);
  }

  getByUser(userId: string, count: number = 100): readonly AuditLogEntry[] {
    return this.entries.filter((entry) => entry.userId === userId).slice(-count);
  }

  getDenied(count: number = 100): readonly AuditLogEntry[] {
    return this.entries.filter((entry) => entry.result === 'denied').slice(-count);
  }
}

export const auditLogger = new AuditLogger();

/**
 * Check if a role has sufficient hierarchy level
 */
function hasRequiredRole(userRole: UserRole, requiredRoles?: readonly UserRole[]): boolean {
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  const userLevel = ROLE_HIERARCHY[userRole];
  return requiredRoles.some((requiredRole) => ROLE_HIERARCHY[requiredRole] <= userLevel);
}

/**
 * Check if a role has the required permission level
 */
function hasRequiredPermission(userRole: UserRole, requiredLevel: PermissionLevel): boolean {
  const userPermissions = DEFAULT_ROLE_PERMISSIONS[userRole];
  const requiredIndex = getPermissionLevelIndex(requiredLevel);

  return userPermissions.some((permission) => getPermissionLevelIndex(permission) >= requiredIndex);
}

/**
 * Get numeric index for permission level comparison
 */
function getPermissionLevelIndex(level: PermissionLevel): number {
  switch (level) {
    case 'read':
      return 0;
    case 'write':
      return 1;
    case 'delete':
      return 2;
    case 'admin':
      return 3;
    default:
      return -1;
  }
}

/**
 * Extract user context from environment or headers
 */
function extractAuthContext(ctx: ToolContext): AuthContext {
  // In a real implementation, this would extract from JWT tokens,
  // API keys, or other authentication mechanisms

  const env = ctx.env;

  // For now, use environment variables as a simple auth mechanism
  // In production, replace with proper authentication
  const userId = env.MCP_USER_ID || 'anonymous';
  const userRole = (env.MCP_USER_ROLE as UserRole) || 'guest';
  const sessionToken = env.MCP_SESSION_TOKEN;
  const ipAddress = env.REMOTE_ADDR;
  const userAgent = env.USER_AGENT;

  // Validate role
  if (!['guest', 'user', 'developer', 'admin'].includes(userRole)) {
    throw new Error(`Invalid user role: ${userRole}`);
  }

  return {
    userId,
    role: userRole,
    permissions: DEFAULT_ROLE_PERMISSIONS[userRole],
    sessionToken,
    ipAddress,
    userAgent,
  };
}

/**
 * Authorize a tool invocation
 */
function authorizeTool(
  toolName: string,
  authContext: AuthContext,
  _args: unknown,
): { allowed: boolean; reason?: string } {
  const requirements = TOOL_AUTH_REQUIREMENTS[toolName];

  if (!requirements) {
    // Default to safe if tool not explicitly configured
    return { allowed: true };
  }

  // Check role requirements
  if (!hasRequiredRole(authContext.role, requirements.requiredRoles)) {
    return {
      allowed: false,
      reason: `Role '${authContext.role}' not in required roles: ${requirements.requiredRoles?.join(', ') || 'none'}`,
    };
  }

  // Check permission level
  if (!hasRequiredPermission(authContext.role, requirements.requiredLevel)) {
    return {
      allowed: false,
      reason: `Role '${authContext.role}' lacks required permission level: ${requirements.requiredLevel}`,
    };
  }

  // Additional checks for dangerous operations
  if (requirements.dangerous && authContext.role === 'guest') {
    return {
      allowed: false,
      reason: 'Guest users cannot perform dangerous operations',
    };
  }

  return { allowed: true };
}

/**
 * Create an authorized tool factory wrapper
 */
export function createAuthorizedToolFactory(
  originalFactory: ToolFactory,
  toolName: string,
): ToolFactory {
  return (ctx: ToolContext): Tool => {
    const originalTool = originalFactory(ctx);

    const authorizedInvoke = async (args: unknown): Promise<unknown> => {
      const authContext = extractAuthContext(ctx);
      const authResult = authorizeTool(toolName, authContext, args);

      const auditEntry: AuditLogEntry = {
        timestamp: new Date(),
        userId: authContext.userId,
        role: authContext.role,
        toolName,
        action: 'invoke',
        args,
        result: authResult.allowed ? 'allowed' : 'denied',
        reason: authResult.reason,
        ipAddress: authContext.ipAddress,
        userAgent: authContext.userAgent,
      };

      // Always log the attempt
      auditLogger.log(auditEntry);

      if (!authResult.allowed) {
        throw new Error(`Authorization denied: ${authResult.reason}`);
      }

      // Proceed with the original tool invocation
      try {
        const result = await originalTool.invoke(args);

        // Log successful completion for dangerous operations
        const requirements = TOOL_AUTH_REQUIREMENTS[toolName];
        if (requirements?.auditLog) {
          auditLogger.log({
            ...auditEntry,
            action: 'complete',
            result: 'allowed',
          });
        }

        return result;
      } catch (error) {
        // Log errors for dangerous operations
        const requirements = TOOL_AUTH_REQUIREMENTS[toolName];
        if (requirements?.auditLog) {
          auditLogger.log({
            ...auditEntry,
            action: 'error',
            result: 'allowed',
          });
        }

        throw error;
      }
    };

    return {
      spec: {
        ...originalTool.spec,
        description: `${originalTool.spec.description} [Authorization required]`,
      },
      invoke: authorizedInvoke,
    };
  };
}

/**
 * Apply authorization to all tool factories
 */
export function applyAuthorization(
  factories: readonly ToolFactory[],
  toolNames: readonly string[],
): readonly ToolFactory[] {
  return factories.map((factory, index) => {
    const toolName = toolNames[index];
    if (!toolName) {
      throw new Error(`Tool name not found for factory at index ${index}`);
    }
    return createAuthorizedToolFactory(factory, toolName);
  });
}

/**
 * Get authorization requirements for a tool
 */
export function getToolAuthRequirements(toolName: string): ToolAuthRequirements | undefined {
  return TOOL_AUTH_REQUIREMENTS[toolName];
}

/**
 * Get all tools requiring specific permission level
 */
export function getToolsByPermissionLevel(level: PermissionLevel): readonly string[] {
  return Object.entries(TOOL_AUTH_REQUIREMENTS)
    .filter(([, req]) => req.requiredLevel === level)
    .map(([name]) => name);
}

/**
 * Get all dangerous tools
 */
export function getDangerousTools(): readonly string[] {
  return Object.entries(TOOL_AUTH_REQUIREMENTS)
    .filter(([, req]) => req.dangerous)
    .map(([name]) => name);
}
