import { readFile } from "fs/promises";

import type { ReadonlyDeep } from "type-fest";
import { listFilesRec } from "@promethean/utils";

import {
  type IndexedFile,
  type MaybePromise,
  type ScanFilesOptions,
  type ScanFilesResult,
  type ScanProgress,
} from "./types.js";
import { createIgnorePredicate, normalizeExtensions } from "./path-utils.js";

export type ProcessState = ReadonlyDeep<{
  processed: number;
  collected: ReadonlyArray<IndexedFile>;
  batch: ReadonlyArray<IndexedFile>;
}>;

export type ProcessDependencies = ReadonlyDeep<{
  shouldCollect: boolean;
  normalizedBatchSize: number;
  shouldRead: (filePath: string) => Promise<boolean>;
  encoding: BufferEncoding;
  onFile?: (file: IndexedFile, progress: ScanProgress) => MaybePromise<void>;
  onBatch?: (
    batch: ReadonlyArray<IndexedFile>,
    progress: ScanProgress,
  ) => MaybePromise<void>;
  onProgress?: (progress: ScanProgress) => void;
  total: number;
  signal?: Readonly<AbortSignal>;
}>;

type BuildDependenciesArgs = ReadonlyDeep<{
  shouldCollect: boolean;
  normalizedBatchSize: number;
  shouldRead: (filePath: string) => Promise<boolean>;
  encoding: BufferEncoding;
  onFile?: ProcessDependencies["onFile"];
  onBatch?: ProcessDependencies["onBatch"];
  onProgress?: ProcessDependencies["onProgress"];
  total: number;
  signal?: Readonly<AbortSignal>;
}>;

type BuildResultArgs = ReadonlyDeep<{
  total: number;
  processed: number;
  durationMs: number;
  collected: ReadonlyArray<IndexedFile>;
  shouldCollect: boolean;
}>;

type FlushArgs = ReadonlyDeep<{
  batch: ReadonlyArray<IndexedFile>;
  onBatch?: ProcessDependencies["onBatch"];
  progress: ScanProgress;
}>;

const EMPTY_INDEXED_FILES: ReadonlyArray<IndexedFile> = Object.freeze(
  [],
) as ReadonlyArray<IndexedFile>;

const INITIAL_STATE: ProcessState = {
  processed: 0,
  collected: EMPTY_INDEXED_FILES,
  batch: EMPTY_INDEXED_FILES,
};

const appendIndexedFile = (
  collection: ReadonlyArray<IndexedFile>,
  entry: IndexedFile,
): ReadonlyArray<IndexedFile> => [...collection, entry];

export async function computeTargetFiles(
  root: string,
  exts: Iterable<string> | undefined,
  ignoreDirs: Iterable<string> | undefined,
): Promise<ReadonlyArray<string>> {
  const extSet = new Set(normalizeExtensions(exts));
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
  files: ReadonlyArray<string>,
  dependencies: ProcessDependencies,
): Promise<ProcessState> {
  return files.reduce(
    (promise, filePath) =>
      promise.then((state) => processSingleFile(dependencies, state, filePath)),
    Promise.resolve<ProcessState>(INITIAL_STATE),
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

export function ensureNotAborted(signal?: Readonly<AbortSignal>): void {
  ensureSignalNotAborted(signal);
}

function ensureSignalNotAborted(signal?: Readonly<AbortSignal>): void {
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
    ? appendIndexedFile(state.collected, fileEntry)
    : state.collected;

  if (dependencies.onFile) {
    await dependencies.onFile(fileEntry, progress);
  }
  if (dependencies.onProgress) {
    dependencies.onProgress(progress);
  }

  if (!dependencies.onBatch) {
    return {
      processed: processedCount,
      collected,
      batch: EMPTY_INDEXED_FILES,
    };
  }

  const updatedBatch = appendIndexedFile(state.batch, fileEntry);
  if (updatedBatch.length >= dependencies.normalizedBatchSize) {
    await dependencies.onBatch(updatedBatch, progress);
    return {
      processed: processedCount,
      collected,
      batch: EMPTY_INDEXED_FILES,
    };
  }

  return {
    processed: processedCount,
    collected,
    batch: updatedBatch,
  };
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
