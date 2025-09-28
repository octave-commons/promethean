// Lightweight helpers to get a Chroma collection with Ollama embedding function
import { OLLAMA_URL } from "../utils.js";
import { getFakeChroma, usingFakeServices } from "./services.js";

export async function getChromaCollection(opts: {
  collection: string;
  embedModel: string;
}) {
  if (usingFakeServices()) {
    return getFakeChroma(opts);
  }

  const { ChromaClient } = await import("chromadb");
  const { OllamaEmbeddingFunction } = await import("@chroma-core/ollama");
  const client = new ChromaClient({});
  const embedder = new OllamaEmbeddingFunction({
    model: opts.embedModel,
    url: OLLAMA_URL,
  });
  const coll = await client.getOrCreateCollection({
    name: opts.collection,
    metadata: { embed_model: opts.embedModel, "hnsw:space": "cosine" },
    embeddingFunction: embedder,
  });
  return { client, coll } as const;
}
