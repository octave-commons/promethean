import { BaseProvider } from './base.js';
import { BenchmarkRequest, BenchmarkResponse, ProviderConfig } from '../types/index.js';
import { Ollama as OllamaClient } from 'ollama';

export class OllamaProvider extends BaseProvider {
  private client: OllamaClient;

  constructor(config: ProviderConfig) {
    super(config);
    this.client = new OllamaClient({
      host: config.endpoint || 'http://127.0.0.1:11434',
    });
  }

  async connect(): Promise<void> {
    // Test connection
    const healthy = await this.isHealthy();
    if (!healthy) {
      throw new Error(`Failed to connect to Ollama at ${this.config.endpoint}`);
    }
  }

  async disconnect(): Promise<void> {
    // Ollama doesn't require explicit disconnection
  }

  async execute(request: BenchmarkRequest): Promise<BenchmarkResponse> {
    const startTime = Date.now();

    try {
      const response = await this.client.generate({
        model: this.config.model,
        prompt: request.prompt,
        stream: false,
        options: {
          temperature: request.temperature,
          num_predict: request.maxTokens,
        },
      });

      const endTime = Date.now();
      const time = endTime - startTime;

      return {
        content: response.response,
        tokens: response.eval_count || 0,
        time,
        metadata: {
          model: response.model,
          created_at: response.created_at,
          done: response.done,
          total_duration: response.total_duration,
          load_duration: response.load_duration,
          prompt_eval_count: response.prompt_eval_count,
          prompt_eval_duration: response.prompt_eval_duration,
          eval_count: response.eval_count,
          eval_duration: response.eval_duration,
        },
      };
    } catch (error) {
      throw new Error(`Ollama execution failed: ${error}`);
    }
  }

  async isHealthy(): Promise<boolean> {
    try {
      await this.client.list();
      return true;
    } catch (error) {
      return false;
    }
  }

  async listModels(): Promise<string[]> {
    try {
      const response = await this.client.list();
      return response.models.map((model: any) => model.name);
    } catch (error) {
      throw new Error(`Failed to list Ollama models: ${error}`);
    }
  }

  async pullModel(model: string): Promise<void> {
    try {
      await this.client.pull({ model });
    } catch (error) {
      throw new Error(`Failed to pull Ollama model ${model}: ${error}`);
    }
  }
}
