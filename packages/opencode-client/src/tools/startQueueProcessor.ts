import { getProcessingInterval, setProcessingInterval, POLL_INTERVAL } from '@promethean/ollama-queue';
import { processQueue } from './processQueue.js';

// Start queue processor
export function startQueueProcessor(): void {
  if (getProcessingInterval()) return;

  const t = setInterval(processQueue, POLL_INTERVAL);
  setProcessingInterval(t);
  processQueue(); // Process immediately
}
