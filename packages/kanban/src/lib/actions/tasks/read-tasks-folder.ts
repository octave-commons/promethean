import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { Task } from '../../types.js';

export type ReadTasksFolderInput = {
  tasksPath?: string;
};

export type ReadTasksFolderResult = Task[];

/**
 * Read all task files from the tasks folder and return Task objects
 */
export const readTasksFolder = async (
  input: ReadTasksFolderInput = {},
): Promise<ReadTasksFolderResult> => {
  const { tasksPath = './docs/agile/tasks' } = input;

  try {
    // Check if directory exists
    const stats = await fs.stat(tasksPath);
    if (!stats.isDirectory()) {
      throw new Error(`Tasks path is not a directory: ${tasksPath}`);
    }

    // Read all .md files in the directory
    const files = await fs.readdir(tasksPath);
    const taskFiles = files.filter((file) => file.endsWith('.md'));

    const tasks: Task[] = [];

    for (const file of taskFiles) {
      try {
        const filePath = path.join(tasksPath, file);
        const content = await fs.readFile(filePath, 'utf8');
        
        // Parse frontmatter and content
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
        if (!frontmatterMatch) {
          console.warn(`No frontmatter found in ${file}`);
          continue;
        }

        const [, frontmatterStr, taskContent] = frontmatterMatch;
        
        // Simple YAML parsing for basic frontmatter
        const frontmatter: Record<string, any> = {};
        frontmatterStr.split('\n').forEach((line) => {
          const match = line.match(/^(\w+):\s*(.+)$/);
          if (match) {
            const [, key, value] = match;
            // Remove quotes if present
            frontmatter[key] = value.replace(/^["']|["']$/g, '');
          }
        });

        // Create Task object
        const task: Task = {
          uuid: frontmatter.uuid || '',
          title: frontmatter.title || '',
          status: frontmatter.status || 'backlog',
          priority: frontmatter.priority || 'medium',
          tags: frontmatter.tags ? frontmatter.tags.split(',').map((t: string) => t.trim()) : [],
          content: taskContent.trim(),
          sourcePath: filePath,
          metadata: {
            created: frontmatter.created || new Date().toISOString(),
            updated: frontmatter.updated || new Date().toISOString(),
            ...frontmatter,
          },
        };

        tasks.push(task);
      } catch (error) {
        console.warn(`Failed to read task file ${file}:`, error);
      }
    }

    return tasks;
  } catch (error) {
    console.error(`Failed to read tasks folder ${tasksPath}:`, error);
    throw new Error(`Failed to read tasks folder: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};