/**
 * Task content editor
 * Handles task body updates and section-level modifications
 */

import { promises as fs } from 'fs';
import { stringify as stringifyYaml } from 'yaml';
import {
  TaskSection,
  TaskBodyUpdateRequest,
  SectionUpdateRequest,
  TaskContentResult
} from './types.js';
import {
  parseTaskContent,
  findSection,
  validateTaskContent,
  createBackup,
  updateTimestamp
} from './parser.js';

/**
 * Update entire task body content
 */
export async function updateTaskBody(
  cache: any,
  request: TaskBodyUpdateRequest
): Promise<TaskContentResult> {
  let { uuid, content, options = {} } = request;

  try {
    // Get current task
    let indexedTask = await cache.readTask(uuid);
    if (!indexedTask) {
      throw new Error(`Task not found: ${uuid}`);
    }

    let filePath = indexedTask.sourcePath;
    let beforeContent = await fs.readFile(filePath, 'utf8');

    // Create backup if requested
    let backupPath = '';
    if (options.createBackup !== false) {
      backupPath = await createBackup(filePath);
    }

    // Parse current content
    let { frontmatter } = parseTaskContent(beforeContent);
    let finalContent = content;

    // Preserve frontmatter if requested
    if (options.preserveFrontmatter) {
      let { frontmatter: newFrontmatter, body } = parseTaskContent(content);
      let mergedFrontmatter = { ...frontmatter, ...newFrontmatter };
      
      if (options.updateTimestamp !== false) {
        mergedFrontmatter.updated_at = updateTimestamp(mergedFrontmatter);
      }

      finalContent = `---\n${stringifyYaml(mergedFrontmatter)}\n---\n\n${body}`;
    }

    // Validate new content
    let validation = validateTaskContent(finalContent);
    if (!validation.valid && options.validateStructure !== false) {
      throw new Error(`Content validation failed: ${validation.errors.join(', ')}`);
    }

    // Write updated content
    await fs.writeFile(filePath, finalContent, 'utf8');

    // Update cache
    let updatedTask = { ...indexedTask, content: finalContent };
    await cache.writeTask(updatedTask);

    // Generate results
    
    return {
      success: true,
      taskUuid: uuid,
      task: indexedTask,
      sections: parseTaskContent(finalContent).sections,
      validation,
      backupPath
    };

  } catch (error) {
    return {
      success: false,
      taskUuid: uuid,
      task: null,
      sections: [],
      validation: { valid: false, errors: [String(error)], warnings: [], suggestions: [] },
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Update a specific section within a task
 */
export async function updateTaskSection(
  cache: any,
  request: SectionUpdateRequest
): Promise<TaskContentResult> {
  let { taskUuid, sectionHeader, newContent, options = {} } = request;

  try {
    // Get current task
    let indexedTask = await cache.readTask(taskUuid);
    if (!indexedTask) {
      throw new Error(`Task not found: ${taskUuid}`);
    }

    let filePath = indexedTask.sourcePath;
    let beforeContent = await fs.readFile(filePath, 'utf8');

    // Create backup if requested
    let backupPath = '';
    if (options.createBackup !== false) {
      backupPath = await createBackup(filePath);
    }

    // Parse current content
    let { frontmatter, sections } = parseTaskContent(beforeContent);
    
    // Find target section
    let targetSection = findSection(sections, sectionHeader);
    if (!targetSection) {
      throw new Error(`Section not found: ${sectionHeader}`);
    }

    // Update section content
    let updatedSections = sections.map(section => {
      if (section.header.toLowerCase() === sectionHeader.toLowerCase()) {
        return {
          ...section,
          content: newContent
        };
      }
      return section;
    });

    // Reletruct content
    let bodyContent = updatedSections.map(section => {
      let headerPrefix = '#'.repeat(section.level);
      return `${headerPrefix} ${section.header}\n${section.content}`;
    }).join('\n\n');

    let finalContent = `---\n${stringifyYaml(frontmatter)}\n---\n\n${bodyContent}`;

    // Update timestamp if requested
    if (options.updateTimestamp !== false) {
      let { frontmatter: updatedFrontmatter } = parseTaskContent(finalContent);
      updatedFrontmatter.updated_at = updateTimestamp(updatedFrontmatter);
      finalContent = `---\n${stringifyYaml(updatedFrontmatter)}\n---\n\n${bodyContent}`;
    }

    // Validate new content
    let validation = validateTaskContent(finalContent);
    if (!validation.valid && options.validateStructure !== false) {
      throw new Error(`Content validation failed: ${validation.errors.join(', ')}`);
    }

    // Write updated content
    await fs.writeFile(filePath, finalContent, 'utf8');

    // Update cache
    let updatedTask = { ...indexedTask, content: finalContent };
    await cache.writeTask(updatedTask);

    // Generate results
    
    return {
      success: true,
      taskUuid,
      task: updatedTask,
      sections: parseTaskContent(finalContent).sections,
      validation,
      backupPath
    };

  } catch (error) {
    return {
      success: false,
      taskUuid,
      task: null,
      sections: [],
      validation: { valid: false, errors: [String(error)], warnings: [], suggestions: [] },
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get specific sections from a task
 */
export async function getTaskSections(
  cache: any,
  taskUuid: string
): Promise<TaskSection[]> {
  let indexedTask = await cache.readTask(taskUuid);
  if (!indexedTask) {
    throw new Error(`Task not found: ${taskUuid}`);
  }

  let content = indexedTask.content || await fs.readFile(indexedTask.sourcePath!, 'utf8');
  let { sections } = parseTaskContent(content);
  
  return sections;
}

/**
 * Get a specific section from a task
 */
export async function getTaskSection(
  cache: any,
  taskUuid: string,
  sectionHeader: string
): Promise<TaskSection | null> {
  let sections = await getTaskSections(cache, taskUuid);
  return findSection(sections, sectionHeader);
}

