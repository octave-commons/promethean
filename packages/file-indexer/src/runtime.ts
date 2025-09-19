import { readFile } from "fs/promises";
import * as path from "path";

import { listFilesRec } from "@promethean/utils";

import {
  type IndexedFile,
  type MaybePromise,
  type ScanFilesOptions,
  type ScanFilesResult,
  type ScanProgress,
} from "./types.js";

export type ProcessState = Readonly<{
  processed: number;
  collected: readonly IndexedFile[];
  batch: readonly IndexedFile[];
}>;

export type ProcessDependencies = Readonly<{
  shouldCollect: boolean;
  normalizedBatchSize: number;
  shouldRead: (filePath: string) => Promise<boolean>;
  encoding: BufferEncoding;
  onFile?: (file: IndexedFile, progress: ScanProgress) => MaybePromise<void>;
  onBatch?: (
    batch: readonly IndexedFile[],
    progress: ScanProgress,
  ) => MaybePromise<void>;
  onProgress?: (progress: ScanProgress) => void;
  total: number;
  signal?: AbortSignal;
}>;

type BuildDependenciesArgs = Readonly<{
  shouldCollect: boolean;
  normalizedBatchSize: number;
  shouldRead: (filePath: string) => Promise<boolean>;
  encoding: BufferEncoding;
  onFile?: ProcessDependencies["onFile"];
  onBatch?: ProcessDependencies["onBatch"];
  onProgress?: ProcessDependencies["onProgress"];
  total: number;
  signal?: AbortSignal;
}>;

type BuildResultArgs = Readonly<{
  total: number;
  processed: number;
  durationMs: number;
  collected: readonly IndexedFile[];
  shouldCollect: boolean;
}>;

type FlushArgs = Readonly<{
  batch: readonly IndexedFile[];
  onBatch?: ProcessDependencies["onBatch"];
  progress: ScanProgress;
}>;

export async function computeTargetFiles(
  root: string,
  exts: Iterable<string> | undefined,
  ignoreDirs: Iterable<string> | undefined,
): Promise<readonly string[]> {
  const extSet = normalizeExtensions(exts);
  const allFiles = await listFilesRec(root, extSet);
  const shouldIgnore = createIgnorePredicate(root, ignoreDirs);
  return allFiles.filter((filePath) => !shouldIgnore(filePath));
}

export function buildDependencies(
  args: BuildDependenciesArgs,
): ProcessDependencies {
  return {
    shouldCollect: args.shouldCollect,
    normalizedBatchSize: args.normalizedBatchSize,
    shouldRead: args.shouldRead,
    encoding: args.encoding,
    total: args.total,
    ...(args.signal ? { signal: args.signal } : {}),
    ...(args.onFile ? { onFile: args.onFile } : {}),
    ...(args.onBatch ? { onBatch: args.onBatch } : {}),
    ...(args.onProgress ? { onProgress: args.onProgress } : {}),
  };
}

export function processFiles(
  files: readonly string[],
  dependencies: ProcessDependencies,
): Promise<ProcessState> {
  return files.reduce(
    (promise, filePath) =>
      promise.then((state) => processSingleFile(dependencies, state, filePath)),
    Promise.resolve<ProcessState>({ processed: 0, collected: [], batch: [] }),
  );
}

export function buildResult(args: BuildResultArgs): ScanFilesResult {
  if (args.shouldCollect) {
    return {
      total: args.total,
      processed: args.processed,
      durationMs: args.durationMs,
      files: args.collected,
    };
  }
  return {
    total: args.total,
    processed: args.processed,
    durationMs: args.durationMs,
  };
}

export function createContentPredicate(
  readContent?: boolean | ((filePath: string) => MaybePromise<boolean>),
): (filePath: string) => Promise<boolean> {
  if (typeof readContent === "function") {
    return (filePath: string) =>
      Promise.resolve(readContent(filePath)).then((value) => Boolean(value));
  }
  if (readContent) {
    return async () => true;
  }
  return async () => false;
}

export function normalizeBatchSize(
  batchSize: number | undefined,
  onBatch?: ScanFilesOptions["onBatch"],
): number {
  if (!onBatch) {
    return 1;
  }
  if (typeof batchSize === "number" && Number.isFinite(batchSize)) {
    const floored = Math.floor(batchSize);
    if (floored > 0) {
      return floored;
    }
  }
  return 50;
}

export function toProgress(processed: number, total: number): ScanProgress {
  if (total === 0) {
    return { processed, total, percentage: 1 };
  }
  return {
    processed,
    total,
    percentage: processed / total,
  };
}

export function ensureNotAborted(signal?: AbortSignal): void {
  if (!signal) {
    return;
  }
  if (typeof signal.throwIfAborted === "function") {
    signal.throwIfAborted();
    return;
  }
  if (signal.aborted) {
    const reason: unknown = signal.reason ?? "Aborted";
    if (reason instanceof Error) {
      throw reason;
    }
    throw new Error(typeof reason === "string" ? reason : "Aborted");
  }
}

export async function flushBatch(args: FlushArgs): Promise<void> {
  const { batch, onBatch, progress } = args;
  if (!onBatch || batch.length === 0) {
    return;
  }
  await onBatch(batch, progress);
}

async function processSingleFile(
  dependencies: ProcessDependencies,
  state: ProcessState,
  filePath: string,
): Promise<ProcessState> {
  ensureNotAborted(dependencies.signal);

  const fileEntry = await createIndexedFile(
    filePath,
    dependencies.shouldRead,
    dependencies.encoding,
  );
  const processedCount = state.processed + 1;
  const progress = toProgress(processedCount, dependencies.total);

  const collected = dependencies.shouldCollect
    ? state.collected.concat(fileEntry)
    : state.collected;

  if (dependencies.onFile) {
    await dependencies.onFile(fileEntry, progress);
  }
  if (dependencies.onProgress) {
    dependencies.onProgress(progress);
  }

  if (!dependencies.onBatch) {
    return { processed: processedCount, collected, batch: [] };
  }

  const updatedBatch = state.batch.concat(fileEntry);
  if (updatedBatch.length >= dependencies.normalizedBatchSize) {
    await dependencies.onBatch(updatedBatch, progress);
    return { processed: processedCount, collected, batch: [] };
  }

  return { processed: processedCount, collected, batch: updatedBatch };
}

async function createIndexedFile(
  filePath: string,
  shouldRead: (filePath: string) => Promise<boolean>,
  encoding: BufferEncoding,
): Promise<IndexedFile> {
  const includeContent = await shouldRead(filePath);
  if (!includeContent) {
    return { path: filePath };
  }
  const content = await readFile(filePath, encoding);
  return { path: filePath, content };
}

function normalizeExtensions(exts?: Iterable<string>): Set<string> {
  if (!exts) {
    return new Set<string>();
  }
  return new Set(
    Array.from(exts)
      .map((raw) => raw?.trim())
      .filter(isNonEmpty)
      .map((value) =>
        value.startsWith(".") ? value.toLowerCase() : `.${value.toLowerCase()}`,
      ),
  );
}

function createIgnorePredicate(root: string, ignoreDirs?: Iterable<string>) {
  const segmentsList = normalizeIgnoreSegments(root, ignoreDirs);
  if (segmentsList.length === 0) {
    return () => false;
  }

  const nameSet = new Set(
    segmentsList
      .filter((segments) => segments.length === 1)
      .map((segments) => segments[0] ?? ""),
  );
  const pathSet = new Set(
    segmentsList
      .filter((segments) => segments.length > 1)
      .map((segments) => segments.join(path.sep)),
  );

  if (nameSet.size === 0 && pathSet.size === 0) {
    return () => false;
  }

  return (filePath: string) => {
    const relDir = path.relative(root, path.dirname(filePath));
    if (relDir.startsWith("..")) {
      return false;
    }

    const parts = relDir.split(path.sep).filter(Boolean);
    if (parts.length === 0) {
      return pathSet.has("");
    }

    return parts.some((_, index) => {
      const segment = parts[index] ?? "";
      const prefix = parts.slice(0, index + 1).join(path.sep);
      return nameSet.has(segment) || pathSet.has(prefix);
    });
  };
}

function normalizeIgnoreSegments(
  root: string,
  ignoreDirs?: Iterable<string>,
): readonly string[][] {
  if (!ignoreDirs) {
    return [];
  }
  return (
    Array.from(ignoreDirs)
      .map((value) => value?.trim())
      .filter(isNonEmpty)
      .map(trimTrailingSeparators)
      //.map(trimTrailingSlashes)
      .filter(isNonEmpty)
      .map((value) =>
        path.isAbsolute(value) ? path.relative(root, value) : value,
      )
      .map(trimLeadingDotsAndSeparators)
      .filter(isNonEmpty)
      .map((value) => path.normalize(value))
      .filter((value) => value.length > 0 && !value.startsWith(".."))
      .map((value) => value.split(path.sep).filter(Boolean))
  );
}

function trimTrailingSeparators(value: string): string {
  if (value.length === 0) {
    return value;
  }
  const code = value.charCodeAt(value.length - 1);
  if (code === 47 || code === 92) {
    return trimTrailingSeparators(value.slice(0, -1));
  }
  return value;
}

function trimLeadingDotsAndSeparators(value: string): string {
  if (value.length === 0) {
    return value;
  }
  const code = value.charCodeAt(0);
  if (code === 46 || code === 47 || code === 92) {
    return trimLeadingDotsAndSeparators(value.slice(1));
  }
  return value;
}

function isNonEmpty(value: string | undefined | null): value is string {
  return typeof value === "string" && value.length > 0;
}
