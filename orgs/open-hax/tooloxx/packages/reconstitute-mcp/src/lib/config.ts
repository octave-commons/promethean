/**
 * Environment configuration for the reconstitute MCP server.
 * All configuration is read from environment variables.
 */

export interface Config {
  /** OpenCode server base URL (e.g., http://localhost:3000) */
  readonly opencodeBaseUrl: string;
  /** ChromaDB server URL (e.g., http://localhost:8000) */
  readonly chromaUrl: string;
  /** Ollama API base URL (e.g., http://localhost:11434) */
  readonly ollamaApiBase: string;
  /** Embedding model name (default: qwen3-embedding:4b) */
  readonly embeddingModel: string;
  /** Chat model name (default: qwen3:8b) */
  readonly chatModel: string;
  /** Number of tokens for embedding context */
  readonly embedNumCtx: number;
  /** Number of tokens for chat context */
  readonly chatNumCtx: number;
  /** Path to LevelDB data directory */
  readonly levelPath: string;
  /** TTL for cached results in seconds (default: 1 hour) */
  readonly cacheTtlSeconds: number;
  /** OpenAI API key for OpenCode (optional, if using API keys) */
  readonly openaiApiKey?: string;
}

let cachedConfig: Config | null = null;

/**
 * Load configuration from environment variables.
 * Throws if required variables are missing.
 */
export function loadConfig(): Config {
  if (cachedConfig) {
    return cachedConfig;
  }

  const opencodeBaseUrl = process.env.OPENCODE_BASE_URL;
  if (!opencodeBaseUrl) {
    throw new Error('OPENCODE_BASE_URL is required');
  }

  const chromaUrl = process.env.CROMA_URL;
  if (!chromaUrl) {
    throw new Error('CHROMA_URL is required');
  }

  const ollamaApiBase = process.env.OLLAMA_API_BASE;
  if (!ollamaApiBase) {
    throw new Error('OLLAMA_API_BASE is required');
  }

  const levelPath = process.env.LEVEL_PATH;
  if (!levelPath) {
    throw new Error('LEVEL_PATH is required');
  }

  cachedConfig = {
    opencodeBaseUrl,
    chromaUrl,
    ollamaApiBase,
    embeddingModel: process.env.EMBEDDING_MODEL || 'qwen3-embedding:4b',
    chatModel: process.env.CHAT_MODEL || 'qwen3:8b',
    embedNumCtx: parseInt(process.env.OLLAMA_EMBED_NUM_CTX || '32768', 10),
    chatNumCtx: parseInt(process.env.OLLAMA_CHAT_NUM_CTX || '131072', 10),
    levelPath,
    cacheTtlSeconds: parseInt(process.env.CACHE_TTL_SECONDS || '3600', 10),
    openaiApiKey: process.env.OPENAI_API_KEY,
  };

  return cachedConfig;
}

/**
 * Reset cached config (useful for testing).
 */
export function resetConfig(): void {
  cachedConfig = null;
}
