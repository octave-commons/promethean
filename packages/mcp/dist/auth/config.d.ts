/**
 * OAuth Configuration Loader
 *
 * Loads and validates OAuth configuration from environment variables
 * following security best practices and the project's functional programming style.
 */
import type { OAuthSystemConfig, JwtTokenConfig, UserRegistryConfig, OAuthIntegrationConfig } from './types.js';
/**
 * Complete OAuth configuration
 */
export type OAuthConfig = Readonly<{
    readonly oauth: OAuthSystemConfig;
    readonly jwt: JwtTokenConfig;
    readonly userRegistry: UserRegistryConfig;
    readonly integration: OAuthIntegrationConfig;
    readonly http: {
        readonly basePath: string;
        readonly cookieDomain?: string;
        readonly secureCookies: boolean;
        readonly sameSitePolicy: 'strict' | 'lax' | 'none';
    };
}>;
/**
 * Load OAuth configuration from environment variables
 */
export declare function loadOAuthConfig(): OAuthConfig;
/**
 * Validate OAuth configuration
 */
export declare function validateOAuthConfig(config: OAuthConfig): void;
/**
 * Get OAuth configuration summary (for logging/debugging)
 */
export declare function getOAuthConfigSummary(config: OAuthConfig): Record<string, unknown>;
//# sourceMappingURL=config.d.ts.map