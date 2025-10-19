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
import { OllamaError } from '@promethean/ollama-queue';

/**
 * Error classification for better error handling and recovery
 */
export class JobProcessingError extends Error {
  constructor(
    message: string,
    public readonly category: 'network' | 'validation' | 'resource' | 'timeout' | 'unknown',
    public readonly retryable: boolean,
    public readonly originalError?: Error,
  ) {
    super(message);
    this.name = 'JobProcessingError';
  }
}

/**
 * Classify errors for appropriate handling
 */
function classifyError(error: unknown): JobProcessingError {
  if (error instanceof OllamaError) {
    // Network-related errors from Ollama
    if (error.message.includes('timeout') || error.message.includes('ECONN')) {
      return new JobProcessingError(error.message, 'network', true, error);
    }
    // Resource-related errors
    if (error.message.includes('memory') || error.message.includes('gpu')) {
      return new JobProcessingError(error.message, 'resource', false, error);
    }
    // Validation errors
    if (error.message.includes('invalid') || error.message.includes('required')) {
      return new JobProcessingError(error.message, 'validation', false, error);
    }
  }

  if (error instanceof Error) {
    // Timeout errors
    if (error.message.includes('timeout') || error.name === 'TimeoutError') {
      return new JobProcessingError(error.message, 'timeout', true, error);
    }

    // Network errors
    if (error.message.includes('ECONN') || error.message.includes('fetch')) {
      return new JobProcessingError(error.message, 'network', true, error);
    }

    // Resource errors
    if (
      error.message.includes('memory') ||
      error.message.includes('disk') ||
      error.message.includes('space')
    ) {
      return new JobProcessingError(error.message, 'resource', false, error);
    }
  }

  // Default to unknown error
  return new JobProcessingError(
    error instanceof Error ? error.message : String(error),
    'unknown',
    false,
    error instanceof Error ? error : undefined,
  );
}

// Job processing with enhanced error handling and retry logic
export async function processJob(job: Job): Promise<void> {
  updateJobStatus(job.id, 'running', { startedAt: now() });

  let retryCount = 0;
  const maxRetries = 3;
  const baseDelay = 1000; // 1 second base delay

  const executeWithRetry = async <T>(
    operation: () => Promise<T>,
    operationName: string,
  ): Promise<T> => {
    while (retryCount < maxRetries) {
      try {
        return await operation();
      } catch (error) {
        const classifiedError = classifyError(error);

        if (!classifiedError.retryable || retryCount >= maxRetries - 1) {
          throw classifiedError;
        }

        retryCount++;
        const delay = baseDelay * Math.pow(2, retryCount - 1); // Exponential backoff

        console.warn(
          `[${operationName}] Retry ${retryCount}/${maxRetries} after ${delay}ms. Error: ${classifiedError.message}`,
        );

        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw new Error('Max retries exceeded');
  };

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

        result = await executeWithRetry(
          () => callOllamaGenerate(job.modelName, job.prompt!, job.options),
          'generate',
        );
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

        result = await executeWithRetry(
          () => callOllamaChat(job.modelName, job.messages || [], job.options),
          'chat',
        );
        cacheKey = chatString;
        break;

      case 'embedding':
        if (!job.input) throw new Error('Embedding job missing input');
        result = await executeWithRetry(
          () => callOllamaEmbed(job.modelName, job.input || ''),
          'embedding',
        );
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
    const classifiedError = classifyError(error);
    const failureExecutionTime = now() - (job.startedAt || job.createdAt);

    console.error(
      `Job ${job.id} failed: ${classifiedError.message} (category: ${classifiedError.category}, retryable: ${classifiedError.retryable})`,
    );

    // Store failure in cache with negative score for learning
    const failurePerformance = {
      score: -1.0,
      scoreSource: 'deterministic' as const,
      scoreReason: `Job failed: ${classifiedError.message} (${classifiedError.category})`,
      taskCategory: inferTaskCategory(job),
      executionTime: failureExecutionTime,
      retryCount,
      errorCategory: classifiedError.category,
    };

    if (job.type !== 'embedding' && (job.prompt || job.messages)) {
      const failureKey =
        job.prompt || job.messages?.map((m) => `${m.role}: ${m.content}`).join('\n') || '';
      try {
        await storeInCache(
          failureKey,
          {
            error: failurePerformance.scoreReason,
            errorCategory: classifiedError.category,
            retryable: classifiedError.retryable,
          },
          job.modelName,
          job.type,
          failurePerformance,
        );
      } catch (cacheError) {
        console.warn(`Failed to cache error for job ${job.id}:`, cacheError);
      }
    }

    updateJobStatus(job.id, 'failed', {
      error: {
        message: `${classifiedError.message} (category: ${classifiedError.category}, retryable: ${classifiedError.retryable}, retryCount: ${retryCount})`,
      },
      completedAt: now(),
    });
  }
}
