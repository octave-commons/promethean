import { calculatePerformanceScore } from './calculatePerformanceScore.js';
import { callOllamaChat } from './callOllamaChat.js';
import { callOllamaEmbed } from './callOllamaEmbed.js';
import { callOllamaGenerate } from './callOllamaGenerate.js';
import { checkCache } from './checkCache.js';
import { inferTaskCategory } from './inferTaskCategory.js';
import { Job } from './Job.js';
import { now } from '@promethean/ollama-queue';
import { storeInCache } from './storeInCache.js';
import { updateJobStatus } from './updateJobStatus.js';

// Job processing
export async function processJob(job: Job): Promise<void> {
  updateJobStatus(job.id, 'running', { startedAt: now() });

  try {
    let result: unknown;
    let cacheKey: string | null = null;
    const startTime = now();

    switch (job.type) {
      case 'generate':
        if (!job.prompt) throw new Error('Generate job missing prompt');

        // Check cache first
        const cachedResult = await checkCache(job.prompt, job.modelName, job.type);
        if (cachedResult !== null) {
          result = cachedResult;
          updateJobStatus(job.id, 'completed', {
            result,
            completedAt: now(),
          });
          return;
        }

        result = await callOllamaGenerate(job.modelName, job.prompt, job.options);
        cacheKey = job.prompt;
        break;

      case 'chat':
        if (!job.messages) throw new Error('Chat job missing messages');

        // For chat jobs, create a string representation for caching
        const chatString = job.messages.map((m) => `${m.role}: ${m.content}`).join('\n');
        const cachedChatResult = await checkCache(chatString, job.modelName, job.type);
        if (cachedChatResult !== null) {
          result = cachedChatResult;
          updateJobStatus(job.id, 'completed', {
            result,
            completedAt: now(),
          });
          return;
        }

        result = await callOllamaChat(job.modelName, job.messages, job.options);
        cacheKey = chatString;
        break;

      case 'embedding':
        if (!job.input) throw new Error('Embedding job missing input');
        result = await callOllamaEmbed(job.modelName, job.input);
        // Don't cache embedding jobs as they're typically fast and context-specific
        break;

      default:
        throw new Error(`Unknown job type: ${job.type}`);
    }

    const executionTime = now() - startTime;

    // Calculate performance score based on job characteristics
    const performanceData = await calculatePerformanceScore(job, result, executionTime);

    // Store successful results in cache (except embeddings)
    if (cacheKey && result) {
      await storeInCache(cacheKey, result, job.modelName, job.type, performanceData);
    }

    updateJobStatus(job.id, 'completed', {
      result,
      completedAt: now(),
    });
  } catch (error) {
    // Store failure in cache with negative score for learning
    const executionTime = now() - (job.startedAt || job.createdAt);
    const failurePerformance = {
      score: -1.0,
      scoreSource: 'deterministic' as const,
      scoreReason: `Job failed: ${error instanceof Error ? error.message : String(error)}`,
      taskCategory: inferTaskCategory(job),
      executionTime,
    };

    if (job.type !== 'embedding' && (job.prompt || job.messages)) {
      const failureKey =
        job.prompt || job.messages?.map((m) => `${m.role}: ${m.content}`).join('\n') || '';
      await storeInCache(
        failureKey,
        { error: failurePerformance.scoreReason },
        job.modelName,
        job.type,
        failurePerformance,
      );
    }

    updateJobStatus(job.id, 'failed', {
      error: {
        message: error instanceof Error ? error.message : String(error),
      },
      completedAt: now(),
    });
  }
}
