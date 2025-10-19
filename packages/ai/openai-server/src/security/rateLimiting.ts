import type { FastifyRequest, FastifyReply } from "fastify";
import type { RateLimitConfig, SecurityContext } from "../types/security.js";

/**
 * In-memory rate limiting implementation
 */
class MemoryStore {
  private readonly store = new Map<string, { count: number; resetTime: number }>();

  get(key: string): { count: number; resetTime: number } | undefined {
    const entry = this.store.get(key);
    if (!entry) {
      return undefined;
    }

    // Clean up expired entries
    if (Date.now() > entry.resetTime) {
      this.store.delete(key);
      return undefined;
    }

    return entry;
  }

  set(key: string, value: { count: number; resetTime: number }): void {
    this.store.set(key, value);
  }

  increment(key: string, windowMs: number): { count: number; resetTime: number } {
    const now = Date.now();
    const existing = this.get(key);

    if (existing) {
      const updated = { ...existing, count: existing.count + 1 };
      this.set(key, updated);
      return updated;
    }

    const newEntry = { count: 1, resetTime: now + windowMs };
    this.set(key, newEntry);
    return newEntry;
  }

  // Cleanup expired entries periodically
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
    }
  }
}

/**
 * Multi-layer rate limiting implementation
 */
export class RateLimitingService {
  private readonly config: RateLimitConfig;
  private readonly store: MemoryStore;
  private cleanupInterval: NodeJS.Timeout;

  constructor(config: RateLimitConfig) {
    this.config = config;
    this.store = new MemoryStore();
    
    // Cleanup expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.store.cleanup();
    }, 60 * 1000);
  }

  /**
   * Parse time window string to milliseconds
   */
  private parseWindow(window: string): number {
    const match = window.match(/^(\d+)([smhd])$/);
    if (!match) {
      throw new Error(`Invalid window format: ${window}`);
    }

    const [, value, unit] = match;
    const num = parseInt(value, 10);

    switch (unit) {
      case "s":
        return num * 1000;
      case "m":
        return num * 60 * 1000;
      case "h":
        return num * 60 * 60 * 1000;
      case "d":
        return num * 24 * 60 * 60 * 1000;
      default:
        throw new Error(`Unknown time unit: ${unit}`);
    }
  }

  /**
   * Generate rate limit key for different scopes
   */
  private generateKey(
    request: FastifyRequest,
    scope: "global" | "user" | "endpoint",
  ): string {
    switch (scope) {
      case "global":
        return "global";
      case "user":
        const securityContext = (request as any).securityContext as SecurityContext;
        return securityContext ? `user:${securityContext.user.id}` : `ip:${request.ip}`;
      case "endpoint":
        const endpointKey = `${request.method}:${request.routeOptions.url}`;
        const userContext = (request as any).securityContext as SecurityContext;
        return userContext 
          ? `endpoint:${endpointKey}:user:${userContext.user.id}`
          : `endpoint:${endpointKey}:ip:${request.ip}`;
    }
  }

  /**
   * Check if request should be rate limited
   */
  async checkRateLimit(
    request: FastifyRequest,
    scope: "global" | "user" | "endpoint",
  ): Promise<{
    allowed: boolean;
    limit: number;
    remaining: number;
    resetTime: number;
  }> {
    const config = this.config[scope];
    const windowMs = this.parseWindow(config.window);
    const key = this.generateKey(request, scope);
    
    const entry = this.store.increment(key, windowMs);
    const limit = this.getEffectiveLimit(request, scope);
    const remaining = Math.max(0, limit - entry.count);
    const allowed = entry.count <= limit;

    return {
      allowed,
      limit,
      remaining,
      resetTime: entry.resetTime,
    };
  }

  /**
   * Get effective rate limit for request (considering user overrides)
   */
  private getEffectiveLimit(
    request: FastifyRequest,
    scope: "global" | "user" | "endpoint",
  ): number {
    const securityContext = (request as any).securityContext as SecurityContext;
    
    if (securityContext?.rateLimitOverride && scope === "user") {
      return securityContext.rateLimitOverride;
    }

    return this.config[scope].max;
  }

  /**
   * Create rate limiting middleware for Fastify
   */
  createRateLimitMiddleware(options: {
    scopes?: ReadonlyArray<"global" | "user" | "endpoint">;
    skipSuccessfulRequests?: boolean;
    skipFailedRequests?: boolean;
  } = {}) {
    const {
      scopes = ["global", "user", "endpoint"],
      skipSuccessfulRequests = this.config.skipSuccessfulRequests,
      skipFailedRequests = this.config.skipFailedRequests,
    } = options;

    return async (request: FastifyRequest, reply: FastifyReply) => {
      // Check all configured scopes
      for (const scope of scopes) {
        const result = await this.checkRateLimit(request, scope);
        
        // Set rate limit headers
        reply.header("X-RateLimit-Limit", result.limit);
        reply.header("X-RateLimit-Remaining", result.remaining);
        reply.header("X-RateLimit-Reset", Math.ceil(result.resetTime / 1000));

        if (!result.allowed) {
          reply.header("Retry-After", Math.ceil((result.resetTime - Date.now()) / 1000));
          
          return reply.status(429).send({
            error: "Rate limit exceeded",
            code: "RATE_LIMIT_EXCEEDED",
            scope,
            limit: result.limit,
            resetTime: result.resetTime,
          });
        }
      }

      // Hook into request completion to update counters if needed
      if (skipSuccessfulRequests || skipFailedRequests) {
        const originalSend = reply.send.bind(reply);
        reply.send = (payload: any) => {
          const statusCode = reply.statusCode;
          const shouldSkip = 
            (skipSuccessfulRequests && statusCode >= 200 && statusCode < 300) ||
            (skipFailedRequests && statusCode >= 400);

          if (shouldSkip) {
            // Decrement counters for this request
            for (const scope of scopes) {
              const key = this.generateKey(request, scope);
              const entry = this.store.get(key);
              if (entry && entry.count > 0) {
                entry.count--;
              }
            }
          }

          return originalSend(payload);
        };
      }
    };
  }

  /**
   * Get current rate limit status for a user/IP
   */
  async getRateLimitStatus(
    request: FastifyRequest,
  ): Promise<{
    global: { limit: number; used: number; remaining: number; resetTime: number };
    user: { limit: number; used: number; remaining: number; resetTime: number };
    endpoint: { limit: number; used: number; remaining: number; resetTime: number };
  }> {
    const scopes: Array<"global" | "user" | "endpoint"> = ["global", "user", "endpoint"];
    const result: any = {};

    for (const scope of scopes) {
      const config = this.config[scope];
      const windowMs = this.parseWindow(config.window);
      const key = this.generateKey(request, scope);
      const entry = this.store.get(key) || { count: 0, resetTime: Date.now() + windowMs };
      const limit = this.getEffectiveLimit(request, scope);
      const remaining = Math.max(0, limit - entry.count);

      result[scope] = {
        limit,
        used: entry.count,
        remaining,
        resetTime: entry.resetTime,
      };
    }

    return result;
  }

  /**
   * Cleanup method to prevent memory leaks
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.store.cleanup();
  }
}