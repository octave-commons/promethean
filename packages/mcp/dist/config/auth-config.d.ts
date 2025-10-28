/**
 * MCP Authorization Configuration
 *
 * This file demonstrates how to configure user roles and permissions
 * for the MCP authorization system, including OAuth integration.
 */
export interface AuthConfig {
    /**
     * Default role for unauthenticated users
     */
    defaultRole: 'guest' | 'user';
    /**
     * Enable strict authorization (deny by default)
     */
    strictMode: boolean;
    /**
     * Require authentication for dangerous operations
     */
    requireAuthForDangerous: boolean;
    /**
     * Session timeout in minutes
     */
    sessionTimeout: number;
    /**
     * Enable audit logging
     */
    enableAuditLog: boolean;
    /**
     * Rate limiting per user
     */
    rateLimiting: {
        requestsPerMinute: number;
        dangerousRequestsPerHour: number;
    };
    /**
     * IP whitelist for admin operations
     */
    adminIpWhitelist: string[];
    /**
     * Custom role mappings (optional)
     */
    roleMappings?: Record<string, {
        role: 'guest' | 'user' | 'developer' | 'admin';
        permissions: string[];
        restrictions?: string[];
    }>;
    /**
     * OAuth configuration
     */
    oauth?: {
        /**
         * Enable OAuth authentication
         */
        enabled: boolean;
        /**
         * OAuth redirect URI
         */
        redirectUri: string;
        /**
         * Trusted OAuth providers
         */
        trustedProviders: readonly string[];
        /**
         * Auto-create users on first OAuth login
         */
        autoCreateUsers: boolean;
        /**
         * Default role for OAuth users
         */
        defaultRole: 'guest' | 'user' | 'developer' | 'admin';
        /**
         * Enable user data synchronization
         */
        enableUserSync: boolean;
        /**
         * Sync interval in seconds
         */
        syncInterval: number;
        /**
         * Provider-specific configurations
         */
        providers: {
            github?: {
                enabled: boolean;
                clientId: string;
                clientSecret: string;
                scopes?: readonly string[];
                allowSignup?: boolean;
            };
            google?: {
                enabled: boolean;
                clientId: string;
                clientSecret: string;
                scopes?: readonly string[];
                hostedDomain?: string;
                prompt?: 'consent' | 'none' | 'select_account';
            };
        };
        /**
         * JWT configuration for OAuth tokens
         */
        jwt: {
            secret: string;
            issuer: string;
            audience: string;
            accessTokenExpiry: number;
            refreshTokenExpiry: number;
            algorithm: 'HS256' | 'HS384' | 'HS512' | 'RS256' | 'RS384' | 'RS512';
        };
    };
    /**
     * User registry configuration
     */
    userRegistry?: {
        /**
         * Storage path for user data
         */
        storagePath: string;
        /**
         * Enable custom roles
         */
        enableCustomRoles: boolean;
        /**
         * Enable activity logging
         */
        enableActivityLogging: boolean;
        /**
         * Session timeout in seconds
         */
        sessionTimeout: number;
        /**
         * Maximum sessions per user
         */
        maxSessionsPerUser: number;
        /**
         * Enable user search
         */
        enableUserSearch: boolean;
        /**
         * Default role for new users
         */
        defaultRole: 'guest' | 'user' | 'developer' | 'admin';
        /**
         * Auto-activate new users
         */
        autoActivateUsers: boolean;
    };
}
export declare const defaultAuthConfig: AuthConfig;
/**
 * Environment variable based configuration
 */
export declare function getAuthConfig(): AuthConfig;
//# sourceMappingURL=auth-config.d.ts.map