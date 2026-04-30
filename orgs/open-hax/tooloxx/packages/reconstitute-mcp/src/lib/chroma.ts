/**
 * ChromaDB client for vector similarity search.
 */

import { loadConfig } from './config.js';
import { debug, info, warn, error } from './log.js';

export interface ChromaDocument {
  id: string;
  document: string;
  embedding?: number[];
  metadata?: Record<string, string | number | boolean>;
}

export interface ChromaQueryResult {
  ids: string[];
  distances?: number[][];
  documents?: string[][];
  embeddings?: number[][][];
  metadatas?: Array<Record<string, string | number | boolean>>[];
}

export interface ChromaCollection {
  name: string;
  id: string;
  metadata?: Record<string, string>;
}

const COLLECTION_NAME = 'opencode-sessions';

/**
 * Make a request to the ChromaDB API.
 */
async function chromaRequest<T>(
  endpoint: string,
  body: unknown,
  method: 'GET' | 'POST' = 'POST'
): Promise<T> {
  const config = loadConfig();
  const url = `${config.chromaUrl}${endpoint}`;

  debug('ChromaDB API request', { endpoint, method });

  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: method === 'POST' ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ChromaDB API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return response.json() as Promise<T>;
}

/**
 * Get or create the sessions collection.
 */
export async function getOrCreateCollection(): Promise<ChromaCollection> {
  info('Getting or creating ChromaDB collection', { name: COLLECTION_NAME });

  const response = await chromaRequest<{
    id: string;
    name: string;
    metadata?: Record<string, string>;
  }>('/api/v1/collections', {
    name: COLLECTION_NAME,
    metadata: {
      description: 'OpenCode session embeddings for semantic search',
      created_at: new Date().toISOString(),
    },
  });

  debug('Collection retrieved/created', { id: response.id, name: response.name });
  return response;
}

/**
 * Add documents to the collection.
 */
export async function addDocuments(
  documents: ChromaDocument[],
  embeddings?: number[][]
): Promise<void> {
  await getOrCreateCollection();

  info(`Adding ${documents.length} documents to ChromaDB`);

  const ids = documents.map((doc) => doc.id);
  const texts = documents.map((doc) => doc.document);
  const metadatas = documents.map((doc) => doc.metadata ?? {});

  await chromaRequest('/api/v1/collections/add', {
    ids,
    embeddings,
    documents: texts,
    metadatas,
    collection_name: COLLECTION_NAME,
  });

  debug('Documents added', { count: documents.length });
}

/**
 * Delete documents from the collection.
 */
export async function deleteDocuments(ids: string[]): Promise<void> {
  await getOrCreateCollection();

  debug('Deleting documents', { count: ids.length });

  await chromaRequest('/api/v1/collections/delete', {
    ids,
    collection_name: COLLECTION_NAME,
  });
}

/**
 * Query the collection for similar documents.
 */
export async function queryDocuments(
  queryText: string,
  nResults: number = 10,
  where?: Record<string, string | number | boolean>
): Promise<ChromaQueryResult> {
  await getOrCreateCollection();

  debug('Querying ChromaDB', { query: queryText.substring(0, 100), nResults });

  const response = await chromaRequest<ChromaQueryResult>('/api/v1/collections/query', {
    query_texts: [queryText],
    n_results: nResults,
    where,
    collection_name: COLLECTION_NAME,
  });

  debug('Query results', {
    count: response.ids?.length ?? 0,
    hasDistances: !!response.distances,
  });

  return response;
}

/**
 * Query with pre-computed embedding.
 */
export async function queryWithEmbedding(
  embedding: number[],
  nResults: number = 10,
  where?: Record<string, string | number | boolean>
): Promise<ChromaQueryResult> {
  await getOrCreateCollection();

  debug('Querying ChromaDB with embedding', { nResults });

  const response = await chromaRequest<ChromaQueryResult>('/api/v1/collections/query', {
    query_embeddings: [embedding],
    n_results: nResults,
    where,
    collection_name: COLLECTION_NAME,
  });

  return response;
}

/**
 * Count documents in the collection.
 */
export async function countDocuments(): Promise<number> {
  await getOrCreateCollection();

  const response = await chromaRequest<{ count: number }>('/api/v1/collections/count', {
    collection_name: COLLECTION_NAME,
  });

  return response.count;
}

/**
 * Get all documents in the collection (for indexing purposes).
 */
export async function getAllDocuments(
  limit: number = 1000,
  offset: number = 0
): Promise<ChromaDocument[]> {
  await getOrCreateCollection();

  const response = await chromaRequest<{
    ids: string[];
    documents: string[];
    metadatas: Array<Record<string, string | number | boolean>> | undefined;
    embeddings?: number[][];
  }>('/api/v1/collections/get', {
    collection_name: COLLECTION_NAME,
    limit,
    offset,
    include: ['documents', 'metadatas', 'embeddings'],
  });

  return response.ids.map((id, index) => ({
    id,
    document: response.documents[index],
    metadata: response.metadatas?.[index] ?? {},
    embedding: response.embeddings?.[index],
  }));
}

/**
 * Check if ChromaDB is available.
 */
export async function checkChromaHealth(): Promise<boolean> {
  const config = loadConfig();
  try {
    const response = await fetch(`${config.chromaUrl}/api/v1/heartbeat`, {
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Reset the collection (delete all documents).
 */
export async function resetCollection(): Promise<void> {
  try {
    await chromaRequest('/api/v1/collections/delete', {
      name: COLLECTION_NAME,
    });
    debug('Collection deleted');
  } catch (err) {
    // Collection might not exist, that's fine
    debug('Collection delete skipped (may not exist)');
  }
}

/**
 * Create index for faster queries (if supported by the ChromaDB backend).
 */
export async function createIndex(): Promise<void> {
  await chromaRequest('/api/v1/collections/index', {
    collection_name: COLLECTION_NAME,
  });
  debug('Index created');
}
