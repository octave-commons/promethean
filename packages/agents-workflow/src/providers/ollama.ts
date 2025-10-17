/* eslint-disable import/order */
import { randomUUID } from 'node:crypto';
import {
  Usage,
  assistant,
  type AgentInputItem,
  type AssistantMessageItem,
  type Model,
  type ModelProvider,
  type ModelRequest,
  type ModelResponse,
  type StreamEvent,
  type SystemMessageItem,
  type UserMessageItem,
} from '@openai/agents';
import {
  Ollama as OllamaClient,
  type ChatRequest,
  type ChatResponse,
  type Message,
  type Tool as OllamaTool,
} from 'ollama';

import {
  isMessageItem,
  flattenEntries,
  toMessageContent,
  convertInputToMessages,
  normalizeJsonSchema,
  convertTools,
  convertSettings,
  toUsage,
  toUsageComponents,
} from './ollamaHelpers';

// Defines compatible client interface
export type OllamaClientLike = {
  chat(request: ChatRequest & { stream: true }): Promise<AsyncIterable<ChatResponse>>;
  chat(request: ChatRequest & { stream?: false }): Promise<ChatResponse>;
};

// Provider options for OllamaModel
export type OllamaModelProviderOptions = {
  host?: string;
  defaultModel?: string;
  client?: OllamaClientLike;
  requestOptions?: Partial<Omit<ChatRequest, 'model' | 'messages' | 'stream'>>;
};

// Core model implementation
class OllamaModel implements Model {
  private client: OllamaClientLike;
  private modelName: string;
  private defaults?: Partial<Omit<ChatRequest, 'model' | 'messages' | 'stream'>>;

  constructor(
    client: OllamaClientLike,
    modelName: string,
    defaults?: Partial<Omit<ChatRequest, 'model' | 'messages' | 'stream'>>,
  ) {
    this.client = client;
    this.modelName = modelName;
    this.defaults = defaults;
  }

  // Build the chat request with defaults, tools, and settings
  private buildRequest(request: ModelRequest, stream: boolean): ChatRequest {
    const base: ChatRequest = { model: this.modelName, messages: convertInputToMessages(request), stream };
    if (this.defaults) {
      for (const [key, value] of Object.entries(this.defaults)) {
        if (value === undefined || key === 'model' || key === 'messages' || key === 'stream') continue;
        (base as Record<string, unknown>)[key] = value;
      }
    }
    const tools = convertTools(request.tools);
    if (tools) base.tools = tools;
    const options = convertSettings(request.modelSettings);
    if (options) base.options = { ...(base.options ?? {}), ...options };
    return base;
  }

  // Convert ChatResponse to ModelResponse
  private toResponse(response: ChatResponse): ModelResponse {
    const { usage } = toUsageComponents(response);
    const content = response.message?.content ?? '';
    return {
      usage,
      output: [assistant(content)],
      responseId: `ollama-${randomUUID()}`,
      providerData: { raw: response },
    };
  }

  // Synchronous response
  async getResponse(request: ModelRequest): Promise<ModelResponse> {
    const chatRequest = this.buildRequest(request, false) as ChatRequest & { stream?: false };
    try {
      const response = await this.client.chat(chatRequest);
      return this.toResponse(response);
    } catch (err) {
      throw new Error(`OllamaModel getResponse failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  // Streaming response
  async *getStreamedResponse(request: ModelRequest): AsyncIterable<StreamEvent> {
    const chatRequest = this.buildRequest(request, true) as ChatRequest & { stream: true };
    try {
      const stream = await this.client.chat(chatRequest);
      yield { type: 'response_started' } as StreamEvent;
      let aggregated = '';
      let lastChunk: ChatResponse | undefined;
      for await (const chunk of stream) {
        lastChunk = chunk;
        const delta = chunk.message?.content ?? '';
        if (delta) {
          aggregated += delta;
          yield { type: 'output_text_delta', delta } as StreamEvent;
        }
      }
      const finalChunk = lastChunk ?? ({
        model: this.modelName,
        created_at: new Date(),
        message: { role: 'assistant', content: aggregated },
        done: true,
        done_reason: 'stop',
        total_duration: 0,
        load_duration: 0,
        prompt_eval_count: 0,
        prompt_eval_duration: 0,
        eval_count: 0,
        eval_duration: 0,
      } as ChatResponse);
      const { payload } = toUsageComponents(lastChunk);
      const responseId = `ollama-${randomUUID()}`;
      yield {
        type: 'response_done',
        response: {
          id: responseId,
          usage: payload,
          output: [assistant(aggregated)],
          providerData: { raw: finalChunk },
        },
      } as StreamEvent;
    } catch (err) {
      throw new Error(`OllamaModel getStreamedResponse failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
}

// Provider that returns instances of OllamaModel
export class OllamaModelProvider implements ModelProvider {
  private client: OllamaClientLike;
  private defaultModel: string;
  private requestDefaults?: Partial<Omit<ChatRequest, 'model' | 'messages' | 'stream'>>;

  constructor(options: OllamaModelProviderOptions = {}) {
    this.defaultModel = options.defaultModel ?? 'llama3.1';
    this.requestDefaults = options.requestOptions;
    this.client = options.client ?? new OllamaClient(options.host ? { host: options.host } : undefined);
  }

  async getModel(modelName?: string): Promise<Model> {
    const target = modelName ?? this.defaultModel;
    return new OllamaModel(this.client, target, this.requestDefaults);
  }
}

// Helper to create provider
export function createOllamaModelProvider(options: OllamaModelProviderOptions = {}): OllamaModelProvider {
  return new OllamaModelProvider(options);
}
