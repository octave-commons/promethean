import { User, Session, SecurityContext } from './types.js';
import { JwtHandler } from './jwt-handler.js';

/**
 * Extended session interface for internal use
 */
interface ExtendedSession extends Session {
  token: string;
  user: User;
}

/**
 * Session Manager for Pantheon - replaces global state with secure session management
 */
export class SessionManager {
  private sessions: Map<string, ExtendedSession> = new Map();
  private userSessions: Map<string, string[]> = new Map(); // userId -> sessionIds
  private jwtHandler: JwtHandler;

  constructor(jwtHandler: JwtHandler) {
    this.jwtHandler = jwtHandler;
  }

  /**
   * Create a new session for a user
   */
  createSession(user: User, metadata?: { ipAddress?: string; userAgent?: string }): Session {
    const sessionId = this.jwtHandler.generateSessionId();
    const token = this.jwtHandler.generateToken(user, sessionId);

    const extendedSession: ExtendedSession = {
      id: sessionId,
      userId: user.id,
      createdAt: new Date(),
      lastActivity: new Date(),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
      token,
      user,
    };

    this.sessions.set(sessionId, extendedSession);

    // Track user sessions
    const userSessionList = this.userSessions.get(user.id) || [];
    userSessionList.push(sessionId);
    this.userSessions.set(user.id, userSessionList);

    // Return base Session interface (without token and user)
    return {
      id: extendedSession.id,
      userId: extendedSession.userId,
      createdAt: extendedSession.createdAt,
      lastActivity: extendedSession.lastActivity,
      expiresAt: extendedSession.expiresAt,
      ipAddress: extendedSession.ipAddress,
      userAgent: extendedSession.userAgent,
    };
  }

  /**
   * Get extended session by ID (internal use)
   */
  private getExtendedSession(sessionId: string): ExtendedSession | null {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return null;
    }

    // Check if session is expired
    if (session.expiresAt < new Date()) {
      this.destroySession(sessionId);
      return null;
    }

    return session;
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: string): Session | null {
    const extendedSession = this.getExtendedSession(sessionId);
    if (!extendedSession) {
      return null;
    }

    // Update last activity time
    extendedSession.lastActivity = new Date();

    // Return base Session interface
    return {
      id: extendedSession.id,
      userId: extendedSession.userId,
      createdAt: extendedSession.createdAt,
      lastActivity: extendedSession.lastActivity,
      expiresAt: extendedSession.expiresAt,
      ipAddress: extendedSession.ipAddress,
      userAgent: extendedSession.userAgent,
    };
  }

  /**
   * Get session by token
   */
  getSessionByToken(token: string): Session | null {
    const securityContext = this.jwtHandler.extractSecurityContext(token);
    if (!securityContext) {
      return null;
    }

    return this.getSession(securityContext.sessionId);
  }

  /**
   * Validate session and return security context
   */
  validateSession(token: string): SecurityContext | null {
    const securityContext = this.jwtHandler.extractSecurityContext(token);
    if (!securityContext) {
      return null;
    }

    const extendedSession = this.getExtendedSession(securityContext.sessionId);
    if (!extendedSession) {
      return null;
    }

    // Update last activity time
    extendedSession.lastActivity = new Date();

    return securityContext;
  }

  /**
   * Destroy a session
   */
  destroySession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return false;
    }

    // Remove from sessions map
    this.sessions.delete(sessionId);

    // Remove from user sessions
    const userSessionList = this.userSessions.get(session.userId) || [];
    const index = userSessionList.indexOf(sessionId);
    if (index > -1) {
      userSessionList.splice(index, 1);
      if (userSessionList.length === 0) {
        this.userSessions.delete(session.userId);
      } else {
        this.userSessions.set(session.userId, userSessionList);
      }
    }

    return true;
  }

  /**
   * Destroy all sessions for a user
   */
  destroyUserSessions(userId: string): number {
    const userSessionList = this.userSessions.get(userId) || [];
    let destroyedCount = 0;

    for (const sessionId of userSessionList) {
      if (this.sessions.has(sessionId)) {
        this.sessions.delete(sessionId);
        destroyedCount++;
      }
    }

    this.userSessions.delete(userId);
    return destroyedCount;
  }

  /**
   * Refresh session token
   */
  refreshSession(token: string, user: User): Session | null {
    const securityContext = this.jwtHandler.extractSecurityContext(token);
    if (!securityContext) {
      return null;
    }

    const extendedSession = this.getExtendedSession(securityContext.sessionId);
    if (!extendedSession) {
      return null;
    }

    // Generate new token
    const newToken = this.jwtHandler.generateToken(user, extendedSession.id);

    // Update session
    extendedSession.token = newToken;
    extendedSession.lastActivity = new Date();
    extendedSession.expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Return base Session interface
    return {
      id: extendedSession.id,
      userId: extendedSession.userId,
      createdAt: extendedSession.createdAt,
      lastActivity: extendedSession.lastActivity,
      expiresAt: extendedSession.expiresAt,
      ipAddress: extendedSession.ipAddress,
      userAgent: extendedSession.userAgent,
    };
  }

  /**
   * Clean up expired sessions
   */
  cleanupExpiredSessions(): number {
    let cleanedCount = 0;
    const now = new Date();

    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.expiresAt < now) {
        this.destroySession(sessionId);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }

  /**
   * Get all active sessions for a user
   */
  getUserSessions(userId: string): Session[] {
    const userSessionList = this.userSessions.get(userId) || [];
    const sessions: Session[] = [];

    for (const sessionId of userSessionList) {
      const session = this.getSession(sessionId);
      if (session) {
        sessions.push(session);
      }
    }

    return sessions;
  }

  /**
   * Get session statistics
   */
  getSessionStats(): {
    totalSessions: number;
    activeUsers: number;
    expiredSessions: number;
  } {
    const now = new Date();
    let expiredCount = 0;

    for (const session of this.sessions.values()) {
      if (session.expiresAt < now) {
        expiredCount++;
      }
    }

    return {
      totalSessions: this.sessions.size,
      activeUsers: this.userSessions.size,
      expiredSessions: expiredCount,
    };
  }
}

/**
 * Default session manager instance
 */
let defaultSessionManager: SessionManager | null = null;

export const getDefaultSessionManager = (): SessionManager => {
  if (!defaultSessionManager) {
    // Use dynamic import to avoid circular dependency
    import('./jwt-handler.js').then(({ getDefaultJwtHandler }) => {
      defaultSessionManager = new SessionManager(getDefaultJwtHandler());
    });
  }
  if (!defaultSessionManager) {
    throw new Error('Session manager not initialized');
  }
  return defaultSessionManager;
};

/**
 * Initialize session manager with custom JWT handler
 */
export const initializeSessionManager = (jwtHandler: JwtHandler): SessionManager => {
  defaultSessionManager = new SessionManager(jwtHandler);
  return defaultSessionManager;
};
