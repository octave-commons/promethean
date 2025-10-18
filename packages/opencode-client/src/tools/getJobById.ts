import { Job } from './Job.js';
import { UUID, jobQueue } from '@promethean/ollama-queue';

// Helper functions
export function getJobById(id: UUID): Job | undefined {
  return jobQueue.find((job) => job.id === id);
}
