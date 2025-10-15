#!/usr/bin/env node

/**
 * MCP-Kanban Bridge Server
 *
 * Model Context Protocol server that exposes kanban operations as MCP tools
 * Enables AI assistants to manipulate kanban boards through standardized protocol
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

import {
  loadBoard,
  getColumn,
  findTaskById,
  findTaskByTitle,
  updateStatus,
  moveTask,
  syncBoardAndTasks,
  searchTasks,
  createTask,
  deleteTask,
  updateTaskDescription,
  renameTask,
  columnKey,
} from '@promethean/kanban';
import type { Task, Board } from '@promethean/kanban';
import { z } from 'zod';

// Zod schemas for input validation
const CreateTaskSchema = z.object({
  title: z.string().min(1).describe('Task title'),
  content: z.string().optional().describe('Task description/content'),
  priority: z.enum(['P0', 'P1', 'P2', 'P3']).optional().describe('Task priority'),
  status: z.string().optional().describe('Initial status (default: incoming)'),
  labels: z.array(z.string()).optional().describe('Task labels/tags'),
});

const UpdateTaskSchema = z.object({
  uuid: z.string().describe('Task UUID'),
  title: z.string().optional().describe('New task title'),
  content: z.string().optional().describe('New task description'),
  priority: z.enum(['P0', 'P1', 'P2', 'P3']).optional().describe('New priority'),
  status: z.string().optional().describe('New status'),
  labels: z.array(z.string()).optional().describe('New labels'),
});

const MoveTaskSchema = z.object({
  uuid: z.string().describe('Task UUID'),
  direction: z.enum(['up', 'down']).describe('Direction to move task'),
});

const SearchTasksSchema = z.object({
  query: z.string().describe('Search query'),
  limit: z.number().optional().describe('Maximum results to return'),
});

const GetColumnSchema = z.object({
  column: z.string().describe('Column name'),
  format: z.enum(['json', 'markdown']).optional().describe('Output format'),
});

class MCPKanbanServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'mcp-kanban-bridge',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      },
    );

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'kanban_create_task',
          description: 'Create a new kanban task',
          inputSchema: {
            type: 'object',
            properties: {
              title: {
                type: 'string',
                description: 'Task title',
              },
              content: {
                type: 'string',
                description: 'Task description/content',
              },
              priority: {
                type: 'string',
                enum: ['P0', 'P1', 'P2', 'P3'],
                description: 'Task priority',
              },
              status: {
                type: 'string',
                description: 'Initial status (default: incoming)',
              },
              labels: {
                type: 'array',
                items: { type: 'string' },
                description: 'Task labels/tags',
              },
            },
            required: ['title'],
          },
        },
        {
          name: 'kanban_list_tasks',
          description: 'List all kanban tasks',
          inputSchema: {
            type: 'object',
            properties: {
              status: {
                type: 'string',
                description: 'Filter by status column',
              },
              limit: {
                type: 'number',
                description: 'Maximum number of tasks to return',
              },
            },
          },
        },
        {
          name: 'kanban_get_task',
          description: 'Get details of a specific task',
          inputSchema: {
            type: 'object',
            properties: {
              uuid: {
                type: 'string',
                description: 'Task UUID',
              },
            },
            required: ['uuid'],
          },
        },
        {
          name: 'kanban_update_task',
          description: 'Update an existing task',
          inputSchema: {
            type: 'object',
            properties: {
              uuid: {
                type: 'string',
                description: 'Task UUID',
              },
              title: {
                type: 'string',
                description: 'New task title',
              },
              content: {
                type: 'string',
                description: 'New task description',
              },
              priority: {
                type: 'string',
                enum: ['P0', 'P1', 'P2', 'P3'],
                description: 'New priority',
              },
              status: {
                type: 'string',
                description: 'New status',
              },
              labels: {
                type: 'array',
                items: { type: 'string' },
                description: 'New labels',
              },
            },
            required: ['uuid'],
          },
        },
        {
          name: 'kanban_move_task',
          description: 'Move a task up or down within its column',
          inputSchema: {
            type: 'object',
            properties: {
              uuid: {
                type: 'string',
                description: 'Task UUID',
              },
              direction: {
                type: 'string',
                enum: ['up', 'down'],
                description: 'Direction to move task',
              },
            },
            required: ['uuid', 'direction'],
          },
        },
        {
          name: 'kanban_update_status',
          description: 'Update task status (move to different column)',
          inputSchema: {
            type: 'object',
            properties: {
              uuid: {
                type: 'string',
                description: 'Task UUID',
              },
              status: {
                type: 'string',
                description: 'New status/column',
              },
            },
            required: ['uuid', 'status'],
          },
        },
        {
          name: 'kanban_search_tasks',
          description: 'Search for tasks by title or content',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Search query',
              },
              limit: {
                type: 'number',
                description: 'Maximum results to return',
              },
            },
            required: ['query'],
          },
        },
        {
          name: 'kanban_get_column',
          description: 'Get all tasks in a specific column',
          inputSchema: {
            type: 'object',
            properties: {
              column: {
                type: 'string',
                description: 'Column name',
              },
              format: {
                type: 'string',
                enum: ['json', 'markdown'],
                description: 'Output format',
              },
            },
            required: ['column'],
          },
        },
        {
          name: 'kanban_delete_task',
          description: 'Delete a task',
          inputSchema: {
            type: 'object',
            properties: {
              uuid: {
                type: 'string',
                description: 'Task UUID',
              },
            },
            required: ['uuid'],
          },
        },
        {
          name: 'kanban_get_board',
          description: 'Get the entire kanban board overview',
          inputSchema: {
            type: 'object',
            properties: {
              format: {
                type: 'string',
                enum: ['json', 'markdown'],
                description: 'Output format',
              },
            },
          },
        },
      ],
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'kanban_create_task':
            return await this.handleCreateTask(args);
          case 'kanban_list_tasks':
            return await this.handleListTasks(args);
          case 'kanban_get_task':
            return await this.handleGetTask(args);
          case 'kanban_update_task':
            return await this.handleUpdateTask(args);
          case 'kanban_move_task':
            return await this.handleMoveTask(args);
          case 'kanban_update_status':
            return await this.handleUpdateStatus(args);
          case 'kanban_search_tasks':
            return await this.handleSearchTasks(args);
          case 'kanban_get_column':
            return await this.handleGetColumn(args);
          case 'kanban_delete_task':
            return await this.handleDeleteTask(args);
          case 'kanban_get_board':
            return await this.handleGetBoard(args);
          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }
      } catch (error: any) {
        if (error instanceof McpError) {
          throw error;
        }

        console.error(`Error in ${name}:`, error);
        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    });
  }

  private async handleCreateTask(args: unknown) {
    const parsed = CreateTaskSchema.parse(args);

    try {
      const task = await createTask({
        title: parsed.title,
        content: parsed.content,
        priority: parsed.priority,
        status: parsed.status || 'incoming',
        labels: parsed.labels,
      });

      return {
        content: [
          {
            type: 'text',
            text: `✅ Task created successfully\n\n**UUID:** ${task.uuid}\n**Title:** ${task.title}\n**Status:** ${task.status}${parsed.priority ? `\n**Priority:** ${parsed.priority}` : ''}`,
          },
          {
            type: 'text',
            text: JSON.stringify(task, null, 2),
          },
        ],
      };
    } catch (error: any) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to create task: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  private async handleListTasks(args: unknown) {
    const parsed = z
      .object({
        status: z.string().optional(),
        limit: z.number().optional(),
      })
      .parse(args);

    try {
      const board = await loadBoard();
      let allTasks: Task[] = [];

      // Collect all tasks from all columns
      for (const column of board.columns) {
        if (parsed.status && column.name !== parsed.status) {
          continue;
        }
        allTasks = allTasks.concat(column.tasks);
      }

      // Apply limit if specified
      if (parsed.limit) {
        allTasks = allTasks.slice(0, parsed.limit);
      }

      const summary = `Found ${allTasks.length} task${allTasks.length !== 1 ? 's' : ''}${parsed.status ? ` in status "${parsed.status}"` : ''}`;

      return {
        content: [
          {
            type: 'text',
            text: summary,
          },
          {
            type: 'text',
            text: JSON.stringify(allTasks, null, 2),
          },
        ],
      };
    } catch (error: any) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to list tasks: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  private async handleGetTask(args: unknown) {
    const parsed = z
      .object({
        uuid: z.string(),
      })
      .parse(args);

    try {
      const task = await findTaskById(parsed.uuid);

      if (!task) {
        throw new McpError(ErrorCode.InvalidRequest, `Task with UUID ${parsed.uuid} not found`);
      }

      return {
        content: [
          {
            type: 'text',
            text: `**Task Details:**\n\n**Title:** ${task.title}\n**UUID:** ${task.uuid}\n**Status:** ${task.status}\n**Priority:** ${task.priority || 'Not set'}\n**Created:** ${task.created_at}\n\n**Description:**\n${task.content || 'No description'}`,
          },
          {
            type: 'text',
            text: JSON.stringify(task, null, 2),
          },
        ],
      };
    } catch (error: any) {
      if (error instanceof McpError) {
        throw error;
      }
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to get task: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  private async handleUpdateTask(args: unknown) {
    const parsed = UpdateTaskSchema.parse(args);

    try {
      // Update different aspects of the task
      if (parsed.title) {
        await renameTask(parsed.uuid, parsed.title);
      }

      if (parsed.content) {
        await updateTaskDescription(parsed.uuid, parsed.content);
      }

      if (parsed.status) {
        await updateStatus(parsed.uuid, parsed.status);
      }

      // Get the updated task
      const updatedTask = await findTaskById(parsed.uuid);

      if (!updatedTask) {
        throw new McpError(
          ErrorCode.InvalidRequest,
          `Task with UUID ${parsed.uuid} not found after update`,
        );
      }

      return {
        content: [
          {
            type: 'text',
            text: `✅ Task updated successfully\n\n**UUID:** ${updatedTask.uuid}\n**Title:** ${updatedTask.title}\n**Status:** ${updatedTask.status}`,
          },
          {
            type: 'text',
            text: JSON.stringify(updatedTask, null, 2),
          },
        ],
      };
    } catch (error: any) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to update task: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  private async handleMoveTask(args: unknown) {
    const parsed = MoveTaskSchema.parse(args);

    try {
      await moveTask(parsed.uuid, parsed.direction);

      return {
        content: [
          {
            type: 'text',
            text: `✅ Task moved ${parsed.direction} successfully`,
          },
        ],
      };
    } catch (error: any) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to move task: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  private async handleUpdateStatus(args: unknown) {
    const parsed = z
      .object({
        uuid: z.string(),
        status: z.string(),
      })
      .parse(args);

    try {
      await updateStatus(parsed.uuid, parsed.status);

      return {
        content: [
          {
            type: 'text',
            text: `✅ Task status updated to "${parsed.status}" successfully`,
          },
        ],
      };
    } catch (error: any) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to update status: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  private async handleSearchTasks(args: unknown) {
    const parsed = SearchTasksSchema.parse(args);

    try {
      const searchResult = await searchTasks(parsed.query);

      // Combine exact and similar results
      const allTasks = [...searchResult.exact, ...searchResult.similar];

      // Apply limit if specified
      if (parsed.limit) {
        allTasks.splice(parsed.limit);
      }

      const summary = `Found ${allTasks.length} task${allTasks.length !== 1 ? 's' : ''} matching "${parsed.query}"`;

      return {
        content: [
          {
            type: 'text',
            text: summary,
          },
          {
            type: 'text',
            text: JSON.stringify(allTasks, null, 2),
          },
        ],
      };
    } catch (error: any) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to search tasks: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  private async handleGetColumn(args: unknown) {
    const parsed = GetColumnSchema.parse(args);

    try {
      const columnData = await getColumn(parsed.column);

      if (parsed.format === 'markdown') {
        const markdown = this.formatColumnAsMarkdown(columnData);
        return {
          content: [
            {
              type: 'text',
              text: markdown,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: `Column "${parsed.column}" contains ${columnData.count} task${columnData.count !== 1 ? 's' : ''}`,
          },
          {
            type: 'text',
            text: JSON.stringify(columnData, null, 2),
          },
        ],
      };
    } catch (error: any) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to get column: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  private async handleDeleteTask(args: unknown) {
    const parsed = z
      .object({
        uuid: z.string(),
      })
      .parse(args);

    try {
      await deleteTask(parsed.uuid);

      return {
        content: [
          {
            type: 'text',
            text: `✅ Task deleted successfully`,
          },
        ],
      };
    } catch (error: any) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to delete task: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  private async handleGetBoard(args: unknown) {
    const parsed = z
      .object({
        format: z.enum(['json', 'markdown']).optional(),
      })
      .parse(args);

    try {
      const board = await loadBoard();

      if (parsed.format === 'markdown') {
        const markdown = this.formatBoardAsMarkdown(board);
        return {
          content: [
            {
              type: 'text',
              text: markdown,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: `Board overview with ${board.columns.length} columns`,
          },
          {
            type: 'text',
            text: JSON.stringify(board, null, 2),
          },
        ],
      };
    } catch (error: any) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to get board: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  private formatColumnAsMarkdown(columnData: any): string {
    let markdown = `# ${columnData.name} (${columnData.count})\n\n`;

    for (const task of columnData.tasks) {
      const priority = task.priority ? ` **[${task.priority}]**` : '';
      const labels =
        task.labels && task.labels.length > 0
          ? ` ${task.labels.map((l: string) => `\`${l}\``).join(' ')}`
          : '';
      markdown += `## ${task.title}${priority}${labels}\n\n`;
      markdown += `**UUID:** \`${task.uuid}\`\n\n`;
      if (task.content) {
        markdown += `${task.content}\n\n`;
      }
      markdown += `---\n\n`;
    }

    return markdown;
  }

  private formatBoardAsMarkdown(board: Board): string {
    let markdown = `# Kanban Board Overview\n\n`;

    for (const column of board.columns) {
      markdown += `## ${column.name} (${column.count})\n\n`;

      for (const task of column.tasks.slice(0, 5)) {
        // Show first 5 tasks
        const priority = task.priority ? ` [${task.priority}]` : '';
        markdown += `- **${task.title}**${priority} (\`${task.uuid}\`)\n`;
      }

      if (column.tasks.length > 5) {
        markdown += `- ... and ${column.tasks.length - 5} more\n`;
      }

      markdown += `\n`;
    }

    return markdown;
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('MCP-Kanban Bridge server running on stdio');
  }
}

// Start the server
if (require.main === module) {
  const server = new MCPKanbanServer();
  server.run().catch(console.error);
}

export { MCPKanbanServer };
