// SPDX-License-Identifier: GPL-3.0-only
// Cache initialization action

import { modelCaches } from '@promethean/ollama-queue';
import { InMemoryChroma } from '@promethean/utils';
import { CacheEntry } from './types.js';

export const initializeCache = async (modelName: string): Promise<InMemoryChroma<CacheEntry>> => {
  const existingCache = modelCaches.get(modelName);
  if (existingCache) {
    return existingCache;
  }

  const newCache = new InMemoryChroma<CacheEntry>();
  // Note: This violates functional immutability but is required for cache initialization
  (modelCaches as Map<string, InMemoryChroma<CacheEntry>>).set(modelName, newCache);
  return newCache;
};
