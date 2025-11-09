/**
 * Constants used throughout the autocommit package
 */

// File limits
export const MAX_FILES_LIST = 100;
export const MAX_FALLBACK_FILES = 10;
export const MAX_DIFF_LINES = 50;

// Timing
export const DEFAULT_DEBOUNCE_MS = 10_000;
export const MIN_DEBOUNCE_MS = 1000;
export const MAX_DEBOUNCE_MS = 300_000;
export const FILE_STABILITY_THRESHOLD = 500;
export const FILE_POLL_INTERVAL = 100;

// Size limits
export const DEFAULT_MAX_DIFF_BYTES = 20_000;
export const MIN_MAX_DIFF_BYTES = 1000;
export const MAX_MAX_DIFF_BYTES = 100_000;
export const MAX_COMMIT_MESSAGE_LENGTH = 2000;
export const MAX_COMMIT_MESSAGE_LINES = 50;
export const GIT_SUBJECT_LINE_MAX = 72;

// File patterns
export const DEFAULT_IGNORE_PATTERNS = [
  '**/.git/**',
  '**/node_modules/**',
  '**/.turbo/**',
  '**/dist/**',
] as const;

export const CODE_FILE_EXTENSIONS = /\.(ts|tsx|js|jsx|mjs|cjs)$/;

// LLM settings
export const DEFAULT_TEMPERATURE = 0.2;
export const MIN_TEMPERATURE = 0;
export const MAX_TEMPERATURE = 2;

// API settings
export const DEFAULT_BASE_URL = 'http://localhost:11434/v1';
export const DEFAULT_MODEL = 'llama3.1:8b';
