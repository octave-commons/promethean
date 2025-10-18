/**
 * Client Module - OpenCode Client Library
 * Consolidated from @promethean/opencode-client
 */

// Main client exports will be added here
export const CLIENT_VERSION = '1.0.0';

// Placeholder for client functionality
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
