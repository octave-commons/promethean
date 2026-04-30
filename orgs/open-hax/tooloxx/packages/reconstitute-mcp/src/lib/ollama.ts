/**
 * Ollama API client for embeddings and chat completions.
 */

import { loadConfig } from './config.js';
import { debug, info, warn, error } from './log.js';

export interface EmbeddingRequest {
  model: string;
  input: string[];
  options?: {
    num_ctx?: number;
  };
}

export interface EmbeddingResponse {
  embedding: number[][];
}

export interface ChatRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant' | 'tool';
    content: string;
    tool_calls?: Array<{
      function: {
        name: string;
        arguments: Record<string, unknown>;
      };
    }>;
    tool_call_id?: string;
  }>;
  stream?: boolean;
  options?: {
    num_ctx?: number;
  };
}

export interface ChatResponse {
  message: {
    role: 'assistant';
    content: string;
    tool_calls?: Array<{
      function: {
        name: string;
        arguments: string;
      };
    }>;
  };
}

export interface Tool {
  function: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, {
        type: string;
        description: string;
      }>;
      required: string[];
    };
  };
}

export interface OllamaTools {
  tools: Tool[];
}

/**
 * Make a request to the Ollama API.
 */
async function ollamaRequest<T>(
  endpoint: string,
  body: unknown,
  timeoutMs: number = 120000
): Promise<T> {
  const config = loadConfig();
  const url = `${config.ollamaApiBase}${endpoint}`;

  debug('Ollama API request', { endpoint, url });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ollama API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json() as Promise<T>;
  } catch (err) {
    clearTimeout(timeout);
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error(`Ollama API timeout after ${timeoutMs}ms`);
    }
    throw err;
  }
}

/**
 * Get embeddings for texts using Ollama.
 */
export async function getEmbeddings(
  texts: string[],
  model?: string,
  numCtx?: number
): Promise<number[][]> {
  const config = loadConfig();
  const embeddingModel = model ?? config.embeddingModel;
  const contextLength = numCtx ?? config.embedNumCtx;

  info(`Getting embeddings for ${texts.length} texts`, {
    model: embeddingModel,
    contextLength,
  });

  const request: EmbeddingRequest = {
    model: embeddingModel,
    input: texts,
    options: {
      num_ctx: contextLength,
    },
  };

  const response = await ollamaRequest<EmbeddingResponse>('/api/embed', request, 300000);
  debug('Embeddings received', { count: response.embedding.length });

  return response.embedding;
}

/**
 * Get a single embedding for a text.
 */
export async function getEmbedding(text: string, model?: string): Promise<number[]> {
  const embeddings = await getEmbeddings([text], model);
  return embeddings[0];
}

/**
 * Get embeddings with retry logic.
 */
export async function getEmbeddingsWithRetry(
  texts: string[],
  maxRetries: number = 3,
  delayMs: number = 5000,
  model?: string
): Promise<number[][]> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await getEmbeddings(texts, model);
    } catch (err) {
      lastError = err as Error;
      warn(`Embedding attempt ${attempt}/${maxRetries} failed`, {
        error: lastError.message,
      });

      if (attempt < maxRetries) {
        info(`Retrying in ${delayMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError;
}

/**
 * Get chat completion from Ollama.
 */
export async function getChatCompletion(
  messages: ChatRequest['messages'],
  model?: string,
  stream: boolean = false,
  numCtx?: number
): Promise<ChatResponse> {
  const config = loadConfig();
  const chatModel = model ?? config.chatModel;
  const contextLength = numCtx ?? config.chatNumCtx;

  debug('Chat completion request', {
    model: chatModel,
    messageCount: messages.length,
    stream,
  });

  const request: ChatRequest = {
    model: chatModel,
    messages: messages as ChatRequest['messages'],
    stream,
    options: {
      num_ctx: contextLength,
    },
  };

  return ollamaRequest<ChatResponse>('/api/chat', request);
}

/**
 * Get available tools/schema from Ollama.
 */
export async function getOllamaTools(): Promise<OllamaTools> {
  const config = loadConfig();
  return ollamaRequest<OllamaTools>('/api/tags', {});
}

/**
 * Check if Ollama is available.
 */
export async function checkOllamaHealth(): Promise<boolean> {
  const config = loadConfig();
  try {
    const response = await fetch(`${config.ollamaApiBase}/api/tags`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * List available models from Ollama.
 */
export interface OllamaModel {
  name: string;
  size: number;
  digest: string;
  modified_at: string;
}

export async function listOllamaModels(): Promise<OllamaModel[]> {
  const config = loadConfig();
  try {
    const response = await fetch(`${config.ollamaApiBase}/api/tags`, {
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`Failed to list models: ${response.status}`);
    }

    const data = await response.json() as { models: OllamaModel[] };
    return data.models || [];
  } catch (err) {
    error('Failed to list Ollama models', { error: (err as Error).message });
    return [];
  }
}
