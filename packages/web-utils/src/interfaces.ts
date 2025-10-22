/**
 * Common interfaces for web utilities
 */

export interface ApiResponse<T = unknown> {
  readonly data?: T;
  readonly error?: string;
  readonly status: number;
  readonly statusText: string;
  readonly headers: Record<string, string>;
}

export interface FetchOptions {
  readonly method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  readonly headers?: Record<string, string>;
  readonly body?: string | FormData | URLSearchParams;
  readonly timeout?: number;
  readonly signal?: AbortSignal;
  readonly credentials?: 'include' | 'same-origin' | 'omit';
  readonly mode?: 'cors' | 'no-cors' | 'same-origin';
  readonly cache?: 'default' | 'no-cache' | 'reload' | 'force-cache' | 'only-if-cached';
  readonly redirect?: 'follow' | 'error' | 'manual';
  readonly referrer?: string;
  readonly referrerPolicy?: ReferrerPolicy;
}

export interface ParsedUrl {
  readonly protocol: string;
  readonly hostname: string;
  readonly port?: string;
  readonly pathname: string;
  readonly search: string;
  readonly hash: string;
  readonly origin: string;
}

export interface LinkExtractor {
  readonly url: string;
  readonly text?: string;
  readonly title?: string;
  readonly rel?: string[];
  readonly target?: string;
}

export interface CrawlMetrics {
  readonly totalPages: number;
  readonly totalLinks: number;
  readonly uniqueDomains: number;
  readonly averageLinksPerPage: number;
  readonly crawlDuration: number;
  readonly errors: readonly string[];
}
