export type SearchTier = "hot" | "compact";

type RawQueryResult = Partial<{
  ids: string[][];
  documents: Array<Array<string | null> | null>;
  metadatas: Array<Array<Record<string, unknown> | null> | null>;
  distances: Array<Array<number | null> | null>;
}>;

export type TieredVectorHit = {
  id: string;
  tier: SearchTier;
  rank: number;
  document?: string;
  metadata: Record<string, unknown>;
  distance?: number;
};

function firstNestedArray<T>(value: unknown): T[] {
  if (!Array.isArray(value) || value.length === 0) return [];
  const first = value[0];
  return Array.isArray(first) ? (first as T[]) : [];
}

export function extractTieredVectorHits(result: unknown, tier: SearchTier): TieredVectorHit[] {
  const payload = (result ?? {}) as RawQueryResult;
  const ids = firstNestedArray<string>(payload.ids);
  const documents = firstNestedArray<string | null>(payload.documents);
  const metadatas = firstNestedArray<Record<string, unknown> | null>(payload.metadatas);
  const distances = firstNestedArray<number | null>(payload.distances);

  return ids.map((id, index) => ({
    id,
    tier,
    rank: index,
    document: documents[index] ?? undefined,
    metadata: (metadatas[index] ?? {}) as Record<string, unknown>,
    distance: typeof distances[index] === "number" ? distances[index] ?? undefined : undefined,
  }));
}

export function mergeTieredVectorHits(
  hitsByTier: ReadonlyArray<ReadonlyArray<TieredVectorHit>>,
  limit: number,
): Record<string, unknown> {
  const rrfK = 60;
  const byId = new Map<string, TieredVectorHit & {
    fusedScore: number;
    bestDistance: number;
    searchTiers: Set<SearchTier>;
  }>();

  for (const hits of hitsByTier) {
    for (const hit of hits) {
      const existing = byId.get(hit.id);
      const reciprocalRank = 1 / (rrfK + hit.rank + 1);
      const nextDistance = typeof hit.distance === "number" ? hit.distance : Number.POSITIVE_INFINITY;

      if (!existing) {
        byId.set(hit.id, {
          ...hit,
          fusedScore: reciprocalRank,
          bestDistance: nextDistance,
          searchTiers: new Set<SearchTier>([hit.tier]),
        });
        continue;
      }

      existing.fusedScore += reciprocalRank;
      existing.searchTiers.add(hit.tier);

      if (nextDistance < existing.bestDistance) {
        existing.bestDistance = nextDistance;
        existing.distance = hit.distance;
        if (hit.document) existing.document = hit.document;
        existing.metadata = { ...existing.metadata, ...hit.metadata };
        existing.tier = hit.tier;
      }
    }
  }

  const merged = [...byId.values()]
    .sort((left, right) => right.fusedScore - left.fusedScore || left.bestDistance - right.bestDistance || left.id.localeCompare(right.id))
    .slice(0, Math.max(1, limit));

  return {
    ids: [merged.map((entry) => entry.id)],
    documents: [merged.map((entry) => entry.document ?? "")],
    metadatas: [merged.map((entry) => ({
      ...entry.metadata,
      search_tier: entry.tier,
      search_tiers: [...entry.searchTiers.values()],
      rrf_score: Number(entry.fusedScore.toFixed(8)),
    }))],
    distances: [merged.map((entry) => (Number.isFinite(entry.bestDistance) ? entry.bestDistance : null))],
    include: ["documents", "metadatas", "distances"],
  };
}
