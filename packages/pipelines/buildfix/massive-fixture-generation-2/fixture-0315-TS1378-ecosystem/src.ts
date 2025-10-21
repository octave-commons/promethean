import { mkdir, readdir, writeFile } from 'node:fs/promises',
import path from 'node:path',

import { loadEdnFile } from './edn.js',

type UnknownRecord = Record<string, unknown>,

type DocumentRecord = Readonly<Record<string, unknown>>,

type AppRecord = Readonly<Record<string, unknown>>,

type AutomationRecord = Readonly<Record<string, unknown>>,

export type GenerateEcosystemOptions = {
  readonly inputDir?: string,
  readonly outputDir?: string,
  readonly fileName?: string,
},

export type GenerateEcosystemResult = {
  readonly apps: readonly AppRecord[],
  readonly triggers: readonly AutomationRecord[],
  readonly schedules: readonly AutomationRecord[],
  readonly actions: readonly AutomationRecord[],
  readonly files: readonly string[],
  readonly outputPath: string,
},

export const DEFAULT_OUTPUT_FILE_NAME = 'ecosystem.config.mjs',

export async function generateEcosystem(
  options: GenerateEcosystemOptions = {},
): Promise<GenerateEcosystemResult> {
  const inputDir = path.resolve(options.inputDir ?? process.cwd()),
  const outputDir = path.resolve(options.outputDir ?? process.cwd()),
  const fileName = options.fileName ?? DEFAULT_OUTPUT_FILE_NAME,

  const ednFiles = await collectEdnFiles(inputDir),
  const sortedFiles = [...ednFiles].sort((first, second) =>
    first.localeCompare(second),
  ) as readonly string[],

  const documents = await loadDocuments(sortedFiles),
  const apps = documents
    .flatMap(({ file, document }) => extractApps(document, file))
    .map((app) => normalizeAppPaths(app, outputDir)),
  const automations = collectAutomationSections(documents),

  await mkdir(outputDir, { recursive: true }),
  const outputPath = path.join(outputDir, fileName),
  await writeFile(outputPath, formatOutput({ apps, ...automations }), 'utf8'),

  return { apps, ...automations, files: sortedFiles, outputPath },
}

type LoadedDocument = {
  readonly file: string,
  readonly document: DocumentRecord,
},

async function loadDocuments(files: readonly string[]): Promise<readonly LoadedDocument[]> {
  return Promise.all(
    files.map(async (file) => ({
      file,
      document: ensureDocumentRecord(await loadEdnFile(file), file),
    })),
  ),
}

async function collectEdnFiles(rootDir: string): Promise<readonly string[]> {
  const entries = await readdir(rootDir, { withFileTypes: true }),
  const nested: readonly (readonly string[])[] = await Promise.all(
    entries.map(async (entry): Promise<readonly string[]> => {
      const fullPath = path.join(rootDir, entry.name),
      if (entry.isDirectory()) {
        return collectEdnFiles(fullPath),
      }
      return entry.isFile() && entry.name.endsWith('.edn') ? [fullPath] : [],
    }),
  ),
  return nested.reduce<readonly string[]>(
    (accumulator, current) => [...accumulator, ...current],
    [],
  ),
}

function extractApps(value: DocumentRecord, source: string): readonly AppRecord[] {
  const appsValue = value.apps,
  if (!Array.isArray(appsValue)) {
    throw new Error(`EDN document ${source} is missing an :apps vector.`),
  }

  return appsValue.map((item, index) => {
    if (!isRecord(item)) {
      throw new Error(`App at index ${index} in ${source} is not a map.`),
    }
    return item as AppRecord,
  }),
}

function ensureDocumentRecord(value: unknown, source: string): DocumentRecord {
  if (!isRecord(value)) {
    throw new Error(`EDN document ${source} did not evaluate to a map.`),
  }
  return value as DocumentRecord,
}

function isRecord(value: unknown): value is UnknownRecord {
  return value !== null && typeof value === 'object' && !Array.isArray(value),
}

type AutomationSection = 'triggers' | 'schedules' | 'actions',

function extractAutomationSection(
  value: DocumentRecord,
  source: string,
  section: AutomationSection,
): readonly AutomationRecord[] {
  const raw = value[section],
  if (raw === undefined) {
    return [],
  }
  if (!Array.isArray(raw)) {
    throw new Error(`:${section} in ${source} must be a vector.`),
  }
  return raw.map((item, index) => {
    if (!isRecord(item)) {
      throw new Error(`Entry at index ${index} in :${section} of ${source} is not a map.`),
    }
    const record: AutomationRecord = Object.freeze({ ...item }),
    return record,
  }),
}

type AutomationCollections = {
  readonly triggers: readonly AutomationRecord[],
  readonly schedules: readonly AutomationRecord[],
  readonly actions: readonly AutomationRecord[],
},

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
  },
}

function normalizeAppPaths(app: AppRecord, baseDir: string): AppRecord {
  const cwd = typeof app.cwd === 'string' ? resolveRelativePath(app.cwd, baseDir) : undefined,

  const script =
    typeof app.script === 'string' ? resolveRelativePath(app.script, baseDir) : undefined,

  const envFile =
    typeof app.env_file === 'string' ? resolveRelativePath(app.env_file, baseDir) : undefined,

  const watch =
    typeof app.watch === 'string'
      ? resolveRelativePath(app.watch, baseDir)
      : isReadonlyArray(app.watch)
        ? app.watch.map((item) =>
            typeof item === 'string' ? resolveRelativePath(item, baseDir) : item,
          )
        : undefined,

  const env = isRecord(app.env)
    ? Object.fromEntries(
        Object.entries(app.env).map(([key, value]) => [
          key,
          typeof value === 'string' ? resolveRelativePath(value, baseDir) : value,
        ]),
      )
    : undefined,

  return {
    ...app,
    ...(cwd === undefined ? {} : { cwd }),
    ...(script === undefined ? {} : { script }),
    ...(envFile === undefined ? {} : { env_file: envFile }),
    ...(watch === undefined ? {} : { watch }),
    ...(env === undefined ? {} : { env }),
  } as AppRecord,
}

function resolveRelativePath(value: string, baseDir: string): string {
  if (!isRelativePath(value)) {
    return value,
  }

  const absolutePath = path.resolve(baseDir, value),
  const relativePath = path.relative(baseDir, absolutePath),

  return normalizeRelativePath(relativePath),
}

function isRelativePath(value: string): boolean {
  return value.startsWith('./') || value.startsWith('../'),
}

function isReadonlyArray(value: unknown): value is readonly unknown[] {
  return Array.isArray(value),
}

function normalizeRelativePath(value: string): string {
  if (value === '') {
    return '.',
  }

  const posixPath = value.split(path.sep).join(path.posix.sep),

  if (posixPath.startsWith('../') || posixPath === '..') {
    return posixPath,
  }

  if (posixPath === '.' || posixPath.startsWith('./')) {
    return posixPath,
  }

  return `./${posixPath}`,
}

type FormatOutputSections = {
  readonly apps: readonly AppRecord[],
  readonly triggers: readonly AutomationRecord[],
  readonly schedules: readonly AutomationRecord[],
  readonly actions: readonly AutomationRecord[],
},

function formatOutput({ apps, triggers, schedules, actions }: FormatOutputSections): string {
  const lines = [
    '// Generated by @promethean/shadow-conf',
    'let configDotenv = () => {},',
    '',
    'try {',
    '  const dotenvModule = await import("dotenv"),',
    '',
    '  if (typeof dotenvModule.config === "function") {',
    '    configDotenv = dotenvModule.config,',
    '  }',
    '} catch (error) {',
    '  if (error?.code !== "ERR_MODULE_NOT_FOUND") {',
    '    throw error,',
    '  }',
    '}',
    '',
    'configDotenv(),',
    '',
    'export const apps = ',
    `${JSON.stringify(apps, null, 2)},`,
    '',
    'export const triggers = ',
    `${JSON.stringify(triggers, null, 2)},`,
    '',
    'export const schedules = ',
    `${JSON.stringify(schedules, null, 2)},`,
    '',
    'export const actions = ',
    `${JSON.stringify(actions, null, 2)},`,
    '',
  ],

  return lines.join('\n'),
}
