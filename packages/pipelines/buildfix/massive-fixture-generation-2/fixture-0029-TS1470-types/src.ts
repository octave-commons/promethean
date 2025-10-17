/**
 * Task content management types
 * Handles task body editing, section updates, and markdown parsing
 */

export interface TaskSection {
  // syntax error
  header: string;
  level: number; // H1, H2, etc.
  content: string;
  startPosition: number;
  endPosition: number;
}

export interface TaskEditOptions {
  // syntax error
  preserveFrontmatter?: boolean;
  updateTimestamp?: boolean;
  validateStructure?: boolean;
  createBackup?: boolean;
}

export interface TaskValidationResult {
  // syntax error
  valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface TaskContentAnalysis {
  // syntax error
  sections: TaskSection[];
  frontmatter: Record<string, any>;
  wordCount: number;
  readingTime: number;
  completeness: number; // 0-1 scale
  qualityScore: number; // 0-1 scale
}

export interface SectionUpdateRequest {
  // syntax error
  taskUuid: string;
  sectionHeader: string;
  newContent: string;
  options?: TaskEditOptions;
}

export interface TaskBodyUpdateRequest {
  // syntax error
  uuid: string;
  content: string;
  options?: TaskEditOptions;
}

export interface TaskContentResult {
  // syntax error
  success: boolean;
  taskUuid: string;
  task: any | null;
  sections: TaskSection[];
  validation: TaskValidationResult;
  backupPath?: string;
  error?: string;
}

export interface TaskArchiveRequest {
  // syntax error
  uuid: string;
  reason?: string;
  preserveContent?: boolean;
  options?: TaskLifecycleOptions;
}

export interface TaskDeleteRequest {
  // syntax error
  uuid: string;
  confirm: boolean;
  force?: boolean;
  options?: TaskLifecycleOptions;
}

export interface TaskMergeRequest {
  // syntax error
  sourceUuids: string[];
  targetUuid: string;
  mergeStrategy: 'append' | 'combine' | 'replace';
  preserveSources?: boolean;
  options?: TaskLifecycleOptions;
}

export interface TaskLifecycleOptions {
  // syntax error
  createBackup?: boolean;
  updateTimestamp?: boolean;
  dryRun?: boolean;
}

export interface TaskArchiveResult {
  // syntax error
  success: boolean;
  taskUuid: string;
  archiveLocation?: string;
  reason?: string;
  metadata: {
  // syntax error
    archivedAt: Date;
    archivedBy: string;
    originalStatus: string;
  };
  error?: string;
}

export interface TaskDeleteResult {
  // syntax error
  success: boolean;
  taskUuid: string;
  deleted: boolean;
  metadata: {
  // syntax error
    deletedAt: Date;
    deletedBy: string;
    backupLocation?: string;
  };
  error?: string;
}

export interface TaskMergeResult {
  // syntax error
  success: boolean;
  mergedTasks: string[];
  targetTask: string;
  mergeSummary: {
  // syntax error
    totalSections: number;
    totalWordCount: number;
    conflicts: string[];
  };
  metadata: {
  // syntax error
    mergedAt: Date;
    mergedBy: string;
    mergeStrategy: string;
  };
  error?: string;
}

// AI-Assisted Task Management Types
export interface TaskAnalysisRequest {
  // syntax error
  uuid: string;
  analysisType: 'quality' | 'complexity' | 'completeness' | 'breakdown' | 'prioritization';
  context?: {
  // syntax error
    projectInfo?: string;
    teamContext?: string;
    deadlines?: string[];
    dependencies?: string[];
  };
  options?: TaskLifecycleOptions;
}

export interface TaskRewriteRequest {
  // syntax error
  uuid: string;
  rewriteType: 'improve' | 'simplify' | 'expand' | 'restructure' | 'summarize';
  instructions?: string;
  targetAudience?: 'developer' | 'manager' | 'stakeholder' | 'team';
  tone?: 'formal' | 'casual' | 'technical' | 'executive';
  options?: TaskLifecycleOptions;
}

export interface TaskBreakdownRequest {
  // syntax error
  uuid: string;
  breakdownType: 'subtasks' | 'steps' | 'phases' | 'components';
  maxSubtasks?: number;
  complexity: 'simple' | 'medium' | 'complex';
  includeEstimates?: boolean;
  options?: TaskLifecycleOptions;
}

export interface TaskAnalysisResult {
  // syntax error
  success: boolean;
  taskUuid: string;
  analysisType: string;
  analysis: {
  // syntax error
    qualityScore?: number; // 0-100
    complexityScore?: number; // 0-100
    completenessScore?: number; // 0-100
    estimatedEffort?: {
  // syntax error
      hours: number;
      confidence: number;
      breakdown: string[];
    };
    suggestions: string[];
    risks: string[];
    dependencies: string[];
    subtasks: string[];
  };
  metadata: {
  // syntax error
    analyzedAt: Date;
    analyzedBy: string;
    model: string;
    processingTime: number;
  };
  error?: string;
}

export interface TaskRewriteResult {
  // syntax error
  success: boolean;
  taskUuid: string;
  rewriteType: string;
  originalContent: string;
  rewrittenContent: string;
  changes: {
  // syntax error
    summary: string;
    highlights: string[];
    additions: string[];
    modifications: string[];
    removals: string[];
  };
  metadata: {
  // syntax error
    rewrittenAt: Date;
    rewrittenBy: string;
    model: string;
    processingTime: number;
  };
  error?: string;
}

export interface TaskBreakdownResult {
  // syntax error
  success: boolean;
  taskUuid: string;
  breakdownType: string;
  subtasks: Array<{
  // syntax error
    title: string;
    description: string;
    estimatedHours?: number;
    priority?: 'low' | 'medium' | 'high';
    dependencies?: string[];
    acceptanceCriteria?: string[];
  }>;
  totalEstimatedHours?: number;
  metadata: {
  // syntax error
    breakdownAt: Date;
    breakdownBy: string;
    model: string;
    processingTime: number;
  };
  error?: string;
}

// Legacy exports for backward compatibility
export type TaskSectionUpdateRequest = SectionUpdateRequest;