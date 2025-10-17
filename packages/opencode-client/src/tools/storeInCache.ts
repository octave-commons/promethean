import { CacheEntry } from './CacheEntry.js';
import { createCacheKey } from './createCacheKey.js';
import { getPromptEmbedding } from './getPromptEmbedding.js';
import { initializeCache } from './initializeCache.js';
import { JobType, now, undefined } from './ollama-queue.js';

// eslint-disable-next-line max-params
export async function storeInCache(
  prompt: string,
  response: unknown,
  modelName: string,
  jobType: JobType,
  performanceData?: {
    score?: number;
    scoreSource?: 'deterministic' | 'user-feedback' | 'auto-eval';
    scoreReason?: string;
    taskCategory?: string;
    executionTime?: number;
    tokensUsed?: number;
  },
): Promise<void> {
  try {
    const cache = await initializeCache(modelName);
    const embedding = await getPromptEmbedding(prompt, modelName);
    const cacheKey = createCacheKey(prompt, modelName, jobType);

    const cacheEntry: CacheEntry = {
      prompt,
      response,
      modelName,
      jobType,
      createdAt: now(),
      embedding,
      ...performanceData,
    };

    cache.add([
      {
        id: cacheKey,
        embedding,
        metadata: cacheEntry,
      },
    ]);

    const scoreInfo =
      performanceData?.score !== undefined ? ` (score: ${performanceData.score.toFixed(2)})` : '';
    console.log(`Stored ${modelName} ${jobType} result in cache (size: ${cache.size})${scoreInfo}`);
  } catch (error) {
    console.warn('Failed to store in cache:', error);
  }
}
