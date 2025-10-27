export interface AgentTask {
  sessionId: string;
  task: string;
  startTime: number;
  status: 'running' | 'completed' | 'failed' | 'idle';
  lastActivity: number;
  completionMessage?: string;
}

export interface AgentStatus {
  sessionId: string;
  task: string;
  status: 'running' | 'completed' | 'failed' | 'idle';
  startTime: string;
  lastActivity: string;
  duration: number;
  completionMessage?: string;
}

export interface SessionInfo {
  id: string;
  title: string;
  messageCount: number;
  lastActivityTime: string;
  sessionAge: number;
  activityStatus: 'active' | 'waiting_for_input' | 'idle';
  isAgentTask: boolean;
  agentTaskStatus?: 'running' | 'completed' | 'failed' | 'idle';
  error?: string;
}

export interface SessionListResponse {
  sessions: SessionInfo[];
  totalCount: number;
  pagination: {
    limit: number;
    offset: number;
    hasMore: boolean;
    currentPage: number;
    totalPages: number;
  };
  summary: {
    active: number;
    waiting_for_input: number;
    idle: number;
    agentTasks: number;
  };
}

export interface AgentMonitoringSummary {
  totalAgents: number;
  running: number;
  completed: number;
  failed: number;
  idle: number;
  agents: AgentStatus[];
}

export interface InterAgentMessage {
  type: 'inter_agent_message';
  sender: string;
  recipient: string;
  timestamp: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  messageType: 'instruction' | 'query' | 'update' | 'coordination' | 'status_request';
  content: string;
  metadata: {
    sentVia: string;
    urgency: string;
  };
}

export interface SpawnAgentOptions {
  prompt: string;
  files?: string[];
  delegates?: string[];
}

export interface AgentOrchestratorConfig {
  timeoutThreshold?: number; // milliseconds, default 30 minutes
  monitoringInterval?: number; // milliseconds, default 5 minutes
  autoCleanup?: boolean; // default false
  persistenceEnabled?: boolean; // default true
}
