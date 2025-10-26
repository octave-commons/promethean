/**
 * Natural Language Command Parser Types
 * Defines interfaces for parsing natural language commands into executable actions
 */

export interface ParsedCommand {
  /** The main command action */
  action: string;
  /** Arguments extracted from the natural language */
  args: string[];
  /** Named parameters (flags/options) */
  params: Record<string, string | boolean>;
  /** Confidence score of the parsing (0-1) */
  confidence: number;
  /** Original input text */
  originalText: string;
  /** Extracted entities */
  entities: CommandEntity[];
}

export interface CommandEntity {
  /** Type of entity (task_id, status, priority, etc.) */
  type: string;
  /** Extracted value */
  value: string;
  /** Position in original text */
  position: {
    start: number;
    end: number;
  };
  /** Confidence of entity extraction */
  confidence: number;
}

export interface CommandPattern {
  /** Pattern identifier */
  id: string;
  /** Regex pattern to match commands */
  pattern: RegExp;
  /** Template for extracting arguments */
  template: string[];
  /** Command mapping */
  command: string;
  /** Parameter mapping */
  paramMapping: Record<string, string>;
  /** Help text for this pattern */
  help: string;
  /** Examples of usage */
  examples: string[];
}

export interface ParserConfig {
  /** Minimum confidence threshold for command acceptance */
  confidenceThreshold: number;
  /** Whether to use fuzzy matching */
  enableFuzzyMatching: boolean;
  /** Maximum number of suggestions to return */
  maxSuggestions: number;
  /** Custom patterns to load */
  customPatterns?: CommandPattern[];
}

export interface ParseResult {
  /** Successfully parsed commands */
  commands: ParsedCommand[];
  /** Alternative interpretations */
  alternatives: ParsedCommand[];
  /** Unrecognized parts of input */
  unrecognized: string[];
  /** Suggestions for similar commands */
  suggestions: string[];
  /** Overall parsing confidence */
  confidence: number;
}

export interface NLPParser {
  /** Parse natural language input */
  parse(input: string): ParseResult;
  /** Add custom command pattern */
  addPattern(pattern: CommandPattern): void;
  /** Remove command pattern */
  removePattern(id: string): void;
  /** Get all available patterns */
  getPatterns(): CommandPattern[];
  /** Train parser with examples */
  train(examples: { input: string; expected: ParsedCommand }[]): void;
}
