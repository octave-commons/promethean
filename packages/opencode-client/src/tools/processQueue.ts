import { processing, MAX_CONCURRENT_JOBS, jobQueue, now } from '@promethean/ollama-queue';
import { processJob } from './processJob.js';

/**
 * Enhanced queue processor with better concurrency control and memory management
 */
interface QueueMetrics {
  totalProcessed: number;
  totalFailed: number;
  averageProcessingTime: number;
  lastProcessed: number;
  memoryUsage: {
    used: number;
    total: number;
    percentage: number;
  };
}

// Queue metrics for monitoring
const queueMetrics: QueueMetrics = {
  totalProcessed: 0,
  totalFailed: 0,
  averageProcessingTime: 0,
  lastProcessed: 0,
  memoryUsage: {
    used: 0,
    total: 0,
    percentage: 0,
  },
};

// Job processing times for calculating averages
const processingTimes: number[] = [];
const MAX_PROCESSING_TIME_SAMPLES = 100;

/**
 * Update queue metrics after job completion
 */
function updateQueueMetrics(_jobId: string, success: boolean, processingTime: number): void {
  queueMetrics.totalProcessed++;
  if (!success) {
    queueMetrics.totalFailed++;
  }

  queueMetrics.lastProcessed = now();

  // Update average processing time
  processingTimes.push(processingTime);
  if (processingTimes.length > MAX_PROCESSING_TIME_SAMPLES) {
    processingTimes.shift(); // Remove oldest sample
  }

  queueMetrics.averageProcessingTime =
    processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length;

  // Update memory usage
  const memUsage = process.memoryUsage();
  queueMetrics.memoryUsage = {
    used: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
    total: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
    percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100),
  };
}

/**
 * Get current queue metrics
 */
export function getQueueMetrics(): QueueMetrics {
  return { ...queueMetrics };
}

/**
 * Clean up old completed jobs to prevent memory leaks
 */
function cleanupOldJobs(): void {
  const oneHourAgo = now() - 60 * 60 * 1000; // 1 hour ago
  const initialLength = jobQueue.length;

  // Remove completed/failed/canceled jobs older than 1 hour
  for (let i = jobQueue.length - 1; i >= 0; i--) {
    const job = jobQueue[i];
    if (
      job &&
      (job.status === 'completed' || job.status === 'failed' || job.status === 'canceled') &&
      job.completedAt &&
      job.completedAt < oneHourAgo
    ) {
      jobQueue.splice(i, 1);
    }
  }

  const removedCount = initialLength - jobQueue.length;
  if (removedCount > 0) {
    console.log(`Cleaned up ${removedCount} old completed jobs from queue`);
  }
}

// Enhanced queue processor with better concurrency control and memory management
export async function processQueue(): Promise<void> {
  // Check if we've reached maximum concurrency
  if (processing.size >= MAX_CONCURRENT_JOBS) {
    return;
  }

  // Clean up old jobs periodically (every 100 queue processing cycles)
  if (queueMetrics.totalProcessed % 100 === 0 && queueMetrics.totalProcessed > 0) {
    cleanupOldJobs();
  }

  // Get pending jobs sorted by priority and creation time
  const pendingJobs = jobQueue
    .filter((job) => job.status === 'pending')
    .sort((a, b) => {
      // First sort by priority
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;

      // Then sort by creation time (older jobs first)
      return a.createdAt - b.createdAt;
    });

  // Calculate available slots
  const availableSlots = MAX_CONCURRENT_JOBS - processing.size;
  const jobsToProcess = pendingJobs.slice(0, availableSlots);

  // Process jobs with enhanced error handling and metrics
  for (const job of jobsToProcess) {
    if (processing.has(job.id)) continue;

    const startTime = now();

    processing.add(job.id);

    // Process job with enhanced error handling and metrics tracking
    processJob(job)
      .then(() => {
        const processingTime = now() - startTime;
        updateQueueMetrics(job.id, true, processingTime);
        console.log(`Job ${job.id} completed successfully in ${processingTime}ms`);
      })
      .catch((error) => {
        const processingTime = now() - startTime;
        updateQueueMetrics(job.id, false, processingTime);
        console.error(`Job ${job.id} failed after ${processingTime}ms:`, error);
      })
      .finally(() => {
        processing.delete(job.id);
      });
  }

  // Log queue status periodically
  if (jobsToProcess.length > 0) {
    console.log(`Processing ${jobsToProcess.length} jobs. Queue stats:`, {
      pending: jobQueue.filter((j) => j.status === 'pending').length,
      running: processing.size,
      total: jobQueue.length,
      memoryUsage: `${queueMetrics.memoryUsage.used}MB/${queueMetrics.memoryUsage.total}MB (${queueMetrics.memoryUsage.percentage}%)`,
      avgProcessingTime: `${Math.round(queueMetrics.averageProcessingTime)}ms`,
    });
  }
}
