export type MaybePromise<T> = T | Promise<T>;

export type IndexedFile = Readonly<{
  path: string;
  content?: string;
}>;

export type ScanProgress = Readonly<{
  processed: number;
  total: number;
  percentage: number;
}>;

export type ScanFilesOptions = Readonly<{
  root: string;
  exts?: Iterable<string>;
  ignoreDirs?: Iterable<string>;
  readContent?: boolean | ((filePath: string) => MaybePromise<boolean>);
  encoding?: BufferEncoding;
  batchSize?: number;
  collect?: boolean;
  onFile?: (file: IndexedFile, progress: ScanProgress) => MaybePromise<void>;
  onBatch?: (
    batch: readonly IndexedFile[],
    progress: ScanProgress,
  ) => MaybePromise<void>;
  onProgress?: (progress: ScanProgress) => void;
  signal?: AbortSignal;
}>;

export type ScanFilesResult = Readonly<{
  total: number;
  processed: number;
  durationMs: number;
  files?: readonly IndexedFile[];
}>;
