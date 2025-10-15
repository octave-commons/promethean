/**
 * Task content management types
 * Handles task body editing, section updates, and markdown parsing
 */

export interface TaskSection {
  header: string,
  level: number, // H1, H2, etc.
  content: string,
  startPosition: number,
  endPosition: number,
}

export interface TaskEditOptions {
  preserveFrontmatter?: boolean,
  updateTimestamp?: boolean,
  validateStructure?: boolean,
  createBackup?: boolean,
}

export interface TaskValidationResult {
  valid: boolean,
  errors: string[],
  warnings: string[],
  suggestions: string[],
}

export interface TaskContentAnalysis {
  sections: TaskSection[],
  frontmatter: Record<string, any>,
  wordCount: number,
  readingTime: number,
  completeness: number, // 0-1 scale
  qualityScore: number, // 0-1 scale
}

export interface SectionUpdateRequest {
  taskUuid: string,
  sectionHeader: string,
  newContent: string,
  options?: TaskEditOptions,
}

export interface TaskBodyUpdateRequest {
  uuid: string,
  content: string,
  options?: TaskEditOptions,
}

export interface TaskContentResult {
  success: boolean,
  taskUuid: string,
  task: any | null,
  sections: TaskSection[],
  validation: TaskValidationResult,
  backupPath?: string,
  error?: string,
}

export interface TaskArchiveRequest {
  uuid: string,
  reason?: string,
  preserveContent?: boolean,
  options?: TaskLifecycleOptions,
}

export interface TaskDeleteRequest {
  uuid: string,
  confirm: boolean,
  force?: boolean,
  options?: TaskLifecycleOptions,
}

export interface TaskMergeRequest {
  sourceUuids: string[],
  targetUuid: string,
  mergeStrategy: 'append' | 'combine' | 'replace',
  preserveSources?: boolean,
  options?: TaskLifecycleOptions,
}

export interface TaskLifecycleOptions {
  createBackup?: boolean,
  updateTimestamp?: boolean,
  dryRun?: boolean,
}

export interface TaskArchiveResult {
  success: boolean,
  taskUuid: string,
  archiveLocation?: string,
  reason?: string,
  metadata: {
    archivedAt: Date,
    archivedBy: string,
    originalStatus: string,
  },
  error?: string,
}

export interface TaskDeleteResult {
  success: boolean,
  taskUuid: string,
  deleted: boolean,
  metadata: {
    deletedAt: Date,
    deletedBy: string,
    backupLocation?: string,
  },
  error?: string,
}

export interface TaskMergeResult {
  success: boolean,
  mergedTasks: string[],
  targetTask: string,
  mergeSummary: {
    totalSections: number,
    totalWordCount: number,
    conflicts: string[],
  },
  metadata: {
    mergedAt: Date,
    mergedBy: string,
    mergeStrategy: string,
  },
  error?: string,
}

// AI-Assisted Task Management Types
export interface TaskAnalysisRequest {
  uuid: string,
  analysisType: 'quality' | 'complexity' | 'completeness' | 'breakdown' | 'prioritization',
  context?: {
    projectInfo?: string,
    teamContext?: string,
    deadlines?: string[],
    dependencies?: string[],
  },
  options?: TaskLifecycleOptions,
}

export interface TaskRewriteRequest {
  uuid: string,
  rewriteType: 'improve' | 'simplify' | 'expand' | 'restructure' | 'summarize',
  instructions?: string,
  targetAudience?: 'developer' | 'manager' | 'stakeholder' | 'team',
  tone?: 'formal' | 'casual' | 'technical' | 'executive',
  options?: TaskLifecycleOptions,
}

export interface TaskBreakdownRequest {
  uuid: string,
  breakdownType: 'subtasks' | 'steps' | 'phases' | 'components',
  maxSubtasks?: number,
  complexity: 'simple' | 'medium' | 'complex',
  includeEstimates?: boolean,
  options?: TaskLifecycleOptions,
}

export interface TaskAnalysisResult {
  success: boolean,
  taskUuid: string,
  analysisType: string,
  analysis: {
    qualityScore?: number, // 0-100
    complexityScore?: number, // 0-100
    completenessScore?: number, // 0-100
    estimatedEffort?: {
      hours: number,
      confidence: number,
      breakdown: string[],
    },
    suggestions: string[],
    risks: string[],
    dependencies: string[],
    subtasks: string[],
  },
  metadata: {
    analyzedAt: Date,
    analyzedBy: string,
    model: string,
    processingTime: number,
  },
  error?: string,
}

export interface TaskRewriteResult {
  success: boolean,
  taskUuid: string,
  rewriteType: string,
  originalContent: string,
  rewrittenContent: string,
  changes: {
    summary: string,
    highlights: string[],
    additions: string[],
    modifications: string[],
    removals: string[],
  },
  metadata: {
    rewrittenAt: Date,
    rewrittenBy: string,
    model: string,
    processingTime: number,
  },
  error?: string,
}

export interface TaskBreakdownResult {
  success: boolean,
  taskUuid: string,
  breakdownType: string,
  subtasks: Array<{
    title: string,
    description: string,
    estimatedHours?: number,
    priority?: 'low' | 'medium' | 'high',
    dependencies?: string[],
    acceptanceCriteria?: string[],
  }>,
  totalEstimatedHours?: number,
  metadata: {
    breakdownAt: Date,
    breakdownBy: string,
    model: string,
    processingTime: number,
  },
  error?: string,
}

// Legacy exports for backward compatibility
export type TaskSectionUpdateRequest = SectionUpdateRequest,