// src/chroma_ollama.ts
import ollama from "ollama";
import type { Collection } from "chromadb";

export const embedTexts = (model: string, input: readonly string[]) =>
  input.length === 0
    ? Promise.resolve([] as number[][])
    : ollama
        .embed({ model, input: input as string[] })
        .then((r) => r.embeddings);

export const upsertWithOllama = (
  coll: Collection,
  model: string,
  ids: readonly string[],
  texts: readonly string[],
  metadatas?: readonly Record<string, any>[],
) =>
  embedTexts(model, texts).then((embs) => {
    const payload: any = {
      ids: ids as string[],
      embeddings: embs,
      documents: texts as string[],
    };
    if (metadatas != null)
      payload.metadatas = metadatas as Record<string, any>[];
    return coll.upsert(payload);
  });

// Query by raw text using Ollama embeddings (no server-side emb fns)
export const queryByText = (
  coll: Collection,
  model: string,
  texts: readonly string[],
  n: number,
  where?: Record<string, any>,
) =>
  embedTexts(model, texts).then((embs) => {
    const payload: any = { queryEmbeddings: embs, nResults: n };
    if (where != null) payload.where = where;
    return coll.query(payload);
  });
