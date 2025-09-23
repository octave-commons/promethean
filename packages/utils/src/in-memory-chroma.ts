import { cosine } from "./cosine.js";

export type InMemoryChromaEntry<Metadata> = {
  readonly embedding: readonly number[];
  readonly metadata: Metadata;
};

export type InMemoryChromaQueryHit<Metadata> = {
  readonly id: string;
  readonly score: number;
  readonly metadata: Metadata;
};

type AddInput<Metadata> = {
  readonly id: string;
  readonly embedding: readonly number[];
  readonly metadata: Metadata;
};

export class InMemoryChroma<Metadata = Record<string, unknown>> {
  private readonly vectors = new Map<string, InMemoryChromaEntry<Metadata>>();
  private dimension: number | undefined;

  add(
    idsOrEntries: readonly string[] | ReadonlyArray<AddInput<Metadata>>,
    embeddings?: ReadonlyArray<readonly number[]>,
    metadata?: readonly Metadata[],
  ): void {
    const entries = this.normalizeAddArgs(idsOrEntries, embeddings, metadata);

    for (const entry of entries) {
      const embeddingArray = Array.from(entry.embedding);
      const dim = embeddingArray.length;
      if (this.dimension === undefined) {
        this.dimension = dim;
      } else if (dim !== this.dimension) {
        throw new Error(
          `InMemoryChroma.add received embedding of dimension ${dim}, expected ${this.dimension}`,
        );
      }
      this.vectors.set(entry.id, {
        embedding: embeddingArray,
        metadata: entry.metadata,
      });
    }
  }

  queryByEmbedding(
    queryEmbedding: readonly number[],
    options?: {
      readonly k?: number;
      readonly filter?: (metadata: Metadata) => boolean;
    },
  ): readonly InMemoryChromaQueryHit<Metadata>[] {
    const k = Math.max(0, options?.k ?? 5);
    const filter = options?.filter;
    if (this.dimension === undefined) {
      throw new Error(
        "InMemoryChroma.queryByEmbedding cannot query an empty index",
      );
    }
    if (queryEmbedding.length !== this.dimension) {
      throw new Error(
        `InMemoryChroma.queryByEmbedding received embedding of dimension ${queryEmbedding.length}, expected ${this.dimension}`,
      );
    }

    if (k === 0) return [];

    const hits: InMemoryChromaQueryHit<Metadata>[] = [];
    for (const [id, entry] of this.vectors) {
      if (filter && !filter(entry.metadata)) continue;
      hits.push({
        id,
        metadata: entry.metadata,
        score: cosine(queryEmbedding, entry.embedding),
      });
    }

    hits.sort((a, b) => b.score - a.score);
    return hits.slice(0, k);
  }

  clear(): void {
    this.vectors.clear();
    this.dimension = undefined;
  }

  get size(): number {
    return this.vectors.size;
  }

  private normalizeAddArgs(
    idsOrEntries: readonly string[] | ReadonlyArray<AddInput<Metadata>>,
    embeddings?: ReadonlyArray<readonly number[]>,
    metadata?: readonly Metadata[],
  ): ReadonlyArray<AddInput<Metadata>> {
    if (
      Array.isArray(idsOrEntries) &&
      this.looksLikeEntries(idsOrEntries, embeddings, metadata)
    ) {
      return idsOrEntries as ReadonlyArray<AddInput<Metadata>>;
    }

    if (!embeddings || !metadata) {
      throw new Error(
        "InMemoryChroma.add requires embeddings and metadata when called with ids",
      );
    }

    const ids = idsOrEntries as readonly string[];
    if (ids.length !== embeddings.length || ids.length !== metadata.length) {
      throw new Error(
        "InMemoryChroma.add requires ids, embeddings, and metadata arrays of equal length",
      );
    }

    return ids.map((id, index) => ({
      id,
      embedding: embeddings[index]!,
      metadata: metadata[index]!,
    }));
  }

  private looksLikeEntries(
    value: readonly unknown[],
    embeddings?: ReadonlyArray<readonly number[]>,
    metadata?: readonly Metadata[],
  ): value is ReadonlyArray<AddInput<Metadata>> {
    if (value.length === 0) {
      return !embeddings && !metadata;
    }
    return value.every((entry) => typeof (entry as any)?.id === "string");
  }
}
