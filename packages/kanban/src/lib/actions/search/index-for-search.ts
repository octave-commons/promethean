import { promises as fs } from 'fs';
import path from 'path';
import type { Task } from '../../types.js';

export type IndexForSearchInput = {
  tasksDir: string;
  options?: {
    writeIndex?: boolean;
    indexPath?: string;
    extensions?: string[];
  };
};

export type IndexForSearchResult = {
  started: true;
  tasksIndexed: number;
  wroteIndexFile: boolean;
  indexPath?: string;
};

const readTasksFromDirectory = async (tasksDir: string, extensions: string[] = ['.md', '.json']): Promise<Task[]> => {
  const tasks: Task[] = [];
  
  try {
    const files = await fs.readdir(tasksDir);
    
    for (const file of files) {
      const ext = path.extname(file);
      if (!extensions.includes(ext)) continue;
      
      const filePath = path.join(tasksDir, file);
      const content = await fs.readFile(filePath, 'utf8');
      
      if (ext === '.json') {
        try {
          const data = JSON.parse(content);
          if (data && data.uuid && data.title) {
            tasks.push(data as Task);
          }
        } catch {
          // Skip invalid JSON
        }
      } else {
        // Parse markdown frontmatter
        try {
          const { parseFrontmatter } = await import('@promethean-os/markdown/frontmatter');
          const parsed = parseFrontmatter(content);
          const frontmatter = parsed.data || {};
          const body = parsed.content || '';
          
          if (frontmatter.uuid && frontmatter.title) {
            tasks.push({
              uuid: frontmatter.uuid,
              title: frontmatter.title,
              status: frontmatter.status || 'Todo',
              priority: frontmatter.priority,
              labels: frontmatter.labels || [],
              created_at: frontmatter.created_at || new Date().toISOString(),
              estimates: frontmatter.estimates || {},
              content: body,
              slug: frontmatter.slug,
            } as Task);
          }
        } catch {
          // Skip files with invalid frontmatter
        }
      }
    }
  } catch (error) {
    // If directory doesn't exist or can't be read, return empty array
  }
  
  return tasks;
};

const serializeTasksForIndex = (tasks: Task[]): string[] => {
  return tasks.map(task => {
    const fields = [
      task.uuid,
      task.title || '',
      task.status || '',
      (task.labels || []).join(' '),
      (task.content || '').replace(/\s+/g, ' ').trim(),
    ].join('\t');
    
    return fields;
  });
};

export const indexForSearch = async (input: IndexForSearchInput): Promise<IndexForSearchResult> => {
  const { tasksDir, options = {} } = input;
  const { writeIndex = false, indexPath, extensions = ['.md', '.json'] } = options;

  // Read all tasks from directory
  const tasks = await readTasksFromDirectory(tasksDir, extensions);
  
  // Serialize tasks for search index
  const indexLines = serializeTasksForIndex(tasks);
  
  // Write index file if requested
  let wroteIndexFile = false;
  let finalIndexPath: string | undefined;
  
  if (writeIndex) {
    finalIndexPath = indexPath || path.join(tasksDir, '.search-index');
    
    try {
      const indexContent = indexLines.join('\n') + '\n';
      await fs.writeFile(finalIndexPath, indexContent, 'utf8');
      wroteIndexFile = true;
    } catch (error) {
      console.warn(`Failed to write search index to ${finalIndexPath}:`, error);
      wroteIndexFile = false;
    }
  }
  
  return {
    started: true,
    tasksIndexed: tasks.length,
    wroteIndexFile,
    indexPath: finalIndexPath,
  };
};