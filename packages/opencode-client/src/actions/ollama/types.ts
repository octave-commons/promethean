// SPDX-License-Identifier: GPL-3.0-only
// Ollama action types

import { UUID, JobStatus, JobPriority, JobType } from '@promethean/ollama-queue';

export type OllamaOptions = Readonly<{
  temperature?: number;
  top_p?: number;
  num_ctx?: number;
  num_predict?: number;
  stop?: readonly string[];
  format?: 'json' | object;
}>;

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
