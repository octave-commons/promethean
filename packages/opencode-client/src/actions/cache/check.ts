// SPDX-License-Identifier: GPL-3.0-only
// Cache checking action

import { getPromptEmbedding } from '../../actions/ollama/embedding.js';
import { initializeCache } from './initialize.js';
import {
  JobType,
  now,
  CACHE_MAX_AGE_MS,
  CACHE_SIMILARITY_THRESHOLD,
} from '@promethean/ollama-queue';

export async function checkCache(
  prompt: string,
  modelName: string,
  jobType: JobType,
): Promise<unknown | null> {
  try {
    const cache = await initializeCache(modelName);
    const queryEmbedding = await getPromptEmbedding(prompt, modelName);

    const hits = cache.queryByEmbedding(queryEmbedding, {
      k: 1,
      filter: (metadata) =>
        metadata.modelName === modelName &&
        metadata.jobType === jobType &&
        now() - (metadata.createdAt as number) < CACHE_MAX_AGE_MS,
    });

    if (hits.length > 0 && hits[0] && hits[0].score >= CACHE_SIMILARITY_THRESHOLD) {
      console.log(
        `Cache hit for ${modelName} ${jobType} job with similarity ${hits[0].score.toFixed(3)}`,
      );
      return hits[0].metadata?.response || null;
    }
  } catch (error) {
    console.warn('Cache lookup failed:', error);
  }

  return null;
}
