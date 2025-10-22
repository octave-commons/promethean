export type SessionInfo = {
  readonly id: string;
  readonly title: string;
  readonly messageCount: number;
  readonly lastActivityTime: string;
  readonly sessionAge: number;
  readonly activityStatus: string;
  readonly isAgentTask: boolean;
  readonly agentTaskStatus?: string;
  readonly error?: string;
};
