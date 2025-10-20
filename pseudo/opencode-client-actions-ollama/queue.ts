// SPDX-License-Identifier: GPL-3.0-only
// Ollama queue processing action

import { processing, MAX_CONCURRENT_JOBS, jobQueue } from '@promethean/ollama-queue';
import { processJob } from './processor.js';

// Queue processor
export async function processQueue(): Promise<void> {
  if (processing.size >= MAX_CONCURRENT_JOBS) {
    return;
  }

  const pendingJobs = jobQueue
    .filter((job) => job.status === 'pending')
    .sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

  for (const job of pendingJobs.slice(0, MAX_CONCURRENT_JOBS - processing.size)) {
    if (processing.has(job.id)) continue;

    processing.add(job.id);
    // Process job without blocking queue
    processJob(job).catch(console.error);
  }
}
