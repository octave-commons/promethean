import { InMemoryChroma } from '@promethean/utils';
import { CacheEntry } from './CacheEntry.js';
import { modelCaches } from '@promethean/ollama-queue';

export async function initializeCache(modelName: string): Promise<InMemoryChroma<CacheEntry>> {
  if (!modelCaches.has(modelName)) {
    modelCaches.set(modelName, new InMemoryChroma<CacheEntry>());
  }
  return modelCaches.get(modelName)!;
}
