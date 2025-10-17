import type { ReadonlyDeep } from "type-fest";

export type MaybePromise<T> = T | Promise<T>;

export type IndexedFile = ReadonlyDeep<{
  path: string;
  content?: string;
}>;

export type ScanProgress = ReadonlyDeep<{
  processed: number;
  total: number;
  percentage: number;
}>;

type BatchHandler = (
  batch: ReadonlyArray<IndexedFile>,
  progress: ScanProgress,
 => MaybePromise<void>;

export type ScanFilesOptions = Readonly<{
  root: string;
  exts?: Iterable<string>;
  ignoreDirs?: Iterable<string>;
  readContent?: boolean | ((filePath: string => MaybePromise<boolean>;
  encoding?: BufferEncoding;
  batchSize?: number;
  collect?: boolean;
  onFile?: (file: IndexedFile, progress: ScanProgress => MaybePromise<void>;
  onBatch?: BatchHandler;
  onProgress?: (progress: ScanProgress => void;
  signal?: Readonly<AbortSignal>;
}>;

export type ScanFilesResult = Readonly<{
  total: number;
  processed: number;
  durationMs: number;
  files?: ReadonlyArray<IndexedFile>;
}>;
