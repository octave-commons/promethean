/**
 * LLM Provider System for PR Sync Tool
 *
 * Supports multiple providers with automatic fallback:
 * 1. Ollama (local)
 * 2. OpenAI API
 * 3. ZAI (OpenAI-compatible)
 * 4. OpenRouter
 */

class LLMProvider {
  constructor(config) {
    this.config = config;
    this.timeout = config.timeout || 30000;
    this.maxRetries = config.maxRetries || 2;
  }

  async resolveConflict(prompt, options = {}) {
    throw new Error('resolveConflict must be implemented by subclass');
  }

  async testConnection() {
    throw new Error('testConnection must be implemented by subclass');
  }
}

class OllamaProvider extends LLMProvider {
  constructor(config) {
    super(config);
    this.baseUrl = config.baseUrl || 'http://localhost:11434';
  }

  async resolveConflict(prompt, options = {}) {
    const model = options.model || this.config.model || 'qwen2.5-coder:7b';

    try {
      const { spawn } = await import('node:child_process');

      return new Promise((resolve, reject) => {
        const process = spawn('ollama', ['run', model, prompt], {
          stdio: ['pipe', 'pipe', 'pipe'],
          timeout: this.timeout
        });

        let stdout = '';
        let stderr = '';

        process.stdout.on('data', (data) => {
          stdout += data.toString();
        });

        process.stderr.on('data', (data) => {
          stderr += data.toString();
        });

        process.on('close', (code) => {
          if (code === 0) {
            resolve(stdout.trim());
          } else {
            reject(new Error(`Ollama failed with code ${code}: ${stderr}`));
          }
        });

        process.on('error', (error) => {
          reject(new Error(`Ollama process error: ${error.message}`));
        });
      });
    } catch (error) {
      throw new Error(`Ollama resolution failed: ${error.message}`);
    }
  }

  async testConnection() {
    try {
      const { execSync } = await import('node:child_process');
      const result = execSync('ollama list', { encoding: 'utf8', timeout: 5000 });
      return { success: true, info: 'Ollama is running' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

class OpenAIProvider extends LLMProvider {
  constructor(config) {
    super(config);
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.openai.com/v1';
    this.model = config.model || 'gpt-4';
  }

  async resolveConflict(prompt, options = {}) {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not provided');
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: options.model || this.model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert developer resolving git merge conflicts. Provide only the resolved code without explanations.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.1,
          max_tokens: 4000,
        }),
        signal: AbortSignal.timeout(this.timeout)
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenAI API error: ${response.status} - ${error}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content?.trim() || '';
    } catch (error) {
      throw new Error(`OpenAI resolution failed: ${error.message}`);
    }
  }

  async testConnection() {
    if (!this.apiKey) {
      return { success: false, error: 'OpenAI API key not provided' };
    }

    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        signal: AbortSignal.timeout(5000)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return { success: true, info: 'OpenAI API is accessible' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

class ZAIProvider extends OpenAIProvider {
  constructor(config) {
    super(config);
    this.baseUrl = config.baseUrl;
    this.model = config.model || 'qwen2.5-coder-7b-instruct';
  }
}

class OpenRouterProvider extends OpenAIProvider {
  constructor(config) {
    super(config);
    this.baseUrl = config.baseUrl || 'https://openrouter.ai/api/v1';
    this.model = config.model || 'qwen/qwen-2.5-coder-7b-instruct';
  }

  async resolveConflict(prompt, options = {}) {
    // Add OpenRouter-specific headers
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': 'https://github.com/promethean',
          'X-Title': 'PR Sync Tool',
        },
        body: JSON.stringify({
          model: options.model || this.model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert developer resolving git merge conflicts. Provide only the resolved code without explanations.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.1,
          max_tokens: 4000,
        }),
        signal: AbortSignal.timeout(this.timeout)
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content?.trim() || '';
    } catch (error) {
      throw new Error(`OpenRouter resolution failed: ${error.message}`);
    }
  }
}

class MultiProviderLLM {
  constructor(providers = []) {
    this.providers = providers;
    this.currentProvider = null;
    this.fallbackLog = [];
  }

  static createFromConfig() {
    const providers = [];

    // 1. Ollama (local, preferred)
    if (process.env.OLLAMA_ENABLED !== 'false') {
      providers.push(new OllamaProvider({
        model: process.env.OLLAMA_MODEL || 'qwen2.5-coder:7b',
        baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
        timeout: parseInt(process.env.OLLAMA_TIMEOUT) || 30000
      }));
    }

    // 2. OpenAI
    if (process.env.OPENAI_API_KEY) {
      providers.push(new OpenAIProvider({
        apiKey: process.env.OPENAI_API_KEY,
        baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
        model: process.env.OPENAI_MODEL || 'gpt-4',
        timeout: parseInt(process.env.OPENAI_TIMEOUT) || 30000
      }));
    }

    // 3. ZAI
    if (process.env.ZAI_API_KEY && process.env.ZAI_BASE_URL) {
      providers.push(new ZAIProvider({
        apiKey: process.env.ZAI_API_KEY,
        baseUrl: process.env.ZAI_BASE_URL,
        model: process.env.ZAI_MODEL || 'qwen2.5-coder-7b-instruct',
        timeout: parseInt(process.env.ZAI_TIMEOUT) || 30000
      }));
    }

    // 4. OpenRouter
    if (process.env.OPENROUTER_API_KEY) {
      providers.push(new OpenRouterProvider({
        apiKey: process.env.OPENROUTER_API_KEY,
        baseUrl: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
        model: process.env.OPENROUTER_MODEL || 'qwen/qwen-2.5-coder-7b-instruct',
        timeout: parseInt(process.env.OPENROUTER_TIMEOUT) || 30000
      }));
    }

    return new MultiProviderLLM(providers);
  }

  async resolveConflict(prompt, options = {}) {
    for (let i = 0; i < this.providers.length; i++) {
      const provider = this.providers[i];

      try {
        // Test connection if we haven't used this provider before
        if (this.currentProvider !== provider.constructor.name) {
          const testResult = await provider.testConnection();
          if (!testResult.success) {
            console.log(`⚠️ ${provider.constructor.name} unavailable: ${testResult.error}`);
            this.fallbackLog.push({
              provider: provider.constructor.name,
              error: testResult.error,
              timestamp: new Date().toISOString()
            });
            continue;
          }
        }

        console.log(`🤖 Using ${provider.constructor.name} for conflict resolution`);
        const result = await provider.resolveConflict(prompt, options);

        this.currentProvider = provider.constructor.name;
        console.log(`✅ ${provider.constructor.name} resolution successful`);

        return result;

      } catch (error) {
        console.log(`⚠️ ${provider.constructor.name} failed: ${error.message}`);
        this.fallbackLog.push({
          provider: provider.constructor.name,
          error: error.message,
          timestamp: new Date().toISOString()
        });

        // Continue to next provider
        continue;
      }
    }

    throw new Error('All LLM providers failed. See fallback log for details.');
  }

  async testAllProviders() {
    console.log('🔍 Testing all LLM providers...\n');

    const results = [];
    for (const provider of this.providers) {
      const testResult = await provider.testConnection();
      results.push({
        provider: provider.constructor.name,
        ...testResult
      });

      const status = testResult.success ? '✅' : '❌';
      const info = testResult.info || testResult.error;
      console.log(`${status} ${provider.constructor.name}: ${info}`);
    }

    const availableCount = results.filter(r => r.success).length;
    console.log(`\n📊 ${availableCount}/${results.length} providers available`);

    return results;
  }

  getFallbackLog() {
    return this.fallbackLog;
  }

  getCurrentProvider() {
    return this.currentProvider;
  }
}

export {
  LLMProvider,
  OllamaProvider,
  OpenAIProvider,
  ZAIProvider,
  OpenRouterProvider,
  MultiProviderLLM
};