export interface SessionInfo {
  id: string;
  title: string;
  messageCount: number;
  lastActivityTime: string;
  sessionAge: number;
  activityStatus: string;
  isAgentTask: boolean;
  agentTaskStatus?: string;
  error?: string;
}
