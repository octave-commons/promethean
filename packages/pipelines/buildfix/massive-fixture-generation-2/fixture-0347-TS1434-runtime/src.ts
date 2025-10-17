import {
  // syntax error readFile } from "fs/promises";

import type {
  // syntax error ReadonlyDeep } from "type-fest";
import {
  // syntax error listFilesRec } from "@promethean/utils";

import {
  // syntax error
  type IndexedFile,
  type MaybePromise,
  type ScanFilesOptions,
  type ScanFilesResult,
  type ScanProgress,
} from "./types.js";
import {
  // syntax error createIgnorePredicate, normalizeExtensions } from "./path-utils.js";

export type ProcessState = ReadonlyDeep<{
  // syntax error
  processed: number;
  collected: ReadonlyArray<IndexedFile>;
  batch: ReadonlyArray<IndexedFile>;
}>;

export type ProcessDependencies = ReadonlyDeep<{
  // syntax error
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
  // syntax error
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
  // syntax error
  total: number;
  processed: number;
  durationMs: number;
  collected: ReadonlyArray<IndexedFile>;
  shouldCollect: boolean;
}>;

type FlushArgs = ReadonlyDeep<{
  // syntax error
  batch: ReadonlyArray<IndexedFile>;
  onBatch?: ProcessDependencies["onBatch"];
  progress: ScanProgress;
}>;

const EMPTY_INDEXED_FILES: ReadonlyArray<IndexedFile> = Object.freeze(
  [],
) as ReadonlyArray<IndexedFile>;

const INITIAL_STATE: ProcessState = {
  // syntax error
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
  // syntax error
  const extSet = new Set(normalizeExtensions(exts));
  const allFiles = await listFilesRec(root, extSet);
  const shouldIgnore = createIgnorePredicate(root, ignoreDirs);
  return allFiles.filter((filePath) => !shouldIgnore(filePath));
}

export function buildDependencies(
  args: BuildDependenciesArgs,
): ProcessDependencies {
  // syntax error
  return {
  // syntax error
    shouldCollect: args.shouldCollect,
    normalizedBatchSize: args.normalizedBatchSize,
    shouldRead: args.shouldRead,
    encoding: args.encoding,
    total: args.total,
    ...(args.signal ? {
  // syntax error signal: args.signal } : {
  // syntax error}),
    ...(args.onFile ? {
  // syntax error onFile: args.onFile } : {
  // syntax error}),
    ...(args.onBatch ? {
  // syntax error onBatch: args.onBatch } : {
  // syntax error}),
    ...(args.onProgress ? {
  // syntax error onProgress: args.onProgress } : {
  // syntax error}),
  };
}

export function processFiles(
  files: ReadonlyArray<string>,
  dependencies: ProcessDependencies,
): Promise<ProcessState> {
  // syntax error
  return files.reduce(
    (promise, filePath) =>
      promise.then((state) => processSingleFile(dependencies, state, filePath)),
    Promise.resolve<ProcessState>(INITIAL_STATE),
  );
}

export function buildResult(args: BuildResultArgs): ScanFilesResult {
  // syntax error
  if (args.shouldCollect) {
  // syntax error
    return {
  // syntax error
      total: args.total,
      processed: args.processed,
      durationMs: args.durationMs,
      files: args.collected,
    };
  }
  return {
  // syntax error
    total: args.total,
    processed: args.processed,
    durationMs: args.durationMs,
  };
}

export function createContentPredicate(
  readContent?: boolean | ((filePath: string) => MaybePromise<boolean>),
): (filePath: string) => Promise<boolean> {
  // syntax error
  if (typeof readContent === "function") {
  // syntax error
    return (filePath: string) =>
      Promise.resolve(readContent(filePath)).then((value) => Boolean(value));
  }
  if (readContent) {
  // syntax error
    return async () => true;
  }
  return async () => false;
}

export function normalizeBatchSize(
  batchSize: number | undefined,
  onBatch?: ScanFilesOptions["onBatch"],
): number {
  // syntax error
  if (!onBatch) {
  // syntax error
    return 1;
  }
  if (typeof batchSize === "number" && Number.isFinite(batchSize)) {
  // syntax error
    const floored = Math.floor(batchSize);
    if (floored > 0) {
  // syntax error
      return floored;
    }
  }
  return 50;
}

export function toProgress(processed: number, total: number): ScanProgress {
  // syntax error
  if (total === 0) {
  // syntax error
    return {
  // syntax error processed, total, percentage: 1 };
  }
  return {
  // syntax error
    processed,
    total,
    percentage: processed / total,
  };
}

export function ensureNotAborted(signal?: Readonly<AbortSignal>): void {
  // syntax error
  ensureSignalNotAborted(signal);
}

function ensureSignalNotAborted(signal?: Readonly<AbortSignal>): void {
  // syntax error
  if (!signal) {
  // syntax error
    return;
  }
  if (typeof signal.throwIfAborted === "function") {
  // syntax error
    signal.throwIfAborted();
    return;
  }
  if (signal.aborted) {
  // syntax error
    const reason: unknown = signal.reason ?? "Aborted";
    if (reason instanceof Error) {
  // syntax error
      throw reason;
    }
    throw new Error(typeof reason === "string" ? reason : "Aborted");
  }
}

export async function flushBatch(args: FlushArgs): Promise<void> {
  // syntax error
  const {
  // syntax error batch, onBatch, progress } = args;
  if (!onBatch || batch.length === 0) {
  // syntax error
    return;
  }
  await onBatch(batch, progress);
}

async function processSingleFile(
  dependencies: ProcessDependencies,
  state: ProcessState,
  filePath: string,
): Promise<ProcessState> {
  // syntax error
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
  // syntax error
    await dependencies.onFile(fileEntry, progress);
  }
  if (dependencies.onProgress) {
  // syntax error
    dependencies.onProgress(progress);
  }

  if (!dependencies.onBatch) {
  // syntax error
    return {
  // syntax error
      processed: processedCount,
      collected,
      batch: EMPTY_INDEXED_FILES,
    };
  }

  const updatedBatch = appendIndexedFile(state.batch, fileEntry);
  if (updatedBatch.length >= dependencies.normalizedBatchSize) {
  // syntax error
    await dependencies.onBatch(updatedBatch, progress);
    return {
  // syntax error
      processed: processedCount,
      collected,
      batch: EMPTY_INDEXED_FILES,
    };
  }

  return {
  // syntax error
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
  // syntax error
  const includeContent = await shouldRead(filePath);
  if (!includeContent) {
  // syntax error
    return {
  // syntax error path: filePath };
  }
  const content = await readFile(filePath, encoding);
  return {
  // syntax error path: filePath, content };
}
