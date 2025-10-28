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
export class OAuthLoginComponent {
  private config: OAuthLoginConfig;
  private state: OAuthLoginState;
  private container: HTMLElement;

  private authErrorCallback?: (error: string) => void;

  constructor(container: HTMLElement, config: OAuthLoginConfig) {
    this.container = container;
    this.config = config;
    this.state = { loading: false };

    this.init();
  }

  /**
   * Initialize the component
   */
  private init(): void {
    this.render();
    this.attachEventListeners();
  }

  /**
   * Render the component
   */
  private render(): void {
    const theme = this.getTheme();
    const providers = this.config.providers.filter((p) => p.enabled);

    this.container.innerHTML = `
      <div class="oauth-login" data-theme="${theme}">
        ${this.config.showBranding ? this.renderBranding() : ''}
        
        <div class="oauth-login__container">
          <div class="oauth-login__header">
            <h1 class="oauth-login__title">Sign In</h1>
            <p class="oauth-login__subtitle">
              Choose your authentication method to continue
            </p>
          </div>

          ${this.state.error ? this.renderError() : ''}
          
          <div class="oauth-login__providers">
            ${providers.map((provider) => this.renderProvider(provider)).join('')}
          </div>

          <div class="oauth-login__footer">
            <p class="oauth-login__security-note">
              <svg class="oauth-login__security-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
              </svg>
              Secure authentication powered by OAuth 2.1 + PKCE
            </p>
          </div>
        </div>

        ${this.state.loading ? this.renderLoading() : ''}
      </div>
    `;

    // Apply custom styles
    if (this.config.customStyles) {
      this.applyCustomStyles();
    }
  }

  /**
   * Render branding section
   */
  private renderBranding(): string {
    return `
      <div class="oauth-login__branding">
        <div class="oauth-login__logo">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="currentColor">
            <rect width="40" height="40" rx="8"/>
            <path d="M20 8L12 14V26L20 32L28 26V14L20 8Z" fill="white"/>
          </svg>
        </div>
        <h2 class="oauth-login__brand-name">Promethean MCP</h2>
      </div>
    `;
  }

  /**
   * Render error message
   */
  private renderError(): string {
    return `
      <div class="oauth-login__error" role="alert">
        <svg class="oauth-login__error-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
        <span class="oauth-login__error-message">${this.state.error}</span>
        <button class="oauth-login__error-dismiss" type="button" aria-label="Dismiss error">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>
    `;
  }

  /**
   * Render provider button
   */
  private renderProvider(provider: OAuthProvider): string {
    const isSelected = this.state.selectedProvider === provider.id;
    const isLoading = this.state.loading && isSelected;

    return `
      <button
        class="oauth-login__provider ${isSelected ? 'oauth-login__provider--selected' : ''}"
        type="button"
        data-provider="${provider.id}"
        ${isLoading ? 'disabled' : ''}
      >
        <div class="oauth-login__provider-content">
          ${
            provider.icon
              ? `
            <div class="oauth-login__provider-icon">
              <img src="${provider.icon}" alt="${provider.name}" width="24" height="24" />
            </div>
          `
              : ''
          }
          
          <div class="oauth-login__provider-info">
            <div class="oauth-login__provider-name">${provider.displayName}</div>
            ${
              provider.description
                ? `
              <div class="oauth-login__provider-description">${provider.description}</div>
            `
                : ''
            }
          </div>

          <div class="oauth-login__provider-action">
            ${
              isLoading
                ? this.renderSpinner()
                : `
              <svg class="oauth-login__provider-arrow" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
              </svg>
            `
            }
          </div>
        </div>
      </button>
    `;
  }

  /**
   * Render loading spinner
   */
  private renderSpinner(): string {
    return `
      <div class="oauth-login__spinner" role="status" aria-label="Loading">
        <svg class="oauth-login__spinner-svg" width="20" height="20" viewBox="0 0 24 24">
          <circle
            class="oauth-login__spinner-circle"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="2"
            fill="none"
            stroke-dasharray="60"
            stroke-dashoffset="60"
          />
        </svg>
      </div>
    `;
  }

  /**
   * Render loading overlay
   */
  private renderLoading(): string {
    return `
      <div class="oauth-login__loading-overlay">
        <div class="oauth-login__loading-content">
          ${this.renderSpinner()}
          <p class="oauth-login__loading-text">Connecting to ${this.state.selectedProvider}...</p>
        </div>
      </div>
    `;
  }

  /**
   * Get current theme
   */
  private getTheme(): string {
    if (this.config.theme === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return this.config.theme || 'light';
  }

  /**
   * Attach event listeners
   */
  private attachEventListeners(): void {
    // Provider button clicks
    this.container.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const providerButton = target.closest('[data-provider]') as HTMLButtonElement;

      if (providerButton) {
        const providerId = providerButton.dataset.provider;
        if (providerId) {
          this.handleProviderClick(providerId);
        }
      }
    });

    // Error dismiss button
    this.container.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const dismissButton = target.closest('.oauth-login__error-dismiss') as HTMLButtonElement;

      if (dismissButton) {
        this.clearError();
      }
    });

    // Theme change listener
    if (this.config.theme === 'auto') {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        this.render();
      });
    }
  }

  /**
   * Handle provider button click
   */
  private async handleProviderClick(providerId: string): Promise<void> {
    try {
      this.setState({ loading: true, selectedProvider: providerId, error: undefined });

      const provider = this.config.providers.find((p) => p.id === providerId);
      if (!provider) {
        throw new Error(`Provider ${providerId} not found`);
      }

      // Start OAuth flow
      const response = await fetch('/auth/oauth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: providerId,
          redirectUri: this.config.redirectUri,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to start OAuth flow');
      }

      const data = await response.json();

      // Redirect to OAuth provider
      window.location.href = data.authUrl;
    } catch (error) {
      this.setState({
        loading: false,
        selectedProvider: undefined,
        error: (error as Error).message,
      });

      if (this.authErrorCallback) {
        this.authErrorCallback((error as Error).message);
      }
    }
  }

  /**
   * Set component state
   */
  private setState(newState: Partial<OAuthLoginState>): void {
    this.state = { ...this.state, ...newState };
    this.render();
  }

  /**
   * Clear error
   */
  private clearError(): void {
    this.setState({ error: undefined });
  }

  /**
   * Apply custom styles
   */
  private applyCustomStyles(): void {
    if (!this.config.customStyles) return;

    const styleId = 'oauth-login-custom-styles';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    styleElement.textContent = this.config.customStyles;
  }

  /**
   * Set authentication success callback
   */
  setAuthSuccessCallback(callback: (user: any) => void): void {
    this.authSuccessCallback = callback;
  }

  /**
   * Set authentication error callback
   */
  setAuthErrorCallback(callback: (error: string) => void): void {
    this.authErrorCallback = callback;
  }

  /**
   * Destroy the component
   */
  destroy(): void {
    this.container.innerHTML = '';
  }
}

/**
 * Default OAuth providers
 */
export const DEFAULT_OAUTH_PROVIDERS: OAuthProvider[] = [
  {
    id: 'github',
    name: 'github',
    displayName: 'GitHub',
    description: 'Sign in with your GitHub account',
    icon: 'https://github.com/favicon.ico',
    color: '#24292e',
    enabled: true,
  },
  {
    id: 'google',
    name: 'google',
    displayName: 'Google',
    description: 'Sign in with your Google account',
    icon: 'https://www.google.com/favicon.ico',
    color: '#4285f4',
    enabled: true,
  },
];

/**
 * Helper function to create OAuth login component
 */
export function createOAuthLogin(
  container: HTMLElement,
  config: Partial<OAuthLoginConfig> = {},
): OAuthLoginComponent {
  const fullConfig: OAuthLoginConfig = {
    providers: DEFAULT_OAUTH_PROVIDERS,
    theme: 'auto',
    showBranding: true,
    ...config,
  };

  return new OAuthLoginComponent(container, fullConfig);
}

/**
 * Helper function to check OAuth callback
 */
export async function handleOAuthCallback(): Promise<{
  success: boolean;
  user?: any;
  error?: string;
}> {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');

    if (error) {
      return {
        success: false,
        error: `OAuth error: ${error}${urlParams.get('error_description') ? ` - ${urlParams.get('error_description')}` : ''}`,
      };
    }

    if (!code || !state) {
      return { success: false, error: 'Invalid OAuth callback' };
    }

    // Exchange code for tokens
    const response = await fetch('/auth/oauth/callback', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.message || 'OAuth callback failed' };
    }

    const data = await response.json();
    return { success: true, user: data.user };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
