// SPDX-License-Identifier: GPL-3.0-only
// Ollama queue processor starter action

import {
  getProcessingInterval,
  setProcessingInterval,
  POLL_INTERVAL,
} from '@promethean/ollama-queue';
import { processQueue } from './queue.js';

// Start queue processor
export function startQueueProcessor(): void {
  if (getProcessingInterval()) return;

  const t = setInterval(processQueue, POLL_INTERVAL);
  setProcessingInterval(t);
  processQueue(); // Process immediately
}
