/**
 * @license
 * Copyright (C) 2025 Promethean Technologies. All rights reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { z } from 'zod';

// Base timestamped item interface
export interface TimestampedItem {
  id: string;
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
}

// Session Message types
export interface SessionMessage extends TimestampedItem {
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: Record<string, any>;
}

// Agent Task types
export interface AgentTask extends TimestampedItem {
  session_id: string;
  agent_id: string;
  task_type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  input_data?: Record<string, any>;
  output_data?: Record<string, any>;
  error_message?: string;
  progress?: number;
}

// Opencode Event types
export interface OpencodeEvent extends TimestampedItem {
  session_id?: string;
  event_type: string;
  event_data: Record<string, any>;
  source: string;
  severity?: 'info' | 'warning' | 'error' | 'debug';
}

// Collection types
export type CollectionType = 'session_messages' | 'agent_tasks' | 'opencode_events';

export interface CollectionItem {
  session_messages: SessionMessage;
  agent_tasks: AgentTask;
  opencode_events: OpencodeEvent;
}

// Query parameters
export interface QueryParams {
  limit?: number;
  offset?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  filter?: Record<string, any>;
  session_id?: string;
  created_after?: string; // ISO 8601
  created_before?: string; // ISO 8601
}

// SSE Event types
export interface SSEEvent {
  type: 'insert' | 'update' | 'delete';
  collection: CollectionType;
  data: any;
  timestamp: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
}

// Configuration types
export interface ServerConfig {
  host: string;
  port: number;
  cors: {
    origin: string | string[];
    credentials: boolean;
  };
  auth: {
    enabled: boolean;
    bearerToken?: string;
  };
  sse: {
    enabled: boolean;
    pollingInterval: number; // milliseconds
  };
  openapi: {
    enabled: boolean;
    path: string;
  };
}

// Zod schemas for validation
export const SessionMessageSchema = z.object({
  id: z.string(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  session_id: z.string(),
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
  metadata: z.record(z.any()).optional(),
});

export const AgentTaskSchema = z.object({
  id: z.string(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  session_id: z.string(),
  agent_id: z.string(),
  task_type: z.string(),
  status: z.enum(['pending', 'running', 'completed', 'failed']),
  input_data: z.record(z.any()).optional(),
  output_data: z.record(z.any()).optional(),
  error_message: z.string().optional(),
  progress: z.number().min(0).max(100).optional(),
});

export const OpencodeEventSchema = z.object({
  id: z.string(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  session_id: z.string().optional(),
  event_type: z.string(),
  event_data: z.record(z.any()),
  source: z.string(),
  severity: z.enum(['info', 'warning', 'error', 'debug']).optional(),
});

export const QueryParamsSchema = z.object({
  limit: z.coerce.number().min(1).max(1000).default(50),
  offset: z.coerce.number().min(0).default(0),
  sort_by: z.string().default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
  filter: z.record(z.any()).optional(),
  session_id: z.string().optional(),
  created_after: z.string().datetime().optional(),
  created_before: z.string().datetime().optional(),
});

export const SSEEventSchema = z.object({
  type: z.enum(['insert', 'update', 'delete']),
  collection: z.enum(['session_messages', 'agent_tasks', 'opencode_events']),
  data: z.any(),
  timestamp: z.string().datetime(),
});

// Fastify route schemas
export const SessionMessageRouteSchema = {
  schema: {
    description: 'Session message operations',
    tags: ['session_messages'],
    params: z.object({
      id: z.string().optional(),
    }),
    querystring: QueryParamsSchema,
    body: SessionMessageSchema.partial().omit({ id: true, created_at: true, updated_at: true }),
    response: {
      200: z.object({
        success: z.boolean(),
        data: z.union([SessionMessageSchema, z.array(SessionMessageSchema)]),
      }),
      404: z.object({
        success: z.boolean(),
        error: z.string(),
      }),
    },
  },
};

export const AgentTaskRouteSchema = {
  schema: {
    description: 'Agent task operations',
    tags: ['agent_tasks'],
    params: z.object({
      id: z.string().optional(),
    }),
    querystring: QueryParamsSchema,
    body: AgentTaskSchema.partial().omit({ id: true, created_at: true, updated_at: true }),
    response: {
      200: z.object({
        success: z.boolean(),
        data: z.union([AgentTaskSchema, z.array(AgentTaskSchema)]),
      }),
      404: z.object({
        success: z.boolean(),
        error: z.string(),
      }),
    },
  },
};

export const OpencodeEventRouteSchema = {
  schema: {
    description: 'Opencode event operations',
    tags: ['opencode_events'],
    params: z.object({
      id: z.string().optional(),
    }),
    querystring: QueryParamsSchema,
    body: OpencodeEventSchema.partial().omit({ id: true, created_at: true, updated_at: true }),
    response: {
      200: z.object({
        success: z.boolean(),
        data: z.union([OpencodeEventSchema, z.array(OpencodeEventSchema)]),
      }),
      404: z.object({
        success: z.boolean(),
        error: z.string(),
      }),
    },
  },
};
