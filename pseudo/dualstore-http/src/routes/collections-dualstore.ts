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

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import type {
  SessionMessage,
  AgentTask,
  OpencodeEvent,
  QueryParams,
  ApiResponse,
  PaginatedResponse,
} from '../types/index.js';
import { DualStoreManager } from '@promethean/persistence';
import type { DualStoreTimestamp } from '@promethean/persistence';

// JSON Schema definitions for Fastify
const QueryParamsJsonSchema = {
  type: 'object',
  properties: {
    limit: { type: 'number', minimum: 1, maximum: 1000, default: 50 },
    offset: { type: 'number', minimum: 0, default: 0 },
    sort_by: { type: 'string', default: 'created_at' },
    sort_order: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
    filter: { type: 'object' },
    session_id: { type: 'string' },
    created_after: { type: 'string' },
    created_before: { type: 'string' },
  },
};

const SessionMessageJsonSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    created_at: { type: 'string' },
    updated_at: { type: 'string' },
    session_id: { type: 'string' },
    role: { type: 'string', enum: ['user', 'assistant', 'system'] },
    content: { type: 'string' },
    metadata: { type: 'object' },
  },
  required: ['id', 'created_at', 'updated_at', 'session_id', 'role', 'content'],
};

const AgentTaskJsonSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    created_at: { type: 'string' },
    updated_at: { type: 'string' },
    session_id: { type: 'string' },
    agent_id: { type: 'string' },
    task_type: { type: 'string' },
    status: { type: 'string', enum: ['pending', 'running', 'completed', 'failed'] },
    input_data: { type: 'object' },
    output_data: { type: 'object' },
    error_message: { type: 'string' },
    progress: { type: 'number', minimum: 0, maximum: 100 },
  },
  required: ['id', 'created_at', 'updated_at', 'session_id', 'agent_id', 'task_type', 'status'],
};

const OpencodeEventJsonSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    created_at: { type: 'string' },
    updated_at: { type: 'string' },
    session_id: { type: 'string' },
    event_type: { type: 'string' },
    event_data: { type: 'object' },
    source: { type: 'string' },
    severity: { type: 'string', enum: ['info', 'warning', 'error', 'debug'] },
  },
  required: ['id', 'created_at', 'updated_at', 'event_type', 'event_data', 'source'],
};

/**
 * Helper function to convert dual store timestamp to ISO string
 */
function convertTimestamp(timestamp: DualStoreTimestamp | undefined | null): string {
  if (!timestamp) {
    return new Date().toISOString();
  }
  if (typeof timestamp === 'number') {
    return new Date(timestamp).toISOString();
  }
  if (timestamp instanceof Date) {
    return timestamp.toISOString();
  }
  if (typeof timestamp === 'object') {
    return new Date().toISOString();
  }
  return timestamp;
}

/**
 * Helper function to safely extract metadata value
 */
function safeGet<T>(metadata: any, key: string, defaultValue: T): T {
  if (!metadata || metadata[key] === undefined || metadata[key] === null) {
    return defaultValue;
  }
  const value = metadata[key];
  if (typeof value === 'object' && Object.keys(value).length === 0) {
    return defaultValue;
  }
  return value as T;
}

/**
 * Real dual store data provider
 */
class DualStoreDataProvider {
  private sessionStore: DualStoreManager<'text', 'timestamp'>;
  private agentTaskStore: DualStoreManager<'text', 'timestamp'>;
  private eventStore: DualStoreManager<'text', 'timestamp'>;

  constructor(
    sessionStore: DualStoreManager<'text', 'timestamp'>,
    agentTaskStore: DualStoreManager<'text', 'timestamp'>,
    eventStore: DualStoreManager<'text', 'timestamp'>,
  ) {
    this.sessionStore = sessionStore;
    this.agentTaskStore = agentTaskStore;
    this.eventStore = eventStore;
  }

  // Session Messages
  async getSessionMessages(
    params: QueryParams,
  ): Promise<{ items: SessionMessage[]; total: number }> {
    try {
      const limit = params.limit || 50;
      const offset = params.offset || 0;

      // Get all session messages from dual store
      const allMessages = await this.sessionStore.getMostRecent(100);
      console.log('SAMPLE: First item from store:', JSON.stringify(allMessages[0], null, 2));

      // Filter for session messages (they have session_id in metadata)
      const sessionMessages: SessionMessage[] = [];
      let messageCounter = 0;
      for (const item of allMessages) {
        // Try multiple possible metadata field names for session ID
        const sessionId =
          item.metadata?.session_id ||
          item.metadata?.sessionId ||
          item.metadata?.sessionID ||
          item.metadata?.session;

        if (!sessionId) {
          continue;
        }

        // Generate unique ID by combining session ID with counter and timestamp
        const uniqueId = `msg_${sessionId}_${messageCounter++}_${Date.now()}`;

        const message: SessionMessage = {
          id: uniqueId,
          created_at: convertTimestamp(item.timestamp),
          updated_at: convertTimestamp(item.timestamp),
          session_id: String(sessionId),
          role: (item.metadata?.role as any) || 'user',
          content: item.text || '',
          metadata: item.metadata || {},
        };

        sessionMessages.push(message);
        console.log('TRANSFORMED:', JSON.stringify(message, null, 2));
      }

      // Apply filters
      let filteredMessages = sessionMessages;
      if (params.session_id) {
        filteredMessages = filteredMessages.filter((item) => item.session_id === params.session_id);
      }

      if (params.created_after) {
        filteredMessages = filteredMessages.filter(
          (item) => item.created_at >= params.created_after!,
        );
      }

      if (params.created_before) {
        filteredMessages = filteredMessages.filter(
          (item) => item.created_at <= params.created_before!,
        );
      }

      // Apply sorting
      const sortBy = params.sort_by || 'created_at';
      const sortOrder = params.sort_order || 'desc';
      filteredMessages.sort((a, b) => {
        const aValue = (a as any)[sortBy];
        const bValue = (b as any)[sortBy];

        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });

      // Apply pagination
      const total = filteredMessages.length;
      const items = filteredMessages.slice(offset, offset + limit);

      console.log('FINAL RETURNING:', JSON.stringify(sessionMessages.slice(0, 3), null, 2));
      return { items, total };
    } catch (error) {
      console.error('Error getting session messages:', error);
      return { items: [], total: 0 };
    }
  }

  async getSessionMessage(id: string): Promise<SessionMessage | null> {
    try {
      const item = await this.sessionStore.get(id);
      if (!item || !item.metadata?.session_id) return null;

      return {
        id: item.id || '',
        created_at: convertTimestamp(item.timestamp),
        updated_at: item.metadata?.updated_at
          ? convertTimestamp(item.metadata.updated_at as DualStoreTimestamp)
          : convertTimestamp(item.timestamp),
        session_id: String(item.metadata.session_id),
        role: safeGet<'user' | 'assistant' | 'system'>(item.metadata, 'role', 'user'),
        content: item.text,
        metadata: item.metadata || {},
      };
    } catch (error) {
      console.error('Error getting session message:', error);
      return null;
    }
  }

  async createSessionMessage(
    data: Omit<SessionMessage, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<SessionMessage> {
    try {
      const now = new Date().toISOString();
      const id = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const newMessage: SessionMessage = {
        id,
        created_at: now,
        updated_at: now,
        ...data,
      };

      // Store in dual store
      await this.sessionStore.insert({
        id,
        text: data.content,
        timestamp: now,
        metadata: {
          session_id: data.session_id,
          role: data.role,
          updated_at: now,
          ...data.metadata,
        },
      });

      return newMessage;
    } catch (error) {
      console.error('Error creating session message:', error);
      throw error;
    }
  }

  async updateSessionMessage(
    id: string,
    data: Partial<SessionMessage>,
  ): Promise<SessionMessage | null> {
    try {
      const existing = await this.sessionStore.get(id);
      if (!existing || !existing.metadata?.session_id) return null;

      const now = new Date().toISOString();
      const updatedMessage: SessionMessage = {
        id: existing.id || '',
        session_id: data.session_id ?? String(existing.metadata.session_id),
        role:
          data.role ?? safeGet<'user' | 'assistant' | 'system'>(existing.metadata, 'role', 'user'),
        content: data.content ?? existing.text,
        created_at: convertTimestamp(existing.timestamp),
        updated_at: now,
        metadata: data.metadata ?? existing.metadata ?? {},
      };

      // Update in dual store
      await this.sessionStore.insert({
        id,
        text: updatedMessage.content,
        timestamp: existing.timestamp,
        metadata: {
          ...existing.metadata,
          session_id: updatedMessage.session_id,
          role: updatedMessage.role,
          updated_at: now,
          ...updatedMessage.metadata,
        },
      });

      return updatedMessage;
    } catch (error) {
      console.error('Error updating session message:', error);
      return null;
    }
  }

  async deleteSessionMessage(id: string): Promise<boolean> {
    try {
      // Note: DualStoreManager doesn't have a delete method, so we'll implement this as needed
      console.log(`Delete session message ${id} - not implemented in dual store yet`);
      return true;
    } catch (error) {
      console.error('Error deleting session message:', error);
      return false;
    }
  }

  // Agent Tasks
  async getAgentTasks(params: QueryParams): Promise<{ items: AgentTask[]; total: number }> {
    try {
      const limit = params.limit || 50;
      const offset = params.offset || 0;

      // Get all agent tasks from dual store
      const allTasks = await this.agentTaskStore.getMostRecent(100);

      // Transform to AgentTask format
      const agentTasks: AgentTask[] = [];
      let taskCounter = 0;
      for (const item of allTasks) {
        if (!item.metadata?.sessionId) continue;

        // Generate unique ID by combining session ID with counter and timestamp
        const uniqueId = `task_${item.metadata.sessionId}_${taskCounter++}_${Date.now()}`;

        agentTasks.push({
          id: uniqueId,
          created_at: convertTimestamp(item.timestamp),
          updated_at:
            item.metadata?.updated_at &&
            typeof item.metadata.updated_at !== 'object' &&
            item.metadata.updated_at !== null
              ? convertTimestamp(item.metadata.updated_at as DualStoreTimestamp)
              : convertTimestamp(item.timestamp),
          session_id: String(item.metadata.sessionId),
          agent_id: safeGet<string>(item.metadata, 'agentId', 'unknown'),
          task_type: safeGet<string>(item.metadata, 'taskType', 'general'),
          status: safeGet<'pending' | 'running' | 'completed' | 'failed'>(
            item.metadata,
            'status',
            'pending',
          ),
          progress: safeGet<number>(item.metadata, 'progress', 0),
          input_data: safeGet<object>(item.metadata, 'inputData', {}),
          output_data: safeGet<object>(item.metadata, 'outputData', {}),
          error_message: safeGet<string | undefined>(item.metadata, 'errorMessage', undefined),
        });
      }

      // Apply filters
      let filteredTasks = agentTasks;
      if (params.session_id) {
        filteredTasks = filteredTasks.filter((item) => item.session_id === params.session_id);
      }

      if (params.created_after) {
        filteredTasks = filteredTasks.filter((item) => item.created_at >= params.created_after!);
      }

      if (params.created_before) {
        filteredTasks = filteredTasks.filter((item) => item.created_at <= params.created_before!);
      }

      // Apply sorting
      const sortBy = params.sort_by || 'created_at';
      const sortOrder = params.sort_order || 'desc';
      filteredTasks.sort((a, b) => {
        const aValue = (a as any)[sortBy];
        const bValue = (b as any)[sortBy];

        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });

      // Apply pagination
      const total = filteredTasks.length;
      const items = filteredTasks.slice(offset, offset + limit);

      console.log('FINAL RETURNING:', JSON.stringify(agentTasks.slice(0, 3), null, 2));
      return { items, total };
    } catch (error) {
      console.error('Error getting agent tasks:', error);
      return { items: [], total: 0 };
    }
  }

  async getAgentTask(id: string): Promise<AgentTask | null> {
    try {
      const item = await this.agentTaskStore.get(id);
      if (!item || !item.metadata?.sessionId) return null;

      return {
        id: item.id || '',
        created_at: convertTimestamp(item.timestamp),
        updated_at: item.metadata?.updated_at
          ? convertTimestamp(item.metadata.updated_at as DualStoreTimestamp)
          : convertTimestamp(item.timestamp),
        session_id: String(item.metadata.sessionId),
        agent_id: safeGet<string>(item.metadata, 'agentId', 'unknown'),
        task_type: safeGet<string>(item.metadata, 'taskType', 'general'),
        status: safeGet<'pending' | 'running' | 'completed' | 'failed'>(
          item.metadata,
          'status',
          'pending',
        ),
        progress: safeGet<number>(item.metadata, 'progress', 0),
        input_data: safeGet<object>(item.metadata, 'inputData', {}),
        output_data: safeGet<object>(item.metadata, 'outputData', {}),
        error_message: safeGet<string | undefined>(item.metadata, 'errorMessage', undefined),
      };
    } catch (error) {
      console.error('Error getting agent task:', error);
      return null;
    }
  }

  async createAgentTask(
    data: Omit<AgentTask, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<AgentTask> {
    try {
      const now = new Date().toISOString();
      const id = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const newTask: AgentTask = {
        id,
        created_at: now,
        updated_at: now,
        ...data,
      };

      // Store in dual store
      await this.agentTaskStore.insert({
        id,
        text: data.task_type || 'general',
        timestamp: now,
        metadata: {
          sessionId: data.session_id,
          agentId: data.agent_id,
          taskType: data.task_type,
          status: data.status,
          progress: data.progress,
          inputData: data.input_data,
          outputData: data.output_data,
          errorMessage: data.error_message,
          updated_at: now,
        },
      });

      return newTask;
    } catch (error) {
      console.error('Error creating agent task:', error);
      throw error;
    }
  }

  async updateAgentTask(id: string, data: Partial<AgentTask>): Promise<AgentTask | null> {
    try {
      const existing = await this.agentTaskStore.get(id);
      if (!existing || !existing.metadata?.sessionId) return null;

      const now = new Date().toISOString();
      const updatedTask: AgentTask = {
        id: existing.id || '',
        session_id: data.session_id ?? String(existing.metadata.sessionId),
        agent_id: data.agent_id ?? safeGet<string>(existing.metadata, 'agentId', 'unknown'),
        task_type: data.task_type ?? safeGet<string>(existing.metadata, 'taskType', 'general'),
        status:
          data.status ??
          safeGet<'pending' | 'running' | 'completed' | 'failed'>(
            existing.metadata,
            'status',
            'pending',
          ),
        created_at: convertTimestamp(existing.timestamp),
        updated_at: now,
        input_data: data.input_data ?? safeGet<object>(existing.metadata, 'inputData', {}),
        output_data: data.output_data ?? safeGet<object>(existing.metadata, 'outputData', {}),
        error_message:
          data.error_message ??
          safeGet<string | undefined>(existing.metadata, 'errorMessage', undefined),
        progress: data.progress ?? safeGet<number>(existing.metadata, 'progress', 0),
      };

      // Update in dual store
      await this.agentTaskStore.insert({
        id,
        text: updatedTask.task_type,
        timestamp: existing.timestamp,
        metadata: {
          ...existing.metadata,
          sessionId: updatedTask.session_id,
          agentId: updatedTask.agent_id,
          taskType: updatedTask.task_type,
          status: updatedTask.status,
          progress: updatedTask.progress,
          inputData: updatedTask.input_data,
          outputData: updatedTask.output_data,
          errorMessage: updatedTask.error_message,
          updated_at: now,
        },
      });

      return updatedTask;
    } catch (error) {
      console.error('Error updating agent task:', error);
      return null;
    }
  }

  async deleteAgentTask(id: string): Promise<boolean> {
    try {
      console.log(`Delete agent task ${id} - not implemented in dual store yet`);
      return true;
    } catch (error) {
      console.error('Error deleting agent task:', error);
      return false;
    }
  }

  // Opencode Events
  async getOpencodeEvents(params: QueryParams): Promise<{ items: OpencodeEvent[]; total: number }> {
    try {
      const limit = params.limit || 50;
      const offset = params.offset || 0;

      // Get all events from dual store
      const allEvents = await this.eventStore.getMostRecent(100);

      // Transform to OpencodeEvent format
      const opencodeEvents: OpencodeEvent[] = [];
      let eventCounter = 0;
      for (const item of allEvents) {
        // Try multiple possible metadata field names for event type
        const eventTypeRaw =
          item.metadata?.event_type || item.metadata?.eventType || item.metadata?.type;
        const eventType = typeof eventTypeRaw === 'string' ? eventTypeRaw : undefined;
        if (!eventType) continue;

        // Generate unique ID by combining event type with counter and timestamp
        const uniqueId = `event_${eventType}_${eventCounter++}_${Date.now()}`;

        opencodeEvents.push({
          id: uniqueId,
          created_at: convertTimestamp(item.timestamp),
          updated_at:
            item.metadata?.updated_at &&
            typeof item.metadata.updated_at !== 'object' &&
            item.metadata.updated_at !== null
              ? convertTimestamp(item.metadata.updated_at as DualStoreTimestamp)
              : convertTimestamp(item.timestamp),
          session_id: safeGet<string>(item.metadata, 'session_id', '') || undefined,
          event_type: eventType,
          event_data: safeGet<object>(item.metadata, 'event_data', {}),
          source: safeGet<string>(item.metadata, 'source', 'opencode'),
          severity: safeGet<'info' | 'warning' | 'error' | 'debug'>(
            item.metadata,
            'severity',
            'info',
          ),
        });
      }

      // Apply filters
      let filteredEvents = opencodeEvents;
      if (params.session_id) {
        filteredEvents = filteredEvents.filter((item) => item.session_id === params.session_id);
      }

      if (params.created_after) {
        filteredEvents = filteredEvents.filter((item) => item.created_at >= params.created_after!);
      }

      if (params.created_before) {
        filteredEvents = filteredEvents.filter((item) => item.created_at <= params.created_before!);
      }

      // Apply sorting
      const sortBy = params.sort_by || 'created_at';
      const sortOrder = params.sort_order || 'desc';
      filteredEvents.sort((a, b) => {
        const aValue = (a as any)[sortBy];
        const bValue = (b as any)[sortBy];

        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });

      // Apply pagination
      const total = filteredEvents.length;
      const items = filteredEvents.slice(offset, offset + limit);

      console.log('FINAL RETURNING:', JSON.stringify(opencodeEvents.slice(0, 3), null, 2));
      return { items, total };
    } catch (error) {
      console.error('Error getting opencode events:', error);
      return { items: [], total: 0 };
    }
  }

  async getOpencodeEvent(id: string): Promise<OpencodeEvent | null> {
    try {
      const item = await this.eventStore.get(id);
      if (!item || !item.metadata?.event_type) return null;

      return {
        id: item.id || '',
        created_at: convertTimestamp(item.timestamp),
        updated_at: item.metadata?.updated_at
          ? convertTimestamp(item.metadata.updated_at as DualStoreTimestamp)
          : convertTimestamp(item.timestamp),
        session_id: safeGet<string | undefined>(item.metadata, 'session_id', undefined),
        event_type: String(item.metadata.event_type),
        event_data: safeGet<object>(item.metadata, 'event_data', {}),
        source: safeGet<string>(item.metadata, 'source', 'opencode'),
        severity: safeGet<'info' | 'warning' | 'error' | 'debug'>(
          item.metadata,
          'severity',
          'info',
        ),
      };
    } catch (error) {
      console.error('Error getting opencode event:', error);
      return null;
    }
  }

  async createOpencodeEvent(
    data: Omit<OpencodeEvent, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<OpencodeEvent> {
    try {
      const now = new Date().toISOString();
      const id = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const newEvent: OpencodeEvent = {
        id,
        created_at: now,
        updated_at: now,
        ...data,
      };

      // Store in dual store
      await this.eventStore.insert({
        id,
        text: data.event_type,
        timestamp: now,
        metadata: {
          session_id: data.session_id,
          event_type: data.event_type,
          event_data: data.event_data,
          source: data.source,
          severity: data.severity,
          updated_at: now,
        },
      });

      return newEvent;
    } catch (error) {
      console.error('Error creating opencode event:', error);
      throw error;
    }
  }

  async updateOpencodeEvent(
    id: string,
    data: Partial<OpencodeEvent>,
  ): Promise<OpencodeEvent | null> {
    try {
      const existing = await this.eventStore.get(id);
      if (!existing || !existing.metadata?.event_type) return null;

      const now = new Date().toISOString();
      const updatedEvent: OpencodeEvent = {
        id: existing.id || '',
        session_id:
          data.session_id ??
          safeGet<string | undefined>(existing.metadata, 'session_id', undefined),
        event_type: data.event_type ?? String(existing.metadata.event_type),
        event_data: data.event_data ?? safeGet<object>(existing.metadata, 'event_data', {}),
        source: data.source ?? safeGet<string>(existing.metadata, 'source', 'opencode'),
        severity:
          data.severity ??
          safeGet<'info' | 'warning' | 'error' | 'debug'>(existing.metadata, 'severity', 'info'),
        created_at: convertTimestamp(existing.timestamp),
        updated_at: now,
      };

      // Update in dual store
      await this.eventStore.insert({
        id,
        text: updatedEvent.event_type,
        timestamp: existing.timestamp,
        metadata: {
          ...existing.metadata,
          session_id: updatedEvent.session_id,
          event_type: updatedEvent.event_type,
          event_data: updatedEvent.event_data,
          source: updatedEvent.source,
          severity: updatedEvent.severity,
          updated_at: now,
        },
      });

      return updatedEvent;
    } catch (error) {
      console.error('Error updating opencode event:', error);
      return null;
    }
  }

  async deleteOpencodeEvent(id: string): Promise<boolean> {
    try {
      console.log(`Delete opencode event ${id} - not implemented in dual store yet`);
      return true;
    } catch (error) {
      console.error('Error deleting opencode event:', error);
      return false;
    }
  }
}

let dataProvider: DualStoreDataProvider;

/**
 * Initialize data provider with dual stores
 */
export async function initializeDataProvider(
  sessionStore: DualStoreManager<'text', 'timestamp'>,
  agentTaskStore: DualStoreManager<'text', 'timestamp'>,
  eventStore: DualStoreManager<'text', 'timestamp'>,
): Promise<void> {
  dataProvider = new DualStoreDataProvider(sessionStore, agentTaskStore, eventStore);
  console.log('✅ Dual store data provider initialized');
}

/**
 * Register collection routes with real dual store integration
 */
export async function collectionRoutes(fastify: FastifyInstance): Promise<void> {
  if (!dataProvider) {
    throw new Error('Data provider not initialized. Call initializeDataProvider first.');
  }

  // Session Messages Routes
  fastify.get(
    '/session_messages',
    {
      schema: {
        description: 'Get all session messages',
        tags: ['session_messages'],
        querystring: QueryParamsJsonSchema,
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'array',
                items: { type: 'object' }, // Simplified schema
              },
              pagination: {
                type: 'object',
                properties: {
                  total: { type: 'number' },
                  limit: { type: 'number' },
                  offset: { type: 'number' },
                  has_more: { type: 'boolean' },
                },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Querystring: QueryParams }>, reply: FastifyReply) => {
      try {
        const params = request.query;
        const { items, total } = await dataProvider.getSessionMessages(params);

        const response: PaginatedResponse<SessionMessage> = {
          success: true,
          data: items,
          pagination: {
            total,
            limit: params.limit || 50,
            offset: params.offset || 0,
            has_more: (params.offset || 0) + (params.limit || 50) < total,
          },
        };

        console.log('Final response data:', response.data?.length || 0, 'items');
        console.log(
          'First item keys:',
          response.data && response.data.length > 0
            ? Object.keys(response.data[0] as any)
            : 'no items',
        );
        console.log(
          'First item sample:',
          response.data && response.data.length > 0
            ? JSON.stringify(response.data[0], null, 2)
            : 'no items',
        );
        return reply.send(response);
      } catch (error) {
        const response: ApiResponse = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
        return reply.status(500).send(response);
      }
    },
  );

  fastify.get(
    '/session_messages/:id',
    {
      schema: {
        description: 'Get a specific session message',
        tags: ['session_messages'],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: SessionMessageJsonSchema,
            },
          },
          404: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      try {
        const { id } = request.params;
        const item = await dataProvider.getSessionMessage(id);

        if (!item) {
          const response: ApiResponse = {
            success: false,
            error: 'Session message not found',
          };
          return reply.status(404).send(response);
        }

        const response: ApiResponse<SessionMessage> = {
          success: true,
          data: item,
        };
        return reply.send(response);
      } catch (error) {
        const response: ApiResponse = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
        return reply.status(500).send(response);
      }
    },
  );

  fastify.post(
    '/session_messages',
    {
      schema: {
        description: 'Create a new session message',
        tags: ['session_messages'],
        body: {
          type: 'object',
          properties: {
            session_id: { type: 'string' },
            role: { type: 'string', enum: ['user', 'assistant', 'system'] },
            content: { type: 'string' },
            metadata: { type: 'object' },
          },
          required: ['session_id', 'role', 'content'],
        },
        response: {
          201: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: SessionMessageJsonSchema,
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: Partial<SessionMessage> }>, reply: FastifyReply) => {
      try {
        const data = request.body;
        const newItem = await dataProvider.createSessionMessage(
          data as Omit<SessionMessage, 'id' | 'created_at' | 'updated_at'>,
        );

        const response: ApiResponse<SessionMessage> = {
          success: true,
          data: newItem,
        };
        return reply.status(201).send(response);
      } catch (error) {
        const response: ApiResponse = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
        return reply.status(500).send(response);
      }
    },
  );

  // Agent Tasks Routes
  fastify.get(
    '/agent_tasks',
    {
      schema: {
        description: 'Get all agent tasks',
        tags: ['agent_tasks'],
        querystring: QueryParamsJsonSchema,
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'array',
                items: AgentTaskJsonSchema,
              },
              pagination: {
                type: 'object',
                properties: {
                  total: { type: 'number' },
                  limit: { type: 'number' },
                  offset: { type: 'number' },
                  has_more: { type: 'boolean' },
                },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Querystring: QueryParams }>, reply: FastifyReply) => {
      try {
        const params = request.query;
        const { items, total } = await dataProvider.getAgentTasks(params);

        const response: PaginatedResponse<AgentTask> = {
          success: true,
          data: items,
          pagination: {
            total,
            limit: params.limit || 50,
            offset: params.offset || 0,
            has_more: (params.offset || 0) + (params.limit || 50) < total,
          },
        };

        return reply.send(response);
      } catch (error) {
        const response: ApiResponse = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
        return reply.status(500).send(response);
      }
    },
  );

  fastify.get(
    '/agent_tasks/:id',
    {
      schema: {
        description: 'Get a specific agent task',
        tags: ['agent_tasks'],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: AgentTaskJsonSchema,
            },
          },
          404: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      try {
        const { id } = request.params;
        const item = await dataProvider.getAgentTask(id);

        if (!item) {
          const response: ApiResponse = {
            success: false,
            error: 'Agent task not found',
          };
          return reply.status(404).send(response);
        }

        const response: ApiResponse<AgentTask> = {
          success: true,
          data: item,
        };
        return reply.send(response);
      } catch (error) {
        const response: ApiResponse = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
        return reply.status(500).send(response);
      }
    },
  );

  fastify.post(
    '/agent_tasks',
    {
      schema: {
        description: 'Create a new agent task',
        tags: ['agent_tasks'],
        body: {
          type: 'object',
          properties: {
            session_id: { type: 'string' },
            agent_id: { type: 'string' },
            task_type: { type: 'string' },
            status: { type: 'string', enum: ['pending', 'running', 'completed', 'failed'] },
            input_data: { type: 'object' },
            output_data: { type: 'object' },
            error_message: { type: 'string' },
            progress: { type: 'number', minimum: 0, maximum: 100 },
          },
          required: ['session_id', 'agent_id', 'task_type', 'status'],
        },
        response: {
          201: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: AgentTaskJsonSchema,
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: Partial<AgentTask> }>, reply: FastifyReply) => {
      try {
        const data = request.body;
        const newItem = await dataProvider.createAgentTask(
          data as Omit<AgentTask, 'id' | 'created_at' | 'updated_at'>,
        );

        const response: ApiResponse<AgentTask> = {
          success: true,
          data: newItem,
        };
        return reply.status(201).send(response);
      } catch (error) {
        const response: ApiResponse = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
        return reply.status(500).send(response);
      }
    },
  );

  // Opencode Events Routes
  fastify.get(
    '/opencode_events',
    {
      schema: {
        description: 'Get all opencode events',
        tags: ['opencode_events'],
        querystring: QueryParamsJsonSchema,
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'array',
                items: OpencodeEventJsonSchema,
              },
              pagination: {
                type: 'object',
                properties: {
                  total: { type: 'number' },
                  limit: { type: 'number' },
                  offset: { type: 'number' },
                  has_more: { type: 'boolean' },
                },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Querystring: QueryParams }>, reply: FastifyReply) => {
      try {
        const params = request.query;
        const { items, total } = await dataProvider.getOpencodeEvents(params);

        const response: PaginatedResponse<OpencodeEvent> = {
          success: true,
          data: items,
          pagination: {
            total,
            limit: params.limit || 50,
            offset: params.offset || 0,
            has_more: (params.offset || 0) + (params.limit || 50) < total,
          },
        };

        return reply.send(response);
      } catch (error) {
        const response: ApiResponse = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
        return reply.status(500).send(response);
      }
    },
  );

  fastify.get(
    '/opencode_events/:id',
    {
      schema: {
        description: 'Get a specific opencode event',
        tags: ['opencode_events'],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: OpencodeEventJsonSchema,
            },
          },
          404: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      try {
        const { id } = request.params;
        const item = await dataProvider.getOpencodeEvent(id);

        if (!item) {
          const response: ApiResponse = {
            success: false,
            error: 'Opencode event not found',
          };
          return reply.status(404).send(response);
        }

        const response: ApiResponse<OpencodeEvent> = {
          success: true,
          data: item,
        };
        return reply.send(response);
      } catch (error) {
        const response: ApiResponse = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
        return reply.status(500).send(response);
      }
    },
  );

  fastify.post(
    '/opencode_events',
    {
      schema: {
        description: 'Create a new opencode event',
        tags: ['opencode_events'],
        body: {
          type: 'object',
          properties: {
            session_id: { type: 'string' },
            event_type: { type: 'string' },
            event_data: { type: 'object' },
            source: { type: 'string' },
            severity: { type: 'string', enum: ['info', 'warning', 'error', 'debug'] },
          },
          required: ['event_type', 'event_data', 'source'],
        },
        response: {
          201: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: OpencodeEventJsonSchema,
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: Partial<OpencodeEvent> }>, reply: FastifyReply) => {
      try {
        const data = request.body;
        const newItem = await dataProvider.createOpencodeEvent(
          data as Omit<OpencodeEvent, 'id' | 'created_at' | 'updated_at'>,
        );

        const response: ApiResponse<OpencodeEvent> = {
          success: true,
          data: newItem,
        };
        return reply.status(201).send(response);
      } catch (error) {
        const response: ApiResponse = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
        return reply.status(500).send(response);
      }
    },
  );
}

export default collectionRoutes;
