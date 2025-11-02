// SPDX-License-Identifier: GPL-3.0-only

export type SessionData = {
  id: string;
  title?: string;
  createdAt: number;
  updatedAt: number;
  lastActivity: number;
  status: string;
  time?: {
    created?: string;
    updated?: string;
  };
  activityStatus?: string;
  isAgentTask?: boolean;
  task?: string;
  completionMessage?: string;
  messages?: unknown[];
  agentTaskStatus?: string;
  lastActivityTime?: number;
};
