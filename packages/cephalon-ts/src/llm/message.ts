/**
 * Message Conversion Utilities
 * 
 * Converts ChatMessage format to Ollama API format.
 * Handles multimodal content (text + images).
 */

import type { ChatMessage } from "../types/index.js";

/**
 * Ollama API message format
 */
export interface OllamaApiMessage {
  role: string;
  content: string;
  images?: string[];
  tool_name?: string;
}

/**
 * Convert ChatMessage to Ollama API format
 */
export function messageToOllamaFormat(msg: ChatMessage): OllamaApiMessage {
  // Handle tool messages
  if (msg.role === "tool") {
    return {
      role: "tool",
      content: msg.content,
      tool_name: msg.tool_name,
    };
  }

  // Handle regular messages
  let content: string;
  let images: string[] | undefined;

  if (typeof msg.content === "string") {
    content = msg.content;
    images = msg.images;
  } else if (Array.isArray(msg.content)) {
    // Multimodal content - extract text parts, images are handled separately
    const textParts: string[] = [];
    images = [];
    for (const block of msg.content) {
      if (block.type === "text") {
        textParts.push(block.text);
      } else if (block.type === "image") {
        // For ChatMessageImage blocks, use the data directly
        images.push(block.data);
      }
    }
    content = textParts.join("\n");
    // If we also have images from the message property, append them
    if (msg.images && msg.images.length > 0) {
      images = [...images, ...msg.images];
    }
  } else {
    content = "";
    images = msg.images;
  }

  return {
    role: msg.role,
    content,
    images: images && images.length > 0 ? images : undefined,
  };
}

/**
 * Convert multiple messages to Ollama format
 */
export function messagesToOllamaFormat(
  messages: ChatMessage[]
): OllamaApiMessage[] {
  return messages.map(messageToOllamaFormat);
}

/**
 * OpenAI API message format
 */
export interface OpenAIApiMessage {
  role: string;
  content: string | Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }>;
  tool_call_id?: string;
  tool_calls?: Array<{
    id: string;
    type: "function";
    function: { name: string; arguments: string };
  }>;
}

function toOpenAiImageUrl(image: string): { url: string } {
  if (/^https?:\/\//i.test(image) || /^data:/i.test(image)) {
    return { url: image };
  }

  return { url: `data:image/png;base64,${image}` };
}

/**
 * Convert ChatMessage to OpenAI API format
 */
export function messageToOpenAIFormat(msg: ChatMessage): OpenAIApiMessage {
  // Handle tool messages
  if (msg.role === "tool") {
    return {
      role: "tool",
      content: msg.content,
      tool_call_id: msg.tool_call_id ?? msg.call_id ?? crypto.randomUUID(),
    };
  }

  const mapToolCalls = () =>
    msg.tool_calls?.map((toolCall) => ({
      id: toolCall.id ?? crypto.randomUUID(),
      type: "function" as const,
      function: {
        name: toolCall.function.name,
        arguments: JSON.stringify(toolCall.function.arguments ?? {}),
      },
    }));

  // Handle regular messages
  if (typeof msg.content === "string") {
    // Check for images
    if (msg.images && msg.images.length > 0) {
      const parts: Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }> = [
        { type: "text", text: msg.content },
      ];
      for (const img of msg.images) {
        parts.push({
          type: "image_url",
          image_url: toOpenAiImageUrl(img),
        });
      }
      return { role: msg.role, content: parts, ...(msg.role === "assistant" && msg.tool_calls ? { tool_calls: mapToolCalls() } : {}) };
    }
    return {
      role: msg.role,
      content: msg.content,
      ...(msg.role === "assistant" && msg.tool_calls ? { tool_calls: mapToolCalls() } : {}),
    };
  }

  if (Array.isArray(msg.content)) {
    const parts: Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }> = [];
    for (const block of msg.content) {
      if (block.type === "text") {
        parts.push({ type: "text", text: block.text });
      } else if (block.type === "image") {
        parts.push({
          type: "image_url",
          image_url: { url: `data:image/png;base64,${block.data}` },
        });
      }
    }
    // Append additional images
    if (msg.images) {
      for (const img of msg.images) {
        parts.push({
          type: "image_url",
          image_url: toOpenAiImageUrl(img),
        });
      }
    }
    return {
      role: msg.role,
      content: parts,
      ...(msg.role === "assistant" && msg.tool_calls ? { tool_calls: mapToolCalls() } : {}),
    };
  }

  return {
    role: msg.role,
    content: "",
    ...(msg.role === "assistant" && msg.tool_calls ? { tool_calls: mapToolCalls() } : {}),
  };
}
