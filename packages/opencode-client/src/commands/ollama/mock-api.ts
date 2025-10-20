// Simple mock functions for ollama API
export async function getCacheStats(): Promise<any> {
  return { totalSize: 0, modelCount: 0 };
}

export async function clearCache(): Promise<any> {
  return { message: 'Cache cleared', clearedEntries: 0 };
}

export async function cancelJob(_jobId: string): Promise<any> {
  return { success: true };
}

export async function getOllamaInfo(): Promise<any> {
  return { version: 'mock', status: 'running' };
}

export async function listJobs(_options?: any): Promise<any[]> {
  return [];
}

export async function listModels(): Promise<any[]> {
  return [];
}

export async function getJobResult(_jobId: string): Promise<any> {
  return { id: _jobId, status: 'completed', result: null };
}

export async function getJobStatus(_jobId: string): Promise<any> {
  return { id: _jobId, status: 'completed' };
}

export async function submitJob(_options: any): Promise<any> {
  return { id: `job-${Date.now()}`, status: 'pending' };
}
