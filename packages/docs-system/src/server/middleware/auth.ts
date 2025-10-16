/**
 * Authentication and authorization middleware
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ResponseHelper, Logger, ConfigManager } from '../../shared/index.js';
import { DocsSystemError, AuthenticationError, AuthorizationError } from '../../types/index.js';
import { getCollection } from '../database/connection.js';

const logger = Logger.getInstance();
const config = ConfigManager.getInstance();

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        username: string;
        role: string;
      };
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Skip authentication for health check and API docs
  if (req.path === '/health' || req.path.startsWith('/api-docs')) {
    return next();
  }

  const token = extractToken(req);

  if (!token) {
    const error = new AuthenticationError('No authentication token provided');
    const response = ResponseHelper.error(error);
    res.status(401).json(response);
    return;
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    logger.warn('Invalid authentication token', {
      error: error instanceof Error ? error.message : 'Unknown error',
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });

    const authError = new AuthenticationError('Invalid authentication token');
    const response = ResponseHelper.error(authError);
    res.status(401).json(response);
  }
}

export function requireRole(requiredRole: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      const error = new AuthenticationError('User not authenticated');
      const response = ResponseHelper.error(error);
      res.status(401).json(response);
      return;
    }

    if (req.user.role !== requiredRole && req.user.role !== 'admin') {
      const error = new AuthorizationError(`Requires ${requiredRole} role`);
      const response = ResponseHelper.error(error);
      res.status(403).json(response);
      return;
    }

    next();
  };
}

export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  const token = extractToken(req);

  if (!token) {
    return next();
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
  } catch (error) {
    // Optional auth fails silently - just continue without user
    logger.debug('Optional authentication failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  next();
}

function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Also check for token in query parameters (for WebSocket connections)
  if (req.query.token && typeof req.query.token === 'string') {
    return req.query.token;
  }

  return null;
}

function verifyToken(token: string) {
  const authConfig = config.getAuthConfig();

  try {
    const decoded = jwt.verify(token, authConfig.jwtSecret) as any;

    // Validate token structure
    if (!decoded.id || !decoded.email || !decoded.username) {
      throw new AuthenticationError('Invalid token structure');
    }

    return {
      id: decoded.id,
      email: decoded.email,
      username: decoded.username,
      role: decoded.role || 'user',
    };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AuthenticationError('Token expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new AuthenticationError('Invalid token');
    } else {
      throw new AuthenticationError('Token verification failed');
    }
  }
}

// Rate limiting by user
export function createUserRateLimit(maxRequests: number, windowMs: number) {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(); // Skip rate limiting for unauthenticated requests (handled by global rate limiter)
    }

    const userId = req.user.id;
    const now = Date.now();
    const userRequests = requests.get(userId);

    if (!userRequests || now > userRequests.resetTime) {
      // Reset or initialize counter
      requests.set(userId, {
        count: 1,
        resetTime: now + windowMs,
      });
      return next();
    }

    if (userRequests.count >= maxRequests) {
      const error = new DocsSystemError('Too many requests', 'RATE_LIMIT_EXCEEDED', 429, {
        limit: maxRequests,
        windowMs,
        retryAfter: Math.ceil((userRequests.resetTime - now) / 1000),
      });
      const response = ResponseHelper.error(error);
      res.status(429).json(response);
      return;
    }

    userRequests.count++;
    next();
  };
}

// Validate user exists and is active
export async function validateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.user) {
    return next();
  }

  try {
    const usersCollection = getCollection('users');
    const user = await usersCollection.findOne(
      { _id: req.user.id, isActive: true },
      { projection: { _id: 1, email: 1, username: 1, role: 1, isActive: 1 } },
    );

    if (!user) {
      const error = new AuthenticationError('User not found or inactive');
      const response = ResponseHelper.error(error);
      res.status(401).json(response);
      return;
    }

    // Update user object with latest data
    req.user = {
      id: user._id.toString(),
      email: user.email,
      username: user.username,
      role: user.role,
    };

    next();
  } catch (error) {
    logger.error('Error validating user', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.user.id,
    });

    const serverError = new DocsSystemError('User validation failed', 'INTERNAL_SERVER_ERROR');
    const response = ResponseHelper.error(serverError);
    res.status(500).json(response);
  }
}
