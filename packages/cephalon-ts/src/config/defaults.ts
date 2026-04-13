import type {
  SessionManagerConfig,
  ProactiveBehaviorConfig,
  ChromaConfig,
  EmbeddingConfig,
  OllamaConfig,
} from "../types/index.js";
import { envInt } from "./env.js";

export interface CephalonConfig {
  sessionManager: SessionManagerConfig;
  proactive: ProactiveBehaviorConfig;
  chroma: ChromaConfig;
  embedding: EmbeddingConfig;
  ollama: OllamaConfig;
}

export function createDefaultSessionManagerConfig(): SessionManagerConfig {
  const concurrency = envInt("CEPHALON_SESSION_CONCURRENCY", 8, { min: 1, max: 64 });
  const maxQueuePerSession = envInt("CEPHALON_SESSION_QUEUE_MAX_PER_SESSION", 2000, {
    min: 1,
    max: 100_000,
  });

  const dropPolicyRaw = (process.env.CEPHALON_SESSION_QUEUE_DROP_POLICY || "drop_oldest")
    .trim()
    .toLowerCase();
  const dropPolicy = dropPolicyRaw === "drop_newest" ? "drop_newest" : "drop_oldest";

  return {
    concurrency,
    lanes: {
      interactive: { turns: 60, toolCalls: 120 },
      operational: { turns: 30, toolCalls: 60 },
      maintenance: { turns: 10, toolCalls: 20 },
    },
    credits: {
      refillPerSecond: 1.0,
      max: 30,
      cost: {
        interactive: 2,
        operational: 1,
        maintenance: 1,
      },
    },
    queue: {
      maxPerSession: maxQueuePerSession,
      dropPolicy,
    },
  };
}

export function createDefaultProactiveConfig(): ProactiveBehaviorConfig {
  return {
    pauseMs: 10_000,
    sessionId: "conversational",
    emitToolResultsAsEvents: true,
    tasks: [
      {
        id: "read-bots-channel",
        description:
          "Check on #bots channel for any recent activity or questions.",
        toolCall: {
          name: "discord.channel.messages",
          args: {
            channel_id: "343299242963763200",
            limit: 20,
          },
        },
      },
      {
        id: "read-general-channel",
        description:
          "Check on #general channel for any recent activity or questions.",
        toolCall: {
          name: "discord.channel.messages",
          args: {
            channel_id: "343179912196128792",
            limit: 20,
          },
        },
      },
      {
        id: "lookup-recent-memories",
        description:
          "Search for recent tool results or important memories from the last hour.",
        toolCall: {
          name: "memory.lookup",
          args: {
            query: "recent tool calls important memories",
            limit: 10,
          },
        },
      },
      {
        id: "check-duck-brains",
        description:
          "Check if there are any messages in #duck-brains that might need attention.",
        toolCall: {
          name: "discord.channel.messages",
          args: {
            channel_id: "450688080542695436",
            limit: 10,
          },
        },
      },
    ],
  };
}

export function createDefaultChromaConfig(): ChromaConfig {
  return {
    url: process.env.CHROMA_URL || "http://localhost:8000",
    collectionName: "cephalon_memories",
  };
}

export function createDefaultEmbeddingConfig(): EmbeddingConfig {
  const embeddingContextSize = envInt(
    "CEPHALON_EMBEDDING_CONTEXT_SIZE",
    envInt("CEPHALON_OLLAMA_EMBED_NUM_CTX", 0, { min: 0, max: 1_048_576 }),
    { min: 0, max: 1_048_576 },
  );

  return {
    baseUrl: process.env.OLLAMA_BASE_URL || "http://127.0.0.1:8789",
    model: "qwen3-embedding:0.6b",
    contextSize: embeddingContextSize,
    apiKey: process.env.OLLAMA_API_KEY || process.env.OPEN_HAX_OPENAI_PROXY_AUTH_TOKEN || undefined,
  };
}

export function createOllamaConfig(modelName: string): OllamaConfig {
  const maxTokens = envInt("CEPHALON_MAX_TOKENS", envInt("CEPHALON_MAX_COMPLETION_TOKENS", 16384, { min: 1 }), {
    min: 1,
    max: 1_048_576,
  });

  return {
    baseUrl: process.env.OLLAMA_BASE_URL || "http://127.0.0.1:8789",
    model: modelName,
    temperature: 0.7,
    maxTokens,
    apiKey: process.env.OLLAMA_API_KEY || process.env.OPEN_HAX_OPENAI_PROXY_AUTH_TOKEN || undefined,
  };
}

export function createDefaultCephalonConfig(
  modelName = "qwen3.5:4b-q8_0",
): CephalonConfig {
  return {
    sessionManager: createDefaultSessionManagerConfig(),
    proactive: createDefaultProactiveConfig(),
    chroma: createDefaultChromaConfig(),
    embedding: createDefaultEmbeddingConfig(),
    ollama: createOllamaConfig(modelName),
  };
}
