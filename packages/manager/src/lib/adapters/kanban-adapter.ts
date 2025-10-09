import { execFile } from 'child_process';
import type { ExecFileOptions } from 'child_process';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'util';
import { BaseAdapter } from './base-adapter';
import { Task, TaskSource, TaskTarget } from '../../types';

const execFileAsync = promisify(execFile);

const runPnpm = async (args: string[], options: ExecFileOptions = {}) => {
  try {
    const result = (await execFileAsync('pnpm', args, {
      encoding: 'utf8',
      ...options
    })) as { stdout: string; stderr: string };

    return result.stdout;
  } catch (error) {
    const execError = error as Error & { stderr?: string };
    if (execError.stderr) {
      execError.message = `${execError.message}: ${execError.stderr}`;
    }

    throw execError;
  }
};

export class KanbanAdapter extends BaseAdapter {
  constructor(config: TaskSource | TaskTarget) {
    super(config);
  }

  async getTasks(options?: { status?: string; maxTasks?: number }): Promise<Task[]> {
    const { status, maxTasks } = options || {};

    try {
      const args = ['kanban', 'search', '--format', 'json'];
      const normalizedStatus = status?.trim();

      if (normalizedStatus) {
        args.push('--status', normalizedStatus);
      }

      const stdout = await runPnpm(args);
      const result = JSON.parse(stdout);

      let tasks = result.similar || [];

      if (maxTasks) {
        tasks = tasks.slice(0, maxTasks);
      }

      return tasks.map((task: any) => this.normalizeTask(task, 'kanban'));
    } catch (error) {
      console.error(`Error fetching kanban tasks:`, error);
      return [];
    }
  }

  async getTasksByColumn(column: string): Promise<Task[]> {
    try {
      const stdout = await runPnpm([
        'kanban',
        'getByColumn',
        column.trim(),
        '--format',
        'json'
      ]);
      const tasks = JSON.parse(stdout);

      return tasks.map((task: any) => this.normalizeTask(task, 'kanban'));
    } catch (error) {
      console.error(`Error fetching kanban tasks from column '${column}':`, error);
      return [];
    }
  }

  async createTask(task: Task): Promise<Task> {
    // Kanban tasks are files - we need to create markdown files
    const taskContent = this.generateTaskFileContent(task);
    const fileName = this.generateTaskFileName(task);
    const tasksDir = path.resolve(this.config.config.tasksDir);
    const filePath = path.join(tasksDir, `${fileName}.md`);

    try {
      await mkdir(tasksDir, { recursive: true });
      await writeFile(filePath, taskContent, 'utf8');

      // Regenerate the board
      await runPnpm(['kanban', 'regenerate']);

      return task;
    } catch (error) {
      console.error(`Error creating kanban task:`, error);
      throw error;
    }
  }

  async updateTask(task: Task): Promise<Task> {
    // Find existing task file and update it
    const existingTask = await this.findTaskByUuid(task.uuid);
    if (!existingTask) {
      throw new Error(`Task with UUID ${task.uuid} not found`);
    }

    const fileName = this.findTaskFileName(task.uuid);
    if (!fileName) {
      throw new Error(`Task file for UUID ${task.uuid} not found`);
    }

    const taskContent = this.generateTaskFileContent(task);
    const tasksDir = path.resolve(this.config.config.tasksDir);
    const filePath = path.join(tasksDir, fileName);

    try {
      await writeFile(filePath, taskContent, 'utf8');
      await runPnpm(['kanban', 'regenerate']);

      return task;
    } catch (error) {
      console.error(`Error updating kanban task:`, error);
      throw error;
    }
  }

  async deleteTask(taskId: string): Promise<boolean> {
    const fileName = this.findTaskFileName(taskId);
    if (!fileName) {
      return false;
    }

    const tasksDir = path.resolve(this.config.config.tasksDir);
    const filePath = path.join(tasksDir, fileName);

    try {
      await rm(filePath, { force: true });
      await runPnpm(['kanban', 'regenerate']);
      return true;
    } catch (error) {
      console.error(`Error deleting kanban task:`, error);
      return false;
    }
  }

  async getTaskById(taskId: string): Promise<Task | null> {
    try {
      const stdout = await runPnpm([
        'kanban',
        'search',
        '--uuid',
        taskId.trim(),
        '--format',
        'json'
      ]);
      const result = JSON.parse(stdout);

      if (result.exact && result.exact.length > 0) {
        return this.normalizeTask(result.exact[0], 'kanban');
      }

      return null;
    } catch (error) {
      console.error(`Error fetching kanban task by ID:`, error);
      return null;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await runPnpm(['kanban', 'count']);
      return true;
    } catch (error) {
      console.error(`Kanban connection test failed:`, error);
      return false;
    }
  }

  private generateTaskFileContent(task: Task): string {
    const labels = (task.labels ?? []).map(label => `  - ${label}`).join('\n');
    const estimates = task.estimates ?
      Object.entries(task.estimates).map(([key, value]) => `  ${key}: ${value}`).join('\n') : '';

    return `---
uuid: ${task.uuid}
title: ${task.title}
status: ${task.status}
priority: ${task.priority}
labels:
${labels}
created_at: '${task.created_at}'
${task.updated_at ? `updated_at: '${task.updated_at}'` : ''}
${estimates ? `estimates:\n${estimates}` : ''}
---

${task.content || ''}
`;
  }

  private generateTaskFileName(task: Task): string {
    // Generate a filename from the title, similar to how kanban does it
    return task.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
  }

  private async findTaskByUuid(uuid: string): Promise<Task | null> {
    return this.getTaskById(uuid);
  }

  private findTaskFileName(uuid: string): string | null {
    // This would require scanning the tasks directory for files containing the UUID
    // For now, we'll use a simplified approach
    return null; // Would need to implement file system search
  }
}