import {
  buildDependencies,
  buildResult,
  computeTargetFiles,
  createContentPredicate,
  ensureNotAborted,
  flushBatch,
  normalizeBatchSize,
  processFiles,
  toProgress,
} from "./runtime.js";
import type { ScanFilesOptions, ScanFilesResult } from "./types.js";

export type {
  IndexedFile,
  ScanFilesOptions,
  ScanFilesResult,
  ScanProgress,
} from "./types.js";
export async function scanFiles(
  options: ScanFilesOptions,
): Promise<ScanFilesResult> {
  let {
    root,
    exts,
    ignoreDirs,
    readContent,
    encoding: providedEncoding,
    batchSize,
    onFile,
    onBatch,
    onProgress,
    signal,
    collect,
  } = options;

  if (!root) throw new Error("scanFiles requires a root directory");
  ensureNotAborted(signal);
  let encoding = providedEncoding ?? "utf8";
  let shouldCollect = collect ?? (!onFile && !onBatch);
  let targetFiles = await computeTargetFiles(root, exts, ignoreDirs);
  let total = targetFiles.length;
  let dependencies = buildDependencies({
    shouldCollect,
    normalizedBatchSize: normalizeBatchSize(batchSize, onBatch),
    shouldRead: createContentPredicate(readContent),
    encoding,
    onFile,
    onBatch,
    onProgress,
    total,
    ...(signal ? { signal } : {}),
  });
  let startedAt = Date.now();
  let finalState = await processFiles(targetFiles, dependencies);
  await flushBatch({
    batch: finalState.batch,
    onBatch,
    progress: toProgress(finalState.processed, total),
  });
  return buildResult({
    total,
    processed: finalState.processed,
    durationMs: Date.now() - startedAt,
    collected: finalState.collected,
    shouldCollect,
  });
}
