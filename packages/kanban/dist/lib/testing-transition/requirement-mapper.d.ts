import type { RequirementMapping } from './types.js';
/**
 * Map tests to requirements and validate coverage.
 * @param mappings initial mappings of requirement to tests
 * @param executedTests list of executed test IDs
 * @returns updated mappings with isCovered flag
 */
export declare function mapRequirements(mappings: RequirementMapping[], executedTests: string[]): RequirementMapping[];
/**
 * Validate that all requirements have coverage
 * @param mappings list of requirement mappings
 * @returns true if all requirements covered
 */
export declare function validateMappings(mappings: RequirementMapping[]): boolean;
//# sourceMappingURL=requirement-mapper.d.ts.map