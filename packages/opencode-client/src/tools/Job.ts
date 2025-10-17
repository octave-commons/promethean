import { UUID, JobStatus, JobPriority, JobType } from './ollama-queue.js';
import { OllamaOptions } from './OllamaOptions.js';

export type Job = Readonly<{
  id: UUID;
  name?: string;
  agentId?: string;
  sessionId?: string;
  status: JobStatus;
  priority: JobPriority;
  type: JobType;
  createdAt: number;
  updatedAt: number;
  startedAt?: number;
  completedAt?: number;
  error?: { message: string; code?: string };
  result?: unknown;
  modelName: string;
  // Job-specific fields
  prompt?: string;
  messages?: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  input?: string | string[];
  options?: OllamaOptions;
}>;
