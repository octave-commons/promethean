import {
  createOpenPlannerClient,
  defaultOpenPlannerConfig,
  type OpenPlannerClient as CanonicalOpenPlannerClient,
  type OpenPlannerEvent,
} from "@promethean-os/openplanner-cljs-client";
import type { Memory } from "../types/index.js";

export interface OpenPlannerConfig {
  baseUrl: string;
  apiKey?: string;
  fetch?: typeof fetch;
}

export type SourceRef = Partial<{
  project: string;
  session: string;
  message: string;
}>;

export interface EventEnvelopeV1 {
  schema: "openplanner.event.v1";
  id: string;
  ts: string;
  source: string;
  kind: string;
  source_ref?: SourceRef;
  text?: string;
  meta?: Record<string, unknown>;
  extra?: Record<string, unknown>;
}

export interface OpenPlannerSearchResult {
  id: string;
  text?: string;
  score: number;
  source?: string;
  kind?: string;
  ts?: string;
  source_ref?: SourceRef;
  meta?: Record<string, unknown>;
}

export interface OpenPlannerSearchOptions {
  limit?: number;
  session?: string;
}

type SearchRow = Partial<{
  id: string;
  ts: string;
  source: string;
  kind: string;
  project: string;
  session: string;
  message: string;
  snippet: string;
  text: string;
  score: number;
}>;

type SearchResponse = Partial<{
  rows: SearchRow[];
  results: OpenPlannerSearchResult[];
}>;

type VectorMetadata = Partial<{
  source: string;
  kind: string;
  ts: string;
  project: string;
  session: string;
  message: string;
  search_tier: string;
}> & Record<string, unknown>;

type VectorResponse = Partial<{
  result: Partial<{
    ids: string[][];
    documents: Array<Array<string | null> | null>;
    metadatas: Array<Array<VectorMetadata | null> | null>;
    distances: Array<Array<number | null> | null>;
  }>;
}>;

function firstNestedArray<T>(value: unknown): T[] {
  if (!Array.isArray(value) || value.length === 0) return [];
  const first = value[0];
  return Array.isArray(first) ? (first as T[]) : [];
}

export function createDefaultOpenPlannerConfig(): OpenPlannerConfig {
  const config = defaultOpenPlannerConfig();
  return {
    baseUrl: config.endpoint,
    apiKey: config.apiKey ?? undefined,
    fetch: config.fetch,
  };
}

const buildEvent = (memory: Memory): OpenPlannerEvent => ({
  schema: "openplanner.event.v1",
  id: `memory-${memory.id}`,
  ts: new Date(memory.timestamp).toISOString(),
  source: "cephalon-ts",
  kind: "memory.created",
  source_ref: {
    session: memory.sessionId,
    message: memory.id,
  },
  text: memory.content.text,
  meta: {
    cephalon_id: memory.cephalonId,
    memory_kind: memory.kind,
    schema_version: memory.schemaVersion,
    role: memory.role,
  },
  extra: {
    session_id: memory.sessionId,
    memory_id: memory.id,
    event_id: memory.eventId,
    content_text: memory.content.text,
    normalized_text: memory.content.normalizedText,
    source_type: memory.source.type,
    source_guild_id: memory.source.guildId,
    source_channel_id: memory.source.channelId,
    source_author_id: memory.source.authorId,
    source_author_is_bot: memory.source.authorIsBot,
    role: memory.role,
    embedding_status: memory.embedding.status,
    retrieval_pinned: memory.retrieval.pinned,
    timestamp: memory.timestamp,
  },
});

const toSearchResult = (row: SearchRow): OpenPlannerSearchResult => ({
  id: row.id ?? "",
  text: row.text ?? row.snippet,
  score: typeof row.score === "number" ? row.score : 0,
  source: row.source,
  kind: row.kind,
  ts: row.ts,
  source_ref: {
    project: row.project,
    session: row.session,
    message: row.message,
  },
  meta: {
    search_tier: "fts",
  },
});

function toFtsResults(response: SearchResponse): OpenPlannerSearchResult[] {
  if (Array.isArray(response.results)) {
    return response.results.map((result) => ({
      ...result,
      meta: {
        ...(result.meta ?? {}),
        search_tier: "fts",
      },
    }));
  }

  if (Array.isArray(response.rows)) {
    return response.rows.map(toSearchResult);
  }

  return [];
}

function toVectorResults(response: VectorResponse): OpenPlannerSearchResult[] {
  const payload = response.result ?? {};
  const ids = firstNestedArray<string>(payload.ids);
  const documents = firstNestedArray<string | null>(payload.documents);
  const metadatas = firstNestedArray<VectorMetadata | null>(payload.metadatas);
  const distances = firstNestedArray<number | null>(payload.distances);

  return ids.map((id, index) => {
    const metadata = (metadatas[index] ?? {}) as VectorMetadata;
    const distance = typeof distances[index] === "number" ? distances[index] ?? undefined : undefined;
    const similarity = typeof distance === "number" ? 1 / (1 + Math.max(0, distance)) : 0.5;
    return {
      id,
      text: documents[index] ?? undefined,
      score: Number(similarity.toFixed(6)),
      source: typeof metadata.source === "string" ? metadata.source : undefined,
      kind: typeof metadata.kind === "string" ? metadata.kind : undefined,
      ts: typeof metadata.ts === "string" ? metadata.ts : undefined,
      source_ref: {
        project: typeof metadata.project === "string" ? metadata.project : undefined,
        session: typeof metadata.session === "string" ? metadata.session : undefined,
        message: typeof metadata.message === "string" ? metadata.message : undefined,
      },
      meta: Object.assign({}, metadata, {
        search_tier: "vector",
      }),
    };
  });
}

function searchTierPriority(result: OpenPlannerSearchResult): number {
  const tier = result.meta?.search_tier;
  if (tier === "vector") return 0;
  if (tier === "fts") return 1;
  return 2;
}

function mergeHybridResults(
  ftsResults: readonly OpenPlannerSearchResult[],
  vectorResults: readonly OpenPlannerSearchResult[],
  limit: number,
): OpenPlannerSearchResult[] {
  const rrfK = 60;
  const merged = new Map<string, OpenPlannerSearchResult & { fusedScore: number }>();

  const ingest = (items: readonly OpenPlannerSearchResult[]) => {
    items.forEach((item, index) => {
      const key = item.id || `${item.source ?? "unknown"}:${item.source_ref?.message ?? index}`;
      const existing = merged.get(key);
      const reciprocalRank = 1 / (rrfK + index + 1);
      if (!existing) {
        merged.set(key, {
          ...item,
          fusedScore: reciprocalRank,
        });
        return;
      }

      existing.fusedScore += reciprocalRank;
      if ((item.score ?? 0) > (existing.score ?? 0)) existing.score = item.score;
      if ((item.text?.length ?? 0) > (existing.text?.length ?? 0)) existing.text = item.text;
      existing.meta = { ...(existing.meta ?? {}), ...(item.meta ?? {}) };
      existing.source = existing.source ?? item.source;
      existing.kind = existing.kind ?? item.kind;
      existing.ts = existing.ts ?? item.ts;
      existing.source_ref = {
        ...(existing.source_ref ?? {}),
        ...(item.source_ref ?? {}),
      };
    });
  };

  ingest(vectorResults);
  ingest(ftsResults);

  return [...merged.values()]
    .sort((left, right) => right.fusedScore - left.fusedScore || searchTierPriority(left) - searchTierPriority(right) || right.score - left.score || left.id.localeCompare(right.id))
    .slice(0, Math.max(1, limit))
    .map(({ fusedScore: _fusedScore, ...rest }) => rest);
}

export class OpenPlannerClient {
  private readonly config: OpenPlannerConfig;
  private readonly client: CanonicalOpenPlannerClient;

  constructor(config: Partial<OpenPlannerConfig> = {}) {
    this.config = {
      ...createDefaultOpenPlannerConfig(),
      ...config,
    };
    this.client = createOpenPlannerClient({
      endpoint: this.config.baseUrl,
      apiKey: this.config.apiKey,
      fetch: this.config.fetch,
    });
  }

  async search(
    query: string,
    options: OpenPlannerSearchOptions = {},
  ): Promise<OpenPlannerSearchResult[]> {
    const limit = options.limit ?? 5;
    const [ftsResult, vectorResult] = await Promise.allSettled([
      this.client.searchFts({
        q: query,
        limit,
        session: options.session,
      }) as Promise<SearchResponse>,
      this.client.searchVector({
        q: query,
        k: limit,
        ...(options.session ? { where: { session: options.session } } : {}),
      }) as Promise<VectorResponse>,
    ]);

    if (ftsResult.status === "rejected" && vectorResult.status === "rejected") {
      throw ftsResult.reason ?? vectorResult.reason;
    }

    const ftsResults = ftsResult.status === "fulfilled" ? toFtsResults(ftsResult.value) : [];
    const vectorResults = vectorResult.status === "fulfilled" ? toVectorResults(vectorResult.value) : [];

    if (ftsResults.length === 0) return vectorResults.slice(0, limit);
    if (vectorResults.length === 0) return ftsResults.slice(0, limit);
    return mergeHybridResults(ftsResults, vectorResults, limit);
  }

  async searchFts(
    query: string,
    options: OpenPlannerSearchOptions = {},
  ): Promise<OpenPlannerSearchResult[]> {
    return this.search(query, options);
  }

  async emitMemoryCreated(memory: Memory): Promise<void> {
    const event = buildEvent(memory);
    await this.client.indexEvents([event]);
  }

  async isAvailable(): Promise<boolean> {
    try {
      await this.client.health();
      return true;
    } catch {
      return false;
    }
  }
}
