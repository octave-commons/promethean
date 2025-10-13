/**
 * Type definitions for OpenCode Session Manager
 */

export interface Session {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
  status?: {
    name: string;
    state?: string;
  };
  messages?: Message[];
  metadata?: Record<string, any>;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  parts?: MessagePart[];
}

export interface MessagePart {
  type: 'text' | 'code' | 'image' | 'file';
  content: string;
  metadata?: Record<string, any>;
}

export interface SessionManagerConfig {
  baseUrl?: string;
  apiKey?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  theme?: 'light' | 'dark' | 'auto';
}

export interface CreateSessionRequest {
  title: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface UpdateSessionRequest {
  title?: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface SendPromptRequest {
  text: string;
  parts?: MessagePart[];
  metadata?: Record<string, any>;
}

export interface SessionManagerEvents {
  'session-created': CustomEvent<Session>;
  'session-updated': CustomEvent<Session>;
  'session-deleted': CustomEvent<{ id: string }>;
  'session-selected': CustomEvent<Session>;
  error: CustomEvent<{ message: string; code?: string }>;
  loading: CustomEvent<{ loading: boolean }>;
}
