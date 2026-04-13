import assert from "node:assert/strict";
import test from "node:test";

import { extractUsageCountsFromSseText } from "../lib/provider-strategy.js";

// ─── OpenAI Chat Completions SSE ────────────────────────────────────────────
// When stream_options.include_usage is true, the final chunk before [DONE]
// contains a usage object with prompt_tokens, completion_tokens, total_tokens.

test("extracts usage from OpenAI chat completions SSE stream", () => {
  const streamText =
    'data: {"id":"chatcmpl-abc","object":"chat.completion.chunk","created":1700000000,"model":"gpt-4","choices":[{"index":0,"delta":{"role":"assistant","content":"Hi"},"finish_reason":null}]}\n\n' +
    'data: {"id":"chatcmpl-abc","object":"chat.completion.chunk","created":1700000000,"model":"gpt-4","choices":[{"index":0,"delta":{},"finish_reason":"stop"}],"usage":{"prompt_tokens":10,"completion_tokens":5,"total_tokens":15}}\n\n' +
    "data: [DONE]\n\n";

  const result = extractUsageCountsFromSseText(streamText, "chat_completions", "gpt-4");
  assert.equal(result.promptTokens, 10);
  assert.equal(result.completionTokens, 5);
  assert.equal(result.totalTokens, 15);
});

// ─── Anthropic Messages SSE ─────────────────────────────────────────────────
// Anthropic sends usage in message_start (input_tokens) and message_delta (output_tokens).

test("extracts usage from Anthropic messages SSE stream", () => {
  const streamText =
    'event: message_start\ndata: {"type":"message_start","message":{"id":"msg_01","type":"message","role":"assistant","content":[],"model":"claude-3-opus-20240229","usage":{"input_tokens":25,"output_tokens":1}}}\n\n' +
    'event: content_block_start\ndata: {"type":"content_block_start","index":0,"content_block":{"type":"text","text":""}}\n\n' +
    'event: content_block_delta\ndata: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"Hello"}}\n\n' +
    'event: content_block_stop\ndata: {"type":"content_block_stop","index":0}\n\n' +
    'event: message_delta\ndata: {"type":"message_delta","delta":{"stop_reason":"end_turn"},"usage":{"output_tokens":12}}\n\n' +
    'event: message_stop\ndata: {"type":"message_stop"}\n\n';

  const result = extractUsageCountsFromSseText(streamText, "messages", "claude-3-opus-20240229");
  assert.equal(result.promptTokens, 25);
  assert.equal(result.completionTokens, 12);
  assert.equal(result.totalTokens, 37);
});

// ─── OpenAI Responses API SSE ───────────────────────────────────────────────
// The responses SSE includes usage in the response.completed event.

test("extracts usage from OpenAI responses SSE stream", () => {
  const streamText =
    'event: response.output_text.delta\ndata: {"type":"response.output_text.delta","delta":"Hi"}\n\n' +
    'event: response.completed\ndata: {"type":"response.completed","response":{"id":"resp_01","status":"completed","usage":{"input_tokens":20,"output_tokens":8,"total_tokens":28}}}\n\n';

  const result = extractUsageCountsFromSseText(streamText, "responses", "gpt-4");
  assert.equal(result.promptTokens, 20);
  assert.equal(result.completionTokens, 8);
  assert.equal(result.totalTokens, 28);
});

test("extracts usage from OpenAI responses SSE stream (openai_responses mode)", () => {
  const streamText =
    'event: response.output_text.delta\ndata: {"type":"response.output_text.delta","delta":"Hi"}\n\n' +
    'event: response.completed\ndata: {"type":"response.completed","response":{"id":"resp_01","status":"completed","usage":{"input_tokens":15,"output_tokens":3,"total_tokens":18}}}\n\n';

  const result = extractUsageCountsFromSseText(streamText, "openai_responses", "gpt-4");
  assert.equal(result.promptTokens, 15);
  assert.equal(result.completionTokens, 3);
  assert.equal(result.totalTokens, 18);
});

// ─── Ollama SSE ─────────────────────────────────────────────────────────────
// Ollama sends usage in the final JSON chunk with done: true.

test("extracts usage from Ollama streaming response", () => {
  const streamText =
    '{"model":"llama3.2","created_at":"2026-03-03T00:00:00.000Z","message":{"role":"assistant","content":"Hello"},"done":false}\n' +
    '{"model":"llama3.2","created_at":"2026-03-03T00:00:00.000Z","message":{"role":"assistant","content":"!"},"done":false}\n' +
    '{"model":"llama3.2","created_at":"2026-03-03T00:00:00.000Z","message":{"role":"assistant","content":""},"done":true,"done_reason":"stop","prompt_eval_count":12,"eval_count":6}\n';

  const result = extractUsageCountsFromSseText(streamText, "ollama_chat", "llama3.2");
  assert.equal(result.promptTokens, 12);
  assert.equal(result.completionTokens, 6);
  assert.equal(result.totalTokens, 18);
});

test("extracts usage from local Ollama streaming response", () => {
  const streamText =
    '{"model":"llama3.2","created_at":"2026-03-03T00:00:00.000Z","message":{"role":"assistant","content":"Hi"},"done":false}\n' +
    '{"model":"llama3.2","created_at":"2026-03-03T00:00:00.000Z","message":{"role":"assistant","content":""},"done":true,"done_reason":"stop","prompt_eval_count":8,"eval_count":4}\n';

  const result = extractUsageCountsFromSseText(streamText, "local_ollama_chat", "llama3.2");
  assert.equal(result.promptTokens, 8);
  assert.equal(result.completionTokens, 4);
  assert.equal(result.totalTokens, 12);
});

// ─── Graceful handling ──────────────────────────────────────────────────────

test("returns empty object for SSE stream without usage data", () => {
  const streamText =
    'data: {"id":"chatcmpl-abc","object":"chat.completion.chunk","created":1700000000,"model":"gpt-4","choices":[{"index":0,"delta":{"content":"Hi"},"finish_reason":null}]}\n\n' +
    'data: {"id":"chatcmpl-abc","object":"chat.completion.chunk","created":1700000000,"model":"gpt-4","choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}\n\n' +
    "data: [DONE]\n\n";

  const result = extractUsageCountsFromSseText(streamText, "chat_completions", "gpt-4");
  assert.equal(result.promptTokens, undefined);
  assert.equal(result.completionTokens, undefined);
  assert.equal(result.totalTokens, undefined);
});

test("returns empty object for empty stream text", () => {
  const result = extractUsageCountsFromSseText("", "chat_completions", "gpt-4");
  assert.equal(result.promptTokens, undefined);
  assert.equal(result.completionTokens, undefined);
  assert.equal(result.totalTokens, undefined);
});

test("returns empty object for malformed SSE data", () => {
  const streamText = "not valid sse at all\ngarbage data\n\n";
  const result = extractUsageCountsFromSseText(streamText, "chat_completions", "gpt-4");
  assert.equal(result.promptTokens, undefined);
  assert.equal(result.completionTokens, undefined);
  assert.equal(result.totalTokens, undefined);
});

test("handles Anthropic stream with only message_start usage (no message_delta usage)", () => {
  const streamText =
    'event: message_start\ndata: {"type":"message_start","message":{"id":"msg_01","type":"message","role":"assistant","content":[],"model":"claude-3","usage":{"input_tokens":10,"output_tokens":0}}}\n\n' +
    'event: message_stop\ndata: {"type":"message_stop"}\n\n';

  const result = extractUsageCountsFromSseText(streamText, "messages", "claude-3");
  assert.equal(result.promptTokens, 10);
  assert.equal(result.completionTokens, 0);
  assert.equal(result.totalTokens, 10);
});

// ─── OpenAI chat completions variations ─────────────────────────────────────

test("extracts usage from openai_chat_completions mode SSE", () => {
  const streamText =
    'data: {"id":"chatcmpl-xyz","object":"chat.completion.chunk","created":1700000000,"model":"gpt-4","choices":[{"index":0,"delta":{"content":"Hello"},"finish_reason":null}]}\n\n' +
    'data: {"id":"chatcmpl-xyz","object":"chat.completion.chunk","created":1700000000,"model":"gpt-4","choices":[],"usage":{"prompt_tokens":7,"completion_tokens":3,"total_tokens":10}}\n\n' +
    "data: [DONE]\n\n";

  const result = extractUsageCountsFromSseText(streamText, "openai_chat_completions", "gpt-4");
  assert.equal(result.promptTokens, 7);
  assert.equal(result.completionTokens, 3);
  assert.equal(result.totalTokens, 10);
});
