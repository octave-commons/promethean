import { Task } from '../types';

export interface DeduplicationStrategy {
  name: string;
  generateKey: (task: Task) => string;
  description: string;
}

export class TaskDeduplicator {
  private strategies: DeduplicationStrategy[] = [
    {
      name: 'exact',
      generateKey: (task: Task) => task.title.trim(),
      description: 'Exact title match after trimming whitespace'
    },
    {
      name: 'normalized',
      generateKey: (task: Task) => this.normalizeTitle(task.title),
      description: 'Normalized title (lowercase, no punctuation, extra spaces)'
    },
    {
      name: 'slug-based',
      generateKey: (task: Task) => this.generateSlug(task.title),
      description: 'Slug-based matching (URL-friendly format)'
    },
    {
      name: 'fuzzy',
      generateKey: (task: Task) => this.fuzzyKey(task.title),
      description: 'Fuzzy matching (ignores punctuation, spacing, and common suffixes)'
    }
  ];

  private defaultStrategy = 'normalized';

  /**
   * Filter out duplicate tasks using the specified strategy
   */
  filterDuplicates(
    incomingTasks: Task[],
    existingTasks: Task[],
    strategy: string = this.defaultStrategy
  ): { newTasks: Task[]; duplicates: Task[]; matchedExisting: Task[] } {
    const dedupStrategy = this.strategies.find(s => s.name === strategy) ||
                         this.strategies.find(s => s.name === this.defaultStrategy)!;

    console.log(`🔍 Using deduplication strategy: ${dedupStrategy.name} - ${dedupStrategy.description}`);

    // Create a map of existing task keys to tasks
    const existingTaskMap = new Map<string, Task[]>();

    for (const existingTask of existingTasks) {
      const key = dedupStrategy.generateKey(existingTask);
      if (!existingTaskMap.has(key)) {
        existingTaskMap.set(key, []);
      }
      existingTaskMap.get(key)!.push(existingTask);
    }

    const newTasks: Task[] = [];
    const duplicates: Task[] = [];
    const matchedExisting: Task[] = [];

    // Filter incoming tasks
    for (const incomingTask of incomingTasks) {
      const key = dedupStrategy.generateKey(incomingTask);
      const matchingExisting = existingTaskMap.get(key) || [];

      if (matchingExisting.length > 0) {
        duplicates.push(incomingTask);
        matchedExisting.push(...matchingExisting);
        console.log(`   🔄 Duplicate found: "${incomingTask.title}"`);
        console.log(`      -> Matches ${matchingExisting.length} existing task(s)`);
        matchingExisting.forEach(existing => {
          console.log(`         • "${existing.title}" (${existing.source})`);
        });
      } else {
        newTasks.push(incomingTask);
      }
    }

    return { newTasks, duplicates, matchedExisting };
  }

  /**
   * Find conflicts between tasks from different sources
   */
  findConflicts(
    sourceTasks: Task[],
    targetTasks: Task[],
    strategy: string = this.defaultStrategy
  ): Array<{ source: Task; target: Task; conflictType: string }> {
    const dedupStrategy = this.strategies.find(s => s.name === strategy) ||
                         this.strategies.find(s => s.name === this.defaultStrategy)!;

    const conflicts: Array<{ source: Task; target: Task; conflictType: string }> = [];

    // Create a map of target tasks by key
    const targetTaskMap = new Map<string, Task[]>();
    for (const targetTask of targetTasks) {
      const key = dedupStrategy.generateKey(targetTask);
      if (!targetTaskMap.has(key)) {
        targetTaskMap.set(key, []);
      }
      targetTaskMap.get(key)!.push(targetTask);
    }

    // Find matches with conflicts
    for (const sourceTask of sourceTasks) {
      const key = dedupStrategy.generateKey(sourceTask);
      const matchingTargets = targetTaskMap.get(key) || [];

      for (const targetTask of matchingTargets) {
        const conflictType = this.determineConflictType(sourceTask, targetTask);
        if (conflictType !== 'none') {
          conflicts.push({
            source: sourceTask,
            target: targetTask,
            conflictType
          });
        }
      }
    }

    return conflicts;
  }

  /**
   * Get available deduplication strategies
   */
  getStrategies(): DeduplicationStrategy[] {
    return [...this.strategies];
  }

  /**
   * Normalize a title for comparison
   */
  private normalizeTitle(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove punctuation except dashes and underscores
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  /**
   * Generate a URL-friendly slug from title
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove punctuation
      .replace(/[\s_]+/g, '-') // Replace spaces and underscores with dashes
      .replace(/-+/g, '-') // Replace multiple dashes with single dash
      .trim();
  }

  /**
   * Generate a fuzzy key that ignores common variations
   */
  private fuzzyKey(title: string): string {
    return title
      .toLowerCase()
      .trim()
      // Remove common suffixes/prefixes
      .replace(/\s*\(\s*[^)]*\)\s*$/g, '') // Remove content in parentheses at end
      .replace(/\s*\[[^\]]*\]\s*$/g, '') // Remove content in brackets at end
      .replace(/\s*\{[^}]*\}\s*$/g, '') // Remove content in braces at end
      // Remove extra whitespace and punctuation
      .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  /**
   * Determine the type of conflict between two tasks
   */
  private determineConflictType(source: Task, target: Task): string {
    if (source.status !== target.status) return 'status_mismatch';
    if (source.priority !== target.priority) return 'priority_mismatch';
    if (source.content !== target.content) return 'content_mismatch';
    if (JSON.stringify(source.labels.sort()) !== JSON.stringify(target.labels.sort())) return 'labels_mismatch';
    return 'identical';
  }

  /**
   * Suggest the best deduplication strategy based on task data
   */
  suggestStrategy(tasks: Task[]): DeduplicationStrategy {
    // Analyze task titles to recommend strategy
    const hasTrailingSpaces = tasks.some(task => task.title !== task.title.trim());
    const hasMixedCase = tasks.some(task => task.title !== task.title.toLowerCase());
    const hasPunctuation = tasks.some(task => /[^\w\s]/.test(task.title));

    if (hasTrailingSpaces || hasPunctuation) {
      return this.strategies.find(s => s.name === 'normalized')!;
    }

    if (hasMixedCase) {
      return this.strategies.find(s => s.name === 'exact')!;
    }

    return this.strategies.find(s => s.name === 'slug-based')!;
  }
}