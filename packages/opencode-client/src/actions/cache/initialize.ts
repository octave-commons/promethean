// SPDX-License-Identifier: GPL-3.0-only
// Cache initialization action

import { modelCaches } from '@promethean/ollama-queue';

import { InMemoryChroma } from '@promethean/utils';

import { CacheEntry } from './types.js';

export const initializeCache = async (modelName: string): Promise<InMemoryChroma<CacheEntry>> => {
  if (!modelCaches.has(modelName)) {
    const newCache = new InMemoryChroma<CacheEntry>();
    modelCaches.set(modelName, newCache);
  }
  return modelCaches.get(modelName)!;
};
