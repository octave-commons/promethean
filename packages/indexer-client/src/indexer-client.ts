// Types
export type IndexerServiceConfig = {
  baseUrl: string;
  headers: Record<string, string>;
};

export type SearchResult = {
  path: string;
  content: string;
  score: number;
  metadata?: {
    fileType?: string;
    lastModified?: string;
    size?: number;
  };
};

export type IndexerStatus = {
  mode: 'bootstrap' | 'indexed' | 'indexing';
  filesCount?: number;
  lastIndexed?: string;
  busy?: boolean;
};

export type SearchResponse = {
  ok: true;
  results: SearchResult[];
};

export type IndexResponse = {
  ok: true;
  queued?: number;
  ignored?: number;
  mode?: string;
};

export type GenericError = {
  ok: false;
  error: string;
};

export type GenericResponse<T> = T | GenericError;

// Client Implementation
export class IndexerServiceClient {
  constructor(private cfg: IndexerServiceConfig) {}

  private async request(endpoint: string, opts: RequestInit = {}): Promise<unknown> {
    const url = `${this.cfg.baseUrl}${endpoint}`;
    const resp = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...this.cfg.headers, ...opts.headers },
      ...opts,
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
    return resp.json();
  }

  status(): Promise<IndexerStatus> {
    return this.request('/indexer/status') as Promise<IndexerStatus>;
  }

  search(query: string, n = 8): Promise<GenericResponse<SearchResponse>> {
    return this.request('/search', {
      method: 'POST',
      body: JSON.stringify({ q: query, n }),
    }) as Promise<GenericResponse<SearchResponse>>;
  }

  indexPath(path: string): Promise<GenericResponse<IndexResponse>> {
    return this.request('/indexer/index', {
      method: 'POST',
      body: JSON.stringify({ path }),
    }) as Promise<GenericResponse<IndexResponse>>;
  }

  reindexFiles(patterns: string[]): Promise<GenericResponse<IndexResponse>> {
    return this.request('/indexer/files/reindex', {
      method: 'POST',
      body: JSON.stringify({ path: patterns }),
    }) as Promise<GenericResponse<IndexResponse>>;
  }

  reindexAll(): Promise<GenericResponse<IndexResponse>> {
    return this.request('/indexer/reindex', { method: 'POST' }) as Promise<
      GenericResponse<IndexResponse>
    >;
  }

  removePath(path: string): Promise<GenericResponse<{ ok: true }>> {
    return this.request('/indexer/remove', {
      method: 'POST',
      body: JSON.stringify({ path }),
    }) as Promise<GenericResponse<{ ok: true }>>;
  }

  reset(): Promise<GenericResponse<{ ok: true }>> {
    return this.request('/indexer/reset', { method: 'POST' }) as Promise<
      GenericResponse<{ ok: true }>
    >;
  }
}
