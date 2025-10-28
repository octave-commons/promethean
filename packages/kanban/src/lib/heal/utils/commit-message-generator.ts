/**
 * Commit Message Generator for Git Workflow
 * Generates consistent, descriptive commit messages from scar context and task changes
 */

import type { ScarContext } from '../scar-context-types.js';
import type { Task } from '../../testing-transition/types.js';

/**
 * Commit message generation options
 */
export interface CommitMessageOptions {
  /** Maximum length for commit subject line */
  maxSubjectLength?: number;
  /** Whether to include task IDs in messages */
  includeTaskIds?: boolean;
  /** Whether to include file paths in messages */
  includeFilePaths?: boolean;
  /** Custom prefix for commit messages */
  prefix?: string;
}

/**
 * Task diff information
 */
export interface TaskDiff {
  /** Task that was modified */
  task: Task;
  /** Type of change */
  changeType: 'created' | 'modified' | 'deleted' | 'moved';
  /** Specific fields that changed */
  changedFields?: string[];
  /** Diff content if available */
  diff?: string;
}

/**
 * Commit message generator class
 */
export class CommitMessageGenerator {
  private readonly options: Required<CommitMessageOptions>;

  constructor(options: CommitMessageOptions = {}) {
    this.options = {
      maxSubjectLength: options.maxSubjectLength || 72,
      includeTaskIds: options.includeTaskIds ?? true,
      includeFilePaths: options.includeFilePaths ?? false,
      prefix: options.prefix || '',
    };
  }

  /**
   * Generate commit message from scar context for pre-operation
   */
  generatePreOperationMessage(context: ScarContext): string {
    const subject = this.generateSubject(`Start healing: ${context.reason}`);
    const body = this.generatePreOperationBody(context);

    return this.formatCommitMessage(subject, body);
  }

  /**
   * Generate commit message from scar context for post-operation
   */
  generatePostOperationMessage(context: ScarContext, modifiedTasks: Task[]): string {
    const subject = this.generateSubject(`Complete healing: ${context.reason}`);
    const body = this.generatePostOperationBody(context, modifiedTasks);

    return this.formatCommitMessage(subject, body);
  }

  /**
   * Generate commit message for task directory changes
   */
  generateTasksDirectoryMessage(taskDiffs: TaskDiff[]): string {
    const created = taskDiffs.filter((d) => d.changeType === 'created');
    const modified = taskDiffs.filter((d) => d.changeType === 'modified');
    const deleted = taskDiffs.filter((d) => d.changeType === 'deleted');

    let subject = 'Update tasks directory';

    if (created.length > 0 && modified.length === 0 && deleted.length === 0) {
      subject = `Add ${created.length} task${created.length > 1 ? 's' : ''}`;
    } else if (deleted.length > 0 && created.length === 0 && modified.length === 0) {
      subject = `Remove ${deleted.length} task${deleted.length > 1 ? 's' : ''}`;
    } else if (created.length > 0 || modified.length > 0 || deleted.length > 0) {
      const parts = [];
      if (created.length > 0) parts.push(`${created.length} added`);
      if (modified.length > 0) parts.push(`${modified.length} modified`);
      if (deleted.length > 0) parts.push(`${deleted.length} removed`);
      subject = `Update tasks: ${parts.join(', ')}`;
    }

    subject = this.generateSubject(subject);

    const body = this.generateTasksDirectoryBody(taskDiffs);

    return this.formatCommitMessage(subject, body);
  }

  /**
   * Generate commit message for kanban board changes
   */
  generateKanbanBoardMessage(reason: string, modifiedTasks: Task[]): string {
    const subject = this.generateSubject(`Update kanban board: ${reason}`);
    const body = this.generateKanbanBoardBody(modifiedTasks);

    return this.formatCommitMessage(subject, body);
  }

  /**
   * Generate commit message for dependency changes
   */
  generateDependenciesMessage(dependencies: string[], operation: 'install' | 'remove' | 'update'): string {
    const verb = operation === 'install' ? 'Add' : operation === 'remove' ? 'Remove' : 'Update';
    const subject = this.generateSubject(`${verb} ${dependencies.length} dependenc${dependencies.length > 1 ? 'ies' : 'y'}`);

    const body = this.generateDependenciesBody(dependencies, operation);

    return this.formatCommitMessage(subject, body);
  }

  /**
   * Generate commit message from task diff
   */
  generateFromTaskDiff(taskDiff: TaskDiff): string {
    const task = taskDiff.task;
    const taskId = this.options.includeTaskIds ? ` (${task.uuid.substring(0, 8)})` : '';
    const action = this.getChangeTypeVerb(taskDiff.changeType);

    const subject = this.generateSubject(`${action} task: ${task.title}${taskId}`);
    const body = this.generateTaskDiffBody(taskDiff);

    return this.formatCommitMessage(subject, body);
  }

  /**
   * Generate scar narrative for commit
   */
  generateScarNarrative(scar: { tag: string; story: string; timestamp: Date }): string {
    const subject = this.generateSubject(`Record scar: ${scar.tag}`);
    const body = this.generateScarNarrativeBody(scar);

    return this.formatCommitMessage(subject, body);
  }

  /**
   * Validate commit message format
   */
  validateMessage(message: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    const lines = message.split('\n');
    if (lines.length === 0) {
      errors.push('Commit message cannot be empty');
      return { valid: false, errors };
    }

    const subject = lines[0];
    if (!subject) {
      errors.push('Commit message cannot have empty subject line');
      return { valid: false, errors };
    }

    // Check subject length
    if (subject.length > this.options.maxSubjectLength) {
      errors.push(`Subject line exceeds ${this.options.maxSubjectLength} characters (${subject.length})`);
    }

    // Check subject doesn't end with period
    if (subject.endsWith('.')) {
      errors.push('Subject line should not end with a period');
    }

    // Check subject is capitalized
    if (subject.length > 0 && subject[0] !== subject[0].toUpperCase()) {
      errors.push('Subject line should start with a capital letter');
    }

    // Check for empty lines between subject and body
    if (lines.length > 1 && lines[1].trim().length > 0) {
      errors.push('Empty line required between subject and body');
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Generate subject line with prefix and length validation
   */
  private generateSubject(text: string): string {
    let subject = text;

    if (this.options.prefix) {
      subject = `${this.options.prefix} ${subject}`;
    }

    // Truncate if too long
    if (subject.length > this.options.maxSubjectLength) {
      subject = subject.substring(0, this.options.maxSubjectLength - 3) + '...';
    }

    return subject;
  }

  /**
   * Generate pre-operation body
   */
  private generatePreOperationBody(context: ScarContext): string {
    const lines: string[] = [];

    lines.push(`Healing operation initiated: ${context.reason}`);
    lines.push('');

    if (context.searchResults.length > 0) {
      lines.push(`Found ${context.searchResults.length} relevant tasks:`);
      for (const result of context.searchResults.slice(0, 5)) {
        lines.push(`- ${result.title} (relevance: ${(result.relevance * 100).toFixed(1)}%)`);
      }
      if (context.searchResults.length > 5) {
        lines.push(`  ... and ${context.searchResults.length - 5} more`);
      }
      lines.push('');
    }

    if (context.previousScars.length > 0) {
      lines.push(`Previous healing operations: ${context.previousScars.length}`);
      lines.push('');
    }

    lines.push(`Tag: ${context.metadata.tag}`);
    lines.push(`Narrative: ${context.metadata.narrative}`);

    return lines.join('\n');
  }

  /**
   * Generate post-operation body
   */
  private generatePostOperationBody(context: ScarContext, modifiedTasks: Task[]): string {
    const lines: string[] = [];

    lines.push(`Healing operation completed: ${context.reason}`);
    lines.push('');

    if (modifiedTasks.length > 0) {
      lines.push(`Modified tasks (${modifiedTasks.length}):`);
      for (const task of modifiedTasks.slice(0, 10)) {
        const taskId = this.options.includeTaskIds ? ` (${task.uuid.substring(0, 8)})` : '';
        lines.push(`- ${task.title}${taskId} [${task.status}]`);
      }
      if (modifiedTasks.length > 10) {
        lines.push(`  ... and ${modifiedTasks.length - 10} more`);
      }
      lines.push('');
    }

    if (context.llmOperations.length > 0) {
      lines.push(`LLM operations performed: ${context.llmOperations.length}`);
      const totalTokens = context.llmOperations.reduce((sum, op) => sum + (op.tokensUsed || 0), 0);
      if (totalTokens > 0) {
        lines.push(`Total tokens used: ${totalTokens.toLocaleString()}`);
      }
      lines.push('');
    }

    lines.push(`Event log entries: ${context.eventLog.length}`);
    lines.push(`Tag: ${context.metadata.tag}`);

    return lines.join('\n');
  }

  /**
   * Generate tasks directory body
   */
  private generateTasksDirectoryBody(taskDiffs: TaskDiff[]): string {
    const lines: string[] = [];

    const byType = {
      created: taskDiffs.filter((d) => d.changeType === 'created'),
      modified: taskDiffs.filter((d) => d.changeType === 'modified'),
      deleted: taskDiffs.filter((d) => d.changeType === 'deleted'),
      moved: taskDiffs.filter((d) => d.changeType === 'moved'),
    };

    Object.entries(byType).forEach(([type, diffs]) => {
      if (diffs.length === 0) return;

      lines.push(`${type.charAt(0).toUpperCase() + type.slice(1)} (${diffs.length}):`);
      for (const diff of diffs.slice(0, 10)) {
        const taskId = this.options.includeTaskIds ? ` (${diff.task.uuid.substring(0, 8)})` : '';
        lines.push(`- ${diff.task.title}${taskId}`);

        if (diff.changedFields && diff.changedFields.length > 0) {
          lines.push(`  Changed: ${diff.changedFields.join(', ')}`);
        }
      }
      if (diffs.length > 10) {
        lines.push(`  ... and ${diffs.length - 10} more`);
      }
      lines.push('');
    });

    return lines.join('\n').trim();
  }

  /**
   * Generate kanban board body
   */
  private generateKanbanBoardBody(modifiedTasks: Task[]): string {
    const lines: string[] = [];

    if (modifiedTasks.length === 0) {
      lines.push('No tasks were modified in this operation.');
      return lines.join('\n');
    }

    // Group by status
    const byStatus = new Map<string, Task[]>();
    for (const task of modifiedTasks) {
      if (!byStatus.has(task.status)) {
        byStatus.set(task.status, []);
      }
      byStatus.get(task.status)!.push(task);
    }

    lines.push(`Board updates affecting ${modifiedTasks.length} task${modifiedTasks.length > 1 ? 's' : ''}:`);
    lines.push('');

    Array.from(byStatus.entries()).forEach(([status, tasks]) => {
      lines.push(`${status} (${tasks.length}):`);
      for (const task of tasks.slice(0, 5)) {
        const taskId = this.options.includeTaskIds ? ` (${task.uuid.substring(0, 8)})` : '';
        lines.push(`- ${task.title}${taskId}`);
      }
      if (tasks.length > 5) {
        lines.push(`  ... and ${tasks.length - 5} more`);
      }
      lines.push('');
    });

    return lines.join('\n').trim();
  }

  /**
   * Generate dependencies body
   */
  private generateDependenciesBody(dependencies: string[], operation: 'install' | 'remove' | 'update'): string {
    const lines: string[] = [];

    const verb = operation === 'install' ? 'Installed' : operation === 'remove' ? 'Removed' : 'Updated';
    lines.push(`${verb} dependencies:`);

    for (const dep of dependencies) {
      lines.push(`- ${dep}`);
    }

    return lines.join('\n');
  }

  /**
   * Generate task diff body
   */
  private generateTaskDiffBody(taskDiff: TaskDiff): string {
    const lines: string[] = [];

    lines.push(`Task: ${taskDiff.task.title}`);
    lines.push(`Status: ${taskDiff.task.status}`);
    lines.push(`Change type: ${taskDiff.changeType}`);

    if (taskDiff.changedFields && taskDiff.changedFields.length > 0) {
      lines.push(`Changed fields: ${taskDiff.changedFields.join(', ')}`);
    }

    if (this.options.includeFilePaths && taskDiff.diff) {
      lines.push('');
      lines.push('Diff:');
      lines.push('```');
      lines.push(taskDiff.diff.substring(0, 1000)); // Limit diff size
      if (taskDiff.diff.length > 1000) {
        lines.push('... (truncated)');
      }
      lines.push('```');
    }

    return lines.join('\n');
  }

  /**
   * Generate scar narrative body
   */
  private generateScarNarrativeBody(scar: { tag: string; story: string; timestamp: Date }): string {
    const lines: string[] = [];

    lines.push(`Scar tag: ${scar.tag}`);
    lines.push(`Created: ${scar.timestamp.toISOString()}`);
    lines.push('');
    lines.push('Story:');
    lines.push(scar.story);

    return lines.join('\n');
  }

  /**
   * Get verb for change type
   */
  private getChangeTypeVerb(changeType: string): string {
    switch (changeType) {
      case 'created':
        return 'Add';
      case 'modified':
        return 'Update';
      case 'deleted':
        return 'Remove';
      case 'moved':
        return 'Move';
      default:
        return 'Modify';
    }
  }

  /**
   * Format commit message with subject and body
   */
  private formatCommitMessage(subject: string, body?: string): string {
    if (!body || body.trim().length === 0) {
      return subject;
    }

    return `${subject}\n\n${body.trim()}`;
  }
}

/**
 * Create a commit message generator
 */
export function createCommitMessageGenerator(options?: CommitMessageOptions): CommitMessageGenerator {
  return new CommitMessageGenerator(options);
}