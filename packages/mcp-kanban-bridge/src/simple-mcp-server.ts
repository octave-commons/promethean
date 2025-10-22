#!/usr/bin/env node

/**
 * Simple MCP-Kanban Bridge Server
 *
 * Focused MCP server that provides kanban operations with proper function signatures
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
  loadKanbanConfig,
  getColumn,
  findTaskById,
  updateStatus,
  moveTask,
  searchTasks,
  createTask,
  deleteTask,
  updateTaskDescription,
  renameTask,
  analyzeTask,
  breakdownTask,
} from '@promethean/kanban';
import type { Task, Board } from '@promethean/kanban';
import { z } from 'zod';

// Helper to get board context
async function getKanbanContext() {
  const { config } = await loadKanbanConfig();
  return {
    board: await loadBoard(config.boardFile, config.tasksDir),
    boardFile: config.boardFile,
    tasksDir: config.tasksDir,
  };
}

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

const AnalyzeTaskSchema = z.object({
  uuid: z.string().describe('Task UUID'),
  analysisType: z
    .enum(['complexity', 'quality', 'breakdown', 'dependencies'])
    .optional()
    .describe('Type of analysis to perform'),
  context: z.string().optional().describe('Additional context for analysis'),
});

const BreakdownTaskSchema = z.object({
  uuid: z.string().describe('Task UUID'),
  breakdownType: z
    .enum(['subtasks', 'steps', 'components'])
    .optional()
    .describe('Type of breakdown to perform'),
  maxSubtasks: z.number().optional().describe('Maximum number of subtasks to generate'),
  complexity: z.enum(['low', 'medium', 'high']).optional().describe('Expected complexity level'),
});

class SimpleMCPKanbanServer {
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
          description: 'Get entire kanban board overview',
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
        {
          name: 'kanban_analyze_task',
          description: 'AI-powered analysis of a task',
          inputSchema: {
            type: 'object',
            properties: {
              uuid: {
                type: 'string',
                description: 'Task UUID',
              },
              analysisType: {
                type: 'string',
                enum: ['complexity', 'quality', 'breakdown', 'dependencies'],
                description: 'Type of analysis to perform',
              },
              context: {
                type: 'string',
                description: 'Additional context for analysis',
              },
            },
            required: ['uuid'],
          },
        },
        {
          name: 'kanban_breakdown_task',
          description: 'AI-powered breakdown of a task into subtasks',
          inputSchema: {
            type: 'object',
            properties: {
              uuid: {
                type: 'string',
                description: 'Task UUID',
              },
              breakdownType: {
                type: 'string',
                enum: ['subtasks', 'steps', 'components'],
                description: 'Type of breakdown to perform',
              },
              maxSubtasks: {
                type: 'number',
                description: 'Maximum number of subtasks to generate',
              },
              complexity: {
                type: 'string',
                enum: ['low', 'medium', 'high'],
                description: 'Expected complexity level',
              },
            },
            required: ['uuid'],
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
          case 'kanban_analyze_task':
            return await this.handleAnalyzeTask(args);
          case 'kanban_breakdown_task':
            return await this.handleBreakdownTask(args);
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
      const { board, boardFile, tasksDir } = await getKanbanContext();
      const task = await createTask(
        board,
        parsed.status || 'incoming',
        {
          title: parsed.title,
          content: parsed.content,
          priority: parsed.priority,
          labels: parsed.labels,
        },
        tasksDir,
        boardFile,
      );

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
      const { board } = await getKanbanContext();
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
      const { board } = await getKanbanContext();
      const task = await findTaskById(board, parsed.uuid);

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
      const { board, boardFile, tasksDir } = await getKanbanContext();

      // Update different aspects of task
      if (parsed.title) {
        await renameTask(board, parsed.uuid, parsed.title, tasksDir, boardFile);
      }

      if (parsed.content) {
        await updateTaskDescription(board, parsed.uuid, parsed.content, tasksDir, boardFile);
      }

      if (parsed.status) {
        await updateStatus(board, parsed.uuid, parsed.status, boardFile, tasksDir);
      }

      // Get updated task
      const updatedTask = await findTaskById(board, parsed.uuid);

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
      const { board, boardFile } = await getKanbanContext();
      await moveTask(board, parsed.uuid, parsed.direction, boardFile);

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
      const { board, boardFile, tasksDir } = await getKanbanContext();
      await updateStatus(board, parsed.uuid, parsed.status, boardFile, tasksDir);

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
      const { board } = await getKanbanContext();
      const searchResult = await searchTasks(board, parsed.query);

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
      const { board } = await getKanbanContext();
      const columnData = await getColumn(board, parsed.column);

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
      const { board, boardFile, tasksDir } = await getKanbanContext();
      await deleteTask(board, parsed.uuid, tasksDir, boardFile);

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
      const { board } = await getKanbanContext();

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

  private async handleAnalyzeTask(args: unknown) {
    const parsed = AnalyzeTaskSchema.parse(args);

    try {
      const { board, tasksDir, boardFile } = await getKanbanContext();
      const result = await analyzeTask(
        board,
        parsed.uuid,
        parsed.analysisType || ('complexity' as any),
        tasksDir,
        boardFile,
        parsed.context,
        {},
      );

      if (!result) {
        throw new McpError(ErrorCode.InternalError, 'Analysis failed or returned no result');
      }

      return {
        content: [
          {
            type: 'text',
            text: `✅ Task analysis completed for UUID ${parsed.uuid}`,
          },
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error: any) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to analyze task: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  private async handleBreakdownTask(args: unknown) {
    const parsed = BreakdownTaskSchema.parse(args);

    try {
      const { board, tasksDir, boardFile } = await getKanbanContext();
      const result = await breakdownTask(
        board,
        parsed.uuid,
        parsed.breakdownType || 'subtasks',
        tasksDir,
        boardFile,
        {
          maxSubtasks: parsed.maxSubtasks,
          complexity: parsed.complexity,
        },
      );

      if (!result) {
        throw new McpError(ErrorCode.InternalError, 'Breakdown failed or returned no result');
      }

      return {
        content: [
          {
            type: 'text',
            text: `✅ Task breakdown completed for UUID ${parsed.uuid}`,
          },
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error: any) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to breakdown task: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
    console.error('Simple MCP-Kanban Bridge server running on stdio');
  }
}

// Start server
if (require.main === module) {
  const server = new SimpleMCPKanbanServer();
  server.run().catch(console.error);
}

export { SimpleMCPKanbanServer };
