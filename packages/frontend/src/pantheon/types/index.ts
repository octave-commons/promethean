export interface Actor {
  id: string;
  name: string;
  type: string;
  status: 'running' | 'stopped' | 'error';
  lastTick: Date;
  ticks: number;
  config?: Record<string, any>;
}

export interface ActorWithStatus extends Actor {
  selected?: boolean;
}

export interface LLMActor extends Actor {
  type: 'LLM Actor';
  config: {
    model: string;
    temperature: number;
    maxTokens: number;
  };
}

export interface ActorConfig {
  name: string;
  type: string;
  config?: Record<string, any>;
}

export interface Context {
  id: string;
  name: string;
  description: string;
  status: 'compiled' | 'pending' | 'error';
  actors: number;
  tools: number;
  lastCompiled: Date;
}

export interface ContextCompilation {
  id: string;
  status: 'compiling' | 'completed' | 'failed';
  errors?: string[];
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  type: string;
  status: 'available' | 'running' | 'error';
  lastUsed: Date;
  usageCount: number;
}

export interface MCPTool extends Tool {
  type: 'MCP Tool';
  endpoint: string;
}

export interface MCPToolExecution {
  id: string;
  toolId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
  error?: string;
  timestamp: Date;
}

export interface SystemStats {
  cpuUsage: number;
  memoryUsage: number;
  activeActors: number;
  totalRequests: number;
}

export interface SystemMetrics extends SystemStats {
  timestamp: Date;
}

export interface SystemStatus {
  apiServer: 'online' | 'offline';
  webSocket: 'connected' | 'disconnected';
  database: 'healthy' | 'unhealthy';
  llmService: 'available' | 'limited' | 'unavailable';
}

export interface LogEntry {
  timestamp: Date;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  source?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: number;
}

export interface ActorEvent {
  type: 'actor_created' | 'actor_updated' | 'actor_deleted' | 'actor_ticked';
  actorId: string;
  data: any;
}

export interface SystemEvent {
  type: 'system_status_changed' | 'metrics_updated';
  data: any;
}

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
