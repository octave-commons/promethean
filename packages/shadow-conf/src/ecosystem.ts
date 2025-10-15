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
 * Generates a PM2 ecosystem configuration from EDN files.
 *
 * This function recursively discovers all `.edn` files in the input directory,
 * parses them to extract application and automation configurations, normalizes
 * relative paths, and generates a PM2-compatible JavaScript module.
 *
 * @param options - Configuration options for generation
 * @param options.inputDir - Directory containing `.edn` files (default: current working directory)
 * @param options.outputDir - Output directory for generated file (default: current working directory)
 * @param options.fileName - Name of the generated file (default: 'ecosystem.config.mjs')
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
  await writeFile(outputPath, formatOutput({ apps, ...automations }), 'utf8');

  return { apps, ...automations, files: sortedFiles, outputPath };
}

type LoadedDocument = {
  readonly file: string;
  readonly document: DocumentRecord;
};

async function loadDocuments(files: readonly string[]): Promise<readonly LoadedDocument[]> {
  return Promise.all(
    files.map(async (file) => ({
      file,
      document: ensureDocumentRecord(await loadEdnFile(file), file),
    })),
  );
}

/**
 * Recursively collects all `.edn` files from a directory tree.
 *
 * @param rootDir - Root directory to search for EDN files
 * @returns Promise resolving to array of absolute file paths
 *
 * @throws {Error} When directory cannot be read
 */
/**
 * Validates that a path is safe and doesn't escape the intended directory.
 *
 * @param requestedPath - The path to validate
 * @param allowedBase - The base directory that the path must stay within
 * @throws {Error} When path attempts directory traversal
 */
function validatePathSecurity(requestedPath: string, allowedBase: string): void {
  const resolvedPath = path.resolve(requestedPath);
  const resolvedBase = path.resolve(allowedBase);

  if (!resolvedPath.startsWith(resolvedBase)) {
    throw new Error(
      `Path traversal detected: ${requestedPath} attempts to access outside ${allowedBase}`,
    );
  }
}

/**
 * Safely joins path components while preventing directory traversal.
 *
 * @param base - The base directory
 * @param name - The file or directory name to join
 * @returns Safe joined path
 * @throws {Error} When path traversal is detected
 */
function safePathJoin(base: string, name: string): string {
  // Reject obvious traversal attempts
  if (
    name.includes('..') ||
    (name.includes(path.sep) === false && name.includes('/')) ||
    name.includes('\\')
  ) {
    throw new Error(`Unsafe path component detected: ${name}`);
  }

  const fullPath = path.join(base, name);
  validatePathSecurity(fullPath, base);
  return fullPath;
}

async function collectEdnFiles(rootDir: string): Promise<readonly string[]> {
  // Validate the root directory itself
  validatePathSecurity(rootDir, rootDir);

  const entries = await readdir(rootDir, { withFileTypes: true });
  const nested: readonly (readonly string[])[] = await Promise.all(
    entries.map(async (entry): Promise<readonly string[]> => {
      try {
        const fullPath = safePathJoin(rootDir, entry.name);
        if (entry.isDirectory()) {
          return collectEdnFiles(fullPath);
        }
        return entry.isFile() && entry.name.endsWith('.edn') ? [fullPath] : [];
      } catch {
        // Skip suspicious entries but log the issue
        console.warn(`Skipping suspicious entry: ${entry.name} in ${rootDir}`);
        return [];
      }
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
 * Normalizes relative paths in an application configuration against the base directory.
 *
 * This function processes the following path fields:
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
 * Resolves a relative path against a base directory and normalizes it.
 *
 * @param value - Path to resolve (must be relative)
 * @param baseDir - Base directory for resolution
 * @returns Normalized relative path
 *
 * @throws {Error} When path is not relative
 */
function resolveRelativePath(value: string, baseDir: string): string {
  if (!isRelativePath(value)) {
    return value;
  }

  const absolutePath = path.resolve(baseDir, value);
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

  if (posixPath.startsWith('../') || posixPath === '..') {
    return posixPath;
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
  const lines = [
    '// Generated by @promethean/shadow-conf',
    'let configDotenv = () => {};',
    '',
    'try {',
    '  const dotenvModule = await import("dotenv");',
    '',
    '  if (typeof dotenvModule.config === "function") {',
    '    configDotenv = dotenvModule.config;',
    '  }',
    '} catch (error) {',
    '  if (error?.code !== "ERR_MODULE_NOT_FOUND") {',
    '    throw error;',
    '  }',
    '}',
    '',
    'configDotenv();',
    '',
    'export const apps = ',
    `${JSON.stringify(apps, null, 2)};`,
    '',
    'export const triggers = ',
    `${JSON.stringify(triggers, null, 2)};`,
    '',
    'export const schedules = ',
    `${JSON.stringify(schedules, null, 2)};`,
    '',
    'export const actions = ',
    `${JSON.stringify(actions, null, 2)};`,
    '',
  ];

  return lines.join('\n');
}
