# Pantheon LLM OpenAI

## Overview

`@promethean-os/pantheon-llm-openai` provides a comprehensive OpenAI API integration for the Pantheon Agent Management Framework. It implements the `LlmPort` interface to enable seamless integration with OpenAI's language models.

## Key Features

- **Full OpenAI API Support**: Complete integration with OpenAI's chat completion API
- **Type Safety**: Full TypeScript support with proper type definitions
- **Error Handling**: Comprehensive error handling and retry logic
- **Configuration**: Flexible configuration options for different use cases
- **Streaming Support**: Real-time streaming responses (when supported)
- **Model Flexibility**: Support for all OpenAI chat models

## Installation

```bash
pnpm add @promethean-os/pantheon-llm-openai
```

## Quick Start

### Basic Usage

```typescript
import { makeOpenAIAdapter } from '@promethean-os/pantheon-llm-openai';
import type { Message } from '@promethean-os/pantheon-core';

// Create OpenAI adapter
const openaiAdapter = makeOpenAIAdapter({
  apiKey: process.env.OPENAI_API_KEY!,
  defaultModel: 'gpt-3.5-turbo',
  defaultTemperature: 0.7,
});

// Use the adapter
const messages: Message[] = [
  { role: 'system', content: 'You are a helpful AI assistant.' },
  { role: 'user', content: 'What is the capital of France?' },
];

const response = await openaiAdapter.complete(messages, {
  model: 'gpt-4',
  temperature: 0.3,
});

console.log(response.content);
// Output: "The capital of France is Paris."
```

### Integration with Pantheon

```typescript
import { makeOrchestrator } from '@promethean-os/pantheon-core';
import { makeOpenAIAdapter } from '@promethean-os/pantheon-llm-openai';

// Create OpenAI adapter
const llmAdapter = makeOpenAIAdapter({
  apiKey: process.env.OPENAI_API_KEY!,
  baseURL: 'https://api.openai.com/v1',
  defaultModel: 'gpt-4',
  defaultTemperature: 0.7,
  defaultMaxTokens: 2000,
});

// Create orchestrator with OpenAI
const orchestrator = makeOrchestrator({
  now: () => Date.now(),
  log: console.log,
  context: contextAdapter,
  tools: toolAdapter,
  llm: llmAdapter, // Use OpenAI adapter
  bus: messageBus,
  schedule: scheduler,
  state: actorStateAdapter,
});
```

## Configuration

### OpenAIAdapterConfig

```typescript
interface OpenAIAdapterConfig {
  // Required
  apiKey: string;

  // Optional - API Configuration
  baseURL?: string;
  organization?: string;

  // Optional - Default Parameters
  defaultModel?: string;
  defaultTemperature?: number;
  defaultMaxTokens?: number;
  defaultTopP?: number;
  defaultFrequencyPenalty?: number;
  defaultPresencePenalty?: number;
}
```

### Complete Configuration Example

```typescript
const config: OpenAIAdapterConfig = {
  // API Configuration
  apiKey: process.env.OPENAI_API_KEY!,
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
  organization: process.env.OPENAI_ORG_ID,

  // Default Model Parameters
  defaultModel: 'gpt-4',
  defaultTemperature: 0.7,
  defaultMaxTokens: 2000,
  defaultTopP: 1.0,
  defaultFrequencyPenalty: 0.0,
  defaultPresencePenalty: 0.0,
};

const adapter = makeOpenAIAdapter(config);
```

### Environment Variables

```bash
# Required
OPENAI_API_KEY=sk-your-openai-api-key

# Optional
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_ORG_ID=org-your-organization-id

# Default Parameters
DEFAULT_MODEL=gpt-4
DEFAULT_TEMPERATURE=0.7
DEFAULT_MAX_TOKENS=2000
DEFAULT_TOP_P=1.0
DEFAULT_FREQUENCY_PENALTY=0.0
DEFAULT_PRESENCE_PENALTY=0.0
```

## Advanced Usage

### Custom Model Configuration

```typescript
// Create adapter for specific use case
const creativeAdapter = makeOpenAIAdapter({
  apiKey: process.env.OPENAI_API_KEY!,
  defaultModel: 'gpt-4',
  defaultTemperature: 0.9,
  defaultMaxTokens: 3000,
  defaultTopP: 0.95,
  defaultFrequencyPenalty: 0.5,
  defaultPresencePenalty: 0.5,
});

const analyticalAdapter = makeOpenAIAdapter({
  apiKey: process.env.OPENAI_API_KEY!,
  defaultModel: 'gpt-4',
  defaultTemperature: 0.1,
  defaultMaxTokens: 1500,
  defaultTopP: 0.5,
  defaultFrequencyPenalty: 0.0,
  defaultPresencePenalty: 0.0,
});

// Use different adapters for different purposes
const creativeResponse = await creativeAdapter.complete(messages);
const analyticalResponse = await analyticalAdapter.complete(messages);
```

### Dynamic Model Selection

```typescript
class ModelSelector {
  private adapters = new Map<string, any>();

  constructor(apiKey: string) {
    // Pre-create adapters for different models
    this.adapters.set(
      'gpt-3.5-turbo',
      makeOpenAIAdapter({
        apiKey,
        defaultModel: 'gpt-3.5-turbo',
        defaultTemperature: 0.7,
      }),
    );

    this.adapters.set(
      'gpt-4',
      makeOpenAIAdapter({
        apiKey,
        defaultModel: 'gpt-4',
        defaultTemperature: 0.7,
      }),
    );

    this.adapters.set(
      'gpt-4-turbo',
      makeOpenAIAdapter({
        apiKey,
        defaultModel: 'gpt-4-turbo-preview',
        defaultTemperature: 0.7,
      }),
    );
  }

  async complete(messages: Message[], model: string = 'gpt-3.5-turbo') {
    const adapter = this.adapters.get(model);
    if (!adapter) {
      throw new Error(`Model ${model} not supported`);
    }

    return await adapter.complete(messages);
  }
}

const modelSelector = new ModelSelector(process.env.OPENAI_API_KEY!);

// Use different models based on requirements
const quickResponse = await modelSelector.complete(messages, 'gpt-3.5-turbo');
const qualityResponse = await modelSelector.complete(messages, 'gpt-4');
const turboResponse = await modelSelector.complete(messages, 'gpt-4-turbo');
```

### Token Management

```typescript
class TokenAwareAdapter {
  private adapter: any;
  private tokenUsage = {
    prompt: 0,
    completion: 0,
    total: 0,
  };

  constructor(config: OpenAIAdapterConfig) {
    this.adapter = makeOpenAIAdapter(config);
  }

  async complete(messages: Message[], opts?: any) {
    // Estimate tokens before request
    const estimatedTokens = this.estimateTokens(messages);

    // Check if we have enough tokens/quota
    if (this.tokenUsage.total + estimatedTokens > this.getQuotaLimit()) {
      throw new Error('Token quota exceeded');
    }

    try {
      const response = await this.adapter.complete(messages, opts);

      // Update token usage (in real implementation, get from API response)
      this.tokenUsage.prompt += estimatedTokens;
      this.tokenUsage.completion += this.estimateTokens([response]);
      this.tokenUsage.total = this.tokenUsage.prompt + this.tokenUsage.completion;

      return response;
    } catch (error) {
      // Handle quota exceeded errors
      if (error.message.includes('quota')) {
        console.error('OpenAI quota exceeded:', this.tokenUsage);
      }
      throw error;
    }
  }

  private estimateTokens(messages: Message[]): number {
    // Rough estimation: ~4 characters per token
    const totalChars = messages.reduce((sum, msg) => sum + msg.content.length, 0);
    return Math.ceil(totalChars / 4);
  }

  private getQuotaLimit(): number {
    // Get quota limit from environment or API
    return parseInt(process.env.OPENAI_QUOTA_LIMIT || '100000');
  }

  getTokenUsage() {
    return { ...this.tokenUsage };
  }
}
```

### Error Handling and Retries

```typescript
import { makeOpenAIAdapter } from '@promethean-os/pantheon-llm-openai';

class RobustOpenAIAdapter {
  private adapter: any;
  private maxRetries = 3;
  private retryDelay = 1000; // 1 second

  constructor(config: OpenAIAdapterConfig) {
    this.adapter = makeOpenAIAdapter(config);
  }

  async complete(messages: Message[], opts?: any): Promise<Message> {
    let lastError: Error;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await this.adapter.complete(messages, opts);
      } catch (error) {
        lastError = error as Error;

        // Don't retry on certain errors
        if (this.isNonRetryableError(error)) {
          throw error;
        }

        // Wait before retry (exponential backoff)
        if (attempt < this.maxRetries) {
          const delay = this.retryDelay * Math.pow(2, attempt);
          await this.sleep(delay);
        }
      }
    }

    throw lastError!;
  }

  private isNonRetryableError(error: any): boolean {
    // Don't retry on authentication errors
    if (error.message.includes('401') || error.message.includes('authentication')) {
      return true;
    }

    // Don't retry on invalid request errors
    if (error.message.includes('400') || error.message.includes('invalid')) {
      return true;
    }

    // Don't retry on content policy violations
    if (error.message.includes('content_policy') || error.message.includes('safety')) {
      return true;
    }

    return false;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
```

### Streaming Support

```typescript
// Note: This would require extending the base adapter to support streaming
class StreamingOpenAIAdapter {
  private adapter: any;

  constructor(config: OpenAIAdapterConfig) {
    this.adapter = makeOpenAIAdapter(config);
  }

  async completeStream(
    messages: Message[],
    opts?: any,
    onChunk?: (chunk: string) => void,
  ): Promise<Message> {
    // This would require implementing streaming support
    // For now, fall back to non-streaming
    return await this.adapter.complete(messages, opts);
  }

  // Alternative implementation using OpenAI client directly
  async completeWithStreaming(messages: Message[], opts?: any) {
    const OpenAI = (await import('openai')).default;
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const stream = await client.chat.completions.create({
      model: opts?.model || 'gpt-4',
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      stream: true,
      temperature: opts?.temperature,
    });

    let fullContent = '';

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      fullContent += content;

      // Emit chunk if callback provided
      if (opts?.onChunk) {
        opts.onChunk(content);
      }
    }

    return {
      role: 'assistant',
      content: fullContent,
    };
  }
}
```

## Integration Patterns

### Actor with OpenAI

```typescript
import { createLLMActor } from '@promethean-os/pantheon';
import { makeOpenAIAdapter } from '@promethean-os/pantheon-llm-openai';

// Create OpenAI adapter
const llmAdapter = makeOpenAIAdapter({
  apiKey: process.env.OPENAI_API_KEY!,
  defaultModel: 'gpt-4',
  defaultTemperature: 0.7,
});

// Create LLM actor with OpenAI
const customerServiceActor = createLLMActor('customer-service', {
  model: 'gpt-4',
  temperature: 0.7,
  systemPrompt: `You are a helpful customer service agent for an e-commerce platform.
  
  Guidelines:
  - Be polite and professional
  - Help with orders, returns, and product information
  - Escalate complex issues to human agents
  - Always provide order status when available
  - Offer alternatives when products are out of stock`,
  maxTokens: 1000,
});

// Use with orchestrator
const orchestrator = makeOrchestrator({
  // ... other dependencies
  llm: llmAdapter,
});

await orchestrator.tickActor(customerServiceActor, {
  userMessage: 'I need to track my order #12345',
});
```

### Multi-Model Actor

```typescript
const multiModelActor = createLLMActor('multi-model-assistant', {
  model: 'gpt-4', // Default model
  temperature: 0.7,
  systemPrompt: 'You are a versatile AI assistant.',
  maxTokens: 2000,

  // Custom model selection logic
  selectModel: (context: Message[], task: string) => {
    // Choose model based on task complexity
    if (task.includes('creative') || task.includes('brainstorm')) {
      return 'gpt-4';
    } else if (task.includes('quick') || task.includes('simple')) {
      return 'gpt-3.5-turbo';
    } else if (task.includes('complex') || task.includes('analysis')) {
      return 'gpt-4-turbo';
    }
    return 'gpt-4';
  },
});
```

## Performance Optimization

### Response Caching

```typescript
class CachedOpenAIAdapter {
  private adapter: any;
  private cache = new Map<string, { response: Message; timestamp: number }>();
  private cacheTTL = 300000; // 5 minutes

  constructor(config: OpenAIAdapterConfig) {
    this.adapter = makeOpenAIAdapter(config);
  }

  async complete(messages: Message[], opts?: any): Promise<Message> {
    const cacheKey = this.generateCacheKey(messages, opts);

    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.response;
    }

    // Make request
    const response = await this.adapter.complete(messages, opts);

    // Cache response
    this.cache.set(cacheKey, {
      response,
      timestamp: Date.now(),
    });

    // Clean old cache entries
    this.cleanCache();

    return response;
  }

  private generateCacheKey(messages: Message[], opts?: any): string {
    const key = {
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      model: opts?.model,
      temperature: opts?.temperature,
    };
    return Buffer.from(JSON.stringify(key)).toString('base64');
  }

  private cleanCache() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.cacheTTL) {
        this.cache.delete(key);
      }
    }
  }
}
```

### Batch Processing

```typescript
class BatchOpenAIAdapter {
  private adapter: any;
  private batchSize = 10;
  private batchTimeout = 1000; // 1 second

  constructor(config: OpenAIAdapterConfig) {
    this.adapter = makeOpenAIAdapter(config);
  }

  async completeBatch(
    requests: Array<{
      messages: Message[];
      opts?: any;
      id: string;
    }>,
  ): Promise<Array<{ id: string; response: Message }>> {
    const results: Array<{ id: string; response: Message }> = [];

    // Process in batches
    for (let i = 0; i < requests.length; i += this.batchSize) {
      const batch = requests.slice(i, i + this.batchSize);

      // Process batch concurrently
      const batchPromises = batch.map(async (request) => {
        try {
          const response = await this.adapter.complete(request.messages, request.opts);
          return { id: request.id, response };
        } catch (error) {
          console.error(`Request ${request.id} failed:`, error);
          return { id: request.id, response: null };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Wait between batches to avoid rate limiting
      if (i + this.batchSize < requests.length) {
        await this.sleep(this.batchTimeout);
      }
    }

    return results;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
```

## Testing

### Unit Testing

```typescript
import test from 'ava';
import { makeOpenAIAdapter } from '@promethean-os/pantheon-llm-openai';

// Mock OpenAI for testing
const mockOpenAI = {
  chat: {
    completions: {
      create: async (params: any) => ({
        choices: [
          {
            message: {
              role: 'assistant',
              content: `Mock response for: ${params.messages[params.messages.length - 1].content}`,
            },
          },
        ],
      }),
    },
  },
};

test('OpenAI adapter completion', async (t) => {
  // Mock the OpenAI import
  const originalOpenAI = await import('openai');
  // This would require dependency injection or mocking framework

  const adapter = makeOpenAIAdapter({
    apiKey: 'test-key',
    defaultModel: 'gpt-3.5-turbo',
  });

  const messages = [{ role: 'user', content: 'Hello, world!' }];

  const response = await adapter.complete(messages);

  t.is(response.role, 'assistant');
  t.truthy(response.content);
});
```

### Integration Testing

```typescript
test('OpenAI adapter with real API', async (t) => {
  if (!process.env.OPENAI_API_KEY) {
    t.pass('Skipping integration test - no API key');
    return;
  }

  const adapter = makeOpenAIAdapter({
    apiKey: process.env.OPENAI_API_KEY!,
    defaultModel: 'gpt-3.5-turbo',
  });

  const messages = [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'What is 2 + 2?' },
  ];

  const response = await adapter.complete(messages);

  t.is(response.role, 'assistant');
  t.truthy(response.content.includes('4'));
});
```

## Error Handling

### Common Error Types

```typescript
// OpenAI API error handling
try {
  const response = await openaiAdapter.complete(messages);
} catch (error) {
  if (error.message.includes('401')) {
    console.error('Authentication failed - check API key');
  } else if (error.message.includes('429')) {
    console.error('Rate limit exceeded - please wait');
  } else if (error.message.includes('500')) {
    console.error('OpenAI server error - please try again');
  } else if (error.message.includes('content_policy')) {
    console.error('Content policy violation');
  } else {
    console.error('Unknown error:', error);
  }
}
```

### Error Recovery

```typescript
class ResilientOpenAIAdapter {
  private adapter: any;
  private fallbackAdapter?: any;

  constructor(config: OpenAIAdapterConfig, fallbackConfig?: OpenAIAdapterConfig) {
    this.adapter = makeOpenAIAdapter(config);
    if (fallbackConfig) {
      this.fallbackAdapter = makeOpenAIAdapter(fallbackConfig);
    }
  }

  async complete(messages: Message[], opts?: any): Promise<Message> {
    try {
      return await this.adapter.complete(messages, opts);
    } catch (error) {
      console.warn('Primary adapter failed, trying fallback:', error.message);

      if (this.fallbackAdapter) {
        return await this.fallbackAdapter.complete(messages, opts);
      }

      throw error;
    }
  }
}

// Usage with fallback
const resilientAdapter = new ResilientOpenAIAdapter(
  {
    apiKey: process.env.OPENAI_API_KEY!,
    defaultModel: 'gpt-4',
  },
  {
    apiKey: process.env.OPENAI_BACKUP_API_KEY!,
    defaultModel: 'gpt-3.5-turbo',
  },
);
```

## Security Considerations

### API Key Management

```typescript
// Secure API key handling
class SecureOpenAIAdapter {
  private adapter: any;

  constructor() {
    // Never hardcode API keys
    const apiKey = this.getSecureApiKey();

    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    this.adapter = makeOpenAIAdapter({
      apiKey,
      // Validate API key format
      validateApiKey: true,
    });
  }

  private getSecureApiKey(): string | undefined {
    // Try multiple secure sources
    return (
      process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_FILE || this.getApiKeyFromVault()
    );
  }

  private getApiKeyFromVault(): string | undefined {
    // Implementation for secure vault integration
    // e.g., HashiCorp Vault, AWS Secrets Manager
    return undefined;
  }
}
```

### Input Validation

```typescript
class ValidatedOpenAIAdapter {
  private adapter: any;

  constructor(config: OpenAIAdapterConfig) {
    this.adapter = makeOpenAIAdapter(config);
  }

  async complete(messages: Message[], opts?: any): Promise<Message> {
    // Validate messages
    this.validateMessages(messages);

    // Validate options
    this.validateOptions(opts);

    return await this.adapter.complete(messages, opts);
  }

  private validateMessages(messages: Message[]): void {
    if (!Array.isArray(messages)) {
      throw new Error('Messages must be an array');
    }

    if (messages.length === 0) {
      throw new Error('At least one message is required');
    }

    for (const message of messages) {
      if (!['system', 'user', 'assistant'].includes(message.role)) {
        throw new Error(`Invalid message role: ${message.role}`);
      }

      if (typeof message.content !== 'string') {
        throw new Error('Message content must be a string');
      }

      if (message.content.length > 100000) {
        throw new Error('Message content too long');
      }
    }
  }

  private validateOptions(opts?: any): void {
    if (!opts) return;

    if (opts.temperature !== undefined) {
      if (typeof opts.temperature !== 'number' || opts.temperature < 0 || opts.temperature > 2) {
        throw new Error('Temperature must be between 0 and 2');
      }
    }

    if (opts.maxTokens !== undefined) {
      if (typeof opts.maxTokens !== 'number' || opts.maxTokens < 1 || opts.maxTokens > 32000) {
        throw new Error('Max tokens must be between 1 and 32000');
      }
    }
  }
}
```

## Related Documentation

- [pantheon-core](pantheon-core.md): Core framework concepts
- [pantheon-mcp](pantheon-mcp.md): MCP tool integration
- [Integration Guide](integration-guide.md): Integration patterns
- [Troubleshooting](troubleshooting-faq.md): Common issues

## File Locations

- **OpenAI Adapter**: `/packages/pantheon-llm-openai/src/index.ts`
- **Types**: `/packages/pantheon-llm-openai/src/types.ts`
- **Tests**: `/packages/pantheon-llm-openai/src/tests/`

---

Pantheon LLM OpenAI provides a robust, type-safe, and feature-rich integration with OpenAI's language models, enabling sophisticated AI agent capabilities within the Pantheon ecosystem.
