import assert from "node:assert/strict";
import test from "node:test";
import { parseModelMap, resolveEmbeddingModel, type EmbeddingModelConfig } from "../lib/embedding-models.js";

function config(overrides: Partial<EmbeddingModelConfig> = {}): EmbeddingModelConfig {
  return {
    defaultModel: "qwen3-embedding:0.6b",
    bySource: {},
    byKind: {},
    byProject: {},
    ...overrides
  };
}

test("parseModelMap supports key=value list", () => {
  const parsed = parseModelMap("chatgpt=qwen3-embedding:4b;discord=qwen3-embedding:0.6b");
  assert.deepEqual(parsed, {
    chatgpt: "qwen3-embedding:4b",
    discord: "qwen3-embedding:0.6b"
  });
});

test("parseModelMap supports JSON map", () => {
  const parsed = parseModelMap('{"chatgpt-export":"qwen3-embedding:4b"}');
  assert.deepEqual(parsed, {
    "chatgpt-export": "qwen3-embedding:4b"
  });
});

test("resolveEmbeddingModel uses project then source then kind then default", () => {
  const resolved = resolveEmbeddingModel(
    config({
      byProject: { chatgpt: "proj-model" },
      bySource: { "chatgpt-export": "source-model" },
      byKind: { message: "kind-model" }
    }),
    {
      project: "chatgpt",
      source: "chatgpt-export",
      kind: "message"
    }
  );
  assert.equal(resolved, "proj-model");
});

test("resolveEmbeddingModel falls back correctly", () => {
  const cfg = config({
    bySource: { "chatgpt-export": "source-model" },
    byKind: { message: "kind-model" }
  });
  assert.equal(resolveEmbeddingModel(cfg, { source: "chatgpt-export", kind: "message" }), "source-model");
  assert.equal(resolveEmbeddingModel(cfg, { kind: "message" }), "kind-model");
  assert.equal(resolveEmbeddingModel(cfg, { source: "unknown" }), "qwen3-embedding:0.6b");
});
