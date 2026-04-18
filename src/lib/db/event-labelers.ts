import type { EventInsert, EventLabeler } from "./event-store.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export class ErrorClassifierLabeler implements EventLabeler {
  public readonly id = "error_classifier";

  public applies(event: EventInsert): boolean {
    return event.kind === "error" || (event.status !== undefined && event.status >= 400);
  }

  public label(event: EventInsert): string[] {
    const tags: string[] = [];
    const status = event.status;
    const payload = event.payload;

    if (status === 401) tags.push("auth_expired");
    if (status === 402) tags.push("payment_required");
    if (status === 403) tags.push("forbidden");
    if (status === 429) tags.push("rate_limited");
    if (status === 400) tags.push("bad_request");
    if (status !== undefined && status >= 500) tags.push("server_error");

    if (isRecord(payload)) {
      const error = isRecord(payload["error"]) ? payload["error"] : payload;
      const message = typeof error["message"] === "string" ? error["message"].toLowerCase() : "";
      const code = typeof error["code"] === "string" ? error["code"].toLowerCase() : "";
      const type = typeof error["type"] === "string" ? error["type"].toLowerCase() : "";

      if (message.includes("content") && (message.includes("filter") || message.includes("policy"))) {
        tags.push("content_filter");
      }
      if (message.includes("token") && message.includes("expired")) {
        tags.push("token_expired");
      }
      if (message.includes("usage limit") || message.includes("rate limit") || message.includes("quota")) {
        tags.push("quota_exceeded");
      }
      if (message.includes("model") && (message.includes("not found") || message.includes("not available") || message.includes("does not"))) {
        tags.push("model_unavailable");
      }
      if (message.includes("outstanding_balance") || message.includes("billing")) {
        tags.push("billing_issue");
      }
      if (message.includes("timeout") || message.includes("timed out")) {
        tags.push("timeout");
      }
      if (code.includes("content_filter") || type.includes("content_filter")) {
        tags.push("content_filter");
      }
    }

    if (event.providerId) {
      tags.push(`provider:${event.providerId}`);
    }

    return [...new Set(tags)];
  }
}

export class ToolUseLabeler implements EventLabeler {
  public readonly id = "tool_use";

  public applies(event: EventInsert): boolean {
    return event.kind === "request" && isRecord(event.payload);
  }

  public label(event: EventInsert): string[] {
    const tags: string[] = [];
    const payload = event.payload;
    if (!isRecord(payload)) return tags;

    const tools = payload["tools"];
    if (Array.isArray(tools) && tools.length > 0) {
      tags.push("has_tools");
      tags.push(`tool_count:${tools.length}`);

      for (const tool of tools) {
        if (isRecord(tool)) {
          const fn = isRecord(tool["function"]) ? tool["function"] : tool;
          const name = typeof fn["name"] === "string" ? fn["name"] : undefined;
          if (name) {
            tags.push(`tool:${name}`);
          }
        }
      }
    }

    const toolChoice = payload["tool_choice"];
    if (toolChoice !== undefined && toolChoice !== "auto" && toolChoice !== "none") {
      tags.push("forced_tool_choice");
    }

    return tags;
  }
}

export class ContentPatternLabeler implements EventLabeler {
  public readonly id = "content_pattern";

  public applies(event: EventInsert): boolean {
    return event.kind === "request" && isRecord(event.payload);
  }

  public label(event: EventInsert): string[] {
    const tags: string[] = [];
    const payload = event.payload;
    if (!isRecord(payload)) return tags;

    const allText = extractAllText(payload);
    if (allText.length === 0) return tags;

    const joined = allText.join("\n");

    if (/```[\s\S]*?```/.test(joined)) tags.push("has_code_fence");
    if (/<\/?[a-zA-Z][a-zA-Z0-9_-]*[\s>]/.test(joined)) tags.push("has_xml_tags");
    if (/\[SYSTEM\]|\[INST\]|<\|im_start\|>|<\|system\|>/.test(joined)) tags.push("has_prompt_injection_markers");
    if (/opencode|agent-shell|promethean/i.test(joined)) tags.push("has_agent_markers");

    const messages = Array.isArray(payload["messages"]) ? payload["messages"] : [];
    const input = Array.isArray(payload["input"]) ? payload["input"] : [];
    const items = [...messages, ...input];

    let hasSystem = false;
    let hasImage = false;
    let messageCount = 0;

    for (const item of items) {
      if (!isRecord(item)) continue;
      messageCount++;
      const role = typeof item["role"] === "string" ? item["role"] : "";
      if (role === "system") hasSystem = true;

      const content = item["content"];
      if (Array.isArray(content)) {
        for (const part of content) {
          if (isRecord(part)) {
            const type = typeof part["type"] === "string" ? part["type"] : "";
            if (type.includes("image") || part["image_url"] !== undefined) {
              hasImage = true;
            }
          }
        }
      }
    }

    if (hasSystem) tags.push("has_system_prompt");
    if (hasImage) tags.push("has_image_input");
    if (messageCount > 20) tags.push("long_conversation");
    if (messageCount > 100) tags.push("very_long_conversation");

    const totalChars = joined.length;
    if (totalChars > 50000) tags.push("large_payload");
    if (totalChars > 200000) tags.push("very_large_payload");

    return tags;
  }
}

export class ResponseQualityLabeler implements EventLabeler {
  public readonly id = "response_quality";

  public applies(event: EventInsert): boolean {
    return event.kind === "response" && isRecord(event.payload);
  }

  public label(event: EventInsert): string[] {
    const tags: string[] = [];
    const payload = event.payload;
    if (!isRecord(payload)) return tags;

    const choices = Array.isArray(payload["choices"]) ? payload["choices"] : [];
    for (const choice of choices) {
      if (!isRecord(choice)) continue;
      const finishReason = typeof choice["finish_reason"] === "string" ? choice["finish_reason"] : "";
      if (finishReason === "tool_calls") tags.push("tool_call_response");
      if (finishReason === "length") tags.push("truncated_response");
      if (finishReason === "content_filter") tags.push("content_filter_response");
    }

    const usage = isRecord(payload["usage"]) ? payload["usage"] : null;
    if (usage) {
      const cached = typeof usage["cached_tokens"] === "number" ? usage["cached_tokens"] : 0;
      const prompt = typeof usage["prompt_tokens"] === "number" ? usage["prompt_tokens"] : 0;
      if (cached > 0 && prompt > 0 && cached / prompt > 0.5) {
        tags.push("cache_heavy");
      }

      const completion = typeof usage["completion_tokens"] === "number" ? usage["completion_tokens"] : 0;
      const reasoning = typeof usage["reasoning_tokens"] === "number" ? usage["reasoning_tokens"] : 0;
      if (reasoning > 0 && completion > 0 && reasoning / completion > 0.5) {
        tags.push("reasoning_heavy");
      }
    }

    if (event.status === 200) tags.push("success");

    return tags;
  }
}

export class CostTierLabeler implements EventLabeler {
  public readonly id = "cost_tier";

  public applies(event: EventInsert): boolean {
    return event.kind === "metric" && isRecord(event.meta);
  }

  public label(event: EventInsert): string[] {
    const tags: string[] = [];
    const meta = event.meta ?? {};

    const costUsd = typeof meta["costUsd"] === "number" ? meta["costUsd"] : 0;
    if (costUsd > 1.0) tags.push("very_high_cost");
    else if (costUsd > 0.10) tags.push("high_cost");
    else if (costUsd > 0.01) tags.push("medium_cost");
    else tags.push("low_cost");

    return tags;
  }
}

function extractAllText(payload: Record<string, unknown>): string[] {
  const texts: string[] = [];

  const instructions = payload["instructions"];
  if (typeof instructions === "string") texts.push(instructions);

  const messages = Array.isArray(payload["messages"]) ? payload["messages"] : [];
  const input = Array.isArray(payload["input"]) ? payload["input"] : [];

  for (const item of [...messages, ...input]) {
    if (!isRecord(item)) continue;
    const content = item["content"];
    if (typeof content === "string") {
      texts.push(content);
    } else if (Array.isArray(content)) {
      for (const part of content) {
        if (isRecord(part) && typeof part["text"] === "string") {
          texts.push(part["text"]);
        }
      }
    }
  }

  return texts;
}

export function createDefaultLabelers(): EventLabeler[] {
  return [
    new ErrorClassifierLabeler(),
    new ToolUseLabeler(),
    new ContentPatternLabeler(),
    new ResponseQualityLabeler(),
    new CostTierLabeler(),
  ];
}
