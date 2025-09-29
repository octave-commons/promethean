export type CrawlConfig = {
  readonly seeds: readonly string[];
  readonly outputDir: string;
  readonly maxDepth?: number;
  readonly maxPages?: number;
  readonly includeExternal?: boolean;
  readonly userAgent?: string;
  readonly requestDelayMs?: number;
  readonly fetch?: typeof fetch;
  readonly shouldContinue?: () => boolean;
};
