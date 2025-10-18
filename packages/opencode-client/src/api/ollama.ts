// API functions for Ollama queue operations
// These will be implemented to make actual HTTP requests to the OpenCode server

export interface JobOptions {
  status?: string;
  limit?: number;
  agentOnly?: boolean;
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
    format?: string | object;
  };
}

export interface Job {
  id: string;
  modelName: string;
  jobType: string;
  status: string;
  jobName?: string;
  createdAt: string;
  updatedAt?: string;
}

// Mock implementations for now - replace with actual API calls
export async function listJobs(options: JobOptions): Promise<Job[]> {
  // TODO: Implement actual API call
  console.log('Mock: Listing jobs with options:', options);
  return [];
}

export async function submitJob(options: SubmitJobOptions): Promise<Job> {
  // TODO: Implement actual API call
  console.log('Mock: Submitting job with options:', options);
  return {
    id: 'mock-job-id',
    modelName: options.modelName,
    jobType: options.jobType,
    status: 'pending',
    jobName: options.jobName || 'Mock Job',
    createdAt: new Date().toISOString(),
  };
}

export async function getJobStatus(jobId: string): Promise<Job> {
  // TODO: Implement actual API call
  console.log('Mock: Getting job status for:', jobId);
  return {
    id: jobId,
    modelName: 'mock-model',
    jobType: 'generate',
    status: 'completed',
    createdAt: new Date().toISOString(),
  };
}

export async function getJobResult(jobId: string): Promise<any> {
  // TODO: Implement actual API call
  console.log('Mock: Getting job result for:', jobId);
  return { result: 'Mock result' };
}

export async function cancelJob(jobId: string): Promise<void> {
  // TODO: Implement actual API call
  console.log('Mock: Cancelling job:', jobId);
}

export async function listModels(detailed = false): Promise<any[]> {
  // TODO: Implement actual API call
  console.log('Mock: Listing models, detailed:', detailed);
  return [];
}

export async function getQueueInfo(): Promise<any> {
  // TODO: Implement actual API call
  console.log('Mock: Getting queue info');
  return {};
}

export async function manageCache(action: string): Promise<any> {
  // TODO: Implement actual API call
  const validActions = ['stats', 'clear', 'clear-expired', 'performance-analysis'];
  
  if (!validActions.includes(action)) {
    throw new Error(`Invalid action: ${action}. Valid actions: ${validActions.join(', ')}`);
  }
  
  console.log('Mock: Managing cache with action:', action);
  return {
    action,
    timestamp: new Date().toISOString(),
    status: 'success',
    message: `Cache ${action} completed successfully`
  };
}
