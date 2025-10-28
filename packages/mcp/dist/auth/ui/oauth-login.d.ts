/**
 * OAuth Login UI Component
 *
 * Frontend component for OAuth authentication flow
 * following security best practices and modern web standards.
 */
/**
 * OAuth login configuration
 */
export interface OAuthLoginConfig {
    providers: OAuthProvider[];
    redirectUri?: string;
    theme?: 'light' | 'dark' | 'auto';
    showBranding?: boolean;
    customStyles?: string;
}
/**
 * OAuth provider information
 */
export interface OAuthProvider {
    id: string;
    name: string;
    displayName: string;
    description?: string;
    icon?: string;
    color?: string;
    enabled: boolean;
}
/**
 * OAuth login state
 */
export interface OAuthLoginState {
    loading: boolean;
    error?: string;
    selectedProvider?: string;
}
/**
 * OAuth login component
 */
export declare class OAuthLoginComponent {
    private config;
    private state;
    private container;
    private authErrorCallback?;
    constructor(container: HTMLElement, config: OAuthLoginConfig);
    /**
     * Initialize the component
     */
    private init;
    /**
     * Render the component
     */
    private render;
    /**
     * Render branding section
     */
    private renderBranding;
    /**
     * Render error message
     */
    private renderError;
    /**
     * Render provider button
     */
    private renderProvider;
    /**
     * Render loading spinner
     */
    private renderSpinner;
    /**
     * Render loading overlay
     */
    private renderLoading;
    /**
     * Get current theme
     */
    private getTheme;
    /**
     * Attach event listeners
     */
    private attachEventListeners;
    /**
     * Handle provider button click
     */
    private handleProviderClick;
    /**
     * Set component state
     */
    private setState;
    /**
     * Clear error
     */
    private clearError;
    /**
     * Apply custom styles
     */
    private applyCustomStyles;
    /**
     * Set authentication error callback
     */
    setAuthErrorCallback(callback: (error: string) => void): void;
    /**
     * Destroy the component
     */
    destroy(): void;
}
/**
 * Default OAuth providers
 */
export declare const DEFAULT_OAUTH_PROVIDERS: OAuthProvider[];
/**
 * Helper function to create OAuth login component
 */
export declare function createOAuthLogin(container: HTMLElement, config?: Partial<OAuthLoginConfig>): OAuthLoginComponent;
/**
 * Helper function to check OAuth callback
 */
export declare function handleOAuthCallback(): Promise<{
    success: boolean;
    user?: any;
    error?: string;
}>;
//# sourceMappingURL=oauth-login.d.ts.map