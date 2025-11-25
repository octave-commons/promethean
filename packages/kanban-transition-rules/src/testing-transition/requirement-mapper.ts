import type { RequirementMapping } from './types.js';

/**
 * Map tests to requirements and validate coverage.
 * @param mappings initial mappings of requirement to tests
 * @param executedTests list of executed test IDs
 * @returns updated mappings with isCovered flag
 */
export function mapRequirements(
  mappings: RequirementMapping[],
  executedTests: string[]
): RequirementMapping[] {
  return mappings.map((m) => {
    const covered = m.testIds.some((tid) => executedTests.includes(tid));
    return { ...m, isCovered: covered };
  });
}

/**
 * Validate that all requirements have coverage
 * @param mappings list of requirement mappings
 * @returns true if all requirements covered
 */
export function validateMappings(mappings: RequirementMapping[]): boolean {
  return mappings.every((m) => m.isCovered);
}