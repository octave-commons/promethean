/**
 * Ollama LLM Provider
 * 
 * Integrates with local Ollama instance for qwen3-vl:2instruct.
 */

import type {
  Session,
  CephalonEvent,
  CephalonPolicy,
  ToolCall,
  ToolResult,
  ChatMessage,
} from "../types/index.js";
import type { ToolDefinition } from "../prompts/index.js";
import { messageToOllamaFormat, messageToOpenAIFormat } from "./message.js";
import { ollamaRequestQueue } from "./ollama-request-queue.js";

export interface OllamaConfig {
  baseUrl: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
  apiKey?: string;
}

export interface LLMProvider {
  complete(
    messages: ChatMessage[],
    options?: { queueKey?: string; reasoningEffort?: 'low' | 'medium' | 'high' | 'xhigh' },
  ): Promise<string>;
  completeWithTools(
    messages: ChatMessage[],
    tools: ToolDefinition[],
    options?: { queueKey?: string; reasoningEffort?: 'low' | 'medium' | 'high' | 'xhigh' },
  ): Promise<{ content?: string; toolCalls?: ToolCall[] }>;
}

export type { LLMProvider as LLMProviderInterface };

type ToolNameMaps = {
  originalToWire: Map<string, string>;
  wireToOriginal: Map<string, string>;
};

function useOpenAiCompatEndpoints(): boolean {
  return /^(1|true|yes|on)$/i.test(
    process.env.CEPHALON_USE_OPENAI_ENDPOINTS
      ?? process.env.OLLAMA_USE_OPENAI_ENDPOINTS
      ?? "",
  );
}

function sanitizeToolName(name: string): string {
  const normalized = name
    .replace(/[^A-Za-z0-9_-]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
  return (normalized.length > 0 ? normalized : "tool").slice(0, 64);
}

function buildToolNameMaps(tools: readonly ToolDefinition[]): ToolNameMaps {
  const originalToWire = new Map<string, string>();
  const wireToOriginal = new Map<string, string>();

  for (const tool of tools) {
    const original = tool.name;
    let candidate = sanitizeToolName(original);
    let suffix = 2;
    while (wireToOriginal.has(candidate) && wireToOriginal.get(candidate) !== original) {
      const suffixText = `_${suffix++}`;
      candidate = `${sanitizeToolName(original).slice(0, Math.max(1, 64 - suffixText.length))}${suffixText}`;
    }
    originalToWire.set(original, candidate);
    wireToOriginal.set(candidate, original);
  }

  return { originalToWire, wireToOriginal };
}

function toWireToolName(name: string, maps: ToolNameMaps): string {
  return maps.originalToWire.get(name) ?? sanitizeToolName(name);
}

function toOriginalToolName(name: string, maps: ToolNameMaps): string {
  return maps.wireToOriginal.get(name) ?? name;
}

function buildProviderHeaders(apiKey?: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    ...(process.env.OLLAMA_FEDERATION_OWNER_SUBJECT
      ? { "x-open-hax-federation-owner-subject": process.env.OLLAMA_FEDERATION_OWNER_SUBJECT }
      : {}),
  };
}

function sanitizeNativeMessages(
  messages: ReturnType<typeof messageToOllamaFormat>[],
  maps: ToolNameMaps,
): ReturnType<typeof messageToOllamaFormat>[] {
  return messages.map((message) => ({
    ...message,
    ...(Array.isArray((message as { tool_calls?: unknown }).tool_calls)
      ? {
          tool_calls: ((message as { tool_calls?: Array<{ function?: { name?: string } }> }).tool_calls ?? []).map((toolCall) => ({
            ...toolCall,
            function: toolCall.function
              ? {
                  ...toolCall.function,
                  ...(typeof toolCall.function.name === "string"
                    ? { name: toWireToolName(toolCall.function.name, maps) }
                    : {}),
                }
              : toolCall.function,
          })),
        }
      : {}),
    ...(typeof (message as { tool_name?: unknown }).tool_name === "string"
      ? { tool_name: toWireToolName((message as { tool_name: string }).tool_name, maps) }
      : {}),
  }));
}

function sanitizeOpenAiMessages(
  messages: ReturnType<typeof messageToOpenAIFormat>[],
  maps: ToolNameMaps,
): ReturnType<typeof messageToOpenAIFormat>[] {
  return messages.map((message) => ({
    ...message,
    ...(Array.isArray(message.tool_calls)
      ? {
          tool_calls: message.tool_calls.map((toolCall) => ({
            ...toolCall,
            function: {
              ...toolCall.function,
              name: toWireToolName(toolCall.function.name, maps),
            },
          })),
        }
      : {}),
  }));
}

function parseToolArguments(value: unknown): Record<string, unknown> {
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return {};
    }
  }

  return typeof value === "object" && value !== null
    ? value as Record<string, unknown>
    : {};
}

function parseOpenAiToolCalls(
  toolCalls: Array<{ id?: string; function?: { name?: string; arguments?: unknown } }>,
  maps: ToolNameMaps,
): ToolCall[] {
  return toolCalls
    .filter((toolCall) => typeof toolCall.function?.name === "string")
    .map((toolCall) => ({
      type: "tool_call" as const,
      name: toOriginalToolName(toolCall.function?.name ?? "", maps),
      args: parseToolArguments(toolCall.function?.arguments),
      callId: toolCall.id ?? crypto.randomUUID(),
    }));
}

/**
 * Parse tool calls from Ollama's native tool_calls array format
 */
export function parseNativeToolCalls(
  toolCalls: Array<{ function: { name: string; arguments: unknown } }>,
  maps: ToolNameMaps = { originalToWire: new Map(), wireToOriginal: new Map() },
): ToolCall[] {
  const result: ToolCall[] = [];

  for (const tc of toolCalls) {
    console.log(`[LLM]   Tool: ${tc.function.name}`);
    // Arguments can be either an object or a JSON string
    let args: Record<string, unknown> = {};
    if (tc.function.arguments) {
      if (typeof tc.function.arguments === "string") {
        try {
          args = JSON.parse(tc.function.arguments);
        } catch {
          args = {};
        }
      } else if (typeof tc.function.arguments === "object") {
        args = tc.function.arguments as Record<string, unknown>;
      }
    }
    console.log(`[LLM]   Args: ${JSON.stringify(args)}`);
    result.push({
      type: "tool_call",
      name: toOriginalToolName(tc.function.name, maps),
      args,
      callId: crypto.randomUUID(),
    });
  }

  return result;
}

// ============================================================================
// Ollama Provider
// ============================================================================

export class OllamaProvider implements LLMProvider {
  private config: OllamaConfig;

  constructor(config: OllamaConfig) {
    this.config = config;
  }

  /**
   * Make a chat completion request to Ollama
   */
  async complete(
    messages: ChatMessage[],
    options: { queueKey?: string; reasoningEffort?: 'low' | 'medium' | 'high' | 'xhigh' } = {},
  ): Promise<string> {
    const queueKey = options.queueKey ?? "default";

    return ollamaRequestQueue.enqueue(queueKey, async () => {
    console.log(`[LLM] Request to ${this.config.model}`);
    console.log(`[LLM] Messages count: ${messages.length}`);

    // Log each message and detect images
    let totalImages = 0;
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      const ollamaMsg = messageToOllamaFormat(msg);

      // Log image count
      if (ollamaMsg.images && ollamaMsg.images.length > 0) {
        totalImages += ollamaMsg.images.length;
        console.log(
          `[LLM]   [${i + 1}/${messages.length}] ${msg.role}: ${ollamaMsg.images.length} image(s)`,
        );
      } else {
        const preview = ollamaMsg.content.slice(0, 100).replace(/\n/g, " ");
        console.log(
          `[LLM]   [${i + 1}/${messages.length}] ${msg.role}: ${preview}${ollamaMsg.content.length > 100 ? "..." : ""}`,
        );
      }
    }

    if (totalImages > 0) {
      console.log(`[LLM] Total images in request: ${totalImages}`);
    }

    const toolNameMaps = buildToolNameMaps([]);

    if (useOpenAiCompatEndpoints()) {
      const openAiMessages = sanitizeOpenAiMessages(
        messages.map(messageToOpenAIFormat),
        toolNameMaps,
      );

      const response = await fetch(`${this.config.baseUrl}/v1/chat/completions`, {
        method: "POST",
        headers: buildProviderHeaders(this.config.apiKey),
        body: JSON.stringify({
          model: this.config.model,
          messages: openAiMessages,
          stream: false,
          temperature: this.config.temperature ?? 0.7,
          max_tokens: this.config.maxTokens ?? 2048,
          ...(options.reasoningEffort ? { reasoning_effort: options.reasoningEffort } : {}),
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Ollama API error: ${response.status} - ${error}`);
      }

      interface OpenAiChatResponse {
        choices?: Array<{ message?: { content?: string } }>;
      }

      const data = (await response.json()) as OpenAiChatResponse;
      const content = data.choices?.[0]?.message?.content || "";
      console.log(
        `[LLM] Response: ${content.slice(0, 200)}${content.length > 200 ? "..." : ""}`,
      );
      return content;
    }

    // Convert messages to Ollama format
    const ollamaMessages = sanitizeNativeMessages(messages.map(messageToOllamaFormat), toolNameMaps);

      const response = await fetch(`${this.config.baseUrl}/api/chat`, {
        method: "POST",
        headers: buildProviderHeaders(this.config.apiKey),
        body: JSON.stringify({
          model: this.config.model,
          messages: ollamaMessages,
          stream: false,
          ...(options.reasoningEffort ? { reasoning_effort: options.reasoningEffort } : {}),
          options: {
            temperature: this.config.temperature ?? 0.7,
            num_predict: this.config.maxTokens ?? 2048,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Ollama API error: ${response.status} - ${error}`);
      }

      interface OllamaChatResponse {
        message?: {
          content?: string;
        };
      }

      const data = (await response.json()) as unknown as OllamaChatResponse;
      const content = data.message?.content || "";

      console.log(
        `[LLM] Response: ${content.slice(0, 200)}${content.length > 200 ? "..." : ""}`,
      );
      return content;
    });
  }

  /**
   * Complete with tool calling support
   */
  async completeWithTools(
    messages: ChatMessage[],
    tools: ToolDefinition[],
    options: { queueKey?: string; reasoningEffort?: 'low' | 'medium' | 'high' | 'xhigh' } = {},
  ): Promise<{ content?: string; toolCalls?: ToolCall[] }> {
    const queueKey = options.queueKey ?? "default";

    return ollamaRequestQueue.enqueue(queueKey, async () => {
    console.log(`[LLM] Tool request to ${this.config.model}`);
    console.log(`[LLM] Messages: ${messages.length}, Tools: ${tools.length}`);

    // Log tools being sent
    for (const tool of tools) {
      console.log(`[LLM]   Tool: ${tool.name} - ${tool.description}`);
    }

    // Log messages with image detection
    let totalImages = 0;
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      const ollamaMsg = messageToOllamaFormat(msg);
      if (ollamaMsg.images && ollamaMsg.images.length > 0) {
        totalImages += ollamaMsg.images.length;
        console.log(
          `[LLM]   [${i + 1}/${messages.length}] ${msg.role}: ${ollamaMsg.images.length} image(s)`,
        );
      }
    }
    if (totalImages > 0) {
      console.log(`[LLM] Total images in request: ${totalImages}`);
    }

    const toolNameMaps = buildToolNameMaps(tools);

    if (useOpenAiCompatEndpoints()) {
      const openAiMessages = sanitizeOpenAiMessages(
        messages.map(messageToOpenAIFormat),
        toolNameMaps,
      );

      const response = await fetch(`${this.config.baseUrl}/v1/chat/completions`, {
        method: "POST",
        headers: buildProviderHeaders(this.config.apiKey),
        body: JSON.stringify({
          model: this.config.model,
          messages: openAiMessages,
          tools: tools.map((tool) => ({
            type: "function",
            function: {
              name: toWireToolName(tool.name, toolNameMaps),
              description: tool.description,
              parameters: tool.parameters,
            },
          })),
          stream: false,
          temperature: this.config.temperature ?? 0.5,
          max_tokens: this.config.maxTokens ?? 4096,
          ...(options.reasoningEffort ? { reasoning_effort: options.reasoningEffort } : {}),
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Ollama API error: ${response.status} - ${error}`);
      }

      interface OpenAiChatResponse {
        choices?: Array<{
          message?: {
            content?: string;
            tool_calls?: Array<{
              id?: string;
              function?: { name?: string; arguments?: unknown };
            }>;
          };
        }>;
      }

      const data = (await response.json()) as OpenAiChatResponse;
      const message = data.choices?.[0]?.message;
      const messageContent = message?.content || "";
      const toolCalls = Array.isArray(message?.tool_calls)
        ? parseOpenAiToolCalls(message.tool_calls, toolNameMaps)
        : [];

      console.log(`[LLM] Raw response: ${JSON.stringify(data).slice(0, 300)}...`);

      if (toolCalls.length > 0) {
        console.log(`[LLM] Returning ${toolCalls.length} tool call(s)`);
        return { toolCalls };
      }

      console.log(
        `[LLM] Response: ${messageContent.slice(0, 200)}${messageContent.length > 200 ? "..." : ""}`,
      );
      return { content: messageContent };
    }

    // Convert messages to Ollama format
    const ollamaMessages = sanitizeNativeMessages(messages.map(messageToOllamaFormat), toolNameMaps);

    // Log full prompt (text only)
    const combinedPrompt = ollamaMessages
      .map((m) => `[${m.role}] ${m.content}`)
      .join("\n");
    console.log(
      `[LLM] Full prompt:\n${combinedPrompt.slice(0, 500)}${combinedPrompt.length > 500 ? "\n..." : ""}`,
    );

    // Ollama's tool calling format
      const response = await fetch(`${this.config.baseUrl}/api/chat`, {
        method: "POST",
        headers: buildProviderHeaders(this.config.apiKey),
        body: JSON.stringify({
          model: this.config.model,
          messages: ollamaMessages,
          tools: tools.map((t) => ({
            type: "function",
            function: {
              name: toWireToolName(t.name, toolNameMaps),
              description: t.description,
              parameters: t.parameters,
            },
          })),
          stream: false,
          ...(options.reasoningEffort ? { reasoning_effort: options.reasoningEffort } : {}),
          options: {
            temperature: this.config.temperature ?? 0.5,
            num_predict: this.config.maxTokens ?? 4096,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Ollama API error: ${response.status} - ${error}`);
      }

      interface OllamaResponse {
        message?: {
          content?: string;
          tool_calls?: Array<{ function: { name: string; arguments: string } }>;
        };
      }

      const data = (await response.json()) as unknown as OllamaResponse;
      const message = data.message || { content: "", tool_calls: [] };
      const messageContent = message.content || "";

      console.log(`[LLM] Raw response: ${JSON.stringify(data).slice(0, 300)}...`);

      let toolCalls: ToolCall[] = [];

      if (message.tool_calls) {
        console.log(
          `[LLM] Tool calls detected (native format): ${message.tool_calls.length}`,
        );
        toolCalls = parseNativeToolCalls(message.tool_calls as Array<{ function: { name: string; arguments: unknown } }>, toolNameMaps);
      }

      if (toolCalls.length > 0) {
        console.log(`[LLM] Returning ${toolCalls.length} tool call(s)`);
        return { toolCalls };
      }

      console.log(
        `[LLM] Response: ${messageContent.slice(0, 200)}${messageContent.length > 200 ? "..." : ""}`,
      );
      return { content: messageContent };
    });
  }
}

export { createOllamaConfig } from "../config/defaults.js";
