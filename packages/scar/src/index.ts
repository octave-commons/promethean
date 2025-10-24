/**
 * Main entry point for the Scar file healing system
 */

// Core types
export * from './types/index.js';

// Core functionality
export { ScarContext } from './core/scar-context.js';
export { CorruptionDetector } from './core/corruption-detector.js';
export { ScarTracker } from './core/scar-tracker.js';

// Healing strategies
export { HealingStrategyRegistry } from './core/healers/index.js';
export { FilenameHealer } from './core/healers/filename-healer.js';
export { ContentHealer } from './core/healers/content-healer.js';
export { StructureHealer } from './core/healers/structure-healer.js';
export { EncodingHealer } from './core/healers/encoding-healer.js';
export { MetadataHealer } from './core/healers/metadata-healer.js';

// CLI
export * from './cli/index.js';
