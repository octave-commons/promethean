/**
 * Task content parser and analyzer
 * Handles markdown parsing, section extraction, and content validation
 */
import { TaskSection, TaskValidationResult } from './types.js';
/**
 * Parse markdown content into sections and frontmatter
 */
export declare function parseTaskContent(content: string): {
    frontmatter: Record<string, any>;
    body: string;
    sections: TaskSection[];
};
/**
 * Find a specific section by header
 */
export declare function findSection(sections: TaskSection[], header: string): TaskSection | null;
/**
 * Validate task structure and content
 */
export declare function validateTaskContent(content: string): TaskValidationResult;
/**
 * Analyze task content for quality metrics
 */
export declare function analyzeTaskContent(content: string): {
    sections: TaskSection[];
    frontmatter: Record<string, any>;
    wordCount: number;
    readingTime: number;
    completeness: number;
    qualityScore: number;
};
/**
 * Create a backup of the original file
 */
export declare function createBackup(filePath: string): Promise<string>;
/**
 * Update timestamp in frontmatter
 */
export declare function updateTimestamp(frontmatter: Record<string, any>): Record<string, any>;
/**
 * Generate a simple diff between two texts
 */
export declare function generateDiff(before: string, after: string): string;
//# sourceMappingURL=parser.d.ts.map