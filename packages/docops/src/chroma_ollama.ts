// src/chroma_ollama.ts
import ollama from "ollama";
import type { Collection } from "chromadb";

export const embedTexts = (model: string, input: readonly string[]) =>
  input.length === 0
    ? Promise.resolve([] as number[][])
    : ollama.embed({ model, input: input as string[] })
        .then((r) => r.embeddings as number[][]);

export const upsertWithOllama = (
  coll: Collection,
  model: string,
  ids: readonly string[],
  texts: readonly string[],
  metadatas?: readonly Record<string, any>[]
) =>
  embedTexts(model, texts).then((embs) =>
    coll.upsert({
      ids: ids as string[],
      embeddings: embs,
      documents: texts as string[],
      metadatas: metadatas as Record<string, any>[] | undefined,
    })
  );

// Query by raw text using Ollama embeddings (no server-side emb fns)
export const queryByText = (
  coll: Collection,
  model: string,
  texts: readonly string[],
  n: number,
  where?: Record<string, any>
) =>
  embedTexts(model, texts).then((embs) =>
    coll.query({
      queryEmbeddings: embs,
      nResults: n,
      where,
    })
  );
