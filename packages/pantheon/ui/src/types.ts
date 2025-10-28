/**
 * Core types for the Agent Management UI
 */

export interface Agent {
  id: string;
  name: string;
  status: AgentStatus;
  type: AgentType;
  model: ModelReference;
  capabilities: string[];
  metrics: AgentMetrics;
  config: AgentConfig;
  workflow?: WorkflowReference;
  createdAt: Date;
  updatedAt: Date;
  lastActive?: Date;
}

export type AgentStatus = 
  | 'idle'
  | 'active' 
  | 'busy'
  | 'error'
  | 'offline'
  | 'maintenance'
  | 'starting'
  | 'stopping';

export type AgentType = 
  | 'general'
  | 'specialist'
  | 'orchestrator'
  | 'monitor'
  | 'workflow'
  | 'ui'
  | 'backend';

export interface ModelReference {
  provider: string;
  name: string;
  version?: string;
  options?: Record<string, unknown>;
}

export interface AgentMetrics {
  tasksCompleted: number;
  tasksFailed: number;
  averageResponseTime: number;
  cpuUsage: number;
  memoryUsage: number;
  uptime: number;
  errorRate: number;
  lastUpdated: Date;
}

export interface AgentConfig {
  maxConcurrentTasks: number;
  timeout: number;
  retryAttempts: number;
  priority: number;
  autoRestart: boolean;
  logging: LoggingConfig;
  resources: ResourceConfig;
}

export interface LoggingConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  enableMetrics: boolean;
  enableTracing: boolean;
}

export interface ResourceConfig {
  maxMemory: number;
  maxCpu: number;
  maxTokens: number;
}

export interface WorkflowReference {
  id: string;
  name: string;
  nodeId: string;
}

export interface AgentTask {
  id: string;
  agentId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  progress: number;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  metadata: Record<string, unknown>;
}

export type TaskStatus = 
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'timeout';

export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface AgentEvent {
  id: string;
  agentId: string;
  type: EventType;
  timestamp: Date;
  message: string;
  level: EventLevel;
  metadata: Record<string, unknown>;
}

export type EventType = 
  | 'status_change'
  | 'task_started'
  | 'task_completed'
  | 'task_failed'
  | 'error'
  | 'config_change'
  | 'resource_warning'
  | 'system_event';

export type EventLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

export interface AgentDashboard {
  agents: Agent[];
  tasks: AgentTask[];
  events: AgentEvent[];
  systemMetrics: SystemMetrics;
  filters: DashboardFilters;
}

export interface SystemMetrics {
  totalAgents: number;
  activeAgents: number;
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  systemLoad: number;
  memoryUsage: number;
  cpuUsage: number;
  uptime: number;
}

export interface DashboardFilters {
  status: AgentStatus[];
  type: AgentType[];
  search: string;
  sortBy: SortField;
  sortOrder: 'asc' | 'desc';
}

export type SortField = 
  | 'name'
  | 'status'
  | 'type'
  | 'lastActive'
  | 'tasksCompleted'
  | 'errorRate';

export interface AgentAction {
  type: ActionType;
  agentId: string;
  payload?: Record<string, unknown>;
}

export type ActionType = 
  | 'start'
  | 'stop'
  | 'restart'
  | 'configure'
  | 'assign_task'
  | 'cancel_task'
  | 'update_config'
  | 'clear_logs';

export interface UIState {
  selectedAgent?: string;
  selectedTask?: string;
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'auto';
  view: 'grid' | 'list' | 'metrics';
  autoRefresh: boolean;
  refreshInterval: number;
}