import type { 
  Plugin, 
  PluginContext, 
  HookRegistration, 
  HookResult, 
  HookContext,
  EventBus,
  HookRegistry 
} from '../types.js';
import { z } from 'zod';

/**
 * Plugin development SDK utilities
 */
export class PluginSDK {
  constructor(private context: PluginContext) {}

  /**
   * Create a hook registration with simplified API
   */
  createHook<T = unknown, R = unknown>(
    hookName: string,
    handler: (data: T, context: HookContext) => R | Promise<R>,
    options?: {
      priority?: number;
      description?: string;
      schema?: {
        input?: z.ZodSchema<T>;
        output?: z.ZodSchema<R>;
      };
    }
  ): HookRegistration<T, R> {
    const wrappedHandler = async (data: T, hookContext: HookContext): Promise<HookResult<R>> => {
      try {
        // Validate input if schema provided
        if (options?.schema?.input) {
          data = options.schema.input.parse(data);
        }

        // Execute handler
        const result = await handler(data, hookContext);

        // Validate output if schema provided
        if (options?.schema?.output) {
          const validatedResult = options.schema.output.parse(result);
          return { success: true, data: validatedResult };
        }

        return { success: true, data: result };
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error : new Error(String(error)) 
        };
      }
    };

    return {
      pluginName: this.getPluginName(),
      hookName,
      handler: wrappedHandler,
      priority: options?.priority || 10,
    };
  }

  /**
   * Register multiple hooks at once
   */
  registerHooks(hooks: HookRegistration[]): void {
    for (const hook of hooks) {
      this.context.registerHook(hook);
    }
  }

  /**
   * Publish an event to the event bus
   */
  async publishEvent<T>(topic: string, payload: T, options?: {
    headers?: Record<string, string>;
    key?: string;
  }): Promise<void> {
    await this.context.eventBus.publish(topic, payload, options);
  }

  /**
   * Subscribe to events
   */
  async subscribeToEvent<T>(
    topic: string,
    handler: (event: T) => Promise<void>,
    options?: {
      group?: string;
    }
  ): Promise<() => Promise<void>> {
    return this.context.eventBus.subscribe(
      topic,
      options?.group || this.getPluginName(),
      async (event) => handler(event.payload as T)
    );
  }

  /**
   * Get plugin name from context
   */
  private getPluginName(): string {
    // This would need to be injected into the context
    return 'unknown-plugin';
  }

  /**
   * Create a logger for the plugin
   */
  createLogger(label?: string) {
    return new PluginLogger(this.getPluginName(), label);
  }

  /**
   * Create configuration manager
   */
  createConfig<T>(schema: z.ZodSchema<T>, defaults: T): ConfigManager<T> {
    return new ConfigManager(this.getPluginName(), schema, defaults);
  }

  /**
   * Create storage manager
   */
  createStorage(): StorageManager {
    return new StorageManager(this.getPluginName());
  }

  /**
   * Create HTTP client with security constraints
   */
  createHttpClient(options?: {
    timeout?: number;
    retries?: number;
    baseURL?: string;
  }) {
    return new HttpClient(this.context, options);
  }
}

/**
 * Plugin logger with structured logging
 */
export class PluginLogger {
  constructor(
    private pluginName: string,
    private label?: string
  ) {}

  private log(level: string, message: string, meta?: Record<string, unknown>): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      plugin: this.pluginName,
      label: this.label,
      message,
      meta,
    };

    console.log(JSON.stringify(logEntry));
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    this.log('debug', message, meta);
  }

  info(message: string, meta?: Record<string, unknown>): void {
    this.log('info', message, meta);
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.log('warn', message, meta);
  }

  error(message: string, error?: Error | Record<string, unknown>): void {
    const meta = error instanceof Error ? {
      error: error.message,
      stack: error.stack,
    } : error;
    
    this.log('error', message, meta);
  }
}

/**
 * Configuration manager with validation
 */
export class ConfigManager<T> {
  private config: T;

  constructor(
    private pluginName: string,
    private schema: z.ZodSchema<T>,
    defaults: T
  ) {
    this.config = this.validateConfig(defaults);
  }

  /**
   * Get configuration value
   */
  get<K extends keyof T>(key: K): T[K] {
    return this.config[key];
  }

  /**
   * Get entire configuration
   */
  getAll(): T {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  update(updates: Partial<T>): void {
    const newConfig = { ...this.config, ...updates };
    this.config = this.validateConfig(newConfig);
  }

  /**
   * Set configuration value
   */
  set<K extends keyof T>(key: K, value: T[K]): void {
    this.update({ [key]: value } as Partial<T>);
  }

  /**
   * Validate configuration against schema
   */
  private validateConfig(config: T): T {
    try {
      return this.schema.parse(config);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          `Configuration validation failed for plugin ${this.pluginName}: ${error.message}`
        );
      }
      throw error;
    }
  }

  /**
   * Load configuration from environment variables
   */
  loadFromEnv(prefix?: string): void {
    const envPrefix = prefix || this.pluginName.toUpperCase().replace(/[^A-Z0-9]/g, '_');
    const envConfig: Record<string, unknown> = {};

    for (const key in process.env) {
      if (key.startsWith(`${envPrefix}_`)) {
        const configKey = key.substring(envPrefix.length + 1).toLowerCase();
        const value = process.env[key];
        
        // Try to parse as JSON, fallback to string
        try {
          envConfig[configKey] = JSON.parse(value!);
        } catch {
          envConfig[configKey] = value;
        }
      }
    }

    if (Object.keys(envConfig).length > 0) {
      this.update(envConfig as Partial<T>);
    }
  }
}

/**
 * Simple storage manager for plugin data
 */
export class StorageManager {
  private storage: Record<string, unknown> = {};

  constructor(private pluginName: string) {}

  /**
   * Store a value
   */
  async set<T>(key: string, value: T): Promise<void> {
    const fullKey = `${this.pluginName}:${key}`;
    this.storage[fullKey] = value;
    
    // In a real implementation, this would persist to disk or database
    console.debug(`[Storage] Set ${fullKey}`);
  }

  /**
   * Get a value
   */
  async get<T>(key: string, defaultValue?: T): Promise<T | undefined> {
    const fullKey = `${this.pluginName}:${key}`;
    const value = this.storage[fullKey] as T | undefined;
    
    console.debug(`[Storage] Get ${fullKey}: ${value !== undefined ? 'found' : 'not found'}`);
    return value !== undefined ? value : defaultValue;
  }

  /**
   * Delete a value
   */
  async delete(key: string): Promise<boolean> {
    const fullKey = `${this.pluginName}:${key}`;
    const existed = fullKey in this.storage;
    delete this.storage[fullKey];
    
    console.debug(`[Storage] Delete ${fullKey}: ${existed ? 'deleted' : 'not found'}`);
    return existed;
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    const fullKey = `${this.pluginName}:${key}`;
    return fullKey in this.storage;
  }

  /**
   * List all keys for this plugin
   */
  async listKeys(): Promise<string[]> {
    const prefix = `${this.pluginName}:`;
    return Object.keys(this.storage)
      .filter(key => key.startsWith(prefix))
      .map(key => key.substring(prefix.length));
  }

  /**
   * Clear all plugin data
   */
  async clear(): Promise<void> {
    const prefix = `${this.pluginName}:`;
    const keysToDelete = Object.keys(this.storage).filter(key => key.startsWith(prefix));
    
    for (const key of keysToDelete) {
      delete this.storage[key];
    }
    
    console.debug(`[Storage] Cleared ${keysToDelete.length} keys for ${this.pluginName}`);
  }
}

/**
 * HTTP client with security constraints
 */
export class HttpClient {
  constructor(
    private context: PluginContext,
    private options: {
      timeout?: number;
      retries?: number;
      baseURL?: string;
    } = {}
  ) {}

  /**
   * Make HTTP GET request
   */
  async get<T = unknown>(url: string, options?: RequestInit): Promise<T> {
    return this.request<T>('GET', url, options);
  }

  /**
   * Make HTTP POST request
   */
  async post<T = unknown>(url: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>('POST', url, {
      ...options,
      body: data ? JSON.stringify(data) : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
  }

  /**
   * Make HTTP PUT request
   */
  async put<T = unknown>(url: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>('PUT', url, {
      ...options,
      body: data ? JSON.stringify(data) : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
  }

  /**
   * Make HTTP DELETE request
   */
  async delete<T = unknown>(url: string, options?: RequestInit): Promise<T> {
    return this.request<T>('DELETE', url, options);
  }

  /**
   * Make HTTP request with security constraints
   */
  private async request<T = unknown>(
    method: string,
    url: string,
    options?: RequestInit
  ): Promise<T> {
    const fullUrl = this.options.baseURL ? `${this.options.baseURL}${url}` : url;
    
    const requestOptions: RequestInit = {
      method,
      ...options,
      signal: AbortSignal.timeout(this.options.timeout || 30000),
    };

    let lastError: Error | undefined;
    const maxRetries = this.options.retries || 3;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(fullUrl, requestOptions);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json() as T;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt < maxRetries) {
          // Exponential backoff
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }
}

/**
 * Plugin builder for simplified plugin creation
 */
export class PluginBuilder {
  private plugin: Partial<Plugin> = {
    metadata: {
      name: '',
      version: '1.0.0',
      description: '',
    },
  };

  /**
   * Set plugin metadata
   */
  metadata(metadata: Partial<Plugin['metadata']>): this {
    this.plugin.metadata = { ...this.plugin.metadata!, ...metadata };
    return this;
  }

  /**
   * Set initialize function
   */
  initialize(fn: (context: PluginContext) => Promise<void> | void): this {
    this.plugin.initialize = fn;
    return this;
  }

  /**
   * Set destroy function
   */
  destroy(fn: () => Promise<void> | void): this {
    this.plugin.destroy = fn;
    return this;
  }

  /**
   * Add hook
   */
  addHook<T = unknown, R = unknown>(
    hookName: string,
    handler: (data: T, context: HookContext) => R | Promise<R>,
    options?: { priority?: number }
  ): this {
    if (!this.plugin.getHooks) {
      this.plugin.getHooks = () => [];
    }

    const hooks = this.plugin.getHooks();
    hooks.push({
      pluginName: this.plugin.metadata!.name,
      hookName,
      handler: handler as any,
      priority: options?.priority || 10,
    });

    return this;
  }

  /**
   * Build the plugin
   */
  build(): Plugin {
    if (!this.plugin.metadata?.name) {
      throw new Error('Plugin name is required');
    }

    return this.plugin as Plugin;
  }
}

/**
 * Create a new plugin builder
 */
export function createPlugin(name: string): PluginBuilder {
  return new PluginBuilder().metadata({ name });
}