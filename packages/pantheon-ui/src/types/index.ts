export interface Actor {
  id: string;
  name: string;
  type: string;
  status: 'running' | 'stopped' | 'error';
  lastTick: Date;
  ticks: number;
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

export interface Tool {
  id: string;
  name: string;
  description: string;
  type: string;
  status: 'available' | 'running' | 'error';
  lastUsed: Date;
  usageCount: number;
}

export interface SystemStats {
  cpuUsage: number;
  memoryUsage: number;
  activeActors: number;
  totalRequests: number;
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

export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: number;
}

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  error?: string;
}
