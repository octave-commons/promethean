/**
 * Convert OpenCode message formats to Ollama tool format.
 */

import type { OpenCodeMessage } from './opencode.js';
import { debug } from './log.js';

export interface OllamaToolMessage {
  role: 'tool';
  content: string;
  tool_name: string;
  tool_call_id: string;
}

export interface OllamaToolCall {
  role: 'assistant';
  content: string;
  tool_calls: Array<{
    function: {
      name: string;
      arguments: Record<string, unknown>;
    };
  }>;
}

export interface OllamaMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  tool_calls?: Array<{
    function: {
      name: string;
      arguments: string;
    };
  }>;
  tool_call_id?: string;
  tool_name?: string;
}

/**
 * Convert an OpenCode message to Ollama format.
 */
export function openCodeMessageToOllama(msg: OpenCodeMessage): OllamaMessage {
  const base: OllamaMessage = {
    role: mapRole(msg.role),
    content: msg.content,
  };

  // Handle tool calls
  if (msg.tool_calls && msg.tool_calls.length > 0) {
    base.tool_calls = msg.tool_calls.map((tc) => ({
      function: {
        name: tc.function.name,
        arguments: tc.function.arguments,
      },
    }));
  }

  // Handle tool call ID (for tool results)
  if (msg.tool_call_id) {
    base.tool_call_id = msg.tool_call_id;
  }

  return base;
}

/**
 * Map OpenCode roles to Ollama roles.
 */
function mapRole(role: OpenCodeMessage['role']): OllamaMessage['role'] {
  switch (role) {
    case 'tool':
      return 'tool';
    case 'tool_results':
      return 'tool';
    case 'tool_calls':
      return 'assistant'; // Tool calls are part of assistant messages
    case 'function':
      return 'tool';
    default:
      return role as OllamaMessage['role'];
  }
}

/**
 * Convert OpenCode messages to Ollama message array.
 */
export function openCodeMessagesToOllama(messages: OpenCodeMessage[]): OllamaMessage[] {
  return messages.map(openCodeMessageToOllama);
}

/**
 * Extract tool results from a sequence of messages.
 * Groups tool calls with their results.
 */
export function extractToolResults(
  messages: OpenCodeMessage[]
): Array<{
  toolCall: OpenCodeMessage;
  results: OpenCodeMessage[];
}> {
  const results: Array<{
    toolCall: OpenCodeMessage;
    results: OpenCodeMessage[];
  }> = [];

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];

    if (msg.role === 'tool_calls' && msg.tool_calls) {
      const toolCallMsg = msg;
      const toolResults: OpenCodeMessage[] = [];

      // Collect subsequent tool result messages
      let j = i + 1;
      while (
        j < messages.length &&
        (messages[j].role === 'tool_results' ||
          messages[j].role === 'function' ||
          messages[j].role === 'tool')
      ) {
        toolResults.push(messages[j]);
        j++;
      }

      results.push({
        toolCall: toolCallMsg,
        results: toolResults,
      });

      i = j - 1; // Skip processed messages
    }
  }

  return results;
}

/**
 * Format messages for Ollama chat completion with tool context.
 */
export function formatMessagesForChat(
  messages: OpenCodeMessage[],
  includeSystem: boolean = true
): OllamaMessage[] {
  const ollamaMessages: OllamaMessage[] = [];
  const toolResults = extractToolResults(messages);

  for (const msg of messages) {
    // Skip tool_results and function messages - they're included with their tool calls
    if (msg.role === 'tool_results' || msg.role === 'function') {
      continue;
    }

    // For tool_calls, include the call and any associated results
    if (msg.role === 'tool_calls' && msg.tool_calls) {
      const converted = openCodeMessageToOllama(msg);
      ollamaMessages.push(converted);

      // Find associated results
      const associated = toolResults.find(
        (tr) => tr.toolCall.id === msg.id
      );

      if (associated) {
        for (const result of associated.results) {
          const resultMsg: OllamaMessage = {
            role: 'tool',
            content: result.content,
            tool_name: result.tool_call_id ?? 'unknown',
            tool_call_id: result.tool_call_id,
          };
          ollamaMessages.push(resultMsg);
        }
      }
    } else if (msg.role !== 'tool') {
      // Regular messages
      ollamaMessages.push(openCodeMessageToOllama(msg));
    }
  }

  // Filter system messages if needed
  if (!includeSystem) {
    return ollamaMessages.filter((m) => m.role !== 'system');
  }

  return ollamaMessages;
}

/**
 * Get a context window of messages for embedding.
 */
export function getMessageContextWindow(
  messages: OpenCodeMessage[],
  aroundIndex: number,
  windowSize: number = 10
): OpenCodeMessage[] {
  const start = Math.max(0, aroundIndex - windowSize);
  const end = Math.min(messages.length, aroundIndex + windowSize + 1);
  return messages.slice(start, end);
}

/**
 * Summarize a message for embedding (truncate if too long).
 */
export function summarizeForEmbedding(message: OpenCodeMessage, maxLength: number = 4000): string {
  let content = message.content;

  // Truncate if too long
  if (content.length > maxLength) {
    content = content.substring(0, maxLength - 3) + '...';
  }

  // Add role prefix for context
  return `[${message.role}] ${content}`;
}

/**
 * Convert messages to a document for embedding.
 */
export function messagesToEmbeddingDocument(
  sessionId: string,
  messages: OpenCodeMessage[],
  contextWindow: number = 50
): string {
  const recentMessages = messages.slice(-contextWindow);
  const lines: string[] = [
    `Session: ${sessionId}`,
    `Message Count: ${messages.length}`,
    '',
    '--- Recent Messages ---',
    '',
  ];

  for (const msg of recentMessages) {
    lines.push(`[${msg.role}] ${msg.timestamp}`);
    if (msg.tool_calls) {
      lines.push(`  Tools: ${msg.tool_calls.map((t) => t.function.name).join(', ')}`);
    }
    lines.push(summarizeForEmbedding(msg));
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Convert a tool result to Ollama tool message format.
 */
export function toolResultToOllama(
  toolName: string,
  result: string,
  callId: string
): OllamaToolMessage {
  return {
    role: 'tool',
    content: result,
    tool_name: toolName,
    tool_call_id: callId,
  };
}

/**
 * Convert a tool call to Ollama tool call format.
 */
export function toolCallToOllama(
  name: string,
  arguments_: Record<string, unknown>
): OllamaToolCall {
  return {
    role: 'assistant',
    content: '',
    tool_calls: [
      {
        function: {
          name,
          arguments: arguments_,
        },
      },
    ],
  };
}
