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
import {
  SessionMessageSchema,
  AgentTaskSchema,
  OpencodeEventSchema,
  QueryParamsSchema,
} from '../types/index.js';

/**
 * Mock data store - in a real implementation, this would connect to a database
 */
class MockDataStore {
  private sessionMessages: SessionMessage[] = [];
  private agentTasks: AgentTask[] = [];
  private opencodeEvents: OpencodeEvent[] = [];

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData(): void {
    const now = new Date().toISOString();

    // Add some mock session messages
    this.sessionMessages.push(
      {
        id: '1',
        created_at: now,
        updated_at: now,
        session_id: 'session-1',
        role: 'user',
        content: 'Hello, how can you help me today?',
      },
      {
        id: '2',
        created_at: now,
        updated_at: now,
        session_id: 'session-1',
        role: 'assistant',
        content: 'I can help you with various tasks. What would you like to do?',
      },
    );

    // Add some mock agent tasks
    this.agentTasks.push({
      id: '1',
      created_at: now,
      updated_at: now,
      session_id: 'session-1',
      agent_id: 'agent-1',
      task_type: 'code_generation',
      status: 'completed',
      progress: 100,
      input_data: { prompt: 'Create a hello world function' },
      output_data: { code: 'function hello() { console.log("Hello, World!"); }' },
    });

    // Add some mock opencode events
    this.opencodeEvents.push({
      id: '1',
      created_at: now,
      updated_at: now,
      session_id: 'session-1',
      event_type: 'tool_call',
      event_data: { tool: 'file_editor', action: 'create_file' },
      source: 'opencode',
      severity: 'info',
    });
  }

  // Session Messages
  async getSessionMessages(
    params: QueryParams,
  ): Promise<{ items: SessionMessage[]; total: number }> {
    let filtered = [...this.sessionMessages];

    // Apply filters
    if (params.session_id) {
      filtered = filtered.filter((item) => item.session_id === params.session_id);
    }

    if (params.created_after) {
      filtered = filtered.filter((item) => item.created_at >= params.created_after!);
    }

    if (params.created_before) {
      filtered = filtered.filter((item) => item.created_at <= params.created_before!);
    }

    // Apply sorting
    const sortBy = params.sort_by || 'created_at';
    const sortOrder = params.sort_order || 'desc';
    filtered.sort((a, b) => {
      const aValue = (a as any)[sortBy];
      const bValue = (b as any)[sortBy];

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Apply pagination
    const total = filtered.length;
    const offset = params.offset || 0;
    const limit = params.limit || 50;
    const items = filtered.slice(offset, offset + limit);

    return { items, total };
  }

  async getSessionMessage(id: string): Promise<SessionMessage | null> {
    const item = this.sessionMessages.find((item) => item.id === id);
    return item || null;
  }

  async createSessionMessage(
    data: Omit<SessionMessage, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<SessionMessage> {
    const now = new Date().toISOString();
    const newMessage: SessionMessage = {
      id: (this.sessionMessages.length + 1).toString(),
      created_at: now,
      updated_at: now,
      ...data,
    };
    this.sessionMessages.push(newMessage);
    return newMessage;
  }

  async updateSessionMessage(
    id: string,
    data: Partial<SessionMessage>,
  ): Promise<SessionMessage | null> {
    const index = this.sessionMessages.findIndex((item) => item.id === id);
    if (index === -1) return null;

    const existing = this.sessionMessages[index];
    if (!existing) return null;

    this.sessionMessages[index] = {
      id: existing.id,
      session_id: data.session_id ?? existing.session_id,
      role: data.role ?? existing.role,
      content: data.content ?? existing.content,
      created_at: existing.created_at,
      updated_at: new Date().toISOString(),
      metadata: data.metadata ?? existing.metadata,
    };
    return this.sessionMessages[index];
  }

  async deleteSessionMessage(id: string): Promise<boolean> {
    const index = this.sessionMessages.findIndex((item) => item.id === id);
    if (index === -1) return false;

    this.sessionMessages.splice(index, 1);
    return true;
  }

  // Agent Tasks
  async getAgentTasks(params: QueryParams): Promise<{ items: AgentTask[]; total: number }> {
    let filtered = [...this.agentTasks];

    // Apply filters
    if (params.session_id) {
      filtered = filtered.filter((item) => item.session_id === params.session_id);
    }

    if (params.created_after) {
      filtered = filtered.filter((item) => item.created_at >= params.created_after!);
    }

    if (params.created_before) {
      filtered = filtered.filter((item) => item.created_at <= params.created_before!);
    }

    // Apply sorting
    const sortBy = params.sort_by || 'created_at';
    const sortOrder = params.sort_order || 'desc';
    filtered.sort((a, b) => {
      const aValue = (a as any)[sortBy];
      const bValue = (b as any)[sortBy];

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Apply pagination
    const total = filtered.length;
    const offset = params.offset || 0;
    const limit = params.limit || 50;
    const items = filtered.slice(offset, offset + limit);

    return { items, total };
  }

  async getAgentTask(id: string): Promise<AgentTask | null> {
    return this.agentTasks.find((item) => item.id === id) || null;
  }

  async createAgentTask(
    data: Omit<AgentTask, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<AgentTask> {
    const now = new Date().toISOString();
    const newTask: AgentTask = {
      id: (this.agentTasks.length + 1).toString(),
      created_at: now,
      updated_at: now,
      ...data,
    };
    this.agentTasks.push(newTask);
    return newTask;
  }

  async updateAgentTask(id: string, data: Partial<AgentTask>): Promise<AgentTask | null> {
    const index = this.agentTasks.findIndex((item) => item.id === id);
    if (index === -1) return null;

    const existing = this.agentTasks[index];
    if (!existing) return null;

    this.agentTasks[index] = {
      id: existing.id,
      session_id: data.session_id ?? existing.session_id,
      agent_id: data.agent_id ?? existing.agent_id,
      task_type: data.task_type ?? existing.task_type,
      status: data.status ?? existing.status,
      created_at: existing.created_at,
      updated_at: new Date().toISOString(),
      input_data: data.input_data ?? existing.input_data,
      output_data: data.output_data ?? existing.output_data,
      error_message: data.error_message ?? existing.error_message,
      progress: data.progress ?? existing.progress,
    };
    return this.agentTasks[index];
  }

  async deleteAgentTask(id: string): Promise<boolean> {
    const index = this.agentTasks.findIndex((item) => item.id === id);
    if (index === -1) return false;

    this.agentTasks.splice(index, 1);
    return true;
  }

  // Opencode Events
  async getOpencodeEvents(params: QueryParams): Promise<{ items: OpencodeEvent[]; total: number }> {
    let filtered = [...this.opencodeEvents];

    // Apply filters
    if (params.session_id) {
      filtered = filtered.filter((item) => item.session_id === params.session_id);
    }

    if (params.created_after) {
      filtered = filtered.filter((item) => item.created_at >= params.created_after!);
    }

    if (params.created_before) {
      filtered = filtered.filter((item) => item.created_at <= params.created_before!);
    }

    // Apply sorting
    const sortBy = params.sort_by || 'created_at';
    const sortOrder = params.sort_order || 'desc';
    filtered.sort((a, b) => {
      const aValue = (a as any)[sortBy];
      const bValue = (b as any)[sortBy];

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Apply pagination
    const total = filtered.length;
    const offset = params.offset || 0;
    const limit = params.limit || 50;
    const items = filtered.slice(offset, offset + limit);

    return { items, total };
  }

  async getOpencodeEvent(id: string): Promise<OpencodeEvent | null> {
    return this.opencodeEvents.find((item) => item.id === id) || null;
  }

  async createOpencodeEvent(
    data: Omit<OpencodeEvent, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<OpencodeEvent> {
    const now = new Date().toISOString();
    const newEvent: OpencodeEvent = {
      id: (this.opencodeEvents.length + 1).toString(),
      created_at: now,
      updated_at: now,
      ...data,
    };
    this.opencodeEvents.push(newEvent);
    return newEvent;
  }

  async updateOpencodeEvent(
    id: string,
    data: Partial<OpencodeEvent>,
  ): Promise<OpencodeEvent | null> {
    const index = this.opencodeEvents.findIndex((item) => item.id === id);
    if (index === -1) return null;

    const existing = this.opencodeEvents[index];
    if (!existing) return null;

    this.opencodeEvents[index] = {
      id: existing.id,
      session_id: data.session_id ?? existing.session_id,
      event_type: data.event_type ?? existing.event_type,
      event_data: data.event_data ?? existing.event_data,
      source: data.source ?? existing.source,
      severity: data.severity ?? existing.severity,
      created_at: existing.created_at,
      updated_at: new Date().toISOString(),
    };
    return this.opencodeEvents[index];
  }

  async deleteOpencodeEvent(id: string): Promise<boolean> {
    const index = this.opencodeEvents.findIndex((item) => item.id === id);
    if (index === -1) return false;

    this.opencodeEvents.splice(index, 1);
    return true;
  }
}

const dataStore = new MockDataStore();

/**
 * Register collection routes
 */
export async function collectionRoutes(fastify: FastifyInstance): Promise<void> {
  // Session Messages Routes
  fastify.get(
    '/session_messages',
    {
      schema: {
        description: 'Get all session messages',
        tags: ['session_messages'],
        querystring: QueryParamsSchema,
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'array',
                items: SessionMessageSchema,
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
        const { items, total } = await dataStore.getSessionMessages(params);

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
              data: SessionMessageSchema,
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
        const item = await dataStore.getSessionMessage(id);

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
        body: SessionMessageSchema.partial().omit({ id: true, created_at: true, updated_at: true }),
        response: {
          201: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: SessionMessageSchema,
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: Partial<SessionMessage> }>, reply: FastifyReply) => {
      try {
        const data = request.body;
        const newItem = await dataStore.createSessionMessage(
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
        querystring: QueryParamsSchema,
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'array',
                items: AgentTaskSchema,
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
        const { items, total } = await dataStore.getAgentTasks(params);

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
              data: AgentTaskSchema,
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
        const item = await dataStore.getAgentTask(id);

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
        body: AgentTaskSchema.partial().omit({ id: true, created_at: true, updated_at: true }),
        response: {
          201: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: AgentTaskSchema,
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: Partial<AgentTask> }>, reply: FastifyReply) => {
      try {
        const data = request.body;
        const newItem = await dataStore.createAgentTask(
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
        querystring: QueryParamsSchema,
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'array',
                items: OpencodeEventSchema,
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
        const { items, total } = await dataStore.getOpencodeEvents(params);

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
              data: OpencodeEventSchema,
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
        const item = await dataStore.getOpencodeEvent(id);

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
        body: OpencodeEventSchema.partial().omit({ id: true, created_at: true, updated_at: true }),
        response: {
          201: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: OpencodeEventSchema,
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: Partial<OpencodeEvent> }>, reply: FastifyReply) => {
      try {
        const data = request.body;
        const newItem = await dataStore.createOpencodeEvent(
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
