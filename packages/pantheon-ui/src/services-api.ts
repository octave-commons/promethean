import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { toast } from 'react-hot-toast';
import type {
  Actor,
  ActorWithStatus,
  LLMActor,
  ActorConfig,
  Context,
  ContextCompilation,
  MCPTool,
  MCPToolExecution,
  SystemMetrics,
  ChatMessage,
  ApiResponse,
  PaginatedResponse,
} from '@/types';

class APIClient {
  private client: AxiosInstance;

  constructor(baseURL: string = '/api') {
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse<APIResponse>) => {
        if (response.data.error) {
          toast.error(response.data.error);
          throw new Error(response.data.error);
        }
        return response;
      },
      (error) => {
        const message = error.response?.data?.error || error.message || 'An error occurred';
        toast.error(message);
        throw error;
      },
    );
  }

  // Actor Management
  async getActors(): Promise<ActorWithStatus[]> {
    const response = await this.client.get<APIResponse<ActorWithStatus[]>>('/actors');
    return response.data.data || [];
  }

  async getActor(actorId: string): Promise<ActorWithStatus> {
    const response = await this.client.get<APIResponse<ActorWithStatus>>(`/actors/${actorId}`);
    return response.data.data!;
  }

  async createActor(config: ActorConfig): Promise<Actor> {
    const response = await this.client.post<APIResponse<Actor>>('/actors', config);
    return response.data.data!;
  }

  async updateActor(actorId: string, config: Partial<ActorConfig>): Promise<Actor> {
    const response = await this.client.put<APIResponse<Actor>>(`/actors/${actorId}`, config);
    return response.data.data!;
  }

  async deleteActor(actorId: string): Promise<void> {
    await this.client.delete(`/actors/${actorId}`);
  }

  async tickActor(actorId: string): Promise<void> {
    await this.client.post(`/actors/${actorId}/tick`);
  }

  // LLM Actor Management
  async createLLMActor(config: LLMActorConfig): Promise<LLMActor> {
    const response = await this.client.post<APIResponse<LLMActor>>('/actors/llm', config);
    return response.data.data!;
  }

  async getLLMMessages(actorId: string): Promise<ChatMessage[]> {
    const response = await this.client.get<APIResponse<ChatMessage[]>>(
      `/actors/${actorId}/messages`,
    );
    return response.data.data || [];
  }

  async sendLLMMessage(actorId: string, message: string): Promise<ChatMessage> {
    const response = await this.client.post<APIResponse<ChatMessage>>(
      `/actors/${actorId}/messages`,
      {
        content: message,
      },
    );
    return response.data.data!;
  }

  async clearLLMMessages(actorId: string): Promise<void> {
    await this.client.delete(`/actors/${actorId}/messages`);
  }

  // Context Management
  async getContexts(): Promise<Context[]> {
    const response = await this.client.get<APIResponse<Context[]>>('/contexts');
    return response.data.data || [];
  }

  async getContext(contextId: string): Promise<Context> {
    const response = await this.client.get<APIResponse<Context>>(`/contexts/${contextId}`);
    return response.data.data!;
  }

  async compileContext(sources: string[], text: string): Promise<ContextCompilation> {
    const response = await this.client.post<APIResponse<ContextCompilation>>('/contexts/compile', {
      sources,
      text,
    });
    return response.data.data!;
  }

  async getContextSources(): Promise<string[]> {
    const response = await this.client.get<APIResponse<string[]>>('/contexts/sources');
    return response.data.data || [];
  }

  // MCP Tools
  async getMCPTools(): Promise<MCPTool[]> {
    const response = await this.client.get<APIResponse<MCPTool[]>>('/tools');
    return response.data.data || [];
  }

  async executeMCPTool(toolName: string, args: Record<string, unknown>): Promise<MCPToolExecution> {
    const response = await this.client.post<APIResponse<MCPToolExecution>>(
      `/tools/${toolName}/execute`,
      args,
    );
    return response.data.data!;
  }

  async getMCPToolExecutions(limit: number = 50): Promise<MCPToolExecution[]> {
    const response = await this.client.get<APIResponse<MCPToolExecution[]>>('/tools/executions', {
      params: { limit },
    });
    return response.data.data || [];
  }

  // System Metrics
  async getSystemMetrics(): Promise<SystemMetrics> {
    const response = await this.client.get<APIResponse<SystemMetrics>>('/system/metrics');
    return response.data.data!;
  }

  async getSystemHealth(): Promise<{ status: 'healthy' | 'degraded' | 'down'; details: any }> {
    const response = await this.client.get<APIResponse<any>>('/system/health');
    return response.data.data!;
  }

  // Settings
  async getSettings(): Promise<any> {
    const response = await this.client.get<APIResponse<any>>('/settings');
    return response.data.data || {};
  }

  async updateSettings(settings: any): Promise<any> {
    const response = await this.client.put<APIResponse<any>>('/settings', settings);
    return response.data.data!;
  }
}

// Create singleton instance
export const apiClient = new APIClient();

// Export individual methods for convenience
export const {
  getActors,
  getActor,
  createActor,
  updateActor,
  deleteActor,
  tickActor,
  createLLMActor,
  getLLMMessages,
  sendLLMMessage,
  clearLLMMessages,
  getContexts,
  getContext,
  compileContext,
  getContextSources,
  getMCPTools,
  executeMCPTool,
  getMCPToolExecutions,
  getSystemMetrics,
  getSystemHealth,
  getSettings,
  updateSettings,
} = apiClient;

export default apiClient;
