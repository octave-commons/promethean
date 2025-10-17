import { processingInterval, POLL_INTERVAL } from './ollama-queue.js';
import { processQueue } from './processQueue.js';

// Start queue processor
export function startQueueProcessor(): void {
  if (processingInterval) return;

  processingInterval = setInterval(processQueue, POLL_INTERVAL);
  processQueue(); // Process immediately
}
