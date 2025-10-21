import { z } from 'zod';

export interface BenchmarkRequest {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  metadata?: Record<string, any>;
}

export interface BenchmarkResponse {
  content: string;
  tokens: number;
  time: number;
  metadata?: Record<string, any>;
}

export interface BenchmarkMetrics {
  tps: number; // tokens per second
  latency: number; // milliseconds
  timeToFirstToken: number; // milliseconds
  timeToCompletion: number; // milliseconds
  effectiveness?: number; // 0-1 score
  errorRate?: number;
}

export interface ResourceMetrics {
  memoryUsage: number; // MB
  cpuUsage: number; // percentage
  gpuUsage?: number; // percentage
  gpuMemoryUsage?: number; // MB
  powerConsumption?: number; // watts
  diskIO?: {
    read: number; // MB/s
    write: number; // MB/s
  };
}

export interface ProviderConfig {
  name: string;
  type: ProviderType;
  endpoint?: string;
  apiKey?: string;
  model: string;
  options?: Record<string, any>;
}

export const ProviderTypeSchema = z.enum([
  'ollama',
  'vllm',
  'openvino',
  'openai',
  'openrouter',
  'zai',
  'mistral',
  'anthropic',
  'huggingface',
  'buildfix',
]);

export type ProviderType = z.infer<typeof ProviderTypeSchema>;

export interface BenchmarkResult {
  provider: ProviderConfig;
  request: BenchmarkRequest;
  response: BenchmarkResponse;
  metrics: BenchmarkMetrics;
  resources: ResourceMetrics;
  timestamp: Date;
  success: boolean;
  error?: string;
}

export interface BenchmarkSuite {
  name: string;
  requests: BenchmarkRequest[];
  providers: ProviderConfig[];
  iterations: number;
  warmupIterations: number;
}

export interface BenchmarkReport {
  suite: BenchmarkSuite;
  results: BenchmarkResult[];
  summary: {
    totalTests: number;
    successRate: number;
    averageMetrics: Record<string, BenchmarkMetrics>;
    resourceUsage: Record<string, ResourceMetrics>;
    rankings: Array<{
      provider: string;
      score: number;
      metrics: BenchmarkMetrics;
    }>;
  };
  generatedAt: Date;
}
