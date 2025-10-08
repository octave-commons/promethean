import { exec } from 'child_process';
import { promisify } from 'util';
import { BaseAdapter } from './base-adapter';
import { Task, TaskSource, TaskTarget } from '../../types';

const execAsync = promisify(exec);

export class KanbanAdapter extends BaseAdapter {
  constructor(config: TaskSource | TaskTarget) {
    super(config);
  }

  async getTasks(options?: { status?: string; maxTasks?: number }): Promise<Task[]> {
    const { status, maxTasks } = options || {};

    try {
      let command = 'pnpm kanban search --format json';

      if (status) {
        command += ` --status ${status}`;
      }

      const { stdout } = await execAsync(command);
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
      const command = `pnpm kanban getByColumn ${column} --format json`;
      const { stdout } = await execAsync(command);
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
    const filePath = `${this.config.config.tasksDir}/${fileName}.md`;

    try {
      await execAsync(`mkdir -p ${this.config.config.tasksDir}`);
      await execAsync(`cat > "${filePath}" << 'EOF'\n${taskContent}\nEOF`);

      // Regenerate the board
      await execAsync('pnpm kanban regenerate');

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
    const filePath = `${this.config.config.tasksDir}/${fileName}`;

    try {
      await execAsync(`cat > "${filePath}" << 'EOF'\n${taskContent}\nEOF`);
      await execAsync('pnpm kanban regenerate');

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

    const filePath = `${this.config.config.tasksDir}/${fileName}`;

    try {
      await execAsync(`rm "${filePath}"`);
      await execAsync('pnpm kanban regenerate');
      return true;
    } catch (error) {
      console.error(`Error deleting kanban task:`, error);
      return false;
    }
  }

  async getTaskById(taskId: string): Promise<Task | null> {
    try {
      const { stdout } = await execAsync(`pnpm kanban search --uuid ${taskId} --format json`);
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
      await execAsync('pnpm kanban count');
      return true;
    } catch (error) {
      console.error(`Kanban connection test failed:`, error);
      return false;
    }
  }

  private generateTaskFileContent(task: Task): string {
    const labels = task.labels.map(label => `  - ${label}`).join('\n');
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