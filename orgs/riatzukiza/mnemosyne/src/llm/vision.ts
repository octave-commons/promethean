/**
 * Vision Client
 *
 * Provides vision capabilities using OpenAI-compatible endpoints.
 * Used by vision.inspect and browser.screenshot tools.
 */

import { createOllamaConfig } from "../config/defaults.js";
import { messageToOpenAIFormat } from "./message.js";

export interface VisionMessage {
  role: "user" | "assistant" | "system";
  content: Array<{
    type: "image_url" | "text";
    image_url?: { url: string };
    text?: string;
  }>;
}

export interface VisionResult {
  model: string;
  content: string;
}

function getVisionConfig() {
  const config = createOllamaConfig("auto:cheapest");
  return {
    baseUrl: process.env.OLLAMA_BASE_URL || "http://127.0.0.1:8789",
    model: config.model,
    apiKey: config.apiKey,
    maxTokens: parseInt(process.env.CEPHALON_VISION_MAX_TOKENS || "1024", 10),
  };
}

function buildHeaders(apiKey?: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
  };
}

export async function callVisionWithOpenAI(
  messages: VisionMessage[],
  options: { maxTokens?: number; model?: string } = {},
): Promise<VisionResult> {
  const config = getVisionConfig();
  const model = options.model || config.model;
  const maxTokens = options.maxTokens || config.maxTokens;

  const useOpenAIEndpoints = /^(1|true|yes|on)$/i.test(
    process.env.CEPHALON_USE_OPENAI_ENDPOINTS ?? "",
  );

  const url = useOpenAIEndpoints
    ? `${config.baseUrl}/v1/chat/completions`
    : `${config.baseUrl}/api/chat`;

  const body: Record<string, unknown> = {
    model,
    messages,
    max_tokens: maxTokens,
    ...(useOpenAIEndpoints ? {} : { stream: false }),
  };

  if (!useOpenAIEndpoints) {
    Object.assign(body, {
      options: {
        temperature: 0.5,
        num_predict: maxTokens,
      },
    });
  }

  const response = await fetch(url, {
    method: "POST",
    headers: buildHeaders(config.apiKey),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Vision API error: ${response.status} - ${error}`);
  }

  if (useOpenAIEndpoints) {
    const data = await response.json() as {
      choices?: Array<{ message?: { content?: string } }>;
      model?: string;
    };
    return {
      model: data.model || model,
      content: data.choices?.[0]?.message?.content || "",
    };
  }

  const data = await response.json() as {
    message?: { content?: string };
    model?: string;
  };
  return {
    model: data.model || model,
    content: data.message?.content || "",
  };
}
