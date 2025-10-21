import { mkdir, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { loadEdnFile } from './edn.js';

type UnknownRecord = Record<string, unknown>;

type DocumentRecord = Readonly<Record<string, unknown>>;

type AppRecord = Readonly<Record<string, unknown>>;

type AutomationRecord = Readonly<Record<string, unknown>>;

export type GenerateEcosystemOptions = {
  readonly inputDir?: string;
  readonly outputDir?: string;
  readonly fileName?: string;
};

export type GenerateEcosystemResult = {
  readonly apps: readonly AppRecord[];
  readonly triggers: readonly AutomationRecord[];
  readonly schedules: readonly AutomationRecord[];
  readonly actions: readonly AutomationRecord[];
  readonly files: readonly string[];
  readonly outputPath: string;
};

export const DEFAULT_OUTPUT_FILE_NAME = 'ecosystem.config.mjs';

/**
 * Security validation utilities for preventing path traversal attacks.
 */

/**
 * Validates that a path is safe and does not contain directory traversal sequences.
 *
 * @param inputPath - The path to validate
 * @param context - Context for error messages
 * @param allowRelativeTraversal - Allow .. in relative paths (default: false)
 * @throws {Error} When path contains dangerous sequences
 */
function validatePathSecurity(
  inputPath: string,
  context: string,
  allowRelativeTraversal: boolean = false,
): void {
  // Reject null bytes and other dangerous characters
  if (inputPath.includes('\0') || inputPath.includes('\r') || inputPath.includes('\n')) {
    throw new Error(`Invalid characters detected in ${context}`);
  }

  // Reject obvious path traversal attempts unless explicitly allowed for relative paths
  if (
    !allowRelativeTraversal &&
    (inputPath.includes('../') || inputPath.includes('..\\') || inputPath.includes('..'))
  ) {
    throw new Error(`Directory traversal detected in ${context}: ${inputPath}`);
  }

  // Reject encoded traversal attempts
  if (inputPath.includes('%2e%2e') || inputPath.includes('%2E%2E')) {
    throw new Error(`Encoded directory traversal detected in ${context}: ${inputPath}`);
  }

  // Reject path separator injection
  if (inputPath.includes('|') || inputPath.includes(';')) {
    throw new Error(`Path separator injection detected in ${context}: ${inputPath}`);
  }
}

/**
 * Validates that a resolved path stays within expected boundaries.
 *
 * @param resolvedPath - The resolved absolute path
 * @param basePath - The base path it should be contained within
 * @param context - Context for error messages
 * @throws {Error} When path escapes expected boundaries
 */
function validatePathBoundaries(resolvedPath: string, basePath: string, context: string): void {
  const relativePath = path.relative(basePath, resolvedPath);

  // If relative path starts with '..', it escapes the base directory
  if (relativePath.startsWith('..') || path.relative(resolvedPath, basePath).startsWith('..')) {
    throw new Error(`Path boundary violation in ${context}: ${resolvedPath} escapes ${basePath}`);
  }
}

/**
 * Sanitizes data for safe JSON serialization to prevent code injection.
 *
 * @param data - The data to sanitize
 * @returns Sanitized data safe for JSON serialization
 */
function sanitizeForJsonSerialization(data: unknown): unknown {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === 'string') {
    // Remove dangerous characters that could be used for injection
    return data
      .replace(/[\0\r\n]/g, '') // Remove null bytes and line breaks
      .replace(/<\/script/gi, '</scr\\\\ipt') // Break script tags
      .replace(/<script/gi, '<scr\\\\ipt') // Break script tags
      .replace(/javascript:/gi, 'java\\\\script:') // Break JavaScript URLs
      .replace(/on[a-zA-Z]+=/gi, 'on\\\\$1='); // Break event handlers
  }

  if (typeof data === 'number' || typeof data === 'boolean') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeForJsonSerialization(item));
  }

  if (typeof data === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      // Sanitize keys as well
      const sanitizedKey = String(key).replace(/[^\w\-_]/g, '_');
      sanitized[sanitizedKey] = sanitizeForJsonSerialization(value);
    }
    return sanitized;
  }

  // Fallback for other types
  return String(data);
}

/**
 * Generates a PM2 ecosystem configuration from EDN files.
 *
 * This function recursively discovers all `.edn` files in input directory,
 * parses them to extract application and automation configurations, normalizes
 * relative paths, and generates a PM2-compatible JavaScript module.
 *
 * @param options - Configuration options for generation
 * @param options.inputDir - Directory containing `.edn` files (default: current working directory)
 * @param options.outputDir - Output directory for generated file (default: current working directory)
 * @param options.fileName - Name of generated file (default: 'ecosystem.config.mjs')
 *
 * @returns Promise resolving to generation result containing all extracted configurations
 *
 * @example
 * ```typescript
 * // Basic usage
 * const result = await generateEcosystem();
 * console.log(`Generated ${result.outputPath} with ${result.apps.length} apps`);
 *
 * // Custom configuration
 * const result = await generateEcosystem({
 *   inputDir: './services',
 *   outputDir: './config',
 *   fileName: 'production.ecosystem.mjs'
 * });
 * ```
 *
 * @throws {Error} When input directory doesn't exist or contains invalid EDN
 * @throws {Error} When EDN documents are missing required sections
 * @throws {Error} When file system operations fail
 */
export async function generateEcosystem(
  options: GenerateEcosystemOptions = {},
): Promise<GenerateEcosystemResult> {
  const inputDir = path.resolve(options.inputDir ?? process.cwd());
  const outputDir = path.resolve(options.outputDir ?? process.cwd());
  const fileName = options.fileName ?? DEFAULT_OUTPUT_FILE_NAME;

  // SECURITY: Validate input and output directories
  validatePathSecurity(inputDir, 'input directory');
  validatePathSecurity(outputDir, 'output directory');
  validatePathSecurity(fileName, 'output filename');

  const ednFiles = await collectEdnFiles(inputDir);
  const sortedFiles = [...ednFiles].sort((first, second) =>
    first.localeCompare(second),
  ) as readonly string[];

  const documents = await loadDocuments(sortedFiles);
  const apps = documents
    .flatMap(({ file, document }) => extractApps(document, file))
    .map((app) => normalizeAppPaths(app, outputDir));
  const automations = collectAutomationSections(documents);

  await mkdir(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, fileName);

  // SECURITY: Validate output path boundaries
  validatePathBoundaries(outputPath, outputDir, 'output file path');

  await writeFile(outputPath, formatOutput({ apps, ...automations }), 'utf8');

  return { apps, ...automations, files: sortedFiles, outputPath };
}

type LoadedDocument = {
  readonly file: string;
  readonly document: DocumentRecord;
};

async function loadDocuments(files: readonly string[]): Promise<readonly LoadedDocument[]> {
  return Promise.all(
    files.map(async (file) => {
      // SECURITY: Validate each file path before loading
      validatePathSecurity(file, 'EDN file path');
      return {
        file,
        document: ensureDocumentRecord(await loadEdnFile(file), file),
      };
    }),
  );
}

/**
 * Recursively collects all `.edn` files from a directory tree with security validation.
 *
 * @param rootDir - Root directory to search for EDN files
 * @returns Promise resolving to array of absolute file paths
 *
 * @throws {Error} When directory cannot be read or contains dangerous paths
 */
async function collectEdnFiles(rootDir: string): Promise<readonly string[]> {
  // SECURITY: Validate root directory first
  validatePathSecurity(rootDir, 'root directory');

  const entries = await readdir(rootDir, { withFileTypes: true });
  const nested: readonly (readonly string[])[] = await Promise.all(
    entries.map(async (entry): Promise<readonly string[]> => {
      const fullPath = path.join(rootDir, entry.name);

      // SECURITY: Validate each path before processing
      validatePathSecurity(fullPath, `directory entry: ${entry.name}`);

      if (entry.isDirectory()) {
        // SECURITY: Prevent infinite recursion and boundary violations
        const relativePath = path.relative(rootDir, fullPath);
        if (relativePath.startsWith('..')) {
          throw new Error(`Directory traversal detected in recursive scan: ${fullPath}`);
        }

        // SECURITY: Limit recursion depth to prevent denial of service
        const depth = relativePath.split(path.sep).length;
        if (depth > 10) {
          throw new Error(`Directory depth limit exceeded: ${depth} levels in ${fullPath}`);
        }

        return collectEdnFiles(fullPath);
      }

      // SECURITY: Only process .edn files, reject everything else
      if (entry.isFile() && entry.name.endsWith('.edn')) {
        // SECURITY: Additional validation for EDN files
        if (entry.name.includes('..') || entry.name.includes('/') || entry.name.includes('\\')) {
          throw new Error(`Invalid EDN filename detected: ${entry.name}`);
        }
        return [fullPath];
      }

      return [];
    }),
  );
  return nested.reduce<readonly string[]>(
    (accumulator, current) => [...accumulator, ...current],
    [],
  );
}

/**
 * Extracts application configurations from an EDN document.
 *
 * @param value - The parsed EDN document
 * @param source - Source file path for error reporting
 * @returns Array of application records
 *
 * @throws {Error} When document is missing :apps vector or contains invalid app definitions
 */
function extractApps(value: DocumentRecord, source: string): readonly AppRecord[] {
  const appsValue = value.apps;
  if (!Array.isArray(appsValue)) {
    throw new Error(`EDN document ${source} is missing an :apps vector.`);
  }

  return appsValue.map((item, index) => {
    if (!isRecord(item)) {
      throw new Error(`App at index ${index} in ${source} is not a map.`);
    }
    return item as AppRecord;
  });
}

function ensureDocumentRecord(value: unknown, source: string): DocumentRecord {
  if (!isRecord(value)) {
    throw new Error(`EDN document ${source} did not evaluate to a map.`);
  }
  return value as DocumentRecord;
}

function isRecord(value: unknown): value is UnknownRecord {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

type AutomationSection = 'triggers' | 'schedules' | 'actions';

function extractAutomationSection(
  value: DocumentRecord,
  source: string,
  section: AutomationSection,
): readonly AutomationRecord[] {
  const raw = value[section];
  if (raw === undefined) {
    return [];
  }
  if (!Array.isArray(raw)) {
    throw new Error(`:${section} in ${source} must be a vector.`);
  }
  return raw.map((item, index) => {
    if (!isRecord(item)) {
      throw new Error(`Entry at index ${index} in :${section} of ${source} is not a map.`);
    }
    const record: AutomationRecord = Object.freeze({ ...item });
    return record;
  });
}

type AutomationCollections = {
  readonly triggers: readonly AutomationRecord[];
  readonly schedules: readonly AutomationRecord[];
  readonly actions: readonly AutomationRecord[];
};

function collectAutomationSections(documents: readonly LoadedDocument[]): AutomationCollections {
  return {
    triggers: documents.flatMap(({ file, document }) =>
      extractAutomationSection(document, file, 'triggers'),
    ),
    schedules: documents.flatMap(({ file, document }) =>
      extractAutomationSection(document, file, 'schedules'),
    ),
    actions: documents.flatMap(({ file, document }) =>
      extractAutomationSection(document, file, 'actions'),
    ),
  };
}

/**
 * Normalizes relative paths in an application configuration against base directory.
 *
 * This function processes the following path fields with security validation:
 * - `cwd`: Current working directory
 * - `script`: Script file path
 * - `env_file`: Environment file path
 * - `watch`: Watch directories/files (string or array)
 * - `env`: Environment variables with string values
 *
 * @param app - Application configuration to normalize
 * @param baseDir - Base directory for resolving relative paths
 * @returns Application configuration with normalized paths
 */
function normalizeAppPaths(app: AppRecord, baseDir: string): AppRecord {
  const cwd = typeof app.cwd === 'string' ? resolveRelativePath(app.cwd, baseDir) : undefined;

  const script =
    typeof app.script === 'string' ? resolveRelativePath(app.script, baseDir) : undefined;

  const envFile =
    typeof app.env_file === 'string' ? resolveRelativePath(app.env_file, baseDir) : undefined;

  const watch =
    typeof app.watch === 'string'
      ? resolveRelativePath(app.watch, baseDir)
      : isReadonlyArray(app.watch)
        ? app.watch.map((item) =>
            typeof item === 'string' ? resolveRelativePath(item, baseDir) : item,
          )
        : undefined;

  const env = isRecord(app.env)
    ? Object.fromEntries(
        Object.entries(app.env).map(([key, value]) => [
          key,
          typeof value === 'string' ? resolveRelativePath(value, baseDir) : value,
        ]),
      )
    : undefined;

  return {
    ...app,
    ...(cwd === undefined ? {} : { cwd }),
    ...(script === undefined ? {} : { script }),
    ...(envFile === undefined ? {} : { env_file: envFile }),
    ...(watch === undefined ? {} : { watch }),
    ...(env === undefined ? {} : { env }),
  } as AppRecord;
}

/**
 * Resolves a relative path against a base directory and normalizes it with security validation.
 *
 * @param value - Path to resolve (must be relative)
 * @param baseDir - Base directory for resolution
 * @returns Normalized relative path
 *
 * @throws {Error} When path is not relative or contains dangerous sequences
 */
function resolveRelativePath(value: string, baseDir: string): string {
  // SECURITY: Validate input path first, allowing relative traversal for legitimate paths
  validatePathSecurity(value, 'relative path for resolution', true);

  if (!isRelativePath(value)) {
    return value;
  }

  const absolutePath = path.resolve(baseDir, value);

  // SECURITY: Validate that resolved path stays within bounds
  validatePathBoundaries(absolutePath, baseDir, 'resolved path');

  const relativePath = path.relative(baseDir, absolutePath);

  return normalizeRelativePath(relativePath);
}

function isRelativePath(value: string): boolean {
  return value.startsWith('./') || value.startsWith('../');
}

function isReadonlyArray(value: unknown): value is readonly unknown[] {
  return Array.isArray(value);
}

function normalizeRelativePath(value: string): string {
  if (value === '') {
    return '.';
  }

  const posixPath = value.split(path.sep).join(path.posix.sep);

  // SECURITY: Additional validation for normalized paths
  if (posixPath.includes('../') || posixPath === '..') {
    throw new Error(`Path traversal detected in normalized path: ${posixPath}`);
  }

  if (posixPath === '.' || posixPath.startsWith('./')) {
    return posixPath;
  }

  return `./${posixPath}`;
}

type FormatOutputSections = {
  readonly apps: readonly AppRecord[];
  readonly triggers: readonly AutomationRecord[];
  readonly schedules: readonly AutomationRecord[];
  readonly actions: readonly AutomationRecord[];
};

function formatOutput({ apps, triggers, schedules, actions }: FormatOutputSections): string {
  // SECURITY: Sanitize all data before JSON serialization
  const sanitizedApps = sanitizeForJsonSerialization(apps);
  const sanitizedTriggers = sanitizeForJsonSerialization(triggers);
  const sanitizedSchedules = sanitizeForJsonSerialization(schedules);
  const sanitizedActions = sanitizeForJsonSerialization(actions);

  const lines = [
    '// Generated by @promethean/shadow-conf',
    'import dotenv from "dotenv";',
    '',
    'try {',
    '  dotenv.config();',
    '} catch (error) {',
    '  if (error?.code !== "ERR_MODULE_NOT_FOUND") {',
    '    throw error;',
    '  }',
    '}',
    '',
    'export const apps = ',
    `${JSON.stringify(sanitizedApps, null, 2)};`,
    '',
    'export const triggers = ',
    `${JSON.stringify(sanitizedTriggers, null, 2)};`,
    '',
    'export const schedules = ',
    `${JSON.stringify(sanitizedSchedules, null, 2)};`,
    '',
    'export const actions = ',
    `${JSON.stringify(sanitizedActions, null, 2)};`,
    '',
  ];

  return lines.join('\n');
}
