import { mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { loadEdnFile } from "./edn.js";

type UnknownRecord = Record<string, unknown>;

type AppRecord = Readonly<Record<string, unknown>>;

export type GenerateEcosystemOptions = {
  readonly inputDir?: string;
  readonly outputDir?: string;
  readonly fileName?: string;
};

export type GenerateEcosystemResult = {
  readonly apps: readonly AppRecord[];
  readonly files: readonly string[];
  readonly outputPath: string;
};

export const DEFAULT_OUTPUT_FILE_NAME = "ecosystem.config.js";

export async function generateEcosystem(
  options: GenerateEcosystemOptions = {},
): Promise<GenerateEcosystemResult> {
  const inputDir = path.resolve(options.inputDir ?? process.cwd());
  const outputDir = path.resolve(options.outputDir ?? process.cwd());
  const fileName = options.fileName ?? DEFAULT_OUTPUT_FILE_NAME;

  const ednFiles: readonly string[] = await collectEdnFiles(inputDir);
  const sortedFiles = [...ednFiles].sort((first, second) =>
    first.localeCompare(second),
  ) as readonly string[];

  const documents: readonly {
    readonly file: string;
    readonly document: unknown;
  }[] = await Promise.all(
    sortedFiles.map(async (file) => ({
      file,
      document: await loadEdnFile(file),
    })),
  );

  const apps = documents
    .flatMap(({ file, document }) => extractApps(document, file))
    .map((app) => normalizeAppPaths(app, outputDir));

  await mkdir(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, fileName);
  await writeFile(outputPath, formatOutput(apps), "utf8");

  return { apps, files: sortedFiles, outputPath };
}

async function collectEdnFiles(rootDir: string): Promise<readonly string[]> {
  const entries = await readdir(rootDir, { withFileTypes: true });
  const nested: readonly (readonly string[])[] = await Promise.all(
    entries.map(async (entry): Promise<readonly string[]> => {
      const fullPath = path.join(rootDir, entry.name);
      if (entry.isDirectory()) {
        return collectEdnFiles(fullPath);
      }
      return entry.isFile() && entry.name.endsWith(".edn") ? [fullPath] : [];
    }),
  );
  return nested.reduce<readonly string[]>(
    (accumulator, current) => [...accumulator, ...current],
    [],
  );
}

function extractApps(value: unknown, source: string): readonly AppRecord[] {
  if (!isRecord(value)) {
    throw new Error(`EDN document ${source} did not evaluate to a map.`);
  }

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

function isRecord(value: unknown): value is UnknownRecord {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function normalizeAppPaths(app: AppRecord, baseDir: string): AppRecord {
  const cwd =
    typeof app.cwd === "string"
      ? resolveRelativePath(app.cwd, baseDir)
      : undefined;

  const script =
    typeof app.script === "string"
      ? resolveRelativePath(app.script, baseDir)
      : undefined;

  const envFile =
    typeof app.env_file === "string"
      ? resolveRelativePath(app.env_file, baseDir)
      : undefined;

  const watch =
    typeof app.watch === "string"
      ? resolveRelativePath(app.watch, baseDir)
      : Array.isArray(app.watch)
        ? app.watch.map((item) =>
            typeof item === "string"
              ? resolveRelativePath(item, baseDir)
              : item,
          )
        : undefined;

  const env = isRecord(app.env)
    ? Object.fromEntries(
        Object.entries(app.env).map(([key, value]) => [
          key,
          typeof value === "string"
            ? resolveRelativePath(value, baseDir)
            : value,
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

function resolveRelativePath(value: string, baseDir: string): string {
  if (!isRelativePath(value)) {
    return value;
  }

  const absolutePath = path.resolve(baseDir, value);
  const relativePath = path.relative(baseDir, absolutePath);

  return normalizeRelativePath(relativePath);
}

function isRelativePath(value: string): boolean {
  return value.startsWith("./") || value.startsWith("../");
}

function normalizeRelativePath(value: string): string {
  if (value === "") {
    return ".";
  }

  const posixPath = value.split(path.sep).join(path.posix.sep);

  if (posixPath.startsWith("../") || posixPath === "..") {
    return posixPath;
  }

  if (posixPath === "." || posixPath.startsWith("./")) {
    return posixPath;
  }

  return `./${posixPath}`;
}

function formatOutput(apps: readonly AppRecord[]): string {
  const lines = [
    "// Generated by @promethean/shadow-conf",
    'import { config as configDotenv } from "dotenv";',
    "",
    "configDotenv();",
    "",
    "export const apps = ",
    `${JSON.stringify(apps, null, 2)};`,
    "",
  ];

  return lines.join("\n");
}
