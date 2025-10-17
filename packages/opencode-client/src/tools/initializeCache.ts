import { InMemoryChroma } from '@promethean/utils';
import { CacheEntry } from './CacheEntry.js';
import { modelCaches } from './ollama-queue.js';

export async function initializeCache(modelName: string): Promise<InMemoryChroma<CacheEntry>> {
  if (!modelCaches.has(modelName)) {
    modelCaches.set(modelName, new InMemoryChroma<CacheEntry>());
  }
  return modelCaches.get(modelName)!;
}
