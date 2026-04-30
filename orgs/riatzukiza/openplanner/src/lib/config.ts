import path from "node:path";
import { parseModelMap, type EmbeddingModelConfig } from "./embedding-models.js";

export type StorageBackend = "duckdb" | "mongodb";

export type SemanticCompactionConfig = {
  enabled: boolean;
  minEventCount: number;
  maxNeighbors: number;
  maxChars: number;
  distanceThreshold: number;
  minClusterSize: number;
  maxPacksPerRun: number;
};

export type MongoConfig = {
  uri: string;
  dbName: string;
  eventsCollection: string;
  compactedCollection: string;
};

export type OpenPlannerConfig = {
  storageBackend: StorageBackend;
  dataDir: string;
  host: string;
  port: number;
  apiKey: string;
  chromaUrl: string;
  chromaCollection: string;
  chromaCompactCollection: string;
  ollamaBaseUrl: string;
  ollamaApiKey?: string;
  embeddingModels: EmbeddingModelConfig;
  compactEmbedModel: string;
  ollamaEmbedTruncate: boolean;
  ollamaEmbedNumCtx?: number;
  semanticCompaction: SemanticCompactionConfig;
  mongodb: MongoConfig;
};

function mustGet(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

function parsePositiveInt(raw: string | undefined, fallback: number): number {
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

function parsePositiveNumber(raw: string | undefined, fallback: number): number {
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseBool(raw: string | undefined, fallback: boolean): boolean {
  if (raw === undefined) return fallback;
  const normalized = raw.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return fallback;
}

export function loadConfig(): OpenPlannerConfig {
  const dataDir = mustGet("OPENPLANNER_DATA_DIR", "./openplanner-lake");
  const host = mustGet("OPENPLANNER_HOST", "127.0.0.1");
  const port = Number(mustGet("OPENPLANNER_PORT", "7777"));
  const apiKey = mustGet("OPENPLANNER_API_KEY", "change-me");
  const chromaUrl = mustGet("CHROMA_URL", "http://127.0.0.1:8000");
  const chromaCollection = mustGet("CHROMA_COLLECTION", "openplanner_events_v1");
  const chromaCompactCollection = mustGet("CHROMA_COMPACT_COLLECTION", `${chromaCollection}_compact`);
  const ollamaBaseUrl = mustGet("OLLAMA_BASE_URL", mustGet("OLLAMA_URL", "http://127.0.0.1:8789"));
  const ollamaApiKey = process.env.OLLAMA_API_KEY ?? process.env.OPEN_HAX_OPENAI_PROXY_AUTH_TOKEN ?? undefined;
  const defaultEmbedModel = mustGet("OLLAMA_EMBED_MODEL", "qwen3-embedding:0.6b");
  const compactEmbedModel = mustGet("OLLAMA_COMPACT_EMBED_MODEL", defaultEmbedModel);
  const ollamaEmbedTruncate = (process.env.OLLAMA_EMBED_TRUNCATE ?? "true").toLowerCase() !== "false";
  const ollamaEmbedNumCtxRaw = (process.env.OLLAMA_EMBED_NUM_CTX ?? "").trim();
  const ollamaEmbedNumCtx = ollamaEmbedNumCtxRaw.length > 0 ? Number(ollamaEmbedNumCtxRaw) : undefined;
  const finalOllamaEmbedNumCtx = Number.isFinite(ollamaEmbedNumCtx as number) ? (ollamaEmbedNumCtx as number) : undefined;
  const embeddingModels: EmbeddingModelConfig = {
    defaultModel: defaultEmbedModel,
    bySource: parseModelMap(process.env.OLLAMA_EMBED_MODEL_BY_SOURCE),
    byKind: parseModelMap(process.env.OLLAMA_EMBED_MODEL_BY_KIND),
    byProject: parseModelMap(process.env.OLLAMA_EMBED_MODEL_BY_PROJECT)
  };
  const semanticCompaction: SemanticCompactionConfig = {
    enabled: parseBool(process.env.SEMANTIC_COMPACTION_ENABLED, true),
    minEventCount: parsePositiveInt(process.env.SEMANTIC_COMPACTION_MIN_EVENTS, 1500),
    maxNeighbors: parsePositiveInt(process.env.SEMANTIC_COMPACTION_MAX_NEIGHBORS, 24),
    maxChars: parsePositiveInt(process.env.SEMANTIC_COMPACTION_CHAR_BUDGET, 32000),
    distanceThreshold: parsePositiveNumber(process.env.SEMANTIC_COMPACTION_DISTANCE_THRESHOLD, 0.35),
    minClusterSize: parsePositiveInt(process.env.SEMANTIC_COMPACTION_MIN_CLUSTER_SIZE, 4),
    maxPacksPerRun: parsePositiveInt(process.env.SEMANTIC_COMPACTION_MAX_PACKS_PER_RUN, 256),
  };

  // Storage backend selection
  const storageBackend: StorageBackend = (process.env.OPENPLANNER_STORAGE_BACKEND ?? "duckdb") as StorageBackend;
  if (storageBackend !== "duckdb" && storageBackend !== "mongodb") {
    throw new Error(`Invalid OPENPLANNER_STORAGE_BACKEND: ${storageBackend}. Must be "duckdb" or "mongodb"`);
  }

  // MongoDB configuration
  const mongodb: MongoConfig = {
    uri: mustGet("MONGODB_URI", "mongodb://localhost:27017"),
    dbName: mustGet("MONGODB_DB", "openplanner"),
    eventsCollection: mustGet("MONGODB_EVENTS_COLLECTION", "events"),
    compactedCollection: mustGet("MONGODB_COMPACTED_COLLECTION", "compacted_memories"),
  };

  return {
    storageBackend,
    dataDir: path.resolve(dataDir),
    host,
    port,
    apiKey,
    chromaUrl,
    chromaCollection,
    chromaCompactCollection,
    ollamaBaseUrl,
    ollamaApiKey,
    embeddingModels,
    compactEmbedModel,
    ollamaEmbedTruncate,
    ollamaEmbedNumCtx: finalOllamaEmbedNumCtx,
    semanticCompaction,
    mongodb,
  };
}
