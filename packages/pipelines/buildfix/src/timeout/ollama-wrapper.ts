import { globalTimeoutManager, withTimeout } from './timeout-manager.js';

/**
 * Ollama API configuration with timeout support
 */
export interface OllamaConfig {
  /** Ollama server URL */
  url?: string;
  /** Default timeout for API calls */
  timeout?: number;
  /** Maximum retry attempts */
  maxRetries?: number;
  /** Retry delay in milliseconds */
  retryDelay?: number;
  /** Request timeout in milliseconds */
  requestTimeout?: number;
}

/**
 * Ollama generation options
 */
export interface OllamaGenerateOptions {
  /** Temperature parameter */
  temperature?: number;
  /** System prompt */
  system?: string;
  /** JSON schema for structured output */
  schema?: object;
  /** Additional options */
  [key: string]: unknown;
}

/**
 * Ollama response with timing information
 */
export interface OllamaResponse<T = unknown> {
  /** Response data */
  data: T;
  /** Request duration in milliseconds */
  duration: number;
  /** Whether the request timed out */
  timedOut: boolean;
  /** Number of retry attempts */
  retries: number;
  /** Model used */
  model: string;
}

/**
 * Enhanced Ollama wrapper with comprehensive timeout handling
 */
export class OllamaWrapper {
  private config: Required<OllamaConfig>;
  private ollamaPackage: any = null;
  private packageChecked = false;

  constructor(config: OllamaConfig = {}) {
    this.config = {
      url: config.url || process.env.OLLAMA_URL || 'http://localhost:11434',
      timeout: config.timeout || globalTimeoutManager.getTimeout('ollama'),
      maxRetries: config.maxRetries || 3,
      retryDelay: config.retryDelay || 1000,
      requestTimeout: config.requestTimeout || 120000,
    };
  }

  /**
   * Initialize Ollama package if available
   */
  private async initializeOllamaPackage(): Promise<any> {
    if (this.packageChecked) return this.ollamaPackage;
    this.packageChecked = true;

    try {
      const ollamaModule = await import('ollama').catch(() => null);
      if (ollamaModule) {
        this.ollamaPackage = ollamaModule.default;
        console.log('Using ollama npm package for improved performance');
      } else {
        this.ollamaPackage = false;
      }
    } catch (error) {
      console.warn('Ollama npm package not available, using HTTP fallback:', error);
      this.ollamaPackage = false;
    }

    return this.ollamaPackage;
  }

  /**
   * Execute Ollama API call with timeout and retry logic
   */
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    model: string,
    options: OllamaGenerateOptions = {},
  ): Promise<OllamaResponse<T>> {
    const startTime = Date.now();
    let retries = 0;
    let lastError: Error | null = null;

    while (retries <= this.config.maxRetries) {
      try {
        const data = await withTimeout('ollama', operation, {
          model,
          options,
          attempt: retries + 1,
        });

        return {
          data,
          duration: Date.now() - startTime,
          timedOut: false,
          retries,
          model,
        };
      } catch (error) {
        lastError = error as Error;

        // Don't retry on timeout errors
        if (error instanceof Error && error.name === 'TimeoutError') {
          return {
            data: null as T,
            duration: Date.now() - startTime,
            timedOut: true,
            retries,
            model,
          };
        }

        // Retry on other errors
        if (retries < this.config.maxRetries) {
          retries++;
          console.warn(
            `Ollama request failed (attempt ${retries}/${this.config.maxRetries}):`,
            error,
          );

          // Exponential backoff
          const delay = this.config.retryDelay * Math.pow(2, retries - 1);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    // All retries failed
    throw lastError || new Error('Ollama request failed after all retries');
  }

  /**
   * Generate text using Ollama with timeout protection
   */
  async generate(
    model: string,
    prompt: string,
    options: OllamaGenerateOptions = {},
  ): Promise<OllamaResponse<string>> {
    const ollama = await this.initializeOllamaPackage();

    return this.executeWithRetry(
      async () => {
        if (ollama && ollama !== false) {
          // Use npm package
          const response = await ollama.generate({
            model,
            prompt,
            system: options.system,
            format: options.schema ? 'json' : undefined,
            options: {
              temperature: options.temperature ?? 0,
            },
          });

          return response.response as string;
        } else {
          // Fallback to HTTP implementation
          const { ollamaJSON } = await import('@promethean/utils');
          const result = await ollamaJSON(model, prompt, options);
          return result as string;
        }
      },
      model,
      options,
    );
  }

  /**
   * Generate JSON using Ollama with timeout protection
   */
  async generateJSON<T = unknown>(
    model: string,
    prompt: string,
    options: OllamaGenerateOptions = {},
  ): Promise<OllamaResponse<T>> {
    const response = await this.generate(model, prompt, {
      ...options,
      schema: options.schema || {},
    });

    // Parse JSON response
    let parsedData: T;
    try {
      const raw = response.data as string;
      parsedData = JSON.parse(
        String(raw)
          .replace(/```json\s*/g, '')
          .replace(/```\s*$/g, '')
          .trim(),
      );
    } catch (error) {
      throw new Error(`Failed to parse Ollama JSON response: ${error}`);
    }

    return {
      ...response,
      data: parsedData,
    };
  }

  /**
   * Chat with Ollama with timeout protection
   */
  async chat(
    model: string,
    messages: Array<{ role: string; content: string }>,
    options: OllamaGenerateOptions = {},
  ): Promise<OllamaResponse<string>> {
    const ollama = await this.initializeOllamaPackage();

    return this.executeWithRetry(
      async () => {
        if (ollama && ollama !== false) {
          // Use npm package
          const response = await ollama.chat({
            model,
            messages,
            system: options.system,
            format: options.schema ? 'json' : undefined,
            options: {
              temperature: options.temperature ?? 0,
            },
          });

          return response.message.content as string;
        } else {
          // Fallback: convert chat to generate prompt
          const prompt = messages.map((msg) => `${msg.role}: ${msg.content}`).join('\n');
          const { ollamaJSON } = await import('@promethean/utils');
          const result = await ollamaJSON(model, prompt, options);
          return result as string;
        }
      },
      model,
      options,
    );
  }

  /**
   * List available models with timeout protection
   */
  async listModels(): Promise<OllamaResponse<string[]>> {
    const ollama = await this.initializeOllamaPackage();

    return this.executeWithRetry(async () => {
      if (ollama && ollama !== false) {
        // Use npm package
        const response = await ollama.list();
        return response.models.map((model: any) => model.name);
      } else {
        // Fallback to HTTP implementation
        const { execSync } = await import('child_process');
        const output = execSync('ollama list', { encoding: 'utf8' });
        const lines = output.trim().split('\n').slice(1); // Skip header
        return lines
          .map((line) => line.split(/\s+/)[0])
          .filter((model): model is string => Boolean(model));
      }
    }, 'list-models');
  }

  /**
   * Check if Ollama is healthy with timeout protection
   */
  async isHealthy(): Promise<boolean> {
    try {
      await this.listModels();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get configuration
   */
  getConfig(): Readonly<Required<OllamaConfig>> {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<OllamaConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

/**
 * Global Ollama wrapper instance
 */
export const globalOllamaWrapper = new OllamaWrapper();

/**
 * Convenience functions using global wrapper
 */
export async function callOllamaWithTimeout<T = unknown>(
  model: string,
  prompt: string,
  options: OllamaGenerateOptions = {},
): Promise<OllamaResponse<T>> {
  return globalOllamaWrapper.generateJSON<T>(model, prompt, options);
}

export async function chatWithTimeout(
  model: string,
  messages: Array<{ role: string; content: string }>,
  options: OllamaGenerateOptions = {},
): Promise<OllamaResponse<string>> {
  return globalOllamaWrapper.chat(model, messages, options);
}
