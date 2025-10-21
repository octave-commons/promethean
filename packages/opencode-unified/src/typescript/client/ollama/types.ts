// SPDX-License-Identifier: GPL-3.0-only
// Unified Ollama Queue System - Types and Interfaces

export interface JobOptions {
  status?: string;
  limit?: number;
  agentOnly?: boolean;
  agentId?: string;
  sessionId?: string;
}

export interface SubmitJobOptions {
  modelName: string;
  jobType: 'generate' | 'chat' | 'embedding';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  jobName?: string;
  prompt?: string;
  messages?: Array<{ role: string; content: string }>;
  input?: string | string[];
  options?: {
    temperature?: number;
    top_p?: number;
    num_ctx?: number;
    num_predict?: number;
    stop?: string[];
    format?: 'json' | object;
  };
  agentId?: string;
  sessionId?: string;
}

export interface Job {
  id: string;
  name?: string;
  agentId: string;
  sessionId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'canceled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  type: 'generate' | 'chat' | 'embedding';
  createdAt: number;
  updatedAt: number;
  startedAt?: number;
  completedAt?: number;
  modelName: string;
  prompt?: string;
  messages?: Array<{ role: string; content: string }>;
  input?: string | string[];
  options?: {
    temperature?: number;
    top_p?: number;
    num_ctx?: number;
    num_predict?: number;
    stop?: string[];
    format?: 'json' | object;
  };
  result?: unknown;
  error?: { message: string; code?: string };
  hasError?: boolean;
  hasResult?: boolean;
  queuePosition?: number;
}

export interface JobResult {
  id: string;
  modelName: string;
  jobType: string;
  status: string;
  jobName?: string;
  createdAt: string;
  updatedAt?: string;
  startedAt?: string;
  completedAt?: string;
  hasError?: boolean;
  hasResult?: boolean;
  priority?: string;
  queuePosition?: number;
}

export interface JobStatusResult {
  id: string;
  name?: string;
  status: string;
  priority?: string;
  createdAt: number;
  updatedAt: number;
  startedAt?: number;
  completedAt?: number;
  error?: { message: string; code?: string };
}

export interface JobResultData {
  id: string;
  name?: string;
  status: string;
  result?: unknown;
  completedAt?: number;
}

export interface OllamaModel {
  name: string;
  model: string;
  modified_at: string;
  size: number;
  digest: string;
  details: {
    parent_model: string;
    format: string;
    family: string;
    families: string[];
    parameter_size: string;
    quantization_level: string;
  };
  licenses: string[];
}

export interface QueueInfo {
  pending: number;
  running: number;
  completed: number;
  failed: number;
  canceled: number;
  total: number;
  maxConcurrent: number;
  processorActive: boolean;
  cacheSize: number;
}

export interface CacheEntry {
  id: string;
  embedding: number[];
  metadata: {
    prompt?: string;
    messages?: Array<{ role: string; content: string }>;
    input?: string | string[];
    result?: unknown;
    modelName: string;
    jobType: string;
    createdAt: number;
    score?: number;
    scoreSource?: string;
    scoreReason?: string;
    taskCategory?: string;
  };
}

export interface QueueMetrics {
  totalJobs: number;
  pendingJobs: number;
  runningJobs: number;
  completedJobs: number;
  failedJobs: number;
  averageWaitTime: number;
  averageProcessingTime: number;
  queueDepth: number;
  throughput: number;
}

export interface PerformanceMetrics {
  inferenceLatency: number;
  queueDepth: number;
  resourceUtilization: {
    cpu: number;
    memory: number;
    gpu?: number;
  };
  modelPerformance: {
    [modelName: string]: {
      averageLatency: number;
      throughput: number;
      errorRate: number;
    };
  };
}

export interface QueueConfig {
  maxConcurrentJobs: number;
  processingInterval: number;
  cacheSimilarityThreshold: number;
  cacheMaxAgeMs: number;
  ollamaBaseUrl: string;
  enableCache: boolean;
  enableMetrics: boolean;
}

export interface JobSchedulerConfig {
  algorithm: 'fifo' | 'priority' | 'fair-share' | 'weighted-fair-share';
  maxJobsPerAgent: number;
  fairShareWeight: {
    [agentId: string]: number;
  };
  agingFactor: number;
}

export interface ModelManagerConfig {
  defaultModel: string;
  modelTimeout: number;
  maxRetries: number;
  preloadModels: string[];
  modelCacheSize: number;
}