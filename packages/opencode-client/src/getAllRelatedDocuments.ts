import type { GenericEntry } from '@promethean/persistence';
import { contextStore } from './index.js';

// Context management functions for advanced operations

export async function getAllRelatedDocuments(
  queries: readonly string[],
  limit: number = 100,
  where?: import('chromadb').Where,
): Promise<GenericEntry[]> {
  return contextStore.getAllRelatedDocuments(queries as string[], limit, where);
}
