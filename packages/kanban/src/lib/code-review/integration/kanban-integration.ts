/**
 * Kanban Integration
 *
 * Integration layer for connecting code review system
 * with kanban transition validation.
 */

import type { Task, Board } from '../../types.js';
import type { KanbanTransitionReviewRequest, KanbanTransitionReviewResult } from '../types.js';
import { CodeReviewRulesEngine } from '../rules-engine.js';
import type { TransitionResult } from '../../transition-rules.js';

/**
 * Kanban Code Review Integration
 */
export class KanbanCodeReviewIntegration {
  private codeReviewEngine: CodeReviewRulesEngine;

  constructor(codeReviewEngine: CodeReviewRulesEngine) {
    this.codeReviewEngine = codeReviewEngine;
  }

  /**
   * Validate kanban transition with code review
   */
  async validateTransition(
    from: string,
    to: string,
    task: Task,
    board: Board,
    actor: 'agent' | 'human' | 'system' = 'agent',
  ): Promise<TransitionResult> {
    try {
      const request: KanbanTransitionReviewRequest = {
        task,
        fromStatus: from,
        toStatus: to,
        board,
        actor,
      };

      const result = await this.codeReviewEngine.validateTransition(request);

      // Convert code review result to transition result
      return {
        allowed: result.allowed,
        reason: result.reason,
        ruleViolations: result.reviewResult?.violations.map((v) => v.message) || [],
        suggestions: result.suggestions,
        suggestedAlternatives: [],
        warnings: result.warnings,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      return {
        allowed: true, // Allow transition on error to avoid blocking workflow
        reason: `Code review validation failed: ${errorMessage}`,
        ruleViolations: [],
        suggestions: ['Fix code review configuration and retry'],
        suggestedAlternatives: [],
        warnings: [`Code review error: ${errorMessage}`],
      };
    }
  }

  /**
   * Get code review summary for task
   */
  async getTaskReviewSummary(task: Task): Promise<{
    hasReview: boolean;
    lastReviewScore?: number;
    lastReviewDate?: string;
    violationCount?: number;
    recommendations?: string[];
  }> {
    // This would integrate with task metadata to track review history
    // For now, return basic information

    const reviewHistory = task.frontmatter?.codeReviewHistory;

    if (!reviewHistory || !Array.isArray(reviewHistory) || reviewHistory.length === 0) {
      return {
        hasReview: false,
      };
    }

    const lastReview = reviewHistory[reviewHistory.length - 1];

    return {
      hasReview: true,
      lastReviewScore: lastReview.score,
      lastReviewDate: lastReview.timestamp,
      violationCount: lastReview.violationCount,
      recommendations: lastReview.recommendations || [],
    };
  }

  /**
   * Update task with code review results
   */
  async updateTaskWithReviewResults(
    task: Task,
    reviewResult: any,
    transition: string,
  ): Promise<Task> {
    // Add review results to task frontmatter
    const reviewHistory = task.frontmatter?.codeReviewHistory || [];

    const reviewEntry = {
      timestamp: new Date().toISOString(),
      transition,
      score: reviewResult.score,
      violationCount: reviewResult.violations?.length || 0,
      recommendations: reviewResult.suggestions?.map((s: any) => s.message) || [],
      blocked: reviewResult.blocked || false,
    };

    reviewHistory.push(reviewEntry);

    // Keep only last 10 reviews to avoid bloat
    if (reviewHistory.length > 10) {
      reviewHistory.splice(0, reviewHistory.length - 10);
    }

    // Update task frontmatter
    task.frontmatter = {
      ...task.frontmatter,
      codeReviewHistory: reviewHistory,
      lastCodeReview: reviewEntry,
    };

    return task;
  }

  /**
   * Check if task requires code review for transition
   */
  requiresCodeReview(from: string, to: string, task: Task): boolean {
    // Check if transition requires code review
    const transitionKey = `${from}->${to}`;
    const reviewRequiredTransitions = [
      'in_progress->testing',
      'testing->review',
      'review->document',
    ];

    if (!reviewRequiredTransitions.includes(transitionKey)) {
      return false;
    }

    // Check if task has code changes
    const hasCodeChanges = this.taskHasCodeChanges(task);

    return hasCodeChanges;
  }

  /**
   * Check if task has code changes
   */
  private taskHasCodeChanges(task: Task): boolean {
    const content = task.content || '';

    // Look for indicators of code changes
    const codeIndicators = [
      /changed[_-]?files[:\s]+([^\n]+)/i,
      /git[_-]?diff/i,
      /pull[_-]?request/i,
      /merge[_-]?request/i,
      /commit/i,
      /code[_-]?review/i,
      /implementation/i,
      /refactor/i,
    ];

    return codeIndicators.some((indicator) => indicator.test(content));
  }

  /**
   * Get code review configuration for transition
   */
  getTransitionReviewConfig(
    from: string,
    to: string,
  ): {
    enabled: boolean;
    required: boolean;
    rules: string[];
    thresholds: any;
  } | null {
    const transitionKey = `${from}->${to}`;

    // Default configurations for common transitions
    const defaultConfigs: Record<string, any> = {
      'in_progress->testing': {
        enabled: true,
        required: true,
        rules: ['eslint', 'typescript', 'security'],
        thresholds: {
          minScore: 75,
          maxViolations: 15,
          maxErrors: 0,
        },
      },
      'testing->review': {
        enabled: true,
        required: true,
        rules: ['eslint', 'typescript', 'security', 'ai'],
        thresholds: {
          minScore: 85,
          maxViolations: 10,
          maxErrors: 0,
        },
      },
      'review->document': {
        enabled: true,
        required: false,
        rules: ['eslint', 'typescript'],
        thresholds: {
          minScore: 80,
          maxViolations: 5,
          maxErrors: 0,
        },
      },
    };

    return defaultConfigs[transitionKey] || null;
  }

  /**
   * Generate code review report for task
   */
  async generateReviewReport(task: Task, reviewResult: any): Promise<string> {
    const report = [
      `# Code Review Report`,
      ``,
      `**Task:** ${task.title}`,
      `**UUID:** ${task.uuid}`,
      `**Date:** ${new Date().toISOString()}`,
      `**Score:** ${reviewResult.score}/100`,
      `**Status:** ${reviewResult.blocked ? '❌ Blocked' : '✅ Passed'}`,
      ``,
    ];

    if (reviewResult.violations && reviewResult.violations.length > 0) {
      report.push(`## Violations (${reviewResult.violations.length})`);
      report.push(``);

      for (const violation of reviewResult.violations) {
        const severity =
          violation.severity === 'error' ? '🚨' : violation.severity === 'warning' ? '⚠️' : 'ℹ️';
        report.push(`${severity} **${violation.rule}** - ${violation.message}`);
        if (violation.file) {
          report.push(`   File: ${violation.file}${violation.line ? `:${violation.line}` : ''}`);
        }
        report.push(``);
      }
    }

    if (reviewResult.suggestions && reviewResult.suggestions.length > 0) {
      report.push(`## Suggestions (${reviewResult.suggestions.length})`);
      report.push(``);

      for (const suggestion of reviewResult.suggestions) {
        const impact =
          suggestion.impact === 'high' ? '🔴' : suggestion.impact === 'medium' ? '🟡' : '🟢';
        report.push(`${impact} **${suggestion.message}**`);
        if (suggestion.file) {
          report.push(`   File: ${suggestion.file}${suggestion.line ? `:${suggestion.line}` : ''}`);
        }
        if (suggestion.example) {
          report.push(`   Example: \`${suggestion.example}\``);
        }
        report.push(``);
      }
    }

    if (reviewResult.actionItems && reviewResult.actionItems.length > 0) {
      report.push(`## Action Items (${reviewResult.actionItems.length})`);
      report.push(``);

      for (const actionItem of reviewResult.actionItems) {
        const priority =
          actionItem.priority === 'high' ? '🔴' : actionItem.priority === 'medium' ? '🟡' : '🟢';
        const automated = actionItem.automated ? '🤖' : '👤';
        report.push(`${priority} ${automated} **${actionItem.description}**`);
        report.push(`   Effort: ${actionItem.estimatedEffort}`);
        if (actionItem.file) {
          report.push(`   File: ${actionItem.file}`);
        }
        report.push(``);
      }
    }

    report.push(`## Summary`);
    report.push(``);
    report.push(reviewResult.summary || 'No summary available');
    report.push(``);

    return report.join('\n');
  }
}
