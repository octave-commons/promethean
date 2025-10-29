/**
 * Validation Module for Kanban System
 *
 * This module provides validation capabilities for kanban operations,
 * including P0 security task validation gates.
 */

export {
  createP0SecurityValidator,
  defaultP0SecurityValidator,
  validateP0SecurityTask,
  P0SecurityValidator,
  type P0ValidationResult,
  type P0ValidationRequirements,
  type P0SecurityValidatorOptions,
} from './p0-security-validator.js';

export {
  GitValidator,
  defaultGitValidator,
  hasTaskCodeChanges,
  getTaskCommits,
  type GitCommitInfo,
  type GitValidationOptions,
} from './git-integration.js';

export {
  AuditScarGenerator,
  createAuditScarGenerator,
  defaultAuditScarGenerator,
  generateAuditValidationScar,
  type AuditScarGenerationOptions,
  type AuditScarContext,
} from './audit-scar-generator.js';

export {
  handleCreateTaskAuditScar,
  handleUpdateStatusAuditScar,
  handleValidationRepairScar,
  shouldGenerateAuditScar,
  DEFAULT_AUDIT_SCAR_OPTIONS,
  type AuditScarIntegrationOptions,
} from './audit-scar-integration.js';
