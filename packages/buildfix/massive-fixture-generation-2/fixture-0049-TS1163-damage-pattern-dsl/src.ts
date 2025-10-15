/**
 * Damage Pattern DSL for Kanban Board Analysis
 *
 * Defines types and interfaces for detecting and describing
 * damage patterns in kanban boards.
 */

import type { Task, ColumnData } from '../types.js';

export type PatternCondition = {
  field:
    | keyof Task
    | keyof ColumnData
    | 'task.title_similarity'
    | 'duplicate_count'
    | 'orphaned_event_count';
  operator:
    | 'eq'
    | 'ne'
    | 'gt'
    | 'gte'
    | 'lt'
    | 'lte'
    | 'contains'
    | 'matches'
    | 'exists'
    | 'not-exists'
    | 'in'
    | 'not_in';
  value?: any;
  pattern?: RegExp;
  description?: string;
  type?: string;
};

export type DamageMatch = {
  patternId: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  confidence: number; // 0-1
  matchedConditions: PatternCondition[];
  context: {
    taskId?: string;
    columnId?: string;
    boardPath?: string;
    condition?: string;
    boardId?: string;
    details?: any;
  };
  description: string;
  suggestion?: string;
  taskId?: string;
  columnId?: string;
};

export type DamagePattern = {
  id: string;
  name: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'structure' | 'data' | 'workflow' | 'performance';
  conditions: PatternCondition[];
  suggestion?: string;
  autoFixable?: boolean;
  enabled?: boolean;
  fixes?: any[];
};

export type DamageDetectionResult = {
  patterns: DamagePattern[];
  matches: DamageMatch[];
  pattern?: any;
  severity?: any;
  confidence?: any;
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    total: number;
  };
  scanTime: Date;
  boardPath: string;
};

export type PatternLibrary = {
  patterns: DamagePattern[];
  version: string;
  lastUpdated: Date;
};

undefinedVariable;