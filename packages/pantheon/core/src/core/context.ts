/**
 * Context Engine — Dynamic context compilation port adapter
 * Wraps @promethean-os/persistence collections to provide Pantheon-native context
 */

import type { ContextPort } from './ports.js';
import type { ContextSource, Message } from './types.js';
import type { DualStoreEntry, DualStoreTimestamp } from '@promethean-os/persistence';

export type ContextPortDeps = {
  getCollectionsFor: (sources: readonly ContextSource[]) => Promise<readonly unknown[]>;
  resolveRole: (meta?: Record<string, unknown>) => 'system' | 'user' | 'assistant';
  resolveName: (meta?: Record<string, unknown>) => string;
  formatTime: (ms: number) => string;
};

type ContextEntry = DualStoreEntry<'text', 'timestamp'>;
type EntryMetadata = Record<string, unknown> & {
  userName?: string;
  displayName?: string;
  name?: string;
  role?: 'system' | 'user' | 'assistant';
  type?: string;
  caption?: string;
  isThought?: boolean;
};

type CollectionAdapter = {
  name?: string;
  getMostRecent: (limit?: number) => Promise<ContextEntry[]>;
  getMostRelevant: (
    queryTexts: string[],
    limit: number,
    where?: Record<string, unknown>,
  ) => Promise<ContextEntry[]>;
};

const ASSISTANT_NAME = 'Pantheon';
const DEFAULT_RECENT_LIMIT = 10;
const DEFAULT_QUERY_LIMIT = 5;
const DEFAULT_RESULT_LIMIT = 20;

export const makeContextPort = (deps: ContextPortDeps): ContextPort => ({
  compile: async ({ texts = [], sources, recentLimit, queryLimit, limit }) => {
    const adapters = toCollectionAdapters(await deps.getCollectionsFor(sources));
    const normalizedRecentLimit = normalisePositiveNumber(recentLimit, DEFAULT_RECENT_LIMIT);
    const normalizedQueryLimit = normalisePositiveNumber(queryLimit, DEFAULT_QUERY_LIMIT);
    const normalizedResultLimit = normalisePositiveNumber(limit, DEFAULT_RESULT_LIMIT);
    const normalizedTexts = Array.isArray(texts) ? texts.filter(isNonEmptyString) : [];

    const latestEntries = await collectLatestEntries(adapters, normalizedRecentLimit);
    const querySeeds = buildQuerySeeds(normalizedTexts, latestEntries, normalizedQueryLimit);

    const relatedEntries =
      querySeeds.length > 0
        ? await collectRelatedEntries(adapters, querySeeds, normalizedResultLimit)
        : [];
    const relatedImages =
      querySeeds.length > 0
        ? await collectRelatedEntries(adapters, querySeeds, normalizedResultLimit, {
            type: 'image',
          })
        : [];

    const preparedEntries = prepareEntries(relatedEntries, latestEntries, relatedImages);
    const filteredEntries = filterValidEntries(preparedEntries);
    const dedupedEntries = dedupeByText(filteredEntries);
    const sortedEntries = sortByTimestamp(dedupedEntries);
    const limitedEntries = limitByCollectionCount(
      sortedEntries,
      normalizedResultLimit,
      adapters.length,
    );

    return limitedEntries.map((entry) => toPantheonMessage(entry, deps));
  },
});

const toCollectionAdapters = (collections: readonly unknown[]): CollectionAdapter[] => {
  return collections.reduce<CollectionAdapter[]>((acc, candidate) => {
    if (
      candidate &&
      typeof candidate === 'object' &&
      typeof (candidate as CollectionAdapter).getMostRecent === 'function' &&
      typeof (candidate as CollectionAdapter).getMostRelevant === 'function'
    ) {
      acc.push(candidate as CollectionAdapter);
    }
    return acc;
  }, []);
};

const normalisePositiveNumber = (value: number | undefined, fallback: number): number => {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return Math.floor(value);
  }
  return fallback;
};

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const collectLatestEntries = async (
  adapters: readonly CollectionAdapter[],
  limit: number,
): Promise<ContextEntry[]> => {
  if (adapters.length === 0 || limit <= 0) {
    return [];
  }

  const batches = await Promise.all(adapters.map((adapter) => safeGetMostRecent(adapter, limit)));
  return batches.flat();
};

const safeGetMostRecent = async (
  adapter: CollectionAdapter,
  limit: number,
): Promise<ContextEntry[]> => {
  try {
    return await adapter.getMostRecent(limit);
  } catch (error) {
    console.warn(
      `ContextPort failed to read recent entries from ${adapter.name ?? 'unknown'} collection`,
      error,
    );
    return [];
  }
};

const collectRelatedEntries = async (
  adapters: readonly CollectionAdapter[],
  queries: readonly string[],
  limit: number,
  where?: Record<string, unknown>,
): Promise<ContextEntry[]> => {
  if (adapters.length === 0 || limit <= 0 || queries.length === 0) {
    return [];
  }

  const batches = await Promise.all(
    adapters.map((adapter) => safeGetMostRelevant(adapter, queries, limit, where)),
  );
  return batches.flat();
};

const safeGetMostRelevant = async (
  adapter: CollectionAdapter,
  queries: readonly string[],
  limit: number,
  where?: Record<string, unknown>,
): Promise<ContextEntry[]> => {
  try {
    return await adapter.getMostRelevant([...queries], limit, where);
  } catch (error) {
    console.warn(
      `ContextPort failed to read related entries from ${adapter.name ?? 'unknown'} collection`,
      error,
    );
    return [];
  }
};

const buildQuerySeeds = (
  texts: readonly string[],
  latestEntries: readonly ContextEntry[],
  queryLimit: number,
): string[] => {
  if (queryLimit <= 0) {
    return [];
  }

  const combined: string[] = [...texts];
  for (const entry of latestEntries) {
    if (isNonEmptyString(entry.text)) {
      combined.push(entry.text);
    }
  }

  return combined.slice(-queryLimit);
};

const prepareEntries = (
  related: readonly ContextEntry[],
  latest: readonly ContextEntry[],
  images: readonly ContextEntry[],
): ContextEntry[] => {
  const relatedWithoutImages = related.filter(
    (entry) => getMetadataType(entry.metadata) !== 'image',
  );
  return [...relatedWithoutImages, ...latest, ...images];
};

const filterValidEntries = (entries: readonly ContextEntry[]): ContextEntry[] => {
  return entries.filter((entry): entry is ContextEntry => {
    return (
      Boolean(entry) &&
      isNonEmptyString(entry.text) &&
      typeof entry.metadata === 'object' &&
      entry.metadata !== null
    );
  });
};

const dedupeByText = (entries: readonly ContextEntry[]): ContextEntry[] => {
  const seen = new Set<string>();
  const deduped: ContextEntry[] = [];

  for (const entry of entries) {
    const text = entry.text;
    if (!isNonEmptyString(text)) {
      continue;
    }
    if (seen.has(text)) {
      continue;
    }
    seen.add(text);
    deduped.push(entry);
  }

  return deduped;
};

const sortByTimestamp = (entries: readonly ContextEntry[]): ContextEntry[] => {
  return [...entries].sort(
    (a, b) => toEpochMilliseconds(a.timestamp) - toEpochMilliseconds(b.timestamp),
  );
};

const limitByCollectionCount = (
  entries: readonly ContextEntry[],
  limit: number,
  collectionCount: number,
): ContextEntry[] => {
  if (limit <= 0) {
    return [];
  }

  const multiplicativeFactor = Math.max(collectionCount, 1) * 2;
  const maxResults = limit * multiplicativeFactor;
  return entries.length > maxResults ? entries.slice(-maxResults) : [...entries];
};

const toPantheonMessage = (entry: ContextEntry, deps: ContextPortDeps): Message => {
  const metadata = (entry.metadata ?? {}) as EntryMetadata;
  const displayName = resolveDisplayName(metadata, deps);
  const isAssistant = displayName === ASSISTANT_NAME;
  const baseRole = resolveBaseRole(metadata, isAssistant);
  const role = safeResolveRole(deps.resolveRole, metadata, baseRole);

  if (getMetadataType(metadata) === 'image') {
    const caption = getString(metadata.caption) || `${displayName ?? 'Unknown'} shared an image`;
    return {
      role,
      content: caption,
      images: [entry.text],
    };
  }

  const timestamp = toEpochMilliseconds(entry.timestamp as DualStoreTimestamp);
  const formattedTime = deps.formatTime(timestamp);
  const verb = metadata.isThought ? 'thought' : 'said';
  const shouldFormatAssistant = !(isAssistant && !metadata.isThought);
  const content = shouldFormatAssistant
    ? `${displayName ?? 'Unknown'} ${verb} (${formattedTime}): ${entry.text}`
    : entry.text;

  return {
    role,
    content,
  };
};

const resolveBaseRole = (metadata: EntryMetadata, isAssistant: boolean): Message['role'] => {
  if (isRole(metadata.role)) {
    return metadata.role;
  }
  if (isAssistant) {
    return metadata.isThought ? 'system' : 'assistant';
  }
  return 'user';
};

const getMetadataType = (metadata: EntryMetadata | undefined): string | undefined => {
  const type = metadata?.type;
  return typeof type === 'string' ? type.toLowerCase() : undefined;
};

const resolveDisplayName = (metadata: EntryMetadata, deps: ContextPortDeps): string | undefined => {
  const resolved = safeResolveName(deps.resolveName, metadata);
  if (isNonEmptyString(resolved)) {
    return resolved.trim();
  }
  const fallback = metadata.displayName ?? metadata.name ?? metadata.userName;
  return getString(fallback);
};

const safeResolveRole = (
  resolver: ContextPortDeps['resolveRole'],
  metadata: EntryMetadata,
  fallback: Message['role'],
): Message['role'] => {
  try {
    const resolved = resolver?.(metadata);
    if (isRole(resolved)) {
      return resolved;
    }
  } catch (error) {
    console.warn('ContextPort resolveRole threw, falling back to derived role', error);
  }
  return fallback;
};

const safeResolveName = (
  resolver: ContextPortDeps['resolveName'],
  metadata: EntryMetadata,
): string | undefined => {
  try {
    const resolved = resolver?.(metadata);
    return getString(resolved);
  } catch (error) {
    console.warn('ContextPort resolveName threw, falling back to metadata-derived name', error);
    return undefined;
  }
};

const isRole = (value: unknown): value is Message['role'] =>
  value === 'assistant' || value === 'system' || value === 'user';

const getString = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim().length > 0 ? value : undefined;

const toEpochMilliseconds = (value: DualStoreTimestamp): number => {
  if (value instanceof Date) {
    return value.getTime();
  }
  if (typeof value === 'string') {
    return new Date(value).getTime();
  }
  return Number(value);
};
