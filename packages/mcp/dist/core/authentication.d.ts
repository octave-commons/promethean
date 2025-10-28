/**
 * MCP Authentication System
 *
 * Provides JWT and API key based authentication for the MCP server.
 * This complements the existing authorization system.
 */
import { type JwtPayload } from 'jsonwebtoken';
import type { FastifyRequest, FastifyReply } from 'fastify';
import type { ToolContext } from './types.js';
import type { UserRole } from './authorization.js';
export interface JwtConfig {
    secret: string;
    expiresIn: string;
    issuer: string;
    audience: string;
}
export interface ApiKeyConfig {
    keys: Map<string, ApiKeyInfo>;
    headerName: string;
    queryParam: string;
}
export interface ApiKeyInfo {
    id: string;
    name: string;
    userId: string;
    role: UserRole;
    permissions: string[];
    expiresAt?: Date;
    createdAt: Date;
    lastUsedAt?: Date;
    rateLimit?: {
        requestsPerMinute: number;
        requestsPerHour: number;
    };
}
export interface AuthResult {
    success: boolean;
    userId?: string;
    role?: UserRole;
    permissions?: string[];
    error?: string;
    method?: 'jwt' | 'api_key' | 'none';
}
export interface AuthContext {
    userId: string;
    role: UserRole;
    permissions: string[];
    sessionId?: string;
    ipAddress?: string;
    userAgent?: string;
    method: 'jwt' | 'api_key' | 'env' | 'oauth';
}
export declare class AuthenticationManager {
    private readonly jwtConfig;
    private readonly apiKeyConfig;
    private readonly rateLimiters;
    constructor(jwtConfig?: Partial<JwtConfig>, apiKeyConfig?: Partial<ApiKeyConfig>);
    private initializeEnvironmentApiKeys;
    generateToken(payload: {
        userId: string;
        role: UserRole;
        permissions?: string[];
        sessionId?: string;
    }): string;
    verifyToken(token: string): JwtPayload | null;
    createApiKey(info: Omit<ApiKeyInfo, 'id' | 'createdAt'>): string;
    revokeApiKey(keyId: string): boolean;
    getApiKeyInfo(keyId: string): ApiKeyInfo | undefined;
    listApiKeys(userId?: string): ApiKeyInfo[];
    authenticateRequest(request: FastifyRequest): AuthResult;
    private extractApiKey;
    private validateApiKey;
    private getRateLimiter;
    extractAuthContext(request: FastifyRequest): AuthContext;
    createAuthMiddleware(options?: {
        required?: boolean;
        allowedRoles?: UserRole[];
        requiredPermissions?: string[];
    }): (request: FastifyRequest, reply: FastifyReply) => Promise<undefined>;
}
export declare const authenticationManager: AuthenticationManager;
export declare function createAuthContext(request: FastifyRequest): ToolContext;
//# sourceMappingURL=authentication.d.ts.map