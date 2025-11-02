/**
 * Audit Scar Integration for Kanban Operations
 *
 * This module provides integration functions to connect audit validation
 * failures with the scar generation system without modifying core kanban logic.
 */

import type { Task } from '../types.js';
import type { P0ValidationResult } from './p0-security-validator.js';
import { generateAuditValidationScar, type AuditScarContext } from './audit-scar-generator.js';

export interface AuditScarIntegrationOptions {
  /** Repository root directory */
  repoRoot?: string;
  /** Tasks directory path */
  tasksDir?: string;
  /** Whether to create actual scars or just log */
  dryRun?: boolean;
}

/**
 * Integration function for createTask audit scar generation
 */
export async function handleCreateTaskAuditScar(
  task: Task,
  validationResult: P0ValidationResult,
  targetColumn: string,
  options: AuditScarIntegrationOptions = {},
): Promise<{ success: boolean; scarId?: string; error?: string }> {
  if (validationResult.valid || validationResult.errors.length === 0) {
    return { success: true }; // No scar needed for successful validation
  }

  try {
    const auditContext: AuditScarContext = {
      task,
      validationResult,
      operation: 'createTask',
      toStatus: targetColumn,
      timestamp: new Date(),
      repaired: false,
    };

    return await generateAuditValidationScar(auditContext, {
      repoRoot: options.repoRoot || process.cwd(),
      tasksDir: options.tasksDir,
      dryRun: options.dryRun || false,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.warn(`⚠️  Create task audit scar generation failed: ${errorMessage}`);
    return { success: false, error: errorMessage };
  }
}

/**
 * Integration function for updateStatus audit scar generation
 */
export async function handleUpdateStatusAuditScar(
  task: Task,
  validationResult: P0ValidationResult,
  fromStatus: string,
  toStatus: string,
  options: AuditScarIntegrationOptions = {},
): Promise<{ success: boolean; scarId?: string; error?: string }> {
  if (validationResult.valid || validationResult.errors.length === 0) {
    return { success: true }; // No scar needed for successful validation
  }

  try {
    const auditContext: AuditScarContext = {
      task,
      validationResult,
      operation: 'updateStatus',
      fromStatus,
      toStatus,
      timestamp: new Date(),
      repaired: false,
    };

    return await generateAuditValidationScar(auditContext, {
      repoRoot: options.repoRoot || process.cwd(),
      tasksDir: options.tasksDir,
      dryRun: options.dryRun || false,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.warn(`⚠️  Update status audit scar generation failed: ${errorMessage}`);
    return { success: false, error: errorMessage };
  }
}

/**
 * Integration function for repaired validation failures
 */
export async function handleValidationRepairScar(
  task: Task,
  validationResult: P0ValidationResult,
  operation: 'createTask' | 'updateStatus' | 'moveTask',
  repairMethod: string,
  fromStatus?: string,
  toStatus?: string,
  options: AuditScarIntegrationOptions = {},
): Promise<{ success: boolean; scarId?: string; error?: string }> {
  try {
    const auditContext: AuditScarContext = {
      task,
      validationResult,
      operation,
      fromStatus,
      toStatus,
      timestamp: new Date(),
      repaired: true,
      repairMethod,
    };

    return await generateAuditValidationScar(auditContext, {
      repoRoot: options.repoRoot || process.cwd(),
      tasksDir: options.tasksDir,
      dryRun: options.dryRun || false,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.warn(`⚠️  Validation repair audit scar generation failed: ${errorMessage}`);
    return { success: false, error: errorMessage };
  }
}

/**
 * Check if audit scar should be generated
 */
export function shouldGenerateAuditScar(
  validationResult: P0ValidationResult,
): boolean {
  // Only generate scars for actual validation failures (errors, not just warnings)
  return !validationResult.valid && validationResult.errors.length > 0;
}

/**
 * Default integration options
 */
export const DEFAULT_AUDIT_SCAR_OPTIONS: AuditScarIntegrationOptions = {
  repoRoot: process.cwd(),
  dryRun: false,
};