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

// export type {
  IndexedFile,
  ScanFilesOptions,
  ScanFilesResult,
  ScanProgress,
} from "./types.js";
// export async function scanFiles(
  options: ScanFilesOptions,
): Promise<ScanFilesResult> {
  const {
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
  const encoding = providedEncoding ?? "utf8";
  const shouldCollect = collect ?? (!onFile && !onBatch);
  const targetFiles = await computeTargetFiles(root, exts, ignoreDirs);
  const total = targetFiles.length;
  const dependencies = buildDependencies({
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
  const startedAt = Date.now();
  const finalState = await processFiles(targetFiles, dependencies);
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
