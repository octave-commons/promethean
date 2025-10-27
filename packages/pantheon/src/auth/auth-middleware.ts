import { SecurityContext } from './types.js';
import { SessionManager } from './session-manager.js';

/**
 * Authentication request interface
 */
export interface AuthenticatedRequest {
  headers: Record<string, string>;
  query?: Record<string, string | string[] | undefined>;
  cookies?: Record<string, string>;
  user?: SecurityContext;
}

/**
 * Authentication response
 */
export interface AuthResponse {
  success: boolean;
  user?: SecurityContext;
  error?: string;
  errorCode?: string;
}

/**
 * Create authentication middleware for CLI operations
 */
export const createCliAuthMiddleware = (sessionManager: SessionManager) => {
  return {
    /**
     * Authenticate request using token
     */
    authenticate: (req: AuthenticatedRequest): AuthResponse => {
      const token = extractTokenFromRequest(req);

      if (!token) {
        return {
          success: false,
          error: 'Authentication required',
          errorCode: 'AUTH_REQUIRED',
        };
      }

      const securityContext = sessionManager.validateSession(token);

      if (!securityContext) {
        return {
          success: false,
          error: 'Invalid or expired session',
          errorCode: 'SESSION_EXPIRED',
        };
      }

      // Attach security context to request
      req.user = securityContext;

      return {
        success: true,
        user: securityContext,
      };
    },

    /**
     * Check if request has specific permission
     */
    hasPermission: (req: AuthenticatedRequest, permission: string): boolean => {
      if (!req.user) {
        return false;
      }
      return req.user.permissions.includes(permission);
    },

    /**
     * Check if request has specific role
     */
    hasRole: (req: AuthenticatedRequest, role: string): boolean => {
      if (!req.user) {
        return false;
      }
      return req.user.roles.includes(role as any);
    },

    /**
     * Require authentication for CLI operations
     */
    requireAuth: (req: AuthenticatedRequest): SecurityContext => {
      if (!req.user) {
        throw new Error('Authentication required. Please login first.');
      }
      return req.user;
    },

    /**
     * Require specific permission for CLI operations
     */
    requirePermission: (req: AuthenticatedRequest, permission: string): SecurityContext => {
      const context = req.user;
      if (!context || !context.permissions.includes(permission)) {
        throw new Error(`Permission required: ${permission}`);
      }
      return context;
    },

    /**
     * Require specific role for CLI operations
     */
    requireRole: (req: AuthenticatedRequest, role: string): SecurityContext => {
      const context = req.user;
      if (!context || !context.roles.includes(role as any)) {
        throw new Error(`Role required: ${role}`);
      }
      return context;
    },
  };
};

/**
 * Extract token from request
 */
const extractTokenFromRequest = (req: AuthenticatedRequest): string | null => {
  // Try Authorization header first
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Try query parameter
  if (req.query && req.query.token) {
    const token = Array.isArray(req.query.token) ? req.query.token[0] : req.query.token;
    return token || null;
  }

  // Try cookie
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }

  return null;
};

/**
 * CLI authentication helper
 */
export class CliAuthManager {
  private sessionManager: SessionManager;
  private currentSession: SecurityContext | null = null;
  private middleware: ReturnType<typeof createCliAuthMiddleware>;

  constructor(sessionManager: SessionManager) {
    this.sessionManager = sessionManager;
    this.middleware = createCliAuthMiddleware(sessionManager);
  }

  /**
   * Authenticate CLI session using token
   */
  authenticate(token: string): AuthResponse {
    const req: AuthenticatedRequest = {
      headers: { authorization: `Bearer ${token}` },
    };

    return this.middleware.authenticate(req);
  }

  /**
   * Get current security context
   */
  getCurrentContext(): SecurityContext | null {
    return this.currentSession;
  }

  /**
   * Check if current user has permission
   */
  hasPermission(permission: string): boolean {
    if (!this.currentSession) {
      return false;
    }
    return this.currentSession.permissions.includes(permission);
  }

  /**
   * Check if current user has role
   */
  hasRole(role: string): boolean {
    if (!this.currentSession) {
      return false;
    }
    return this.currentSession.roles.includes(role as any);
  }

  /**
   * Logout current session
   */
  logout(): boolean {
    if (!this.currentSession) {
      return false;
    }

    const success = this.sessionManager.destroySession(this.currentSession.sessionId);
    this.currentSession = null;
    return success;
  }

  /**
   * Require authentication for CLI operations
   */
  requireAuth(): SecurityContext {
    if (!this.currentSession) {
      throw new Error('Authentication required. Please login first.');
    }
    return this.currentSession;
  }

  /**
   * Require specific permission for CLI operations
   */
  requirePermission(permission: string): SecurityContext {
    const context = this.requireAuth();
    if (!context.permissions.includes(permission)) {
      throw new Error(`Permission required: ${permission}`);
    }
    return context;
  }

  /**
   * Require specific role for CLI operations
   */
  requireRole(role: string): SecurityContext {
    const context = this.requireAuth();
    if (!context.roles.includes(role as any)) {
      throw new Error(`Role required: ${role}`);
    }
    return context;
  }

  /**
   * Get middleware instance
   */
  getMiddleware() {
    return this.middleware;
  }
}

/**
 * Default CLI auth manager instance
 */
let defaultCliAuthManager: CliAuthManager | null = null;

export const getDefaultCliAuthManager = (): CliAuthManager => {
  if (!defaultCliAuthManager) {
    const { getDefaultSessionManager } = require('./session-manager.js');
    defaultCliAuthManager = new CliAuthManager(getDefaultSessionManager());
  }
  return defaultCliAuthManager;
};

/**
 * Initialize CLI auth manager with custom session manager
 */
export const initializeCliAuthManager = (sessionManager: SessionManager): CliAuthManager => {
  defaultCliAuthManager = new CliAuthManager(sessionManager);
  return defaultCliAuthManager;
};
