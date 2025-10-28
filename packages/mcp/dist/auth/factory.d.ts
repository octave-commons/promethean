/**
 * Authentication System Factory
 *
 * Creates and configures the complete authentication system including
 * OAuth, user registry, and integration with existing authorization.
 */
import type { AuthConfig } from '../config/auth-config.js';
import type { AuthenticationManager } from '../core/authentication.js';
import { OAuthSystem } from './oauth/index.js';
import { JwtTokenManager } from './oauth/jwt.js';
import { UserRegistry } from './users/registry.js';
import { OAuthIntegration } from './integration.js';
/**
 * Complete authentication system
 */
export interface AuthenticationSystem {
    authManager: AuthenticationManager;
    oauthSystem?: OAuthSystem;
    jwtManager?: JwtTokenManager;
    userRegistry?: UserRegistry;
    oauthIntegration?: OAuthIntegration;
}
/**
 * Authentication system factory
 */
export declare class AuthenticationFactory {
    /**
     * Create complete authentication system
     */
    static createSystem(config: AuthConfig): Promise<AuthenticationSystem>;
    /**
     * Create user registry configuration
     */
    private static createUserRegistryConfig;
    /**
     * Create OAuth system configuration
     */
    private static createOAuthSystemConfig;
    /**
     * Create JWT configuration
     */
    private static createJwtConfig;
    /**
     * Create OAuth integration configuration
     */
    private static createOAuthIntegrationConfig;
    /**
     * Generate secure JWT secret
     */
    static generateJwtSecret(): string;
    /**
     * Validate OAuth configuration
     */
    static validateOAuthConfig(config: AuthConfig): {
        valid: boolean;
        errors: string[];
    };
    /**
     * Create example environment file
     */
    static createExampleEnvFile(): string;
    /**
     * Setup OAuth directories and files
     */
    static setupOAuthDirectories(config: AuthConfig): Promise<void>;
}
//# sourceMappingURL=factory.d.ts.map