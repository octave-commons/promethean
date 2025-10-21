/**
 * Rate limiting middleware
 */

import { Request, Response, NextFunction } from 'express';
import { ResponseHelper, Logger } from '../../shared/index.js';
import { DocsSystemError } from '../../types/index.js';

const logger = Logger.getInstance();

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory store for rate limits (in production, use Redis)
const store: RateLimitStore = {};

export function rateLimitMiddleware(req: Request, res: Response, next: NextFunction): void {
  const clientId = getClientId(req);
  const now = Date.now();

  // Rate limit configuration
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 100; // requests per window per IP

  const clientData = store[clientId];

  if (!clientData || now > clientData.resetTime) {
    // First request or window expired
    store[clientId] = {
      count: 1,
      resetTime: now + windowMs,
    };
    return next();
  }

  if (clientData.count >= maxRequests) {
    const retryAfter = Math.ceil((clientData.resetTime - now) / 1000);

    logger.warn('Rate limit exceeded', {
      clientId,
      count: clientData.count,
      limit: maxRequests,
      retryAfter,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });

    const error = new DocsSystemError('Too many requests', 'RATE_LIMIT_EXCEEDED', 429, {
      limit: maxRequests,
      windowMs,
      retryAfter,
    });

    const response = ResponseHelper.error(error);
    res.status(429).set('Retry-After', retryAfter.toString()).json(response);
    return;
  }

  clientData.count++;
  next();
}

function getClientId(req: Request): string {
  // Use IP address as client identifier
  return req.ip || req.socket?.remoteAddress || 'unknown';
}

// Clean up expired entries periodically
setInterval(
  () => {
    const now = Date.now();
    let cleaned = 0;

    for (const key in store) {
      if (now > store[key].resetTime) {
        delete store[key];
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.debug(`Cleaned up ${cleaned} expired rate limit entries`);
    }
  },
  5 * 60 * 1000,
); // Clean up every 5 minutes

// Stricter rate limiting for authentication endpoints
export function authRateLimit(req: Request, res: Response, next: NextFunction): void {
  const clientId = getClientId(req);
  const now = Date.now();

  // Stricter limits for auth endpoints
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 5; // only 5 auth attempts per window per IP

  const clientData = store[`auth_${clientId}`];

  if (!clientData || now > clientData.resetTime) {
    store[`auth_${clientId}`] = {
      count: 1,
      resetTime: now + windowMs,
    };
    return next();
  }

  if (clientData.count >= maxRequests) {
    const retryAfter = Math.ceil((clientData.resetTime - now) / 1000);

    logger.warn('Auth rate limit exceeded', {
      clientId,
      count: clientData.count,
      limit: maxRequests,
      retryAfter,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });

    const error = new DocsSystemError(
      'Too many authentication attempts',
      'AUTH_RATE_LIMIT_EXCEEDED',
      429,
      {
        limit: maxRequests,
        windowMs,
        retryAfter,
      },
    );

    const response = ResponseHelper.error(error);
    res.status(429).set('Retry-After', retryAfter.toString()).json(response);
    return;
  }

  clientData.count++;
  next();
}
