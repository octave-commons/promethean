import { BaseProvider } from './base.js';
import { BenchmarkRequest, BenchmarkResponse, ProviderConfig } from '../types/index.js';

export class VLLMProvider extends BaseProvider {
  private baseUrl: string;

  constructor(config: ProviderConfig) {
    super(config);
    this.baseUrl = config.endpoint || 'http://localhost:8000';
  }

  async connect(): Promise<void> {
    const healthy = await this.isHealthy();
    if (!healthy) {
      throw new Error(`Failed to connect to vLLM at ${this.baseUrl}`);
    }
  }

  async disconnect(): Promise<void> {
    // vLLM doesn't require explicit disconnection
  }

  async execute(request: BenchmarkRequest): Promise<BenchmarkResponse> {
    const startTime = Date.now();

    try {
      const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'user',
              content: request.prompt,
            },
          ],
          max_tokens: request.maxTokens || 1000,
          temperature: request.temperature || 0.7,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`vLLM HTTP error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const endTime = Date.now();
      const time = endTime - startTime;

      const content = data.choices[0]?.message?.content || '';
      const usage = data.usage;

      return {
        content,
        tokens: usage?.completion_tokens || 0,
        time,
        metadata: {
          model: data.model,
          id: data.id,
          created: data.created,
          object: data.object,
          prompt_tokens: usage?.prompt_tokens,
          total_tokens: usage?.total_tokens,
          finish_reason: data.choices[0]?.finish_reason,
        },
      };
    } catch (error) {
      throw new Error(`vLLM execution failed: ${error}`);
    }
  }

  async isHealthy(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async listModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/models`);
      if (!response.ok) {
        throw new Error(`Failed to list vLLM models: ${response.status}`);
      }

      const data = await response.json();
      return data.data.map((model: any) => model.id);
    } catch (error) {
      throw new Error(`Failed to list vLLM models: ${error}`);
    }
  }
}
