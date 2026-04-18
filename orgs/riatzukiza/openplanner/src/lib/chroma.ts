import { ChromaClient, type IEmbeddingFunction } from "chromadb";
import type { EmbeddingScope } from "./embedding-models.js";

export type ChromaBinding = {
  collectionName: string;
  embeddingFunction?: IEmbeddingFunction;
  embeddingFunctionFor?: (scope: EmbeddingScope) => IEmbeddingFunction;
  resolveEmbeddingModel?: (scope: EmbeddingScope) => string;
};

export type Chroma = {
  client: ChromaClient;
  collectionName: string;
  compactCollectionName: string;
  embeddingFunction?: IEmbeddingFunction;
  embeddingFunctionFor?: (scope: EmbeddingScope) => IEmbeddingFunction;
  resolveEmbeddingModel?: (scope: EmbeddingScope) => string;
  compactEmbeddingFunction?: IEmbeddingFunction;
  compactEmbeddingFunctionFor?: (scope: EmbeddingScope) => IEmbeddingFunction;
  resolveCompactEmbeddingModel?: (scope: EmbeddingScope) => string;
  hot: ChromaBinding;
  compact: ChromaBinding;
};

async function ensureCollection(client: ChromaClient, binding: ChromaBinding): Promise<void> {
  const defaultEmbeddingFunction = binding.embeddingFunction ?? binding.embeddingFunctionFor?.({});
  try {
    await client.getCollection({ name: binding.collectionName, embeddingFunction: defaultEmbeddingFunction as any });
  } catch {
    await client.createCollection({ name: binding.collectionName, embeddingFunction: defaultEmbeddingFunction as any });
  }
}

export async function openChroma(
  chromaUrl: string,
  hot: ChromaBinding,
  compact: ChromaBinding,
): Promise<Chroma> {
  if (chromaUrl === "disabled") {
    const client = new ChromaClient({ path: "http://127.0.0.1:0" });
    return {
      client,
      collectionName: hot.collectionName,
      compactCollectionName: compact.collectionName,
      embeddingFunction: hot.embeddingFunction,
      embeddingFunctionFor: hot.embeddingFunctionFor,
      resolveEmbeddingModel: hot.resolveEmbeddingModel,
      compactEmbeddingFunction: compact.embeddingFunction,
      compactEmbeddingFunctionFor: compact.embeddingFunctionFor,
      resolveCompactEmbeddingModel: compact.resolveEmbeddingModel,
      hot,
      compact,
    };
  }

  const client = new ChromaClient({ path: chromaUrl });
  await ensureCollection(client, hot);
  await ensureCollection(client, compact);

  return {
    client,
    collectionName: hot.collectionName,
    compactCollectionName: compact.collectionName,
    embeddingFunction: hot.embeddingFunction ?? hot.embeddingFunctionFor?.({}),
    embeddingFunctionFor: hot.embeddingFunctionFor,
    resolveEmbeddingModel: hot.resolveEmbeddingModel,
    compactEmbeddingFunction: compact.embeddingFunction ?? compact.embeddingFunctionFor?.({}),
    compactEmbeddingFunctionFor: compact.embeddingFunctionFor,
    resolveCompactEmbeddingModel: compact.resolveEmbeddingModel,
    hot,
    compact,
  };
}
