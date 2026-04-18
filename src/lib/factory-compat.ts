import { randomUUID } from "node:crypto";

import type { ProviderCredential } from "./key-pool.js";

/**
 * Factory.ai model type classification — determines which Factory endpoint to use.
 */
export type FactoryModelType = "anthropic" | "openai" | "common";

/**
 * Determine the Factory model type for a given model name.
 * Follows the mapping table from Factory.ai API reference.
 */
export function getFactoryModelType(model: string): FactoryModelType {
  const lower = model.toLowerCase();
  if (lower.startsWith("claude-")) {
    return "anthropic";
  }
  if (lower.startsWith("gpt-")) {
    return "openai";
  }
  return "common";
}

/**
 * Determine the x-api-provider value for a given model name.
 */
export function getFactoryApiProvider(model: string): string {
  const lower = model.toLowerCase();
  if (lower.startsWith("claude-")) {
    return "anthropic";
  }
  if (lower.startsWith("gpt-")) {
    return "openai";
  }
  if (lower.startsWith("gemini-")) {
    return "google";
  }
  if (
    lower.startsWith("glm-")
    || lower.startsWith("kimi-")
    || lower.startsWith("minimax-")
    || lower.startsWith("deepseek-")
  ) {
    return "fireworks";
  }
  // Default for unknown common models
  return "fireworks";
}

/**
 * Factory.ai endpoint paths — these use the non-standard /api/llm/{a|o}/v1/ prefix.
 */
export function getFactoryEndpointPath(modelType: FactoryModelType): string {
  switch (modelType) {
    case "anthropic":
      return "/api/llm/a/v1/messages";
    case "openai":
      return "/api/llm/o/v1/responses";
    case "common":
      return "/api/llm/o/v1/chat/completions";
  }
}

/**
 * Stainless SDK headers required by Factory.ai for all requests.
 */
const STAINLESS_HEADERS: Readonly<Record<string, string>> = {
  "x-stainless-arch": "x64",
  "x-stainless-lang": "js",
  "x-stainless-os": "Linux",
  "x-stainless-runtime": "node",
  "x-stainless-retry-count": "0",
  "x-stainless-package-version": "0.70.1",
  "x-stainless-runtime-version": "v24.3.0",
};

/**
 * Build common Factory.ai request headers that apply to all endpoint types.
 */
export function buildFactoryCommonHeaders(model: string): Record<string, string> {
  const headers: Record<string, string> = {
    "x-api-provider": getFactoryApiProvider(model),
    "x-factory-client": "cli",
    "x-session-id": randomUUID(),
    "x-assistant-message-id": randomUUID(),
    "user-agent": "factory-cli/0.74.0",
    connection: "keep-alive",
    ...STAINLESS_HEADERS,
  };

  return headers;
}

/**
 * Build Anthropic-specific headers for Factory.ai Anthropic Messages endpoint.
 */
export function buildFactoryAnthropicHeaders(
  model: string,
  payload: Record<string, unknown>,
  interleavedThinkingBeta?: string,
): Record<string, string> {
  const headers: Record<string, string> = {
    ...buildFactoryCommonHeaders(model),
    "anthropic-version": "2023-06-01",
    "x-api-key": "placeholder",
    "x-client-version": "0.74.0",
    "x-stainless-timeout": "600",
  };

  // Add anthropic-beta header when reasoning/thinking is enabled
  if (interleavedThinkingBeta && shouldEnableThinkingBeta(payload)) {
    headers["anthropic-beta"] = interleavedThinkingBeta;
  }

  return headers;
}

/**
 * Check if a Messages payload has thinking enabled (to decide whether to add anthropic-beta header).
 */
function shouldEnableThinkingBeta(payload: Record<string, unknown>): boolean {
  const thinking = payload["thinking"];
  if (typeof thinking !== "object" || thinking === null) {
    return false;
  }
  const thinkingRecord = thinking as Record<string, unknown>;
  return thinkingRecord["type"] === "enabled";
}

/**
 * Inline system content into the first user message for fk- keys.
 *
 * Factory returns 403 when the Anthropic `system` parameter is present with fk- keys.
 * This function removes the `system` key and prepends its text content to the first user message.
 */
export function inlineSystemPrompt(payload: Record<string, unknown>): Record<string, unknown> {
  const system = payload["system"];
  if (system === undefined || system === null) {
    return payload;
  }

  let systemText = "";
  if (typeof system === "string") {
    systemText = system;
  } else if (Array.isArray(system)) {
    systemText = system
      .map((part) => {
        if (typeof part === "string") {
          return part;
        }
        if (typeof part === "object" && part !== null && (part as Record<string, unknown>)["type"] === "text") {
          return (part as Record<string, unknown>)["text"] ?? "";
        }
        return "";
      })
      .filter((text) => typeof text === "string" && text.length > 0)
      .join("\n");
  }

  if (systemText.length === 0) {
    const { system: _removed, ...rest } = payload;
    return rest;
  }

  const messages = Array.isArray(payload["messages"]) ? [...payload["messages"]] : [];

  // Find the first user message and prepend system content
  const firstUserIndex = messages.findIndex(
    (msg) => typeof msg === "object" && msg !== null && (msg as Record<string, unknown>)["role"] === "user",
  );

  if (firstUserIndex >= 0) {
    const firstUser = messages[firstUserIndex] as Record<string, unknown>;
    const existingContent = firstUser["content"];

    let mergedContent: unknown;
    if (typeof existingContent === "string") {
      mergedContent = `${systemText}\n\n${existingContent}`;
    } else if (Array.isArray(existingContent)) {
      mergedContent = [{ type: "text", text: systemText }, ...existingContent];
    } else {
      mergedContent = systemText;
    }

    messages[firstUserIndex] = { ...firstUser, content: mergedContent };
  } else if (messages.length > 0) {
    // No user message found — insert a user message with the system content at the beginning
    messages.unshift({ role: "user", content: systemText });
  }

  const { system: _removed, ...rest } = payload;
  return { ...rest, messages };
}

const OPENCODE_SYSTEM_PROMPT_SIGNATURE = "you are opencode, the best coding agent on the planet";

const FACTORY_SAFE_OPENCODE_SYSTEM_PROMPT = [
  "You are a software engineering assistant running inside a CLI tool.",
  "Be concise, correct, and action-oriented.",
  "Only call tools when you need to inspect files, run commands, or fetch data. For simple replies, respond directly without tools.",
  "Do not run shell commands (e.g. `echo`) just to print the answer.",
  "Use the provided tools when needed; do not invent tools.",
  "Ask a clarifying question only when you cannot proceed safely.",
  "Avoid destructive actions and avoid exposing secrets.",
].join("\n");

/**
 * Factory.ai sometimes rejects the full OpenCode system prompt (403). When detected,
 * replace it with a short, provider-safe instruction set.
 */
export function sanitizeFactorySystemPrompt(systemText: string): string {
  const lowered = systemText.toLowerCase();
  if (!lowered.includes(OPENCODE_SYSTEM_PROMPT_SIGNATURE)) {
    return systemText;
  }

  return FACTORY_SAFE_OPENCODE_SYSTEM_PROMPT;
}

/**
 * Check if a credential uses an fk- prefixed API key (Factory static key).
 */
export function isFkKey(credential: ProviderCredential): boolean {
  return credential.authType === "api_key" && credential.token.startsWith("fk-");
}
