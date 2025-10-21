# Integration Guide

This guide provides comprehensive information for integrating the OpenCode CLI client with real OpenCode APIs and services.

## Table of Contents

- [Overview](#overview)
- [Authentication Setup](#authentication-setup)
- [Server Configuration](#server-configuration)
- [API Integration](#api-integration)
- [Environment Setup](#environment-setup)
- [Configuration Management](#configuration-management)
- [Security Considerations](#security-considerations)
- [Troubleshooting](#troubleshooting)
- [Migration Guide](#migration-guide)

## Overview

The OpenCode CLI client is designed to integrate seamlessly with OpenCode servers and services. This guide covers:

- Setting up authentication
- Configuring server endpoints
- Replacing mock implementations with real API calls
- Managing configuration and security
- Troubleshooting common integration issues

## Authentication Setup

### Bearer Token Authentication

The most common authentication method for OpenCode services is bearer token authentication.

#### Environment Variable Setup

```bash
# Set your authentication token
export OPENCODE_AUTH_TOKEN="your-bearer-token-here"

# Optional: Set token expiry
export OPENCODE_TOKEN_EXPIRY="2024-12-31T23:59:59Z"
```

#### Configuration File Setup

Create or update `~/.opencode/config.json`:

```json
{
  "auth": {
    "type": "bearer",
    "token": "your-bearer-token-here",
    "refreshToken": "your-refresh-token-here",
    "tokenExpiry": "2024-12-31T23:59:59Z"
  }
}
```

#### Token Refresh Implementation

```typescript
// src/utils/auth.ts
export class AuthManager {
  private token?: string;
  private refreshToken?: string;
  private tokenExpiry?: Date;

  constructor(private config: AuthConfig) {
    this.token = config.token;
    this.refreshToken = config.refreshToken;
    this.tokenExpiry = config.tokenExpiry ? new Date(config.tokenExpiry) : undefined;
  }

  async getValidToken(): Promise<string> {
    if (!this.token || this.isTokenExpired()) {
      await this.refreshToken();
    }
    return this.token!;
  }

  private isTokenExpired(): boolean {
    if (!this.tokenExpiry) return false;
    return new Date() >= this.tokenExpiry;
  }

  private async refreshToken(): Promise<void> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch(`${this.getServerUrl()}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: this.refreshToken,
        }),
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.statusText}`);
      }

      const data = await response.json();
      this.token = data.token;
      this.refreshToken = data.refreshToken;
      this.tokenExpiry = new Date(data.expiry);
    } catch (error) {
      throw new Error(`Failed to refresh token: ${error.message}`);
    }
  }
}
```

### API Key Authentication

For services that use API keys instead of bearer tokens:

```json
{
  "auth": {
    "type": "apikey",
    "key": "your-api-key-here",
    "header": "X-API-Key",
    "prefix": "Bearer"
  }
}
```

### Custom Authentication

For custom authentication schemes:

```typescript
// src/utils/custom-auth.ts
export class CustomAuthHandler {
  async authenticate(request: Request): Promise<void> {
    // Implement custom authentication logic
    const token = await this.getCustomToken();
    request.headers.set('Authorization', `Custom ${token}`);
  }

  private async getCustomToken(): Promise<string> {
    // Custom token acquisition logic
    return 'custom-token';
  }
}
```

## Server Configuration

### Basic Server Setup

Configure your OpenCode server endpoint:

```bash
# Environment variable
export OPENCODE_SERVER_URL="https://your-opencode-server.com"

# Or in configuration file
{
  "server": {
    "url": "https://your-opencode-server.com",
    "timeout": 30000,
    "retries": 3
  }
}
```

### Multiple Environment Support

Support different environments (dev, staging, prod):

```typescript
// src/config/environments.ts
export interface Environment {
  name: string;
  serverUrl: string;
  timeout: number;
  retries: number;
}

export const environments: Record<string, Environment> = {
  development: {
    name: 'Development',
    serverUrl: 'http://localhost:3000',
    timeout: 10000,
    retries: 1,
  },
  staging: {
    name: 'Staging',
    serverUrl: 'https://staging.opencode.com',
    timeout: 30000,
    retries: 3,
  },
  production: {
    name: 'Production',
    serverUrl: 'https://api.opencode.com',
    timeout: 60000,
    retries: 5,
  },
};

export function getCurrentEnvironment(): Environment {
  const env = process.env.OPENCODE_ENV || 'development';
  return environments[env] || environments.development;
}
```

### Health Check Implementation

```typescript
// src/utils/health-check.ts
export class HealthChecker {
  constructor(private serverUrl: string) {}

  async checkHealth(): Promise<{ healthy: boolean; message: string }> {
    try {
      const response = await fetch(`${this.serverUrl}/health`, {
        method: 'GET',
        timeout: 5000,
      });

      if (response.ok) {
        const data = await response.json();
        return {
          healthy: data.status === 'healthy',
          message: data.message || 'Service is healthy',
        };
      } else {
        return {
          healthy: false,
          message: `Health check failed: ${response.statusText}`,
        };
      }
    } catch (error) {
      return {
        healthy: false,
        message: `Health check error: ${error.message}`,
      };
    }
  }

  async waitForHealthy(maxWaitMs: number = 30000): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitMs) {
      const result = await this.checkHealth();
      if (result.healthy) {
        return;
      }

      console.log(`Waiting for service to be healthy: ${result.message}`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    throw new Error('Service did not become healthy within the timeout period');
  }
}
```

## API Integration

### HTTP Client Implementation

Replace mock implementations with a robust HTTP client:

```typescript
// src/utils/http-client.ts
import { AuthManager } from './auth.js';
import { getCurrentEnvironment } from '../config/environments.js';

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export class HttpClient {
  private authManager: AuthManager;
  private environment: Environment;

  constructor(authConfig: AuthConfig) {
    this.authManager = new AuthManager(authConfig);
    this.environment = getCurrentEnvironment();
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = this.environment.timeout,
      retries = this.environment.retries,
      retryDelay = 1000,
    } = options;

    let lastError: Error;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const url = `${this.environment.serverUrl}${endpoint}`;
        const controller = new AbortController();

        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const requestHeaders = {
          'Content-Type': 'application/json',
          'User-Agent': 'opencode-cli/1.0.0',
          ...headers,
        };

        // Add authentication
        const token = await this.authManager.getValidToken();
        requestHeaders['Authorization'] = `Bearer ${token}`;

        const response = await fetch(url, {
          method,
          headers: requestHeaders,
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.status === 401) {
          // Token might be expired, try to refresh and retry once
          if (attempt === 0) {
            await this.authManager.refreshToken();
            continue;
          }
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new APIError(
            errorData.message || `HTTP ${response.status}: ${response.statusText}`,
            response.status,
            errorData.code,
          );
        }

        return response.json();
      } catch (error) {
        lastError = error;

        if (attempt < retries && this.shouldRetry(error)) {
          console.warn(`Request failed, retrying in ${retryDelay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
          continue;
        }

        throw error;
      }
    }

    throw lastError!;
  }

  private shouldRetry(error: Error): boolean {
    if (error instanceof APIError) {
      // Retry on server errors and rate limiting
      return error.status! >= 500 || error.status === 429;
    }

    // Retry on network errors
    return error.name === 'TypeError' || error.name === 'AbortError';
  }
}

export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
  ) {
    super(message);
    this.name = 'APIError';
  }
}
```

### Ollama API Integration

Update the Ollama API functions:

```typescript
// src/api/ollama.ts
import { HttpClient } from '../utils/http-client.js';

let httpClient: HttpClient;

export function initializeOllamaClient(authConfig: AuthConfig) {
  httpClient = new HttpClient(authConfig);
}

export async function listJobs(options: JobOptions): Promise<Job[]> {
  if (!httpClient) {
    throw new Error('Ollama client not initialized');
  }

  const params = new URLSearchParams();

  if (options.status) params.append('status', options.status);
  if (options.limit) params.append('limit', options.limit.toString());
  if (options.agentOnly !== undefined) {
    params.append('agentOnly', options.agentOnly.toString());
  }

  return httpClient.request<Job[]>(`/api/ollama-queue/listJobs?${params}`);
}

export async function submitJob(options: SubmitJobOptions): Promise<Job> {
  if (!httpClient) {
    throw new Error('Ollama client not initialized');
  }

  // Validate required fields
  if (!options.modelName) {
    throw new ValidationError('Model name is required');
  }

  if (!options.jobType) {
    throw new ValidationError('Job type is required');
  }

  if (!options.priority) {
    throw new ValidationError('Priority is required');
  }

  // Validate job type specific requirements
  if (options.jobType === 'generate' && !options.prompt) {
    throw new ValidationError('Prompt is required for generate jobs');
  }

  if (options.jobType === 'chat' && (!options.messages || options.messages.length === 0)) {
    throw new ValidationError('Messages are required for chat jobs');
  }

  if (options.jobType === 'embedding' && !options.input) {
    throw new ValidationError('Input is required for embedding jobs');
  }

  return httpClient.request<Job>('/api/ollama-queue/submitJob', {
    method: 'POST',
    body: options,
  });
}

export async function getJobStatus(jobId: string): Promise<Job> {
  if (!httpClient) {
    throw new Error('Ollama client not initialized');
  }

  if (!jobId) {
    throw new ValidationError('Job ID is required');
  }

  return httpClient.request<Job>(`/api/ollama-queue/getJobStatus/${jobId}`);
}

export async function getJobResult(jobId: string): Promise<any> {
  if (!httpClient) {
    throw new Error('Ollama client not initialized');
  }

  if (!jobId) {
    throw new ValidationError('Job ID is required');
  }

  return httpClient.request(`/api/ollama-queue/getJobResult/${jobId}`);
}

export async function cancelJob(jobId: string): Promise<void> {
  if (!httpClient) {
    throw new Error('Ollama client not initialized');
  }

  if (!jobId) {
    throw new ValidationError('Job ID is required');
  }

  await httpClient.request(`/api/ollama-queue/cancelJob/${jobId}`, {
    method: 'DELETE',
  });
}

export async function listModels(detailed = false): Promise<any[]> {
  if (!httpClient) {
    throw new Error('Ollama client not initialized');
  }

  const params = detailed ? '?detailed=true' : '';
  return httpClient.request<any[]>(`/api/ollama-queue/listModels${params}`);
}

export async function getQueueInfo(): Promise<any> {
  if (!httpClient) {
    throw new Error('Ollama client not initialized');
  }

  return httpClient.request('/api/ollama-queue/getQueueInfo');
}

export async function manageCache(action: string): Promise<any> {
  if (!httpClient) {
    throw new Error('Ollama client not initialized');
  }

  const validActions = ['stats', 'clear', 'clear-expired', 'performance-analysis'];
  if (!validActions.includes(action)) {
    throw new ValidationError(
      `Invalid cache action: ${action}. Valid actions: ${validActions.join(', ')}`,
    );
  }

  return httpClient.request(`/api/ollama-queue/manageCache/${action}`, {
    method: 'POST',
  });
}
```

### Sessions API Integration

Update the Sessions API functions:

```typescript
// src/api/sessions.ts
import { HttpClient } from '../utils/http-client.js';

let httpClient: HttpClient;

export function initializeSessionsClient(authConfig: AuthConfig) {
  httpClient = new HttpClient(authConfig);
}

export async function listSessions(options: ListSessionsOptions = {}): Promise<Session[]> {
  if (!httpClient) {
    throw new Error('Sessions client not initialized');
  }

  const { limit = 20, offset = 0 } = options;

  const params = new URLSearchParams();
  params.append('limit', limit.toString());
  params.append('offset', offset.toString());

  return httpClient.request<Session[]>(`/api/sessions/list?${params}`);
}

export async function getSession(sessionId: string): Promise<Session> {
  if (!httpClient) {
    throw new Error('Sessions client not initialized');
  }

  if (!sessionId) {
    throw new ValidationError('Session ID is required');
  }

  return httpClient.request<Session>(`/api/sessions/get/${sessionId}`);
}

export async function createSession(options: CreateSessionOptions = {}): Promise<Session> {
  if (!httpClient) {
    throw new Error('Sessions client not initialized');
  }

  return httpClient.request<Session>('/api/sessions/create', {
    method: 'POST',
    body: options,
  });
}

export async function closeSession(sessionId: string): Promise<void> {
  if (!httpClient) {
    throw new Error('Sessions client not initialized');
  }

  if (!sessionId) {
    throw new ValidationError('Session ID is required');
  }

  await httpClient.request(`/api/sessions/close/${sessionId}`, {
    method: 'POST',
  });
}

export async function searchSessions(options: SearchSessionsOptions): Promise<Session[]> {
  if (!httpClient) {
    throw new Error('Sessions client not initialized');
  }

  if (!options.query) {
    throw new ValidationError('Search query is required');
  }

  const { query, k = 5 } = options;

  return httpClient.request<Session[]>('/api/sessions/search', {
    method: 'POST',
    body: { query, k },
  });
}
```

## Environment Setup

### Development Environment

```bash
# .env.development
OPENCODE_ENV=development
OPENCODE_SERVER_URL=http://localhost:3000
OPENCODE_AUTH_TOKEN=dev-token
OPENCODE_TIMEOUT=10000
OPENCODE_RETRIES=1
DEBUG=true
```

### Staging Environment

```bash
# .env.staging
OPENCODE_ENV=staging
OPENCODE_SERVER_URL=https://staging.opencode.com
OPENCODE_AUTH_TOKEN=staging-token
OPENCODE_TIMEOUT=30000
OPENCODE_RETRIES=3
DEBUG=false
```

### Production Environment

```bash
# .env.production
OPENCODE_ENV=production
OPENCODE_SERVER_URL=https://api.opencode.com
OPENCODE_AUTH_TOKEN=prod-token
OPENCODE_TIMEOUT=60000
OPENCODE_RETRIES=5
DEBUG=false
```

### Environment Loading

```typescript
// src/config/environment.ts
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function loadEnvironment() {
  const env = process.env.OPENCODE_ENV || 'development';

  // Load base .env file
  dotenv.config();

  // Load environment-specific .env file
  const envFile = path.join(__dirname, `../../../.env.${env}`);
  dotenv.config({ path: envFile });

  console.log(`Loaded environment: ${env}`);
}
```

## Configuration Management

### Configuration Schema

```typescript
// src/config/schema.ts
export interface Config {
  environment: string;
  server: {
    url: string;
    timeout: number;
    retries: number;
  };
  auth: {
    type: 'bearer' | 'apikey' | 'custom';
    token?: string;
    refreshToken?: string;
    tokenExpiry?: string;
    key?: string;
    header?: string;
    prefix?: string;
  };
  defaults: {
    model: string;
    priority: string;
    jobType: string;
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    format: 'json' | 'text';
  };
  cache: {
    enabled: boolean;
    ttl: number;
    maxSize: number;
  };
}
```

### Configuration Loader

```typescript
// src/config/loader.ts
import fs from 'fs';
import path from 'path';
import os from 'os';
import { Config } from './schema.js';

export class ConfigLoader {
  private static instance: ConfigLoader;
  private config: Config;

  private constructor() {
    this.config = this.loadConfig();
  }

  static getInstance(): ConfigLoader {
    if (!ConfigLoader.instance) {
      ConfigLoader.instance = new ConfigLoader();
    }
    return ConfigLoader.instance;
  }

  getConfig(): Config {
    return this.config;
  }

  private loadConfig(): Config {
    // Load default configuration
    const defaultConfig: Config = {
      environment: process.env.OPENCODE_ENV || 'development',
      server: {
        url: 'http://localhost:3000',
        timeout: 30000,
        retries: 3,
      },
      auth: {
        type: 'bearer',
      },
      defaults: {
        model: 'llama2',
        priority: 'medium',
        jobType: 'generate',
      },
      logging: {
        level: 'info',
        format: 'text',
      },
      cache: {
        enabled: true,
        ttl: 300000, // 5 minutes
        maxSize: 1000,
      },
    };

    // Load from file
    const fileConfig = this.loadFromFile();

    // Load from environment variables
    const envConfig = this.loadFromEnvironment();

    // Merge configurations (environment > file > defaults)
    return this.mergeConfigs(defaultConfig, fileConfig, envConfig);
  }

  private loadFromFile(): Partial<Config> {
    const configPath = path.join(os.homedir(), '.opencode', 'config.json');

    if (!fs.existsSync(configPath)) {
      return {};
    }

    try {
      const content = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      console.warn(`Failed to load config file: ${error.message}`);
      return {};
    }
  }

  private loadFromEnvironment(): Partial<Config> {
    return {
      environment: process.env.OPENCODE_ENV,
      server: {
        url: process.env.OPENCODE_SERVER_URL,
        timeout: process.env.OPENCODE_TIMEOUT ? parseInt(process.env.OPENCODE_TIMEOUT) : undefined,
        retries: process.env.OPENCODE_RETRIES ? parseInt(process.env.OPENCODE_RETRIES) : undefined,
      },
      auth: {
        type: process.env.OPENCODE_AUTH_TYPE as any,
        token: process.env.OPENCODE_AUTH_TOKEN,
        refreshToken: process.env.OPENCODE_REFRESH_TOKEN,
        tokenExpiry: process.env.OPENCODE_TOKEN_EXPIRY,
        key: process.env.OPENCODE_API_KEY,
        header: process.env.OPENCODE_API_HEADER,
        prefix: process.env.OPENCODE_API_PREFIX,
      },
      defaults: {
        model: process.env.OPENCODE_DEFAULT_MODEL,
        priority: process.env.OPENCODE_DEFAULT_PRIORITY,
        jobType: process.env.OPENCODE_DEFAULT_JOB_TYPE,
      },
      logging: {
        level: process.env.OPENCODE_LOG_LEVEL as any,
        format: process.env.OPENCODE_LOG_FORMAT as any,
      },
    };
  }

  private mergeConfigs(...configs: Partial<Config>[]): Config {
    return configs.reduce((merged, config) => {
      return this.deepMerge(merged, config);
    }, {} as Config);
  }

  private deepMerge(target: any, source: any): any {
    const result = { ...target };

    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(result[key] || {}, source[key]);
      } else if (source[key] !== undefined) {
        result[key] = source[key];
      }
    }

    return result;
  }
}
```

## Security Considerations

### Token Storage

Store tokens securely:

```typescript
// src/utils/secure-storage.ts
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import os from 'os';

export class SecureStorage {
  private keyPath: string;
  private dataPath: string;

  constructor() {
    const configDir = path.join(os.homedir(), '.opencode');
    this.keyPath = path.join(configDir, '.key');
    this.dataPath = path.join(configDir, 'secure.json');

    this.ensureConfigDir();
  }

  private ensureConfigDir(): void {
    const configDir = path.dirname(this.keyPath);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { mode: 0o700 });
    }
  }

  private getOrCreateKey(): Buffer {
    if (fs.existsSync(this.keyPath)) {
      return fs.readFileSync(this.keyPath);
    }

    const key = crypto.randomBytes(32);
    fs.writeFileSync(this.keyPath, key, { mode: 0o600 });
    return key;
  }

  store(data: any): void {
    const key = this.getOrCreateKey();
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipher('aes-256-cbc', key);
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const secureData = {
      iv: iv.toString('hex'),
      data: encrypted,
    };

    fs.writeFileSync(this.dataPath, JSON.stringify(secureData), { mode: 0o600 });
  }

  retrieve(): any {
    if (!fs.existsSync(this.dataPath)) {
      return null;
    }

    try {
      const key = this.getOrCreateKey();
      const secureData = JSON.parse(fs.readFileSync(this.dataPath, 'utf8'));

      const decipher = crypto.createDecipher('aes-256-cbc', key);
      let decrypted = decipher.update(secureData.data, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return JSON.parse(decrypted);
    } catch (error) {
      console.warn('Failed to decrypt stored data:', error.message);
      return null;
    }
  }

  clear(): void {
    if (fs.existsSync(this.dataPath)) {
      fs.unlinkSync(this.dataPath);
    }
  }
}
```

### Input Validation

Validate all user inputs:

```typescript
// src/utils/validation.ts
export class Validator {
  static validateJobId(jobId: string): void {
    if (!jobId || typeof jobId !== 'string') {
      throw new ValidationError('Job ID must be a non-empty string');
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(jobId)) {
      throw new ValidationError('Job ID contains invalid characters');
    }
  }

  static validateSessionId(sessionId: string): void {
    if (!sessionId || typeof sessionId !== 'string') {
      throw new ValidationError('Session ID must be a non-empty string');
    }

    if (!/^sess_[a-zA-Z0-9_-]+$/.test(sessionId)) {
      throw new ValidationError('Session ID format is invalid');
    }
  }

  static validateModelName(modelName: string): void {
    if (!modelName || typeof modelName !== 'string') {
      throw new ValidationError('Model name must be a non-empty string');
    }

    if (modelName.length > 100) {
      throw new ValidationError('Model name is too long');
    }
  }

  static validatePriority(priority: string): void {
    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    if (!validPriorities.includes(priority)) {
      throw new ValidationError(`Invalid priority. Valid values: ${validPriorities.join(', ')}`);
    }
  }

  static validateJobType(jobType: string): void {
    const validTypes = ['generate', 'chat', 'embedding'];
    if (!validTypes.includes(jobType)) {
      throw new ValidationError(`Invalid job type. Valid values: ${validTypes.join(', ')}`);
    }
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
```

## Troubleshooting

### Common Issues

#### Connection Refused

```bash
# Check server status
curl -I http://localhost:3000/health

# Verify configuration
opencode --verbose ollama info

# Check network connectivity
ping your-opencode-server.com
```

#### Authentication Failures

```bash
# Verify token
echo $OPENCODE_AUTH_TOKEN

# Test authentication
curl -H "Authorization: Bearer $OPENCODE_AUTH_TOKEN" \
     http://localhost:3000/api/auth/me

# Refresh token
opencode auth refresh
```

#### Timeouts

```bash
# Increase timeout
export OPENCODE_TIMEOUT=60000

# Check server load
opencode ollama info

# Monitor queue status
watch -n 5 "opencode ollama list --status running"
```

### Debug Mode

Enable comprehensive debugging:

```typescript
// src/utils/debug.ts
export class DebugLogger {
  private enabled: boolean;

  constructor() {
    this.enabled = process.env.DEBUG === 'true' || process.env.NODE_ENV === 'development';
  }

  logRequest(method: string, url: string, headers: Record<string, string>, body?: any): void {
    if (!this.enabled) return;

    console.log('=== REQUEST ===');
    console.log(`${method} ${url}`);
    console.log('Headers:', JSON.stringify(headers, null, 2));
    if (body) {
      console.log('Body:', JSON.stringify(body, null, 2));
    }
    console.log('===============');
  }

  logResponse(status: number, headers: Record<string, string>, body?: any): void {
    if (!this.enabled) return;

    console.log('=== RESPONSE ===');
    console.log(`Status: ${status}`);
    console.log('Headers:', JSON.stringify(headers, null, 2));
    if (body) {
      console.log('Body:', JSON.stringify(body, null, 2));
    }
    console.log('================');
  }

  logError(error: Error): void {
    if (!this.enabled) return;

    console.log('=== ERROR ===');
    console.log('Name:', error.name);
    console.log('Message:', error.message);
    console.log('Stack:', error.stack);
    console.log('=============');
  }
}
```

### Health Monitoring

Implement health checks:

```typescript
// src/utils/health-monitor.ts
export class HealthMonitor {
  private lastCheck: Date | null = null;
  private isHealthy: boolean = false;

  async checkHealth(): Promise<boolean> {
    try {
      const healthChecker = new HealthChecker(this.getServerUrl());
      const result = await healthChecker.checkHealth();

      this.lastCheck = new Date();
      this.isHealthy = result.healthy;

      if (!result.healthy) {
        console.warn(`Health check failed: ${result.message}`);
      }

      return result.healthy;
    } catch (error) {
      this.lastCheck = new Date();
      this.isHealthy = false;

      console.error('Health check error:', error.message);
      return false;
    }
  }

  getStatus(): { healthy: boolean; lastCheck: Date | null } {
    return {
      healthy: this.isHealthy,
      lastCheck: this.lastCheck,
    };
  }
}
```

## Migration Guide

### From Mock to Production

Follow these steps to migrate from mock implementations to production APIs:

#### Step 1: Update Configuration

```bash
# Create production configuration
mkdir -p ~/.opencode
cat > ~/.opencode/config.json << EOF
{
  "environment": "production",
  "server": {
    "url": "https://your-opencode-server.com",
    "timeout": 60000,
    "retries": 5
  },
  "auth": {
    "type": "bearer",
    "token": "your-production-token"
  }
}
EOF
```

#### Step 2: Initialize Clients

```typescript
// src/clients/index.ts
import { loadConfig } from '../config/loader.js';
import { initializeOllamaClient } from '../api/ollama.js';
import { initializeSessionsClient } from '../api/sessions.js';

export function initializeClients() {
  const config = loadConfig();

  initializeOllamaClient(config.auth);
  initializeSessionsClient(config.auth);

  console.log(`Initialized clients for ${config.environment} environment`);
}
```

#### Step 3: Update CLI Entry Point

```typescript
// src/cli.ts
import { initializeClients } from './clients/index.js';

// Initialize clients before processing commands
initializeClients();

// Rest of CLI setup...
```

#### Step 4: Test Integration

```bash
# Test basic connectivity
opencode ollama info

# Test authentication
opencode sessions list

# Test job submission
opencode ollama submit --model llama2 --prompt "test"
```

#### Step 5: Monitor and Debug

```bash
# Enable debug mode
DEBUG=true opencode --verbose ollama list

# Monitor logs
tail -f ~/.opencode/logs/opencode.log

# Check health status
opencode health check
```

### Rollback Plan

If issues arise during migration:

```bash
# Switch back to development mode
export OPENCODE_ENV=development

# Use local server
export OPENCODE_SERVER_URL=http://localhost:3000

# Use development token
export OPENCODE_AUTH_TOKEN=dev-token

# Verify rollback
opencode ollama info
```

This integration guide provides a comprehensive roadmap for connecting the OpenCode CLI client to real OpenCode services, with proper authentication, error handling, and security considerations.
