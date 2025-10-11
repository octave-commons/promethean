import { BaseProvider } from './base.js';
import { BenchmarkRequest, BenchmarkResponse, ProviderConfig } from '../types/index.js';
import OpenAI from 'openai';

export class OpenAIProvider extends BaseProvider {
  private client: OpenAI;

  constructor(config: ProviderConfig) {
    super(config);
    this.client = new OpenAI({
      apiKey: config.apiKey || process.env.OPENAI_API_KEY,
      baseURL: config.endpoint,
    });
  }

  async connect(): Promise<void> {
    try {
      // Test connection by listing models
      await this.client.models.list();
    } catch (error) {
      throw new Error(`Failed to connect to OpenAI: ${error}`);
    }
  }

  async disconnect(): Promise<void> {
    // OpenAI client doesn't require explicit disconnection
  }

  async execute(request: BenchmarkRequest): Promise<BenchmarkResponse> {
    const startTime = Date.now();

    try {
      const response = await this.client.chat.completions.create({
        model: this.config.model,
        messages: [
          {
            role: 'user',
            content: request.prompt,
          },
        ],
        max_tokens: request.maxTokens,
        temperature: request.temperature,
        stream: false,
      });

      const endTime = Date.now();
      const time = endTime - startTime;

      const content = response.choices[0]?.message?.content || '';
      const usage = response.usage;

      return {
        content,
        tokens: usage?.completion_tokens || 0,
        time,
        metadata: {
          model: response.model,
          id: response.id,
          created: response.created,
          object: response.object,
          prompt_tokens: usage?.prompt_tokens,
          total_tokens: usage?.total_tokens,
          finish_reason: response.choices[0]?.finish_reason,
          system_fingerprint: response.system_fingerprint,
        },
      };
    } catch (error) {
      throw new Error(`OpenAI execution failed: ${error}`);
    }
  }

  async isHealthy(): Promise<boolean> {
    try {
      await this.client.models.list();
      return true;
    } catch (error) {
      return false;
    }
  }

  async listModels(): Promise<string[]> {
    try {
      const response = await this.client.models.list();
      return response.data.map((model: any) => model.id);
    } catch (error) {
      throw new Error(`Failed to list OpenAI models: ${error}`);
    }
  }
}
