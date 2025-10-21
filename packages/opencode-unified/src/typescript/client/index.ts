/**
 * Client Module - OpenCode Client Library
 * Consolidated from @promethean/opencode-client
 */

export const CLIENT_VERSION = '1.0.0';

export interface ClientConfig {
  endpoint: string;
  timeout: number;
  retries: number;
}

export const defaultClientConfig: ClientConfig = {
  endpoint: 'http://localhost:3000',
  timeout: 30000,
  retries: 3,
};

export class OpenCodeClient {
  private config: ClientConfig;

  constructor(config: Partial<ClientConfig> = {}) {
    this.config = { ...defaultClientConfig, ...config };
  }

  async healthCheck(): Promise<any> {
    const response = await fetch(`${this.config.endpoint}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(this.config.timeout),
    });

    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }

    return response.json();
  }

  async getInfo(): Promise<any> {
    const response = await fetch(`${this.config.endpoint}/api/info`, {
      method: 'GET',
      signal: AbortSignal.timeout(this.config.timeout),
    });

    if (!response.ok) {
      throw new Error(`Failed to get info: ${response.statusText}`);
    }

    return response.json();
  }

  get endpoint(): string {
    return this.config.endpoint;
  }
}

// Client factory function
export function createClient(config?: Partial<ClientConfig>): OpenCodeClient {
  return new OpenCodeClient(config);
}
