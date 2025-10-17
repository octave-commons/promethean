// packages/docops/src/lib/query.ts
import type { Chunk, QueryHit } from "../types.js";

// Convert distance to similarity robustly:
// - If using cosine space (0..1), score ≈ 1 - distance
// - If using L2 (>1 possible), fallback to 1/(1+d)
export const toScore = (distance: number) => {
  if (!Number.isFinite(distance)) return 0;
  if (distance >= 0 && distance <= 1)
    return Math.max(0, Math.min(1, 1 - distance));
  return 1 / (1 + distance);
};

export const mapHits = (
  ids: readonly string[],
  distances: readonly number[],
  byId: ReadonlyMap<string, Chunk>,
  qDocUuid: string,
  k: number,
): readonly QueryHit[] =>
  ids
    .map((id, i) => {
      const c = byId.get(id);
      if (!c || c.docUuid === qDocUuid) return null;
      const d = distances[i] ?? 1;
      return Object.freeze({
        id,
        docUuid: c.docUuid,
        score: toScore(d),
        startLine: c.startLine,
        startCol: (c as any).startCol,
      } as QueryHit);
    })
    .filter((x): x is QueryHit => !!x)
    .slice(0, k);

// Minimal Chroma collection shape used by query
export type ChromaCollection = {
  get(input: {
    ids: string[];
    include?: ("metadatas" | "documents" | "embeddings")[];
  }): Promise<any>;
  query(input: {
    queryEmbeddings: number[][];
    nResults: number;
    where?: any;
  }): Promise<any>;
};
