/**
 * Type augmentation for @fastify/cookie
 *
 * This file provides type declarations for the cookie methods added by @fastify/cookie.
 * Required because the package's types are not automatically discovered.
 */

import 'fastify';

declare module 'fastify' {
  interface FastifyInstance {
    serializeCookie(name: string, value: string, options?: Record<string, unknown>): string;
    parseCookie(cookieHeader: string): Record<string, string>;
  }

  interface FastifyRequest {
    cookies: Record<string, string | undefined>;
  }

  interface FastifyReply {
    cookies: Record<string, string | undefined>;
    setCookie(name: string, value: string, options?: Record<string, unknown>): FastifyReply;
    cookie(name: string, value: string, options?: Record<string, unknown>): this;
    clearCookie(name: string, options?: Record<string, unknown>): this;
  }
}
