/**
 * Policy Exclusions Engine
 * 
 * Constitutional constraints on what Sintel may observe or interact with.
 * Exclusions are additive only—they cannot be removed by subordinates.
 */

import type { UUID, ISO8601 } from '../core/types.js';

// ============================================================================
// Exclusion Types
// ============================================================================

/**
 * Constitutional exclusion categories.
 * Exclusions are additive only—they cannot be removed by subordinates.
 */
export type ExclusionCategory = 
  | 'private_residential'
  | 'healthcare'
  | 'critical_infrastructure'
  | 'personal_devices'
  | 'educational_institutions'
  | 'custom';

/**
 * A single exclusion rule.
 */
export interface Exclusion {
  readonly category: ExclusionCategory;
  readonly pattern: string;
  readonly rationale: string;
  readonly added_by: UUID;
  readonly added_at: ISO8601;
}

/**
 * Merged exclusion set from global, org, and workflow levels.
 */
export interface ExclusionSet {
  readonly global: readonly Exclusion[];
  readonly org: readonly Exclusion[];
  readonly workflow: readonly Exclusion[];
  /** Computed: global ∪ org ∪ workflow */
  readonly effective: readonly Exclusion[];
}

// ============================================================================
// Constitutional Exclusions
// ============================================================================

/**
 * Default constitutional exclusions applied at the global level.
 * These cannot be overridden by org or workflow level.
 */
export const CONSTITUTIONAL_EXCLUSIONS: Exclusion[] = [
  {
    category: 'private_residential',
    pattern: 'residential_ip',
    rationale: 'No scanning of residential IP ranges',
    added_by: 'system' as UUID,
    added_at: '1970-01-01T00:00:00Z'
  },
  {
    category: 'healthcare',
    pattern: 'healthcare_system',
    rationale: 'No interaction with medical infrastructure',
    added_by: 'system' as UUID,
    added_at: '1970-01-01T00:00:00Z'
  },
  {
    category: 'critical_infrastructure',
    pattern: 'critical_infra',
    rationale: 'No active probing of power, water, transit',
    added_by: 'system' as UUID,
    added_at: '1970-01-01T00:00:00Z'
  },
  {
    category: 'personal_devices',
    pattern: 'consumer_device',
    rationale: 'No targeting of individual consumer devices',
    added_by: 'system' as UUID,
    added_at: '1970-01-01T00:00:00Z'
  },
  {
    category: 'educational_institutions',
    pattern: 'k12_university',
    rationale: 'No scanning of K-12 or university networks without authorization',
    added_by: 'system' as UUID,
    added_at: '1970-01-01T00:00:00Z'
  }
];

// ============================================================================
// Exclusion Store
// ============================================================================

/**
 * Persistence interface for exclusions.
 */
export interface ExclusionStore {
  getGlobal(): Promise<Exclusion[]>;
  getOrg(orgId: UUID): Promise<Exclusion[]>;
  getWorkflow(workflowId: UUID): Promise<Exclusion[]>;
  addOrgExclusion(orgId: UUID, exclusion: Exclusion): Promise<void>;
  addWorkflowExclusion(workflowId: UUID, exclusion: Exclusion): Promise<void>;
}

// ============================================================================
// Exclusion Policy Engine
// ============================================================================

/**
 * The exclusion policy engine manages exclusion merging and checking.
 */
export class ExclusionPolicy {
  constructor(private readonly store: ExclusionStore) {}

  /**
   * Build the effective exclusion set for a workflow.
   * Exclusions merge: global ∪ org ∪ workflow
   */
  async buildExclusionSet(
    orgId: UUID,
    workflowId: UUID
  ): Promise<ExclusionSet> {
    const global = CONSTITUTIONAL_EXCLUSIONS;
    const org = await this.store.getOrg(orgId);
    const workflow = await this.store.getWorkflow(workflowId);
    
    // Deduplicate by pattern
    const effective = this.mergeExclusions(global, org, workflow);

    return { global, org, workflow, effective };
  }

  /**
   * Merge exclusion lists, deduplicating by pattern.
   * Later lists (more specific) override earlier ones for same pattern.
   */
  private mergeExclusions(
    global: readonly Exclusion[],
    org: readonly Exclusion[],
    workflow: readonly Exclusion[]
  ): Exclusion[] {
    const byPattern = new Map<string, Exclusion>();

    // Add in order: global first, then org, then workflow
    // Later additions override earlier ones for same pattern
    for (const exc of global) {
      byPattern.set(exc.pattern, exc);
    }
    for (const exc of org) {
      byPattern.set(exc.pattern, exc);
    }
    for (const exc of workflow) {
      byPattern.set(exc.pattern, exc);
    }

    return Array.from(byPattern.values());
  }

  /**
   * Check if a target matches any exclusion.
   */
  isExcluded(target: ExclusionTarget, exclusions: ExclusionSet): ExclusionMatch | null {
    for (const exc of exclusions.effective) {
      if (this.matchesPattern(target, exc)) {
        return {
          exclusion: exc,
          matched_pattern: exc.pattern
        };
      }
    }
    return null;
  }

  /**
   * Pattern matching for exclusion checks.
   */
  private matchesPattern(target: ExclusionTarget, exclusion: Exclusion): boolean {
    // Simplified pattern matching - can be extended with regex, CIDR, etc.
    switch (exclusion.pattern) {
      case 'residential_ip':
        return this.isResidentialIP(target);
      case 'healthcare_system':
        return this.isHealthcareSystem(target);
      case 'critical_infra':
        return this.isCriticalInfrastructure(target);
      case 'consumer_device':
        return this.isConsumerDevice(target);
      case 'k12_university':
        return this.isEducationalInstitution(target);
      default:
        // Custom patterns - implement based on category
        return this.matchCustomPattern(target, exclusion);
    }
  }

  private isResidentialIP(target: ExclusionTarget): boolean {
    // Check if IP is in residential ranges
    // Simplified: check for common residential ISP patterns
    const residentialIndicators = ['residential', 'dynamic', 'pool', 'dhcp'];
    const isp = target.metadata?.isp;
    if (typeof isp === 'string') {
      return residentialIndicators.some(ind => 
        isp.toLowerCase().includes(ind)
      );
    }
    return false;
  }

  private isHealthcareSystem(target: ExclusionTarget): boolean {
    const healthcareIndicators = ['hospital', 'clinic', 'medical', 'healthcare'];
    const hostname = target.hostname?.toLowerCase() || '';
    const org = target.metadata?.org;
    const orgStr = typeof org === 'string' ? org.toLowerCase() : '';
    
    return healthcareIndicators.some(ind =>
      hostname.includes(ind) || orgStr.includes(ind)
    );
  }

  private isCriticalInfrastructure(target: ExclusionTarget): boolean {
    const criticalIndicators = ['power', 'water', 'grid', 'transit', 'utility'];
    const hostname = target.hostname?.toLowerCase() || '';
    const org = target.metadata?.org;
    const orgStr = typeof org === 'string' ? org.toLowerCase() : '';
    
    return criticalIndicators.some(ind =>
      hostname.includes(ind) || orgStr.includes(ind)
    );
  }

  private isConsumerDevice(target: ExclusionTarget): boolean {
    // Consumer devices often have specific patterns
    const consumerPatterns = /^(home|personal|desktop|laptop|phone)/i;
    return consumerPatterns.test(target.hostname || '');
  }

  private isEducationalInstitution(target: ExclusionTarget): boolean {
    // Educational domains
    const eduPatterns = /\.(edu|k12|ac\.|school|university)/i;
    return eduPatterns.test(target.hostname || '');
  }

  private matchCustomPattern(target: ExclusionTarget, exclusion: Exclusion): boolean {
    // For custom patterns, use metadata matching
    if (exclusion.category === 'custom') {
      const pattern = exclusion.pattern;
      // Could be regex, CIDR, domain pattern, etc.
      // Simplified: substring match
      return target.hostname?.includes(pattern) ||
             target.ip?.includes(pattern) ||
             JSON.stringify(target.metadata).includes(pattern);
    }
    return false;
  }
}

// ============================================================================
// Types
// ============================================================================

/**
 * Target for exclusion checking.
 */
export interface ExclusionTarget {
  readonly ip?: string;
  readonly hostname?: string;
  readonly port?: number;
  readonly metadata?: Record<string, unknown>;
}

/**
 * Result of an exclusion match.
 */
export interface ExclusionMatch {
  readonly exclusion: Exclusion;
  readonly matched_pattern: string;
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Create a new exclusion with defaults.
 */
export function createExclusion(
  category: ExclusionCategory,
  pattern: string,
  rationale: string,
  addedBy: UUID
): Exclusion {
  return {
    category,
    pattern,
    rationale,
    added_by: addedBy,
    added_at: new Date().toISOString()
  };
}

/**
 * Check if an exclusion is constitutional (cannot be removed).
 */
export function isConstitutional(exclusion: Exclusion): boolean {
  return CONSTITUTIONAL_EXCLUSIONS.some(ce => ce.pattern === exclusion.pattern);
}