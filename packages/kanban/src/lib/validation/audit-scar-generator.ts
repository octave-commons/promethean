/**
 * Audit Scar Generator for Validation Repairs
 *
 * This module provides functionality to generate scar records when
 * audit validation failures are detected and repaired during task operations.
 */

import type { Task } from '../types.js';
import type { P0ValidationResult } from './p0-security-validator.js';
import { createScarRecord } from '../heal/type-guards.js';
import { createScarHistoryManager } from '../heal/scar-history-manager.js';
import { createEventLogEntry } from '../heal/type-guards.js';
import type { ScarContext } from '../heal/scar-context-types.js';

export interface AuditScarGenerationOptions {
  /** Repository root directory */
  repoRoot?: string;
  /** Tasks directory path */
  tasksDir?: string;
  /** Whether to create actual scars or just log */
  dryRun?: boolean;
  /** Additional context for scar generation */
  context?: Record<string, unknown>;
}

export interface AuditScarContext {
  /** Task that failed validation */
  task: Task;
  /** Validation result that failed */
  validationResult: P0ValidationResult;
  /** Operation being performed */
  operation: 'createTask' | 'updateStatus' | 'moveTask';
  /** From status (for transitions) */
  fromStatus?: string;
  /** To status (for transitions) */
  toStatus?: string;
  /** Timestamp of validation failure */
  timestamp: Date;
  /** Whether validation failure was repaired */
  repaired: boolean;
  /** Repair method used */
  repairMethod?: string;
}

/**
 * Audit Scar Generator
 *
 * Generates scar records for audit validation failures and repairs,
 * providing traceability for security compliance and process improvements.
 */
export class AuditScarGenerator {
  private scarHistoryManager: ReturnType<typeof createScarHistoryManager>;
  private repoRoot: string;

  private options: AuditScarGenerationOptions;

  constructor(options: AuditScarGenerationOptions = {}) {
    this.repoRoot = options.repoRoot || process.cwd();
    this.options = options;
    this.scarHistoryManager = createScarHistoryManager(this.repoRoot);
  }

  /**
   * Generate scar record for validation failure
   */
  async generateValidationFailureScar(
    context: AuditScarContext,
  ): Promise<{ success: boolean; scarId?: string; error?: string }> {
    try {
      const scarTag = this.generateScarTag(context);
      const scarStory = this.generateScarStory(context);

      // Create event log for validation failure
      const eventLog = [
        createEventLogEntry(
          'audit-validation-failure',
          {
            taskUuid: context.task.uuid,
            operation: context.operation,
            fromStatus: context.fromStatus,
            toStatus: context.toStatus,
            errors: context.validationResult.errors,
            warnings: context.validationResult.warnings,
            timestamp: context.timestamp.toISOString(),
          },
          'error',
        ),
      ];

      // Add repair event if applicable
      if (context.repaired && context.repairMethod) {
        eventLog.push(
          createEventLogEntry(
            'audit-validation-repair',
            {
              taskUuid: context.task.uuid,
              repairMethod: context.repairMethod,
              timestamp: new Date().toISOString(),
            },
            'info',
          ),
        );
      }

      // Create scar record
      const scarRecord = createScarRecord(
        'validation-failure', // Start marker
        'validation-repair', // End marker
        scarTag,
        scarStory,
      );

      // Record scar in history
      const scarContext: ScarContext = {
        reason: `P0 Security validation failure: ${context.validationResult.errors.join('; ')}`,
        eventLog,
        previousScars: [],
        searchResults: [],
        metadata: {
          tag: `audit-${Date.now()}`,
          narrative: `Validation failure repaired during ${context.operation}`,
        },
        llmOperations: [],
        gitHistory: [],
      };

      const recordResult = await this.scarHistoryManager.recordHealingOperation(
        scarContext,
        {
          status: 'completed',
          summary: `P0 Security validation failure repaired: ${context.validationResult.errors.join('; ')}`,
          tasksModified: 1,
          filesChanged: 0,
          errors: [],
          completedAt: new Date(),
        },
        'unknown', // startSha - not available in audit context
        'unknown', // endSha - not available in audit context
      );

      if (recordResult.success) {
        console.log(`🏷️  Audit scar generated: ${scarTag}`);
        return { success: true, scarId: scarRecord.tag };
      } else {
        return { success: false, error: recordResult.error || 'Failed to record scar' };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Failed to generate audit scar:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Generate scar tag for validation failure
   */
  private generateScarTag(context: AuditScarContext): string {
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const operation = context.operation;
    const taskShortId = context.task.uuid.substring(0, 8);
    const validationType = 'p0-security';

    return `audit-${validationType}-${operation}-${date}-${taskShortId}`;
  }

  /**
   * Generate scar story for validation failure
   */
  private generateScarStory(context: AuditScarContext): string {
    const lines = [
      `# Audit Validation Failure Scar`,
      '',
      `**Task:** ${context.task.title} (${context.task.uuid})`,
      `**Operation:** ${context.operation}`,
      `**Timestamp:** ${context.timestamp.toISOString()}`,
      `**Validation Type:** P0 Security`,
      '',
      '## Validation Failure Details',
      '',
      `**Errors (${context.validationResult.errors.length}):**`,
      ...context.validationResult.errors.map((error) => `- ${error}`),
      '',
      `**Warnings (${context.validationResult.warnings.length}):**`,
      ...context.validationResult.warnings.map((warning) => `- ${warning}`),
      '',
    ];

    if (context.fromStatus && context.toStatus) {
      lines.push(
        '## Status Transition',
        '',
        `**From:** ${context.fromStatus}`,
        `**To:** ${context.toStatus}`,
        '',
      );
    }

    if (context.repaired) {
      lines.push(
        '## Repair Information',
        '',
        `**Status:** Repaired ✅`,
        `**Method:** ${context.repairMethod || 'Unknown'}`,
        '',
      );
    } else {
      lines.push('## Repair Information', '', `**Status:** Not Repaired ❌`, '');
    }

    lines.push(
      '## Requirements Analysis',
      '',
      `- **Implementation Plan:** ${context.validationResult.requirements.hasImplementationPlan ? '✅' : '❌'}`,
      `- **Code Changes:** ${context.validationResult.requirements.hasCodeChanges ? '✅' : '❌'}`,
      `- **Security Review:** ${context.validationResult.requirements.hasSecurityReview ? '✅' : '❌'}`,
      `- **Test Coverage:** ${context.validationResult.requirements.hasTestCoverage ? '✅' : '❌'}`,
      `- **Documentation:** ${context.validationResult.requirements.hasDocumentation ? '✅' : '❌'}`,
      '',
      '## Impact Assessment',
      '',
      'This validation failure represents a potential security risk that was prevented by the audit validation system.',
      'The scar provides traceability for compliance and process improvement purposes.',
      '',
    );

    if (this.options.context && Object.keys(this.options.context).length > 0) {
      lines.push(
        '## Additional Context',
        '',
        '```json',
        JSON.stringify(this.options.context, null, 2),
        '```',
      );
    }

    lines.push('---', `*Generated by Audit Scar Generator on ${new Date().toISOString()}*`);

    return lines.join('\n');
  }

  /**
   * Check if scar should be generated for validation result
   */
  shouldGenerateScar(validationResult: P0ValidationResult, operation: string): boolean {
    // Only generate scars for actual validation failures (errors, not just warnings)
    if (validationResult.valid || validationResult.errors.length === 0) {
      return false;
    }

    // Generate scars for critical operations
    const criticalOperations = ['createTask', 'updateStatus', 'moveTask'];
    return criticalOperations.includes(operation);
  }

  /**
   * Generate repair context for validation fixes
   */
  createRepairContext(
    task: Task,
    operation: string,
    validationResult: P0ValidationResult,
    repairMethod: string,
  ): AuditScarContext {
    return {
      task,
      validationResult,
      operation: operation as 'createTask' | 'updateStatus' | 'moveTask',
      timestamp: new Date(),
      repaired: true,
      repairMethod,
    };
  }
}

/**
 * Create audit scar generator with default options
 */
export function createAuditScarGenerator(options?: AuditScarGenerationOptions): AuditScarGenerator {
  return new AuditScarGenerator(options);
}

/**
 * Default audit scar generator instance
 */
export const defaultAuditScarGenerator = createAuditScarGenerator();

/**
 * Convenience function to generate scar for validation failure
 */
export async function generateAuditValidationScar(
  context: AuditScarContext,
  options?: AuditScarGenerationOptions,
): Promise<{ success: boolean; scarId?: string; error?: string }> {
  const generator = createAuditScarGenerator(options);
  return generator.generateValidationFailureScar(context);
}
