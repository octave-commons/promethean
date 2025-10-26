/**
 * Natural Language Command Parser
 *
 * A comprehensive parser for converting natural language input into structured commands
 * for the Promethean kanban system and other CLI tools.
 */

export { NaturalLanguageParser, createParser, parseCommand } from './parser.js';

export type {
  ParsedCommand,
  CommandEntity,
  CommandPattern,
  ParserConfig,
  ParseResult,
  NLPParser,
} from './types.js';

export {
  DEFAULT_PATTERNS,
  ENTITY_PATTERNS,
  COMMAND_SYNONYMS,
  FUZZY_COMMAND_MAP,
} from './patterns.js';
