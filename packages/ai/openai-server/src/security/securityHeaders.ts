import type { FastifyReply } from "fastify";
import type { SecurityHeaders, SecurityConfig } from "../types/security.js";

/**
 * Security headers middleware implementation
 */
export class SecurityHeadersService {
  private readonly config: SecurityConfig["headers"];

  constructor(config: SecurityConfig["headers"]) {
    this.config = config;
  }

  /**
   * Get default security headers
   */
  private getDefaultHeaders(): SecurityHeaders {
    const headers: SecurityHeaders = {
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    };

    // Add Content Security Policy if enabled
    if (this.config.enabled) {
      headers["Content-Security-Policy"] = this.config.contentSecurityPolicy || this.getDefaultCSP();
    }

    // Add HSTS for HTTPS (only in production)
    if (process.env.NODE_ENV === "production") {
      headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload";
    }

    return headers;
  }

  /**
   * Get default Content Security Policy
   */
  private getDefaultCSP(): string {
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Allow inline scripts for Swagger UI
      "style-src 'self' 'unsafe-inline'", // Allow inline styles for Swagger UI
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ");
  }

  /**
   * Apply security headers to response
   */
  applySecurityHeaders(reply: FastifyReply): void {
    if (!this.config.enabled) {
      return;
    }

    const headers = this.getDefaultHeaders();
    
    for (const [name, value] of Object.entries(headers)) {
      if (value !== undefined) {
        reply.header(name, value);
      }
    }

    // Remove potentially harmful headers
    reply.removeHeader("X-Powered-By");
    reply.removeHeader("Server");
  }

  /**
   * Create security headers middleware for Fastify
   */
  createSecurityHeadersMiddleware() {
    return async (request: any, reply: FastifyReply) => {
      this.applySecurityHeaders(reply);
    };
  }

  /**
   * Get current security headers configuration
   */
  getHeaders(): SecurityHeaders {
    return this.getDefaultHeaders();
  }

  /**
   * Update Content Security Policy
   */
  updateCSP(csp: string): void {
    this.config.contentSecurityPolicy = csp;
  }
}