import { ChromaClient, IncludeEnum, type Collection } from "chromadb";

import { OllamaEmbeddingFunction, registerOllamaEmbeddingFunction } from "./chroma-ollama-embedding.js";

import type { ChatRole } from "./session-store.js";

export interface ChromaSessionIndexConfig {
  readonly url: string;
  readonly collectionName: string;
  readonly ollamaBaseUrl: string;
  readonly embeddingModel: string;
}

export interface ChromaIndexedMessage {
  readonly sessionId: string;
  readonly sessionTitle: string;
  readonly messageId: string;
  readonly role: ChatRole;
  readonly content: string;
  readonly createdAt: number;
}

export interface ChromaSearchResult {
  readonly sessionId: string;
  readonly sessionTitle: string;
  readonly messageId: string;
  readonly role: ChatRole;
  readonly content: string;
  readonly createdAt: number;
  readonly distance: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function asNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function asRole(value: unknown): ChatRole {
  if (value === "system" || value === "user" || value === "assistant" || value === "tool") {
    return value;
  }

  return "user";
}

export class ChromaSessionIndex {
  private readonly client: ChromaClient;
  private readonly embeddingFunction: OllamaEmbeddingFunction;
  private collectionPromise: Promise<Collection> | null = null;
  private disabled = false;

  public constructor(private readonly config: ChromaSessionIndexConfig) {
    registerOllamaEmbeddingFunction();
    this.client = new ChromaClient({ path: config.url });
    this.embeddingFunction = new OllamaEmbeddingFunction({
      url: this.config.ollamaBaseUrl,
      model: this.config.embeddingModel,
    });
  }

  public async indexMessage(message: ChromaIndexedMessage): Promise<void> {
    if (this.disabled || message.content.trim().length === 0) {
      return;
    }

    const collection = await this.ensureCollection();
    if (!collection) {
      return;
    }

    try {
      const embedding = await this.embedText(message.content);
      await collection.upsert({
        ids: [message.messageId],
        documents: [message.content],
        embeddings: [embedding],
        metadatas: [
          {
            sessionId: message.sessionId,
            sessionTitle: message.sessionTitle,
            messageId: message.messageId,
            role: message.role,
            createdAt: message.createdAt,
          },
        ],
      });
    } catch {
      this.disabled = true;
    }
  }

  public async search(query: string, limit: number): Promise<ChromaSearchResult[]> {
    if (this.disabled || query.trim().length === 0) {
      return [];
    }

    const collection = await this.ensureCollection();
    if (!collection) {
      return [];
    }

    try {
      const embedding = await this.embedText(query);
      const results = await collection.query({
        queryEmbeddings: [embedding],
        nResults: Math.max(1, Math.min(limit, 50)),
        include: [IncludeEnum.documents, IncludeEnum.metadatas, IncludeEnum.distances],
      });

      const ids = results.ids[0] ?? [];
      const docs = results.documents?.[0] ?? [];
      const metas = results.metadatas?.[0] ?? [];
      const distances = results.distances?.[0] ?? [];

      const mapped: ChromaSearchResult[] = [];
      for (let index = 0; index < ids.length; index += 1) {
        const rawMetadata = metas[index];
        const metadata: Record<string, unknown> =
          isRecord(rawMetadata) ? (rawMetadata as Record<string, unknown>) : {};
        const content = asString(docs[index]) ?? "";

        mapped.push({
          sessionId: asString(metadata.sessionId) ?? "",
          sessionTitle: asString(metadata.sessionTitle) ?? "",
          messageId: asString(metadata.messageId) ?? asString(ids[index]) ?? "",
          role: asRole(metadata.role),
          content,
          createdAt: asNumber(metadata.createdAt) ?? Date.now(),
          distance: asNumber(distances[index]) ?? 0,
        });
      }

      return mapped.filter((entry) => entry.sessionId.length > 0 && entry.messageId.length > 0);
    } catch {
      this.disabled = true;
      return [];
    }
  }

  private async ensureCollection(): Promise<Collection | null> {
    if (this.disabled) {
      return null;
    }

    if (!this.collectionPromise) {
      this.collectionPromise = this.client.getOrCreateCollection({
        name: this.config.collectionName,
        embeddingFunction: this.embeddingFunction,
        metadata: {
          source: "open-hax-openai-proxy",
        },
      });
    }

    try {
      return await this.collectionPromise;
    } catch {
      this.disabled = true;
      return null;
    }
  }

  private async embedText(text: string): Promise<number[]> {
    const [embedding] = await this.embeddingFunction.generate([text]);
    if (!embedding || embedding.length === 0) {
      throw new Error("Embedding response had empty vector");
    }

    return embedding;
  }
}
